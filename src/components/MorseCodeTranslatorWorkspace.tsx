import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Eraser, Lightbulb, Play, Radio, ShieldCheck, Square, TriangleAlert, Volume2,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface MorseCodeTranslatorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

// International Morse code (ITU) — letters, digits and common punctuation only.
// There is deliberately NO Urdu/Arabic/CJK/kana mapping here: standard Morse does
// not carry those scripts, and the UI says so instead of pretending otherwise.
const MORSE_MAP: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--", "'": ".----.",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", ":": "---...", ";": "-.-.-.",
  "-": "-....-", "+": ".-.-.", "=": "-...-", "@": ".--.-.", "&": ".-...",
  "\"": ".-..-.", "$": "...-..-", "_": "..--.-",
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([ch, code]) => [code, ch])
);

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIGITS = "0123456789".split("");
const PUNCTUATION = [".", ",", "?", "!", "'", "/", "(", ")", ":", ";", "-", "+", "=", "@", "&", "\"", "$", "_"];

function encodeText(input: string): { morse: string; unsupported: string[] } {
  const unsupported = new Set<string>();
  const words = input.toUpperCase().split(/\s+/).filter(Boolean);
  const encodedWords = words.map((word) =>
    word
      .split("")
      .map((ch) => {
        const code = MORSE_MAP[ch];
        if (!code) {
          unsupported.add(ch);
          return null;
        }
        return code;
      })
      .filter((c): c is string => c !== null)
      .join(" ")
  ).filter((w) => w.length > 0);
  return { morse: encodedWords.join(" / "), unsupported: [...unsupported] };
}

