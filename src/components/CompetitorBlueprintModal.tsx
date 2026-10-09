import { X, BookOpen, CheckCircle2, FileText, Search, ShieldCheck } from "lucide-react";

interface CompetitorBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "1. Start with your own point",
    text: "Outline what you want to say and check the source material before rewriting. A clearer structure makes the final text easier to read.",
  },
  {
    title: "2. Draft, then revise the rhythm",
    text: "Use the AI Humanizer to vary sentence length and replace stock phrases. Read the result aloud and restore any wording that sounds more like you.",
  },
  {
    title: "3. Check facts, citations and changes",
    text: "Compare the draft and revision in the Diff Checker. Verify names, dates, numbers, quotations and citations against the original sources.",
  },
  {
    title: "4. Follow the rules that apply",
    text: "Check your school, employer or platform rules for AI assistance and disclosure. Do not present work as your own when the rules require you to write or disclose it differently.",
  },
];

const tools = [
  ["AI Humanizer", "Rewrites stiff drafts into clearer, more natural-sounding text."],
  ["AI Pattern Detector", "Gives ToolVena's own sentence-pattern estimate. It is not an official detector result."],
  ["Citation Generator", "Formats references from the source details you enter. Verify every field."],
  ["Diff Checker", "Shows what changed between two versions so you can review the edit."],
];

export function CompetitorBlueprintModal({ isOpen, onClose }: CompetitorBlueprintModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#fffdf8]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 w-full max-w-full">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-w-full">
        <div className="bg-white text-stone-900 p-6 sm:p-8 flex items-start justify-between relative overflow-hidden border-b border-stone-100">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> ToolVena Writing Guide
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Write Clearly in 4 Steps
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
              Use ToolVena to draft, revise and check your work. No tool can guarantee a detector score, a search ranking or an approval.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-stone-600 transition-all relative z-10"
            aria-label="Close writing guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steps.map((step) => (
              <div key={step.title} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <strong className="text-stone-900 block font-semibold text-sm">{step.title}</strong>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h4 className="text-lg font-bold text-stone-900">What ToolVena Can Help With</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tools.map(([name, text]) => (
                <div key={name} className="p-4 rounded-xl bg-white border border-stone-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-stone-900 text-sm">{name}</div>
                    <p className="text-xs text-stone-600 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-amber-50 text-stone-800 rounded-2xl space-y-2 border border-amber-200">
            <h4 className="text-base font-bold text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Important Limits
            </h4>
            <ul className="text-xs sm:text-sm text-stone-700 space-y-2 pt-1 list-disc pl-5">
              <li>A pattern score is a style estimate, not proof of who or what wrote a text.</li>
              <li>A rewrite can change meaning. Check facts and keep your own examples and voice.</li>
              <li>Search and social tools provide drafts and ideas. They cannot promise views, rankings or income.</li>
            </ul>
          </div>

          <div className="flex items-start gap-2 text-xs text-stone-500">
            <Search className="w-4 h-4 shrink-0 mt-0.5" />
            <p>When you are finished, read the final version once more before you publish, submit or send it.</p>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Close & Start Writing
          </button>
        </div>
      </div>
    </div>
  );
}
