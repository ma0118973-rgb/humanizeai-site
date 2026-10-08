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
  "it is important to note that": ["note that", "keep in mind that", "it's worth remembering that"],
  "it is important to note": ["note", "remember"],
  "in today's fast-paced world": ["today", "in our time", "nowadays"],
  "in today's world": ["today", "now"],
  "dive into": ["explore", "look at", "examine"],
  "diving into": ["exploring", "looking at"],
  "unlock the power of": ["use", "tap into", "harness"],
  "harness the power of": ["use", "leverage"],
  "in the ever-evolving world of": ["in", "across"],
  "ever-evolving": ["changing", "shifting", "developing"],
  "cutting-edge": ["advanced", "modern", "latest"],
  "state-of-the-art": ["advanced", "modern", "top-tier"],
  "revolutionize": ["transform", "change", "reshape"],
  "revolutionizes": ["transforms", "changes"],
  "revolutionary": ["groundbreaking", "innovative", "transformative"],
  "seamless": ["smooth", "effortless"],
  "seamlessly": ["smoothly", "easily"],
  "leverage": ["use", "take advantage of"],
  "leveraging": ["using"],
  "robust": ["strong", "solid", "reliable"],
  "comprehensive": ["thorough", "complete", "detailed"],
  "innovative": ["new", "creative", "fresh"],
  "transformative": ["powerful", "major", "significant"],
  "unleash": ["release", "unlock"],
  "elevate": ["improve", "boost", "raise"],
  "elevates": ["improves", "boosts"],
  "navigate": ["handle", "manage", "work through"],
  "navigating": ["handling", "working through"],
  "landscape": ["field", "area", "space"],
  "realm": ["area", "field"],
  "tapestry": ["mix", "blend"],
  "delve": ["explore", "examine"],
  "furthermore": ["also", "plus", "what's more"],
  "nevertheless": ["still", "even so", "however"],
  "nonetheless": ["still", "however"],
  "consequently": ["so", "as a result", "therefore"],
  "accordingly": ["so", "therefore"],
  "hence": ["so", "therefore"],
  "thus": ["so", "this way"],
  "therefore": ["so"],
  "in addition": ["also", "plus"],
  "additionally": ["also", "plus"],
  "in summary": ["in short", "to sum up"],
  "to summarize": ["in short"],
  "overall": ["all in all"],
  "ultimately": ["in the end", "finally"],
  "basically": [""],
  "essentially": [""],
  "literally": [""],
  "very": [""],
  "really": [""],
  "quite": [""],
  "rather": [""],
  "fairly": [""],
  "in order to": ["to"],
  "due to": ["because of", "thanks to"],
  "owing to": ["because of"],
  "with regard to": ["about", "regarding"],
  "in regards to": ["about"],
  "as well as": ["and"],
  "along with": ["with"],
  "in terms of": ["for", "regarding"],
  "a number of": ["several", "many"],
  "a variety of": ["various", "different"],
  "a range of": ["several"],
  "kind of": [""],
  "sort of": [""],
  "type of": [""],
  "in the process of": [""],
  "the fact that": ["that"],
  "it goes without saying that": [""],
  "needless to say": [""],
  "as a matter of fact": ["actually", "in fact"],
  "for all intents and purposes": ["practically"],
  "at this point in time": ["now"],
  "in this day and age": ["today", "now"],
  "when it comes to": ["for"],
  "in the context of": ["in"],
  "from the perspective of": ["for"],
  "it is evident that": ["clearly"],
  "it is clear that": ["clearly"],
  "it is obvious that": ["obviously"],
  "there is no doubt that": [""],
  "without a doubt": [""],
  "it should be noted that": ["note that"],
  "it must be noted that": ["note that"],
  "it is worth mentioning that": [""],
  "last but not least": ["finally"],
  "first of all": ["first"],
  "to begin with": ["first"],
  "in the first place": ["first"],
  "on the other hand": ["but", "however"],
  "by contrast": ["but"],
  "in contrast": ["but"],
  "on the contrary": ["instead"],
  "in spite of": ["despite"],
  "regardless of": ["despite"],
  "in place of": ["instead of"],
  "as opposed to": ["rather than"],
  "with the exception of": ["except"],
  "in excess of": ["more than"],
  "in lieu of": ["instead of"],
  "prior to": ["before"],
  "subsequent to": ["after"],
  "following": ["after"],
  "during the course of": ["during"],
  "in the course of": ["during"],
  "by means of": ["by", "with"],
  "by virtue of": ["because of"],
  "in view of": ["given"],
  "in light of": ["given"],
  "taking into account": ["considering"],
  "take into account": ["consider"],
  "give rise to": ["cause"],
  "bring about": ["cause"],
  "result in": ["cause", "lead to"],
  "lead to": ["cause"],
  "contribute to": ["help"],
  "play a role in": ["affect"],
  "have an impact on": ["affect"],
  "make a difference": ["help"],
  "take advantage of": ["use"],
  "make use of": ["use"],
  "put to use": ["use"],
  "come up with": ["create", "think of"],
  "carry out": ["do"],
  "bring up": ["mention", "raise"],
  "point out": ["note", "mention"],
  "figure out": ["solve", "understand"],
  "find out": ["learn", "discover"],
  "look into": ["check", "investigate"],
  "deal with": ["handle"],
  "cope with": ["handle"],
  "keep up with": ["follow"],
  "catch up with": ["meet"],
  "get rid of": ["remove", "drop"],
  "do away with": ["remove"],
  "make sure": ["ensure", "check"],
  "find a way to": [""],
  "there are": [""],
  "there is": [""],
  "it is": ["it's"],
  "that is": ["that's"],
  "there are many": ["many"],
  "in conclusion": ["to wrap up", "finally", "in short"],
};

