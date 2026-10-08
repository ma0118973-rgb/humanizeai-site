import { useState, useEffect } from "react";
import { BookOpen, Clock, Tag, User, ArrowRight, Share2, Sparkles, Search, ShieldCheck } from "lucide-react";
import { BLOG_POSTS, BlogPost, findBlogPostBySlug } from "../data/blogArticles";
import { ActivePage, LanguageCode } from "../types";

interface BlogSectionProps {
  onSelectTopic?: (topic: string) => void;
  initialSlug?: string | null;
  onSelectPost?: (slug: string | null) => void;
  selectedLanguage?: LanguageCode;
  onNavigatePage?: (page: ActivePage) => void;
}

export function BlogSection({
  onSelectTopic,
  initialSlug,
  onSelectPost,
  selectedLanguage = "en",
  onNavigatePage,
}: BlogSectionProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(() => {
    if (initialSlug) {
      return findBlogPostBySlug(initialSlug) || null;
    }
    return null;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (initialSlug) {
      const found = findBlogPostBySlug(initialSlug);
      if (found) setSelectedPost(found);
    } else {
      setSelectedPost(null);
    }
  }, [initialSlug]);

  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    onSelectPost?.(post.slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToList = () => {
    setSelectedPost(null);
    onSelectPost?.(null);
  };

  const categories = ["All", "Detection Bypass", "Academic Integrity", "SEO & Content", "Video & Visual AI"];

  // Show posts written in the current language; fall back to English posts
  // so the blog never looks empty while more translations are being added.
  const langPosts = BLOG_POSTS.filter((p) => p.language === selectedLanguage);
  const visiblePosts = langPosts.length > 0 ? langPosts : BLOG_POSTS.filter((p) => p.language === "en");

  const filteredPosts =
    selectedCategory === "All"
      ? visiblePosts
      : visiblePosts.filter((p) => p.category === selectedCategory);

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 overflow-hidden">
      {/* Blog Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              AI Intelligence & Research Hub
            </span>
            <span className="text-xs text-stone-500 font-mono">Editorial Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Latest Guides, Detection Benchmarks & Algorithm Insights
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            In-depth guides on natural AI-assisted writing, detection literacy, and Google Helpful Content guidelines.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                handleBackToList();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat && !selectedPost
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* If a post is active */}
      {selectedPost ? (
        <article className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-10 shadow-sm space-y-6 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <button
              onClick={handleBackToList}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              ← Back to All Guides & Articles
            </button>
            <span className="text-xs text-stone-400 font-mono">
              /blog/{selectedPost.slug}/
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-stone-100 font-semibold text-stone-700">
                {selectedPost.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedPost.readTime}
              </span>
              <span>•</span>
              <span>{selectedPost.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {selectedPost.author}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight">
              {selectedPost.title}
            </h1>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-stone-800 text-sm font-medium leading-relaxed">
            <strong>Executive Summary:</strong> {selectedPost.summary}
          </div>

          <div className="space-y-5 text-stone-700 text-sm sm:text-base leading-relaxed">
            {selectedPost.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Internal Links & Free Tool CTAs */}
          <div className="p-5 bg-stone-900 text-white rounded-2xl space-y-4 my-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Ready to Humanize Your Writing or Scan for AI?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-300">
              Put this guide into practice right now using our 100% free web utilities — zero sign-up required:
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {onNavigatePage && (
                <>
                  <button
                    onClick={() => onNavigatePage("humanizer")}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Launch Free AI Humanizer
                  </button>
                  <button
                    onClick={() => onNavigatePage("detector")}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-700 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-emerald-400" /> Test AI Detector Scanner
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Keywords Tag Cloud */}
          <div className="pt-6 border-t border-stone-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Indexed Keywords:
            </span>
            {selectedPost.keywords.map((kw, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200"
              >
                {kw}
              </span>
            ))}
          </div>

          {/* Related Articles Navigation */}
          <div className="pt-6 border-t border-stone-200 space-y-3">
            <h4 className="text-sm font-bold text-stone-900">Explore Other Guides in This Series:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(() => {
                const sameLang = BLOG_POSTS.filter(
                  (p) => p.slug !== selectedPost.slug && p.language === selectedPost.language
                );
                const others = BLOG_POSTS.filter(
                  (p) => p.slug !== selectedPost.slug && p.language !== selectedPost.language
                );
                return [...sameLang, ...others].slice(0, 2).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleOpenPost(rel)}
                  className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold text-emerald-700">{rel.category}</span>
                  <p className="text-xs font-bold text-stone-800 group-hover:text-emerald-900 mt-1 line-clamp-2">
                    {rel.title}
                  </p>
                </div>
              ));
              })()}
            </div>
          </div>
        </article>
      ) : (
        /* Post Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => handleOpenPost(post)}
              className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    {post.category}
                  </span>
                  <span className="text-stone-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>

              <div className="pt-5 border-t border-stone-100 mt-5 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">{post.author}</span>
                <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
