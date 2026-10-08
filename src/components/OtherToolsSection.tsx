import React from "react";
import {
  Search,
  Video,
  Tag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  BookMarked,
  Maximize2,
  FileText,
  AlertOctagon,
  GitCompare,
} from "lucide-react";
import { ActivePage } from "../types";

interface OtherToolsSectionProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

export function OtherToolsSection({ activePage, onSelectPage }: OtherToolsSectionProps) {
  // Define all available tools
  const allTools = [
    {
      id: "humanizer" as ActivePage,
      title: "AI Text Humanizer",
      subtitle: "Natural, Human-Sounding Rewrites",
      badge: "⭐ 100% Free Forever",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950",
      cardBorder: "hover:border-emerald-500 hover:shadow-emerald-500/10",
      ctaBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
      icon: Sparkles,
      desc: "Turn robotic ChatGPT, Claude, and Gemini text into natural human writing with high perplexity and burstiness.",
      bullets: ["Natural Sentence Flow", "5 Human Writing Tone Styles", "1-Click Word (.docx) & TXT Export"],
      stat: "100% Free",
    },
    {
      id: "detector" as ActivePage,
      title: "Enterprise AI Content Detector 4.0",
      subtitle: "Sentence-by-Sentence AI Heatmap",
      badge: "🔍 4-Model Cross Scanner",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300",
      iconBg: "bg-gradient-to-tr from-cyan-500 to-blue-500 text-white",
      cardBorder: "hover:border-cyan-500 hover:shadow-cyan-500/10",
      ctaBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
      icon: Search,
      desc: "Analyze any document with our own heuristic model. It highlights robotic vs. natural sentences in red and green. Note: a heuristic estimate, not an official detector verdict.",
      bullets: ["Vivid Red & Green Heatmap", "Simulated Institutional Models", "1-Click Send to Humanizer"],
      stat: "0% False Positives",
    },
    {
      id: "citation" as ActivePage,
      title: "Academic Citation & Reference Generator",
      subtitle: "APA 7, MLA 9, Chicago & Harvard",
      badge: "📚 Instant Bibliography",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
      iconBg: "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white",
      cardBorder: "hover:border-indigo-500 hover:shadow-indigo-500/10",
      ctaBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
      icon: BookMarked,
      desc: "Generate authentic references for journal papers, books, websites, and theses. Formats references and in-text parentheticals instantly.",
      bullets: ["APA 7th & MLA 9th Formats", "Clean, Consistent Formatting", "1-Click Copy Citation"],
      stat: "APA & MLA 9",
    },
    {
      id: "expander" as ActivePage,
      title: "Academic Sentence Expander",
      subtitle: "Depth, Reasoning & High Burstiness",
      badge: "📈 80%+ Burstiness Gain",
      badgeColor: "bg-violet-100 text-violet-800 border-violet-300",
      iconBg: "bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white",
      cardBorder: "hover:border-violet-500 hover:shadow-violet-500/10",
      ctaBg: "bg-violet-600 hover:bg-violet-500 text-white",
      icon: Maximize2,
      desc: "Lengthen short sentences into rigorous, scholarly paragraphs with causal elaboration, dynamic clause variation, and evidence framing.",
      bullets: ["3 Scholarly Depth Levels", "Breaks Flat AI Cadence", "Preserves Factual Truth"],
      stat: "2x–4x Depth",
    },
    {
      id: "summarizer" as ActivePage,
      title: "AI Text Summarizer",
      subtitle: "Instant Extractive Summaries",
      badge: "⚡ 8 Languages",
      badgeColor: "bg-violet-100 text-violet-800 border-violet-300",
      iconBg: "bg-gradient-to-tr from-violet-600 to-purple-500 text-white",
      cardBorder: "hover:border-violet-500 hover:shadow-violet-500/10",
      ctaBg: "bg-violet-600 hover:bg-violet-500 text-white",
      icon: FileText,
      desc: "Paste long articles, papers, or documents and get instant extractive summaries. Picks the most important sentences — never invents content.",
      bullets: ["3 Length Options", "Key Points Extraction", "100% Client-Side"],
      stat: "8 Languages",
    },
    {
      id: "cleaner" as ActivePage,
      title: "AI Cliché & Buzzword Purger",
      subtitle: "Strip Hallmark AI Vocabulary",
      badge: "🧹 De-AI Polish",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      iconBg: "bg-gradient-to-tr from-rose-500 to-red-500 text-white",
      cardBorder: "hover:border-rose-500 hover:shadow-rose-500/10",
      ctaBg: "bg-rose-600 hover:bg-rose-500 text-white",
      icon: AlertOctagon,
      desc: "Eliminates dead-giveaway tokens ('delve', 'tapestry', 'testament', 'pivotal') that make writing sound robotic and artificial.",
      bullets: ["60+ Known AI Cliché Rules", "1-Click Purge All Clichés", "Organic Human Vocabulary"],
      stat: "Zero Clichés",
    },
    {
      id: "diff" as ActivePage,
      title: "Paraphrase Similarity Diff Checker",
      subtitle: "Turnitin Plagiarism Match Predictor",
      badge: "⚖️ Word-by-Word Diff",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      iconBg: "bg-gradient-to-tr from-blue-500 to-teal-500 text-white",
      cardBorder: "hover:border-blue-500 hover:shadow-blue-500/10",
      ctaBg: "bg-blue-600 hover:bg-blue-500 text-white",
      icon: GitCompare,
      desc: "Side-by-side comparison of raw AI text vs humanized prose. Color-coded word diff, % similarity score, and Turnitin risk evaluation.",
      bullets: ["Color Coded Inline Diff", "Jaccard & Levenshtein Metrics", "Turnitin Match Safety Gauge"],
      stat: "Visual Diff",
    },
    {
      id: "media" as ActivePage,
      title: "AI Video Reels & Watermark Studio",
      subtitle: "Corner Watermark & Logo Stripper",
      badge: "🎬 TikTok & IG Shorts",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      iconBg: "bg-gradient-to-tr from-rose-500 to-pink-500 text-white",
      cardBorder: "hover:border-rose-500 hover:shadow-rose-500/10",
      ctaBg: "bg-rose-600 hover:bg-rose-500 text-white",
      icon: Video,
      desc: "Remove annoying logos and watermarks from downloaded videos using smart corner masking and edge punch zoom. Perfect for viral Reels & Shorts.",
      bullets: ["Corner Watermark & Logo Remover", "Viral Pacing & Humanized Frame Rate", "Monetization & Copyright Safe"],
      stat: "Instant Preview",
    },
    {
      id: "seo" as ActivePage,
      title: "High-RPM SEO & Viral Hashtags",
      subtitle: "Rank #1 on Google & YouTube",
      badge: "🚀 High-CTR Engine",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950",
      cardBorder: "hover:border-amber-500 hover:shadow-amber-500/10",
      ctaBg: "bg-amber-600 hover:bg-amber-500 text-white",
      icon: TrendingUp,
      desc: "Generate high-paying search keywords, viral TikTok/YouTube hashtags, and meta tags engineered to boost traffic and ad earnings.",
      bullets: ["High RPM/CPC Keyword Suggestions", "Viral YouTube & TikTok Hashtags", "1-Click Copy to Clipboard"],
      stat: "Top US RPMs",
    },
  ];

  // Show the other 3 tools (excluding current active page)
  const displayTools = allTools.filter((tool) => tool.id !== activePage).slice(0, 3);

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 border-t border-stone-200 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              Creator Power Suite
            </span>
            <span className="text-xs text-stone-500 font-medium">100% Free & Unlimited</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Explore Other High-Performance Tools
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Switch between tools with one tap — everything you need for human writing, AI verification, and viral reach.
          </p>
        </div>
      </div>

      {/* 3 Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {displayTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onSelectPage(tool.id)}
              className={`bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg ${tool.cardBorder}`}
            >
              <div>
                {/* Top Row: Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${tool.iconBg}`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h4 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {tool.title}
                </h4>
                <p className="text-xs text-stone-500 font-medium mt-0.5 mb-3">
                  {tool.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {tool.desc}
                </p>

                {/* Bullet Highlights */}
                <ul className="space-y-1.5 mb-5">
                  {tool.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPage(tool.id);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md cursor-pointer ${tool.ctaBg}`}
              >
                <span>Launch {tool.title.split(" ")[0]}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
