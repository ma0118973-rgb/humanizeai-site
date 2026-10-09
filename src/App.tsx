import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { MobileAppBanner } from "./components/MobileAppBanner";
import { MobileToolStrip } from "./components/MobileToolStrip";
import { PWAInstallModal } from "./components/PWAInstallModal";
import { OtherToolsSection } from "./components/OtherToolsSection";
import { MobileToolHero } from "./components/MobileToolHero";
import { HumanizerWorkspace } from "./components/HumanizerWorkspace";
import { ToolLoadingSkeleton } from "./components/ToolLoadingSkeleton";
import { DedicatedSeoArticleSection } from "./components/DedicatedSeoArticleSection";
import { FaqAndCompetitorSection } from "./components/FaqAndCompetitorSection";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { ActivePage, LanguageCode, SavedDraft } from "./types";
import { applyPageSeo, SEO_CONFIGS, ALL_SUPPORTED_LANGUAGES } from "./utils/seo";
import { findBlogPostBySlug, BlogPost } from "./data/blogArticles";
import { DiagnosticBoundary } from "./components/DiagnosticBoundary";

// Lazy-load secondary workspaces and modal dialogs to maximize Core Web Vitals (LCP, INP, CLS)
const DetectorWorkspace = lazy(() =>
  import("./components/DetectorWorkspace").then((m) => ({ default: m.DetectorWorkspace }))
);
const MediaHumanizerWorkspace = lazy(() =>
  import("./components/MediaHumanizerWorkspace").then((m) => ({ default: m.MediaHumanizerWorkspace }))
);
const BlogSection = lazy(() =>
  import("./components/BlogSection").then((m) => ({ default: m.BlogSection }))
);
const SeoOptimizerWorkspace = lazy(() =>
  import("./components/SeoOptimizerWorkspace").then((m) => ({ default: m.SeoOptimizerWorkspace }))
);
const CitationWorkspace = lazy(() =>
  import("./components/CitationWorkspace").then((m) => ({ default: m.CitationWorkspace }))
);
const SentenceExpanderWorkspace = lazy(() =>
  import("./components/SentenceExpanderWorkspace").then((m) => ({ default: m.SentenceExpanderWorkspace }))
);
const ClicheCleanerWorkspace = lazy(() =>
  import("./components/ClicheCleanerWorkspace").then((m) => ({ default: m.ClicheCleanerWorkspace }))
);
const DiffCheckerWorkspace = lazy(() =>
  import("./components/DiffCheckerWorkspace").then((m) => ({ default: m.DiffCheckerWorkspace }))
);
const SummarizerWorkspace = lazy(() =>
  import("./components/SummarizerWorkspace").then((m) => ({ default: m.SummarizerWorkspace }))
);
const VoiceTypingWorkspace = lazy(() =>
  import("./components/VoiceTypingWorkspace").then((m) => ({ default: m.VoiceTypingWorkspace }))
);
const CvBuilderWorkspace = lazy(() =>
  import("./components/CvBuilderWorkspace").then((m) => ({ default: m.CvBuilderWorkspace }))
);
const WordCounterWorkspace = lazy(() =>
  import("./components/WordCounterWorkspace").then((m) => ({ default: m.WordCounterWorkspace }))
);
const CharacterCounterWorkspace = lazy(() =>
  import("./components/CharacterCounterWorkspace").then((m) => ({ default: m.CharacterCounterWorkspace }))
);
const TextToSpeechWorkspace = lazy(() =>
  import("./components/TextToSpeechWorkspace").then((m) => ({ default: m.TextToSpeechWorkspace }))
);
const TypingTestWorkspace = lazy(() =>
  import("./components/TypingTestWorkspace").then((m) => ({ default: m.TypingTestWorkspace }))
);
const CaseConverterWorkspace = lazy(() =>
  import("./components/CaseConverterWorkspace").then((m) => ({ default: m.CaseConverterWorkspace }))
);
const PasswordGeneratorWorkspace = lazy(() =>
  import("./components/PasswordGeneratorWorkspace").then((m) => ({ default: m.PasswordGeneratorWorkspace }))
);
const RemoveDuplicateLinesWorkspace = lazy(() =>
  import("./components/RemoveDuplicateLinesWorkspace").then((m) => ({ default: m.RemoveDuplicateLinesWorkspace }))
);
const TextRepeaterWorkspace = lazy(() =>
  import("./components/TextRepeaterWorkspace").then((m) => ({ default: m.TextRepeaterWorkspace }))
);
const InvisibleCharacterWorkspace = lazy(() =>
  import("./components/InvisibleCharacterWorkspace").then((m) => ({ default: m.InvisibleCharacterWorkspace }))
);
const WordFrequencyWorkspace = lazy(() =>
  import("./components/WordFrequencyWorkspace").then((m) => ({ default: m.WordFrequencyWorkspace }))
);
const ReadingTimeWorkspace = lazy(() =>
  import("./components/ReadingTimeWorkspace").then((m) => ({ default: m.ReadingTimeWorkspace }))
);
const Base64Workspace = lazy(() =>
  import("./components/Base64Workspace").then((m) => ({ default: m.Base64Workspace }))
);
const SlugGeneratorWorkspace = lazy(() =>
  import("./components/SlugGeneratorWorkspace").then((m) => ({ default: m.SlugGeneratorWorkspace }))
);
const JsonFormatterWorkspace = lazy(() =>
  import("./components/JsonFormatterWorkspace").then((m) => ({ default: m.JsonFormatterWorkspace }))
);
const LoremIpsumWorkspace = lazy(() =>
  import("./components/LoremIpsumWorkspace").then((m) => ({ default: m.LoremIpsumWorkspace }))
);
const InstagramLineBreakWorkspace = lazy(() =>
  import("./components/InstagramLineBreakWorkspace").then((m) => ({ default: m.InstagramLineBreakWorkspace }))
);
const DaysBetweenDatesWorkspace = lazy(() =>
  import("./components/DaysBetweenDatesWorkspace").then((m) => ({ default: m.DaysBetweenDatesWorkspace }))
);
const RandomNumberGeneratorWorkspace = lazy(() =>
  import("./components/RandomNumberGeneratorWorkspace").then((m) => ({ default: m.RandomNumberGeneratorWorkspace }))
);
const ImageConverterWorkspace = lazy(() =>
  import("./components/ImageConverterWorkspace").then((m) => ({ default: m.ImageConverterWorkspace }))
);
const ImageToTextWorkspace = lazy(() =>
  import("./components/ImageToTextWorkspace").then((m) => ({ default: m.ImageToTextWorkspace }))
);
const PdfSplitterWorkspace = lazy(() =>
  import("./components/PdfSplitterWorkspace").then((m) => ({ default: m.PdfSplitterWorkspace }))
);
const UsernameGeneratorWorkspace = lazy(() =>
  import("./components/UsernameGeneratorWorkspace").then((m) => ({ default: m.UsernameGeneratorWorkspace }))
);
const MorseCodeTranslatorWorkspace = lazy(() =>
  import("./components/MorseCodeTranslatorWorkspace").then((m) => ({ default: m.MorseCodeTranslatorWorkspace }))
);
const VoiceRecorderWorkspace = lazy(() =>
  import("./components/VoiceRecorderWorkspace").then((m) => ({ default: m.VoiceRecorderWorkspace }))
);
const OnlineNotepadWorkspace = lazy(() =>
  import("./components/OnlineNotepadWorkspace").then((m) => ({ default: m.OnlineNotepadWorkspace }))
);
const OnlineTeleprompterWorkspace = lazy(() =>
  import("./components/OnlineTeleprompterWorkspace").then((m) => ({ default: m.OnlineTeleprompterWorkspace }))
);
const UnitConverterWorkspace = lazy(() =>
  import("./components/UnitConverterWorkspace").then((m) => ({ default: m.UnitConverterWorkspace }))
);
const ImageResizerWorkspace = lazy(() =>
  import("./components/ImageResizerWorkspace").then((m) => ({ default: m.ImageResizerWorkspace }))
);
const OnlineTimerWorkspace = lazy(() =>
  import("./components/OnlineTimerWorkspace").then((m) => ({ default: m.OnlineTimerWorkspace }))
);
const InvoiceGeneratorWorkspace = lazy(() =>
  import("./components/InvoiceGeneratorWorkspace").then((m) => ({ default: m.InvoiceGeneratorWorkspace }))
);
const ImageCompressorWorkspace = lazy(() =>
  import("./components/ImageCompressorWorkspace").then((m) => ({ default: m.ImageCompressorWorkspace }))
);
const PdfToolsWorkspace = lazy(() =>
  import("./components/PdfToolsWorkspace").then((m) => ({ default: m.PdfToolsWorkspace }))
);
const CompliancePages = lazy(() =>
  import("./components/CompliancePages").then((m) => ({ default: m.CompliancePages }))
);
const CompetitorBlueprintModal = lazy(() =>
  import("./components/CompetitorBlueprintModal").then((m) => ({ default: m.CompetitorBlueprintModal }))
);

