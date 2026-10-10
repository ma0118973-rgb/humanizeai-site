import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Download, Eraser, FileText, Info, ListChecks,
  ShieldCheck, Sparkles, Upload,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface RemoveDuplicateLinesWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", "ur-pk": "ur-PK", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb", ru: "ru",
};

function splitLines(text: string): string[] {
  if (!text) return [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  // A final newline terminates the last line; it does not create an extra one.
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function RemoveDuplicateLinesWorkspace({ selectedLanguage = "en" }: RemoveDuplicateLinesWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const dd = (t as any).dedupLines || {};
  const locale = LOCALES[selectedLanguage] || "en";

  const [text, setText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimSpaces, setTrimSpaces] = useState(true);
  const [ignoreBlank, setIgnoreBlank] = useState(true);
  const [sortAz, setSortAz] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const result = useMemo(() => {
    const rawLines = splitLines(text);
    const seen = new Set<string>();
    const unique: string[] = [];
    let duplicatesRemoved = 0;

    for (const rawLine of rawLines) {
      const display = trimSpaces ? rawLine.trim() : rawLine;
      const isBlank = display.trim() === "";
      if (isBlank && ignoreBlank) continue; // blank lines ignored: not output, not counted as duplicates
      const key = caseSensitive ? display : display.toLocaleLowerCase(locale);
      if (seen.has(key)) {
        duplicatesRemoved++;
        continue;
      }
      seen.add(key);
      unique.push(display);
    }

    if (sortAz) {
      unique.sort((a, b) => a.localeCompare(b, locale, {
        sensitivity: caseSensitive ? "variant" : "base",
        numeric: true,
      }));
    }

    return {
      totalLines: rawLines.length,
      uniqueLines: unique.length,
      duplicatesRemoved,
      output: unique.join("\n"),
    };
  }, [text, caseSensitive, trimSpaces, ignoreBlank, sortAz, locale]);

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
    a.download = "unique-lines.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setText(typeof reader.result === "string" ? reader.result : "");
      setFileError("");
    };
    reader.onerror = () => setFileError(dd.fileError || "That file could not be read as text. Try a plain .txt file.");
    reader.readAsText(file);
  };

  const toggles: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }[] = [
    { label: dd.caseSensitiveLabel || "Case-sensitive", hint: dd.caseSensitiveHint || "", checked: caseSensitive, onChange: setCaseSensitive },
    { label: dd.trimLabel || "Trim spaces", hint: dd.trimHint || "", checked: trimSpaces, onChange: setTrimSpaces },
    { label: dd.ignoreBlankLabel || "Ignore blank lines", hint: dd.ignoreBlankHint || "", checked: ignoreBlank, onChange: setIgnoreBlank },
    { label: dd.sortLabel || "Sort A–Z", hint: dd.sortHint || "", checked: sortAz, onChange: setSortAz },
  ];

  const statCards = [
    { label: dd.totalLines || "Total lines", value: result.totalLines },
    { label: dd.uniqueLines || "Unique lines", value: result.uniqueLines },
    { label: dd.duplicatesRemoved || "Duplicates removed", value: result.duplicatesRemoved },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="duplicateLines" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white self-start shadow-sm">
            <ListChecks className="w-3.5 h-3.5" /> {dd.badge || "Remove Duplicate Lines"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {dd.pageTitle || "Remove Duplicate Lines From Any List"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {dd.subtitle || "Paste a list or open a .txt file and keep only the first copy of each line. Change an option and the cleaned result updates at once — everything happens in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-emerald-950">{dd.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{dd.quickAnswer}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setText(dd.sampleText || ""); setFileError(""); }} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {dd.sampleBtn || "Try a sample"}
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            <Upload className="w-4 h-4" /> {dd.uploadBtn || "Open .txt"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button onClick={handleCopy} disabled={!result.output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (dd.copied || "Copied!") : (dd.copyBtn || "Copy result")}
          </button>
          <button onClick={handleDownload} disabled={!result.output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
            <Download className="w-4 h-4" /> {dd.downloadBtn || "Download .txt"}
          </button>
          <button onClick={() => { setText(""); setFileError(""); }} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {dd.clearBtn || "Clear"}
          </button>
        </div>

        {fileError && (
          <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">{fileError}</p>
        )}

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-emerald-600" /> {dd.optionsTitle || "Matching options"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {toggles.map((item) => (
              <label
                key={item.label}
                className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition ${item.checked ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300"}`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 cursor-pointer accent-white"
                />
                <span>
                  <span className="block text-xs font-bold">{item.label}</span>
                  <span className={`block text-[11px] leading-relaxed ${item.checked ? "text-emerald-50" : "text-stone-500"}`}>{item.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="dedup-input">
              {dd.inputLabel || "Your list"}
            </label>
            <textarea
              id="dedup-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={dd.placeholder || "Paste one item per line…"}
              className="w-full h-72 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 resize-y"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="dedup-output">
              {dd.outputLabel || "Cleaned result"}
            </label>
            <textarea
              id="dedup-output"
              value={result.output}
              readOnly
              placeholder={result.totalLines ? (dd.outputEmptyHint || "Your unique lines will appear here.") : (dd.emptyHint || "Paste a list or open a .txt file to see the cleaned result here.")}
              className="w-full h-72 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none resize-y"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3" aria-live="polite">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{card.label}</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{card.value}</div>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 text-[11px] sm:text-xs text-stone-500 leading-relaxed">
          <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          {dd.privacyNote}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-emerald-600" /> {dd.honestTitle || "Exact lines, not near matches"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{dd.honestText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> {dd.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{dd.privacyNote}</p>
        </div>
      </div>

      <ToolGuideSection toolId="duplicateLines" selectedLanguage={selectedLanguage} />
    </div>
  );
}
