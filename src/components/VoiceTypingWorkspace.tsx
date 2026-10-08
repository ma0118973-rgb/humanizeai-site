import React, { useState, useRef, useEffect, useCallback } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Mic, MicOff, Copy, Check, Sparkles, Trash2, Download,
  Globe, AlertTriangle, ShieldCheck, ArrowRight, Keyboard,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface VoiceTypingWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

// Recognition language per site language (BCP-47)
const RECOGNITION_LANGS: { value: string; label: string }[] = [
  { value: "en-US", label: "English (US)" },
  { value: "ur-PK", label: "Urdu (Pakistan)" },
  { value: "es-ES", label: "Español" },
  { value: "de-DE", label: "Deutsch" },
  { value: "fr-FR", label: "Français" },
  { value: "tr-TR", label: "Türkçe" },
  { value: "pt-BR", label: "Português" },
  { value: "ja-JP", label: "日本語" },
  { value: "it-IT", label: "Italiano" },
  { value: "nl-NL", label: "Nederlands" },
  { value: "nb-NO", label: "Norsk" },
  { value: "hi-IN", label: "Hindi" },
  { value: "ar-SA", label: "العربية" },
];

const DEFAULT_RECOGNITION: Record<LanguageCode, string> = {
  en: "en-US", ur: "ur-PK", es: "es-ES", de: "de-DE", fr: "fr-FR",
  tr: "tr-TR", pt: "pt-BR", ja: "ja-JP", it: "it-IT", nl: "nl-NL", no: "nb-NO",
};

type RecogState = "idle" | "listening" | "error" | "unsupported";

