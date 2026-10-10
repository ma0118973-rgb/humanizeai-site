import React, { useEffect, useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  ArrowLeftRight, Check, Copy, RotateCcw, Ruler, Scale, ShieldCheck, Thermometer, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface UnitConverterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

// ---------------------------------------------------------------------------
// Conversion data. Every non-temperature unit converts through a base unit
// with an established factor (NIST/SI definitions). Temperature uses the
// exact formulas. Nothing is invented or approximated beyond these factors.
// ---------------------------------------------------------------------------
interface UnitDef { id: string; factor?: number; }

interface CategoryDef {
  id: string;
  baseUnit: string;
  units: UnitDef[];
  /** Live-rate category: factors come from a rates feed, never hardcoded. */
  liveRates?: boolean;
}

const CATEGORIES: CategoryDef[] = [
  { id: "length", baseUnit: "m", units: [
    { id: "mm", factor: 0.001 }, { id: "cm", factor: 0.01 }, { id: "m", factor: 1 },
    { id: "km", factor: 1000 }, { id: "in", factor: 0.0254 }, { id: "ft", factor: 0.3048 },
    { id: "yd", factor: 0.9144 }, { id: "mi", factor: 1609.344 },
  ]},
  { id: "weight", baseUnit: "kg", units: [
    { id: "mg", factor: 0.000001 }, { id: "g", factor: 0.001 }, { id: "kg", factor: 1 },
    { id: "t", factor: 1000 }, { id: "oz", factor: 0.028349523125 }, { id: "lb", factor: 0.45359237 },
    { id: "stone", factor: 6.35029318 },
  ]},
  { id: "temperature", baseUnit: "C", units: [{ id: "C" }, { id: "F" }, { id: "K" }] },
  { id: "volume", baseUnit: "L", units: [
    { id: "mL", factor: 0.001 }, { id: "L", factor: 1 }, { id: "cupUS", factor: 0.2365882365 },
    { id: "ptUS", factor: 0.473176473 }, { id: "qtUS", factor: 0.946352946 },
    { id: "galUS", factor: 3.785411784 }, { id: "galUK", factor: 4.54609 },
    { id: "flozUS", factor: 0.0295735295625 },
  ]},
  { id: "area", baseUnit: "sqm", units: [
    { id: "sqcm", factor: 0.0001 }, { id: "sqm", factor: 1 }, { id: "sqkm", factor: 1000000 },
    { id: "ha", factor: 10000 }, { id: "sqft", factor: 0.09290304 }, { id: "sqyd", factor: 0.83612736 },
    { id: "acre", factor: 4046.8564224 }, { id: "sqmi", factor: 2589988.110336 },
  ]},
  { id: "speed", baseUnit: "mps", units: [
    { id: "mps", factor: 1 }, { id: "kmh", factor: 1 / 3.6 }, { id: "mph", factor: 0.44704 },
    { id: "fps", factor: 0.3048 }, { id: "knot", factor: 0.514444444444 },
  ]},
  { id: "time", baseUnit: "s", units: [
    { id: "ms", factor: 0.001 }, { id: "s", factor: 1 }, { id: "min", factor: 60 },
    { id: "h", factor: 3600 }, { id: "day", factor: 86400 }, { id: "week", factor: 604800 },
    { id: "year", factor: 31557600 },
  ]},
  { id: "data", baseUnit: "B", units: [
    { id: "bit", factor: 0.125 }, { id: "B", factor: 1 }, { id: "KB", factor: 1000 },
    { id: "MB", factor: 1000000 }, { id: "GB", factor: 1000000000 }, { id: "TB", factor: 1000000000000 },
    { id: "KiB", factor: 1024 }, { id: "MiB", factor: 1048576 }, { id: "GiB", factor: 1073741824 },
    { id: "TiB", factor: 1099511627776 },
  ]},
  { id: "pressure", baseUnit: "Pa", units: [
    { id: "Pa", factor: 1 }, { id: "kPa", factor: 1000 }, { id: "bar", factor: 100000 },
    { id: "atm", factor: 101325 }, { id: "psi", factor: 6894.757293168 }, { id: "mmHg", factor: 133.322387415 },
  ]},
  { id: "energy", baseUnit: "J", units: [
    { id: "J", factor: 1 }, { id: "kJ", factor: 1000 }, { id: "cal", factor: 4.184 },
    { id: "kcal", factor: 4184 }, { id: "Wh", factor: 3600 }, { id: "kWh", factor: 3600000 },
    { id: "BTU", factor: 1055.05585262 },
  ]},
  // Currency uses LIVE rates (never hardcoded): fetched in the visitor's
  // browser from a free daily feed. Keyless, no signup, no server quota.
  { id: "currency", baseUnit: "USD", liveRates: true, units: [
    { id: "USD" }, { id: "EUR" }, { id: "GBP" }, { id: "PKR" }, { id: "INR" },
    { id: "AED" }, { id: "SAR" }, { id: "CNY" }, { id: "JPY" }, { id: "AUD" },
    { id: "CAD" }, { id: "CHF" }, { id: "TRY" }, { id: "SGD" },
  ]},
];

// Popular presets: [categoryId, fromUnit, toUnit, value, labelKey]
const PRESETS: Array<[string, string, string, number, string]> = [
  ["length", "km", "mi", 5, "presetKmMi"],
  ["length", "in", "cm", 10, "presetInCm"],
  ["length", "ft", "m", 6, "presetFtM"],
  ["weight", "kg", "lb", 70, "presetKgLb"],
  ["weight", "lb", "kg", 150, "presetLbKg"],
  ["weight", "g", "oz", 100, "presetGOz"],
  ["temperature", "C", "F", 37, "presetCF"],
  ["temperature", "F", "C", 98.6, "presetFC"],
  ["volume", "L", "galUS", 10, "presetLGal"],
  ["volume", "mL", "cupUS", 250, "presetMlCup"],
  ["speed", "kmh", "mph", 100, "presetKmhMph"],
  ["time", "h", "min", 2.5, "presetHMin"],
];

function toCelsius(unitId: string, value: number): number {
  if (unitId === "F") return (value - 32) * 5 / 9;
  if (unitId === "K") return value - 273.15;
  return value;
}
function fromCelsius(unitId: string, celsius: number): number {
  if (unitId === "F") return celsius * 9 / 5 + 32;
  if (unitId === "K") return celsius + 273.15;
  return celsius;
}

function convert(cat: CategoryDef, fromId: string, toId: string, value: number): number {
  if (cat.id === "temperature") return fromCelsius(toId, toCelsius(fromId, value));
  const from = cat.units.find((u) => u.id === fromId)!;
  const to = cat.units.find((u) => u.id === toId)!;
  return value * (from.factor! / to.factor!);
}

function formulaFor(cat: CategoryDef, fromId: string, toId: string, u: (id: string) => string): string {
  if (cat.id === "temperature") {
    if (fromId === "C" && toId === "F") return "°F = °C × 9/5 + 32";
    if (fromId === "F" && toId === "C") return "°C = (°F − 32) × 5/9";
    if (fromId === "C" && toId === "K") return "K = °C + 273.15";
    if (fromId === "K" && toId === "C") return "°C = K − 273.15";
    if (fromId === "F" && toId === "K") return "K = (°F − 32) × 5/9 + 273.15";
    if (fromId === "K" && toId === "F") return "°F = (K − 273.15) × 9/5 + 32";
    return "1 °C = 1 °C";
  }
  const from = cat.units.find((x) => x.id === fromId)!;
  const to = cat.units.find((x) => x.id === toId)!;
  const per = from.factor! / to.factor!;
  return `1 ${u(fromId)} = ${formatResult(per)} ${u(toId)}`;
}

// Sensible significant figures: 10 sig figs max, trailing zeros trimmed,
// plain notation between 1e-6 and 1e15, exponential outside that range.
function formatResult(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a >= 1e15 || a < 1e-6) {
    return n.toExponential(5).replace(/(\.\d*?)0+e/, "$1e").replace(/\.e/, "e");
  }
  const rounded = Number(n.toPrecision(10));
  return String(rounded);
}

