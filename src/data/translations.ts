import { LanguageCode } from "../types";

export interface TranslationDict {
  nav?: {
    brandSubtitle: string;
    humanizerTab: string;
    detectorTab: string;
    mediaTab: string;
    blogTab: string;
    installBtn: string;
    historyBtn: string;
    blueprintBtn: string;
  };
  seo?: {
    homeTitle?: string;
    homeDesc?: string;
    homeFaqs?: { q: string; a: string }[];
    humanizerTitle?: string;
    humanizerDesc?: string;
    detectorTitle?: string;
    detectorDesc?: string;
    mediaTitle?: string;
    mediaDesc?: string;
    seoTitle?: string;
    seoDesc?: string;
    blogTitle?: string;
    blogDesc?: string;
    citationTitle?: string;
    citationDesc?: string;
    expanderTitle?: string;
    expanderDesc?: string;
    cleanerTitle?: string;
    cleanerDesc?: string;
    diffTitle?: string;
    diffDesc?: string;
    summarizerTitle?: string;
    summarizerDesc?: string;
    voiceTypingTitle?: string;
    voiceTypingDesc?: string;
    cvBuilderTitle?: string;
    cvBuilderDesc?: string;
    wordCounterTitle?: string;
    wordCounterDesc?: string;
    audioToTextTitle?: string;
    audioToTextDesc?: string;
    backgroundRemoverTitle?: string;
    backgroundRemoverDesc?: string;
    voiceClonerTitle?: string;
    voiceClonerDesc?: string;
    museAiHubTitle?: string;
    museAiHubDesc?: string;
    textToSpeechTitle?: string;
    textToSpeechDesc?: string;
    typingTestTitle?: string;
    typingTestDesc?: string;
    caseConverterTitle?: string;
    caseConverterDesc?: string;
    passwordGeneratorTitle?: string;
    passwordGeneratorDesc?: string;
    dedupLinesTitle?: string;
    dedupLinesDesc?: string;
    textRepeaterTitle?: string;
    textRepeaterDesc?: string;
    invisibleCharacterTitle?: string;
    invisibleCharacterDesc?: string;
    wordFrequencyTitle?: string;
    wordFrequencyDesc?: string;
    readingTimeTitle?: string;
    readingTimeDesc?: string;
    base64Title?: string;
    base64Desc?: string;
    slugGeneratorTitle?: string;
    slugGeneratorDesc?: string;
    jsonFormatterTitle?: string;
    jsonFormatterDesc?: string;
    loremIpsumTitle?: string;
    loremIpsumDesc?: string;
    daysBetweenTitle?: string;
    daysBetweenDesc?: string;
    randomNumberTitle?: string;
    randomNumberDesc?: string;
    onlineTimerTitle?: string;
    onlineTimerDesc?: string;
    imageResizerTitle?: string;
    imageResizerDesc?: string;
    imageConverterTitle?: string;
    imageConverterDesc?: string;
    imageToTextTitle?: string;
    imageToTextDesc?: string;
    pdfSplitterTitle?: string;
    pdfSplitterDesc?: string;
    usernameGeneratorTitle?: string;
    usernameGeneratorDesc?: string;
    morseCodeTranslatorTitle?: string;
    morseCodeTranslatorDesc?: string;
    voiceRecorderTitle?: string;
    voiceRecorderDesc?: string;
    onlineNotepadTitle?: string;
    onlineNotepadDesc?: string;
    unitConverterTitle?: string;
    unitConverterDesc?: string;
    onlineTeleprompterTitle?: string;
    onlineTeleprompterDesc?: string;
    uuidGeneratorTitle?: string;
    uuidGeneratorDesc?: string;
    timestampConverterTitle?: string;
    timestampConverterDesc?: string;
    jsonToCsvTitle?: string;
    jsonToCsvDesc?: string;
    regexTesterTitle?: string;
    regexTesterDesc?: string;
    urlEncoderTitle?: string;
    urlEncoderDesc?: string;
    utmLinkBuilderTitle?: string;
    utmLinkBuilderDesc?: string;
    metaCheckerTitle?: string;
    metaCheckerDesc?: string;
    invoiceGeneratorTitle?: string;
    invoiceGeneratorDesc?: string;
    instagramLineBreakTitle?: string;
    instagramLineBreakDesc?: string;
    characterCounterTitle?: string;
    characterCounterDesc?: string;
    imageCompressorTitle?: string;
    imageCompressorDesc?: string;
    pdfToolsTitle?: string;
    pdfToolsDesc?: string;
  };
  humanizer?: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    inputPlaceholder: string;
    humanizeBtn: string;
    processingBtn: string;
    outputTitle: string;
    outputEmpty: string;
    tones: Record<string, string>;
    levels: Record<string, string>;
    sampleSelectLabel: string;
    wordCountLabel: string;
    stages: { title: string; desc: string }[];
    aiOptInLabel?: string;
    aiOptInNote?: string;
    noChangeChip?: string;
    noChangeNote?: string;
  };
  summarizer?: {
    badge: string;
    title: string;
    brief: string;
    balanced: string;
    detailed: string;
  };
  voiceTyping?: {
    badge?: string; title?: string; subtitle?: string;
    quickAnswerTitle?: string; quickAnswer?: string;
    langLabel?: string; startBtn?: string; stopBtn?: string;
    listening?: string; ready?: string; placeholder?: string;
    outputLabel?: string; copy?: string; copied?: string;
    clear?: string; download?: string; words?: string; chars?: string;
    hintText?: string; unsupportedTitle?: string; unsupportedText?: string;
    privacyNote?: string; sendHumanizer?: string; micDenied?: string;
  };
  cvBuilder?: {
    badge?: string; title?: string; subtitle?: string;
    quickAnswerTitle?: string; quickAnswer?: string; savedNote?: string;
    personalSection?: string; fullName?: string; jobTitle?: string;
    email?: string; phone?: string; location?: string;
    addPhoto?: string; removePhoto?: string; photoHint?: string;
    summaryLabel?: string; summaryPlaceholder?: string; polishSummary?: string;
    experienceSection?: string; company?: string; startYear?: string; endYear?: string;
    descPlaceholder?: string; addJob?: string; educationSection?: string;
    degree?: string; school?: string; year?: string; addEducation?: string;
    skillsSection?: string; skillsPlaceholder?: string;
    languagesSection?: string; languagesPlaceholder?: string;
    templateLabel?: string; templateModern?: string; templateClassic?: string;
    printBtn?: string; sampleBtn?: string; clearBtn?: string;
    copied?: string; copyTop?: string; privacyNote?: string;
    previewSummary?: string; previewExperience?: string; previewEducation?: string;
    previewSkills?: string; previewLanguages?: string; printHint?: string;
  };
  audioToText?: Record<string, any>;
  wordCounter?: {
    badge?: string; title?: string; subtitle?: string;
    quickAnswerTitle?: string; quickAnswer?: string; editorLabel?: string;
    placeholder?: string; importBtn?: string; sampleBtn?: string;
    copyText?: string; copied?: string; copyStats?: string; download?: string; clear?: string;
    words?: string; characters?: string; charactersNoSpaces?: string;
    sentences?: string; paragraphs?: string; lines?: string; uniqueWords?: string;
    avgWordLength?: string; avgSentence?: string; longestSentence?: string;
    readingTime?: string; speakingTime?: string; goalLabel?: string; goalPlaceholder?: string;
    remainingWords?: string; goalReached?: string; selectionLabel?: string;
    topWords?: string; topWordsEmpty?: string; limitsTitle?: string; limitsNote?: string;
    charCounterLink?: string;
    metaLimit?: string; methodTitle?: string; methodText?: string;
    privacyTitle?: string; privacyNote?: string; sendHumanizer?: string; fileError?: string; jaNote?: string;
  };
  tts?: {
    badge?: string; title?: string; subtitle?: string;
    quickAnswerTitle?: string; quickAnswer?: string; editorLabel?: string;
    placeholder?: string; sampleBtn?: string; speakBtn?: string; pauseBtn?: string;
    resumeBtn?: string; stopBtn?: string; statusReady?: string; statusSpeaking?: string;
    statusPaused?: string; statusDone?: string; voiceLabel?: string; voicesFound?: string;
    rateLabel?: string; pitchLabel?: string; slowerLabel?: string; fasterLabel?: string;
    lowerLabel?: string; higherLabel?: string; words?: string; chars?: string;
    estListen?: string; partOf?: string; nowReading?: string; copyText?: string;
    copied?: string; downloadText?: string; clear?: string; voicesTitle?: string;
    voicesText?: string; noMp3Title?: string; noMp3Text?: string;
    noVoicesTitle?: string; noVoicesText?: string;
    unsupportedTitle?: string; unsupportedText?: string;
    privacyTitle?: string; privacyNote?: string; sendHumanizer?: string;
  };
  typingTest?: {
    badge?: string; title?: string; subtitle?: string;
    quickAnswerTitle?: string; quickAnswer?: string;
    modeLabel?: string; secondsUnit?: string; wordsUnit?: string; charsUnit?: string;
    langLabel?: string; newText?: string; restart?: string;
    typeHere?: string; startHint?: string;
    timeLeft?: string; timeUsed?: string; wpmNet?: string; grossWpm?: string;
    accuracy?: string; correctChars?: string; errorChars?: string; typedChars?: string; cpm?: string;
    resultsTitle?: string; finishedTimed?: string; finishedWords?: string;
    resultsNote?: string; bestLabel?: string; newBest?: string;
    copyResults?: string; copied?: string;
    formulaTitle?: string; formulaText?: string;
    honestTitle?: string; honestText?: string;
    privacyTitle?: string; privacyNote?: string; jaNote?: string;
  };
  caseConverter?: {
    badge?: string; pageTitle?: string; subtitle?: string; quickAnswerTitle?: string; quickAnswer?: string; editorLabel?: string; inputLabel?: string; placeholder?: string; convertLabel?: string; upper?: string; lower?: string; sentence?: string; capitalized?: string; title?: string; alternating?: string; inverse?: string; chars?: string; charsNoSpaces?: string; words?: string; lines?: string; sampleBtn?: string; copyBtn?: string; copied?: string; downloadBtn?: string; clearBtn?: string; sampleText?: string; previewTitle?: string; honestTitle?: string; honestText?: string; privacyTitle?: string; privacyNote?: string; localeTitle?: string; localeText?: string;
  };
  passwordGen?: {
    badge?: string; pageTitle?: string; subtitle?: string; quickAnswerTitle?: string; quickAnswer?: string; lengthLabel?: string; countLabel?: string; upperLabel?: string; lowerLabel?: string; numbersLabel?: string; symbolsLabel?: string; excludeLabel?: string; excludeHint?: string; generateBtn?: string; copyBtn?: string; copyAllBtn?: string; copiedAll?: string; copied?: string; resultsTitle?: string; emptyHint?: string; needSet?: string; strengthLabel?: string; entropyLabel?: string; bitsUnit?: string; poolLabel?: string; strengthVeryWeak?: string; strengthWeak?: string; strengthFair?: string; strengthStrong?: string; strengthVeryStrong?: string; honestTitle?: string; honestText?: string; privacyTitle?: string; privacyNote?: string; managerTitle?: string; managerText?: string;
  };
  dedupLines?: {
    badge?: string; caseSensitiveHint?: string; caseSensitiveLabel?: string; clearBtn?: string; copied?: string; copyBtn?: string; downloadBtn?: string; duplicatesRemoved?: string; emptyHint?: string; fileError?: string; honestText?: string; honestTitle?: string; ignoreBlankHint?: string; ignoreBlankLabel?: string; inputLabel?: string; optionsTitle?: string; outputEmptyHint?: string; outputLabel?: string; pageTitle?: string; placeholder?: string; privacyNote?: string; privacyTitle?: string; quickAnswer?: string; quickAnswerTitle?: string; sampleBtn?: string; sampleText?: string; sortHint?: string; sortLabel?: string; subtitle?: string; totalLines?: string; trimHint?: string; trimLabel?: string; uniqueLines?: string; uploadBtn?: string;
  };
  textRepeater?: {
    badge?: string; pageTitle?: string; subtitle?: string; quickAnswerTitle?: string; quickAnswer?: string; inputLabel?: string; placeholder?: string; sampleBtn?: string; sampleText?: string; countLabel?: string; countHint?: string; modeTitle?: string; modeWhole?: string; modeWholeHint?: string; modeWords?: string; modeWordsHint?: string; separatorTitle?: string; sepNone?: string; sepSpace?: string; sepNewline?: string; sepComma?: string; sepCustom?: string; customPlaceholder?: string; trailingLabel?: string; trailingHint?: string; outputLabel?: string; outputEmptyHint?: string; emptyHint?: string; statCopies?: string; statChars?: string; statWords?: string; statLines?: string; copyBtn?: string; copied?: string; downloadBtn?: string; clearBtn?: string; limitTitle?: string; limitText?: string; honestTitle?: string; honestText?: string; privacyTitle?: string; privacyNote?: string;
  };
  invisibleChar?: Record<string, any>;
  wordFrequency?: Record<string, any>;
  readingTime?: Record<string, any>;
  base64?: Record<string, any>;
  slugGen?: Record<string, any>;
  jsonFormatter?: Record<string, any>;
  loremIpsum?: Record<string, any>;
  daysBetween?: Record<string, any>;
  randomNumber?: Record<string, any>;
  onlineTimer?: Record<string, any>;
  imageResizer?: Record<string, any>;
  imageConverter?: Record<string, any>;
  imageToText?: Record<string, any>;
  pdfSplitter?: Record<string, any>;
  usernameGenerator?: Record<string, any>;
  morseCodeTranslator?: Record<string, any>;
  voiceRecorder?: Record<string, any>;
  onlineNotepad?: Record<string, any>;
  unitConverter?: Record<string, any>;
  onlineTeleprompter?: Record<string, any>;
  uuidGenerator?: Record<string, any>;
  timestampConverter?: Record<string, any>;
  jsonToCsv?: Record<string, any>;
  regexTester?: Record<string, any>;
  urlEncoder?: Record<string, any>;
  utmLinkBuilder?: Record<string, any>;
  metaChecker?: Record<string, any>;
  unitConverterUnits?: Record<string, string>;
  invoiceGenerator?: Record<string, any>;
  igBreaks?: Record<string, any>;
  charCounter?: Record<string, any>;
  pdfTools?: {
    badge?: string;
    title?: string;
  };
  expander?: {
    badge?: string; title?: string; desc?: string;
    sampleMedia?: string; sampleClimate?: string;
    inputTitle?: string; words?: string; placeholder?: string;
    depthLabel?: string; moderate?: string; moderateDesc?: string;
    extensive?: string; extensiveDesc?: string;
    scholarly?: string; scholarlyDesc?: string;
    outputTitle?: string; copy?: string; copied?: string;
    emptyOutput?: string; note?: string; sendHumanizer?: string;
  };
  seoTools?: {
    mainTitle?: string;
    generateBtn?: string;
    badge?: string;
    desc?: string;
    analyzing?: string;
    topicLabel?: string;
    geoLabel?: string;
    quickNiches?: string;
    previewTitle?: string;
    previewDesc?: string;
    formulating?: string;
    snippetPreview?: string;
    copyMeta?: string;
    copiedMeta?: string;
    keywordsTitle?: string;
    hashtagsTitle?: string;
    copyHashtags?: string;
    errorEmpty?: string;
    errorFailed?: string;
    analysisTitle?: string;
    analysisWords?: string;
    analysisKeyword?: string;
    analysisUsed?: string;
    analysisFirst100?: string;
    analysisYes?: string;
    analysisNo?: string;
    analysisReading?: string;
    analysisAvgSentence?: string;
    analysisWordsUnit?: string;
    analysisNoKeyword?: string;
    analysisHighDensity?: string;
    analysisLateKeyword?: string;
    analysisNote?: string;
    analysisHint?: string;
  };
  imageCompressor?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    dropTitle?: string;
    dropSubtitle?: string;
    qualityLabel?: string;
    formatLabel?: string;
    download?: string;
    processing?: string;
    original?: string;
    compressed?: string;
    saved?: string;
    smaller?: string;
    better?: string;
    private?: string;
    instant?: string;
    free?: string;
    quickAnswerTitle?: string;
    quickAnswer?: string;
    bigger?: string;
    biggerNote?: string;
  };
  detector?: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    inputPlaceholder: string;
    scanBtn: string;
    scanningBtn: string;
    samplesLabel: string;
    legendHuman: string;
    legendMixed: string;
    legendAi: string;
    sendToHumanizerBtn: string;
  };
  media?: {
    badge: string;
    title: string;
    subtitle: string;
    tabSeo: string;
    tabVideo: string;
    tabImage: string;
    uploadVideo?: string;
    downloadVideo?: string;
    uploadImage?: string;
    downloadImage?: string;
    noVideo?: string;
    readyDownload?: string;
    popular?: string;
  };
  seoTool?: {
    badge: string;
    title: string;
    subtitle: string;
    topicLabel: string;
    topicPlaceholder: string;
    generateBtn: string;
  };
  otherTools?: {
    heading?: string;
    subheading?: string;
    badge?: string;
    title?: string;
    subtitle?: string;
    launchBtn?: string;
    tools?: {
      humanizer: { title: string; subtitle: string; desc: string; bullets: string[] };
      detector: { title: string; subtitle: string; desc: string; bullets: string[] };
      media: { title: string; subtitle: string; desc: string; bullets: string[] };
      seo: { title: string; subtitle: string; desc: string; bullets: string[] };
    };
  };

}

