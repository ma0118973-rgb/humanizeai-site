import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  BarChart3, Check, Copy, Download, Eraser, FileText, Highlighter,
  Info, Search, ShieldCheck, Sparkles, Table2, Upload,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface WordFrequencyWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

interface TokenInfo {
  raw: string;
  lower: string;
  length: number;
  segment: number;
}

interface FrequencyEntry {
  key: string;
  entry: string;
  count: number;
  percent: number;
  firstIndex: number;
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", "ur-pk": "ur-PK", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb", ru: "ru", hi: "hi",
};

const STOP_WORDS: Record<LanguageCode, string[]> = {
  en: ["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "cannot", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "you", "your", "yours", "yourself", "yourselves", "don't", "didn't", "doesn't", "isn't", "aren't", "wasn't", "weren't", "won't", "wouldn't", "can't", "couldn't", "shouldn't"],
  es: ["el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "en", "y", "o", "u", "a", "con", "por", "para", "que", "es", "son", "se", "su", "sus", "al", "lo", "como", "más", "pero", "ya", "este", "esta", "esto", "estos", "estas", "ese", "esa", "eso", "mi", "mis", "tu", "tus", "me", "te", "nos", "les", "le", "él", "ella", "ellos", "ellas", "esto", "también", "muy", "cuando", "donde", "quien", "cual", "todo", "toda", "todos", "todas", "otro", "otra", "otros", "otras", "si", "no", "sí", "está", "están", "fue", "han", "he", "has", "hemos", "soy", "eres", "somos", "sois", "era", "eran"],
  ur: ["ka", "ki", "ke", "hai", "hain", "aur", "mein", "main", "se", "ko", "ne", "par", "liye", "ek", "ye", "yeh", "wo", "woh", "is", "us", "in", "un", "bhi", "nahi", "nahin", "tha", "thi", "the", "ho", "hota", "hoti", "hote", "hua", "hui", "kya", "jab", "tab", "kab", "jo", "to", "hi", "tak", "baad", "pehle", "agar", "lekin", "magar", "kyun", "kyunki", "apna", "apni", "apne", "mera", "meri", "mere", "tum", "aap", "hum", "unka", "unki", "unke", "iska", "iski", "iske", "koi", "kuch", "sab", "bahut", "zyada", "kam", "kar", "raha", "rahi", "rahe", "gaya", "gayi", "gaye", "hoga", "hogi", "hoge", "chahiye", "wala", "wali", "wale", "karta", "karti", "karte", "diya", "diyi", "liye", "liye", "liye"], "ur-pk": ["کا", "کی", "کے", "ہے", "ہیں", "اور", "میں", "سے", "کو", "نے", "پر", "کے لیے", "ایک", "یہ", "وہ", "اس", "اُس", "ان", "اُن", "بھی", "نہیں", "نہ", "تھا", "تھی", "تھے", "ہو", "ہوتا", "ہوتی", "ہوتے", "ہوا", "ہوئی", "ہوئے", "کیا", "جب", "تب", "کب", "جو", "تو", "ہی", "تک", "بعد", "پہلے", "اگر", "لیکن", "مگر", "کیوں", "کیونکہ", "اپنا", "اپنی", "اپنے", "میرا", "میری", "میرے", "تم", "آپ", "ہم", "اُن کا", "اِس کا", "کوئی", "کچھ", "سب", "بہت", "زیادہ", "کم", "کر", "رہا", "رہی", "رہے", "گیا", "گئی", "گئے", "ہوگا", "ہوگی", "چاہیے", "والا", "والی", "والے", "کرتا", "کرتی", "کرتے", "دیا", "لیے", "جیسے", "جیسا", "طرح", "ذریعے", "ساتھ", "بغیر", "لیے", "میں سے", "پر سے", "اب", "بھی", "پھر", "اور بھی", "وہی", "یہی", "اتنا", "اتنی", "جتنا", "ہر", "کوئی بھی", "کسی", "کس", "کن", "جن", "تن", "اپنے آپ", "خود"],
  de: ["der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem", "einer", "und", "oder", "aber", "in", "im", "am", "an", "auf", "aus", "bei", "mit", "nach", "seit", "von", "zu", "zum", "zur", "für", "durch", "ohne", "um", "ist", "sind", "war", "waren", "wird", "werden", "wurde", "nicht", "kein", "keine", "auch", "als", "wie", "so", "da", "dort", "hier", "ich", "du", "er", "sie", "es", "wir", "ihr", "mein", "meine", "dein", "seine", "ihre", "unser", "euer", "dieser", "diese", "dieses", "jeder", "jede", "jedes", "alle", "man", "sich", "nur", "noch", "schon", "sehr", "mehr", "wenn", "weil", "dass", "ob", "was", "wer", "wen", "wem", "wo", "wann", "warum", "wie"],
  fr: ["le", "la", "les", "un", "une", "des", "de", "du", "au", "aux", "en", "dans", "sur", "sous", "chez", "pour", "par", "avec", "sans", "et", "ou", "mais", "donc", "car", "que", "qui", "quoi", "dont", "où", "est", "sont", "suis", "es", "sommes", "êtes", "ont", "ai", "as", "a", "avons", "avez", "ce", "cet", "cette", "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs", "je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "me", "te", "se", "lui", "y", "ne", "pas", "plus", "moins", "très", "aussi", "comme", "quand", "si", "tout", "tous", "toute", "toutes", "même", "être", "avoir", "fait", "faire"],
  tr: ["ve", "veya", "ama", "fakat", "çünkü", "için", "gibi", "kadar", "sonra", "önce", "de", "da", "ki", "mi", "mı", "mu", "mü", "bir", "bu", "şu", "o", "ne", "nasıl", "neden", "niçin", "kim", "kime", "kimi", "hangi", "kaç", "her", "hiç", "çok", "daha", "en", "az", "hem", "ya", "ise", "ile", "idi", "imiş", "olan", "olarak", "üzere", "rağmen", "dolayı", "beri", "doğru", "karşı", "ait", "var", "yok", "ben", "sen", "biz", "siz", "onlar", "benim", "senin", "onun", "bizim", "sizin", "onların", "bana", "sana", "ona", "bizi", "sizi", "onları", "kendi", "kendini", "şey", "şeyler", "böyle", "şöyle", "öyle", "şimdi", "bugün", "dün", "yarın"],
  pt: ["o", "a", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas", "por", "pelo", "pela", "pelos", "pelas", "para", "com", "sem", "sob", "sobre", "entre", "e", "ou", "mas", "que", "se", "como", "mais", "menos", "muito", "já", "não", "ao", "aos", "à", "às", "é", "são", "foi", "foram", "ser", "estar", "eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas", "me", "te", "lhe", "nos", "vos", "lhes", "meu", "minha", "meus", "minhas", "teu", "tua", "seu", "sua", "seus", "suas", "este", "esta", "isto", "esse", "essa", "isso", "aquele", "aquela", "aquilo", "quem", "qual", "quais", "onde", "quando", "porque", "porquê", "também", "só", "apenas", "cada", "todo", "toda", "todos", "todas", "outro", "outra"],
  ja: ["は", "が", "を", "に", "へ", "と", "で", "から", "まで", "より", "の", "も", "や", "か", "ね", "よ", "な", "だ", "である", "です", "ます", "た", "て", "いる", "ある", "する", "なる", "れる", "られる", "せる", "させる", "ない", "ぬ", "ん", "こと", "もの", "ため", "これ", "それ", "あれ", "この", "その", "あの", "私", "あなた", "彼", "彼女", "誰", "何", "ここ", "そこ", "あそこ", "今", "また", "もう", "まだ", "とても", "非常に", "しかし", "だから", "そして", "それから", "例えば", "つまり", "もちろん", "場合", "時", "所", "人", "年", "日"],
  it: ["il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "di", "a", "da", "in", "con", "su", "per", "tra", "fra", "e", "o", "ma", "che", "non", "si", "più", "anche", "come", "dove", "quando", "perché", "chi", "cosa", "quale", "quanto", "questo", "questa", "questi", "queste", "quello", "quella", "quelli", "quelle", "io", "tu", "lui", "lei", "noi", "voi", "loro", "mi", "ti", "ci", "vi", "li", "ne", "è", "sono", "era", "erano", "sei", "siamo", "siete", "ho", "hai", "ha", "abbiamo", "avete", "hanno", "essere", "avere", "del", "dello", "della", "dei", "degli", "delle", "nel", "nello", "nella", "nei", "negli", "nelle", "al", "allo", "alla", "ai", "agli", "alle", "dal", "dallo", "dalla", "dai", "dagli", "dalle", "sul", "sullo", "sulla", "sui", "sugli", "sulle"],
  nl: ["de", "het", "een", "en", "of", "maar", "want", "in", "op", "aan", "bij", "met", "zonder", "voor", "na", "naar", "van", "tot", "door", "over", "onder", "tussen", "ik", "jij", "je", "u", "hij", "zij", "wij", "we", "jullie", "me", "mij", "jou", "hem", "haar", "ons", "hen", "hun", "zich", "mijn", "jouw", "uw", "zijn", "ons", "onze", "hun", "dit", "deze", "dat", "die", "wie", "wat", "waar", "wanneer", "waarom", "hoe", "welke", "welk", "alle", "alles", "iedereen", "iemand", "niemand", "iets", "niets", "is", "zijn", "was", "waren", "heb", "hebt", "heeft", "hebben", "had", "hadden", "zal", "zullen", "zou", "zouden", "kan", "kunnen", "kon", "konden", "moet", "moeten", "mocht", "mogen", "niet", "geen", "ook", "nog", "al", "wel", "als", "dan", "toen", "nu", "hier", "daar", "er", "zo", "zeer", "veel", "meer", "minder", "elke", "elk", "andere", "ander", "zelf"],
  ru: ["и", "в", "на", "с", "по", "к", "у", "о", "об", "от", "до", "из", "за", "для", "не", "что", "это", "как", "а", "но", "он", "она", "оно", "они", "мы", "вы", "я", "ты", "быть", "был", "была", "было", "были", "есть", "нет", "же", "ли", "бы", "то", "все", "всё", "так", "уже", "ещё", "только", "когда", "где", "кто", "этот", "эта", "эти", "тот", "та", "те", "мой", "моя", "мои", "свой", "своя", "свои", "наш", "ваш", "их", "его", "её", "мне", "мне", "ему", "ей", "нам", "вам", "им", "меня", "тебя", "его", "нас", "вас", "при", "про", "над", "под", "без", "через", "после", "перед", "между", "или", "если", "потому", "поэтому", "г", "в", "на"],
  no: ["og", "eller", "men", "for", "fordi", "om", "at", "som", "i", "på", "til", "av", "fra", "med", "uten", "over", "under", "mellom", "hos", "mot", "gjennom", "etter", "før", "en", "et", "ei", "den", "det", "de", "denne", "dette", "disse", "jeg", "du", "han", "hun", "vi", "dere", "meg", "deg", "ham", "henne", "oss", "dem", "seg", "min", "mitt", "mine", "din", "ditt", "dine", "sin", "sitt", "sine", "vår", "vårt", "våre", "deres", "hans", "hennes", "hvem", "hva", "hvor", "når", "hvorfor", "hvordan", "hvilken", "hvilket", "hvilke", "er", "var", "har", "hadde", "skal", "skulle", "vil", "ville", "kan", "kunne", "må", "måtte", "bør", "burde", "ikke", "ingen", "noen", "noe", "alle", "alt", "hver", "hvert", "annen", "annet", "andre", "selv", "også", "bare", "ennå", "allerede", "nå", "da", "her", "der", "så", "slik", "både", "enten", "man"],
  hi: ["का", "की", "के", "है", "हैं", "और", "में", "से", "को", "ने", "पर", "एक", "यह", "वह", "ये", "वे", "इस", "उस", "इन", "उन", "जो", "तो", "भी", "ही", "नहीं", "न", "था", "थी", "थे", "हो", "होता", "होती", "होते", "हुआ", "हुई", "हुए", "क्या", "कब", "कहाँ", "कैसे", "क्यों", "क्योंकि", "जब", "तब", "तक", "बाद", "पहले", "अगर", "लेकिन", "मगर", "अपना", "अपनी", "अपने", "मेरा", "मेरी", "मेरे", "तुम", "आप", "हम", "मैं", "मुझे", "उनका", "इसका", "कोई", "कुछ", "सब", "बहुत", "कम", "कर", "रहा", "रही", "रहे", "गया", "गई", "गए", "होगा", "होगी", "चाहिए", "वाला", "वाली", "वाले", "करता", "करती", "करते", "दिया", "लिए", "जैसे", "तरह", "द्वारा", "साथ", "बिना", "अब", "फिर", "वही", "यही", "इतना", "हर", "किसी", "खुद", "तथा", "एवं", "अथवा", "या", "इसलिए", "अतः", "अर्थात्", "यानी", "जबकि", "जहाँ", "यहाँ", "वहाँ", "किधर", "जिधर", "उधर", "इधर", "कभी", "हमेशा", "अक्सर", "शायद", "ज़रूर", "बिल्कुल", "अंदर", "बाहर", "ऊपर", "नीचे", "सामने", "पीछे", "बीच", "ओर", "तरफ़", "दौरान", "बावजूद", "सिवाय", "अलावा", "बल्कि", "फिरभी", "तभी", "कभी-कभी"]
};

function textLength(text: string): number {
  return Array.from(text).length;
}

function tokenize(text: string, locale: string): TokenInfo[] {
  const tokens: TokenInfo[] = [];
  let segment = 0;
  let boundaryPending = false;
  const push = (raw: string) => {
    if (boundaryPending && tokens.length) segment++;
    boundaryPending = false;
    tokens.push({
      raw,
      lower: raw.replace(/’/g, "'").toLocaleLowerCase(locale),
      length: textLength(raw),
      segment,
    });
  };

  try {
    const Segmenter = (Intl as any).Segmenter;
    if (Segmenter) {
      const segmenter = new Segmenter(locale, { granularity: "word" });
      for (const part of Array.from(segmenter.segment(text)) as any[]) {
        const value = String(part.segment || "");
        if (part.isWordLike) {
          push(value);
        } else if (/[.!?。！？\n]/u.test(value)) {
          boundaryPending = true;
        }
      }
      return tokens;
    }
  } catch {
    // Fall through to the regex tokenizer.
  }

  const regex = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;
  let lastEnd = 0;
  for (const match of text.matchAll(regex)) {
    const between = text.slice(lastEnd, match.index || 0);
    if (tokens.length && /[.!?。！？\n]/u.test(between)) segment++;
    push(match[0]);
    lastEnd = (match.index || 0) + match[0].length;
  }
  return tokens;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function WordFrequencyWorkspace({ selectedLanguage = "en" }: WordFrequencyWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const wf = (t as any).wordFrequency || {};
  const locale = LOCALES[selectedLanguage] || "en";
  const stopWords = useMemo(
    () => new Set((STOP_WORDS[selectedLanguage] || STOP_WORDS.en).map((w) => w.toLocaleLowerCase(locale))),
    [selectedLanguage, locale]
  );

  const [text, setText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [ignoreStopWords, setIgnoreStopWords] = useState(false);
  const [minLength, setMinLength] = useState(1);
  const [minCount, setMinCount] = useState(1);
  const [phraseSize, setPhraseSize] = useState<1 | 2 | 3>(1);
  const [sortMode, setSortMode] = useState("frequency");
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const analysis = useMemo(() => {
    const tokens = tokenize(text, locale);
    const totalWords = tokens.length;
    const eligibleTokens = tokens.filter(
      (token) => token.length >= minLength && !(ignoreStopWords && stopWords.has(token.lower))
    );
    const filteredOut = totalWords - eligibleTokens.length;
    const groups = new Map<string, FrequencyEntry>();
    let analyzedTotal = 0;

    const addGroup = (parts: TokenInfo[], firstIndex: number) => {
      const displayParts = parts.map((part) => (caseSensitive ? part.raw : part.lower));
      const entry = displayParts.join(" ");
      const key = entry;
      const existing = groups.get(key);
      if (existing) existing.count++;
      else groups.set(key, { key, entry, count: 1, percent: 0, firstIndex });
    };

    if (phraseSize === 1) {
      analyzedTotal = eligibleTokens.length;
      eligibleTokens.forEach((token, index) => addGroup([token], index));
    } else {
      for (let i = 0; i <= tokens.length - phraseSize; i++) {
        const parts = tokens.slice(i, i + phraseSize);
        if (parts.some((part) => part.segment !== parts[0].segment)) continue;
        if (parts.some((part) => part.length < minLength)) continue;
        if (ignoreStopWords && parts.some((part) => stopWords.has(part.lower))) continue;
        analyzedTotal++;
        addGroup(parts, i);
      }
    }

    const entries = Array.from(groups.values()).map((entry) => ({
      ...entry,
      percent: analyzedTotal ? (entry.count / analyzedTotal) * 100 : 0,
    }));
    entries.sort((a, b) => b.count - a.count || a.firstIndex - b.firstIndex);

    return {
      totalWords,
      analyzedTotal,
      filteredOut,
      entries,
      uniqueEntries: entries.length,
      typeTokenRatio: analyzedTotal ? entries.length / analyzedTotal : 0,
    };
  }, [text, locale, minLength, ignoreStopWords, stopWords, phraseSize, caseSensitive]);

  const visibleEntries = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    const filtered = analysis.entries.filter(
      (entry) => entry.count >= minCount && (!q || entry.entry.toLocaleLowerCase(locale).includes(q))
    );
    const sorted = [...filtered];
    if (sortMode === "alphaAsc") sorted.sort((a, b) => a.entry.localeCompare(b.entry, locale));
    else if (sortMode === "alphaDesc") sorted.sort((a, b) => b.entry.localeCompare(a.entry, locale));
    else if (sortMode === "original") sorted.sort((a, b) => a.firstIndex - b.firstIndex);
    else sorted.sort((a, b) => b.count - a.count || a.firstIndex - b.firstIndex);
    return sorted;
  }, [analysis.entries, minCount, query, sortMode, locale]);

  const displayedEntries = visibleEntries.slice(0, 500);
  const selectedEntry = analysis.entries.find((entry) => entry.key === selectedKey) || null;
  const topCount = displayedEntries.length ? displayedEntries[0].count : 0;

  const tableText = [
    `${wf.entryColumn || "Word / phrase"}\t${wf.countColumn || "Count"}\t${wf.percentColumn || "% of analyzed total"}`,
    ...visibleEntries.map((entry) => `${entry.entry}\t${entry.count}\t${entry.percent.toFixed(2)}%`),
  ].join("\n");

  const handleCopyTable = async () => {
    if (!visibleEntries.length) return;
    try {
      await navigator.clipboard.writeText(tableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const handleDownloadCsv = () => {
    if (!visibleEntries.length) return;
    const csv = [
      `${csvCell(wf.entryColumn || "Word / phrase")},${csvCell(wf.countColumn || "Count")},${csvCell(wf.percentColumn || "% of analyzed total")}`,
      ...visibleEntries.map((entry) => `${csvCell(entry.entry)},${entry.count},${entry.percent.toFixed(2)}`),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word-frequency.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileError("");
    if (file.size > 5 * 1024 * 1024) {
      setFileError(wf.fileError || "That file could not be read as text. Try a plain .txt file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setText(typeof reader.result === "string" ? reader.result : "");
      setSelectedKey("");
    };
    reader.onerror = () => setFileError(wf.fileError || "That file could not be read as text. Try a plain .txt file.");
    reader.readAsText(file);
  };

  const highlightedPreview = useMemo(() => {
    if (!selectedEntry || !text) return null;
    const parts = selectedEntry.entry.split(" ");
    const pattern = parts.map((part) => escapeRegex(part)).join("[^\\p{L}\\p{N}]+");
    const flags = caseSensitive ? "gu" : "giu";
    let regex: RegExp;
    try {
      regex = new RegExp(`(?<![\\p{L}\\p{N}])${pattern}(?![\\p{L}\\p{N}])`, flags);
    } catch {
      regex = new RegExp(escapeRegex(selectedEntry.entry), flags);
    }
    const nodes: React.ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    let index = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) nodes.push(text.slice(last, match.index));
      nodes.push(
        <mark key={index++} className="bg-indigo-200 text-indigo-950 rounded px-0.5 font-semibold">
          {match[0]}
        </mark>
      );
      last = match.index + match[0].length;
      if (match[0].length === 0) regex.lastIndex++;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
  }, [selectedEntry, text, caseSensitive]);

  const statCards = [
    { label: wf.totalWords || "Total words", value: analysis.totalWords },
    { label: wf.analyzedTokens || "Analyzed total", value: analysis.analyzedTotal },
    { label: wf.uniqueEntries || "Unique entries", value: analysis.uniqueEntries },
    { label: wf.filteredOut || "Filtered out", value: analysis.filteredOut },
    { label: wf.typeTokenRatio || "Vocabulary variety", value: analysis.typeTokenRatio ? analysis.typeTokenRatio.toFixed(2) : "0" },
  ];

  const phraseOptions = [
    { value: 1 as const, label: wf.phrase1 || "1 word" },
    { value: 2 as const, label: wf.phrase2 || "2 words" },
    { value: 3 as const, label: wf.phrase3 || "3 words" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="wordFrequency" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-0 opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white self-start shadow-sm">
            <BarChart3 className="w-3.5 h-3.5" /> {wf.badge || "Word Frequency Counter"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {wf.pageTitle || "See Which Words and Phrases Repeat Most"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {wf.subtitle || "Paste or open text and get a ranked frequency table with counts and percentages. Change the rules and the table updates at once — everything happens in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-indigo-950">{wf.quickAnswerTitle || "Quick Answer: What Does This Tool Show?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{wf.quickAnswer}</p>
          </div>
        </div>
      </div>

      {selectedLanguage === "ja" && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{wf.japaneseNote}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setText(wf.sampleText || ""); setSelectedKey(""); setFileError(""); }} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            {wf.sampleBtn || "Try a sample"}
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            <Upload className="w-4 h-4" /> {wf.uploadBtn || "Open .txt"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv,text/plain"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button onClick={handleCopyTable} disabled={!visibleEntries.length} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (wf.copied || "Copied!") : (wf.copyTableBtn || "Copy table")}
          </button>
          <button onClick={handleDownloadCsv} disabled={!visibleEntries.length} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
            <Download className="w-4 h-4" /> {wf.downloadCsvBtn || "Download CSV"}
          </button>
          <button onClick={() => { setText(""); setSelectedKey(""); setFileError(""); }} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {wf.clearBtn || "Clear"}
          </button>
        </div>

        {fileError && (
          <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">{fileError}</p>
        )}

        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Table2 className="w-4 h-4 text-indigo-600" /> {wf.optionsTitle || "Counting rules"}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition ${caseSensitive ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-indigo-300"}`}>
              <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="mt-0.5 w-4 h-4 cursor-pointer accent-white" />
              <span>
                <span className="block text-xs font-bold">{wf.caseSensitiveLabel || "Case-sensitive"}</span>
                <span className={`block text-[11px] leading-relaxed ${caseSensitive ? "text-indigo-50" : "text-stone-500"}`}>{wf.caseSensitiveHint}</span>
              </span>
            </label>
            <label className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition ${ignoreStopWords ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-indigo-300"}`}>
              <input type="checkbox" checked={ignoreStopWords} onChange={(e) => setIgnoreStopWords(e.target.checked)} className="mt-0.5 w-4 h-4 cursor-pointer accent-white" />
              <span>
                <span className="block text-xs font-bold">{wf.ignoreStopWordsLabel || "Ignore common stop words"}</span>
                <span className={`block text-[11px] leading-relaxed ${ignoreStopWords ? "text-indigo-50" : "text-stone-500"}`}>{wf.ignoreStopWordsHint}</span>
              </span>
            </label>
          </div>
          <p className="mt-2 text-[11px] text-stone-500 leading-relaxed">{wf.stopListNote}</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <label className="block">
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">{wf.minLengthLabel || "Minimum word length"}</span>
              <input type="number" min={1} max={20} value={minLength} onChange={(e) => setMinLength(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-indigo-500" />
            </label>
            <label className="block">
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">{wf.minCountLabel || "Minimum count"}</span>
              <input type="number" min={1} max={9999} value={minCount} onChange={(e) => setMinCount(Math.max(1, Number(e.target.value) || 1))} className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-indigo-500" />
            </label>
            <div>
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">{wf.phraseSizeLabel || "Count"}</span>
              <div className="grid grid-cols-3 gap-1">
                {phraseOptions.map((option) => (
                  <button key={option.value} onClick={() => setPhraseSize(option.value)} className={`px-2 py-2 rounded-xl text-xs font-bold cursor-pointer ${phraseSize === option.value ? "bg-indigo-600 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">{wf.sortLabel || "Sort table"}</span>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:border-indigo-500">
                <option value="frequency">{wf.sortFrequency || "Highest frequency"}</option>
                <option value="alphaAsc">{wf.sortAlphaAsc || "A–Z"}</option>
                <option value="alphaDesc">{wf.sortAlphaDesc || "Z–A"}</option>
                <option value="original">{wf.sortOriginal || "Original order"}</option>
              </select>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="word-frequency-input">
            {wf.inputLabel || "Your text"}
          </label>
          <textarea
            id="word-frequency-input"
            value={text}
            onChange={(e) => { setText(e.target.value); setSelectedKey(""); }}
            placeholder={wf.placeholder || "Paste or type your text here — the frequency table updates as you write."}
            className="w-full h-64 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" aria-live="polite">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{card.label}</div>
              <div className="text-2xl font-extrabold text-stone-900 mt-0.5">{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> {wf.tableTitle || "Ranked frequency table"}
          </h2>
          <label className="relative block sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <span className="sr-only">{wf.searchLabel || "Search the table"}</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={wf.searchPlaceholder || "Search words or phrases"} className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-indigo-500" />
          </label>
        </div>

        {text.trim() ? (
          displayedEntries.length ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="bg-indigo-50 text-indigo-950">
                    <tr>
                      <th className="text-left font-extrabold px-4 py-3 w-12">#</th>
                      <th className="text-left font-extrabold px-4 py-3">{wf.entryColumn || "Word / phrase"}</th>
                      <th className="text-right font-extrabold px-4 py-3 w-28">{wf.countColumn || "Count"}</th>
                      <th className="text-right font-extrabold px-4 py-3 w-36">{wf.percentColumn || "% of analyzed total"}</th>
                      <th className="text-left font-extrabold px-4 py-3 w-40 hidden md:table-cell">{wf.percentColumn || "%"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedEntries.map((entry, index) => {
                      const isSelected = selectedKey === entry.key;
                      return (
                        <tr
                          key={entry.key}
                          onClick={() => setSelectedKey(entry.key)}
                          className={`border-t border-stone-100 cursor-pointer transition ${isSelected ? "bg-indigo-100/80" : "hover:bg-indigo-50/60"}`}
                          title={entry.entry}
                        >
                          <td className="px-4 py-2.5 text-stone-400 font-mono text-xs">{index + 1}</td>
                          <td className="px-4 py-2.5 font-bold text-stone-800 break-words">{entry.entry}</td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-stone-900">{entry.count}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-stone-700">{entry.percent.toFixed(2)}%</td>
                          <td className="px-4 py-2.5 hidden md:table-cell">
                            <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${topCount ? (entry.count / topCount) * 100 : 0}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 leading-relaxed">
                {wf.showing || "Showing"} {displayedEntries.length} {wf.ofLabel || "of"} {visibleEntries.length}. {wf.tableFooterNote}
              </p>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
              <p className="font-bold text-stone-800">{wf.noMatches || "No entries match those rules"}</p>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">{wf.emptyText}</p>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
            <p className="font-bold text-stone-800">{wf.emptyTitle || "Your ranked table will appear here"}</p>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">{wf.emptyText}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Highlighter className="w-4 h-4 text-indigo-600" /> {wf.selectedTitle || "Find it in your text"}</h3>
          {selectedEntry ? (
            <div className="space-y-2">
              <p className="text-sm font-extrabold text-indigo-950 break-words">{selectedEntry.entry}</p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {wf.occurrencesLabel || "Occurrences"}: <strong className="text-stone-900">{selectedEntry.count}</strong> • {selectedEntry.percent.toFixed(2)}%
              </p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{wf.selectedEmpty || "Click any row in the table and its matches will be highlighted below."}</p>
          )}
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-indigo-600" /> {wf.methodTitle || "How this counter counts"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{wf.methodText}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-indigo-600" /> {wf.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{wf.privacyNote}</p>
        </div>
      </div>

      {selectedEntry && text && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-indigo-600" /> {wf.previewTitle || "Highlighted source preview"}
          </h3>
          <div className="max-h-80 overflow-auto rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-sm leading-relaxed text-stone-700 whitespace-pre-wrap break-words">
            {highlightedPreview}
          </div>
        </div>
      )}

      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-5">
        <h3 className="font-bold text-indigo-950 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-indigo-600" /> {wf.honestTitle || "A diagnostic, not a ranking formula"}</h3>
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{wf.honestText}</p>
        <a href={`/${selectedLanguage}/word-counter/`} className="inline-block mt-3 text-xs font-bold text-indigo-700 hover:text-indigo-900 underline underline-offset-2">
          {wf.wordCounterLink || "Need total words, sentences or reading time instead? Open the Word Counter →"}
        </a>
      </div>

      <ToolGuideSection toolId="wordFrequency" selectedLanguage={selectedLanguage} />
    </div>
  );
}
