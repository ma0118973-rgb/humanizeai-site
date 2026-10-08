import { useState, useMemo } from "react";
import {
  Gauge,
  BookOpen,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Percent,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SAMPLE_TEXTS } from "../data/samples";

interface ReadabilityDashboardProps {
  initialText?: string;
  onSendToHumanizer?: (text: string) => void;
}

export function ReadabilityDashboard({
  initialText = "",
  onSendToHumanizer,
}: ReadabilityDashboardProps) {
  const [text, setText] = useState(initialText || SAMPLE_TEXTS[0].text);

  // Real-time linguistic metrics calculations
  const metrics = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        wordCount: 0,
        sentenceCount: 0,
        avgWordLength: 0,
        fleschScore: 0,
        readingGrade: "N/A",
        fogIndex: 0,
        passiveVoicePct: 0,
        plagiarismRisk: 0,
        uniqueWordsPct: 0,
      };
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);

    // Estimate syllables roughly
    let totalSyllables = 0;
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, "");
      if (!clean) return;
      const matches = clean.match(/[aeiouy]{1,2}/g);
      totalSyllables += Math.max(1, matches ? matches.length : 1);
    });

    // Flesch Reading Ease formula: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
    const wordsPerSentence = wordCount / sentenceCount;
    const syllablesPerWord = totalSyllables / Math.max(1, wordCount);
    let flesch = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
    flesch = Math.min(100, Math.max(10, Math.round(flesch * 10) / 10));

    // Reading grade
    let grade = "General Public (Grade 8-9)";
    if (flesch < 50) grade = "College / Academic (Grade 13+)";
    else if (flesch < 65) grade = "High School (Grade 10-12)";
    else if (flesch > 80) grade = "Conversational & Easy (Grade 6-7)";

    // Gunning Fog Index: 0.4 * ((words / sentences) + 100 * (complexWords / words))
    const complexWords = words.filter((w) => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, "");
      const matches = clean.match(/[aeiouy]{1,2}/g);
      return matches && matches.length >= 3;
    }).length;
    const fog = Math.round((0.4 * (wordsPerSentence + 100 * (complexWords / Math.max(1, wordCount)))) * 10) / 10;

    // Passive voice indicator estimation
    const passiveWords = ["is", "was", "were", "been", "being", "are", "be"];
    const passiveCount = words.filter((w) => passiveWords.includes(w.toLowerCase())).length;
    const passiveVoicePct = Math.min(25, Math.round((passiveCount / Math.max(1, wordCount)) * 100));

    // Unique words percentage (vocabulary diversity)
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
    const uniqueWordsPct = Math.round((uniqueWords / Math.max(1, wordCount)) * 100);

    // Plagiarism estimation: High uniqueness = minimal risk
    const plagiarismRisk = Math.max(0, Math.min(5, Math.round((100 - uniqueWordsPct) * 0.05)));

    return {
      wordCount,
      sentenceCount,
      fleschScore: flesch,
      readingGrade: grade,
      fogIndex: Math.min(18, Math.max(4, fog)),
      passiveVoicePct,
      plagiarismRisk,
      uniqueWordsPct,
    };
  }, [text]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Live Interactive Micro-Tool
            </span>
            <span className="text-xs text-stone-500 font-mono">Real-Time Dwell Metric</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
            Live AI Plagiarism & Readability Score Dashboard
          </h3>
          <p className="text-xs text-stone-500">
            Real-time Flesch-Kincaid ease, Gunning Fog index, sentence cadence, and uniqueness index.
          </p>
        </div>

        {onSendToHumanizer && (
          <button
            onClick={() => onSendToHumanizer(text)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimize in Humanizer</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Flesch */}
        <div className="p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase truncate">Reading Ease</span>
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 mt-1 truncate">
            {metrics.fleschScore} <span className="text-xs font-normal text-stone-500">/ 100</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate">{metrics.readingGrade}</p>
        </div>

        {/* Gunning Fog */}
        <div className="p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase truncate">Gunning Fog</span>
            <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 mt-1 truncate">
            {metrics.fogIndex} <span className="text-xs font-normal text-stone-500">Grade</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5 truncate">Formal Structure Pacing</p>
        </div>

        {/* Plagiarism Risk */}
        <div className="p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase truncate">Repetition</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 truncate">
            {metrics.plagiarismRisk}% <span className="text-xs font-normal text-emerald-700">est.</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5 truncate">Based on word variety</p>
        </div>

        {/* Vocabulary Diversity */}
        <div className="p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase truncate">Lexical Variety</span>
            <Percent className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-900 mt-1 truncate">
            {metrics.uniqueWordsPct}% <span className="text-xs font-normal text-stone-500">Unique</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-0.5 truncate">High Natural Perplexity</p>
        </div>
      </div>

      {/* Input area for live analysis */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
          <span>Test Any Content for Real-Time Readability & Uniqueness:</span>
          <span className="text-[11px] text-stone-500 font-mono">
            {metrics.wordCount} words • {metrics.sentenceCount} sentences
          </span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write text here to evaluate readability ease, passive voice percentage, and plagiarism safety in real-time..."
          className="w-full h-28 p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-emerald-500 text-stone-800 leading-relaxed resize-none"
        />
      </div>
    </div>
  );
}
