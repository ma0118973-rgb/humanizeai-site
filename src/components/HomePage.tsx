import { useMemo, useState } from "react";
import {
  Sparkles,
  FileText,
  Hash,
  Image as ImageIcon,
  FileStack,
  Briefcase,
  Scissors,
  FileAudio,
  Search,
  ShieldCheck,
  Globe2,
  MousePointerClick,
  ArrowRight,
  BookOpen,
  PenLine,
  GraduationCap,
  Wrench,
  CheckCircle2,
  ScanText,
  KeyRound,
  Braces,
  Mic,
  Volume2,
  Keyboard,
  Type,
  CaseSensitive,
  ListFilter,
  Repeat,
  EyeOff,
  BarChart3,
  Timer,
  Code2,
  FileCode2,
  Shapes,
  Ruler,
  Clock3,
  Binary,
  Cake,
  Dices,
  Fingerprint,
  AtSign,
  Link2,
  Tag,
  FileQuestion,
  Presentation,
  FileSignature,
  AlarmClock,
  Eraser,
  Radio,
  GitCompareArrows,
  AudioLines,
  NotebookPen,
  Instagram,
  FileImage,
} from "lucide-react";
import { ActivePage, LanguageCode } from "../types";
import { ALL_SUPPORTED_LANGUAGES, SEO_CONFIGS, URPK_PAGES } from "../utils/seo";
import { BLOG_POSTS } from "../data/blogArticles";
import { HOME_COPY } from "../data/homeCopy";
import { TRANSLATIONS } from "../data/translations";

/*
 * ToolVena homepage (rebuild).
 * The tool catalogue below is data-driven from SEO_CONFIGS, so every link and
 * count on this page comes from the real, live tool inventory — no invented
 * tools, no invented numbers. All visible copy comes from HOME_COPY
 * (src/data/homeCopy.ts) for the active language, with tool names/blurbs
 * derived from that language's own seo titles/descriptions in
 * translations.ts; English renders exactly as the original rebuild.
 * FAQ Q&A lives in translations.ts (seo.homeFaqs) — one source of truth that
 * the visible FAQ, the runtime FAQPage schema (utils/seo.ts) and the static
 * generator (scripts/generate-static-pages.mjs) all read. HOME_FAQS below is
 * only the English fallback for that single source.
 */

type ToolCategory =
  | "writing"
  | "image"
  | "pdf"
  | "audio"
  | "converters"
  | "generators";

interface ToolMeta {
  page: ActivePage;
  name: string;
  blurb: string;
  keywords: string;
  icon: typeof Sparkles;
  accent: string;
}

