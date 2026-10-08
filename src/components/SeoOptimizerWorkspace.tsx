import { useState } from "react";
import { Tag, Search, Copy, Check, Sparkles, Hash, Globe, Code, Layers } from "lucide-react";
import { SeoResult } from "../types";
import { runLocalSeoOptimization } from "../utils/localEngines";
import { getSiteOrigin } from "../utils/seo";

export function SeoOptimizerWorkspace() {
  const [topic, setTopic] = useState("AI Humanizer & Text Rewriting Tool");
  const [region, setRegion] = useState("United States & Global");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or text.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 100% Client-side local deterministic fallback
      const localResult = runLocalSeoOptimization(topic, region);
      setResult(localResult);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate SEO assets.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full max-w-full overflow-hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Rank #1 on Google in 2026
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            Viral SEO Engine, Meta Tags & Trending Hashtags
          </h2>
          <p className="text-sm text-stone-600 max-w-2xl mt-1">
            Generate high-CTR Meta Titles, Descriptions, Google-indexed search keywords, and viral social hashtags to drive millions of organic US & global visitors.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 w-full sm:w-auto shrink-0"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing 2026 SEO Signals...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Generate SEO & Tags</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Topic, Article, or Keyword Niche
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Free AI Humanizer for natural-sounding text..."
              className="w-full h-32 p-3 text-sm rounded-xl border border-stone-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Target Search Geography
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full text-sm bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-stone-800 outline-none focus:border-emerald-500"
            >
              <option value="United States & Global">United States & Global (High CPC Traffic)</option>
              <option value="North America (USA & Canada)">North America (USA & Canada)</option>
              <option value="United Kingdom & Europe">United Kingdom & Europe</option>
              <option value="Worldwide / Multi-lingual">Worldwide / Multi-lingual</option>
            </select>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          {/* Quick presets */}
          <div className="pt-2">
            <span className="text-xs text-stone-500 block mb-2 font-medium">Quick 2026 Trending Niches:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                "AI Humanizer",
                "ChatGPT Detector Bypass",
                "College Student Essay Paraphraser",
                "ATS Resume Optimizer Free",
              ].map((niche, i) => (
                <button
                  key={i}
                  onClick={() => setTopic(niche)}
                  className="text-xs px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-all"
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          {!result && !isLoading && (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-8 space-y-3 text-stone-400">
              <Tag className="w-10 h-10 text-stone-300" />
              <p className="text-sm font-semibold text-stone-700">SEO Assets & Meta Tags Preview</p>
              <p className="text-xs text-stone-500 max-w-md">
                Click "Generate SEO & Tags" to get high-CTR title tags, meta descriptions, long-tail search keywords, and viral social hashtags.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-stone-800">
                Formulating 2026 High-Volume Keywords & Search Engine Snippets...
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-6">
              {/* Google Snippet Preview */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  Google Search Snippet Preview
                </span>
                <div className="text-xs text-emerald-700 flex items-center gap-1 font-mono truncate">
                  {getSiteOrigin()} › seo-tools
                </div>
                <h4 className="text-base font-semibold text-blue-700 hover:underline cursor-pointer leading-snug">
                  {result.seoTitle}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {result.metaDescription}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `<title>${result.seoTitle}</title>\n<meta name="description" content="${result.metaDescription}" />`,
                        "metaTags"
                      )
                    }
                    className="text-xs flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-700 font-medium"
                  >
                    {copiedKey === "metaTags" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied HTML Meta</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy HTML Meta Tags</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Primary & Long Tail Keywords */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                  High-Intent Search Keywords (Organic Traffic)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.primaryKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                  {result.longTailKeywords.map((kw, i) => (
                    <span
                      key={`lt-${i}`}
                      className="text-xs px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Viral Social Hashtags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Viral Social Hashtags (TikTok, X, LinkedIn, YouTube)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.viralHashtags.join(" "), "hashtags")}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                  >
                    {copiedKey === "hashtags" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy All Hashtags</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.viralHashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
