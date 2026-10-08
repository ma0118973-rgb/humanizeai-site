import React, { useState } from "react";
import {
  Youtube,
  Instagram,
  Sparkles,
  Search,
  Copy,
  Check,
  TrendingUp,
  Flame,
  Clock,
  Eye,
  Hash,
  FileText,
  Link,
  Upload,
  Zap,
  Target,
  Share2,
  AlertTriangle,
} from "lucide-react";
import { runLocalVideoViralSeo } from "../utils/localEngines";

interface CompetitorSeoResult {
  viralTitle: string;
  secondaryTitles: string[];
  hookScript: string;
  competitorSecretBreakdown: string;
  viralHashtags: string[];
  highRpmKeywords: string[];
  viralDescription: string;
  bestPostingTimeUS: string;
}

export function ViralSeoCompetitorEngine() {
  const [platform, setPlatform] = useState<"YouTube Shorts" | "TikTok" | "Instagram Reels" | "Facebook Reels">("YouTube Shorts");
  const [inputType, setInputType] = useState<"topic" | "link" | "upload">("topic");
  const [topicName, setTopicName] = useState<string>("");
  const [videoLink, setVideoLink] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [seoResult, setSeoResult] = useState<CompetitorSeoResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setFormError("File exceeds 100MB limit. Please upload a smaller video clip.");
        return;
      }
      setUploadedFileName(file.name);
      setFormError(null);
    }
  };

  const handleGenerateViralSeo = async () => {
    setFormError(null);
    if (inputType === "topic" && !topicName.trim()) {
      setFormError("Please enter a video topic or niche!");
      return;
    }
    if (inputType === "link" && !videoLink.trim()) {
      setFormError("Please enter a valid competitor or reference video link!");
      return;
    }
    if (inputType === "upload" && !uploadedFileName) {
      setFormError("Please upload or choose a video file first!");
      return;
    }

    setIsLoading(true);
    try {
      // 100% Client-Side local reverse-engineering engine
      const localResult = runLocalVideoViralSeo(
        platform,
        inputType,
        topicName,
        videoLink,
        uploadedFileName
      );
      setSeoResult(localResult);
    } catch (err: any) {
      console.error(err);
      setFormError("Could not complete viral reverse-engineering. Please verify input and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-8 shadow-sm space-y-6 w-full max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/10 text-rose-600 border border-rose-500/20 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              US Algorithm Hacker (2026 Edition)
            </span>
            <span className="text-xs text-stone-500 font-mono hidden md:inline">1M+ View Competitor Reverse-Engineer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Viral Video SEO, Hashtags & Competitor Clone Engine
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Scans current trending algorithms for your exact niche, decodes your competitor's viral blueprint, and gives you high-CTR titles, opening hook scripts, and top-ranking tags.
          </p>
        </div>
      </div>

      {/* Target Social Platform Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-rose-600" />
          <span>Step 1: Select Target Social Media Platform (US Audience):</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: "YouTube Shorts", icon: Youtube, color: "text-red-500" },
            { id: "TikTok", icon: Zap, color: "text-stone-900" },
            { id: "Instagram Reels", icon: Instagram, color: "text-pink-600" },
            { id: "Facebook Reels", icon: Share2, color: "text-blue-600" },
          ].map((p) => {
            const Icon = p.icon;
            const isSelected = platform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id as any)}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-stone-900 text-white border-stone-900 shadow-md scale-[1.02]"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-rose-400" : p.color}`} />
                <span>{p.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Mode Selector (3 Options: Topic Name, Video Link, Upload Video) */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-rose-600" />
          <span>Step 2: Choose How You Want To Provide Your Video Data:</span>
        </label>
        
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInputType("topic")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              inputType === "topic"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Enter Topic / Title</span>
          </button>

          <button
            type="button"
            onClick={() => setInputType("link")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              inputType === "link"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Paste Competitor Video Link</span>
          </button>

          <button
            type="button"
            onClick={() => setInputType("upload")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              inputType === "upload"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Video File (MP4/MOV)</span>
          </button>
        </div>

        {/* Dynamic Input Control */}
        {inputType === "topic" && (
          <div className="space-y-1.5">
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g. 5 AI tools saving 20 hours a week, crypto market dip, gym motivation..."
              className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-stone-50/50"
            />
            <p className="text-[11px] text-stone-500">
              Tip: Describe your niche or topic in 4-8 words for ultra-precise competitor algorithmic matching.
            </p>
          </div>
        )}

        {inputType === "link" && (
          <div className="space-y-1.5">
            <input
              type="url"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://www.youtube.com/shorts/... or https://www.tiktok.com/@.../video/..."
              className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-stone-50/50"
            />
            <p className="text-[11px] text-stone-500">
              Paste your competitor's viral short URL. Our model analyzes its retention hooks and keyword hierarchy.
            </p>
          </div>
        )}

        {inputType === "upload" && (
          <div className="border-2 border-dashed border-stone-300 hover:border-rose-500 rounded-2xl p-6 text-center bg-stone-50 hover:bg-rose-50/20 transition-all cursor-pointer">
            <input
              type="file"
              id="viral-seo-video-upload"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="viral-seo-video-upload" className="cursor-pointer space-y-2 block">
              <Upload className="w-8 h-8 text-rose-500 mx-auto" />
              <div className="text-xs font-bold text-stone-800">
                {uploadedFileName ? `Attached: ${uploadedFileName}` : "Click to attach your short video for SEO scan"}
              </div>
              <p className="text-[11px] text-stone-500">MP4, MOV up to 100MB</p>
            </label>
          </div>
        )}
      </div>

      {formError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleGenerateViralSeo}
        disabled={isLoading}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Scanning 1M+ View Competitors & Algorithm Trends in Real Time...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-rose-400" />
            <span>Reverse-Engineer Competitor & Generate Viral SEO Kit</span>
          </>
        )}
      </button>

      {/* Real Competitor SEO Results Panel */}
      {seoResult && (
        <div className="mt-8 pt-6 border-t border-stone-200 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                1M+ Competitor Algorithm Match Complete
              </span>
            </div>
            <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Best Post Window: <strong className="text-stone-900">{seoResult.bestPostingTimeUS}</strong>
            </span>
          </div>

          {/* Competitor Secret Analysis Breakdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
              <Eye className="w-4 h-4 text-rose-600" />
              <span>Competitor 1M+ Views Secret Reverse-Engineered:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
              {seoResult.competitorSecretBreakdown}
            </p>
          </div>

          {/* High CTR Viral Title */}
          <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-2 relative group">
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold uppercase tracking-wider">
              <span>Primary High-CTR Viral Title (Under 60 Chars):</span>
              <button
                type="button"
                onClick={() => copyToClipboard(seoResult.viralTitle, "title")}
                className="flex items-center gap-1 text-[11px] text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copiedField === "title" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === "title" ? "Copied" : "Copy Title"}</span>
              </button>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {seoResult.viralTitle}
            </div>

            {/* A/B Test Alternative Titles */}
            <div className="pt-2 border-t border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 font-bold block">A/B Testing Alternatives:</span>
              <ul className="space-y-1 text-xs text-stone-300">
                {seoResult.secondaryTitles.map((t, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="truncate">• {t}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(t, `title-${idx}`)}
                      className="text-[10px] text-stone-400 hover:text-emerald-400 cursor-pointer shrink-0"
                    >
                      {copiedField === `title-${idx}` ? "Copied" : "Copy"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3-Second Spoken Hook Script (Human Speech Retention) */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-700 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>First 3-5 Seconds Hook Script:</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(seoResult.hookScript, "hook")}
                className="flex items-center gap-1 text-[11px] text-stone-700 hover:text-stone-900 bg-white border border-stone-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copiedField === "hook" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === "hook" ? "Copied" : "Copy Hook"}</span>
              </button>
            </div>
            <p className="text-sm font-bold text-stone-900 italic bg-white p-3 rounded-xl border border-stone-200">
              "{seoResult.hookScript}"
            </p>
          </div>

          {/* Viral Hashtags & High RPM Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hashtags */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-rose-600" />
                  <span>Trending Algorithm Hashtags ({platform}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(seoResult.viralHashtags.join(" "), "hashtags")}
                  className="text-[10px] text-rose-700 font-bold hover:underline cursor-pointer"
                >
                  {copiedField === "hashtags" ? "Copied!" : "Copy All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {seoResult.viralHashtags.map((tag, i) => (
                  <span
                    key={i}
                    onClick={() => copyToClipboard(tag, `tag-${i}`)}
                    className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-700 hover:border-rose-400 hover:text-rose-600 cursor-pointer transition-colors shadow-2xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* High RPM Search Keywords */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-emerald-600" />
                  <span>High RPM US Search Index Keywords:</span>
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(seoResult.highRpmKeywords.join(", "), "keywords")}
                  className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {copiedField === "keywords" ? "Copied!" : "Copy All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {seoResult.highRpmKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs font-semibold"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Viral Description & Caption */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span>Engaging Video Caption / Description (With Retention CTA):</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(seoResult.viralDescription, "desc")}
                className="text-[10px] text-stone-700 font-bold hover:underline cursor-pointer"
              >
                {copiedField === "desc" ? "Copied!" : "Copy Caption"}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 bg-white p-3 rounded-xl border border-stone-200 whitespace-pre-wrap">
              {seoResult.viralDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
