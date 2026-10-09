import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Eraser, EyeOff, Ghost, Info, ScanSearch,
  ShieldCheck, Sparkles,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface InvisibleCharacterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type CharacterKind = "zeroWidth" | "blankWidth";

interface CharacterDefinition {
  id: string;
  char: string;
  code: string;
  name: string;
  kind: CharacterKind;
  noteKey: string;
}

const CHARACTER_DEFINITIONS: CharacterDefinition[] = [
  { id: "zwsp", char: "\u200B", code: "U+200B", name: "Zero Width Space", kind: "zeroWidth", noteKey: "zwsp" },
  { id: "zwnj", char: "\u200C", code: "U+200C", name: "Zero Width Non-Joiner", kind: "zeroWidth", noteKey: "zwnj" },
  { id: "zwj", char: "\u200D", code: "U+200D", name: "Zero Width Joiner", kind: "zeroWidth", noteKey: "zwj" },
  { id: "wordJoiner", char: "\u2060", code: "U+2060", name: "Word Joiner", kind: "zeroWidth", noteKey: "wordJoiner" },
  { id: "brailleBlank", char: "\u2800", code: "U+2800", name: "Braille Pattern Blank", kind: "blankWidth", noteKey: "braille" },
  { id: "hangulFiller", char: "\u3164", code: "U+3164", name: "Hangul Filler", kind: "blankWidth", noteKey: "hangul" },
  { id: "nbsp", char: "\u00A0", code: "U+00A0", name: "No-Break Space", kind: "blankWidth", noteKey: "nbsp" },
  { id: "figureSpace", char: "\u2007", code: "U+2007", name: "Figure Space", kind: "blankWidth", noteKey: "figure" },
  { id: "thinSpace", char: "\u2009", code: "U+2009", name: "Thin Space", kind: "blankWidth", noteKey: "thin" },
  { id: "hairSpace", char: "\u200A", code: "U+200A", name: "Hair Space", kind: "blankWidth", noteKey: "hair" },
  { id: "ideographicSpace", char: "\u3000", code: "U+3000", name: "Ideographic Space", kind: "blankWidth", noteKey: "ideographic" },
];

const ZERO_WIDTH = new Set(["\u200B", "\u200C", "\u200D", "\u2060", "\uFEFF"]);
const BLANK_WIDTH = new Set([
  "\u00A0", "\u1680", "\u2000", "\u2001", "\u2002", "\u2003", "\u2004", "\u2005",
  "\u2006", "\u2007", "\u2008", "\u2009", "\u200A", "\u202F", "\u205F", "\u3000",
  "\u2800", "\u3164",
]);

const CODE_NAMES: Record<string, string> = {
  "U+00A0": "No-Break Space",
  "U+00AD": "Soft Hyphen",
  "U+034F": "Combining Grapheme Joiner",
  "U+061C": "Arabic Letter Mark",
  "U+180E": "Mongolian Vowel Separator",
  "U+200B": "Zero Width Space",
  "U+200C": "Zero Width Non-Joiner",
  "U+200D": "Zero Width Joiner",
  "U+200E": "Left-to-Right Mark",
  "U+200F": "Right-to-Left Mark",
  "U+2028": "Line Separator",
  "U+2029": "Paragraph Separator",
  "U+2060": "Word Joiner",
  "U+2800": "Braille Pattern Blank",
  "U+3164": "Hangul Filler",
  "U+FEFF": "Zero Width No-Break Space / BOM",
};

