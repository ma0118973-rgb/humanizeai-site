export type ToneType = "balanced" | "academic" | "conversational" | "professional" | "creative";

export type BypassLevel = "standard" | "stealth" | "ultra-stealth";

export type LanguageCode = "en" | "es" | "tr" | "de" | "fr" | "pt" | "ja" | "ur" | "no" | "nl" | "it";

export interface HumanizeResult {
  humanizedText: string;
  readabilityGrade: string;
  fleschReadingEase?: number;
  gunningFogIndex?: number;
  passiveVoicePercent?: number;
  perplexityScore: string;
  burstinessScore: string;
  wordCountOriginal?: number;
  wordCountHumanized?: number;
  changesHighlights: string[];
}

export interface SentenceAnalysis {
  sentence: string;
  status: "ai" | "mixed" | "human";
}

export interface DetectionResult {
  overallAiProbability: number;
  overallHumanProbability: number;
  verdict: string;
  keySignals: string[];
  sentenceAnalysis: SentenceAnalysis[];
}

export interface SeoResult {
  seoTitle: string;
  metaDescription: string;
  primaryKeywords: string[];
  longTailKeywords: string[];
  viralHashtags: string[];
  openGraphTitle: string;
  openGraphDescription: string;
  schemaJsonPreview?: string;
}

export interface SavedDraft {
  id: string;
  timestamp: number;
  originalText: string;
  humanizedText: string;
  tone: string;
  originalWordCount: number;
  humanizedWordCount: number;
}

export type ActivePage =
  | "humanizer"
  | "detector"
  | "media"
  | "blog"
  | "seo"
  | "citation"
  | "expander"
  | "summarizer"
  | "voiceTyping"
  | "cvBuilder"
  | "wordCounter"
  | "characterCounter"
  | "textToSpeech"
  | "typingTest"
  | "caseConverter"
  | "passwordGenerator"
  | "duplicateLines"
  | "textRepeater"
  | "invisibleCharacter"
  | "wordFrequency"
  | "readingTime"
  | "base64"
  | "slugGenerator"
  | "jsonFormatter"
  | "loremIpsum"
  | "daysBetween"
  | "randomNumber"
  | "onlineTimer"
  | "invoiceGenerator"
  | "imageResizer"
  | "imageConverter"
  | "imageToText"
  | "pdfSplitter"
  | "usernameGenerator"
  | "morseCodeTranslator"
  | "voiceRecorder"
  | "onlineNotepad"
  | "unitConverter"
  | "onlineTeleprompter"
  | "uuidGenerator"
  | "timestampConverter"
  | "jsonToCsv"
  | "instagramLineBreak"
  | "imageCompressor"
  | "pdfTools"
  | "cleaner"
  | "diff"
  | "privacy"
  | "terms"
  | "disclaimer"
  | "about"
  | "contact"
  | "notfound";
