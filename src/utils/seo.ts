import { ActivePage, LanguageCode } from "../types";
import { BLOG_POSTS, BlogPost } from "../data/blogArticles";
import { TRANSLATIONS } from "../data/translations";

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogType: string;
  schemaType: "WebApplication" | "Article" | "WebPage";
  toolName?: string;
}

export const SEO_CONFIGS: Record<ActivePage, PageSeoConfig> = {
  humanizer: {
    title: "AI Humanizer – Free AI Text Rewriter for Natural-Sounding Writing",
    description: "Convert ChatGPT, Claude & Gemini text into natural, human-sounding writing with varied sentence rhythm. Free, no sign-up. Results vary and are not guaranteed.",
    canonicalPath: "/ai-humanizer/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Clever AI Text Humanizer",
  },
  detector: {
    title: "AI Content Detector – Text Pattern Scanner & Sentence Heatmap",
    description: "Scan documents with simulated Turnitin, GPTZero, Copyleaks & Originality.ai models. Features sentence-by-sentence visual risk heatmaps. Heuristic estimates, not official verdicts.",
    canonicalPath: "/ai-detector/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "AI Content Detector",
  },
  media: {
    title: "AI Video & Media Studio – Watermark Remover & Reels Pacing",
    description: "Clean corner watermarks and logos from CapCut, TikTok & AI video reels. Applies optical edge zoom, 35mm film grain, and authentic frame rates.",
    canonicalPath: "/video-tools/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "AI Video Reels & Watermark Studio",
  },
  seo: {
    title: "High-RPM SEO Optimizer – Viral Tags & Meta Engine",
    description: "Generate high-CTR Google meta tags, search keywords, and viral social hashtags for YouTube Shorts, TikTok, and web publishers.",
    canonicalPath: "/seo-tools/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "High-RPM Viral SEO Engine",
  },
  citation: {
    title: "Free Academic Citation Generator – APA 7, MLA 9, Chicago & Harvard Formatter",
    description: "100% Free academic citation generator. Format references in APA 7th, MLA 9th, Chicago, and Harvard styles instantly.",
    canonicalPath: "/citation-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Academic Citation & Bibliography Generator",
  },
  expander: {
    title: "Academic Sentence Expander & Depth Enhancer – Free Writing Tool",
    description: "Expand short, robotic sentences into rich academic prose with high perplexity, causal depth, and diverse sentence burstiness. 100% free.",
    canonicalPath: "/sentence-expander/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Academic Sentence Expander",
  },
  summarizer: {
    title: "Free AI Text Summarizer – Summarize Articles in Seconds",
    description: "Free text summarizer. Paste long articles, papers & documents — get instant extractive summaries in 8 languages. No sign-up.",
    canonicalPath: "/text-summarizer/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "AI Text Summarizer",
  },
  imageCompressor: {
    title: "Free Image Compressor Online – Compress JPG, PNG, WebP",
    description: "Free image compressor. Compress JPG, PNG & WebP right in your browser. No upload, no signup. 100% private.",
    canonicalPath: "/image-compressor/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Image Compressor",
  },
  pdfTools: {
    title: "Free PDF Tools Online – Merge PDF & Images to PDF",
    description: "Free PDF tools. Merge multiple PDFs into one, or convert JPG/PNG images to PDF. 100% in-browser, no upload, no signup.",
    canonicalPath: "/pdf-tools/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "PDF Tools",
  },
  cleaner: {
    title: "AI Cliché & Buzzword Purger – De-AI Polish & Turnitin Hallmark Remover",
    description: "Scan and purge dead-giveaway AI clichés like 'delve', 'tapestry', 'testament' and formulaic transitions with 1-click organic human replacements.",
    canonicalPath: "/cliche-cleaner/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "AI Cliché Purger & De-AI Polish",
  },
  diff: {
    title: "Paraphrase Similarity & Text Diff Checker – Turnitin Match Predictor",
    description: "Side-by-side comparison of original AI draft vs rewritten human text. Visual word-level diff, % similarity score, and Turnitin risk evaluation.",
    canonicalPath: "/diff-checker/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Paraphrase Similarity Diff Checker",
  },
  blog: {
    title: "AI Detection & Humanization Guides",
    description: "In-depth benchmarks on Turnitin 3.0, perplexity, burstiness algorithms, and ethical AI humanization workflows for students and creators.",
    canonicalPath: "/blog/",
    ogType: "article",
    schemaType: "Article",
  },
  privacy: {
    title: "Privacy Policy – Clever Humanizer",
    description: "Learn how Clever Humanizer protects user privacy with zero log storage and secure client-side document processing standards.",
    canonicalPath: "/privacy/",
    ogType: "website",
    schemaType: "WebPage",
  },
  terms: {
    title: "Terms of Service – Clever Humanizer",
    description: "Read the Terms of Service for using Clever Humanizer free web tools, content guidelines, and ethical usage standards.",
    canonicalPath: "/terms/",
    ogType: "website",
    schemaType: "WebPage",
  },
  disclaimer: {
    title: "Disclaimer & Academic Integrity Policy – Clever Humanizer",
    description: "Our commitment to ethical AI use, research assistance, and academic integrity policies for educational environments.",
    canonicalPath: "/disclaimer/",
    ogType: "website",
    schemaType: "WebPage",
  },
  about: {
    title: "About Us – Clever Humanizer Project",
    description: "Our mission to provide free, privacy-first AI text humanization and content checking tools worldwide.",
    canonicalPath: "/about/",
    ogType: "website",
    schemaType: "WebPage",
  },
  contact: {
    title: "Contact & Support – Clever Humanizer",
    description: "Get in touch with the Clever Humanizer engineering and support team for feedback, enterprise inquiries, and support.",
    canonicalPath: "/contact/",
    ogType: "website",
    schemaType: "WebPage",
  },
  notfound: {
    title: "Page not found – HumanizeAI",
    description: "This page does not exist or has moved.",
    canonicalPath: "/ai-humanizer/",
    ogType: "website",
    schemaType: "WebPage",
  },
};

