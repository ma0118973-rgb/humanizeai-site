import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Gauge, Info, Keyboard, RefreshCw, ShieldCheck,
  Shuffle, Target, Timer, Trophy,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface TypingTestWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Mode = "30s" | "60s" | "25" | "50";

const ALL_LANGS: LanguageCode[] = ["en", "es", "ur", "de", "fr", "tr", "pt", "ja", "no", "nl", "it"];

const LANG_NAMES: Record<LanguageCode, string> = {
  en: "English",
  es: "Español",
  ur: "Roman Urdu",
  de: "Deutsch",
  fr: "Français",
  tr: "Türkçe",
  pt: "Português",
  ja: "日本語",
  no: "Norsk",
  nl: "Nederlands",
  it: "Italiano",
};

// Original practice passages written for this tool (3 per language).
// Kept simple on purpose: everyday sentences, commas and full stops only.
const PASSAGES: Record<LanguageCode, string[]> = {
  en: [
    "The morning market opens early, and the first customers arrive while the stalls are still being set up. Fresh bread, ripe fruit, and bunches of herbs fill the tables, and the sellers call out their prices with practiced cheer. By nine the lanes are busy, and the smell of coffee drifts from the small cafe on the corner.",
    "Learning a new skill takes patience, and typing is no different. At first your fingers feel slow and clumsy, and every word needs your full attention. After a few weeks of short daily practice, the keys begin to feel familiar, and your hands start to move before you have finished thinking about the letters.",
    "A good library is a quiet kind of treasure. Students spread their books across the long tables, laptops hum softly, and the tall windows let in the afternoon light. Some people come to study for exams, others to read the newspaper, and a few simply enjoy the calm before going home.",
  ],
  es: [
    "El mercado del barrio abre muy temprano, cuando las calles todavía están tranquilas. Los vendedores colocan las cajas de fruta, el panadero saca el pan caliente del horno y el olor llega hasta la esquina. Poco a poco llegan los vecinos con sus bolsas, saludan, comparan precios y eligen con calma lo que necesitan para la semana.",
    "Aprender a escribir rápido en el teclado es cuestión de práctica constante. Al principio los dedos se equivocan, las tildes se olvidan y las palabras salen torcidas. Con unos minutos cada día, las manos aprenden el camino solas y la vista puede quedarse en la pantalla en lugar de buscar cada tecla.",
    "La biblioteca del pueblo es un lugar tranquilo donde cada uno encuentra su rincón. Los estudiantes preparan exámenes con los libros abiertos, una señora lee el periódico junto a la ventana y los niños buscan cuentos en la sala pequeña. Cuando cae la tarde, el silencio se hace más profundo y cuesta marcharse.",
  ],
  ur: [
    "Subah ka bazaar bohat jaldi khul jata hai, jab galiyan abhi khaamosh hoti hain. Dukandaar apni dukaan sajata hai, naan wala tandoor se garam naan nikaalta hai aur khushboo poori gali mein phail jati hai. Thori dair mein log ana shuru ho jate hain, koi sabzi leta hai, koi phal, aur sab hasb e mamool apna kaam karte rehte hain.",
    "Keyboard par tez likhna ek hunar hai jo roz ki mashq se aata hai. Pehle pehle ungliyan slow hoti hain aur har lafz par ghalti hoti hai, lekin pareshan hone ki zaroorat nahi. Roz sirf das minute ki mashq se haathon ko key ka rasta yaad ho jata hai, phir aap screen par dekh kar likhte hain, keyboard par nahi.",
    "Mera dost Ali roz shaam ko park mein sair ke liye jata hai. Wahan wo purane doston se milta hai, chai peeta hai aur din bhar ki baatein sunata hai. Us ka kehna hai ke sair se badan bhi halka hota hai aur mind bhi fresh ho jata hai, is liye wo chaahe kitna bhi busy ho, ye adha ghanta nahi chhorta.",
  ],
  de: [
    "Der kleine Markt in unserer Straße öffnet früh am Morgen, wenn die Stadt noch ruhig ist. Die Händler bauen ihre Stände auf, der Bäcker holt das warme Brot aus dem Ofen und der Duft zieht bis zur Ecke. Nach und nach kommen die Nachbarn mit ihren Taschen, grüßen freundlich und wählen in Ruhe aus, was sie für die Woche brauchen.",
    "Schnell und sicher zu tippen lernt man nicht an einem Tag. Am Anfang sind die Finger langsam, die Umlaute fehlen und manche Wörter kommen verdreht heraus. Wer jeden Tag ein paar Minuten übt, merkt bald den Unterschied: Die Hände finden die Tasten allein und der Blick bleibt auf dem Bildschirm, wo er hingehört.",
    "Unsere Stadtbibliothek ist ein ruhiger Ort mit langen Tischen und hohen Fenstern. Studenten lernen hier für ihre Prüfungen, eine ältere Dame liest die Zeitung und Kinder suchen nach spannenden Geschichten. Am späten Nachmittag wird es still im Lesesaal, und man möchte am liebsten noch ein wenig bleiben.",
  ],
  fr: [
    "Le petit marché de notre quartier ouvre tôt le matin, quand les rues sont encore calmes. Les marchands installent leurs étals, le boulanger sort le pain chaud du four et la bonne odeur arrive jusqu'au coin de la rue. Peu à peu, les voisins arrivent avec leurs sacs, disent bonjour et choisissent tranquillement ce qu'il faut pour la semaine.",
    "Apprendre à taper vite et juste demande de la patience. Au début, les doigts hésitent, les accents disparaissent et les mots sortent parfois de travers. Avec quelques minutes d'exercice chaque jour, les mains apprennent le chemin toutes seules et le regard reste sur l'écran au lieu de chercher chaque touche du clavier.",
    "La bibliothèque de la ville est un endroit paisible, avec de longues tables et de grandes fenêtres. Les étudiants préparent leurs examens, une dame lit le journal près de la fenêtre et les enfants cherchent des histoires dans la petite salle. Quand le soir arrive, le silence devient plus profond et l'on peine à partir.",
  ],
  tr: [
    "Mahallemizdeki küçük pazar sabah erken saatlerde, sokaklar henüz sakinken açılır. Satıcılar tezgahlarını kurar, fırıncı sıcak ekmeği fırından çıkarır ve kokusu sokağın köşesine kadar ulaşır. Biraz sonra komşular çantalarıyla gelir, selamlaşır, fiyatlara bakar ve hafta için gerekenleri sakin sakin seçer.",
    "Klavyede hızlı ve doğru yazmak bir günde öğrenilmez. Başlangıçta parmaklar yavaşlar, ı ile i karışır ve bazı kelimeler yanlış çıkar. Her gün birkaç dakika çalışan kişi farkı kısa sürede görür: eller tuşları kendiliğinden bulur ve gözler klavyede değil ekranda kalır, olması gerektiği gibi.",
    "Şehir kütüphanesi uzun masaları ve yüksek pencereleriyle sakin bir yerdir. Öğrenciler sınavlarına burada çalışır, yaşlı bir kadın pencere kenarında gazetesini okur ve çocuklar küçük salonda hikaye kitapları arar. Akşam olunca okuma salonu iyice sessizleşir ve insan biraz daha kalmak ister.",
  ],
  pt: [
    "O pequeno mercado do nosso bairro abre cedo, quando as ruas ainda estão calmas. Os vendedores montam as bancas, o padeiro tira o pão quente do forno e o cheiro chega até à esquina. Pouco a pouco, os vizinhos chegam com os sacos, cumprimentam toda a gente e escolhem com calma o que precisam para a semana.",
    "Aprender a digitar rápido e bem leva tempo e paciência. No início, os dedos hesitam, os acentos fogem e algumas palavras saem trocadas. Com alguns minutos de treino todos os dias, as mãos aprendem o caminho sozinhas e o olhar fica no ecrã, em vez de procurar cada tecla do teclado.",
    "A biblioteca da cidade é um lugar tranquilo, com mesas compridas e janelas altas. Os estudantes preparam os exames, uma senhora lê o jornal junto à janela e as crianças procuram histórias na salinha. Quando a tarde cai, o silêncio fica mais fundo e custa ir embora.",
  ],
  ja: [
    "私たちの町の小さな市場は、通りがまだ静かな朝早くに開きます。店の人たちが店先を整え、パン屋が焼きたてのパンを出すと、良い香りが通りの角まで届きます。やがて近所の人たちが袋を持ってやって来て、あいさつをしながら、一週間に必要なものをゆっくり選んでいきます。",
    "キーボードで速く正確に打てるようになるには、毎日の短い練習が大切です。はじめのうちは指がもたつき、変換を間違えたり、文字を打ち直したりすることがよくあります。けれども毎日少しずつ続けるうちに、手がキーの場所を覚えて、画面から目を離さずに打てるようになります。",
    "町の図書館は、長い机と大きな窓のある静かな場所です。学生たちは試験の勉強をし、年配の女性は窓のそばで新聞を読み、子どもたちは小さい部屋で物語の本を探します。夕方になると閲覧室はいっそう静かになり、もう少しここにいたい気持ちになります。",
  ],
  no: [
    "Det lille markedet i gata vår åpner tidlig om morgenen, mens byen ennå er stille. Selgerne setter opp bodene sine, bakeren tar det varme brødet ut av ovnen, og lukten når helt bort til hjørnet. Etter hvert kommer naboene med veskene sine, hilser vennlig og velger i ro og mak det de trenger for uken.",
    "Å lære å skrive fort og riktig på tastaturet tar tid. I begynnelsen er fingrene trege, æ, ø og å forsvinner, og noen ord kommer ut bakvendt. Den som øver noen minutter hver dag, merker snart forskjellen: hendene finner tastene av seg selv, og blikket blir på skjermen i stedet for å lete etter hver tast.",
    "Biblioteket i byen er et rolig sted med lange bord og høye vinduer. Studentene leser til prøvene sine her, en eldre dame leser avisen ved vinduet, og barna leter etter spennende historier. Sent på ettermiddagen blir det helt stille i lesesalen, og man får lyst til å bli litt lenger.",
  ],
  nl: [
    "De kleine markt in onze straat gaat vroeg in de ochtend open, als de stad nog stil is. De verkopers zetten hun kramen op, de bakker haalt het warme brood uit de oven en de geur trekt tot aan de hoek. Langzaam komen de buren met hun tassen, groeten elkaar vriendelijk en kiezen rustig uit wat ze voor de week nodig hebben.",
    "Snel en foutloos typen leer je niet in één dag. In het begin zijn je vingers traag, verdwijnen de klinkers en komen sommige woorden verkeerd op het scherm. Wie elke dag een paar minuten oefent, merkt al snel verschil: de handen vinden de toetsen vanzelf en je blik blijft op het scherm, waar hij hoort.",
    "De bibliotheek van de stad is een rustige plek met lange tafels en hoge ramen. Studenten leren hier voor hun examens, een oudere dame leest de krant bij het raam en kinderen zoeken naar spannende verhalen. Laat in de middag wordt het stil in de leeszaal en wil je het liefst nog even blijven.",
  ],
  it: [
    "Il piccolo mercato del nostro quartiere apre presto la mattina, quando le strade sono ancora tranquille. I venditori preparano i banchi, il fornaio tira fuori il pane caldo e il profumo arriva fino all'angolo. Piano piano arrivano i vicini con le borse, salutano e scelgono con calma quello che serve per la settimana.",
    "Imparare a scrivere veloce e senza errori richiede tempo e pazienza. All'inizio le dita esitano, gli accenti spariscono e qualche parola esce storta. Con pochi minuti di esercizio ogni giorno, le mani imparano la strada da sole e lo sguardo resta sullo schermo, invece di cercare ogni tasto della tastiera.",
    "La biblioteca della città è un posto tranquillo, con tavoli lunghi e finestre alte. Gli studenti preparano gli esami, una signora legge il giornale vicino alla finestra e i bambini cercano storie nella saletta. Quando arriva la sera, il silenzio si fa più profondo e viene voglia di restare ancora un poco.",
  ],
};

