import React, { useEffect, useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Bookmark, Check, Copy, Eraser, FlaskConical, Link2, Save,
  ShieldCheck, Trash2, TriangleAlert,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface UtmLinkBuilderWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

interface Preset {
  name: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

const STORAGE_KEY = "toolvena_utm_presets_v1";
const MAX_FIELD = 500;

const SAMPLE: Preset = {
  name: "",
  baseUrl: "https://www.toolvena.com/word-counter/",
  source: "newsletter",
  medium: "email",
  campaign: "october_tips",
  term: "",
  content: "top_button",
};

function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => p && typeof p.name === "string") : [];
  } catch {
    return [];
  }
}

function savePresets(presets: Preset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    /* storage full / private mode — presets are a convenience, not a promise */
  }
}

/**
 * Build the final URL honestly:
 * - values are encoded with encodeURIComponent exactly once
 * - an existing #fragment stays at the very end
 * - existing non-UTM query parameters are preserved
 * - existing utm_* parameters on the base URL are replaced, never duplicated
 */
function buildUtmUrl(p: Omit<Preset, "name">): string {
  const base = p.baseUrl.trim();
  if (!base) return "";
  const pairs: [string, string][] = [];
  if (p.source.trim()) pairs.push(["utm_source", p.source.trim()]);
  if (p.medium.trim()) pairs.push(["utm_medium", p.medium.trim()]);
  if (p.campaign.trim()) pairs.push(["utm_campaign", p.campaign.trim()]);
  if (p.term.trim()) pairs.push(["utm_term", p.term.trim()]);
  if (p.content.trim()) pairs.push(["utm_content", p.content.trim()]);
  if (pairs.length === 0) return base;

  const hashIdx = base.indexOf("#");
  const fragment = hashIdx >= 0 ? base.slice(hashIdx) : "";
  const withoutFragment = hashIdx >= 0 ? base.slice(0, hashIdx) : base;
  const qIdx = withoutFragment.indexOf("?");
  const head = qIdx >= 0 ? withoutFragment.slice(0, qIdx) : withoutFragment;
  const existingQuery = qIdx >= 0 ? withoutFragment.slice(qIdx + 1) : "";
  const kept = existingQuery
    ? existingQuery.split("&").filter((part) => {
        const key = part.split("=")[0].toLowerCase();
        return !["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].includes(key);
      }).filter(Boolean)
    : [];
  const encoded = pairs.map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  const all = [...kept, ...encoded];
  return `${head}?${all.join("&")}${fragment}`;
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

export function UtmLinkBuilderWorkspace({ selectedLanguage = "en" }: UtmLinkBuilderWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const u = (t as any).utmLinkBuilder || {};

  const [fields, setFields] = useState<Omit<Preset, "name">>({
    baseUrl: SAMPLE.baseUrl,
    source: SAMPLE.source,
    medium: SAMPLE.medium,
    campaign: SAMPLE.campaign,
    term: SAMPLE.term,
    content: SAMPLE.content,
  });
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedNote, setSavedNote] = useState(false);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const finalUrl = useMemo(() => buildUtmUrl(fields), [fields]);

  const hasUppercase = [fields.source, fields.medium, fields.campaign, fields.term, fields.content]
    .some((v) => v !== v.toLowerCase());
  const hasSpace = [fields.source, fields.medium, fields.campaign, fields.term, fields.content]
    .some((v) => /\s/.test(v));
  const missingCore = !fields.baseUrl.trim() || !fields.source.trim() || !fields.medium.trim() || !fields.campaign.trim();
  const looksLikeEmail = [fields.source, fields.medium, fields.campaign, fields.term, fields.content]
    .some((v) => /@/.test(v));

  const set = (key: keyof Omit<Preset, "name">) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, MAX_FIELD);
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const makeLowercase = () => {
    setFields((prev) => ({
      ...prev,
      source: prev.source.toLowerCase(),
      medium: prev.medium.toLowerCase(),
      campaign: prev.campaign.toLowerCase(),
      term: prev.term.toLowerCase(),
      content: prev.content.toLowerCase(),
    }));
  };

  const loadSample = () => {
    setFields({
      baseUrl: SAMPLE.baseUrl, source: SAMPLE.source, medium: SAMPLE.medium,
      campaign: SAMPLE.campaign, term: SAMPLE.term, content: SAMPLE.content,
    });
  };

  const clearAll = () => {
    setFields({ baseUrl: "", source: "", medium: "", campaign: "", term: "", content: "" });
  };

  const copyFinal = async () => {
    if (!finalUrl) return;
    await copyText(finalUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const next = [...presets.filter((p) => p.name.toLowerCase() !== name.toLowerCase()), { name, ...fields }];
    setPresets(next);
    savePresets(next);
    setPresetName("");
    setSavedNote(true);
    window.setTimeout(() => setSavedNote(false), 1600);
  };

  const applyPreset = (p: Preset) => {
    setFields({ baseUrl: p.baseUrl, source: p.source, medium: p.medium, campaign: p.campaign, term: p.term, content: p.content });
  };

  const deletePreset = (name: string) => {
    const next = presets.filter((p) => p.name !== name);
    setPresets(next);
    savePresets(next);
  };

  const builtinPresets: Preset[] = [
    { name: u.presetNewsletter || "Newsletter email", baseUrl: fields.baseUrl || "https://example.com/", source: "newsletter", medium: "email", campaign: "weekly_update", term: "", content: "" },
    { name: u.presetSocial || "Social post", baseUrl: fields.baseUrl || "https://example.com/", source: "facebook", medium: "social", campaign: "launch_post", term: "", content: "" },
  ];

  const inputCls = "w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400";
  const labelCls = "block text-sm font-extrabold text-stone-900 mb-1";
  const hintCls = "text-xs text-stone-500 mt-1 leading-relaxed";

  const fieldBlock = (
    key: keyof Omit<Preset, "name">,
    label: string,
    hint: string,
    placeholder: string,
    mono = false,
  ) => (
    <div>
      <label className={labelCls} htmlFor={`utm-${key}`}>{label}</label>
      <input
        id={`utm-${key}`}
        type="text"
        value={fields[key]}
        onChange={set(key)}
        placeholder={placeholder}
        spellCheck={false}
        className={`${inputCls} ${mono ? "font-mono" : ""}`}
      />
      <p className={hintCls}>{hint}</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="utmLinkBuilder" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-emerald-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.14),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              {u.badge || "UTM Link Builder"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload • encodeURIComponent
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {u.pageTitle || "Build a UTM Link — Source, Medium & Campaign, Done Right"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {u.subtitle || "Fill in where the click comes from, what kind of channel it is, and which campaign it belongs to. The tagged link builds itself live, correctly encoded — and your naming presets stay saved on this device."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{u.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {u.quickAnswer || "It appends the five standard UTM parameters — utm_source, utm_medium, utm_campaign, plus optional utm_term and utm_content — to your destination URL, encoding every value with encodeURIComponent so spaces and special characters cannot break the link. UTMs only label the click; whether it is reported correctly still depends on your analytics being installed, consent settings, redirects, and the platform not stripping the parameters."}
        </p>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-extrabold text-stone-900">{u.fieldsTitle || "Your destination & campaign"}</h2>
          <div className="flex gap-2">
            <button onClick={loadSample} className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> {u.sampleBtn || "Try sample"}
            </button>
            <button onClick={clearAll} className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
              <Eraser className="w-3.5 h-3.5" /> {u.clearBtn || "Clear"}
            </button>
          </div>
        </div>

        {fieldBlock("baseUrl", u.baseUrlLabel || "Destination URL", u.baseUrlHint || "The full page the visitor should land on, including https://. Existing non-UTM query parameters are kept; old utm_* values are replaced, not duplicated.", "https://example.com/your-page", true)}
        <div className="grid sm:grid-cols-2 gap-4">
          {fieldBlock("source", u.sourceLabel || "Source — utm_source", u.sourceHint || "Where the traffic comes from: newsletter, facebook, google, a partner name. Keep one spelling forever.", "newsletter")}
          {fieldBlock("medium", u.mediumLabel || "Medium — utm_medium", u.mediumHint || "The kind of channel: email, social, cpc, referral. Source says where; medium says what kind.", "email")}
        </div>
        {fieldBlock("campaign", u.campaignLabel || "Campaign — utm_campaign", u.campaignHint || "The specific push: october_tips, spring_sale, product_launch. Same name for every link in the same campaign.", "october_tips")}
        <div className="grid sm:grid-cols-2 gap-4">
          {fieldBlock("term", u.termLabel || "Term — utm_term (optional)", u.termHint || "Mostly for paid search keywords. Leave empty for email and social links.", "running+shoes")}
          {fieldBlock("content", u.contentLabel || "Content — utm_content (optional)", u.contentHint || "Which version was clicked when several links share one campaign: top_button, footer_link, banner_a.", "top_button")}
        </div>

        {(hasUppercase || hasSpace) && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-extrabold text-amber-950">{u.caseTitle || "Lowercase is the convention — your reports will thank you"}</p>
              <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                {u.caseText || "Most analytics tools treat Facebook and facebook as two different sources, and a raw space becomes %20 in the link. Pick lowercase, use hyphens or underscores instead of spaces, and use the exact same spelling every time — that consistency is what keeps one campaign from splitting into five report rows."}
              </p>
              {hasUppercase && (
                <button onClick={makeLowercase} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer">
                  {u.caseBtn || "Make all values lowercase"}
                </button>
              )}
            </div>
          </div>
        )}

        {looksLikeEmail && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-extrabold text-red-900">{u.personalTitle || "That looks like personal data — take it out"}</p>
              <p className="text-xs sm:text-sm text-red-900/80 leading-relaxed mt-1">
                {u.personalText || "Never put names, email addresses, phone numbers or any personal data in UTM values. Links get forwarded, screenshotted, logged and pasted into chats, so anything inside a URL travels. Label the campaign, never the person."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Final URL */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-sm font-extrabold text-stone-900" htmlFor="utm-final">
            {u.finalLabel || "Your tagged link (live preview)"}
          </label>
          <button onClick={copyFinal} disabled={!finalUrl || missingCore} className="px-4 py-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? (u.copiedBtn || "Copied") : (u.copyBtn || "Copy tagged link")}
          </button>
        </div>
        <textarea id="utm-final" value={finalUrl} readOnly rows={3} placeholder={u.finalEmpty || "Fill in the destination URL and at least source, medium and campaign — the finished link appears here as you type."} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-mono break-all focus:outline-none" />
        {missingCore && (
          <p className="text-xs text-stone-500">{u.missingNote || "A useful tagged link needs at least a destination, a source, a medium and a campaign. Term and content are optional extras."}</p>
        )}
        <p className="text-xs text-stone-500">{u.finalNote || "The preview updates live. If your destination already carries utm_* parameters, they are replaced by the values above — never stacked twice. Any #fragment stays at the very end, where browsers expect it."}</p>
      </div>

      {/* Presets */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-emerald-600" /> {u.presetsTitle || "Saved presets — on this device only"}
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {u.presetsNote || "Consistency is a habit, not a memory test. Save the source/medium spellings your team agreed on, then load them in one tap instead of retyping — and mistyping — them for every link. Presets live in this browser on this device; they are never uploaded."}
        </p>
        <div className="flex flex-wrap gap-2">
          {builtinPresets.map((p) => (
            <button key={p.name} onClick={() => applyPreset(p)} className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-all cursor-pointer">
              {p.name}
            </button>
          ))}
          {presets.map((p) => (
            <span key={p.name} className="inline-flex items-center gap-1 rounded-xl bg-teal-50 border border-teal-200 pl-3 pr-1 py-1">
              <button onClick={() => applyPreset(p)} className="text-teal-900 text-xs font-bold cursor-pointer">{p.name}</button>
              <button onClick={() => deletePreset(p.name)} aria-label={`${u.deletePreset || "Delete preset"}: ${p.name}`} className="p-1 rounded-lg hover:bg-teal-100 text-teal-800 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={presetName} onChange={(e) => setPresetName(e.target.value.slice(0, 60))} placeholder={u.presetNamePlaceholder || "Preset name, e.g. Monthly newsletter"} className={`${inputCls} flex-1`} />
          <button onClick={savePreset} disabled={!presetName.trim()} className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5">
            <Save className="w-4 h-4" /> {savedNote ? (u.savedBtn || "Saved") : (u.savePresetBtn || "Save current as preset")}
          </button>
        </div>
      </div>

      {/* Honest notes */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{u.honestTitle || "What UTMs cannot promise — read this once"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {u.honestText || "A perfectly built UTM link does not guarantee correct attribution. Your analytics must actually be installed on the landing page; consent mode or an ad-blocker can prevent the visit from being recorded at all; a redirect can drop the query string; and some apps and platforms strip parameters when a link is shared onward. Tag external links only — putting UTMs on links inside your own site overwrites the visitor's real source. Build the link here, then click-test it once and check that the parameters survive to the final page."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{u.namingTitle || "A naming habit that keeps reports clean"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {u.namingText || "Decide your spellings once and write them down: the platform is always facebook (never fb or Facebook), the medium for the newsletter is always email, and campaign names follow one pattern like month_topic (october_tips). Three spellings for one channel means three separate rows in every report, forever. The presets above exist so the agreed spelling is one tap away instead of a fresh guess each time."}
        </p>
      </div>

      <p className="text-xs text-stone-500 flex items-center gap-1.5 px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        {u.localNote || "Your URLs and presets are processed only in this browser tab and saved only on this device — never uploaded, stored on a server or shared by this tool."}
      </p>

      <ToolGuideSection toolId="utmLinkBuilder" selectedLanguage={selectedLanguage} />
    </div>
  );
}
