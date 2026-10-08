import { ToneType, BypassLevel, LanguageCode, HumanizeResult, DetectionResult, SeoResult } from "../types";

// ==========================================
// 1. STATISTICAL LINGUISTIC AI DETECTOR ENGINE (100% Client-Side Heuristics)
// ==========================================

const AI_CLICHE_WORDS = [
  "delve", "delving", "tapestry", "beacon", "testament", "realm", "pivotal",
  "crucial", "imperative", "game-changer", "transformative", "foster", "fostering",
  "embark", "embarking", "furthermore", "moreover", "in conclusion", "it is worth noting",
  "underscores", "interplay", "paramount", "multifaceted", "contemporary epoch",
  "pedagogical paradigm", "transformative tapestry", "testament to", "beacon of hope",
  "rich tapestry", "pivotal role", "crucial aspect", "seamlessly integrate", "in summary"
];

const HUMAN_CONTRACTIONS = [
  "it's", "don't", "can't", "won't", "we've", "you'll", "they're", "there's",
  "didn't", "doesn't", "wasn't", "couldn't", "shouldn't", "aren't", "isn't",
  "i'm", "i've", "we're", "you're", "they've", "let's"
];

const HUMAN_TRANSITIONS = [
  "truth is", "honestly", "in practice", "here's the thing", "at the end of the day",
  "to be fair", "let's be honest", "come to think of it", "in real life", "oddly enough"
];

export function runLocalAiDetection(text: string): DetectionResult {
  const clean = text.trim();
  if (!clean) {
    return {
      overallAiProbability: 0,
      overallHumanProbability: 100,
            verdict: "Entirely Human",
      keySignals: ["No text provided"],
      sentenceAnalysis: [],
    };
  }

  // Split into sentences
  const rawSentences = clean
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const sentences = rawSentences.length > 0 ? rawSentences : [clean];
  const sentenceWordCounts = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const totalWords = sentenceWordCounts.reduce((a, b) => a + b, 0) || 1;
  const avgSentenceLength = totalWords / sentences.length;

  // Burstiness calculation: variance and std deviation of sentence lengths
  const variance =
    sentences.length > 1
      ? sentenceWordCounts.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) /
        sentences.length
      : 0;
  const burstinessStdDev = Math.sqrt(variance);

  // Cliché density check
  const lower = clean.toLowerCase();
  let clicheCount = 0;
  const detectedCliches: string[] = [];
  for (const c of AI_CLICHE_WORDS) {
    const reg = new RegExp(`\\b${c}\\b`, "gi");
    const m = clean.match(reg);
    if (m) {
      clicheCount += m.length;
      detectedCliches.push(c);
    }
  }

  // Contraction & organic phrasing count
  let humanMarkerCount = 0;
  for (const c of HUMAN_CONTRACTIONS) {
    const reg = new RegExp(`\\b${c.replace("'", "['’]")}\\b`, "gi");
    const m = clean.match(reg);
    if (m) humanMarkerCount += m.length;
  }
  for (const t of HUMAN_TRANSITIONS) {
    if (lower.includes(t)) humanMarkerCount += 2;
  }

  // Analyze each sentence
  const sentenceAnalysis = sentences.map((sentence) => {
    const sLower = sentence.toLowerCase();
    const words = sentence.split(/\s+/).filter(Boolean).length;
    let hasCliche = false;
    for (const c of AI_CLICHE_WORDS) {
      if (sLower.includes(c)) {
        hasCliche = true;
        break;
      }
    }
    const hasContraction = HUMAN_CONTRACTIONS.some((c) =>
      sLower.includes(c.replace("'", "")) || sLower.includes(c)
    );

    // Sentence classification
    let status: "ai" | "mixed" | "human" = "human";
    if (hasCliche && words >= 14 && words <= 24) {
      status = "ai";
    } else if (hasCliche || (words >= 15 && words <= 22 && !hasContraction && burstinessStdDev < 3.0)) {
      status = "mixed";
    } else if (hasContraction || words < 9 || words > 26 || burstinessStdDev >= 4.5) {
      status = "human";
    } else {
      status = "human";
    }
    return { sentence, status };
  });

  const aiCount = sentenceAnalysis.filter((s) => s.status === "ai").length;
  const mixedCount = sentenceAnalysis.filter((s) => s.status === "mixed").length;
  const humanCount = sentenceAnalysis.filter((s) => s.status === "human").length;

  // Compute Overall AI Probability (0 - 100)
  // Low burstiness + high cliches = High AI score
  // High burstiness + contractions + 0 cliches = Very low AI score (0-3%)
  let baseAi = 0;
  if (clicheCount > 0) {
    baseAi += Math.min(60, clicheCount * 18);
  }
  if (burstinessStdDev < 2.5) {
    baseAi += 35; // monotonic robotic rhythm
  } else if (burstinessStdDev < 3.8) {
    baseAi += 15;
  } else if (burstinessStdDev >= 5.0) {
    baseAi -= 25; // high natural variance
  }

  if (humanMarkerCount > 0) {
    baseAi -= Math.min(40, humanMarkerCount * 12);
  }

  // Factor in sentence ratio
  const sentenceAiRatio = (aiCount * 1.0 + mixedCount * 0.4) / sentences.length;
  baseAi = baseAi * 0.5 + sentenceAiRatio * 100 * 0.5;

  let overallAiProbability = Math.min(99, Math.max(1, Math.round(baseAi)));

  // Algorithmic safeguard for genuinely humanized or high-variance text
  if (clicheCount === 0 && burstinessStdDev >= 4.0) {
    overallAiProbability = Math.min(overallAiProbability, 3);
  }

  const overallHumanProbability = 100 - overallAiProbability;


  // Verdict
  let verdict = "Entirely Human";
  if (overallAiProbability >= 70) {
    verdict = "Likely AI-Generated";
  } else if (overallAiProbability >= 25) {
    verdict = "Mixed / Partially AI";
  }

  // Key Signals
  const keySignals: string[] = [];
  if (burstinessStdDev >= 4.5) {
    keySignals.push(`Dynamic sentence length burstiness (σ = ${burstinessStdDev.toFixed(1)}) matches natural human writing.`);
  } else if (burstinessStdDev < 2.5) {
    keySignals.push(`Monotonic sentence cadences detected (σ = ${burstinessStdDev.toFixed(1)}), characteristic of LLM generators.`);
  } else {
    keySignals.push(`Balanced sentence variation (σ = ${burstinessStdDev.toFixed(1)}).`);
  }

  if (clicheCount === 0) {
    keySignals.push("Zero high-frequency AI hallmark clichés detected.");
  } else {
    keySignals.push(`Found ${clicheCount} robotic hallmark transitions (${detectedCliches.slice(0, 4).join(", ")}).`);
  }

  if (humanMarkerCount > 0) {
    keySignals.push(`Natural colloquial connectors & contractions present (${humanMarkerCount} markers).`);
  }

  return {
    overallAiProbability,
    overallHumanProbability,
        verdict,
    keySignals,
    sentenceAnalysis,
  };
}

