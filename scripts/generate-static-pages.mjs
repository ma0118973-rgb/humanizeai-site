// Generates static per-language, per-route HTML files AFTER `vite build`.
// Why: the app is a client-side SPA — crawlers (and no-JS fetches) only see
// dist/index.html's generic head (wrong canonical, lang="en" everywhere,
// one title for all tools). This script emits dist/<lang>/<route>/index.html
// with correct <html lang>, self-referencing canonical, full hreflang set,
// per-tool titles/descriptions and honest JSON-LD, so every URL is SEO-correct
// even before the JS hydrates.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

/** Extract a balanced {...} or [...] literal starting at index `i`, skipping string literals. */
function extractBalanced(src, i) {
  const open = src[i];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let j = i;
  let str = null; // current string delimiter: ' " `
  while (j < src.length) {
    const ch = src[j];
    if (str) {
      if (ch === "\\") { j += 2; continue; }
      if (ch === str) str = null;
    } else if (ch === '"' || ch === "'" || ch === "`") {
      str = ch;
    } else if (ch === open) {
      depth++;
    } else if (ch === close) {
      depth--;
      if (depth === 0) return src.slice(i, j + 1);
    }
    j++;
  }
  throw new Error("Unbalanced literal in source");
}

function loadConst(tsPath, constName) {
  const raw = fs.readFileSync(tsPath, "utf8");
  const marker = `export const ${constName}`;
  let i = raw.indexOf(marker);
  if (i === -1) throw new Error(`const ${constName} not found in ${tsPath}`);
  i = raw.indexOf("=", i);
  // find first { or [
  while (raw[i] !== "{" && raw[i] !== "[") i++;
  const literal = extractBalanced(raw, i);
  return new Function(`return (${literal});`)();
}

// F5 note (2026-10-10): per-language dictionaries now live in
// src/data/i18n/<lang>.ts ("the static generator reads this file directly").
// Assemble TRANSLATIONS from those pure-literal DICT exports.
const TRANSLATIONS = (() => {
  const dir = path.join(root, "src/data/i18n");
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".ts")) continue;
    out[f.slice(0, -3)] = loadConst(path.join(dir, f), "DICT");
  }
  return out;
})();
const BLOG_POSTS = loadConst(path.join(root, "src/data/blogArticles.ts"), "BLOG_POSTS");

// F5: BLOG_POSTS is metadata-only now; article bodies live in
// src/data/blogContent/<lang>.ts (post id -> paragraphs). Merge them back
// so JSON-LD articleBody and the F6 prerender see the full, real text.
{
  const dir = path.join(root, "src/data/blogContent");
  const byLang = new Map();
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".ts")) continue;
    byLang.set(f.slice(0, -3), loadConst(path.join(dir, f), "BLOG_CONTENT"));
  }
  for (const p of BLOG_POSTS) {
    if (!p) continue;
    const m = byLang.get(p.language);
    if (m && Array.isArray(m[p.id])) p.content = m[p.id];
  }
}

// Homepage hero strings the app itself renders (verbatim — see F6 note).
const HOME_COPY = loadConst(path.join(root, "src/data/homeCopy.ts"), "HOME_COPY");

// Same placeholder fill the homepage applies at runtime ({n} tools,
// {langs} languages, {q}/{cat} empty on first render). ROUTES/LANGUAGES
// resolve at call time (emitFile runs after all top-level consts exist).
// `langCount` overrides the language figure: ur-pk shows 13, hi shows 14
// (the generator's LANGUAGES list excludes the two partial locales).
function fillHomeCopy(s, langCount = LANGUAGES.length + 1) {
  // Mirror HomePage's runtime catalog exactly: TOOLS minus the two entries
  // its canonicalPath filter drops (base64, museAiHub) = 52.
  const nonTools = new Set(["home", "blog", "about", "privacy", "terms", "disclaimer", "contact", "notfound", "base64", "museAiHub"]);
  const toolCount = ROUTES.filter(([p]) => !nonTools.has(p)).length;
  return String(s || "")
    .replaceAll("{n}", String(toolCount))
    .replaceAll("{langs}", String(langCount))
    .replaceAll("{q}", "")
    .replaceAll("{cat}", "");
}

// Blog articles are single-language originals — each post exists only in its
// own language under its own localized slug, so there is normally nothing to
// cross-link. The one exception: verified translation twins — same article
// `id` published in another language. Map "lang|slug" -> sibling posts so
// emitFile/sitemap can give those few pages a true reciprocal hreflang set.
const BLOG_TWIN_CLUSTERS = (() => {
  const byId = new Map();
  for (const p of BLOG_POSTS) {
    if (!p || !p.id || !p.language || !p.slug) continue;
    if (!byId.has(p.id)) byId.set(p.id, []);
    byId.get(p.id).push(p);
  }
  const map = new Map();
  for (const group of byId.values()) {
    if (group.length > 1 && new Set(group.map((p) => p.language)).size > 1) {
      for (const p of group) map.set(`${p.language}|${p.slug}`, group);
    }
  }
  return map;
})();

const LANGUAGES = ["en", "es", "ur", "de", "fr", "pt", "tr", "ja", "no", "nl", "it", "ru"];

// Urdu script locale: lives at /ur-pk/ (hreflang "ur-PK"). Phase 2
// (2026-10-10) covers the homepage and all 53 tool routes below. It still
// must NOT join LANGUAGES above — blog articles and compliance pages have
// no ur-pk versions yet, so those routes must not generate or advertise
// ur-PK alternates (reciprocal rule).
const URPK_LANG = "ur-pk";
const URPK_HREFLANG = "ur-PK";
const URPK_ROUTE_PATHS = new Set(["/", "/ai-humanizer/", "/ai-detector/", "/video-tools/", "/seo-tools/", "/citation-generator/", "/sentence-expander/", "/text-summarizer/", "/voice-typing/", "/cv-builder/", "/word-counter/", "/character-counter/", "/text-to-speech/", "/typing-test/", "/case-converter/", "/password-generator/", "/remove-duplicate-lines/", "/text-repeater/", "/invisible-character/", "/word-frequency-counter/", "/reading-time-calculator/", "/base64-encoder-decoder/", "/slug-generator/", "/json-formatter/", "/lorem-ipsum-generator/", "/days-between-dates/", "/random-number-generator/", "/online-timer/", "/invoice-generator/", "/image-resizer/", "/image-converter/", "/image-to-text/", "/pdf-splitter/", "/username-generator/", "/morse-code-translator/", "/online-voice-recorder/", "/online-notepad/", "/unit-converter/", "/online-teleprompter/", "/uuid-generator/", "/unix-timestamp-converter/", "/json-to-csv-converter/", "/regex-tester/", "/url-encoder-decoder/", "/utm-link-builder/", "/meta-title-description-checker/", "/instagram-line-break-generator/", "/image-compressor/", "/pdf-tools/", "/audio-to-text-converter/", "/background-remover/", "/voice-cloner/", "/muse-ai-availability-checker/", "/cliche-cleaner/", "/diff-checker/"]);

// Hindi locale: lives at /hi/ (hreflang "hi"). Phase 1 (2026-10-10) covers
// the homepage and all 53 tool routes below — the same route set as ur-pk.
// Like ur-pk it must NOT join LANGUAGES above: blog articles and compliance
// pages have no hi versions yet, so those routes must not generate or
// advertise hi alternates (reciprocal rule).
const HI_LANG = "hi";
const HI_HREFLANG = "hi";
const HI_ROUTE_PATHS = new Set(["/", "/ai-humanizer/", "/ai-detector/", "/video-tools/", "/seo-tools/", "/citation-generator/", "/sentence-expander/", "/text-summarizer/", "/voice-typing/", "/cv-builder/", "/word-counter/", "/character-counter/", "/text-to-speech/", "/typing-test/", "/case-converter/", "/password-generator/", "/remove-duplicate-lines/", "/text-repeater/", "/invisible-character/", "/word-frequency-counter/", "/reading-time-calculator/", "/base64-encoder-decoder/", "/slug-generator/", "/json-formatter/", "/lorem-ipsum-generator/", "/days-between-dates/", "/random-number-generator/", "/online-timer/", "/invoice-generator/", "/image-resizer/", "/image-converter/", "/image-to-text/", "/pdf-splitter/", "/username-generator/", "/morse-code-translator/", "/online-voice-recorder/", "/online-notepad/", "/unit-converter/", "/online-teleprompter/", "/uuid-generator/", "/unix-timestamp-converter/", "/json-to-csv-converter/", "/regex-tester/", "/url-encoder-decoder/", "/utm-link-builder/", "/meta-title-description-checker/", "/instagram-line-break-generator/", "/image-compressor/", "/pdf-tools/", "/audio-to-text-converter/", "/background-remover/", "/voice-cloner/", "/muse-ai-availability-checker/", "/cliche-cleaner/", "/diff-checker/"]);

// [pageId, canonicalPath] — canonicalPath mirrors SEO_CONFIGS in src/utils/seo.ts
const ROUTES = [
  ["humanizer", "/ai-humanizer/"],
  ["detector", "/ai-detector/"],
  ["media", "/video-tools/"],
  ["seo", "/seo-tools/"],
  ["citation", "/citation-generator/"],
  ["expander", "/sentence-expander/"],
  ["summarizer", "/text-summarizer/"],
  ["voiceTyping", "/voice-typing/"],
  ["cvBuilder", "/cv-builder/"],
  ["wordCounter", "/word-counter/"],
  ["characterCounter", "/character-counter/"],
  ["textToSpeech", "/text-to-speech/"],
  ["typingTest", "/typing-test/"],
  ["caseConverter", "/case-converter/"],
  ["passwordGenerator", "/password-generator/"],
  ["duplicateLines", "/remove-duplicate-lines/"],
  ["textRepeater", "/text-repeater/"],
  ["invisibleCharacter", "/invisible-character/"],
  ["wordFrequency", "/word-frequency-counter/"],
  ["readingTime", "/reading-time-calculator/"],
  ["base64", "/base64-encoder-decoder/"],
  ["slugGenerator", "/slug-generator/"],
  ["jsonFormatter", "/json-formatter/"],
  ["loremIpsum", "/lorem-ipsum-generator/"],
  ["daysBetween", "/days-between-dates/"],
  ["randomNumber", "/random-number-generator/"],
  ["onlineTimer", "/online-timer/"],
  ["invoiceGenerator", "/invoice-generator/"],
  ["imageResizer", "/image-resizer/"],
  ["imageConverter", "/image-converter/"],
  ["imageToText", "/image-to-text/"],
  ["pdfSplitter", "/pdf-splitter/"],
  ["usernameGenerator", "/username-generator/"],
  ["morseCodeTranslator", "/morse-code-translator/"],
  ["voiceRecorder", "/online-voice-recorder/"],
  ["onlineNotepad", "/online-notepad/"],
  ["unitConverter", "/unit-converter/"],
  ["onlineTeleprompter", "/online-teleprompter/"],
  ["uuidGenerator", "/uuid-generator/"],
  ["timestampConverter", "/unix-timestamp-converter/"],
  ["jsonToCsv", "/json-to-csv-converter/"],
  ["regexTester", "/regex-tester/"],
  ["urlEncoder", "/url-encoder-decoder/"],
  ["utmLinkBuilder", "/utm-link-builder/"],
  ["metaChecker", "/meta-title-description-checker/"],
  ["instagramLineBreak", "/instagram-line-break-generator/"],
  ["imageCompressor", "/image-compressor/"],
  ["pdfTools", "/pdf-tools/"],
  ["audioToText", "/audio-to-text-converter/"],
  ["backgroundRemover", "/background-remover/"],
  ["voiceCloner", "/voice-cloner/"],
  ["museAiHub", "/muse-ai-availability-checker/"],
  ["cleaner", "/cliche-cleaner/"],
  ["diff", "/diff-checker/"],
  ["blog", "/blog/"],
  ["privacy", "/privacy/"],
  ["terms", "/terms/"],
  ["disclaimer", "/disclaimer/"],
  ["about", "/about/"],
  ["contact", "/contact/"],
];

// English fallback meta for compliance pages (matches SEO_CONFIGS in seo.ts)
const HOME_META = ["ToolVena – Free Online Tools, No Sign-Up", "ToolVena offers free online tools for writing, text, images, PDFs and study. No sign-up; most tools run privately in your browser, in 12 languages."];

// English fallback for the homepage FAQPage schema. The live source of
// truth is translations.ts `seo.homeFaqs` per language; this only applies
// if a language's block is ever missing.
const HOME_FAQ_FALLBACK = [
  { q: "Are ToolVena tools really free?", a: "Yes. Every tool on ToolVena is free to open and use, with no account sign-up. Optional AI-assisted features are clearly labelled where they appear, and their honest limits are written on the tool itself." },
  { q: "Do I need to create an account?", a: "No. Open any tool and use it straight away — there is no account to create, no password to remember and no email gate before a result." },
  { q: "Are my files or text uploaded to a server?", a: "Most ToolVena tools run entirely in your browser, on your own device, so the text and files you work with never leave your device. A few optional AI-assisted features need a server to work; when one does, the tool says so before you use it." },
  { q: "Why is it free — what is the catch?", a: "There is no hidden catch in the tools themselves: because most of them run on your own device's processor instead of an expensive server, they cost very little to keep online. The site is supported by advertising and, in future, optional paid extras that will be clearly labelled." },
  { q: "Which languages is ToolVena available in?", a: "ToolVena is available in 12 languages: English, Spanish, Urdu, German, French, Portuguese, Italian, Turkish, Japanese, Norwegian, Dutch and Russian. Use the language menu at the top of any page, or pick your language below." },
  { q: "Do the tools work on a phone?", a: "Yes. The pages are built mobile-first and most tools work in a phone browser. A few heavier tools (like background removal) download a small model the first time you use them, then run on the device itself." },
];

