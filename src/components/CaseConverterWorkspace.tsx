import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  CaseSensitive, Check, Copy, Download, Eraser, Info,
  Languages, ShieldCheck, Sparkles, Type,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface CaseConverterWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

type CaseKind = "upper" | "lower" | "sentence" | "capitalized" | "title" | "alternating" | "inverse";

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", "ur-pk": "ur-PK", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb", ru: "ru", hi: "hi",
};

const TITLE_MINOR_WORDS: Record<string, Set<string>> = {
  en: new Set(["a", "an", "the", "and", "or", "but", "nor", "for", "so", "yet", "as", "at", "by", "in", "into", "of", "off", "on", "onto", "out", "over", "per", "to", "up", "via", "with"]),
  es: new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "y", "e", "o", "u", "de", "del", "al", "en", "con", "por", "para", "sin", "sobre"]),
  ur: new Set(["aur", "ka", "ki", "ke", "ko", "se", "mein", "par", "tak", "bhi", "ya", "ek"]),
  de: new Set(["der", "die", "das", "ein", "eine", "und", "oder", "aber", "in", "im", "am", "an", "auf", "aus", "bei", "für", "mit", "nach", "von", "zu", "zur", "zum", "über", "unter"]),
  fr: new Set(["le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "en", "dans", "sur", "sous", "pour", "par", "avec", "sans", "chez", "au", "aux", "à"]),
  tr: new Set(["ve", "ile", "bir", "de", "da", "için", "gibi", "kadar", "sonra", "önce", "ama", "fakat", "ya", "ne", "ki"]),
  pt: new Set(["o", "a", "os", "as", "um", "uma", "uns", "umas", "e", "ou", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "por", "pelo", "pela", "para", "com", "sem", "ao", "aos", "à", "às"]),
  ja: new Set(["a", "an", "the", "and", "or", "but", "in", "on", "of", "to", "for", "with", "by", "at", "from"]),
  it: new Set(["il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "e", "o", "di", "a", "da", "in", "con", "su", "per", "tra", "fra", "del", "della", "dei", "delle", "nel", "nella", "al", "alla"]),
  nl: new Set(["de", "het", "een", "en", "of", "in", "op", "aan", "van", "voor", "met", "zonder", "tot", "bij", "naar", "door", "over", "onder", "tussen", "te", "ten"]),
  ru: new Set(["и", "или", "а", "но", "в", "на", "с", "по", "к", "у", "о", "от", "до", "из", "за", "для", "не", "что", "это", "как", "при", "про", "над", "под", "без", "через", "между"]),
  nb: new Set(["og", "eller", "i", "på", "til", "av", "for", "med", "uten", "en", "et", "ei", "den", "det", "de", "som", "om", "fra", "mot", "over", "under", "mellom"]),
};

function graphemeSegments(text: string, locale: string): string[] {
  try {
    const segmenter = new (Intl as any).Segmenter(locale, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s: any) => String(s.segment));
  } catch {
    return Array.from(text);
  }
}

function wordSegments(text: string, locale: string): any[] {
  try {
    const segmenter = new (Intl as any).Segmenter(locale, { granularity: "word" });
    return Array.from(segmenter.segment(text));
  } catch {
    return [];
  }
}

function countText(text: string, locale: string) {
  const characters = graphemeSegments(text, locale);
  const words = wordSegments(text, locale).filter((s: any) => s.isWordLike);
  return {
    characters: characters.length,
    charactersNoSpaces: characters.filter((c) => !/\s/u.test(c)).length,
    words: words.length,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
  };
}

function capitalizeFirstLetter(word: string, locale: string): string {
  const chars = Array.from(word.toLocaleLowerCase(locale));
  const idx = chars.findIndex((c) => /\p{L}/u.test(c));
  if (idx < 0) return word;
  chars[idx] = chars[idx].toLocaleUpperCase(locale);
  return chars.join("");
}

function toSentenceCase(text: string, locale: string): string {
  const chars = Array.from(text.toLocaleLowerCase(locale));
  let capNext = true;
  const terminators = new Set([".", "!", "?", "…", "。", "！", "？"]);
  const closers = new Set(['"', "'", "”", "’", "»", ")", "]", "}", "】", "」"]);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (capNext && /\p{L}/u.test(ch)) {
      chars[i] = ch.toLocaleUpperCase(locale);
      capNext = false;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      capNext = true;
      continue;
    }
    if (terminators.has(ch)) {
      let j = i + 1;
      while (j < chars.length && closers.has(chars[j])) j++;
      if (j >= chars.length || /\s/u.test(chars[j])) capNext = true;
    }
  }

  let result = chars.join("");
  if (locale.toLowerCase().startsWith("en")) {
    result = result.replace(/\bi\b/gu, "I");
  }
  return result;
}

function toCapitalizedCase(text: string, locale: string): string {
  const parts = wordSegments(text.toLocaleLowerCase(locale), locale);
  if (!parts.length) {
    return text.replace(/[\p{L}\p{N}]+(?:['’ʼ-][\p{L}\p{N}]+)*/gu, (w) => capitalizeFirstLetter(w, locale));
  }
  return parts.map((s: any) => (s.isWordLike ? capitalizeFirstLetter(String(s.segment), locale) : String(s.segment))).join("");
}

function toTitleCase(text: string, locale: string, lang: LanguageCode): string {
  const lowerText = text.toLocaleLowerCase(locale);
  const parts = wordSegments(lowerText, locale);
  if (!parts.length) return toCapitalizedCase(text, locale);

  const minor = TITLE_MINOR_WORDS[locale] || TITLE_MINOR_WORDS[lang] || TITLE_MINOR_WORDS.en;
  const wordIndexes = parts.map((s: any, i: number) => (s.isWordLike ? i : -1)).filter((i: number) => i >= 0);
  const firstWord = wordIndexes[0];
  const lastWord = wordIndexes[wordIndexes.length - 1];

  return parts.map((s: any, i: number) => {
    const segment = String(s.segment);
    if (!s.isWordLike) return segment;
    const previous = i > 0 ? String(parts[i - 1].segment) : "";
    const afterBreak = i === firstWord || i === lastWord || /[-:—–\n]/.test(previous);
    const key = segment.toLocaleLowerCase(locale);
    if (!afterBreak && minor.has(key)) return segment;
    return capitalizeFirstLetter(segment, locale);
  }).join("");
}

function toAlternatingCase(text: string, locale: string): string {
  let upperNext = false;
  return graphemeSegments(text, locale).map((ch) => {
    const lower = ch.toLocaleLowerCase(locale);
    const upper = ch.toLocaleUpperCase(locale);
    if (lower === upper) return ch;
    const out = upperNext ? upper : lower;
    upperNext = !upperNext;
    return out;
  }).join("");
}

function toInverseCase(text: string, locale: string): string {
  return graphemeSegments(text, locale).map((ch) => {
    const lower = ch.toLocaleLowerCase(locale);
    const upper = ch.toLocaleUpperCase(locale);
    if (lower === upper) return ch;
    return ch === lower ? upper : lower;
  }).join("");
}

function convertText(text: string, kind: CaseKind, locale: string, lang: LanguageCode): string {
  switch (kind) {
    case "upper": return text.toLocaleUpperCase(locale);
    case "lower": return text.toLocaleLowerCase(locale);
    case "sentence": return toSentenceCase(text, locale);
    case "capitalized": return toCapitalizedCase(text, locale);
    case "title": return toTitleCase(text, locale, lang);
    case "alternating": return toAlternatingCase(text, locale);
    case "inverse": return toInverseCase(text, locale);
  }
}

export function CaseConverterWorkspace({ selectedLanguage = "en" }: CaseConverterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const cc = (t as any).caseConverter || {};
  const locale = LOCALES[selectedLanguage] || "en";

  const [text, setText] = useState("");
  const [lastCase, setLastCase] = useState<CaseKind | null>(null);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => countText(text, locale), [text, locale]);

  const conversions = useMemo(() => ([
    { kind: "upper" as CaseKind, label: cc.upper || "UPPERCASE" },
    { kind: "lower" as CaseKind, label: cc.lower || "lowercase" },
    { kind: "sentence" as CaseKind, label: cc.sentence || "Sentence case" },
    { kind: "capitalized" as CaseKind, label: cc.capitalized || "Capitalized Case" },
    { kind: "title" as CaseKind, label: cc.title || "Title Case" },
    { kind: "alternating" as CaseKind, label: cc.alternating || "aLtErNaTiNg" },
    { kind: "inverse" as CaseKind, label: cc.inverse || "iNVERSE" },
  ]), [cc]);

  const previews = useMemo(() => conversions.map((item) => ({
    ...item,
    result: text ? convertText(text, item.kind, locale, selectedLanguage) : "",
  })), [conversions, text, locale, selectedLanguage]);

  const applyCase = (kind: CaseKind) => {
    if (!text) return;
    setText((current) => convertText(current, kind, locale, selectedLanguage));
    setLastCase(kind);
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "case-converted.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: cc.chars || "Characters", value: stats.characters },
    { label: cc.charsNoSpaces || "No spaces", value: stats.charactersNoSpaces },
    { label: cc.words || "Words", value: stats.words },
    { label: cc.lines || "Lines", value: stats.lines },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="caseConverter" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-600 text-white self-start shadow-sm">
            <Type className="w-3.5 h-3.5" /> {cc.badge || "Case Converter"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {cc.pageTitle || "Change Text Case in One Click"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {cc.subtitle || "Paste or type your text, tap a case, and copy the result. Every conversion happens instantly in your browser — nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-600 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-cyan-950">{cc.quickAnswerTitle || "Quick Answer: What Does This Case Converter Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {cc.quickAnswer || "It changes only letter capitalization, never your wording. It does not correct grammar or spelling."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setText(cc.sampleText || "")} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {cc.sampleBtn || "Try a sample"}
          </button>
          <button onClick={handleCopy} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (cc.copied || "Copied!") : (cc.copyBtn || "Copy text")}
          </button>
          <button onClick={handleDownload} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
            <Download className="w-4 h-4" /> {cc.downloadBtn || "Download .txt"}
          </button>
          <button onClick={() => { setText(""); setLastCase(null); }} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {cc.clearBtn || "Clear"}
          </button>
        </div>

        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide" htmlFor="case-converter-text">
          {cc.inputLabel || cc.editorLabel || "Your text"}
        </label>
        <textarea
          id="case-converter-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={cc.placeholder || "Type or paste your text here…"}
          className="w-full h-64 sm:h-80 rounded-2xl border border-stone-300 p-4 text-sm sm:text-base leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-cyan-500 resize-y"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" aria-live="polite">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{card.label}</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{card.value}</div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <CaseSensitive className="w-4 h-4 text-cyan-600" /> {cc.convertLabel || "Convert to"}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {conversions.map((item) => (
              <button
                key={item.kind}
                onClick={() => applyCase(item.kind)}
                disabled={!text}
                className={`px-2 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer ${lastCase === item.kind ? "bg-cyan-600 text-white shadow" : "bg-cyan-50 text-cyan-900 border border-cyan-200 hover:bg-cyan-100"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-5">
        <h2 className="font-bold text-stone-900 mb-3">{cc.previewTitle || "See every case before you choose"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {previews.map((item) => (
            <button
              key={item.kind}
              onClick={() => applyCase(item.kind)}
              disabled={!text}
              className="text-left rounded-2xl border border-stone-200 bg-stone-50 p-3 hover:border-cyan-300 hover:bg-cyan-50 disabled:opacity-60 cursor-pointer"
            >
              <span className="block text-[11px] font-extrabold uppercase tracking-wide text-cyan-700">{item.label}</span>
              <span className="block mt-1 text-xs sm:text-sm text-stone-700 leading-relaxed break-words min-h-10">
                {item.result ? (item.result.length > 180 ? `${item.result.slice(0, 180)}…` : item.result) : "—"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-cyan-600" /> {cc.honestTitle || "A capitalization helper, not grammar correction"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{cc.honestText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Languages className="w-4 h-4 text-cyan-600" /> {cc.localeTitle || "Locale-aware letters"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{cc.localeText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-cyan-600" /> {cc.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{cc.privacyNote}</p>
        </div>
      </div>

      <ToolGuideSection toolId="caseConverter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