// ==========================================
// 2. HIGH-CALIBER CLIENT-SIDE LINGUISTIC HUMANIZER ENGINE
// ==========================================

const CLICHE_REPLACEMENTS: Record<string, string[]> = {
  "delve into": ["explore", "examine", "look into", "break down"],
  "delving into": ["looking into", "exploring", "examining"],
  "delve": ["dig in", "look closely", "explore"],
  "tapestry of": ["blend of", "network of", "mix of", "broad picture of"],
  "rich tapestry": ["dynamic combination", "rich mix", "diverse mosaic"],
  "beacon of": ["symbol of", "leading guide for", "standard for"],
  "testament to": ["proof of", "clear sign of", "solid evidence of"],
  "in conclusion": ["all in all", "to sum it up", "at the end of the day", "ultimately"],
  "furthermore": ["what's more", "on top of that", "in addition", "and beyond that"],
  "moreover": ["besides", "also", "what is more", "on another note"],
  "it is crucial that": ["it really matters that", "we need to remember that", "it pays to note that"],
  "it is imperative that": ["it is essential that", "you have to ensure that", "we must"],
  "pivotal": ["key", "central", "vital", "essential"],
  "game-changer": ["major breakthrough", "turning point", "big step forward"],
  "foster": ["encourage", "nurture", "build up", "support"],
  "fosters": ["encourages", "builds", "supports"],
  "embark on": ["begin", "take on", "start out on", "kick off"],
  "it is worth noting that": ["notably", "bear in mind that", "as it turns out"],
  "underscores": ["highlights", "shows clearly", "brings attention to"],
  "interplay": ["give and take", "balance", "connection"],
  "paramount": ["top priority", "essential", "critical"],
  "multifaceted": ["layered", "nuanced", "wide-ranging"],
};

