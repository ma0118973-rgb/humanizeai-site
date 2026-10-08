import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { MobileAppBanner } from "./components/MobileAppBanner";
import { MobileBottomNav } from "./components/MobileBottomNav";
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
    activePage === "imageCompressor" ||
    activePage === "pdfTools";

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-emerald-50/30 text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
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

      {/* Mobile Bottom Navigation Dock (100% WebApp Experience) */}
      <MobileBottomNav
        activePage={activePage}
        onSelectPage={handlePageChange}
        onOpenInstall={() => setIsInstallOpen(true)}
      />
    </div>
  );
}
