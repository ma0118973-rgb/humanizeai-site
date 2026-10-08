import React, { useState, useEffect, useRef } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Briefcase, Copy, Check, Sparkles, Trash2, Printer, Plus, X,
  GraduationCap, Wrench, Languages, User, ShieldCheck, ArrowRight, Camera,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface CvBuilderWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

interface Experience { id: number; title: string; company: string; start: string; end: string; desc: string }
interface Education { id: number; school: string; degree: string; year: string }

interface CvData {
  photo: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
  languages: string;
  template: "modern" | "classic";
  accent: string;
}

const ACCENTS: Record<string, { bar: string; text: string; soft: string }> = {
  indigo: { bar: "#4f46e5", text: "#4338ca", soft: "#eef2ff" },
  teal: { bar: "#0d9488", text: "#0f766e", soft: "#f0fdfa" },
  navy: { bar: "#1e3a5f", text: "#1e3a5f", soft: "#eff6ff" },
  rose: { bar: "#e11d48", text: "#be123c", soft: "#fff1f2" },
};

const SAMPLE: Omit<CvData, "photo" | "template" | "accent"> = {
  name: "Ayesha Khan",
  jobTitle: "Customer Support Officer",
  email: "ayesha.khan@example.com",
  phone: "+92 300 1234567",
  location: "Lahore, Pakistan",
  summary:
    "Customer support officer with 3 years of experience handling chat, email, and phone queries for an online retail company. Known for calm problem-solving and clear writing. Looking to grow into a team-lead role.",
  experience: [
    {
      id: 1,
      title: "Customer Support Officer",
      company: "DigiMart Online Store",
      start: "2023",
      end: "Present",
      desc: "Answer 60+ customer chats and emails daily. Resolved delivery and refund issues, keeping a 96% satisfaction score. Trained 4 new support agents.",
    },
    {
      id: 2,
      title: "Support Assistant",
      company: "City Telecom Franchise",
      start: "2021",
      end: "2023",
      desc: "Helped walk-in customers with SIM, billing, and package queries. Maintained daily sales and complaint records in Excel.",
    },
  ],
  education: [
    { id: 1, school: "University of the Punjab", degree: "B.Com (Commerce)", year: "2021" },
  ],
  skills: "Customer chat & email, MS Excel, Urdu & English typing, Complaint handling, Data entry",
  languages: "Urdu (native), English (fluent), Punjabi (spoken)",
};

const EMPTY: CvData = {
  photo: "", name: "", jobTitle: "", email: "", phone: "", location: "", summary: "",
  experience: [{ id: 1, title: "", company: "", start: "", end: "", desc: "" }],
  education: [{ id: 1, school: "", degree: "", year: "" }],
  skills: "", languages: "", template: "modern", accent: "indigo",
};

const STORAGE_KEY = "cvbuilder_data_v1";