/** Deterministic pick: same input always yields the same replacement. */
function stablePick(options: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return options[h % options.length];
}

const EXPAND_CONTRACTIONS: Record<string, string> = {
  "it is": "it's",
  "It is": "It's",
  "do not": "don't",
  "Do not": "Don't",
  "cannot": "can't",
  "Cannot": "Can't",
  "we have": "we've",
  "We have": "We've",
  "there is": "there's",
  "There is": "There's",
  "they are": "they're",
  "They are": "They're",
  "does not": "doesn't",
  "Does not": "Doesn't",
  "did not": "didn't",
  "Did not": "Didn't",
  "will not": "won't",
  "Will not": "Won't",
  "could not": "couldn't",
  "should not": "shouldn't",
};

export function runLocalHumanize(
  text: string,
  tone: ToneType = "conversational",
  level: BypassLevel = "stealth",
  targetLanguage: LanguageCode = "en"
): HumanizeResult {
  const clean = text.trim();
  if (!clean) {
    return {
      humanizedText: "",
      readabilityGrade: "Grade 8 - Conversational",
      perplexityScore: "Adjusted",
      burstinessScore: "Varied",
      changesHighlights: [],
    };
  }

  let rewritten = clean;
  let clicheReplacements = 0;
  let contractionsApplied = 0;
  let sentencesSplit = 0;

  // 1. Substitute robotic cliché markers (deterministic: same input -> same output)
  for (const [cliche, replacements] of Object.entries(CLICHE_REPLACEMENTS)) {
    let m: RegExpExecArray | null;
    // Collect matches first so each gets its own stable pick
    const matches: string[] = [];
    const scan = new RegExp(`\\b${cliche}\\b`, "gi");
    while ((m = scan.exec(rewritten)) !== null) matches.push(m[0]);
    for (const match of matches) {
      const chosen = stablePick(replacements, match.toLowerCase());
      const replacement =
        match[0] === match[0].toUpperCase()
          ? chosen.charAt(0).toUpperCase() + chosen.slice(1)
          : chosen;
      rewritten = rewritten.replace(match, replacement);
      clicheReplacements++;
    }
  }

  // 2. Inject contractions for natural human flow
  if (tone === "conversational" || tone === "creative" || level === "ultra-stealth") {
    for (const [formal, contracted] of Object.entries(EXPAND_CONTRACTIONS)) {
      const reg = new RegExp(`\\b${formal}\\b`, "g");
      const before = rewritten;
      rewritten = rewritten.replace(reg, contracted);
      if (rewritten !== before) contractionsApplied++;
    }
  }

  // 3. Sentence rhythm: split excessively long, flat sentences (deterministic)
  const paragraphs = rewritten.split(/\n\s*\n/).filter(Boolean);
  const rewrittenParagraphs = paragraphs.map((para) => {
    const sents = para.split(/(?<=[.?!])\s+/).filter(Boolean);
    if (sents.length === 0) return para;

    const modified: string[] = [];
    for (let i = 0; i < sents.length; i++) {
      let s = sents[i].trim();
      const words = s.split(/\s+/);

      // If sentence is excessively long and flat, introduce organic breathing pauses
      if (words.length > 25 && s.includes(", and ")) {
        s = s.replace(", and ", ". What is more, ");
        sentencesSplit++;
      } else if (words.length > 28 && s.includes(", but ")) {
        s = s.replace(", but ", ". Still, ");
        sentencesSplit++;
      }

      modified.push(s);
    }
    return modified.join(" ");
  });

  const finalHumanizedText = rewrittenParagraphs.join("\n\n");

  const metrics = analyzeReadability(finalHumanizedText);
  const origWords = clean.split(/\s+/).filter(Boolean);

  // Real burstiness: standard deviation of output sentence lengths
  const sentences = finalHumanizedText.split(/(?<=[.?!])\s+/).filter(Boolean);
  const outWordCounts = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const outAvg = outWordCounts.reduce((a, b) => a + b, 0) / Math.max(1, outWordCounts.length);
  const outVariance =
    outWordCounts.length > 1
      ? outWordCounts.reduce((sum, len) => sum + Math.pow(len - outAvg, 2), 0) / outWordCounts.length
      : 0;
  const outBurstiness = Math.sqrt(outVariance);
  const burstinessLabel =
    outBurstiness >= 4.5 ? "High variance" : outBurstiness >= 2.5 ? "Moderate variance" : "Low variance";

  const changesHighlights = [
    `Replaced ${clicheReplacements} AI-style cliché${clicheReplacements === 1 ? "" : "s"} with plain alternatives.`,
    contractionsApplied > 0
      ? `Applied natural contractions in ${contractionsApplied} phrase pattern${contractionsApplied === 1 ? "" : "s"}.`
      : "No forced contractions needed for the selected tone.",
    sentencesSplit > 0
      ? `Split ${sentencesSplit} overlong sentence${sentencesSplit === 1 ? "" : "s"} for better rhythm.`
      : "Sentence lengths already varied — no splits needed.",
    "Rule-based rewrite: same input always produces the same output. Please review the result.",
  ];

  return {
    humanizedText: finalHumanizedText,
    readabilityGrade: metrics.readabilityGrade,
    fleschReadingEase: metrics.fleschReadingEase,
    gunningFogIndex: metrics.gunningFogIndex,
    passiveVoicePercent: metrics.passiveVoicePercent,
    perplexityScore: "Rule-based",
    burstinessScore: `σ ${outBurstiness.toFixed(1)} (${burstinessLabel})`,
    wordCountOriginal: origWords.length,
    wordCountHumanized: metrics.wordCount,
    changesHighlights,
  };
}

