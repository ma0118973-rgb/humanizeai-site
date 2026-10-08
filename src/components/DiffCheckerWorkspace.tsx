import React, { useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { GitCompare, Copy, Check, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { calculateTextDiff } from "../utils/localEngines";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface DiffCheckerWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

export function DiffCheckerWorkspace({
  selectedLanguage = "en",
  onSendToHumanizer,
}: DiffCheckerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const [origText, setOrigText] = useState<string>(
    "Artificial intelligence creates efficiencies across modern industries. Moreover, it is crucial to recognize that automated workflows enhance productivity. In conclusion, companies must adopt these technologies."
  );

  const [humanText, setHumanText] = useState<string>(
    "Machine learning streamlines routine operations across healthcare, logistics, and finance. When deployed thoughtfully, smart automation frees up teams to tackle nuanced problem-solving rather than rote administrative tasks. Looking forward, practical integration will separate resilient businesses from stagnant competitors."
  );

  const diff = calculateTextDiff(origText, humanText);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="diff" selectedLanguage={selectedLanguage} />
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-white via-stone-800 to-white rounded-3xl p-4 sm:p-8 text-white shadow-xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5 text-blue-400" />
              Paraphrase & AI Similarity Diff Checker
            </span>
            <span className="text-xs text-stone-400 font-mono">Turnitin Plagiarism Match Predictor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Side-by-Side Text Similarity & Token Diff Comparison
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            Compare your original AI draft against rewritten human prose. Visually verify added words, purged robotic phrases, exact % similarity, and Turnitin risk score.
          </p>
        </div>

        {/* Live Metric Badges */}
        <div className="flex items-center gap-2 flex-wrap relative z-10">
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 text-center min-w-[110px]">
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {diff.similarityPercent}%
            </div>
            <div className="text-[10px] font-bold text-stone-600">Similarity</div>
          </div>
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 text-center min-w-[110px]">
            <div className="text-2xl font-black text-blue-400 font-mono">
              {diff.similarityRiskScore}%
            </div>
            <div className="text-[10px] font-bold text-stone-600">Similarity Risk</div>
          </div>
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3 text-center min-w-[110px]">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {diff.changedWordsCount}
            </div>
            <div className="text-[10px] font-bold text-stone-600">Words Changed</div>
          </div>
        </div>
      </div>

      {/* AEO / GEO Direct Answer Capsule */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-emerald-950">
              Quick Answer: How Turnitin Calculates Similarity Index Percentage
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              <strong>Turnitin detects paraphrase attempts by matching 4-to-8 contiguous word strings (n-grams).</strong> When students simply swap a few synonyms, Turnitin's Similarity Report flags the sentence with red highlighting. A safe paraphrased document must maintain less than 15% string overlap while altering the grammatical agent, clause hierarchy, and sentence cadence.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Comparison Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Original AI Draft */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-sm font-bold text-stone-900">Original AI Draft (Before)</h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {origText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            value={origText}
            onChange={(e) => setOrigText(e.target.value)}
            className="w-full h-44 bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs sm:text-sm text-stone-800 leading-relaxed outline-none focus:border-rose-400 resize-none font-sans"
            placeholder="Paste original AI draft here..."
          />
        </div>

        {/* Right: Humanized Rewrite */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-stone-900">Humanized Rewrite (After)</h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">
              {humanText.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            value={humanText}
            onChange={(e) => setHumanText(e.target.value)}
            className="w-full h-44 bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs sm:text-sm text-stone-800 leading-relaxed outline-none focus:border-emerald-500 resize-none font-sans"
            placeholder="Paste rewritten or humanized prose here to compare..."
          />
        </div>
      </div>

      {/* Visual Token Diff Output */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-emerald-600" />
            Live Word-by-Word Diff Visualizer
          </h3>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 bg-emerald-200 border border-emerald-400 rounded-sm" /> Added Human Words
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 bg-rose-200 border border-rose-400 rounded-sm" /> Removed Robotic Words
            </span>
          </div>
        </div>

        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 leading-loose text-xs sm:text-sm select-all">
          {diff.diffTokens.map((token, index) => {
            if (token.type === "added") {
              return (
                <span
                  key={index}
                  className="bg-emerald-100/90 text-emerald-950 px-1 py-0.5 rounded font-medium border border-emerald-300 mx-0.5"
                >
                  +{token.value}
                </span>
              );
            }
            if (token.type === "removed") {
              return (
                <span
                  key={index}
                  className="bg-rose-100/90 text-rose-950 px-1 py-0.5 rounded font-medium line-through border border-rose-300 mx-0.5 opacity-75"
                >
                  -{token.value}
                </span>
              );
            }
            return (
              <span key={index} className="text-stone-700 mx-0.5">
                {token.value}
              </span>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-stone-500">
          <div>
            Lexical Diversity: <strong>{diff.lexicalDiversityRatio}% unique vocabulary</strong>
          </div>
          {onSendToHumanizer && (
            <button
              onClick={() => onSendToHumanizer(humanText)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-white hover:bg-amber-50 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Send Humanized Text to Humanizer Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
