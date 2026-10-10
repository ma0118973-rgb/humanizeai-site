import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  BarChart3, Check, ClipboardList, Copy, Download, Eraser, FileText,
  Gauge, Hash, Info, ListOrdered, ShieldCheck, Sparkles, Target, Upload,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface WordCounterWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  avgWordLength: number;
  avgSentenceLength: number;
  longestSentenceWords: number;
  readingSeconds: number;
  speakingSeconds: number;
  topWords: { word: string; count: number; percent: number }[];
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", "ur-pk": "ur-PK", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb", ru: "ru", hi: "hi",
};

const SAMPLES: Record<LanguageCode, string> = {
  en: "A clear plan saves time. When writers know the length of a draft, they can cut repetition, keep the useful details, and finish before the deadline.",
  es: "Un plan claro ahorra tiempo. Cuando sabes cuánto ocupa un texto, puedes cortar repeticiones, conservar los datos útiles y terminar antes de la fecha límite.",
  ur: "Ek saaf plan waqt bachata hai. Jab likhne wale ko apni tehreer ki lambai pata ho, wo takrar kaat sakta hai, kaam ki baatein rakh sakta hai aur deadline se pehle kaam mukammal kar sakta hai.", "ur-pk": "ایک صاف منصوبہ وقت بچاتا ہے۔ جب لکھنے والے کو اپنی تحریر کی لمبائی پتہ ہو، وہ تکرار کاٹ سکتا ہے، کام کی باتیں رکھ سکتا ہے اور آخری تاریخ سے پہلے کام مکمل کر سکتا ہے۔",
  hi: "एक साफ़ योजना समय बचाती है। जब लेखक को अपने ड्राफ़्ट की लंबाई पता होती है, तो वह दोहराव हटा सकता है, काम की बातें रख सकता है और डेडलाइन से पहले काम पूरा कर सकता है।",
  de: "Ein klarer Plan spart Zeit. Wer die Länge eines Entwurfs kennt, kann Wiederholungen streichen, wichtige Details behalten und vor der Frist fertig werden.",
  fr: "Un plan clair fait gagner du temps. Quand on connaît la longueur d’un brouillon, on peut couper les répétitions, garder les détails utiles et finir avant la date limite.",
  tr: "Net bir plan zaman kazandırır. Bir taslağın uzunluğunu bilen kişi tekrarları keser, yararlı ayrıntıları korur ve son tarihten önce bitirir.",
  pt: "Um plano claro economiza tempo. Quem conhece o tamanho de um rascunho pode cortar repetições, manter os detalhes úteis e terminar antes do prazo.",
  ja: "明確な計画は時間を節約します。下書きの長さが分かれば、繰り返しを削り、役立つ情報を残して、締切前に仕上げやすくなります。",
  it: "Un piano chiaro fa risparmiare tempo. Chi conosce la lunghezza di una bozza può tagliare le ripetizioni, tenere i dettagli utili e finire prima della scadenza.",
  nl: "Een duidelijk plan bespaart tijd. Wie de lengte van een concept kent, kan herhaling schrappen, nuttige details behouden en voor de deadline klaar zijn.",
  no: "En klar plan sparer tid. Når du vet hvor langt et utkast er, kan du kutte gjentakelser, beholde nyttige detaljer og bli ferdig før fristen.",
  ru: "Короткий текст долетает далеко. Заголовок, пара слов о себе и одно честное предложение скажут больше, чем длинный абзац, который никто не дочитывает до конца.",
};

function graphemeSegments(text: string, locale: string): string[] {
  try {
    const segmenter = new (Intl as any).Segmenter(locale, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s: any) => s.segment);
  } catch {
    return Array.from(text);
  }
}

function wordTokens(text: string, locale: string): string[] {
  try {
    const segmenter = new (Intl as any).Segmenter(locale, { granularity: "word" });
    return Array.from(segmenter.segment(text))
      .filter((s: any) => s.isWordLike)
      .map((s: any) => String(s.segment));
  } catch {
    return text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || [];
  }
}