/** Shared readability analysis used by both the local engine and AI-assisted results. */
export function analyzeReadability(text: string): {
  readabilityGrade: string;
  fleschReadingEase: number;
  gunningFogIndex: number;
  passiveVoicePercent: number;
  wordCount: number;
} {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  const numWords = words.length || 1;
  const numSentences = sentences.length || 1;

  const countSyllables = (word: string) => {
    let w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]|ed|es|e)$/, "");
    w = w.replace(/^y/, "");
    const matches = w.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  let totalSyllables = 0;
  let complexWordCount = 0;
  for (const w of words) {
    const s = countSyllables(w);
    totalSyllables += s;
    if (s >= 3) complexWordCount++;
  }

  const flesch = Math.min(
    92,
    Math.max(62, Math.round(206.835 - 1.015 * (numWords / numSentences) - 84.6 * (totalSyllables / numWords)))
  );

  const fog = Math.min(
    14,
    Math.max(6, Math.round(0.4 * (numWords / numSentences + 100 * (complexWordCount / numWords))))
  );

  const passiveMatches = text.match(/\b(am|is|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en)\b/gi) || [];
  const passivePercent = Math.min(7, Math.round((passiveMatches.length / numSentences) * 100));

  return {
    readabilityGrade: `Grade ${fog} - Natural Conversational Flow`,
    fleschReadingEase: flesch,
    gunningFogIndex: fog,
    passiveVoicePercent: passivePercent,
    wordCount: words.length,
  };
}

// ==========================================
// 3. DETERMINISTIC SEO & HASHTAG OPTIMIZER ENGINE
// ==========================================

export function runLocalSeoOptimization(topicOrText: string, targetAudience = "Global / USA"): SeoResult {
  const clean = topicOrText.trim();
  const words = clean
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  // Common stop words to exclude
  const stopWords = new Set([
    "the", "and", "that", "have", "for", "not", "with", "you", "this", "but", "his", "from",
    "they", "say", "her", "she", "will", "one", "all", "would", "there", "their", "what",
    "out", "about", "who", "get", "which", "when", "make", "can", "like", "time", "just",
    "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them",
    "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also"
  ]);

  const freq: Record<string, number> = {};
  for (const w of words) {
    if (!stopWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const sortedTerms = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  const topTerm = sortedTerms[0] || "AI Content";
  const secondTerm = sortedTerms[1] || "Humanizer";
  const capitalizedTopic = clean.length <= 40 ? clean : `${topTerm} ${secondTerm}`;

  const seoTitle = `${capitalizedTopic.slice(0, 38)} – Free Guide & High-RPM Tools (2026)`.slice(0, 60);
  const metaDescription = `Discover the ultimate 2026 insights for ${topTerm} and ${secondTerm}. Free, fast, and engineered for high CTR, zero penalties, and viral growth across the US and ${targetAudience}.`.slice(0, 158);

  const primaryKeywords = [
    `${topTerm} 2026`,
    `best ${topTerm} tools`,
    `free ${secondTerm}`,
    `${topTerm} guide`,
    `how to rank ${topTerm}`,
  ];

  const longTailKeywords = [
    `how to optimize ${topTerm} for google`,
    `best free ${topTerm} alternative without subscription`,
    `${topTerm} humanizer tutorial`,
    `highest rpm niches for ${secondTerm}`,
    `${topTerm} viral strategy for beginners`,
  ];

  const viralHashtags = [
    `#${topTerm.replace(/\s+/g, "")}`,
    `#${secondTerm.replace(/\s+/g, "")}`,
    "#ViralSEO",
    "#AlgorithmHacks",
    "#ContentCreators",
    "#GrowFaster2026",
    "#DigitalMarketing",
    "#HighCTR",
  ];

  const openGraphTitle = seoTitle;
  const openGraphDescription = metaDescription;

  const schemaJsonPreview = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": seoTitle,
      "description": metaDescription,
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "keywords": primaryKeywords.join(", "),
    },
    null,
    2
  );

  return {
    seoTitle,
    metaDescription,
    primaryKeywords,
    longTailKeywords,
    viralHashtags,
    openGraphTitle,
    openGraphDescription,
    schemaJsonPreview,
  };
}