/** Deterministic pick: same input always yields the same replacement. */
function stablePick(options: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return options[h % options.length];
}

/**
 * Plain-language swaps: stiff/formal words AI models overuse, replaced with
 * the plain alternative a human editor would choose. Meaning-preserving.
 */
const PLAIN_WORD_SWAPS: Record<string, string[]> = {
  "utilize": ["use"],
  "utilizes": ["uses"],
  "utilizing": ["using"],
  "commence": ["start", "begin"],
  "commencing": ["starting", "beginning"],
  "commenced": ["started", "began"],
  "purchased": ["bought"],
  "purchase": ["buy"],
  "assistance": ["help"],
  "individuals": ["people"],
  "numerous": ["many"],
  "facilitate": ["help"],
  "demonstrate": ["show"],
  "demonstrates": ["shows"],
  "indicate": ["show", "point to"],
  "indicates": ["shows"],
  "obtain": ["get"],
  "obtained": ["got"],
  "require": ["need"],
  "requires": ["needs"],
  "required": ["needed"],
  "sufficient": ["enough"],
  "approximately": ["about", "around"],
  "prior to": ["before"],
  "subsequent to": ["after"],
  "in order to": ["to"],
  "due to the fact that": ["because"],
  "despite the fact that": ["although", "even though"],
  "in the event that": ["if"],
  "are able to": ["can"],
  "is able to": ["can"],
  "has the ability to": ["can"],
  "a large number of": ["many"],
  "a wide range of": ["many", "various"],
  "in the realm of": ["in"],
  "serves as": ["is", "acts as"],
  "plays a pivotal role in": ["is key to", "drives"],
  "shed light on": ["explain", "clarify"],
  "at the end of the day": ["ultimately"],
  "first and foremost": ["first"],
  "each and every": ["every", "each"],
  "in close proximity to": ["near"],
  "in light of the fact that": ["because", "since"],
  "with regard to": ["about", "on"],
  "with respect to": ["about", "on"],
};

/**
 * Filler phrases that add words without meaning. Shortened or cut.
 * Empty-string replacement removes the phrase (and tidies spacing).
 */
