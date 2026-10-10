import { useCallback, useSyncExternalStore } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface ToolvenaPwaGlobal {
  deferredPrompt: BeforeInstallPromptEvent | null;
  installed: boolean;
  listeners: Array<() => void>;
}

interface PwaState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  promptDismissed: boolean;
}

declare global {
  interface Window {
    __toolvenaPWA?: ToolvenaPwaGlobal;
  }
}

// Platform detection is synchronous (user agent does not change), so UI built
// on it is correct on the very first render — no false first paint.
const ua =
  typeof window !== "undefined" ? window.navigator.userAgent.toLowerCase() : "";
const isIOSDevice =
  /iphone|ipad|ipod/.test(ua) ||
  (typeof navigator !== "undefined" &&
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1);
const isAndroidDevice = /android/.test(ua);

function detectInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// One shared module-level store: every component (banner, modal) sees the same
// captured prompt, and a prompt spent by one click can never be re-used by
// another (Chrome allows each captured event exactly one .prompt() call).
let state: PwaState = {
  deferredPrompt: null,
  isInstalled: detectInstalled(),
  promptDismissed: false,
};

const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore listener errors
    }
  });
}

function setState(patch: Partial<PwaState>) {
  state = { ...state, ...patch };
  notify();
}

function subscribe(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function getSnapshot() {
  return state;
}

let bootstrapped = false;
function bootstrap() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  // Adopt whatever the inline <head> script in index.html already captured —
  // it runs before this bundle, so the one-time event survives the race.
  const g = window.__toolvenaPWA;
  if (g) {
    if (g.installed) {
      setState({ isInstalled: true, deferredPrompt: null });
    } else if (g.deferredPrompt) {
      setState({ deferredPrompt: g.deferredPrompt });
    }
    g.listeners.push(() => {
      if (g.installed) {
        if (!state.isInstalled) {
          setState({ isInstalled: true, deferredPrompt: null });
        }
      } else if (g.deferredPrompt && g.deferredPrompt !== state.deferredPrompt) {
        setState({ deferredPrompt: g.deferredPrompt, promptDismissed: false });
      }
    });
  }

  // Fallback listeners in case the head script is missing (e.g. dev server).
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setState({
      deferredPrompt: e as BeforeInstallPromptEvent,
      promptDismissed: false,
    });
  });
  window.addEventListener("appinstalled", () => {
    setState({ isInstalled: true, deferredPrompt: null });
  });
}
bootstrap();

export function usePWAInstall() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Returns true only when the user accepted in Chrome's own prompt.
  const install = useCallback(async (): Promise<boolean> => {
    const promptEvent = state.deferredPrompt;
    if (!promptEvent) return false;
    // Consume the event up front: after this it can never be prompted again.
    setState({ deferredPrompt: null });
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setState({ isInstalled: true, promptDismissed: false });
        return true;
      }
      setState({ promptDismissed: true });
      return false;
    } catch {
      // .prompt() threw (spent event, unsupported browser, …) — surface it as
      // a dismissal so the UI can honestly offer the manual menu route.
      setState({ promptDismissed: true });
      return false;
    }
  }, []);

  return {
    isInstallable: !!snap.deferredPrompt,
    isInstalled: snap.isInstalled,
    promptDismissed: snap.promptDismissed,
    isIOS: isIOSDevice,
    isAndroid: isAndroidDevice,
    install,
  };
}
