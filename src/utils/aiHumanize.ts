import { HumanizeResult, ToneType, BypassLevel, LanguageCode } from "../types";
import { runLocalHumanize, analyzeReadability } from "./localEngines";

const FUNCTION_URL = "/.netlify/functions/humanize";
const AI_TIMEOUT_MS = 20000;

/**
 * Humanize with AI when available, always falling back to the local engine.
 * - Tries the Netlify Function (Gemini, key kept server-side in env vars).
 * - On ANY failure — no key configured, quota exhausted (429), rate limit,
 *   timeout, network error — silently uses the deterministic local engine.
 * Returns the result plus which engine produced it.
 */
export async function humanizeWithFallback(
  text: string,
  tone: ToneType,
  level: BypassLevel,
  targetLanguage: LanguageCode,
  signal?: AbortSignal
): Promise<{ result: HumanizeResult; engine: "ai" | "local" }> {
  const clean = text.trim();
  if (!clean) {
    return { result: runLocalHumanize(text, tone, level, targetLanguage), engine: "local" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    const onAbort = () => controller.abort();
    if (signal) {
      if (signal.aborted) throw new Error("aborted");
      signal.addEventListener("abort", onAbort, { once: true });
    }
    let res: Response;
    try {
      res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ text: clean.slice(0, 12000), tone }),
      });
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
    }

    if (!res.ok) throw new Error(`function_${res.status}`);
    const data = await res.json();
    const aiText = String(data?.text || "").trim();
    if (!aiText) throw new Error("empty_ai_response");

    const metrics = analyzeReadability(aiText);
    const origWords = clean.split(/\s+/).filter(Boolean).length;
    const result: HumanizeResult = {
      humanizedText: aiText,
      readabilityGrade: metrics.readabilityGrade,
      fleschReadingEase: metrics.fleschReadingEase,
      gunningFogIndex: metrics.gunningFogIndex,
      passiveVoicePercent: metrics.passiveVoicePercent,
      perplexityScore: "AI-enhanced",
      burstinessScore: "AI-enhanced",
      wordCountOriginal: origWords,
      wordCountHumanized: metrics.wordCount,
      changesHighlights: [
        "Rewritten with AI assistance for natural sentence variety and tone.",
        "AI-style clichés replaced with plain, natural alternatives.",
        "Meaning and facts preserved — please review the result.",
      ],
    };
    return { result, engine: "ai" };
  } catch {
    // Fallback: quota exhausted, no key, offline, timeout — tool keeps working.
    return { result: runLocalHumanize(text, tone, level, targetLanguage), engine: "local" };
  }
}