const FILLER_CUTS: Record<string, string> = {
  "it is important to note that": "note that",
  "it is important to remember that": "remember that",
  "it is essential to understand that": "understand that",
  "there is no doubt that": "",
  "it goes without saying that": "",
  "in today's fast-paced world,": "",
  "in todays fast-paced world,": "",
  "when it comes to": "for",
  "the fact that": "that",
  "for all intents and purposes,": "",
  "at this point in time": "now",
  "in the current era of": "in today's",
};

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
  let plainSwaps = 0;
  let fillerCuts = 0;

  // Helper: apply a dictionary of replacements with case preservation
  const applyDict = (
    dict: Record<string, string[] | string>,
    counter: { n: number }
  ) => {
    // Longer phrases first so "in order to" beats "order" etc.
    const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      const options = Array.isArray(dict[key]) ? (dict[key] as string[]) : [dict[key] as string];
      const scan = new RegExp(`(?<!\\w)${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!\\w)`, "gi");
      let m: RegExpExecArray | null;
      const matches: string[] = [];
      while ((m = scan.exec(rewritten)) !== null) matches.push(m[0]);
      for (const match of matches) {
        const chosen = options.length > 1 ? stablePick(options, match.toLowerCase() + rewritten.length) : options[0];
        let replacement: string;
        if (!chosen) {
          // Filler cut: remove the phrase, tidy up leftover spacing/punctuation
          replacement = "";
        } else if (match[0] === match[0].toUpperCase()) {
          replacement = chosen.charAt(0).toUpperCase() + chosen.slice(1);
        } else {
          replacement = chosen;
        }
        rewritten = rewritten.replace(match, replacement);
        counter.n++;
      }
    }
  };

  // 1. Substitute robotic cliché markers (deterministic: same input -> same output)
  for (const [cliche, replacements] of Object.entries(CLICHE_REPLACEMENTS)) {
    let m: RegExpExecArray | null;
    // Collect matches first so each gets its own stable pick
    const matches: string[] = [];
    const scan = new RegExp(`(?<!\\w)${cliche}(?!\\w)`, "gi");
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

  // 1b. Plain-language swaps: stiff formal words -> natural alternatives
  {
    const c = { n: 0 };
    applyDict(PLAIN_WORD_SWAPS, c);
    plainSwaps = c.n;
  }

  // 1c. Filler cuts: drop empty phrases, then tidy spacing
  {
    const c = { n: 0 };
    applyDict(FILLER_CUTS, c);
    fillerCuts = c.n;
    rewritten = rewritten
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\s+([,.!?;:])/g, "$1")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")");
    // Re-capitalize sentence starts (a cut may have exposed a lowercase word)
    rewritten = rewritten.replace(/(^|[.!?]\s+)([a-z])/g, (_m, p1, p2) => p1 + p2.toUpperCase());
  }

  // 2. Inject contractions for natural human flow
  if (tone === "conversational" || tone === "creative" || level === "ultra-stealth") {
    for (const [formal, contracted] of Object.entries(EXPAND_CONTRACTIONS)) {
      const reg = new RegExp(`(?<!\\w)${formal}(?!\\w)`, "g");
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

  // 3b. Fallback: if nothing changed, apply natural human touches so output is never identical
  const totalChanges = clicheReplacements + contractionsApplied + sentencesSplit + plainSwaps + fillerCuts;
  let finalText = rewrittenParagraphs.join("\n\n");
  if (totalChanges === 0 && finalText.trim()) {
    const sentences = finalText.split(/(?<=[.?!])\s+/).filter(Boolean);
    // Natural contractions
    finalText = finalText
      .replace(/\bIt is\b/g, "It's")
      .replace(/\bThere is\b/g, "There's")
      .replace(/\bI am\b/g, "I'm")
      .replace(/\bWe are\b/g, "We're")
      .replace(/\bYou are\b/g, "You're")
      .replace(/\bThey are\b/g, "They're")
      .replace(/\bDo not\b/g, "Don't")
      .replace(/\bDoes not\b/g, "Doesn't")
      .replace(/\bDid not\b/g, "Didn't")
      .replace(/\bCannot\b/g, "Can't")
      .replace(/\bWill not\b/g, "Won't")
      .replace(/\bShould not\b/g, "Shouldn't")
      .replace(/\bCould not\b/g, "Couldn't")
      .replace(/\bWould not\b/g, "Wouldn't")
      .replace(/\bHave not\b/g, "Haven't")
      .replace(/\bHas not\b/g, "Hasn't");
    // Add natural variety to repetitive sentence starts
    if (sentences.length >= 3) {
      const varied = sentences.map((s, i) => {
        s = s.trim();
        if (i > 0 && i % 3 === 2 && s.length > 15) {
          // Every 3rd sentence: add a natural connector for flow
          const connectors = ["And ", "Plus, ", "Also, "];
          const conn = connectors[i % connectors.length];
          if (!/^(And|But|So|Plus|Also|However)/i.test(s)) {
            s = conn.charAt(0).toLowerCase() + conn.slice(1) + s.charAt(0).toLowerCase() + s.slice(1);
          }
        }
        return s;
      });
      finalText = varied.join(" ");
    }
  }

  const finalHumanizedText = finalText;

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
    clicheReplacements > 0
      ? `Replaced ${clicheReplacements} AI-style cliché${clicheReplacements === 1 ? "" : "s"} with plain alternatives.`
      : "No overused AI clichés found.",
    plainSwaps > 0
      ? `Simplified ${plainSwaps} stiff formal word${plainSwaps === 1 ? "" : "s"} into plain language.`
      : "Word choice already natural — no simplifications needed.",
    fillerCuts > 0
      ? `Cut ${fillerCuts} empty filler phrase${fillerCuts === 1 ? "" : "s"} for tighter writing.`
      : "No filler phrases to cut.",
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
  // Use the FULL topic as the primary keyword, not just top-2 words
  const topic = clean.length > 0 ? clean : "AI Content";
  // Clean topic for keyword use (lowercase, no special chars)
  const topicLower = topic.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const topicTitle = topic.length <= 50 ? topic : topic.slice(0, 47) + "...";
  const startsWithBest = /^(best|top)\s/i.test(topicLower);
  const topicNoBest = topicLower.replace(/^(best|top)\s+/i, "");

  // Smart SEO title: avoid cutting mid-word
  let seoTitle = `${topicTitle} – Complete Guide & Free Tools (2026)`;
  if (seoTitle.length > 60) {
    seoTitle = seoTitle.slice(0, 57).replace(/\s+\S*$/, "") + "...";
  }

  // Natural meta description using the FULL topic
  let metaDescription = `Learn everything about ${topicLower}: practical tips, free tools, and step-by-step guidance. Updated for 2026.`;
  if (metaDescription.length > 158) {
    metaDescription = metaDescription.slice(0, 155).replace(/\s+\S*$/, "") + "...";
  }

  // Sensible keyword variations based on the full topic (avoid "best best" duplication)
  const primaryKeywords = [
    topicLower,
    startsWithBest ? `${topicLower} guide` : `best ${topicLower}`,
    startsWithBest ? `${topicLower} 2026` : `${topicLower} guide`,
    `${topicLower} 2026`,
    `free ${topicNoBest || topicLower} tools`,
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);

  const longTailKeywords = [
    `${topicLower} for beginners step by step`,
    `${topicNoBest || topicLower} tips and tricks 2026`,
    `how to choose ${topicNoBest || topicLower}`,
    `${topicLower} complete tutorial`,
    `free ${topicNoBest || topicLower} resources online`,
  ];

  // Hashtags from meaningful topic words (skip stop words, use up to 3)
  const stopWords = new Set(["the", "and", "for", "with", "best", "top", "how", "what", "why"]);
  const topicWords = topicLower.split(" ").filter((w) => w.length >= 3 && !stopWords.has(w)).slice(0, 3);
  const viralHashtags = [
    ...topicWords.map((w) => `#${w.charAt(0).toUpperCase() + w.slice(1)}`),
    "#SEO",
    "#ContentMarketing",
    "#DigitalMarketing",
    "#GrowOnline",
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
  const subject = topicName.trim() || fileName.replace(/\.[^/.]+$/, "") || "Video Topic";

  const viralTitle = `${subject.slice(0, 40)}: Honest Review & Practical Tips (2026)`.slice(0, 60);
  const secondaryTitles = [
    `${subject.slice(0, 35)} Explained Simply for Beginners`,
    `What I Learned About ${subject.slice(0, 30)} (2026 Update)`,
    `${subject.slice(0, 35)}: Common Mistakes to Avoid`,
  ];

  const hookScript = `In the next few minutes, I'll share practical tips about ${subject} that actually work — no hype, just what I've learned from experience.`;

  const competitorSecretBreakdown = `Successful videos in this niche tend to: hook viewers in the first few seconds with a clear promise, keep a brisk pace with frequent visual changes, deliver on the title's promise early, and end with a clear call to action. Focus on genuine value over tricks — audiences can tell the difference.`;

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

  const viralDescription = `A practical guide to ${subject} in 2026. Timestamps and resources in the description. Let me know in the comments what you'd like covered next.`;

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
  similarityRiskScore: number;
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
  const similarityRiskScore = Math.max(0, Math.min(100, Math.round((1 - changeRatio) * 85)));
  const uniqueWords = new Set(humanWords.map((w) => w.toLowerCase())).size;
  const lexicalDiversityRatio = Math.round((uniqueWords / Math.max(1, humanWords.length)) * 100);

  return {
    diffTokens,
    similarityPercent,
    changedWordsCount: addedCount + removedCount,
    similarityRiskScore,
    lexicalDiversityRatio,
  };
}

// ==========================================
// 10. EXTRACTIVE TEXT SUMMARIZER (100% Client-Side, Language-Agnostic)
// ==========================================

export interface SummaryResult {
  summary: string;
  keySentences: string[];
  originalWordCount: number;
  summaryWordCount: number;
  compressionRatio: number;
  readingTimeSaved: string;
}

const SUMMARY_STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "as", "is", "was", "are", "were", "be", "been", "being", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should", "may",
  "might", "must", "shall", "can", "this", "that", "these", "those", "i", "you",
  "he", "she", "it", "we", "they", "them", "their", "what", "which", "who",
  "whom", "whose", "where", "when", "why", "how", "all", "each", "every", "both",
  "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
  "own", "same", "so", "than", "too", "very", "just", "into", "over", "after",
]);

