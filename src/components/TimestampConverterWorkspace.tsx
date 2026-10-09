import React, { useEffect, useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import { Check, Clock3, Copy, ShieldCheck, TriangleAlert } from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface TimestampConverterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type UnitMode = "auto" | "seconds" | "milliseconds";

/** Threshold rule (displayed to the user): |value| >= 1e12 is read as milliseconds, otherwise seconds. */
function detectUnit(raw: number): "seconds" | "milliseconds" {
  return Math.abs(raw) >= 1e12 ? "milliseconds" : "seconds";
}

function toMillis(raw: number, unit: "seconds" | "milliseconds"): number {
  return unit === "seconds" ? raw * 1000 : raw;
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

function formatInZone(ms: number, timeZone: string | undefined, lang: string): string {
  try {
    return new Intl.DateTimeFormat(lang, {
      timeZone,
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      timeZoneName: "short",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString();
  }
}

export function TimestampConverterWorkspace({ selectedLanguage = "en" }: TimestampConverterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const tc = (t as any).timestampConverter || {};
  const locale = selectedLanguage === "ur" ? "en" : selectedLanguage;

  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);
  const nowSec = Math.floor(nowMs / 1000);

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<UnitMode>("auto");
  const [copiedKey, setCopiedKey] = useState("");
  const doCopy = async (key: string, text: string) => {
    await copyText(text);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey((c) => (c === key ? "" : c)), 1600);
  };

  const parsed = useMemo(() => {
    const s = input.trim();
    if (s === "") return { kind: "empty" as const };
    if (!/^[+-]?\d+$/.test(s)) return { kind: "error" as const };
    const raw = Number(s);
    if (!Number.isFinite(raw)) return { kind: "error" as const };
    const unit = mode === "auto" ? detectUnit(raw) : mode;
    const ms = toMillis(raw, unit);
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { kind: "error" as const };
    // JS Date range is about +/- 8.64e15 ms; anything outside is already NaN above.
    return { kind: "ok" as const, raw, unit, ms, date: d };
  }, [input, mode]);

  const relative = useMemo(() => {
    if (parsed.kind !== "ok") return "";
    const diffSec = Math.round((parsed.ms - Date.now()) / 1000);
    const abs = Math.abs(diffSec);
    // Relative labels only when unambiguous and useful: within ~10 years.
    if (abs > 10 * 365.25 * 86400) return "";
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      if (abs < 60) return rtf.format(diffSec, "second");
      if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
      if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
      if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), "day");
      if (abs < 86400 * 365) return rtf.format(Math.round(diffSec / (86400 * 30.44)), "month");
      return rtf.format(Math.round(diffSec / (86400 * 365.25)), "year");
    } catch {
      return "";
    }
  }, [parsed, locale]);

  // Date -> timestamp. datetime-local has no zone; the user picks the meaning.
  const [dateValue, setDateValue] = useState("");
  const [dateAsUtc, setDateAsUtc] = useState(false);
  const dateResult = useMemo(() => {
    if (!dateValue) return null;
    // datetime-local value: YYYY-MM-DDTHH:mm (optionally :ss)
    const m = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!m) return null;
    const [, y, mo, d, h, mi, se] = m;
    const sec = se ? Number(se) : 0;
    const ms = dateAsUtc
      ? Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), sec)
      : new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), sec).getTime();
    if (Number.isNaN(ms)) return null;
    return { ms, seconds: Math.floor(ms / 1000) };
  }, [dateValue, dateAsUtc]);

  const localZone = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "local"; } catch { return "local"; }
  })();

  const copyBtn = (key: string, text: string, label: string) => (
    <button
      onClick={() => doCopy(key, text)}
      className="shrink-0 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-teal-100 text-stone-700 hover:text-teal-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
    >
      {copiedKey === key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copiedKey === key ? (tc.copiedBtn || "Copied") : label}
    </button>
  );

  const row = (key: string, label: string, value: string) => (
    <div key={key} className="flex items-center gap-2 py-2">
      <span className="text-[11px] font-bold text-stone-400 w-28 shrink-0 uppercase tracking-wide">{label}</span>
      <code className="flex-1 min-w-0 break-all font-mono text-[13px] sm:text-sm font-semibold text-stone-900">{value}</code>
      {copyBtn(key, value, tc.copyBtn || "Copy")}
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="timestampConverter" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-teal-100 via-cyan-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-teal-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.13),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" />
              {tc.badge || "Unix Timestamp Converter"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {tc.pageTitle || "Convert Unix Timestamps Without the Seconds-or-Milliseconds Guess"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {tc.subtitle || "Paste an epoch value and see UTC and your local time side by side, with the detected unit stated out loud. Turn any date back into seconds and milliseconds. Everything happens in this tab."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{tc.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {tc.quickAnswer || "It converts Unix timestamps (seconds since 1 January 1970, 00:00:00 UTC) into readable dates and back. Paste a number and it auto-detects seconds vs milliseconds — values of 1,000,000,000,000 or more are read as milliseconds, smaller values as seconds — and it always shows which unit it assumed, with a manual override. Results show UTC and your local time side by side plus copyable ISO 8601. Nothing is uploaded."}
        </p>
      </div>

      {/* Live clock */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-2">
        <h2 className="text-sm font-extrabold text-stone-900">{tc.nowTitle || "Current Unix time (live)"}</h2>
        <div className="divide-y divide-stone-100">
          {row("nowSec", tc.secondsLabel || "Seconds", String(nowSec))}
          {row("nowMs", tc.millisecondsLabel || "Milliseconds", String(nowMs))}
          {row("nowIso", "ISO 8601 (UTC)", new Date(nowMs).toISOString())}
        </div>
        <p className="text-xs text-stone-500">{tc.nowNote || "This clock is your own device clock. If your device time is wrong, this number is wrong by the same amount."}</p>
      </div>

      {/* Timestamp -> date */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-stone-900">{tc.toDateTitle || "Timestamp → Date"}</h2>
        <div className="grid sm:grid-cols-[1fr_220px] gap-3">
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1.5" htmlFor="ts-input">{tc.inputLabel || "Unix timestamp"}</label>
            <input
              id="ts-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={tc.inputPlaceholder || "e.g. 1735689600 or 1735689600000"}
              inputMode="numeric"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1.5" htmlFor="ts-mode">{tc.modeLabel || "Treat input as"}</label>
            <select
              id="ts-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as UnitMode)}
              className="w-full rounded-xl border border-stone-300 px-3 py-3 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="auto">{tc.modeAuto || "Auto-detect (recommended)"}</option>
              <option value="seconds">{tc.secondsLabel || "Seconds"}</option>
              <option value="milliseconds">{tc.millisecondsLabel || "Milliseconds"}</option>
            </select>
          </div>
        </div>

        {parsed.kind === "error" && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-900/85 leading-relaxed">{tc.errorText || "That is not a valid whole-number timestamp. Paste digits only (a leading minus is fine for dates before 1970), with no commas, spaces inside the number, or decimal point."}</p>
          </div>
        )}
        {parsed.kind === "empty" && (
          <p className="text-sm text-stone-500">{tc.emptyHint || "Paste a timestamp above. Try 0 (the epoch itself), 1735689600 (seconds) or 1735689600000 (milliseconds) and watch the assumed unit change."}</p>
        )}
        {parsed.kind === "ok" && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-bold text-teal-900 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">
              {(tc.assumedText || "Assumption: this value was treated as {unit}. Switch the selector above if your source uses the other unit.").replace("{unit}", parsed.unit === "seconds" ? (tc.secondsLabel || "Seconds") : (tc.millisecondsLabel || "Milliseconds"))}
            </p>
            <div className="divide-y divide-stone-100">
              {row("utc", tc.utcLabel || "UTC", formatInZone(parsed.ms, "UTC", locale))}
              {row("local", `${tc.localLabel || "Your local time"} (${localZone})`, formatInZone(parsed.ms, undefined, locale))}
              {row("iso", "ISO 8601 (UTC)", parsed.date.toISOString())}
              {row("secOut", tc.secondsLabel || "Seconds", String(Math.floor(parsed.ms / 1000)))}
              {row("msOut", tc.millisecondsLabel || "Milliseconds", String(parsed.ms))}
            </div>
            <p className="text-xs sm:text-sm text-stone-600">
              <span className="font-bold text-stone-800">{tc.relativeLabel || "Relative"}:</span>{" "}
              {relative || (tc.relativeFar || "— (too far from now for a useful “x ago” label; use the exact dates above)")}
            </p>
          </div>
        )}
      </div>

      {/* Date -> timestamp */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-stone-900">{tc.toTsTitle || "Date → Timestamp"}</h2>
        <div className="grid sm:grid-cols-[1fr_220px] gap-3 items-end">
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1.5" htmlFor="ts-date">{tc.dateLabel || "Date and time"}</label>
            <input
              id="ts-date"
              type="datetime-local"
              step="1"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDateAsUtc(false)}
              className={`flex-1 px-3 py-3 rounded-xl text-xs font-extrabold cursor-pointer ${!dateAsUtc ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700"}`}
            >
              {tc.asLocal || "As my local time"}
            </button>
            <button
              onClick={() => setDateAsUtc(true)}
              className={`flex-1 px-3 py-3 rounded-xl text-xs font-extrabold cursor-pointer ${dateAsUtc ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700"}`}
            >
              {tc.asUtc || "As UTC"}
            </button>
          </div>
        </div>
        <p className="text-xs text-stone-500">
          {(tc.dateNote || "A date-time picker carries no timezone, so you must say what the numbers mean: your local wall-clock time ({zone}) or UTC. The two choices differ by your UTC offset and are the single most common source of “wrong by a few hours” bugs.").replace("{zone}", localZone)}
        </p>
        {dateResult && (
          <div className="divide-y divide-stone-100">
            {row("dSec", tc.secondsLabel || "Seconds", String(dateResult.seconds))}
            {row("dMs", tc.millisecondsLabel || "Milliseconds", String(dateResult.ms))}
            {row("dIso", "ISO 8601 (UTC)", new Date(dateResult.ms).toISOString())}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{tc.honestTitle || "Honest notes — where timestamp conversions go wrong"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {tc.honestText || "A Unix timestamp is always UTC; it has no timezone and no daylight-saving flag. Errors almost always come from the edges: seconds fed to a milliseconds function (your date lands in 1970), milliseconds fed to a seconds function (a date tens of thousands of years away), or a local wall-clock time stored without its offset, which becomes ambiguous when clocks go back. This page therefore labels every line UTC or local and states the assumed unit instead of hiding it. Negative values mean before 1970 and are valid. Your device clock drives the live clock and the relative label, so a wrong device clock gives wrong “now” values here as everywhere."}
          </p>
          <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {tc.localNote || "Everything is calculated in this browser tab — nothing you paste is uploaded, stored or shared."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="timestampConverter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