const TOOLS: Array<[ActivePage, ToolCategory, string, string, string, typeof Sparkles, string]> = [
  // page, category, display name, blurb, search keywords, icon, tailwind gradient accent
  // ---- Writing & text ----
  ["humanizer", "writing", "AI Text Humanizer", "Make AI-assisted drafts read clearer and more natural.", "ai humanizer humanize rewrite rewrite text chatgpt natural", Sparkles, "from-emerald-500 to-teal-400"],
  ["summarizer", "writing", "Text Summarizer", "Turn long articles and notes into short key points.", "summarize summary text article tl;dr", FileText, "from-violet-600 to-purple-500"],
  ["wordCounter", "writing", "Word Counter", "Words, characters and reading time — counted live.", "word count words characters counter essay", Hash, "from-lime-500 to-emerald-500"],
  ["characterCounter", "writing", "Character Counter", "Characters with and without spaces, plus limit checks.", "character count letters limit twitter sms", Type, "from-sky-500 to-cyan-500"],
  ["detector", "writing", "AI Content Detector", "Heuristic pattern scan with a sentence heatmap. An estimate, not a verdict.", "ai detector detect ai content check", Search, "from-cyan-500 to-blue-500"],
  ["expander", "writing", "Sentence Expander", "Grow short sentences into fuller, clearer paragraphs.", "expand sentence paragraph longer writing", FileSignature, "from-indigo-500 to-violet-500"],
  ["cleaner", "writing", "AI Cliché Cleaner", "Spot and soften overused AI-style phrases in your draft.", "cliche cleaner ai phrases repetitive wording", Eraser, "from-rose-500 to-pink-500"],
  ["diff", "writing", "Text Diff Checker", "Compare two texts and see exactly what changed.", "diff compare text difference similarity", GitCompareArrows, "from-amber-500 to-orange-500"],
  ["caseConverter", "writing", "Case Converter", "UPPERCASE, lowercase, Title Case and more, in one click.", "case uppercase lowercase title case convert", CaseSensitive, "from-cyan-500 to-teal-500"],
  ["duplicateLines", "writing", "Remove Duplicate Lines", "Paste a list and drop repeated lines, keeping order.", "dedupe duplicate lines remove list unique", ListFilter, "from-teal-500 to-emerald-600"],
  ["textRepeater", "writing", "Text Repeater", "Repeat any word or sentence up to 1,000 times.", "repeat text repeater spam word times", Repeat, "from-fuchsia-500 to-purple-500"],
  ["invisibleCharacter", "writing", "Invisible Character", "Copy a blank character and test hidden text safely.", "invisible character blank text copy empty", EyeOff, "from-slate-500 to-stone-600"],
  ["wordFrequency", "writing", "Word Frequency Counter", "See which words you use most in any text.", "word frequency count most used words", BarChart3, "from-blue-500 to-indigo-500"],
  ["readingTime", "writing", "Reading Time Calculator", "How long a text takes to read or say out loud.", "reading time speaking time words per minute", Timer, "from-emerald-500 to-green-600"],
  ["citation", "writing", "Citation Generator", "APA 7, MLA 9, Chicago and Harvard references.", "citation bibliography reference apa mla chicago harvard", BookOpen, "from-indigo-500 to-purple-500"],
  ["seo", "writing", "SEO Meta & Tags", "Title, description and hashtag ideas for pages and posts.", "seo meta title description hashtags keywords", Tag, "from-orange-500 to-amber-500"],
  ["onlineNotepad", "writing", "Online Notepad", "A clean notepad that saves in your browser as you type.", "notepad notes online write text editor", NotebookPen, "from-yellow-500 to-amber-500"],
  ["instagramLineBreak", "writing", "Instagram Line Breaks", "Captions with line breaks that survive pasting into Instagram.", "instagram line break caption spacing blank lines", Instagram, "from-pink-500 to-rose-500"],
  // ---- Image ----
  ["imageCompressor", "image", "Image Compressor", "Shrink JPG, PNG and WebP photos before you send them.", "compress image jpg png webp smaller photo size", ImageIcon, "from-cyan-500 to-blue-500"],
  ["imageConverter", "image", "Image Converter", "Convert between JPG, PNG and WebP at the same size.", "convert image jpg png webp format", FileImage, "from-violet-500 to-purple-600"],
  ["imageResizer", "image", "Image Resizer & Cropper", "Resize or crop a photo to exact pixels.", "resize image crop pixels dimensions photo", Shapes, "from-sky-500 to-blue-600"],
  ["imageToText", "image", "Image to Text (OCR)", "Pull editable text out of photos and scans.", "ocr image to text extract photo scan", ScanText, "from-cyan-500 to-sky-600"],
  ["backgroundRemover", "image", "Background Remover", "Cut out a photo background and download a transparent PNG.", "background remover remove bg transparent png cutout", Scissors, "from-violet-500 to-fuchsia-500"],
  ["media", "image", "Video & Image Tools", "Crop edges, check pacing and work with image metadata.", "video image media crop metadata pacing", FileImage, "from-blue-500 to-cyan-600"],
  // ---- PDF & files ----
  ["pdfTools", "pdf", "PDF Tools", "Merge PDFs, or build one PDF from your images.", "pdf merge combine images to pdf", FileStack, "from-red-500 to-orange-500"],
  ["pdfSplitter", "pdf", "PDF Splitter", "Extract just the pages you need from a PDF.", "pdf split extract pages separate", Scissors, "from-orange-500 to-amber-600"],
  ["cvBuilder", "pdf", "CV Builder", "Fill in your details and print a clean CV or PDF.", "cv resume builder maker job application", Briefcase, "from-indigo-500 to-blue-500"],
  ["invoiceGenerator", "pdf", "Invoice Generator", "A tidy invoice with totals and tax, ready to print.", "invoice generator bill receipt freelance", FileText, "from-emerald-600 to-teal-600"],
  // ---- Audio & voice ----
  ["audioToText", "audio", "Audio to Text", "Transcribe recordings into text and subtitles, on your device.", "audio to text transcribe mp3 wav speech transcript subtitles", FileAudio, "from-cyan-500 to-sky-500"],
  ["voiceTyping", "audio", "Voice Typing", "Speak and watch your words become text.", "voice typing speech to text dictate dictation microphone", Mic, "from-teal-500 to-emerald-500"],
  ["textToSpeech", "audio", "Text to Speech", "Hear your text read aloud with your device's voices.", "text to speech read aloud tts voice reader", Volume2, "from-violet-500 to-indigo-500"],
  ["voiceRecorder", "audio", "Voice Recorder", "Record voice notes in the browser and download them.", "voice recorder record audio microphone memo", AudioLines, "from-rose-500 to-red-600"],
  ["voiceCloner", "audio", "AI Voice Cloner", "Natural AI voices for any text; clone-guided voice tools in your browser.", "voice cloner ai voice clone text to speech voice", AudioLines, "from-fuchsia-500 to-pink-600"],
  // ---- Converters ----
  ["base64", "converters", "Base64 Encoder & Decoder", "Encode or decode Base64 text and files, both ways.", "base64 encode decode converter", Binary, "from-stone-500 to-neutral-600"],
  ["urlEncoder", "converters", "URL Encoder / Decoder", "Make links safe, or read encoded URLs back.", "url encode decode percent link", Link2, "from-sky-500 to-blue-500"],
  ["jsonFormatter", "converters", "JSON Formatter", "Beautify, minify and validate JSON with a tree view.", "json formatter validator beautify minify pretty", Braces, "from-sky-500 to-blue-600"],
  ["jsonToCsv", "converters", "JSON to CSV", "Turn JSON rows into a spreadsheet-ready CSV file.", "json to csv convert spreadsheet excel", FileCode2, "from-green-500 to-emerald-600"],
  ["unitConverter", "converters", "Unit Converter", "Length, weight, temperature and more, converted instantly.", "unit converter kg lbs cm inches celsius", Ruler, "from-teal-500 to-cyan-600"],
  ["timestampConverter", "converters", "Unix Timestamp Converter", "Timestamps to readable dates, and back again.", "unix timestamp epoch converter date time", Clock3, "from-indigo-500 to-blue-600"],
  ["morseCodeTranslator", "converters", "Morse Code Translator", "Text to Morse and Morse back to text, with sound.", "morse code translator sos dots dashes", Radio, "from-amber-500 to-yellow-600"],
  ["slugGenerator", "converters", "Slug Generator", "Turn a title into a clean, link-ready URL slug.", "slug generator url permalink blog title", Link2, "from-emerald-500 to-teal-500"],
  ["daysBetween", "converters", "Days Between Dates", "Count days, business days and weekends between two dates.", "days between dates calculator difference", Cake, "from-blue-500 to-sky-600"],
  ["regexTester", "converters", "Regex Tester", "Test patterns with live matches highlighted as you type.", "regex tester regular expression pattern match", Code2, "from-purple-500 to-violet-600"],
  // ---- Generators & everyday utilities ----
  ["passwordGenerator", "generators", "Password Generator", "Strong random passwords, made on your device.", "password generator strong random secure", KeyRound, "from-indigo-500 to-blue-600"],
  ["randomNumber", "generators", "Random Number Generator", "Pick random numbers in any range, with no repeats if you want.", "random number generator picker lottery dice", Dices, "from-orange-500 to-red-500"],
  ["uuidGenerator", "generators", "UUID Generator", "Fresh version-4 UUIDs, one or a whole batch.", "uuid guid generator version 4 unique id", Fingerprint, "from-slate-500 to-gray-600"],
  ["usernameGenerator", "generators", "Username Generator", "Ideas for usernames from a keyword you choose.", "username generator ideas name gamer handle", AtSign, "from-pink-500 to-fuchsia-600"],
  ["loremIpsum", "generators", "Lorem Ipsum Generator", "Placeholder paragraphs, sentences or words for designs.", "lorem ipsum dummy text placeholder filler", FileText, "from-stone-500 to-zinc-600"],
  ["utmLinkBuilder", "generators", "UTM Link Builder", "Campaign links with clean utm_source, medium and campaign tags.", "utm builder campaign link tracking marketing", Link2, "from-cyan-600 to-teal-600"],
  ["metaChecker", "generators", "Meta Title & Description Checker", "Check lengths and see a Google-style preview before you publish.", "meta title description length checker serp preview", FileQuestion, "from-blue-500 to-indigo-500"],
  ["onlineTimer", "generators", "Online Timer & Stopwatch", "A simple countdown timer and stopwatch that works in the tab.", "timer stopwatch countdown online clock", AlarmClock, "from-red-500 to-rose-600"],
  ["onlineTeleprompter", "generators", "Online Teleprompter", "Scroll your script at reading speed while you present or record.", "teleprompter script scroll presenter video", Presentation, "from-violet-600 to-purple-600"],
  ["typingTest", "generators", "Typing Speed Test", "Check your WPM and accuracy in 12 languages.", "typing test speed wpm accuracy keyboard practice", Keyboard, "from-violet-500 to-purple-500"],
];

