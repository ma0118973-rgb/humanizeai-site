import { useState } from "react";
import { ChevronDown, ShieldCheck, Mail, Phone, ExternalLink, Globe } from "lucide-react";
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
      q: "How does ToolVena make AI text sound more natural?",
      a: "ToolVena varies sentence length and rhythm, replaces common AI-style clichés with plainer wording, and adds natural contractions where they fit. AI enhancement may be used when available; otherwise the built-in offline rules do the rewrite. Results vary by text, and no tool can guarantee a specific detector score.",
    },
    {
      q: "Is ToolVena free to use?",
      a: "Yes. The humanizer is free and does not require sign-up. The editor accepts up to 3,000 words at a time, so split longer documents into sections.",
    },
    {
      q: "Will Google penalize humanized content for SEO?",
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
      a: "It depends on the feature. Built-in offline tools process text in your browser. If AI enhancement is used, the text you enter is sent to the configured AI service so it can return a result. Drafts saved by the humanizer stay in this browser's local storage until you clear them.",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 space-y-10 overflow-hidden">
      {/* Programmatic Responsive Leaderboard Ad Slot */}
      <AdSenseSlot type="leaderboard" />

      {/* ToolVena Features */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-8 shadow-sm space-y-6 w-full max-w-full overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ToolVena AI Humanizer
          </span>
          <h3 className="text-2xl font-bold text-stone-900 tracking-tight">
            Free writing help you can review before you use
          </h3>
          <p className="text-sm text-stone-600">
            No sign-up is needed. Rewrite up to 3,000 words at a time, compare the changes, and download the result as a Word (.doc) or TXT file.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["No sign-up", "Open the tool and start working right away."],
            ["3,000-word editor limit", "Split longer documents into sections."],
            ["Diff view", "See added and removed words before you copy the result."],
            [".doc & TXT downloads", "Save a copy after you have reviewed the rewrite."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{title}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-stone-500 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Processing depends on the feature. Built-in offline tools run in your browser. If AI enhancement is used, the text you enter is sent to the configured AI service so it can generate the result.
        </p>
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

      {/* Footer */}
      <footer className="pt-10 border-t border-stone-200 text-stone-600 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          {/* Col 1: About */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                T
              </div>
              <span className="font-bold text-stone-900 text-sm">ToolVena</span>
            </div>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              ToolVena offers free browser tools for writing, text, images, PDFs and everyday tasks in 11 languages.
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
                  AI Detector
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
              Contact
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
              <p className="text-[11px] text-stone-600 pt-1">Use the Contact page for support and feedback.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-600 gap-2">
          <p>© 2026 ToolVena. All rights reserved.</p>
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