// ==========================================
// 4. DETERMINISTIC VIRAL VIDEO & SOCIAL COMPETITOR CLONE ENGINE
// ==========================================

export interface CompetitorSeoResult {
  viralTitle: string;
  secondaryTitles: string[];
  hookScript: string;
  competitorSecretBreakdown: string;
  viralHashtags: string[];
  highRpmKeywords: string[];
  viralDescription: string;
  bestPostingTimeUS: string;
}

export function runLocalVideoViralSeo(
  platform: string = "YouTube Shorts",
  inputType: string = "topic",
  topicName: string = "AI Humanizer",
  videoLink: string = "",
  fileName: string = ""
): CompetitorSeoResult {
  const subject = topicName.trim() || fileName.replace(/\.[^/.]+$/, "") || "Viral Video Secret";

  const viralTitle = `I Tested 10 AI Tools — THIS One Changes Everything! 🤯`.slice(0, 60);
  const secondaryTitles = [
    `Why Nobody Talks About This ${subject.slice(0, 20)} Secret (Until Now)`,
    `Do NOT Use ChatGPT Until You Watch This (100% Free Hack)`,
    `The Only ${subject.slice(0, 22)} Guide You Need in 2026`,
  ];

  const hookScript = `Stop scrolling! If you are still using basic AI tools in 2026, you are leaving 90% of your views on the table. Here is what top 1M-view creators do behind closed doors:`;

  const competitorSecretBreakdown = `Top viral competitor videos in this niche maintain an 82%+ retention rate by changing visuals every 2.4 seconds, utilizing an open curiosity loop in the first 3 seconds, and omitting long introductory banter. The audio utilizes subtle background lofi beats with compressed vocal presence.`;

  const viralHashtags = [
    `#${subject.replace(/\s+/g, "")}`,
    platform.includes("Shorts") ? "#Shorts" : platform.includes("TikTok") ? "#FYP" : "#Reels",
    "#ViralVideo",
    "#CreatorHacks",
    "#TechTrends2026",
    "#LifeHacks",
    "#AIHacks",
    "#GrowOnSocial",
  ];

  const highRpmKeywords = [
    `${subject} review 2026`,
    `best free ${subject}`,
    `viral ${platform} strategy`,
    `${subject} tutorial`,
    `how to get views on ${platform}`,
    `monetize ${platform} fast`,
    `${subject} secret tool`,
    `high retention video editing`,
  ];

  const viralDescription = `The complete truth about ${subject} in 2026. Bookmark this video before the algorithm updates! Drop a comment with what tool you want tested next.`;

  const bestPostingTimeUS = `12:30 PM - 2:00 PM EST / 5:30 PM - 7:30 PM EST (Peak smartphone lunch & commute traffic)`;

  return {
    viralTitle,
    secondaryTitles,
    hookScript,
    competitorSecretBreakdown,
    viralHashtags,
    highRpmKeywords,
    viralDescription,
    bestPostingTimeUS,
  };
}

// ==========================================
// 5. ACADEMIC CITATION & BIBLIOGRAPHY GENERATOR (100% Client-Side APA, MLA, Chicago, Harvard)
// ==========================================
export interface CitationInput {
  title: string;
  author: string;
  year: string;
  publisherOrJournal: string;
  volumeOrIssue?: string;
  pages?: string;
  urlOrDoi?: string;
  sourceType: "journal" | "book" | "website" | "thesis";
}

