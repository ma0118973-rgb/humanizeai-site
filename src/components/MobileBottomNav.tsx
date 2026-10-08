import React from "react";
import { Sparkles, Search, Video, TrendingUp, Download, Smartphone } from "lucide-react";
import { ActivePage } from "../types";

interface MobileBottomNavProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  onOpenInstall: () => void;
}

export function MobileBottomNav({
  activePage,
  onSelectPage,
  onOpenInstall,
}: MobileBottomNavProps) {
  const navItems = [
    {
      id: "humanizer" as ActivePage,
      label: "Humanizer",
      icon: Sparkles,
      badge: "Main",
    },
    {
      id: "detector" as ActivePage,
      label: "Detector",
      icon: Search,
    },
    {
      id: "media" as ActivePage,
      label: "Video Studio",
      icon: Video,
    },
    {
      id: "seo" as ActivePage,
      label: "SEO & Tags",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 px-2 py-1.5 shadow-2xl safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? "text-emerald-400 font-bold"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <div
                className={`w-9 h-8 flex items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/20"
                    : "text-stone-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Dedicated Install / Download App Button for 1-Tap Mobile Install */}
        <button
          onClick={onOpenInstall}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-amber-400 font-bold transition-all relative group"
        >
          <div className="w-9 h-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500/30 to-emerald-500/30 text-amber-300 border border-amber-500/40 shadow-sm animate-pulse">
            <Download className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 leading-none font-extrabold text-amber-300">
            Install App
          </span>
        </button>
      </div>
    </div>
  );
}
