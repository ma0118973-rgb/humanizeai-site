import {
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu,
  BrainCircuit,
} from "lucide-react";

export function CleverFeaturesGuide() {
  const steps = [
    {
      step: "01",
      title: "Paste AI Content",
      desc: "Paste an AI-assisted draft or your own notes into the input panel.",
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
    },
    {
      step: "02",
      title: "Select Writing Style",
      desc: "Pick Casual, Academic, Simple Formal, Creative, or Standard to guide vocabulary and sentence rhythm.",
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
    },
    {
      step: "03",
      title: "Review the Rewritten Text",
      desc: "Click 'Humanize AI', compare the changes, and check facts and wording before you copy or download the result.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const comparisons = [
    {
      feature: "Cost",
      clever: "Free",
      note: "No sign-up required",
    },
    {
      feature: "Editor Limit",
      clever: "Up to 3,000 words at a time",
      note: "Split longer documents into sections",
    },
    {
      feature: "Tone Choices",
      clever: "5 tones",
      note: "Casual, Academic, Simple Formal, Creative and Standard",
    },
    {
      feature: "Change Review",
      clever: "Diff view included",
      note: "Review added and removed words before copying",
    },
    {
      feature: "Downloads",
      clever: "Word (.doc) and TXT",
      note: "Save a copy after reviewing the rewrite",
    },
    {
      feature: "Processing",
      clever: "Offline fallback included",
      note: "AI enhancement may be used when available",
    },
  ];

  return (
    <div className="space-y-12 my-10 w-full max-w-full overflow-hidden">
      {/* 3-Step Visual Process */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Fast & Intuitive Process
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            How ToolVena's AI Humanizer Works in 3 Steps
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Paste a draft, choose a tone, then review every change before you copy or download it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-emerald-300 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span className="font-mono text-2xl font-extrabold text-stone-600 group-hover:text-emerald-500 transition-colors">
                  {item.step}
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-sm sm:text-base">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Included Features */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            What Is Included
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            What ToolVena Includes
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            These are the features built into this page. Always review the rewritten text for meaning, facts and tone.
          </p>
        </div>

        <div className="w-full max-w-full overflow-x-auto min-w-0 block rounded-xl border border-stone-200">
          <div className="sm:hidden px-3 py-1.5 bg-stone-100/90 text-[10px] text-stone-500 font-medium text-right border-b border-stone-200">
            ← Scroll table horizontally to compare all features →
          </div>
          <table className="w-full min-w-[500px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80">
                <th className="py-3 px-4 font-semibold text-stone-700">Feature</th>
                <th className="py-3 px-4 font-bold text-emerald-700 bg-emerald-50/60 border-x border-emerald-100">
                  ToolVena AI Humanizer
                </th>
                <th className="py-3 px-4 font-semibold text-stone-500">
                  Good to Know
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {comparisons.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-800">{row.feature}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700 bg-emerald-50/30 border-x border-emerald-100">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{row.clever}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{row.note}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