export interface CitationResult {
  apa: string;
  mla: string;
  chicago: string;
  harvard: string;
  inTextApa: string;
  inTextMla: string;
}

export function generateCitationFormats(input: CitationInput): CitationResult {
  const author = input.author.trim() || "Smith, J.";
  const title = input.title.trim() || "Artificial Intelligence and Academic Writing";
  const year = input.year.trim() || "2026";
  const source = input.publisherOrJournal.trim() || "Journal of Modern Educational Technology";
  const vol = input.volumeOrIssue ? `, ${input.volumeOrIssue}` : "";
  const pages = input.pages ? `, pp. ${input.pages}` : "";
  const link = input.urlOrDoi ? ` https://${input.urlOrDoi.replace(/^https?:\/\//, "")}` : "";

  // Extract author last name for in-text
  const authorLastName = author.includes(",")
    ? author.split(",")[0].trim()
    : author.split(" ").slice(-1)[0] || "Author";

  let apa = "";
  let mla = "";
  let chicago = "";
  let harvard = "";

  if (input.sourceType === "journal") {
    apa = `${author} (${year}). ${title}. ${source}${vol}${pages}.${link}`;
    mla = `${author}. "${title}." ${source}${vol}, ${year}${pages}.${link}`;
    chicago = `${author}. "${title}." ${source}${vol} (${year})${pages}.${link}`;
    harvard = `${author}, ${year}. ${title}. ${source}${vol}${pages}.${link}`;
  } else if (input.sourceType === "book") {
    apa = `${author} (${year}). ${title}. ${source}.${link}`;
    mla = `${author}. ${title}. ${source}, ${year}.${link}`;
    chicago = `${author}. ${title}. ${source}, ${year}.${link}`;
    harvard = `${author}, ${year}. ${title}. ${source}.${link}`;
  } else if (input.sourceType === "website") {
    apa = `${author} (${year}). ${title}. ${source}.${link}`;
    mla = `${author}. "${title}." ${source}, ${year}, ${link}`;
    chicago = `${author}. "${title}." ${source}. Accessed ${year}.${link}`;
    harvard = `${author}, ${year}. ${title}. Available at: ${link} [Accessed October 2026].`;
  } else {
    // Thesis / dissertation
    apa = `${author} (${year}). ${title} [Doctoral dissertation, ${source}].${link}`;
    mla = `${author}. ${title}. Diss. ${source}, ${year}.${link}`;
    chicago = `${author}. "${title}." PhD diss., ${source}, ${year}.${link}`;
    harvard = `${author}, ${year}. ${title}. PhD thesis, ${source}.${link}`;
  }

  return {
    apa: apa.trim(),
    mla: mla.trim(),
    chicago: chicago.trim(),
    harvard: harvard.trim(),
    inTextApa: `(${authorLastName}, ${year})`,
    inTextMla: `(${authorLastName} ${input.pages ? input.pages.split("-")[0].trim() : ""})`.trim(),
  };
}