interface CategoryDef {
  id: ToolCategory;
  icon: typeof PenLine;
}

/* Direction A "Midnight Workshop": one gradient tile per category (spec) */
const CATEGORY_ACCENTS: Record<ToolCategory, string> = {
  writing: "from-teal-500 to-emerald-400",
  image: "from-violet-500 to-purple-400",
  pdf: "from-rose-500 to-red-400",
  audio: "from-indigo-500 to-violet-400",
  converters: "from-cyan-500 to-sky-400",
  generators: "from-amber-500 to-yellow-400",
};

const CATEGORY_DEFS: CategoryDef[] = [
  { id: "writing", icon: PenLine },
  { id: "image", icon: ImageIcon },
  { id: "pdf", icon: FileStack },
  { id: "audio", icon: Mic },
  { id: "converters", icon: Code2 },
  { id: "generators", icon: Wrench },
];

/* Page id -> the seo translation key holding its localized title/desc. */
function seoKeyOf(page: ActivePage): string {
  return page === "duplicateLines" ? "dedupLines" : page;
}

/* "Free Word Counter – Count Words & Characters" -> "Free Word Counter". */
function titleLead(title?: string): string {
  if (!title) return "";
  return title.split(/\s[–—|]\s/)[0].trim();
}

/*
 * A card blurb from the tool's own localized meta description: whole
 * sentences only, never a mid-word cut, and only ever text the language's
 * seo entry already carries.
 */