export function CvBuilderWorkspace({ selectedLanguage = "en", onSendToHumanizer }: CvBuilderWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const cv = (t as any).cvBuilder || {};

  const [data, setData] = useState<CvData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && "name" in parsed) return { ...EMPTY, ...parsed };
      }
    } catch { /* fresh start */ }
    return EMPTY;
  });
  const [saved, setSaved] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(100);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaved(true);
      const tmr = setTimeout(() => setSaved(false), 1200);
      return () => clearTimeout(tmr);
    } catch { /* storage unavailable */ }
  }, [data]);

  const set = (patch: Partial<CvData>) => setData((d) => ({ ...d, ...patch }));
  const nextId = () => ++idRef.current;

  const updateExp = (id: number, patch: Partial<Experience>) =>
    set({ experience: data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const updateEdu = (id: number, patch: Partial<Education>) =>
    set({ education: data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  const handlePhoto = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ photo: String(reader.result || "") });
    reader.readAsDataURL(file);
  };

  const handleSample = () => set({ ...SAMPLE });
  const handleClear = () => {
    setData(EMPTY);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  };

  const accent = ACCENTS[data.accent] || ACCENTS.indigo;
  const skillsList = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const langsList = data.languages.split(",").map((s) => s.trim()).filter(Boolean);

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-stone-300 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-indigo-500 bg-white";
  const labelCls = "block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="cvBuilder" selectedLanguage={selectedLanguage} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-100 via-indigo-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-indigo-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.14),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              {cv.badge || "CV Builder"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up</span>
            {saved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><Check className="w-3.5 h-3.5" />{cv.savedNote || "Saved on this device"}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {cv.title || "Build a Clean, Professional CV"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {cv.subtitle || "Fill in your details, watch the CV build itself on the right, then print it or save it as a PDF. Your information never leaves this device — nothing is uploaded or stored by us."}
          </p>
        </div>
      </div>

      {/* Quick Answer */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-indigo-950">
              {cv.quickAnswerTitle || "Quick Answer: What Makes a CV Get Noticed?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {cv.quickAnswer || "A clean layout, a two-line summary of who you are, jobs described with results (numbers help), and skills that match the job ad — written honestly. This builder handles the layout and formatting; the experience and words stay yours, so nothing on your CV is invented."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ------- FORM ------- */}
        <div className="space-y-5">
          {/* Personal */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-indigo-600" /> {cv.personalSection || "Personal Details"}
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0">
                {data.photo ? <img src={data.photo} alt="" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-indigo-300" />}
              </div>
              <div className="space-y-1">
                <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer">
                  {cv.addPhoto || "Add Photo"}
                </button>
                {data.photo && (
                  <button onClick={() => set({ photo: "" })} className="block text-[11px] text-stone-500 underline underline-offset-2 cursor-pointer">
                    {cv.removePhoto || "Remove photo"}
                  </button>
                )}
                <p className="text-[11px] text-stone-400">{cv.photoHint || "Optional — photo customs differ by country."}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>{cv.fullName || "Full Name"}</label><input className={inputCls} value={data.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ayesha Khan" /></div>
              <div><label className={labelCls}>{cv.jobTitle || "Job Title"}</label><input className={inputCls} value={data.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} placeholder="Customer Support Officer" /></div>
              <div><label className={labelCls}>{cv.email || "Email"}</label><input className={inputCls} value={data.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@example.com" /></div>
              <div><label className={labelCls}>{cv.phone || "Phone"}</label><input className={inputCls} value={data.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+92 300 1234567" /></div>
              <div className="sm:col-span-2"><label className={labelCls}>{cv.location || "City, Country"}</label><input className={inputCls} value={data.location} onChange={(e) => set({ location: e.target.value })} placeholder="Lahore, Pakistan" /></div>
            </div>
            <div className="mt-3">
              <label className={labelCls}>{cv.summaryLabel || "Professional Summary (2-3 lines)"}</label>
              <textarea className={`${inputCls} h-24 resize-none`} value={data.summary} onChange={(e) => set({ summary: e.target.value })} placeholder={cv.summaryPlaceholder || "Who you are, your experience, and the job you want — in two or three honest lines."} />
              {onSendToHumanizer && data.summary.trim() && (
                <button onClick={() => onSendToHumanizer(data.summary)} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 underline underline-offset-2 cursor-pointer">
                  {cv.polishSummary || "Polish this summary in the Humanizer"} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-indigo-600" /> {cv.experienceSection || "Work Experience"}
            </h3>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border border-stone-200 rounded-2xl p-3.5 space-y-2.5 relative">
                  {data.experience.length > 1 && (
                    <button onClick={() => set({ experience: data.experience.filter((e) => e.id !== exp.id) })} className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-500 cursor-pointer" aria-label="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input className={inputCls} value={exp.title} onChange={(e) => updateExp(exp.id, { title: e.target.value })} placeholder={cv.jobTitle || "Job Title"} />
                    <input className={inputCls} value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })} placeholder={cv.company || "Company"} />
                    <input className={inputCls} value={exp.start} onChange={(e) => updateExp(exp.id, { start: e.target.value })} placeholder={cv.startYear || "Start (e.g. 2023)"} />
                    <input className={inputCls} value={exp.end} onChange={(e) => updateExp(exp.id, { end: e.target.value })} placeholder={cv.endYear || "End or Present"} />
                  </div>
                  <textarea className={`${inputCls} h-20 resize-none`} value={exp.desc} onChange={(e) => updateExp(exp.id, { desc: e.target.value })} placeholder={cv.descPlaceholder || "What you did and what improved — numbers make it believable."} />
                </div>
              ))}
            </div>
            <button onClick={() => set({ experience: [...data.experience, { id: nextId(), title: "", company: "", start: "", end: "", desc: "" }] })} className="mt-3 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> {cv.addJob || "Add Another Job"}
            </button>
          </div>

          {/* Education */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> {cv.educationSection || "Education"}
            </h3>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="border border-stone-200 rounded-2xl p-3.5 relative">
                  {data.education.length > 1 && (
                    <button onClick={() => set({ education: data.education.filter((e) => e.id !== edu.id) })} className="absolute top-2.5 right-2.5 text-stone-400 hover:text-red-500 cursor-pointer" aria-label="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <input className={inputCls} value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })} placeholder={cv.degree || "Degree"} />
                    <input className={inputCls} value={edu.school} onChange={(e) => updateEdu(edu.id, { school: e.target.value })} placeholder={cv.school || "School / University"} />
                    <input className={inputCls} value={edu.year} onChange={(e) => updateEdu(edu.id, { year: e.target.value })} placeholder={cv.year || "Year"} />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => set({ education: [...data.education, { id: nextId(), school: "", degree: "", year: "" }] })} className="mt-3 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> {cv.addEducation || "Add Education"}
            </button>
          </div>

          {/* Skills & languages */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 space-y-4">
            <div>
              <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-indigo-600" /> {cv.skillsSection || "Skills"}
              </h3>
              <input className={inputCls} value={data.skills} onChange={(e) => set({ skills: e.target.value })} placeholder={cv.skillsPlaceholder || "Separate skills with commas — e.g. MS Excel, Customer chat, Data entry"} />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4 text-indigo-600" /> {cv.languagesSection || "Languages"}
              </h3>
              <input className={inputCls} value={data.languages} onChange={(e) => set({ languages: e.target.value })} placeholder={cv.languagesPlaceholder || "e.g. Urdu (native), English (fluent)"} />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mr-1">{cv.templateLabel || "Template"}</span>
              {(["modern", "classic"] as const).map((tpl) => (
                <button key={tpl} onClick={() => set({ template: tpl })} className={`px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${data.template === tpl ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-stone-600 border-stone-300 hover:border-indigo-300"}`}>
                  {tpl === "modern" ? (cv.templateModern || "Modern") : (cv.templateClassic || "Classic")}
                </button>
              ))}
              <span className="flex items-center gap-1.5 ml-2">
                {Object.keys(ACCENTS).map((key) => (
                  <button key={key} onClick={() => set({ accent: key })} aria-label={key} className={`w-6 h-6 rounded-full border-2 cursor-pointer ${data.accent === key ? "border-stone-700" : "border-transparent"}`} style={{ backgroundColor: ACCENTS[key].bar }} />
                ))}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow">
                <Printer className="w-4 h-4" /> {cv.printBtn || "Print / Save as PDF"}
              </button>
              <button onClick={handleSample} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-indigo-400 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5" /> {cv.sampleBtn || "Fill Sample Data"}
              </button>
              <button onClick={handleClear} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-red-300 hover:text-red-600 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> {cv.clearBtn || "Clear All"}
              </button>
              <button
                onClick={() => {
                  const lines = [data.name, data.jobTitle, [data.email, data.phone, data.location].filter(Boolean).join(" | "), "", data.summary].filter(Boolean).join("\n");
                  navigator.clipboard.writeText(lines);
                  setSummaryCopied(true);
                  setTimeout(() => setSummaryCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
              >
                {summaryCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {summaryCopied ? (cv.copied || "Copied!") : (cv.copyTop || "Copy Header + Summary")}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-stone-500 leading-relaxed flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-500" />
              {cv.privacyNote || "Everything you type stays on this device (your browser saves it here so you can continue later). We never receive, upload, or store your CV data."}
            </p>
          </div>
        </div>

        {/* ------- PREVIEW ------- */}
        <div className="lg:sticky lg:top-24">
          <div id="cv-print-area" className="bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-stone-800" style={{ minHeight: 560 }}>
            {data.template === "modern" ? (
              <div>
                <div className="p-6 sm:p-7 flex items-center gap-4" style={{ backgroundColor: accent.soft, borderBottom: `3px solid ${accent.bar}` }}>
                  {data.photo && <img src={data.photo} alt="" className="w-20 h-20 rounded-full object-cover border-2 shrink-0" style={{ borderColor: accent.bar }} />}
                  <div className="min-w-0">
                    <div className="text-2xl font-extrabold tracking-tight" style={{ color: accent.text }}>{data.name || "Your Name"}</div>
                    <div className="text-sm font-semibold text-stone-600">{data.jobTitle || "Job Title"}</div>
                    <div className="text-[11px] text-stone-500 mt-1 break-words">{[data.email, data.phone, data.location].filter(Boolean).join("  •  ")}</div>
                  </div>
                </div>
                <div className="p-6 sm:p-7 space-y-5">
                  {data.summary.trim() && (
                    <section>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest mb-1.5" style={{ color: accent.text }}>{cv.previewSummary || "Summary"}</h4>
                      <p className="text-[13px] leading-relaxed text-stone-700 whitespace-pre-wrap">{data.summary}</p>
                    </section>
                  )}
                  {data.experience.some((e) => e.title || e.company) && (
                    <section>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: accent.text }}>{cv.previewExperience || "Experience"}</h4>
                      <div className="space-y-3.5">
                        {data.experience.filter((e) => e.title || e.company).map((e) => (
                          <div key={e.id}>
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <span className="text-sm font-bold text-stone-900">{e.title}{e.company ? ` — ${e.company}` : ""}</span>
                              <span className="text-[11px] font-mono text-stone-500">{[e.start, e.end].filter(Boolean).join(" – ")}</span>
                            </div>
                            {e.desc && <p className="text-[13px] leading-relaxed text-stone-700 whitespace-pre-wrap mt-0.5">{e.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  {data.education.some((e) => e.degree || e.school) && (
                    <section>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: accent.text }}>{cv.previewEducation || "Education"}</h4>
                      <div className="space-y-1.5">
                        {data.education.filter((e) => e.degree || e.school).map((e) => (
                          <div key={e.id} className="flex items-baseline justify-between gap-2 flex-wrap">
                            <span className="text-[13px] text-stone-700"><strong className="text-stone-900">{e.degree}</strong>{e.school ? `, ${e.school}` : ""}</span>
                            <span className="text-[11px] font-mono text-stone-500">{e.year}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  {skillsList.length > 0 && (
                    <section>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: accent.text }}>{cv.previewSkills || "Skills"}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsList.map((s, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-stone-700" style={{ backgroundColor: accent.soft }}>{s}</span>
                        ))}
                      </div>
                    </section>
                  )}
                  {langsList.length > 0 && (
                    <section>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest mb-1.5" style={{ color: accent.text }}>{cv.previewLanguages || "Languages"}</h4>
                      <p className="text-[13px] text-stone-700">{langsList.join("  •  ")}</p>
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                <div className="text-center border-b-2 pb-4" style={{ borderColor: accent.bar }}>
                  {data.photo && <img src={data.photo} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2" style={{ borderColor: accent.bar }} />}
                  <div className="text-[26px] font-bold tracking-wide text-stone-900">{data.name || "Your Name"}</div>
                  <div className="text-sm italic text-stone-600">{data.jobTitle || "Job Title"}</div>
                  <div className="text-[11px] text-stone-500 mt-1">{[data.email, data.phone, data.location].filter(Boolean).join("  |  ")}</div>
                </div>
                <div className="space-y-5 pt-5">
                  {data.summary.trim() && (
                    <section>
                      <h4 className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: accent.text }}>{cv.previewSummary || "Summary"}</h4>
                      <p className="text-[13px] leading-relaxed text-stone-700 whitespace-pre-wrap">{data.summary}</p>
                    </section>
                  )}
                  {data.experience.some((e) => e.title || e.company) && (
                    <section>
                      <h4 className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accent.text }}>{cv.previewExperience || "Experience"}</h4>
                      <div className="space-y-3.5">
                        {data.experience.filter((e) => e.title || e.company).map((e) => (
                          <div key={e.id}>
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <span className="text-sm font-bold text-stone-900">{e.title}{e.company ? `, ${e.company}` : ""}</span>
                              <span className="text-[11px] text-stone-500">{[e.start, e.end].filter(Boolean).join(" – ")}</span>
                            </div>
                            {e.desc && <p className="text-[13px] leading-relaxed text-stone-700 whitespace-pre-wrap mt-0.5">{e.desc}</p>}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  {data.education.some((e) => e.degree || e.school) && (
                    <section>
                      <h4 className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: accent.text }}>{cv.previewEducation || "Education"}</h4>
                      <div className="space-y-1.5">
                        {data.education.filter((e) => e.degree || e.school).map((e) => (
                          <div key={e.id} className="flex items-baseline justify-between gap-2 flex-wrap">
                            <span className="text-[13px] text-stone-700"><strong className="text-stone-900">{e.degree}</strong>{e.school ? `, ${e.school}` : ""}</span>
                            <span className="text-[11px] text-stone-500">{e.year}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                  {skillsList.length > 0 && (
                    <section>
                      <h4 className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: accent.text }}>{cv.previewSkills || "Skills"}</h4>
                      <p className="text-[13px] text-stone-700 text-center">{skillsList.join("  •  ")}</p>
                    </section>
                  )}
                  {langsList.length > 0 && (
                    <section>
                      <h4 className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: accent.text }}>{cv.previewLanguages || "Languages"}</h4>
                      <p className="text-[13px] text-stone-700 text-center">{langsList.join("  •  ")}</p>
                    </section>
                  )}
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-stone-400 mt-2 text-center">{cv.printHint || "Print or “Save as PDF” — only this CV prints, nothing else from the page."}</p>
        </div>
      </div>

      <ToolGuideSection toolId="cvBuilder" selectedLanguage={selectedLanguage} />
    </div>
  );
}
