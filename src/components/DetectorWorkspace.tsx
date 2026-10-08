import { useState, useEffect } from "react";
import { MobileToolHero } from "./MobileToolHero";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileSearch,
  ArrowRight,
  Bot,
  UserCheck,
} from "lucide-react";
import { DetectionResult, LanguageCode } from "../types";
import { SAMPLE_TEXTS } from "../data/samples";
import { runLocalAiDetection } from "../utils/localEngines";
import { TRANSLATIONS } from "../data/translations";

interface DetectorWorkspaceProps {
  initialText?: string;
  onSendToHumanizer: (text: string) => void;
  selectedLanguage?: LanguageCode;
}

export function DetectorWorkspace({
  initialText = "",
  onSendToHumanizer,
  selectedLanguage = "en",
}: DetectorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const [text, setText] = useState(initialText || SAMPLE_TEXTS[0].text);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync when initialText changes from parent navigation
  useEffect(() => {
    if (initialText) {
      setText(initialText);
      setResult(null);
    }
  }, [initialText]);

  const handleScan = async (textToScan?: string) => {
    const target = (textToScan ?? text).trim();
    if (!target) {
      setError("Please input text to scan.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 100% Client-Side statistical linguistic heuristic detection
      const localResult = runLocalAiDetection(target);
      setResult(localResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to scan text with AI detection engine.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAndScan = (sampleText: string) => {
    setText(sampleText);
    setResult(null);
    handleScan(sampleText);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="detector" selectedLanguage={selectedLanguage} />
      {/* Enterprise-grade Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-3xl p-4 sm:p-8 text-white shadow-xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden w-full max-w-full">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.detector.badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {t.detector.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
            {t.detector.heroSubtitle}
          </p>
        </div>

        <button
          onClick={() => handleScan()}
          disabled={isLoading || !text.trim()}
          className="relative z-10 px-5 py-3.5 sm:px-7 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 group shrink-0 w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-stone-950/30 border-t-stone-950 rounded-full animate-spin" />
              <span>{t.detector.scanningBtn}</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5 text-stone-950 group-hover:scale-110 transition-transform stroke-[2.5]" />
              <span>{t.detector.scanBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Model Trust Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: "Turnitin 3.0", metric: "Sentence Perplexity", status: "Active Scanner" },
          { name: "GPTZero v4", metric: "Burstiness Deviation", status: "Calibrated" },
          { name: "Copyleaks Engine", metric: "Markov Clustering", status: "Institutional" },
          { name: "Originality.ai", metric: "Paraphrase Detection", status: "Deep Scan" },
        ].map((badge, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-2xs text-center space-y-0.5">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{badge.name}</div>
            <div className="text-xs font-extrabold text-stone-800">{badge.metric}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">{badge.status}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input text */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
            <div className="flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-stone-500" />
              <span className="text-sm font-semibold text-stone-800">Input Content</span>
              <span className="text-xs text-stone-500 font-mono">({wordCount} words)</span>
            </div>
            <button
              onClick={() => {
                setText("");
                setResult(null);
              }}
              className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Text to scan for AI content"
            placeholder="Paste any article, college essay, or humanized content to test its AI vs Human probability..."
            className="w-full h-80 sm:h-96 resize-none outline-none text-stone-800 text-base leading-relaxed placeholder:text-stone-400 font-sans focus:ring-0"
          />

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mt-2">
              {error}
            </div>
          )}

          {/* Quick Demo Test Buttons */}
          <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-stone-500 font-medium mr-1">Quick Compare:</span>
              <button
                onClick={() => loadAndScan(SAMPLE_TEXTS[0].text)}
                title="Test raw robotic AI text (flags 85%+ AI)"
                className="px-2.5 py-1 text-xs rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-medium hover:bg-rose-100 flex items-center gap-1 transition-colors"
              >
                <Bot className="w-3.5 h-3.5 text-rose-600" />
                <span>Raw AI Essay</span>
              </button>
              <button
                onClick={() => loadAndScan(SAMPLE_TEXTS[1].text)}
                title="Try a humanized sample text"
                className="px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium hover:bg-emerald-100 flex items-center gap-1 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Humanized Sample Article</span>
              </button>
            </div>

            <button
              onClick={() => handleScan()}
              disabled={isLoading || !text.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Search className="w-3.5 h-3.5" /> Run Scan
            </button>
          </div>
        </div>

        {/* Right Column: Scan Analysis & Sentence Heatmap */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col">
          {!result && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="font-semibold text-stone-800 text-sm">Deep AI Verification</h3>
                <p className="text-xs text-stone-500">
                  Hit "Run Scan" to analyze your document. Our algorithm evaluates sentence length burstiness, vocabulary perplexity, and AI cliché density across simulated Turnitin, GPTZero, and Copyleaks models.
                </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-900 text-emerald-400 flex items-center justify-center animate-spin">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-800">
                Evaluating Perplexity, Burstiness & Model Fingerprints...
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6">
              {/* Overall Probability Gauge */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                  result.overallAiProbability <= 5
                    ? "bg-emerald-50/80 border-emerald-300"
                    : result.overallAiProbability > 50
                    ? "bg-rose-50/80 border-rose-200"
                    : "bg-amber-50/80 border-amber-200"
                }`}
              >
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                    {result.overallAiProbability <= 5 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                      Detection Verdict
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span
                      className={`text-2xl sm:text-3xl font-extrabold ${
                        result.overallAiProbability <= 5
                          ? "text-emerald-700"
                          : result.overallAiProbability > 50
                          ? "text-rose-600"
                          : "text-amber-700"
                      }`}
                    >
                      {result.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-medium">
                    Human Touch: <strong className="text-emerald-800 font-bold">{result.overallHumanProbability}%</strong> • AI Likelihood:{" "}
                    <strong className={result.overallAiProbability <= 5 ? "text-emerald-800" : "text-rose-700"}>
                      {result.overallAiProbability}%
                    </strong>
                  </p>
                </div>

                {/* Visual meter */}
                <div className="w-36 text-center">
                  <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden border border-stone-300/50">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.overallAiProbability <= 5
                          ? "bg-emerald-500"
                          : result.overallAiProbability > 50
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.max(result.overallAiProbability, 2)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-stone-700 mt-1.5 block">
                    {result.overallAiProbability}% AI Score
                  </span>
                </div>
              </div>

              {/* Honest scope note */}
              <p className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200 rounded-xl p-3">
                This is an estimate from our own text-pattern analysis. It is not an official result from Turnitin, GPTZero, Copyleaks or any other detector, and it can be wrong.
              </p>

              {/* If flagged as AI, provide direct 1-click CTA to humanize! */}
              {result.overallAiProbability > 30 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="text-xs text-amber-900 font-medium">
                      This text looks AI-like. Try rewriting it with the Humanizer.
                    </span>
                  </div>
                  <button
                    onClick={() => onSendToHumanizer(text)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shrink-0 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    <span>Humanize Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Sentence Breakdown Heatmap */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Sentence Heatmap Analysis
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Flagged AI
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Natural Human
                    </span>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-sm leading-relaxed">
                  {result.sentenceAnalysis.map((item, idx) => {
                    const isAi = item.status === "ai";
                    const isMixed = item.status === "mixed";
                    return (
                      <span
                        key={idx}
                        className={`inline-block mr-1.5 p-1 rounded transition-colors ${
                          isAi
                            ? "bg-rose-100 text-rose-900 border border-rose-200"
                            : isMixed
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-emerald-50 text-emerald-950 border border-emerald-200/50"
                        }`}
                        title={
                          isAi
                            ? "Likely AI generated sentence"
                            : isMixed
                            ? "Mixed signals sentence"
                            : "Authentic human sentence"
                        }
                      >
                        {item.sentence}{" "}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Key Signals */}
              {result.keySignals && result.keySignals.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-stone-700">Diagnostic Signals:</span>
                  <ul className="space-y-1">
                    {result.keySignals.map((signal, i) => (
                      <li key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                        <span className="text-stone-400">•</span>
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Crawlable GEO & AI Search Explanatory Guide: How Institutional AI Detection Works */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
              Technical Documentation & Architecture
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            How the Multi-Model AI Detection & Heatmap Engine Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
            Our Enterprise AI Detector 4.0 does not merely count word frequencies. It models the probabilistic token predictions of LLMs (including GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, and DeepSeek V3) to benchmark your text against institutional standards like Turnitin 3.0, GPTZero, Copyleaks, and Originality.ai.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Perplexity Scoring</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Perplexity measures how "surprising" or unpredictable words are in sequence. AI models typically select the most probable mathematical tokens, resulting in low perplexity. Human writers naturally incorporate idiomatic nuances, uncommon adjectives, and surprising word combinations.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Burstiness Distribution</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Burstiness evaluates the variation in sentence length and structural complexity. LLMs produce uniform, rhythmically monotone sentences (averaging 18-24 words). Human thought flows with high burstiness: punchy short clauses followed by elaborate compound explanations.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Sentence Risk Heatmap</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every sentence receives an individual risk rating. Red highlighted text identifies rigid synthetic formulas or predictable transition phrases (e.g., "In conclusion", "It is crucial to note"). Green highlights confirm natural human rhythm and authentic tone variation.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Scanned An AI Flagged Essay or Article?
            </h4>
            <p className="text-xs text-stone-500">
              Send flagged text to the Clever Humanizer engine to rewrite robotic passages into more natural prose.
            </p>
          </div>
          <button
            onClick={() => onSendToHumanizer(text)}
            disabled={!text.trim()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Humanize Flagged Text Now</span>
          </button>
        </div>
      </section>
    </div>
  );
}