interface ParsedRoute {
  page: ActivePage;
  lang: LanguageCode;
  blogSlug: string | null;
}

function parseCurrentRoute(): ParsedRoute {
  if (typeof window === "undefined") {
    return { page: "humanizer", lang: "en", blogSlug: null };
  }

  // 1. Clean pathname
  const rawPath = window.location.pathname.replace(/\/+$/, "");
  const segments = rawPath.split("/").filter(Boolean);

  let lang: LanguageCode = "en";
  let remainingSegments = segments;

  // Check if first segment is a supported language
  if (segments.length > 0 && ALL_SUPPORTED_LANGUAGES.includes(segments[0] as LanguageCode)) {
    lang = segments[0] as LanguageCode;
    remainingSegments = segments.slice(1);
  }

  // If no remaining segments, it's home / humanizer in that language
  if (remainingSegments.length === 0) {
    // Check hash fallback
    const hash = window.location.hash.replace("#", "") as ActivePage;
    const validPages: ActivePage[] = [
      "humanizer",
      "detector",
      "media",
      "blog",
      "seo",
      "privacy",
      "terms",
      "disclaimer",
      "about",
      "contact",
    ];
    if (validPages.includes(hash)) {
      return { page: hash, lang, blogSlug: null };
    }
    return { page: "humanizer", lang, blogSlug: null };
  }

  const primarySlug = remainingSegments[0].toLowerCase();

  // Blog route handling
  if (primarySlug === "blog") {
    const slug = remainingSegments[1] ? remainingSegments[1].toLowerCase() : null;
    return { page: "blog", lang, blogSlug: slug };
  }

  // Tool routes
  if (primarySlug === "ai-humanizer" || primarySlug === "humanizer" || primarySlug === "ai-text-humanizer") {
    return { page: "humanizer", lang, blogSlug: null };
  }
  if (primarySlug === "ai-detector" || primarySlug === "detector" || primarySlug === "ai-content-detector") {
    return { page: "detector", lang, blogSlug: null };
  }
  if (
    primarySlug === "video-tools" ||
    primarySlug === "image-tools" ||
    primarySlug === "media" ||
    primarySlug === "ai-video-reels-studio"
  ) {
    return { page: "media", lang, blogSlug: null };
  }
  if (primarySlug === "seo-tools" || primarySlug === "seo" || primarySlug === "high-rpm-seo-optimizer") {
    return { page: "seo", lang, blogSlug: null };
  }
  if (primarySlug === "citation-generator" || primarySlug === "citation" || primarySlug === "ai-citation-generator") {
    return { page: "citation", lang, blogSlug: null };
  }
  if (primarySlug === "sentence-expander" || primarySlug === "expander" || primarySlug === "ai-sentence-expander") {
    return { page: "expander", lang, blogSlug: null };
  }
  if (primarySlug === "text-summarizer" || primarySlug === "summarizer" || primarySlug === "ai-text-summarizer") {
    return { page: "summarizer", lang, blogSlug: null };
  }
  if (primarySlug === "voice-typing" || primarySlug === "speech-to-text" || primarySlug === "voice-to-text") {
    return { page: "voiceTyping", lang, blogSlug: null };
  }
  if (primarySlug === "cv-builder" || primarySlug === "resume-builder" || primarySlug === "cv-maker") {
    return { page: "cvBuilder", lang, blogSlug: null };
  }
  if (primarySlug === "word-counter" || primarySlug === "word-count" || primarySlug === "count-words") {
    return { page: "wordCounter", lang, blogSlug: null };
  }
  if (primarySlug === "character-counter" || primarySlug === "char-counter" || primarySlug === "letter-counter" || primarySlug === "character-count") {
    return { page: "characterCounter", lang, blogSlug: null };
  }
  if (primarySlug === "text-to-speech" || primarySlug === "tts" || primarySlug === "read-aloud" || primarySlug === "text-to-speech-online") {
    return { page: "textToSpeech", lang, blogSlug: null };
  }
  if (primarySlug === "typing-test" || primarySlug === "typing-speed-test" || primarySlug === "typing" || primarySlug === "wpm-test" || primarySlug === "typing-practice") {
    return { page: "typingTest", lang, blogSlug: null };
  }
  if (primarySlug === "case-converter" || primarySlug === "text-case-converter" || primarySlug === "change-case" || primarySlug === "uppercase-lowercase-converter") {
    return { page: "caseConverter", lang, blogSlug: null };
  }
  if (primarySlug === "password-generator" || primarySlug === "random-password-generator" || primarySlug === "strong-password-generator" || primarySlug === "password-maker" || primarySlug === "generate-password") {
    return { page: "passwordGenerator", lang, blogSlug: null };
  }
  if (primarySlug === "remove-duplicate-lines" || primarySlug === "duplicate-line-remover" || primarySlug === "remove-duplicates" || primarySlug === "dedupe-lines" || primarySlug === "remove-repeated-lines") {
    return { page: "duplicateLines", lang, blogSlug: null };
  }
  if (primarySlug === "text-repeater" || primarySlug === "repeat-text" || primarySlug === "text-repeat" || primarySlug === "repeat-text-online" || primarySlug === "word-repeater") {
    return { page: "textRepeater", lang, blogSlug: null };
  }
  if (primarySlug === "invisible-character" || primarySlug === "blank-text" || primarySlug === "invisible-text" || primarySlug === "blank-text-generator" || primarySlug === "invisible-character-generator" || primarySlug === "empty-character") {
    return { page: "invisibleCharacter", lang, blogSlug: null };
  }
  if (primarySlug === "word-frequency-counter" || primarySlug === "word-frequency" || primarySlug === "frequency-counter" || primarySlug === "word-frequency-count" || primarySlug === "phrase-frequency-counter") {
    return { page: "wordFrequency", lang, blogSlug: null };
  }
  if (primarySlug === "reading-time-calculator" || primarySlug === "speaking-time-calculator" || primarySlug === "reading-time" || primarySlug === "speech-time-calculator" || primarySlug === "speaking-time") {
    return { page: "readingTime", lang, blogSlug: null };
  }
  if (primarySlug === "base64-encoder-decoder" || primarySlug === "base64-encode-decode" || primarySlug === "base64" || primarySlug === "base64-encoder" || primarySlug === "base64-decoder" || primarySlug === "encode-base64" || primarySlug === "decode-base64") {
    return { page: "base64", lang, blogSlug: null };
  }
  if (primarySlug === "slug-generator" || primarySlug === "url-slug-generator" || primarySlug === "slug-maker" || primarySlug === "slugify" || primarySlug === "generate-slug" || primarySlug === "url-slug-maker") {
    return { page: "slugGenerator", lang, blogSlug: null };
  }
  if (primarySlug === "json-formatter" || primarySlug === "json-validator" || primarySlug === "json-beautifier" || primarySlug === "json-minifier" || primarySlug === "json-formatter-online" || primarySlug === "format-json") {
    return { page: "jsonFormatter", lang, blogSlug: null };
  }
  if (primarySlug === "lorem-ipsum-generator" || primarySlug === "lorem-ipsum" || primarySlug === "lorem-generator" || primarySlug === "dummy-text-generator" || primarySlug === "placeholder-text-generator" || primarySlug === "lorem-ipsum-text") {
    return { page: "loremIpsum", lang, blogSlug: null };
  }
  if (primarySlug === "instagram-line-break-generator" || primarySlug === "ig-line-break" || primarySlug === "instagram-line-break" || primarySlug === "line-break-generator" || primarySlug === "instagram-caption-line-breaks" || primarySlug === "instagram-line-breaks") {
    return { page: "instagramLineBreak", lang, blogSlug: null };
  }
  if (primarySlug === "days-between-dates" || primarySlug === "date-calculator" || primarySlug === "date-difference-calculator" || primarySlug === "days-between" || primarySlug === "business-days-calculator" || primarySlug === "date-duration-calculator") {
    return { page: "daysBetween", lang, blogSlug: null };
  }
  if (primarySlug === "random-number-generator" || primarySlug === "number-generator" || primarySlug === "random-number" || primarySlug === "random-numbers" || primarySlug === "random-picker") {
    return { page: "randomNumber", lang, blogSlug: null };
  }
  if (primarySlug === "online-timer" || primarySlug === "online-stopwatch" || primarySlug === "stopwatch" || primarySlug === "countdown-timer" || primarySlug === "timer" || primarySlug === "online-timer-stopwatch") {
    return { page: "onlineTimer", lang, blogSlug: null };
  }
  if (primarySlug === "invoice-generator" || primarySlug === "invoice-maker" || primarySlug === "free-invoice-generator" || primarySlug === "invoice-generator-free" || primarySlug === "make-invoice" || primarySlug === "create-invoice") {
    return { page: "invoiceGenerator", lang, blogSlug: null };
  }
  if (primarySlug === "image-converter" || primarySlug === "jpg-to-png" || primarySlug === "png-to-jpg" || primarySlug === "png-to-webp" || primarySlug === "webp-to-jpg" || primarySlug === "webp-to-png" || primarySlug === "jpg-to-webp" || primarySlug === "convert-image" || primarySlug === "image-format-converter") {
    return { page: "imageConverter", lang, blogSlug: null };
  }
  if (primarySlug === "image-to-text" || primarySlug === "image-to-text-converter" || primarySlug === "ocr" || primarySlug === "extract-text-from-image" || primarySlug === "photo-to-text" || primarySlug === "image-ocr" || primarySlug === "text-from-image") {
    return { page: "imageToText", lang, blogSlug: null };
  }
  if (primarySlug === "pdf-splitter" || primarySlug === "split-pdf" || primarySlug === "pdf-split" || primarySlug === "separate-pdf-pages" || primarySlug === "extract-pdf-pages" || primarySlug === "pdf-page-extractor") {
    return { page: "pdfSplitter", lang, blogSlug: null };
  }
  if (primarySlug === "username-generator" || primarySlug === "username-ideas" || primarySlug === "username-maker" || primarySlug === "generate-username" || primarySlug === "random-username-generator" || primarySlug === "gamertag-generator") {
    return { page: "usernameGenerator", lang, blogSlug: null };
  }
  if (primarySlug === "morse-code-translator" || primarySlug === "morse-code" || primarySlug === "morse-translator" || primarySlug === "morse-decoder" || primarySlug === "morse-code-decoder" || primarySlug === "text-to-morse" || primarySlug === "morse-to-text" || primarySlug === "morse-code-converter") {
    return { page: "morseCodeTranslator", lang, blogSlug: null };
  }
  if (primarySlug === "online-notepad" || primarySlug === "notepad-online" || primarySlug === "free-notepad" || primarySlug === "free-online-notepad" || primarySlug === "note-pad-online") {
    return { page: "onlineNotepad", lang, blogSlug: null };
  }
  if (primarySlug === "online-voice-recorder" || primarySlug === "voice-recorder" || primarySlug === "audio-recorder" || primarySlug === "online-audio-recorder" || primarySlug === "voice-memo" || primarySlug === "record-audio-online" || primarySlug === "voice-recorder-online") {
    return { page: "voiceRecorder", lang, blogSlug: null };
  }
  if (primarySlug === "online-teleprompter" || primarySlug === "teleprompter-online" || primarySlug === "teleprompter" || primarySlug === "free-teleprompter" || primarySlug === "online-teleprompter-free") {
    return { page: "onlineTeleprompter", lang, blogSlug: null };
  }
  if (primarySlug === "unit-converter" || primarySlug === "unit-conversion" || primarySlug === "measurement-converter" || primarySlug === "convert-units" || primarySlug === "units-converter" || primarySlug === "unit-converter-online") {
    return { page: "unitConverter", lang, blogSlug: null };
  }
  if (primarySlug === "image-resizer" || primarySlug === "resize-image" || primarySlug === "image-cropper" || primarySlug === "crop-image" || primarySlug === "photo-resizer" || primarySlug === "image-resizer-cropper" || primarySlug === "resize-photo") {
    return { page: "imageResizer", lang, blogSlug: null };
  }
  if (primarySlug === "image-compressor" || primarySlug === "compress-image" || primarySlug === "imageCompressor") {
    return { page: "imageCompressor", lang, blogSlug: null };
  }
  if (primarySlug === "pdf-tools" || primarySlug === "merge-pdf" || primarySlug === "pdfTools") {
    return { page: "pdfTools", lang, blogSlug: null };
  }
  if (primarySlug === "cliche-cleaner" || primarySlug === "cleaner" || primarySlug === "ai-cliche-cleaner") {
    return { page: "cleaner", lang, blogSlug: null };
  }
  if (primarySlug === "diff-checker" || primarySlug === "diff" || primarySlug === "text-similarity-checker") {
    return { page: "diff", lang, blogSlug: null };
  }

  // Static / Compliance routes
  if (
    primarySlug === "privacy" ||
    primarySlug === "terms" ||
    primarySlug === "disclaimer" ||
    primarySlug === "about" ||
    primarySlug === "contact"
  ) {
    return { page: primarySlug as ActivePage, lang, blogSlug: null };
  }

  // Check legacy "tools/..." path
  if (primarySlug === "tools" && remainingSegments.length > 1) {
    const toolSub = remainingSegments[1].toLowerCase();
    if (toolSub === "ai-text-humanizer") return { page: "humanizer", lang, blogSlug: null };
    if (toolSub === "ai-content-detector") return { page: "detector", lang, blogSlug: null };
    if (toolSub === "ai-video-reels-studio") return { page: "media", lang, blogSlug: null };
    if (toolSub === "high-rpm-seo-optimizer") return { page: "seo", lang, blogSlug: null };
  }

  return { page: "notfound", lang, blogSlug: null };
}