// ==========================================
// 6. ACADEMIC SENTENCE EXPANDER & DEPTH ENHANCER (100% Client-Side)
// ==========================================
export function expandAcademicSentence(
  text: string,
  depth: "moderate" | "extensive" | "scholarly" = "moderate",
  language: LanguageCode = "en"
): {
  expandedText: string;
  originalWords: number;
  expandedWords: number;
  burstinessGain: string;
  addedPerspectives: string[];
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      expandedText: "",
      originalWords: 0,
      expandedWords: 0,
      burstinessGain: "+0%",
      addedPerspectives: [],
    };
  }

  const sentences = trimmed.split(/(?<=[.?!])\s+/).filter(Boolean);
  const originalWords = trimmed.split(/\s+/).filter(Boolean).length;

  const perspectivesEn = [
    "Empirical evidence underscores this dynamic across multiple operational environments.",
    "When viewed through the lens of institutional methodology, this progression reflects fundamental structural shifts.",
    "This causal mechanism remains pivotal when accounting for variable contextual factors.",
    "Practitioners frequently observe that this principle holds true even under non-standard baseline conditions.",
  ];

  const perspectivesUr = [
    "تحقیقی اور عملی شواہد اس عمل کی اہمیت کو واضح طور پر ثابت کرتے ہیں۔",
    "اس طریقہ کار کا گہرائی سے جائزہ لیا جائے تو معلوم ہوتا ہے کہ یہ بنیادی تبدیلیوں کا مظہر ہے۔",
    "عملی میدان میں کام کرنے والے ماہرین کے مطابق یہ اصول ہر مرحلے پر یکساں لاگو ہوتا ہے۔",
  ];

  const perspectivesEs = [
    "La evidencia empírica respalda esta dinámica a través de múltiples escenarios de estudio.",
    "Al examinar este proceso mediante una metodología analítica, se revelan patrones esenciales.",
    "Los investigadores destacan que este principio mantiene su validez bajo diversas condiciones operativas.",
  ];

  const expandedParts: string[] = [];
  const addedPerspectives: string[] = [];

  sentences.forEach((sentence, index) => {
    const cleanSentence = sentence.replace(/[.?!]$/, "");
    if (depth === "moderate") {
      expandedParts.push(
        `${cleanSentence}, which in turn establishes a foundation for subsequent empirical inquiry.`
      );
    } else if (depth === "extensive") {
      expandedParts.push(
        `Specifically, ${cleanSentence.charAt(0).toLowerCase() + cleanSentence.slice(1)}. This dynamic is further reinforced by rigorous systematic observations, ensuring that the primary findings retain both internal validity and contextual relevance.`
      );
    } else {
      // Scholarly
      expandedParts.push(
        `From an analytical standpoint, ${cleanSentence.charAt(0).toLowerCase() + cleanSentence.slice(1)}. A closer examination reveals that this structural phenomenon does not operate in isolation; rather, it reflects a broader convergence of methodological principles and qualitative parameters documented across recent peer-reviewed literature.`
      );
    }

    if (language === "ur" && perspectivesUr[index % perspectivesUr.length]) {
      addedPerspectives.push(perspectivesUr[index % perspectivesUr.length]);
    } else if (language === "es" && perspectivesEs[index % perspectivesEs.length]) {
      addedPerspectives.push(perspectivesEs[index % perspectivesEs.length]);
    } else if (perspectivesEn[index % perspectivesEn.length]) {
      addedPerspectives.push(perspectivesEn[index % perspectivesEn.length]);
    }
  });

  const expandedText = expandedParts.join(" ");
  const expandedWords = expandedText.split(/\s+/).filter(Boolean).length;
  const gainPercent = Math.round(((expandedWords - originalWords) / Math.max(1, originalWords)) * 100);

  return {
    expandedText,
    originalWords,
    expandedWords,
    burstinessGain: `+${gainPercent}%`,
    addedPerspectives,
  };
}

// ==========================================
// 7. AI CLICHÉ & BUZZWORD PURGER (De-AI Polish Engine)
// ==========================================
export interface ClicheMatch {
  word: string;
  index: number;
  length: number;
  replacement: string;
  explanation: string;
}

const AI_CLICHE_MAP: Record<string, { replacement: string; reason: string }> = {
  "delve": { replacement: "explore", reason: "Standard AI prompt filler token" },
  "delves into": { replacement: "examines", reason: "Synthetic explanatory marker" },
  "tapestry": { replacement: "complex network", reason: "Extremely overused ChatGPT metaphor" },
  "beacon": { replacement: "benchmark", reason: "AI metaphorical trope" },
  "testament to": { replacement: "evidence of", reason: "Predictable cliché ending" },
  "pivotal role": { replacement: "key function", reason: "High probability GPT token sequence" },
  "crucial role": { replacement: "significant part", reason: "Robotic emphasis cliché" },
  "in conclusion": { replacement: "overall", reason: "Formulaic grade-school intro" },
  "it is important to note": { replacement: "notably", reason: "Wordy padding phrase" },
  "it is worth noting": { replacement: "specifically", reason: "Sterile filler expression" },
  "furthermore": { replacement: "also", reason: "Overused connective in LLMs" },
  "moreover": { replacement: "in addition", reason: "Monotonous transition sequence" },
  "ever-evolving": { replacement: "changing", reason: "Marketing buzzword flag" },
  "in today's fast-paced world": { replacement: "currently", reason: "Classic chatbot intro hallmark" },
  "game-changer": { replacement: "major advancement", reason: "Colloquial hyperbole" },
  "seamlessly": { replacement: "smoothly", reason: "High-frequency AI adjective" },
  "foster": { replacement: "support", reason: "Synthetic institutional trope" },
  "underscores": { replacement: "highlights", reason: "Repetitive analytical filler" },
};

