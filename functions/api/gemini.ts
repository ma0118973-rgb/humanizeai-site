/**
 * Secure Gemini API proxy for Cloudflare Pages Functions.
 * The GEMINI_API_KEY is stored as an encrypted environment variable in
 * Cloudflare dashboard — NEVER in code. This function proxies requests
 * so the key never reaches the browser.
 */

interface Env {
  GEMINI_API_KEY: string;
}

const ALLOWED_ORIGINS = [
  "https://humanizeai-f2e.pages.dev",
];

// Basic per-IP rate limiting (in-memory sliding window, per isolate).
// Generous enough for real users, strict enough to blunt casual abuse.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = hits.get(ip) || [];
  const fresh = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  fresh.push(now);
  hits.set(ip, fresh);
  // keep the map small
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v[v.length - 1] < now - RATE_LIMIT_WINDOW_MS) hits.delete(k);
      if (hits.size <= 4000) break;
    }
  }
  return fresh.length > RATE_LIMIT_MAX;
}

function corsHeaders(origin: string | null): Record<string, string> {
  // Exact origin match only — no prefix matching.
  const allowed = origin !== null && ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin! : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;
  const origin = request.headers.get("Origin");
  const headers = corsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers,
    });
  }

  if (!env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI service not configured", fallback: true }),
      { status: 503, headers }
    );
  }

  const clientIp =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({
        error: "Too many requests, please wait a minute",
        fallback: true,
      }),
      { status: 429, headers }
    );
  }

  try {
    const body = (await request.json()) as {
      prompt?: string;
      type?: string;
      tone?: string;
      language?: string;
    };

    const prompt = (body.prompt || "").slice(0, 4000);
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Empty prompt" }), {
        status: 400,
        headers,
      });
    }

    // Build a focused prompt based on tool type
    const type = body.type || "humanize";
    const tone = body.tone || "conversational";
    const lang = body.language || "en";
    const systemPrompts: Record<string, string> = {
      humanize: `Rewrite the following text to sound natural and human-written with a ${tone} tone. Keep the same meaning and language (${lang}). Do not add explanations, just return the rewritten text:`,
      detect: `Analyze if the following text was likely written by AI or a human. Reply with ONLY a number 0-100 (AI likelihood percentage) followed by one short reason:`,
      expand: `Expand the following text with more detail while keeping the same meaning and language. Return only the expanded text:`,
      summarize: `Summarize the following text concisely. Return only the summary:`,
      seo: `Generate SEO suggestions (title, meta description, keywords) for the following text. Keep it brief:`,
    };

    const fullPrompt = `${systemPrompts[type] || systemPrompts.humanize}\n\n${prompt}`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Key sent via header, never in the URL.
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
      }
    );

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      // Don't leak key or full error to client
      const isQuota = geminiResp.status === 429;
      return new Response(
        JSON.stringify({
          error: isQuota ? "AI quota exceeded, try again later" : "AI temporarily unavailable",
          fallback: true,
        }),
        { status: 502, headers }
      );
    }

    const data = (await geminiResp.json()) as any;
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ text: text.trim() }), {
      status: 200,
      headers,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Request failed", fallback: true }),
      { status: 500, headers }
    );
  }
}
