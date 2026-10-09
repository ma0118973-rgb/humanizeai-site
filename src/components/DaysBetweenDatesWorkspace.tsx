import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  ArrowLeftRight, Briefcase, CalendarDays, Check, Copy, Info, Minus, Plus, ShieldCheck,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface DaysBetweenDatesWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb",
};

const DAY_MS = 86400000;

/** Parse a yyyy-mm-dd input into a UTC-midnight timestamp (NaN if invalid). */
function parseDate(value: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!m) return NaN;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(ms);
  // Reject overflowed dates (e.g. Feb 31) that Date.UTC would roll over.
  if (d.getUTCFullYear() !== Number(m[1]) || d.getUTCMonth() !== Number(m[2]) - 1 || d.getUTCDate() !== Number(m[3])) {
    return NaN;
  }
  return ms;
}

/** Local calendar date (from the user's own clock) as yyyy-mm-dd — no UTC shift. */
function localDateStr(offsetDays = 0): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fmtDate(ms: number, locale: string): string {
  if (!isFinite(ms)) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(0, 10);
  }
}

/**
 * Mon–Fri count over a UTC day range given by its length and the UTC weekday
 * of its first day (0=Sun..6=Sat). O(1): full weeks plus a <=7-day walk.
 */
function businessDays(totalDays: number, firstWeekday: number): number {
  if (totalDays <= 0) return 0;
  const fullWeeks = Math.floor(totalDays / 7);
  let count = fullWeeks * 5;
  const remainder = totalDays - fullWeeks * 7;
  for (let i = 0; i < remainder; i++) {
    const wd = (firstWeekday + fullWeeks * 7 + i) % 7;
    if (wd >= 1 && wd <= 5) count++;
  }
  return count;
}

