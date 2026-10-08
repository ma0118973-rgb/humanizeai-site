import { BookOpen, ArrowRight, Clock } from "lucide-react";
import { LanguageCode } from "../types";
import { findBlogPostBySlug } from "../data/blogArticles";

// Shows the related guide article below each tool
// User asked: articles should be visible when scrolling below the tool

const TOOL_TO_ARTICLE: Record<string, string> = {
  humanizer: "ai-humanizer-urdu-guide",
  detector: "ai-detector-urdu-guide",
  citation: "citation-generator-urdu-guide",
  expander: "sentence-expander-urdu-guide",
  summarizer: "text-summarizer-urdu-guide",
  voiceTyping: "voice-typing-urdu-guide",
  cvBuilder: "cv-builder-urdu-guide",
  wordCounter: "word-counter-urdu-guide",
  imageCompressor: "image-compressor-urdu-guide",
  pdfTools: "pdf-tools-urdu-guide",
  media: "video-tools-urdu-guide",
  seo: "seo-tools-urdu-guide",
  cleaner: "cliche-cleaner-urdu-guide",
  diff: "diff-checker-urdu-guide",
};

const SECTION_TITLE: Record<LanguageCode, string> = {
  en: "📖 Learn How to Use This Tool",
  es: "📖 Aprende a Usar Esta Herramienta",
  ur: "📖 Is Tool Ko Istemal Karna Seekhen",
  de: "📖 So Nutzen Sie Dieses Tool",
  fr: "📖 Apprenez à Utiliser Cet Outil",
  tr: "📖 Bu Aracı Kullanmayı Öğrenin",
  pt: "📖 Aprenda a Usar Esta Ferramenta",
  ja: "📖 このツールの使い方を学ぶ",
  no: "📖 Lær Å Bruke Dette Verktøyet",
  nl: "📖 Leer Deze Tool Gebruiken",
  it: "📖 Impara a Usare Questo Strumento",
};

const READ_FULL: Record<LanguageCode, string> = {
  en: "Read Full Guide",
  es: "Leer Guía Completa",
  ur: "Mukammal Guide Parhen",
  de: "Vollständige Anleitung",
  fr: "Lire le Guide Complet",
  tr: "Tam Rehberi Oku",
  pt: "Ler Guia Completo",
  ja: "完全ガイドを読む",
  no: "Les Full Guide",
  nl: "Lees Volledige Gids",
  it: "Leggi la Guida Completa",
};

interface Props {
  toolId: string;
  selectedLanguage?: LanguageCode;
  onNavigateToBlog?: (slug: string) => void;
}

export function ToolGuideSection({ toolId, selectedLanguage = "en", onNavigateToBlog }: Props) {
  const articleSlug = TOOL_TO_ARTICLE[toolId];
  if (!articleSlug) return null;

  const post = findBlogPostBySlug(articleSlug);
  if (!post) return null;

  const handleClick = () => {
    if (onNavigateToBlog) {
      onNavigateToBlog(articleSlug);
    } else {
      window.location.href = `/${selectedLanguage}/blog/${articleSlug}/`;
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-200 p-5 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-bold text-stone-900">
            {SECTION_TITLE[selectedLanguage]}
          </h2>
        </div>

        <div
          onClick={handleClick}
          className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all"
        >
          {post.image && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 sm:h-48 object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug mb-2">
            {post.title}
          </h3>

          <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-2">
            {post.summary}
          </p>

          <div className="flex items-center gap-1 text-emerald-700 font-bold text-sm">
            {READ_FULL[selectedLanguage]}
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
}
