import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Download, Eraser, Info, Link2, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface SlugGeneratorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Separator = "-" | "_";

// English stop words only — the UI and guides say so honestly. Other
// languages' small words are deliberately left untouched.
const EN_STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "then", "else", "for", "of",
  "at", "by", "in", "on", "to", "from", "with", "without", "is", "are",
  "was", "were", "be", "been", "it", "its", "this", "that", "these",
  "those", "as", "how", "what", "why", "when", "where", "who", "your",
  "you", "we", "our", "do", "does", "can",
]);

// Letters Unicode decomposition cannot turn into plain a-z on its own.
const EXTRA_MAP: Record<string, string> = {
  "ß": "ss", "æ": "ae", "œ": "oe", "ø": "o", "đ": "d", "ł": "l",
  "þ": "th", "ð": "d", "ı": "i",
};

const NON_LATIN_RE = /[぀-ヿ㐀-鿿؀-ۿݐ-ݿ]/u;

function slugifyLine(
  raw: string,
  separator: Separator,
  removeStopWords: boolean,
  stripAccents: boolean,
  maxLength: number,
): string {
  let s = raw.trim().toLowerCase();
  if (!s) return "";
  // Apostrophes disappear instead of leaving orphan letters (google's → googles).
  s = s.replace(/['’ʼ]/g, "");
  s = s.replace(/[ßæœøđłþðı]/g, (ch) => EXTRA_MAP[ch] ?? ch);
  if (stripAccents) {
    // NFD splits é into e + accent mark; dropping the marks leaves plain e.
    s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  const parts = s
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .filter((w) => !(removeStopWords && EN_STOP_WORDS.has(w)));
  let slug = parts.join(separator);
  if (maxLength > 0 && slug.length > maxLength) {
    const cut = slug.slice(0, maxLength);
    const lastSep = cut.lastIndexOf(separator);
    slug = (lastSep > 0 ? cut.slice(0, lastSep) : cut).replace(new RegExp(`\\${separator}+$`), "");
  }
  return slug;
}

function countChars(text: string): number {
  return [...text].length;
}

export function SlugGeneratorWorkspace({ selectedLanguage = "en" }: SlugGeneratorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const sg = (t as any).slugGen || {};

  const [text, setText] = useState("");
  const [separator, setSeparator] = useState<Separator>("-");
  const [removeStopWords, setRemoveStopWords] = useState(false);
  const [stripAccents, setStripAccents] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const lines = text.replace(/\r\n?/g, "\n").split("\n");
    const rows = lines
      .map((line) => ({ title: line.trim(), slug: slugifyLine(line, separator, removeStopWords, stripAccents, maxLength) }))
      .filter((r) => r.title !== "");
    const isBatch = rows.length > 1;
    const single = rows.length === 1 ? rows[0].slug : "";
    return {
      rows,
      isBatch,
      single,
      hasNonLatin: NON_LATIN_RE.test(text),
      slugChars: countChars(isBatch ? rows.map((r) => r.slug).join("\n") : single),
      wordCount: single ? single.split(separator).filter(Boolean).length : 0,
    };
  }, [text, separator, removeStopWords, stripAccents, maxLength]);

  const copyText = async (value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const handleDownload = () => {
    const value = result.isBatch
      ? result.rows.map((r) => r.slug).join("\n")
      : result.single;
    if (!value) return;
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slugs.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const separators: { id: Separator; label: string; hint: string }[] = [
    { id: "-", label: sg.sepHyphen || "Hyphen - (recommended)", hint: sg.sepHyphenHint || "Search engines read a hyphen as a space between words." },
    { id: "_", label: sg.sepUnderscore || "Underscore _", hint: sg.sepUnderscoreHint || "Useful for file names; in URLs it can read as one joined word." },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="slugGenerator" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white self-start shadow-sm">
            <Link2 className="w-3.5 h-3.5" /> {sg.badge || "Slug Generator"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {sg.pageTitle || "Turn Any Title into a Clean URL Slug"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {sg.subtitle || "Paste a post title and watch a lowercase, ready-to-paste slug appear. Choose the separator, trim the length, and copy it into your CMS — everything happens in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
            <Link2 className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-emerald-950">{sg.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{sg.quickAnswer}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setText(sg.sampleText || "")} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {sg.sampleBtn || "Try samples"}
          </button>
          <button onClick={() => setText("")} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {sg.clearBtn || "Clear"}
          </button>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="slug-input">
            {sg.inputLabel || "Your title (one per line for batch mode)"}
          </label>
          <textarea
            id="slug-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={sg.placeholder || "Paste a blog post title, product name or heading…"}
            className="w-full h-40 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{sg.separatorTitle || "Separator"}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {separators.map((item) => (
              <button
                key={item.id}
                onClick={() => setSeparator(item.id)}
                className={`text-left px-3 py-2.5 rounded-xl border transition cursor-pointer ${separator === item.id ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300"}`}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className={`block text-[11px] leading-relaxed ${separator === item.id ? "text-emerald-50" : "text-stone-500"}`}>{item.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition ${removeStopWords ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300"}`}>
            <input type="checkbox" checked={removeStopWords} onChange={(e) => setRemoveStopWords(e.target.checked)} className="mt-0.5 w-4 h-4 cursor-pointer accent-white" />
            <span>
              <span className="block text-xs font-bold">{sg.stopWordsLabel || "Remove English stop words"}</span>
              <span className={`block text-[11px] leading-relaxed ${removeStopWords ? "text-emerald-50" : "text-stone-500"}`}>{sg.stopWordsHint || "Drops small English words like the, and, of. Other languages are left as they are."}</span>
            </span>
          </label>
          <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition ${stripAccents ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300"}`}>
            <input type="checkbox" checked={stripAccents} onChange={(e) => setStripAccents(e.target.checked)} className="mt-0.5 w-4 h-4 cursor-pointer accent-white" />
            <span>
              <span className="block text-xs font-bold">{sg.accentsLabel || "Plain Latin letters (é → e)"}</span>
              <span className={`block text-[11px] leading-relaxed ${stripAccents ? "text-emerald-50" : "text-stone-500"}`}>{sg.accentsHint || "Converts accented Latin letters to plain ones. Switch off and those letters are removed instead."}</span>
            </span>
          </label>
          <div className="px-3 py-2.5 rounded-xl border bg-stone-50 border-stone-200">
            <label className="block text-xs font-bold text-stone-700" htmlFor="slug-max">
              {sg.maxLengthLabel || "Max length (0 = no limit)"}
            </label>
            <input
              id="slug-max"
              type="number"
              min={0}
              max={500}
              value={maxLength}
              onChange={(e) => setMaxLength(Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
              className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-800 focus:outline-none focus:border-emerald-500"
            />
            <span className="block text-[11px] text-stone-500 leading-relaxed mt-1">{sg.maxLengthHint || "Cuts at a word boundary where possible, so the slug may end up a little shorter."}</span>
          </div>
        </div>

        {result.hasNonLatin && (
          <p className="flex items-start gap-2 text-[11px] sm:text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">
            <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{sg.scriptNote || "Your text contains a non-Latin script. This tool does not transliterate Japanese or Urdu-script text: characters outside a–z and 0–9 are removed, so type the romanized form (romaji, Roman Urdu) yourself and check the result before using it."}</span>
          </p>
        )}

        <div aria-live="polite" className="space-y-3">
          <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide">
            {sg.outputLabel || "Your slug"}
          </span>
          {result.isBatch ? (
            <div className="rounded-2xl border border-stone-200 overflow-hidden">
              {result.rows.map((row, i) => (
                <div key={i} className={`grid grid-cols-1 sm:grid-cols-2 gap-1 px-4 py-2.5 text-sm ${i % 2 ? "bg-stone-50" : "bg-white"}`}>
                  <span className="text-stone-500 truncate">{row.title}</span>
                  <span className="font-mono font-bold text-emerald-800 break-all">{row.slug || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-4">
              <p className="font-mono text-base sm:text-lg font-bold text-emerald-900 break-all">
                {result.single || (sg.outputEmptyHint || "Your slug will appear here as you type.")}
              </p>
              {result.single && (
                <p className="font-mono text-xs text-stone-500 break-all mt-1.5">
                  {(sg.urlPreviewLabel || "Full URL:")} https://www.toolvena.com/{result.single}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => copyText(result.isBatch ? result.rows.map((r) => r.slug).join("\n") : result.single)}
              disabled={!result.rows.length || (!result.isBatch && !result.single)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? (sg.copied || "Copied!") : result.isBatch ? (sg.copyAllBtn || "Copy all slugs") : (sg.copyBtn || "Copy slug")}
            </button>
            <button
              onClick={handleDownload}
              disabled={!result.rows.length}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" /> {sg.downloadBtn || "Download .txt"}
            </button>
            <span className="text-[11px] font-bold text-stone-500 ml-auto">
              {(sg.charsLabel || "Slug characters")}: {result.slugChars}
              {!result.isBatch && result.single ? ` · ${(sg.wordsLabel || "Words")}: ${result.wordCount}` : ""}
              {result.isBatch ? ` · ${(sg.linesLabel || "Titles")}: ${result.rows.length}` : ""}
            </span>
          </div>
        </div>

        <p className="flex items-start gap-2 text-[11px] sm:text-xs text-stone-500 leading-relaxed">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{sg.honestNote || "A clean slug makes a URL easy to read, type and share. It does not guarantee that Google will rank or index the page — content, links and the rest of the site decide that."}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-emerald-600" /> {sg.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{sg.honestText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> {sg.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{sg.privacyNote}</p>
        </div>
      </div>

      <ToolGuideSection toolId="slugGenerator" selectedLanguage={selectedLanguage} />
    </div>
  );
}