export function DaysBetweenDatesWorkspace({ selectedLanguage = "en" }: DaysBetweenDatesWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const db = (t as any).daysBetween || {};
  const locale = LOCALES[selectedLanguage] || "en";

  const [mode, setMode] = useState<"between" | "add">("between");
  const [startDate, setStartDate] = useState(localDateStr(0));
  const [endDate, setEndDate] = useState(localDateStr(30));
  const [inclusive, setInclusive] = useState(false);

  const [baseDate, setBaseDate] = useState(localDateStr(0));
  const [daysToAdd, setDaysToAdd] = useState(90);
  const [addDirection, setAddDirection] = useState<"add" | "subtract">("add");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const s = parseDate(startDate);
    const e = parseDate(endDate);
    if (!isFinite(s) || !isFinite(e)) return null;
    const reversed = e < s;
    const first = reversed ? e : s;
    const last = reversed ? s : e;
    const gap = Math.round((last - first) / DAY_MS); // end − start
    const total = inclusive ? gap + 1 : gap;
    // Counted range: inclusive = first..last; exclusive = first+1 .. last.
    const rangeStartMs = inclusive ? first : first + DAY_MS;
    const firstWeekday = new Date(rangeStartMs).getUTCDay();
    const business = businessDays(total, firstWeekday);
    return {
      reversed,
      gap,
      total,
      business,
      weekend: total - business,
      weeks: Math.floor(total / 7),
      remDays: total % 7,
      approxMonths: total / 30.436875,
      approxYears: total / 365.2425,
      first,
      last,
    };
  }, [startDate, endDate, inclusive]);

  const addResultMs = useMemo(() => {
    const b = parseDate(baseDate);
    if (!isFinite(b)) return NaN;
    const n = Math.floor(Math.abs(daysToAdd) || 0);
    return b + (addDirection === "add" ? n : -n) * DAY_MS;
  }, [baseDate, daysToAdd, addDirection]);

  const resultText = useMemo(() => {
    if (mode === "add") {
      const b = parseDate(baseDate);
      const n = Math.floor(Math.abs(daysToAdd) || 0);
      return `${fmtDate(b, locale)} ${addDirection === "add" ? "+" : "−"} ${n} ${db.daysUnit || "days"} = ${fmtDate(addResultMs, locale)}`;
    }
    if (!stats) return "";
    const weeksText = (db.weeksText || "{weeks} weeks and {days} days")
      .replace("{weeks}", String(stats.weeks))
      .replace("{days}", String(stats.remDays));
    return [
      `${fmtDate(stats.first, locale)} → ${fmtDate(stats.last, locale)}`,
      `${db.totalDays || "Total days"}: ${stats.total.toLocaleString(locale)}`,
      `${db.businessDays || "Business days (Mon–Fri)"}: ${stats.business.toLocaleString(locale)}`,
      `${db.weeksLabel || "Weeks + days"}: ${weeksText}`,
    ].join(" · ");
  }, [mode, stats, baseDate, daysToAdd, addDirection, addResultMs, db, locale]);

  const copyResult = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="daysBetween" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -z-0 opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-700 text-white self-start shadow-sm">
            <CalendarDays className="w-3.5 h-3.5" /> {db.badge || "Days Between Dates Calculator"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {db.pageTitle || "How Many Days Between Two Dates?"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {db.subtitle || "Pick a start and end date to see the total days, weeks, approximate months/years and weekday-only business days. You can also add or subtract days from any date. Everything is calculated in your browser — nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-700 text-white rounded-xl shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-sky-950">{db.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {db.quickAnswer || "It counts calendar days between two dates using UTC date math. Choose inclusive or exclusive counting, see Mon–Fri business days (public holidays are never subtracted), and find the date N days before or after any date."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-5">
        <div>
          <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{db.modeBetween ? "" : ""}</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode("between")}
              className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "between" ? "bg-sky-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              {db.modeBetween || "Days between dates"}
            </button>
            <button
              onClick={() => setMode("add")}
              className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "add" ? "bg-sky-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
            >
              {db.modeAdd || "Add / subtract days"}
            </button>
          </div>
        </div>

        {mode === "between" && (
          <>
            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="db-start">
                  {db.startLabel || "Start date"}
                </label>
                <input
                  id="db-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-sky-600"
                />
                <button
                  onClick={() => setStartDate(localDateStr(0))}
                  className="mt-2 text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                >
                  {db.startTodayBtn || "Start = today"}
                </button>
              </div>
              <button
                onClick={() => { setStartDate(endDate); setEndDate(startDate); }}
                aria-label={db.swapBtn || "Swap dates"}
                className="mx-auto flex items-center justify-center w-10 h-10 rounded-full bg-sky-700 text-white hover:bg-sky-600 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="db-end">
                  {db.endLabel || "End date"}
                </label>
                <input
                  id="db-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-sky-600"
                />
                <button
                  onClick={() => setEndDate(localDateStr(0))}
                  className="mt-2 text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                >
                  {db.endTodayBtn || "End = today"}
                </button>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
                {db.countingLabel || "How should the days be counted?"}
              </span>
              <div className="grid sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setInclusive(false)}
                  className={`text-left px-3.5 py-3 rounded-2xl border text-sm transition cursor-pointer ${!inclusive ? "bg-sky-700 text-white border-sky-700 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-sky-300"}`}
                >
                  <span className="block font-bold">{db.optExclusive || "Days between (start day not counted)"}</span>
                  <span className={`block text-[11px] mt-0.5 ${!inclusive ? "text-sky-100" : "text-stone-500"}`}>{db.optExclusiveHint || "May 1 → May 2 = 1 day."}</span>
                </button>
                <button
                  onClick={() => setInclusive(true)}
                  className={`text-left px-3.5 py-3 rounded-2xl border text-sm transition cursor-pointer ${inclusive ? "bg-sky-700 text-white border-sky-700 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-sky-300"}`}
                >
                  <span className="block font-bold">{db.optInclusive || "Count both first and last day"}</span>
                  <span className={`block text-[11px] mt-0.5 ${inclusive ? "text-sky-100" : "text-stone-500"}`}>{db.optInclusiveHint || "May 1 → May 2 = 2 days."}</span>
                </button>
              </div>
            </div>

            {stats && (
              <div className="space-y-3" aria-live="polite">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-sky-800">{db.totalDays || "Total days"}</div>
                    <div className="text-3xl font-extrabold text-stone-900 mt-0.5">{stats.total.toLocaleString(locale)}</div>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {db.businessDays || "Business days (Mon–Fri)"}
                    </div>
                    <div className="text-3xl font-extrabold text-stone-900 mt-0.5">{stats.business.toLocaleString(locale)}</div>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{db.weekendDays || "Weekend days"}</div>
                    <div className="text-3xl font-extrabold text-stone-900 mt-0.5">{stats.weekend.toLocaleString(locale)}</div>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{db.weeksLabel || "Weeks + days"}</div>
                    <div className="text-lg font-extrabold text-stone-900 mt-1.5 leading-snug">
                      {(db.weeksText || "{weeks} weeks and {days} days").replace("{weeks}", stats.weeks.toLocaleString(locale)).replace("{days}", stats.remDays.toLocaleString(locale))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-stone-200 bg-white px-3 py-2.5 flex items-baseline justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{db.approxMonths || "Approx. months"}</span>
                    <span className="text-lg font-extrabold text-stone-900">≈ {stats.approxMonths.toLocaleString(locale, { maximumFractionDigits: 1 })}</span>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white px-3 py-2.5 flex items-baseline justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{db.approxYears || "Approx. years"}</span>
                    <span className="text-lg font-extrabold text-stone-900">≈ {stats.approxYears.toLocaleString(locale, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">{db.approxNote || "Months and years are approximate equivalents, because real months have 28–31 days."}</p>
                {stats.reversed && (
                  <p className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    {db.reversedNote || "End date is earlier — the dates were counted in calendar order anyway."}
                  </p>
                )}
                {stats.gap === 0 && (
                  <p className="text-[11px] font-bold text-sky-900 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
                    {db.sameDayNote || "Same date picked twice: 0 days between, 1 day when both endpoints count."}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {mode === "add" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="db-base">
                  {db.baseDateLabel || "Base date"}
                </label>
                <input
                  id="db-base"
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-sky-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="db-days">
                  {db.daysToAddLabel || "Number of days"}
                </label>
                <input
                  id="db-days"
                  type="number"
                  min={0}
                  max={1000000}
                  value={daysToAdd}
                  onChange={(e) => setDaysToAdd(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAddDirection("add")}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${addDirection === "add" ? "bg-sky-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
              >
                <Plus className="w-4 h-4" /> {db.addLabel || "Add days"}
              </button>
              <button
                onClick={() => setAddDirection("subtract")}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${addDirection === "subtract" ? "bg-sky-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}
              >
                <Minus className="w-4 h-4" /> {db.subtractLabel || "Subtract days"}
              </button>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4" aria-live="polite">
              <div className="text-[11px] font-bold uppercase tracking-wide text-sky-800">{db.resultDateLabel || "Resulting date"}</div>
              <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-1">{fmtDate(addResultMs, locale)}</div>
              <div className="text-xs text-stone-600 mt-1">
                {fmtDate(parseDate(baseDate), locale)} {addDirection === "add" ? "+" : "−"} {Math.floor(Math.abs(daysToAdd) || 0).toLocaleString(locale)} {db.daysUnit || "days"}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyResult}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? (db.copied || "Copied!") : (db.copyBtn || "Copy result")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-sky-700" /> {db.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {db.honestText || "Business days here mean Monday to Friday only. Public holidays are NOT subtracted — this tool has no country holiday calendar, so check official calendars for legal, payroll or court deadlines. Months and years are approximate equivalents. Dates are pure calendar dates, so time zones and daylight-saving cannot change the count."}
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-sky-700" /> {db.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {db.privacyNote || "Your dates are calculated in this browser tab with UTC calendar math. Nothing is uploaded, stored on a server, saved to an account or shared. Close the tab and they are gone."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="daysBetween" selectedLanguage={selectedLanguage} />
    </div>
  );
}
