import React, { useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { Copy, Check, Sparkles, FileText, Zap, Clock, BarChart3, ListChecks, ArrowRight, Wand2 } from "lucide-react";
import { summarizeText } from "../utils/localEngines";
import { tryAiAssist } from "../utils/aiAssist";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface SummarizerWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

const SAMPLE_TEXTS: Record<string, string> = {
  en: "Artificial intelligence is transforming education in profound ways. Schools around the world are adopting AI-powered tools to personalize learning for every student. Teachers report that students who use AI tutors show significantly better retention rates. However, critics argue that over-reliance on AI could reduce critical thinking skills. The debate centers on finding the right balance between technological assistance and human guidance. Universities are now developing policies for responsible AI use in classrooms. Students must learn to use AI as a tool, not a replacement for thinking. The future of education will likely involve a hybrid approach combining the best of both worlds.",
  es: "La inteligencia artificial está transformando la educación de manera profunda. Las escuelas de todo el mundo están adoptando herramientas de IA para personalizar el aprendizaje. Los profesores informan que los estudiantes que usan tutores de IA muestran mejores tasas de retención. Sin embargo, los críticos argumentan que la dependencia excesiva de la IA podría reducir el pensamiento crítico. El debate se centra en encontrar el equilibrio adecuado entre la asistencia tecnológica y la guía humana.",
  ur: "Artificial intelligence taleem ko gehre tareeqe se badal rahi hai. Duniya bhar ke schools har student ke liye learning ko personalize karne ke liye AI tools apna rahe hain. Teachers kehte hain ke jo students AI tutors use karte hain unki retention behtar hoti hai. Lekin critics ka kehna hai ke AI par zyada inhesar critical thinking ko kam kar sakta hai. Behes is baat par hai ke technology aur insani rehnumai ke darmiyan sahi tawazun kaise paya jaye.",
  de: "Künstliche Intelligenz verändert die Bildung grundlegend. Schulen weltweit setzen KI-gestützte Tools ein, um das Lernen zu personalisieren. Lehrer berichten, dass Schüler mit KI-Tutoren bessere Behaltensraten zeigen. Kritiker warnen jedoch, dass übermäßige Abhängigkeit von KI das kritische Denken schwächen könnte. Die Debatte dreht sich um die richtige Balance zwischen technologischer Unterstützung und menschlicher Anleitung.",
  fr: "L'intelligence artificielle transforme profondément l'éducation. Les écoles du monde entier adoptent des outils d'IA pour personnaliser l'apprentissage. Les enseignants rapportent que les élèves utilisant des tuteurs IA montrent de meilleurs taux de rétention. Cependant, les critiques avertissent qu'une dépendance excessive à l'IA pourrait réduire la pensée critique. Le débat porte sur le juste équilibre entre assistance technologique et guidance humaine.",
  tr: "Yapay zeka eğitimi derinden dönüştürüyor. Dünyadaki okullar öğrenmeyi kişiselleştirmek için yapay zeka araçlarını benimsiyor. Öğretmenler, yapay zeka öğretmenleri kullanan öğrencilerin daha iyi akılda tutma oranları gösterdiğini bildiriyor. Ancak eleştirmenler, yapay zekaya aşırı bağımlılığın eleştirel düşünmeyi azaltabileceği konusunda uyarıyor.",
  pt: "A inteligência artificial está transformando a educação de forma profunda. Escolas ao redor do mundo estão adotando ferramentas de IA para personalizar o aprendizado. Professores relatam que alunos que usam tutores de IA apresentam melhores taxas de retenção. No entanto, críticos alertam que a dependência excessiva da IA pode reduzir o pensamento crítico.",
  ja: "人工知能は教育を大きく変えつつあります。世界中の学校が、学習をパーソナライズするためにAIツールを導入しています。AIチューターを使う生徒は定着率が高いと教師たちは報告しています。一方で、AIへの過度な依存は批判的思考力を低下させる可能性があると批判する声もあります。技術支援と人間の指導のバランスが議論の中心です。",
};

export function SummarizerWorkspace({ selectedLanguage = "en" }: SummarizerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const sum = (t as any).summarizer || {};

  const [inputText, setInputText] = useState<string>(SAMPLE_TEXTS[selectedLanguage] || SAMPLE_TEXTS.en);
  const [ratio, setRatio] = useState<"brief" | "balanced" | "detailed">("balanced");
  const [isCopied, setIsCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const result = summarizeText(inputText, ratio);
  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

  const clearAi = () => {
    setAiSummary(null);
    setAiFailed(false);
    setShowAi(false);
  };

  const handleAiSummary = async () => {
    if (aiLoading || !inputText.trim()) return;
    if (aiSummary) {
      setShowAi(true);
      return;
    }
    setAiLoading(true);
    setAiFailed(false);
    const text = await tryAiAssist(
      `Write a concise ${ratio} summary of the following text, keeping the same language. Return only the summary:\n\n${inputText}`,
      "summarize"
    );
    setAiLoading(false);
    if (text) {
      setAiSummary(text);
      setShowAi(true);
    } else {
      setAiFailed(true);
    }
  };

  const handleCopy = () => {
    if (!result.summary) return;
    navigator.clipboard.writeText(result.summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const ratioOptions = [
    { key: "brief" as const, label: sum.brief || "Brief", desc: "~25%", icon: Zap },
    { key: "balanced" as const, label: sum.balanced || "Balanced", desc: "~40%", icon: BarChart3 },
    { key: "detailed" as const, label: sum.detailed || "Detailed", desc: "~60%", icon: ListChecks },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="summarizer" selectedLanguage={selectedLanguage} />
      {/* Hero Header — Premium Design */}
      <div className="bg-gradient-to-br from-violet-950 via-white to-white rounded-3xl p-4 sm:p-8 text-white shadow-2xl border border-violet-800/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              {sum.badge || "AI Text Summarizer"}
            </span>
            <span className="text-xs text-stone-400 font-mono">Free • 11 Languages • No sign-up</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {sum.title || "Summarize Any Text in Seconds"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {sum.subtitle || "Paste long articles, papers, or documents and get instant, accurate summaries. Extractive AI picks the most important sentences — your summary stays true to the original."}
          </p>
        </div>
      </div>

      {/* AEO / GEO Direct Answer Capsule */}
      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-500 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-violet-950">
              {sum.quickAnswerTitle || "Quick Answer: How Does Text Summarization Work?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {sum.quickAnswer || "Extractive summarization scores every sentence by word frequency, position, and key-fact signals (numbers, dates), then selects the highest-scoring sentences in original order. Unlike generative AI, it never invents content — every word in your summary comes from your text."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input Panel */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" />
              {sum.inputLabel || "Your Text"}
            </h3>
            <span className="text-xs text-stone-500 font-mono">{wordCount} {sum.words || "words"}</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); clearAi(); }}
            placeholder={sum.placeholder || "Paste your article, essay, or document here..."}
            className="w-full h-72 sm:h-80 p-5 text-sm sm:text-base text-stone-800 placeholder-stone-400 focus:outline-none resize-none leading-relaxed"
          />
          {/* Length Selector */}
          <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">{sum.lengthLabel || "Summary Length"}</p>
            <div className="grid grid-cols-3 gap-2">
              {ratioOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setRatio(opt.key); clearAi(); }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    ratio === opt.key
                      ? "bg-violet-600 text-white border-violet-600 shadow-md"
                      : "bg-white text-stone-600 border-stone-200 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                  <span className={`text-[10px] ${ratio === opt.key ? "text-violet-200" : "text-stone-400"}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-violet-600" />
              {sum.outputLabel || "Summary"}
              {showAi && aiSummary && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-800 font-mono">
                  AI-generated
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAiSummary}
                disabled={aiLoading || !inputText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {aiLoading ? "Summarizing…" : "AI Summary"}
              </button>
              <button
              onClick={() => { if (showAi && aiSummary) navigator.clipboard.writeText(aiSummary); else handleCopy(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? (sum.copied || "Copied!") : (sum.copy || "Copy")}
            </button>
            </div>
          </div>
          <div className="p-5 min-h-[18rem] sm:min-h-[20rem]">
            {showAi && aiSummary ? (
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed">{aiSummary}</p>
            ) : result.summary ? (
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed">{result.summary}</p>
            ) : (
              <p className="text-sm text-stone-400 italic">{sum.emptyState || "Your summary will appear here..."}</p>
            )}
          </div>
          {showAi && aiSummary && (
            <div className="px-5 pb-3">
              <button
                onClick={() => setShowAi(false)}
                className="text-xs font-semibold text-violet-700 hover:text-violet-900 underline underline-offset-2 cursor-pointer"
              >
                Show extractive (offline) version instead
              </button>
            </div>
          )}
          {aiFailed && (
            <div className="px-5 pb-4">
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                AI summary is unavailable right now — showing the built-in offline extractive summary instead.
              </p>
            </div>
          )}
          {/* Stats Bar */}
          {result.summary && (
            <div className="px-5 py-4 border-t border-stone-100 bg-gradient-to-r from-violet-50 to-stone-50 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-extrabold text-violet-700">{result.compressionRatio}%</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase">{sum.kept || "Kept"}</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-violet-700">{result.summaryWordCount}</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase">{sum.words || "Words"}</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-violet-700 flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />{result.readingTimeSaved}
                </div>
                <div className="text-[10px] font-bold text-stone-500 uppercase">{sum.saved || "Saved"}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Sentences */}
      {result.keySentences.length > 1 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
            <ListChecks className="w-4 h-4 text-violet-600" />
            {sum.keyPoints || "Key Points Extracted"} ({result.keySentences.length})
          </h3>
          <ul className="space-y-3">
            {result.keySentences.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-stone-700 leading-relaxed">
                <span className="shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      {false && <ArrowRight className="w-4 h-4" />}
    </div>
  );
}