function buildCanonicalUrl(page: ActivePage, lang: LanguageCode, blogSlug?: string | null): string {
  const langPrefix = `/${lang}`;
  if (page === "blog") {
    if (blogSlug) {
      return `${langPrefix}/blog/${blogSlug}/`;
    }
    return `${langPrefix}/blog/`;
  }
  const config = SEO_CONFIGS[page];
  const canonicalPath = config ? config.canonicalPath : "/ai-humanizer/";
  return `${langPrefix}${canonicalPath}`;
}

export default function App() {
  const initialRoute = parseCurrentRoute();

  const [activePage, setActivePage] = useState<ActivePage>(initialRoute.page);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(initialRoute.lang);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(initialRoute.blogSlug);

  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [textForDetector, setTextForDetector] = useState<string>("");
  const [textForHumanizer, setTextForHumanizer] = useState<string>("");

  // Update SEO metadata, Canonical URL, OpenGraph, and Schema.org JSON-LD whenever page, language or blog slug changes
  useEffect(() => {
    let blogPost: BlogPost | null = null;
    if (activePage === "blog" && activeBlogSlug) {
      blogPost = findBlogPostBySlug(activeBlogSlug) || null;
    }
    applyPageSeo(activePage, selectedLanguage, blogPost);

    if (activePage === "notfound") {
      document.title = "Page not found – HumanizeAI";
      document.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex, follow");
      return;
    }

    // Alias / missing-language URLs (e.g. /humanizer, /ai-detector) -> rewrite to the one canonical URL
    try {
      const segs = window.location.pathname.split("/").filter(Boolean);
      const hasLang = segs.length > 0 && ALL_SUPPORTED_LANGUAGES.includes(segs[0] as LanguageCode);
      if (segs.length > (hasLang ? 1 : 0)) {
        const canonical = buildCanonicalUrl(activePage, selectedLanguage, activeBlogSlug);
        if (window.location.pathname !== canonical) {
          window.history.replaceState(window.history.state, "", canonical);
        }
      }
    } catch {
      /* sandboxed iframe */
    }
  }, [activePage, selectedLanguage, activeBlogSlug]);

  // Synchronize browser history and back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseCurrentRoute();
      setActivePage(parsed.page);
      setSelectedLanguage(parsed.lang);
      setActiveBlogSlug(parsed.blogSlug);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Persistent browser localStorage drafts
  const [drafts, setDrafts] = useState<SavedDraft[]>(() => {
    try {
      const raw = localStorage.getItem("clever_drafts");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleDraftSaved = () => {
    try {
      const raw = localStorage.getItem("clever_drafts");
      if (raw) {
        setDrafts(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreDraft = (draft: SavedDraft) => {
    setTextForHumanizer(draft.originalText);
    handlePageChange("humanizer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    try {
      localStorage.setItem("clever_drafts", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllDrafts = () => {
    setDrafts([]);
    try {
      localStorage.removeItem("clever_drafts");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendToDetector = (humanizedText: string) => {
    setTextForDetector(humanizedText);
    handlePageChange("detector");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSendToHumanizer = (flaggedText: string) => {
    setTextForHumanizer(flaggedText);
    handlePageChange("humanizer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Main Page Navigation
  const handlePageChange = useCallback(
    (page: ActivePage) => {
      setActivePage(page);
      setActiveBlogSlug(null);
      const newPath = buildCanonicalUrl(page, selectedLanguage, null);

      try {
        window.history.pushState({ page, lang: selectedLanguage, blogSlug: null }, "", newPath);
      } catch {
        // Fallback for strict iframe sandbox
      }

      setTimeout(() => {
        const workspaceEl = document.getElementById("active-tool-workspace");
        if (workspaceEl) {
          workspaceEl.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    },
    [selectedLanguage]
  );

  // Multilingual Switcher: Updates Language & Route URL
  const handleLanguageChange = useCallback(
    (newLang: LanguageCode) => {
      setSelectedLanguage(newLang);
      // When reading a blog article, go back to the blog listing in the new
      // language — articles are written per-language (not translated), so the
      // same article slug does not exist in other languages.
      const newSlug = activePage === "blog" && activeBlogSlug ? null : activeBlogSlug;
      if (newSlug === null && activeBlogSlug !== null) {
        setActiveBlogSlug(null);
      }
      const newPath = buildCanonicalUrl(activePage, newLang, newSlug);
      try {
        window.history.pushState({ page: activePage, lang: newLang, blogSlug: newSlug }, "", newPath);
      } catch {
        // Fallback
      }
    },
    [activePage, activeBlogSlug]
  );

  // Blog Article Navigation: Opens Article & Updates URL to /blog/:slug/
  const handleBlogArticleChange = useCallback(
    (slug: string | null) => {
      setActiveBlogSlug(slug);
      const newPath = buildCanonicalUrl("blog", selectedLanguage, slug);
      try {
        window.history.pushState({ page: "blog", lang: selectedLanguage, blogSlug: slug }, "", newPath);
      } catch {
        // Fallback
      }
    },
    [selectedLanguage]
  );

  const isToolPage =
    activePage === "humanizer" ||
    activePage === "detector" ||
    activePage === "media" ||
    activePage === "blog" ||
    activePage === "seo" ||
    activePage === "citation" ||
    activePage === "expander" ||
    activePage === "cleaner" ||
    activePage === "diff" ||
    activePage === "summarizer" ||
    activePage === "voiceTyping" ||
    activePage === "cvBuilder" ||
    activePage === "wordCounter" ||
    activePage === "characterCounter" ||
    activePage === "textToSpeech" ||
    activePage === "typingTest" ||
    activePage === "caseConverter" ||
    activePage === "passwordGenerator" ||
    activePage === "duplicateLines" ||
    activePage === "textRepeater" ||
    activePage === "invisibleCharacter" ||
    activePage === "wordFrequency" ||
    activePage === "readingTime" ||
    activePage === "base64" ||
    activePage === "slugGenerator" ||
    activePage === "jsonFormatter" ||
    activePage === "loremIpsum" ||
    activePage === "daysBetween" ||
    activePage === "randomNumber" ||
    activePage === "onlineTimer" ||
    activePage === "invoiceGenerator" ||
    activePage === "imageResizer" ||
    activePage === "imageConverter" ||
    activePage === "imageToText" ||
    activePage === "pdfSplitter" ||
    activePage === "usernameGenerator" ||
    activePage === "morseCodeTranslator" ||
    activePage === "voiceRecorder" ||
    activePage === "onlineNotepad" ||
    activePage === "unitConverter" ||
    activePage === "onlineTeleprompter" ||
    activePage === "instagramLineBreak" ||
    activePage === "imageCompressor" ||
    activePage === "pdfTools";

  return (
    <DiagnosticBoundary>
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-white to-yellow-50/40 text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 w-full max-w-full overflow-x-hidden">
      {/* Mobile App Install Smart Banner (Top 1-Tap Trigger) */}
      <MobileAppBanner onOpenInstall={() => setIsInstallOpen(true)} />

      {/* Navigation Header */}
      <Navbar
        activePage={activePage}
        setActivePage={handlePageChange}
        onOpenBlueprint={() => setIsBlueprintOpen(true)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        draftsCount={drafts.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
      />

      {/* Mobile Tool Strip: all 11 tools, horizontal scroll (replaces bottom dock) */}
      <MobileToolStrip activePage={activePage} onSelectPage={handlePageChange} />

      {/* Main Content Area: Active Tool Appears Directly At Top */}
      <main id="active-tool-workspace" className="flex-1 scroll-mt-6 w-full max-w-full overflow-x-hidden min-w-0">
        {activePage === "humanizer" && (
          <>
            <HumanizerWorkspace
              initialText={textForHumanizer}
              onSendToDetector={handleSendToDetector}
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              onDraftSaved={handleDraftSaved}
            />

            {/* The 3 Other Tools Displayed Prominently Right Below The Main Workspace */}
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />

            {/* Dedicated SEO Knowledge Article & Viral Hashtags for Humanizer */}
            <DedicatedSeoArticleSection toolId="humanizer" />
          </>
        )}

        {activePage === "detector" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <DetectorWorkspace
              initialText={textForDetector}
              onSendToHumanizer={handleSendToHumanizer}
              selectedLanguage={selectedLanguage}
            />

            {/* The 3 Other Tools Displayed Prominently Below Detector */}
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />

            {/* Dedicated SEO Knowledge Article & Viral Hashtags for Detector */}
            <DedicatedSeoArticleSection toolId="detector" />
          </Suspense>
        )}

        {activePage === "media" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <MediaHumanizerWorkspace selectedLanguage={selectedLanguage} />

            {/* The 3 Other Tools Displayed Prominently Below Media */}
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />

            {/* Dedicated SEO Knowledge Article & Viral Hashtags for Video Studio */}
            <DedicatedSeoArticleSection toolId="media" />
          </Suspense>
        )}

        {activePage === "blog" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <BlogSection
              initialSlug={activeBlogSlug}
              onSelectPost={handleBlogArticleChange}
              selectedLanguage={selectedLanguage}
              onNavigatePage={handlePageChange}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "seo" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <SeoOptimizerWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "citation" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <CitationWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "expander" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <SentenceExpanderWorkspace
              selectedLanguage={selectedLanguage}
              onSendToHumanizer={handleSendToHumanizer}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "summarizer" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <SummarizerWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "voiceTyping" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <VoiceTypingWorkspace
              selectedLanguage={selectedLanguage}
              onSendToHumanizer={handleSendToHumanizer}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "cvBuilder" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <CvBuilderWorkspace
              selectedLanguage={selectedLanguage}
              onSendToHumanizer={handleSendToHumanizer}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "wordCounter" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <WordCounterWorkspace
              selectedLanguage={selectedLanguage}
              onSendToHumanizer={handleSendToHumanizer}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "characterCounter" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <CharacterCounterWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "textToSpeech" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <TextToSpeechWorkspace
              selectedLanguage={selectedLanguage}
              onSendToHumanizer={handleSendToHumanizer}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "typingTest" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <TypingTestWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "caseConverter" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <CaseConverterWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "passwordGenerator" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <PasswordGeneratorWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "duplicateLines" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <RemoveDuplicateLinesWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "textRepeater" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <TextRepeaterWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "invisibleCharacter" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <InvisibleCharacterWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "wordFrequency" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <WordFrequencyWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "readingTime" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <ReadingTimeWorkspace
              selectedLanguage={selectedLanguage}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "slugGenerator" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <SlugGeneratorWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "jsonFormatter" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <JsonFormatterWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "loremIpsum" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <LoremIpsumWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "daysBetween" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <DaysBetweenDatesWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "randomNumber" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <RandomNumberGeneratorWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "onlineTimer" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <OnlineTimerWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "invoiceGenerator" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <InvoiceGeneratorWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "imageConverter" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <ImageConverterWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "imageToText" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <ImageToTextWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "pdfSplitter" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <PdfSplitterWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "usernameGenerator" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <UsernameGeneratorWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "morseCodeTranslator" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <MorseCodeTranslatorWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "voiceRecorder" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <VoiceRecorderWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "onlineNotepad" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <OnlineNotepadWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "onlineTeleprompter" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <OnlineTeleprompterWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "unitConverter" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <UnitConverterWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "imageResizer" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <ImageResizerWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "instagramLineBreak" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <InstagramLineBreakWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "base64" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <Base64Workspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "imageCompressor" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <ImageCompressorWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "pdfTools" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <PdfToolsWorkspace selectedLanguage={selectedLanguage} />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "cleaner" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <ClicheCleanerWorkspace
              selectedLanguage={selectedLanguage}
              onSendToHumanizer={handleSendToHumanizer}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {activePage === "diff" && (
            <Suspense fallback={<ToolLoadingSkeleton />}>
            <DiffCheckerWorkspace
              selectedLanguage={selectedLanguage}
              onSendToHumanizer={handleSendToHumanizer}
            />
            <OtherToolsSection
              activePage={activePage}
              onSelectPage={handlePageChange}
              selectedLanguage={selectedLanguage}
            />
          </Suspense>
        )}

        {/* Dedicated Compliance Pages for Google AdSense & User Trust */}
        {activePage === "notfound" && (
          <section className="max-w-2xl mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold text-stone-900">404 – Page not found</h1>
            <p className="mt-3 text-stone-600">This page does not exist or has moved.</p>
            <button
              onClick={() => handlePageChange("humanizer")}
              className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Go to AI Humanizer
            </button>
          </section>
        )}

        {!isToolPage && activePage !== "notfound" && (
          <Suspense fallback={<ToolLoadingSkeleton />}>
            <CompliancePages
              page={activePage}
              onNavigateHome={() => handlePageChange("humanizer")}
            />
          </Suspense>
        )}

        {/* Global Competitor & FAQ Section with AdSense Leaderboard */}
        <FaqAndCompetitorSection onNavigatePage={handlePageChange} />
      </main>

      {/* Revision History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        drafts={drafts}
        onRestoreDraft={handleRestoreDraft}
        onDeleteDraft={handleDeleteDraft}
        onClearAll={handleClearAllDrafts}
      />

      {/* Strategic Competitor Clone & Market Analysis Modal */}
      {isBlueprintOpen && (
        <Suspense fallback={null}>
          <CompetitorBlueprintModal
            isOpen={isBlueprintOpen}
            onClose={() => setIsBlueprintOpen(false)}
          />
        </Suspense>
      )}

      {/* Native WebApp PWA Installation Modal (iPhone & Android) */}
      <PWAInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

    </div>
    </DiagnosticBoundary>
  );
}
