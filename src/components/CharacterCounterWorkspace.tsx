import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  BarChart3, Check, Copy, Download, Eraser, FileText, Hash, Info,
  LetterText, MessagesSquare, ShieldCheck, Sparkles, Upload,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface CharacterCounterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

interface CharStats {
  graphemes: number;
  graphemesNoSpaces: number;
  codePoints: number;
  utf16Units: number;
  utf8Bytes: number;
  words: number;
  lines: number;
  uniqueChars: number;
  segmenterOk: boolean;
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", "ur-pk": "ur-PK", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb", ru: "ru",
};

const SAMPLES: Record<LanguageCode, string> = {
  en: "Short text carries far. A headline, a bio and one honest sentence can say more than a long paragraph that nobody finishes reading.",
  es: "El texto breve llega lejos. Un titular, una bio y una frase honesta dicen más que un párrafo largo que nadie termina de leer.",
  ur: "Chhota text door tak jata hai. Ek headline, ek bio aur ek sachcha jumla us lambi tehreer se zyada keh jata hai jo koi mukammal nahi parhta.", "ur-pk": "چھوٹا متن دور تک جاتا ہے۔ ایک سرخی، ایک بائیو اور ایک سچا جملہ اس لمبی تحریر سے زیادہ کہہ جاتا ہے جو کوئی مکمل نہیں پڑھتا۔",
  de: "Kurzer Text trägt weit. Eine Schlagzeile, eine kurze Bio und ein ehrlicher Satz sagen mehr als ein langer Absatz, den niemand zu Ende liest.",
  fr: "Un texte court va loin. Un titre, une bio et une phrase honnête en disent plus qu’un long paragraphe que personne ne finit.",
  tr: "Kısa metin uzağa gider. Bir başlık, bir biyografi ve dürüst bir cümle, kimsenin sonuna kadar okumadığı uzun bir paragraftan daha çok şey söyler.",
  pt: "Texto curto vai longe. Um título, uma bio e uma frase honesta dizem mais do que um parágrafo longo que ninguém termina de ler.",
  ja: "短い文章は遠くまで届きます。見出しと自己紹介、そして正直な一文は、誰も最後まで読まない長い段落より多くを伝えます。",
  it: "Un testo breve arriva lontano. Un titolo, una bio e una frase onesta dicono più di un paragrafo lungo che nessuno finisce di leggere.",
  nl: "Korte tekst reikt ver. Een kop, een bio en één eerlijke zin zeggen meer dan een lange alinea die niemand uitleest.",
  no: "Kort tekst når langt. En overskrift, en bio og én ærlig setning sier mer enn et langt avsnitt ingen leser ferdig.",
  ru: "Короткий текст долетает далеко. Заголовок, пара слов о себе и одно честное предложение скажут больше, чем длинный абзац, который никто не дочитывает до конца.",
};

function graphemeSegments(text: string, locale: string): { parts: string[]; ok: boolean } {
  try {
    const segmenter = new (Intl as any).Segmenter(locale, { granularity: "grapheme" });
    return { parts: Array.from(segmenter.segment(text), (s: any) => s.segment), ok: true };
  } catch {
    return { parts: Array.from(text), ok: false };
  }
}

