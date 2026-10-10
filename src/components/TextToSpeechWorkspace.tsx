import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Download, Eraser, Gauge, Info, ListMusic, Pause, Play,
  ShieldCheck, Sparkles, Square, Volume2,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface TextToSpeechWorkspaceProps {
  selectedLanguage?: LanguageCode;
  onSendToHumanizer?: (text: string) => void;
}

const LOCALES: Record<LanguageCode, string> = {
  en: "en", es: "es", ur: "ur", "ur-pk": "ur-PK", de: "de", fr: "fr", tr: "tr",
  pt: "pt", ja: "ja", it: "it", nl: "nl", no: "nb", ru: "ru", hi: "hi",
};

const SAMPLES: Record<LanguageCode, string> = {
  en: "Reading your own words out loud is the fastest way to catch mistakes. Sentences that looked fine on the screen suddenly reveal their rough edges when you hear them. Press play, listen carefully, and notice how the rhythm of your writing changes the way it feels.",
  es: "Escuchar tus propias palabras en voz alta es la forma más rápida de encontrar errores. Frases que parecían perfectas en la pantalla muestran sus fallos cuando las oyes. Pulsa reproducir, escucha con atención y nota cómo cambia el ritmo de tu texto.",
  ur: "Apne alfaz ko bol kar sunna ghaltiyan pakarne ka sab se tez tareeqa hai. Jo jumlay screen par theek lagte hain, sunne par un ki khamiyan samne aa jati hain. Play dabayen, ghour se sunain aur dekhen ke aap ki tehreer ka andaaz kaisa lagta hai.", "ur-pk": "اپنے الفاظ کو بول کر سننا غلطیاں پکڑنے کا سب سے تیز طریقہ ہے۔ جو جملے اسکرین پر ٹھیک لگتے ہیں، سننے پر ان کی خامیاں سامنے آ جاتی ہیں۔ چلائیں دبائیں، غور سے سنیں اور دیکھیں کہ آپ کی تحریر کا انداز کیسا لگتا ہے۔",
  de: "Die eigenen Worte laut zu hören ist der schnellste Weg, Fehler zu finden. Sätze, die auf dem Bildschirm gut aussahen, zeigen beim Hören plötzlich ihre Schwächen. Drücken Sie auf Abspielen, hören Sie genau hin und achten Sie darauf, wie sich der Rhythmus Ihres Textes anfühlt.",
  fr: "Entendre vos propres mots à voix haute est le moyen le plus rapide de repérer les erreurs. Des phrases qui semblaient parfaites à l'écran révèlent leurs défauts quand on les écoute. Appuyez sur lecture, écoutez attentivement et remarquez comment le rythme de votre texte change tout.",
  tr: "Kendi kelimelerinizi sesli duymak, hataları yakalamanın en hızlı yoludur. Ekranda düzgün görünen cümleler, duyduğunuzda aniden pürüzlerini belli eder. Oynat düğmesine basın, dikkatle dinleyin ve yazınızın ritminin nasıl hissettirdiğine bakın.",
  pt: "Ouvir as suas próprias palavras em voz alta é a maneira mais rápida de encontrar erros. Frases que pareciam perfeitas na tela mostram suas falhas quando você as escuta. Aperte o play, ouça com atenção e perceba como o ritmo do seu texto muda tudo.",
  ja: "自分の文章を音声で聞くことは、間違いを見つける一番早い方法です。画面では問題なさそうに見えた文も、耳で聞くと急に粗さが目立ちます。再生ボタンを押して、よく聞いてみてください。文章のリズムがどう感じられるかが変わってきます。",
  it: "Ascoltare le tue parole ad alta voce è il modo più rapido per trovare gli errori. Frasi che sembravano perfette sullo schermo mostrano i loro difetti quando le senti. Premi play, ascolta con attenzione e nota come cambia il ritmo del tuo testo.",
  nl: "Je eigen woorden hardop horen is de snelste manier om fouten te vinden. Zinnen die er op het scherm goed uitzagen, laten plotseling hun zwakke plekken horen. Druk op afspelen, luister goed en merk hoe het ritme van je tekst alles verandert.",
  no: "Å høre dine egne ord høyt er den raskeste måten å finne feil på. Setninger som så fine ut på skjermen, viser plutselig svakhetene sine når du hører dem. Trykk på spill av, lytt nøye, og legg merke til hvordan rytmen i teksten din føles.",
  ru: "Короткий текст долетает далеко. Заголовок, пара слов о себе и одно честное предложение скажут больше, чем длинный абзац, который никто не дочитывает до конца.",
  hi: "छोटा टेक्स्ट दूर तक जाता है। एक हेडलाइन, एक बायो और एक ईमानदार वाक्य उस लंबे पैराग्राफ़ से ज़्यादा कह जाता है जिसे कोई पूरा नहीं पढ़ता।",
};