function countStats(text: string, locale: string): TextStats {
  const chars = graphemeSegments(text, locale);
  const charsNoSpaces = chars.filter((c) => !/\s/u.test(c)).length;
  const words = wordTokens(text, locale);
  const wordCount = words.length;

  const sentenceParts = text
    .split(/[.!?。！？]+/u)
    .map((s) => s.trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
  const sentences = sentenceParts.length;
  const sentenceWordCounts = sentenceParts.map((s) => wordTokens(s, locale).length).filter((n) => n > 0);

  const paragraphs = text.trim()
    ? text.split(/\n\s*\n+/u).map((p) => p.trim()).filter((p) => /[\p{L}\p{N}]/u.test(p)).length
    : 0;
  const lines = text ? text.split("\n").length : 0;

  const lower = words.map((w) => w.toLocaleLowerCase(locale));
  const uniqueWords = new Set(lower).size;
  const totalWordChars = words.reduce((sum, w) => sum + graphemeSegments(w, locale).length, 0);
  const freq = new Map<string, number>();
  lower.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
  const topWords = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], locale))
    .slice(0, 8)
    .map(([word, count]) => ({ word, count, percent: wordCount ? (count / wordCount) * 100 : 0 }));

  return {
    words: wordCount,
    characters: chars.length,
    charactersNoSpaces: charsNoSpaces,
    sentences,
    paragraphs,
    lines,
    uniqueWords,
    avgWordLength: wordCount ? totalWordChars / wordCount : 0,
    avgSentenceLength: sentences ? wordCount / sentences : 0,
    longestSentenceWords: sentenceWordCounts.length ? Math.max(...sentenceWordCounts) : 0,
    readingSeconds: wordCount ? Math.ceil((wordCount / 200) * 60) : 0,
    speakingSeconds: wordCount ? Math.ceil((wordCount / 130) * 60) : 0,
    topWords,
  };
}

function formatDuration(totalSeconds: number, minLabel: string, secLabel: string): string {
  if (!totalSeconds) return `0 ${secLabel}`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (!m) return `${s} ${secLabel}`;
  return s ? `${m} ${minLabel} ${s} ${secLabel}` : `${m} ${minLabel}`;
}

