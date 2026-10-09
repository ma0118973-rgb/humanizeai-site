import React, { useCallback, useEffect, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Fingerprint, RefreshCw, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface UuidGeneratorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const MAX_COUNT = 100;
const DEFAULT_COUNT = 5;

/**
 * One UUID v4. Prefers the built-in crypto.randomUUID(); otherwise builds a
 * v4 from crypto.getRandomValues with the version (0100) and variant (10xx)
 * bits set by hand, per RFC 4122 §4.4. Never Math.random.
 */
function generateUuidV4(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // No Web Crypto available: refuse rather than fake randomness.
  throw new Error("Web Crypto is not available in this browser.");
}

function formatUuid(raw: string, uppercase: boolean, hyphens: boolean): string {
  let out = hyphens ? raw : raw.replace(/-/g, "");
  if (uppercase) out = out.toUpperCase();
  return out;
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }
}

export function UuidGeneratorWorkspace({ selectedLanguage = "en" }: UuidGeneratorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ug = (t as any).uuidGenerator || {};

  const [count, setCount] = useState(DEFAULT_COUNT);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const regenerate = useCallback(() => {
    try {
      const n = Math.min(MAX_COUNT, Math.max(1, Math.floor(count) || 1));
      const next: string[] = [];
      for (let i = 0; i < n; i++) {
        next.push(formatUuid(generateUuidV4(), uppercase, hyphens));
      }
      setUuids(next);
      setError("");
      setCopiedAll(false);
      setCopiedIdx(null);
    } catch {
      setUuids([]);
      setError(ug.errorText || "This browser does not provide secure randomness (Web Crypto), so no UUID was generated. Try a current browser over HTTPS.");
    }
  }, [count, uppercase, hyphens, ug.errorText]);

  // Generate on load and whenever the options change — the list always
  // matches the controls, like the other one-screen tools on this site.
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const handleCount = (value: string) => {
    const n = Number(value.replace(/[^0-9]/g, ""));
    if (value.trim() === "") {
      setCount(1);
      return;
    }
    setCount(Math.min(MAX_COUNT, Math.max(1, Number.isFinite(n) ? n : 1)));
  };

  const copyOne = async (idx: number) => {
    const value = uuids[idx];
    if (!value) return;
    await copyText(value);
    setCopiedIdx(idx);
    window.setTimeout(() => setCopiedIdx((c) => (c === idx ? null : c)), 1600);
  };

  const copyAll = async () => {
    if (uuids.length === 0) return;
    await copyText(uuids.join("\n"));
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="uuidGenerator" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-indigo-100 via-blue-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.13),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5" />
              {ug.badge || "UUID Generator"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload • Web Crypto
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {ug.pageTitle || "Generate UUID v4 Instantly — One or a Hundred at a Time"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ug.subtitle || "Fresh version-4 UUIDs from your browser's own secure randomness. Choose how many, upper or lower case, hyphens on or off — then copy one or copy them all. Nothing is uploaded, ever."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{ug.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {ug.quickAnswer || "It generates random UUID version 4 identifiers — the 36-character kind like 550e8400-e29b-41d4-a716-446655440000 — directly in this browser tab using the Web Crypto API. You can make up to 100 at once, switch letter case, keep or remove the hyphens, and copy a single UUID or the whole list. A v4 UUID carries 122 random bits, so a duplicate is astronomically unlikely — though, honestly, never mathematically impossible."}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-[220px_1fr] gap-5 items-start">
          <div>
            <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="uuid-count">
              {ug.countLabel || "How many?"} <span className="text-xs font-bold text-stone-400">(1–{MAX_COUNT})</span>
            </label>
            <input
              id="uuid-count"
              type="number"
              min={1}
              max={MAX_COUNT}
              value={count}
              onChange={(e) => handleCount(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-base font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
            <p className="text-xs text-stone-500 mt-1">{ug.countHint || "Bulk lists are capped at 100 so the page stays fast on any phone."}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1 sm:pt-7">
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
              {ug.uppercaseLabel || "UPPERCASE letters"}
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
              {ug.hyphensLabel || "Hyphens (8-4-4-4-12)"}
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={regenerate}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
          >
            <RefreshCw className="w-4 h-4" /> {ug.generateBtn || "Generate new UUIDs"}
          </button>
          <button
            onClick={copyAll}
            disabled={uuids.length === 0}
            className="px-4 py-3 rounded-2xl border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 text-indigo-900 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedAll ? (ug.copiedAllBtn || "Copied all!") : (ug.copyAllBtn || "Copy all")}
          </button>
          <span className="text-xs font-bold text-stone-500">
            {uuids.length} {ug.countUnit || "UUIDs"}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-900/85 leading-relaxed">{error}</p>
          </div>
        )}
        <p className="text-xs text-stone-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {ug.localNote || "Generated on this device with the Web Crypto API — no server, no upload, no record kept."}
        </p>
      </div>

      {/* Results */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{ug.resultsTitle || "Your UUIDs"}</h2>
        {uuids.length === 0 && !error ? (
          <p className="text-sm text-stone-500">{ug.resultsEmpty || "Press Generate and your UUIDs will appear here, one per line."}</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {uuids.map((u, i) => (
              <li key={`${i}-${u}`} className="flex items-center gap-2 py-2">
                <span className="text-[11px] font-bold text-stone-400 w-7 shrink-0 text-right">{i + 1}</span>
                <code className="flex-1 min-w-0 break-all font-mono text-[13px] sm:text-sm font-semibold text-stone-900">{u}</code>
                <button
                  onClick={() => copyOne(i)}
                  aria-label={`${ug.copyBtn || "Copy"} ${i + 1}`}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-indigo-100 text-stone-700 hover:text-indigo-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  {copiedIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedIdx === i ? (ug.copiedBtn || "Copied") : (ug.copyBtn || "Copy")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 flex gap-3">
        <Fingerprint className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-stone-900">{ug.formatTitle || "Reading a UUID v4"}</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
            {ug.formatText || "A UUID is 128 bits written as 32 hexadecimal digits in five groups: 8-4-4-4-12, 36 characters with hyphens (32 without). In version 4, the 13th hex digit is always 4 — that is the version mark — and the 17th digit is 8, 9, a or b, the variant mark. The other 122 bits are random. Databases, APIs and distributed systems use these as ready-made unique IDs because no central counter is needed to mint them."}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{ug.honestTitle || "Honest notes — read before you rely on one"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {ug.honestText || "A duplicate v4 is astronomically unlikely — with 122 random bits you would need to generate an enormous number before a collision became plausible — but it is not mathematically impossible, and no honest tool should promise otherwise. This tool deliberately generates version 4 only: version 1 embeds time and machine-style identifiers, which can leak information, so we do not offer it. And a UUID is an identifier, not a secret: never use one as a password or as the only protection for something private."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="uuidGenerator" selectedLanguage={selectedLanguage} />
    </div>
  );
}
