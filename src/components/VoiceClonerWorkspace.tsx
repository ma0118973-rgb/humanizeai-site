import React, { useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  AlertTriangle, Check, Download, Eraser, Gauge, Info, Mic, Pause, Play,
  ShieldCheck, Square, UploadCloud, Volume2, Wand2,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

/**
 * VoiceClonerWorkspace — Tool #53 (STAGING COPY — integration notes in PLAN.md)
 *
 * Two honest tiers, by owner decision:
 *  1) FREE "Natural voices": Kokoro-82M (Apache-2.0, code + weights) runs
 *     100% in the visitor's browser via kokoro-js / ONNX Runtime Web.
 *     No server, no sign-up, text never leaves the device. Preset voices
 *     only — this tier does NOT clone anyone's voice and we never claim it does.
 *  2) CLONE "My voice" (Pro/backend): a separate Chatterbox (MIT) service.
 *     The visitor records ~10 seconds of their OWN voice, types text, and
 *     gets speech back in that voice. Runs on our GPU backend only
 *     (VITE_CLONE_API_URL). In staging the backend may be unconfigured —
 *     the UI then says so honestly instead of pretending.
 *
 * Language honesty: voices speak only the languages Kokoro / Chatterbox
 * actually support. Urdu is NOT supported by either model today, so the UI
 * never offers an Urdu voice. Interface text still follows the site's
 * `selectedLanguage` like every other tool.
 */

interface VoiceClonerWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Tier = "natural" | "clone";
type NaturalPhase = "idle" | "loading-model" | "generating" | "ready" | "error";
type ClonePhase = "idle" | "recording" | "recorded" | "sending" | "done" | "error";

// ---------------------------------------------------------------------------
// Kokoro voices (Kokoro-82M v1.0 ONNX voice set). Grouped by SPOKEN language.
// Only languages the model really supports — no Urdu entry on purpose.
// ---------------------------------------------------------------------------
interface KokoroVoiceOption {
  id: string;          // kokoro-js voice id, e.g. "af_heart"
  label: string;       // human label shown to the visitor
  langGroup: string;   // spoken language group label
}

const KOKORO_LANGUAGES: { group: string; voices: KokoroVoiceOption[] }[] = [
  {
    group: "English (US)",
    voices: [
      { id: "af_heart", label: "Heart — warm female", langGroup: "English (US)" },
      { id: "af_bella", label: "Bella — bright female", langGroup: "English (US)" },
      { id: "af_sarah", label: "Sarah — calm female", langGroup: "English (US)" },
      { id: "af_nicole", label: "Nicole — soft female", langGroup: "English (US)" },
      { id: "am_fenrir", label: "Fenrir — deep male", langGroup: "English (US)" },
      { id: "am_michael", label: "Michael — clear male", langGroup: "English (US)" },
      { id: "am_puck", label: "Puck — lively male", langGroup: "English (US)" },
    ],
  },
  {
    group: "English (UK)",
    voices: [
      { id: "bf_emma", label: "Emma — female", langGroup: "English (UK)" },
      { id: "bf_isabella", label: "Isabella — female", langGroup: "English (UK)" },
      { id: "bf_lily", label: "Lily — female", langGroup: "English (UK)" },
      { id: "bm_george", label: "George — male", langGroup: "English (UK)" },
      { id: "bm_fable", label: "Fable — male narrator", langGroup: "English (UK)" },
    ],
  },
  {
    group: "Español",
    voices: [
      { id: "ef_dora", label: "Dora — female", langGroup: "Español" },
      { id: "em_alex", label: "Alex — male", langGroup: "Español" },
    ],
  },
  {
    group: "Français",
    voices: [{ id: "ff_siwis", label: "Siwis — female", langGroup: "Français" }],
  },
  {
    group: "हिन्दी (Hindi)",
    voices: [
      { id: "hf_alpha", label: "Alpha — female", langGroup: "हिन्दी (Hindi)" },
      { id: "hf_beta", label: "Beta — female", langGroup: "हिन्दी (Hindi)" },
      { id: "hm_omega", label: "Omega — male", langGroup: "हिन्दी (Hindi)" },
      { id: "hm_psi", label: "Psi — male", langGroup: "हिन्दी (Hindi)" },
    ],
  },
  {
    group: "Italiano",
    voices: [
      { id: "if_sara", label: "Sara — female", langGroup: "Italiano" },
      { id: "im_nicola", label: "Nicola — male", langGroup: "Italiano" },
    ],
  },
  {
    group: "日本語",
    voices: [
      { id: "jf_alpha", label: "Alpha — female", langGroup: "日本語" },
      { id: "jf_gongitsune", label: "Gongitsune — female", langGroup: "日本語" },
      { id: "jm_kumo", label: "Kumo — male", langGroup: "日本語" },
    ],
  },
  {
    group: "Português (BR)",
    voices: [
      { id: "pf_dora", label: "Dora — female", langGroup: "Português (BR)" },
      { id: "pm_alex", label: "Alex — male", langGroup: "Português (BR)" },
    ],
  },
  {
    group: "中文",
    voices: [
      { id: "zf_xiaobei", label: "Xiaobei — female", langGroup: "中文" },
      { id: "zm_yunxi", label: "Yunxi — male", langGroup: "中文" },
    ],
  },
];

// Chatterbox Multilingual supported language ids (23). Urdu is absent in the
// upstream repo — we list only what the model really supports.
const CLONE_LANGUAGES: { id: string; label: string }[] = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
  { id: "nl", label: "Nederlands" },
  { id: "no", label: "Norsk" },
  { id: "tr", label: "Türkçe" },
  { id: "hi", label: "हिन्दी (Hindi)" },
  { id: "ar", label: "العربية" },
  { id: "da", label: "Dansk" },
  { id: "el", label: "Ελληνικά" },
  { id: "fi", label: "Suomi" },
  { id: "he", label: "עברית" },
  { id: "ja", label: "日本語" },
  { id: "ko", label: "한국어" },
  { id: "ms", label: "Bahasa Melayu" },
  { id: "pl", label: "Polski" },
  { id: "ru", label: "Русский" },
  { id: "sv", label: "Svenska" },
  { id: "sw", label: "Kiswahili" },
  { id: "zh", label: "中文" },
];

const KOKORO_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const NATURAL_MAX_CHARS = 1000;   // free browser tier: per-generation cap
const CLONE_MAX_CHARS = 300;      // backend tier: per-request cap (GPU seconds)
const FREE_CLONE_TRIES_PER_DAY = 3;
const MAX_RECORD_SECONDS = 15;
const MIN_RECORD_SECONDS = 4;

