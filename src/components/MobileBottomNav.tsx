import React, { useState } from "react";
import {
  Sparkles, Search, Video, TrendingUp, Download,
  LayoutGrid, X, BookMarked, Maximize2, FileText,
  AlertOctagon, GitCompare, ChevronRight,
} from "lucide-react";
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
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { id: "humanizer" as ActivePage, label: "Humanizer", icon: Sparkles },
    { id: "detector" as ActivePage, label: "Detector", icon: Search },
    { id: "media" as ActivePage, label: "Video", icon: Video },
    { id: "seo" as ActivePage, label: "SEO", icon: TrendingUp },
  ];

  const moreTools = [
    { id: "citation" as ActivePage, label: "Citation Generator", desc: "APA, MLA, Chicago", icon: BookMarked, color: "text-emerald-400" },
    { id: "expander" as ActivePage, label: "Sentence Expander", desc: "Make text longer", icon: Maximize2, color: "text-violet-400" },
    { id: "summarizer" as ActivePage, label: "Text Summarizer", desc: "Long to short", icon: Sparkles, color: "text-cyan-400" },
    { id: "imageCompressor" as ActivePage, label: "Image Compressor", desc: "Shrink photos", icon: Download, color: "text-blue-400" },
    { id: "pdfTools" as ActivePage, label: "PDF Tools", desc: "Merge & create", icon: FileText, color: "text-red-400" },
    { id: "cleaner" as ActivePage, label: "Cliché Cleaner", desc: "Remove AI words", icon: AlertOctagon, color: "text-amber-400" },
    { id: "diff" as ActivePage, label: "Diff Checker", desc: "Compare texts", icon: GitCompare, color: "text-teal-400" },
  ];

  const handleSelect = (id: ActivePage) => {
    setShowMore(false);
    onSelectPage(id);
  };

  return (
    <>
      {/* More Tools Bottom Sheet */}
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowMore(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-stone-900 rounded-t-3xl border-t border-stone-700 max-h-[75vh] overflow-y-auto">
            <div className="sticky top-0 bg-stone-900 px-4 pt-3 pb-2 border-b border-stone-800">
              <div className="w-10 h-1 rounded-full bg-stone-700 mx-auto mb-2" />
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-base">All Tools</h3>
                <button
                  onClick={() => setShowMore(false)}
                  className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 space-y-1">
              {moreTools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activePage === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSelect(tool.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                      isActive ? "bg-emerald-500/20 border border-emerald-500/40" : "hover:bg-stone-800"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center ${tool.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">{tool.label}</div>
                      <div className="text-stone-400 text-xs">{tool.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  </button>
                );
              })}
              <button
                onClick={() => { setShowMore(false); onOpenInstall(); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-left bg-amber-500/10 border border-amber-500/30"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-amber-200 font-semibold text-sm">Install App</div>
                  <div className="text-stone-400 text-xs">Add to home screen</div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-500" />
              </button>
            </div>
            <div className="h-6" />
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-stone-900/95 backdrop-blur-lg border-t border-stone-800 px-2 py-1.5 shadow-2xl safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? "text-emerald-400 font-bold" : "text-stone-400"
                }`}
              >
                <div className={`w-9 h-8 flex items-center justify-center rounded-lg transition-all ${
                  isActive ? "bg-emerald-500/20 text-emerald-400" : "text-stone-400"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
              </button>
            );
          })}

          {/* More Button - opens all tools */}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-stone-400 transition-all"
          >
            <div className="w-9 h-8 flex items-center justify-center rounded-lg">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-none">More</span>
          </button>
        </div>
      </div>
    </>
  );
}
