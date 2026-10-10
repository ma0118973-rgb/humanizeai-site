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
  home: {
    title: "ToolVena – Free Online Tools, No Sign-Up",
    description: "ToolVena offers free online tools for writing, text, images, PDFs and study. No sign-up; most tools run privately in your browser, in 12 languages.",
    canonicalPath: "/",
    ogType: "website",
    schemaType: "WebPage",
    toolName: "ToolVena – Free Online Tools",
  },
  humanizer: {
    title: "AI Humanizer – Free AI Text Rewriter for Natural-Sounding Writing",
    description: "Convert ChatGPT, Claude & Gemini text into natural, human-sounding writing with varied sentence rhythm. Free, no sign-up. Results vary and are not guaranteed.",
    canonicalPath: "/ai-humanizer/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "ToolVena AI Text Humanizer",
  },
  detector: {
    title: "AI Content Detector – Text Pattern Scanner & Sentence Heatmap",
    description: "Scan text with ToolVena's own heuristic pattern scanner and sentence-by-sentence heatmap. This is an estimate, not an official detector result.",
    canonicalPath: "/ai-detector/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "AI Content Detector",
  },
  media: {
    title: "Video & Image Media Tools – Crop, Pacing & Metadata",
    description: "Crop edge areas, adjust pacing and work with image metadata in your browser. Use only media you own or have permission to edit.",
    canonicalPath: "/video-tools/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Video & Image Media Tools",
  },
  seo: {
    title: "SEO Meta & Hashtag Generator – Title, Description & Tag Ideas",
    description: "Generate title ideas, meta-description drafts, keyword ideas and hashtags for web pages and short videos. These are writing aids, not ranking guarantees.",
    canonicalPath: "/seo-tools/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "SEO Meta & Hashtag Generator",
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
    description: "Expand short sentences into fuller paragraphs with added detail and varied sentence lengths. Review the result for facts and tone before use.",
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
    description: "Free typing speed test. Timed 30s and 60s tests plus 25/50 word modes with live WPM, accuracy and character stats in 12 languages. No sign-up, nothing uploaded.",
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
  morseCodeTranslator: {
    title: "Morse Code Translator — Text to Morse & Morse to Text, Free",
    description: "Free Morse code translator. Convert text to Morse and Morse back to text instantly, play it as beeps at your own speed, watch the flash, and use the full A–Z and 0–9 chart. Runs 100% in your browser — nothing is uploaded.",
    canonicalPath: "/morse-code-translator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Morse Code Translator",
  },
  onlineNotepad: {
    title: "Online Notepad — Free Notepad with Autosave, Word Count & .txt Download",
    description: "Free online notepad. Open and type instantly with autosave in your browser, titled notes, live word and character counts, copy and .txt download. Notes stay on this device only — nothing is uploaded.",
    canonicalPath: "/online-notepad/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Online Notepad",
  },
  voiceRecorder: {
    title: "Online Voice Recorder — Record, Pause & Download Free, No Upload",
    description: "Free online voice recorder. Record, pause, play back and download your voice right in the browser. Nothing is uploaded — recordings stay on your device. The saved file uses your browser's real format (WebM or MP4), never a fake MP3 promise.",
    canonicalPath: "/online-voice-recorder/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Online Voice Recorder",
  },
  onlineTeleprompter: {
    title: "Online Teleprompter — Free Scrolling Script, Mirror Mode & Countdown",
    description: "Free online teleprompter. Paste your script and read it as smooth scrolling text with adjustable speed, big font, optional 3-2-1 countdown, fullscreen and mirror mode for teleprompter glass. Text only — no recording, no upload.",
    canonicalPath: "/online-teleprompter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Online Teleprompter",
  },
  uuidGenerator: {
    title: "UUID Generator — Free UUID v4, Bulk Generate & Copy",
    description: "Free UUID generator. Create UUID v4 in bulk (up to 100) with uppercase and hyphen options, copy one or copy all. 100% local with Web Crypto — nothing uploaded, no sign-up.",
    canonicalPath: "/uuid-generator/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "UUID Generator",
  },
  timestampConverter: {
    title: "Unix Timestamp Converter — Epoch to Date, UTC & Local, Free",
    description: "Free Unix timestamp converter. Live epoch clock, auto-detect seconds vs milliseconds with the assumption shown, UTC and local time side by side, copyable ISO 8601, and date to timestamp in seconds and milliseconds. Fully local — nothing uploaded.",
    canonicalPath: "/unix-timestamp-converter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Unix Timestamp Converter",
  },
  jsonToCsv: {
    title: "JSON to CSV Converter — Flatten Nested JSON, Safe Export, Free",
    description: "Free JSON to CSV converter. Paste or upload JSON, flatten nested objects into dot-path columns with the rule shown, preview the table, choose comma, semicolon or tab, and download a spreadsheet-safe CSV. Formula-injection warning included. Fully local — nothing uploaded.",
    canonicalPath: "/json-to-csv-converter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "JSON to CSV Converter",
  },
  regexTester: {
    title: "Regex Tester — Test Patterns, Groups & Replace Online, Free",
    description: "Free regex tester. Test a regular expression live with highlighted matches, capture groups, flags and a replace preview, plus common-pattern examples. JavaScript RegExp, fully local — nothing uploaded.",
    canonicalPath: "/regex-tester/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Regex Tester",
  },
  utmLinkBuilder: {
    title: "UTM Link Builder — Build Campaign URLs with Source, Medium & Campaign, Free",
    description: "Free UTM link builder. Add utm_source, utm_medium, utm_campaign, utm_term and utm_content with live preview, correct encoding, copy button and on-device presets. UTMs do not guarantee attribution. Fully local — nothing uploaded.",
    canonicalPath: "/utm-link-builder/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "UTM Link Builder",
  },
  metaChecker: {
    title: "Meta Title & Description Length Checker — Characters, Approx. Pixels & SERP Preview, Free",
    description: "Free meta title and description length checker. Live character counts, canvas-measured approximate pixel width, and desktop + mobile SERP previews. Google often rewrites titles and descriptions, so length is display guidance only — never a ranking guarantee. Fully local — nothing uploaded.",
    canonicalPath: "/meta-title-description-checker/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Meta Title & Description Length Checker",
  },
  urlEncoder: {
    title: "URL Encoder Decoder — Full URL or Single Value, Free",
    description: "Free URL encoder and decoder. Encode a full URL with encodeURI or a single query value with encodeURIComponent, decode either way with plain-language errors for invalid percent-sequences. UTF-8 safe, fully local — nothing uploaded. Encoding is not encryption.",
    canonicalPath: "/url-encoder-decoder/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "URL Encoder / Decoder",
  },
  unitConverter: {
    title: "Unit Converter — Length, Weight, Temperature, Volume & More, Free",
    description: "Free unit converter. Convert length, weight, temperature, volume, area, speed, time, data, pressure and energy with real factors, shown formulas and presets. No currency, no sign-up, nothing uploaded.",
    canonicalPath: "/unit-converter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Unit Converter",
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
  audioToText: {
    title: "Audio to Text Converter – Transcribe MP3, WAV & M4A Free, On Your Device",
    description: "Free audio to text converter. Transcribe MP3, WAV, M4A and MP4 audio into text with a speech model that runs in your browser — your file never leaves your device, no sign-up and no per-minute charge. One small model download on first use, then it works offline. Short, clear clips work best.",
    canonicalPath: "/audio-to-text-converter/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Audio to Text Converter",
  },
  backgroundRemover: {
    title: "Free AI Background Remover",
    description: "Remove photo backgrounds instantly with AI. Get clean transparent PNG cutouts directly in your browser — no uploads, no sign-up. Your images are processed 100% locally on your device for total privacy.",
    canonicalPath: "/background-remover/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Background Remover",
  },
  voiceCloner: {
    title: "AI Voice Cloner – Clone Your Voice Free in Your Browser",
    description: "Free AI voice cloner: hear text in natural voices that run in your browser, or clone your own voice from a 10-second clip. No sign-up.",
    canonicalPath: "/voice-cloner/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "AI Voice Cloner",
  },
  museAiHub: {
    title: "Muse AI Availability Checker – Available in Your Country?",
    description: "Check whether Meta's Muse AI is officially available in your country — date-checked from Meta's own pages, with tokens & plans info and a free prompt helper.",
    canonicalPath: "/muse-ai-availability-checker/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Muse AI Availability Checker",
  },
  cleaner: {
    title: "AI Cliché Checker – Find Repetitive AI-Style Phrases",
    description: "Find common AI-style clichés like 'delve', 'tapestry' and 'testament', review each match in context, and rewrite them in your own words.",
    canonicalPath: "/cliche-cleaner/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "AI Cliché Checker",
  },
  diff: {
    title: "Text Similarity & Diff Checker – Word-by-Word Comparison",
    description: "Compare two versions side by side with a colour-coded word diff and wording-overlap estimate. It does not predict Turnitin or any other service.",
    canonicalPath: "/diff-checker/",
    ogType: "website",
    schemaType: "WebApplication",
    toolName: "Text Similarity & Diff Checker",
  },
  blog: {
    title: "ToolVena Guides – Writing, Text and Online Tool Guides",
    description: "Practical guides to ToolVena's writing, text, image, PDF and everyday online tools, with honest limits and step-by-step help.",
    canonicalPath: "/blog/",
    ogType: "article",
    schemaType: "Article",
  },
  privacy: {
    title: "Privacy Policy – ToolVena",
    description: "Learn how ToolVena handles the information used by its browser tools, optional AI features, analytics and ads.",
    canonicalPath: "/privacy/",
    ogType: "website",
    schemaType: "WebPage",
  },
  terms: {
    title: "Terms of Service – ToolVena",
    description: "Read the Terms of Service for using ToolVena's free web tools, content guidelines, and ethical usage standards.",
    canonicalPath: "/terms/",
    ogType: "website",
    schemaType: "WebPage",
  },
  disclaimer: {
    title: "Disclaimer & Academic Integrity Policy – ToolVena",
    description: "ToolVena's limits for AI writing estimates, research assistance, and academic integrity in educational environments.",
    canonicalPath: "/disclaimer/",
    ogType: "website",
    schemaType: "WebPage",
  },
  about: {
    title: "About Us – ToolVena",
    description: "ToolVena provides free online tools for writing, text, images, PDFs and everyday tasks in 12 languages.",
    canonicalPath: "/about/",
    ogType: "website",
    schemaType: "WebPage",
  },
  contact: {
    title: "Contact & Support – ToolVena",
    description: "Send ToolVena feedback, support questions and guide requests.",
    canonicalPath: "/contact/",
    ogType: "website",
    schemaType: "WebPage",
  },
  notfound: {
    title: "Page not found – ToolVena",
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
  return "https://www.toolvena.com";
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
  "ru",
  "ur-pk",
];

// Urdu script locale (ur-PK): as of phase 2 (2026-10-10) the homepage and
// all 53 tool pages have real /ur-pk/ versions, so hreflang may advertise
// ur-PK on exactly those pages (reciprocal-only rule stays in force:
// no ur-PK alternate is emitted for any page not listed here).
export const URPK_PAGES: ReadonlySet<string> = new Set([
  "home",
  "humanizer",
  "detector",
  "media",
  "seo",
  "citation",
  "expander",
  "summarizer",
  "voiceTyping",
  "cvBuilder",
  "wordCounter",
  "characterCounter",
  "textToSpeech",
  "typingTest",
  "caseConverter",
  "passwordGenerator",
  "duplicateLines",
  "textRepeater",
  "invisibleCharacter",
  "wordFrequency",
  "readingTime",
  "slugGenerator",
  "jsonFormatter",
  "loremIpsum",
  "daysBetween",
  "randomNumber",
  "onlineTimer",
  "invoiceGenerator",
  "imageResizer",
  "imageConverter",
  "imageToText",
  "pdfSplitter",
  "usernameGenerator",
  "morseCodeTranslator",
  "voiceRecorder",
  "onlineNotepad",
  "unitConverter",
  "onlineTeleprompter",
  "uuidGenerator",
  "timestampConverter",
  "jsonToCsv",
  "regexTester",
  "urlEncoder",
  "utmLinkBuilder",
  "metaChecker",
  "instagramLineBreak",
  "imageCompressor",
  "pdfTools",
  "audioToText",
  "backgroundRemover",
  "voiceCloner",
  "museAiHub",
  "cleaner",
  "diff",
]);

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

  if (page === "home") {
    title = (t.seo as any)?.homeTitle || baseConfig.title;
    description = (t.seo as any)?.homeDesc || baseConfig.description;
  } else if (page === "humanizer") {
    title = t.seo?.humanizerTitle ?? baseConfig.title;
    description = t.seo?.humanizerDesc ?? baseConfig.description;
  } else if (page === "detector") {
    title = t.seo?.detectorTitle ?? baseConfig.title;
    description = t.seo?.detectorDesc ?? baseConfig.description;
  } else if (page === "media") {
    title = t.seo?.mediaTitle ?? baseConfig.title;
    description = t.seo?.mediaDesc ?? baseConfig.description;
  } else if (page === "seo") {
    title = t.seo?.seoTitle ?? baseConfig.title;
    description = t.seo?.seoDesc ?? baseConfig.description;
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
  } else if (page === "morseCodeTranslator") {
    title = (t.seo as any).morseCodeTranslatorTitle || baseConfig.title;
    description = (t.seo as any).morseCodeTranslatorDesc || baseConfig.description;
  } else if (page === "onlineNotepad") {
    title = (t.seo as any).onlineNotepadTitle || baseConfig.title;
    description = (t.seo as any).onlineNotepadDesc || baseConfig.description;
  } else if (page === "voiceRecorder") {
    title = (t.seo as any).voiceRecorderTitle || baseConfig.title;
    description = (t.seo as any).voiceRecorderDesc || baseConfig.description;
  } else if (page === "onlineTeleprompter") {
    title = (t.seo as any).onlineTeleprompterTitle || baseConfig.title;
    description = (t.seo as any).onlineTeleprompterDesc || baseConfig.description;
  } else if (page === "uuidGenerator") {
    title = (t.seo as any).uuidGeneratorTitle || baseConfig.title;
    description = (t.seo as any).uuidGeneratorDesc || baseConfig.description;
  } else if (page === "timestampConverter") {
    title = (t.seo as any).timestampConverterTitle || baseConfig.title;
    description = (t.seo as any).timestampConverterDesc || baseConfig.description;
  } else if (page === "jsonToCsv") {
    title = (t.seo as any).jsonToCsvTitle || baseConfig.title;
    description = (t.seo as any).jsonToCsvDesc || baseConfig.description;
  } else if (page === "regexTester") {
    title = (t.seo as any).regexTesterTitle || baseConfig.title;
    description = (t.seo as any).regexTesterDesc || baseConfig.description;
  } else if (page === "urlEncoder") {
    title = (t.seo as any).urlEncoderTitle || baseConfig.title;
    description = (t.seo as any).urlEncoderDesc || baseConfig.description;
  } else if (page === "utmLinkBuilder") {
    title = (t.seo as any).utmLinkBuilderTitle || baseConfig.title;
    description = (t.seo as any).utmLinkBuilderDesc || baseConfig.description;
  } else if (page === "metaChecker") {
    title = (t.seo as any).metaCheckerTitle || baseConfig.title;
    description = (t.seo as any).metaCheckerDesc || baseConfig.description;
  } else if (page === "unitConverter") {
    title = (t.seo as any).unitConverterTitle || baseConfig.title;
    description = (t.seo as any).unitConverterDesc || baseConfig.description;
  } else if (page === "imageResizer") {
    title = (t.seo as any).imageResizerTitle || baseConfig.title;
    description = (t.seo as any).imageResizerDesc || baseConfig.description;
  } else if (page === "onlineTimer") {
    title = (t.seo as any).onlineTimerTitle || baseConfig.title;
    description = (t.seo as any).onlineTimerDesc || baseConfig.description;
  } else if (page === "instagramLineBreak") {
    title = (t.seo as any).instagramLineBreakTitle || baseConfig.title;
    description = (t.seo as any).instagramLineBreakDesc || baseConfig.description;
  } else if (page === "audioToText") {
    title = (t.seo as any).audioToTextTitle || baseConfig.title;
    description = (t.seo as any).audioToTextDesc || baseConfig.description;
  } else if (page === "backgroundRemover") {
    title = (t.seo as any).backgroundRemoverTitle || baseConfig.title;
    description = (t.seo as any).backgroundRemoverDesc || baseConfig.description;
  } else if (page === "voiceCloner") {
    title = (t.seo as any).voiceClonerTitle || baseConfig.title;
    description = (t.seo as any).voiceClonerDesc || baseConfig.description;
  } else if (page === "museAiHub") {
    title = (t.seo as any).museAiHubTitle || baseConfig.title;
    description = (t.seo as any).museAiHubDesc || baseConfig.description;
  } else if (page === "voiceTyping") {
    title = (t.seo as any).voiceTypingTitle || baseConfig.title;
    description = (t.seo as any).voiceTypingDesc || baseConfig.description;
  } else if (page === "blog") {
    if (blogPost) {
      title = `${blogPost.title} – ${t.nav?.humanizerTab ?? ""}`;
      description = blogPost.summary;
    } else {
      title = t.seo?.blogTitle ?? baseConfig.title;
      description = t.seo?.blogDesc ?? baseConfig.description;
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
  document.documentElement.lang = lang === "ur-pk" ? "ur-PK" : lang;
  if (lang === "ur" || lang === "ur-pk") {
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
  setMeta("og:site_name", "ToolVena", true);
  setMeta("og:image", `${origin}/pwa-512x512.png`, true);

  // 6. Twitter / X Cards
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", `${origin}/pwa-512x512.png`);

  // 7. Dynamic Self-Referencing Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement("link");
    canonicalEl.setAttribute("rel", "canonical");
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute("href", canonicalUrl);

  // 8. Dynamic hreflang alternates for all supported languages
  updateHreflangTags(origin, pathWithoutLang, page);

  // 9. Dynamic JSON-LD Structured Data
  updateJsonLd(page, baseConfig, canonicalUrl, origin, blogPost, lang);
}

function updateHreflangTags(origin: string, pathWithoutLang: string, page?: string) {
  // Remove existing hreflang tags
  const existing = document.querySelectorAll('link[rel="alternate"][hreflang]');
  existing.forEach((el) => el.remove());

  // Generate hreflang for all real supported languages. ur-PK is a partial
  // locale (phase 1): only advertise it on pages that truly exist in ur-pk.
  ALL_SUPPORTED_LANGUAGES.forEach((l) => {
    if (l === "ur-pk" && !(page && URPK_PAGES.has(page))) return;
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
  blogPost?: BlogPost | null,
  lang: LanguageCode = "en"
) {
  const existingScript = document.getElementById("toolvena-schema-jsonld");
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement("script");
  script.id = "toolvena-schema-jsonld";
  script.type = "application/ld+json";

  const schemas: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      "name": "ToolVena",
      "url": `${origin}/`,
      "description": "ToolVena offers free online tools for writing, text, images, PDFs and study. No sign-up; most tools run privately in your browser.",
      "inLanguage": ALL_SUPPORTED_LANGUAGES,
      "publisher": { "@id": `${origin}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      "name": "ToolVena",
      "url": `${origin}/`,
      "logo": `${origin}/toolvena-logo.svg`,
      "sameAs": [
        "https://www.pinterest.com/ToolVena/",
        "https://www.tumblr.com/toolvena",
      ],
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
        "@type": blogPost.author && blogPost.author.includes("Editorial Team") ? "Organization" : "Person",
        "name": blogPost.author,
      },
      "publisher": {
        "@type": "Organization",
        "name": "ToolVena",
        "logo": {
          "@type": "ImageObject",
          "url": `${origin}/icon.svg`,
        },
      },
      "datePublished": (blogPost as any).date || undefined,
      "dateModified": (blogPost as any).date || undefined,
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
        "Free online tool",
        "No sign-up required",
      ],
    });
  }

  // FAQPage schema on the homepage — mirrors the visible homepage FAQ.
  // Single source of truth: translations.ts `seo.homeFaqs` per language
  // (the English literals below are only the fallback if a language's
  // block is ever missing; scripts/generate-static-pages.mjs reads the
  // same source for the static homepages).
  if (page === "home") {
    const HOME_FAQ_FALLBACK_EN = [
      { q: "Are ToolVena tools really free?", a: "Yes. Every tool on ToolVena is free to open and use, with no account sign-up. Optional AI-assisted features are clearly labelled where they appear, and their honest limits are written on the tool itself." },
      { q: "Do I need to create an account?", a: "No. Open any tool and use it straight away — there is no account to create, no password to remember and no email gate before a result." },
      { q: "Are my files or text uploaded to a server?", a: "Most ToolVena tools run entirely in your browser, on your own device, so the text and files you work with never leave your device. A few optional AI-assisted features need a server to work; when one does, the tool says so before you use it." },
      { q: "Why is it free — what is the catch?", a: "There is no hidden catch in the tools themselves: because most of them run on your own device's processor instead of an expensive server, they cost very little to keep online. The site is supported by advertising and, in future, optional paid extras that will be clearly labelled." },
      { q: "Which languages is ToolVena available in?", a: "ToolVena is available in 12 languages: English, Spanish, Urdu, German, French, Portuguese, Italian, Turkish, Japanese, Norwegian, Dutch and Russian. Use the language menu at the top of any page, or pick your language below." },
      { q: "Do the tools work on a phone?", a: "Yes. The pages are built mobile-first and most tools work in a phone browser. A few heavier tools (like background removal) download a small model the first time you use them, then run on the device itself." },
    ];
    const homeSeo = (TRANSLATIONS[lang] || TRANSLATIONS.en).seo as
      | { homeFaqs?: { q: string; a: string }[] }
      | undefined;
    const homeFaqs =
      homeSeo?.homeFaqs?.length ? homeSeo.homeFaqs : HOME_FAQ_FALLBACK_EN;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "inLanguage": lang,
      "mainEntity": homeFaqs.map((f) => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
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
        "name": "How does ToolVena make AI text sound more natural?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "ToolVena varies sentence length and rhythm, replaces common AI-style clichés with plainer wording, and adds natural contractions where they fit. Results vary by text, and no tool can guarantee a specific detector score.",
        },
      },
      {
        "@type": "Question",
        "name": "Is ToolVena free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. ToolVena's tools are free to use and no account sign-up is required. The humanizer editor accepts up to 3,000 words at a time, so split longer documents into sections.",
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
        "name": "Which phrases can make writing sound formulaic?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Repeated stock phrases such as 'delve', 'rich tapestry', 'testament to', 'pivotal role' and 'crucial' can make prose feel formulaic. Rewriting them in your own words can make the text clearer. No single phrase proves how a text was written.",
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


  // Homepage: ItemList of popular tools + honest FAQ
  if (page === "home" && !blogPost) {
    const langPrefix = canonicalUrl.replace(origin, "").replace(/\/$/, "");
    const popular: Array<[string, string]> = [
      ["AI Text Humanizer", "/ai-humanizer/"],
      ["Text Summarizer", "/text-summarizer/"],
      ["Word Counter", "/word-counter/"],
      ["Image Compressor", "/image-compressor/"],
      ["PDF Tools", "/pdf-tools/"],
      ["CV Builder", "/cv-builder/"],
      ["Background Remover", "/background-remover/"],
      ["Audio to Text Converter", "/audio-to-text-converter/"],
    ];
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Popular free online tools on ToolVena",
      "itemListElement": popular.map(([name, path], i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "name": name,
        "url": `${origin}${langPrefix}${path}`,
      })),
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Are ToolVena tools really free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The tools on ToolVena are free to open and use, and no account sign-up is required. Optional AI-assisted features are clearly labelled where they appear." } },
        { "@type": "Question", "name": "Do I need to create an account?", "acceptedAnswer": { "@type": "Answer", "text": "No. You can open a tool and use it straight away. There is no account to create and no password to remember." } },
        { "@type": "Question", "name": "Is my text or file uploaded to a server?", "acceptedAnswer": { "@type": "Answer", "text": "Most ToolVena tools run entirely in your browser on your own device, so your text and files stay with you. Where an optional AI feature needs a server, the tool says so before you use it." } },
        { "@type": "Question", "name": "Which languages does ToolVena support?", "acceptedAnswer": { "@type": "Answer", "text": "ToolVena is available in 12 languages, including English, Spanish, Urdu, German, French, Turkish, Portuguese, Japanese, Norwegian, Dutch, Italian and Russian. Use the language menu at the top of any page." } },
      ],
    });
  }

  // Unix Timestamp Converter: FAQ + HowTo (unit assumption + UTC/local honesty)
  if (page === "timestampConverter" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this Unix timestamp converter free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. The live epoch clock, timestamp-to-date and date-to-timestamp conversions all run in your browser." } },
        { "@type": "Question", name: "How does it know seconds from milliseconds?", acceptedAnswer: { "@type": "Answer", text: "In Auto mode, values of 1,000,000,000,000 or more are treated as milliseconds and smaller values as seconds — the rule most current-era timestamps follow. The assumed unit is always displayed, and you can override it with the Seconds / Milliseconds selector." } },
        { "@type": "Question", name: "Why do UTC and my local time differ?", acceptedAnswer: { "@type": "Answer", text: "A Unix timestamp identifies one instant in UTC. Your local line renders that same instant in your device timezone, so the clock reading differs by your UTC offset (and daylight saving). Neither line is wrong; they are two readings of one instant." } },
        { "@type": "Question", name: "What does the date picker assume?", acceptedAnswer: { "@type": "Answer", text: "A date-time picker value has no timezone, so you choose As my local time or As UTC. The outputs (seconds, milliseconds and ISO 8601) follow that choice; mixing the two up is the usual cause of results that are wrong by a few hours." } },
        { "@type": "Question", name: "Is anything I paste uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. Every calculation happens in your browser tab with the JavaScript Date object. Nothing is uploaded, stored on a server or shared, and closing the tab forgets everything." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert a Unix timestamp in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste the timestamp", text: "Paste your epoch value. Keep Auto-detect on unless you know the unit; the page states whether it treated the value as seconds or milliseconds." },
        { "@type": "HowToStep", position: 2, name: "Read UTC and local side by side", text: "Compare the UTC line with your local-time line and copy the ISO 8601 (UTC) value when you need an unambiguous string for logs, APIs or databases." },
        { "@type": "HowToStep", position: 3, name: "Or go the other way", text: "Pick a date and time, choose As my local time or As UTC, and copy the resulting seconds or milliseconds." },
      ],
    });
  }

  // Unit Converter: FAQ + HowTo (honest, no currency, safety note)
  if (page === "unitConverter" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is this unit converter free?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. It is free with no sign-up. Ten categories — length, weight, temperature, volume, area, speed, time, data storage, pressure and energy — convert instantly in your browser." },
        },
        {
          "@type": "Question",
          "name": "Why is there no currency converter?",
          "acceptedAnswer": { "@type": "Answer", "text": "Exchange rates change every day, so a money conversion without live rates would be a guess dressed up as an answer. This tool deliberately excludes currency; use your bank or a live-rate service for money." },
        },
        {
          "@type": "Question",
          "name": "How accurate are the conversions?",
          "acceptedAnswer": { "@type": "Answer", "text": "They use established SI and NIST factors — 1 inch is exactly 2.54 cm and 1 pound is exactly 0.45359237 kg — and the formula is shown with every result. Results are rounded to sensible significant figures for everyday use." },
        },
        {
          "@type": "Question",
          "name": "Can I use these results for medical, engineering or aviation work?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. These are everyday conversions for school, cooking, travel and shopping. For medical dosing, engineering sign-off, aviation or anything safety-critical, verify professionally with the proper instruments." },
        },
        {
          "@type": "Question",
          "name": "Is anything I type uploaded or stored?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. Every calculation happens in your browser tab. Nothing is uploaded, stored on a server or shared by this tool." },
        },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert units in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Pick a category", text: "Choose length, weight, temperature, volume, area, speed, time, data storage, pressure or energy." },
        { "@type": "HowToStep", position: 2, name: "Enter a value and units", text: "Type your value, choose the From and To units (or search the unit lists), and read the instant result with its formula." },
        { "@type": "HowToStep", position: 3, name: "Swap or copy", text: "Use the swap button to reverse the conversion, or copy the result. Popular school, cooking and travel presets are one tap away." },
      ],
    });
  }

  // Online Teleprompter: FAQ + HowTo (text only, mirror warning, no recording)
  if (page === "onlineTeleprompter" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this online teleprompter free? Does it record me?", acceptedAnswer: { "@type": "Answer", text: "Free with no sign-up. It only scrolls text: it does not record video or audio, use your camera, or save your script anywhere. Record with a camera app you already trust while this page scrolls." } },
        { "@type": "Question", name: "What is mirror mode for?", acceptedAnswer: { "@type": "Answer", text: "Mirror mode flips the text for physical teleprompter glass, so it reads correctly in the reflection. On a normal screen the flipped text looks reversed, which is expected; turn it off for direct reading." } },
        { "@type": "Question", name: "How does the speaking-time estimate work?", acceptedAnswer: { "@type": "Answer", text: "Your word count is divided by a calm speaking pace of 150 words per minute, the same convention as this site's reading-time tools. Your real pace will differ, so rehearse once and adjust the scroll speed." } },
        { "@type": "Question", name: "Can I pause the scrolling without the mouse?", acceptedAnswer: { "@type": "Answer", text: "Yes. Press the Spacebar outside the script box to play or pause, the arrow keys to change speed, and use fullscreen for a distraction-free stage." } },
        { "@type": "Question", name: "Is my script uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. Your script is processed only in this browser tab and is gone when you close it." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to read from an online teleprompter in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste your script", text: "Type or paste your script and check the word count and estimated speaking time below the box." },
        { "@type": "HowToStep", position: 2, name: "Set speed, size and countdown", text: "Choose a scroll speed slightly slower than comfortable, set a font you can read at your distance, and keep the 3-2-1 countdown on if you want a breath before starting. Turn on mirror mode only for teleprompter glass." },
        { "@type": "HowToStep", position: 3, name: "Go fullscreen and read", text: "Enter fullscreen, press Play (or the Spacebar), and read. Space pauses, arrow keys adjust speed, and Back to top resets for the next take." },
      ],
    });
  }

  // UUID Generator: FAQ + HowTo (v4 only, honest collision note, fully local)
  if (page === "uuidGenerator" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this UUID generator free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Generate one UUID v4 or a bulk list of up to 100, with uppercase and hyphen options, and copy one or copy all." } },
        { "@type": "Question", name: "Can two generated UUIDs ever be the same?", acceptedAnswer: { "@type": "Answer", text: "A version 4 UUID carries 122 random bits, so a duplicate is astronomically unlikely — you would need to generate an enormous number before a collision became plausible. It is not mathematically impossible, and this page does not promise otherwise." } },
        { "@type": "Question", name: "Why only version 4? What about version 1?", acceptedAnswer: { "@type": "Answer", text: "Version 4 is purely random, which is what most databases, APIs and tests need. Version 1 embeds time and machine-style identifiers that can leak information, so this tool deliberately does not generate it." } },
        { "@type": "Question", name: "Are my UUIDs uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. UUIDs are generated on your device with the Web Crypto API (crypto.randomUUID, with a crypto.getRandomValues fallback). Nothing is uploaded, stored on a server or shared, and closing the tab forgets everything." } },
        { "@type": "Question", name: "Can I use a UUID as a password or secret token?", acceptedAnswer: { "@type": "Answer", text: "No. A UUID is an identifier, not a secret. Use a password generator and a reputable password manager for credentials, and proper token systems for security-sensitive values." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to generate a UUID v4 in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose how many", text: "Set the bulk count from 1 to 100. Five is a handy default for tests and fixtures." },
        { "@type": "HowToStep", position: 2, name: "Pick the format", text: "Keep lowercase with hyphens (8-4-4-4-12) for the standard form, switch on UPPERCASE if your system expects it, or turn hyphens off for the compact 32-character form." },
        { "@type": "HowToStep", position: 3, name: "Copy one or copy all", text: "Use the copy button on a single row, or Copy all to take the whole list one per line. Press Generate whenever you need a fresh set." },
      ],
    });
  }

  // JSON to CSV Converter: FAQ + HowTo (flattening rule + formula-injection safety)
  if (page === "jsonToCsv" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this JSON to CSV converter free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Paste or upload JSON, preview the flattened table, choose comma, semicolon or tab, then download or copy the CSV." } },
        { "@type": "Question", name: "How are nested objects and arrays flattened?", acceptedAnswer: { "@type": "Answer", text: "Nested objects become dot-path columns, so address.city is one column. A list of plain values is joined with '; ' inside one cell. A list that contains objects stays as compact JSON text in one cell, because one JSON record always stays one CSV row. There is no single correct flattening, so the rule is printed on the page." } },
        { "@type": "Question", name: "Why do some fields start with an apostrophe in the CSV?", acceptedAnswer: { "@type": "Answer", text: "That is Safe export. A cell beginning with =, +, - or @ can be treated as a formula by Excel or Google Sheets (formula injection). Safe export prefixes such fields with an apostrophe so they open as plain text. Turn it off only if you truly want those fields to act as formulas." } },
        { "@type": "Question", name: "What JSON shapes can it convert?", acceptedAnswer: { "@type": "Answer", text: "An array of objects converts best: one object becomes one row. A single object becomes one row. A list of plain values becomes one 'value' column. A single number, text value or true/false cannot become a table and returns a plain-language explanation instead." } },
        { "@type": "Question", name: "Is my JSON uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. The JSON is parsed in your browser tab with JSON.parse and converted locally. Nothing is uploaded, stored on a server or shared, and closing the tab forgets it. Still, keep real passwords and API keys out of every web tool." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert JSON to CSV in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste or upload your JSON", text: "Paste an array of objects or open a .json file. Read any plain-language shape note — a single object converts as one row." },
        { "@type": "HowToStep", position: 2, name: "Check the flattening and safety warnings", text: "Review the preview table: nested objects are dot-path columns, lists of values are joined with '; '. If fields begin with =, +, - or @, keep Safe export on so a spreadsheet cannot run them as formulas." },
        { "@type": "HowToStep", position: 3, name: "Choose a delimiter and download", text: "Pick comma, semicolon or tab for your target system, keep or remove the header row, then download the .csv or copy the CSV text." },
      ],
    });
  }

  // Regex Tester: FAQ + HowTo (JavaScript flavour, honest caps, slow-pattern guidance)
  if (page === "regexTester" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this regex tester free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Write a pattern, toggle the g/i/m/s/u/y flags, and see highlighted matches, positions, captured groups and a replace preview. A small library of common patterns is included as starting points." } },
        { "@type": "Question", name: "Which regex flavour does it use?", acceptedAnswer: { "@type": "Answer", text: "JavaScript (ECMAScript), the RegExp engine in your browser. Regex dialects differ — lookbehind, named groups, Unicode behaviour and even what \d matches can vary in Python, PHP, Java or PCRE. Treat a pass here as a strong draft and run the final check in the engine your code actually uses." } },
        { "@type": "Question", name: "Why did matching stop, and why can a pattern be slow?", acceptedAnswer: { "@type": "Answer", text: "To keep the tab responsive there are printed caps: patterns up to 1,000 characters, test text up to 20,000 characters, and matching stops after 1,000 matches. Separately, nested quantifiers such as (a+)+ can cause catastrophic backtracking and make any regex engine grind; test risky patterns on a few lines first." } },
        { "@type": "Question", name: "Can I use the built-in patterns as validators?", acceptedAnswer: { "@type": "Answer", text: "They are teaching examples and starting points, not guarantees. The IPv4 example accepts 999.1.1.1, and no email regex can replace the receiving server's own decision. For validation people depend on, add real checks behind the regex." } },
        { "@type": "Question", name: "Is my pattern or text uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. Matching runs locally with the RegExp engine in your browser tab. Nothing is uploaded, stored on a server or shared, and closing the tab forgets everything." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to test a regular expression in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Write the pattern and set flags", text: "Type your regular expression and toggle g, i, m, s, u and y as needed. Each flag carries a one-line plain-language explanation." },
        { "@type": "HowToStep", position: 2, name: "Paste test text and read the matches", text: "Paste text that resembles your real data, including a deliberate near-miss. Read the highlighted preview and the match list: position, matched text, numbered and named groups." },
        { "@type": "HowToStep", position: 3, name: "Preview the replacement", text: "Type a replacement using $1 for numbered groups or $<name> for named groups, check the preview, and copy the result. Without the g flag only the first match is replaced." },
      ],
    });
  }

  // UTM Link Builder: FAQ + HowTo (naming consistency, personal-data warning, no attribution guarantee)
  if (page === "utmLinkBuilder" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this UTM link builder free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Build a tagged campaign URL with source, medium, campaign and optional term and content, preview it live and copy it in one click. Presets are saved only on your device." } },
        { "@type": "Question", name: "Which UTM parameters should every link have?", acceptedAnswer: { "@type": "Answer", text: "At minimum utm_source (where the traffic comes from), utm_medium (the kind of channel) and utm_campaign (the specific campaign). utm_term is mainly for paid search keywords and utm_content separates versions that share one campaign, such as two buttons in one email." } },
        { "@type": "Question", name: "Why must UTM values be lowercase and consistent?", acceptedAnswer: { "@type": "Answer", text: "Most analytics tools are case-sensitive, so Facebook and facebook are counted as two different sources, and one channel written three ways becomes three separate report rows. Pick lowercase spellings once, use hyphens or underscores instead of spaces, and reuse the exact same values — presets on this page exist for that habit." } },
        { "@type": "Question", name: "Can I put a name or email address in a UTM value?", acceptedAnswer: { "@type": "Answer", text: "Never. Links are forwarded, screenshotted, logged and pasted into chats, so personal data inside a URL travels with it. Label the campaign, never the person." } },
        { "@type": "Question", name: "Does a correct UTM link guarantee my analytics will show the campaign?", acceptedAnswer: { "@type": "Answer", text: "No. Analytics must be installed on the landing page, consent mode or blockers can prevent recording, a redirect can drop the query string, and some platforms strip parameters when a link is shared onward. UTMs also belong only on external links; tagging links inside your own site overwrites the visitor's real source." } },
        { "@type": "Question", name: "Is anything I type uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. The link is built in your browser tab and values are encoded with encodeURIComponent. Saved presets stay in this browser on this device and are never uploaded or shared." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to build a UTM campaign link in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Enter the destination and core values", text: "Paste the full destination URL including https://, then enter utm_source, utm_medium and utm_campaign in lowercase with one consistent spelling." },
        { "@type": "HowToStep", position: 2, name: "Add optional term and content", text: "Use utm_term for paid search keywords and utm_content to tell apart versions in the same campaign, then check the live final-URL preview." },
        { "@type": "HowToStep", position: 3, name: "Copy, save a preset and click-test", text: "Copy the tagged link, save the naming as an on-device preset for next time, and click the link once to confirm the parameters survive to the final page." },
      ],
    });
  }

  // Meta Title & Description Length Checker: FAQ + HowTo (display guidance only, Google rewrites, no ranking guarantee)
  if (page === "metaChecker" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this meta title and description length checker free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Type a title and a description and see live character counts, an approximate pixel-width estimate and desktop and mobile SERP previews. Everything runs in your browser tab." } },
        { "@type": "Question", name: "Why show pixels as well as characters?", acceptedAnswer: { "@type": "Answer", text: "Letters are not the same width: WWW is far wider than iii, so two texts with the same character count can take up very different space in a search result. Google truncates closer to display width than to a universal character number, which is why this checker measures both. The pixel figure is an approximation, measured here with canvas text measurement at common SERP sizes, and is labelled approximate." } },
        { "@type": "Question", name: "What length is \"good\"?", acceptedAnswer: { "@type": "Answer", text: "Only display guidance can be given. Common editing ranges are about 30–60 characters for a title and about 120–160 characters for a description on desktop, with less room on mobile. Staying inside a band makes truncation less likely; it does not improve ranking, and Google sets no fixed character limit." } },
        { "@type": "Question", name: "Will Google show exactly what I typed?", acceptedAnswer: { "@type": "Answer", text: "Often not. Google frequently rewrites titles and replaces descriptions with a snippet taken from page content, depending on the query and device. No checker can guarantee how a result will display or rank. Write a clear title and description, put the important words first, and treat any preview as a writing aid." } },
        { "@type": "Question", name: "Should I add meta keywords?", acceptedAnswer: { "@type": "Answer", text: "No. The old meta keywords tag is not used by Google for ranking and this checker deliberately does not ask for it. Focus on an accurate title, a helpful description and page content that matches them." } },
        { "@type": "Question", name: "Is anything I type uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. Counting and pixel measurement happen in your browser tab. Nothing is uploaded, stored on a server or shared, and closing the tab forgets everything." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to check a meta title and description in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Enter your title and description", text: "Type or paste the exact title and meta description you plan to use, plus your site name and URL for a realistic preview." },
        { "@type": "HowToStep", position: 2, name: "Read characters, approximate pixels and guidance bands", text: "Check the live character counts and the approximate pixel widths against the desktop and mobile guidance bands. Wide letters truncate sooner at the same character count." },
        { "@type": "HowToStep", position: 3, name: "Front-load, compare previews and copy", text: "Put the important words first so they survive on mobile, compare the desktop and mobile previews, adjust until both read completely, then copy each field into your page or CMS." },
      ],
    });
  }

  // URL Encoder / Decoder: FAQ + HowTo (two modes, honest "not encryption" note, fully local)
  if (page === "urlEncoder" && !blogPost) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", name: "Is this URL encoder and decoder free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Encode or decode a full URL or a single query value, copy the result or swap it back — all in your browser." } },
        { "@type": "Question", name: "What is the difference between Full URL and Single value mode?", acceptedAnswer: { "@type": "Answer", text: "Full URL mode (encodeURI/decodeURI) keeps the link structure characters : / ? & = # working and only fixes unsafe characters, so a complete link stays a link. Single value mode (encodeURIComponent/decodeURIComponent) encodes those characters too (%26, %3D, %3F), which is what one query value needs so its own & or = cannot split the link into stray parameters." } },
        { "@type": "Question", name: "Why did decoding say the percent-encoding is invalid?", acceptedAnswer: { "@type": "Answer", text: "Somewhere in the text there is a broken percent sign: a trailing %, a short sequence like %2, a non-hex sequence like %ZZ, or encoded bytes that do not form valid UTF-8 text. The tool stops and explains instead of guessing a half-decoded result; fix or remove that sequence and the decoded text appears." } },
        { "@type": "Question", name: "Is URL encoding a way to hide or protect data?", acceptedAnswer: { "@type": "Answer", text: "No. Percent-encoding is formatting for transport: anyone can decode %26 back into & instantly, with this tool. It is not encryption and gives no security, so never place a password, API key, token or secret in a URL expecting encoding to protect it." } },
        { "@type": "Question", name: "Is anything I paste uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. Conversion runs in your browser tab with the built-in encodeURI/encodeURIComponent functions. Nothing is uploaded, stored on a server or shared, and closing the tab forgets everything." } },
      ],
    });
    schemas.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to encode or decode a URL in 3 steps",
      description: config.description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose Full URL or Single value", text: "Pick Full URL mode for a complete link whose : / ? & = structure must keep working, or Single value mode for one query value, where & = ? must be encoded as %26 %3D %3F." },
        { "@type": "HowToStep", position: 2, name: "Paste and check the live result", text: "Paste your link or value and choose Encode or Decode; the result updates as you type and the exact browser function being used is shown. An invalid percent-sequence produces a plain-language error instead of a silent blank." },
        { "@type": "HowToStep", position: 3, name: "Copy, or swap and reverse", text: "Copy the result into your link or code, or use Swap & reverse to feed it back and flip direction as a round-trip check. Encode any value exactly once — encoding an encoded value double-encodes it." },
      ],
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
