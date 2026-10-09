import React, { useEffect, useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  AlignLeft, Check, Copy, Download, Info, RefreshCw, ShieldCheck, Sparkles,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface LoremIpsumWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Mode = "paragraphs" | "sentences" | "words";
type Format = "plain" | "html" | "list";

// The traditional placeholder vocabulary: Latin-shaped words from the
// classic lorem ipsum passage (itself scrambled from Cicero, 45 BC).
// Public-domain filler that has been the typesetting standard for centuries.
const WORD_BANK = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
  "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat",
  "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim",
  "id", "est", "laborum", "perspiciatis", "unde", "omnis", "iste", "natus", "error", "voluptatem",
  "accusantium", "doloremque", "laudantium", "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab",
  "illo", "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae", "dicta", "explicabo", "nemo",
  "ipsam", "quia", "voluptas", "aspernatur", "aut", "odit", "fugit", "consequuntur", "magni", "dolores",
  "eos", "ratione", "sequi", "nesciunt", "neque", "porro", "quisquam", "dolorem", "adipisci", "numquam",
  "eius", "modi", "tempora", "incidunt", "magnam", "aliquam", "quaerat", "minima", "nostrum", "exercitationem",
  "ullam", "corporis", "suscipit", "laboriosam", "aliquid", "commodi", "consequatur", "autem", "vel", "eum",
  "iure", "nihil", "molestiae", "illum", "quo", "vero", "accusamus", "iusto", "odio", "dignissimos",
  "ducimus", "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti", "quos", "quas", "molestias",
  "excepturi", "occaecati", "cupiditate", "provident", "similique", "mollitia", "animi", "dolorum", "fuga",
  "harum", "quidem", "rerum", "facilis", "expedita", "distinctio", "nam", "libero", "tempore", "cum",
  "soluta", "nobis", "eligendi", "optio", "cumque", "impedit", "minus", "maxime", "placeat", "facere",
  "possimus", "assumenda", "repellendus", "temporibus", "quibusdam", "officiis", "debitis", "necessitatibus", "saepe", "eveniet",
  "voluptates", "repudiandae", "recusandae", "itaque", "earum", "hic", "tenetur", "sapiente", "delectus", "reiciendis",
  "voluptatibus", "maiores", "alias", "perferendis", "doloribus", "asperiores", "repellat",
];

const CLASSIC_OPENER =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const OPENER_WORDS = CLASSIC_OPENER.replace(/[.,]/g, "").split(" ");

const MODE_MAX: Record<Mode, number> = { paragraphs: 50, sentences: 100, words: 2000 };

function randomWord(prev?: string): string {
  let w = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  if (w === prev) w = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
  return w;
}

function makeSentence(wordBudget?: number): string {
  const len = wordBudget ?? 6 + Math.floor(Math.random() * 11); // 6–16 words
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(randomWord(words[words.length - 1]));
  if (len >= 9) {
    const pos = 3 + Math.floor(Math.random() * (len - 5));
    words[pos] = words[pos] + ",";
  }
  const s = words.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1) + ".";
}

function makeParagraph(): string {
  const n = 4 + Math.floor(Math.random() * 5); // 4–8 sentences
  return Array.from({ length: n }, () => makeSentence()).join(" ");
}

function makeWordsText(total: number, startClassic: boolean): string {
  if (total <= 0) return "";
  if (startClassic) {
    if (total <= OPENER_WORDS.length) {
      const slice = OPENER_WORDS.slice(0, total).join(" ");
      return slice.charAt(0).toUpperCase() + slice.slice(1) + ".";
    }
    const rest = makeWordsText(total - OPENER_WORDS.length, false);
    return rest ? `${CLASSIC_OPENER} ${rest}` : CLASSIC_OPENER;
  }
  const sentences: string[] = [];
  let remaining = total;
  while (remaining > 0) {
    const len = Math.min(remaining, 6 + Math.floor(Math.random() * 11));
    sentences.push(makeSentence(len));
    remaining -= len;
  }
  return sentences.join(" ");
}