/**
 * Returns dynamic site origin without any hardcoded domain assumption
 */
export function getSiteOrigin(): string {
  if (typeof window !== "undefined" && window.location && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "https://humanizeai.free";
}

export const ALL_SUPPORTED_LANGUAGES: LanguageCode[] = [
  "en",
  "es",
  "tr",
  "de",
  "fr",
  "pt",
  "ja",
  "ur",
];

/**
 * Updates browser title, meta tags, OpenGraph, Twitter cards, hreflang tags, and Schema.org JSON-LD
 */
export function applyPageSeo(
  page: ActivePage,
  lang: LanguageCode = "en",
  blogPost?: BlogPost | null
) {
  const origin = getSiteOrigin();
  const baseConfig = SEO_CONFIGS[page] || SEO_CONFIGS.humanizer;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Localized Title and Description
  let title = baseConfig.title;
  let description = baseConfig.description;

  if (page === "humanizer") {
    title = t.seo.humanizerTitle;
    description = t.seo.humanizerDesc;
  } else if (page === "detector") {
    title = t.seo.detectorTitle;
    description = t.seo.detectorDesc;
  } else if (page === "media") {
    title = t.seo.mediaTitle;
    description = t.seo.mediaDesc;
  } else if (page === "seo") {
    title = t.seo.seoTitle;
    description = t.seo.seoDesc;
  } else if (page === "citation") {
    title = (t.seo as any).citationTitle || baseConfig.title;
    description = (t.seo as any).citationDesc || baseConfig.description;
  } else if (page === "expander") {
    title = (t.seo as any).expanderTitle || baseConfig.title;
    description = (t.seo as any).expanderDesc || baseConfig.description;
  } else if (page === "cleaner") {
    title = (t.seo as any).cleanerTitle || baseConfig.title;
    description = (t.seo as any).cleanerDesc || baseConfig.description;
  } else if (page === "diff") {
    title = (t.seo as any).diffTitle || baseConfig.title;
    description = (t.seo as any).diffDesc || baseConfig.description;
  } else if (page === "blog") {
    if (blogPost) {
      title = `${blogPost.title} – ${t.nav.humanizerTab}`;
      description = blogPost.summary;
    } else {
      title = t.seo.blogTitle;
      description = t.seo.blogDesc;
    }
  }

  // Compute canonical path with language prefix
  let pathWithoutLang = baseConfig.canonicalPath;
  if (page === "blog" && blogPost) {
    pathWithoutLang = `/blog/${blogPost.slug}/`;
  }

  // Canonical URL for current language
  const langPrefix = `/${lang}`;
  const canonicalUrl = `${origin}${langPrefix}${pathWithoutLang}`;

  // 1. Update Title
  document.title = title;

  // 2. Language attribute
  document.documentElement.lang = lang;
  if (lang === "ur") {
    document.documentElement.dir = "rtl";
  } else {
    document.documentElement.dir = "ltr";
  }

  // 3. Helper to update/create meta tag
  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? "property" : "name";
    let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  // 4. Standard Meta Tags
  setMeta("description", description);
  setMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  // 5. OpenGraph Tags
  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  setMeta("og:url", canonicalUrl, true);
  setMeta("og:type", blogPost ? "article" : baseConfig.ogType, true);
  setMeta("og:site_name", "Clever Humanizer", true);
  setMeta("og:image", `${origin}/icon.svg`, true);

  // 6. Twitter / X Cards
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", `${origin}/icon.svg`);

  // 7. Dynamic Self-Referencing Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement("link");
    canonicalEl.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute("href", canonicalUrl);

  // 8. Dynamic hreflang alternates for all supported languages
  updateHreflangTags(origin, pathWithoutLang);

  // 9. Dynamic JSON-LD Structured Data
  updateJsonLd(page, baseConfig, canonicalUrl, origin, blogPost);
}

function updateHreflangTags(origin: string, pathWithoutLang: string) {
  // Remove existing hreflang tags
  const existing = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existing.forEach((el) => el.remove());

  // Generate hreflang for all real supported languages
  ALL_SUPPORTED_LANGUAGES.forEach((l) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", l);
    link.setAttribute("href", `${origin}/${l}${pathWithoutLang}`);
    document.head.appendChild(link);
  });

  // x-default hreflang (defaults to English canonical)
  const defaultLink = document.createElement("link");
  defaultLink.setAttribute("rel", "alternate");
  defaultLink.setAttribute("hreflang", "x-default");
  defaultLink.setAttribute("href", `${origin}/en${pathWithoutLang}`);
  document.head.appendChild(defaultLink);
}