function firstSentences(desc: string | undefined, lang: LanguageCode): string {
  if (!desc) return "";
  if (lang === "ja") {
    const parts = desc.split("。").map((s) => s.trim()).filter(Boolean);
    let out = "";
    for (const p of parts) {
      out = out ? `${out}。${p}` : p;
      if (out.length >= 40) break;
    }
    return out ? `${out}。` : "";
  }
  const parts = desc.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [desc.trim()];
  let out = "";
  for (const p of parts) {
    out = out ? `${out} ${p}` : p;
    if (out.length >= 70) break;
  }
  return out;
}

export const HOME_FAQS = [
  {
    q: "Are ToolVena tools really free?",
    a: "Yes. Every tool on ToolVena is free to open and use, with no account sign-up. Optional AI-assisted features are clearly labelled where they appear, and their honest limits are written on the tool itself.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. Open any tool and use it straight away — there is no account to create, no password to remember and no email gate before a result.",
  },
  {
    q: "Are my files or text uploaded to a server?",
    a: "Most ToolVena tools run entirely in your browser, on your own device, so the text and files you work with never leave your device. A few optional AI-assisted features need a server to work; when one does, the tool says so before you use it.",
  },
  {
    q: "Why is it free — what is the catch?",
    a: "There is no hidden catch in the tools themselves: because most of them run on your own device's processor instead of an expensive server, they cost very little to keep online. The site is supported by advertising and, in future, optional paid extras that will be clearly labelled.",
  },
  {
    q: "Which languages is ToolVena available in?",
    a: "ToolVena is available in 13 languages: English, Spanish, Urdu (in both Roman and Urdu script), German, French, Portuguese, Italian, Turkish, Japanese, Norwegian, Dutch and Russian. Use the language menu at the top of any page, or pick your language below.",
  },
  {
    q: "Do the tools work on a phone?",
    a: "Yes. The pages are built mobile-first and most tools work in a phone browser. A few heavier tools (like background removal) download a small model the first time you use them, then run on the device itself.",
  },
];

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
  ur: "Urdu",
  de: "Deutsch",
  fr: "Français",
  pt: "Português",
  it: "Italiano",
  tr: "Türkçe",
  ja: "日本語",
  no: "Norsk",
  nl: "Nederlands",
  ru: "Русский",
  "ur-pk": "اردو (رسم الخط)",
  hi: "हिन्दी",
};