// ---------------------------------------------------------------------------
// Interface strings. At integration these move into translations.ts under a
// `voiceCloner` key (same shape as `audioToText`); English falls back inline
// so the component never renders blank, exactly like the other tools.
// ---------------------------------------------------------------------------
const STRINGS: Partial<Record<LanguageCode, Record<string, any>>> = {
  en: {
    naturalTab: "Natural voices — free",
    cloneTab: "Clone my voice",
    naturalIntro:
      "Type or paste text and hear it read aloud in a natural voice. The voice engine runs inside your browser — your text is never uploaded, and there is no sign-up.",
    textLabel: "Your text",
    textPlaceholder: "Type something here, then press Generate…",
    voiceLabel: "Voice",
    speedLabel: "Speed",
    generate: "Generate voice",
    generating: "Speaking…",
    modelLoading: "Downloading the voice model (first time only, about 92 MB)…",
    modelReady: "Voice model ready — it stays cached in your browser.",
    downloadWav: "Download WAV",
    erase: "Clear",
    limitNote: "Free browser tier: up to 1,000 characters per go. Long text is read in parts and joined into one file.",
    privacyNote: "Private by design: everything happens on your device.",
    cloneIntro:
      "Record about 10 seconds of your own voice, type any text, and hear it spoken back in your voice. Cloning runs on our voice server, not on your phone.",
    cloneSetupNote:
      "This feature needs the ToolVena voice server. If the server is not connected yet, you will see a clear message below — we never fake a result.",
    recordLabel: "1. Record your voice (5–15 seconds)",
    recordStart: "Start recording",
    recordStop: "Stop",
    recording: "Recording… speak one or two clear sentences.",
    uploadLabel: "…or upload a short voice clip",
    previewLabel: "Your reference clip",
    cloneTextLabel: "2. Text to speak in your voice",
    cloneLangLabel: "Spoken language of the text",
    consent: "This is my own voice (or I have the speaker's permission) and I agree to clone it responsibly.",
    cloneNow: "Clone my voice",
    cloneSending: "Sending to the voice server… first run can take a little longer.",
    cloneDone: "Your cloned speech is ready.",
    triesLeft: (n: number) => `Free clone tries left today: ${n}`,
    triesOver: "Today's free clone tries are used up. The paid plan removes the daily cap.",
    backendMissing:
      "The voice-clone server is not connected yet, so cloning is paused. The free natural voices above work right now.",
    errText: "Please write some text first.",
    errConsent: "Please tick the consent box — we only clone a voice with its owner's permission.",
    errRecord: "Please record or upload a short voice clip first (at least 5 seconds).",
    errMic: "Microphone access was blocked. You can allow it in the browser, or upload a clip instead.",
    errTooLong: (n: number) => `Please keep it under ${n} characters per go.`,
    errGenerate: "The voice engine stopped before finishing. Please try again with a shorter text.",
    errLoadModel: "The voice model could not start on this device. Please check your connection and press Generate again.",
    errPartial: "Only the first part of your text could be spoken — that part is ready below. The rest stopped on this device, so we are showing you exactly what was made, nothing hidden.",
    partProgress: (_done: number, _total: number) => `Speaking part ${_done} of ${_total}…`,
    errClone: "The voice server could not finish this clone. Nothing was charged — please try again.",
    langHonesty:
      "Urdu voices are not available yet: none of the open voice models we can legally use support Urdu today. We would rather tell you than fake it.",
    freeBannerTitle: "Bilkul FREE — Unlimited",
    freeBannerWhy:
      "These natural voices are created inside your own phone or computer — our server does no work, so there is no bill for us, and this tier will always stay free.",
    cloneBannerTitle: "Clone — why is it paid?",
    cloneBannerWhy:
      "Copying your real voice needs our large AI computers (GPU servers) running behind the scenes, and we pay that bill — so full voice cloning is paid. Everyone still gets 3 free clone tries every day.",
    cloneSentenceHint: "Tip: read a natural sentence, like “Hello, my name is … and I am recording this to create my voice.”",
  },
  "ur-pk": {
    naturalTab: "قدرتی آوازیں — مفت",
    cloneTab: "میری آواز کلون کریں",
    naturalIntro:
      "متن لکھیں یا چسپاں کریں اور قدرتی آواز میں بولا ہوا سنیں۔ آواز کا انجن آپ کے براؤزر کے اندر چلتا ہے — آپ کا متن کبھی اپ لوڈ نہیں ہوتا، اور سائن اپ بھی نہیں چاہیے۔",
    textLabel: "آپ کا متن",
    textPlaceholder: "یہاں کچھ لکھیں، پھر بنائیں دبائیں…",
    voiceLabel: "آواز",
    speedLabel: "رفتار",
    generate: "آواز بنائیں",
    generating: "بول رہا ہے…",
    modelLoading: "آواز کا ماڈل ڈاؤن لوڈ ہو رہا ہے (صرف پہلی بار، تقریباً 92 MB)…",
    modelReady: "آواز کا ماڈل تیار ہے — یہ آپ کے براؤزر میں کیش رہتا ہے۔",
    downloadWav: "WAV ڈاؤن لوڈ کریں",
    erase: "صاف کریں",
    limitNote: "مفت براؤزر درجہ: ایک بار میں 1,000 حروف تک۔ لمبا متن حصوں میں پڑھ کر ایک فائل میں جوڑ دیا جاتا ہے۔",
    privacyNote: "ڈیزائن ہی پرائیویٹ ہے: سب کچھ آپ کے آلے پر ہوتا ہے۔",
    cloneIntro:
      "اپنی آواز کے تقریباً 10 سیکنڈ ریکارڈ کریں، کوئی متن لکھیں، اور اسے اپنی آواز میں بولا ہوا سنیں۔ کلوننگ ہمارے آواز سرور پر چلتی ہے، آپ کے فون پر نہیں۔",
    cloneSetupNote:
      "اس سہولت کو ToolVena آواز سرور چاہیے۔ اگر سرور ابھی جڑا نہیں ہے تو آپ کو نیچے واضح پیغام نظر آئے گا — ہم کبھی جعلی نتیجہ نہیں بناتے۔",
    recordLabel: "1. اپنی آواز ریکارڈ کریں (5–15 سیکنڈ)",
    recordStart: "ریکارڈنگ شروع کریں",
    recordStop: "روکیں",
    recording: "ریکارڈ ہو رہا ہے… ایک دو واضح جملے بولیں۔",
    uploadLabel: "…یا مختصر آواز کلپ اپ لوڈ کریں",
    previewLabel: "آپ کا حوالہ کلپ",
    cloneTextLabel: "2. آپ کی آواز میں بولا جانے والا متن",
    cloneLangLabel: "متن کی بولی جانے والی زبان",
    consent: "یہ میری اپنی آواز ہے (یا میرے پاس بولنے والے کی اجازت ہے) اور میں اسے ذمہ داری سے کلون کرنے پر متفق ہوں۔",
    cloneNow: "میری آواز کلون کریں",
    cloneSending: "آواز سرور کو بھیجا جا رہا ہے… پہلی بار تھوڑا زیادہ وقت لگ سکتا ہے۔",
    cloneDone: "آپ کی کلون شدہ تقریر تیار ہے۔",
    triesLeft: (n: number) => `آج مفت کلون کوششیں باقی: ${n}`,
    triesOver: "آج کی مفت کلون کوششیں ختم ہو گئی ہیں۔ بامعاوضہ منصوبہ روزانہ کی حد ختم کر دیتا ہے۔",
    backendMissing:
      "آواز-کلون سرور ابھی جڑا نہیں ہے، اس لیے کلوننگ رکی हुई ہے۔ اوپر والی مفت قدرتی آوازیں ابھی چل رہی ہیں۔",
    errText: "براہ کرم پہلے کچھ متن لکھیں۔",
    errConsent: "براہ کرم رضامندی خانہ نشان زد کریں — ہم آواز صرف اس کے مالک کی اجازت سے کلون کرتے ہیں۔",
    errRecord: "براہ کرم پہلے مختصر آواز کلپ ریکارڈ یا اپ لوڈ کریں (کم از کم 5 سیکنڈ)۔",
    errMic: "مائیکروفون رسائی روک دی گئی۔ آپ اسے براؤزر میں دے سکتے ہیں، یا اس کے بجائے کلپ اپ لوڈ کریں۔",
    errTooLong: (n: number) => `براہ کرم اسے ایک بار میں ${n} حروف سے کم رکھیں۔`,
    errGenerate: "آواز انجن ختم ہونے سے پہلے رک گیا۔ براہ کرم چھوٹے متن کے ساتھ دوبارہ کوشش کریں۔",
    errLoadModel: "آواز ماڈل اس آلے پر شروع نہیں ہو سکا۔ براہ کرم اپنا کنکشن جانچیں اور بنائیں دوبارہ دبائیں۔",
    errPartial: "آپ کے متن کا صرف پہلا حصہ بولا جا سکا — وہ حصہ نیچے تیار ہے۔ باقی اس آلے پر رک گیا، اس لیے ہم آپ کو بالکل وہی دکھا رہے ہیں جو بنا، کچھ چھپا نہیں۔",
    partProgress: (_done: number, _total: number) => `حصہ ${_done} از ${_total} بولا جا رہا ہے…`,
    errClone: "آواز سرور یہ کلون مکمل نہیں کر سکا۔ کچھ بھی چارج نہیں ہوا — براہ کرم دوبارہ کوشش کریں۔",
    langHonesty:
      "اردو آوازیں ابھی دستیاب نہیں ہیں: جن اوپن آواز ماڈلوں کو ہم قانونی طور پر استعمال کر سکتے ہیں ان میں سے کوئی آج اردو کی حمایت نہیں کرتا۔ ہم جعلی بنانے کے بجائے آپ کو بتانا پسند کرتے ہیں۔",
    freeBannerTitle: "بالکل مفت — لامحدود",
    freeBannerWhy:
      "یہ قدرتی آوازیں آپ کے اپنے فون یا کمپیوٹر کے اندر بنتی ہیں — ہمارا سرور کوئی کام نہیں کرتا، اس لیے ہمارا کوئی بل نہیں، اور یہ درجہ ہمیشہ مفت رہے گا۔",
    cloneBannerTitle: "کلون — یہ بامعاوضہ کیوں ہے؟",
    cloneBannerWhy:
      "آپ کی اصل آواز کی نقالی کو پس پردہ ہمارے بڑے AI کمپیوٹر (GPU سرور) چلانے پڑتے ہیں، اور وہ بل ہم دیتے ہیں — اس لیے مکمل آواز کلوننگ بامعاوضہ ہے۔ ہر کسی کو پھر بھی ہر روز 3 مفت کلون کوششیں ملتی ہیں۔",
    cloneSentenceHint: "نصحیت: قدرتی جملہ پڑھیں، جیسے «السلام علیکم، میرا نام … ہے اور میں اپنی آواز بنانے کے لیے یہ ریکارڈ کر رہا ہوں۔»",
  },
  ur: {
    naturalTab: "Natural awazein — muft",
    cloneTab: "Meri awaz clone karo",
    naturalIntro:
      "Text likhen ya paste karen aur natural awaz me sunen. Awaz ka engine aap ke browser ke andar chalta hai — aap ka text kahin upload nahi hota, aur sign-up bhi nahi chahiye.",
    textLabel: "Aap ka text",
    textPlaceholder: "Yahan kuch likhen, phir Generate dabayen…",
    voiceLabel: "Awaz",
    speedLabel: "Raftaar",
    generate: "Awaz banao",
    generating: "Bol raha hai…",
    modelLoading: "Awaz ka model download ho raha hai (sirf pehli dafa, takreeban 92 MB)…",
    modelReady: "Awaz ka model tayyar hai — browser me mehfooz rahe ga.",
    downloadWav: "WAV download karen",
    erase: "Saaf karen",
    limitNote: "Muft browser darja: aik dafa me 1,000 haroof tak. Lamba text hisson me parh kar aik file me jod diya jata hai.",
    privacyNote: "Design hi private hai: sab kuch aap ke device par hota hai.",
    cloneIntro:
      "Apni awaz ke takreeban 10 second record karen, koi bhi text likhen, aur wohi text apni awaz me sunen. Clone hamare voice server par banta hai, mobile par nahi.",
    cloneSetupNote:
      "Is feature ke liye ToolVena ka voice server chahiye. Agar server abhi connected nahi hua to neeche saaf message nazar aye ga — hum nakli result kabhi nahi dikhate.",
    recordLabel: "1. Apni awaz record karen (5–15 second)",
    recordStart: "Recording shuru karen",
    recordStop: "Rokain",
    recording: "Recording ho rahi hai… aik do saaf jumlay bolen.",
    uploadLabel: "…ya chhota sa voice clip upload kar dein",
    previewLabel: "Aap ka reference clip",
    cloneTextLabel: "2. Jo text apni awaz me sunna hai",
    cloneLangLabel: "Text ki boli janay wali zubaan",
    consent: "Ye meri apni awaz hai (ya bolnay walay ki ijazat hai) aur mein isay zimmedari se clone kar raha hoon.",
    cloneNow: "Meri awaz clone karo",
    cloneSending: "Voice server ko bheja ja raha hai… pehli dafa thora zyada waqt lag sakta hai.",
    cloneDone: "Aap ki clone ki hui awaz tayyar hai.",
    triesLeft: (n: number) => `Aaj ki muft clone koshishen baqi: ${n}`,
    triesOver: "Aaj ki muft clone koshishen khatam. Paid plan me roz ki had nahi hoti.",
    backendMissing:
      "Voice-clone server abhi connected nahi, is liye cloning ruki hui hai. Upar wali natural awazein abhi bhi kaam karti hain.",
    errText: "Pehle kuch text likhen.",
    errConsent: "Baraye meherbani ijazat wala box tick karen — hum awaz usi ki clone karte hain jis ki ijazat ho.",
    errRecord: "Pehle chhota sa voice clip record ya upload karen (kam az kam 5 second).",
    errMic: "Microphone ki ijazat band hai. Browser se ijazat dein, ya clip upload kar dein.",
    errTooLong: (n: number) => `Aik dafa me ${n} haroof se kam rakhen.`,
    errGenerate: "Awaz ka engine darmiyan me ruk gaya. Chhota text likh kar dobara koshish karen.",
    errLoadModel: "Awaz ka model is device par start nahi ho saka. Connection check kar ke Generate dobara dabayen.",
    errPartial: "Aap ke text ka sirf pehla hissa bol saka — woh hissa neeche tayyar hai. Baqi hissa is device par ruk gaya, is liye jo bana hai wohi saaf dikhaya gaya hai, kuch chhupaya nahi gaya.",
    partProgress: (_done: number, _total: number) => `Hissa ${_done} / ${_total} bol raha hai…`,
    errClone: "Voice server ye clone mukammal nahi kar saka. Kuch charge nahi hua — dobara koshish karen.",
    langHonesty:
      "Urdu awazein abhi available nahi: jin open models ko hum qanooni tor par use kar sakte hain, un me Urdu supported nahi. Jhoot bolnay se behtar hai saaf bata dein.",
    cloneSentenceHint: "Tip: natural jumla parhen, jese “Hello, my name is … and I am recording this to create my voice.”",
    freeBannerTitle: "Bilkul FREE — Unlimited",
    freeBannerWhy:
      "Ye natural awazein aap ke apne mobile ya computer ke andar banti hain — humare server ka koi paisa nahi lagta, is liye ye hissa humesha muft rahe ga.",
    cloneBannerTitle: "Clone — paid kyun hai?",
    cloneBannerWhy:
      "Aap ki asal awaz ki nakal banane ke liye humare peeche baray AI computer (GPU server) chalte hain, jin ka bill humein dena padta hai — is liye clone ka mukammal istemal paid hai. Phir bhi har user ko roz 3 muft clone koshishen milti hain.",
  },
  es: {
    naturalTab: "Voces naturales — gratis",
    cloneTab: "Clonar mi voz",
    naturalIntro:
      "Escribe o pega un texto y escúchalo leído en voz alta con una voz natural. El motor de voz funciona dentro de tu navegador: tu texto no se sube a ningún sitio y no hay que registrarse.",
    textLabel: "Tu texto",
    textPlaceholder: "Escribe algo aquí y luego pulsa Generar…",
    voiceLabel: "Voz",
    speedLabel: "Velocidad",
    generate: "Generar voz",
    generating: "Hablando…",
    modelLoading: "Descargando el modelo de voz (solo la primera vez, unos 92 MB)…",
    modelReady: "Modelo listo: se queda guardado en tu navegador.",
    downloadWav: "Descargar WAV",
    erase: "Borrar",
    limitNote: "Nivel gratuito en el navegador: hasta 1.000 caracteres por vez. El texto largo se lee por partes y se junta en un solo archivo.",
    privacyNote: "Privado por diseño: todo ocurre en tu dispositivo.",
    cloneIntro:
      "Graba unos 10 segundos de tu propia voz, escribe el texto que quieras y escúchalo dicho con tu voz. La clonación se hace en nuestro servidor de voz, no en tu móvil.",
    cloneSetupNote:
      "Esta función necesita el servidor de voz de ToolVena. Si todavía no está conectado, verás un mensaje claro aquí abajo: nunca fingimos un resultado.",
    recordLabel: "1. Graba tu voz (5–15 segundos)",
    recordStart: "Empezar a grabar",
    recordStop: "Detener",
    recording: "Grabando… di una o dos frases claras.",
    uploadLabel: "…o sube un clip de voz corto",
    previewLabel: "Tu clip de referencia",
    cloneTextLabel: "2. Texto que quieres oír con tu voz",
    cloneLangLabel: "Idioma hablado del texto",
    consent: "Es mi propia voz (o tengo el permiso de quien habla) y acepto clonarla de forma responsable.",
    cloneNow: "Clonar mi voz",
    cloneSending: "Enviando al servidor de voz… la primera vez puede tardar un poco más.",
    cloneDone: "Tu audio clonado está listo.",
    triesLeft: (n: number) => `Intentos de clonación gratis que te quedan hoy: ${n}`,
    triesOver: "Ya usaste los intentos gratis de hoy. El plan de pago quita el límite diario.",
    backendMissing:
      "El servidor de clonación de voz aún no está conectado, así que la clonación está en pausa. Las voces naturales gratuitas de arriba funcionan ahora mismo.",
    errText: "Escribe primero algún texto.",
    errConsent: "Marca la casilla de permiso: solo clonamos una voz con el permiso de su dueño.",
    errRecord: "Primero graba o sube un clip de voz corto (al menos 5 segundos).",
    errMic: "El acceso al micrófono está bloqueado. Puedes permitirlo en el navegador o subir un clip.",
    errTooLong: (n: number) => `Mantenlo por debajo de ${n} caracteres por vez.`,
    errGenerate: "El motor de voz se detuvo antes de terminar. Prueba con un texto más corto.",
    errClone: "El servidor de voz no pudo terminar esta clonación. No se cobró nada: inténtalo de nuevo.",
    langHonesty:
      "Las voces en urdu aún no están disponibles: ninguno de los modelos de voz abiertos que podemos usar legalmente admite urdu hoy. Preferimos decírtelo a fingirlo.",
    freeBannerTitle: "Totalmente GRATIS — Ilimitado",
    freeBannerWhy:
      "Estas voces naturales se crean dentro de tu propio teléfono u ordenador: nuestro servidor no hace ningún trabajo, no nos cuesta nada, y este nivel será gratis siempre.",
    cloneBannerTitle: "Clonación: ¿por qué es de pago?",
    cloneBannerWhy:
      "Copiar tu voz real necesita nuestros grandes ordenadores con IA (servidores GPU) funcionando en segundo plano, y esa factura la pagamos nosotros; por eso la clonación completa es de pago. Aun así, todo el mundo recibe 3 intentos de clonación gratis cada día.",
    cloneSentenceHint: "Consejo: lee una frase natural, como «Hola, me llamo … y estoy grabando esto para crear mi voz».",
  },
  fr: {
    naturalTab: "Voix naturelles — gratuit",
    cloneTab: "Cloner ma voix",
    naturalIntro:
      "Tape ou colle un texte et écoute-le lu à voix haute avec une voix naturelle. Le moteur vocal tourne dans ton navigateur : ton texte n'est envoyé nulle part et il n'y a aucune inscription.",
    textLabel: "Ton texte",
    textPlaceholder: "Écris quelque chose ici, puis appuie sur Générer…",
    voiceLabel: "Voix",
    speedLabel: "Vitesse",
    generate: "Générer la voix",
    generating: "En train de parler…",
    modelLoading: "Téléchargement du modèle vocal (première fois seulement, environ 92 Mo)…",
    modelReady: "Modèle vocal prêt — il reste en cache dans ton navigateur.",
    downloadWav: "Télécharger le WAV",
    erase: "Effacer",
    limitNote: "Offre gratuite dans le navigateur : jusqu'à 1 000 caractères à la fois. Les textes longs sont lus par morceaux, puis réunis en un seul fichier.",
    privacyNote: "Privé par conception : tout se passe sur ton appareil.",
    cloneIntro:
      "Enregistre environ 10 secondes de ta propre voix, tape le texte que tu veux, et écoute-le dit avec ta voix. Le clonage se fait sur notre serveur vocal, pas sur ton téléphone.",
    cloneSetupNote:
      "Cette fonction a besoin du serveur vocal de ToolVena. S'il n'est pas encore connecté, tu verras un message clair ci-dessous — on ne simule jamais un résultat.",
    recordLabel: "1. Enregistre ta voix (5 à 15 secondes)",
    recordStart: "Lancer l'enregistrement",
    recordStop: "Arrêter",
    recording: "Enregistrement… dis une ou deux phrases claires.",
    uploadLabel: "…ou envoie un court extrait vocal",
    previewLabel: "Ton extrait de référence",
    cloneTextLabel: "2. Texte à dire avec ta voix",
    cloneLangLabel: "Langue parlée du texte",
    consent: "C'est ma propre voix (ou j'ai l'autorisation de la personne) et j'accepte de la cloner de manière responsable.",
    cloneNow: "Cloner ma voix",
    cloneSending: "Envoi au serveur vocal… le premier essai peut prendre un peu plus de temps.",
    cloneDone: "Ton audio cloné est prêt.",
    triesLeft: (n: number) => `Essais de clonage gratuits restants aujourd'hui : ${n}`,
    triesOver: "Les essais gratuits du jour sont épuisés. L'offre payante supprime la limite quotidienne.",
    backendMissing:
      "Le serveur de clonage vocal n'est pas encore connecté, le clonage est donc en pause. Les voix naturelles gratuites ci-dessus fonctionnent dès maintenant.",
    errText: "Écris d'abord un peu de texte.",
    errConsent: "Coche la case d'autorisation — on ne clone une voix qu'avec l'accord de son propriétaire.",
    errRecord: "Enregistre ou envoie d'abord un court extrait vocal (au moins 5 secondes).",
    errMic: "L'accès au micro est bloqué. Tu peux l'autoriser dans le navigateur, ou envoyer un extrait.",
    errTooLong: (n: number) => `Reste sous ${n} caractères à la fois.`,
    errGenerate: "Le moteur vocal s'est arrêté avant la fin. Réessaie avec un texte plus court.",
    errClone: "Le serveur vocal n'a pas pu terminer ce clonage. Rien n'a été facturé — réessaie.",
    langHonesty:
      "Les voix en ourdou ne sont pas encore disponibles : aucun des modèles vocaux ouverts que nous pouvons utiliser légalement ne prend l'ourdou en charge aujourd'hui. On préfère te le dire plutôt que de faire semblant.",
    freeBannerTitle: "Entièrement GRATUIT — Illimité",
    freeBannerWhy:
      "Ces voix naturelles sont créées dans ton propre téléphone ou ordinateur — notre serveur ne fait aucun travail, cela ne nous coûte rien, et cette offre restera toujours gratuite.",
    cloneBannerTitle: "Clonage — pourquoi c'est payant ?",
    cloneBannerWhy:
      "Copier ta vraie voix demande nos gros ordinateurs d'IA (serveurs GPU) qui tournent en coulisses, et c'est nous qui payons la facture — le clonage complet est donc payant. Tout le monde reçoit quand même 3 essais de clonage gratuits chaque jour.",
    cloneSentenceHint: "Astuce : lis une phrase naturelle, comme « Bonjour, je m'appelle … et j'enregistre ceci pour créer ma voix. »",
  },
  de: {
    naturalTab: "Natürliche Stimmen — kostenlos",
    cloneTab: "Meine Stimme klonen",
    naturalIntro:
      "Tippe oder füge Text ein und höre ihn mit natürlicher Stimme vorgelesen. Die Sprach-Engine läuft in deinem Browser — dein Text wird nirgendwo hochgeladen, und du musst dich nicht anmelden.",
    textLabel: "Dein Text",
    textPlaceholder: "Schreib hier etwas und drücke dann auf Erstellen…",
    voiceLabel: "Stimme",
    speedLabel: "Tempo",
    generate: "Stimme erstellen",
    generating: "Spricht…",
    modelLoading: "Sprachmodell wird heruntergeladen (nur beim ersten Mal, ca. 92 MB)…",
    modelReady: "Sprachmodell bereit — es bleibt in deinem Browser gespeichert.",
    downloadWav: "WAV herunterladen",
    erase: "Löschen",
    limitNote: "Kostenlose Browser-Stufe: bis zu 1.000 Zeichen pro Durchgang. Langer Text wird in Teilen vorgelesen und zu einer Datei verbunden.",
    privacyNote: "Privat von Grund auf: Alles passiert auf deinem Gerät.",
    cloneIntro:
      "Nimm etwa 10 Sekunden deiner eigenen Stimme auf, tippe einen Text und höre ihn mit deiner Stimme gesprochen. Das Klonen läuft auf unserem Sprachserver, nicht auf deinem Handy.",
    cloneSetupNote:
      "Diese Funktion braucht den ToolVena-Sprachserver. Ist er noch nicht verbunden, siehst du unten eine klare Meldung — wir täuschen niemals ein Ergebnis vor.",
    recordLabel: "1. Deine Stimme aufnehmen (5–15 Sekunden)",
    recordStart: "Aufnahme starten",
    recordStop: "Stopp",
    recording: "Aufnahme läuft… sprich einen oder zwei klare Sätze.",
    uploadLabel: "…oder einen kurzen Stimmclip hochladen",
    previewLabel: "Dein Referenzclip",
    cloneTextLabel: "2. Text, der mit deiner Stimme gesprochen wird",
    cloneLangLabel: "Gesprochene Sprache des Textes",
    consent: "Das ist meine eigene Stimme (oder ich habe die Erlaubnis der sprechenden Person) und ich klone sie verantwortungsvoll.",
    cloneNow: "Meine Stimme klonen",
    cloneSending: "Wird an den Sprachserver gesendet… der erste Durchlauf kann etwas länger dauern.",
    cloneDone: "Dein geklontes Audio ist fertig.",
    triesLeft: (n: number) => `Kostenlose Klon-Versuche heute übrig: ${n}`,
    triesOver: "Die kostenlosen Klon-Versuche für heute sind aufgebraucht. Der Bezahlplan hebt das Tageslimit auf.",
    backendMissing:
      "Der Stimmklon-Server ist noch nicht verbunden, darum pausiert das Klonen gerade. Die kostenlosen natürlichen Stimmen oben funktionieren schon jetzt.",
    errText: "Bitte schreibe zuerst einen Text.",
    errConsent: "Bitte setze das Erlaubnis-Häkchen — wir klonen eine Stimme nur mit Zustimmung ihres Besitzers.",
    errRecord: "Bitte nimm zuerst einen kurzen Stimmclip auf oder lade einen hoch (mindestens 5 Sekunden).",
    errMic: "Der Mikrofonzugriff wurde blockiert. Du kannst ihn im Browser erlauben oder stattdessen einen Clip hochladen.",
    errTooLong: (n: number) => `Bitte bleib pro Durchgang unter ${n} Zeichen.`,
    errGenerate: "Die Sprach-Engine ist vor dem Ende stehen geblieben. Bitte versuch es mit einem kürzeren Text.",
    errClone: "Der Sprachserver konnte diesen Klon nicht fertigstellen. Es wurde nichts berechnet — bitte versuch es noch einmal.",
    langHonesty:
      "Urdu-Stimmen gibt es noch nicht: Keines der offenen Sprachmodelle, die wir legal nutzen dürfen, unterstützt Urdu heute. Das sagen wir dir lieber ehrlich, statt es vorzutäuschen.",
    freeBannerTitle: "Komplett GRATIS — Unbegrenzt",
    freeBannerWhy:
      "Diese natürlichen Stimmen entstehen in deinem eigenen Handy oder Computer — unser Server arbeitet dafür gar nicht, es kostet uns nichts, und diese Stufe bleibt für immer kostenlos.",
    cloneBannerTitle: "Klonen — warum ist das kostenpflichtig?",
    cloneBannerWhy:
      "Um deine echte Stimme zu kopieren, laufen im Hintergrund unsere großen KI-Computer (GPU-Server), und diese Rechnung zahlen wir — darum ist das vollständige Klonen kostenpflichtig. Trotzdem bekommt jeder jeden Tag 3 kostenlose Klon-Versuche.",
    cloneSentenceHint: "Tipp: Lies einen natürlichen Satz, zum Beispiel „Hallo, ich heiße … und ich nehme das auf, um meine Stimme zu erstellen.“",
  },
  pt: {
    naturalTab: "Vozes naturais — grátis",
    cloneTab: "Clonar a minha voz",
    naturalIntro:
      "Escreve ou cola um texto e ouve-o lido em voz alta com uma voz natural. O motor de voz funciona dentro do teu navegador: o texto nunca sai do dispositivo e não é preciso registo.",
    textLabel: "O teu texto",
    textPlaceholder: "Escreve algo aqui e depois carrega em Gerar…",
    voiceLabel: "Voz",
    speedLabel: "Velocidade",
    generate: "Gerar voz",
    generating: "A falar…",
    modelLoading: "A transferir o modelo de voz (só na primeira vez, cerca de 92 MB)…",
    modelReady: "Modelo de voz pronto — fica guardado no teu navegador.",
    downloadWav: "Transferir WAV",
    erase: "Limpar",
    limitNote: "Nível gratuito no navegador: até 1 000 carateres de cada vez. Textos longos são lidos por partes e juntos num só ficheiro.",
    privacyNote: "Privado por natureza: tudo acontece no teu dispositivo.",
    cloneIntro:
      "Grava cerca de 10 segundos da tua própria voz, escreve o texto que quiseres e ouve-o dito com a tua voz. A clonagem é feita no nosso servidor de voz, não no teu telemóvel.",
    cloneSetupNote:
      "Esta função precisa do servidor de voz da ToolVena. Se ele ainda não estiver ligado, vais ver uma mensagem clara aqui em baixo — nunca fingimos um resultado.",
    recordLabel: "1. Grava a tua voz (5–15 segundos)",
    recordStart: "Começar a gravar",
    recordStop: "Parar",
    recording: "A gravar… diz uma ou duas frases claras.",
    uploadLabel: "…ou envia um clipe de voz curto",
    previewLabel: "O teu clipe de referência",
    cloneTextLabel: "2. Texto para dizer com a tua voz",
    cloneLangLabel: "Língua falada do texto",
    consent: "Esta é a minha própria voz (ou tenho a permissão de quem fala) e aceito cloná-la de forma responsável.",
    cloneNow: "Clonar a minha voz",
    cloneSending: "A enviar para o servidor de voz… a primeira vez pode demorar um pouco mais.",
    cloneDone: "O teu áudio clonado está pronto.",
    triesLeft: (n: number) => `Tentativas de clonagem grátis que te restam hoje: ${n}`,
    triesOver: "As tentativas grátis de hoje acabaram. O plano pago remove o limite diário.",
    backendMissing:
      "O servidor de clonagem de voz ainda não está ligado, por isso a clonagem está em pausa. As vozes naturais gratuitas acima funcionam já.",
    errText: "Escreve primeiro algum texto.",
    errConsent: "Marca a caixa de permissão — só clonamos uma voz com a autorização do dono.",
    errRecord: "Primeiro grava ou envia um clipe de voz curto (pelo menos 5 segundos).",
    errMic: "O acesso ao microfone foi bloqueado. Podes permiti-lo no navegador ou enviar um clipe.",
    errTooLong: (n: number) => `Mantém menos de ${n} carateres de cada vez.`,
    errGenerate: "O motor de voz parou antes de terminar. Tenta com um texto mais curto.",
    errClone: "O servidor de voz não conseguiu terminar esta clonagem. Nada foi cobrado — tenta outra vez.",
    langHonesty:
      "As vozes em urdu ainda não estão disponíveis: nenhum dos modelos de voz abertos que podemos usar legalmente suporta urdu hoje. Preferimos dizer-te isto a fingir.",
    freeBannerTitle: "Totalmente GRÁTIS — Ilimitado",
    freeBannerWhy:
      "Estas vozes naturais são criadas dentro do teu próprio telemóvel ou computador — o nosso servidor não faz trabalho nenhum, não nos custa nada, e este nível será grátis para sempre.",
    cloneBannerTitle: "Clonagem — porque é paga?",
    cloneBannerWhy:
      "Copiar a tua voz verdadeira precisa dos nossos grandes computadores de IA (servidores GPU) a trabalhar nos bastidores, e essa conta pagamos nós — por isso a clonagem completa é paga. Mesmo assim, toda a gente recebe 3 tentativas de clonagem grátis todos os dias.",
    cloneSentenceHint: "Dica: lê uma frase natural, como «Olá, chamo-me … e estou a gravar isto para criar a minha voz.»",
  },
  it: {
    naturalTab: "Voci naturali — gratis",
    cloneTab: "Clona la mia voce",
    naturalIntro:
      "Scrivi o incolla un testo e ascoltalo letto ad alta voce con una voce naturale. Il motore vocale funziona dentro il tuo browser: il testo non viene mai caricato da nessuna parte e non serve registrarsi.",
    textLabel: "Il tuo testo",
    textPlaceholder: "Scrivi qualcosa qui, poi premi Genera…",
    voiceLabel: "Voce",
    speedLabel: "Velocità",
    generate: "Genera voce",
    generating: "Sto parlando…",
    modelLoading: "Scarico il modello vocale (solo la prima volta, circa 92 MB)…",
    modelReady: "Modello vocale pronto — resta salvato nel tuo browser.",
    downloadWav: "Scarica WAV",
    erase: "Cancella",
    limitNote: "Livello gratuito nel browser: fino a 1.000 caratteri alla volta. I testi lunghi vengono letti a pezzi e uniti in un unico file.",
    privacyNote: "Privato per natura: tutto succede sul tuo dispositivo.",
    cloneIntro:
      "Registra circa 10 secondi della tua voce, scrivi il testo che vuoi e ascoltalo detto con la tua voce. La clonazione avviene sul nostro server vocale, non sul tuo telefono.",
    cloneSetupNote:
      "Questa funzione ha bisogno del server vocale di ToolVena. Se non è ancora collegato, vedrai un messaggio chiaro qui sotto — non fingiamo mai un risultato.",
    recordLabel: "1. Registra la tua voce (5–15 secondi)",
    recordStart: "Avvia registrazione",
    recordStop: "Stop",
    recording: "Registrazione in corso… di' una o due frasi chiare.",
    uploadLabel: "…oppure carica una breve clip vocale",
    previewLabel: "La tua clip di riferimento",
    cloneTextLabel: "2. Testo da dire con la tua voce",
    cloneLangLabel: "Lingua parlata del testo",
    consent: "È la mia voce (o ho il permesso di chi parla) e accetto di clonarla in modo responsabile.",
    cloneNow: "Clona la mia voce",
    cloneSending: "Invio al server vocale… la prima volta può volerci un po' di più.",
    cloneDone: "Il tuo audio clonato è pronto.",
    triesLeft: (n: number) => `Tentativi di clonazione gratuiti rimasti oggi: ${n}`,
    triesOver: "I tentativi gratuiti di oggi sono finiti. Il piano a pagamento toglie il limite giornaliero.",
    backendMissing:
      "Il server di clonazione vocale non è ancora collegato, quindi la clonazione è in pausa. Le voci naturali gratuite qui sopra funzionano già ora.",
    errText: "Scrivi prima un po' di testo.",
    errConsent: "Spunta la casella del permesso: cloniamo una voce solo con l'autorizzazione del proprietario.",
    errRecord: "Prima registra o carica una breve clip vocale (almeno 5 secondi).",
    errMic: "L'accesso al microfono è bloccato. Puoi consentirlo nel browser, oppure caricare una clip.",
    errTooLong: (n: number) => `Resta sotto i ${n} caratteri alla volta.`,
    errGenerate: "Il motore vocale si è fermato prima di finire. Riprova con un testo più corto.",
    errClone: "Il server vocale non è riuscito a finire questa clonazione. Non è stato addebitato nulla: riprova.",
    langHonesty:
      "Le voci in urdu non sono ancora disponibili: nessuno dei modelli vocali aperti che possiamo usare legalmente supporta l'urdu oggi. Preferiamo dirtelo piuttosto che fingere.",
    freeBannerTitle: "Completamente GRATIS — Illimitato",
    freeBannerWhy:
      "Queste voci naturali vengono create dentro il tuo telefono o computer: il nostro server non fa alcun lavoro, non ci costa nulla, e questo livello resterà sempre gratuito.",
    cloneBannerTitle: "Clonazione — perché è a pagamento?",
    cloneBannerWhy:
      "Copiare la tua voce vera richiede i nostri grandi computer IA (server GPU) al lavoro dietro le quinte, e quella bolletta la paghiamo noi: per questo la clonazione completa è a pagamento. Tutti ricevono comunque 3 tentativi di clonazione gratuiti ogni giorno.",
    cloneSentenceHint: "Consiglio: leggi una frase naturale, come «Ciao, mi chiamo … e sto registrando questo per creare la mia voce.»",
  },
  tr: {
    naturalTab: "Doğal sesler — ücretsiz",
    cloneTab: "Sesimi klonla",
    naturalIntro:
      "Metni yaz veya yapıştır, doğal bir sesle okunuşunu dinle. Ses motoru tarayıcının içinde çalışır: metnin hiçbir yere yüklenmez, kayıt da gerekmez.",
    textLabel: "Metnin",
    textPlaceholder: "Buraya bir şeyler yaz, sonra Oluştur'a bas…",
    voiceLabel: "Ses",
    speedLabel: "Hız",
    generate: "Ses oluştur",
    generating: "Konuşuyor…",
    modelLoading: "Ses modeli indiriliyor (sadece ilk seferde, yaklaşık 92 MB)…",
    modelReady: "Ses modeli hazır — tarayıcında saklı kalır.",
    downloadWav: "WAV indir",
    erase: "Temizle",
    limitNote: "Ücretsiz tarayıcı katmanı: seferde en fazla 1.000 karakter. Uzun metin parçalar hâlinde okunur ve tek dosyada birleştirilir.",
    privacyNote: "Tasarımı gereği gizli: her şey cihazında olur.",
    cloneIntro:
      "Kendi sesinden yaklaşık 10 saniye kaydet, istediğin metni yaz ve onu kendi sesinle söylenmiş dinle. Klonlama ses sunucumuzda yapılır, telefonunda değil.",
    cloneSetupNote:
      "Bu özellik ToolVena ses sunucusunu gerektirir. Sunucu henüz bağlı değilse aşağıda net bir mesaj görürsün — sonucu asla varmış gibi göstermeyiz.",
    recordLabel: "1. Sesini kaydet (5–15 saniye)",
    recordStart: "Kaydı başlat",
    recordStop: "Durdur",
    recording: "Kaydediliyor… net bir iki cümle söyle.",
    uploadLabel: "…ya da kısa bir ses klibi yükle",
    previewLabel: "Referans klibin",
    cloneTextLabel: "2. Kendi sesinle söylenecek metin",
    cloneLangLabel: "Metnin konuşulan dili",
    consent: "Bu benim kendi sesim (ya da konuşanın izni var) ve sorumlu şekilde klonlanmasını kabul ediyorum.",
    cloneNow: "Sesimi klonla",
    cloneSending: "Ses sunucusuna gönderiliyor… ilk sefer biraz daha uzun sürebilir.",
    cloneDone: "Klonlanmış sesin hazır.",
    triesLeft: (n: number) => `Bugün kalan ücretsiz klon hakkın: ${n}`,
    triesOver: "Bugünkü ücretsiz klon hakların bitti. Ücretli plan günlük sınırı kaldırır.",
    backendMissing:
      "Ses klonlama sunucusu henüz bağlı değil, bu yüzden klonlama duraklatıldı. Yukarıdaki ücretsiz doğal sesler şu an çalışıyor.",
    errText: "Önce biraz metin yaz.",
    errConsent: "Lütfen izin kutusunu işaretle — bir sesi yalnızca sahibinin izniyle klonlarız.",
    errRecord: "Önce kısa bir ses klibi kaydet veya yükle (en az 5 saniye).",
    errMic: "Mikrofon erişimi engellenmiş. Tarayıcıdan izin verebilir ya da klip yükleyebilirsin.",
    errTooLong: (n: number) => `Seferde ${n} karakterin altında tut.`,
    errGenerate: "Ses motoru bitirmeden durdu. Daha kısa bir metinle tekrar dene.",
    errClone: "Ses sunucusu bu klonu tamamlayamadı. Hiçbir ücret alınmadı — tekrar dene.",
    langHonesty:
      "Urduca sesler henüz yok: yasal olarak kullanabildiğimiz açık ses modellerinin hiçbiri bugün Urduca'yı desteklemiyor. Bunu saklamaktansa açıkça söylemeyi tercih ederiz.",
    freeBannerTitle: "Tamamen ÜCRETSİZ — Sınırsız",
    freeBannerWhy:
      "Bu doğal sesler kendi telefonunun veya bilgisayarının içinde oluşturulur: sunucumuz hiç iş yapmaz, bize hiçbir maliyeti yoktur ve bu katman her zaman ücretsiz kalacak.",
    cloneBannerTitle: "Klonlama — neden ücretli?",
    cloneBannerWhy:
      "Gerçek sesini kopyalamak, arka planda çalışan büyük yapay zekâ bilgisayarlarımızı (GPU sunucuları) gerektirir ve o faturayı biz ödüyoruz; bu yüzden tam klonlama ücretlidir. Yine de herkes her gün 3 ücretsiz klon hakkı alır.",
    cloneSentenceHint: "İpucu: doğal bir cümle oku; örneğin “Merhaba, benim adım … ve bunu sesimi oluşturmak için kaydediyorum.”",
  },
  ja: {
    naturalTab: "自然な音声 — 無料",
    cloneTab: "自分の声をクローン",
    naturalIntro:
      "テキストを入力または貼り付けると、自然な声で読み上げます。音声エンジンはあなたのブラウザの中で動きます。テキストがどこかに送信されることはなく、登録も不要です。",
    textLabel: "あなたのテキスト",
    textPlaceholder: "ここに何か入力して「生成」を押してください…",
    voiceLabel: "音声",
    speedLabel: "速度",
    generate: "音声を生成",
    generating: "読み上げ中…",
    modelLoading: "音声モデルをダウンロードしています（初回のみ、約92 MB）…",
    modelReady: "音声モデルの準備ができました。ブラウザに保存されます。",
    downloadWav: "WAVをダウンロード",
    erase: "クリア",
    limitNote: "ブラウザ無料プラン: 1回につき最大1,000文字。長いテキストは分割して読み上げ、1つのファイルにまとめます。",
    privacyNote: "設計からプライベート: すべてがあなたの端末の中で完結します。",
    cloneIntro:
      "自分の声を約10秒録音し、好きなテキストを入力すると、その声で読み上げてくれます。クローンは当社の音声サーバーで行われ、スマホ側では行われません。",
    cloneSetupNote:
      "この機能にはToolVenaの音声サーバーが必要です。まだ接続されていない場合は、下に明確なメッセージが表示されます。結果を偽ることは決してありません。",
    recordLabel: "1. 自分の声を録音（5〜15秒）",
    recordStart: "録音を開始",
    recordStop: "停止",
    recording: "録音中です…はっきりした文を1〜2文話してください。",
    uploadLabel: "…または短い音声クリップをアップロード",
    previewLabel: "参照クリップ",
    cloneTextLabel: "2. 自分の声で読み上げるテキスト",
    cloneLangLabel: "テキストの話し言葉",
    consent: "これは私自身の声です（または話者の許可を得ています）。責任を持ってクローンすることに同意します。",
    cloneNow: "声をクローンする",
    cloneSending: "音声サーバーへ送信中…初回は少し時間がかかることがあります。",
    cloneDone: "クローン音声の準備ができました。",
    triesLeft: (n: number) => `今日の無料クローン回数の残り: ${n}回`,
    triesOver: "今日の無料クローン回数は使い切りました。有料プランでは1日の上限がなくなります。",
    backendMissing:
      "音声クローンサーバーがまだ接続されていないため、クローンは一時停止中です。上の無料の自然な音声は今すぐ使えます。",
    errText: "まずテキストを入力してください。",
    errConsent: "同意のチェックをお願いします。声の持ち主の許可がある場合のみクローンします。",
    errRecord: "まず短い音声クリップを録音またはアップロードしてください（5秒以上）。",
    errMic: "マイクへのアクセスがブロックされています。ブラウザで許可するか、クリップをアップロードしてください。",
    errTooLong: (n: number) => `1回につき${n}文字以内にしてください。`,
    errGenerate: "音声エンジンが途中で止まってしまいました。短いテキストで試してください。",
    errClone: "音声サーバーがこのクローンを完了できませんでした。料金は発生していません。もう一度お試しください。",
    langHonesty:
      "ウルドゥー語の音声はまだ利用できません。私たちが合法的に使えるオープンな音声モデルのいずれも、現在ウルドゥー語に対応していません。偽るより、正直にお伝えします。",
    freeBannerTitle: "完全無料 — 無制限",
    freeBannerWhy:
      "これらの自然な音声は、あなたのスマホやパソコンの中で作られます。当社のサーバーは一切働かないので費用はかからず、このプランはずっと無料のままです。",
    cloneBannerTitle: "クローン — なぜ有料なの？",
    cloneBannerWhy:
      "あなたの本当の声をコピーするには、裏側で動く当社の大型AIコンピューター（GPUサーバー）が必要で、その費用は私たちが負担しています。そのため、完全な音声クローンは有料です。それでも、誰もが毎日3回まで無料でクローンを試せます。",
    cloneSentenceHint: "ヒント:「こんにちは、私の名前は…です。自分の声を作るためにこれを録音しています。」のような自然な文を読んでください。",
  },
  no: {
    naturalTab: "Naturlige stemmer — gratis",
    cloneTab: "Klon stemmen min",
    naturalIntro:
      "Skriv eller lim inn tekst og hør den lest opp med en naturlig stemme. Stemmemotoren kjører inne i nettleseren din — teksten din lastes aldri opp, og du trenger ikke registrere deg.",
    textLabel: "Teksten din",
    textPlaceholder: "Skriv noe her, og trykk på Generer…",
    voiceLabel: "Stemme",
    speedLabel: "Hastighet",
    generate: "Generer stemme",
    generating: "Snakker…",
    modelLoading: "Laster ned stemmemodellen (bare første gang, ca. 92 MB)…",
    modelReady: "Stemmemodellen er klar — den blir lagret i nettleseren din.",
    downloadWav: "Last ned WAV",
    erase: "Tøm",
    limitNote: "Gratis nettlesernivå: opptil 1 000 tegn om gangen. Lang tekst leses i deler og samles til én fil.",
    privacyNote: "Privat med vilje: alt skjer på enheten din.",
    cloneIntro:
      "Ta opp omtrent 10 sekunder av din egen stemme, skriv teksten du vil, og hør den sagt med stemmen din. Kloningen skjer på stemmeserveren vår, ikke på mobilen din.",
    cloneSetupNote:
      "Denne funksjonen trenger ToolVenas stemmeserver. Hvis serveren ikke er koblet til ennå, ser du en tydelig melding nedenfor — vi later aldri som om et resultat finnes.",
    recordLabel: "1. Ta opp stemmen din (5–15 sekunder)",
    recordStart: "Start opptak",
    recordStop: "Stopp",
    recording: "Tar opp … si én eller to tydelige setninger.",
    uploadLabel: "…eller last opp et kort stemmeklipp",
    previewLabel: "Referanseklippet ditt",
    cloneTextLabel: "2. Tekst som skal sies med stemmen din",
    cloneLangLabel: "Talt språk i teksten",
    consent: "Dette er min egen stemme (eller jeg har tillatelse fra den som snakker), og jeg samtykker til å klone den på en ansvarlig måte.",
    cloneNow: "Klon stemmen min",
    cloneSending: "Sender til stemmeserveren … første gang kan ta litt lenger tid.",
    cloneDone: "Den klonede lyden din er klar.",
    triesLeft: (n: number) => `Gratis kloneforsøk igjen i dag: ${n}`,
    triesOver: "Dagens gratis kloneforsøk er brukt opp. Betalingsplanen fjerner det daglige taket.",
    backendMissing:
      "Stemmekloningsserveren er ikke koblet til ennå, så kloning er satt på pause. De gratis naturlige stemmene over fungerer akkurat nå.",
    errText: "Skriv litt tekst først.",
    errConsent: "Kryss av i samtykkeboksen — vi kloner bare en stemme med eierens tillatelse.",
    errRecord: "Ta opp eller last opp et kort stemmeklipp først (minst 5 sekunder).",
    errMic: "Mikrofontilgangen ble blokkert. Du kan tillate den i nettleseren, eller laste opp et klipp i stedet.",
    errTooLong: (n: number) => `Hold deg under ${n} tegn om gangen.`,
    errGenerate: "Stemmemotoren stoppet før den var ferdig. Prøv med en kortere tekst.",
    errClone: "Stemmeserveren klarte ikke å fullføre denne kloningen. Ingenting ble belastet — prøv igjen.",
    langHonesty:
      "Stemmer på urdu er ikke tilgjengelige ennå: ingen av de åpne stemmemodellene vi lovlig kan bruke, støtter urdu i dag. Vi sier det heller rett ut enn å late som.",
    freeBannerTitle: "Helt GRATIS — Ubegrenset",
    freeBannerWhy:
      "Disse naturlige stemmene lages inne i din egen mobil eller datamaskin — serveren vår gjør ingenting, det koster oss ingenting, og dette nivået vil alltid være gratis.",
    cloneBannerTitle: "Kloning — hvorfor er det betalt?",
    cloneBannerWhy:
      "Å kopiere den ekte stemmen din krever de store AI-datamaskinene våre (GPU-servere) som kjører i bakgrunnen, og den regningen betaler vi — derfor er full stemmekloning betalt. Alle får likevel 3 gratis kloneforsøk hver dag.",
    cloneSentenceHint: "Tips: les en naturlig setning, for eksempel «Hei, jeg heter … og jeg spiller inn dette for å lage stemmen min.»",
  },
  nl: {
    naturalTab: "Natuurlijke stemmen — gratis",
    cloneTab: "Kloon mijn stem",
    naturalIntro:
      "Typ of plak tekst en hoor hem voorlezen met een natuurlijke stem. De stemmachine draait in je browser: je tekst wordt nergens naartoe gestuurd en je hoeft je niet aan te melden.",
    textLabel: "Jouw tekst",
    textPlaceholder: "Typ hier iets en druk daarna op Genereer…",
    voiceLabel: "Stem",
    speedLabel: "Snelheid",
    generate: "Stem genereren",
    generating: "Aan het spreken…",
    modelLoading: "Stemmodel wordt gedownload (alleen de eerste keer, ongeveer 92 MB)…",
    modelReady: "Stemmodel klaar — het blijft bewaard in je browser.",
    downloadWav: "WAV downloaden",
    erase: "Wissen",
    limitNote: "Gratis browserniveau: tot 1.000 tekens per keer. Lange tekst wordt in stukken voorgelezen en samengevoegd tot één bestand.",
    privacyNote: "Privé van opzet: alles gebeurt op je eigen apparaat.",
    cloneIntro:
      "Neem ongeveer 10 seconden van je eigen stem op, typ de tekst die je wilt, en hoor hem uitgesproken met jouw stem. Het klonen gebeurt op onze stemserver, niet op je telefoon.",
    cloneSetupNote:
      "Voor deze functie is de stemserver van ToolVena nodig. Is de server nog niet verbonden, dan zie je hieronder een duidelijke melding — we doen nooit alsof er een resultaat is.",
    recordLabel: "1. Neem je stem op (5–15 seconden)",
    recordStart: "Opname starten",
    recordStop: "Stoppen",
    recording: "Bezig met opnemen… spreek één of twee duidelijke zinnen.",
    uploadLabel: "…of upload een korte stemclip",
    previewLabel: "Je referentieclip",
    cloneTextLabel: "2. Tekst die met jouw stem wordt uitgesproken",
    cloneLangLabel: "Gesproken taal van de tekst",
    consent: "Dit is mijn eigen stem (of ik heb toestemming van de spreker) en ik ga akkoord met verantwoord klonen.",
    cloneNow: "Kloon mijn stem",
    cloneSending: "Verzenden naar de stemserver… de eerste keer kan iets langer duren.",
    cloneDone: "Je gekloonde audio is klaar.",
    triesLeft: (n: number) => `Gratis kloonpogingen over vandaag: ${n}`,
    triesOver: "De gratis kloonpogingen van vandaag zijn op. Het betaalde plan heft de dagelijkse limiet op.",
    backendMissing:
      "De stemkloonserver is nog niet verbonden, dus klonen is gepauzeerd. De gratis natuurlijke stemmen hierboven werken nu meteen.",
    errText: "Schrijf eerst wat tekst.",
    errConsent: "Vink het toestemmingsvakje aan — we klonen een stem alleen met toestemming van de eigenaar.",
    errRecord: "Neem eerst een korte stemclip op of upload er een (minstens 5 seconden).",
    errMic: "Microfoontoegang is geblokkeerd. Je kunt hem in de browser toestaan, of in plaats daarvan een clip uploaden.",
    errTooLong: (n: number) => `Houd het per keer onder de ${n} tekens.`,
    errGenerate: "De stemmachine stopte voordat hij klaar was. Probeer het met een kortere tekst.",
    errClone: "De stemserver kon deze kloon niet afmaken. Er is niets in rekening gebracht — probeer het opnieuw.",
    langHonesty:
      "Stemmen in het Urdu zijn nog niet beschikbaar: geen van de open stemmodellen die wij legaal mogen gebruiken, ondersteunt Urdu op dit moment. Dat vertellen we je liever eerlijk dan dat we doen alsof.",
    freeBannerTitle: "Helemaal GRATIS — Onbeperkt",
    freeBannerWhy:
      "Deze natuurlijke stemmen worden in je eigen telefoon of computer gemaakt — onze server doet helemaal niets, het kost ons niets, en dit niveau blijft altijd gratis.",
    cloneBannerTitle: "Klonen — waarom is dat betaald?",
    cloneBannerWhy:
      "Je echte stem kopiëren vraagt om onze grote AI-computers (GPU-servers) die op de achtergrond draaien, en die rekening betalen wij — daarom is volledig stemklonen betaald. Iedereen krijgt toch elke dag 3 gratis kloonpogingen.",
    cloneSentenceHint: "Tip: lees een natuurlijke zin, bijvoorbeeld 'Hallo, mijn naam is … en ik neem dit op om mijn stem te maken.'",
  },
};

