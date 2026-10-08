import React from "react";
import { Sparkles, Search, Video, ArrowRight, ShieldCheck, Zap, FileText, CheckCircle2 } from "lucide-react";
import { ActivePage } from "../types";

interface HeroActionCardsProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

export function HeroActionCards({ activePage, onSelectPage }: HeroActionCardsProps) {
  const tools = [
    {
      id: "humanizer" as ActivePage,
      hash: "#humanizer",
      badge: "⭐ Free to Use",
      badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-300",
      accentBg: "from-emerald-100/60 via-white to-[#fffdf8]",
      iconBg: "bg-gradient-to-r from-amber-500 to-yellow-600 text-white",
      icon: Sparkles,
      title: "AI Text Humanizer",
      subtitle: "Natural, Human-Sounding Rewrites",
      description:
        "Transform raw AI drafts from ChatGPT, Claude, and Gemini into natural, nuanced American English prose. Eliminates robotic cadence.",
      features: [
        "Natural rewrite styles",
        "5 Writing Styles (Casual to Academic)",
        "1-Click Word & TXT Export",
      ],
      ctaText: "Open Text Humanizer",
      ctaColor: "bg-emerald-500 hover:bg-emerald-400 text-stone-950",
    },
    {
      id: "detector" as ActivePage,
      hash: "#detector",
      badge: "🔍 Institutional Multi-Model",
      badgeColor: "bg-cyan-100 text-cyan-700 border-cyan-300",
      accentBg: "from-cyan-100/60 via-white to-[#fffdf8]",
      iconBg: "bg-cyan-400 text-stone-950",
      icon: Search,
      title: "AI Content Detector 4.0",
      subtitle: "Sentence-by-Sentence Colored Heatmap",
      description:
        "Audit any document with heuristic pattern analysis. Pinpoint high-risk sentences with vivid colored heatmaps and one-click auto-fixing.",
      features: [
        "Sentence Heatmap (Red AI, Green Human)",
        "Heuristic Pattern Analysis",
        "1-Click Auto-Fix to Humanizer",
      ],
      ctaText: "Open AI Detector",
      ctaColor: "bg-cyan-400 hover:bg-cyan-300 text-stone-950",
    },
    {
      id: "media" as ActivePage,
      hash: "#media",
      badge: "🎬 Viral Reels, Shorts & SEO",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-300",
      accentBg: "from-rose-100/60 via-white to-[#fffdf8]",
      iconBg: "bg-rose-500 text-white",
      icon: Video,
      title: "Video Studio & Viral SEO Optimizer",
      subtitle: "Watermark Removal & Competitor SEO Clones",
      description:
        "Remove logos and watermarks with precision edge-punch zoom and smart corner concealment. Plus, reverse-engineer 1M+ view competitor videos across TikTok, YouTube Shorts, and Instagram.",
      features: [
        "Corner Logo & Watermark Stripper",
        "Competitor Viral SEO & Hashtag Clone",
        "YouTube & TikTok Monetization Safe",
      ],
      ctaText: "Open Video & SEO Studio",
      ctaColor: "bg-rose-500 hover:bg-rose-400 text-white",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      {/* Top Banner Heading */}
      <div className="text-center max-w-3xl mx-auto mb-6 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white text-emerald-400 border border-emerald-500/30 tracking-wide uppercase">
          <Zap className="w-3.5 h-3.5" />
          US Creator & Student Suite
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
          Everything You Need to Create Human, Viral & Monetizable Content
        </h2>
        <p className="text-sm sm:text-base text-stone-600">
          Select any of the primary production workspaces below. Fast, mobile-responsive, and engineered for maximum creator reach.
        </p>
      </div>

      {/* 3 Prominent Large Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isCurrent = activePage === tool.id;

          return (
            <div
              key={tool.id}
              onClick={() => onSelectPage(tool.id)}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer group border-2 ${
                isCurrent
                  ? "bg-gradient-to-b from-white to-[#fffdf8] text-white border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]"
                  : "bg-white text-stone-900 border-stone-200 hover:border-stone-400 hover:shadow-lg shadow-sm"
              }`}
            >
              {/* Card Header & Badge */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${tool.iconBg}`}
                  >
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-600 text-white flex items-center gap-1 animate-pulse shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fffdf8]" />
                        OPEN NOW
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${tool.badgeColor}`}
                    >
                      {tool.badge}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3
                    className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                      isCurrent ? "text-white" : "text-stone-900 group-hover:text-emerald-700"
                    }`}
                  >
                    {tool.title}
                  </h3>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCurrent ? "text-emerald-400" : "text-emerald-700"
                    }`}
                  >
                    {tool.subtitle}
                  </p>
                </div>

                <p
                  className={`text-xs sm:text-sm leading-relaxed ${
                    isCurrent ? "text-stone-600" : "text-stone-600"
                  }`}
                >
                  {tool.description}
                </p>

                {/* Micro Features list */}
                <div className="pt-2 space-y-1.5 border-t border-stone-200/50">
                  {tool.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`text-xs flex items-center gap-2 font-medium ${
                        isCurrent ? "text-stone-600" : "text-stone-700"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          isCurrent ? "text-emerald-400" : "text-emerald-600"
                        }`}
                      />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-6 mt-6 border-t border-stone-200/30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPage(tool.id);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    tool.ctaColor
                  }`}
                >
                  <span>{tool.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
