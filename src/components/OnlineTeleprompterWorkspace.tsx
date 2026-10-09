import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Eraser, Expand, FlipHorizontal2, Pause, Play, RotateCcw, ShieldCheck, Timer, TriangleAlert, Type,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface OnlineTeleprompterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type PrompterState = "idle" | "countdown" | "playing" | "paused" | "done";

const DEFAULT_WPM = 150; // speaking pace used only for the time estimate

function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0:00";
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(r).padStart(2, "0")}`;
}

export function OnlineTeleprompterWorkspace({ selectedLanguage = "en" }: OnlineTeleprompterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const tp = (t as any).onlineTeleprompter || {};

  const [script, setScript] = useState("");
  const [state, setState] = useState<PrompterState>("idle");
  const [speed, setSpeed] = useState(60); // pixels per second
  const [fontSize, setFontSize] = useState(40);
  const [mirror, setMirror] = useState(false);
  const [useCountdown, setUseCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const stateRef = useRef<PrompterState>("idle");
  stateRef.current = state;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const words = useMemo(() => countWords(script), [script]);
  const chars = script.length;
  const estSeconds = words > 0 ? (words / DEFAULT_WPM) * 60 : 0;

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = null;
  }, []);

  const tick = useCallback((ts: number) => {
    const el = scrollerRef.current;
    if (!el || stateRef.current !== "playing") return;
    if (lastTsRef.current === null) lastTsRef.current = ts;
    const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
    lastTsRef.current = ts;
    el.scrollTop += speedRef.current * dt;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? Math.min(1, el.scrollTop / max) : 1;
    setProgress(p);
    if (max > 0 && el.scrollTop >= max - 1) {
      setState("done");
      stopLoop();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [stopLoop]);

  const startLoop = useCallback(() => {
    stopLoop();
    rafRef.current = requestAnimationFrame(tick);
  }, [stopLoop, tick]);

  const resetScroll = useCallback(() => {
    stopLoop();
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
    setProgress(0);
    setCountdown(3);
    setState("idle");
  }, [stopLoop]);

  const beginPlay = useCallback(() => {
    if (!script.trim()) return;
    if (stateRef.current === "done") resetScroll();
    if (useCountdown && stateRef.current !== "paused") {
      setState("countdown");
      setCountdown(3);
      return;
    }
    setState("playing");
  }, [script, useCountdown, resetScroll]);

  // Countdown 3-2-1, then scroll
  useEffect(() => {
    if (state !== "countdown") return;
    if (countdown <= 0) {
      setState("playing");
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 750);
    return () => window.clearTimeout(id);
  }, [state, countdown]);

  useEffect(() => {
    if (state === "playing") startLoop();
    else stopLoop();
  }, [state, startLoop, stopLoop]);

  useEffect(() => stopLoop, [stopLoop]);

  // Fullscreen tracking
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stageRef.current) await stageRef.current.requestFullscreen();
    } catch {
      /* fullscreen unavailable (e.g. iframe) — stage still works inline */
    }
  };

  const togglePlay = useCallback(() => {
    if (stateRef.current === "playing") setState("paused");
    else if (stateRef.current === "countdown") setState("paused");
    else beginPlay();
  }, [beginPlay]);

  // Spacebar play/pause — but never hijack typing in the editor or controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName || "";
      if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT" || target?.isContentEditable) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSpeed((s) => Math.min(240, s + 10));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSpeed((s) => Math.max(10, s - 10));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  const statusText =
    state === "playing" ? (tp.statusScrolling || "Scrolling…")
    : state === "countdown" ? (tp.statusCountdown || "Get ready…")
    : state === "paused" ? (tp.statusPaused || "Paused")
    : state === "done" ? (tp.statusDone || "End of script")
    : (tp.statusReady || "Ready");

  const sample = tp.sampleText || "Welcome, everyone. Today I will walk you through three simple ideas, one step at a time. Pause where you need to, breathe, and keep your eyes on the camera. When you are ready, let us begin.";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="onlineTeleprompter" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-violet-100 via-purple-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-violet-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.13),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              {tp.badge || "Online Teleprompter"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload • No Recording
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {tp.pageTitle || "Read Your Script While It Scrolls — Calm, Big and Steady"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {tp.subtitle || "Paste your script, set the speed and text size, and press play. Spacebar pauses, fullscreen clears the clutter, and mirror mode is there for real teleprompter glass. This tool only scrolls text — it never records you."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{tp.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {tp.quickAnswer || "It turns your script into large scrolling text you can read while looking at your camera or audience. You control the scroll speed, font size, an optional 3-2-1 countdown and fullscreen, and you can flip the text for teleprompter glass. It counts your words and estimates speaking time, and everything stays in this browser tab."}
        </p>
      </div>

      {/* Script editor */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="text-sm font-extrabold text-stone-900" htmlFor="tp-script">
            {tp.scriptLabel || "Your script"}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setScript(sample)}
              className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-900 text-xs font-bold transition-all cursor-pointer"
            >
              {tp.sampleBtn || "Try a sample"}
            </button>
            <button
              onClick={() => { setScript(""); resetScroll(); }}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eraser className="w-3.5 h-3.5" /> {tp.clearBtn || "Clear"}
            </button>
          </div>
        </div>
        <textarea
          id="tp-script"
          value={script}
          onChange={(e) => { setScript(e.target.value); if (state !== "idle") resetScroll(); }}
          placeholder={tp.placeholder || "Paste or type the words you want to read…"}
          rows={7}
          className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400"
        />
        <div className="flex gap-x-5 gap-y-1 flex-wrap text-xs text-stone-600 font-mono">
          <span>{tp.wordsLabel || "Words"}: <strong className="text-stone-900">{words}</strong></span>
          <span>{tp.charsLabel || "Characters"}: <strong className="text-stone-900">{chars}</strong></span>
          <span className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-violet-500" />
            {tp.estLabel || "Estimated speaking time"}: <strong className="text-stone-900">{formatDuration(estSeconds)}</strong>
            <span className="font-sans text-stone-400">{tp.estNote || `at ${DEFAULT_WPM} words/min`}</span>
          </span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          {tp.estHint || "The estimate divides your word count by a calm speaking pace. Your real pace will differ — rehearse once and adjust the scroll speed, not your voice."}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="tp-speed">
              {tp.speedLabel || "Scroll speed"} <span className="font-mono text-violet-700">{speed}</span>
            </label>
            <input
              id="tp-speed"
              type="range" min={10} max={240} step={5} value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
            <p className="text-xs text-stone-500 mt-1">{tp.speedHint || "Slower for speeches, faster for energetic videos. Arrow keys ↑/↓ nudge it while reading."}</p>
          </div>
          <div>
            <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="tp-font">
              {tp.fontLabel || "Font size"} <span className="font-mono text-violet-700">{fontSize}px</span>
            </label>
            <input
              id="tp-font"
              type="range" min={24} max={80} step={2} value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
            <p className="text-xs text-stone-500 mt-1">{tp.fontHint || "Bigger text means fewer eye movements on camera."}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
            <input
              type="checkbox" checked={useCountdown}
              onChange={(e) => setUseCountdown(e.target.checked)}
              className="w-4 h-4 accent-violet-600"
            />
            {tp.countdownLabel || "Countdown 3-2-1 before scrolling"}
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
            <input
              type="checkbox" checked={mirror}
              onChange={(e) => setMirror(e.target.checked)}
              className="w-4 h-4 accent-violet-600"
            />
            <FlipHorizontal2 className="w-4 h-4 text-violet-600" />
            {tp.mirrorLabel || "Mirror mode"}
          </label>
        </div>

        {mirror && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
              <strong className="text-amber-950">{tp.mirrorWarningTitle || "Mirror mode is for teleprompter glass."}</strong>{" "}
              {tp.mirrorWarning || "The text is flipped so it reads correctly when reflected in a beam-splitter glass rig. On a normal screen it will look reversed — that is expected. Turn it off for direct reading."}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={togglePlay}
            disabled={!script.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-500 hover:to-purple-400 disabled:opacity-40 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
          >
            {state === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {state === "playing" ? (tp.pauseBtn || "Pause") : state === "paused" ? (tp.resumeBtn || "Resume") : (tp.playBtn || "Play")}
          </button>
          <button
            onClick={resetScroll}
            className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> {tp.resetBtn || "Back to top"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-3 rounded-2xl border-2 border-violet-300 bg-violet-50 text-violet-900 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <Expand className="w-4 h-4" /> {isFullscreen ? (tp.exitFullscreenBtn || "Exit fullscreen") : (tp.fullscreenBtn || "Fullscreen")}
          </button>
          <span className="text-xs font-bold text-stone-500">{statusText}</span>
        </div>
        <p className="text-xs text-stone-500">{tp.keysHint || "Keyboard: Space = play / pause (outside the script box), ↑ / ↓ = speed, Esc exits fullscreen."}</p>
      </div>

      {/* Prompter stage */}
      <div
        ref={stageRef}
        className="rounded-3xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-950 flex flex-col"
      >
        <div className="h-1.5 bg-stone-800">
          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 transition-[width] duration-150" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="relative flex-1 min-h-[320px]">
          <div
            ref={scrollerRef}
            className="absolute inset-0 overflow-y-auto px-6 sm:px-14 py-[38%]"
            style={{ scrollbarWidth: "none" }}
            aria-live="off"
          >
            {script.trim() ? (
              <div
                className="text-center font-bold leading-snug text-stone-50 whitespace-pre-wrap break-words max-w-4xl mx-auto"
                style={{ fontSize: `${fontSize}px`, transform: mirror ? "scaleX(-1)" : undefined }}
              >
                {script}
              </div>
            ) : (
              <p className="text-center text-stone-500 text-base sm:text-lg font-semibold pt-16">
                {tp.emptyStage || "Your script will appear here in big letters. Add it in the box above, then press Play."}
              </p>
            )}
          </div>
          {/* reading guide line */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2 opacity-70">
            <span className="text-violet-400 text-xl leading-none">▶</span>
            <span className="flex-1 border-t border-dashed border-violet-500/40" />
            <span className="text-violet-400 text-xl leading-none rotate-180">▶</span>
          </div>
          {state === "countdown" && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-950/70">
              <span className="text-8xl sm:text-9xl font-black text-white tabular-nums" aria-live="polite">{countdown > 0 ? countdown : "•"}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 flex gap-3">
        <Type className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-stone-900">{tp.tipsTitle || "Read naturally, not robotically"}</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
            {tp.tipsText || "Put the stage as close to your camera as you can, break long sentences across lines, and set the scroll a touch slower than you think you need. If your eyes are visibly scanning, increase the font size before you increase the speed."}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{tp.honestTitle || "Honest limits — text only, on purpose"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {tp.honestText || "This teleprompter scrolls text and nothing more: it does not record video or audio, does not use your camera, and does not save your script anywhere. Record with the camera app you already trust, on a second device or the same screen, while this page does the scrolling."}
          </p>
          <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {tp.localNote || "Your script is processed only in this browser tab — never uploaded, stored or shared by this tool."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="onlineTeleprompter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