function graphemes(text: string): string[] {
  try {
    const seg = new (Intl as any).Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s: any) => String(s.segment));
  } catch {
    return Array.from(text);
  }
}

/** Build the target text for the current mode: timed modes use the full passage; word modes take the first N words (or graphemes for Japanese). */
function buildTarget(passage: string, mode: Mode, lang: LanguageCode): string {
  if (mode === "30s" || mode === "60s") return passage;
  const n = mode === "25" ? 25 : 50;
  if (lang === "ja") {
    const count = mode === "25" ? 60 : 120;
    return graphemes(passage).slice(0, count).join("");
  }
  return passage.split(" ").slice(0, n).join(" ");
}

function durationOf(mode: Mode): number {
  return mode === "30s" ? 30 : mode === "60s" ? 60 : 0;
}

const BEST_KEY = "typingtest-best-v1";

function loadBest(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export function TypingTestWorkspace({ selectedLanguage = "en" }: TypingTestWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const tt = (t as any).typingTest || {};

  const [practiceLang, setPracticeLang] = useState<LanguageCode>(selectedLanguage);
  const [mode, setMode] = useState<Mode>("60s");
  const [passageIdx, setPassageIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [best, setBest] = useState<Record<string, number>>(() => loadBest());
  const [newBest, setNewBest] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const passage = PASSAGES[practiceLang][passageIdx];
  const target = useMemo(() => buildTarget(passage, mode, practiceLang), [passage, mode, practiceLang]);
  const duration = durationOf(mode);
  const isTimed = duration > 0;
  const isJa = practiceLang === "ja";

  const targetChars = useMemo(() => graphemes(target), [target]);
  const typedChars = useMemo(() => graphemes(typed), [typed]);

  const correctCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < typedChars.length; i++) if (typedChars[i] === targetChars[i]) c++;
    return c;
  }, [typedChars, targetChars]);
  const errorCount = typedChars.length - correctCount;
  const accuracy = typedChars.length ? (correctCount / typedChars.length) * 100 : 100;

  const elapsed = finished
    ? finalSeconds
    : startedAt
      ? Math.min((nowMs - startedAt) / 1000, isTimed ? duration : Number.MAX_SAFE_INTEGER)
      : 0;
  const minutes = elapsed / 60;
  const grossWpm = minutes > 0 ? Math.round(typedChars.length / 5 / minutes) : 0;
  const netWpm = minutes > 0 ? Math.round(correctCount / 5 / minutes) : 0;
  const cpm = minutes > 0 ? Math.round(typedChars.length / minutes) : 0;
  const remaining = isTimed ? Math.max(0, Math.ceil(duration - elapsed)) : 0;
  const progress = targetChars.length ? Math.round((typedChars.length / targetChars.length) * 100) : 0;

  const bestKeyFor = (m: Mode, l: LanguageCode) => `${l}:${m}`;
  const currentBest = best[bestKeyFor(mode, practiceLang)];

  const finish = (typedLen: number, correct: number, seconds: number) => {
    const mins = seconds / 60;
    const wpm = mins > 0 ? Math.round(correct / 5 / mins) : 0;
    setFinalSeconds(seconds);
    setFinished(true);
    const key = bestKeyFor(mode, practiceLang);
    setBest((prev) => {
      if (wpm > 0 && (!prev[key] || wpm > prev[key])) {
        const next = { ...prev, [key]: wpm };
        try {
          localStorage.setItem(BEST_KEY, JSON.stringify(next));
        } catch {
          /* private mode: keep in memory only */
        }
        setNewBest(true);
        return next;
      }
      setNewBest(false);
      return prev;
    });
  };

  // Tick while running
  useEffect(() => {
    if (!startedAt || finished) return;
    const id = setInterval(() => setNowMs(Date.now()), 100);
    return () => clearInterval(id);
  }, [startedAt, finished]);

  // Timed end
  useEffect(() => {
    if (!startedAt || finished || !isTimed) return;
    if (elapsed >= duration) {
      finish(typedChars.length, correctCount, duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, finished]);

  const reset = (nextPassageIdx?: number) => {
    if (typeof nextPassageIdx === "number") setPassageIdx(nextPassageIdx);
    setTyped("");
    setStartedAt(null);
    setFinished(false);
    setFinalSeconds(0);
    setCopied(false);
    setNewBest(false);
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleChange = (value: string) => {
    if (finished) return;
    const nextChars = graphemes(value);
    if (nextChars.length > targetChars.length) value = targetChars.slice(0, targetChars.length).join("");
    if (!startedAt && value.length > 0) {
      const start = Date.now();
      setStartedAt(start);
      setNowMs(start);
    }
    setTyped(value);
    if (!isTimed && graphemes(value).length >= targetChars.length) {
      let correct = 0;
      const v = graphemes(value);
      for (let i = 0; i < v.length; i++) if (v[i] === targetChars[i]) correct++;
      finish(v.length, correct, startedAt ? (Date.now() - startedAt) / 1000 : 0);
    }
  };

  const resultsText = [
    `${tt.resultsTitle || "Typing test results"} — ${isTimed ? `${duration}s` : `${mode} ${isJa ? tt.charsUnit || "chars" : tt.wordsUnit || "words"}`}`,
    `${tt.wpmNet || "WPM"}: ${netWpm}`,
    `${tt.grossWpm || "Gross WPM"}: ${grossWpm}`,
    `${tt.accuracy || "Accuracy"}: ${accuracy.toFixed(1)}%`,
    `${tt.correctChars || "Correct characters"}: ${correctCount}`,
    `${tt.errorChars || "Errors"}: ${errorCount}`,
    `${tt.typedChars || "Characters typed"}: ${typedChars.length}`,
    `${tt.timeUsed || "Time"}: ${Math.round(elapsed)}s`,
  ].join("\n");

  const handleCopyResults = async () => {
    try {
      await navigator.clipboard.writeText(resultsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const modeChips: { id: Mode; label: string }[] = [
    { id: "30s", label: `30 ${tt.secondsUnit || "sec"}` },
    { id: "60s", label: `60 ${tt.secondsUnit || "sec"}` },
    { id: "25", label: `25 ${isJa ? tt.charsUnit || "chars" : tt.wordsUnit || "words"}` },
    { id: "50", label: `50 ${isJa ? tt.charsUnit || "chars" : tt.wordsUnit || "words"}` },
  ];

  // Word-by-word rendering so lines wrap between words, not mid-word.
  const words = useMemo(() => {
    const out: { chars: string[]; start: number }[] = [];
    let idx = 0;
    const parts = target.split(" ");
    parts.forEach((part, wi) => {
      const wordWithSpace = wi < parts.length - 1 ? part + " " : part;
      const cs = graphemes(wordWithSpace);
      out.push({ chars: cs, start: idx });
      idx += cs.length;
    });
    return out;
  }, [target]);

  const charClass = (i: number) => {
    if (i < typedChars.length) return typedChars[i] === targetChars[i] ? "text-emerald-600" : "text-rose-600 bg-rose-100 rounded-[3px]";
    if (i === typedChars.length && !finished) return "bg-violet-200 text-stone-700 rounded-[3px] underline decoration-violet-500 decoration-2 underline-offset-4";
    return "text-stone-400";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="typingTest" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-violet-100 via-purple-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-violet-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.16),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-300 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-violet-600" />
              {tt.badge || "Typing Speed Test"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {tt.title || "How Fast Can You Type?"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {tt.subtitle || "Take a 30 or 60 second test, or type 25 or 50 words, and see your WPM, accuracy and character stats live. The clock starts with your first keystroke — everything runs in your browser, nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-600 text-white rounded-xl font-bold shrink-0">
            <Gauge className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-violet-950">{tt.quickAnswerTitle || "Quick Answer: What Does This Typing Test Measure?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {tt.quickAnswer || "It measures how fast and how cleanly you type a short passage: net WPM counts only your correct characters (correct characters ÷ 5 ÷ minutes), gross WPM counts everything you typed, and accuracy shows the share of characters you got right. Speed without accuracy is not real speed, so read accuracy first."}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-violet-600" /> {tt.modeLabel || "Test length"}
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {modeChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => { setMode(chip.id); reset(); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-colors ${mode === chip.id ? "bg-violet-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-violet-100 hover:text-violet-800"}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide ml-0 sm:ml-3">{tt.langLabel || "Practice text"}</span>
          <select
            value={practiceLang}
            onChange={(e) => { setPracticeLang(e.target.value as LanguageCode); setPassageIdx(0); reset(); }}
            className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            {ALL_LANGS.map((l) => (
              <option key={l} value={l}>{LANG_NAMES[l]}</option>
            ))}
          </select>
          <div className="flex gap-1.5 ml-auto">
            <button onClick={() => reset()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> {tt.restart || "Restart"}
            </button>
            <button
              onClick={() => reset((passageIdx + 1) % PASSAGES[practiceLang].length)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" /> {tt.newText || "New text"}
            </button>
          </div>
        </div>

        {isJa && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed">
              {tt.jaNote || "Japanese is not separated into words with spaces, so this test counts characters. In word modes you type a set number of characters, and WPM uses the standard convention of 5 characters = 1 word — the character count is the honest main number."}
            </p>
          </div>
        )}

        {/* Live stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: isTimed ? (tt.timeLeft || "Time left") : (tt.timeUsed || "Time"), value: isTimed ? `${remaining}s` : `${Math.floor(elapsed)}s` },
            { label: tt.wpmNet || "WPM", value: netWpm },
            { label: tt.grossWpm || "Gross WPM", value: grossWpm },
            { label: tt.accuracy || "Accuracy", value: `${accuracy.toFixed(0)}%` },
            { label: tt.correctChars || "Correct", value: correctCount },
            { label: tt.errorChars || "Errors", value: errorCount },
          ].map((s) => (
            <div key={s.label} className="bg-violet-50/60 border border-violet-100 rounded-2xl px-2.5 py-2 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 truncate">{s.label}</div>
              <div className="text-lg sm:text-xl font-extrabold text-stone-900">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Target text */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-4 sm:p-5 cursor-text select-none"
          aria-label={tt.textLabel || "Text to type"}
        >
          <p className="font-mono text-base sm:text-xl leading-[2.1] tracking-wide break-words">
            {words.map((word, wi) => (
              <span key={wi} className="whitespace-nowrap">
                {word.chars.map((ch, ci) => {
                  const gi = word.start + ci;
                  return (
                    <span key={ci} className={charClass(gi)}>
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </p>
        </div>

        <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide">{tt.typeHere || "Click here and start typing"}</label>
        <textarea
          ref={inputRef}
          value={typed}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          readOnly={finished}
          placeholder={tt.startHint || "The clock starts with your first keystroke. Backspace works — accuracy counts."}
          className="w-full h-24 sm:h-28 rounded-2xl border border-stone-300 p-4 font-mono text-sm sm:text-base leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-violet-500 resize-none"
          autoFocus
        />
        {typeof currentBest === "number" && !finished && (
          <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            {tt.bestLabel || "Best on this device"}: {currentBest} WPM
          </p>
        )}
      </div>

      {/* Results */}
      {finished && (
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-5 sm:p-7 text-white shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold">{tt.resultsTitle || "Your result"}</h2>
              <p className="text-xs sm:text-sm text-violet-100">{isTimed ? (tt.finishedTimed || "Time is up.") : (tt.finishedWords || "Text complete.")}</p>
            </div>
            {newBest && (
              <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-extrabold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> {tt.newBest || "New best on this device!"}
              </span>
            )}
          </div>
          <div className="flex items-end gap-6 flex-wrap">
            <div>
              <div className="text-5xl sm:text-6xl font-black leading-none">{netWpm}</div>
              <div className="text-xs font-bold text-violet-100 mt-1 uppercase tracking-wide">{tt.wpmNet || "WPM (net)"}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2 text-sm">
              <div><span className="text-violet-200 text-xs block">{tt.grossWpm || "Gross WPM"}</span><strong>{grossWpm}</strong></div>
              <div><span className="text-violet-200 text-xs block">{tt.accuracy || "Accuracy"}</span><strong>{accuracy.toFixed(1)}%</strong></div>
              <div><span className="text-violet-200 text-xs block">{tt.cpm || "Characters/min"}</span><strong>{cpm}</strong></div>
              <div><span className="text-violet-200 text-xs block">{tt.correctChars || "Correct characters"}</span><strong>{correctCount}</strong></div>
              <div><span className="text-violet-200 text-xs block">{tt.errorChars || "Errors"}</span><strong>{errorCount}</strong></div>
              <div><span className="text-violet-200 text-xs block">{tt.timeUsed || "Time"}</span><strong>{Math.round(elapsed)}s</strong></div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-violet-100 leading-relaxed max-w-3xl">
            {tt.resultsNote || "This is a practice score, not a certificate. Your result depends on your keyboard, device and layout — a phone keyboard is not comparable with a physical keyboard, so compare your own scores on the same device over time."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => reset()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-violet-800 text-xs font-extrabold hover:bg-violet-50 cursor-pointer">
              <RefreshCw className="w-4 h-4" /> {tt.restart || "Restart"}
            </button>
            <button onClick={() => reset((passageIdx + 1) % PASSAGES[practiceLang].length)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-800 text-white text-xs font-extrabold hover:bg-violet-900 cursor-pointer">
              <Shuffle className="w-4 h-4" /> {tt.newText || "New text"}
            </button>
            <button onClick={handleCopyResults} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-800/60 text-white text-xs font-extrabold hover:bg-violet-800 cursor-pointer">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (tt.copied || "Copied!") : (tt.copyResults || "Copy results")}
            </button>
            {typeof currentBest === "number" && (
              <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-violet-100">
                <Trophy className="w-4 h-4 text-amber-300" /> {tt.bestLabel || "Best on this device"}: {currentBest} WPM
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-violet-600" /> {tt.formulaTitle || "How WPM is calculated"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{tt.formulaText || "WPM = correct characters ÷ 5 ÷ minutes. One “word” is counted as 5 characters (including spaces), the standard convention, so scores can be compared fairly. Gross WPM counts every character you typed; net WPM counts only the correct ones — net is the honest number."}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-violet-600" /> {tt.honestTitle || "What this score is — and is not"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{tt.honestText || "It is a snapshot of one short passage, on one keyboard, on one day. It is not an official certificate and no employer body recognizes it. Phone keyboards usually score far lower than physical ones, and different passages change the result — judge your progress by your own repeated scores on the same setup."}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-violet-600" /> {tt.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{tt.privacyNote || "Everything happens in this browser tab: the passage, your typing and the scoring. Nothing you type is uploaded, saved on a server or shared. Your best score is kept only in this browser on this device — clear your browser data and it is gone."}</p>
        </div>
      </div>

      <ToolGuideSection toolId="typingTest" selectedLanguage={selectedLanguage} />
    </div>
  );
}