function stripClassicStart(paragraph: string): string {
  const idx = paragraph.indexOf(". ");
  return idx === -1 ? paragraph : paragraph.slice(idx + 2);
}

interface Generated {
  plain: string;
  output: string;
  stats: { words: number; chars: number; sentences: number; paragraphs: number };
}

function generate(mode: Mode, count: number, format: Format, startClassic: boolean): Generated {
  const blocks: string[] = []; // logical blocks: paragraphs, sentences, or word-chunks
  if (mode === "paragraphs") {
    for (let i = 0; i < count; i++) blocks.push(makeParagraph());
    if (startClassic && blocks.length) {
      blocks[0] = `${CLASSIC_OPENER} ${stripClassicStart(blocks[0])}`;
    }
  } else if (mode === "sentences") {
    for (let i = 0; i < count; i++) blocks.push(makeSentence());
    if (startClassic && blocks.length) blocks[0] = CLASSIC_OPENER;
  } else {
    blocks.push(makeWordsText(count, startClassic));
  }

  const plain =
    mode === "paragraphs" ? blocks.join("\n\n") : mode === "sentences" ? blocks.join(" ") : blocks[0];

  let output: string;
  if (format === "plain") {
    output = plain;
  } else if (format === "html") {
    output =
      mode === "paragraphs"
        ? blocks.map((b) => `<p>${b}</p>`).join("\n")
        : `<p>${plain}</p>`;
  } else {
    const items =
      mode === "words"
        ? (() => {
            const words = blocks[0].split(" ");
            const chunks: string[] = [];
            for (let i = 0; i < words.length; i += 12) chunks.push(words.slice(i, i + 12).join(" "));
            return chunks;
          })()
        : blocks;
    output = `<ul>\n${items.map((b) => `  <li>${b}</li>`).join("\n")}\n</ul>`;
  }

  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const sentences = (plain.match(/[.!?]+/g) || []).length;
  return {
    plain,
    output,
    stats: {
      words,
      chars: plain.length,
      sentences,
      paragraphs: mode === "paragraphs" ? blocks.length : 1,
    },
  };
}