const COMPLIANCE_META = {
  privacy: ["Privacy Policy – ToolVena", "Learn how ToolVena handles the information used by its browser tools, optional AI features, analytics and ads."],
  terms: ["Terms of Service – ToolVena", "Read the Terms of Service for using ToolVena's free web tools, content guidelines, and ethical usage standards."],
  disclaimer: ["Disclaimer & Academic Integrity Policy – ToolVena", "ToolVena's limits for AI writing estimates, research assistance, and academic integrity in educational environments."],
  about: ["About Us – ToolVena", "ToolVena provides free online tools for writing, text, images, PDFs and everyday tasks in 12 languages."],
  contact: ["Contact & Support – ToolVena", "Send ToolVena feedback, support questions and guide requests."],
};

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Title/description for a (page, lang), mirroring applyPageSeo() in src/utils/seo.ts */
function pageMeta(page, lang, blogPost) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const seo = (t && t.seo) || {};
  const fb = TRANSLATIONS.en.seo;
  switch (page) {
    case "humanizer": return [seo.humanizerTitle || fb.humanizerTitle, seo.humanizerDesc || fb.humanizerDesc];
    case "detector": return [seo.detectorTitle || fb.detectorTitle, seo.detectorDesc || fb.detectorDesc];
    case "media": return [seo.mediaTitle || fb.mediaTitle, seo.mediaDesc || fb.mediaDesc];
    case "seo": return [seo.seoTitle || fb.seoTitle, seo.seoDesc || fb.seoDesc];
    case "citation": return [seo.citationTitle || fb.citationTitle, seo.citationDesc || fb.citationDesc];
    case "expander": return [seo.expanderTitle || fb.expanderTitle, seo.expanderDesc || fb.expanderDesc];
    case "summarizer": return [seo.summarizerTitle || fb.summarizerTitle, seo.summarizerDesc || fb.summarizerDesc];
    case "voiceTyping": return [seo.voiceTypingTitle || fb.voiceTypingTitle, seo.voiceTypingDesc || fb.voiceTypingDesc];
    case "cvBuilder": return [seo.cvBuilderTitle || fb.cvBuilderTitle, seo.cvBuilderDesc || fb.cvBuilderDesc];
    case "wordCounter": return [seo.wordCounterTitle || fb.wordCounterTitle, seo.wordCounterDesc || fb.wordCounterDesc];
    case "characterCounter": return [seo.characterCounterTitle || fb.characterCounterTitle, seo.characterCounterDesc || fb.characterCounterDesc];
    case "textToSpeech": return [seo.textToSpeechTitle || fb.textToSpeechTitle, seo.textToSpeechDesc || fb.textToSpeechDesc];
    case "typingTest": return [seo.typingTestTitle || fb.typingTestTitle, seo.typingTestDesc || fb.typingTestDesc];
    case "caseConverter": return [seo.caseConverterTitle || fb.caseConverterTitle, seo.caseConverterDesc || fb.caseConverterDesc];
    case "passwordGenerator": return [seo.passwordGeneratorTitle || fb.passwordGeneratorTitle, seo.passwordGeneratorDesc || fb.passwordGeneratorDesc];
    case "duplicateLines": return [seo.dedupLinesTitle || fb.dedupLinesTitle, seo.dedupLinesDesc || fb.dedupLinesDesc];
    case "textRepeater": return [seo.textRepeaterTitle || fb.textRepeaterTitle, seo.textRepeaterDesc || fb.textRepeaterDesc];
    case "invisibleCharacter": return [seo.invisibleCharacterTitle || fb.invisibleCharacterTitle, seo.invisibleCharacterDesc || fb.invisibleCharacterDesc];
    case "wordFrequency": return [seo.wordFrequencyTitle || fb.wordFrequencyTitle, seo.wordFrequencyDesc || fb.wordFrequencyDesc];
    case "readingTime": return [seo.readingTimeTitle || fb.readingTimeTitle, seo.readingTimeDesc || fb.readingTimeDesc];
    case "base64": return [seo.base64Title || fb.base64Title, seo.base64Desc || fb.base64Desc];
    case "slugGenerator": return [seo.slugGeneratorTitle || fb.slugGeneratorTitle, seo.slugGeneratorDesc || fb.slugGeneratorDesc];
    case "jsonFormatter": return [seo.jsonFormatterTitle || fb.jsonFormatterTitle, seo.jsonFormatterDesc || fb.jsonFormatterDesc];
    case "loremIpsum": return [seo.loremIpsumTitle || fb.loremIpsumTitle, seo.loremIpsumDesc || fb.loremIpsumDesc];
    case "daysBetween": return [seo.daysBetweenTitle || fb.daysBetweenTitle, seo.daysBetweenDesc || fb.daysBetweenDesc];
    case "randomNumber": return [seo.randomNumberTitle || fb.randomNumberTitle, seo.randomNumberDesc || fb.randomNumberDesc];
    case "onlineTimer": return [seo.onlineTimerTitle || fb.onlineTimerTitle, seo.onlineTimerDesc || fb.onlineTimerDesc];
    case "invoiceGenerator": return [seo.invoiceGeneratorTitle || fb.invoiceGeneratorTitle, seo.invoiceGeneratorDesc || fb.invoiceGeneratorDesc];
    case "imageResizer": return [seo.imageResizerTitle || fb.imageResizerTitle, seo.imageResizerDesc || fb.imageResizerDesc];
    case "imageConverter": return [seo.imageConverterTitle || fb.imageConverterTitle, seo.imageConverterDesc || fb.imageConverterDesc];
    case "imageToText": return [seo.imageToTextTitle || fb.imageToTextTitle, seo.imageToTextDesc || fb.imageToTextDesc];
    case "pdfSplitter": return [seo.pdfSplitterTitle || fb.pdfSplitterTitle, seo.pdfSplitterDesc || fb.pdfSplitterDesc];
    case "usernameGenerator": return [seo.usernameGeneratorTitle || fb.usernameGeneratorTitle, seo.usernameGeneratorDesc || fb.usernameGeneratorDesc];
    case "morseCodeTranslator": return [seo.morseCodeTranslatorTitle || fb.morseCodeTranslatorTitle, seo.morseCodeTranslatorDesc || fb.morseCodeTranslatorDesc];
    case "voiceRecorder": return [seo.voiceRecorderTitle || fb.voiceRecorderTitle, seo.voiceRecorderDesc || fb.voiceRecorderDesc];
    case "onlineNotepad": return [seo.onlineNotepadTitle || fb.onlineNotepadTitle, seo.onlineNotepadDesc || fb.onlineNotepadDesc];
    case "unitConverter": return [seo.unitConverterTitle || fb.unitConverterTitle, seo.unitConverterDesc || fb.unitConverterDesc];
    case "onlineTeleprompter": return [seo.onlineTeleprompterTitle || fb.onlineTeleprompterTitle, seo.onlineTeleprompterDesc || fb.onlineTeleprompterDesc];
    case "uuidGenerator": return [seo.uuidGeneratorTitle || fb.uuidGeneratorTitle, seo.uuidGeneratorDesc || fb.uuidGeneratorDesc];
    case "timestampConverter": return [seo.timestampConverterTitle || fb.timestampConverterTitle, seo.timestampConverterDesc || fb.timestampConverterDesc];
    case "jsonToCsv": return [seo.jsonToCsvTitle || fb.jsonToCsvTitle, seo.jsonToCsvDesc || fb.jsonToCsvDesc];
    case "regexTester": return [seo.regexTesterTitle || fb.regexTesterTitle, seo.regexTesterDesc || fb.regexTesterDesc];
    case "urlEncoder": return [seo.urlEncoderTitle || fb.urlEncoderTitle, seo.urlEncoderDesc || fb.urlEncoderDesc];
    case "utmLinkBuilder": return [seo.utmLinkBuilderTitle || fb.utmLinkBuilderTitle, seo.utmLinkBuilderDesc || fb.utmLinkBuilderDesc];
    case "metaChecker": return [seo.metaCheckerTitle || fb.metaCheckerTitle, seo.metaCheckerDesc || fb.metaCheckerDesc];
    case "instagramLineBreak": return [seo.instagramLineBreakTitle || fb.instagramLineBreakTitle, seo.instagramLineBreakDesc || fb.instagramLineBreakDesc];
    case "imageCompressor": return [seo.imageCompressorTitle || fb.imageCompressorTitle, seo.imageCompressorDesc || fb.imageCompressorDesc];
    case "pdfTools": return [seo.pdfToolsTitle || fb.pdfToolsTitle, seo.pdfToolsDesc || fb.pdfToolsDesc];
    case "audioToText": return [seo.audioToTextTitle || fb.audioToTextTitle, seo.audioToTextDesc || fb.audioToTextDesc];
    case "backgroundRemover":
      return [seo.backgroundRemoverTitle || fb.backgroundRemoverTitle, seo.backgroundRemoverDesc || fb.backgroundRemoverDesc];
    case "voiceCloner":
      return [seo.voiceClonerTitle || fb.voiceClonerTitle, seo.voiceClonerDesc || fb.voiceClonerDesc];
    case "museAiHub":
      return [seo.museAiHubTitle || fb.museAiHubTitle, seo.museAiHubDesc || fb.museAiHubDesc];
    case "cleaner": return [seo.cleanerTitle || fb.cleanerTitle, seo.cleanerDesc || fb.cleanerDesc];
    case "diff": return [seo.diffTitle || fb.diffTitle, seo.diffDesc || fb.diffDesc];
    case "home": return [seo.homeTitle || HOME_META[0], seo.homeDesc || HOME_META[1]];
    case "blog":
      if (blogPost) {
        const tab = (t.nav && t.nav.humanizerTab) || "AI Humanizer";
        return [`${blogPost.title} – ${tab}`, blogPost.summary || fb.blogDesc];
      }
      return [seo.blogTitle || fb.blogTitle, seo.blogDesc || fb.blogDesc];
    default:
      if (COMPLIANCE_META[page]) return COMPLIANCE_META[page];
      return [fb.humanizerTitle, fb.humanizerDesc];
  }
}

function hreflangLinks(origin, pathWithoutLang) {
  let s = "";
  for (const l of LANGUAGES) {
    s += `    <link rel="alternate" hreflang="${l}" href="${origin}/${l}${pathWithoutLang}" />\n`;
  }
  if (URPK_ROUTE_PATHS.has(pathWithoutLang)) {
    s += `    <link rel="alternate" hreflang="${URPK_HREFLANG}" href="${origin}/${URPK_LANG}${pathWithoutLang}" />\n`;
  }
  if (HI_ROUTE_PATHS.has(pathWithoutLang)) {
    s += `    <link rel="alternate" hreflang="${HI_HREFLANG}" href="${origin}/${HI_LANG}${pathWithoutLang}" />\n`;
  }
  s += `    <link rel="alternate" hreflang="x-default" href="${origin}/en${pathWithoutLang}" />`;
  return s;
}

// Crawlable internal links, baked into every static shell (menu/footer
// equivalents). The SPA renders the same navigation after hydration and
// replaces this node, so no-JS crawlers still see real internal links.
function staticNavHtml(lang) {
  const routeSet = lang === URPK_LANG ? URPK_ROUTE_PATHS : lang === HI_LANG ? HI_ROUTE_PATHS : null;
  const routes =
    routeSet
      ? ROUTES.filter(([, p]) => routeSet.has(p) || p === "/blog/")
      : ROUTES;
  const items = [[`/${lang}/`, pageMeta("home", lang, null)[0]]];
  for (const [pg, p] of routes) items.push([`/${lang}${p}`, pageMeta(pg, lang, null)[0]]);
  const links = items.map(([u, n]) => `<a href="${u}">${esc(n)}</a>`).join("");
  return `<nav aria-label="ToolVena" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;">${links}</nav>`;
}

