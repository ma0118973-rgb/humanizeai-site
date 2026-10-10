import { useEffect, useState } from "react";
import { Download, Smartphone, Apple, X, Check, Share, PlusSquare, Copy, Info } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const { isInstallable, isIOS, isInstalled, promptDismissed, install } = usePWAInstall();
  const [selectedTab, setSelectedTab] = useState<"auto" | "ios" | "android">(() =>
    isIOS ? "ios" : "auto"
  );
  const [installSuccess, setInstallSuccess] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Already installed (now or earlier): the popup must not appear at all.
  useEffect(() => {
    if (isOpen && isInstalled && !installSuccess) {
      onClose();
    }
  }, [isOpen, isInstalled, installSuccess, onClose]);

  if (!isOpen || (isInstalled && !installSuccess)) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        onClose();
      }, 1800);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const showIOS = selectedTab === "ios" || (selectedTab === "auto" && isIOS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-5 sm:p-7 text-white space-y-5 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-amber-700 rounded-full bg-amber-50/80 hover:bg-amber-50 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
            <Smartphone className="w-7 h-7 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
              Install WebApp
            </h3>
            <p className="text-xs text-stone-400">
              ToolVena for iPhone, iPad & Android
            </p>
          </div>
        </div>

        {/* OS Platform Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#fffdf8]/80 rounded-xl border border-amber-200">
          <button
            type="button"
            onClick={() => setSelectedTab("android")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              selectedTab === "android" || (selectedTab === "auto" && !isIOS)
                ? "bg-amber-50 text-emerald-400 shadow-sm"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android / Chrome</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("ios")}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              selectedTab === "ios" || (selectedTab === "auto" && isIOS)
                ? "bg-amber-50 text-emerald-400 shadow-sm"
                : "text-stone-400 hover:text-stone-700"
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-stone-700" />
            <span>iPhone / Safari</span>
          </button>
        </div>

        {/* Benefits list */}
        <div className="p-3.5 rounded-2xl bg-[#fffdf8]/60 border border-amber-200/80 space-y-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Opens full-screen without browser URL bars</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>1-Tap launch directly from your home screen</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Free to use — no sign-up</span>
          </div>
        </div>

        {/* Tab Content: iOS Safari Guide */}
        {showIOS ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#fffdf8] border border-amber-200 space-y-3 text-xs">
              <div className="flex items-center justify-between text-stone-700 font-bold border-b border-amber-200 pb-2">
                <span className="flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-stone-700" />
                  iPhone & iPad 3-Step Setup:
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Safari
                </span>
              </div>
              <p className="leading-relaxed text-stone-500">
                Safari on iPhone does not offer one-tap installs, so the icon is
                added manually — it only takes a few seconds:
              </p>
              <ol className="space-y-2.5 text-stone-600">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-50 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    In Safari, tap the <strong>Share</strong> button{" "}
                    <Share className="w-3.5 h-3.5 inline mx-1 text-sky-400" /> at the bottom menu.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-50 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Scroll down and select <strong>"Add to Home Screen"</strong>{" "}
                    <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-50 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    Tap <strong>"Add"</strong> in the top right corner. The app icon will appear on your phone!
                  </span>
                </li>
              </ol>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-3 px-3 rounded-xl bg-amber-50 hover:bg-stone-700 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copied!" : "Copy App Link"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Android / Universal Chromium Tab */
          <div className="space-y-3">
            {isInstallable || installSuccess ? (
              <button
                type="button"
                onClick={handleInstall}
                disabled={installing || installSuccess}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-98 text-stone-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-80"
              >
                {installSuccess ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>
                  {installSuccess
                    ? "Installed — check your home screen"
                    : installing
                      ? "Opening install…"
                      : "Install App to Home Screen"}
                </span>
              </button>
            ) : promptDismissed ? (
              <div className="p-4 rounded-2xl bg-[#fffdf8] border border-amber-200 space-y-2.5 text-xs text-stone-600">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>Install prompt was closed</span>
                </div>
                <p className="leading-relaxed">
                  No problem — nothing was installed. Chrome pauses its own
                  install prompt for a while after it is closed, so the button
                  cannot reopen it right now. You can still install manually:
                </p>
                <p className="leading-relaxed">
                  1. Tap the three dots menu (<span className="font-mono text-emerald-400 font-bold">⋮</span>) in the top right corner of Chrome.
                </p>
                <p className="leading-relaxed">
                  2. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
                <p className="leading-relaxed">
                  3. Tap <strong>Install</strong> to confirm.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#fffdf8] border border-amber-200 space-y-2.5 text-xs text-stone-600">
                <div className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>How to Install on Android / Chrome:</span>
                </div>
                <p className="leading-relaxed">
                  1. Tap the three dots menu (<span className="font-mono text-emerald-400 font-bold">⋮</span>) in the top right corner of Chrome.
                </p>
                <p className="leading-relaxed">
                  2. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
                <p className="leading-relaxed">
                  3. Tap <strong>Install</strong> to confirm.
                </p>
                <p className="leading-relaxed text-stone-500">
                  If "Install app" is missing, the app may already be installed,
                  or Chrome has paused the suggestion for now — it will offer it
                  again later on its own.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-stone-700 text-stone-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
