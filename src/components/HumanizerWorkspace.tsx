import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Download,
  ShieldCheck,
  Zap,
  ArrowRight,
  AlertCircle,
  Globe,
  Upload,
  FileText,
  Clock,
  Mic,
  Columns,
  List,
  Clipboard,
  RotateCcw,
  Trash2,
  ChevronRight,
  Smartphone,
  Eye,
} from "lucide-react";
import { HumanizeResult, ToneType, BypassLevel, LanguageCode, SavedDraft } from "../types";
import { SAMPLE_TEXTS } from "../data/samples";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "../data/translations";
import { AdSenseSlot } from "./AdSenseSlot";
import { ReadabilityDashboard } from "./ReadabilityDashboard";
import { DiffHighlighter } from "./DiffHighlighter";
import { CleverFeaturesGuide } from "./CleverFeaturesGuide";
import { runLocalHumanize } from "../utils/localEngines";
import { humanizeWithFallback } from "../utils/aiHumanize";

interface HumanizerWorkspaceProps {
  initialText?: string;
  onSendToDetector: (text: string) => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onDraftSaved?: () => void;
}

export function HumanizerWorkspace({
  initialText = "",
  onSendToDetector,
  selectedLanguage,
  onLanguageChange,
  onDraftSaved,
}: HumanizerWorkspaceProps) {
  const [inputText, setInputText] = useState(initialText || SAMPLE_TEXTS[0].text);
  const [tone, setTone] = useState<ToneType>("conversational");
  const [level, setLevel] = useState<BypassLevel>("stealth");
  const [purpose, setPurpose] = useState("general");

  // Mobile layout state: "input" | "output"
  const [mobileTab, setMobileTab] = useState<"input" | "output">("input");
  const [mobileViewStyle, setMobileViewStyle] = useState<"tabs" | "stacked">("tabs");

  // Sync if text is transferred from Detector
  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      setResult(null);
      setMobileTab("input");
    }
  }, [initialText]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [engineUsed, setEngineUsed] = useState<"ai" | "local" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [viewMode, setViewMode] = useState<"standard" | "diff">("standard");
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const STAGES = t.humanizer.stages;

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError("Please paste or type text to humanize.");
      return;
    }

    // Cancel any prior in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setLoadingStage(0);
    setProgressPercent(20);

    // On mobile, switch to output tab during/after processing so user sees feedback
    setMobileTab("output");

    // Progressive stage animation
    const stageTimer = setInterval(() => {
      setLoadingStage((prev) => {
        const next = Math.min(prev + 1, STAGES.length - 1);
        setProgressPercent(25 + next * 24);
        return next;
      });
    }, 1100);

    // 25-second timeout safety valve
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 25000);

    try {
      clearTimeout(timeoutId);
      clearInterval(stageTimer);

      // Try AI enhancement first (Netlify Function + Gemini); falls back to
      // the local engine automatically when the API key is missing, the quota
      // is exhausted, or the request fails for any reason.
      const { result: payloadData, engine } = await humanizeWithFallback(
        inputText,
        tone,
        level,
        selectedLanguage,
        controller.signal
      );
      setEngineUsed(engine);

      setProgressPercent(100);
      setResult(payloadData);
      setMobileTab("output");

      // Auto-scroll to output on mobile screens
      setTimeout(() => {
        const outEl = document.getElementById("humanizer-output-pane");
        if (outEl && window.innerWidth < 1024) {
          outEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);

      // Auto-save to localStorage Draft History
      try {
        const raw = localStorage.getItem("clever_drafts");
        const existing: SavedDraft[] = raw ? JSON.parse(raw) : [];
        const newDraft: SavedDraft = {
          id: "draft-" + Date.now(),
          timestamp: Date.now(),
          originalText: inputText,
          humanizedText: payloadData.humanizedText,
          tone: tone,
          originalWordCount: inputText.trim().split(/\s+/).filter(Boolean).length,
          humanizedWordCount: payloadData.humanizedText.trim().split(/\s+/).filter(Boolean).length,
        };
        const updated = [newDraft, ...existing.slice(0, 29)];
        localStorage.setItem("clever_drafts", JSON.stringify(updated));
        onDraftSaved?.();
      } catch (e) {
        console.error("Failed to save draft locally", e);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      clearInterval(stageTimer);
      console.warn("API request failed or unavailable, running client-side humanizer engine:", err);
      const localData = runLocalHumanize(inputText, tone, level, selectedLanguage);
      setEngineUsed("local");
      setProgressPercent(100);
      setResult(localData);
      setMobileTab("output");

      try {
        const raw = localStorage.getItem("clever_drafts");
        const existing: SavedDraft[] = raw ? JSON.parse(raw) : [];
        const newDraft: SavedDraft = {
          id: "draft-" + Date.now(),
          timestamp: Date.now(),
          originalText: inputText,
          humanizedText: localData.humanizedText,
          tone: tone,
          originalWordCount: inputText.trim().split(/\s+/).filter(Boolean).length,
          humanizedWordCount: localData.humanizedText.trim().split(/\s+/).filter(Boolean).length,
        };
        const updated = [newDraft, ...existing.slice(0, 29)];
        localStorage.setItem("clever_drafts", JSON.stringify(updated));
        onDraftSaved?.();
      } catch (e) {
        console.error("Failed to save draft locally", e);
      }
    } finally {
      clearInterval(stageTimer);
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          setInputText(clipText);
          setMobileTab("input");
          setError(null);
          return;
        }
      }
    } catch {
      // Browser permission block in sandbox iframe
    }
    setError("Please paste your text directly into the input area (Ctrl+V or tap & hold on mobile).");
    const el = document.getElementById("input-text-humanizer");
    if (el) el.focus();
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
    setError(null);
    setMobileTab("input");
  };

  const handleCopy = () => {
    if (!result?.humanizedText) return;
    const cleanText = result.humanizedText
      .replace(/\\n\\n/g, "\n\n")
      .replace(/\\n/g, "\n");
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.humanizedText) return;
    const cleanText = result.humanizedText
      .replace(/\\n\\n/g, "\n\n")
      .replace(/\\n/g, "\n");
    const blob = new Blob([cleanText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `humanized-text-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = () => {
    if (!result?.humanizedText) return;
    const cleanText = result.humanizedText
      .replace(/\\n\\n/g, "\n\n")
      .replace(/\\n/g, "\n");

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Humanized Document</title>
        <style>
          body { font-family: 'Calibri', sans-serif; font-size: 11pt; line-height: 1.5; color: #111; margin: 1in; }
          p { margin-bottom: 12pt; }
          .header-meta { color: #666; font-size: 9pt; border-bottom: 1px solid #ddd; padding-bottom: 8pt; margin-bottom: 18pt; }
        </style>
      </head>
      <body>
        <div class="header-meta">
          <strong>Humanized Document</strong> | Date: ${new Date().toLocaleDateString()}
        </div>
        ${cleanText.split(/\n\s*\n/).map((p) => `<p>${p.trim()}</p>`).join("")}
      </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", docHtml], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `humanized-document-${Date.now()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File is too large. Please upload documents under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setMobileTab("input");
        setError(null);
      }
    };
    reader.onerror = () => {
      setError("Could not read uploaded file. Please ensure it is a valid text or markdown document.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!result?.humanizedText) return;

    window.speechSynthesis.cancel();
    const cleanText = result.humanizedText
      .replace(/\\n\\n/g, " ")
      .replace(/\\n/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const formattedParagraphs = result?.humanizedText
    ? result.humanizedText
        .replace(/\\n\\n/g, "\n\n")
        .replace(/\\n/g, "\n")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const MODES: { id: ToneType; label: string; icon: string; desc: string }[] = [
    { id: "conversational", label: "Casual", icon: "💬", desc: "Natural conversational rhythm, highest burstiness & variation" },
    { id: "academic", label: "Academic", icon: "🎓", desc: "Scholarly prose, citations & research essay structure" },
    { id: "professional", label: "Simple Formal", icon: "💼", desc: "Executive business tone, polished reports & cover letters" },
    { id: "creative", label: "Creative", icon: "🎨", desc: "Vivid storytelling, engaging blog cadence & punchy metaphors" },
    { id: "balanced", label: "Standard", icon: "⚡", desc: "Well-rounded natural human voice suitable for everyday writing" },
  ];

  const maxWords = 3000;
  const wordPercent = Math.min(100, Math.round((wordCount / maxWords) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 overflow-hidden">
      {/* Visual Onboarding Header: Crystal-clear understanding for new users */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4 w-full max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {t.humanizer.badge}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
              {t.humanizer.heroTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              {t.humanizer.heroSubtitle}
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2 self-stretch md:self-auto bg-stone-50 border border-stone-200 p-2 rounded-2xl shrink-0">
            <Globe className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
            <select
              aria-label="Target language"
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="text-xs font-bold bg-transparent text-stone-800 outline-none cursor-pointer pr-2"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label} ({lang.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3-Step Clear Visual Flow for New Users */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-stone-100 text-center">
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100 flex flex-col items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-800 text-xs font-black flex items-center justify-center mb-1">
              1
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800">Paste AI Text</span>
            <span className="text-[10px] text-stone-500 hidden sm:inline">From ChatGPT or Gemini</span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-100 flex flex-col items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-800 text-xs font-black flex items-center justify-center mb-1">
              2
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-stone-800">Pick Tone & Click</span>
            <span className="text-[10px] text-stone-500 hidden sm:inline">100% Free & Unlimited</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200 flex flex-col items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center mb-1">
              3
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-900">Get Human Result</span>
            <span className="text-[10px] text-emerald-700 hidden sm:inline">Review & copy your result</span>
          </div>
        </div>
      </div>

      {/* Writing Style Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            Writing Style Mode:
          </span>
          <span className="text-xs text-stone-500 hidden sm:inline">
            {MODES.find((m) => m.id === tone)?.desc}
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200 w-full max-w-full overflow-hidden">
          {MODES.map((mode) => {
            const isActive = tone === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTone(mode.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-emerald-800 shadow-sm border border-stone-200 scale-[1.01]"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile-Friendly Tab Switcher (Visible on small screens) */}
      <div className="lg:hidden flex items-center justify-between gap-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
        <button
          type="button"
          onClick={() => setMobileTab("input")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            mobileTab === "input"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <Clipboard className="w-4 h-4 text-emerald-600" />
          <span>1. Input AI Text ({wordCount}w)</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("output")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            mobileTab === "output"
              ? "bg-white text-emerald-800 shadow-sm"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>2. Human Result</span>
          {result && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        {/* Toggle stacked vs tabs on mobile */}
        <button
          type="button"
          onClick={() => setMobileViewStyle(mobileViewStyle === "tabs" ? "stacked" : "tabs")}
          className="p-2 rounded-xl text-stone-500 hover:bg-white transition-colors"
          title={mobileViewStyle === "tabs" ? "Switch to Stacked View" : "Switch to Tabs View"}
        >
          {mobileViewStyle === "tabs" ? <List className="w-4 h-4" /> : <Columns className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Two-Column Humanizer Interface (Desktop: side-by-side, Mobile: responsive tabs or stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* Pane 1: AI Input Text */}
        <div
          id="humanizer-input-pane"
          className={`bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col overflow-hidden transition-all w-full max-w-full min-w-0 ${
            mobileViewStyle === "tabs" && mobileTab !== "input" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header & Quick Action Toolbar */}
          <div className="p-3.5 sm:p-4 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-800 text-sm">Your AI Text</span>
              <span className="text-xs text-stone-500 font-mono font-bold">
                ({wordCount} words)
              </span>
            </div>

            {/* Actions: Paste, Sample, Upload, Clear */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {/* Paste Button */}
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>

              {/* Sample Demo Dropdown / Load Button */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setInputText(SAMPLE_TEXTS[0].text)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold border border-stone-200 transition-colors shadow-2xs cursor-pointer"
                  title="Load sample AI text to test instantly"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Sample</span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-stone-200 rounded-2xl shadow-xl p-1.5 hidden group-hover:block z-30">
                  <div className="px-2 py-1 text-[10px] font-extrabold uppercase text-stone-400 tracking-wider">
                    Select Sample
                  </div>
                  {SAMPLE_TEXTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => setInputText(sample.text)}
                      className="w-full text-left px-2.5 py-2 text-xs text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-colors truncate font-medium"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.doc,.docx,.md"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-semibold border border-stone-200 transition-colors shadow-2xs cursor-pointer"
                title="Upload document"
              >
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Upload</span>
              </button>

              {/* Clear Button */}
              {inputText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="p-3.5 sm:p-4 space-y-3">
            <textarea
              id="input-text-humanizer"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.humanizer.inputPlaceholder}
              className="w-full h-64 sm:h-72 p-3.5 text-sm text-stone-900 placeholder-stone-400 bg-stone-50/50 border border-stone-200 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none leading-relaxed font-sans"
            />

            {/* Word Allowance & Time Metrics */}
            <div className="space-y-1.5 pt-1 border-t border-stone-100">
              <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <strong className="text-stone-800">{wordCount}</strong> / {maxWords} words
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {(wordCount / 200).toFixed(1)}m read
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-stone-400" />
                    {(wordCount / 130).toFixed(1)}m speech
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    wordPercent > 90 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(2, wordPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls Bar & Submit Button */}
          <div className="p-3.5 sm:p-4 bg-stone-50/90 border-t border-stone-100 space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              {/* Bypass Level */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-600 mb-1">
                  Bypass Level
                </label>
                <select
                  id="select-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as BypassLevel)}
                  className="w-full text-xs font-bold bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="standard">Standard Humanize</option>
                  <option value="stealth">Stealth (Maximum Rewriting)</option>
                  <option value="ultra-stealth">Ultra Stealth (Highest)</option>
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-600 mb-1">
                  Content Type
                </label>
                <select
                  id="select-purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-stone-800 outline-none focus:border-emerald-500 shadow-2xs"
                >
                  <option value="general">General Essay / Article</option>
                  <option value="academic">Academic Paper</option>
                  <option value="blog">SEO Blog & Web Copy</option>
                  <option value="email">Email / Memo</option>
                  <option value="cover_letter">Cover Letter / Resume</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Button: Big, Vibrant, High-Converting */}
            <button
              id="btn-humanize-submit"
              onClick={handleHumanize}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.humanizer.processingBtn}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
                  <span>{t.humanizer.humanizeBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pane 2: Humanized Output Result */}
        <div
          id="humanizer-output-pane"
          className={`bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col overflow-hidden transition-all w-full max-w-full min-w-0 ${
            mobileViewStyle === "tabs" && mobileTab !== "output" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-extrabold text-stone-800 text-sm">{t.humanizer.outputTitle}</span>
              {result && (
                <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Humanized
                </span>
              )}
              {result && engineUsed && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    engineUsed === "ai"
                      ? "bg-sky-100 text-sky-800"
                      : "bg-stone-200 text-stone-700"
                  }`}
                  title={
                    engineUsed === "ai"
                      ? "Rewritten with AI assistance"
                      : "AI unavailable — rewritten with the built-in offline engine"
                  }
                >
                  {engineUsed === "ai" ? "AI-enhanced" : "Offline mode"}
                </span>
              )}
            </div>

            {/* Right toolbar controls when result is available */}
            {result && (
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                {/* Diff View Toggle */}
                <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("standard")}
                    className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                      viewMode === "standard"
                        ? "bg-white text-emerald-800 shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <List className="w-3 h-3" />
                    <span>Clean</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("diff")}
                    className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
                      viewMode === "diff"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                    title="Compare changed words"
                  >
                    <Columns className="w-3 h-3" />
                    <span>Diff</span>
                  </button>
                </div>

                {/* Speech audio */}
                <button
                  id="btn-toggle-speech"
                  onClick={handleToggleSpeech}
                  title="Listen to humanized audio"
                  className={`p-1.5 rounded-xl text-xs transition-all ${
                    isSpeaking
                      ? "bg-emerald-100 text-emerald-700 font-semibold"
                      : "text-stone-600 hover:bg-stone-200/70 hover:text-stone-900"
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Word .doc download */}
                <button
                  id="btn-download-docx"
                  onClick={handleDownloadDocx}
                  title="Download Microsoft Word (.doc)"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Word</span>
                </button>

                {/* Copy button */}
                <button
                  id="btn-copy-output"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-h-[320px]">
            {error && !isLoading && !result && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="font-bold text-stone-900 text-sm">Processing Interrupted</h3>
                  <p className="text-xs text-rose-600 leading-relaxed bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {error}
                  </p>
                </div>
                <button
                  onClick={handleHumanize}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
                >
                  Click Here to Retry
                </button>
              </div>
            )}

            {!result && !isLoading && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-400">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-extrabold text-stone-900 text-base">Ready to Humanize</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Paste your AI text on the left, pick your preferred style, and tap <strong>"Humanize AI Now"</strong>.
                  </p>
                </div>

                {/* Quick 1-tap Sample Button for instant mobile test */}
                <button
                  type="button"
                  onClick={() => {
                    setInputText(SAMPLE_TEXTS[0].text);
                    setMobileTab("input");
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Load Sample AI Text to Test</span>
                </button>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="space-y-2 max-w-sm w-full">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800 px-1">
                    <span>{STAGES[loadingStage]?.title || "Processing..."}</span>
                    <span className="font-mono text-emerald-600">{progressPercent}%</span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="text-xs text-stone-500 pt-1">
                    {STAGES[loadingStage]?.desc || "Refining sentences with authentic human touch..."}
                  </p>
                </div>
              </div>
            )}

            {/* Output Rendering */}
            {result && !isLoading && (
              <div className="space-y-4">
                {viewMode === "diff" ? (
                  <DiffHighlighter
                    originalText={inputText}
                    humanizedText={result.humanizedText}
                  />
                ) : (
                  <div className="text-stone-800 text-sm sm:text-base leading-relaxed font-sans select-text">
                    {formattedParagraphs.map((paragraph, idx) => (
                      <p key={idx} className="mb-4 last:mb-0 leading-relaxed text-stone-800">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {/* Mobile back to edit + Send to detector */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileTab("input")}
                      className="lg:hidden text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 px-3 py-1.5 rounded-xl"
                    >
                      ← Edit Input
                    </button>
                    <button
                      onClick={() => onSendToDetector(result.humanizedText)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 group bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all shadow-2xs"
                    >
                      <span>Verify in Live AI Detector</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                    <span>
                      Original: <strong>{result.wordCountOriginal || wordCount}</strong>w
                    </span>
                    <span>➔</span>
                    <span className="text-emerald-700 font-bold">
                      Humanized: <strong>{result.wordCountHumanized || result.humanizedText.split(/\s+/).length}</strong>w
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scores Panel */}
          {result && (
            <div className="p-3.5 sm:p-4 bg-stone-50 border-t border-stone-100 grid grid-cols-1 gap-2 text-center text-xs">
              <div className="p-2.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
                <div className="text-stone-500 text-[10px] uppercase font-extrabold">Readability</div>
                <div className="font-extrabold text-stone-900 text-xs mt-0.5 truncate">
                  {result.readabilityGrade}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Programmatic AdSense In-Content Placement */}
      <AdSenseSlot type="in-content" />

      {/* 3-Step "How Clever Humanizer Works" & Comparison Matrix */}
      <CleverFeaturesGuide />

      {/* Bonus Micro-Tool: Live AI Plagiarism & Readability Score Dashboard */}
      <ReadabilityDashboard
        initialText={result?.humanizedText || inputText}
        onSendToHumanizer={(txt) => {
          setInputText(txt);
          setMobileTab("input");
          window.scrollTo({ top: 100, behavior: "smooth" });
        }}
      />
    </div>
  );
}
