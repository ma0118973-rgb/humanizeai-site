import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Eraser, Info, Instagram, ShieldCheck, Sparkles,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface InstagramLineBreakWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

// Braille Pattern Blank — a real character with visible width but no visible
// glyph in fonts that support it, so Instagram keeps the "empty" line.
const BRAILLE_BLANK = "\u2800";
const DOT_DIVIDER = "·";
const CAPTION_LIMIT = 2200;
const BIO_LIMIT = 150;

type BlankMode = "invisible" | "dots";

function toLines(text: string): string[] {
  if (!text) return [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  // A final newline terminates the last line; it is not an extra blank line.
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function countChars(text: string): number {
  // Code points, not UTF-16 units, so emoji count as one character.
  return [...text].length;
}

export function InstagramLineBreakWorkspace({ selectedLanguage = "en" }: InstagramLineBreakWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ig = (t as any).igBreaks || {};

  const [text, setText] = useState("");
  const [mode, setMode] = useState<BlankMode>("invisible");
  const [trimEnds, setTrimEnds] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const rawLines = toLines(text);
    let blanksKept = 0;
    let paragraphs = 0;
    let inParagraph = false;

    const outLines = rawLines.map((raw) => {
      const line = trimEnds ? raw.replace(/[ \t]+$/u, "") : raw;
      if (line.trim() === "") {
        if (rawLines.length > 1) blanksKept++;
        inParagraph = false;
        return mode === "invisible" ? BRAILLE_BLANK : DOT_DIVIDER;
      }
      if (!inParagraph) paragraphs++;
      inParagraph = true;
      return line;
    });

    // A caption that is only blank lines needs no spacers at all.
    const output = text.trim() === "" ? "" : outLines.join("\n");
    if (text.trim() === "") blanksKept = 0;

    return {
      output,
      inputChars: countChars(text),
      outputChars: countChars(output),
      lineCount: rawLines.length,
      blanksKept,
      paragraphs,
    };
  }, [text, mode, trimEnds]);

  const handleCopy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const statCards = [
    { label: ig.charsLabel || "Characters", value: result.inputChars },
    { label: ig.outputCharsLabel || "Copied length", value: result.outputChars },
    { label: ig.blanksLabel || "Blank lines kept", value: result.blanksKept },
    { label: ig.paragraphsLabel || "Paragraphs", value: result.paragraphs },
  ];

  const modes: { id: BlankMode; label: string; hint: string }[] = [
    {
      id: "invisible",
      label: ig.methodInvisible || "Invisible blank (recommended)",
      hint: ig.methodInvisibleHint || "An invisible Braille blank character sits on each empty line. Nothing shows, but the gap stays.",
    },
    {
      id: "dots",
      label: ig.methodDots || "Visible dot divider",
      hint: ig.methodDotsHint || "A small · sits on its own line between paragraphs — a separator readers can see.",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="instagramLineBreak" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-600 text-white self-start shadow-sm">
            <Instagram className="w-3.5 h-3.5" /> {ig.badge || "Instagram Line Breaks"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {ig.pageTitle || "Add Line Breaks to Instagram Captions & Bios"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ig.subtitle || "Write your caption with normal blank lines and copy it with the spacing protected. Blank lines carry an invisible character, so Instagram keeps your paragraphs apart — and everything happens in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-pink-50/70 border border-pink-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-pink-600 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-pink-950">{ig.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{ig.quickAnswer}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setText(ig.sampleText || "")} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {ig.sampleBtn || "Try a sample"}
          </button>
          <button onClick={handleCopy} disabled={!result.output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (ig.copied || "Copied!") : (ig.copyBtn || "Copy with line breaks")}
          </button>
          <button onClick={() => setText("")} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {ig.clearBtn || "Clear"}
          </button>
        </div>

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Instagram className="w-4 h-4 text-pink-600" /> {ig.methodTitle || "Blank-line style"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {modes.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`text-left px-3 py-2.5 rounded-xl border transition cursor-pointer ${mode === item.id ? "bg-pink-600 text-white border-pink-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-pink-300"}`}
              >
                <span className="block text-xs font-bold">{item.label}</span>
                <span className={`block text-[11px] leading-relaxed ${mode === item.id ? "text-pink-50" : "text-stone-500"}`}>{item.hint}</span>
              </button>
            ))}
          </div>
          <label className={`mt-2 flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition ${trimEnds ? "bg-pink-600 text-white border-pink-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-pink-300"}`}>
            <input type="checkbox" checked={trimEnds} onChange={(e) => setTrimEnds(e.target.checked)} className="mt-0.5 w-4 h-4 cursor-pointer accent-white" />
            <span>
              <span className="block text-xs font-bold">{ig.trimLabel || "Trim trailing spaces"}</span>
              <span className={`block text-[11px] leading-relaxed ${trimEnds ? "text-pink-50" : "text-stone-500"}`}>{ig.trimHint || "Spaces at the end of a line can make a break vanish; trimming removes them."}</span>
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="ig-input">
              {ig.editorLabel || "Your caption, bio or comment"}
            </label>
            <textarea
              id="ig-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={ig.placeholder || "Write your caption here. Press Enter twice to leave a blank line between paragraphs…"}
              className="w-full h-72 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-pink-500 resize-y"
            />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
              {ig.previewTitle || "Caption preview"}
            </span>
            <div className="w-full h-72 rounded-2xl border border-stone-200 bg-stone-50 p-4 overflow-y-auto">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shrink-0" />
                <span className="text-sm font-bold text-stone-900">{ig.previewUser || "yourprofile"}</span>
              </div>
              {result.output ? (
                <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-wrap break-words">{result.output}</p>
              ) : (
                <p className="text-sm text-stone-400">{ig.previewEmpty || "Your formatted caption will appear here, exactly as the copy will paste."}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-live="polite">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{card.label}</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{card.value}</div>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 text-[11px] sm:text-xs text-stone-500 leading-relaxed">
          <Info className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
          <span>
            {(ig.limitNote || "Instagram commonly limits captions to 2,200 characters and bios to 150, and the invisible characters count toward those limits. Instagram can change these limits and how it treats spacer characters at any time.")
              .replace("{caption}", String(CAPTION_LIMIT)).replace("{bio}", String(BIO_LIMIT))}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-pink-600" /> {ig.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ig.honestText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-pink-600" /> {ig.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ig.privacyNote}</p>
        </div>
      </div>

      <ToolGuideSection toolId="instagramLineBreak" selectedLanguage={selectedLanguage} />
    </div>
  );
}