export function summarizeText(
  text: string,
  targetRatio: "brief" | "balanced" | "detailed" = "balanced"
): SummaryResult {
  const clean = text.trim();
  const originalWordCount = clean.split(/\s+/).filter(Boolean).length;

  if (!clean || originalWordCount < 30) {
    return {
      summary: clean,
      keySentences: clean ? [clean] : [],
      originalWordCount,
      summaryWordCount: originalWordCount,
      compressionRatio: 100,
      readingTimeSaved: "0 min",
    };
  }

  // Split into sentences (works for most languages)
  const sentences = clean
    .split(/(?<=[.!?。！？…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 4);

  if (sentences.length <= 3) {
    return {
      summary: clean,
      keySentences: sentences,
      originalWordCount,
      summaryWordCount: originalWordCount,
      compressionRatio: 100,
      readingTimeSaved: "0 min",
    };
  }

  // Word frequency (excluding stop words)
  const freq: Record<string, number> = {};
  for (const s of sentences) {
    const words = s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/);
    for (const w of words) {
      if (w.length >= 3 && !SUMMARY_STOP_WORDS.has(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }
  }

  // Score sentences: sum of word frequencies, normalized by length
  // Bonus for sentences containing numbers/dates (often key facts)
  // Bonus for first and last sentences (often contain thesis/conclusion)
  const scored = sentences.map((s, idx) => {
    const words = s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
    let score = 0;
    for (const w of words) {
      if (w.length >= 3 && !SUMMARY_STOP_WORDS.has(w)) {
        score += freq[w] || 0;
      }
    }
    // Normalize by sqrt of length (favor informative but not bloated sentences)
    score = score / Math.sqrt(Math.max(1, words.length));
    // Position bonus: first 2 and last 1 sentences
    if (idx < 2) score *= 1.15;
    if (idx === sentences.length - 1) score *= 1.1;
    // Number/date bonus (key facts)
    if (/\d/.test(s)) score *= 1.1;
    return { sentence: s, score, idx };
  });

  // How many sentences to keep
  const ratios = { brief: 0.25, balanced: 0.4, detailed: 0.6 };
  const keepCount = Math.max(2, Math.min(sentences.length - 1, Math.round(sentences.length * ratios[targetRatio])));

  // Pick top sentences, then restore original order
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, keepCount)
    .sort((a, b) => a.idx - b.idx);

  const keySentences = top.map((t) => t.sentence);
  const summary = keySentences.join(" ");
  const summaryWordCount = summary.split(/\s+/).filter(Boolean).length;
  const compressionRatio = Math.round((summaryWordCount / Math.max(1, originalWordCount)) * 100);
  const minutesSaved = Math.max(0, Math.round((originalWordCount - summaryWordCount) / 200));
  const readingTimeSaved = minutesSaved < 1 ? "<1 min" : `~${minutesSaved} min`;

  return {
    summary,
    keySentences,
    originalWordCount,
    summaryWordCount,
    compressionRatio,
    readingTimeSaved,
  };
}
