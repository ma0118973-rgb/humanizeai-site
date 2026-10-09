import React from "react";
import {
  Sparkles, Search, Video, TrendingUp, BookMarked, Maximize2,
  FileText, Download, AlertOctagon, GitCompare, Scissors, Mic, Briefcase, Hash, Volume2, Keyboard, Type, KeyRound, ListChecks, Ghost, Repeat, LetterText, BarChart3, Timer, Binary, Instagram, Clock3, Link2, Braces, AlignLeft, CalendarDays, Dices, Scaling, ScanText, AtSign, Radio, Disc3, Fingerprint, Table2, Regex,
} from "lucide-react";
import { ActivePage } from "../types";

interface MobileToolStripProps {
  activePage: ActivePage;
  onSelectPage: (page: ActivePage) => void;
}

const TOOLS: { id: ActivePage; label: string; icon: React.ElementType }[] = [
  { id: "humanizer", label: "Humanizer", icon: Sparkles },
  { id: "detector", label: "Detector", icon: Search },
  { id: "citation", label: "Citation", icon: BookMarked },
  { id: "expander", label: "Expander", icon: Maximize2 },
  { id: "summarizer", label: "Summarizer", icon: Scissors },
  { id: "voiceTyping", label: "Voice Typing", icon: Mic },
  { id: "cvBuilder", label: "CV Builder", icon: Briefcase },
  { id: "wordCounter", label: "Word Counter", icon: Hash },
  { id: "characterCounter", label: "Characters", icon: LetterText },
  { id: "textToSpeech", label: "Text to Speech", icon: Volume2 },
  { id: "typingTest", label: "Typing Test", icon: Keyboard },
  { id: "caseConverter", label: "Case Converter", icon: Type },
  { id: "passwordGenerator", label: "Password Gen", icon: KeyRound },
  { id: "duplicateLines", label: "Duplicate Lines", icon: ListChecks },
  { id: "textRepeater", label: "Text Repeater", icon: Repeat },
  { id: "invisibleCharacter", label: "Invisible Text", icon: Ghost },
  { id: "wordFrequency", label: "Word Frequency", icon: BarChart3 },
  { id: "readingTime", label: "Reading Time", icon: Timer },
  { id: "base64", label: "Base64", icon: Binary },
  { id: "slugGenerator", label: "Slug Maker", icon: Link2 },
  { id: "jsonFormatter", label: "JSON Format", icon: Braces },
  { id: "loremIpsum", label: "Lorem Ipsum", icon: AlignLeft },
  { id: "daysBetween", label: "Days Between", icon: CalendarDays },
  { id: "randomNumber", label: "Random Number", icon: Dices },
  { id: "onlineTimer", label: "Timer", icon: Timer },
  { id: "invoiceGenerator", label: "Invoice", icon: FileText },
  { id: "imageResizer", label: "Resizer", icon: Scaling },
  { id: "imageConverter", label: "Converter", icon: Repeat },
  { id: "imageToText", label: "Image to Text", icon: ScanText },
  { id: "pdfSplitter", label: "PDF Splitter", icon: Scissors },
  { id: "usernameGenerator", label: "Usernames", icon: AtSign },
  { id: "morseCodeTranslator", label: "Morse Code", icon: Radio },
  { id: "voiceRecorder", label: "Voice Recorder", icon: Disc3 },
  { id: "onlineNotepad", label: "Notepad", icon: FileText },
  { id: "unitConverter", label: "Unit Converter", icon: Scaling },
  { id: "onlineTeleprompter", label: "Teleprompter", icon: Video },
  { id: "uuidGenerator", label: "UUID Gen", icon: Fingerprint },
  { id: "timestampConverter", label: "Timestamp", icon: Clock3 },
  { id: "jsonToCsv", label: "JSON to CSV", icon: Table2 },
  { id: "regexTester", label: "Regex Tester", icon: Regex },
  { id: "instagramLineBreak", label: "IG Line Breaks", icon: Instagram },
  { id: "imageCompressor", label: "Compressor", icon: Download },
  { id: "pdfTools", label: "PDF Tools", icon: FileText },
  { id: "media", label: "Video", icon: Video },
  { id: "seo", label: "SEO", icon: TrendingUp },
  { id: "cleaner", label: "Clichés", icon: AlertOctagon },
  { id: "diff", label: "Diff", icon: GitCompare },
];

/**
 * Horizontal scrollable tool strip shown below the navbar on mobile.
 * Replaces the bottom navigation dock — all 11 tools visible, no screen space blocked.
 */
export function MobileToolStrip({ activePage, onSelectPage }: MobileToolStripProps) {
  return (
    <div className="md:hidden sticky top-12 sm:top-16 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200">
      <div className="flex gap-1.5 overflow-x-auto px-3 py-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activePage === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectPage(tool.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md"
                  : "bg-amber-50 text-stone-700 border border-amber-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tool.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