// Split long text into sentence-sized chunks so the browser model stays
// responsive; the WAV parts are then joined into one file.
function splitIntoChunks(text: string, maxLen = 280): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…。！？\n]+[.!?…。！？]*[\u0022\u0027\u201D\u2019\u00BB\u0029]*\s*/g) || [clean];
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
  return chunks;
}

// Encode 24 kHz mono Float32 PCM into a downloadable WAV blob.
function encodeWavBlob(samples: Float32Array, sampleRate = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);          // PCM
  view.setUint16(22, 1, true);          // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: "audio/wav" });
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadTriesLeft(): number {
  try {
    const raw = window.localStorage.getItem("vc_clone_tries");
    if (!raw) return FREE_CLONE_TRIES_PER_DAY;
    const parsed = JSON.parse(raw);
    if (parsed.date !== todayKey()) return FREE_CLONE_TRIES_PER_DAY;
    return Math.max(0, FREE_CLONE_TRIES_PER_DAY - (parsed.used || 0));
  } catch {
    return FREE_CLONE_TRIES_PER_DAY;
  }
}

function spendTry(): number {
  const left = loadTriesLeft();
  const used = FREE_CLONE_TRIES_PER_DAY - left + 1;
  try {
    window.localStorage.setItem("vc_clone_tries", JSON.stringify({ date: todayKey(), used }));
  } catch { /* private mode — counter simply resets */ }
  return Math.max(0, FREE_CLONE_TRIES_PER_DAY - used);
}

