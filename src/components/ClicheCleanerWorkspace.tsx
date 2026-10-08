import React, { useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { Sparkles, Trash2, CheckCircle2, AlertOctagon, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { cleanAiCliches, ClicheMatch } from "../utils/localEngines";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface ClicheCleanerWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

export function ClicheCleanerWorkspace({
  selectedLanguage = "en",
  onSendToHumanizer,
}: ClicheCleanerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const [text, setText] = useState<string>(
    "In today's fast-paced world, it is important to note that generative AI plays a pivotal role in education. Furthermore, this research delves into the rich tapestry of digital transformation, which stands as a testament to human innovation. In conclusion, we must foster ethical standards."
  );
  const [isCopied, setIsCopied] = useState(false);

  const analysis = cleanAiCliches(text, selectedLanguage);

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.cleanedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePurgeAll = () => {
    setText(analysis.cleanedText);
  };

  const handleReplaceSingle = (original: string, replacement: string) => {
    const regex = new RegExp(`\\b${original}\\b`, "i");
    setText(text.replace(regex, replacement));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="cleaner" selectedLanguage={selectedLanguage} />
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-4 sm:p-8 text-white shadow-xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              AI Cliché & Buzzword Purger (De-AI Polish)
            </span>
            <span className="text-xs text-stone-400 font-mono">Turnitin & GPTZero Flag Purger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            Strip Dead-Giveaway AI Clichés & Buzzwords
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
            Eliminates robotic hallmark vocabulary like <em>"delve", "tapestry", "testament", "pivotal role"</em> and formulaic transition phrases that instantly trigger AI detection filters.
          </p>
        </div>

        {/* AI Cliché Count Stat Box */}
        <div className="bg-stone-800/90 border border-stone-700/80 rounded-2xl p-4 text-center shrink-0 min-w-[160px] relative z-10">
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            {analysis.detectedCount}
          </div>
          <div className="text-xs font-bold text-stone-300 mt-1">AI Clichés Found</div>
          <div className="text-[10px] text-stone-400 font-mono mt-0.5">
            Risk Density: {analysis.aiDensityScore}%
          </div>
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
              Quick Answer: Why Certain Words Immediately Trigger AI Detection
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              <strong>Large language models (ChatGPT, Gemini, Claude) are mathematically biased toward specific high-frequency transition tokens.</strong> Words like <em>"delve"</em> appear up to 400x more often in machine-generated writing than in human academic papers. AI detectors assign heavy probability penalties when encountering phrases like <em>"testament to", "rich tapestry", "in conclusion"</em>, and <em>"crucial role"</em>. Replacing them with direct, active human verbs immediately lowers AI probability scores.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Text & Live Highlighted Clichés */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">Document Text</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-mono">
                {text.trim() ? text.trim().split(/\s+/).length : 0} words
              </span>
              {analysis.detectedCount > 0 && (
                <button
                  onClick={handlePurgeAll}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All ({analysis.detectedCount})</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-56 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs sm:text-sm text-stone-800 leading-relaxed outline-none focus:border-emerald-500 resize-none font-sans"
            placeholder="Paste text to scan and purge synthetic AI buzzwords and robotic transition clichés..."
          />

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? "Clean Text Copied!" : "Copy Clean Text"}
            </button>
            {onSendToHumanizer && (
              <button
                onClick={() => onSendToHumanizer(analysis.cleanedText)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold transition-all cursor-pointer"
              >
                <span>Send to Humanizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Flagged Clichés List & 1-Click Fixes */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              Flagged AI Hallmarks
            </h3>
            <span className="text-xs text-stone-500">
              {analysis.matches.length} detected
            </span>
          </div>

          {analysis.matches.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-stone-800">No AI Clichés Detected!</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Your writing avoids repetitive ChatGPT vocabulary and sterile sentence starters.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {analysis.matches.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-700 font-mono line-through">
                        "{item.word}"
                      </span>
                      <span className="text-stone-400">→</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        "{item.replacement}"
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">{item.explanation}</p>
                  </div>
                  <button
                    onClick={() => handleReplaceSingle(item.word, item.replacement)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 font-bold text-[11px] shrink-0 transition-all cursor-pointer shadow-xs"
                  >
                    Replace
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
