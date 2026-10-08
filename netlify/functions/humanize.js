// Netlify Function: AI-assisted text humanizing via Google Gemini.
// The API key lives ONLY in Netlify environment variables (GEMINI_API_KEY)
// and never reaches the browser. Any failure (missing key, quota exhausted,
// rate limit, timeout) returns 502 so the frontend falls back to the
// built-in offline engine — the tool keeps working no matter what.
const MODEL = "gemini-2.0-flash";
const MAX_CHARS = 12000; // ~3,000 words, matches the marketed limit

const TONE_HINTS = {
  conversational: "Use a relaxed, conversational tone with natural contractions.",
  academic: "Keep a formal academic tone suitable for research writing.",
  professional: "Keep a polished, professional business tone.",
  creative: "Use a vivid, engaging creative tone.",
  balanced: "Use a balanced, versatile tone.",
};

function buildPrompt(text, tone) {
  const toneHint = TONE_HINTS[tone] || TONE_HINTS.conversational;
  return (
    "Rewrite the following text so it sounds naturally human-written. " +
    toneHint + " " +
    "Rules: vary sentence lengths (mix short punchy sentences with longer flowing ones); " +
    "replace overused AI buzzwords (delve, tapestry, testament, pivotal, crucial, furthermore, moreover, game-changer, foster, embark) with plain natural alternatives; " +
    "use contractions where natural; " +
    "preserve the original meaning, facts, names, numbers and citations exactly; " +
    "do NOT add new ideas, filler phrases, or commentary; " +
    "output ONLY the rewritten text, nothing else.\n\nTEXT:\n" +
    text
  );
}

export async function handler(event) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "no_api_key" }) };
  }

  let text = "";
  let tone = "conversational";
  try {
    const body = JSON.parse(event.body || "{}");
    text = String(body.text || "").slice(0, MAX_CHARS).trim();
    if (body.tone && TONE_HINTS[body.tone]) tone = body.tone;
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "bad_request" }) };
  }
  if (!text) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "empty_text" }) };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000); // stay under function limits
    let res;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(text, tone) }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
          }),
        }
      );
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      // 429 = quota/rate limit exhausted, 400/401/403 = key problem, 5xx = Google issue
      const code = res.status === 429 ? "quota_exhausted" : "provider_error";
      return { statusCode: 502, headers, body: JSON.stringify({ error: code }) };
    }

    const data = await res.json();
    const out =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("")?.trim() || "";
    if (!out) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "empty_response" }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ text: out, source: "ai" }) };
  } catch {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "request_failed" }) };
  }
}