export function WordCounterWorkspace({ selectedLanguage = "en", onSendToHumanizer }: WordCounterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const wc = (t as any).wordCounter || {};
  const locale = LOCALES[selectedLanguage] || "en";

  const [text, setText] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [selection, setSelection] = useState("");
  const [copied, setCopied] = useState<"text" | "stats" | null>(null);
  const [fileError, setFileError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => countStats(text, locale), [text, locale]);
  const selectionStats = useMemo(() => countStats(selection, locale), [selection, locale]);
  const goal = Math.max(0, parseInt(goalInput.replace(/[^0-9]/g, ""), 10) || 0);
  const goalPct = goal ? Math.min(100, (stats.words / goal) * 100) : 0;
  const goalRemaining = goal - stats.words;
  const isJa = selectedLanguage === "ja";

  const limits = [
    { name: "X / Twitter", max: 280 },
    { name: "SMS", max: 160 },
    { name: wc.metaLimit || "Meta description", max: 160 },
    { name: "Instagram", max: 2200 },
    { name: "LinkedIn", max: 3000 },
  ];

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
    `${wc.words || "Words"}: ${stats.words}`,
    `${wc.characters || "Characters"}: ${stats.characters}`,
    `${wc.charactersNoSpaces || "Characters (no spaces)"}: ${stats.charactersNoSpaces}`,
    `${wc.sentences || "Sentences"}: ${stats.sentences}`,
    `${wc.paragraphs || "Paragraphs"}: ${stats.paragraphs}`,
    `${wc.lines || "Lines"}: ${stats.lines}`,
    `${wc.uniqueWords || "Unique words"}: ${stats.uniqueWords}`,
    `${wc.readingTime || "Reading time"}: ${formatDuration(stats.readingSeconds, "min", "sec")}`,
    `${wc.speakingTime || "Speaking time"}: ${formatDuration(stats.speakingSeconds, "min", "sec")}`,
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
    a.download = "word-counter.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileError("");
    if (file.size > 5 * 1024 * 1024) {
      setFileError(wc.fileError || "That file is too large for this browser tool. Please paste the text instead.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result || ""));
    reader.onerror = () => setFileError(wc.fileError || "That file could not be read as text. Please paste the text instead.");
    reader.readAsText(file);
  };

  const updateSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    const selected = el.value.slice(el.selectionStart || 0, el.selectionEnd || 0);
    setSelection(selected);
  };

  const statCards = [
    { label: wc.words || "Words", value: stats.words, icon: Hash },
    { label: wc.characters || "Characters", value: stats.characters, icon: FileText },
    { label: wc.charactersNoSpaces || "Characters (no spaces)", value: stats.charactersNoSpaces, icon: FileText },
    { label: wc.sentences || "Sentences", value: stats.sentences, icon: ListOrdered },
    { label: wc.paragraphs || "Paragraphs", value: stats.paragraphs, icon: ClipboardList },
    { label: wc.lines || "Lines", value: stats.lines, icon: BarChart3 },
    { label: wc.uniqueWords || "Unique words", value: stats.uniqueWords, icon: Sparkles },
    { label: wc.avgWordLength || "Avg. word length", value: stats.avgWordLength ? stats.avgWordLength.toFixed(1) : "0", icon: Gauge },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="wordCounter" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-lime-100 via-emerald-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-lime-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(132,204,22,0.16),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-lime-100 text-lime-800 border border-lime-300 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-lime-600" />
              {wc.badge || "Word Counter"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {wc.title || "Count Words, Characters and Reading Time"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {wc.subtitle || "Paste or type your text and see the counts update live. Everything is calculated in your browser — your text is not uploaded or stored by us."}
          </p>
        </div>
      </div>

      <div className="bg-lime-50/70 border border-lime-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-lime-600 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-lime-950">{wc.quickAnswerTitle || "Quick Answer: What Does a Word Counter Count?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {wc.quickAnswer || "It counts the units editors and forms actually ask for: words, characters with and without spaces, sentences, paragraphs and the time a text takes to read or say aloud. Different tools can disagree slightly because hyphenated words, numbers, URLs, abbreviations, emoji and scripts without spaces are handled differently — the method matters as much as the number."}
            </p>
          </div>
        </div>
      </div>

      {isJa && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            {wc.jaNote || "Japanese usually does not separate words with spaces, so the character count is the reliable main number here. The word count is a rough guide for space-separated or mixed text."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-3 sm:p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-stone-500">
                <Icon className="w-3.5 h-3.5 text-lime-600" /> {card.label}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-lime-600 text-white text-xs font-bold hover:bg-lime-700 cursor-pointer">
              <Upload className="w-4 h-4" /> {wc.importBtn || "Open .txt file"}
            </button>
            <button onClick={() => { setText(SAMPLES[selectedLanguage]); setSelection(""); }} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
              {wc.sampleBtn || "Try sample"}
            </button>
            <button onClick={handleCopyText} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
              {copied === "text" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === "text" ? (wc.copied || "Copied!") : (wc.copyText || "Copy text")}
            </button>
            <button onClick={handleDownload} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
              <Download className="w-4 h-4" /> {wc.download || "Download .txt"}
            </button>
            <button onClick={() => { setText(""); setSelection(""); }} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
              <Eraser className="w-4 h-4" /> {wc.clear || "Clear"}
            </button>
            <input ref={fileRef} type="file" accept=".txt,.md,.csv,text/plain" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
          </div>
          {fileError && <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{fileError}</p>}
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide">{wc.editorLabel || "Your text"}</label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); setSelection(""); }}
            onSelect={updateSelection}
            onClick={updateSelection}
            onKeyUp={updateSelection}
            placeholder={wc.placeholder || "Paste or type your text here — the counts update as you write."}
            className="w-full h-72 sm:h-96 rounded-2xl border border-stone-300 p-4 text-sm sm:text-base leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-lime-500 resize-y"
          />
          <div className="flex flex-wrap gap-2 text-xs text-stone-600">
            <span className="px-2.5 py-1 rounded-full bg-lime-50 border border-lime-200 font-semibold">
              {wc.readingTime || "Reading time"}: {formatDuration(stats.readingSeconds, "min", "sec")}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-lime-50 border border-lime-200 font-semibold">
              {wc.speakingTime || "Speaking time"}: {formatDuration(stats.speakingSeconds, "min", "sec")}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200 font-semibold">
              {wc.avgSentence || "Avg. sentence"}: {stats.avgSentenceLength ? stats.avgSentenceLength.toFixed(1) : "0"} {wc.words || "words"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200 font-semibold">
              {wc.longestSentence || "Longest sentence"}: {stats.longestSentenceWords} {wc.words || "words"}
            </span>
          </div>
          {selection && (
            <p className="text-xs sm:text-sm text-lime-900 bg-lime-50 border border-lime-200 rounded-xl px-3 py-2">
              <strong>{wc.selectionLabel || "Selected text"}:</strong> {selectionStats.words} {wc.words || "words"} • {selectionStats.characters} {wc.characters || "characters"}
            </p>
          )}
          {onSendToHumanizer && text.trim() && (
            <button onClick={() => onSendToHumanizer(text)} className="text-xs font-bold text-lime-700 hover:text-lime-900 underline underline-offset-2 cursor-pointer">
              {wc.sendHumanizer || "Polish this text in the Humanizer"}
            </button>
          )}
          <a href={`/${selectedLanguage}/character-counter/`} className="block text-xs font-bold text-lime-700 hover:text-lime-900 underline underline-offset-2">
            {wc.charCounterLink || "Need exact characters and platform limits? Open the Character Counter →"}
          </a>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-lime-600" /> {wc.goalLabel || "Word goal"}
            </h3>
            <input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              inputMode="numeric"
              placeholder={wc.goalPlaceholder || "e.g. 1000"}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-lime-500"
            />
            {goal > 0 && (
              <div className="mt-3 space-y-2">
                <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-lime-500 rounded-full transition-all" style={{ width: `${goalPct}%` }} />
                </div>
                <p className="text-xs text-stone-600 font-semibold">
                  {stats.words} / {goal} {wc.words || "words"} ({Math.floor(goalPct)}%)
                  {goalRemaining > 0 ? ` — ${goalRemaining} ${wc.remainingWords || "words to go"}` : ` — ${wc.goalReached || "Goal reached"}`}
                </p>
              </div>
            )}
            <button onClick={handleCopyStats} disabled={!text.trim()} className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
              {copied === "stats" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied === "stats" ? (wc.copied || "Copied!") : (wc.copyStats || "Copy statistics")}
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5">
            <h3 className="font-bold text-stone-800 mb-1">{wc.limitsTitle || "Character limits (reference)"}</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed mb-3">{wc.limitsNote || "Reference only — each platform counts emoji, links and line breaks in its own way."}</p>
            <div className="space-y-2">
              {limits.map((limit) => {
                const ok = stats.characters <= limit.max;
                return (
                  <div key={limit.name} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-stone-700">{limit.name}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {stats.characters}/{limit.max}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5">
            <h3 className="font-bold text-stone-800 mb-3">{wc.topWords || "Most repeated words"}</h3>
            {stats.topWords.length ? (
              <div className="space-y-1.5">
                {stats.topWords.map((item) => (
                  <div key={item.word} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700 truncate max-w-[55%]">{item.word}</span>
                    <span className="text-stone-500">{item.count} × • {item.percent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500">{wc.topWordsEmpty || "Start typing to see repeated words here."}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-lime-600" /> {wc.methodTitle || "How this counter counts"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{wc.methodText || "Words are separated the way your language normally separates them. Characters are counted as visible characters, with and without spaces. Sentence counts look for full stops, question marks and exclamation marks, so abbreviations and decimal numbers can shift the result. That is why two honest counters can differ by a little — compare drafts with the same tool when the exact limit matters."}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-lime-600" /> {wc.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{wc.privacyNote || "Your text is counted locally in this browser tab. It is not uploaded, saved on a server, or shared by this tool. If you close the tab without copying or downloading, the text is gone — that is the honest trade-off of real privacy."}</p>
        </div>
      </div>

      <ToolGuideSection toolId="wordCounter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