export function VoiceTypingWorkspace({ selectedLanguage = "en", onSendToHumanizer }: VoiceTypingWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const vt = (t as any).voiceTyping || {};

  const [text, setText] = useState<string>("");
  const [interim, setInterim] = useState<string>("");
  const [recogLang, setRecogLang] = useState<string>(DEFAULT_RECOGNITION[selectedLanguage] || "en-US");
  const [state, setState] = useState<RecogState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const baseTextRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SpeechRecognitionCtor =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined;
  const supported = !!SpeechRecognitionCtor;

  useEffect(() => {
    setRecogLang(DEFAULT_RECOGNITION[selectedLanguage] || "en-US");
  }, [selectedLanguage]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* noop */ }
    recognitionRef.current = null;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setInterim("");
    if (state === "listening") setState("idle");
  }, [state]);

  const startListening = useCallback(() => {
    if (!supported) { setState("unsupported"); return; }
    setErrorMsg("");
    baseTextRef.current = text.trim();
    shouldListenRef.current = true;

    const rec = new SpeechRecognitionCtor();
    rec.lang = recogLang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = res[0]?.transcript || "";
        if (res.isFinal) finalChunk += transcript;
        else interimChunk += transcript;
      }
      if (finalChunk) {
        baseTextRef.current = (baseTextRef.current + " " + finalChunk).replace(/\s+/g, " ").trim();
        setText(baseTextRef.current);
      }
      setInterim(interimChunk);
    };

    rec.onerror = (event: any) => {
      const err = String(event?.error || "");
      if (err === "not-allowed" || err === "service-not-allowed") {
        setErrorMsg(vt.micDenied || "Microphone access was blocked. Please allow microphone permission in your browser and try again.");
        shouldListenRef.current = false;
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setState("error");
        setInterim("");
        return;
      }
      if (err === "aborted") return;
      // "no-speech" / "network" etc: onend handler restarts if still listening
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        // Chrome stops recognition on silence — restart to keep dictating
        try { rec.start(); } catch { /* already started */ }
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setState("listening");
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setErrorMsg(vt.micDenied || "Could not start the microphone. Please try again.");
      setState("error");
    }
  }, [supported, text, recogLang, vt]);

  const handleToggle = () => {
    if (state === "listening") stopListening();
    else startListening();
  };

  const handleCopy = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voice-typing.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    stopListening();
    baseTextRef.current = "";
    setText("");
    setInterim("");
    setSeconds(0);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const displayText = interim ? `${text}${text ? " " : ""}${interim}` : text;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="voiceTyping" selectedLanguage={selectedLanguage} />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-teal-100 via-teal-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-teal-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-teal-600" />
              {vt.badge || "Voice Typing"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {vt.title || "Speak, and Your Words Become Text"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {vt.subtitle || "Press the microphone and talk — in Urdu, English, or 11 other languages. Your speech turns into text you can copy, download, or polish with our humanizer. No app to install, nothing saved on our side."}
          </p>
        </div>
      </div>

      {/* Quick Answer Capsule */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-600 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-teal-950">
              {vt.quickAnswerTitle || "Quick Answer: How Does Voice Typing Work?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {vt.quickAnswer || "Your browser listens through the microphone and matches your speech to words in the language you pick. In Chrome, that matching is done by Google's speech service; this website never receives or stores your audio. Accuracy is best in a quiet room at a natural pace — and, like any dictation, the text deserves a quick proofread."}
            </p>
          </div>
        </div>
      </div>

      {!supported && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-amber-900">
              {vt.unsupportedTitle || "This browser cannot listen yet"}
            </h2>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed mt-1">
              {vt.unsupportedText || "Voice typing needs a browser with speech recognition — Google Chrome or Microsoft Edge work best. You can still type or paste text in the box below and use the copy tools."}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wide">
            <Globe className="w-4 h-4 text-teal-600" />
            {vt.langLabel || "Speaking language"}
          </label>
          <select
            value={recogLang}
            onChange={(e) => setRecogLang(e.target.value)}
            disabled={state === "listening"}
            className="px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold text-stone-800 bg-white focus:outline-none focus:border-teal-500 disabled:opacity-60"
          >
            {RECOGNITION_LANGS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>

          <button
            onClick={handleToggle}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm sm:text-base font-bold transition-all cursor-pointer shadow-md ${
              state === "listening"
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
          >
            {state === "listening" ? (
              <><MicOff className="w-5 h-5" /> {vt.stopBtn || "Stop"}</>
            ) : (
              <><Mic className="w-5 h-5" /> {vt.startBtn || "Start Speaking"}</>
            )}
          </button>

          <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
            <span className={`inline-flex items-center gap-1.5 ${state === "listening" ? "text-red-600 font-bold" : ""}`}>
              <span className={`w-2 h-2 rounded-full ${state === "listening" ? "bg-red-500 animate-ping" : "bg-stone-300"}`} />
              {state === "listening" ? (vt.listening || "Listening…") : (vt.ready || "Ready")}
            </span>
            <span>{mm}:{ss}</span>
          </div>
        </div>

        {state === "error" && errorMsg && (
          <p className="mt-3 text-xs sm:text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {errorMsg}
          </p>
        )}

        <p className="mt-3 text-xs text-stone-500 leading-relaxed flex items-start gap-1.5">
          <Keyboard className="w-3.5 h-3.5 mt-0.5 shrink-0 text-stone-400" />
          {vt.hintText || "Tip: speak at a natural pace and say punctuation out loud — “full stop”, “comma”, “new line”. Short sentences come out cleaner than long ones."}
        </p>
      </div>

      {/* Transcript */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-stone-800 flex items-center gap-2">
            <Mic className="w-4 h-4 text-teal-600" />
            {vt.outputLabel || "Your Text"}
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {wordCount} {vt.words || "words"} • {charCount} {vt.chars || "characters"}
          </span>
        </div>
        <textarea
          value={displayText}
          onChange={(e) => { setText(e.target.value); baseTextRef.current = e.target.value; setInterim(""); }}
          placeholder={vt.placeholder || "Press Start Speaking and talk — your words will appear here. You can also type or paste text."}
          className="w-full h-64 sm:h-72 p-5 text-sm sm:text-base text-stone-800 placeholder-stone-400 focus:outline-none resize-none leading-relaxed"
        />
        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50 flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? (vt.copied || "Copied!") : (vt.copy || "Copy Text")}
          </button>
          <button
            onClick={handleDownload}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-teal-400 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {vt.download || "Download .txt"}
          </button>
          <button
            onClick={handleClear}
            disabled={!text.trim() && !interim}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-red-300 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {vt.clear || "Clear"}
          </button>
          {onSendToHumanizer && (
            <button
              onClick={() => text.trim() && onSendToHumanizer(text)}
              disabled={!text.trim()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 ml-auto"
            >
              {vt.sendHumanizer || "Polish in Humanizer"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="px-5 py-3 border-t border-stone-100 flex items-start gap-2 text-[11px] text-stone-500 leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-teal-600" />
          {vt.privacyNote || "Private by design: this page stores nothing. In Chrome and Edge, your voice is converted by the browser maker's speech service; the text stays in this tab until you copy it."}
        </div>
      </div>

      <ToolGuideSection toolId="voiceTyping" selectedLanguage={selectedLanguage} />
    </div>
  );
}
