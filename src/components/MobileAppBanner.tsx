import { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface MobileAppBannerProps {
  onOpenInstall: () => void;
}

export function MobileAppBanner({ onOpenInstall }: MobileAppBannerProps) {
  const { isInstalled, isIOS } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("clever_pwa_banner_dismissed");
      if (dismissed) setIsDismissed(true);
    } catch {
      // Ignore sessionStorage error
    }
  }, []);

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("clever_pwa_banner_dismissed", "1");
    } catch {
      // Ignore
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50 text-stone-900 border-b border-emerald-200 px-3 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30 text-stone-950 font-bold">
            <Smartphone className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-stone-900 text-xs">
                Install WebApp on {isIOS ? "iPhone / iPad" : "Android / Mobile"}
              </span>
              <span className="hidden xs:inline px-1.5 py-0.2 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-[10px] font-bold">
                100% Free
              </span>
            </div>
            <p className="text-[11px] text-stone-600 truncate">
              Fast 1-tap home screen access • Pages you have opened also load offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-extrabold text-xs shadow-md shadow-emerald-500/25 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-stone-400 hover:text-amber-700 rounded-md hover:bg-amber-50 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
