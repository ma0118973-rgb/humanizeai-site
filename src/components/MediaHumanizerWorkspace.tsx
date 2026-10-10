import { MobileToolHero } from "./MobileToolHero";
import { Flame } from "lucide-react";
import { ViralSeoCompetitorEngine } from "./ViralSeoCompetitorEngine";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface MediaHumanizerWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

export function MediaHumanizerWorkspace({ selectedLanguage = "en" }: MediaHumanizerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const m = (t as any).media || {};

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn overflow-hidden">
      <MobileToolHero toolId="media" selectedLanguage={selectedLanguage} />
      {/* Visual Top Headline */}
      <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 rounded-3xl p-4 sm:p-8 text-stone-900 shadow-xl border border-amber-200 relative overflow-hidden w-full max-w-full">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              {m.badge || "Creator Media Tools"}
            </span>
            <span className="text-xs text-stone-600 font-mono">
              YouTube Shorts • TikTok • Instagram Reels • Facebook Reels
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {m.title || "Video & Image Editing Tools"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            {m.subtitle || "Generate title ideas, hooks, captions, and hashtag sets from templates for your own videos."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 leading-relaxed">
        <strong>Use only media you own or have permission to edit.</strong> Follow the disclosure rules for
        AI-generated or altered content on the platform where you publish.
      </div>

      {/* Video SEO Ideas & Hook Script — the remaining media tool */}
      <ViralSeoCompetitorEngine />
    </div>
  );
}
