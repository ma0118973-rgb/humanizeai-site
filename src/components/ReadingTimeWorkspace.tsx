import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  BookOpen, Check, Copy, Eraser, Gauge, Info, Mic, ShieldCheck, Timer, Upload,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface ReadingTimeWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb",
};

function countWords(text: string, locale: string): number {
  if (!text.trim()) return 0;
  try {
    const Segmenter = (Intl as any).Segmenter;
    if (Segmenter) {
      const segmenter = new Segmenter(locale, { granularity: "word" });
      let count = 0;
      for (const part of segmenter.segment(text)) if (part.isWordLike) count++;
      return count;
    }
  } catch {
    // Fall through to the regex counter.
  }
  const matches = text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
  return matches ? matches.length : 0;
}

function formatSeconds(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return "0:00";
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function friendlySeconds(totalSeconds: number, aboutPrefix: string): string {
  if (!isFinite(totalSeconds) || totalSeconds <= 0) return `${aboutPrefix} 0 sec`;
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} h`);
  if (m > 0) parts.push(`${m} min`);
  if (s > 0 || parts.length === 0) parts.push(`${s} sec`);
  return `${aboutPrefix} ${parts.join(" ")}`;
}

export function ReadingTimeWorkspace({ selectedLanguage = "en" }: ReadingTimeWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const rt = (t as any).readingTime || {};
  const locale = LOCALES[selectedLanguage] || "en";

  const startsSpeaking = typeof window !== "undefined" && window.location.pathname.includes("speaking");
  const [mode, setMode] = useState<"reading" | "speaking">(startsSpeaking ? "speaking" : "reading");
  const [text, setText] = useState("");
  const [readingWpm, setReadingWpm] = useState(200);
  const [speakingWpm, setSpeakingWpm] = useState(140);
  const [pausePercent, setPausePercent] = useState(15);
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const stats = useMemo(() => {
    const words = countWords(text, locale);
    const chars = Array.from(text).length;
    const readingSeconds = words > 0 ? (words / readingWpm) * 60 : 0;
    const speakingBase = words > 0 ? (words / speakingWpm) * 60 : 0;
    const speakingSeconds = speakingBase * (1 + pausePercent / 100);
    return { words, chars, readingSeconds, speakingSeconds };
  }, [text, locale, readingWpm, speakingWpm, pausePercent]);

  const activeSeconds = mode === "reading" ? stats.readingSeconds : stats.speakingSeconds;
  const otherSeconds = mode === "reading" ? stats.speakingSeconds : stats.readingSeconds;
  const activeWpm = mode === "reading" ? readingWpm : speakingWpm;

  const resultText = `${mode === "reading" ? (rt.modeReading || "Silent reading") : (rt.modeSpeaking || "Speaking aloud")}: ${friendlySeconds(activeSeconds, rt.aboutPrefix || "about")} (${formatSeconds(activeSeconds)}) — ${stats.words} ${rt.wordsLabel || "Words"} · ${activeWpm} ${rt.wpmUnit || "words per minute"}${mode === "speaking" ? ` · +${pausePercent}%` : ""}`;

  const handleCopyResult = async () => {
    if (!stats.words) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileError("");
    if (file.size > 5 * 1024 * 1024) {
      setFileError(rt.fileError || "That file could not be read as text. Please paste the text instead.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setText(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => setFileError(rt.fileError || "That file could not be read as text. Please paste the text instead.");
    reader.readAsText(file);
  };

  const referenceRows = [100, 250, 500, 1000, 2000].map((w) => ({
    words: w,
    reading: (w / readingWpm) * 60,
    speaking: (w / speakingWpm) * 60 * (1 + pausePercent / 100),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="readingTime" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -z-0 opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-600 text-white self-start shadow-sm">
            <Timer className="w-3.5 h-3.5" /> {rt.badge || "Reading & Speaking Time"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {rt.pageTitle || "How Long Does Your Text Take to Read or Say?"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {rt.subtitle || "Paste your text and get an honest time estimate for silent reading and for speaking aloud — with speeds you can adjust, because no two readers are the same."}
          </p>
        </div>
      </div>

      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-600 text-white rounded-xl shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-teal-950">{rt.quickAnswerTitle || "Quick answer"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rt.quickAnswer}</p>
          </div>
        </div>
      </div>

      {startsSpeaking && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{rt.speakingNote}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setText(rt.sampleText || ""); setFileError(""); }} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {rt.sampleBtn || "Try sample text"}
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            <Upload className="w-4 h-4" /> {rt.uploadBtn || "Open .txt file"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,text/plain"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button onClick={handleCopyResult} disabled={!stats.words} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (rt.copied || "Copied!") : (rt.copyBtn || "Copy result")}
          </button>
          <button onClick={() => { setText(""); setFileError(""); }} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {rt.clearBtn || "Clear"}
          </button>
        </div>

        {fileError && (
          <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">{fileError}</p>
        )}

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="reading-time-input">
            {rt.inputLabel || "Your text"}
          </label>
          <textarea
            id="reading-time-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={rt.placeholder || "Paste or type your text here — the time estimate updates as you write."}
            className="w-full h-56 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-teal-500 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-3" aria-live="polite">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{rt.wordsLabel || "Words"}</div>
            <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{stats.words.toLocaleString(locale)}</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{rt.charsLabel || "Characters"}</div>
            <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{stats.chars.toLocaleString(locale)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-5">
        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{rt.modeTitle || "Choose a mode"}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode("reading")} className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "reading" ? "bg-teal-600 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
              <BookOpen className="w-4 h-4" /> {rt.modeReading || "Silent reading"}
            </button>
            <button onClick={() => setMode("speaking")} className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "speaking" ? "bg-teal-600 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
              <Mic className="w-4 h-4" /> {rt.modeSpeaking || "Speaking aloud"}
            </button>
          </div>
        </div>

        {mode === "reading" ? (
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide" htmlFor="reading-wpm">
                {rt.readingWpmLabel || "Reading speed"}
              </label>
              <span className="text-sm font-extrabold text-teal-700">{readingWpm} {rt.wpmUnit || "words per minute"}</span>
            </div>
            <input id="reading-wpm" type="range" min={80} max={400} step={5} value={readingWpm} onChange={(e) => setReadingWpm(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
            <p className="text-[11px] text-stone-500 leading-relaxed mt-1.5">{rt.readingHint}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide" htmlFor="speaking-wpm">
                  {rt.speakingWpmLabel || "Speaking speed"}
                </label>
                <span className="text-sm font-extrabold text-teal-700">{speakingWpm} {rt.wpmUnit || "words per minute"}</span>
              </div>
              <input id="speaking-wpm" type="range" min={80} max={250} step={5} value={speakingWpm} onChange={(e) => setSpeakingWpm(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
              <p className="text-[11px] text-stone-500 leading-relaxed mt-1.5">{rt.speakingHint}</p>
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-3 mb-1.5">
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide" htmlFor="pause-allowance">
                  {rt.pauseLabel || "Add pause allowance"}
                </label>
                <span className="text-sm font-extrabold text-teal-700">+{pausePercent}%</span>
              </div>
              <input id="pause-allowance" type="range" min={0} max={50} step={5} value={pausePercent} onChange={(e) => setPausePercent(Number(e.target.value))} className="w-full accent-teal-600 cursor-pointer" />
              <p className="text-[11px] text-stone-500 leading-relaxed mt-1.5">{rt.pauseHint}</p>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-teal-200 bg-teal-50/70 p-5 text-center" aria-live="polite">
          <div className="text-[11px] font-bold uppercase tracking-wide text-teal-800">{rt.resultTitle || "Your estimate"}</div>
          {stats.words > 0 ? (
            <>
              <div className="text-5xl font-extrabold text-stone-900 mt-2 tabular-nums">{formatSeconds(activeSeconds)}</div>
              <div className="text-sm text-stone-600 mt-1">{friendlySeconds(activeSeconds, rt.aboutPrefix || "about")}</div>
              <div className="text-xs text-stone-500 mt-2">
                {rt.otherModeLabel || "The other mode would take"}: <strong className="text-stone-800">{friendlySeconds(otherSeconds, rt.aboutPrefix || "about")}</strong>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-500 mt-2">{rt.resultEmpty || "Add some text above and your time estimate will appear here."}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-5">
        <h2 className="text-lg font-extrabold text-stone-900 mb-3">{rt.per100Title || "Quick reference at your current speeds"}</h2>
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-sm min-w-[420px]">
            <thead className="bg-teal-50 text-teal-950">
              <tr>
                <th className="text-left font-extrabold px-4 py-3">{rt.per100ColWords || "Words"}</th>
                <th className="text-right font-extrabold px-4 py-3">{rt.modeReading || "Silent reading"}</th>
                <th className="text-right font-extrabold px-4 py-3">{rt.modeSpeaking || "Speaking aloud"}</th>
              </tr>
            </thead>
            <tbody>
              {referenceRows.map((row) => (
                <tr key={row.words} className="border-t border-stone-100">
                  <td className="px-4 py-2.5 font-bold text-stone-800">{row.words.toLocaleString(locale)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-stone-700">{formatSeconds(row.reading)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-stone-700">{formatSeconds(row.speaking)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Gauge className="w-4 h-4 text-teal-600" /> {rt.methodTitle || "How the estimate works"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rt.methodText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-teal-600" /> {rt.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rt.privacyNote}</p>
        </div>
        <div className="bg-teal-50/70 border border-teal-200/80 rounded-3xl p-5">
          <h3 className="font-bold text-teal-950 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-teal-600" /> {rt.honestTitle || "An estimate, not a stopwatch"}</h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rt.honestText}</p>
        </div>
      </div>

      <a href={`/${selectedLanguage}/word-counter/`} className="inline-block text-xs font-bold text-teal-700 hover:text-teal-900 underline underline-offset-2">
        {rt.wordCounterLink || "Need sentences, reading level or repeated words too? Try the Word Counter."}
      </a>

      <ToolGuideSection toolId="readingTime" selectedLanguage={selectedLanguage} />
    </div>
  );
}