// ---------------------------------------------------------------------------
// Live currency rates. Free daily feed (fawazahmed0/currency-api via the
// jsDelivr CDN): keyless, no signup, CORS-open, updated every day. The fetch
// runs in the VISITOR's browser, so there is no server quota and no key to
// protect. Cached per calendar day; on any failure the currency UI shows an
// honest "unavailable" note instead of a guessed number.
// ---------------------------------------------------------------------------
const RATES_URL =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";

let ratesCache: { day: string; date: string; rates: Record<string, number> } | null = null;

async function loadRates(): Promise<{ date: string; rates: Record<string, number> }> {
  const day = new Date().toISOString().slice(0, 10);
  if (ratesCache && ratesCache.day === day) return ratesCache;
  const res = await fetch(RATES_URL);
  if (!res.ok) throw new Error("rates HTTP " + res.status);
  const data = await res.json();
  const raw = data && data.usd;
  if (!raw || typeof raw.usd !== "number") throw new Error("rates shape");
  const rates: Record<string, number> = {};
  for (const k of Object.keys(raw)) {
    if (typeof raw[k] === "number" && raw[k] > 0) rates[k.toUpperCase()] = raw[k];
  }
  ratesCache = { day, date: String(data.date || day), rates };
  return ratesCache;
}

export function UnitConverterWorkspace({ selectedLanguage = "en" }: UnitConverterWorkspaceProps) {  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const uc = (t as any).unitConverter || {};
  const units = (t as any).unitConverterUnits || {};

  const unitName = (id: string): string => units[id] || id;

  const [catId, setCatId] = useState("length");
  const cat = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
  const [fromId, setFromId] = useState("km");
  const [toId, setToId] = useState("mi");
  const [input, setInput] = useState("5");
  const [copied, setCopied] = useState(false);
  const [unitSearch, setUnitSearch] = useState("");

  // Live currency rates state. idle → loading → ok | failed.
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesDate, setRatesDate] = useState("");
  const [ratesStatus, setRatesStatus] = useState<"idle" | "loading" | "ok" | "failed">("idle");

  const fetchRates = () => {
    setRatesStatus("loading");
    loadRates()
      .then((r) => {
        setRates(r.rates);
        setRatesDate(r.date);
        setRatesStatus("ok");
      })
      .catch(() => {
        setRates(null);
        setRatesStatus("failed");
      });
  };

  useEffect(() => {
    if (catId === "currency" && ratesStatus === "idle") fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId]);

  const parsed = input.trim() === "" ? NaN : Number(input.replace(",", "."));
  const valid = Number.isFinite(parsed);

  const result = useMemo(() => {
    if (!valid) return null;
    if (cat.id === "currency") {
      if (!rates) return null;
      const rf = rates[fromId];
      const rt = rates[toId];
      if (!rf || !rt) return null;
      return parsed * (rt / rf);
    }
    return convert(cat, fromId, toId, parsed);
  }, [cat, fromId, toId, parsed, valid, rates]);

  const resultText = result === null ? "" : formatResult(result);
  const formula =
    cat.id === "currency"
      ? rates && rates[fromId] && rates[toId]
        ? `1 ${fromId} = ${formatResult(rates[toId] / rates[fromId])} ${toId}`
        : ratesStatus === "failed"
          ? uc.ratesFailedTitle || "Live rates unavailable"
          : uc.ratesLoading || "Fetching today's rates…"
      : formulaFor(cat, fromId, toId, unitName);

  const pickCategory = (id: string) => {
    const next = CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
    setCatId(id);
    if (next.id === "currency") {
      setFromId("USD");
      setToId("PKR");
    } else {
      setFromId(next.units[2]?.id || next.units[0].id);
      setToId(next.units[next.units.length > 3 ? 3 : 1]?.id || next.units[0].id);
    }
    setUnitSearch("");
  };

  const swap = () => {
    // Convert the shown result back into the input so users can chain.
    if (result !== null) setInput(String(result));
    setFromId(toId);
    setToId(fromId);
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setCatId(p[0]);
    setFromId(p[1]);
    setToId(p[2]);
    setInput(String(p[3]));
    setUnitSearch("");
  };

  const reset = () => {
    setCatId("length");
    setFromId("km");
    setToId("mi");
    setInput("5");
    setUnitSearch("");
  };

  const copyResult = async () => {
    if (!resultText) return;
    const text = `${input || "0"} ${unitName(fromId)} = ${resultText} ${unitName(toId)}`;
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
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const matchingUnits = unitSearch.trim()
    ? cat.units.filter((u) => unitName(u.id).toLowerCase().includes(unitSearch.trim().toLowerCase()) || u.id.toLowerCase().includes(unitSearch.trim().toLowerCase()))
    : cat.units;

  const unitOptions = (selected: string) =>
    matchingUnits.map((u) => (
      <option key={u.id} value={u.id}>
        {unitName(u.id)} ({u.id})
      </option>
    ));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="unitConverter" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-sky-100 via-cyan-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-sky-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(14,165,233,0.13),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              {uc.badge || "Unit Converter"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {uc.pageTitle || "Convert Length, Weight, Temperature and More — Instantly"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {uc.subtitle || "Ten everyday categories with real conversion factors. Type a value, pick the units, and the answer, the formula and popular presets are right here. No currency, no account, nothing uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{uc.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {uc.quickAnswer || "It converts one unit into another inside ten everyday categories: length, weight, temperature, volume, area, speed, time, data storage, pressure and energy. Results use established factors (for example 1 inch is exactly 2.54 cm), the formula is shown with every answer, and currency is deliberately not included because money needs live exchange rates."}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div>
          <span className="block text-sm font-extrabold text-stone-900 mb-2">{uc.categoryLabel || "Category"}</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => pickCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${c.id === catId ? "bg-sky-600 text-white shadow" : "bg-stone-100 hover:bg-sky-50 text-stone-700"}`}
              >
                {uc[`cat_${c.id}`] || c.id}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="uc-unit-search">
            {uc.searchLabel || "Search units in this category"}
          </label>
          <input
            id="uc-unit-search"
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
            placeholder={uc.searchPlaceholder || "Type to filter the unit lists, e.g. mile"}
            className="w-full sm:w-96 rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
          {unitSearch.trim() && matchingUnits.length === 0 && (
            <p className="text-xs text-red-700 font-semibold mt-2">{uc.noMatch || "No unit in this category matches that search. Clear the search to see all units."}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div className="space-y-2">
            <label className="block text-sm font-extrabold text-stone-900" htmlFor="uc-value">
              {uc.valueLabel || "Value"}
            </label>
            <input
              id="uc-value"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputMode="decimal"
              placeholder="5"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base font-bold focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
            <label className="block text-xs font-bold text-stone-500" htmlFor="uc-from">
              {uc.fromLabel || "From"}
            </label>
            <select
              id="uc-from"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {unitOptions(fromId)}
            </select>
          </div>

          <button
            onClick={swap}
            aria-label={uc.swapBtn || "Swap units"}
            className="mx-auto px-3.5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white transition-all cursor-pointer shadow"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          <div className="space-y-2">
            <span className="block text-sm font-extrabold text-stone-900">{uc.resultLabel || "Result"}</span>
            <div className="w-full rounded-xl border-2 border-sky-300 bg-sky-50 px-4 py-3 text-base font-extrabold text-stone-900 min-h-[50px] flex items-center break-all">
              {catId === "currency" && ratesStatus !== "ok" ? (
                <span className="text-stone-400 text-sm font-semibold">
                  {ratesStatus === "failed"
                    ? uc.ratesFailedTitle || "Live rates unavailable"
                    : uc.ratesLoading || "Fetching today's rates…"}
                </span>
              ) : valid ? (
                `${resultText} ${unitName(toId)}`
              ) : (
                <span className="text-stone-400 text-sm font-semibold">{uc.invalidHint || "Type a number to see the result"}</span>
              )}
            </div>
            <label className="block text-xs font-bold text-stone-500" htmlFor="uc-to">
              {uc.toLabel || "To"}
            </label>
            <select
              id="uc-to"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {unitOptions(toId)}
            </select>
          </div>
        </div>

        {!valid && input.trim() !== "" && (
          <p className="text-xs text-red-700 font-semibold">{uc.invalidHint || "Type a number to see the result"}</p>
        )}

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-1.5">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">{uc.formulaLabel || "Formula used"}</p>
          <p className="text-sm sm:text-base font-extrabold text-stone-900 font-mono">{formula}</p>
          {catId === "currency" && ratesStatus === "ok" && (
            <p className="text-[11px] text-stone-500">{uc.ratesSource || "Source: free daily currency feed (fawazahmed0/currency-api via jsDelivr CDN)"}</p>
          )}
          {valid && (
            <p className="text-xs text-stone-600">
              {parsed} {unitName(fromId)} = <strong className="text-stone-900">{resultText} {unitName(toId)}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={copyResult}
            disabled={!valid}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 shadow"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? (uc.copied || "Copied!") : (uc.copyBtn || "Copy result")}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> {uc.resetBtn || "Reset"}
          </button>
        </div>

        <p className="text-xs text-stone-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {uc.localNote || "Everything is calculated in this browser tab — nothing you type is uploaded, stored or shared."}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
          <Scale className="w-4 h-4 text-sky-600" /> {uc.presetsTitle || "Popular conversions"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p[4]}
              onClick={() => applyPreset(p)}
              className="px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-bold transition-all cursor-pointer"
            >
              {uc[p[4]] || `${p[3]} ${p[1]} → ${p[2]}`}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">{uc.presetsNote || "Tap a preset to load it into the converter. School, cooking and travel conversions are the ones people reach for most."}</p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 flex gap-3">
        <Thermometer className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-stone-900">{uc.factorsTitle || "Where the numbers come from"}</h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
            {uc.factorsText || "Conversions use the established SI and NIST factors: 1 inch is exactly 2.54 cm, 1 pound is exactly 0.45359237 kg, 1 US gallon is exactly 3.785411784 litres, and temperature uses the exact formulas shown above. Data storage shows decimal (KB = 1,000 bytes) and binary (KiB = 1,024 bytes) units side by side because both are real — check which one your system uses. A year here is the Julian year of 365.25 days."}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{uc.safetyTitle || "Everyday conversions — verify the critical ones"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {uc.safetyText || "These results are for everyday use: schoolwork, cooking, travel and shopping. Do not rely on them for medical dosing, engineering sign-off, aviation, construction tolerances or anything safety-critical without professional verification and the proper instruments."}
          </p>
          {catId === "currency" && (
            <div className="mt-2">
              {ratesStatus === "ok" && (
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-semibold">
                  {uc.liveRatesTitle || "Live currency rates"} · {uc.ratesAsOf || "Rates as of"} {ratesDate}.{" "}
                  <span className="font-normal text-emerald-800/80">{uc.liveRatesNote || "Currency rates are fetched live in your browser from a free daily rates feed. Nothing you type is uploaded — only the rate table is downloaded."}</span>
                </p>
              )}
              {ratesStatus === "loading" && (
                <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">{uc.ratesLoading || "Fetching today's rates…"}</p>
              )}
              {ratesStatus === "failed" && (
                <div className="mt-1">
                  <p className="text-xs sm:text-sm text-red-900 font-bold">{uc.ratesFailedTitle || "Live rates unavailable"}</p>
                  <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
                    {uc.ratesFailedText || "Today's exchange rates could not be loaded (no connection or the rates service is down), so currency conversion is paused rather than guessing. All other categories keep working. For money decisions, check your bank."}
                  </p>
                  <button
                    onClick={fetchRates}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {uc.ratesRetry || "Try again"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ToolGuideSection toolId="unitConverter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
