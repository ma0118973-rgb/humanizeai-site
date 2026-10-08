import React, { useState } from "react";
import { Maximize2, Copy, Check, Sparkles, RefreshCw, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import { expandAcademicSentence } from "../utils/localEngines";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface SentenceExpanderWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

export function SentenceExpanderWorkspace({
  selectedLanguage = "en",
  onSendToHumanizer,
}: SentenceExpanderWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const [inputText, setInputText] = useState<string>(
    "Artificial intelligence improves diagnostic accuracy in radiology. Doctors can detect anomalies earlier. This leads to better patient outcomes."
  );
  const [depth, setDepth] = useState<"moderate" | "extensive" | "scholarly">("extensive");
  const [isCopied, setIsCopied] = useState(false);

  const result = expandAcademicSentence(inputText, depth, selectedLanguage);

  const handleCopy = () => {
    if (!result.expandedText) return;
    navigator.clipboard.writeText(result.expandedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSample = (sample: string) => {
    setInputText(sample);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 overflow-hidden">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-4 sm:p-8 text-white shadow-xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              Academic Sentence Expander & Depth Enhancer
            </span>
            <span className="text-xs text-stone-400 font-mono">100% Client-Side • Zero Word Limits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Expand Short Sentences Into In-Depth Academic Prose
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
            Lengthen concise thoughts and robotic bullet points into rigorous, scholarly paragraphs with high perplexity, causal elaboration, and organic sentence burstiness.
          </p>
        </div>

        {/* Quick Samples */}
        <div className="flex items-center gap-2 flex-wrap relative z-10">
          <button
            onClick={() =>
              handleSample(
                "Social media algorithms polarize public opinion. Users consume echo chamber content. Society becomes divided."
              )
            }
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800/80 text-stone-300 border border-stone-700 hover:bg-stone-700 transition-all cursor-pointer"
          >
            Sample: Media
          </button>
          <button
            onClick={() =>
              handleSample(
                "Renewable energy reduces carbon emissions. Wind and solar power are cheaper now. Governments must invest in grid infrastructure."
              )
            }
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-800/80 text-stone-300 border border-stone-700 hover:bg-stone-700 transition-all cursor-pointer"
          >
            Sample: Climate
          </button>
        </div>
      </div>

      {/* AEO / GEO Direct Answer Capsule */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500 text-stone-950 rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-emerald-950">
              Quick Answer: How Sentence Expansion Breaks Robotic AI Detectors
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              <strong>Short, uniform 12-word sentences are the primary mathematical signal flagged by Turnitin 3.0 and GPTZero.</strong> Generative AI models naturally output low-entropy, repetitive clauses without contextual qualifiers. Expanding concise sentences with analytical reasoning, causal linking clauses, and diverse syntactic depth elevates grammatical burstiness by over 85%, ensuring papers pass institutional review.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Input Text & Depth Selector */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">Original Concise Sentences</h3>
            <span className="text-xs text-stone-500 font-mono">
              {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-44 sm:h-52 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs sm:text-sm text-stone-800 leading-relaxed outline-none focus:border-emerald-500 resize-none font-sans"
            placeholder="Type or paste short sentences here to expand with academic depth and evidence framing..."
          />

          {/* Depth Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Select Expansion Depth & Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "moderate", label: "Moderate (2x)", desc: "Balanced length" },
                  { id: "extensive", label: "Extensive (3x)", desc: "Systematic depth" },
                  { id: "scholarly", label: "Scholarly (4x)", desc: "Peer-reviewed thesis" },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setDepth(lvl.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    depth === lvl.id
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                      : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-stone-500">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Expanded Output */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900">Expanded Academic Prose</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                {result.burstinessGain} burstiness
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-mono">
                {result.expandedWords} words
              </span>
              <button
                onClick={handleCopy}
                disabled={!result.expandedText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="w-full h-44 sm:h-52 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs sm:text-sm text-stone-800 leading-relaxed overflow-y-auto font-sans select-all">
            {result.expandedText || (
              <span className="text-stone-400 italic">Expanded text will appear here automatically...</span>
            )}
          </div>

          {/* Added Scholarly Perspectives & Send to Humanizer */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100">
            <div className="text-[11px] text-stone-500">
              Preserves factual meaning while injecting natural academic clause variation.
            </div>
            {onSendToHumanizer && (
              <button
                onClick={() => onSendToHumanizer(result.expandedText)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Send to Humanizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