function splitIntoChunks(text: string, maxLen = 200): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…。！？\n]+[.!?…。！？]*["'”’»)]*\s*/g) || [clean];
  const chunks: string[] = [];
  let current = "";
  const pushLong = (piece: string) => {
    let rest = piece.trim();
    while (rest.length > maxLen) {
      let cut = rest.lastIndexOf(" ", maxLen);
      if (cut < 40) cut = maxLen;
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) chunks.push(rest);
  };
  for (const s of sentences) {
    const sentence = s.trim();
    if (!sentence) continue;
    if (sentence.length > maxLen) {
      if (current) { chunks.push(current); current = ""; }
      pushLong(sentence);
      continue;
    }
    if ((current + " " + sentence).trim().length > maxLen) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = (current + " " + sentence).trim();
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}

function countWords(text: string): number {
  const m = text.trim().match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

function langDisplayName(code: string, uiLocale: string): string {
  try {
    const dn = new (Intl as any).DisplayNames([uiLocale], { type: "language" });
    return dn.of(code.split("-")[0]) || code;
  } catch {
    return code;
  }
}

type PlayState = "idle" | "speaking" | "paused" | "done";

export function TextToSpeechWorkspace({ selectedLanguage = "en", onSendToHumanizer }: TextToSpeechWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ts = (t as any).tts || {};
  const uiLocale = LOCALES[selectedLanguage] || "en";
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [state, setState] = useState<PlayState>("idle");
  const [partIndex, setPartIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const chunksRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const stopFlagRef = useRef(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const rateRef = useRef(1);
  const pitchRef = useRef(1);

  const words = useMemo(() => countWords(text), [text]);
  const chars = text.length;
  const chunks = useMemo(() => splitIntoChunks(text), [text]);
  const estMinutes = words ? Math.max(1, Math.round(words / (150 * rate))) : 0;

  // Load device voices (they often arrive asynchronously)
  useEffect(() => {
    if (!supported) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      if (list.length) setVoices(list);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supported]);

  // Pick a sensible default voice once voices arrive
  useEffect(() => {
    if (!voices.length || voiceURI) return;
    const siteLang = uiLocale.split("-")[0];
    const match =
      voices.find((v) => v.lang.toLowerCase().startsWith(siteLang) && v.default) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(siteLang)) ||
      voices.find((v) => v.default) ||
      voices[0];
    if (match) setVoiceURI(match.voiceURI);
  }, [voices, voiceURI, uiLocale]);

  useEffect(() => {
    voiceRef.current = voices.find((v) => v.voiceURI === voiceURI) || null;
  }, [voices, voiceURI]);
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { pitchRef.current = pitch; }, [pitch]);

  // Stop playback when the component unmounts
  useEffect(() => {
    return () => {
      if (supported) {
        stopFlagRef.current = true;
        window.speechSynthesis.cancel();
      }
    };
  }, [supported]);

  const stopPlayback = () => {
    if (!supported) return;
    stopFlagRef.current = true;
    window.speechSynthesis.cancel();
    setState("idle");
    setPartIndex(0);
    indexRef.current = 0;
  };

  const speakFrom = (startIndex: number) => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const list = chunksRef.current;
    if (startIndex >= list.length) {
      setState("done");
      return;
    }
    indexRef.current = startIndex;
    setPartIndex(startIndex);
    const utter = new SpeechSynthesisUtterance(list[startIndex]);
    if (voiceRef.current) {
      utter.voice = voiceRef.current;
      utter.lang = voiceRef.current.lang;
    }
    utter.rate = rateRef.current;
    utter.pitch = pitchRef.current;
    utter.onend = () => {
      if (stopFlagRef.current) return;
      speakFrom(startIndex + 1);
    };
    utter.onerror = (e) => {
      if (stopFlagRef.current) return;
      if (e.error === "interrupted" || e.error === "canceled") return;
      speakFrom(startIndex + 1);
    };
    synth.speak(utter);
  };

  const handlePlay = () => {
    if (!supported || !chunks.length) return;
    stopFlagRef.current = false;
    window.speechSynthesis.cancel();
    chunksRef.current = chunks;
    setState("speaking");
    // Small delay lets cancel() settle in Chrome before speaking
    setTimeout(() => speakFrom(0), 60);
  };

  const handlePause = () => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setState("paused");
  };

  const handleResume = () => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setState("speaking");
  };

  const progressPct = chunks.length ? Math.min(100, ((partIndex + (state === "done" ? 1 : 0)) / chunks.length) * 100) : 0;

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadText = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-to-speech.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const voiceLangs = useMemo(() => {
    const map = new Map<string, SpeechSynthesisVoice[]>();
    voices.forEach((v) => {
      const key = v.lang || "—";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [voices]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="textToSpeech" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-sky-100 via-cyan-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-sky-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.16),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-600" />
              {ts.badge || "Text to Speech"}
            </span>
            <span className="text-xs text-stone-500 font-mono">Free • No sign-up</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {ts.title || "Hear Your Text Read Aloud"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ts.subtitle || "Paste any text and your device reads it aloud, right in this browser tab. No upload, no account — your words never leave your device."}
          </p>
        </div>
      </div>

      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-600 text-white rounded-xl font-bold shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-sky-950">{ts.quickAnswerTitle || "Quick Answer: How Does Text to Speech Work Here?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {ts.quickAnswer || "This page uses the voices already installed on your phone or computer. You choose one, set the speed and pitch, and press Play. Long texts are read in sentence-sized parts so the browser does not cut out. Nothing is uploaded: the reading happens inside your browser."}
            </p>
          </div>
        </div>
      </div>

      {!supported && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-rose-900">{ts.unsupportedTitle || "This browser cannot read aloud"}</h3>
            <p className="text-xs sm:text-sm text-rose-800 leading-relaxed">
              {ts.unsupportedText || "Your current browser does not offer the built-in speech feature this page needs. Try Google Chrome or Microsoft Edge on a computer or Android phone — they include voices on most devices. Your text below still works for writing and copying."}
            </p>
          </div>
        </div>
      )}

      {supported && voices.length === 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">{ts.noVoicesTitle || "No voices found on this device yet"}</h3>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              {ts.noVoicesText || "This browser could not find any reading voice on your device. Voices are installed by your system, not by websites: on Android, open Settings → Accessibility → Text-to-speech output and install a voice; on Windows, open Settings → Time & language → Speech. Then reload this page."}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => { stopPlayback(); setText(SAMPLES[selectedLanguage]); }} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
              {ts.sampleBtn || "Try sample"}
            </button>
            <button onClick={handleCopy} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (ts.copied || "Copied!") : (ts.copyText || "Copy text")}
            </button>
            <button onClick={handleDownloadText} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
              <Download className="w-4 h-4" /> {ts.downloadText || "Download text (.txt)"}
            </button>
            <button onClick={() => { stopPlayback(); setText(""); }} disabled={!text} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
              <Eraser className="w-4 h-4" /> {ts.clear || "Clear"}
            </button>
          </div>

          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide">{ts.editorLabel || "Text to read aloud"}</label>
          <textarea
            value={text}
            onChange={(e) => { stopPlayback(); setText(e.target.value); }}
            placeholder={ts.placeholder || "Paste or type the text you want to hear — an essay, notes, an article, anything."}
            className="w-full h-64 sm:h-80 rounded-2xl border border-stone-300 p-4 text-sm sm:text-base leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-sky-500 resize-y"
          />
          <div className="flex flex-wrap gap-2 text-xs text-stone-600">
            <span className="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 font-semibold">{words} {ts.words || "words"}</span>
            <span className="px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 font-semibold">{chars} {ts.chars || "characters"}</span>
            {words > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-stone-50 border border-stone-200 font-semibold">
                {ts.estListen || "Listening time (estimate)"}: ~{estMinutes} min
              </span>
            )}
          </div>
          {onSendToHumanizer && text.trim() && (
            <button onClick={() => onSendToHumanizer(text)} className="text-xs font-bold text-sky-700 hover:text-sky-900 underline underline-offset-2 cursor-pointer">
              {ts.sendHumanizer || "Polish this text in the Humanizer"}
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
            <h3 className="font-bold text-stone-800 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-sky-600" /> {ts.voiceLabel || "Voice"}
            </h3>
            <select
              value={voiceURI}
              onChange={(e) => { stopPlayback(); setVoiceURI(e.target.value); }}
              disabled={!voices.length}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-sky-500 bg-white disabled:opacity-50"
            >
              {voiceLangs.map(([lang, list]) => (
                <optgroup key={lang} label={`${langDisplayName(lang, uiLocale)} (${lang})`}>
                  {list.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} — {v.lang}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              {ts.voicesFound || "Voices found on this device"}: {voices.length}
            </p>

            <div>
              <label className="flex items-center justify-between text-xs font-bold text-stone-600 mb-1">
                <span className="flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-sky-600" /> {ts.rateLabel || "Speed"}</span>
                <span>{rate.toFixed(1)}×</span>
              </label>
              <input type="range" min={0.5} max={2} step={0.1} value={rate} onChange={(e) => { setRate(parseFloat(e.target.value)); }} className="w-full accent-sky-600" />
              <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                <span>{ts.slowerLabel || "Slower"}</span><span>{ts.fasterLabel || "Faster"}</span>
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-bold text-stone-600 mb-1">
                <span className="flex items-center gap-1.5"><ListMusic className="w-3.5 h-3.5 text-sky-600" /> {ts.pitchLabel || "Pitch"}</span>
                <span>{pitch.toFixed(1)}</span>
              </label>
              <input type="range" min={0.5} max={2} step={0.1} value={pitch} onChange={(e) => { setPitch(parseFloat(e.target.value)); }} className="w-full accent-sky-600" />
              <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                <span>{ts.lowerLabel || "Lower"}</span><span>{ts.higherLabel || "Higher"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              {state !== "speaking" && state !== "paused" && (
                <button onClick={handlePlay} disabled={!chunks.length || !voices.length} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 disabled:opacity-50 cursor-pointer">
                  <Play className="w-4 h-4" /> {ts.speakBtn || "Play"}
                </button>
              )}
              {state === "speaking" && (
                <button onClick={handlePause} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 cursor-pointer">
                  <Pause className="w-4 h-4" /> {ts.pauseBtn || "Pause"}
                </button>
              )}
              {state === "paused" && (
                <button onClick={handleResume} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 cursor-pointer">
                  <Play className="w-4 h-4" /> {ts.resumeBtn || "Resume"}
                </button>
              )}
              {(state === "speaking" || state === "paused") && (
                <button onClick={stopPlayback} className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-bold hover:bg-stone-700 cursor-pointer">
                  <Square className="w-4 h-4" /> {ts.stopBtn || "Stop"}
                </button>
              )}
            </div>

            <p className="text-xs font-semibold text-stone-600">
              {state === "speaking" && (ts.statusSpeaking || "Reading aloud…")}
              {state === "paused" && (ts.statusPaused || "Paused")}
              {state === "done" && (ts.statusDone || "Finished reading")}
              {state === "idle" && (ts.statusReady || "Ready when you are")}
            </p>

            {chunks.length > 0 && (state === "speaking" || state === "paused" || state === "done") && (
              <div className="space-y-1.5">
                <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-[11px] text-stone-500 font-semibold">
                  {ts.partOf || "Part"} {Math.min(partIndex + 1, chunks.length)} / {chunks.length}
                </p>
                <p className="text-[11px] text-stone-500 leading-relaxed line-clamp-3">
                  {ts.nowReading || "Now reading"}: {chunks[Math.min(partIndex, chunks.length - 1)]}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-sky-600" /> {ts.voicesTitle || "Your voices live on your device"}</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ts.voicesText || "This page can only use voices your phone or computer already has — websites cannot install voices. If your language is missing, add it in your system settings (Android: Settings → Accessibility → Text-to-speech output; Windows: Settings → Time & language → Speech), then reload. Chrome often includes extra voices of its own."}</p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5">
            <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-sky-600" /> {ts.noMp3Title || "Listening only — no MP3 download"}</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ts.noMp3Text || "Browser voices play live and cannot be saved as an audio file by a web page, so this tool honestly does not offer an MP3 button. If you need an audio file, use a service that generates one — and know that your text will be uploaded to their server to do it."}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
        <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-sky-600" /> {ts.privacyTitle || "Private by design"}</h3>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{ts.privacyNote || "Your text is read locally in this browser tab by your device's own voice. It is not uploaded to us, not saved on a server, and not shared. Close the tab and it is simply gone."}</p>
      </div>

      <ToolGuideSection toolId="textToSpeech" selectedLanguage={selectedLanguage} />
    </div>
  );
}