function codeLabel(char: string): string {
  const codePoint = char.codePointAt(0) || 0;
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

function isDetectedHidden(char: string): boolean {
  if (ZERO_WIDTH.has(char) || BLANK_WIDTH.has(char)) return true;
  const cp = char.codePointAt(0) || 0;
  return (
    cp === 0x00ad ||
    cp === 0x034f ||
    cp === 0x061c ||
    cp === 0x180e ||
    cp === 0x200e ||
    cp === 0x200f ||
    cp === 0x2028 ||
    cp === 0x2029 ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    (cp >= 0xe0000 && cp <= 0xe007f) ||
    (cp < 0x20 && char !== "\n" && char !== "\r" && char !== "\t") ||
    cp === 0x7f
  );
}

function detectedName(char: string): string {
  const label = codeLabel(char);
  if (CODE_NAMES[label]) return CODE_NAMES[label];
  const cp = char.codePointAt(0) || 0;
  if (cp >= 0xfe00 && cp <= 0xfe0f) return "Variation Selector";
  if (cp >= 0xe0000 && cp <= 0xe007f) return "Unicode Tag";
  if (cp < 0x20 || cp === 0x7f) return "Control Character";
  return "Hidden / blank-width character";
}

async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

interface TesterToken {
  type: "text" | "hidden" | "newline";
  value: string;
  label?: string;
}

function buildTesterTokens(text: string): TesterToken[] {
  const tokens: TesterToken[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) tokens.push({ type: "text", value: buffer });
    buffer = "";
  };

  for (const char of Array.from(text.replace(/\r\n?/g, "\n"))) {
    if (char === "\n") {
      flush();
      tokens.push({ type: "newline", value: "↵" });
    } else if (isDetectedHidden(char)) {
      flush();
      tokens.push({ type: "hidden", value: char, label: codeLabel(char) });
    } else {
      buffer += char;
    }
  }
  flush();
  return tokens;
}