export function VoiceClonerWorkspace({ selectedLanguage = "en" }: VoiceClonerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const s: Record<string, any> = { ...(STRINGS.en as any), ...((STRINGS[selectedLanguage] as any) || {}) };
  const seoTitle = (t as any)?.seo?.voiceClonerTitle || "AI Voice Cloner — Natural Voices Free, Clone Your Own Voice";

  const [tier, setTier] = useState<Tier>("natural");

  // ---- natural (Kokoro) state ----
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState("af_heart");
  const [speed, setSpeed] = useState(1);
  const [nPhase, setNPhase] = useState<NaturalPhase>("idle");
  const [modelPct, setModelPct] = useState<number | null>(null);
  const [naturalUrl, setNaturalUrl] = useState<string>("");
  const [naturalError, setNaturalError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [chunkInfo, setChunkInfo] = useState("");

  const ttsRef = useRef<any>(null);
  const ttsPromiseRef = useRef<Promise<any> | null>(null);
  const ttsDevRef = useRef<string>("wasm");
  const naturalAudioRef = useRef<HTMLAudioElement | null>(null);
  const naturalUrlRef = useRef<string>("");

  // ---- clone (Chatterbox backend) state ----
  const cloneApi = ((import.meta as any).env?.VITE_CLONE_API_URL as string | undefined) || "";
  const [cPhase, setCPhase] = useState<ClonePhase>("idle");
  const [recordUrl, setRecordUrl] = useState("");
  const [recordSecs, setRecordSecs] = useState(0);
  const [consent, setConsent] = useState(false);
  const [cloneText, setCloneText] = useState("");
  const [cloneLang, setCloneLang] = useState("en");
  const [cloneUrl, setCloneUrl] = useState("");
  const [cloneError, setCloneError] = useState("");
  const [triesLeft, setTriesLeft] = useState<number>(FREE_CLONE_TRIES_PER_DAY);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const recordBlobRef = useRef<Blob | null>(null);
  const cloneUrlRef = useRef<string>("");
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTriesLeft(loadTriesLeft());
    return () => {
      if (recordTimerRef.current) window.clearInterval(recordTimerRef.current);
      recorderRef.current?.stream?.getTracks().forEach((tr) => tr.stop());
      if (naturalUrlRef.current) URL.revokeObjectURL(naturalUrlRef.current);
      if (cloneUrlRef.current) URL.revokeObjectURL(cloneUrlRef.current);
    };
  }, []);

  const charCount = text.length;
  const cloneCharCount = cloneText.length;

  const setNaturalObjectUrl = (blob: Blob) => {
    if (naturalUrlRef.current) URL.revokeObjectURL(naturalUrlRef.current);
    const url = URL.createObjectURL(blob);
    naturalUrlRef.current = url;
    setNaturalUrl(url);
  };

  // ----------------------- natural tier: Kokoro in the browser -------------
  // kokoro-js is a lazy npm dependency (see PLAN.md): it is only downloaded
  // when a visitor first presses Generate, never in the initial page bundle.
  // Bundled by Vite as an async chunk on purpose (no @vite-ignore: a bare
  // specifier would not resolve in a production browser).
  const loadKokoro = async (mod: any, device: "webgpu" | "wasm"): Promise<any> => {
    const KokoroTTS = mod.KokoroTTS || mod.default?.KokoroTTS;
    if (!KokoroTTS) throw new Error("kokoro-js export not found");
    return KokoroTTS.from_pretrained(KOKORO_MODEL_ID, {
      dtype: "q8", // ~92 MB quantised build — small enough to cache on phones
      device,
      progress_callback: (data: any) => {
        if (!data) return;
        if (data.status === "progress" && typeof data.progress === "number") {
          setModelPct(Math.round(data.progress));
        } else if (data.status === "ready") {
          setModelPct(100);
        }
      },
    });
  };

  // The model is ~92 MB and first-load session init can stall indefinitely
  // on some phones (notably WebGPU session creation that never resolves and
  // never throws). Without a timeout the UI sits on "Downloading…" forever
  // and no error ever appears — so cap the wait and let the existing
  // webgpu→wasm fallback / error message handle the rest.
  const MODEL_LOAD_TIMEOUT_MS = 300_000;
  const GENERATE_TIMEOUT_MS = 240_000; // per ~280-char chunk; a stalled ONNX session must end in a visible error, not endless "Speaking…"
  const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("model load timeout")), ms),
      ),
    ]);

  const getTts = (forceWasm = false): Promise<any> => {
    if (ttsRef.current && (!forceWasm || ttsDevRef.current === "wasm")) return Promise.resolve(ttsRef.current);
    // Share ONE in-flight load between the on-arrival prefetch and Generate —
    // the 92 MB model must never download twice.
    if (ttsPromiseRef.current && !forceWasm) return ttsPromiseRef.current;
    const p = (async () => {
      setNPhase("loading-model");
      setModelPct(0);
      const mod: any = await import("kokoro-js");
      // "gpu in navigator" is NOT enough: on many devices (headless browsers,
      // blocklisted GPUs, some Android builds) requestAdapter() returns null,
      // and choosing webgpu there used to explode AFTER the 92 MB download.
      // Only take the WebGPU path when a real adapter answers.
      let device: "webgpu" | "wasm" = "wasm";
      if (!forceWasm && typeof navigator !== "undefined" && "gpu" in navigator) {
        try {
          const adapter = await (navigator as any).gpu.requestAdapter();
          if (adapter) device = "webgpu";
        } catch { /* no usable adapter — stay on the safe wasm path */ }
      }
      try {
        const tts = await withTimeout(loadKokoro(mod, device), MODEL_LOAD_TIMEOUT_MS);
        ttsRef.current = tts;
        ttsDevRef.current = device;
        return tts;
      } catch (err) {
        // never keep a broken instance around; one automatic retry on wasm
        ttsRef.current = null;
        if (device === "webgpu") return getTts(true);
        throw err;
      }
    })();
    ttsPromiseRef.current = p;
    const clear = () => { if (ttsPromiseRef.current === p) ttsPromiseRef.current = null; };
    p.then(clear, clear);
    return p;
  };

  // Owner requirement (2026-10-10): the one-time ~92 MB download must start
  // on its own as soon as the visitor arrives on this page — not only after
  // pressing Generate. Deferred just past first paint, and it goes through
  // the same shared getTts() load, so progress (%) is the real one and a
  // Generate press during prefetch simply awaits the same promise. If the
  // model is already in the browser cache, the load resolves from cache and
  // the "model ready" line appears with no network wait.
  useEffect(() => {
    let cancelled = false;
    const settle = () => {
      if (!cancelled) setNPhase((ph) => (ph === "loading-model" ? "idle" : ph));
    };
    const kick = () => { if (!cancelled) void getTts().then(settle, settle); };
    const ric: any = (window as any).requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(kick, { timeout: 2500 });
      return () => { cancelled = true; (window as any).cancelIdleCallback?.(id); };
    }
    const id = window.setTimeout(kick, 800);
    return () => { cancelled = true; window.clearTimeout(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // kokoro-js generate() resolves a transformers RawAudio: the samples live
  // on `.audio` (24 kHz) — older code read `.data`, which is always undefined,
  // so every generation ended as "empty audio". Read `.audio` first and
  // accept typed/plain arrays either way.
  const readSamples = (audio: any): Float32Array => {
    const raw = audio?.audio ?? audio?.data;
    if (raw instanceof Float32Array) return raw;
    if (raw && typeof raw.length === "number") {
      try { return Float32Array.from(raw as any); } catch { /* fall through */ }
    }
    return new Float32Array(0);
  };

  const generateNatural = async () => {
    setNaturalError("");
    setChunkInfo("");
    const clean = text.trim();
    if (!clean) { setNaturalError(s.errText); return; }
    if (clean.length > NATURAL_MAX_CHARS) {
      setNaturalError(s.errTooLong(NATURAL_MAX_CHARS));
      return;
    }
    let tts: any;
    try {
      tts = await getTts();
    } catch (err) {
      console.error("Kokoro model load failed", err);
      setNPhase("error");
      setNaturalError(s.errLoadModel || s.errGenerate);
      return;
    }
    setNPhase("generating");
    const chunks = splitIntoChunks(clean);
    const parts: Float32Array[] = [];
    let total = 0;
    let partial = false;
    let retried = false;
    for (let i = 0; i < chunks.length; i++) {
      if (chunks.length > 1 && typeof s.partProgress === "function") {
        setChunkInfo(s.partProgress(i + 1, chunks.length));
      }
      try {
        const audio: any = await withTimeout(tts.generate(chunks[i], { voice: voiceId, speed }), GENERATE_TIMEOUT_MS);
        const data = readSamples(audio);
        if (!data.length) throw new Error("empty audio");
        parts.push(data);
        total += data.length;
      } catch (err) {
        console.error("Kokoro generation failed", err);
        // evict the broken session so the next press starts clean
        ttsRef.current = null;
        if (!retried) {
          // one automatic retry on the universally-safe wasm path
          retried = true;
          try { tts = await getTts(true); i--; continue; } catch { /* give up below */ }
        }
        partial = parts.length > 0;
        if (!partial) {
          setChunkInfo("");
          setNPhase("error");
          setNaturalError(s.errGenerate);
          return;
        }
        break; // keep what was honestly made; report it as partial below
      }
    }
    setChunkInfo("");
    if (!total) {
      setNPhase("error");
      setNaturalError(s.errGenerate);
      return;
    }
    const joined = new Float32Array(total);
    let offset = 0;
    for (const p of parts) { joined.set(p, offset); offset += p.length; }
    try {
      setNaturalObjectUrl(encodeWavBlob(joined, 24000));
    } catch (err) {
      // last-resort guard: the button must always resolve to a player or a
      // visible error — never stay on "Speaking…" with no sound.
      console.error("WAV encode failed", err);
      setChunkInfo("");
      setNPhase("error");
      setNaturalError(s.errGenerate);
      return;
    }
    setNPhase("ready");
    if (partial) setNaturalError(s.errPartial || s.errGenerate);
  };

  const togglePlay = () => {
    const el = naturalAudioRef.current;
    if (!el) return;
    if (el.paused) { void el.play(); } else { el.pause(); }
  };

  // ----------------------- clone tier: Chatterbox backend ------------------
  const stopRecording = () => {
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  };

  const startRecording = async () => {
    setCloneError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      recordChunksRef.current = [];
      setRecordSecs(0);
      rec.ondataavailable = (e) => { if (e.data.size) recordChunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const blob = new Blob(recordChunksRef.current, { type: rec.mimeType || "audio/webm" });
        recordBlobRef.current = blob;
        if (recordUrl) URL.revokeObjectURL(recordUrl);
        setRecordUrl(URL.createObjectURL(blob));
        setCPhase("recorded");
      };
      rec.start();
      setCPhase("recording");
      recordTimerRef.current = window.setInterval(() => {
        setRecordSecs((prev) => {
          if (prev + 1 >= MAX_RECORD_SECONDS) stopRecording();
          return prev + 1;
        });
      }, 1000);
    } catch {
      setCPhase("error");
      setCloneError(s.errMic);
    }
  };

  const handleUpload = (file: File | undefined) => {
    if (!file) return;
    setCloneError("");
    recordBlobRef.current = file;
    if (recordUrl) URL.revokeObjectURL(recordUrl);
    setRecordUrl(URL.createObjectURL(file));
    setRecordSecs(0);
    setCPhase("recorded");
  };

  const generateClone = async () => {
    setCloneError("");
    if (!cloneApi) { setCloneError(s.backendMissing); return; }
    if (!recordBlobRef.current) { setCloneError(s.errRecord); setCPhase("error"); return; }
    if (recordSecs > 0 && recordSecs < MIN_RECORD_SECONDS) { setCloneError(s.errRecord); setCPhase("error"); return; }
    const clean = cloneText.trim();
    if (!clean) { setCloneError(s.errText); return; }
    if (clean.length > CLONE_MAX_CHARS) { setCloneError(s.errTooLong(CLONE_MAX_CHARS)); return; }
    if (!consent) { setCloneError(s.errConsent); return; }
    if (triesLeft <= 0) { setCloneError(s.triesOver); return; }

    try {
      setCPhase("sending");
      const form = new FormData();
      form.append("text", clean);
      form.append("language_id", cloneLang);
      form.append("exaggeration", "0.5");
      form.append("cfg_weight", "0.5");
      const ref = recordBlobRef.current;
      const ext = ref.type.includes("mp4") ? "m4a" : ref.type.includes("wav") ? "wav" : ref.type.includes("mpeg") ? "mp3" : "webm";
      form.append("ref_audio", ref, `reference.${ext}`);

      const res = await fetch(`${cloneApi.replace(/\/$/, "")}/clone`, { method: "POST", body: form });
      if (!res.ok) {
        let detail = "";
        try { detail = (await res.json())?.detail || ""; } catch { /* keep generic */ }
        throw new Error(detail || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      if (cloneUrlRef.current) URL.revokeObjectURL(cloneUrlRef.current);
      const url = URL.createObjectURL(blob);
      cloneUrlRef.current = url;
      setCloneUrl(url);
      setTriesLeft(spendTry());
      setCPhase("done");
    } catch (err) {
      console.error("Clone request failed", err);
      setCPhase("error");
      setCloneError(s.errClone);
    }
  };

  const voiceGroups = useMemo(() => KOKORO_LANGUAGES, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-3 sm:px-6">
      <MobileToolHero toolId="voiceCloner" selectedLanguage={selectedLanguage} />

      <h1 className="sr-only">{seoTitle}</h1>

      {/* Tier switch */}
      <div className="mb-4 flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setTier("natural")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            tier === "natural"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Volume2 className="h-4 w-4" /> {s.naturalTab}
        </button>
        <button
          type="button"
          onClick={() => setTier("clone")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            tier === "clone"
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          <Wand2 className="h-4 w-4" /> {s.cloneTab}
        </button>
      </div>

      {tier === "natural" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-4 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-200">✅ {s.freeBannerTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-800 dark:text-emerald-100">{s.freeBannerWhy}</p>
          </div>
          <p className="mb-4 flex gap-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <span>{s.naturalIntro}</span>
          </p>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {s.textLabel}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={s.textPlaceholder}
            rows={5}
            className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-[15px] leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>{charCount} / {NATURAL_MAX_CHARS}</span>
            <button
              type="button"
              onClick={() => { setText(""); setNaturalUrl(""); setNPhase("idle"); }}
              className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-rose-500"
            >
              <Eraser className="h-3.5 w-3.5" /> {s.erase}
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {s.voiceLabel}
              </label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
              >
                {voiceGroups.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.voices.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Gauge className="h-3.5 w-3.5" /> {s.speedLabel}: {speed.toFixed(2)}×
              </label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.25}
                value={speed}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSpeed(v);
                  if (naturalAudioRef.current) naturalAudioRef.current.playbackRate = v;
                }}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {nPhase === "loading-model" && (
            <div className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
              {s.modelLoading} {modelPct !== null && modelPct < 100 ? `${modelPct}%` : ""}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${modelPct ?? 5}%` }} />
              </div>
            </div>
          )}
          {nPhase !== "loading-model" && ttsRef.current && (
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Check className="h-3.5 w-3.5" /> {s.modelReady}
            </p>
          )}
          {naturalError && (
            <p className="mt-3 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {naturalError}
            </p>
          )}

          <button
            type="button"
            onClick={generateNatural}
            disabled={nPhase === "loading-model" || nPhase === "generating"}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Volume2 className="h-4 w-4" />
            {nPhase === "generating" || nPhase === "loading-model" ? s.generating : s.generate}
          </button>
          {nPhase === "generating" && chunkInfo && (
            <p className="mt-2 text-xs font-medium text-indigo-700">{chunkInfo}</p>
          )}

          {naturalUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-500"
                aria-label="Play / pause"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <audio
                ref={naturalAudioRef}
                src={naturalUrl}
                controls
                className="min-w-0 flex-1"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => { e.currentTarget.playbackRate = speed; }}
              />
              <a
                href={naturalUrl}
                download="toolvena-voice.wav"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                <Download className="h-3.5 w-3.5" /> {s.downloadWav}
              </a>
            </div>
          )}

          <p className="mt-4 flex gap-2 text-xs leading-relaxed text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{s.privacyNote} {s.limitNote}</span>
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-4 rounded-xl bg-amber-50 p-3 dark:bg-amber-950">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-100">💎 {s.cloneBannerTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-50">{s.cloneBannerWhy}</p>
          </div>
          <p className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.cloneIntro}</p>
          <p className="mb-4 flex gap-2 text-xs leading-relaxed text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <span>{s.cloneSetupNote}</span>
          </p>

          {!cloneApi && (
            <p className="mb-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {s.backendMissing}
            </p>
          )}

          <span className="mb-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
            {triesLeft > 0 ? s.triesLeft(triesLeft) : s.triesOver}
          </span>

          <label className="mb-1 mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {s.recordLabel}
          </label>
          <p className="mb-2 text-xs text-slate-500">{s.cloneSentenceHint}</p>
          <div className="flex flex-wrap items-center gap-3">
            {cPhase !== "recording" ? (
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-rose-500"
              >
                <Mic className="h-4 w-4" /> {s.recordStart}
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white shadow"
              >
                <Square className="h-4 w-4" /> {s.recordStop} · {recordSecs}s
              </button>
            )}
            <button
              type="button"
              onClick={() => uploadRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <UploadCloud className="h-4 w-4" /> {s.uploadLabel}
            </button>
            <input
              ref={uploadRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
          </div>
          {cPhase === "recording" && <p className="mt-2 text-sm font-medium text-rose-600">{s.recording}</p>}

          {recordUrl && (
            <div className="mt-3">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                {s.previewLabel} {recordSecs > 0 ? `(${recordSecs}s)` : ""}
              </span>
              <audio src={recordUrl} controls className="w-full" />
            </div>
          )}

          <label className="mb-1 mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {s.cloneTextLabel}
          </label>
          <textarea
            value={cloneText}
            onChange={(e) => setCloneText(e.target.value)}
            rows={3}
            className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-3 text-[15px] leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800"
          />
          <div className="mt-1 text-right text-xs text-slate-500">{cloneCharCount} / {CLONE_MAX_CHARS}</div>

          <div className="mt-3 max-w-xs">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {s.cloneLangLabel}
            </label>
            <select
              value={cloneLang}
              onChange={(e) => setCloneLang(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-600 dark:bg-slate-800"
            >
              {CLONE_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-indigo-600"
            />
            <span>{s.consent}</span>
          </label>

          {cloneError && (
            <p className="mt-3 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-200">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {cloneError}
            </p>
          )}

          <button
            type="button"
            onClick={generateClone}
            disabled={cPhase === "sending" || cPhase === "recording"}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Wand2 className="h-4 w-4" />
            {cPhase === "sending" ? s.cloneSending : s.cloneNow}
          </button>

          {cloneUrl && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <p className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                <Check className="h-4 w-4" /> {s.cloneDone}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <audio src={cloneUrl} controls className="min-w-0 flex-1" />
                <a
                  href={cloneUrl}
                  download="toolvena-my-voice.wav"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Download className="h-3.5 w-3.5" /> {s.downloadWav}
                </a>
              </div>
            </div>
          )}
        </section>
      )}

      <p className="mt-4 flex gap-2 rounded-xl bg-slate-100 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Info className="h-4 w-4 shrink-0 text-indigo-500" />
        <span>{s.langHonesty}</span>
      </p>

      <ToolGuideSection toolId="voiceCloner" selectedLanguage={selectedLanguage} />
    </div>
  );
}