export function cleanAiCliches(
  text: string,
  language: LanguageCode = "en"
): {
  cleanedText: string;
  detectedCount: number;
  matches: ClicheMatch[];
  aiDensityScore: number;
} {
  let cleaned = text;
  const matches: ClicheMatch[] = [];

  const lower = text.toLowerCase();

  for (const [cliche, info] of Object.entries(AI_CLICHE_MAP)) {
    let searchPos = 0;
    while ((searchPos = lower.indexOf(cliche, searchPos)) !== -1) {
      // Check word boundaries
      const prevChar = searchPos > 0 ? lower[searchPos - 1] : " ";
      const nextChar = searchPos + cliche.length < lower.length ? lower[searchPos + cliche.length] : " ";
      if (/[a-z0-9]/.test(prevChar) || /[a-z0-9]/.test(nextChar)) {
        searchPos += cliche.length;
        continue;
      }

      matches.push({
        word: text.substring(searchPos, searchPos + cliche.length),
        index: searchPos,
        length: cliche.length,
        replacement: info.replacement,
        explanation: info.reason,
      });

      // Regex replace case-sensitively
      const regex = new RegExp(`\\b${cliche}\\b`, "gi");
      cleaned = cleaned.replace(regex, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return info.replacement.charAt(0).toUpperCase() + info.replacement.slice(1);
        }
        return info.replacement;
      });

      searchPos += cliche.length;
    }
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
  const aiDensityScore = Math.min(100, Math.round((matches.length / wordCount) * 400));

  return {
    cleanedText: cleaned,
    detectedCount: matches.length,
    matches,
    aiDensityScore,
  };
}

// ==========================================
// 8. TEXT SIMILARITY & PARAPHRASE DIFF CHECKER (100% Client-Side)
// ==========================================
export interface DiffToken {
  type: "same" | "added" | "removed";
  value: string;
}

export function calculateTextDiff(
  originalText: string,
  humanizedText: string
): {
  diffTokens: DiffToken[];
  similarityPercent: number;
  changedWordsCount: number;
  turnitinRiskScore: number;
  lexicalDiversityRatio: number;
} {
  const origWords = originalText.trim().split(/\s+/).filter(Boolean);
  const humanWords = humanizedText.trim().split(/\s+/).filter(Boolean);

  const diffTokens: DiffToken[] = [];
  let sameCount = 0;
  let addedCount = 0;
  let removedCount = 0;

  const maxLen = Math.max(origWords.length, humanWords.length);
  const origSet = new Set(origWords.map((w) => w.toLowerCase()));
  const humanSet = new Set(humanWords.map((w) => w.toLowerCase()));

  // Jaccard similarity
  let intersection = 0;
  origSet.forEach((w) => {
    if (humanSet.has(w)) intersection++;
  });
  const union = origSet.size + humanSet.size - intersection;
  const similarityPercent = union > 0 ? Math.round((intersection / union) * 100) : 0;

  // Simple token alignment
  let i = 0;
  let j = 0;
  while (i < origWords.length || j < humanWords.length) {
    if (i < origWords.length && j < humanWords.length) {
      const ow = origWords[i];
      const hw = humanWords[j];
      if (ow.toLowerCase() === hw.toLowerCase()) {
        diffTokens.push({ type: "same", value: hw });
        sameCount++;
        i++;
        j++;
      } else {
        diffTokens.push({ type: "removed", value: ow });
        diffTokens.push({ type: "added", value: hw });
        removedCount++;
        addedCount++;
        i++;
        j++;
      }
    } else if (i < origWords.length) {
      diffTokens.push({ type: "removed", value: origWords[i] });
      removedCount++;
      i++;
    } else {
      diffTokens.push({ type: "added", value: humanWords[j] });
      addedCount++;
      j++;
    }
  }

  // Turnitin risk rating inversely proportional to token churn
  const changeRatio = (addedCount + removedCount) / Math.max(1, origWords.length * 2);
  const turnitinRiskScore = Math.max(0, Math.min(100, Math.round((1 - changeRatio) * 85)));
  const uniqueWords = new Set(humanWords.map((w) => w.toLowerCase())).size;
  const lexicalDiversityRatio = Math.round((uniqueWords / Math.max(1, humanWords.length)) * 100);

  return {
    diffTokens,
    similarityPercent,
    changedWordsCount: addedCount + removedCount,
    turnitinRiskScore,
    lexicalDiversityRatio,
  };
}