function jsonLd(origin, canonicalUrl, title, description, page, post = null, lang = "en") {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: "ToolVena",
      url: `${origin}/`,
      description: "ToolVena offers free online tools for writing, text, images, PDFs and study. No sign-up; most tools run privately in your browser.",
      inLanguage: LANGUAGES,
      publisher: { "@id": `${origin}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: "ToolVena",
      url: `${origin}/`,
      logo: `${origin}/toolvena-logo.svg`,
      sameAs: [
        "https://www.pinterest.com/ToolVena/",
        "https://www.tumblr.com/toolvena",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: lang,
    },
  ];
  if (page === "home") {
    const homeTools = [
      ["AI Text Humanizer", "/ai-humanizer/"],
      ["Text Summarizer", "/text-summarizer/"],
      ["Word Counter", "/word-counter/"],
      ["Image Compressor", "/image-compressor/"],
      ["PDF Tools", "/pdf-tools/"],
      ["CV Builder", "/cv-builder/"],
      ["Background Remover", "/background-remover/"],
      ["Audio to Text Converter", "/audio-to-text-converter/"],
    ];
    data.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Popular free online tools on ToolVena",
      itemListElement: homeTools.map(([name, path], i) => ({
        "@type": "ListItem",
        position: i + 1,
        name,
        url: `${origin}/${lang}${path}`,
      })),
    });
    // FAQPage — mirrors the visible homepage FAQ for this language.
    // Single source of truth: translations.ts `seo.homeFaqs` (English
    // fallback only if a language block is ever missing).
    const homeFaqs =
      TRANSLATIONS[lang] && TRANSLATIONS[lang].seo && TRANSLATIONS[lang].seo.homeFaqs && TRANSLATIONS[lang].seo.homeFaqs.length
        ? TRANSLATIONS[lang].seo.homeFaqs
        : HOME_FAQ_FALLBACK;
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: homeFaqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  // WebApplication schema for tool pages
  const toolPages = ["humanizer", "detector", "imageCompressor", "pdfTools", "audioToText", "backgroundRemover", "voiceCloner", "museAiHub", "summarizer", "voiceTyping", "cvBuilder", "wordCounter", "characterCounter", "textToSpeech", "typingTest", "caseConverter", "passwordGenerator", "duplicateLines", "textRepeater", "invisibleCharacter", "wordFrequency", "readingTime", "base64", "slugGenerator", "jsonFormatter", "loremIpsum", "daysBetween", "randomNumber", "onlineTimer", "invoiceGenerator", "imageResizer", "imageConverter", "imageToText", "pdfSplitter", "usernameGenerator", "morseCodeTranslator", "voiceRecorder", "onlineNotepad", "unitConverter", "onlineTeleprompter", "uuidGenerator", "timestampConverter", "jsonToCsv", "regexTester", "urlEncoder", "utmLinkBuilder", "metaChecker", "instagramLineBreak", "media", "seo", "citation", "expander", "cleaner", "diff"];
  if (toolPages.includes(page)) {
    data.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: lang,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });
  }
  if (page === "timestampConverter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "How does it know seconds from milliseconds?", acceptedAnswer: { "@type": "Answer", text: "In Auto mode, values of 1,000,000,000,000 or more are treated as milliseconds and smaller values as seconds. The assumed unit is always displayed and can be overridden." } },
        { "@type": "Question", name: "Why do UTC and local time differ?", acceptedAnswer: { "@type": "Answer", text: "A Unix timestamp is one instant in UTC. The local line renders the same instant in your device timezone, so the clock reading differs by your UTC offset. Both lines describe the same moment." } },
        { "@type": "Question", name: "Is anything uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. All conversions run in your browser tab. Nothing is uploaded, stored or shared." } },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert a Unix timestamp in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste the timestamp", text: "Paste your epoch value and check the displayed assumption: seconds or milliseconds." },
        { "@type": "HowToStep", position: 2, name: "Read UTC and local", text: "Compare the UTC and local lines and copy the ISO 8601 value when you need an unambiguous string." },
        { "@type": "HowToStep", position: 3, name: "Or pick a date", text: "Choose a date and time, select local or UTC meaning, and copy seconds or milliseconds." },
      ],
    });
  }
  if (page === "museAiHub") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Which countries is Muse AI available in?", acceptedAnswer: { "@type": "Answer", text: "Based on Meta's own announcements checked on 10 October 2026: the United States (launch, 8 September 2026) and Canada (confirmed 29 September 2026). Meta has announced no other launch country and no launch dates for anywhere else." } },
        { "@type": "Question", name: "Is Muse AI available in Pakistan or India?", acceptedAnswer: { "@type": "Answer", text: "Not yet. Meta has announced only the United States and Canada (checked 10 October 2026) and has published no date for Pakistan or India. Sign in at muse.ai to see whether a waitlist opens for your region." } },
        { "@type": "Question", name: "What is the difference between Muse and Meta AI?", acceptedAnswer: { "@type": "Answer", text: "Meta AI is the assistant inside Meta's apps (WhatsApp, Instagram, Facebook, Messenger) — you ask it something and it answers. Muse is Meta's newer personal agent that can take a goal, research across sources, plan steps, and work on tasks for you. They are two different products." } },
        { "@type": "Question", name: "Is Muse free?", acceptedAnswer: { "@type": "Answer", text: "Meta's official FAQ says Muse is available for free with a usage limit. If you hit that limit you can upgrade to a paid subscription for a higher limit or wait for the free limit to refresh. Meta had not published exact paid-plan amounts on its public pages as of 10 October 2026." } },
        { "@type": "Question", name: "What are Muse tokens? Can I buy '1 billion tokens'?", acceptedAnswer: { "@type": "Answer", text: "Tokens are units of usage — they measure how much work Muse does for you, like minutes on a phone plan. They are not money and not cryptocurrency. Third-party blogs claim '1 billion token' invite codes, but Meta's official pages publish no such programme. Never give your Meta login to a site promising tokens." } },
        { "@type": "Question", name: "How do I join the official waitlist?", acceptedAnswer: { "@type": "Answer", text: "Go to muse.ai and sign in with your Meta account. If a waitlist is offered for your country you will see it there. That is the only official route; nobody legitimate sells or swaps waitlist positions." } },
        { "@type": "Question", name: "Can I use a VPN or a friend's foreign account to get Muse early?", acceptedAnswer: { "@type": "Answer", text: "We do not recommend it, and this page never teaches ways around the launch regions: using a service from a country where it has not launched can break Meta's terms and put your Meta account at risk. The safe route is the official waitlist." } },
        { "@type": "Question", name: "When will Muse launch in my country?", acceptedAnswer: { "@type": "Answer", text: "Meta has not announced dates beyond the United States and Canada. ToolVena's checker marks every other country 'not yet' and updates the moment Meta's official pages change." } },
      ],
    });
  }
  if (page === "audioToText") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Is this audio to text converter free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up and no per-minute charge. Transcription runs on your own device in your browser." } },
        { "@type": "Question", name: "Is my audio uploaded anywhere?", acceptedAnswer: { "@type": "Answer", text: "No. Your file is decoded and transcribed inside your browser tab. The only download is a one-time copy of the compact Whisper speech model (about 40 MB) from a public model library, which your browser then caches." } },
        { "@type": "Question", name: "Which audio formats can I use?", acceptedAnswer: { "@type": "Answer", text: "MP3, WAV, M4A and MP4 work well, plus any audio or video format your browser itself can play. If a file cannot be decoded, the tool says so plainly instead of guessing." } },
        { "@type": "Question", name: "How accurate is the transcript?", acceptedAnswer: { "@type": "Answer", text: "It is at its best with short, clear recordings: one speaker, little background noise, roughly a few minutes at a time. Long, noisy or multi-speaker recordings will contain more mistakes, and names and technical words are usually the first to go wrong. Always proofread before relying on the text." } },
        { "@type": "Question", name: "Can I get subtitles for a video?", acceptedAnswer: { "@type": "Answer", text: "Yes. After transcribing, download the .srt or .vtt export — both carry the model's timestamps as subtitle cues. If you edit the transcript text, the subtitle export falls back to one cue holding the edited text." } },
        { "@type": "Question", name: "Does it work offline?", acceptedAnswer: { "@type": "Answer", text: "After the first visit, the speech model is cached by your browser, so transcription keeps working without an internet connection. The very first transcription needs to be online to fetch the model." } },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert audio to text in 4 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose your audio file", text: "Click the upload area or drop in an MP3, WAV, M4A or MP4 file. Nothing is uploaded — the file stays on your device." },
        { "@type": "HowToStep", position: 2, name: "Press Transcribe and wait for the one-time model download", text: "The first transcription downloads the compact speech model (about 40 MB) with live per-file progress. Later visits reuse the cached model and start almost immediately." },
        { "@type": "HowToStep", position: 3, name: "Read and fix the transcript", text: "The transcript appears in an editable box. Correct names and unclear words while you still remember what was said." },
        { "@type": "HowToStep", position: 4, name: "Copy or download", text: "Copy the text, or download it as a .txt transcript or as .srt/.vtt subtitles with timestamps." },
      ],
    });
  }
  if (page === "jsonToCsv") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "How are nested objects flattened?", acceptedAnswer: { "@type": "Answer", text: "Nested objects become dot-path columns (address.city). Lists of plain values are joined with '; ' in one cell; lists containing objects stay as compact JSON text in one cell so one record stays one row. The rule is printed on the page." } },
        { "@type": "Question", name: "Why does Safe export add an apostrophe?", acceptedAnswer: { "@type": "Answer", text: "A cell beginning with =, +, - or @ can be treated as a formula by Excel or Google Sheets. Safe export prefixes such fields with an apostrophe so they open as plain text instead of running as formulas." } },
        { "@type": "Question", name: "Is anything uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. JSON is parsed and converted in your browser tab. Nothing is uploaded, stored or shared." } },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert JSON to CSV in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste or upload JSON", text: "Paste an array of objects or open a .json file. A single object converts as one row." },
        { "@type": "HowToStep", position: 2, name: "Check the preview and safety warning", text: "Review dot-path columns and '; '-joined lists in the preview table. Keep Safe export on when fields begin with =, +, - or @." },
        { "@type": "HowToStep", position: 3, name: "Choose a delimiter and download", text: "Pick comma, semicolon or tab, keep or remove the header row, then download the .csv or copy the CSV text." },
      ],
    });
  }
  if (page === "regexTester") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Is this regex tester free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Write a pattern, toggle the g/i/m/s/u/y flags, and see highlighted matches, positions, captured groups and a replace preview. A small library of common patterns is included as starting points." } },
        { "@type": "Question", name: "Which regex flavour does it use?", acceptedAnswer: { "@type": "Answer", text: "JavaScript (ECMAScript), the RegExp engine in your browser. Regex dialects differ — lookbehind, named groups, Unicode behaviour and even what \d matches can vary in Python, PHP, Java or PCRE. Treat a pass here as a strong draft and run the final check in the engine your code actually uses." } },
        { "@type": "Question", name: "Why did matching stop, and why can a pattern be slow?", acceptedAnswer: { "@type": "Answer", text: "To keep the tab responsive there are printed caps: patterns up to 1,000 characters, test text up to 20,000 characters, and matching stops after 1,000 matches. Separately, nested quantifiers such as (a+)+ can cause catastrophic backtracking and make any regex engine grind; test risky patterns on a few lines first." } },
        { "@type": "Question", name: "Can I use the built-in patterns as validators?", acceptedAnswer: { "@type": "Answer", text: "They are teaching examples and starting points, not guarantees. The IPv4 example accepts 999.1.1.1, and no email regex can replace the receiving server's own decision. For validation people depend on, add real checks behind the regex." } },
        { "@type": "Question", name: "Is my pattern or text uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. Matching runs locally with the RegExp engine in your browser tab. Nothing is uploaded, stored on a server or shared, and closing the tab forgets everything." } },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to test a regular expression in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Write the pattern and set flags", text: "Type your regular expression and toggle g, i, m, s, u and y as needed. Each flag carries a one-line plain-language explanation." },
        { "@type": "HowToStep", position: 2, name: "Paste test text and read the matches", text: "Paste text that resembles your real data, including a deliberate near-miss. Read the highlighted preview and the match list: position, matched text, numbered and named groups." },
        { "@type": "HowToStep", position: 3, name: "Preview the replacement", text: "Type a replacement using $1 for numbered groups or $<name> for named groups, check the preview, and copy the result. Without the g flag only the first match is replaced." },
      ],
    });
  }
  if (page === "urlEncoder") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What is the difference between Full URL and Single value mode?", acceptedAnswer: { "@type": "Answer", text: "Full URL mode (encodeURI/decodeURI) keeps : / ? & = # working as link structure and only fixes unsafe characters. Single value mode (encodeURIComponent/decodeURIComponent) encodes those characters too (%26, %3D, %3F), which is what one query value needs so its own & or = cannot split the link." } },
        { "@type": "Question", name: "Why did decoding say the percent-encoding is invalid?", acceptedAnswer: { "@type": "Answer", text: "There is a broken percent sign in the text: a trailing %, a short %2, a non-hex %ZZ, or bytes that are not valid UTF-8. The tool explains the problem instead of guessing a half-decoded result." } },
        { "@type": "Question", name: "Is URL encoding encryption or security?", acceptedAnswer: { "@type": "Answer", text: "No. Percent-encoding is transport formatting that anyone can reverse instantly. It hides nothing, so never put a password, API key or token in a URL expecting encoding to protect it." } },
        { "@type": "Question", name: "Is anything uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. Conversion runs in your browser tab with the built-in encodeURI/encodeURIComponent functions. Nothing is uploaded, stored or shared." } },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to encode or decode a URL in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose Full URL or Single value", text: "Full URL for a complete link whose structure must keep working; Single value for one query value, where & = ? are encoded as %26 %3D %3F." },
        { "@type": "HowToStep", position: 2, name: "Paste and check the live result", text: "Paste your link or value, choose Encode or Decode, and read the live result with the exact function name shown. Invalid percent-sequences get a plain-language error." },
        { "@type": "HowToStep", position: 3, name: "Copy or swap and reverse", text: "Copy the result, or swap it back and flip direction as a round-trip check. Encode each value exactly once to avoid double-encoding." },
      ],
    });
  }
  if (page === "utmLinkBuilder") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Which UTM parameters should every link have?", acceptedAnswer: { "@type": "Answer", text: "At minimum utm_source, utm_medium and utm_campaign. utm_term is mainly for paid search keywords and utm_content separates versions that share one campaign." } },
        { "@type": "Question", name: "Why lowercase and consistent UTM values?", acceptedAnswer: { "@type": "Answer", text: "Most analytics tools are case-sensitive, so Facebook and facebook count as two sources, and one channel written three ways becomes three report rows. Use lowercase, hyphens or underscores instead of spaces, and the exact same spelling every time." } },
        { "@type": "Question", name: "Can I put personal data in UTM values?", acceptedAnswer: { "@type": "Answer", text: "Never put names, email addresses or other personal data in UTM values. Links are forwarded, logged and pasted into chats, so anything inside a URL travels. Label the campaign, never the person." } },
        { "@type": "Question", name: "Does a correct UTM link guarantee correct reporting?", acceptedAnswer: { "@type": "Answer", text: "No. Analytics must be installed on the landing page; consent mode or blockers can prevent recording; redirects can drop the query string; and some platforms strip parameters when a link is shared onward. Tag external links only." } },
        { "@type": "Question", name: "Is anything uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. The link is built in your browser tab with encodeURIComponent, and saved presets stay on this device. Nothing is uploaded, stored on a server or shared." } },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to build a UTM campaign link in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Enter destination and core values", text: "Paste the full destination URL including https://, then enter source, medium and campaign in lowercase with one consistent spelling." },
        { "@type": "HowToStep", position: 2, name: "Add optional term and content", text: "Use utm_term for paid keywords and utm_content to tell apart versions in the same campaign, then check the live final-URL preview." },
        { "@type": "HowToStep", position: 3, name: "Copy, save a preset and click-test", text: "Copy the tagged link, save the naming as an on-device preset, and click the link once to confirm the parameters survive to the final page." },
      ],
    });
  }
  if (page === "metaChecker") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Why show pixels as well as characters?", acceptedAnswer: { "@type": "Answer", text: "Letters have different widths (WWW is wider than iii), so the same character count can take up different space. Google truncates closer to display width than to a fixed character number. The pixel figure here is an approximation from canvas measurement and is labelled approximate." } },
        { "@type": "Question", name: "What length is good, and does it help ranking?", acceptedAnswer: { "@type": "Answer", text: "Only display guidance can be given: about 30–60 characters for a title and 120–160 for a description on desktop, less on mobile. Fitting a band makes truncation less likely; it does not improve ranking, and Google sets no fixed limit." } },
        { "@type": "Question", name: "Will Google show exactly what I typed?", acceptedAnswer: { "@type": "Answer", text: "Often not. Google frequently rewrites titles and replaces descriptions with a snippet from page content, varying by query and device. No checker can guarantee display or ranking. Put important words first and treat any preview as a writing aid." } },
        { "@type": "Question", name: "Should I add meta keywords?", acceptedAnswer: { "@type": "Answer", text: "No. Google does not use the meta keywords tag for ranking. This checker deliberately ignores it." } },
        { "@type": "Question", name: "Is anything uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. Counting and pixel measurement run in your browser tab. Nothing is uploaded, stored or shared." } },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to check a meta title and description in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Enter title and description", text: "Type the exact title and meta description you plan to use, plus site name and URL for a realistic preview." },
        { "@type": "HowToStep", position: 2, name: "Read characters, approximate pixels and bands", text: "Compare live character counts and approximate pixel widths with the desktop and mobile guidance bands. Wide letters cut sooner at the same count." },
        { "@type": "HowToStep", position: 3, name: "Front-load, compare previews and copy", text: "Put important words first, compare desktop and mobile previews, adjust until both read completely, then copy each field into your page or CMS." },
      ],
    });
  }
  if (page === "humanizer") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to humanize AI text in 3 steps",
      description,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste your text", text: "Paste your AI-generated draft into the input box." },
        { "@type": "HowToStep", position: 2, name: "Choose a tone", text: "Pick Conversational, Academic, Professional or Creative tone." },
        { "@type": "HowToStep", position: 3, name: "Humanize and copy", text: "Click Humanize Text, review the rewritten result and copy it." },
      ],
    });
  }
  if (page === "summarizer") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to summarize text in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste your text", text: "Paste your long article, paper, or document into the input box." },
        { "@type": "HowToStep", position: 2, name: "Choose summary length", text: "Pick Brief (~25%), Balanced (~40%), or Detailed (~60%) summary length." },
        { "@type": "HowToStep", position: 3, name: "Copy your summary", text: "Review the extracted key sentences and copy your summary." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "How does the text summarizer work?",
          acceptedAnswer: { "@type": "Answer", text: "Our summarizer uses extractive summarization: it scores every sentence by word frequency, position, and key-fact signals, then selects the most important sentences in their original order. It never invents content — every word comes from your text." },
        },
        {
          "@type": "Question",
          name: "Is the text summarizer free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, completely free with no sign-up, no word limits, and no text leaving your device. Everything runs in your browser." },
        },
        {
          "@type": "Question",
          name: "Which languages does the summarizer support?",
          acceptedAnswer: { "@type": "Answer", text: "The summarizer works with 8 languages: English, Spanish, Urdu (Roman Urdu), German, French, Turkish, Portuguese, and Japanese. The extractive algorithm is language-agnostic." },
        },
        {
          "@type": "Question",
          name: "What's the difference between Brief, Balanced, and Detailed summaries?",
          acceptedAnswer: { "@type": "Answer", text: "Brief keeps ~25% of sentences for a quick overview. Balanced keeps ~40% for a solid summary. Detailed keeps ~60% for comprehensive coverage while still saving reading time." },
        },
      ],
    });
  }
  if (page === "voiceTyping") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to turn speech into text in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Pick your language and allow the microphone", text: "Choose the language you will speak, then press Start Speaking and allow microphone access when the browser asks." },
        { "@type": "HowToStep", position: 2, name: "Speak naturally", text: "Talk at a normal pace in a quiet place. Say punctuation out loud, like full stop or comma, and keep sentences short." },
        { "@type": "HowToStep", position: 3, name: "Review, copy or polish", text: "Proofread the transcript, then copy it, download it as a text file, or send it to the humanizer to polish the writing." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this voice typing tool free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free to use with no sign-up and no install. It runs in your browser using the browser's built-in speech recognition." },
        },
        {
          "@type": "Question",
          name: "Which browsers support voice typing?",
          acceptedAnswer: { "@type": "Answer", text: "Google Chrome and Microsoft Edge work best because they include speech recognition. Some other browsers do not support it yet; the tool tells you honestly when that is the case." },
        },
        {
          "@type": "Question",
          name: "Is my voice recorded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "This website does not receive or store your audio. In Chrome and Edge, the browser maker's speech service converts your voice to text, and the text stays in your browser tab." },
        },
        {
          "@type": "Question",
          name: "How accurate is voice typing?",
          acceptedAnswer: { "@type": "Answer", text: "Accuracy is usually good in a quiet room at a natural speaking pace, but background noise, very fast speech and strong accents can cause mistakes. Always proofread the result before using it." },
        },
        {
          "@type": "Question",
          name: "Can I dictate in Urdu and other languages?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. You can pick from 13 dictation languages, including Urdu, English, Hindi, Arabic, Spanish, German, French, Turkish, Portuguese, Japanese, Italian, Dutch and Norwegian." },
        },
      ],
    });
  }
  if (page === "cvBuilder") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to make a CV in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Fill in your details", text: "Add your name, contact details, a short professional summary, your jobs, education, skills, and languages." },
        { "@type": "HowToStep", position: 2, name: "Choose a template and check the preview", text: "Pick a modern or classic layout, adjust the accent color, and watch the CV update live as you type." },
        { "@type": "HowToStep", position: 3, name: "Print or save as PDF", text: "Press Print / Save as PDF. Only the CV prints, ready to send with your job application." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this CV builder free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Fill the form, preview your CV, and print it or save it as a PDF." },
        },
        {
          "@type": "Question",
          name: "Is my CV data uploaded anywhere?",
          acceptedAnswer: { "@type": "Answer", text: "No. Everything runs in your browser and your entries are saved only on your own device, so you can continue editing later. We never receive or store your CV data." },
        },
        {
          "@type": "Question",
          name: "Will this CV pass applicant tracking systems (ATS)?",
          acceptedAnswer: { "@type": "Answer", text: "The clean, simple layouts with standard headings are the kind applicant tracking systems read most reliably. No builder can guarantee selection, but honest keywords from the job ad and a simple format give your CV its best reading." },
        },
        {
          "@type": "Question",
          name: "Should I add a photo to my CV?",
          acceptedAnswer: { "@type": "Answer", text: "It depends on the country and the job. Photos are common in much of Europe and parts of Asia, and usually left out in the US and UK. The photo here is optional — add one only if it is normal for the job you want." },
        },
        {
          "@type": "Question",
          name: "Can the builder write my experience for me?",
          acceptedAnswer: { "@type": "Answer", text: "No — and it should not. The builder handles layout and formatting; your experience and words must be your own. Invented experience on a CV is dishonest and usually falls apart in the interview." },
        },
      ],
    });
  }
  if (page === "wordCounter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to count words and characters in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste, type or open a text file", text: "Paste or type your text into the editor, or open a .txt file from your device. The counts update live." },
        { "@type": "HowToStep", position: 2, name: "Read the live statistics", text: "Check words, characters with and without spaces, sentences, paragraphs, lines, unique words, reading time and speaking time." },
        { "@type": "HowToStep", position: 3, name: "Copy or download the result", text: "Copy the statistics, download the text, or compare the count with a word goal and common character limits." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this word counter free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Paste, type or open a text file and the statistics update live in your browser." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The counting happens locally in your browser tab. This tool does not upload your text or save it on a server." },
        },
        {
          "@type": "Question",
          name: "Why can two word counters give different results?",
          acceptedAnswer: { "@type": "Answer", text: "Tools handle hyphenated words, numbers, URLs, abbreviations, emoji, decimal numbers and scripts without spaces differently. When an exact limit matters, compare every draft with the same counter." },
        },
        {
          "@type": "Question",
          name: "How are reading and speaking time calculated?",
          acceptedAnswer: { "@type": "Answer", text: "Reading time uses about 200 words per minute and speaking time about 130 words per minute. Real speed depends on the reader, language, text difficulty and pauses." },
        },
        {
          "@type": "Question",
          name: "How should Japanese text be counted?",
          acceptedAnswer: { "@type": "Answer", text: "Japanese usually does not separate words with spaces, so the character count is the reliable main figure. A spaces-based word count is best treated as a rough guide for space-separated or mixed text." },
        },
      ],
    });
  }
  if (page === "characterCounter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to count characters and check a limit in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste, type or open a text file", text: "Paste or type your text into the editor, open a .txt file, or select part of the text to count just that selection. The counts update live." },
        { "@type": "HowToStep", position: 2, name: "Read the four counting methods", text: "Compare characters (grapheme clusters), characters without spaces, Unicode code points, UTF-16 code units and UTF-8 bytes — each labelled with its method, so emoji and joined characters are never a surprise." },
        { "@type": "HowToStep", position: 3, name: "Check it against the limit", text: "Pick a platform preset such as X, Instagram, LinkedIn, a meta title or SMS, or set your own limit, and see how much room is left. SMS shows the GSM-7 versus Unicode segment count too." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this character counter free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Paste, type or open a text file and the character counts update live in your browser." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The counting happens locally in your browser tab. This tool does not upload your text or save it on a server." },
        },
        {
          "@type": "Question",
          name: "Why do character counters disagree about emoji?",
          acceptedAnswer: { "@type": "Answer", text: "Because a character can be counted four ways: as one grapheme cluster (what a reader sees), as Unicode code points, as UTF-16 code units (the browser/JavaScript length), or as UTF-8 bytes. One emoji can be 1, 2 or more code points, 2 UTF-16 units and 4 or more bytes. This tool shows all four counts and names the method behind each." },
        },
        {
          "@type": "Question",
          name: "Are the platform limits guaranteed?",
          acceptedAnswer: { "@type": "Answer", text: "No. The presets are the commonly published limits at the time of writing — such as 280 characters for an X post, 2,200 for an Instagram caption, 3,000 for a LinkedIn post and 160 for an SMS — and platforms change them without notice and count emoji, links and line breaks their own way. Treat the presets as planning guidance and trust the counter inside the app you post to for the final word." },
        },
        {
          "@type": "Question",
          name: "Why does an SMS shrink from 160 to 70 characters?",
          acceptedAnswer: { "@type": "Answer", text: "A plain SMS uses the GSM-7 alphabet at 160 characters per segment. Add any character outside that set — Urdu or Arabic script, many emoji — and the whole message is encoded as Unicode (UCS-2) at 70 characters per segment, so it splits into more segments sooner than the headline number suggests." },
        },
        {
          "@type": "Question",
          name: "What is the difference between the Character Counter and the Word Counter?",
          acceptedAnswer: { "@type": "Answer", text: "The Word Counter answers how much you wrote: words, sentences, paragraphs, reading time and your most repeated words. This Character Counter answers whether it fits and how it is counted: exact characters by four methods and live checks against platform limits. Each page links to the other." },
        },
      ],
    });
  }
  if (page === "textToSpeech") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to hear your text read aloud in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste your text", text: "Paste or type the text you want to hear — an essay, study notes, an article — or try the sample." },
        { "@type": "HowToStep", position: 2, name: "Choose a voice from your device", text: "Pick one of the voices installed on your phone or computer, grouped by language, then set the speed and pitch." },
        { "@type": "HowToStep", position: 3, name: "Press Play", text: "Listen part by part with pause, resume and stop. Long texts are split into sentence-sized parts automatically so playback does not cut out." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this text to speech tool free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up, and there is no character limit from us: long texts are split into sentence-sized parts and read in sequence in your browser." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The reading happens locally in your browser tab using your device's own voice. Your text is never sent to a server." },
        },
        {
          "@type": "Question",
          name: "Can I download the reading as an MP3?",
          acceptedAnswer: { "@type": "Answer", text: "No, and this page says so honestly: browser voices play live and a web page cannot save them as an audio file. Sites that generate MP3 files do it on their own servers, which means uploading your text to them." },
        },
        {
          "@type": "Question",
          name: "Why does my language have no voice, or a different voice than my friend's phone?",
          acceptedAnswer: { "@type": "Answer", text: "The voices come from your own device and browser — websites cannot install them. If a language is missing, add its voice in your system settings (Android: Accessibility → Text-to-speech output; Windows: Time & language → Speech), then reload. Chrome often includes extra voices." },
        },
        {
          "@type": "Question",
          name: "Why does the reading pause strangely, or restart instead of resuming?",
          acceptedAnswer: { "@type": "Answer", text: "Pause and resume behaviour is controlled by each browser and device, and they differ. Some browsers restart the current part instead of continuing mid-sentence. Stopping and pressing Play again always restarts cleanly." },
        },
      ],
    });
  }
  if (page === "typingTest") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to take a typing speed test in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose a mode and practice text", text: "Pick 30 seconds, 60 seconds, 25 words or 50 words, and choose the passage language — original practice texts are available in 11 languages, including Roman Urdu." },
        { "@type": "HowToStep", position: 2, name: "Start typing", text: "Click the typing box and type the passage. The clock starts with your first keystroke; backspace works, and the characters colour as you go." },
        { "@type": "HowToStep", position: 3, name: "Read your honest result", text: "See net WPM, gross WPM, accuracy and correct/error character counts, then restart the same text or try a new one. Your best score stays only in this browser." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this typing speed test free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. All modes, passages and languages are free with no sign-up and no usage limit from us. Everything runs in your browser." },
        },
        {
          "@type": "Question",
          name: "How is WPM calculated?",
          acceptedAnswer: { "@type": "Answer", text: "WPM = correct characters ÷ 5 ÷ minutes. One word counts as 5 characters including spaces, the standard convention. Gross WPM counts every character typed; net WPM counts only the correct ones, which is the honest figure." },
        },
        {
          "@type": "Question",
          name: "Is anything I type uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The passage, your typing and the scoring all happen in your browser tab. Nothing is sent to a server, and your best score is kept only in this browser on this device." },
        },
        {
          "@type": "Question",
          name: "Can I compare my phone score with my computer score?",
          acceptedAnswer: { "@type": "Answer", text: "Not fairly. Phone keyboards usually score far lower than physical keyboards, and different layouts and passages change results. Compare your own repeated scores on the same device and keyboard instead." },
        },
        {
          "@type": "Question",
          name: "Does this test give me a certificate for jobs?",
          acceptedAnswer: { "@type": "Answer", text: "No. This is a practice score, not an official certificate, and no employer body recognizes it. Employers test typing with their own tools; this page helps you prepare honestly." },
        },
        {
          "@type": "Question",
          name: "How is Japanese typing scored?",
          acceptedAnswer: { "@type": "Answer", text: "Japanese is not space-separated, so the test counts characters. Word modes use a fixed character count, and WPM applies the standard 5 characters = 1 word convention, with the character count shown as the main number." },
        },
      ],
    });
  }
  if (page === "caseConverter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert text case in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste or type your text", text: "Paste or type the text into the editor. The character, word and line counts update as you write." },
        { "@type": "HowToStep", position: 2, name: "Choose a case", text: "Pick UPPERCASE, lowercase, Sentence case, Capitalized Case, Title Case, alternating case or inverse case. You can preview every result before applying it." },
        { "@type": "HowToStep", position: 3, name: "Copy or download", text: "Copy the converted text or download it as a .txt file. Check names, acronyms and brand capitalization once before publishing." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this case converter free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up, and every conversion happens in your browser." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The conversion and counting happen in this browser tab. Your text is not uploaded, stored on a server or shared by this tool." },
        },
        {
          "@type": "Question",
          name: "Does Sentence case fix grammar?",
          acceptedAnswer: { "@type": "Answer", text: "No. Sentence case is a capitalization transform, not grammar correction. It can flatten intentional capitals in names, acronyms and brands, so review the result before using it." },
        },
        {
          "@type": "Question",
          name: "Why can Title Case look different in different places?",
          acceptedAnswer: { "@type": "Answer", text: "Title Case rules vary by language and editorial style guide, especially for short words. This tool applies one consistent heading pattern; check your publisher's own rules when they matter." },
        },
        {
          "@type": "Question",
          name: "Does it handle Turkish, German and Japanese text correctly?",
          acceptedAnswer: { "@type": "Answer", text: "Case changes follow the language selected on the page: Turkish i becomes İ and dotless ı becomes I, German ß becomes SS in UPPERCASE, and scripts without letter case, such as Japanese kana and kanji, are left unchanged." },
        },
      ],
    });
  }
  if (page === "passwordGenerator") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to create a strong password in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose length and characters", text: "Set the length (16 or more is a good default) and tick uppercase, lowercase, numbers and symbols. Turn on exclude look-alike characters if you will type the password by hand." },
        { "@type": "HowToStep", position: 2, name: "Generate several and pick one", text: "The tool creates a batch of passwords right on your device using cryptographic randomness. Pick any one of them — they are equally random." },
        { "@type": "HowToStep", position: 3, name: "Copy it into the account and a password manager", text: "Paste the password into the sign-up form and save it in a reputable password manager. Then turn on two-factor authentication for that account." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this password generator free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up and no account. Everything runs in your browser." },
        },
        {
          "@type": "Question",
          name: "Are my passwords uploaded, stored or logged?",
          acceptedAnswer: { "@type": "Answer", text: "No. Passwords are generated locally in your browser tab with the Web Crypto API and never leave your device. There is no history: closing the tab forgets everything." },
        },
        {
          "@type": "Question",
          name: "How does the strength estimate work?",
          acceptedAnswer: { "@type": "Answer", text: "It estimates entropy as password length times log2 of the character pool size. It is a rough estimate of guessing difficulty, not a promise — no password is unhackable, and a unique password plus two-factor authentication matters more than any label." },
        },
        {
          "@type": "Question",
          name: "Why exclude look-alike characters?",
          acceptedAnswer: { "@type": "Answer", text: "Characters like I, l, 1, O and 0 are easy to confuse when reading or retyping a password. Excluding them trades a little pool size for far fewer typing mistakes." },
        },
        {
          "@type": "Question",
          name: "Where should I keep the password I generate?",
          acceptedAnswer: { "@type": "Answer", text: "In a reputable password manager, protected by a strong master password you can remember — a long passphrase works well for that. Do not keep passwords in notes apps, chats or email, and use a different password for every account." },
        },
      ],
    });
  }
  if (page === "duplicateLines") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to remove duplicate lines in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste your list or open a .txt file", text: "Paste one item per line, or open a plain .txt file from your device. The file is read locally in your browser." },
        { "@type": "HowToStep", position: 2, name: "Choose how lines are matched", text: "Decide whether capital letters matter, whether spaces at the edges are trimmed, whether blank lines are ignored, and whether the cleaned list should be sorted A to Z." },
        { "@type": "HowToStep", position: 3, name: "Check the counts and copy", text: "Compare total lines, unique lines and duplicates removed, then copy the result or download it as a .txt file." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this remove duplicate lines tool free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Paste a list or open a .txt file and the cleaned result updates live in your browser." },
        },
        {
          "@type": "Question",
          name: "Which copy of a repeated line is kept?",
          acceptedAnswer: { "@type": "Answer", text: "The first occurrence. Later lines that match under your chosen case, space and blank-line options are removed." },
        },
        {
          "@type": "Question",
          name: "Is my list uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The list is processed in your browser tab, and a .txt file you open is read on your device. This tool does not upload or store your text on a server." },
        },
        {
          "@type": "Question",
          name: "What do the matching options change?",
          acceptedAnswer: { "@type": "Answer", text: "Case-sensitive decides whether Apple and apple are different. Trim spaces removes spaces at the edges before comparing. Ignore blank lines leaves blanks out of the result. Sort A-Z orders the unique lines after cleaning." },
        },
        {
          "@type": "Question",
          name: "Does it merge lines that are almost the same?",
          acceptedAnswer: { "@type": "Answer", text: "No. It compares whole lines exactly under the options you choose. Near matches such as 'seo tool' and 'seo tools', or different spellings, stay as separate lines." },
        },
      ],
    });
  }
  if (page === "textRepeater") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to repeat text online in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Type or paste your text", text: "Enter a word, sentence, emoji or short paragraph. You can repeat the whole text or repeat every word one by one." },
        { "@type": "HowToStep", position: 2, name: "Set the count and separator", text: "Choose 1 to 1,000 copies and what goes between them: nothing, a space, a new line, a comma or your own separator. Optionally add the separator after the last copy too." },
        { "@type": "HowToStep", position: 3, name: "Copy or download the result", text: "Check the live copy, character, word and line counts, then copy the result or download it as a .txt file. Nothing is uploaded." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this text repeater free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Repeat text up to 1,000 times and copy or download the result from your browser." },
        },
        {
          "@type": "Question",
          name: "Why is there a limit of 1,000 repeats and 200,000 characters?",
          acceptedAnswer: { "@type": "Answer", text: "Rendering millions of characters in a browser tab would freeze the page, especially on phones. The tool produces as many complete copies as fit in 200,000 characters and tells you when the result was shortened, instead of locking up." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. Your text and the repeated result are created in your browser tab. This tool does not upload, store or share them, and closing the tab forgets everything." },
        },
        {
          "@type": "Question",
          name: "What is the difference between whole-text and each-word mode?",
          acceptedAnswer: { "@type": "Answer", text: "Whole-text mode repeats your full text as one block, copy after copy. Each-word mode repeats every word one by one, so 'go team' at 3 repeats becomes 'go go go team team team'." },
        },
        {
          "@type": "Question",
          name: "Can I use repeated text to flood chats or comments?",
          acceptedAnswer: { "@type": "Answer", text: "Please don't. This tool is for formatting, placeholders, test data, patterns and practice. Messaging and social platforms limit message length and can restrict accounts that paste huge repeated blocks; flooding can also get you muted or banned." },
        },
      ],
    });
  }
  if (page === "invisibleCharacter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to copy an invisible character in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose the right character", text: "Pick a zero-width character for no visible width, or a blank-width character such as Braille Pattern Blank when you need a visible-sized empty gap. The code point is shown before copying." },
        { "@type": "HowToStep", position: 2, name: "Copy one or generate blank text", text: "Copy a single character, or choose a character and repeat count and copy the generated blank text. The preview uses labelled tiles so an empty result is not taken on trust." },
        { "@type": "HowToStep", position: 3, name: "Test in the destination and tester", text: "Paste into the target app and, if unsure, paste into the tester. Hidden or blank-width characters appear as code-point labels with counts. Platforms may strip or block them, so there is no guarantee." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this invisible character tool free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Copy one character, generate up to 1,000 repeated characters, and inspect pasted text in your browser." },
        },
        {
          "@type": "Question",
          name: "Which characters are really invisible?",
          acceptedAnswer: { "@type": "Answer", text: "Zero Width Space U+200B, Zero Width Non-Joiner U+200C, Zero Width Joiner U+200D and Word Joiner U+2060 have no visible glyph or width by themselves, although joiners can affect neighbouring letters and emoji. Braille Pattern Blank U+2800 and Hangul Filler U+3164 render as blank space with width in fonts that support them." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. Generated text and text pasted into the tester are processed in your browser tab. This tool does not upload, store or share them." },
        },
        {
          "@type": "Question",
          name: "Will invisible text work in every game or social app?",
          acceptedAnswer: { "@type": "Answer", text: "No. Platforms can strip, block, normalize, reject or change how they handle these Unicode characters at any time, and some fonts or screen readers behave differently. Test in the destination and follow that platform's rules." },
        },
        {
          "@type": "Question",
          name: "Why is U+FE0F not offered as a blank character?",
          acceptedAnswer: { "@type": "Answer", text: "U+FE0F is Variation Selector-16. It modifies the character or emoji before it and is not blank text by itself, so this tool does not pretend it is a standalone invisible character. The tester will still label it when it appears in pasted text." },
        },
      ],
    });
  }
  if (page === "wordFrequency") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to count word frequency in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste, type or open text", text: "Paste or type your text into the box, or open a plain-text file from your device. The file is read locally in your browser." },
        { "@type": "HowToStep", position: 2, name: "Choose the counting rules", text: "Turn case sensitivity on or off, set a minimum word length and count, choose whether to ignore common stop words, and pick 1-, 2- or 3-word phrases. The ranked table updates live." },
        { "@type": "HowToStep", position: 3, name: "Read, copy or export the table", text: "Click any word or phrase to highlight its matches in the source preview, copy the table, or download it as CSV. Percentages use the analyzed total shown by the tool." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this word frequency counter free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Paste, type or open a text file and the ranked frequency table updates live in your browser." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The counting happens locally in your browser tab, including when you open a text file. This tool does not upload your text or save it on a server." },
        },
        {
          "@type": "Question",
          name: "How is the percentage calculated?",
          acceptedAnswer: { "@type": "Answer", text: "Percentage = count divided by the analyzed total, times 100. The analyzed total is the count after the minimum length and stop-word rules you selected, and for 2- or 3-word phrases it is the number of analyzed phrase windows." },
        },
        {
          "@type": "Question",
          name: "Does a high keyword frequency improve Google ranking?",
          acceptedAnswer: { "@type": "Answer", text: "Not by itself, and there is no perfect percentage. Frequency is a diagnostic that can reveal repeated wording, missing variety or an overused phrase. Search engines also judge relevance, quality, clarity and natural language, so write for readers first." },
        },
        {
          "@type": "Question",
          name: "Why can two frequency counters give different results?",
          acceptedAnswer: { "@type": "Answer", text: "Counters differ on case handling, punctuation, contractions, numbers, minimum length, stop words and phrase boundaries. This tool shows its counting rules beside the table so you can compare like with like." },
        },
        {
          "@type": "Question",
          name: "How should Japanese text be counted?",
          acceptedAnswer: { "@type": "Answer", text: "Japanese does not normally separate words with spaces, so the browser's segmentation is a guide rather than an exact word count. For submissions with strict limits, check the character count as well." },
        },
      ],
    });
  }
  if (page === "readingTime") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to estimate reading and speaking time in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste or open your text", text: "Paste or type your text into the box, or open a plain-text file from your device. The file is read locally in your browser." },
        { "@type": "HowToStep", position: 2, name: "Choose reading or speaking mode and set your speed", text: "Pick silent reading or speaking aloud, then move the words-per-minute slider. Reading starts at 200 wpm and speaking at 140 wpm, both labelled averages that you can change. Speaking mode can also add a pause allowance for presentations." },
        { "@type": "HowToStep", position: 3, name: "Read or copy the estimate", text: "The result shows the time as minutes:seconds plus a plain-language breakdown, and the time the other mode would take. Copy the summary if you need it for planning." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this reading time calculator free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Paste, type or open a text file and the estimate updates live in your browser." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The counting and timing happen locally in your browser tab, including when you open a text file. This tool does not upload your text or save it on a server." },
        },
        {
          "@type": "Question",
          name: "What reading and speaking speeds does it assume?",
          acceptedAnswer: { "@type": "Answer", text: "Silent reading starts at 200 words per minute and speaking at 140 words per minute. Published studies put average adult silent reading near 200–238 wpm and presentation speaking near 130–150 wpm. These are averages, not promises, and both sliders can be changed to match your own pace." },
        },
        {
          "@type": "Question",
          name: "What is the pause allowance for?",
          acceptedAnswer: { "@type": "Answer", text: "Real speeches include pauses, slide changes and audience reactions. Speaking mode can add a pause allowance (for example 10–25%) on top of the raw speaking time so presentation planning is more realistic." },
        },
        {
          "@type": "Question",
          name: "How accurate is the estimate?",
          acceptedAnswer: { "@type": "Answer", text: "It is a planning estimate only. Real speed changes with language, text difficulty, familiarity and purpose. The honest way to calibrate is to time yourself on one page and then set the sliders to your own pace." },
        },
        {
          "@type": "Question",
          name: "How does it handle Japanese and other scripts without spaces?",
          acceptedAnswer: { "@type": "Answer", text: "Word counting follows spaces, punctuation and browser segmentation. Scripts that do not separate words with spaces, such as Japanese, are approximated, so treat those results as a rough guide and check character counts for strict limits." },
        },
      ],
    });
  }
  if (page === "base64") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to encode or decode Base64 in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose Encode or Decode", text: "Pick Encode to turn text into Base64, or Decode to turn Base64 back into readable text." },
        { "@type": "HowToStep", position: 2, name: "Paste text or open a small file", text: "Paste text into the box, or use the small-file option (under 2 MB) to turn a local file into Base64 text. Nothing is uploaded." },
        { "@type": "HowToStep", position: 3, name: "Copy, swap or download", text: "Copy the result, swap it back through the opposite mode to check the round trip, or download it as a .txt file." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is Base64 encryption?",
          acceptedAnswer: { "@type": "Answer", text: "No. Base64 is encoding, not encryption. Anyone who has the Base64 string can decode it without a key, so never use Base64 to protect passwords, tokens or secrets." },
        },
        {
          "@type": "Question",
          name: "Does this tool upload my text or file?",
          acceptedAnswer: { "@type": "Answer", text: "No. Text and files are processed locally in your browser tab. Nothing is uploaded, saved on a server, or shared by this tool." },
        },
        {
          "@type": "Question",
          name: "What is URL-safe Base64?",
          acceptedAnswer: { "@type": "Answer", text: "URL-safe Base64 replaces + with - and / with _, and usually drops the trailing = padding. It carries the same data in an alphabet that is safer inside URLs and filenames." },
        },
        {
          "@type": "Question",
          name: "Why did my Base64 fail to decode?",
          acceptedAnswer: { "@type": "Answer", text: "Usually a character is missing, extra or changed, padding is in the wrong place, or the decoded bytes are binary data rather than UTF-8 text. This tool explains the specific problem instead of silently showing garbled output." },
        },
        {
          "@type": "Question",
          name: "Can I encode a file to Base64 here?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, for small files under 2 MB. Base64 output is about one-third larger than the original file, and very large files can slow or freeze a browser tab, so this feature is deliberately limited." },
        },
      ],
    });
  }
  if (page === "slugGenerator") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to turn a title into a URL slug in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste your title", text: "Type or paste the page title, product name or heading. Add one title per line to convert a whole list at once." },
        { "@type": "HowToStep", position: 2, name: "Choose your options", text: "Pick a hyphen or underscore separator, decide whether English stop words are removed, whether accented Latin letters become plain letters, and set a maximum length if you need one." },
        { "@type": "HowToStep", position: 3, name: "Copy the slug", text: "Copy the lowercase slug (or all slugs in batch mode) and paste it into your CMS, then check it once before publishing — changing a live URL later needs a redirect." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a URL slug?",
          acceptedAnswer: { "@type": "Answer", text: "The slug is the readable last part of a web address that names one page, such as the 'slug-generator' in example.com/slug-generator. It is usually lowercase words joined by hyphens." },
        },
        {
          "@type": "Question",
          name: "Does a clean slug guarantee better Google ranking?",
          acceptedAnswer: { "@type": "Answer", text: "No. A short, descriptive slug helps people read, type and share a URL, and it describes the page honestly. Ranking and indexing depend on the page content, links and the site as a whole — no slug can guarantee them." },
        },
        {
          "@type": "Question",
          name: "Should I use hyphens or underscores in a slug?",
          acceptedAnswer: { "@type": "Answer", text: "Hyphens are the common choice for web URLs because search engines read them as word separators, while an underscore can read as one joined word. Underscores are still handy for file names, so this tool offers both." },
        },
        {
          "@type": "Question",
          name: "What happens to accented and non-Latin letters?",
          acceptedAnswer: { "@type": "Answer", text: "Accented Latin letters become plain ones (é becomes e) when that option is on, or are removed when it is off. This tool does not transliterate Japanese or Urdu-script text: those characters are removed, so type the romanized form (romaji or Roman Urdu) yourself and check the result." },
        },
        {
          "@type": "Question",
          name: "Which stop words are removed?",
          acceptedAnswer: { "@type": "Answer", text: "Only common English words such as a, an, the, and, or and of. Small words in other languages are left untouched, and the option can be switched off whenever a small word carries meaning in your title." },
        },
        {
          "@type": "Question",
          name: "Is my text uploaded anywhere?",
          acceptedAnswer: { "@type": "Answer", text: "No. The slug is built in your browser tab. Your titles are not uploaded, stored on a server or shared by this tool, and closing the tab forgets everything." },
        },
      ],
    });
  }
  if (page === "jsonFormatter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to format and validate JSON in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste or open your JSON", text: "Paste JSON into the input box or open a .json or .txt file. Nothing is uploaded; parsing happens in your browser." },
        { "@type": "HowToStep", position: 2, name: "Choose Beautify, Minify or Validate", text: "Pick 2 spaces, 4 spaces or a tab, then Beautify to reindent, Minify to remove whitespace, or Validate to check that the document is legal JSON." },
        { "@type": "HowToStep", position: 3, name: "Inspect, copy or download", text: "Walk the result as a collapsible tree, then copy the output or download it as a .json file." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is my JSON uploaded anywhere?",
          acceptedAnswer: { "@type": "Answer", text: "No. The document is parsed in your browser tab with JSON.parse. It is not uploaded, stored on a server, saved to an account or shared by this tool. Even so, never paste passwords, API keys or access tokens into any website tool." },
        },
        {
          "@type": "Question",
          name: "Does formatting change my data?",
          acceptedAnswer: { "@type": "Answer", text: "No. Beautifying and minifying change whitespace only. The tool does not sort keys, repair invalid JSON or change values." },
        },
        {
          "@type": "Question",
          name: "Why does the validator reject comments and trailing commas?",
          acceptedAnswer: { "@type": "Answer", text: "Comments, trailing commas, single quotes and unquoted keys are JavaScript or JSON5 habits, not standard JSON. Remove them or convert the document first; this tool reports the parser error instead of guessing a repair." },
        },
        {
          "@type": "Question",
          name: "Why is there no exact error position for some mistakes?",
          acceptedAnswer: { "@type": "Answer", text: "Browsers report positions differently. When the parser error includes a position, this tool converts it to line and column. When it does not, the tool shows the parser's own message and says the exact position is unavailable rather than inventing one." },
        },
        {
          "@type": "Question",
          name: "Can this tool check whether my API will accept the JSON?",
          acceptedAnswer: { "@type": "Answer", text: "No. It validates syntax only. It does not check a JSON Schema, required fields, field types or business rules, so a syntactically valid document can still be rejected by an API." },
        },
        {
          "@type": "Question",
          name: "What happens with repeated keys and very large numbers?",
          acceptedAnswer: { "@type": "Answer", text: "Standard JSON.parse keeps only the last value when a key repeats, and whole numbers beyond 2^53−1 can lose precision. Keep identifiers and large counters as strings when exact digits matter." },
        },
      ],
    });
  }
  if (page === "loremIpsum") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to generate lorem ipsum placeholder text in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose a mode and amount", text: "Pick paragraphs, sentences or an exact word count, and set how many you need. Paragraphs suit page layouts, sentences suit cards and excerpts, and word counts suit tight slots." },
        { "@type": "HowToStep", position: 2, name: "Pick an output format", text: "Choose plain text for design tools and documents, HTML <p> paragraphs for code, or an HTML list. Decide whether the text starts with the classic Lorem ipsum dolor sit amet opening." },
        { "@type": "HowToStep", position: 3, name: "Copy or download", text: "Check the word and character counts, then copy the placeholder text or download it as a .txt file. Generate a fresh sample any time; every run differs, so download to keep a version." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is anything I generate uploaded anywhere?",
          acceptedAnswer: { "@type": "Answer", text: "No. The word bank lives in the page and the text is shuffled in your browser tab. Nothing is typed into the tool, uploaded, stored on a server, or shared by it." },
        },
        {
          "@type": "Question",
          name: "Can I publish lorem ipsum on my live website?",
          acceptedAnswer: { "@type": "Answer", text: "No. Placeholder text has no meaning and no SEO value, and leftover filler makes a page look unfinished. Replace every block with real content before launch, and search your site for “lorem ipsum” to catch stragglers." },
        },
        {
          "@type": "Question",
          name: "Does lorem ipsum mean anything?",
          acceptedAnswer: { "@type": "Answer", text: "No. It descends from a passage in Cicero's de Finibus (45 BC), but the words were scrambled centuries ago precisely so the result carries no message — readers judge the layout instead of the text." },
        },
        {
          "@type": "Question",
          name: "Can I generate an exact number of characters?",
          acceptedAnswer: { "@type": "Answer", text: "Not directly. Generate by words and watch the character counter, then raise or lower the word count until the total sits close to the limit you need." },
        },
        {
          "@type": "Question",
          name: "Why does every generation look different?",
          acceptedAnswer: { "@type": "Answer", text: "The generator shuffles the traditional Latin word bank on every run, so each result is a fresh sample with different sentence shapes. That is a feature for testing, but it means you should download a version you want to keep." },
        },
        {
          "@type": "Question",
          name: "Which output format should I choose?",
          acceptedAnswer: { "@type": "Answer", text: "Plain text for Figma, Canva, documents and slides; HTML <p> when pasting paragraphs into code; and the list format when you need ready-made <ul> items for menus, benefits or specifications." },
        },
      ],
    });
  }
  if (page === "daysBetween") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to count the days between two dates in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Pick the start and end dates", text: "Choose a start date and an end date in the date pickers, or use the quick buttons to set either date to today. Swap the dates with one button if the end comes first." },
        { "@type": "HowToStep", position: 2, name: "Choose inclusive or exclusive counting", text: "Exclusive counting measures the gap between the dates (May 1 to May 2 = 1 day). Inclusive counting counts both the first and the last day (May 1 to May 2 = 2 days). The result updates instantly." },
        { "@type": "HowToStep", position: 3, name: "Read the breakdown — or add/subtract days", text: "See total days, Monday–Friday business days, weekend days, whole weeks plus leftover days, and approximate months/years. Or switch to Add / subtract days mode to find the date N days before or after any date." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "How does this calculator count the days between two dates?",
          acceptedAnswer: { "@type": "Answer", text: "It subtracts the two calendar dates using UTC date math: May 1 to May 2 is 1 day. Because the dates have no time of day, daylight-saving changes and time zones cannot shift the answer, and February 29 in leap years is counted automatically." },
        },
        {
          "@type": "Question",
          name: "What is the difference between inclusive and exclusive counting?",
          acceptedAnswer: { "@type": "Answer", text: "Exclusive counting is the plain gap between the dates: May 1 to May 2 = 1 day. Inclusive counting adds the start day, so both the first and the last day count: May 1 to May 2 = 2 days. Use inclusive when both dates belong to the period, such as the first and last day of a booking." },
        },
        {
          "@type": "Question",
          name: "Does the business-day count subtract public holidays?",
          acceptedAnswer: { "@type": "Answer", text: "No. Business days here mean Monday to Friday only. This calculator has no country holiday calendar, so public holidays are never subtracted. For legal, payroll or court deadlines, always check the result against the official calendar for your country or region." },
        },
        {
          "@type": "Question",
          name: "Why are months and years labelled approximate?",
          acceptedAnswer: { "@type": "Answer", text: "Real months have 28, 29, 30 or 31 days, so a fixed day count cannot equal an exact number of calendar months. The tool shows months and years as approximate equivalents using an average month of about 30.44 days. The exact, reliable figure is always the total day count." },
        },
        {
          "@type": "Question",
          name: "Can I find the date N days from today?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. Switch to Add / subtract days mode, set the base date (today is filled in by default), enter the number of days, choose Add or Subtract, and the resulting calendar date is shown with its weekday." },
        },
        {
          "@type": "Question",
          name: "Are my dates uploaded or stored anywhere?",
          acceptedAnswer: { "@type": "Answer", text: "No. The calculation runs entirely in your browser tab using your device's date functions. Nothing is uploaded, stored on a server, saved to an account or shared, and closing the tab forgets the dates." },
        },
      ],
    });
  }
  if (page === "randomNumber") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to draw random numbers, flip a coin or roll dice in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Pick a mode and your settings", text: "Choose Numbers, Coin Flip or Dice Roll. For numbers, set the minimum, maximum and how many numbers to draw, and decide whether repeats are allowed and whether the result should be sorted." },
        { "@type": "HowToStep", position: 2, name: "Generate with one tap", text: "Press Generate, Flip or Roll. The draw uses your browser's cryptographic random source (crypto.getRandomValues), so it is unpredictable and fair for everyday use." },
        { "@type": "HowToStep", position: 3, name: "Copy or check the history", text: "Copy the drawn numbers with one tap, or scroll to the in-tab history to reuse an earlier draw. The history lives only in this tab and disappears when you close it." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "What does 'allow repeats off' mean?",
          acceptedAnswer: { "@type": "Answer", text: "With repeats on, the same number can be drawn more than once in a set, like rolling the same die face twice. With repeats off, every number in the set is unique, like drawing numbered tickets out of a hat without putting them back. You cannot draw more unique numbers than the range contains." },
        },
        {
          "@type": "Question",
          name: "Is this 'true random' like atmospheric noise?",
          acceptedAnswer: { "@type": "Answer", text: "No. This tool uses your browser's cryptographic random source — the same kind of randomness browsers and operating systems use for security. It is strong and unpredictable for games, classrooms and giveaways, but it is not randomness harvested from a physical source such as atmospheric noise, and it is not certified for regulated gambling, official lotteries or legal prize draws." },
        },
        {
          "@type": "Question",
          name: "Can this tool improve my lottery chances or predict numbers?",
          acceptedAnswer: { "@type": "Answer", text: "No tool can. Every draw is independent and unpredictable, which is exactly what makes it random. Never pay for 'predicted' lottery numbers, and never gamble money you cannot afford to lose." },
        },
        {
          "@type": "Question",
          name: "Are my ranges and results uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. The drawing happens entirely in your browser tab with its built-in cryptographic random function. The short history is kept only in this tab's memory, is never sent anywhere, and is gone when you close the tab." },
        },
        {
          "@type": "Question",
          name: "Why are the coin flip and dice roller in the same tool?",
          acceptedAnswer: { "@type": "Answer", text: "Because they are the same everyday job — a fair, quick random pick — and switching modes here is faster than opening separate coin-flip and dice-roller pages. The coin mode keeps heads/tails counts for classroom experiments, and the dice mode rolls 1 to 6 dice with the total." },
        },
      ],
    });
  }
  if (page === "onlineTimer") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to run a countdown or stopwatch with laps in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose Timer or Stopwatch", text: "Pick Countdown Timer for a fixed length, or Stopwatch to measure how long something takes. For the countdown, type hours, minutes and seconds or tap a preset such as 5, 15 or 25 minutes." },
        { "@type": "HowToStep", position: 2, name: "Start with one tap", text: "Press Start. That tap also unlocks the finish sound, because browsers only allow audio after you interact with the page. Use Pause and Resume freely — timing is recomputed from timestamps, not counted ticks." },
        { "@type": "HowToStep", position: 3, name: "Use laps, fullscreen and copy", text: "On the stopwatch, press Lap at each checkpoint to record lap and total times, then copy the lap table. Use Fullscreen for big digits and Keep screen on where the browser supports wake lock." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Does this online timer keep working if I switch tabs?",
          acceptedAnswer: { "@type": "Answer", text: "The reading is recomputed from real timestamps (performance.now deadlines), so when you return to the tab it snaps to approximately the correct remaining or elapsed time instead of resuming from a frozen display. Browsers still throttle hidden tabs, so the finish beep can be delayed and the display only updates when the browser allows it. Keep the tab visible when the exact end moment matters." },
        },
        {
          "@type": "Question",
          name: "Why did my countdown finish without a sound?",
          acceptedAnswer: { "@type": "Answer", text: "The usual causes are a muted device, the sound toggle being off, or the browser blocking audio. Browsers only allow sound after you have interacted with the page, so starting the timer with a tap normally unlocks the beep. The tool also flashes its finish state on screen, and vibration is not used. Check the device volume and keep the tab visible for the final minute when the beep matters." },
        },
        {
          "@type": "Question",
          name: "What is the difference between lap time and total time?",
          acceptedAnswer: { "@type": "Answer", text: "Lap time is how long that single lap took, measured from the previous lap press. Total time is the full elapsed time from the very start at that same moment. Four laps with lap times of about one minute each produce totals of roughly one, two, three and four minutes." },
        },
        {
          "@type": "Question",
          name: "Can I use this timer for Pomodoro focus sessions?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. The 25-minute and 5-minute presets are the classic Pomodoro focus and break lengths. Alternate them manually: 25 minutes of focused work, then a 5-minute break. Presets are conveniences only and make no productivity or health promise." },
        },
        {
          "@type": "Question",
          name: "Is it safe to use this timer for medical or emergency timing?",
          acceptedAnswer: { "@type": "Answer", text: "No. A browser timer is not a certified instrument: background tabs are throttled, devices sleep, and audio can be blocked or delayed. Never rely on it for medication doses, safety cut-offs, laboratory timing or emergencies — use a dedicated physical timer or medical device for anything where a late signal could cause harm." },
        },
        {
          "@type": "Question",
          name: "Are my times and laps uploaded or stored anywhere?",
          acceptedAnswer: { "@type": "Answer", text: "No. The countdown deadline, stopwatch state and lap list live only in this browser tab's memory. Nothing is uploaded, saved to an account or shared, and closing the tab clears everything. If you need a record, use Copy laps before closing." },
        },
      ],
    });
  }
  if (page === "invoiceGenerator") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to make an invoice in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Add your and your client's details", text: "Fill in From with your business name, address and contact details, and Bill To with your client's details. Add a tax or registration number only if you are registered for it in your country." },
        { "@type": "HowToStep", position: 2, name: "Add line items and check the totals", text: "Describe each service or product with quantity and rate. Set discount % and tax % and watch subtotal, discount on the subtotal, tax on the discounted amount and total update step by step in your chosen currency (Intl.NumberFormat)." },
        { "@type": "HowToStep", position: 3, name: "Print or save as PDF and send", text: "Press Print / Save as PDF. Only the invoice prints. Save the PDF as your own record and send it the same day. Your draft stays only in this browser — nothing is uploaded." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this invoice generator free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Build the invoice, check the live totals and print or save as PDF from your browser." },
        },
        {
          "@type": "Question",
          name: "How are discount and tax calculated?",
          acceptedAnswer: { "@type": "Answer", text: "Subtotal is quantity times rate for each line, added together. The discount percentage comes off the subtotal first. Tax is then charged on the amount after discount, and the total is that discounted amount plus its tax. Every intermediate figure is shown so you can verify it." },
        },
        {
          "@type": "Question",
          name: "Is this accounting or tax advice? Will my invoice be legally compliant?",
          acceptedAnswer: { "@type": "Answer", text: "No. This is a document generator that does the arithmetic, not accounting, tax or legal advice. Whether you must charge tax, which rate applies, which registration number to show and how invoices must be numbered depend on your country and status. Verify them with your tax authority or an accountant before sending." },
        },
        {
          "@type": "Question",
          name: "Is my invoice uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No upload happens. The invoice is built in your browser and printed with your browser's own print function. The draft is saved only in this browser on this device so you can return to it, and Clear All removes it. Save the PDF yourself — there is no server copy." },
        },
        {
          "@type": "Question",
          name: "Which currencies are supported and how are they formatted?",
          acceptedAnswer: { "@type": "Answer", text: "Sixteen currencies are listed, including USD, EUR, GBP, PKR, INR, AED, JPY and others. Amounts are formatted with the browser's Intl.NumberFormat for the chosen currency, so grouping, decimal separators and zero-decimal currencies follow that currency's conventions." },
        },
      ],
    });
  }
  if (page === "imageResizer") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to resize and crop an image in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Add your image", text: "Drop a JPG, PNG or WebP image or click to browse. It is decoded locally in your browser — EXIF orientation is respected where the browser supports it — and its real dimensions and file size are shown. Nothing is uploaded." },
        { "@type": "HowToStep", position: 2, name: "Set the size or crop", text: "Resize by exact pixels with the aspect-ratio lock, by percentage, or with a social/document preset (Instagram, YouTube thumbnail, X, profile, A4 pixels). Or open Crop, pick a ratio such as 1:1, 4:5 or 16:9, and drag the box over the part that matters, then size the crop." },
        { "@type": "HowToStep", position: 3, name: "Choose format and download", text: "Pick JPG, PNG or WebP and set quality for JPG/WebP (PNG is always lossless). Compare Before/After dimensions and file size, then download. Shrinking discards detail; enlarging cannot add real detail." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this image resizer free? Is my image uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up, and your image is never uploaded. Decoding, resizing, cropping and encoding all happen in your browser tab with the Canvas API; closing the tab leaves nothing behind." },
        },
        {
          "@type": "Question",
          name: "What is the difference between this Resizer and the Image Compressor?",
          acceptedAnswer: { "@type": "Answer", text: "This Resizer changes pixel dimensions and crop — it makes an image 1080×1080 instead of 4000×3000, or cuts a square from a wide photo. The Image Compressor keeps the exact same dimensions and only re-encodes the file so it weighs less. Resize when the dimensions are wrong; compress when only the file is too heavy." },
        },
        {
          "@type": "Question",
          name: "Will resizing or enlarging lose quality?",
          acceptedAnswer: { "@type": "Answer", text: "Shrinking blends neighbouring pixels together, so fine detail is discarded permanently — the way back is your original file. Enlarging invents in-between pixels by blending neighbours, so the result looks softer, never sharper: no resizer can add real detail the camera never captured. JPG and WebP additionally trade quality for file size at each re-encode, controlled by the quality slider; PNG stays exact but larger." },
        },
        {
          "@type": "Question",
          name: "Why did my phone photo appear sideways, and does this tool fix it?",
          acceptedAnswer: { "@type": "Answer", text: "Phones often store the photo un-rotated and hide the upright instruction in EXIF metadata. This tool decodes with createImageBitmap and the from-image orientation flag where the browser supports it, so most phone photos land upright automatically. Where a browser takes the fallback path, the tool says so under the preview so you can rotate the photo in your photo app first." },
        },
        {
          "@type": "Question",
          name: "Which formats and sizes are supported?",
          acceptedAnswer: { "@type": "Answer", text: "Input and output are JPG, PNG and WebP — the formats browsers can reliably decode and encode. Output is capped at 8000 pixels on a side, far above social, web and print-document needs. A HEIC photo from an iPhone must first be shared or exported as JPG, because browsers cannot decode HEIC." },
        },
        {
          "@type": "Question",
          name: "How do the social and A4 presets work? Are they guaranteed?",
          acceptedAnswer: { "@type": "Answer", text: "Presets simply fill in widely used pixel sizes: Instagram post 1080×1080, story 1080×1920, YouTube thumbnail 1280×720, X post 1200×675, profile 800×800, and A4 expressed as pixels at 150 DPI (1240×1754) for screen documents and 300 DPI (2480×3508) for print. Platforms change their recommended sizes without notice, so treat presets as current best practice and trust the destination uploader's own preview." },
        },
      ],
    });
  }
  if (page === "imageConverter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert an image format in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Add your images", text: "Drop one image or a whole batch, or click to browse. Each file's detected format, dimensions and size are shown after a real decode check in your browser — nothing is uploaded. Files this browser cannot decode, such as most HEIC photos, are marked unreadable with the reason." },
        { "@type": "HowToStep", position: 2, name: "Choose format, quality and background", text: "Pick PNG, JPG or WebP. Set quality for JPG/WebP (PNG is always lossless). If you choose JPG and the image has transparency, pick the background colour that will fill it — white by default — because JPG cannot store transparency." },
        { "@type": "HowToStep", position: 3, name: "Convert and download", text: "Convert the batch, compare Before/After file sizes per file and in total, then download files one by one or all in turn. Dimensions never change — use the Image Resizer for size, the Image Compressor for file weight at the same size." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this image converter free? Are my images uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up, and your images are never uploaded. Decoding and re-encoding happen in your browser tab with the Canvas API; closing the tab leaves nothing behind." },
        },
        {
          "@type": "Question",
          name: "Which formats can I convert, and why not HEIC or AVIF output?",
          acceptedAnswer: { "@type": "Answer", text: "Output is PNG, JPG or WebP — the formats browsers can reliably encode with Canvas. Input is whatever this browser can decode, normally JPG, PNG, WebP, GIF, BMP and SVG stills. HEIC/HEIF photos from iPhones usually cannot be decoded in browsers, so export them as JPG first; AVIF decoding varies by browser and AVIF encoding is not reliably available, so neither is promised." },
        },
        {
          "@type": "Question",
          name: "What happens to transparency when I convert to JPG?",
          acceptedAnswer: { "@type": "Answer", text: "JPG has no transparency, so transparent pixels must be painted over a background. This converter warns you and lets you choose that background — white by default, black, or any custom colour — before anything is flattened. To keep transparency, convert to PNG or WebP instead, and always keep your transparent original." },
        },
        {
          "@type": "Question",
          name: "Does converting JPG to PNG improve quality? Does converting change dimensions?",
          acceptedAnswer: { "@type": "Answer", text: "No to both. Converting never changes width or height, and JPG to PNG cannot restore detail JPG already discarded — it only makes a larger file that looks the same. JPG or WebP at lower quality does trade sharpness for a smaller file, so convert from your original, keep the original, and compare the Before/After sizes shown for every file." },
        },
        {
          "@type": "Question",
          name: "What is the difference between Converter, Resizer and Compressor?",
          acceptedAnswer: { "@type": "Answer", text: "The Converter changes the file format at the same dimensions. The Image Resizer changes pixel dimensions and crop. The Image Compressor keeps dimensions and only re-encodes so the file weighs less. Convert when the format is wrong, resize when the dimensions are wrong, compress when only the file is too heavy." },
        },
        {
          "@type": "Question",
          name: "Can I convert many images at once?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. Add a batch to the queue, choose one output format and quality, convert all, then download per file or use Download All, which saves each converted file one by one. Animated GIF or WebP converts as a still first frame, and camera EXIF metadata is not carried into the converted file." },
        },
      ],
    });
  }
  if (page === "imageToText") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to extract text from an image in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Add one image and pick the language", text: "Drop one JPG, PNG or WebP image, click to browse, or paste it. Choose the language of the printed text in the picture — English, Spanish, German, French, Turkish, Portuguese, Italian, Dutch, Norwegian, Japanese or Urdu. On first use, the OCR engine and that language's data download from a CDN and are cached afterwards; your image itself never leaves your device." },
        { "@type": "HowToStep", position: 2, name: "Extract the text", text: "Press Extract Text and watch the real progress: engine start, language download, then recognition. Clean printed text in good light reads far better than handwriting, which often fails; skewed, blurry or decorative-font images produce mistakes. No fixed accuracy percentage is promised." },
        { "@type": "HowToStep", position: 3, name: "Proofread, copy or download", text: "Proofread the extracted text in the editable box — especially numbers, dates and names — then copy it or download it as a .txt file. Word and character counts update as you edit." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this image to text tool free? Is my image uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up, and your image is never uploaded. Recognition runs in your browser tab with the open-source Tesseract OCR engine (WebAssembly). The engine and the language data you pick download from a CDN on first use and are cached by your browser afterwards, so the first run needs internet — but that download is data files, never your image." },
        },
        {
          "@type": "Question",
          name: "Which languages and image formats are supported?",
          acceptedAnswer: { "@type": "Answer", text: "OCR languages with genuinely available Tesseract data: English, Spanish, German, French, Turkish, Portuguese, Italian, Dutch, Norwegian, Japanese and Urdu. One image at a time: JPG, PNG or WebP (and other images your browser can decode). PDFs are not images — export a page as JPG or PNG first. HEIC photos usually cannot be read in browsers; export them as JPG first." },
        },
        {
          "@type": "Question",
          name: "How accurate is the OCR? Does it read handwriting?",
          acceptedAnswer: { "@type": "Answer", text: "No fixed accuracy percentage is promised, because results depend on the image. Clean printed text in good light reads far better than handwriting, which often fails. Skewed, blurry, low-resolution or decorative-font images produce mistakes, and Japanese and Urdu-script text are materially harder than clean Latin text. The result is editable so you can proofread and fix it." },
        },
        {
          "@type": "Question",
          name: "Why is Roman Urdu misread, and which language should I pick?",
          acceptedAnswer: { "@type": "Answer", text: "Roman Urdu is Urdu written in Latin letters, so the engine's shape matcher treats it as English while its vocabulary is Urdu; no Tesseract pack is trained for it. Pick English, expect errors in names and local words, and proofread carefully. For Urdu in its own script, pick the Urdu (urd) pack." },
        },
        {
          "@type": "Question",
          name: "Does it work offline?",
          acceptedAnswer: { "@type": "Answer", text: "Only after the first use. The engine and the chosen language data must download from a CDN once and are then cached by your browser; if you are offline on the very first use, the download fails and OCR cannot start. Your image is never part of any network request." },
        },
      ],
    });
  }
  if (page === "pdfSplitter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to split a PDF and extract pages in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Add one PDF and check its page count", text: "Drop one PDF or click to browse. The file is read locally with the open-source pdf-lib library and its real page count is shown — the file itself is never uploaded. Very large PDFs may be slow in a browser; password-protected files cannot be opened." },
        { "@type": "HowToStep", position: 2, name: "Type the pages and choose the output", text: "Write the pages you need with commas and hyphens, like 1-3, 5, 8-10. Choose One PDF to combine all selected pages into a single file in the order written, or Separate PDFs to get one file per group." },
        { "@type": "HowToStep", position: 3, name: "Download and verify", text: "Download each new PDF (or use Download all) and check its real page count and size, which are shown next to every file. Splitting copies pages exactly — it does not edit text, compress, or OCR scanned pages." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this PDF splitter free? Is my file uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up, and your file is never uploaded. Splitting runs entirely in your browser tab with the open-source pdf-lib library, so you can split private documents without sending them to a server." },
        },
        {
          "@type": "Question",
          name: "How do I extract only some pages from a PDF?",
          acceptedAnswer: { "@type": "Answer", text: "Add the PDF, note its real page count, then type the pages like 1-3, 5, 8-10: commas separate groups and a hyphen means a range. Pick One PDF for a single combined file, or Separate PDFs for one file per group, then download." },
        },
        {
          "@type": "Question",
          name: "Why did my PDF fail to open?",
          acceptedAnswer: { "@type": "Answer", text: "Password-protected PDFs cannot be opened by browser PDF libraries — remove the password in a desktop PDF app first. Damaged files, unusual formats, and very large PDFs that exceed the browser's memory can also fail; try smaller ranges or a desktop tool." },
        },
        {
          "@type": "Question",
          name: "Does splitting a PDF compress it or make scanned text editable?",
          acceptedAnswer: { "@type": "Answer", text: "No. Splitting copies pages exactly as they are: file sizes stay roughly proportional to the pages kept, text is not edited, and a scanned page stays a picture of text — there is no OCR. For readable text from a scan, use the Image to Text tool on an exported page image." },
        },
        {
          "@type": "Question",
          name: "What is the difference between splitting and merging?",
          acceptedAnswer: { "@type": "Answer", text: "Splitting takes one PDF apart: selected pages become new, smaller PDFs. Merging does the opposite — several PDFs become one. Use this PDF Splitter to extract pages, and the PDF Tools page (Merge) to combine files." },
        },
      ],
    });
  }
  if (page === "usernameGenerator") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to generate and shortlist username ideas in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Pick a theme and seed word", text: "Choose gaming, creator, study, business, aesthetic or funny. Add one optional seed word that matters to you, or leave it blank. The word is cleaned to lowercase letters and numbers inside your browser." },
        { "@type": "HowToStep", position: 2, name: "Set numbers, separator and length", text: "Turn on a short number suffix for some results, choose no separator, a dot or an underscore, and pick any, short, medium or long length. Generate a batch of 20 ideas, with the character count shown on every name. Duplicates are removed within the batch only." },
        { "@type": "HowToStep", position: 3, name: "Copy, favourite, then check where it counts", text: "Click a name or Copy button to copy it, tap the heart to keep finalists in this tab, and use Copy all favourites or Clear favourites. Availability is not checked here: verify the exact name, username rules and trademarks on your chosen platform and relevant trademark sources before registering." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this username generator free? Is anything uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up. Generation uses local word banks in your browser tab. Your seed word and favourites are not uploaded to a server or written to permanent storage by this tool; favourites stay only in the open tab until you clear them or close it." },
        },
        {
          "@type": "Question",
          name: "Are the generated usernames available on YouTube, TikTok, Instagram or other platforms?",
          acceptedAnswer: { "@type": "Answer", text: "Availability is not checked. A name shown here may already be taken, reserved, suspended or disallowed. Check the exact name on the platform itself and follow that platform's current username rules before you rely on it." },
        },
        {
          "@type": "Question",
          name: "How does the seed word and theme change the results?",
          acceptedAnswer: { "@type": "Answer", text: "Themes load different clean adjective and noun banks for gaming, creator, study, business, aesthetic or funny names. A seed word becomes part of patterns such as seed-plus-noun or adjective-plus-seed, while the numbers, separator and length controls reshape the batch." },
        },
        {
          "@type": "Question",
          name: "Can I use a generated username for a business or channel?",
          acceptedAnswer: { "@type": "Answer", text: "Treat it as a brainstorming candidate, not legal clearance. Avoid names that copy real brands, celebrities, teams in an impersonating way, or official/support accounts. Check the platform, search the exact phrase, and check relevant trademark sources or professional advice before investing in branding." },
        },
        {
          "@type": "Question",
          name: "Why does every name show a character count?",
          acceptedAnswer: { "@type": "Answer", text: "Platforms have different and changing limits for total length, dots, underscores and repeated separators. The character count makes shortlisting easier, but it is not a claim that a name passes any particular platform's rules." },
        },
      ],
    });
  }
  if (page === "morseCodeTranslator") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to translate Morse code in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Pick a direction and type", text: "Choose Text → Morse and type or paste your message, or choose Morse → Text and paste dots and dashes with one space between letters and / between words. The result appears live as you type." },
        { "@type": "HowToStep", position: 2, name: "Check the result and the chart", text: "Copy the Morse code or the decoded text. Characters outside A–Z, 0–9 and common punctuation are listed instead of being silently changed, and unknown Morse groups decode as ?. Use the full chart on the page to look up any letter, digit or mark." },
        { "@type": "HowToStep", position: 3, name: "Play it as sound or light", text: "Press Play sound to hear the beeps at 5–40 WPM, or turn on the flash lamp to see them. Read the flashing-light caution first if flashing lights bother you, and press Stop at any time." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this Morse code translator free? Is my text uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up. Conversion, sound and flash all run in your browser tab with the Web Audio API — nothing you type is uploaded, stored or logged by this tool." },
        },
        {
          "@type": "Question",
          name: "How do I write Morse code so it decodes correctly?",
          acceptedAnswer: { "@type": "Answer", text: "Use a dot (.) for a short signal and a dash (-) for a long one. Put one space between letters of the same word and a slash with spaces ( / ) between words, for example ... --- ... for SOS. Morse is case-insensitive; decoded text is shown in capitals." },
        },
        {
          "@type": "Question",
          name: "What do the ? marks in my decoded text mean?",
          acceptedAnswer: { "@type": "Answer", text: "A ? means that dot-dash group matches no letter, digit or punctuation mark in International Morse — usually a merged or split letter. Check the spacing around that group against the chart on the page and try again." },
        },
        {
          "@type": "Question",
          name: "Can I convert Urdu, Arabic or Japanese text into Morse code?",
          acceptedAnswer: { "@type": "Answer", text: "Not directly. Standard International Morse carries Latin letters, digits and common punctuation only. Write the words in Latin letters first (transliteration) and convert that. Japanese kana Morse (Wabun) is a separate system and is not used here." },
        },
        {
          "@type": "Question",
          name: "What does the WPM speed mean, and is the flash safe?",
          acceptedAnswer: { "@type": "Answer", text: "WPM is words per minute using the standard PARIS timing: one dot lasts 1200 ÷ WPM milliseconds, a dash is 3 dots, and the gaps are 1, 3 and 7 dots. The flash lamp simply follows that timing and never strobes faster; if flashing lights bother you or you have photosensitive epilepsy, leave the flash off and use sound only." },
        },
      ],
    });
  }
  if (page === "voiceRecorder") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to record your voice online in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Allow the microphone and record", text: "Press Record and allow microphone access when the browser asks. Speak, and use Pause whenever you need a break, then Resume to keep going on the same take." },
        { "@type": "HowToStep", position: 2, name: "Stop and play the take back", text: "Press Stop and listen to the recording on the page. The tool shows the real saved format (WebM or MP4), the file size and the length — nothing is converted or uploaded behind your back." },
        { "@type": "HowToStep", position: 3, name: "Download it or re-record", text: "Press Download recording to save the file to your device, or Discard & re-record to throw the take away and start again. Recordings only exist on your device until you save them." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this voice recorder free, and is my voice uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up. Recording runs entirely in your browser with the MediaRecorder API — your voice is never uploaded, stored on a server or shared by this tool. It stays in this tab until you download it." },
        },
        {
          "@type": "Question",
          name: "Why is my download a WebM or MP4 file, not MP3?",
          acceptedAnswer: { "@type": "Answer", text: "The browser itself chooses the recording format: Chrome and Firefox usually save WebM, Safari saves MP4. We label and save that real format instead of promising an MP3 the browser never made. If you need another format, you can convert the downloaded file with a tool you trust." },
        },
        {
          "@type": "Question",
          name: "Can I pause a recording and continue on the same take?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. Pause stops the clock and the microphone feed for that section, and Resume continues the same recording, so a lecture, song or voice note can be captured in one file with breaks in the middle." },
        },
        {
          "@type": "Question",
          name: "Why did the recorder say the microphone was blocked?",
          acceptedAnswer: { "@type": "Answer", text: "The browser only hands the microphone to a page after you allow it. If you denied the prompt, or blocked it earlier, allow microphone access in the browser's site settings and try again — nothing was recorded while access was blocked." },
        },
        {
          "@type": "Question",
          name: "May I record other people with this tool?",
          acceptedAnswer: { "@type": "Answer", text: "Only with their permission. Recording laws differ by place, and recording a conversation without consent can be illegal. Record yourself freely; for anyone else, ask first." },
        },
      ],
    });
  }
  if (page === "onlineNotepad") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to use the online notepad in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Open and type", text: "Open the notepad and start typing in the large box. Every change is saved automatically to this browser, and live word, character and line counts update as you write." },
        { "@type": "HowToStep", position: 2, name: "Organise with titled notes", text: "Give the note a title, or press New note to keep several notes side by side in this browser. Switch between them in the note list; delete one note, or clear all notes, only after the confirmation prompt." },
        { "@type": "HowToStep", position: 3, name: "Copy or download a text file", text: "Copy the note with one button, or download it as a .txt file to keep or share. Download anything important: browser notes are not a cloud backup." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this online notepad free? Is my text uploaded?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, free with no sign-up. Notes are saved only in this browser's local storage on this device and are never uploaded, stored on a server or shared by this tool." },
        },
        {
          "@type": "Question",
          name: "Will my notes still be here when I come back?",
          acceptedAnswer: { "@type": "Answer", text: "Yes, on the same browser and device, until you delete them or clear browser site data. They do not sync to another browser, phone or computer, and private browsing leaves nothing behind when the window closes." },
        },
        {
          "@type": "Question",
          name: "How many notes can I keep, and can I download them?",
          acceptedAnswer: { "@type": "Answer", text: "You can keep several titled notes in the note list and switch between them. Any note can be copied or downloaded as a plain .txt file; download important notes because browser storage is not a backup." },
        },
        {
          "@type": "Question",
          name: "What happens when I clear all notes?",
          acceptedAnswer: { "@type": "Answer", text: "Clearing asks for confirmation first, then deletes every note saved in this browser and starts one fresh empty note. Deleted notes cannot be recovered from the browser, so download anything you need beforehand." },
        },
        {
          "@type": "Question",
          name: "Can I store passwords or important secrets in the notepad?",
          acceptedAnswer: { "@type": "Answer", text: "No. Anyone who can open this browser on this device can read saved notes, and browser storage is not a password manager. Never keep passwords, recovery codes, bank or card details, or other secrets here." },
        },
      ],
    });
  }
  if (page === "instagramLineBreak") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to keep line breaks in an Instagram caption in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Write with blank lines", text: "Type or paste your caption, bio or comment and press Enter twice wherever you want a blank line between paragraphs." },
        { "@type": "HowToStep", position: 2, name: "Check the live preview", text: "Pick the invisible blank or a visible dot divider, keep trailing-space trim on, and check the caption preview and character counts (2,200 for captions, 150 for bios)." },
        { "@type": "HowToStep", position: 3, name: "Copy and paste into Instagram", text: "Press Copy with line breaks and paste straight into Instagram. Each blank line carries an invisible Braille blank (U+2800), so the spacing is kept instead of collapsing." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Why does Instagram remove my blank lines?",
          acceptedAnswer: { "@type": "Answer", text: "Instagram's composer strips empty lines and trailing spaces when text is published, so paragraphs typed with blank lines between them collapse into one block. A line that contains an invisible character is not empty, so it survives." },
        },
        {
          "@type": "Question",
          name: "What character does this tool put on blank lines?",
          acceptedAnswer: { "@type": "Answer", text: "By default the Braille Pattern Blank U+2800, a real character that renders as blank space in fonts that support it. You can instead choose a visible dot divider (·) if you prefer a separator readers can see." },
        },
        {
          "@type": "Question",
          name: "Is my caption uploaded anywhere?",
          acceptedAnswer: { "@type": "Answer", text: "No. The conversion happens in your browser tab. Your text is not uploaded, stored on a server or shared by this tool, and closing the tab forgets everything." },
        },
        {
          "@type": "Question",
          name: "Will the line breaks always survive on Instagram?",
          acceptedAnswer: { "@type": "Answer", text: "No tool can promise that. Instagram can change how it treats these characters at any time, a few fonts show a box instead of a blank, and screen readers may read the blank character aloud. Check the preview after pasting before you publish." },
        },
        {
          "@type": "Question",
          name: "Do the invisible characters count toward Instagram's limits?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. Instagram commonly limits captions to 2,200 characters and bios to 150, and spacer characters count toward those numbers. The tool shows the copied length so you can check before pasting." },
        },
        {
          "@type": "Question",
          name: "Does this work for bios and comments too?",
          acceptedAnswer: { "@type": "Answer", text: "The same trick works anywhere Instagram collapses blank lines: captions, bios and comments. Story text and some Reels fields behave differently, so test there first." },
        },
      ],
    });
  }
  if (page === "unitConverter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to convert units in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Pick a category", text: "Choose length, weight, temperature, volume, area, speed, time, data storage, pressure or energy." },
        { "@type": "HowToStep", position: 2, name: "Enter a value and units", text: "Type your value, choose the From and To units (or search the unit lists), and read the instant result with its formula." },
        { "@type": "HowToStep", position: 3, name: "Swap or copy", text: "Use the swap button to reverse the conversion, or copy the result. Popular school, cooking and travel presets are one tap away." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this unit converter free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Ten categories — length, weight, temperature, volume, area, speed, time, data storage, pressure and energy — convert instantly in your browser." },
        },
        {
          "@type": "Question",
          name: "Why is there no currency converter?",
          acceptedAnswer: { "@type": "Answer", text: "Exchange rates change every day, so a money conversion without live rates would be a guess dressed up as an answer. This tool deliberately excludes currency; use your bank or a live-rate service for money." },
        },
        {
          "@type": "Question",
          name: "How accurate are the conversions?",
          acceptedAnswer: { "@type": "Answer", text: "They use established SI and NIST factors — 1 inch is exactly 2.54 cm and 1 pound is exactly 0.45359237 kg — and the formula is shown with every result. Results are rounded to sensible significant figures for everyday use." },
        },
        {
          "@type": "Question",
          name: "Can I use these results for medical, engineering or aviation work?",
          acceptedAnswer: { "@type": "Answer", text: "No. These are everyday conversions for school, cooking, travel and shopping. For medical dosing, engineering sign-off, aviation or anything safety-critical, verify professionally with the proper instruments." },
        },
        {
          "@type": "Question",
          name: "Is anything I type uploaded or stored?",
          acceptedAnswer: { "@type": "Answer", text: "No. Every calculation happens in your browser tab. Nothing is uploaded, stored on a server or shared by this tool." },
        },
      ],
    });
  }
  if (page === "onlineTeleprompter") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to read from an online teleprompter in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Paste your script", text: "Type or paste your script and check the word count and estimated speaking time below the box." },
        { "@type": "HowToStep", position: 2, name: "Set speed, size and countdown", text: "Choose a scroll speed slightly slower than comfortable, set a font you can read at your distance, and keep the 3-2-1 countdown on if you want a breath before starting. Turn on mirror mode only for teleprompter glass." },
        { "@type": "HowToStep", position: 3, name: "Go fullscreen and read", text: "Enter fullscreen, press Play (or the Spacebar), and read. Space pauses, arrow keys adjust speed, and Back to top resets for the next take." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Is this online teleprompter free? Does it record me?", acceptedAnswer: { "@type": "Answer", text: "Free with no sign-up. It only scrolls text: it does not record video or audio, use your camera, or save your script anywhere. Record with a camera app you already trust while this page scrolls." } },
        { "@type": "Question", name: "What is mirror mode for?", acceptedAnswer: { "@type": "Answer", text: "Mirror mode flips the text for physical teleprompter glass, so it reads correctly in the reflection. On a normal screen the flipped text looks reversed, which is expected; turn it off for direct reading." } },
        { "@type": "Question", name: "How does the speaking-time estimate work?", acceptedAnswer: { "@type": "Answer", text: "Your word count is divided by a calm speaking pace of 150 words per minute, the same convention as this site's reading-time tools. Your real pace will differ, so rehearse once and adjust the scroll speed." } },
        { "@type": "Question", name: "Can I pause the scrolling without the mouse?", acceptedAnswer: { "@type": "Answer", text: "Yes. Press the Spacebar outside the script box to play or pause, the arrow keys to change speed, and use fullscreen for a distraction-free stage." } },
        { "@type": "Question", name: "Is my script uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. Your script is processed only in this browser tab and is gone when you close it." } },
      ],
    });
  }
  if (page === "uuidGenerator") {
    data.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to generate a UUID v4 in 3 steps",
      description,
      inLanguage: lang,
      step: [
        { "@type": "HowToStep", position: 1, name: "Choose how many", text: "Set the bulk count from 1 to 100. Five is a handy default for tests and fixtures." },
        { "@type": "HowToStep", position: 2, name: "Pick the format", text: "Keep lowercase with hyphens (8-4-4-4-12) for the standard form, switch on UPPERCASE if your system expects it, or turn hyphens off for the compact 32-character form." },
        { "@type": "HowToStep", position: 3, name: "Copy one or copy all", text: "Use the copy button on a single row, or Copy all to take the whole list one per line. Press Generate whenever you need a fresh set." },
      ],
    });
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Is this UUID generator free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. Generate one UUID v4 or a bulk list of up to 100, with uppercase and hyphen options, and copy one or copy all." } },
        { "@type": "Question", name: "Can two generated UUIDs ever be the same?", acceptedAnswer: { "@type": "Answer", text: "A version 4 UUID carries 122 random bits, so a duplicate is astronomically unlikely — you would need to generate an enormous number before a collision became plausible. It is not mathematically impossible, and this page does not promise otherwise." } },
        { "@type": "Question", name: "Why only version 4? What about version 1?", acceptedAnswer: { "@type": "Answer", text: "Version 4 is purely random, which is what most databases, APIs and tests need. Version 1 embeds time and machine-style identifiers that can leak information, so this tool deliberately does not generate it." } },
        { "@type": "Question", name: "Are my UUIDs uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "No. UUIDs are generated on your device with the Web Crypto API (crypto.randomUUID, with a crypto.getRandomValues fallback). Nothing is uploaded, stored on a server or shared, and closing the tab forgets everything." } },
        { "@type": "Question", name: "Can I use a UUID as a password or secret token?", acceptedAnswer: { "@type": "Answer", text: "No. A UUID is an identifier, not a secret. Use a password generator and a reputable password manager for credentials, and proper token systems for security-sensitive values." } },
      ],
    });
  }
  if (page === "humanizer") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "How does ToolVena make AI text sound more natural?", acceptedAnswer: { "@type": "Answer", text: "ToolVena varies sentence length and rhythm, replaces common AI-style clichés with plainer wording, and adds natural contractions where they fit. The built-in rewriting runs in your browser; an optional AI enhancement is labelled on the page when it is used. Results vary by text, and no tool can guarantee a specific detector score." } },
        { "@type": "Question", name: "Is the AI humanizer free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up. The editor accepts up to 3,000 words at a time, so split longer documents into sections." } },
        { "@type": "Question", name: "Will this guarantee a detector result?", acceptedAnswer: { "@type": "Answer", text: "No. This is an editing aid that helps writing read more naturally; it cannot guarantee any detector score or outcome. Always review the rewritten text for accuracy and follow your school, employer or platform rules on AI assistance." } },
        { "@type": "Question", name: "Is my text uploaded?", acceptedAnswer: { "@type": "Answer", text: "The built-in rewriting runs locally in your browser. If you switch on the optional AI enhancement, the text you enter is sent to the configured AI service so it can return a result — the page says so before you use it." } },
        { "@type": "Question", name: "Why did it say no rewrite was needed?", acceptedAnswer: { "@type": "Answer", text: "The local engine found nothing it would honestly change — your text already reads naturally, so the result matches your input. That is an honest outcome, not a fake rewrite." } },
      ],
    });
  }
  if (page === "detector") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What does the AI content detector check?", acceptedAnswer: { "@type": "Answer", text: "It is ToolVena's own heuristic scanner: it compares sentence-length variety, repeated stock phrases and common AI-style wording, then shows a sentence-by-sentence pattern heatmap. Concise or formulaic writing can score as AI-like even when a person wrote it." } },
        { "@type": "Question", name: "Is this an official Turnitin or GPTZero result?", acceptedAnswer: { "@type": "Answer", text: "No. It is ToolVena's independent estimate only. It does not run or reproduce Turnitin, GPTZero, Copyleaks or Originality.ai, and its score is not evidence of how a text was written." } },
        { "@type": "Question", name: "Can it prove a text was written by AI?", acceptedAnswer: { "@type": "Answer", text: "No detector can prove authorship from style alone. Use the highlights as editing prompts — stiff, repetitive sentences are worth revising whoever wrote them — and make your own judgement." } },
        { "@type": "Question", name: "Is the detector free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up, and the scan runs in your browser." } },
        { "@type": "Question", name: "Is my text uploaded or stored?", acceptedAnswer: { "@type": "Answer", text: "The scanner analyses your text in this browser tab. Your text is not uploaded to our server by this tool; closing the tab clears it." } },
      ],
    });
  }
  if (page === "media") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What can I do in the Video & Image Media Tools?", acceptedAnswer: { "@type": "Answer", text: "You can trim edge areas of your own videos, adjust pacing and pull still frames for Shorts and TikTok, and clean C2PA metadata from images. Everything is processed in your browser." } },
        { "@type": "Question", name: "Whose videos and images may I edit?", acceptedAnswer: { "@type": "Answer", text: "Only media you own or have permission to edit. Do not use these tools to repost other people's content or to remove ownership or credit information." } },
        { "@type": "Question", name: "Is my media uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. Trimming, pacing, frame capture and metadata cleaning run locally in your browser tab; your files are not sent to our server." } },
        { "@type": "Question", name: "Is it free?", acceptedAnswer: { "@type": "Answer", text: "Yes. The media tools are free with no sign-up." } },
        { "@type": "Question", name: "Any limits?", acceptedAnswer: { "@type": "Answer", text: "Very large video files depend on your device's memory and browser. If a file struggles, try a shorter clip or a lower-resolution copy." } },
      ],
    });
  }
  if (page === "seo") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What does the SEO Meta & Hashtag Generator do?", acceptedAnswer: { "@type": "Answer", text: "You enter a topic or draft, and it suggests title ideas, meta-description drafts, keyword ideas and hashtags for pages and short videos. These are writing aids to plan content, not an analysis of a live page." } },
        { "@type": "Question", name: "Will this guarantee a Google ranking?", acceptedAnswer: { "@type": "Answer", text: "No tool can guarantee rankings. Search results depend on content quality, links and the rest of your site. Treat the ideas as a starting point and verify them against real search data." } },
        { "@type": "Question", name: "Does it analyse my video or website automatically?", acceptedAnswer: { "@type": "Answer", text: "No. It works from the topic or text you type in. It does not fetch, watch or grade your actual video or page." } },
        { "@type": "Question", name: "Is it free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up and runs in your browser." } },
      ],
    });
  }
  if (page === "citation") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "Which citation styles are supported?", acceptedAnswer: { "@type": "Answer", text: "APA 7th, MLA 9th, Chicago 17th and Harvard. Enter the source details and the generator formats the reference and in-text citation for the style you pick." } },
        { "@type": "Question", name: "How do I use generated citations safely?", acceptedAnswer: { "@type": "Answer", text: "Verify each generated reference against the official style manual and your institution's requirements before submitting. Check author names, years, titles and page numbers character by character." } },
        { "@type": "Question", name: "Does it find sources for me?", acceptedAnswer: { "@type": "Answer", text: "No. It formats the details you enter; it does not search for or invent sources. Only cite works you have actually read and can locate." } },
        { "@type": "Question", name: "Is the citation generator free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up and runs in your browser; nothing you type is uploaded by this tool." } },
      ],
    });
  }
  if (page === "expander") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What does the sentence expander do?", acceptedAnswer: { "@type": "Answer", text: "It takes short, compressed sentences and expands them into fuller paragraphs with added connective detail and varied sentence lengths, so an idea reads as developed prose instead of a note." } },
        { "@type": "Question", name: "Will expansion change my meaning?", acceptedAnswer: { "@type": "Answer", text: "It can shift wording and emphasis, so compare the result with your original and check every fact, name and number before using it. It is a drafting aid, not a substitute for your own judgement." } },
        { "@type": "Question", name: "Does it guarantee a readability or detector result?", acceptedAnswer: { "@type": "Answer", text: "No. Longer, more varied sentences often read better, but no tool can guarantee a readability grade or any detector outcome." } },
        { "@type": "Question", name: "Is it free? Is my text uploaded?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is free with no sign-up. The built-in expansion runs in your browser; if an optional AI option is offered and used, the page labels it before anything is sent." } },
      ],
    });
  }
  if (page === "cleaner") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What does the Cliché Cleaner do?", acceptedAnswer: { "@type": "Answer", text: "It scans your text for repeated stock phrases that can make writing feel formulaic — phrases like 'delve', 'rich tapestry', 'testament to' or 'pivotal role' — and suggests plainer wording in your own voice." } },
        { "@type": "Question", name: "Does a flagged phrase prove AI wrote my text?", acceptedAnswer: { "@type": "Answer", text: "No. People use these phrases too. A flag only means the phrase is overused; whether to change it is an editing decision, not a verdict on authorship." } },
        { "@type": "Question", name: "Is it free? Is my text uploaded?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is free with no sign-up and runs in your browser; your text is not uploaded by this tool." } },
      ],
    });
  }
  if (page === "diff") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What does the diff checker's similarity score mean?", acceptedAnswer: { "@type": "Answer", text: "It calculates word-level similarity between two texts you provide and highlights exactly which words were added, removed or kept. A lower similarity score means more of the wording was altered. It is a comparison aid, not a prediction of any detector's verdict." } },
        { "@type": "Question", name: "Is this a plagiarism checker?", acceptedAnswer: { "@type": "Answer", text: "No. It compares two texts you paste against each other; it does not search the web or any database, and it cannot say where a text came from." } },
        { "@type": "Question", name: "Is it free? Is my text uploaded?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is free with no sign-up and the comparison runs in your browser." } },
      ],
    });
  }
  if (page === "imageCompressor") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "How does the image compressor work?", acceptedAnswer: { "@type": "Answer", text: "It re-encodes JPG, PNG and WebP images in your browser at the quality you choose and shows the size before and after, so you can balance file size against how the image looks." } },
        { "@type": "Question", name: "Is my image uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. Compression happens locally in your browser tab with canvas; your image is not sent to our server." } },
        { "@type": "Question", name: "Why did the compressed file come out larger?", acceptedAnswer: { "@type": "Answer", text: "If the original was already very small, re-encoding can make it bigger. The tool tells you honestly when that happens — keep your original in that case, or try a lower quality setting." } },
        { "@type": "Question", name: "Is it free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up and no watermark." } },
      ],
    });
  }
  if (page === "pdfTools") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What can the PDF Tools do?", acceptedAnswer: { "@type": "Answer", text: "Two jobs: merge several PDF files into one, and convert JPG or PNG images into a single PDF. Pick your files, arrange the order, and download the result." } },
        { "@type": "Question", name: "Are my PDFs uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. Merging and conversion run entirely in your browser; your documents never leave your device." } },
        { "@type": "Question", name: "Is it free?", acceptedAnswer: { "@type": "Answer", text: "Yes. It is free with no sign-up and no watermark." } },
        { "@type": "Question", name: "Any limits?", acceptedAnswer: { "@type": "Answer", text: "Very large files are limited by your device's memory. This tool merges and converts; it does not edit PDF text or run OCR — for text from a scanned page, use the Image to Text tool." } },
      ],
    });
  }
  if (page === "backgroundRemover") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "How does the background remover work?", acceptedAnswer: { "@type": "Answer", text: "An AI model runs directly in your browser (ONNX). The first use downloads the model once — a few tens of megabytes — and your browser caches it; after that, images are processed on your own device." } },
        { "@type": "Question", name: "Is my photo uploaded?", acceptedAnswer: { "@type": "Answer", text: "No. After the one-time model download, your photo is processed on your device and is not sent to our server." } },
        { "@type": "Question", name: "What do I get?", acceptedAnswer: { "@type": "Answer", text: "A transparent-background PNG at full resolution, free with no watermark and no sign-up." } },
        { "@type": "Question", name: "Any limits?", acceptedAnswer: { "@type": "Answer", text: "Fine hair, glass and busy edges can come out imperfect, and very large photos may be slow on low-end phones. A plain, well-lit background gives the cleanest result." } },
      ],
    });
  }
  if (page === "voiceCloner") {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [
        { "@type": "Question", name: "What works right now on the AI Voice Cloner page?", acceptedAnswer: { "@type": "Answer", text: "Free, natural-sounding text-to-speech voices that run in your browser: type text, pick a voice, and listen or save the audio. The first use downloads a compact voice model (about 90 MB) and caches it on your device." } },
        { "@type": "Question", name: "Can it clone my own voice today?", acceptedAnswer: { "@type": "Answer", text: "Not yet — honestly. Cloning your own voice needs a server GPU, and that part is still being connected; the page says 'server not connected' instead of pretending. Free voices work now; cloning arrives only when it can be done properly." } },
        { "@type": "Question", name: "Is it free?", acceptedAnswer: { "@type": "Answer", text: "The built-in voices are free with no sign-up. When voice cloning launches it will be a paid extra (a server costs money to run), and the free voices will stay free." } },
        { "@type": "Question", name: "Which languages do the free voices speak?", acceptedAnswer: { "@type": "Answer", text: "The free voices are English voices. We do not claim Urdu or other-language cloning that the underlying technology does not officially support." } },
        { "@type": "Question", name: "Is my text or voice uploaded?", acceptedAnswer: { "@type": "Answer", text: "The free voices generate speech on your device; your text is not uploaded for them. Nothing about cloning is collected while that feature is paused." } },
      ],
    });
  }
  if (page === "blog" && post) {
    data.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary || description,
      image: post.image ? `${origin}${post.image}` : undefined,
      articleBody: (post.content || []).join("\n\n").slice(0, 15000),
      author: { "@type": "Organization", name: post.author || "ToolVena Editorial Team" },
      datePublished: post.date || undefined,
      inLanguage: post.language || "en",
      mainEntityOfPage: canonicalUrl,
    });
  }
  // BreadcrumbList — Home > page, and Home > Blog > post for articles.
  // The homepage itself gets none.
  if (page !== "home") {
    const crumbs = [
      { "@type": "ListItem", position: 1, name: "ToolVena", item: `${origin}/${lang}/` },
    ];
    if (page === "blog" && post) {
      crumbs.push({
        "@type": "ListItem",
        position: 2,
        name: pageMeta("blog", lang, null)[0],
        item: `${origin}/${lang}/blog/`,
      });
      crumbs.push({ "@type": "ListItem", position: 3, name: post.title, item: canonicalUrl });
    } else {
      crumbs.push({ "@type": "ListItem", position: 2, name: title, item: canonicalUrl });
    }
    data.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs,
    });
  }
  // id matches the runtime injector in src/utils/seo.ts so it replaces (not duplicates) this block
  return `<script id="toolvena-schema-jsonld" type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>`;
}

// ---- main ----
const indexPath = path.join(dist, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("[static-seo] dist/index.html not found. Run `vite build` first.");
  process.exit(1);
}
const template = fs.readFileSync(indexPath, "utf8");

const canonMatch = template.match(/<link rel="canonical" href="([^"]+)" \/>/);
const origin = canonMatch
  ? canonMatch[1].replace(/\/en\/ai-humanizer\/$/, "").replace(/\/en\/$/, "").replace(/\/$/, "")
  : "https://www.toolvena.com";
// P0 guard (2026-10-10): a build without SITE_URL silently produced relative
// canonicals/sitemap URLs. Fail the build loudly instead of shipping that.
if (!origin || !/^https:\/\/[a-z0-9.-]+$/i.test(origin)) {
  console.error("[static-seo] FATAL: no valid absolute site origin in dist/index.html canonical.");
  console.error("[static-seo] Rebuild with SITE_URL set, e.g. SITE_URL=https://www.toolvena.com npm run build");
  process.exit(1);
}
console.log(`[static-seo] origin: ${origin}`);

let count = 0;
const emittedUrls = [];
function emitFile(lang, routePath, title, description, page, post = null) {
  const canonicalUrl = `${origin}/${lang}${routePath}`;
  emittedUrls.push({ url: canonicalUrl, routePath, page, lang, postSlug: post ? post.slug : null });
  let html = template;

  // <html lang> + dir
  if (lang === "ur" || lang === URPK_LANG) {
    const htmlLang = lang === URPK_LANG ? URPK_HREFLANG : lang;
    html = html.replace(/<html lang="[^"]*"/, `<html lang="${htmlLang}" dir="rtl"`);
  } else {
    html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
  }

  // title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  // meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  // canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );
  // hreflang block — blog posts exist in a single language, so they get
  // no alternates (only tool pages have true translations).
  html = html.replace(
    /<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>\n?/g,
    ""
  );
  if (page !== "blog") {
    html = html.replace(
      /(<link rel="canonical" href="[^"]*" \/>\n)/,
      `$1${hreflangLinks(origin, routePath)}\n`
    );
  } else if (post) {
    // Only verified translation twins (same article id, another language)
    // get alternates — every other article is a single-language original.
    const twins = BLOG_TWIN_CLUSTERS.get(`${lang}|${post.slug}`);
    if (twins && twins.length > 1) {
      const cluster = twins
        .map(
          (t) =>
            `    <link rel="alternate" hreflang="${t.language}" href="${origin}/${t.language}/blog/${t.slug}/" />`
        )
        .join("\n");
      html = html.replace(/(<link rel="canonical" href="[^"]*" \/>\n)/, (m) => `${m}${cluster}\n`);
    }
  }
  // OpenGraph / Twitter
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta property="og:site_name" content="[^"]*" \/>/,
    `<meta property="og:site_name" content="ToolVena" />`
  );
  if (!html.includes('property="og:site_name"')) {
    html = html.replace(
      /(<meta property="og:url" content="[^"]*" \/>)/,
      `$1
    <meta property="og:site_name" content="ToolVena" />`
    );
  }
  // Articles are articles, and when an article has its own large image it
  // becomes the og:image / twitter:image (otherwise the logo stays).
  if (page === "blog" && post) {
    html = html.replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:type" content="article" />`
    );
    if (post.image) {
      html = html.replace(
        /<meta property="og:image" content="[^"]*" \/>/,
        `<meta property="og:image" content="${origin}${post.image}" />`
      );
      html = html.replace(
        /<meta name="twitter:image" content="[^"]*" \/>/,
        `<meta name="twitter:image" content="${origin}${post.image}" />`
      );
    }
  }
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${esc(description)}" />`
  );
  // JSON-LD: replace existing block
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    jsonLd(origin, canonicalUrl, title, description, page, post, lang)
  );
  // H1 for SEO: inject page title as H1 right after <div id="root">
  // Use clean title without year suffix for heading
  const h1Text = esc(title.replace(/\s*[–-]\s*\(?2026\)?\s*$/, "").trim());
  const h2Text = esc(description);
  // F6 (2026-10-10): visible prerender, POLICY-BOUND: it may contain ONLY
  // words the app itself renders on that very page — homepage hero strings
  // from HOME_COPY and, for articles, the post's own title/summary/opening
  // paragraphs (the exact strings BlogSection renders). Identical words
  // for crawler and user; no invented or hidden text. Tool pages keep the
  // F3 pattern (hidden H1 + crawlable nav) because each workspace renders
  // its own hero strings in its own shape; an unverified copy would risk
  // a shell/app mismatch, so tools are honestly deferred in the record.
  const prerenderHtml = (() => {
    const wrap = (inner) =>
      `<div data-prerender="1" style="max-width:64rem;margin:0 auto;padding:2.5rem 1.25rem 2rem;">${inner}</div>`;
    const h1Style =
      "font-size:2rem;line-height:1.25;font-weight:800;margin:0 0 1rem;color:#1c1917;";
    const pStyle =
      "font-size:1.05rem;line-height:1.7;color:#44403c;margin:0 0 1rem;max-width:46rem;";
    if (page === "home") {
      const hc = HOME_COPY[lang] || HOME_COPY.en;
      if (!hc || !hc.heroH1A) return "";
      // ur-pk and hi are partial locales the LANGUAGES list excludes;
      // pass the real language figure for the {langs} placeholder.
      const langCount = lang === HI_LANG ? LANGUAGES.length + 2 : LANGUAGES.length + 1;
      const h1 = fillHomeCopy(`${hc.heroH1A} ${hc.heroH1B || ""}`.trim(), langCount);
      const intro = hc.heroIntro ? fillHomeCopy(hc.heroIntro, langCount) : "";
      return wrap(
        `<h1 style="${h1Style}">${esc(h1)}</h1>` +
          (intro ? `<p style="${pStyle}">${esc(intro)}</p>` : "")
      );
    }
    if (page === "blog" && post) {
      const paras = [];
      if (post.summary) paras.push(post.summary);
      const c = Array.isArray(post.content) ? post.content : [];
      const firstReal = c.length > 1 ? c[1] : c[0];
      if (firstReal && firstReal !== post.summary) paras.push(firstReal);
      return wrap(
        `<h1 style="${h1Style}">${esc(post.title || h1Text)}</h1>` +
          paras.map((p) => `<p style="${pStyle}">${esc(p)}</p>`).join("")
      );
    }
    return "";
  })();
  html = html.replace(
    /<div id="root">/,
    () =>
      prerenderHtml
        ? `<div id="root">${prerenderHtml}${staticNavHtml(lang)}`
        : `<div id="root"><h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">${h1Text}</h1>${staticNavHtml(lang)}`
  );

  const outDir = path.join(dist, lang, routePath.replace(/^\/|\/$/g, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  count++;
}

for (const lang of LANGUAGES) {
  // Bare /<lang>/ -> homepage
  {
    const [title, desc] = pageMeta("home", lang, null);
    emitFile(lang, "/", title, desc, "home");
  }
  for (const [page, routePath] of ROUTES) {
    const [title, desc] = pageMeta(page, lang, null);
    emitFile(lang, routePath, title, desc, page);
  }
  // Blog posts are emitted ONLY under their own language (no duplicate
  // copies across languages — each post is written in one language).
  for (const post of BLOG_POSTS.filter((p) => p.language === lang)) {
    const [title, desc] = pageMeta("blog", lang, post);
    emitFile(lang, `/blog/${post.slug}/`, title, desc, "blog", post);
  }
}

// Urdu-script locale (ur-pk): phase 2 — homepage + all 53 tool routes.
// TRANSLATIONS["ur-pk"] carries the localised strings for every one.
// Articles join from batch 1 onward: only real ur-pk BLOG_POSTS below are
// emitted, together with the /ur-pk/blog/ listing shell. Other languages'
// blog routes and compliance pages remain outside this route set.
{
  const [homeTitle, homeDesc] = pageMeta("home", URPK_LANG, null);
  emitFile(URPK_LANG, "/", homeTitle, homeDesc, "home");
  for (const [page, routePath] of ROUTES) {
    if (!URPK_ROUTE_PATHS.has(routePath)) continue;
    const [title, desc] = pageMeta(page, URPK_LANG, null);
    emitFile(URPK_LANG, routePath, title, desc, page);
  }
  // ur-pk blog: listing shell + only the articles actually written in
  // Urdu script. No other-language copies are emitted under /ur-pk/blog/.
  const [blogTitle, blogDesc] = pageMeta("blog", URPK_LANG, null);
  emitFile(URPK_LANG, "/blog/", blogTitle, blogDesc, "blog");
  for (const post of BLOG_POSTS.filter((p) => p.language === URPK_LANG)) {
    const [title, desc] = pageMeta("blog", URPK_LANG, post);
    emitFile(URPK_LANG, `/blog/${post.slug}/`, title, desc, "blog", post);
  }
}

// Hindi locale (hi): phase 1 — homepage + all 53 tool routes.
// TRANSLATIONS["hi"] carries the localised strings for every one.
// Articles join in a later phase: the /hi/blog/ listing shell is emitted
// (empty for now, exactly like ur-pk was at its phase-2 start) but no
// Hindi article pages are generated yet.
{
  const [homeTitle, homeDesc] = pageMeta("home", HI_LANG, null);
  emitFile(HI_LANG, "/", homeTitle, homeDesc, "home");
  for (const [page, routePath] of ROUTES) {
    if (!HI_ROUTE_PATHS.has(routePath)) continue;
    const [title, desc] = pageMeta(page, HI_LANG, null);
    emitFile(HI_LANG, routePath, title, desc, page);
  }
  const [blogTitle, blogDesc] = pageMeta("blog", HI_LANG, null);
  emitFile(HI_LANG, "/blog/", blogTitle, blogDesc, "blog");
  // hi blog: listing shell + only the articles actually written in Hindi.
  // No other-language copies are emitted under /hi/blog/.
  for (const post of BLOG_POSTS.filter((p) => p.language === HI_LANG)) {
    const [title, desc] = pageMeta("blog", HI_LANG, post);
    emitFile(HI_LANG, `/blog/${post.slug}/`, title, desc, "blog", post);
  }
}

console.log(`[static-seo] ${count} static SEO pages written to dist/`);

// ---- sitemap.xml (auto-generated so new articles are always included) ----
const today = new Date().toISOString().slice(0, 10);
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
for (const u of emittedUrls) {
  const priority = u.page === "humanizer" || u.page === "home" ? "1.0" : u.page === "blog" ? "0.6" : "0.8";
  sm += `  <url>\n    <loc>${u.url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n`;
  if (u.page !== "blog") {
    for (const l of LANGUAGES) {
      sm += `    <xhtml:link rel="alternate" hreflang="${l}" href="${origin}/${l}${u.routePath}" />\n`;
    }
    if (URPK_ROUTE_PATHS.has(u.routePath)) {
      sm += `    <xhtml:link rel="alternate" hreflang="${URPK_HREFLANG}" href="${origin}/${URPK_LANG}${u.routePath}" />\n`;
    }
    if (HI_ROUTE_PATHS.has(u.routePath)) {
      sm += `    <xhtml:link rel="alternate" hreflang="${HI_HREFLANG}" href="${origin}/${HI_LANG}${u.routePath}" />\n`;
    }
    sm += `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en${u.routePath}" />\n`;
  } else if (u.postSlug) {
    // Blog post: only its verified translation twins (if any) are alternates.
    const twins = BLOG_TWIN_CLUSTERS.get(`${u.lang}|${u.postSlug}`);
    if (twins && twins.length > 1) {
      for (const t of twins) {
        sm += `    <xhtml:link rel="alternate" hreflang="${t.language}" href="${origin}/${t.language}/blog/${t.slug}/" />\n`;
      }
    }
  }
  sm += `  </url>\n`;
}
sm += `</urlset>\n`;
fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sm);
fs.writeFileSync(path.join(dist, "sitemap.xml"), sm);
console.log(`[static-seo] sitemap.xml written (${emittedUrls.length} URLs)`);
