import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Eraser, FlaskConical, Globe, Monitor, ShieldCheck,
  Smartphone, TriangleAlert, Type,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface MetaCheckerWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const MAX_TITLE = 200;
const MAX_DESC = 500;
const MAX_FIELD = 300;

const SAMPLE = {
  siteName: "ToolVena",
  url: "https://www.toolvena.com/word-counter/",
  title: "Free Word Counter — Count Words & Characters Online",
  description: "Count words, characters, sentences and reading time live in your browser. Free with no sign-up and nothing uploaded — paste text or open a file and check limits instantly.",
};

/** Measure rendered width with the browser's own canvas text measurement.
 *  This is an approximation: Google's SERP uses its own fonts, device
 *  rendering and layout, so the figure is labelled approximate everywhere. */
function measurePx(text: string, font: string, canvas: HTMLCanvasElement | null): number {
  if (!text) return 0;
  try {
    const ctx = (canvas || document.createElement("canvas")).getContext("2d");
    if (!ctx) return Math.round(text.length * 7);
    ctx.font = font;
    return Math.round(ctx.measureText(text).width);
  } catch {
    return Math.round(text.length * 7);
  }
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

function wordCount(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

type Band = "short" | "good" | "long" | "empty";

function titleBand(chars: number, px: number): Band {
  if (!chars) return "empty";
  if (chars < 30) return "short";
  if (px <= 580 && chars <= 60) return "good";
  return "long";
}
function descBand(chars: number, px: number): Band {
  if (!chars) return "empty";
  if (chars < 120) return "short";
  if (px <= 920 && chars <= 160) return "good";
  return "long";
}

export function MetaCheckerWorkspace({ selectedLanguage = "en" }: MetaCheckerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const m = (t as any).metaChecker || {};

  const [siteName, setSiteName] = useState(SAMPLE.siteName);
  const [pageUrl, setPageUrl] = useState(SAMPLE.url);
  const [title, setTitle] = useState(SAMPLE.title);
  const [description, setDescription] = useState(SAMPLE.description);
  const [copiedField, setCopiedField] = useState<"title" | "desc" | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    canvasRef.current = document.createElement("canvas");
  }, []);

  const titlePx = useMemo(
    () => measurePx(title, "20px Arial, Helvetica, sans-serif", canvasRef.current),
    [title]
  );
  const descPx = useMemo(
    () => measurePx(description, "14px Arial, Helvetica, sans-serif", canvasRef.current),
    [description]
  );
  const descPxMobile = useMemo(
    () => measurePx(description, "13px Arial, Helvetica, sans-serif", canvasRef.current),
    [description]
  );

  const tBand = titleBand(title.length, titlePx);
  const dBand = descBand(description.length, descPx);

  const loadSample = () => {
    setSiteName(SAMPLE.siteName);
    setPageUrl(SAMPLE.url);
    setTitle(SAMPLE.title);
    setDescription(SAMPLE.description);
  };
  const clearAll = () => {
    setSiteName("");
    setPageUrl("");
    setTitle("");
    setDescription("");
  };
  const doCopy = async (field: "title" | "desc", value: string) => {
    if (!value) return;
    await copyText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1600);
  };

  const inputCls =
    "w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400";
  const labelCls = "block text-sm font-extrabold text-stone-900 mb-1";
  const hintCls = "text-xs text-stone-500 mt-1 leading-relaxed";

  const bandBadge = (band: Band) =>
    band === "good"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : band === "long"
        ? "bg-red-100 text-red-800 border-red-300"
        : band === "short"
          ? "bg-amber-100 text-amber-800 border-amber-300"
          : "bg-stone-100 text-stone-600 border-stone-300";

  const meter = (px: number, max: number) => {
    const pct = Math.min(100, Math.round((px / max) * 100));
    const color = px <= max ? "bg-emerald-500" : "bg-red-500";
    return (
      <div className="h-2 rounded-full bg-stone-200 overflow-hidden" aria-hidden="true">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const guidanceFor = (kind: "title" | "desc", band: Band): string => {
    if (band === "empty") return "";
    if (kind === "title") {
      if (band === "short") return m.titleShort || "Short — usually displays fully, but check it says enough.";
      if (band === "good") return m.titleGood || "Comfortable — likely to display fully on desktop and mobile.";
      return m.titleLong || "Long — the end may be cut, especially on mobile. Front-load and shorten.";
    }
    if (band === "short") return m.descShort || "Short — may look thin next to fuller results. Add the reader's benefit.";
    if (band === "good") return m.descGood || "Comfortable — likely to display fully on desktop; check mobile too.";
    return m.descLong || "Long — likely to be cut. Move the key message to the first sentence.";
  };

  const previewUrlDisplay = (() => {
    try {
      const u = new URL(pageUrl.startsWith("http") ? pageUrl : `https://${pageUrl}`);
      return `${u.hostname}${u.pathname === "/" ? "" : u.pathname}`;
    } catch {
      return pageUrl || "example.com/page";
    }
  })();

  const serpPreview = (mode: "desktop" | "mobile") => (
    <div
      className={`rounded-2xl border border-stone-200 bg-white p-4 ${mode === "mobile" ? "max-w-[360px]" : ""}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center shrink-0">
          <Globe className="w-3.5 h-3.5 text-violet-700" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] text-stone-800 font-medium truncate">{siteName || "Your Site"}</p>
          <p className="text-[11px] text-stone-500 truncate">{previewUrlDisplay}</p>
        </div>
      </div>
      <p
        className={`mt-1.5 text-[#1a0dab] leading-snug ${mode === "mobile" ? "text-[17px]" : "text-[20px]"} hover:underline cursor-pointer break-words`}
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {title || "Your page title will appear here"}
      </p>
      <p
        className={`mt-1 text-stone-600 leading-relaxed break-words ${mode === "mobile" ? "text-[13px]" : "text-[14px]"}`}
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        {description || "Your meta description will appear here. Write one or two honest sentences about what the reader gets on this page."}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="metaChecker" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-violet-100 via-purple-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-violet-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.14),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              {m.badge || "Meta Length Checker"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload • Canvas-measured, approximate
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {m.pageTitle || "Check Your Meta Title & Description — Characters, Pixels & Preview"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {m.subtitle || "Type the exact title and description you plan to publish. See live character counts, an approximate pixel width, and how the result may look on desktop and mobile — before you publish."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{m.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {m.quickAnswer || "It counts the characters in a page title and meta description, estimates the rendered width in pixels with your browser's canvas measurement, and shows desktop and mobile search-result previews. Google truncates closer to display width than to a fixed character number and often rewrites both fields, so every number here is display guidance for writing — never a prediction or a ranking guarantee."}
        </p>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-extrabold text-stone-900">{m.fieldsTitle || "Your title & description"}</h2>
          <div className="flex gap-2">
            <button onClick={loadSample} className="px-3 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> {m.sampleBtn || "Try sample"}
            </button>
            <button onClick={clearAll} className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
              <Eraser className="w-3.5 h-3.5" /> {m.clearBtn || "Clear"}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="meta-site">{m.siteNameLabel || "Site name"}</label>
            <input id="meta-site" type="text" value={siteName} onChange={(e) => setSiteName(e.target.value.slice(0, MAX_FIELD))} placeholder="ToolVena" className={inputCls} />
            <p className={hintCls}>{m.siteNameHint || "Shown above the title in the preview, as Google shows the site name and URL."}</p>
          </div>
          <div>
            <label className={labelCls} htmlFor="meta-url">{m.urlLabel || "Page URL"}</label>
            <input id="meta-url" type="text" value={pageUrl} onChange={(e) => setPageUrl(e.target.value.slice(0, MAX_FIELD))} placeholder="https://example.com/your-page" spellCheck={false} className={`${inputCls} font-mono`} />
            <p className={hintCls}>{m.urlHint || "Used only for the preview breadcrumb. Nothing is fetched."}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <label className={labelCls} htmlFor="meta-title">{m.titleLabel || "Meta title"}</label>
            <button onClick={() => doCopy("title", title)} disabled={!title} className="px-3 py-1.5 rounded-lg border-2 border-violet-300 bg-violet-50 hover:bg-violet-100 disabled:opacity-40 text-violet-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
              {copiedField === "title" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === "title" ? (m.copiedBtn || "Copied") : (m.copyTitleBtn || "Copy title")}
            </button>
          </div>
          <input id="meta-title" type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))} placeholder="Free Word Counter — Count Words & Characters Online" className={inputCls} />
          <p className={hintCls}>{m.titleHint || "The clickable headline. Put the most important words first so they survive on narrow screens."}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600">
            <span>{title.length} {m.chars || "characters"}</span>
            <span aria-hidden="true">•</span>
            <span>{wordCount(title)} {m.words || "words"}</span>
            <span aria-hidden="true">•</span>
            <span>~{titlePx} {m.approxPx || "approx. px"} / ~580px</span>
            {tBand !== "empty" && (
              <span className={`px-2 py-0.5 rounded-full border font-sans font-bold ${bandBadge(tBand)}`}>{guidanceFor("title", tBand)}</span>
            )}
          </div>
          <div className="mt-1.5">{meter(titlePx, 580)}</div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <label className={labelCls} htmlFor="meta-desc">{m.descLabel || "Meta description"}</label>
            <button onClick={() => doCopy("desc", description)} disabled={!description} className="px-3 py-1.5 rounded-lg border-2 border-violet-300 bg-violet-50 hover:bg-violet-100 disabled:opacity-40 text-violet-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
              {copiedField === "desc" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === "desc" ? (m.copiedBtn || "Copied") : (m.copyDescBtn || "Copy description")}
            </button>
          </div>
          <textarea id="meta-desc" value={description} onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESC))} placeholder="Count words, characters and reading time live in your browser…" rows={3} className={inputCls} />
          <p className={hintCls}>{m.descHint || "The short pitch under the title. Say what the page gives the reader, in one or two honest sentences."}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600">
            <span>{description.length} {m.chars || "characters"}</span>
            <span aria-hidden="true">•</span>
            <span>{wordCount(description)} {m.words || "words"}</span>
            <span aria-hidden="true">•</span>
            <span>~{descPx} {m.approxPx || "approx. px"} / ~920px</span>
            <span aria-hidden="true">•</span>
            <span>mobile ~{descPxMobile}px / ~680px</span>
            {dBand !== "empty" && (
              <span className={`px-2 py-0.5 rounded-full border font-sans font-bold ${bandBadge(dBand)}`}>{guidanceFor("desc", dBand)}</span>
            )}
          </div>
          <div className="mt-1.5 space-y-1.5">
            {meter(descPx, 920)}
            {meter(descPxMobile, 680)}
          </div>
          <p className="text-[11px] text-stone-400 mt-1 font-mono">Pixel width is canvas-measured at 20px/14px Arial and labelled approximate — real SERP rendering varies by font, device and layout.</p>
        </div>
      </div>

      {/* Previews */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-stone-50 rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
          <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-violet-600" /> {m.desktopPreview || "Desktop preview"}
          </h2>
          {serpPreview("desktop")}
        </div>
        <div className="bg-stone-50 rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
          <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-600" /> {m.mobilePreview || "Mobile preview"}
          </h2>
          {serpPreview("mobile")}
        </div>
      </div>
      <p className="text-xs text-stone-500 px-1">{m.previewNote || "Preview only — a writing aid, not a promise. Google may show a different title, snippet, favicon or layout for any query."}</p>

      {/* Guidance */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{m.guidanceTitle || "Length guidance — display only, not a ranking rule"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {m.guidanceText || "Title about 30–60 characters (roughly up to 580px) and description about 120–160 characters on desktop (roughly up to 920px), with less room on mobile (roughly up to 680px), usually display in full. Shorter can look thin; longer is more likely to be cut with an ellipsis. Hitting a band does not improve ranking — it only makes truncation less likely."}
        </p>
      </div>

      {/* Honest notes */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{m.honestTitle || "Read this once: Google decides what is shown"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {m.honestText || "Google frequently rewrites page titles and replaces meta descriptions with a snippet taken from the page itself, depending on the search query and the device. The same page can show different text for different searches. No length checker — including this one — can guarantee how a result will display or that a 'good length' will rank. Write an accurate title, an honest description that matches the page, and keep the important words early. This tool also ignores the old meta keywords tag on purpose: Google does not use it for ranking, so stuffing it helps nothing."}
          </p>
        </div>
      </div>

      <p className="text-xs text-stone-500 flex items-center gap-1.5 px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {m.localNote || "Your title, description and URL are processed only in this browser tab — never uploaded, stored on a server or shared by this tool."}
      </p>

      <ToolGuideSection toolId="metaChecker" selectedLanguage={selectedLanguage} />
    </div>
  );
}