function wordCount(text: string, locale: string): number {
  try {
    const segmenter = new (Intl as any).Segmenter(locale, { granularity: "word" });
    return Array.from(segmenter.segment(text)).filter((s: any) => s.isWordLike).length;
  } catch {
    return (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length;
  }
}

function countStats(text: string, locale: string): CharStats {
  const { parts, ok } = graphemeSegments(text, locale);
  const encoder = new TextEncoder();
  return {
    graphemes: parts.length,
    graphemesNoSpaces: parts.filter((c) => !/\s/u.test(c)).length,
    codePoints: Array.from(text).length,
    utf16Units: text.length,
    utf8Bytes: encoder.encode(text).length,
    words: wordCount(text, locale),
    lines: text ? text.split("\n").length : 0,
    uniqueChars: new Set(parts).size,
    segmenterOk: ok,
  };
}

// GSM 03.38 basic character set (1 unit each) and extension set (2 units each).
const GSM7_BASIC = new Set(
  Array.from("@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà")
);
const GSM7_EXT = new Set(Array.from("^{}\\[~]|€\f"));

interface SmsInfo {
  isGsm: boolean;
  units: number;
  segments: number;
  perSegment: number;
}

function smsInfo(text: string): SmsInfo {
  let units = 0;
  let gsm = true;
  for (const ch of text) {
    if (GSM7_BASIC.has(ch)) units += 1;
    else if (GSM7_EXT.has(ch)) units += 2;
    else { gsm = false; break; }
  }
  if (gsm) {
    const segments = units === 0 ? 0 : units <= 160 ? 1 : Math.ceil(units / 153);
    return { isGsm: true, units, segments, perSegment: segments > 1 ? 153 : 160 };
  }
  const ucs2Units = text.length;
  const segments = ucs2Units === 0 ? 0 : ucs2Units <= 70 ? 1 : Math.ceil(ucs2Units / 67);
  return { isGsm: false, units: ucs2Units, segments, perSegment: segments > 1 ? 67 : 70 };
}

interface Preset {
  id: string;
  labelKey: string;
  max: number;
  recommended?: boolean;
}

const PRESETS: Preset[] = [
  { id: "x", labelKey: "presetXPost", max: 280 },
  { id: "igCaption", labelKey: "presetIgCaption", max: 2200 },
  { id: "igBio", labelKey: "presetIgBio", max: 150 },
  { id: "tiktok", labelKey: "presetTiktokCaption", max: 2200 },
  { id: "linkedin", labelKey: "presetLinkedinPost", max: 3000 },
  { id: "facebook", labelKey: "presetFacebookPost", max: 63206 },
  { id: "ytTitle", labelKey: "presetYtTitle", max: 100 },
  { id: "ytDesc", labelKey: "presetYtDesc", max: 5000 },
  { id: "metaTitle", labelKey: "presetMetaTitle", max: 60, recommended: true },
  { id: "metaDesc", labelKey: "presetMetaDesc", max: 160, recommended: true },
  { id: "adsHeadline", labelKey: "presetAdsHeadline", max: 30 },
  { id: "adsDesc", labelKey: "presetAdsDesc", max: 90 },
];

const PRESET_FALLBACKS: Record<string, string> = {
  presetXPost: "X (Twitter) post",
  presetIgCaption: "Instagram caption",
  presetIgBio: "Instagram bio",
  presetTiktokCaption: "TikTok caption",
  presetLinkedinPost: "LinkedIn post",
  presetFacebookPost: "Facebook post",
  presetYtTitle: "YouTube title",
  presetYtDesc: "YouTube description",
  presetMetaTitle: "Meta title",
  presetMetaDesc: "Meta description",
  presetAdsHeadline: "Google Ads headline",
  presetAdsDesc: "Google Ads description",
};

export function CharacterCounterWorkspace({ selectedLanguage = "en" }: CharacterCounterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const cc = (t as any).charCounter || {};
  const locale = LOCALES[selectedLanguage] || "en";

  const [text, setText] = useState("");
  const [selection, setSelection] = useState("");
  const [copied, setCopied] = useState<"text" | "stats" | null>(null);
  const [fileError, setFileError] = useState("");
  const [presetId, setPresetId] = useState("x");
  const [customLimit, setCustomLimit] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => countStats(text, locale), [text, locale]);
  const selectionStats = useMemo(() => countStats(selection, locale), [selection, locale]);
  const sms = useMemo(() => smsInfo(text), [text]);
  const isJa = selectedLanguage === "ja";

  const customMax = Math.max(0, parseInt(customLimit.replace(/[^0-9]/g, ""), 10) || 0);
  const preset = PRESETS.find((p) => p.id === presetId) || PRESETS[0];
  const activeMax = customMax > 0 ? customMax : preset.max;
  const used = stats.graphemes;
  const remaining = activeMax - used;
  const pct = activeMax ? Math.min(100, (used / activeMax) * 100) : 0;
  const over = remaining < 0;

  const markCopied = (kind: "text" | "stats") => {
    setCopied(kind);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleCopyText = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    markCopied("text");
  };

  const statsText = [
    `${cc.characters || "Characters"}: ${stats.graphemes}`,
    `${cc.charactersNoSpaces || "Characters (no spaces)"}: ${stats.graphemesNoSpaces}`,
    `${cc.codePoints || "Unicode code points"}: ${stats.codePoints}`,
    `${cc.utf16Units || "UTF-16 code units"}: ${stats.utf16Units}`,
    `${cc.utf8Bytes || "UTF-8 bytes"}: ${stats.utf8Bytes}`,
    `${cc.words || "Words"}: ${stats.words}`,
    `${cc.lines || "Lines"}: ${stats.lines}`,
  ].join("\n");

  const handleCopyStats = async () => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(statsText);
    markCopied("stats");
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "character-counter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileError("");
    if (file.size > 5 * 1024 * 1024) {
      setFileError(cc.fileError || "That file is too large for this browser tool. Please paste the text instead.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.onerror = () => setFileError(cc.fileError || "That file could not be read as text. Please paste the text instead.");
    reader.readAsText(file);
  };

  const updateSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    setSelection(el.value.slice(el.selectionStart || 0, el.selectionEnd || 0));
  };

  const statCards = [
    { label: cc.characters || "Characters", value: stats.graphemes, icon: LetterText },
    { label: cc.charactersNoSpaces || "Characters (no spaces)", value: stats.graphemesNoSpaces, icon: LetterText },
    { label: cc.codePoints || "Unicode code points", value: stats.codePoints, icon: Hash },
    { label: cc.utf16Units || "UTF-16 code units", value: stats.utf16Units, icon: Hash },
    { label: cc.utf8Bytes || "UTF-8 bytes", value: stats.utf8Bytes, icon: FileText },
    { label: cc.words || "Words", value: stats.words, icon: BarChart3 },
    { label: cc.lines || "Lines", value: stats.lines, icon: FileText },
    { label: cc.uniqueChars || "Unique characters", value: stats.uniqueChars, icon: Sparkles },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="characterCounter" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-sky-100 via-cyan-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-sky-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.16),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5">
              <LetterText className="w-3.5 h-3.5 text-sky-600" />
              {cc.badge || "Character Counter"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {cc.title || "Count Characters Exactly — and Check the Limit"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {cc.subtitle || "See characters with and without spaces, code points, UTF-16 units and UTF-8 bytes, then check your text against the limit of the platform you are writing for. Everything runs in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-600 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-sky-950">{cc.quickAnswerTitle || "Quick Answer: What Is a Character, Exactly?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {cc.quickAnswer || "It depends who counts. A reader sees one character in an emoji; Unicode stores it as one or more code points; your browser may hold it as two UTF-16 units and four UTF-8 bytes. This tool shows each count with its method named, so the number you compare with a limit is the number that limit actually uses."}
            </p>
          </div>
        </div>
      </div>

      {isJa && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            {cc.jaNote || "Japanese writing is naturally counted in characters, so the character counts above are the main numbers here. The word count is only a rough guide for space-separated or mixed text."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                <Icon className="w-3.5 h-3.5 text-sky-600" /> {card.label}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">{card.value}</div>
            </div>
          );
        })}
      </div>

      {!stats.segmenterOk && text && (
        <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          {cc.segmenterNote || "This browser cannot group characters into grapheme clusters, so the main count above falls back to Unicode code points."}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer">
              <Upload className="w-4 h-4" /> {cc.importBtn || "Open .txt file"}
            </button>
            <button onClick={() => { setText(SAMPLES[selectedLanguage]); setSelection(""); }} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
              {cc.sampleBtn || "Try sample"}
            </button>
            <button onClick={handleCopyText} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
              {copied === "text" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === "text" ? (cc.copied || "Copied!") : (cc.copyText || "Copy text")}
            </button>
            <button onClick={handleDownload} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
              <Download className="w-4 h-4" /> {cc.download || "Download .txt"}
            </button>
            <button onClick={() => { setText(""); setSelection(""); }} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
              <Eraser className="w-4 h-4" /> {cc.clear || "Clear"}
            </button>
            <input ref={fileRef} type="file" accept=".txt,.md,.csv,text/plain" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          {fileError && <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{fileError}</p>}
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide">{cc.editorLabel || "Your text"}</label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); setSelection(""); }}
            onSelect={updateSelection}
            onClick={updateSelection}
            onKeyUp={updateSelection}
            placeholder={cc.placeholder || "Paste or type the text you want to measure — the counts update as you write."}
            className="w-full h-72 sm:h-96 rounded-2xl border border-stone-300 p-4 text-sm sm:text-base leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-sky-500 resize-y"
          />
          {selection && (
            <p className="text-xs sm:text-sm text-sky-900 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
              <strong>{cc.selectionLabel || "Selected text"}:</strong> {selectionStats.graphemes} {cc.characters || "characters"} • {selectionStats.utf8Bytes} {cc.utf8Bytes || "UTF-8 bytes"}
            </p>
          )}
          <a href={`/${selectedLanguage}/word-counter/`} className="inline-block text-xs font-bold text-sky-700 hover:text-sky-900 underline underline-offset-2">
            {cc.wordCounterLink || "Counting words, sentences or reading time instead? Open the Word Counter →"}
          </a>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5">
            <h3 className="font-bold text-stone-800 mb-1">{cc.limitsTitle || "Platform limits"}</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed mb-3">{cc.limitsNote || "Commonly published limits — platforms change these and count emoji, links and line breaks in their own way, so treat this as a guide, not a promise."}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPresetId(p.id); setCustomLimit(""); }}
                  className={`px-2.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer ${presetId === p.id && !customMax ? "bg-sky-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-sky-50"}`}
                >
                  {cc[p.labelKey] || PRESET_FALLBACKS[p.labelKey]} · {p.max}{p.recommended ? ` (${cc.recommendedTag || "recommended"})` : ""}
                </button>
              ))}
            </div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">{cc.customLimitLabel || "Or set your own limit"}</label>
            <input
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              inputMode="numeric"
              placeholder={cc.customPlaceholder || "e.g. 500"}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-sky-500 mb-4"
            />
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-stone-900">{used}<span className="text-sm font-bold text-stone-500"> / {activeMax}</span></span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${over ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {over ? `${Math.abs(remaining)} ${cc.overLabel || "over"}` : `${remaining} ${cc.remainingLabel || "left"}`}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${over ? "bg-rose-500" : "bg-sky-500"}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">{cc.limitBasis || "Measured with the Characters count (what a reader sees). The platform itself may count differently."}</p>
            </div>
            <button onClick={handleCopyStats} disabled={!text.trim()} className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
              {copied === "stats" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === "stats" ? (cc.copied || "Copied!") : (cc.copyStats || "Copy statistics")}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
              <MessagesSquare className="w-4 h-4 text-sky-600" /> {cc.smsTitle || "SMS reality check"}
            </h3>
            <div className="space-y-1.5 text-xs text-stone-700">
              <p><strong>{cc.smsEncoding || "Encoding"}:</strong> {text ? (sms.isGsm ? (cc.smsGsm || "GSM-7 (standard letters)") : (cc.smsUnicode || "Unicode (UCS-2)")) : "—"}</p>
              <p><strong>{cc.smsUnits || "Units used"}:</strong> {text ? sms.units : 0} / {sms.perSegment} {cc.smsPerSegment || "per segment"}</p>
              <p><strong>{cc.smsSegments || "Segments"}:</strong> {text ? sms.segments : 0}</p>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed mt-2">{cc.smsNote || "A plain SMS fits 160 GSM-7 characters. Add a character outside that set — Urdu or Arabic script, many emoji — and the whole message switches to Unicode at 70 characters per segment, so a long message splits sooner than the headline number suggests."}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-sky-600" /> {cc.methodTitle || "Four counts, four methods"}</h3>
          <ul className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-1.5 list-disc pl-4">
            <li>{cc.methodGrapheme || "Characters: grapheme clusters — what a reader sees as one character, emoji included."}</li>
            <li>{cc.methodCodePoint || "Code points: the Unicode units the text is built from; one emoji can be several."}</li>
            <li>{cc.methodUtf16 || "UTF-16 units: the browser/JavaScript length; many emoji count as 2 here."}</li>
            <li>{cc.methodBytes || "UTF-8 bytes: the storage size — what file, database and API limits usually measure."}</li>
          </ul>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-sky-600" /> {cc.platformsTitle || "Platforms count their own way"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{cc.platformsText || "Limits change without notice, and each platform weighs characters differently — X, for example, counts some scripts and emoji double. Use the presets to plan, then trust the counter inside the app you are posting to for the final word."}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-sky-600" /> {cc.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{cc.privacyNote || "Your text is counted locally in this browser tab. It is not uploaded, saved on a server, or shared by this tool. Close the tab without copying and the text is gone — the honest trade-off of real privacy."}</p>
        </div>
      </div>

      <ToolGuideSection toolId="characterCounter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
