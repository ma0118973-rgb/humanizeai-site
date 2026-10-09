import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  AlertTriangle, Check, Copy, Download, Eraser, Info, Repeat,
  ShieldCheck, Sparkles,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface TextRepeaterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb",
};

const MAX_REPEATS = 1000;
const MAX_OUTPUT = 200000;
const PRESETS = [5, 10, 50, 100, 500, 1000];

type Mode = "whole" | "words";
type SepKind = "none" | "space" | "newline" | "comma" | "custom";

export function TextRepeaterWorkspace({ selectedLanguage = "en" }: TextRepeaterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const rp = (t as any).textRepeater || {};
  const locale = LOCALES[selectedLanguage] || "en";
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const [text, setText] = useState("");
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<Mode>("whole");
  const [sepKind, setSepKind] = useState<SepKind>("newline");
  const [customSep, setCustomSep] = useState(" ");
  const [trailing, setTrailing] = useState(false);
  const [copied, setCopied] = useState(false);

  const separator =
    sepKind === "none" ? "" :
    sepKind === "space" ? " " :
    sepKind === "newline" ? "\n" :
    sepKind === "comma" ? ", " :
    customSep;

  const result = useMemo(() => {
    const want = Math.min(Math.max(Math.floor(count) || 1, 1), MAX_REPEATS);
    if (!text) return { output: "", copies: 0, limited: false, want };

    if (mode === "whole") {
      const unit = text.length;
      const sepLen = separator.length;
      let copies = want;
      let limited = false;
      const fullLen = want * unit + Math.max(0, want - 1) * sepLen + (trailing ? sepLen : 0);
      if (fullLen > MAX_OUTPUT) {
        // Largest number of complete copies that fits the output cap.
        copies = Math.max(1, Math.floor((MAX_OUTPUT + sepLen - (trailing ? sepLen : 0)) / (unit + sepLen)));
        if (copies > want) copies = want;
        limited = copies < want;
      }
      let output = new Array(copies).fill(text).join(separator);
      if (trailing && separator) output += separator;
      return { output, copies, limited, want };
    }

    // Each-word mode: every word repeated `want` times, groups joined by one space.
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) return { output: "", copies: 0, limited: false, want };
    const sepLen = separator.length;
    const groupLen = (w: string, r: number) => r * w.length + Math.max(0, r - 1) * sepLen;
    const totalLen = (r: number) =>
      words.reduce((sum, w) => sum + groupLen(w, r), 0) +
      (words.length - 1) + // single space between word groups
      (trailing ? sepLen : 0);

    let r = want;
    let limited = false;
    if (totalLen(want) > MAX_OUTPUT) {
      while (r > 1 && totalLen(r) > MAX_OUTPUT) r--;
      limited = true;
    }
    let output = words.map((w) => new Array(r).fill(w).join(separator)).join(" ");
    if (totalLen(r) > MAX_OUTPUT) {
      // Even one repeat of every word is too long: keep whole word-groups that fit.
      let built = "";
      for (const w of words) {
        const g = w; // r === 1 here, so the group is the word itself
        const next = built ? built + " " + g : g;
        if (next.length > MAX_OUTPUT) break;
        built = next;
      }
      output = built;
      limited = true;
    }
    if (trailing && separator && output) output += separator;
    return { output, copies: r, limited, want };
  }, [text, count, mode, separator, trailing]);

  const stats = useMemo(() => {
    const out = result.output;
    return {
      chars: out.length,
      words: out.trim() ? out.trim().split(/\s+/).length : 0,
      lines: out ? out.split("\n").length : 0,
    };
  }, [result.output]);

  const handleCopy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const handleDownload = () => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "repeated-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const setCountClamped = (v: number) => {
    if (Number.isNaN(v)) { setCount(1); return; }
    setCount(Math.min(Math.max(Math.floor(v), 1), MAX_REPEATS));
  };

  const modeOptions: { id: Mode; label: string; hint: string }[] = [
    { id: "whole", label: rp.modeWhole || "Whole text", hint: rp.modeWholeHint || "" },
    { id: "words", label: rp.modeWords || "Each word", hint: rp.modeWordsHint || "" },
  ];

  const sepOptions: { id: SepKind; label: string }[] = [
    { id: "none", label: rp.sepNone || "None" },
    { id: "space", label: rp.sepSpace || "Space" },
    { id: "newline", label: rp.sepNewline || "New line" },
    { id: "comma", label: rp.sepComma || "Comma" },
    { id: "custom", label: rp.sepCustom || "Custom" },
  ];

  const statCards = [
    { label: rp.statCopies || "Copies made", value: text ? result.copies : 0 },
    { label: rp.statChars || "Output characters", value: stats.chars },
    { label: rp.statWords || "Output words", value: stats.words },
    { label: rp.statLines || "Output lines", value: stats.lines },
  ];

  const limitText = String(rp.limitText || "")
    .replace("{max}", nf.format(MAX_OUTPUT))
    .replace("{copies}", nf.format(result.copies));

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="textRepeater" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-600 text-white self-start shadow-sm">
            <Repeat className="w-3.5 h-3.5" /> {rp.badge || "Text Repeater"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {rp.pageTitle || "Repeat Any Text Up to 1,000 Times"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {rp.subtitle || "Type or paste a word, sentence or emoji, choose how many copies you want and how they are joined, and copy the result. Everything happens in your browser — nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-600 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-violet-950">{rp.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rp.quickAnswer}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setText(rp.sampleText || "")} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {rp.sampleBtn || "Try a sample"}
          </button>
          <button onClick={handleCopy} disabled={!result.output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (rp.copied || "Copied!") : (rp.copyBtn || "Copy result")}
          </button>
          <button onClick={handleDownload} disabled={!result.output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
            <Download className="w-4 h-4" /> {rp.downloadBtn || "Download .txt"}
          </button>
          <button onClick={() => setText("")} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {rp.clearBtn || "Clear"}
          </button>
        </div>

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-violet-600" /> {rp.countLabel || "Repeat count"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="range"
              min={1}
              max={MAX_REPEATS}
              value={count}
              onChange={(e) => setCountClamped(Number(e.target.value))}
              className="flex-1 min-w-[140px] accent-violet-600 cursor-pointer"
              aria-label={rp.countLabel || "Repeat count"}
            />
            <input
              type="number"
              min={1}
              max={MAX_REPEATS}
              value={count}
              onChange={(e) => setCountClamped(Number(e.target.value))}
              className="w-24 rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-800 focus:outline-none focus:border-violet-500"
              aria-label={rp.countLabel || "Repeat count"}
            />
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setCount(p)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition ${count === p ? "bg-violet-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-violet-100"}`}
                >
                  {p}×
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-stone-500 leading-relaxed mt-1.5">{rp.countHint}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{rp.modeTitle || "Repeat mode"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {modeOptions.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`text-left px-3 py-2.5 rounded-xl border cursor-pointer transition ${mode === item.id ? "bg-violet-600 text-white border-violet-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-violet-300"}`}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className={`block text-[11px] leading-relaxed ${mode === item.id ? "text-violet-50" : "text-stone-500"}`}>{item.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{rp.separatorTitle || "Separator between copies"}</p>
          <div className="flex flex-wrap gap-1.5">
            {sepOptions.map((item) => (
              <button
                key={item.id}
                onClick={() => setSepKind(item.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${sepKind === item.id ? "bg-violet-600 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-violet-100"}`}
              >
                {item.label}
              </button>
            ))}
            {sepKind === "custom" && (
              <input
                type="text"
                value={customSep}
                maxLength={20}
                onChange={(e) => setCustomSep(e.target.value)}
                placeholder={rp.customPlaceholder || "Your separator…"}
                className="w-40 rounded-xl border border-violet-300 px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:border-violet-500"
                aria-label={rp.sepCustom || "Custom"}
              />
            )}
          </div>
          <label className={`mt-2 flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition max-w-xl ${trailing ? "bg-violet-600 text-white border-violet-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-violet-300"}`}>
            <input
              type="checkbox"
              checked={trailing}
              onChange={(e) => setTrailing(e.target.checked)}
              className="mt-0.5 w-4 h-4 cursor-pointer accent-white"
            />
            <span>
              <span className="block text-xs font-bold">{rp.trailingLabel || "Separator at the end"}</span>
              <span className={`block text-[11px] leading-relaxed ${trailing ? "text-violet-50" : "text-stone-500"}`}>{rp.trailingHint}</span>
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="repeater-input">
              {rp.inputLabel || "Text to repeat"}
            </label>
            <textarea
              id="repeater-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={rp.placeholder || "Type or paste the text you want to repeat…"}
              className="w-full h-72 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-violet-500 resize-y"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="repeater-output">
              {rp.outputLabel || "Repeated result"}
            </label>
            <textarea
              id="repeater-output"
              value={result.output}
              readOnly
              placeholder={text ? (rp.outputEmptyHint || "Your repeated text will appear here.") : (rp.emptyHint || "Type some text and the repeated result appears here at once.")}
              className="w-full h-72 rounded-2xl border border-violet-200 bg-violet-50/40 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none resize-y"
            />
          </div>
        </div>

        {result.limited && (
          <p className="flex items-start gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span><span className="block">{rp.limitTitle || "Result shortened"}</span><span className="font-normal">{limitText}</span></span>
          </p>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-live="polite">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{card.label}</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{nf.format(card.value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-violet-600" /> {rp.honestTitle || "Use it for formatting, not flooding"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rp.honestText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-violet-600" /> {rp.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rp.privacyNote}</p>
        </div>
      </div>

      <ToolGuideSection toolId="textRepeater" selectedLanguage={selectedLanguage} />
    </div>
  );
}
