/**
 * Shared helper: try the Cloudflare Gemini proxy (/api/gemini) for any tool.
 * Returns the AI text on success, or null on ANY failure (no key, quota,
 * timeout, network) so the caller can fall back to its local engine.
 * The key never leaves the server — the browser only talks to /api/gemini.
 */

const FUNCTION_URL = "/api/gemini";
const AI_TIMEOUT_MS = 20000;

export type AiAssistType = "humanize" | "detect" | "expand" | "summarize" | "seo";

export async function tryAiAssist(
  prompt: string,
  type: AiAssistType,
  signal?: AbortSignal
): Promise<string | null> {
  const clean = prompt.trim().slice(0, 4000);
  if (!clean) return null;
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
        body: JSON.stringify({ prompt: clean, type }),
      });
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
    }
    if (!res.ok) return null;
    const data = await res.json();
    const text = String(data?.text || "").trim();
    return text || null;
  } catch {
    return null;
  }
}