export const SUPPORTED_LANGUAGES: {
  code: LanguageCode;
  label: string;
  flag: string;
  region: string;
}[] = [
  { code: "en", label: "English", flag: "🇺🇸", region: "US, UK, CA, AU" },
  { code: "es", label: "Español", flag: "🇪🇸", region: "España y Latinoamérica" },
  { code: "ur", label: "Urdu", flag: "🇵🇰", region: "Pakistan aur Junubi Asia" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", region: "Deutschland, Österreich, CH" },
  { code: "fr", label: "Français", flag: "🇫🇷", region: "France et Canada" },
  { code: "pt", label: "Português", flag: "🇧🇷", region: "Brasil e Portugal" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", region: "Türkiye ve Avrasya" },
  { code: "ja", label: "日本語", flag: "🇯🇵", region: "日本" },
  { code: "no", label: "Norsk", flag: "🇳🇴", region: "Norge" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", region: "Nederland en België" },
  { code: "it", label: "Italiano", flag: "🇮🇹", region: "Italia" },
  { code: "ru", label: "Русский", flag: "🇷🇺", region: "Россия и СНГ" },
  { code: "ur-pk", label: "اردو (نستعلیق)", flag: "🇵🇰", region: "Pakistan — اردو رسم الخط" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", region: "भारत" },
];

// F5 (2026-10-10): per-language dictionaries live in ./i18n/<lang>.ts and are
// code-split chunks. English stays in the entry bundle as the instant default
// and universal fallback; other languages load on demand (see App gate).
import { DICT as enDict } from "./i18n/en";

export const TRANSLATIONS = { en: enDict } as unknown as Record<
  LanguageCode,
  TranslationDict
> & { expander?: TranslationDict["expander"] };

// Legacy top-level section (never selected as a language) — preserved verbatim.
TRANSLATIONS.expander = {"badge":"Espansore Accademico di Frasi","title":"Espandi Frasi Brevi in Prosa Accademica","desc":"Allunga idee concise in paragrafi accademici rigorosi.","sampleMedia":"Esempio: Media","sampleClimate":"Esempio: Clima","inputTitle":"Frasi Brevi Originali","words":"parole","placeholder":"Scrivi frasi brevi qui...","depthLabel":"Scegli Profondità e Tono","moderate":"Moderato (2x)","moderateDesc":"Lunghezza equilibrata","extensive":"Esteso (3x)","extensiveDesc":"Profondità sistematica","scholarly":"Accademico (4x)","scholarlyDesc":"Tesi revisionata","outputTitle":"Prosa Accademica Espansa","copy":"Copia","copied":"Copiato!","emptyOutput":"Il testo espanso apparirà qui...","note":"Preserva il significato con variazione naturale.","sendHumanizer":"Invia a Humanizer"} as TranslationDict["expander"];

const DICT_LOADERS: Partial<
  Record<LanguageCode, () => Promise<{ DICT: TranslationDict }>>
> = {
  "es": () => import("./i18n/es"),
  "ur": () => import("./i18n/ur"),
  "de": () => import("./i18n/de"),
  "fr": () => import("./i18n/fr"),
  "pt": () => import("./i18n/pt"),
  "tr": () => import("./i18n/tr"),
  "ja": () => import("./i18n/ja"),
  "no": () => import("./i18n/no"),
  "nl": () => import("./i18n/nl"),
  "it": () => import("./i18n/it"),
  "ru": () => import("./i18n/ru"),
  "ur-pk": () => import("./i18n/ur-pk"),
  "hi": () => import("./i18n/hi"),
};

/** Load a language dictionary chunk into the registry (no-op when present). */
export async function ensureTranslations(lang: LanguageCode): Promise<void> {
  if (TRANSLATIONS[lang]) return;
  const loader = DICT_LOADERS[lang];
  if (!loader) return;
  const mod = await loader();
  (TRANSLATIONS as unknown as Record<string, unknown>)[lang] = mod.DICT;
}
