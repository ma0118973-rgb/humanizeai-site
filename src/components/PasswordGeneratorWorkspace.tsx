import React, { useEffect, useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Info, KeyRound, Lock, RefreshCw, ShieldCheck, Sparkles,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface PasswordGeneratorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/",
} as const;

type SetKey = keyof typeof SETS;

// Characters people regularly confuse when reading or retyping a password.
const AMBIGUOUS = new Set("Il1O0|`'\"()[]{};:,.<>".split(""));

function buildPool(selected: Record<SetKey, boolean>, excludeAmbiguous: boolean): { pool: string; perSet: string[] } {
  const perSet: string[] = [];
  (Object.keys(SETS) as SetKey[]).forEach((key) => {
    if (!selected[key]) return;
    let chars: string = SETS[key];
    if (excludeAmbiguous) chars = chars.split("").filter((c) => !AMBIGUOUS.has(c)).join("");
    if (chars) perSet.push(chars);
  });
  return { pool: perSet.join(""), perSet };
}

/** Unbiased random integer in [0, max) from crypto.getRandomValues (rejection sampling). */
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let v = 0;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

function generatePassword(length: number, pool: string, perSet: string[]): string {
  const chars: string[] = [];
  // Guarantee at least one character from every selected set (when length allows).
  if (length >= perSet.length) {
    for (const set of perSet) chars.push(set[randomInt(set.length)]);
  }
  while (chars.length < length) chars.push(pool[randomInt(pool.length)]);
  // Fisher–Yates shuffle with cryptographic randomness.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function strengthBand(bits: number): 0 | 1 | 2 | 3 | 4 {
  if (bits < 40) return 0;
  if (bits < 60) return 1;
  if (bits < 80) return 2;
  if (bits < 110) return 3;
  return 4;
}

const BAND_COLORS = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

