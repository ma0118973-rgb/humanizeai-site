import { ChevronDown, ListChecks, MessageCircleQuestion } from "lucide-react";
import { ActivePage, LanguageCode } from "../types";
import { SEO_CONFIGS } from "../utils/seo";
import TOOL_FAQS from "../data/toolFaqs.json";

/**
 * AEO/GEO section shown under every English tool page:
 * citation-ready quick facts + the tool's common questions.
 *
 * Single source of truth is src/data/toolFaqs.json — the FAQPage schema
 * injected by src/utils/seo.ts (and baked into static shells by
 * scripts/generate-static-pages.mjs) uses exactly the same questions and
 * answers, so visible text and schema can never drift apart.
 *
 * English batch first (owner's standing sweep order); other languages
 * return null here until their own batches land.
 */
export function ToolFaqSection({
  page,
  lang,
}: {
  page: ActivePage;
  lang: LanguageCode;
}) {
  if (lang !== "en") return null;
  const entry = (TOOL_FAQS as Record<string, { faqs: { q: string; a: string }[]; facts: string[] }>)[page];
  if (!entry || !entry.faqs.length) return null;
  const toolName = SEO_CONFIGS[page]?.toolName || SEO_CONFIGS[page]?.title || "This tool";

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Quick facts — plain, citation-ready statements about this tool */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
            {toolName} — quick facts
          </h2>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {entry.facts.map((fact, i) => {
            const colon = fact.indexOf(":");
            const label = colon > 0 ? fact.slice(0, colon + 1) : "";
            const rest = colon > 0 ? fact.slice(colon + 1) : fact;
            return (
              <li
                key={i}
                className="text-sm text-stone-600 leading-relaxed bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5"
              >
                {label && <strong className="text-stone-800">{label}</strong>}
                {rest}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Common questions — answers stay in the DOM (details/summary) so
          the visible text always matches the FAQPage schema. */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-emerald-700" />
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight">
            Common questions about {toolName}
          </h2>
        </div>
        <div className="divide-y divide-stone-200">
          {entry.faqs.map((faq, i) => (
            <details key={i} className="group py-3.5" open={i === 0}>
              <summary className="flex items-center justify-between gap-3 cursor-pointer list-none text-sm sm:text-base font-semibold text-stone-800 hover:text-emerald-700">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 shrink-0 text-stone-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed pr-6">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
