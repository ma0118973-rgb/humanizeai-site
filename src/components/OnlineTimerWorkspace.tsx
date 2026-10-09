import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Eraser, Flag, Info, Maximize, Pause, Play, RotateCcw, ShieldCheck, Timer, Volume2, VolumeX,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface OnlineTimerWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Mode = "timer" | "stopwatch";

interface LapEntry {
  n: number;
  lapMs: number;
  totalMs: number;
}

function pad2(n: number): string {
  return String(Math.max(0, Math.floor(Math.abs(n)))).padStart(2, "0");
}

/** Format elapsed/remaining ms as H:MM:SS (hours omitted when zero for countdown) or M:SS.cc for stopwatch. */
function fmtClock(ms: number, centis: boolean): string {
  const total = Math.max(0, ms);
  const h = Math.floor(total / 3600000);
  const m = Math.floor((total % 3600000) / 60000);
  const s = Math.floor((total % 60000) / 1000);
  const cs = Math.floor((total % 1000) / 10);
  if (centis) {
    if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
    return `${m}:${pad2(s)}.${pad2(cs)}`;
  }
  if (h > 0) return `${h}:${pad2(m)}:${pad2(s)}`;
  return `${pad2(m)}:${pad2(s)}`;
}

export function OnlineTimerWorkspace({ selectedLanguage = "en" }: OnlineTimerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ot = (t as any).onlineTimer || {};

  const [mode, setMode] = useState<Mode>("timer");

  // ---- Countdown state (timestamp-based) ----
  const [hStr, setHStr] = useState("0");
  const [mStr, setMStr] = useState("5");
  const [sStr, setSStr] = useState("0");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [flash, setFlash] = useState(false);
  const timerEndRef = useRef<number | null>(null); // performance.now() deadline
  const timerRemainRef = useRef<number>(5 * 60000); // ms remaining when paused / initial
  const [, setTick] = useState(0);

  const configMs = useMemo(() => {
    const h = Math.min(99, Math.max(0, parseInt(hStr, 10) || 0));
    const m = Math.min(999, Math.max(0, parseInt(mStr, 10) || 0));
    const s = Math.min(999, Math.max(0, parseInt(sStr, 10) || 0));
    return (h * 3600 + m * 60 + s) * 1000;
  }, [hStr, mStr, sStr]);

  const remainingMs = timerRunning && timerEndRef.current != null
    ? Math.max(0, timerEndRef.current - performance.now())
    : timerRemainRef.current;
  const progress = configMs > 0 ? Math.min(1, Math.max(0, remainingMs / configMs)) : 0;

  // ---- Stopwatch state (timestamp-based) ----
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<LapEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const swStartRef = useRef<number | null>(null); // perf timestamp of (re)start minus accumulated
  const swAccumRef = useRef<number>(0);
  const lastLapRef = useRef<number>(0);

  const swElapsed = swRunning && swStartRef.current != null
    ? performance.now() - swStartRef.current
    : swAccumRef.current;

  const wakeLockRef = useRef<any>(null);
  const [wakeOn, setWakeOn] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  // Render loop: only drives display; all values recomputed from timestamps.
  useEffect(() => {
    if (!timerRunning && !swRunning) return;
    let raf = 0;
    const loop = () => {
      setTick((x) => x + 1);
      if (timerRunning && timerEndRef.current != null && performance.now() >= timerEndRef.current) {
        finishTimer();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning, swRunning]);

  const beep = () => {
    if (!soundOn) return;
    try {
      if (!audioRef.current) {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AC) return;
        audioRef.current = new AC();
      }
      const ctx = audioRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") void ctx.resume();
      const t0 = ctx.currentTime;
      [0, 0.22, 0.44].forEach((off) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, t0 + off);
        gain.gain.exponentialRampToValueAtTime(0.25, t0 + off + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + off + 0.18);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + off);
        osc.stop(t0 + off + 0.2);
      });
    } catch { /* audio unavailable / blocked in this context */ }
  };

  const finishTimer = () => {
    setTimerRunning(false);
    setTimerFinished(true);
    timerRemainRef.current = 0;
    timerEndRef.current = null;
    setFlash(true);
    beep();
    setTimeout(() => setFlash(false), 2400);
  };

  const startTimer = () => {
    if (timerFinished || remainingMs <= 0) {
      timerRemainRef.current = configMs;
    }
    if (timerRemainRef.current <= 0) return;
    setTimerFinished(false);
    timerEndRef.current = performance.now() + timerRemainRef.current;
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    if (timerEndRef.current != null) {
      timerRemainRef.current = Math.max(0, timerEndRef.current - performance.now());
    }
    timerEndRef.current = null;
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerFinished(false);
    setFlash(false);
    timerEndRef.current = null;
    timerRemainRef.current = configMs;
  };

  const applyPreset = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    setHStr(String(h)); setMStr(String(m)); setSStr(String(s));
    setTimerRunning(false);
    setTimerFinished(false);
    timerEndRef.current = null;
    timerRemainRef.current = totalSec * 1000;
  };

  const addMinute = () => {
    if (timerRunning && timerEndRef.current != null) {
      timerEndRef.current += 60000;
    } else {
      timerRemainRef.current += 60000;
    }
    setTimerFinished(false);
    setTick((x) => x + 1);
  };

  // ---- Stopwatch controls ----
  const startSw = () => {
    swStartRef.current = performance.now() - swAccumRef.current;
    setSwRunning(true);
  };
  const pauseSw = () => {
    if (swStartRef.current != null) swAccumRef.current = performance.now() - swStartRef.current;
    setSwRunning(false);
  };
  const resetSw = () => {
    setSwRunning(false);
    swStartRef.current = null;
    swAccumRef.current = 0;
    lastLapRef.current = 0;
    setLaps([]);
  };
  const addLap = () => {
    if (!swRunning || swStartRef.current == null) return;
    const total = performance.now() - swStartRef.current;
    const lapMs = total - lastLapRef.current;
    lastLapRef.current = total;
    setLaps((prev) => [...prev, { n: prev.length + 1, lapMs, totalMs: total }]);
  };
  const copyLaps = async () => {
    const head = `${ot.lapColumn || "Lap"}\t${ot.lapTimeColumn || "Lap time"}\t${ot.totalTimeColumn || "Total"}`;
    const lines = laps.map((l) => `${l.n}\t${fmtClock(l.lapMs, true)}\t${fmtClock(l.totalMs, true)}`);
    try {
      await navigator.clipboard.writeText([head, ...lines].join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const fastest = laps.length >= 2 ? laps.reduce((a, b) => (b.lapMs < a.lapMs ? b : a)) : null;
  const slowest = laps.length >= 2 ? laps.reduce((a, b) => (b.lapMs > a.lapMs ? b : a)) : null;

  // ---- Wake lock (best-effort, guarded) ----
  const toggleWake = async () => {
    try {
      if (wakeOn && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeOn(false);
        return;
      }
      const nav: any = navigator as any;
      if (nav.wakeLock && typeof nav.wakeLock.request === "function") {
        wakeLockRef.current = await nav.wakeLock.request("screen");
        setWakeOn(true);
      }
    } catch { /* wake lock unsupported or denied */ }
  };
  useEffect(() => () => {
    try { void wakeLockRef.current?.release?.(); } catch { /* noop */ }
  }, []);

  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen();
    } catch { /* fullscreen unsupported (e.g. some phones) */ }
  };

  // Space = start/pause for the active mode (ignored while typing in fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (mode === "timer") { if (timerRunning) pauseTimer(); else startTimer(); }
        else if (swRunning) pauseSw(); else startSw();
      } else if ((e.key === "l" || e.key === "L") && mode === "stopwatch") {
        addLap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, timerRunning, swRunning, configMs]);

  const presets: { label: string; sec: number }[] = [
    { label: "1:00", sec: 60 }, { label: "5:00", sec: 300 }, { label: "10:00", sec: 600 },
    { label: "15:00", sec: 900 }, { label: "25:00", sec: 1500 }, { label: "30:00", sec: 1800 },
    { label: "45:00", sec: 2700 }, { label: "1:00:00", sec: 3600 },
  ];

  const statusText = mode === "timer"
    ? (timerFinished ? (ot.statusFinished || "Finished") : timerRunning ? (ot.statusRunning || "Running") : remainingMs < configMs && remainingMs > 0 ? (ot.statusPaused || "Paused") : (ot.statusReady || "Ready"))
    : (swRunning ? (ot.statusRunning || "Running") : swElapsed > 0 ? (ot.statusPaused || "Paused") : (ot.statusReady || "Ready"));

  const numInput = "w-full px-3 py-3 rounded-2xl border border-stone-300 text-center text-2xl font-extrabold text-stone-900 focus:outline-none focus:border-teal-600";

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="onlineTimer" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -z-0 opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-700 text-white self-start shadow-sm">
            <Timer className="w-3.5 h-3.5" /> {ot.badge || "Online Timer & Stopwatch"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {ot.pageTitle || "One Timer for Countdowns and Stopwatch Laps"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ot.subtitle || "Set a countdown for cooking, study or presentations, or count up with a stopwatch and laps. Everything runs in your browser — nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-700 text-white rounded-xl shrink-0"><Info className="w-4 h-4" /></div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-teal-950">{ot.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {ot.quickAnswer || "It combines a countdown timer and a stopwatch with laps in one tool, both computed from real timestamps. Sound needs a tap first and background tabs can be throttled."}
            </p>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-3xl border shadow-lg p-4 sm:p-6 space-y-5 transition-colors ${flash ? "border-red-400 bg-red-50" : "border-stone-200"}`}>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setMode("timer")} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "timer" ? "bg-teal-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
            {ot.modeTimer || "Countdown Timer"}
          </button>
          <button onClick={() => setMode("stopwatch")} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "stopwatch" ? "bg-teal-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
            {ot.modeStopwatch || "Stopwatch"}
          </button>
        </div>

        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-stone-500" aria-live="polite">{statusText}</p>

        {mode === "timer" && (
          <div className="space-y-5">
            <div className={`text-center font-extrabold tabular-nums text-stone-900 leading-none ${flash ? "text-red-700" : ""}`} style={{ fontSize: "clamp(3rem, 12vw, 6.5rem)" }} aria-live="off">
              {fmtClock(remainingMs, false)}
            </div>
            {timerFinished && (
              <p className="text-center text-lg font-extrabold text-red-700" role="alert">{ot.timerDone || "Time is up!"}</p>
            )}
            <div className="h-3 rounded-full bg-stone-100 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              <div className="h-full bg-teal-600 transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1 text-center" htmlFor="ot-h">{ot.hoursLabel || "Hours"}</label>
                <input id="ot-h" type="number" min={0} max={99} value={hStr} disabled={timerRunning}
                  onChange={(e) => { setHStr(e.target.value); setTimerFinished(false); timerRemainRef.current = configMs; }} className={numInput} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1 text-center" htmlFor="ot-m">{ot.minutesLabel || "Minutes"}</label>
                <input id="ot-m" type="number" min={0} max={999} value={mStr} disabled={timerRunning}
                  onChange={(e) => { setMStr(e.target.value); setTimerFinished(false); timerRemainRef.current = configMs; }} className={numInput} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1 text-center" htmlFor="ot-s">{ot.secondsLabel || "Seconds"}</label>
                <input id="ot-s" type="number" min={0} max={999} value={sStr} disabled={timerRunning}
                  onChange={(e) => { setSStr(e.target.value); setTimerFinished(false); timerRemainRef.current = configMs; }} className={numInput} />
              </div>
            </div>
            {/* keep paused/initial remaining in sync with edited fields */}
            <SyncRemain running={timerRunning} finished={timerFinished} configMs={configMs} remainRef={timerRemainRef} />

            <div>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 text-center">{ot.presetsTitle || "Quick presets"}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {presets.map((p) => (
                  <button key={p.label} onClick={() => applyPreset(p.sec)} className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-teal-100 text-sm font-extrabold text-stone-700 cursor-pointer transition tabular-nums">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
              {!timerRunning ? (
                <button onClick={startTimer} className="px-4 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white text-sm font-extrabold cursor-pointer shadow flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" /> {remainingMs > 0 && remainingMs < configMs ? (ot.resumeBtn || "Resume") : (ot.startBtn || "Start")}
                </button>
              ) : (
                <button onClick={pauseTimer} className="px-4 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-extrabold cursor-pointer shadow flex items-center justify-center gap-2">
                  <Pause className="w-4 h-4" /> {ot.pauseBtn || "Pause"}
                </button>
              )}
              <button onClick={addMinute} className="px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold cursor-pointer flex items-center justify-center">
                {ot.addMinuteBtn || "+1 min"}
              </button>
              <button onClick={resetTimer} className="px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> {ot.resetBtn || "Reset"}
              </button>
            </div>
            <p className="text-center text-xs text-stone-500">{ot.timerHint || "Set a time above, then press Start. The bar shows how much of the countdown is left."}</p>
          </div>
        )}

        {mode === "stopwatch" && (
          <div className="space-y-5">
            <div className="text-center font-extrabold tabular-nums text-stone-900 leading-none" style={{ fontSize: "clamp(2.6rem, 11vw, 6rem)" }}>
              {fmtClock(swElapsed, true)}
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
              {!swRunning ? (
                <button onClick={startSw} className="px-4 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white text-sm font-extrabold cursor-pointer shadow flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" /> {swElapsed > 0 ? (ot.resumeBtn || "Resume") : (ot.startBtn || "Start")}
                </button>
              ) : (
                <button onClick={pauseSw} className="px-4 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-extrabold cursor-pointer shadow flex items-center justify-center gap-2">
                  <Pause className="w-4 h-4" /> {ot.pauseBtn || "Pause"}
                </button>
              )}
              <button onClick={addLap} disabled={!swRunning} className="px-4 py-3.5 rounded-2xl bg-stone-800 text-white text-sm font-bold cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Flag className="w-4 h-4" /> {ot.lapBtn || "Lap"}
              </button>
              <button onClick={resetSw} className="px-4 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> {ot.resetBtn || "Reset"}
              </button>
            </div>
            <p className="text-center text-xs text-stone-500">{ot.stopwatchHint || "Press Start, then use Lap to mark each split without stopping the clock."}</p>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wide">{ot.lapsTitle || "Laps"}</h3>
                {laps.length > 0 && (
                  <div className="flex gap-3">
                    <button onClick={copyLaps} className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer inline-flex items-center gap-1">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? (ot.copied || "Copied!") : (ot.copyLapsBtn || "Copy laps")}
                    </button>
                    <button onClick={() => { setLaps([]); lastLapRef.current = swRunning && swStartRef.current != null ? performance.now() - swStartRef.current : swAccumRef.current; }} className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer inline-flex items-center gap-1">
                      <Eraser className="w-3.5 h-3.5" /> {ot.clearLapsBtn || "Clear laps"}
                    </button>
                  </div>
                )}
              </div>
              {laps.length === 0 ? (
                <p className="text-xs sm:text-sm text-stone-500 bg-stone-50 rounded-xl px-3 py-3">{ot.lapsEmpty || "No laps yet. Press Lap while the stopwatch is running."}</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-stone-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-left text-[11px] uppercase tracking-wide text-stone-500">
                        <th className="px-3 py-2">{ot.lapColumn || "Lap"}</th>
                        <th className="px-3 py-2">{ot.lapTimeColumn || "Lap time"}</th>
                        <th className="px-3 py-2">{ot.totalTimeColumn || "Total"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...laps].reverse().map((l) => (
                        <tr key={l.n} className="border-t border-stone-100 tabular-nums">
                          <td className="px-3 py-2 font-bold text-stone-700">
                            {l.n}
                            {fastest && l.n === fastest.n && <span className="ml-2 text-[10px] font-extrabold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">{ot.fastestLabel || "fastest"}</span>}
                            {slowest && fastest && l.n === slowest.n && fastest.n !== slowest.n && <span className="ml-2 text-[10px] font-extrabold text-red-700 bg-red-100 rounded px-1.5 py-0.5">{ot.slowestLabel || "slowest"}</span>}
                          </td>
                          <td className="px-3 py-2 font-bold text-stone-900">{fmtClock(l.lapMs, true)}</td>
                          <td className="px-3 py-2 text-stone-600">{fmtClock(l.totalMs, true)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button onClick={() => setSoundOn(!soundOn)} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 ${soundOn ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600"}`} title={ot.soundHint || ""}>
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />} {ot.soundLabel || "Sound at the end"}
          </button>
          <button onClick={toggleWake} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${wakeOn ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600"}`} title={ot.wakeLockHint || ""}>
            {ot.wakeLockLabel || "Keep screen on"}{wakeOn ? " ✓" : ""}
          </button>
          <button onClick={toggleFullscreen} className="px-3 py-2 rounded-xl text-xs font-bold cursor-pointer bg-stone-100 text-stone-600 inline-flex items-center gap-1.5">
            <Maximize className="w-4 h-4" /> {ot.fullscreenBtn || "Fullscreen"}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-amber-900 mb-1">{ot.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {ot.honestText || "Browsers throttle hidden tabs, can delay the finish beep, and may block sound until you interact. Never use a browser timer for medical, safety, laboratory or emergency timing."}
          </p>
        </div>
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {ot.privacyTitle || "Private by design"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {ot.privacyNote || "Your times, presets and laps never leave this browser tab. Nothing is uploaded, saved to an account or shared."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="onlineTimer" selectedLanguage={selectedLanguage} />
    </div>
  );
}

/** Keeps the paused remaining time following field edits (typing a new length re-arms the countdown). */
function SyncRemain({ running, finished, configMs, remainRef }: { running: boolean; finished: boolean; configMs: number; remainRef: React.MutableRefObject<number> }) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; remainRef.current = configMs; return; }
    if (!running && !finished) remainRef.current = configMs;
  }, [configMs, running, finished, remainRef]);
  return null;
}
