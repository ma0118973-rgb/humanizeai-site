import React, { useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { BookMarked, Copy, Check, Sparkles, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
import { generateCitationFormats, CitationInput, CitationResult } from "../utils/localEngines";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface CitationWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

export function CitationWorkspace({ selectedLanguage = "en" }: CitationWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  const [input, setInput] = useState<CitationInput>({
    title: "The Impact of Artificial Intelligence on Higher Education Pedagogy",
    author: "Johnson, Robert & Davis, Elena",
    year: "2026",
    publisherOrJournal: "Journal of Academic Technology & Research",
    volumeOrIssue: "Vol. 14, Issue 2",
    pages: "45-62",
    urlOrDoi: "https://doi.org/10.1016/j.jatech.2026.02.019",
    sourceType: "journal",
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const results: CitationResult = generateCitationFormats(input);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickPreset = (type: "journal" | "book" | "website" | "thesis") => {
    if (type === "journal") {
      setInput({
        title: "Perplexity Variance and Burstiness Distribution in Neural Language Models",
        author: "Al-Mansoor, Tariq & Chen, Wei",
        year: "2026",
        publisherOrJournal: "Computational Linguistics Quarterly",
        volumeOrIssue: "Vol. 32, No. 1",
        pages: "112-135",
        urlOrDoi: "doi.org/10.1145/362748.2026",
        sourceType: "journal",
      });
    } else if (type === "book") {
      setInput({
        title: "Natural Prose: The Science of Ethical Humanization",
        author: "Miller, Sarah P.",
        year: "2025",
        publisherOrJournal: "Oxford Academic Press",
        volumeOrIssue: "",
        pages: "",
        urlOrDoi: "isbn:978-0-19-887123-4",
        sourceType: "book",
      });
    } else if (type === "website") {
      setInput({
        title: "AI Detector Guide: What a Pattern Score Can and Cannot Tell You",
        author: "ToolVena Editorial Team",
        year: "2026",
        publisherOrJournal: "ToolVena",
        volumeOrIssue: "",
        pages: "",
        urlOrDoi: "https://www.toolvena.com/en/blog/ai-detector-english-guide/",
        sourceType: "website",
      });
    } else {
      setInput({
        title: "Linguistic Cadence and Neural Syntactic Verification in Student Theses",
        author: "Khan, Zeeshan",
        year: "2026",
        publisherOrJournal: "National University of Sciences & Technology",
        volumeOrIssue: "",
        pages: "",
        urlOrDoi: "hdl.handle.net/123456789/402",
        sourceType: "thesis",
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="citation" selectedLanguage={selectedLanguage} />
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 rounded-3xl p-4 sm:p-8 text-stone-900 shadow-xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-emerald-400" />
              Free APA 7, MLA 9 & Chicago Citation Engine
            </span>
            <span className="text-xs text-stone-400 font-mono">APA • MLA • Chicago • Harvard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            Free Academic Citation & Bibliography Formatter
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            Format references for journal papers, books, websites, and theses in APA 7, MLA 9, Chicago 17, and Harvard styles. Free, with no sign-up.
          </p>
        </div>

        {/* Quick Style Presets */}
        <div className="flex items-center gap-2 flex-wrap relative z-10">
          {(["journal", "book", "website", "thesis"] as const).map((st) => (
            <button
              key={st}
              onClick={() => handleQuickPreset(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                input.sourceType === st
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-emerald-400 font-bold"
                  : "bg-amber-50/80 text-stone-600 border-amber-200 hover:bg-stone-700"
              }`}
            >
              {st} Example
            </button>
          ))}
        </div>
      </div>

      {/* AEO / GEO Answer Engine Direct Capsule */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-emerald-950">
              Quick Answer: What This Citation Tool Does
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              Enter the source details you know, choose APA 7, MLA 9, Chicago or Harvard, and copy the formatted reference and in-text citation. Always check names, dates, page numbers and DOI or URL against the original source and your institution's style guide.
            </p>
          </div>
        </div>
      </div>

      {/* Form Input + Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Metadata Input */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Source Information
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Source Type</label>
              <select
                value={input.sourceType}
                onChange={(e) => setInput({ ...input, sourceType: e.target.value as any })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-emerald-500"
              >
                <option value="journal">Peer-Reviewed Journal Article</option>
                <option value="book">Published Book / Monograph</option>
                <option value="website">Web Article / Online Report</option>
                <option value="thesis">Master Thesis / Doctoral Dissertation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Article / Book Title</label>
              <input
                type="text"
                value={input.title}
                onChange={(e) => setInput({ ...input, title: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-emerald-500"
                placeholder="e.g. Deep Learning in Natural Language Understanding"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Author(s) (Last, First M.)</label>
              <input
                type="text"
                value={input.author}
                onChange={(e) => setInput({ ...input, author: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-emerald-500"
                placeholder="e.g. Ahmed, Bilal & Taylor, Chris"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Year</label>
                <input
                  type="text"
                  value={input.year}
                  onChange={(e) => setInput({ ...input, year: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-emerald-500"
                  placeholder="2026"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pages (Optional)</label>
                <input
                  type="text"
                  value={input.pages || ""}
                  onChange={(e) => setInput({ ...input, pages: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-emerald-500"
                  placeholder="45-52"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {input.sourceType === "journal" ? "Journal Name & Volume" : input.sourceType === "book" ? "Publisher" : "Website Name / University"}
              </label>
              <input
                type="text"
                value={input.publisherOrJournal}
                onChange={(e) => setInput({ ...input, publisherOrJournal: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-emerald-500"
                placeholder="e.g. IEEE Transactions on Neural Networks"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">URL or DOI (Optional)</label>
              <input
                type="text"
                value={input.urlOrDoi || ""}
                onChange={(e) => setInput({ ...input, urlOrDoi: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium outline-none focus:border-emerald-500"
                placeholder="doi.org/10.1000/182"
              />
            </div>
          </div>
        </div>

        {/* Right Output: Formatted Styles */}
        <div className="lg:col-span-7 space-y-4">
          {/* APA 7 */}
          <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-white text-white text-xs font-bold">
                APA 7th Edition (American Psychological Association)
              </span>
              <button
                onClick={() => handleCopy(results.apa, "apa")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedKey === "apa" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "apa" ? "Copied!" : "Copy APA"}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-mono text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed break-all select-all">
              {results.apa}
            </p>
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span>In-text parenthetical: <strong>{results.inTextApa}</strong></span>
              <button
                onClick={() => handleCopy(results.inTextApa, "inTextApa")}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                {copiedKey === "inTextApa" ? "Copied in-text!" : "Copy In-Text"}
              </button>
            </div>
          </div>

          {/* MLA 9 */}
          <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-blue-900 text-white text-xs font-bold">
                MLA 9th Edition (Modern Language Association)
              </span>
              <button
                onClick={() => handleCopy(results.mla, "mla")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedKey === "mla" ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "mla" ? "Copied!" : "Copy MLA"}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-mono text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed break-all select-all">
              {results.mla}
            </p>
            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
              <span>In-text parenthetical: <strong>{results.inTextMla}</strong></span>
              <button
                onClick={() => handleCopy(results.inTextMla, "inTextMla")}
                className="text-blue-700 hover:underline font-semibold cursor-pointer"
              >
                {copiedKey === "inTextMla" ? "Copied in-text!" : "Copy In-Text"}
              </button>
            </div>
          </div>

          {/* Chicago 17 */}
          <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-amber-900 text-white text-xs font-bold">
                Chicago 17th Edition (Author-Date System)
              </span>
              <button
                onClick={() => handleCopy(results.chicago, "chicago")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedKey === "chicago" ? <Check className="w-3.5 h-3.5 text-amber-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "chicago" ? "Copied!" : "Copy Chicago"}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-mono text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed break-all select-all">
              {results.chicago}
            </p>
          </div>

          {/* Harvard Referencing */}
          <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-stone-900 text-xs font-bold">
                Harvard Referencing Style
              </span>
              <button
                onClick={() => handleCopy(results.harvard, "harvard")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 hover:bg-stone-200 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedKey === "harvard" ? <Check className="w-3.5 h-3.5 text-stone-900" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "harvard" ? "Copied!" : "Copy Harvard"}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-mono text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed break-all select-all">
              {results.harvard}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
