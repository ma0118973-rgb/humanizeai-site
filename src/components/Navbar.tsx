import React, { useState } from "react";
import {
  Table2,
  Clock3,
  Sparkles,
  ShieldCheck,
  Search,
  Tag,
  Flame,
  Clock,
  Globe,
  Download,
  Smartphone,
  Video,
  Fingerprint,
  Regex,
  ChevronDown,
  BookMarked,
  Maximize2,
  AlertOctagon,
  GitCompare,
  TrendingUp,
  Mic,
  Briefcase,
  Hash,
  Volume2,
  Keyboard,
  CaseSensitive,
  KeyRound,
  ListChecks,
  Ghost,
  Repeat,
  LetterText,
  BarChart3,
  Timer,
  Binary,
  Instagram,
  Link2,
  Braces,
  AlignLeft,
  CalendarDays,
  Dices,
  FileText,
  Scaling,
  ScanText,
  Scissors,
  AtSign,
  Radio,
  Ruler,
} from "lucide-react";
import { ActivePage, LanguageCode } from "../types";
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from "../data/translations";

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  onOpenBlueprint: () => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  draftsCount?: number;
  onOpenHistory?: () => void;
  onOpenInstall?: () => void;
}

export function Navbar({
  activePage,
  setActivePage,
  onOpenBlueprint,
  selectedLanguage,
  onLanguageChange,
  draftsCount = 0,
  onOpenHistory,
  onOpenInstall,
}: NavbarProps) {
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 text-stone-900 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-16 gap-1 sm:gap-4">
          {/* Brand Logo & Title */}
          <div
            onClick={() => setActivePage("humanizer")}
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer select-none min-w-0 shrink"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md sm:shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-stone-950 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-base sm:text-xl font-extrabold tracking-tight text-stone-900 font-sans truncate">
                  Clever<span className="text-amber-600">Humanizer</span>
                </span>
                <span className="hidden xs:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase bg-amber-100 text-amber-700 border border-amber-300 rounded-full shrink-0">
                  Free
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 hidden md:block truncate">
                {t.nav.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (hidden on small mobile screens to prevent overflow) */}
          <div className="hidden md:flex items-center gap-1">
            <button
              id="nav-tab-humanizer"
              onClick={() => setActivePage("humanizer")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activePage === "humanizer"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-md shadow-emerald-500/20"
                  : "text-stone-600 hover:text-amber-700 hover:bg-amber-100/60"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.nav.humanizerTab}</span>
            </button>

            <button
              id="nav-tab-detector"
              onClick={() => setActivePage("detector")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activePage === "detector"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-md shadow-emerald-500/20"
                  : "text-stone-600 hover:text-amber-700 hover:bg-amber-100/60"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t.nav.detectorTab}</span>
            </button>

            <button
              id="nav-tab-media"
              onClick={() => setActivePage("media")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activePage === "media"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-md shadow-emerald-500/20"
                  : "text-stone-600 hover:text-amber-700 hover:bg-amber-100/60"
              }`}
            >
              <Video className="w-4 h-4 text-emerald-400" />
              <span>{t.nav.mediaTab}</span>
            </button>

            <button
              id="nav-tab-blog"
              onClick={() => setActivePage("blog")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activePage === "blog"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-md shadow-emerald-500/20"
                  : "text-stone-600 hover:text-amber-700 hover:bg-amber-100/60"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{t.nav.blogTab}</span>
            </button>

            {/* Academic & SEO More Tools Dropdown */}
            <div className="relative">
              <button
                id="nav-tab-more-tools"
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  ["citation", "expander", "cleaner", "diff", "seo", "summarizer", "voiceTyping", "cvBuilder", "wordCounter", "characterCounter", "textToSpeech", "typingTest", "caseConverter", "passwordGenerator", "duplicateLines", "textRepeater", "invisibleCharacter", "wordFrequency", "readingTime", "base64", "slugGenerator", "jsonFormatter", "loremIpsum", "daysBetween", "randomNumber", "onlineTimer", "invoiceGenerator", "imageResizer", "imageConverter", "imageToText", "pdfSplitter", "usernameGenerator", "morseCodeTranslator", "voiceRecorder", "onlineNotepad", "unitConverter", "onlineTeleprompter", "uuidGenerator", "timestampConverter", "jsonToCsv", "regexTester", "urlEncoder", "utmLinkBuilder", "instagramLineBreak", "imageCompressor", "pdfTools"].includes(activePage)
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-md shadow-emerald-500/20"
                    : "text-stone-600 hover:text-amber-700 hover:bg-amber-100/60"
                }`}
              >
                <span>More Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isToolsDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-64 bg-white border border-amber-200 rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setIsToolsDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      setActivePage("citation");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "citation" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <BookMarked className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold">Citation Generator</div>
                      <div className="text-[10px] text-stone-400">APA 7, MLA 9, Chicago</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("expander");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "expander" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Maximize2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <div>
                      <div className="font-bold">Sentence Expander</div>
                      <div className="text-[10px] text-stone-400">Scholarly Depth & Burstiness</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("cleaner");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "cleaner" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-bold">AI Cliché Purger</div>
                      <div className="text-[10px] text-stone-400">Strip Hallmark AI Words</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("diff");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "diff" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <GitCompare className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold">Similarity Diff Checker</div>
                      <div className="text-[10px] text-stone-400">Turnitin Match Predictor</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("seo");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "seo" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold">High-RPM SEO Optimizer</div>
                      <div className="text-[10px] text-stone-400">Viral Tags & Keywords</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("summarizer");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "summarizer" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <BookMarked className="w-4 h-4 text-violet-400 shrink-0" />
                    <div>
                      <div className="font-bold">Text Summarizer</div>
                      <div className="text-[10px] text-stone-400">Long Text to Key Points</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("voiceTyping");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "voiceTyping" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Mic className="w-4 h-4 text-teal-500 shrink-0" />
                    <div>
                      <div className="font-bold">Voice Typing</div>
                      <div className="text-[10px] text-stone-400">Speak & Get Text</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("cvBuilder");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "cvBuilder" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <div className="font-bold">CV Builder</div>
                      <div className="text-[10px] text-stone-400">Resume in Minutes</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("wordCounter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "wordCounter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Hash className="w-4 h-4 text-lime-500 shrink-0" />
                    <div>
                      <div className="font-bold">Word Counter</div>
                      <div className="text-[10px] text-stone-400">Words, characters & reading time</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("characterCounter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "characterCounter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <LetterText className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <div className="font-bold">Character Counter</div>
                      <div className="text-[10px] text-stone-400">Exact characters & platform limits</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("textToSpeech");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "textToSpeech" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Volume2 className="w-4 h-4 text-sky-500 shrink-0" />
                    <div>
                      <div className="font-bold">Text to Speech</div>
                      <div className="text-[10px] text-stone-400">Hear your text aloud</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("typingTest");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "typingTest" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Keyboard className="w-4 h-4 text-violet-500 shrink-0" />
                    <div>
                      <div className="font-bold">Typing Speed Test</div>
                      <div className="text-[10px] text-stone-400">WPM, accuracy & typing practice</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("caseConverter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "caseConverter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <CaseSensitive className="w-4 h-4 text-cyan-600 shrink-0" />
                    <div>
                      <div className="font-bold">Case Converter</div>
                      <div className="text-[10px] text-stone-400">UPPERCASE, Title Case & more</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("passwordGenerator");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "passwordGenerator" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">Password Generator</div>
                      <div className="text-[10px] text-stone-400">Strong random passwords</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("duplicateLines");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "duplicateLines" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <ListChecks className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Remove Duplicate Lines</div>
                      <div className="text-[10px] text-stone-400">Clean repeated list lines</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("textRepeater");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "textRepeater" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Repeat className="w-4 h-4 text-violet-600 shrink-0" />
                    <div>
                      <div className="font-bold">Text Repeater</div>
                      <div className="text-[10px] text-stone-400">Repeat text up to 1,000 times</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("invisibleCharacter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "invisibleCharacter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Ghost className="w-4 h-4 text-fuchsia-600 shrink-0" />
                    <div>
                      <div className="font-bold">Invisible Character</div>
                      <div className="text-[10px] text-stone-400">Copy blank text & reveal hidden text</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("wordFrequency");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "wordFrequency" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">Word Frequency Counter</div>
                      <div className="text-[10px] text-stone-400">Repeated words & phrases</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("readingTime");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "readingTime" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Timer className="w-4 h-4 text-teal-600 shrink-0" />
                    <div>
                      <div className="font-bold">Reading Time Calculator</div>
                      <div className="text-[10px] text-stone-400">Reading & speaking time</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("base64");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "base64" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Binary className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-bold">Base64 Encoder & Decoder</div>
                      <div className="text-[10px] text-stone-400">UTF-8 and URL-safe</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("slugGenerator");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "slugGenerator" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Slug Generator</div>
                      <div className="text-[10px] text-stone-400">Clean URL slugs from titles</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("jsonFormatter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "jsonFormatter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Braces className="w-4 h-4 text-sky-700 shrink-0" />
                    <div>
                      <div className="font-bold">JSON Formatter</div>
                      <div className="text-[10px] text-stone-400">Beautify, minify & validate</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("loremIpsum");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "loremIpsum" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <AlignLeft className="w-4 h-4 text-violet-700 shrink-0" />
                    <div>
                      <div className="font-bold">Lorem Ipsum Generator</div>
                      <div className="text-[10px] text-stone-400">Paragraphs, sentences & words</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("daysBetween");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "daysBetween" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <CalendarDays className="w-4 h-4 text-sky-700 shrink-0" />
                    <div>
                      <div className="font-bold">Days Between Dates</div>
                      <div className="text-[10px] text-stone-400">Count days & business days</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("randomNumber");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "randomNumber" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Dices className="w-4 h-4 text-violet-700 shrink-0" />
                    <div>
                      <div className="font-bold">Random Number Generator</div>
                      <div className="text-[10px] text-stone-400">Numbers, coin flip & dice</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("onlineTimer");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "onlineTimer" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Timer className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <div className="font-bold">Online Timer & Stopwatch</div>
                      <div className="text-[10px] text-stone-400">Countdown, laps & big digits</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("invoiceGenerator");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "invoiceGenerator" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <div className="font-bold">Invoice Generator</div>
                      <div className="text-[10px] text-stone-400">Items, tax &amp; PDF print</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("imageResizer");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "imageResizer" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Scaling className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <div className="font-bold">Image Resizer &amp; Cropper</div>
                      <div className="text-[10px] text-stone-400">Exact pixels, crop &amp; presets</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("imageConverter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "imageConverter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Repeat className="w-4 h-4 text-violet-700 shrink-0" />
                    <div>
                      <div className="font-bold">Image Converter</div>
                      <div className="text-[10px] text-stone-400">JPG, PNG, WebP &amp; batch</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("imageToText");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "imageToText" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <ScanText className="w-4 h-4 text-cyan-700 shrink-0" />
                    <div>
                      <div className="font-bold">Image to Text OCR</div>
                      <div className="text-[10px] text-stone-400">Extract text from JPG, PNG, WebP</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("pdfSplitter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "pdfSplitter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Scissors className="w-4 h-4 text-orange-700 shrink-0" />
                    <div>
                      <div className="font-bold">PDF Splitter</div>
                      <div className="text-[10px] text-stone-400">Extract pages, split ranges</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("usernameGenerator");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "usernameGenerator" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <AtSign className="w-4 h-4 text-fuchsia-700 shrink-0" />
                    <div>
                      <div className="font-bold">Username Generator</div>
                      <div className="text-[10px] text-stone-400">Gaming, creator & brand ideas</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("morseCodeTranslator");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "morseCodeTranslator" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Radio className="w-4 h-4 text-cyan-700 shrink-0" />
                    <div>
                      <div className="font-bold">Morse Code Translator</div>
                      <div className="text-[10px] text-stone-400">Dots, dashes, sound & flash</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("voiceRecorder");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "voiceRecorder" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Mic className="w-4 h-4 text-rose-700 shrink-0" />
                    <div>
                      <div className="font-bold">Online Voice Recorder</div>
                      <div className="text-[10px] text-stone-400">Record, pause & download — no upload</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("onlineNotepad");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "onlineNotepad" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold">Online Notepad</div>
                      <div className="text-[10px] text-stone-400">Autosave notes, counts &amp; .txt</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("unitConverter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "unitConverter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Ruler className="w-4 h-4 text-sky-700 shrink-0" />
                    <div>
                      <div className="font-bold">Unit Converter</div>
                      <div className="text-[10px] text-stone-400">Length, weight, temp &amp; more</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("onlineTeleprompter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "onlineTeleprompter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Video className="w-4 h-4 text-violet-700 shrink-0" />
                    <div>
                      <div className="font-bold">Online Teleprompter</div>
                      <div className="text-[10px] text-stone-400">Scrolling script, mirror &amp; countdown</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("uuidGenerator");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "uuidGenerator" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Fingerprint className="w-4 h-4 text-indigo-700 shrink-0" />
                    <div>
                      <div className="font-bold">UUID Generator</div>
                      <div className="text-[10px] text-stone-400">Bulk v4, case &amp; hyphens</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("timestampConverter");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "timestampConverter" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Clock3 className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <div className="font-bold">Timestamp Converter</div>
                      <div className="text-[10px] text-stone-400">Epoch, UTC &amp; local</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("jsonToCsv");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "jsonToCsv" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Table2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold">JSON to CSV</div>
                      <div className="text-[10px] text-stone-400">Flatten, preview &amp; safe export</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("regexTester");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "regexTester" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Regex className="w-4 h-4 text-violet-700 shrink-0" />
                    <div>
                      <div className="font-bold">Regex Tester</div>
                      <div className="text-[10px] text-stone-400">Matches, groups &amp; replace</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("urlEncoder");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "urlEncoder" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-sky-700 shrink-0" />
                    <div>
                      <div className="font-bold">URL Encoder / Decoder</div>
                      <div className="text-[10px] text-stone-400">Full link or single value</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("utmLinkBuilder");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "utmLinkBuilder" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Link2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold">UTM Link Builder</div>
                      <div className="text-[10px] text-stone-400">Source, medium &amp; campaign</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("instagramLineBreak");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "instagramLineBreak" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                    <div>
                      <div className="font-bold">Instagram Line Breaks</div>
                      <div className="text-[10px] text-stone-400">Keep caption spacing</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("imageCompressor");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "imageCompressor" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Maximize2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold">Image Compressor</div>
                      <div className="text-[10px] text-stone-400">Shrink Photos Fast</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage("pdfTools");
                      setIsToolsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                      activePage === "pdfTools" ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold" : "text-stone-700 hover:bg-amber-50"
                    }`}
                  >
                    <Flame className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <div className="font-bold">PDF Tools</div>
                      <div className="text-[10px] text-stone-400">Merge & Create PDFs</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Icons: Install App, History, 2026 Blueprint, Language */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Prominent High-Converting "Install App / Download App" Button */}
            {onOpenInstall && (
              <button
                id="nav-btn-install"
                onClick={onOpenInstall}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 text-stone-950 shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Install Clever Humanizer WebApp on iPhone or Android"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden xs:inline">{t.nav.installBtn}</span>
              </button>
            )}

            {/* Revision History Drawer Button */}
            {onOpenHistory && (
              <button
                id="nav-btn-history"
                onClick={onOpenHistory}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-amber-700 hover:bg-amber-50/80 transition-all border border-amber-200 shrink-0"
                title="View Saved Drafts & History"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{t.nav.historyBtn}</span>
                {draftsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-[10px] font-bold rounded-full font-mono">
                    {draftsCount}
                  </span>
                )}
              </button>
            )}

            {/* Strategic 2026 Blueprint Button (hidden on mobile screens) */}
            <button
              id="nav-btn-blueprint"
              onClick={onOpenBlueprint}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-500/25 transition-all shrink-0"
              title="View 2026 Real-Time Market Strategy & Competitor Clone Analysis"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t.nav.blueprintBtn}</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center shrink-0">
              <div className="flex items-center gap-1 px-1.5 py-1.5 sm:px-2 sm:py-2 bg-amber-50/80 hover:bg-amber-50 border border-amber-200/60 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer">
                <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <select
                  id="nav-language-select"
                  value={selectedLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                  className="bg-transparent text-stone-700 outline-none cursor-pointer text-xs font-semibold pr-0.5 max-w-[55px] xs:max-w-[75px] sm:max-w-none"
                  aria-label="Select Language"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white text-stone-900">
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
