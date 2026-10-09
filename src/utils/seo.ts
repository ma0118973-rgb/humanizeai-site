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
    description: "Free academic citation generator. Format references in APA 7th, MLA 9th, Chicago, and Harvard styles instantly.",
    canonicalPath: "/citation-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Academic Citation & Bibliography Generator",
  },
  expander: {
    title: "Academic Sentence Expander & Depth Enhancer – Free Writing Tool",
    description: "Expand short, robotic sentences into rich academic prose with high perplexity, causal depth, and diverse sentence burstiness.",
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
  voiceTyping: {
    title: "Free Voice Typing – Speech to Text Online, No Sign-Up",
    description: "Free voice typing tool. Speak and watch your words become text in 11+ languages, right in your browser. No app, no sign-up.",
    canonicalPath: "/voice-typing/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Voice Typing – Speech to Text",
  },
  cvBuilder: {
    title: "Free CV Builder – Make a Professional Resume Online",
    description: "Free CV builder. Fill in your details, see your CV live, then print or save it as PDF. Your data never leaves your device. No sign-up.",
    canonicalPath: "/cv-builder/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "CV Builder – Resume Maker",
  },
  wordCounter: {
    title: "Free Word Counter – Count Words & Characters Online",
    description: "Free word counter. Count words, characters, sentences, paragraphs and reading time live in your browser. No sign-up, nothing uploaded.",
    canonicalPath: "/word-counter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Word Counter",
  },
  characterCounter: {
    title: "Free Character Counter – Count Characters & Check Limits Online",
    description: "Free character counter. Characters with and without spaces, Unicode code points, UTF-16 units and UTF-8 bytes, plus live platform-limit checks and an SMS segment reality check. No sign-up, nothing uploaded.",
    canonicalPath: "/character-counter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Character Counter",
  },
  textToSpeech: {
    title: "Free Text to Speech – Hear Your Text Read Aloud Online",
    description: "Free text to speech. Paste text and hear it read aloud with your device's own voices, right in your browser. No sign-up, nothing uploaded.",
    canonicalPath: "/text-to-speech/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Text to Speech",
  },
  typingTest: {
    title: "Free Typing Speed Test – Check Your WPM & Accuracy Online",
    description: "Free typing speed test. Timed 30s and 60s tests plus 25/50 word modes with live WPM, accuracy and character stats in 11 languages. No sign-up, nothing uploaded.",
    canonicalPath: "/typing-test/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Typing Speed Test",
  },
  caseConverter: {
    title: "Free Case Converter – Change UPPERCASE, lowercase & Title Case",
    description: "Free case converter. Change text to UPPERCASE, lowercase, Sentence case, Capitalized Case, Title Case, alternating or inverse case instantly in your browser. No sign-up, nothing uploaded.",
    canonicalPath: "/case-converter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Case Converter",
  },
  passwordGenerator: {
    title: "Free Password Generator – Strong Random Passwords in Your Browser",
    description: "Free password generator. Create strong random passwords with length and character controls, generated on your own device. No sign-up, nothing uploaded or stored.",
    canonicalPath: "/password-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Password Generator",
  },
  duplicateLines: {
    title: "Free Remove Duplicate Lines – Dedupe Any List Online",
    description: "Free remove duplicate lines tool. Paste a list or open a .txt file, keep the first occurrence, and control case, spaces, blank lines and A–Z sorting. Nothing is uploaded.",
    canonicalPath: "/remove-duplicate-lines/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Remove Duplicate Lines",
  },
  textRepeater: {
    title: "Free Text Repeater – Repeat Text Up to 1,000 Times Online",
    description: "Free text repeater. Repeat any word, sentence or emoji up to 1,000 times with space, new-line, comma or custom separators. Copy or download the result. Nothing is uploaded.",
    canonicalPath: "/text-repeater/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Text Repeater",
  },
  invisibleCharacter: {
    title: "Free Invisible Character – Copy Blank Text & Test Hidden Text",
    description: "Free invisible character tool. Copy zero-width and blank characters, generate blank text, and reveal hidden Unicode in pasted text. Nothing is uploaded.",
    canonicalPath: "/invisible-character/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Invisible Character",
  },
  wordFrequency: {
    title: "Free Word Frequency Counter – Count Repeated Words & Phrases",
    description: "Free word frequency counter. Rank repeated words and 1–3 word phrases with counts, percentages, filters, copy and CSV export. Nothing is uploaded.",
    canonicalPath: "/word-frequency-counter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Word Frequency Counter",
  },
  readingTime: {
    title: "Free Reading Time Calculator – Reading & Speaking Time by Words",
    description: "Free reading time calculator. Paste text to estimate silent reading time and speaking/presentation time with adjustable WPM speeds and pause allowance. Runs locally, nothing uploaded.",
    canonicalPath: "/reading-time-calculator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Reading Time Calculator",
  },
  base64: {
    title: "Free Base64 Encoder & Decoder – UTF-8 Text and URL-Safe Online",
    description: "Free Base64 encoder and decoder. Convert UTF-8 text, emoji and scripts safely, use URL-safe Base64, and decode with clear errors. Local in your browser, nothing uploaded.",
    canonicalPath: "/base64-encoder-decoder/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Base64 Encoder & Decoder",
  },
  slugGenerator: {
    title: "Free Slug Generator – Turn Titles into Clean URL Slugs",
    description: "Free slug generator. Paste a title and get a lowercase URL slug with hyphen or underscore separators, English stop-word removal, accent handling and batch mode. Local in your browser, nothing uploaded.",
    canonicalPath: "/slug-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Slug Generator",
  },
  jsonFormatter: {
    title: "Free JSON Formatter – Beautify, Minify & Validate JSON",
    description: "Free JSON formatter. Beautify with 2 or 4 spaces, minify, validate with honest parser positions, and inspect a collapsible tree. Local JSON.parse in your browser, nothing uploaded.",
    canonicalPath: "/json-formatter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "JSON Formatter",
  },
  loremIpsum: {
    title: "Free Lorem Ipsum Generator – Paragraphs, Sentences & Words",
    description: "Free lorem ipsum generator. Make paragraphs, sentences or exact word counts as plain text, HTML paragraphs or a list, with the classic opening on or off. Placeholder text only, generated locally — nothing uploaded.",
    canonicalPath: "/lorem-ipsum-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Lorem Ipsum Generator",
  },
  daysBetween: {
    title: "Free Days Between Dates Calculator – Count Days & Business Days",
    description: "Free days between dates calculator. Count the total days between two dates — inclusive or exclusive — with weeks, approximate months/years and Monday–Friday business days (public holidays are not subtracted). Add or subtract days from any date. Runs locally, nothing uploaded.",
    canonicalPath: "/days-between-dates/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Days Between Dates Calculator",
  },
  randomNumber: {
    title: "Free Random Number Generator – Numbers, Coin Flip & Dice",
    description: "Free random number generator. Draw numbers in any range with repeats on or off, sorted or unsorted, plus a coin flip and dice roller in the same tool. Uses your browser's cryptographic randomness — nothing is uploaded.",
    canonicalPath: "/random-number-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Random Number Generator",
  },
  invoiceGenerator: {
    title: "Invoice Generator — Free Invoice Maker, Print or PDF",
    description: "Free invoice generator. Add your details, line items, discount and tax, see totals live in your currency, then print or save as PDF. No sign-up, nothing uploaded.",
    canonicalPath: "/invoice-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Invoice Generator",
  },
  imageConverter: {
    title: "Image Converter — JPG to PNG, PNG to JPG, WebP Online Free",
    description: "Free image converter. Convert JPG, PNG and WebP at the same dimensions, batch convert, pick quality and a JPG background colour. Fully local — nothing is uploaded; HEIC usually cannot be read in browsers.",
    canonicalPath: "/image-converter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Image Converter",
  },
  imageToText: {
    title: "Image to Text — Free OCR, Extract Text from JPG, PNG, WebP",
    description: "Free image to text OCR. Extract editable text from JPG, PNG and WebP in your browser with Tesseract OCR. Your image never leaves your device; the language data downloads once from a CDN. No sign-up, no accuracy promises.",
    canonicalPath: "/image-to-text/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Image to Text OCR",
  },
  pdfSplitter: {
    title: "PDF Splitter — Split PDF & Extract Pages Online Free",
    description: "Free PDF splitter. Extract a page range into one PDF or split into separate PDFs per range, entirely in your browser with pdf-lib — your file is never uploaded. Password-protected or damaged PDFs fail with a clear message. No sign-up.",
    canonicalPath: "/pdf-splitter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "PDF Splitter",
  },
  usernameGenerator: {
    title: "Username Generator — Free Username Ideas for Games, Creators & Brands",
    description: "Free username generator. Pick a theme, add an optional seed word, choose numbers, separators and length, then copy favourites. Availability is not checked — verify the name on your platform and check trademarks before use. Fully local, no sign-up.",
    canonicalPath: "/username-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Username Generator",
  },
  imageResizer: {
    title: "Image Resizer — Resize & Crop JPG, PNG, WebP to Exact Size",
    description: "Free image resizer and cropper. Resize by exact pixels or percentage, crop to a ratio, use social and A4 presets, and download JPG, PNG or WebP. Fully local — nothing is uploaded.",
    canonicalPath: "/image-resizer/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Image Resizer & Cropper",
  },
  onlineTimer: {
    title: "Online Timer & Stopwatch — Countdown, Laps & Big Digits",
    description: "Free online timer and stopwatch in one tool. Set a countdown with presets, run a stopwatch with laps and read big digits at a glance. Timestamp-based and fully local; keep the tab visible for the end signal.",
    canonicalPath: "/online-timer/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Online Timer & Stopwatch",
  },
  instagramLineBreak: {
    title: "Free Instagram Line Break Generator – Keep Caption Spacing",
    description: "Free Instagram line break generator. Write captions and bios with real blank lines, protect the spacing with an invisible character, preview and copy in one tap. Nothing is uploaded.",
    canonicalPath: "/instagram-line-break-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Instagram Line Break Generator",
  },
  imageCompressor: {
    title: "Free Image Compressor Online – Compress JPG, PNG, WebP",
    description: "Free image compressor. Compress JPG, PNG & WebP right in your browser. No upload, no signup.",
    canonicalPath: "/image-compressor/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Image Compressor",
  },
  pdfTools: {
    title: "Free PDF Tools Online – Merge PDF & Images to PDF",
    description: "Free PDF tools. Merge multiple PDFs into one, or convert JPG/PNG images to PDF. Runs in your browser — no upload, no signup.",
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
  "ur",
  "de",
  "fr",
  "tr",
  "pt",
  "ja",
  "no",
  "nl",
  "it",
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
  } else if (page === "cvBuilder") {
    title = (t.seo as any).cvBuilderTitle || baseConfig.title;
    description = (t.seo as any).cvBuilderDesc || baseConfig.description;
  } else if (page === "wordCounter") {
    title = (t.seo as any).wordCounterTitle || baseConfig.title;
    description = (t.seo as any).wordCounterDesc || baseConfig.description;
  } else if (page === "characterCounter") {
    title = (t.seo as any).characterCounterTitle || baseConfig.title;
    description = (t.seo as any).characterCounterDesc || baseConfig.description;
  } else if (page === "textToSpeech") {
    title = (t.seo as any).textToSpeechTitle || baseConfig.title;
    description = (t.seo as any).textToSpeechDesc || baseConfig.description;
  } else if (page === "typingTest") {
    title = (t.seo as any).typingTestTitle || baseConfig.title;
    description = (t.seo as any).typingTestDesc || baseConfig.description;
  } else if (page === "caseConverter") {
    title = (t.seo as any).caseConverterTitle || baseConfig.title;
    description = (t.seo as any).caseConverterDesc || baseConfig.description;
  } else if (page === "passwordGenerator") {
    title = (t.seo as any).passwordGeneratorTitle || baseConfig.title;
    description = (t.seo as any).passwordGeneratorDesc || baseConfig.description;
  } else if (page === "duplicateLines") {
    title = (t.seo as any).dedupLinesTitle || baseConfig.title;
    description = (t.seo as any).dedupLinesDesc || baseConfig.description;
  } else if (page === "textRepeater") {
    title = (t.seo as any).textRepeaterTitle || baseConfig.title;
    description = (t.seo as any).textRepeaterDesc || baseConfig.description;
  } else if (page === "invisibleCharacter") {
    title = (t.seo as any).invisibleCharacterTitle || baseConfig.title;
    description = (t.seo as any).invisibleCharacterDesc || baseConfig.description;
  } else if (page === "wordFrequency") {
    title = (t.seo as any).wordFrequencyTitle || baseConfig.title;
    description = (t.seo as any).wordFrequencyDesc || baseConfig.description;
  } else if (page === "readingTime") {
    title = (t.seo as any).readingTimeTitle || baseConfig.title;
    description = (t.seo as any).readingTimeDesc || baseConfig.description;
  } else if (page === "base64") {
    title = (t.seo as any).base64Title || baseConfig.title;
    description = (t.seo as any).base64Desc || baseConfig.description;
  } else if (page === "slugGenerator") {
    title = (t.seo as any).slugGeneratorTitle || baseConfig.title;
    description = (t.seo as any).slugGeneratorDesc || baseConfig.description;
  } else if (page === "jsonFormatter") {
    title = (t.seo as any).jsonFormatterTitle || baseConfig.title;
    description = (t.seo as any).jsonFormatterDesc || baseConfig.description;
  } else if (page === "loremIpsum") {
    title = (t.seo as any).loremIpsumTitle || baseConfig.title;
    description = (t.seo as any).loremIpsumDesc || baseConfig.description;
  } else if (page === "daysBetween") {
    title = (t.seo as any).daysBetweenTitle || baseConfig.title;
    description = (t.seo as any).daysBetweenDesc || baseConfig.description;
  } else if (page === "randomNumber") {
    title = (t.seo as any).randomNumberTitle || baseConfig.title;
    description = (t.seo as any).randomNumberDesc || baseConfig.description;
  } else if (page === "invoiceGenerator") {
    title = (t.seo as any).invoiceGeneratorTitle || baseConfig.title;
    description = (t.seo as any).invoiceGeneratorDesc || baseConfig.description;
  } else if (page === "imageConverter") {
    title = (t.seo as any).imageConverterTitle || baseConfig.title;
    description = (t.seo as any).imageConverterDesc || baseConfig.description;
  } else if (page === "imageToText") {
    title = (t.seo as any).imageToTextTitle || baseConfig.title;
    description = (t.seo as any).imageToTextDesc || baseConfig.description;
  } else if (page === "pdfSplitter") {
    title = (t.seo as any).pdfSplitterTitle || baseConfig.title;
    description = (t.seo as any).pdfSplitterDesc || baseConfig.description;
  } else if (page === "usernameGenerator") {
    title = (t.seo as any).usernameGeneratorTitle || baseConfig.title;
    description = (t.seo as any).usernameGeneratorDesc || baseConfig.description;
  } else if (page === "imageResizer") {
    title = (t.seo as any).imageResizerTitle || baseConfig.title;
    description = (t.seo as any).imageResizerDesc || baseConfig.description;
  } else if (page === "onlineTimer") {
    title = (t.seo as any).onlineTimerTitle || baseConfig.title;
    description = (t.seo as any).onlineTimerDesc || baseConfig.description;
  } else if (page === "instagramLineBreak") {
    title = (t.seo as any).instagramLineBreakTitle || baseConfig.title;
    description = (t.seo as any).instagramLineBreakDesc || baseConfig.description;
  } else if (page === "voiceTyping") {
    title = (t.seo as any).voiceTypingTitle || baseConfig.title;
    description = (t.seo as any).voiceTypingDesc || baseConfig.description;
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
      "description": "Free AI Humanizer and AI Text Pattern Scanner.",
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
        "Free Usage",
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
          "text": "Yes. The tools on Clever Humanizer are free to use, and no account sign-up is required.",
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