const POPULAR_PAGES: ActivePage[] = [
  "wordCounter",
  "backgroundRemover",
  "imageCompressor",
  "audioToText",
  "voiceCloner",
  "humanizer",
  "summarizer",
  "pdfTools",
];

const DEMO_SUGGESTION =
  "The quick brown fox jumps over the lazy dog. Type or paste here and watch the counts change as you write.";

function countStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed
    ? trimmed.split(/[.!?…]+/).filter((s) => s.trim().length > 0).length
    : 0;
  const readSeconds = Math.round((words / 200) * 60);
  const readTime =
    words === 0 ? "0 sec" : readSeconds < 60 ? `≈${readSeconds} sec` : `≈${(readSeconds / 60).toFixed(1)} min`;
  return { words, chars, charsNoSpaces, sentences, readTime };
}

interface HomePageProps {
  onSelectPage: (page: ActivePage) => void;
  selectedLanguage?: LanguageCode;
}

export function HomePage({ onSelectPage, selectedLanguage = "en" }: HomePageProps) {
  const [query, setQuery] = useState("");
  const [demoText, setDemoText] = useState("");
  const lang = selectedLanguage;
  const cp = HOME_COPY[lang] ?? HOME_COPY.en;
  const homeFaqs = TRANSLATIONS[lang]?.seo?.homeFaqs ?? HOME_FAQS;
  const langGuides = useMemo(() => BLOG_POSTS.filter((p) => p.language === lang), [lang]);

  const catalog: ToolMeta[] = useMemo(() => {
    const seoAny = (TRANSLATIONS[lang]?.seo ?? {}) as Record<string, string | undefined>;
    return TOOLS.map(([page, , name, blurb, keywords, icon, accent]) => {
      if (lang === "en") return { page, name, blurb, keywords, icon, accent };
      const key = seoKeyOf(page);
      const localName = titleLead(seoAny[`${key}Title`]) || name;
      const localBlurb = firstSentences(seoAny[`${key}Desc`], lang) || blurb;
      return {
        page,
        name: localName,
        blurb: localBlurb,
        keywords: `${keywords} ${localName}`,
        icon,
        accent,
      };
    }).filter((t) => SEO_CONFIGS[t.page]?.canonicalPath);
  }, [lang]);

  /** Fill {n} / {langs} / {q} / {cat} placeholders in a copy string. */
  const fill = (s: string, n?: number, cat?: string) =>
    s
      .replaceAll("{n}", String(n ?? catalog.length))
      .replaceAll("{langs}", String(ALL_SUPPORTED_LANGUAGES.length))
      .replaceAll("{q}", query.trim())
      .replaceAll("{cat}", cat ?? "");

  // Urdu script (ur-pk) is a phase-1 partial locale: only the homepage and
  // the pages in URPK_PAGES exist there. Other tools link to their Roman
  // Urdu (/ur/) versions so no card on this homepage ever leads to a 404.
  const toolHref = (page: ActivePage) => {
    const p = SEO_CONFIGS[page]?.canonicalPath ?? "/";
    if (lang === "ur-pk" && !URPK_PAGES.has(page)) return `/ur${p}`;
    return `/${lang}${p}`;
  };

  const categoryOf = (page: ActivePage): ToolCategory =>
    TOOLS.find(([p]) => p === page)?.[1] ?? "generators";

  const matchScore = (t: ToolMeta, q: string) => {
    const hay = `${t.name} ${t.blurb} ${t.keywords} ${cp.categories[categoryOf(t.page)]?.title ?? ""}`.toLowerCase();
    if (t.name.toLowerCase().includes(q)) return 0;
    if (hay.includes(q)) return 1;
    // loose multi-word match: every word appears somewhere
    return q.split(/\s+/).every((w) => !w || hay.includes(w)) ? 2 : -1;
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .map((t) => ({ t, s: matchScore(t, q) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => a.s - b.s)
      .slice(0, 8)
      .map((r) => r.t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, catalog]);

  const popular = POPULAR_PAGES.map((p) => catalog.find((t) => t.page === p)).filter(
    (t): t is ToolMeta => Boolean(t)
  );

  const demo = useMemo(() => countStats(demoText), [demoText]);

  const quickPicks: Array<[string, ActivePage]> = [
    [cp.quickPickLabels[0], "backgroundRemover"],
    [cp.quickPickLabels[1], "wordCounter"],
    [cp.quickPickLabels[2], "audioToText"],
    [cp.quickPickLabels[3], "passwordGenerator"],
  ];

  return (
    <div className="w-full">
      {/* ---------- HERO + LIVE SEARCH ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-tv-navy via-tv-navy-2 to-tv-navy-3 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-tv-teal/20 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-tv-amber/15 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-20 sm:pb-24 text-center">
          <img
            src="/icon.svg"
            alt="ToolVena logo — free online tools for writing, PDFs, images and study"
            width="72"
            height="72"
            className="w-16 h-16 sm:w-[72px] sm:h-[72px] mx-auto rounded-2xl shadow-2xl shadow-black/30"
          />
          <p className="mt-5 inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
            <Wrench className="w-3.5 h-3.5 text-tv-amber" aria-hidden="true" /> {fill(cp.badgeLine)}
          </p>
          <h1 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
            {cp.heroH1A}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-tv-teal to-tv-amber">
              {cp.heroH1B}
            </span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-lg text-slate-200 leading-relaxed">
            {fill(cp.heroIntro)}
          </p>

          {/* Live tool search */}
          <div className="mt-8 max-w-xl mx-auto text-left">
            <label htmlFor="home-tool-search" className="sr-only">
              {cp.searchLabel}
            </label>
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 shadow-xl shadow-black/20">
              <Search className="w-5 h-5 ml-2.5 text-stone-400 shrink-0" aria-hidden="true" />
              <input
                id="home-tool-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={cp.searchPlaceholder}
                className="w-full min-h-[44px] text-sm sm:text-base text-stone-900 placeholder:text-stone-400 outline-none bg-transparent"
                aria-expanded={query.trim().length > 0}
              />
            </div>
            {query.trim() && (
              <ul className="mt-2 bg-white text-stone-900 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-100" role="listbox" aria-label={cp.resultsAria}>
                {results.length === 0 && (
                  <li className="px-4 py-3 text-sm text-stone-500">
                    {fill(cp.noMatch)}
                  </li>
                )}
                {results.map((t) => (
                  <li key={t.page}>
                    <a href={toolHref(t.page)} className="flex items-center gap-3 px-4 py-3 min-h-[44px] hover:bg-amber-50 focus:bg-amber-50 outline-none">
                      <t.icon className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                      <span className="text-sm font-semibold">{t.name}</span>
                      <span className="text-xs text-stone-500 truncate">{t.blurb}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {/* Quick picks */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {quickPicks.map(([label, page]) => (
                <a
                  key={page}
                  href={toolHref(page)}
                  className="inline-flex items-center min-h-[44px] px-3.5 py-2 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Honest trust chips */}
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-100">
            {cp.trustChips.map((chip, i) => {
              const ChipIcon = [CheckCircle2, ShieldCheck, Globe2, Wrench][i];
              return (
                <li key={chip} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1.5">
                  <ChipIcon className="w-3.5 h-3.5 text-tv-teal" /> {fill(chip)}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- POPULAR TOOLS ---------- */}
      <section id="popular-tools" className="bg-tv-paper scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">{cp.popularTitle}</h2>
        <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
          {cp.popularNote}
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popular.map((t) => (
            <a
              key={t.page}
              href={toolHref(t.page)}
              className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-[0_12px_32px_-12px_rgba(11,36,64,0.25)] hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <span className={`inline-flex w-11 h-11 rounded-2xl bg-gradient-to-tr ${CATEGORY_ACCENTS[categoryOf(t.page)]} items-center justify-center text-white shadow`} aria-hidden="true">
                <t.icon className="w-5 h-5" />
              </span>
              <span className="mt-4 block text-base font-bold text-stone-900 group-hover:text-teal-700">{t.name}</span>
              <span className="mt-1 block text-sm text-stone-600 leading-relaxed">{t.blurb}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700">
                {cp.openTool} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
        </div>
      </section>

      {/* ---------- CATEGORIES ---------- */}
      <section id="categories" className="bg-white border-y border-stone-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">{cp.catsTitle}</h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
            {cp.catsNote}
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CATEGORY_DEFS.map((c) => {
              const tools = catalog.filter((t) => categoryOf(t.page) === c.id);
              return (
                <div key={c.id} className="rounded-3xl bg-stone-50 border border-stone-200 p-5">
                  <span className="inline-flex items-center gap-3 font-extrabold text-stone-900">
                    <span className={`inline-flex w-11 h-11 rounded-2xl bg-gradient-to-tr ${CATEGORY_ACCENTS[c.id]} items-center justify-center text-white shadow`} aria-hidden="true">
                      <c.icon className="w-5 h-5" />
                    </span>
                    {cp.categories[c.id].title}
                  </span>
                  <p className="mt-1 text-sm text-stone-600">
                    {cp.categories[c.id].note} · {fill(cp.catCount, tools.length)}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {tools.slice(0, 6).map((t) => (
                      <li key={t.page}>
                        <a href={toolHref(t.page)} className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-xl bg-white border border-stone-200 text-sm font-semibold text-stone-800 hover:border-teal-500 hover:text-teal-700 transition">
                          {t.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a href="#all-tools" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800">
                    {fill(cp.seeAll, undefined, cp.categories[c.id].title)} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- INLINE DEMO ---------- */}
      <section id="try-it" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-20">
        <div className="rounded-[2rem] bg-gradient-to-br from-tv-navy-2 to-tv-navy-3 text-white p-6 sm:p-10 shadow-xl">
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-tv-amber" /> {cp.demoEyebrow}
              </p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight">{cp.demoTitle}</h2>
              <p className="mt-3 text-sm sm:text-base text-slate-200 leading-relaxed">
                {cp.demoIntro}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDemoText(DEMO_SUGGESTION)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-tv-amber text-tv-amber-ink text-sm font-extrabold hover:bg-amber-300 active:scale-[0.98] transition"
                >
                  {cp.demoSample}
                </button>
                <a
                  href={toolHref("wordCounter")}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white/10 border border-white/25 text-sm font-bold hover:bg-white/15 active:scale-[0.98] transition"
                >
                  {cp.demoOpenFull} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-3">
              <label htmlFor="home-demo-text" className="sr-only">
                {cp.demoTextAria}
              </label>
              <textarea
                id="home-demo-text"
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                rows={5}
                placeholder={cp.demoPlaceholder}
                className="w-full rounded-2xl bg-white text-stone-900 placeholder:text-stone-400 p-4 text-sm sm:text-base leading-relaxed outline-none focus:ring-2 focus:ring-amber-300 min-h-[140px]"
              />
              <dl className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {[
                  [cp.stats[0], demo.words],
                  [cp.stats[1], demo.chars],
                  [cp.stats[2], demo.charsNoSpaces],
                  [cp.stats[3], demo.sentences],
                  [cp.stats[4], demo.readTime],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-2xl bg-white/10 border border-white/15 px-3 py-3">
                    <dd className="text-lg sm:text-xl font-extrabold text-white">{value}</dd>
                    <dt className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">{label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- WHY + HOW ---------- */}
      <section className="bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">{cp.whyTitle}</h2>
              <ul className="mt-6 space-y-4 text-sm sm:text-base text-stone-700 leading-relaxed">
                {cp.whyItems.map((item, i) => {
                  const WhyIcon = [ShieldCheck, MousePointerClick, Globe2, CheckCircle2][i];
                  return (
                    <li key={item.h} className="flex gap-3">
                      <WhyIcon className="w-5 h-5 mt-0.5 text-teal-600 shrink-0" aria-hidden="true" />
                      <span>
                        <strong className="text-stone-900">{item.h}</strong> {item.t}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">{cp.howTitle}</h2>
              <ol className="mt-6 space-y-4">
                {cp.howSteps.map((s, i) => (
                  <li key={s.h} className="flex gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-tv-navy-2 text-white font-extrabold inline-flex items-center justify-center" aria-hidden="true">{i + 1}</span>
                    <span>
                      <span className="block font-bold text-stone-900">{s.h}</span>
                      <span className="block mt-0.5 text-sm text-stone-600 leading-relaxed">{s.t}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- LANGUAGES ---------- */}
      <section id="languages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">{cp.langsTitle}</h2>
        <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
          {fill(cp.langsNote)}
        </p>
        <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_SUPPORTED_LANGUAGES.map((code) => (
            <li key={code}>
              <a
                href={`/${code}/`}
                hrefLang={code}
                className={`flex items-center justify-between gap-3 min-h-[52px] rounded-2xl border px-4 py-3 font-bold text-sm sm:text-base transition focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  code === lang
                    ? "border-teal-600 bg-teal-50 text-teal-800"
                    : "border-stone-200 bg-white text-stone-800 hover:border-teal-500 hover:text-teal-700"
                }`}
              >
                <span>{LANGUAGE_NAMES[code] ?? code}</span>
                {code === lang ? (
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700">{cp.youAreHere}</span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-stone-400" aria-hidden="true" />
                )}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- GUIDES + FAQ ---------- */}
      <section id="faq" className="bg-tv-paper border-t border-stone-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">{cp.guidesTitle}</h2>
            <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
              {cp.guidesNote}
            </p>
            <a
              href={`/${lang}/blog/`}
              className="mt-5 inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-2xl bg-tv-navy-2 text-white font-bold text-sm hover:bg-tv-navy-3 active:scale-[0.98] transition"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" /> {cp.guidesBtn}
            </a>
            {langGuides.length > 0 && (
              <>
                <ul className="mt-6 space-y-3">
                  {langGuides.slice(0, 4).map((p) => (
                    <li key={p.slug}>
                      <a
                        href={`/${lang}/blog/${p.slug}/`}
                        className="group block rounded-2xl border border-stone-200 bg-white p-4 hover:border-teal-500 hover:shadow-[0_12px_32px_-12px_rgba(11,36,64,0.25)] transition focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <span className="block font-bold text-sm sm:text-base text-stone-900 group-hover:text-teal-700 leading-snug line-clamp-2">
                          {p.title}
                        </span>
                        <span className="mt-1.5 block text-xs font-semibold text-stone-500">
                          {p.category} · {p.readTime}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href={`/${lang}/blog/`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-800"
                >
                  {fill(cp.guidesAll, langGuides.length)} <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </>
            )}
            <div className="mt-8 rounded-3xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="font-extrabold text-stone-900 inline-flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" aria-hidden="true" /> {cp.realJobsH}
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                {cp.realJobsT}
              </p>
            </div>
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">{cp.faqTitle}</h2>
            <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
              {homeFaqs.map((f) => (
                <details key={f.q} className="group py-1">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 py-3 min-h-[44px] font-bold text-stone-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg px-1">
                    {f.q}
                    <span className="text-teal-600 group-open:rotate-45 transition-transform text-xl leading-none" aria-hidden="true">+</span>
                  </summary>
                  <p className="pb-4 px-1 text-sm sm:text-base text-stone-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FULL TOOL INDEX ---------- */}
      <section id="all-tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-mt-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
          {fill(cp.allToolsTitle)}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
          {cp.allToolsNote}
        </p>
        <div className="mt-10 space-y-10">
          {CATEGORY_DEFS.map((c) => {
            const tools = catalog.filter((t) => categoryOf(t.page) === c.id);
            if (tools.length === 0) return null;
            return (
              <div key={c.id}>
                <h3 className="inline-flex items-center gap-3 text-lg sm:text-xl font-extrabold text-stone-900">
                  <span className={`inline-flex w-11 h-11 rounded-2xl bg-gradient-to-tr ${CATEGORY_ACCENTS[c.id]} items-center justify-center text-white shadow`} aria-hidden="true">
                    <c.icon className="w-5 h-5" />
                  </span>
                  {cp.categories[c.id].title}
                  <span className="text-sm font-bold text-stone-500">({tools.length})</span>
                </h3>
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tools.map((t) => (
                    <li key={t.page}>
                      <a
                        href={toolHref(t.page)}
                        className="group flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 hover:border-teal-500 hover:shadow-[0_12px_32px_-12px_rgba(11,36,64,0.25)] transition focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
                      >
                        <span className={`inline-flex w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-tr ${CATEGORY_ACCENTS[categoryOf(t.page)]} items-center justify-center text-white`} aria-hidden="true">
                          <t.icon className="w-5 h-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-bold text-sm text-stone-900 group-hover:text-teal-700">{t.name}</span>
                          <span className="block mt-0.5 text-xs sm:text-sm text-stone-600 leading-relaxed">{t.blurb}</span>
                        </span>
                        <ArrowRight className="w-4 h-4 mt-1 ml-auto shrink-0 text-stone-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
