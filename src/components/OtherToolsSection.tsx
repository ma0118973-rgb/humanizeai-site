import React from "react";
import {
  Search,
  Video,
  Tag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  BookMarked,
  Maximize2,
  FileText,
  AlertOctagon,
  GitCompare,
  Mic,
  Briefcase,
  Hash,
  Volume2,
} from "lucide-react";
import { ActivePage } from "../types";
import { findBlogPostBySlug } from "../data/blogArticles";
import { BookOpen } from "lucide-react";

import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface OtherToolsSectionProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
  selectedLanguage?: LanguageCode;
}

export function OtherToolsSection({ activePage, onSelectPage, selectedLanguage = "en" }: OtherToolsSectionProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ot = (t as any).otherTools || {};
  // Define all available tools
  const allTools = [
    {
      id: "humanizer" as ActivePage,
      title: "AI Text Humanizer",
      subtitle: "Natural, Human-Sounding Rewrites",
      badge: "⭐ 100% Free",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950",
      cardBorder: "hover:border-emerald-500 hover:shadow-emerald-500/10",
      ctaBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
      icon: Sparkles,
      desc: "Turn robotic ChatGPT, Claude, and Gemini text into natural human writing with high perplexity and burstiness.",
      bullets: ["Natural Sentence Flow", "5 Human Writing Tone Styles", "1-Click Word (.docx) & TXT Export"],
      stat: "100% Free",
    },
    {
      id: "detector" as ActivePage,
      title: "Enterprise AI Content Detector 4.0",
      subtitle: "Sentence-by-Sentence AI Heatmap",
      badge: "🔍 4-Model Cross Scanner",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300",
      iconBg: "bg-gradient-to-tr from-cyan-500 to-blue-500 text-white",
      cardBorder: "hover:border-cyan-500 hover:shadow-cyan-500/10",
      ctaBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
      icon: Search,
      desc: "Analyze any document with our own heuristic model. It highlights robotic vs. natural sentences in red and green. Note: a heuristic estimate, not an official detector verdict.",
      bullets: ["Vivid Red & Green Heatmap", "Sentence Analysis", "1-Click Send to Humanizer"],
      stat: "Heuristic Scan",
    },
    {
      id: "citation" as ActivePage,
      title: "Academic Citation & Reference Generator",
      subtitle: "APA 7, MLA 9, Chicago & Harvard",
      badge: "📚 Instant Bibliography",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
      iconBg: "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white",
      cardBorder: "hover:border-indigo-500 hover:shadow-indigo-500/10",
      ctaBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
      icon: BookMarked,
      desc: "Generate authentic references for journal papers, books, websites, and theses. Formats references and in-text parentheticals instantly.",
      bullets: ["APA 7th & MLA 9th Formats", "Clean, Consistent Formatting", "1-Click Copy Citation"],
      stat: "APA & MLA 9",
    },
    {
      id: "expander" as ActivePage,
      title: "Academic Sentence Expander",
      subtitle: "Depth, Reasoning & High Burstiness",
      badge: "📈 80%+ Burstiness Gain",
      badgeColor: "bg-violet-100 text-violet-800 border-violet-300",
      iconBg: "bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white",
      cardBorder: "hover:border-violet-500 hover:shadow-violet-500/10",
      ctaBg: "bg-violet-600 hover:bg-violet-500 text-white",
      icon: Maximize2,
      desc: "Lengthen short sentences into rigorous, scholarly paragraphs with causal elaboration, dynamic clause variation, and evidence framing.",
      bullets: ["3 Scholarly Depth Levels", "Breaks Flat AI Cadence", "Preserves Factual Truth"],
      stat: "2x–4x Depth",
    },
    {
      id: "summarizer" as ActivePage,
      title: "AI Text Summarizer",
      subtitle: "Instant Extractive Summaries",
      badge: "⚡ 8 Languages",
      badgeColor: "bg-violet-100 text-violet-800 border-violet-300",
      iconBg: "bg-gradient-to-tr from-violet-600 to-purple-500 text-white",
      cardBorder: "hover:border-violet-500 hover:shadow-violet-500/10",
      ctaBg: "bg-violet-600 hover:bg-violet-500 text-white",
      icon: FileText,
      desc: "Paste long articles, papers, or documents and get instant extractive summaries. Picks the most important sentences — never invents content.",
      bullets: ["3 Length Options", "Key Points Extraction", "100% Client-Side"],
      stat: "8 Languages",
    },
    {
      id: "voiceTyping" as ActivePage,
      title: "Voice Typing – Speech to Text",
      subtitle: "Speak in 11+ Languages",
      badge: "🎙️ Browser Mic",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
      iconBg: "bg-gradient-to-tr from-teal-500 to-emerald-500 text-white",
      cardBorder: "hover:border-teal-500 hover:shadow-teal-500/10",
      ctaBg: "bg-teal-600 hover:bg-teal-500 text-white",
      icon: Mic,
      desc: "Press the mic and talk — your words become text you can copy or polish. Great for essays, messages, and notes when typing is slow.",
      bullets: ["Urdu, English & More", "Live Transcript", "Copy or Download"],
      stat: "No Install",
    },
    {
      id: "cvBuilder" as ActivePage,
      title: "CV Builder – Resume Maker",
      subtitle: "Professional CV in Minutes",
      badge: "💼 Print & PDF",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
      iconBg: "bg-gradient-to-tr from-indigo-500 to-blue-500 text-white",
      cardBorder: "hover:border-indigo-500 hover:shadow-indigo-500/10",
      ctaBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
      icon: Briefcase,
      desc: "Fill in your details, watch the CV build itself, then print it or save it as a PDF. Everything stays on your device — nothing is uploaded.",
      bullets: ["2 Clean Templates", "Live Preview", "Private - On-Device"],
      stat: "No Sign-Up",
    },
    {
      id: "wordCounter" as ActivePage,
      title: "Word Counter",
      subtitle: "Words, Characters & Reading Time",
      badge: "🔢 Live Count",
      badgeColor: "bg-lime-100 text-lime-800 border-lime-300",
      iconBg: "bg-gradient-to-tr from-lime-500 to-emerald-500 text-white",
      cardBorder: "hover:border-lime-500 hover:shadow-lime-500/10",
      ctaBg: "bg-lime-600 hover:bg-lime-500 text-white",
      icon: Hash,
      desc: "Paste or type text and see words, characters, sentences, paragraphs and reading time update live in your browser.",
      bullets: ["Goal & Selection Count", "Top Repeated Words", "Private - In-Browser"],
      stat: "No Sign-Up",
    },
    {
      id: "textToSpeech" as ActivePage,
      title: "Text to Speech",
      subtitle: "Hear Your Text Read Aloud",
      badge: "🔊 Device Voices",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
      iconBg: "bg-gradient-to-tr from-sky-500 to-cyan-500 text-white",
      cardBorder: "hover:border-sky-500 hover:shadow-sky-500/10",
      ctaBg: "bg-sky-600 hover:bg-sky-500 text-white",
      icon: Volume2,
      desc: "Paste text and your device reads it aloud with its own voices. Pick a voice, set speed and pitch — nothing is uploaded.",
      bullets: ["Speed & Pitch Control", "Long-Text Friendly", "Private - In-Browser"],
      stat: "No Sign-Up",
    },
    {
      id: "cleaner" as ActivePage,
      title: "AI Cliché & Buzzword Purger",
      subtitle: "Strip Hallmark AI Vocabulary",
      badge: "🧹 De-AI Polish",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      iconBg: "bg-gradient-to-tr from-rose-500 to-red-500 text-white",
      cardBorder: "hover:border-rose-500 hover:shadow-rose-500/10",
      ctaBg: "bg-rose-600 hover:bg-rose-500 text-white",
      icon: AlertOctagon,
      desc: "Eliminates dead-giveaway tokens ('delve', 'tapestry', 'testament', 'pivotal') that make writing sound robotic and artificial.",
      bullets: ["60+ Known AI Cliché Rules", "1-Click Purge All Clichés", "Organic Human Vocabulary"],
      stat: "Zero Clichés",
    },
    {
      id: "diff" as ActivePage,
      title: "Paraphrase Similarity Diff Checker",
      subtitle: "Turnitin Plagiarism Match Predictor",
      badge: "⚖️ Word-by-Word Diff",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      iconBg: "bg-gradient-to-tr from-blue-500 to-teal-500 text-white",
      cardBorder: "hover:border-blue-500 hover:shadow-blue-500/10",
      ctaBg: "bg-blue-600 hover:bg-blue-500 text-white",
      icon: GitCompare,
      desc: "Side-by-side comparison of raw AI text vs humanized prose. Color-coded word diff, % similarity score, and Turnitin risk evaluation.",
      bullets: ["Color Coded Inline Diff", "Jaccard & Levenshtein Metrics", "Turnitin Match Safety Gauge"],
      stat: "Visual Diff",
    },
    {
      id: "media" as ActivePage,
      title: "AI Video Reels & Watermark Studio",
      subtitle: "Corner Watermark & Logo Stripper",
      badge: "🎬 TikTok & IG Shorts",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      iconBg: "bg-gradient-to-tr from-rose-500 to-pink-500 text-white",
      cardBorder: "hover:border-rose-500 hover:shadow-rose-500/10",
      ctaBg: "bg-rose-600 hover:bg-rose-500 text-white",
      icon: Video,
      desc: "Remove annoying logos and watermarks from downloaded videos using smart corner masking and edge punch zoom. Perfect for viral Reels & Shorts.",
      bullets: ["Corner Watermark & Logo Remover", "Viral Pacing & Humanized Frame Rate", "Monetization & Copyright Safe"],
      stat: "Instant Preview",
    },
    {
      id: "seo" as ActivePage,
      title: "High-RPM SEO & Viral Hashtags",
      subtitle: "Better Rankings & More Traffic",
      badge: "🚀 High-CTR Engine",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950",
      cardBorder: "hover:border-amber-500 hover:shadow-amber-500/10",
      ctaBg: "bg-amber-600 hover:bg-amber-500 text-white",
      icon: TrendingUp,
      desc: "Generate high-paying search keywords, viral TikTok/YouTube hashtags, and meta tags engineered to boost traffic and ad earnings.",
      bullets: ["High RPM/CPC Keyword Suggestions", "Viral YouTube & TikTok Hashtags", "1-Click Copy to Clipboard"],
      stat: "Top US RPMs",
    },
    {
      id: "imageCompressor" as ActivePage,
      title: "Image Compressor",
      subtitle: "Shrink Photos Without Losing Quality",
      badge: "🖼️ Free & Fast",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300",
      iconBg: "bg-gradient-to-tr from-cyan-500 to-blue-500 text-white",
      cardBorder: "hover:border-cyan-500 hover:shadow-cyan-500/10",
      ctaBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
      icon: Maximize2,
      desc: "Compress JPEG, PNG, and WebP images right in your browser. Reduce file size for faster websites and smaller uploads.",
      bullets: ["Batch Image Processing", "Quality Control Slider", "Private - Never Uploaded"],
      stat: "100% Free",
    },
    {
      id: "pdfTools" as ActivePage,
      title: "PDF Tools",
      subtitle: "Merge PDFs & Create from Images",
      badge: "📕 Free & Private",
      badgeColor: "bg-red-100 text-red-800 border-red-300",
      iconBg: "bg-gradient-to-tr from-red-500 to-orange-500 text-white",
      cardBorder: "hover:border-red-500 hover:shadow-red-500/10",
      ctaBg: "bg-red-600 hover:bg-red-500 text-white",
      icon: FileText,
      desc: "Merge multiple PDFs into one file, or turn your photos into a professional PDF document. All in your browser.",
      bullets: ["Merge Multiple PDFs", "Images to PDF", "Private - Never Uploaded"],
      stat: "100% Free",
    },
  ];

  // Show all other tools (excluding current active page)
  const displayTools = allTools.filter((tool) => tool.id !== activePage);

  // Related guide article for current tool (language-aware)
  const TOOL_TO_ARTICLE_UR: Record<string, string> = {
    humanizer: "ai-humanizer-urdu-guide",
    detector: "ai-detector-urdu-guide",
    citation: "citation-generator-urdu-guide",
    expander: "sentence-expander-urdu-guide",
    summarizer: "text-summarizer-urdu-guide",
    voiceTyping: "voice-typing-urdu-guide",
    cvBuilder: "cv-builder-urdu-guide",
    wordCounter: "word-counter-urdu-guide",
    textToSpeech: "text-to-speech-urdu-guide",
    imageCompressor: "image-compressor-urdu-guide",
    pdfTools: "pdf-tools-urdu-guide",
    media: "video-tools-urdu-guide",
    seo: "seo-tools-urdu-guide",
    cleaner: "cliche-cleaner-urdu-guide",
    diff: "diff-checker-urdu-guide",
  };
  const TOOL_TO_ARTICLE_EN: Record<string, string> = {
    detector: "ai-detector-english-guide",
    citation: "citation-generator-english-guide",
    expander: "sentence-expander-english-guide",
    summarizer: "free-extractive-summarizer-honest-test",
    voiceTyping: "voice-typing-guide-speech-to-text",
    cvBuilder: "cv-builder-guide-free-resume",
    wordCounter: "word-counter-guide-accurate-counts",
    textToSpeech: "text-to-speech-guide-read-aloud",
    imageCompressor: "image-compressor-email-wouldnt-send",
    pdfTools: "pdf-merge-deadline-guide",
    media: "ai-video-reels-youtube-detection-truth",
    seo: "google-helpful-content-ai-seo-2026",
    humanizer: "how-to-make-chatgpt-text-sound-natural-guide",
  };
  const TOOL_TO_ARTICLE_ES: Record<string, string> = {
    humanizer: "humanizar-texto-ia-gratis-universidad-turnitin-guia",
    detector: "detector-ia-guia-espanol",
    citation: "generador-citas-guia-espanol",
    expander: "expansor-oraciones-guia-espanol",
    summarizer: "resumidor-texto-historia-estudiante",
    voiceTyping: "dictado-por-voz-guia",
    cvBuilder: "crear-curriculum-guia",
    wordCounter: "contador-palabras-guia",
    textToSpeech: "texto-a-voz-guia",
    imageCompressor: "compresor-imagenes-truco-disenadores",
    pdfTools: "unir-pdfs-guia-practica",
    media: "herramientas-video-guia-espanol",
    seo: "herramientas-seo-guia-espanol",
    cleaner: "limpiador-cliches-guia-espanol",
  };
  const TOOL_TO_ARTICLE_DE: Record<string, string> = {
    humanizer: "chatgpt-texte-natuerlicher-klingen-lassen-guide",
    detector: "ki-detektor-anleitung-deutsch",
    citation: "zitat-generator-anleitung-deutsch",
    expander: "satz-erweiterer-anleitung-deutsch",
    summarizer: "extraktiv-abstraktiv-zusammenfassung-entscheidung",
    voiceTyping: "spracheingabe-anleitung",
    cvBuilder: "lebenslauf-erstellen-anleitung",
    wordCounter: "wortzaehler-anleitung",
    textToSpeech: "text-zu-sprache-anleitung",
    imageCompressor: "warum-website-langsam-bilder-komprimieren",
    pdfTools: "pdfs-zusammenfuehren-anleitung",
    media: "video-tools-anleitung-deutsch",
    seo: "seo-tools-anleitung-deutsch",
    cleaner: "klischee-reiniger-anleitung-deutsch",
    diff: "diff-checker-anleitung-deutsch",
  };
  const TOOL_TO_ARTICLE_FR: Record<string, string> = {
    humanizer: "comment-rendre-texte-chatgpt-plus-naturel-guide",
    detector: "detecteur-ia-guide-francais",
    citation: "generateur-citations-guide-francais",
    expander: "expanseur-phrases-guide-francais",
    summarizer: "resumeur-texte-guide-francais",
    voiceTyping: "saisie-vocale-guide",
    cvBuilder: "creer-cv-guide",
    wordCounter: "compteur-mots-guide",
    textToSpeech: "synthese-vocale-guide",
    imageCompressor: "compresseur-images-guide-francais",
    pdfTools: "outils-pdf-guide-francais",
    media: "studio-video-guide-francais",
    seo: "outils-seo-guide-francais",
    cleaner: "nettoyeur-cliches-guide-francais",
    diff: "comparateur-diff-guide-francais",
  };
  const TOOL_TO_ARTICLE_TR: Record<string, string> = {
    humanizer: "chatgpt-metin-dogallastirma-rehberi",
    detector: "yapay-zeka-dedektoru-rehber",
    citation: "alinti-olusturucu-rehber",
    expander: "cumle-genisletici-rehber",
    summarizer: "metin-ozetleyici-rehber",
    voiceTyping: "sesli-yazma-rehberi",
    cvBuilder: "cv-olusturma-rehberi",
    wordCounter: "kelime-sayaci-rehberi",
    textToSpeech: "metinden-sese-rehberi",
    imageCompressor: "resim-sikistirici-rehber",
    pdfTools: "pdf-araclari-rehber",
    media: "video-studyosu-rehber",
    seo: "seo-araclari-rehber",
    cleaner: "klise-temizleyici-rehber",
    diff: "fark-karsilastirici-rehber",
  };
  const TOOL_TO_ARTICLE_JA: Record<string, string> = {
    humanizer: "chatgpt-bunsho-shizen-ni-naosu-guide",
    detector: "ai-kenshutsu-guide",
    citation: "inyo-generator-guide",
    expander: "bunsho-kakucho-guide",
    summarizer: "yoyaku-tool-guide",
    voiceTyping: "onsei-nyuryoku-guide",
    cvBuilder: "rirekisho-sakusei-guide",
    wordCounter: "word-counter-guide-ja",
    textToSpeech: "text-to-speech-guide-ja",
    imageCompressor: "gazo-asshuku-guide",
    pdfTools: "pdf-tool-guide",
    media: "doga-studio-guide",
    seo: "seo-tool-guide",
    cleaner: "kurishe-jokyo-guide",
    diff: "diff-checker-guide",
  };
  const TOOL_TO_ARTICLE_IT: Record<string, string> = {
    humanizer: "umanizzatore-testo-guida-italiano",
    detector: "rilevatore-ia-guida-italiano",
    citation: "generatore-citazioni-guida-italiano",
    expander: "espansore-frasi-guida-italiano",
    summarizer: "riassuntore-testo-guida-italiano",
    voiceTyping: "dettatura-vocale-guida",
    cvBuilder: "creare-cv-guida",
    wordCounter: "contatore-parole-guida",
    textToSpeech: "sintesi-vocale-guida",
    imageCompressor: "compressore-immagini-guida-italiano",
    pdfTools: "strumenti-pdf-guida-italiano",
    media: "studio-video-guida-italiano",
    seo: "strumenti-seo-guida-italiano",
    cleaner: "pulitore-cliche-guida-italiano",
    diff: "confronta-diff-guida-italiano",
  };
  const TOOL_TO_ARTICLE_PT: Record<string, string> = {
    detector: "detector-ia-guia-portugues",
    citation: "gerador-citacoes-guia-portugues",
    expander: "expansor-frases-guia-portugues",
    summarizer: "resumidor-texto-guia-portugues",
    voiceTyping: "digitacao-por-voz-guia",
    cvBuilder: "criar-curriculo-guia",
    wordCounter: "contador-palavras-guia",
    textToSpeech: "texto-para-fala-guia",
    imageCompressor: "compressor-imagens-guia-portugues",
    pdfTools: "ferramentas-pdf-guia-portugues",
    media: "estudio-video-guia-portugues",
    seo: "ferramentas-seo-guia-portugues",
    cleaner: "limpador-cliches-guia-portugues",
    diff: "comparador-diff-guia-portugues",
  };
  const TOOL_TO_ARTICLE_NL: Record<string, string> = {
    humanizer: "tekst-humanizer-gids-nederlands",
    detector: "ai-detector-gids-nederlands",
    citation: "citatie-generator-gids-nederlands",
    expander: "zin-uitbreider-gids-nederlands",
    summarizer: "tekst-samenvatter-gids-nederlands",
    voiceTyping: "spraaktypen-gids",
    cvBuilder: "cv-maken-gids",
    wordCounter: "woordenteller-gids",
    textToSpeech: "tekst-naar-spraak-gids",
    imageCompressor: "afbeelding-compressor-gids-nederlands",
    pdfTools: "pdf-tools-gids-nederlands",
    media: "video-studio-gids-nederlands",
    seo: "seo-tools-gids-nederlands",
    cleaner: "cliche-verwijderaar-gids-nederlands",
    diff: "diff-vergelijker-gids-nederlands",
  };
  const TOOL_TO_ARTICLE_NO: Record<string, string> = {
    humanizer: "tekst-humanizer-guide-norsk",
    detector: "ai-detektor-guide-norsk",
    citation: "sitat-generator-guide-norsk",
    expander: "setnings-utvider-guide-norsk",
    summarizer: "tekst-sammendrag-guide-norsk",
    voiceTyping: "stemmeskriving-guide",
    cvBuilder: "cv-lage-guide",
    wordCounter: "ordteller-guide",
    textToSpeech: "tekst-til-tale-guide",
    imageCompressor: "bilde-kompressor-guide-norsk",
    pdfTools: "pdf-verktoy-guide-norsk",
    media: "video-studio-guide-norsk",
    seo: "seo-verktoy-guide-norsk",
    cleaner: "klisje-fjerner-guide-norsk",
    diff: "diff-sammenligner-guide-norsk",
  };
  const articleMap = selectedLanguage === "ur" ? TOOL_TO_ARTICLE_UR : selectedLanguage === "es" ? TOOL_TO_ARTICLE_ES : selectedLanguage === "de" ? TOOL_TO_ARTICLE_DE : selectedLanguage === "fr" ? TOOL_TO_ARTICLE_FR : selectedLanguage === "tr" ? TOOL_TO_ARTICLE_TR : selectedLanguage === "ja" ? TOOL_TO_ARTICLE_JA : selectedLanguage === "it" ? TOOL_TO_ARTICLE_IT : selectedLanguage === "pt" ? TOOL_TO_ARTICLE_PT : selectedLanguage === "nl" ? TOOL_TO_ARTICLE_NL : selectedLanguage === "no" ? TOOL_TO_ARTICLE_NO : TOOL_TO_ARTICLE_EN;
  const guideSlug = articleMap[activePage];
  const guidePost = guideSlug ? findBlogPostBySlug(guideSlug) : null;

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10 border-t border-stone-200 overflow-hidden">
      {/* Related Guide Article Banner */}
      {guidePost && (
        <a
          href={`/${selectedLanguage}/blog/${guidePost.slug}/`}
          className="block mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 sm:p-5 text-white hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-emerald-100 mb-0.5">
                📖 Guide
              </div>
              <div className="text-sm sm:text-base font-bold leading-snug line-clamp-2">
                {guidePost.title}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </div>
        </a>
      )}
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              Creator Power Suite
            </span>
            <span className="text-xs text-stone-500 font-medium">Free to Use</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            {ot.heading || "Explore Other High-Performance Tools"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            {ot.subheading || "Switch between tools with one tap — everything you need for human writing, AI verification, and viral reach."}
          </p>
        </div>
      </div>

      {/* 3 Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {displayTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={() => onSelectPage(tool.id)}
              className={`bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg ${tool.cardBorder}`}
            >
              <div>
                {/* Top Row: Icon & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${tool.iconBg}`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h4 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {tool.title}
                </h4>
                <p className="text-xs text-stone-500 font-medium mt-0.5 mb-3">
                  {tool.subtitle}
                </p>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {tool.desc}
                </p>

                {/* Bullet Highlights */}
                <ul className="space-y-1.5 mb-5">
                  {tool.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPage(tool.id);
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md cursor-pointer ${tool.ctaBg}`}
              >
                <span>Launch {tool.title.split(" ")[0]}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
