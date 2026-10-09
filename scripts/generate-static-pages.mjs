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

const TRANSLATIONS = loadConst(path.join(root, "src/data/translations.ts"), "TRANSLATIONS");
const BLOG_POSTS = loadConst(path.join(root, "src/data/blogArticles.ts"), "BLOG_POSTS");

const LANGUAGES = ["en", "es", "ur", "de", "fr", "pt", "tr", "ja", "no", "nl", "it"];

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
  ["textToSpeech", "/text-to-speech/"],
  ["imageCompressor", "/image-compressor/"],
  ["pdfTools", "/pdf-tools/"],
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
const COMPLIANCE_META = {
  privacy: ["Privacy Policy – Clever Humanizer", "Learn how Clever Humanizer protects user privacy with zero log storage and secure client-side document processing standards."],
  terms: ["Terms of Service – Clever Humanizer", "Read the Terms of Service for using Clever Humanizer free web tools, content guidelines, and ethical usage standards."],
  disclaimer: ["Disclaimer & Academic Integrity Policy – Clever Humanizer", "Our commitment to ethical AI use, research assistance, and academic integrity policies for educational environments."],
  about: ["About Us – Clever Humanizer Project", "Our mission to provide free, privacy-first AI text humanization and content checking tools worldwide."],
  contact: ["Contact & Support – Clever Humanizer", "Get in touch with the Clever Humanizer engineering and support team for feedback, enterprise inquiries, and support."],
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
    case "textToSpeech": return [seo.textToSpeechTitle || fb.textToSpeechTitle, seo.textToSpeechDesc || fb.textToSpeechDesc];
    case "imageCompressor": return [seo.imageCompressorTitle || fb.imageCompressorTitle, seo.imageCompressorDesc || fb.imageCompressorDesc];
    case "pdfTools": return [seo.pdfToolsTitle || fb.pdfToolsTitle, seo.pdfToolsDesc || fb.pdfToolsDesc];
    case "cleaner": return [seo.cleanerTitle || fb.cleanerTitle, seo.cleanerDesc || fb.cleanerDesc];
    case "diff": return [seo.diffTitle || fb.diffTitle, seo.diffDesc || fb.diffDesc];
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
  s += `    <link rel="alternate" hreflang="x-default" href="${origin}/en${pathWithoutLang}" />`;
  return s;
}

function jsonLd(origin, canonicalUrl, title, description, page, post = null, lang = "en") {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "HumanizeAI",
      url: `${origin}/`,
      description: "Free AI text humanizer and writing pattern checker.",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "HumanizeAI",
      url: `${origin}/`,
      logo: `${origin}/icon.svg`,
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
  // WebApplication schema for tool pages
  const toolPages = ["humanizer", "detector", "imageCompressor", "pdfTools", "summarizer", "voiceTyping", "cvBuilder", "wordCounter", "textToSpeech", "media", "seo", "citation", "expander", "cleaner", "diff"];
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
  if (page === "blog" && post) {
    data.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary || description,
      articleBody: (post.content || []).join("\n\n").slice(0, 15000),
      author: { "@type": "Person", name: post.author || "HumanizeAI" },
      datePublished: "2026-10-08",
      inLanguage: post.language || "en",
      mainEntityOfPage: canonicalUrl,
    });
  }
  // id matches the runtime injector in src/utils/seo.ts so it replaces (not duplicates) this block
  return `<script id="clever-schema-jsonld" type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>`;
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
  ? canonMatch[1].replace(/\/en\/ai-humanizer\/$/, "").replace(/\/$/, "")
  : "https://humanize-a.netlify.app";
console.log(`[static-seo] origin: ${origin}`);

let count = 0;
const emittedUrls = [];
function emitFile(lang, routePath, title, description, page, post = null) {
  const canonicalUrl = `${origin}/${lang}${routePath}`;
  emittedUrls.push({ url: canonicalUrl, routePath, page });
  let html = template;

  // <html lang> + dir
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
  if (lang === "ur") {
    html = html.replace(/<html lang="ur"/, '<html lang="ur" dir="rtl"');
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
  html = html.replace(
    /<div id="root">/,
    `<div id="root"><h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">${h1Text}</h1><h2 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">${h2Text}</h2>`
  );

  const outDir = path.join(dist, lang, routePath.replace(/^\/|\/$/g, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  count++;
}

for (const lang of LANGUAGES) {
  // Bare /<lang>/ -> humanizer
  {
    const [title, desc] = pageMeta("humanizer", lang, null);
    emitFile(lang, "/", title, desc, "humanizer");
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

console.log(`[static-seo] ${count} static SEO pages written to dist/`);

// ---- sitemap.xml (auto-generated so new articles are always included) ----
const today = new Date().toISOString().slice(0, 10);
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;
for (const u of emittedUrls) {
  const priority = u.page === "humanizer" ? "1.0" : u.page === "blog" ? "0.6" : "0.8";
  sm += `  <url>\n    <loc>${u.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n`;
  if (u.page !== "blog") {
    for (const l of LANGUAGES) {
      sm += `    <xhtml:link rel="alternate" hreflang="${l}" href="${origin}/${l}${u.routePath}" />\n`;
    }
    sm += `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}/en${u.routePath}" />\n`;
  }
  sm += `  </url>\n`;
}
sm += `</urlset>\n`;
fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sm);
fs.writeFileSync(path.join(dist, "sitemap.xml"), sm);
console.log(`[static-seo] sitemap.xml written (${emittedUrls.length} URLs)`);
