import { useEffect, useRef } from "react";

interface AdSenseSlotProps {
  type: "leaderboard" | "in-content" | "sidebar";
  adClient?: string;
  adSlot?: string;
  className?: string;
}

// Set VITE_ADSENSE_CLIENT (ca-pub-...) and VITE_ADSENSE_SLOT in your .env / Netlify settings.
// Until both are set, nothing is rendered (no fake ad boxes).
const ENV_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT as string | undefined)?.trim();
const ENV_SLOT = (import.meta.env.VITE_ADSENSE_SLOT as string | undefined)?.trim();

let scriptRequested = false;
function loadAdSenseScript(client: string) {
  if (scriptRequested || typeof document === "undefined") return;
  scriptRequested = true;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  document.head.appendChild(s);
}

export function AdSenseSlot({ type, adClient = ENV_CLIENT, adSlot = ENV_SLOT, className = "" }: AdSenseSlotProps) {
  const pushed = useRef(false);
  const enabled = Boolean(adClient && adSlot);

  useEffect(() => {
    if (!enabled || pushed.current) return;
    pushed.current = true;
    loadAdSenseScript(adClient as string);
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      /* ad blocked or not ready */
    }
  }, [enabled, adClient]);

  if (!enabled) return null;

  const minHeight = type === "sidebar" ? 250 : type === "leaderboard" ? 90 : 100;

  return (
    <div className={`w-full my-4 flex flex-col items-center ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">Advertisement</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
