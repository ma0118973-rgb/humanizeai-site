import { useState } from "react";
import { BookOpen, Hash, Tag, Share2, Check, CheckCircle2, ChevronDown, ChevronUp, Sparkles, ExternalLink } from "lucide-react";
import { TOOL_SEO_ARTICLES, ToolSeoArticle } from "../data/toolSeoArticles";
import { getSiteOrigin } from "../utils/seo";

interface DedicatedSeoArticleSectionProps {
  toolId: "humanizer" | "detector" | "media";
}

export function DedicatedSeoArticleSection({ toolId }: DedicatedSeoArticleSectionProps) {
  const article = TOOL_SEO_ARTICLES[toolId];
  const [copiedHash, setCopiedHash] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!article) return null;

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(article.hashtags.join(" "));
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6 overflow-hidden">
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-10 shadow-sm space-y-8 w-full max-w-full overflow-hidden">
        {/* Article Header & SEO Meta Info */}
        <div className="space-y-3 border-b border-stone-200 pb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
              {article.badge}
            </span>
            <span className="text-xs text-stone-500 font-mono break-all">
              Canonical URL: <strong>{getSiteOrigin()}/{article.metaTags.canonicalSlug}/</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {article.h1}
          </h2>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-4xl">
            {article.subtitle}
          </p>

          {/* Quick Meta Tags Inspector */}
          <div className="p-3 sm:p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1.5 break-words">
            <div>
              <strong className="text-stone-800">Meta Title:</strong> {article.metaTitle}
            </div>
            <div>
              <strong className="text-stone-800">Meta Description:</strong> {article.metaTags.description}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <strong className="text-stone-800">Focus SEO Keywords:</strong>
              {article.metaTags.focusKeywords.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-stone-200/70 text-stone-800 rounded font-medium text-[11px]">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Viral Hashtags Cloud (with 1-click copy) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-stone-50 to-emerald-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Viral SEO Hashtags (Rank #1 on Google, YouTube & TikTok):
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {article.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-emerald-800 border border-emerald-300 shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopyHashtags}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            {copiedHash ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Hashtags!</span>
              </>
            ) : (
              <>
                <Tag className="w-3.5 h-3.5" />
                <span>Copy All Hashtags</span>
              </>
            )}
          </button>
        </div>

        {/* Key Takeaways Box */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white rounded-3xl space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              Key Strategic Takeaways
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {article.keyTakeaways.map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-snug">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Long-Form Article Content */}
        <div className="space-y-8">
          {article.sections.map((sec, idx) => (
            <section key={idx} className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span className="text-emerald-600 font-mono">0{idx + 1}.</span>
                <span>{sec.heading}</span>
              </h3>
              <div className="space-y-3 text-stone-700 text-sm sm:text-base leading-relaxed">
                {sec.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
