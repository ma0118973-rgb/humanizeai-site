import { useState } from "react";
import { ChevronDown, ShieldCheck, Mail, Phone, ExternalLink, Globe } from "lucide-react";
import { COMPETITOR_DATA } from "../data/samples";
import { ActivePage } from "../types";
import { AdSenseSlot } from "./AdSenseSlot";

interface FaqAndCompetitorSectionProps {
  onNavigatePage: (page: ActivePage) => void;
}

export function FaqAndCompetitorSection({ onNavigatePage }: FaqAndCompetitorSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const contactEmail = "yaretmyservin7@gmail.com";
  const contactPhone = "+1 2535006555";

  const faqs = [
    {
      q: "How does HumanizeAI make AI text sound more natural?",
      a: "The tool adjusts sentence rhythm and vocabulary: it varies sentence lengths, replaces overused AI buzzwords (like 'delve', 'testament', 'tapestry') with plain alternatives, and adds natural contractions. Everything runs locally in your browser — no AI model is involved. Results vary by text and detector, and no tool can guarantee a specific detection score.",
    },
    {
      q: "Is this tool truly 100% free with no word limits?",
      a: "Yes! Unlike competitors (Undetectable AI, StealthGPT, Walter Writes) who charge $15–$25/month or lock users after 250 words, HumanizeAI is completely free without limits or credit card requirements.",
    },
    {
      q: "Will Google penalize humanized content for SEO in 2026?",
      a: "Google's Helpful Content guidance targets low-value, repetitive content regardless of how it was written. Rewriting for clarity, accuracy, and genuine reader value is the right approach — but no tool can guarantee search rankings.",
    },
    {
      q: "Can I use this for college assignments and essays?",
      a: "You can use it to polish your own drafts, but submitting AI-generated work as your own may violate your institution's academic integrity policy. Always check your school's rules and disclose AI assistance where required.",
    },
    {
      q: "My AI-generated text sounds robotic — how do I fix it?",
      a: "Robotic text usually comes from uniform sentence lengths and overused phrases. Vary your sentence rhythm, swap stiff connectors (furthermore, moreover) for natural ones, and read the text aloud. This tool automates those patterns — paste your draft, pick a tone, and review the rewritten result.",
    },
    {
      q: "How can I check whether my essay sounds like AI?",
      a: "Paste it into the free AI detector: it analyzes sentence-length variety, cliché density, and natural phrasing markers, then highlights sentences that read as robotic. Note it is our own heuristic estimate, not an official Turnitin or GPTZero verdict.",
    },
    {
      q: "Is my text saved or shared with third parties?",
      a: "No. Everything is processed locally in your browser — your text is never sent to any server, never stored, and never used for training.",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 space-y-10 overflow-hidden">
      {/* Programmatic Responsive Leaderboard Ad Slot */}
      <AdSenseSlot type="leaderboard" />

      {/* Competitor Comparison Table */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-8 shadow-sm space-y-6 w-full max-w-full overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Market Comparison 2026
          </span>
          <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
            Why Pay $25/Month When You Can Get It 100% Free?
          </h3>
          <p className="text-sm text-stone-600">
            Compare our free platform against popular paid AI writing tools.
          </p>
        </div>

        <div className="w-full max-w-full overflow-x-auto min-w-0 block rounded-xl border border-stone-200">
          <div className="sm:hidden px-3 py-1.5 bg-stone-100/90 text-[10px] text-stone-500 font-medium text-right border-b border-stone-200">
            ← Scroll table sideways to compare all 5 columns →
          </div>
          <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-semibold">
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Monthly Cost</th>
                <th className="p-3.5">Free Trial Limit</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5">Key Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {COMPETITOR_DATA.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-3.5 font-medium text-stone-900">{item.name}</td>
                  <td className="p-3.5 text-rose-600 font-semibold">{item.price}</td>
                  <td className="p-3.5 text-stone-600">{item.freeLimit}</td>
                  <td className="p-3.5 text-stone-600">{item.turnitinBypass}</td>
                  <td className="p-3.5 text-stone-500 text-xs">{item.ourAdvantage}</td>
                </tr>
              ))}
              <tr className="bg-emerald-50/80 font-semibold text-stone-900 border-2 border-emerald-400">
                <td className="p-3.5 text-emerald-900 font-bold">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>HumanizeAI (This App)</span>
                  </div>
                </td>
                <td className="p-3.5 text-emerald-700 font-extrabold">$0.00 Free</td>
                <td className="p-3.5 text-emerald-800">Unlimited Forever</td>
                <td className="p-3.5 text-emerald-800">Varies by text</td>
                <td className="p-3.5 text-emerald-900 text-xs">
                  Zero Paywall • Free Forever • In-Browser Text Analysis
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Frequently Asked Questions
          </span>
          <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
            Everything You Need To Know
          </h3>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-stone-200">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="py-4">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left text-sm sm:text-base font-semibold text-stone-800 hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? "rotate-180 text-emerald-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed pr-6">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Google AdSense Policy Compliant Footer */}
      <footer className="pt-10 border-t border-stone-200 text-stone-600 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          {/* Col 1: About */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                H
              </div>
              <span className="font-bold text-stone-900 text-sm">HumanizeAI</span>
            </div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              A free AI text humanizer that helps writers polish robotic drafts into natural-sounding prose. Built for students, researchers, and creators who want clearer writing.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider">
              Core Tools
            </h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <button
                  onClick={() => onNavigatePage("humanizer")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  AI Text Humanizer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage("detector")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Live AI Detector Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage("seo")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  SEO Keywords & Hashtags
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: AdSense Policy Pages */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider">
              Legal & Compliance
            </h4>
            <ul className="space-y-1.5 text-[12px]">
              <li>
                <button
                  onClick={() => onNavigatePage("privacy")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Privacy Policy (GDPR & CCPA)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage("terms")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage("disclaimer")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Academic Disclaimer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage("about")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  About Our Organization
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage("contact")}
                  className="hover:text-emerald-600 transition-colors"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contact Information */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 uppercase text-[11px] tracking-wider">
              Official Contact
            </h4>
            <div className="space-y-1.5 text-[12px]">
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="break-all">{contactEmail}</span>
              </a>
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{contactPhone}</span>
              </a>
              <p className="text-[11px] text-stone-600 pt-1">
                Mon - Sun: 24/7 Global Response
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-600 gap-2">
          <p>© 2026 HumanizeAI Global Inc. All rights reserved. Strictly compliant with Google AdSense Program Policies.</p>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigatePage("privacy")} className="hover:underline">
              Cookies
            </button>
            <span>•</span>
            <button onClick={() => onNavigatePage("terms")} className="hover:underline">
              Terms
            </button>
            <span>•</span>
            <button onClick={() => onNavigatePage("contact")} className="hover:underline">
              Support
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