export function PasswordGeneratorWorkspace({ selectedLanguage = "en" }: PasswordGeneratorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const pg = (t as any).passwordGen || {};

  const [length, setLength] = useState(16);
  const [count, setCount] = useState(5);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const selected = useMemo(
    () => ({ upper: useUpper, lower: useLower, numbers: useNumbers, symbols: useSymbols }),
    [useUpper, useLower, useNumbers, useSymbols]
  );
  const { pool, perSet } = useMemo(() => buildPool(selected, excludeAmbiguous), [selected, excludeAmbiguous]);
  const anySet = pool.length > 0;

  // Estimated entropy: length x log2(pool size). A rough estimate, labelled as one.
  const entropyBits = anySet ? Math.round(length * Math.log2(pool.length)) : 0;
  const band = strengthBand(entropyBits);
  const bandLabels = [pg.strengthVeryWeak, pg.strengthWeak, pg.strengthFair, pg.strengthStrong, pg.strengthVeryStrong];

  const regenerate = () => {
    if (!anySet || typeof crypto === "undefined" || !crypto.getRandomValues) {
      setPasswords([]);
      return;
    }
    const list: string[] = [];
    for (let i = 0; i < count; i++) list.push(generatePassword(length, pool, perSet));
    setPasswords(list);
    setCopiedIndex(null);
    setCopiedAll(false);
  };

  // Generate on first load and whenever the recipe changes.
  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, count, pool]);

  const copyOne = async (pw: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(pw);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const copyAll = async () => {
    if (!passwords.length) return;
    try {
      await navigator.clipboard.writeText(passwords.join("\n"));
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const toggles: { key: SetKey; label: string; checked: boolean; onChange: (v: boolean) => void }[] = [
    { key: "upper", label: pg.upperLabel || "ABC Uppercase", checked: useUpper, onChange: setUseUpper },
    { key: "lower", label: pg.lowerLabel || "abc Lowercase", checked: useLower, onChange: setUseLower },
    { key: "numbers", label: pg.numbersLabel || "123 Numbers", checked: useNumbers, onChange: setUseNumbers },
    { key: "symbols", label: pg.symbolsLabel || "#$& Symbols", checked: useSymbols, onChange: setUseSymbols },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="passwordGenerator" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white self-start shadow-sm">
            <KeyRound className="w-3.5 h-3.5" /> {pg.badge || "Password Generator"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {pg.pageTitle || "Create a Strong Random Password"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {pg.subtitle || "Set the length and characters, and get fresh random passwords made on your own device. Nothing you generate is uploaded, stored or even seen by us."}
          </p>
        </div>
      </div>

      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-indigo-950">{pg.quickAnswerTitle || "Quick Answer: What Does This Password Generator Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {pg.quickAnswer || "It builds random passwords from the characters you allow, using your device's cryptographic random source. The passwords exist only in this browser tab — we never receive, store or send them."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-5">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="pg-length" className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
              <span>{pg.lengthLabel || "Password length"}</span>
              <span className="text-sm font-extrabold text-indigo-700 normal-case tracking-normal">{length}</span>
            </label>
            <input
              id="pg-length"
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-semibold"><span>4</span><span>64</span></div>
          </div>
          <div>
            <label htmlFor="pg-count" className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
              <span>{pg.countLabel || "How many passwords"}</span>
              <span className="text-sm font-extrabold text-indigo-700 normal-case tracking-normal">{count}</span>
            </label>
            <input
              id="pg-count"
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-semibold"><span>1</span><span>20</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {toggles.map((item) => (
            <label
              key={item.key}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${item.checked ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-stone-50 text-stone-600 border-stone-200 hover:border-indigo-300"}`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(e) => item.onChange(e.target.checked)}
                className="accent-white w-4 h-4 cursor-pointer"
              />
              {item.label}
            </label>
          ))}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            className="mt-0.5 accent-indigo-600 w-4 h-4 cursor-pointer"
          />
          <span>
            <span className="block text-xs font-bold text-stone-800">{pg.excludeLabel || "Exclude look-alike characters"}</span>
            <span className="block text-[11px] text-stone-500">{pg.excludeHint || "Removes I, l, 1, O, 0 and similar — kinder when a password must be read or typed by hand."}</span>
          </span>
        </label>

        {!anySet && (
          <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
            {pg.needSet || "Turn on at least one character set."}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={regenerate}
            disabled={!anySet}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 cursor-pointer shadow"
          >
            <RefreshCw className="w-4 h-4" /> {pg.generateBtn || "Generate new passwords"}
          </button>
          <button
            onClick={copyAll}
            disabled={!passwords.length}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer"
          >
            {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedAll ? (pg.copiedAll || "All copied!") : (pg.copyAllBtn || "Copy all")}
          </button>
        </div>

        {/* Strength panel */}
        {anySet && (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{pg.strengthLabel || "Estimated strength"}</span>
              <span className="text-sm font-extrabold text-stone-900">{bandLabels[band] || ""}</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i <= band ? BAND_COLORS[band] : "bg-stone-200"}`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-stone-600 font-semibold">
              <span>{pg.entropyLabel || "Entropy (estimate)"}: <span className="text-stone-900">{entropyBits} {pg.bitsUnit || "bits"}</span></span>
              <span>{pg.poolLabel || "Character pool"}: <span className="text-stone-900">{pool.length}</span></span>
              <span>{pg.lengthLabel || "Password length"}: <span className="text-stone-900">{length}</span></span>
            </div>
          </div>
        )}

        {/* Results */}
        <div>
          <h2 className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-600" /> {pg.resultsTitle || "Your passwords"}
          </h2>
          {passwords.length ? (
            <ul className="space-y-2">
              {passwords.map((pw, idx) => (
                <li key={idx} className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2.5">
                  <span className="flex-1 font-mono text-sm sm:text-base text-stone-900 break-all leading-relaxed">{pw}</span>
                  <button
                    onClick={() => copyOne(pw, idx)}
                    aria-label={pg.copyBtn || "Copy"}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-[11px] font-bold hover:border-indigo-400 hover:text-indigo-700 cursor-pointer"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedIndex === idx ? (pg.copied || "Copied!") : (pg.copyBtn || "Copy")}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-stone-500 bg-stone-50 border border-dashed border-stone-300 rounded-2xl px-4 py-5 text-center">
              {pg.emptyHint || "Your passwords will appear here."}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-indigo-600" /> {pg.honestTitle || "An estimate, not a promise"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{pg.honestText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-indigo-600" /> {pg.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{pg.privacyNote}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-indigo-600" /> {pg.managerTitle || "Store it somewhere proper"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{pg.managerText}</p>
        </div>
      </div>

      <ToolGuideSection toolId="passwordGenerator" selectedLanguage={selectedLanguage} />
    </div>
  );
}
