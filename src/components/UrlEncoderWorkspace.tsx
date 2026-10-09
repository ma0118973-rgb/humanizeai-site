import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  ArrowLeftRight, Check, Copy, Eraser, FlaskConical, Link2,
  ShieldCheck, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface UrlEncoderWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Mode = "full" | "component";
type Action = "encode" | "decode";

const MAX_INPUT = 50000;

const SAMPLE_FULL = "https://example.com/search?q=hello world&lang=en";
const SAMPLE_COMPONENT = "cookies & cream = best?";

/**
 * Convert with the browser's own URI functions, honestly:
 *  - full URL  -> encodeURI / decodeURI (keeps : / ? & = # structure)
 *  - component -> encodeURIComponent / decodeURIComponent (encodes them)
 * Both are UTF-8 based. Decoding an invalid percent-sequence (a trailing
 * "%", "%2", "%ZZ", or bytes that are not valid UTF-8) throws a URIError,
 * which is surfaced as a plain-language error — never a silent half-result.
 */
function convert(input: string, mode: Mode, action: Action): { output: string; error: boolean } {
  try {
    if (action === "encode") {
      return { output: mode === "full" ? encodeURI(input) : encodeURIComponent(input), error: false };
    }
    return { output: mode === "full" ? decodeURI(input) : decodeURIComponent(input), error: false };
  } catch {
    return { output: "", error: true };
  }
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

export function UrlEncoderWorkspace({ selectedLanguage = "en" }: UrlEncoderWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ue = (t as any).urlEncoder || {};

  const [mode, setMode] = useState<Mode>("component");
  const [action, setAction] = useState<Action>("encode");
  const [input, setInput] = useState(SAMPLE_COMPONENT);
  const [copied, setCopied] = useState(false);
  const [truncatedNote, setTruncatedNote] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: "", error: false };
    return convert(input, mode, action);
  }, [input, mode, action]);

  const fnName =
    mode === "full"
      ? action === "encode"
        ? "encodeURI"
        : "decodeURI"
      : action === "encode"
        ? "encodeURIComponent"
        : "decodeURIComponent";

  const handleInput = (value: string) => {
    if (value.length > MAX_INPUT) {
      setInput(value.slice(0, MAX_INPUT));
      setTruncatedNote(true);
    } else {
      setInput(value);
      setTruncatedNote(false);
    }
  };

  const loadSample = () => {
    setInput(mode === "full" ? SAMPLE_FULL : SAMPLE_COMPONENT);
    setAction("encode");
    setTruncatedNote(false);
  };

  const clearAll = () => {
    setInput("");
    setTruncatedNote(false);
  };

  const swap = () => {
    if (result.error || !result.output) return;
    setInput(result.output);
    setAction((a) => (a === "encode" ? "decode" : "encode"));
    setTruncatedNote(false);
  };

  const copyOutput = async () => {
    if (!result.output) return;
    await copyText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const fmt = (tpl: string, n: number) => tpl.replace("{n}", String(n));

  // Worked example, computed with the real functions so it can never drift.
  const exampleFull = encodeURI(SAMPLE_COMPONENT);
  const exampleComponent = encodeURIComponent(SAMPLE_COMPONENT);

  const modeBtn = (active: boolean) =>
    `flex-1 text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer ${
      active
        ? "bg-sky-600 text-white border-sky-600 shadow"
        : "bg-stone-50 text-stone-700 border-stone-200 hover:border-sky-300"
    }`;
  const actionBtn = (active: boolean) =>
    `flex-1 px-4 py-2.5 rounded-xl border text-sm font-extrabold transition-all cursor-pointer ${
      active
        ? "bg-sky-600 text-white border-sky-600 shadow"
        : "bg-white text-stone-600 border-stone-300 hover:border-sky-400"
    }`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="urlEncoder" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-sky-100 via-cyan-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-sky-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.14),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              {ue.badge || "URL Encoder / Decoder"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload • UTF-8
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {ue.pageTitle || "Encode or Decode a URL — Full Link or Single Value"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ue.subtitle || "Two modes that must never be mixed up: encode a complete URL without breaking its structure, or encode one query value so its spaces, & and = survive the trip. Decoding reverses either one — all in this tab, nothing uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{ue.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {ue.quickAnswer || "It percent-encodes or decodes text with your browser's own URI functions. Full URL mode (encodeURI/decodeURI) keeps the : / ? & = # structure of a link intact and only fixes unsafe characters; Component mode (encodeURIComponent/decodeURIComponent) encodes those structure characters too, which is what a single query value needs. Non-English text is handled as UTF-8. Encoding is formatting for transport — it is not encryption and gives no security."}
        </p>
      </div>

      {/* Mode + action */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div>
          <p className="text-sm font-extrabold text-stone-900 mb-2">{ue.modeLabel || "What are you converting?"}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={() => setMode("full")} aria-pressed={mode === "full"} className={modeBtn(mode === "full")}>
              <span className="block text-sm font-extrabold">{ue.modeFull || "A full URL"}</span>
              <span className={`block text-xs mt-0.5 leading-snug ${mode === "full" ? "text-sky-100" : "text-stone-500"}`}>
                {ue.modeFullHint || "Keeps : / ? & = # working as link structure (encodeURI)."}
              </span>
            </button>
            <button onClick={() => setMode("component")} aria-pressed={mode === "component"} className={modeBtn(mode === "component")}>
              <span className="block text-sm font-extrabold">{ue.modeComponent || "A single value"}</span>
              <span className={`block text-xs mt-0.5 leading-snug ${mode === "component" ? "text-sky-100" : "text-stone-500"}`}>
                {ue.modeComponentHint || "For one query value or path piece — & = ? are encoded too (encodeURIComponent)."}
              </span>
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm font-extrabold text-stone-900 mb-2">{ue.actionLabel || "Direction"}</p>
          <div className="flex gap-2">
            <button onClick={() => setAction("encode")} aria-pressed={action === "encode"} className={actionBtn(action === "encode")}>
              {ue.actionEncode || "Encode → %XX"}
            </button>
            <button onClick={() => setAction("decode")} aria-pressed={action === "decode"} className={actionBtn(action === "decode")}>
              {ue.actionDecode || "Decode → text"}
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-2 font-mono">
            {(ue.functionNote || "This run uses: {fn}").replace("{fn}", fnName + "()")}
          </p>
        </div>
      </div>

      {/* Input / output */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-sm font-extrabold text-stone-900" htmlFor="url-input">
            {ue.inputLabel || "Your text or URL"}
          </label>
          <div className="flex gap-2">
            <button
              onClick={loadSample}
              className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" /> {ue.sampleBtn || "Try sample"}
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eraser className="w-3.5 h-3.5" /> {ue.clearBtn || "Clear"}
            </button>
          </div>
        </div>
        <textarea
          id="url-input"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={ue.inputPlaceholder || "Paste a full URL, or one value like a search phrase, email or file name…"}
          spellCheck={false}
          rows={4}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
        />
        <p className="text-xs text-stone-500 font-mono">{fmt(ue.inputLimit || "{n} / 50,000 characters", input.length)}</p>
        {truncatedNote && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {ue.truncatedNotice || "Input was trimmed at the 50,000-character cap shown above, so the page stays responsive."}
          </p>
        )}

        {result.error ? (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-red-900">{ue.errorTitle || "That percent-encoding is not valid"}</p>
              <p className="text-xs sm:text-sm text-red-900/80 leading-relaxed">
                {ue.errorInvalid || "Decoding stopped: somewhere in this text there is a broken percent sign — like a trailing %, a short %2, %ZZ, or encoded bytes that are not valid UTF-8 text. Nothing was half-decoded or guessed; fix or remove the broken % sequence and the result will appear."}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
              <label className="text-sm font-extrabold text-stone-900" htmlFor="url-output">
                {ue.outputLabel || "Result"}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={swap}
                  disabled={!result.output}
                  className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 disabled:opacity-40 border border-sky-200 text-sky-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" /> {ue.swapBtn || "Swap & reverse"}
                </button>
                <button
                  onClick={copyOutput}
                  disabled={!result.output}
                  className="px-3 py-1.5 rounded-lg border-2 border-sky-300 bg-sky-50 hover:bg-sky-100 disabled:opacity-40 text-sky-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (ue.copiedBtn || "Copied") : (ue.copyBtn || "Copy result")}
                </button>
              </div>
            </div>
            <textarea
              id="url-output"
              value={result.output}
              readOnly
              placeholder={ue.outputEmpty || "The converted text appears here as you type."}
              rows={4}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-mono focus:outline-none"
            />
            <p className="text-xs text-stone-500 mt-1">{ue.liveNote || "Conversion is live: the result updates as you type, switch modes or flip direction. Swap & reverse feeds the result back in and flips Encode/Decode, handy for checking a round trip."}</p>
          </div>
        )}
      </div>

      {/* Worked example */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{ue.exampleTitle || "Why the mode matters — one worked example"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {ue.exampleIntro || "Suppose the value a visitor typed into your search box is the phrase below. It contains spaces and the three characters that run a query string: &, = and ?. Watch what each mode does to it:"}
        </p>
        <div className="space-y-2 font-mono text-[13px] sm:text-sm">
          <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3 break-all">
            <span className="block text-[11px] font-sans font-bold text-stone-500 mb-1">{ue.exampleValueLabel || "The raw value"}</span>
            {SAMPLE_COMPONENT}
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 break-all">
            <span className="block text-[11px] font-sans font-bold text-red-700 mb-1">{ue.exampleFullLabel || "Full-URL mode on a value — the link breaks"}</span>
            {exampleFull}
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 break-all">
            <span className="block text-[11px] font-sans font-bold text-emerald-700 mb-1">{ue.exampleComponentLabel || "Component mode — the value survives whole"}</span>
            {exampleComponent}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {ue.exampleNote || "In Full-URL mode the & and = stay live, so a server reading ?q=cookies%20&%20cream… believes q is just “cookies”, and the rest becomes stray parameters — the search is corrupted before it starts. Component mode encodes & as %26, = as %3D and ? as %3F, so the whole phrase arrives as one value. Rule of thumb: whole link → Full URL mode; one value inside a link → Component mode. Encoding an already-encoded value again double-encodes it (%20 becomes %2520), so encode exactly once."}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{ue.honestTitle || "Encoding is not encryption — read this once"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {ue.honestText || "Percent-encoding only rewrites characters so a URL can carry them safely; anyone who sees %26 can turn it back into & instantly, with this very tool. It hides nothing and protects nothing: never put a password, API key, token or other secret in a URL expecting encoding to keep it safe — it will not. Non-Latin text (Urdu, Japanese, emoji) is encoded as UTF-8 bytes, which is why one character can become several %XX groups, and decoding expects that same UTF-8. This tool also leaves a literal + as + when decoding; in old form data + can mean a space, so if a decoded value looks like it is missing its spaces, that is the likely reason."}
          </p>
        </div>
      </div>

      <p className="text-xs text-stone-500 flex items-center gap-1.5 px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {ue.localNote || "Your text is converted only in this browser tab with the built-in encodeURI/encodeURIComponent functions — never uploaded, stored or shared by this tool."}
      </p>

      <ToolGuideSection toolId="urlEncoder" selectedLanguage={selectedLanguage} />
    </div>
  );
}
