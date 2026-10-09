import React, { useEffect, useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Eraser, FlaskConical, Highlighter, Library, Regex,
  ShieldCheck, Timer, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface RegexTesterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const MAX_PATTERN = 1000;
const MAX_TEXT = 20000;
const MAX_MATCHES = 1000;

const FLAG_ORDER = ["g", "i", "m", "s", "u", "y"] as const;
type FlagName = (typeof FLAG_ORDER)[number];

interface LibraryItem {
  labelKey: string;
  pattern: string;
  flags: string;
  sample: string;
}

const LIBRARY: LibraryItem[] = [
  {
    labelKey: "libEmail",
    pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
    flags: "gi",
    sample: "Reach us at support@example.com or sales.team@my-shop.org.\nNot an email: plain text, @handle, or missing@dot",
  },
  {
    labelKey: "libUrl",
    pattern: "https?://[\\w.-]+(?:\\.[a-z]{2,})(?:/\\S*)?",
    flags: "gi",
    sample: "Docs live at https://example.com/guide and http://test-site.org/a/b?x=1 — but www.no-scheme.com is not matched.",
  },
  {
    labelKey: "libDate",
    pattern: "\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b",
    flags: "g",
    sample: "Release on 2026-10-09, review 2026-13-40 (not real), party 1999-12-31.",
  },
  {
    labelKey: "libIpv4",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: "g",
    sample: "Servers: 192.168.0.1 and 10.0.0.255 answered; 999.1.1.1 also lights up — check ranges separately.",
  },
  {
    labelKey: "libHex",
    pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    flags: "gi",
    sample: "Brand colours: #fff, #FF5733, #0a8f6c. Not colours: #12, #GGGGGG, fff.",
  },
  {
    labelKey: "libTime",
    pattern: "\\b(?:[01]\\d|2[0-3]):[0-5]\\d\\b",
    flags: "g",
    sample: "Standup 09:30, lunch 13:15, deploy window 23:59. Invalid: 24:00 and 9:99.",
  },
  {
    labelKey: "libUsername",
    pattern: "^[a-z][a-z0-9_]{2,15}$",
    flags: "gm",
    sample: "good_name1\nBad Name\nab\nthis_one_is_way_too_long\nok_2026",
  },
  {
    labelKey: "libSlug",
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    flags: "gm",
    sample: "my-first-post\nHello World\ntwo--dashes\nclean-slug-2026\n-StartsBad",
  },
];

interface OneMatch {
  index: number;
  end: number;
  text: string;
  groups: (string | undefined)[];
  named: Record<string, string | undefined> | null;
}

interface ComputeResult {
  error: string;
  errorHintKey: string;
  matches: OneMatch[];
  capped: boolean;
  tookMs: number;
  replaced: string;
}

function hintKeyFor(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("nothing to repeat")) return "errorHintNothing";
  if (m.includes("unterminated character")) return "errorHintClass";
  if (m.includes("unterminated group") || m.includes("unterminated parenthetical")) return "errorHintGroup";
  if (m.includes("invalid group") || m.includes("invalid capture")) return "errorHintGroupName";
  if (m.includes("range out of order")) return "errorHintRange";
  return "errorHintGeneric";
}

function compute(pattern: string, flags: string, text: string, replacement: string): ComputeResult {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now();
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, errorHintKey: hintKeyFor(msg), matches: [], capped: false, tookMs: 0, replaced: "" };
  }
  const matches: OneMatch[] = [];
  let capped = false;
  try {
    if (flags.includes("g") || flags.includes("y")) {
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        matches.push({ index: m.index, end: m.index + m[0].length, text: m[0], groups: m.slice(1), named: m.groups ?? null });
        if (matches.length >= MAX_MATCHES) { capped = true; break; }
        if (m[0].length === 0) {
          re.lastIndex += 1;
          if (re.lastIndex > text.length) break;
        }
        if (!flags.includes("g") && flags.includes("y")) break;
      }
    } else {
      const m = re.exec(text);
      if (m) {
        matches.push({ index: m.index, end: m.index + m[0].length, text: m[0], groups: m.slice(1), named: m.groups ?? null });
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg, errorHintKey: "errorHintGeneric", matches: [], capped: false, tookMs: 0, replaced: "" };
  }
  let replaced = "";
  try {
    replaced = text.replace(new RegExp(pattern, flags), replacement);
  } catch {
    replaced = "";
  }
  const tookMs = (typeof performance !== "undefined" ? performance.now() : Date.now()) - started;
  return { error: "", errorHintKey: "", matches, capped, tookMs, replaced };
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }
}

const DEFAULT_TEXT = "Reach us at support@example.com or sales.team@my-shop.org.\nRelease on 2026-10-09; the old note said 09/10/2026.\nNot an email: plain text, @handle, or missing@dot";