function updateJsonLd(
  page: ActivePage,
  config: PageSeoConfig,
  canonicalUrl: string,
  origin: string,
  blogPost?: BlogPost | null
) {
  const existingScript = document.getElementById("clever-schema-jsonld");
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement("script");
  script.id = "clever-schema-jsonld";
  script.type = "application/ld+json";

  const schemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Clever Humanizer",
      "url": `${origin}/`,
      "description": "100% Free AI Humanizer and AI Text Pattern Scanner.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${origin}/ai-humanizer/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Clever Humanizer",
      "url": `${origin}/`,
      "logo": `${origin}/icon.svg`,
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "yaretmyservin7@gmail.com",
        "telephone": "+1-253-500-6555",
        "contactType": "customer service",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": `${origin}/`,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": blogPost ? blogPost.title : config.toolName || config.title,
          "item": canonicalUrl,
        },
      ],
    },
  ];

  // Article Schema
  if (blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": blogPost.title,
      "description": blogPost.summary,
      "author": {
        "@type": "Person",
        "name": blogPost.author,
      },
      "publisher": {
        "@type": "Organization",
        "name": "Clever Humanizer",
        "logo": {
          "@type": "ImageObject",
          "url": `${origin}/icon.svg`,
        },
      },
      "datePublished": "2026-03-01",
      "dateModified": "2026-09-24",
      "mainEntityOfPage": canonicalUrl,
      "keywords": blogPost.keywords.join(", "),
    });
  } else if (config.schemaType === "WebApplication" && config.toolName) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": config.toolName,
      "url": canonicalUrl,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "All (Web, iOS, Android, macOS, Windows)",
      "description": config.description,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
      },
      "featureList": [
        "100% Free & Unlimited Usage",
        "Sentence-by-sentence writing pattern analysis",
        "Tone and readability customization",
        "Instant Export to DOCX & TXT",
      ],
    });
  }

  // Include FAQPage schema on tools
  if (
    page === "humanizer" ||
    page === "detector" ||
    page === "citation" ||
    page === "expander" ||
    page === "cleaner" ||
    page === "diff"
  ) {    const faqEntities: any[] = [
      {
        "@type": "Question",
        "name": "How does Clever Humanizer make AI text sound more natural?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Clever Humanizer adjusts token perplexity and sentence burstiness. Instead of uniform robotic rhythm, it reconstructs paragraphs with authentic human cadences, natural idiom shifts, and varied sentence lengths. Results vary by text and detector, and no tool can guarantee a specific detection score.",
        },
      },
      {
        "@type": "Question",
        "name": "Is Clever Humanizer completely free to use without word limits?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. All tools on Clever Humanizer are 100% free with zero limits, zero paywalls, and no account sign-up required.",
        },
      },
      {
        "@type": "Question",
        "name": "My AI-generated text sounds robotic — how do I fix it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Robotic text usually comes from uniform sentence lengths and overused phrases. Vary your sentence rhythm, swap stiff connectors (furthermore, moreover) for natural ones, and read the text aloud. A humanizer tool can automate those patterns — always review the rewritten result.",
        },
      },
      {
        "@type": "Question",
        "name": "How can I check whether my essay sounds like AI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An AI writing detector analyzes sentence-length variety, cliché density, and natural phrasing markers, then highlights sentences that read as robotic. Such scores are heuristic estimates, not official verdicts of any institutional detector.",
        },
      },
    ];

    if (page === "citation") {
      faqEntities.push({
        "@type": "Question",
        "name": "How do I use generated citations to avoid plagiarism flags?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The generator structures references according to official APA 7th, MLA 9th, Chicago 17th, and Harvard style guides. Always verify each generated reference against the official style manual and your institution's requirements before submitting.",
        },
      });
    } else if (page === "expander") {
      faqEntities.push({
        "@type": "Question",
        "name": "How does sentence expansion change readability metrics?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Expanding concise points with causal evidence and varied sentence lengths increases sentence-length variance (burstiness) and readability depth. Results vary by text and detector, and no tool can guarantee a specific detection score.",
        },
      });
    } else if (page === "cleaner") {
      faqEntities.push({
        "@type": "Question",
        "name": "What AI clichés trigger Turnitin and GPTZero?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Overused tokens like 'delve', 'rich tapestry', 'testament to', 'pivotal role', and 'crucial' occur up to 400x more frequently in ChatGPT output than in human writing. Purging them eliminates mathematical markers used by neural classifiers.",
        },
      });
    } else if (page === "diff") {
      faqEntities.push({
        "@type": "Question",
        "name": "What does the diff checker's similarity score mean?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It calculates word-level similarity between your original draft and the rewritten text, showing exactly which words changed. A lower similarity score means more of the wording was altered. This is a text-comparison aid, not a prediction of any detector's verdict.",
        },
      });
    }

    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqEntities,
    });
  }

  // HowTo schema on the humanizer (AEO: answer engines + rich results)
  if (page === "humanizer" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to humanize AI text in 3 steps",
      description: config.description,
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Paste your text",
          text: "Paste your AI-generated draft into the input box.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Choose a tone",
          text: "Pick Conversational, Academic, Professional or Creative tone.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Humanize and copy",
          text: "Click Humanize Text, review the rewritten result and copy it.",
        },
      ],
    });
  }

  script.textContent = JSON.stringify(schemas);
  document.head.appendChild(script);
}
