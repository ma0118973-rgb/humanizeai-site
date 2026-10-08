import { X, Flame, DollarSign, TrendingUp, Users, ShieldCheck, CheckCircle2, Target, Globe } from "lucide-react";
import { COMPETITOR_DATA } from "../data/samples";

interface CompetitorBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompetitorBlueprintModal({ isOpen, onClose }: CompetitorBlueprintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fffdf8]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 w-full max-w-full">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-w-full">
        {/* Modal Header */}
        <div className="bg-white text-white p-6 sm:p-8 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> 2026 Market Intelligence Report
              </span>
              <span className="text-xs text-stone-400">Search Data Overview</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              2026 Fastest Growing AI Web Tools & Clone Strategy
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              An overview of AI writing tools, how paid competitors operate, and our free-tool approach.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-amber-50 hover:bg-stone-700 text-stone-600 hover:text-amber-700 transition-all relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Real-Time 2026 Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h4 className="text-lg font-bold text-stone-900">
                1. 2026 Mein Kaun Si Websites Lakhon Ki Traffic Le Rahi Hain?
              </h4>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Google search and web traffic data (2025–2026) shows that <strong>AI Humanizers & Anti-Detection tools</strong> (like <em>Undetectable AI</em>, <em>StealthGPT</em>, <em>Walter Writes</em>, and <em>QuillBot</em>) are among the fastest-growing web utilities worldwide, especially in the <strong>USA, UK, Canada, and Australia</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500 font-semibold">Monthly Traffic</div>
                <div className="text-xl font-bold text-stone-900 mt-0.5">5M+ to 12M+</div>
                <div className="text-[11px] text-emerald-600 mt-1">High US Student & Writer Search</div>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500 font-semibold">Average Subscription</div>
                <div className="text-xl font-bold text-amber-600 mt-0.5">$14.99 – $25.00/mo</div>
                <div className="text-[11px] text-stone-500 mt-1">Strict paywall after 250 words</div>
              </div>
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <div className="text-xs text-stone-500 font-semibold">Primary Target Audience</div>
                <div className="text-xl font-bold text-blue-600 mt-0.5">Students & Marketers</div>
                <div className="text-[11px] text-stone-500 mt-1">College papers, SEO blogs, resumes</div>
              </div>
            </div>
          </div>

          {/* Section 2: Why Did They Succeed? */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <h4 className="text-lg font-bold text-stone-900">
                2. Unke Kamyab Hone Ka Reason (The Exact Psychological Trigger)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-700">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-semibold">
                  🚨 Turnitin & University AI Bans in the US
                </strong>
                <p className="text-stone-600 text-xs">
                  Writers and students look for tools that make AI-assisted drafts sound more natural.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-semibold">
                  📉 Google Search Helpful Content Algorithm 2026
                </strong>
                <p className="text-stone-600 text-xs">
                  Websites with raw ChatGPT text got de-indexed. Bloggers and businesses need human-sounding writing to rank on Google Page 1.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-semibold">
                  💼 ATS Resume Filters & Job Screening
                </strong>
                <p className="text-stone-600 text-xs">
                  Recruiters in the US reject robotic AI cover letters. Job seekers need high burstiness and authentic phrasing.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <strong className="text-stone-900 block font-semibold">
                  💸 Frustration with Competitor Paywalls
                </strong>
                <p className="text-stone-600 text-xs">
                  Competitors charge $20/month and stop users mid-sentence. When users find a <strong>100% Free</strong> tool, it goes instantly viral on Reddit, TikTok, and Twitter!
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Competitor Pricing vs Our Free Tool */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h4 className="text-lg font-bold text-stone-900">
                3. Competitor Comparison: Why Our 100% Free Model Crushes Them
              </h4>
            </div>

            <div className="w-full max-w-full overflow-x-auto min-w-0 block rounded-xl border border-stone-200">
              <table className="w-full min-w-[500px] text-xs text-left">
                <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Competitor Tool</th>
                    <th className="p-3">Their Price</th>
                    <th className="p-3">Free Limit</th>
                    <th className="p-3">Our Free Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {COMPETITOR_DATA.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="p-3 font-semibold text-stone-900">{comp.name}</td>
                      <td className="p-3 text-rose-600 font-bold">{comp.price}</td>
                      <td className="p-3 text-stone-600">{comp.freeLimit}</td>
                      <td className="p-3 text-emerald-700 font-medium">{comp.ourAdvantage}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/70 font-semibold text-stone-900">
                    <td className="p-3 text-emerald-800">HumanizeAI (This App)</td>
                    <td className="p-3 text-emerald-600 font-extrabold">Free</td>
                    <td className="p-3 text-emerald-700">No sign-up needed</td>
                    <td className="p-3 text-emerald-800">Free tools, no account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Monetization Strategy Without Charging Users */}
          <div className="p-5 bg-gradient-to-r from-white to-amber-50 text-white rounded-2xl space-y-2">
            <h4 className="text-base font-bold text-amber-300">
              💡 Agar Ham User Se Paise Nahin Lenge, To Website Paise Kaise Kamayegi?
            </h4>
            <ul className="text-xs sm:text-sm text-stone-600 space-y-2 pt-1">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1. Display Ads:</span>
                <span>Ad networks like Google AdSense can show ads to visitors; earnings depend on traffic and niche.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">2. Affiliate Partnerships:</span>
                <span>Recommending tools the audience already uses can earn referral commissions; rates vary by program.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">3. Premium Features:</span>
                <span>Keeping the core web tools free while offering optional extras is one common approach.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-amber-50 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Close & Start Using Tool
          </button>
        </div>
      </div>
    </div>
  );
}