export function LoremIpsumWorkspace({ selectedLanguage = "en" }: LoremIpsumWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const li = (t as any).loremIpsum || {};

  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [format, setFormat] = useState<Format>("plain");
  const [startClassic, setStartClassic] = useState(true);
  const [copied, setCopied] = useState(false);
  const [runId, setRunId] = useState(0);

  const max = MODE_MAX[mode];
  const safeCount = Math.max(1, Math.min(max, Math.floor(count) || 1));

  const result = useMemo(
    () => generate(mode, safeCount, format, startClassic),
    // runId is the explicit "fresh shuffle" trigger; other controls regenerate live.
    [mode, safeCount, format, startClassic, runId]
  );

  useEffect(() => {
    if (count > max) setCount(max);
  }, [max, count]);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const downloadOutput = () => {
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lorem-ipsum.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const modeOptions: { id: Mode; label: string }[] = [
    { id: "paragraphs", label: li.modeParagraphs || "Paragraphs" },
    { id: "sentences", label: li.modeSentences || "Sentences" },
    { id: "words", label: li.modeWords || "Words" },
  ];
  const formatOptions: { id: Format; label: string }[] = [
    { id: "plain", label: li.formatPlain || "Plain text" },
    { id: "html", label: li.formatHtml || "HTML <p>" },
    { id: "list", label: li.formatList || "List <ul>" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="loremIpsum" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-700 text-white self-start shadow-sm">
            <AlignLeft className="w-3.5 h-3.5" /> {li.badge || "Lorem Ipsum Generator"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {li.pageTitle || "Generate Lorem Ipsum Placeholder Text Instantly"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {li.subtitle || "Pick paragraphs, sentences or an exact word count, choose plain text, HTML paragraphs or a list, then copy or download. The text is generated locally in your browser — nothing is uploaded, and it is placeholder text only, never real content."}
          </p>
        </div>
      </div>

      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-700 text-white rounded-xl shrink-0">
            <AlignLeft className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-violet-950">{li.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {li.quickAnswer || "It builds classic lorem ipsum filler from the traditional Latin word bank, in the amount and shape you choose: paragraphs for page layouts, sentences for cards and excerpts, or an exact number of words for tight slots. Output can be plain text, HTML <p> paragraphs, or an HTML list, with or without the famous opening line."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{li.modeLabel || "Generate"}</span>
            <div className="flex gap-1.5">
              {modeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${mode === opt.id ? "bg-violet-700 text-white border-violet-700 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-violet-300"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="lorem-count">
              {li.countLabel || "How many"} (1–{max})
            </label>
            <input
              id="lorem-count"
              type="number"
              min={1}
              max={max}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-violet-600"
            />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{li.formatLabel || "Output format"}</span>
            <div className="flex gap-1.5">
              {formatOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFormat(opt.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${format === opt.id ? "bg-violet-700 text-white border-violet-700 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-violet-300"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer pb-1">
            <input
              type="checkbox"
              checked={startClassic}
              onChange={(e) => setStartClassic(e.target.checked)}
              className="w-4 h-4 accent-violet-700"
            />
            {li.startLabel || "Start with “Lorem ipsum dolor sit amet…”"}
          </label>
          <button
            onClick={() => setRunId((v) => v + 1)}
            className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-700 text-white text-xs font-bold hover:bg-violet-600 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> {li.regenerateBtn || "New text"}
          </button>
        </div>

        <input
          type="range"
          min={1}
          max={max}
          value={safeCount}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-violet-700"
          aria-label={li.countLabel || "How many"}
        />

        <div>
          <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
            {li.outputLabel || "Your placeholder text"}
          </span>
          <textarea
            readOnly
            value={result.output}
            spellCheck={false}
            className="w-full h-56 rounded-2xl border border-stone-300 p-4 font-mono text-xs sm:text-sm leading-relaxed text-stone-800 bg-stone-50 focus:outline-none resize-y"
          />
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <button onClick={copyOutput} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 cursor-pointer">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? (li.copied || "Copied!") : (li.copyBtn || "Copy text")}
            </button>
            <button onClick={downloadOutput} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
              <Download className="w-4 h-4" /> {li.downloadBtn || "Download .txt"}
            </button>
            <span className="text-[11px] font-bold text-stone-500 ml-auto">
              {result.stats.words.toLocaleString()} {(li.wordsLabel || "words")} · {result.stats.chars.toLocaleString()} {(li.charsLabel || "characters")} · {result.stats.sentences.toLocaleString()} {(li.sentencesLabel || "sentences")} · {result.stats.paragraphs.toLocaleString()} {(li.paragraphsLabel || "paragraphs")}
            </span>
          </div>
        </div>

        {format !== "plain" && (
          <div>
            <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
              {li.previewTitle || "Rendered preview"}
            </span>
            <div
              className="w-full rounded-2xl border border-stone-200 p-4 bg-white text-sm text-stone-700 leading-relaxed max-h-56 overflow-auto [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: result.output }}
            />
          </div>
        )}

        <p className="flex items-start gap-2 text-[11px] sm:text-xs text-stone-500 leading-relaxed">
          <Sparkles className="w-4 h-4 text-violet-700 shrink-0 mt-0.5" />
          <span>{li.noteText || "Every run shuffles the word bank differently, so each result is a fresh sample. If a layout looks good with one lucky sample, press New text a few times and check the short and long versions too — real content is never this even."}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-violet-700" /> {li.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {li.honestText || "This is placeholder text, not content. It has no meaning and no SEO value, and publishing it on a live page makes the page look unfinished and gives visitors and search engines nothing useful. Before any launch, search your site for “lorem ipsum” and replace every leftover block with real words. Smooth filler also hides real-world problems — very long names, headings that wrap to three lines, and non-Latin scripts — so swap in realistic content as early as you can."}
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-violet-700" /> {li.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {li.privacyNote || "The generator runs entirely in this browser tab. Nothing is typed into it, so nothing can be uploaded, stored on a server, or shared — the word bank lives in the page and the shuffling happens on your device. Close the tab and the generated text is gone unless you copied or downloaded it."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="loremIpsum" selectedLanguage={selectedLanguage} />
    </div>
  );
}