export function InvisibleCharacterWorkspace({ selectedLanguage = "en" }: InvisibleCharacterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ic = (t as any).invisibleChar || {};
  const notes = ic.charNotes || {};

  const [selectedId, setSelectedId] = useState("brailleBlank");
  const [repeatCount, setRepeatCount] = useState(10);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [generatedCopied, setGeneratedCopied] = useState(false);
  const [testerText, setTesterText] = useState("");
  const [cleanCopied, setCleanCopied] = useState(false);

  const selected = CHARACTER_DEFINITIONS.find((item) => item.id === selectedId) || CHARACTER_DEFINITIONS[4];
  const safeCount = Math.min(1000, Math.max(1, Number.isFinite(repeatCount) ? repeatCount : 1));
  const generatedText = useMemo(() => selected.char.repeat(safeCount), [selected, safeCount]);

  const analysis = useMemo(() => {
    const chars = Array.from(testerText);
    const detected = chars.filter(isDetectedHidden);
    const counts = new Map<string, { char: string; label: string; name: string; count: number }>();
    detected.forEach((char) => {
      const label = codeLabel(char);
      const existing = counts.get(label);
      if (existing) existing.count += 1;
      else counts.set(label, { char, label, name: detectedName(char), count: 1 });
    });
    return {
      total: chars.length,
      hidden: detected.length,
      visible: chars.length - detected.length,
      detected: [...counts.values()],
      tokens: buildTesterTokens(testerText),
      cleaned: chars.filter((char) => !isDetectedHidden(char)).join(""),
    };
  }, [testerText]);

  const copyCard = async (definition: CharacterDefinition) => {
    if (await copyTextToClipboard(definition.char)) {
      setCopiedCard(definition.id);
      setTimeout(() => setCopiedCard(null), 1800);
    }
  };

  const copyGenerated = async () => {
    if (await copyTextToClipboard(generatedText)) {
      setGeneratedCopied(true);
      setTimeout(() => setGeneratedCopied(false), 1800);
    }
  };

  const copyCleaned = async () => {
    if (!analysis.cleaned) return;
    if (await copyTextToClipboard(analysis.cleaned)) {
      setCleanCopied(true);
      setTimeout(() => setCleanCopied(false), 1800);
    }
  };

  const renderCards = (kind: CharacterKind, title: string) => (
    <section>
      <h2 className="text-sm font-extrabold text-stone-900 mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {CHARACTER_DEFINITIONS.filter((item) => item.kind === kind).map((item) => (
          <article key={item.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">{item.name}</h3>
                <p className="text-[11px] font-bold tracking-wide text-fuchsia-700">{item.code}</p>
              </div>
              <span aria-hidden="true" className="min-w-14 rounded-lg border border-dashed border-fuchsia-300 bg-white px-2 py-1 text-center font-mono text-sm text-stone-700">
                |{item.char}|
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 min-h-10">{notes[item.noteKey] || ""}</p>
            <button
              onClick={() => copyCard(item)}
              aria-label={`${ic.copyOne || "Copy"} ${item.code}`}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-fuchsia-700 text-white text-xs font-bold hover:bg-fuchsia-600 cursor-pointer"
            >
              {copiedCard === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCard === item.id ? (ic.copied || "Copied!") : `${ic.copyOne || "Copy one"} · ${item.code}`}
            </button>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="invisibleCharacter" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-50 rounded-full blur-3xl -z-0 opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-700 text-white self-start shadow-sm">
            <Ghost className="w-3.5 h-3.5" /> {ic.badge || "Invisible Character"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {ic.pageTitle || "Copy Invisible Characters & Make Blank Text"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ic.subtitle || "Copy a real invisible Unicode character, generate blank text in the count you choose, and reveal hidden characters hidden inside pasted text — all locally in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-fuchsia-50/80 border border-fuchsia-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-fuchsia-700 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-fuchsia-950">{ic.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {ic.quickAnswer || "It copies characters that genuinely render blank or zero-width, builds longer blank text, and labels hidden characters in a tester instead of asking you to trust an empty box."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-7">
        {renderCards("zeroWidth", ic.zeroWidthTitle || "Truly zero-width characters")}
        {renderCards("blankWidth", ic.blankWidthTitle || "Blank-width characters")}
      </div>

      <section className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <Ghost className="w-5 h-5 text-fuchsia-700" /> {ic.generatorTitle || "Blank text generator"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">{ic.generatorHint}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="ic-character" className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
                {ic.characterLabel || "Character"}
              </label>
              <select
                id="ic-character"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-800 focus:outline-none focus:border-fuchsia-500"
              >
                {CHARACTER_DEFINITIONS.map((item) => (
                  <option key={item.id} value={item.id}>{item.name} · {item.code}</option>
                ))}
              </select>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">{notes[selected.noteKey] || ""}</p>
            </div>

            <div>
              <label htmlFor="ic-count" className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
                <span>{ic.countLabel || "How many characters"}</span>
                <span className="text-sm font-extrabold text-fuchsia-700 normal-case tracking-normal">{safeCount}</span>
              </label>
              <input
                id="ic-count"
                type="range"
                min={1}
                max={1000}
                value={safeCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                className="w-full accent-fuchsia-700 cursor-pointer"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {[1, 5, 10, 50, 100, 500].map((count) => (
                  <button key={count} onClick={() => setRepeatCount(count)} className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer ${safeCount === count ? "bg-fuchsia-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-fuchsia-50"}`}>
                    {count}
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={safeCount}
                  onChange={(e) => setRepeatCount(Number(e.target.value))}
                  aria-label={ic.countLabel || "How many characters"}
                  className="w-24 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{ic.visiblePreview || "Visible preview (the copy is still the real character)"}</p>
            <div className="min-h-40 rounded-2xl border border-fuchsia-200 bg-fuchsia-50/50 p-3 overflow-hidden" aria-live="polite">
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: Math.min(safeCount, 60) }).map((_, index) => (
                  <span key={index} className="rounded-md bg-white border border-fuchsia-200 px-1.5 py-1 font-mono text-[10px] font-bold text-fuchsia-800">
                    {selected.code.replace("U+", "")}
                  </span>
                ))}
                {safeCount > 60 && <span className="px-2 py-1 text-xs font-bold text-fuchsia-800">+{safeCount - 60}</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
              <p className="text-xs font-semibold text-stone-600">
                {ic.generatedLabel || "Ready to copy"}: <span className="text-stone-900">{selected.code} × {safeCount}</span>
              </p>
              <button onClick={copyGenerated} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-fuchsia-700 text-white text-xs font-bold hover:bg-fuchsia-600 cursor-pointer shadow">
                {generatedCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {generatedCopied ? (ic.copied || "Copied!") : (ic.copyGenerated || "Copy blank text")}
              </button>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed mt-2">{ic.outputNote}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <ScanSearch className="w-5 h-5 text-fuchsia-700" /> {ic.testerTitle || "Hidden character tester"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">{ic.testerHint}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setTesterText(ic.sampleTester || "Hello\u200B world\u2800!")} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {ic.sampleBtn || "Try a sample"}
          </button>
          <button onClick={() => setTesterText("")} disabled={!testerText} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {ic.clearBtn || "Clear"}
          </button>
          <button onClick={copyCleaned} disabled={!analysis.cleaned || analysis.hidden === 0} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            {cleanCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {cleanCopied ? (ic.copied || "Copied!") : (ic.copyCleaned || "Copy cleaned text")}
          </button>
        </div>

        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide" htmlFor="ic-tester">
          {ic.testerLabel || "Paste text to inspect"}
        </label>
        <textarea
          id="ic-tester"
          value={testerText}
          onChange={(e) => setTesterText(e.target.value)}
          placeholder={ic.testerPlaceholder || "Paste text here. Hidden characters will be labelled below…"}
          className="w-full h-44 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-fuchsia-500 resize-y"
        />

        <div className="grid grid-cols-3 gap-3" aria-live="polite">
          {[
            { label: ic.totalChars || "Total characters", value: analysis.total },
            { label: ic.hiddenChars || "Hidden / blank-width", value: analysis.hidden },
            { label: ic.visibleChars || "Not flagged", value: analysis.visible },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{item.label}</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-fuchsia-700" /> {ic.visualizedTitle || "Visualized text"}
          </h3>
          <div className="min-h-28 rounded-2xl border border-fuchsia-200 bg-fuchsia-50/40 p-4 text-sm sm:text-base leading-loose text-stone-800 whitespace-pre-wrap break-words">
            {testerText ? analysis.tokens.map((token, index) => {
              if (token.type === "hidden") {
                return <span key={index} className="mx-0.5 inline-flex rounded-md bg-fuchsia-700 px-1.5 py-0.5 align-middle font-mono text-[10px] font-bold text-white">[{token.label}]</span>;
              }
              if (token.type === "newline") return <span key={index} className="mx-0.5 inline-flex rounded-md bg-stone-200 px-1.5 py-0.5 align-middle font-mono text-[10px] font-bold text-stone-700">↵</span>;
              return <span key={index}>{token.value}</span>;
            }) : <span className="text-stone-400">{ic.testerEmpty || "Your labelled result will appear here."}</span>}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{ic.detectedTitle || "Detected characters"}</h3>
          {analysis.detected.length ? (
            <ul className="flex flex-wrap gap-2">
              {analysis.detected.map((item) => (
                <li key={item.label} className="rounded-full border border-fuchsia-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700">
                  {item.label} · {item.name} × {item.count}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-stone-500 bg-stone-50 border border-dashed border-stone-300 rounded-xl px-3 py-2.5">{ic.noHidden || "No hidden or blank-width characters detected in the current text."}</p>
          )}
          {analysis.hidden > 0 && <p className="text-[11px] text-stone-500 leading-relaxed mt-2">{ic.cleanNote}</p>}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-fuchsia-700" /> {ic.platformTitle || "Platforms decide in the end"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ic.platformText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><EyeOff className="w-4 h-4 text-fuchsia-700" /> {ic.accessibilityTitle || "Accessibility matters"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ic.accessibilityText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-fuchsia-700" /> {ic.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ic.privacyNote}</p>
        </div>
      </div>

      <ToolGuideSection toolId="invisibleCharacter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