export function RegexTesterWorkspace({ selectedLanguage = "en" }: RegexTesterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const rt = (t as any).regexTester || {};

  const [pattern, setPattern] = useState("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
  const [flagsOn, setFlagsOn] = useState<Record<FlagName, boolean>>({ g: true, i: true, m: false, s: false, u: false, y: false });
  const [text, setText] = useState(DEFAULT_TEXT);
  const [replacement, setReplacement] = useState("[email]");
  const [debounced, setDebounced] = useState({ pattern, flags: "gi", text, replacement });
  const [copiedReplace, setCopiedReplace] = useState(false);
  const [truncatedNote, setTruncatedNote] = useState(false);

  const flagsString = FLAG_ORDER.filter((f) => flagsOn[f]).join("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced({ pattern, flags: flagsString, text, replacement });
    }, 150);
    return () => window.clearTimeout(id);
  }, [pattern, flagsString, text, replacement]);

  const result = useMemo<ComputeResult>(() => {
    if (!debounced.pattern) {
      return { error: "", errorHintKey: "", matches: [], capped: false, tookMs: 0, replaced: "" };
    }
    return compute(debounced.pattern, debounced.flags, debounced.text, debounced.replacement);
  }, [debounced]);

  const toggleFlag = (f: FlagName) => setFlagsOn((prev) => ({ ...prev, [f]: !prev[f] }));

  const handlePattern = (value: string) => {
    if (value.length > MAX_PATTERN) {
      setPattern(value.slice(0, MAX_PATTERN));
      setTruncatedNote(true);
    } else {
      setPattern(value);
      setTruncatedNote(false);
    }
  };

  const handleText = (value: string) => {
    if (value.length > MAX_TEXT) {
      setText(value.slice(0, MAX_TEXT));
      setTruncatedNote(true);
    } else {
      setText(value);
      setTruncatedNote(false);
    }
  };

  const loadLibrary = (item: LibraryItem) => {
    setPattern(item.pattern);
    setFlagsOn({ g: false, i: false, m: false, s: false, u: false, y: false });
    const on: Record<FlagName, boolean> = { g: false, i: false, m: false, s: false, u: false, y: false };
    for (const ch of item.flags) {
      if ((FLAG_ORDER as readonly string[]).includes(ch)) on[ch as FlagName] = true;
    }
    setFlagsOn(on);
    setText(item.sample);
    setTruncatedNote(false);
  };

  const loadSample = () => {
    setPattern("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}");
    setFlagsOn({ g: true, i: true, m: false, s: false, u: false, y: false });
    setText(DEFAULT_TEXT);
    setReplacement("[email]");
  };

  const clearAll = () => {
    setPattern("");
    setText("");
    setReplacement("");
    setTruncatedNote(false);
  };

  const copyReplace = async () => {
    if (!result.replaced) return;
    await copyText(result.replaced);
    setCopiedReplace(true);
    window.setTimeout(() => setCopiedReplace(false), 1600);
  };

  const flagLabel = (f: FlagName): string => {
    const key = `flag${f.toUpperCase()}` as const;
    return (rt as any)[key] || f;
  };

  // Build highlighted segments from matches over the current text.
  const segments: { text: string; match: boolean; key: number }[] = [];
  if (!result.error && result.matches.length > 0) {
    let cursor = 0;
    let k = 0;
    for (const m of result.matches) {
      if (m.index > cursor) segments.push({ text: text.slice(cursor, m.index), match: false, key: k++ });
      if (m.end > m.index) {
        segments.push({ text: text.slice(m.index, m.end), match: true, key: k++ });
        cursor = m.end;
      }
    }
    if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false, key: k++ });
  }

  const fmt = (tpl: string, n: number) => tpl.replace("{n}", String(n));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="regexTester" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-violet-100 via-purple-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-violet-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.14),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-300 flex items-center gap-1.5">
              <Regex className="w-3.5 h-3.5" />
              {rt.badge || "Regex Tester"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload • JavaScript RegExp
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {rt.pageTitle || "Test a Regex Live — Matches, Groups & Replace Preview"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {rt.subtitle || "Type a pattern, flip the flags, and watch every match light up in your test text — with group details and a replace preview. Everything runs in this tab with JavaScript's own RegExp engine; nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{rt.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {rt.quickAnswer || "It tests a regular expression against your text using JavaScript's RegExp engine, right here in the browser. You write the pattern, toggle the g/i/m/s/u/y flags, and instantly see highlighted matches, a list with each match's position and captured groups, and a preview of find-and-replace. A small library of common patterns (email, URL, dates and more) gives you starting points — examples to learn from, never guarantees."}
        </p>
      </div>

      {/* Pattern + flags */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div>
          <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="regex-pattern">
            {rt.patternLabel || "Regular expression"}
          </label>
          <div className="flex items-stretch gap-2">
            <span className="hidden sm:flex items-center px-3 rounded-xl bg-stone-100 border border-stone-300 font-mono text-stone-500 select-none">/</span>
            <input
              id="regex-pattern"
              type="text"
              value={pattern}
              onChange={(e) => handlePattern(e.target.value)}
              placeholder={rt.patternPlaceholder || "e.g. \\d{4}-\\d{2}-\\d{2}  or  (\\w+)@(\\w+)"}
              spellCheck={false}
              className="flex-1 min-w-0 rounded-xl border border-stone-300 px-4 py-2.5 text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
            />
            <span className="hidden sm:flex items-center px-3 rounded-xl bg-stone-100 border border-stone-300 font-mono text-stone-500 select-none">/{flagsString}</span>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-mono">{fmt(rt.patternLimit || "{n} / 1,000 characters", pattern.length)}</p>
        </div>

        <div>
          <p className="text-sm font-extrabold text-stone-900 mb-2">{rt.flagsLabel || "Flags"}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {FLAG_ORDER.map((f) => (
              <button
                key={f}
                onClick={() => toggleFlag(f)}
                aria-pressed={flagsOn[f]}
                className={`text-left px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  flagsOn[f]
                    ? "bg-violet-600 text-white border-violet-600 shadow"
                    : "bg-stone-50 text-stone-600 border-stone-200 hover:border-violet-300"
                }`}
              >
                <span className="font-mono font-extrabold">{f}</span>
                <span className="block font-normal mt-0.5 leading-snug">{flagLabel(f).replace(/^[a-z] — /, "")}</span>
              </button>
            ))}
          </div>
        </div>

        {result.error && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-red-900">{rt.errorTitle || "That pattern does not compile"}</p>
              <p className="text-xs sm:text-sm text-red-900/85 font-mono leading-relaxed">{result.error}</p>
              <p className="text-xs sm:text-sm text-red-900/75 leading-relaxed">{(rt as any)[result.errorHintKey] || rt.errorHintGeneric || ""}</p>
            </div>
          </div>
        )}
        {!pattern && (
          <p className="text-xs text-stone-500">{rt.emptyPatternHint || "Type a pattern above, or pick one from the library below. Matches appear as you type."}</p>
        )}
      </div>

      {/* Test text */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-sm font-extrabold text-stone-900" htmlFor="regex-text">
            {rt.testTextLabel || "Test text"}
          </label>
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" /> {rt.sampleBtn || "Try sample"}
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eraser className="w-3.5 h-3.5" /> {rt.clearBtn || "Clear"}
            </button>
          </div>
        </div>
        <textarea
          id="regex-text"
          value={text}
          onChange={(e) => handleText(e.target.value)}
          placeholder={rt.testTextPlaceholder || "Paste or type the text you want to test against…"}
          spellCheck={false}
          rows={7}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
        />
        <p className="text-xs text-stone-500 font-mono">{fmt(rt.textLimit || "{n} / 20,000 characters", text.length)}</p>
        {truncatedNote && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {rt.truncatedNotice || "Input was trimmed at the size cap shown above, so the page stays responsive."}
          </p>
        )}
        <p className="text-xs text-stone-500 leading-relaxed">{rt.limitsNote || "Size caps keep this tab responsive: patterns up to 1,000 characters, test text up to 20,000 characters, and matching stops after 1,000 matches. A badly nested pattern (like (a+)+) can still make any regex engine grind on the wrong text — try risky patterns on a few lines first, not a whole file."}</p>
      </div>

      {/* Highlight preview */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
          <Highlighter className="w-4 h-4 text-violet-600" /> {rt.highlightTitle || "Highlighted matches"}
        </h2>
        {result.error || segments.length === 0 ? (
          <p className="text-sm text-stone-500">{rt.highlightEmpty || "When your pattern matches, the matched parts light up here, exactly as they sit in your text."}</p>
        ) : (
          <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 font-mono text-sm whitespace-pre-wrap break-words leading-relaxed">
            {segments.map((seg) =>
              seg.match ? (
                <mark key={seg.key} className="bg-violet-300/70 text-violet-950 rounded px-0.5">{seg.text}</mark>
              ) : (
                <span key={seg.key}>{seg.text}</span>
              )
            )}
          </div>
        )}
        {result.tookMs > 250 && !result.error && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex gap-3">
            <Timer className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-extrabold text-amber-950">{rt.slowTitle || "That match took a while"}</h3>
              <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
                {rt.slowText || "Slow matches usually mean nested quantifiers (one + or * inside another over the same characters). Simplify the pattern or test it on a shorter sample — a pathological pattern can freeze any regex tester, including this one, because the engine must try huge numbers of combinations before it gives up."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Match list */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{rt.matchesTitle || "Matches"}</h2>
        {result.error || result.matches.length === 0 ? (
          <p className="text-sm text-stone-500">{rt.matchesEmpty || "No matches yet. Each match will be listed with its position and captured groups."}</p>
        ) : (
          <>
            <p className="text-xs font-bold text-violet-800">{fmt(rt.matchesCount || "{n} matches", result.matches.length)}{result.capped ? ` — ${rt.matchCapNotice || "stopped at the 1,000-match cap"}` : ""}</p>
            <ul className="divide-y divide-stone-100">
              {result.matches.slice(0, 100).map((m, i) => {
                const groupParts: string[] = m.groups.map((g, gi) => `#${gi + 1}: ${g === undefined ? "—" : g}`);
                if (m.named) {
                  for (const [name, val] of Object.entries(m.named)) groupParts.push(`${name}: ${val === undefined ? "—" : val}`);
                }
                return (
                  <li key={i} className="py-2 space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-stone-400 w-7 shrink-0 text-right">{i + 1}</span>
                      <span className="text-[11px] font-mono text-stone-500">{rt.colIndex || "Index"} {m.index}–{m.end}</span>
                      <code className="font-mono text-[13px] sm:text-sm font-semibold text-stone-900 break-all">{m.text === "" ? "∅" : m.text}</code>
                    </div>
                    <p className="text-[11px] font-mono text-stone-500 pl-9 break-all">
                      {rt.colGroups || "Groups"}: {groupParts.length > 0 ? groupParts.join(" · ") : (rt.noGroups || "none")}
                    </p>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* Replace preview */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{rt.replaceTitle || "Replace preview"}</h2>
        <div>
          <label className="block text-xs font-bold text-stone-600 mb-1.5" htmlFor="regex-replacement">
            {rt.replaceLabel || "Replacement"}
          </label>
          <input
            id="regex-replacement"
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder={rt.replacePlaceholder || "e.g. [$1] or <$&>"}
            spellCheck={false}
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
          />
          <p className="text-xs text-stone-500 mt-1">{rt.replaceNote || "Use $1, $2 for numbered groups, $<name> for named groups, $& for the whole match and $$ for a literal dollar sign — the standard JavaScript rules."}</p>
        </div>
        {result.error || !pattern ? (
          <p className="text-sm text-stone-500">{rt.replaceEmpty || "The replaced text will be previewed here. Without the g flag, only the first match is replaced — that is normal JavaScript behaviour."}</p>
        ) : (
          <>
            <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 font-mono text-sm whitespace-pre-wrap break-words leading-relaxed max-h-64 overflow-auto">
              {result.replaced}
            </div>
            <button
              onClick={copyReplace}
              className="px-4 py-2 rounded-xl border-2 border-violet-300 bg-violet-50 hover:bg-violet-100 text-violet-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              {copiedReplace ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedReplace ? (rt.copiedBtn || "Copied") : (rt.copyBtn || "Copy result")}
            </button>
          </>
        )}
      </div>

      {/* Pattern library */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
          <Library className="w-4 h-4 text-violet-600" /> {rt.libraryTitle || "Common patterns — starting points"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {rt.libraryNote || "Tap one to load it with a small sample text. These are teaching examples, not validators: a pattern that lights up here can still accept nonsense (like 999.1.1.1) or reject real-world edge cases. Always test with the awkward cases too."}
        </p>
        <div className="flex flex-wrap gap-2">
          {LIBRARY.map((item) => (
            <button
              key={item.labelKey}
              onClick={() => loadLibrary(item)}
              className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-900 text-xs font-bold transition-all cursor-pointer"
            >
              {(rt as any)[item.labelKey] || item.labelKey}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 flex gap-3">
        <Regex className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-stone-900">{rt.flavourTitle || "Which regex flavour is this?"}</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
            {rt.flavourText || "JavaScript (ECMAScript) — the engine inside this browser. Regex dialects disagree more than people expect: lookbehind, named-group syntax, Unicode properties and even what \\d matches can differ in Python, PHP, Java or PCRE. A pattern that passes here is a strong draft for those engines, never a guarantee; run one final check in the engine your code actually uses."}
          </p>
        </div>
      </div>

      <p className="text-xs text-stone-500 flex items-center gap-1.5 px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {rt.localNote || "Your pattern and text are processed only in this browser tab — never uploaded, stored or shared by this tool."}
      </p>

      <ToolGuideSection toolId="regexTester" selectedLanguage={selectedLanguage} />
    </div>
  );
}