function decodeMorse(input: string): { text: string; unknownCount: number; groupCount: number } {
  const tokens = input.replace(/\//g, " / ").split(/\s+/).filter(Boolean);
  const words: string[][] = [[]];
  let unknownCount = 0;
  let groupCount = 0;
  for (const tok of tokens) {
    if (tok === "/") {
      if (words[words.length - 1].length > 0) words.push([]);
      continue;
    }
    groupCount += 1;
    const ch = REVERSE_MAP[tok];
    if (ch) {
      words[words.length - 1].push(ch);
    } else {
      unknownCount += 1;
      words[words.length - 1].push("?");
    }
  }
  const text = words
    .map((w) => w.join(""))
    .filter((w) => w.length > 0)
    .join(" ");
  return { text, unknownCount, groupCount };
}

interface SignalEvent {
  on: boolean;
  units: number;
}

// Standard timing: dot = 1 unit, dash = 3, gap inside a letter = 1,
// gap between letters = 3, gap between words = 7.
function buildEvents(morse: string): SignalEvent[] {
  const tokens = morse.replace(/\//g, " / ").split(/\s+/).filter(Boolean);
  const events: SignalEvent[] = [];
  let firstLetter = true;
  let gapBefore = 3;
  for (const tok of tokens) {
    if (tok === "/") {
      gapBefore = 7;
      continue;
    }
    if (!/^[.-]+$/.test(tok)) continue;
    if (!firstLetter) events.push({ on: false, units: gapBefore });
    gapBefore = 3;
    firstLetter = false;
    tok.split("").forEach((sym, i) => {
      if (i > 0) events.push({ on: false, units: 1 });
      events.push({ on: true, units: sym === "-" ? 3 : 1 });
    });
  }
  return events;
}

export function MorseCodeTranslatorWorkspace({ selectedLanguage = "en" }: MorseCodeTranslatorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const mc = (t as any).morseCodeTranslator || {};

  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [textInput, setTextInput] = useState("");
  const [morseInput, setMorseInput] = useState("");
  const [copied, setCopied] = useState("");
  const [wpm, setWpm] = useState(15);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lampOn, setLampOn] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const playingRef = useRef(false);

  const encoded = useMemo(() => encodeText(textInput), [textInput]);
  const decoded = useMemo(() => decodeMorse(morseInput), [morseInput]);
  const currentMorse = mode === "encode" ? encoded.morse : morseInput;
  const unitMs = 1200 / wpm;

  const stopPlayback = () => {
    playingRef.current = false;
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch { /* already stopped */ }
      try { oscRef.current.disconnect(); } catch { /* noop */ }
      oscRef.current = null;
    }
    if (ctxRef.current) {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      ctx.close().catch(() => undefined);
    }
    setLampOn(false);
    setIsPlaying(false);
  };

  useEffect(() => stopPlayback, []);
  useEffect(() => {
    stopPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, textInput, morseInput]);

  const playMorse = () => {
    const events = buildEvents(currentMorse);
    if (events.length === 0 || playingRef.current) return;
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return;
    stopPlayback();
    const ctx: AudioContext = new AudioCtor();
    ctxRef.current = ctx;
    playingRef.current = true;
    setIsPlaying(true);

    const step = (i: number) => {
      if (!playingRef.current || !ctxRef.current) return;
      if (i >= events.length) {
        stopPlayback();
        return;
      }
      const ev = events[i];
      const ms = Math.max(20, ev.units * unitMs);
      if (ev.on) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.008);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscRef.current = osc;
        if (flashEnabled) setLampOn(true);
      }
      timeoutRef.current = window.setTimeout(() => {
        if (oscRef.current) {
          try { oscRef.current.stop(); } catch { /* noop */ }
          try { oscRef.current.disconnect(); } catch { /* noop */ }
          oscRef.current = null;
        }
        setLampOn(false);
        step(i + 1);
      }, ms);
    };
    step(0);
  };

  const copyText = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(key);
    window.setTimeout(() => setCopied((c) => (c === key ? "" : c)), 1600);
  };

  const loadSample = () => {
    if (mode === "encode") {
      setTextInput("HELLO WORLD");
    } else {
      setMorseInput(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
    }
  };

  const inputValue = mode === "encode" ? textInput : morseInput;
  const outputValue = mode === "encode" ? encoded.morse : decoded.text;

  const chartChip = (ch: string) => (
    <div key={ch} className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
      <span className="font-extrabold text-stone-900 text-sm">{ch}</span>
      <span className="font-mono text-cyan-800 text-sm tracking-widest">{MORSE_MAP[ch]}</span>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="morseCodeTranslator" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-cyan-100 via-sky-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-cyan-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.14),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              {mc.badge || "Morse Code Translator"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {mc.pageTitle || "Turn Text into Morse Code — and Back Again"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {mc.subtitle || "Type plain text and get dots and dashes, or paste Morse code and read it back. Play it as beeps, watch it flash, and check the full chart — all in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{mc.limitsTitle || "What Morse code can (and can't) carry"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {mc.limitsText || "International Morse covers A–Z, 0–9 and common punctuation. Characters outside that set are left out of the Morse output and listed under the result, never silently changed. Text written in Urdu, Arabic, Chinese, Japanese or other non-Latin scripts cannot be encoded directly — write the words in Latin letters first (transliteration), then convert."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setMode("encode")}
            className={`px-3 py-3 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${mode === "encode" ? "border-cyan-500 bg-cyan-50 text-cyan-900 shadow-md" : "border-stone-200 bg-white text-stone-600 hover:border-cyan-300"}`}
          >
            {mc.modeEncode || "Text → Morse"}
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`px-3 py-3 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${mode === "decode" ? "border-cyan-500 bg-cyan-50 text-cyan-900 shadow-md" : "border-stone-200 bg-white text-stone-600 hover:border-cyan-300"}`}
          >
            {mc.modeDecode || "Morse → Text"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="morse-input">
            {mode === "encode" ? (mc.textInputLabel || "Your text") : (mc.morseInputLabel || "Your Morse code")}
          </label>
          <textarea
            id="morse-input"
            value={inputValue}
            onChange={(e) => (mode === "encode" ? setTextInput(e.target.value) : setMorseInput(e.target.value))}
            placeholder={mode === "encode"
              ? (mc.textPlaceholder || "Type or paste text here — try SOS or HELLO WORLD")
              : (mc.morsePlaceholder || "Type dots (.) and dashes (-), one space between letters, / between words")}
            rows={4}
            spellCheck={false}
            className={`w-full rounded-xl border border-stone-300 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${mode === "decode" ? "font-mono" : ""}`}
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button
              onClick={loadSample}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              {mc.trySampleBtn || "Try an example"}
            </button>
            <button
              onClick={() => (mode === "encode" ? setTextInput("") : setMorseInput(""))}
              className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Eraser className="w-3.5 h-3.5" /> {mc.clearBtn || "Clear"}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="block text-sm font-extrabold text-stone-900">
              {mode === "encode" ? (mc.morseOutputLabel || "Morse code") : (mc.textOutputLabel || "Decoded text")}
            </span>
            <button
              onClick={() => copyText(outputValue, "output")}
              disabled={!outputValue}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              {copied === "output" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === "output" ? (mc.copiedLabel || "Copied") : (mc.copyBtn || "Copy")}
            </button>
          </div>
          <div className={`w-full min-h-[96px] rounded-xl border border-cyan-200 bg-cyan-50/60 px-4 py-3 text-sm sm:text-base whitespace-pre-wrap break-words ${mode === "encode" ? "font-mono tracking-wider" : ""}`}>
            {outputValue || <span className="text-stone-400">…</span>}
          </div>
          {mode === "encode" && encoded.unsupported.length > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
              <span className="font-mono font-bold">{encoded.unsupported.join(" ")}</span>
            </p>
          )}
          {mode === "decode" && decoded.unknownCount > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
              {mc.unknownText || "In Morse → Text, any group that matches no letter, digit or punctuation mark is shown as ? so you can find and fix it."}
            </p>
          )}
          <p className="text-xs text-stone-500 mt-2">{mc.timingText || "Timing rules: a dash lasts 3 dots, the gap inside one letter is 1 dot, the gap between letters is 3 dots, and the gap between words is 7 dots."}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 p-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            {!isPlaying ? (
              <button
                onClick={playMorse}
                disabled={!currentMorse.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-40 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
              >
                <Play className="w-4 h-4" /> {mc.playBtn || "Play sound"}
              </button>
            ) : (
              <button
                onClick={stopPlayback}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
              >
                <Square className="w-4 h-4" /> {mc.stopBtn || "Stop"}
              </button>
            )}
            {isPlaying && <span className="text-xs font-bold text-cyan-700">{mc.playingLabel || "Playing…"}</span>}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-extrabold text-stone-900" htmlFor="morse-wpm">
              {mc.speedLabel || "Speed"}: {wpm} {mc.speedUnit || "WPM"}
            </label>
            <input
              id="morse-wpm"
              type="range"
              min={5}
              max={40}
              step={1}
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-48 accent-cyan-600"
            />
            <span className="text-xs text-stone-500 font-mono">{unitMs.toFixed(0)} ms / dot</span>
          </div>

          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <div
                aria-hidden="true"
                className={`w-20 h-20 rounded-full border-4 transition-all duration-100 ${
                  lampOn
                    ? "bg-amber-300 border-amber-500 shadow-[0_0_45px_18px_rgba(251,191,36,0.55)]"
                    : "bg-stone-200 border-stone-300"
                }`}
              />
              <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" /> {mc.flashLabel || "Flash light"}
              </span>
            </div>
            <div className="flex-1 min-w-[220px] space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flashEnabled}
                  onChange={(e) => setFlashEnabled(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-cyan-600"
                />
                <span className="block text-sm font-extrabold text-stone-900 pt-0.5">{mc.flashLabel || "Flash light"}</span>
              </label>
              {flashEnabled && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex gap-2">
                  <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    <strong>{mc.flashCautionTitle || "Flashing light — please note"}:</strong>{" "}
                    {mc.flashCautionText || "When flash is on, the lamp panel lights in time with the beeps. The flash follows normal Morse timing and never strobes faster than that, but if flashing lights bother you — or you have photosensitive epilepsy — leave it off and listen instead. You can stop playback at any time."}
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-stone-500 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            {mc.localNote || "Everything runs in this browser tab — nothing you type is uploaded or stored."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-extrabold text-stone-900 mb-1">{mc.chartTitle || "Full Morse code chart"}</h2>
        <p className="text-xs text-stone-500 mb-4">{mc.timingText || "Timing rules: a dash lasts 3 dots, the gap inside one letter is 1 dot, the gap between letters is 3 dots, and the gap between words is 7 dots."}</p>

        <h3 className="text-sm font-extrabold text-stone-700 mb-2">{mc.chartLettersLabel || "Letters"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-5">
          {LETTERS.map(chartChip)}
        </div>

        <h3 className="text-sm font-extrabold text-stone-700 mb-2">{mc.chartNumbersLabel || "Numbers"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-5">
          {DIGITS.map(chartChip)}
        </div>

        <h3 className="text-sm font-extrabold text-stone-700 mb-2">{mc.chartPunctuationLabel || "Punctuation"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {PUNCTUATION.map(chartChip)}
        </div>
      </div>

      <ToolGuideSection toolId="morseCodeTranslator" selectedLanguage={selectedLanguage} />
    </div>
  );
}
