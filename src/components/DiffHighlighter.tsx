import { useMemo } from "react";

interface DiffHighlighterProps {
  originalText: string;
  humanizedText: string;
}

export function DiffHighlighter({ originalText, humanizedText }: DiffHighlighterProps) {
  const comparison = useMemo(() => {
    const origWords = originalText.trim().split(/\s+/).filter(Boolean);
    const humWords = humanizedText.trim().split(/\s+/).filter(Boolean);
    
    // Create a Set of lowercase original words
    const origWordSet = new Set(origWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, "")));

    return humWords.map((word, idx) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
      const isNewOrTransformed = cleanWord.length > 2 && !origWordSet.has(cleanWord);
      return {
        word,
        isNew: isNewOrTransformed,
        id: `${word}-${idx}`,
      };
    });
  }, [originalText, humanizedText]);

  const newWordsCount = comparison.filter((c) => c.isNew).length;
  const enhancementRate = Math.round((newWordsCount / (comparison.length || 1)) * 100);

  return (
    <div className="space-y-3 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs bg-emerald-50/70 border border-emerald-200/80 p-2.5 sm:px-3 sm:py-2 rounded-xl text-emerald-900">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="font-semibold">Words Restructured:</span>
          <span className="font-mono font-bold text-emerald-700">{newWordsCount} words ({enhancementRate}% variation)</span>
        </div>
        <span className="text-[11px] text-emerald-700 font-medium">Green = Human Vocabulary & Phrasing</span>
      </div>

      <div className="text-sm leading-relaxed text-stone-800 p-3 bg-stone-50/50 rounded-xl border border-stone-200/60 max-h-72 overflow-y-auto font-sans break-words">
        {comparison.map((item) => (
          <span
            key={item.id}
            className={
              item.isNew
                ? "bg-emerald-100 text-emerald-900 font-medium px-1 py-0.5 rounded mx-0.5 border border-emerald-300/60 transition-colors"
                : "mx-0.5"
            }
          >
            {item.word}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
