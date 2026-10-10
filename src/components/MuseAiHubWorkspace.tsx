import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  HelpCircle,
  Info,
  ListChecks,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { LanguageCode } from "../types";
import {
  MUSE_CHECKED_DATE,
  MUSE_COUNTRIES,
  MUSE_OFFICIAL_JOIN_URL,
  MUSE_OFFICIAL_URL,
  MuseCountry,
  MuseCountryStatus,
  REPORTED_UNVERIFIED,
  VERIFIED_AVAILABLE,
  museCountryStatus,
} from "../data/museAiData";

// ===========================================================================
// Tool #54 — Muse AI Hub (availability checker + tokens info + prompt helper
// + FAQ). English-first stage (Stage 1 of the staged-publish rule); other
// languages fall back to English until written in the panel.
//
// Amanat rules built into this component:
// - "Available" is shown ONLY for countries Meta itself has announced
//   (verified against Meta's own pages, checked 10 October 2026).
// - Third-party claims show as "not confirmed" — never as available.
// - No VPN or region-workaround advice anywhere (that would break Meta's terms).
// - Token/package amounts that Meta has not published are labelled as
//   unverified third-party claims, never as fact.
// - The prompt helper is an honest in-browser template — no AI claim.
// - Disclaimer: an independent tool, not affiliated with Meta.
// ===========================================================================

interface MuseAiHubWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type HubTab = "availability" | "tokens" | "prompt" | "faq";

const STRINGS: Partial<Record<LanguageCode, Record<string, any>>> = {
  en: {
    tabs: {
      availability: "Availability checker",
      tokens: "Tokens & plans",
      prompt: "Prompt helper",
      faq: "FAQs",
    },
    disclaimerShort: "Independent tool — not affiliated with Meta.",
    notAffiliated:
      "ToolVena is an independent tools website. This page is not affiliated with, sponsored by, or endorsed by Meta Platforms, Inc. Muse and Meta AI belong to Meta; the final source for availability is always Meta's own pages.",
    // --- availability ---
    availTitle: "Is Muse AI available in your country?",
    availIntro:
      "Pick your country to get a clear, date-checked answer. We mark a country as available only when Meta itself has announced it — and we tell you honestly when it has not.",
    verifiedBar:
      `Verified from Meta's own announcements (last checked ${MUSE_CHECKED_DATE}): Muse is officially available in the United States and Canada only. Meta has announced no other launch country and no dates for anywhere else.`,
    searchLabel: "Your country",
    searchPlaceholder: "Type your country name…",
    quickLabel: "Popular checks:",
    statusAvailable: "Available now",
    statusUnverified: "Not confirmed by Meta",
    statusNotYet: "Not yet available",
    availableBody: (name: string) =>
      `Meta officially launched Muse in ${name}. You can sign up for it through Meta's own site — no invite code, VPN, or workaround is needed.`,
    unverifiedBody: (name: string) =>
      `Some third-party websites report that Muse is available in ${name}, but Meta's own pages do not list ${name} yet (checked ${MUSE_CHECKED_DATE}). Treat it as not officially available until Meta says so.`,
    notYetBody: (name: string) =>
      `Meta has not launched Muse in ${name} and has published no launch date for it (checked ${MUSE_CHECKED_DATE}). Anyone promising you instant access another way is not following Meta's rules.`,
    joinCta: "Go to muse.ai (official)",
    joinNote:
      "Signing in at muse.ai is the official route: if a waitlist exists for your region you will see it there. We recommend never paying a third party for 'early access' or entering your Meta login anywhere except Meta's own domains and official apps.",
    altTitle: "While you wait — honest options today",
    altIntro: (name: string) =>
      `Nothing here pretends to be Muse, and nothing here bends Meta's rules. These are the honest choices while Muse is not yet in ${name}:`,
    altMetaAi:
      "Meta AI is a different Meta assistant that lives inside WhatsApp, Instagram, Facebook and Messenger. Availability varies by country; if it is in your apps, it can answer questions and draft text today — it is not Muse, but it is genuinely from Meta.",
    altTools:
      "For everyday jobs that do work right now, free in your browser with no sign-up, you can use ToolVena's Voice Cloner (listen to text aloud), Audio to Text converter, Background Remover, Word Counter and 50+ other tools — all in 11 languages.",
    checkedLine: (name: string) =>
      `Status for ${name} · Checked ${MUSE_CHECKED_DATE} · Source: Meta announcements (about.fb.com, 8 & 29 Sep 2026) and muse.ai.`,
    // --- tokens ---
    tokensTitle: "Muse tokens & plans — what is officially known",
    tokensIntro:
      "People search a lot for '1 billion tokens', invite codes and package prices. Here is the honest state of it: what Meta has actually published, and what is only third-party talk.",
    freeTitle: "Is Muse free?",
    freeBody:
      "Yes — Meta's official FAQ says Muse is available for free with a usage limit, and that you can upgrade to a paid subscription for higher limits, or simply wait until the free limit refreshes. Meta describes Muse as 'free for most of what people need, with subscription plans for people who want to do more.'",
    tokenDefTitle: "What is a 'token'?",
    tokenDefBody:
      "A token is a unit of usage — a way of measuring how much work Muse does for you (a message, a search, a task). Reaching your token allowance is like using up the minutes on a prepaid phone plan. Tokens are not money, not cryptocurrency, and you cannot cash them in or send them to anyone.",
    inviteTitle: "About '1 billion token' invite-code claims",
    inviteBody:
      "Search results and blog posts claim invite codes worth '1 billion tokens' and plans with exact weekly token amounts. When we checked Meta's official pages and help pages on 10 October 2026, Meta did not publish any invite-code program or concrete token amounts there. So we do not list amounts or codes as fact. If Meta ever offers anything like that officially, it will appear inside the Muse app or at muse.ai — and we will update this page with the date.",
    inviteWarn:
      "Be careful: sites asking you to log in with your Meta account to 'redeem a code', or charging money for an invite, are asking you to hand over your account. Never do that.",
    checkedTokens: `Checked against Meta's official pages on ${MUSE_CHECKED_DATE}. If Meta publishes official token amounts, this page will show them with their date.`,
    // --- prompt helper ---
    promptTitle: "Muse AI prompt helper",
    promptIntro:
      "Type your goal the way you would say it, answer a few short questions, and get a clear, well-structured prompt you can paste into Muse (or any AI assistant). This works even before Muse launches in your country.",
    honestNote:
      "Honest note: this helper is a fixed template that runs in your browser — it is not an AI, it does not learn, and nothing you type is sent anywhere or stored. It simply arranges your own words into a clear instruction.",
    goalTypeLabel: "What kind of job is it?",
    goalLabel: "Your goal, in your own words",
    goalPlaceholder: "e.g. Plan a 3-day family trip to Naran under a set budget",
    contextLabel: "Anything Muse should know first (optional)",
    contextPlaceholder: "e.g. Travelling with two kids; one is 5. We eat halal only. We have a mid-range car.",
    detailsLabel: "Details Muse must respect (optional)",
    detailsPlaceholder: "e.g. Budget: stay mid-range. Dates: last week of December. No overnight driving.",
    formatLabel: "How should the answer look?",
    toneLabel: "Tone",
    build: "Build my prompt",
    copy: "Copy prompt",
    copied: "Copied!",
    download: "Download .txt",
    clear: "Clear",
    emptyGoal: "Write your goal first — one plain sentence is enough.",
    charCount: "حروف",
  },
  "ur-pk": {
    tabs: {
      availability: "دستیابی جانچنے والا",
      tokens: "ٹوکن اور منصوبے",
      prompt: "پرامپٹ مددگار",
      faq: "عام سوالات",
    },
    disclaimerShort: "آزاد ٹول — میٹا سے وابستہ نہیں۔",
    notAffiliated:
      "ToolVena ایک آزاد اوزار ویب سائٹ ہے۔ یہ صفحہ میٹا پلیٹ فارمز، انکارپوریشن سے وابستہ، اس کا زیرِ کفالت، یا اس کا منظور شدہ نہیں ہے۔ Muse اور Meta AI میٹا کے ہیں؛ دستیابی کا حتمی ذریعہ ہمیشہ میٹا کے اپنے صفحے ہیں۔",
    availTitle: "کیا Muse AI آپ کے ملک میں دستیاب ہے؟",
    availIntro:
      "واضح، تاریخ-جانچا جواب حاصل کرنے کے لیے اپنا ملک چنیں۔ ہم کسی ملک کو دستیاب صرف تب نشان زد کرتے ہیں جب میٹا نے خود اس کا اعلان کیا ہو — اور جب نہ کیا ہو تو ایمانداری سے بتاتے ہیں۔",
    verifiedBar:
      `میٹا کے اپنے اعلانات سے تصدیق شدہ (آخری جانچ ${MUSE_CHECKED_DATE}): Muse سرکاری طور پر صرف امریکہ اور کینیڈا میں دستیاب ہے۔ میٹا نے کسی اور لانچ ملک کا اعلان نہیں کیا اور نہ کہیں اور کے لیے تاریخیں دی ہیں۔`,
    searchLabel: "آپ کا ملک",
    searchPlaceholder: "اپنے ملک کا نام لکھیں…",
    quickLabel: "مشہور جانچیں:",
    statusAvailable: "اب دستیاب ہے",
    statusUnverified: "میٹا سے تصدیق شدہ نہیں",
    statusNotYet: "ابھی دستیاب نہیں",
    availableBody: (name: string) =>
      `میٹا نے ${name} میں سرکاری طور پر Muse لانچ کیا ہے۔ آپ میٹا کی اپنی سائٹ سے اس کے لیے سائن اپ کر سکتے ہیں — نہ دعوت کوڈ، نہ VPN، نہ کوئی اور راستہ چاہیے۔`,
    unverifiedBody: (name: string) =>
      `کچھ تیسری-فریق ویب سائٹس بتاتی ہیں کہ Muse ${name} میں دستیاب ہے، مگر میٹا کے اپنے صفحے ابھی ${name} درج نہیں کرتے (جانچ ${MUSE_CHECKED_DATE})۔ جب تک میٹا نہ کہے اسے سرکاری طور پر دستیاب نہ سمجھیں۔`,
    notYetBody: (name: string) =>
      `میٹا نے ${name} میں Muse لانچ نہیں کیا اور اس کے لیے کوئی لانچ تاریخ شائع نہیں کی (جانچ ${MUSE_CHECKED_DATE})۔ جو کوئی آپ کو کسی اور طرح فوری رسائی کا وعدہ کرے وہ میٹا کے اصولوں کی پیروی نہیں کر رہا۔`,
    joinCta: "muse.ai پر جائیں (سرکاری)",
    joinNote:
      "muse.ai پر سائن ان کرنا سرکاری راستہ ہے: اگر آپ کے علاقے کے لیے انتظار فہرست ہے تو وہ آپ کو وہیں نظر آئے گی۔ ہم تجویز کرتے ہیں کہ 'جلدی رسائی' کے لیے کبھی کسی تیسرے فریق کو ادائیگی نہ کریں اور اپنا میٹا لاگ ان میٹا کے اپنے ڈومینز اور سرکاری ایپس کے سوا کہیں درج نہ کریں۔",
    altTitle: "انتظار کے دوران — آج کے ایماندارانہ انتخابات",
    altIntro: (name: string) =>
      `یہاں کچھ بھی Muse ہونے کا دکھاوا نہیں کرتا، اور یہاں کچھ بھی میٹا کے اصول نہیں توڑتا۔ جب تک Muse ${name} میں نہیں، یہ ایماندارانہ انتخابات ہیں:`,
    altMetaAi:
      "Meta AI ایک مختلف میٹا معاون ہے جو WhatsApp، انسٹاگرام، فیس بک اور میسنجر کے اندر رہتا ہے۔ دستیابی ملک کے مطابق بدلتی ہے؛ اگر یہ آپ کی ایپس میں ہے تو یہ آج سوالات کے جواب اور متن کا مسودہ بنا سکتا ہے — یہ Muse نہیں ہے، مگر یہ اصل میں میٹا سے ہے۔",
    altTools:
      "روزمرہ کاموں کے لیے جو ابھی چلتے ہیں، آپ کے براؤزر میں مفت اور سائن اپ کے بغیر، آپ ToolVena کا وائس کلونر (متن بول کر سنیں)، آڈیو سے متن کنورٹر، پس منظر ہٹانے والا، لفظ گننے والا اور 50+ دیگر ٹولز استعمال کر سکتے ہیں — اردو رسم الخط سمیت کئی زبانوں میں۔",
    checkedLine: (name: string) =>
      `${name} کی حیثیت · جانچ ${MUSE_CHECKED_DATE} · ذریعہ: میٹا اعلانات (about.fb.com، 8 و 29 ستمبر 2026) اور muse.ai۔`,
    tokensTitle: "Muse ٹوکن اور منصوبے — سرکاری طور پر کیا معلوم ہے",
    tokensIntro:
      "لوگ '1 ارب ٹوکن'، دعوت کوڈز اور پیکیج قیمتوں کے لیے بہت تلاش کرتے ہیں۔ یہ اس کی ایماندارانہ حالت ہے: میٹا نے اصل میں شائع کیا کیا، اور کیا صرف تیسری-فریق کی باتیں ہیں۔",
    freeTitle: "کیا Muse مفت ہے؟",
    freeBody:
      "جی ہاں — میٹا کے سرکاری FAQ کے مطابق Muse استعمال حد کے ساتھ مفت دستیاب ہے، اور آپ زیادہ حد کے لیے بامعاوضہ رکنیت پر جا سکتے ہیں، یا مفت حد تازہ ہونے تک انتظار کر سکتے ہیں۔ میٹا Muse کو یوں بیان کرتا ہے کہ 'زیادہ تر لوگوں کی ضرورت کے لیے مفت، ان لوگوں کے لیے رکنیت منصوبے جو زیادہ کرنا چاہتے ہیں۔'",
    tokenDefTitle: "'ٹوکن' کیا ہے؟",
    tokenDefBody:
      "ٹوکن استعمال کی اکائی ہے — یہ ناپنے کا طریقہ کہ Muse آپ کے لیے کتنا کام کرتا ہے (ایک پیغام، ایک تلاش، ایک کام)۔ اپنی ٹوکن حد پوری کرنا پیشگی فون منصوبے کے منٹ ختم کرنے جیسا ہے۔ ٹوکن پیسے نہیں، کرپٹو کرنسی نہیں، اور آپ انہیں نہ نقد کر سکتے ہیں نہ کسی کو بھیج سکتے ہیں۔",
    inviteTitle: "'1 ارب ٹوکن' دعوت-کوڈ دعووں کے بارے میں",
    inviteBody:
      "تلاش نتائج اور بلاگ پوسٹس '1 ارب ٹوکن' مالیت کے دعوت کوڈز اور درست ہفتہ وار ٹوکن مقدار والے منصوبوں کا دعوی کرتے ہیں۔ جب ہم نے 10 اکتوبر 2026 کو میٹا کے سرکاری صفحات اور مدد صفحات جانچے تو میٹا نے وہاں کوئی دعوت-کوڈ پروگرام یا ٹھوس ٹوکن مقداریں شائع نہیں کی تھیں۔ اس لیے ہم مقداروں یا کوڈز کو حقیقت کے طور پر درج نہیں کرتے۔ اگر میٹا کبھی سرکاری طور پر ایسی کوئی چیز دے تو وہ Muse ایپ کے اندر یا muse.ai پر آئے گی — اور ہم یہ صفحہ تاریخ کے ساتھ تازہ کریں گے۔",
    inviteWarn:
      "احتیاط کریں: وہ سائٹس جو آپ سے 'کوڈ ریڈیم' کرنے کے لیے اپنے میٹا اکاؤنٹ سے لاگ ان کرنے کو کہتی ہیں، یا دعوت کے لیے پیسے لیتی ہیں، وہ آپ سے آپ کا اکاؤنٹ مانگ رہی ہیں۔ ایسا کبھی نہ کریں۔",
    checkedTokens: `میٹا کے سرکاری صفحات سے ${MUSE_CHECKED_DATE} کو جانچا گیا۔ اگر میٹا سرکاری ٹوکن مقداریں شائع کرے تو یہ صفحہ انہیں ان کی تاریخ کے ساتھ دکھائے گا۔`,
    promptTitle: "Muse AI پرامپٹ مددگار",
    promptIntro:
      "اپنا مقصد ویسے لکھیں جیسے آپ کہیں گے، چند مختصر سوالات کے جواب دیں، اور واضح، باقاعدہ پرامپٹ حاصل کریں جو آپ Muse (یا کسی بھی AI معاون) میں چسپاں کر سکیں۔ یہ اس سے پہلے بھی چلتا ہے کہ Muse آپ کے ملک میں لانچ ہو۔",
    honestNote:
      "ایماندارانہ نوٹ: یہ مددگار مقررہ نمونہ ہے جو آپ کے براؤزر میں چلتا ہے — یہ AI نہیں ہے، یہ سیکھتا نہیں، اور آپ جو لکھتے ہیں وہ کہیں بھیجا یا محفوظ نہیں ہوتا۔ یہ محض آپ کے اپنے الفاظ کو واضح ہدایت میں ترتیب دیتا ہے۔",
    goalTypeLabel: "یہ کس قسم کا کام ہے؟",
    goalLabel: "آپ کا مقصد، آپ کے اپنے الفاظ میں",
    goalPlaceholder: "مثلاً مقررہ بجٹ کے اندر ناران کا 3 دن کا خاندانی سفر",
    contextLabel: "کچھ جو Muse کو پہلے جاننا چاہیے (اختیاری)",
    contextPlaceholder: "مثلاً دو بچوں کے ساتھ سفر؛ ایک 5 سال کا ہے۔ ہم صرف حلال کھاتے ہیں۔ ہمارے پاس درمیانی درجے کی گاڑی ہے۔",
    detailsLabel: "تفصیل جس کا Muse کو احترام کرنا ہو (اختیاری)",
    detailsPlaceholder: "مثلاً بجٹ: درمیانی رکھیں۔ تاریخیں: دسمبر کا آخری ہفتہ۔ رات کو گاڑی نہیں چلانی۔",
    formatLabel: "جواب کیسا لگے؟",
    toneLabel: "لہجہ",
    build: "میرا پرامپٹ بنائیں",
    copy: "پرامپٹ کاپی کریں",
    copied: "کاپی ہو گیا!",
    download: ".txt ڈاؤن لوڈ کریں",
    clear: "صاف کریں",
    emptyGoal: "پہلے اپنا مقصد لکھیں — ایک سادہ جملہ کافی ہے۔",
    charCount: "حروف",
  },
};

const GOAL_TYPES = [
  "Research & summaries",
  "Plan a trip or event",
  "Shop & compare prices",
  "Write or edit something",
  "Handle email & messages",
  "Learn a topic",
  "Personal goals & reminders",
  "Something else",
] as const;

const OUTPUT_FORMATS = [
  "Step-by-step plan",
  "Short summary",
  "Checklist",
  "Pros & cons table",
  "Email or message draft",
  "Document outline",
] as const;

const TONES = ["Friendly", "Professional", "Short & direct"] as const;

interface HubFaq { q: string; a: string; }

const FAQS: HubFaq[] = [
  {
    q: "Which countries is Muse AI available in?",
    a: "Based on Meta's own announcements checked on 10 October 2026: the United States (launch, 8 September 2026) and Canada (confirmed 29 September 2026). Meta has not announced any other launch country, and has given no launch dates for anywhere else.",
  },
  {
    q: "Is Muse AI available in Pakistan or India?",
    a: "Not yet. Meta has not announced Muse for Pakistan or India and has published no date. Signing in at muse.ai is the official way to see whether a waitlist opens for your region — this page will be updated with the date when Meta announces more.",
  },
  {
    q: "What is the difference between Muse and Meta AI?",
    a: "Meta AI is the assistant inside Meta's apps (WhatsApp, Instagram, Facebook, Messenger) — you ask it something and it answers. Muse is Meta's newer personal agent: it can take a goal, research across sources, plan steps, and work on tasks for you. They are two different products; Meta AI is available in far more countries than Muse today.",
  },
  {
    q: "Is Muse free?",
    a: "Meta's official FAQ says Muse is available for free with a usage limit. If you hit that limit, you can upgrade to a paid subscription for a higher limit or wait for the free limit to refresh. Meta has not published exact paid-plan amounts on its public pages as of 10 October 2026.",
  },
  {
    q: "What are Muse tokens? Can I buy '1 billion tokens'?",
    a: "Tokens are units of usage — they measure how much work Muse does for you, like minutes on a phone plan. They are not money and not cryptocurrency. Third-party blogs claim '1 billion token' invite codes, but Meta's official pages publish no such program, so treat those claims as unverified. Never give your Meta login to a site promising tokens — that is how accounts get stolen.",
  },
  {
    q: "How do I join the official waitlist?",
    a: "Go to muse.ai and sign in with your Meta account. If a waitlist is offered for your country, you will see it there. That is the only official route; nobody legitimate sells or swaps waitlist positions.",
  },
  {
    q: "Can I use a VPN or a friend's foreign account to get Muse early?",
    a: "We do not recommend it, and this page never teaches ways around the launch regions: using a service from a country where it has not launched can break Meta's terms and can put your Meta account at risk. The safe route is the official waitlist and the honest alternatives in the availability section.",
  },
  {
    q: "When will Muse launch in my country?",
    a: "Meta has not announced dates beyond the United States and Canada. This checker marks every other country 'not yet' and will update the moment Meta's official pages change — so when a launch genuinely happens, it shows here with its date.",
  },
];

function statusBadge(status: MuseCountryStatus, s: Record<string, any>) {
  if (status === "available")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5" /> {s.statusAvailable}
      </span>
    );
  if (status === "unverified")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
        <AlertTriangle className="h-3.5 w-3.5" /> {s.statusUnverified}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
      <XCircle className="h-3.5 w-3.5" /> {s.statusNotYet}
    </span>
  );
}

export function MuseAiHubWorkspace({ selectedLanguage = "en" }: MuseAiHubWorkspaceProps) {
  const s: Record<string, any> = { ...(STRINGS.en as any), ...((STRINGS[selectedLanguage] as any) || {}) };

  const [tab, setTab] = useState<HubTab>("availability");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MuseCountry | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // prompt helper state
  const [goalType, setGoalType] = useState<(typeof GOAL_TYPES)[number]>("Research & summaries");
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [details, setDetails] = useState("");
  const [format, setFormat] = useState<(typeof OUTPUT_FORMATS)[number]>("Step-by-step plan");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Friendly");
  const [built, setBuilt] = useState("");
  const [goalError, setGoalError] = useState("");
  const [copied, setCopied] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MUSE_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const pick = (c: MuseCountry) => {
    setSelected(c);
    setQuery(c.name);
  };

  const buildPrompt = () => {
    if (!goal.trim()) {
      setGoalError(s.emptyGoal);
      setBuilt("");
      return;
    }
    setGoalError("");
    const lines: string[] = [
      `You are my personal AI assistant. Help me with this job: ${goalType}.`,
      `My goal: ${goal.trim()}`,
    ];
    if (context.trim()) lines.push(`Context you should know: ${context.trim()}`);
    if (details.trim()) lines.push(`Details you must respect: ${details.trim()}`);
    lines.push(
      "First give me a short plan of the steps you will take, then carry them out step by step and show me progress as you go."
    );
    lines.push(`Deliver the result as: ${format}, in a ${tone.toLowerCase()} tone.`);
    lines.push(
      "Rules: ask me before you send anything, buy anything, book anything, cancel anything, or share my information anywhere. If a detail is missing, ask me one short question at a time instead of guessing."
    );
    setBuilt(lines.join("\n\n"));
    setCopied(false);
  };

  const copyPrompt = async () => {
    if (!built) return;
    try {
      await navigator.clipboard.writeText(built);
      setCopied(true);
    } catch {
      const ta = document.getElementById("muse-prompt-output") as HTMLTextAreaElement | null;
      if (ta) {
        ta.select();
        document.execCommand("copy");
        setCopied(true);
      }
    }
  };

  const downloadPrompt = () => {
    if (!built) return;
    const blob = new Blob([built], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "muse-prompt.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clearPrompt = () => {
    setGoal("");
    setContext("");
    setDetails("");
    setBuilt("");
    setGoalError("");
    setCopied(false);
  };

  const tabBtn = (id: HubTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        tab === id
          ? "bg-teal-700 text-white shadow-sm"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
      }`}
      aria-pressed={tab === id}
    >
      {label}
    </button>
  );

  const status = selected ? museCountryStatus(selected.code) : null;

  return (
    <div className="w-full">
      <MobileToolHero toolId="museAiHub" selectedLanguage={selectedLanguage} />

      <div className="mx-auto w-full max-w-4xl px-4 pb-10">
        {/* Disclaimer */}
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 sm:text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>{s.disclaimerShort}</strong> {s.notAffiliated}
          </span>
        </p>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabBtn("availability", s.tabs.availability)}
          {tabBtn("tokens", s.tabs.tokens)}
          {tabBtn("prompt", s.tabs.prompt)}
          {tabBtn("faq", s.tabs.faq)}
        </div>

        {tab === "availability" && (
          <section aria-label="Muse AI availability checker">
            <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-stone-900">
              <Search className="h-6 w-6 text-teal-700" /> {s.availTitle}
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-stone-600 sm:text-base">{s.availIntro}</p>

            <div className="mb-6 flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm leading-relaxed text-teal-900">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{s.verifiedBar}</span>
            </div>

            <label htmlFor="muse-country-search" className="mb-1 block text-sm font-semibold text-stone-800">
              {s.searchLabel}
            </label>
            <input
              id="muse-country-search"
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              placeholder={s.searchPlaceholder}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              autoComplete="off"
            />
            {matches.length > 0 && (
              <ul className="mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                {matches.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => pick(c)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-stone-800 hover:bg-teal-50 sm:text-base"
                    >
                      <span>{c.name}</span>
                      {statusBadge(museCountryStatus(c.code), s)}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 text-sm text-stone-600">
              {s.quickLabel}{" "}
              {["United States", "Canada", "Pakistan", "India", "United Kingdom", "Mexico"].map((name, i) => {
                const c = MUSE_COUNTRIES.find((x) => x.name === name);
                if (!c) return null;
                return (
                  <span key={c.code}>
                    {i > 0 && ", "}
                    <button type="button" onClick={() => pick(c)} className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-800">
                      {name}
                    </button>
                  </span>
                );
              })}
            </p>

            {selected && status && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-stone-900">{selected.name}</h3>
                  {statusBadge(status, s)}
                </div>

                {status === "available" && (
                  <p className="text-sm leading-relaxed text-stone-700 sm:text-base">{s.availableBody(selected.name)}</p>
                )}
                {status === "unverified" && (
                  <>
                    <p className="text-sm leading-relaxed text-stone-700 sm:text-base">{s.unverifiedBody(selected.name)}</p>
                    <p className="mt-2 text-xs text-stone-500">{REPORTED_UNVERIFIED[selected.code]}</p>
                  </>
                )}
                {status === "notyet" && (
                  <p className="text-sm leading-relaxed text-stone-700 sm:text-base">{s.notYetBody(selected.name)}</p>
                )}

                {status === "available" && (
                  <p className="mt-2 text-xs text-stone-500">{VERIFIED_AVAILABLE[selected.code]}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={MUSE_OFFICIAL_JOIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    {s.joinCta} <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={MUSE_OFFICIAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    muse.ai <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-500">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {s.joinNote}
                </p>

                {status !== "available" && (
                  <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-base font-semibold text-stone-900">
                      <CalendarClock className="h-4 w-4 text-teal-700" /> {s.altTitle}
                    </h4>
                    <p className="mb-2 text-sm text-stone-600">{s.altIntro(selected.name)}</p>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
                      <li>{s.altMetaAi}</li>
                      <li>{s.altTools}</li>
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`/${selectedLanguage}/voice-cloner/`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50">AI Voice Cloner</a>
                      <a href={`/${selectedLanguage}/audio-to-text-converter/`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50">Audio to Text</a>
                      <a href={`/${selectedLanguage}/background-remover/`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50">Background Remover</a>
                      <a href={`/${selectedLanguage}/word-counter/`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50">Word Counter</a>
                    </div>
                  </div>
                )}

                <p className="mt-4 border-t border-stone-100 pt-3 text-xs text-stone-500">{s.checkedLine(selected.name)}</p>
              </div>
            )}
          </section>
        )}

        {tab === "tokens" && (
          <section aria-label="Muse tokens and plans">
            <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-stone-900">
              <BookOpenCheck className="h-6 w-6 text-teal-700" /> {s.tokensTitle}
            </h2>
            <p className="mb-5 text-sm leading-relaxed text-stone-600 sm:text-base">{s.tokensIntro}</p>

            <div className="space-y-4">
              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-stone-900">{s.freeTitle}</h3>
                <p className="text-sm leading-relaxed text-stone-700 sm:text-base">{s.freeBody}</p>
              </article>

              <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold text-stone-900">{s.tokenDefTitle}</h3>
                <p className="text-sm leading-relaxed text-stone-700 sm:text-base">{s.tokenDefBody}</p>
              </article>

              <article className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-amber-900">
                  <AlertTriangle className="h-5 w-5" /> {s.inviteTitle}
                </h3>
                <p className="text-sm leading-relaxed text-amber-900 sm:text-base">{s.inviteBody}</p>
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium leading-relaxed text-amber-900">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> {s.inviteWarn}
                </p>
              </article>
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-stone-500">
              <CalendarClock className="h-3.5 w-3.5" /> {s.checkedTokens}
            </p>
          </section>
        )}

        {tab === "prompt" && (
          <section aria-label="Muse AI prompt helper">
            <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-stone-900">
              <Sparkles className="h-6 w-6 text-teal-700" /> {s.promptTitle}
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-stone-600 sm:text-base">{s.promptIntro}</p>
            <p className="mb-6 flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-relaxed text-stone-600 sm:text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0" /> {s.honestNote}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="muse-goal-type" className="mb-1 block text-sm font-semibold text-stone-800">{s.goalTypeLabel}</label>
                <select
                  id="muse-goal-type"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as (typeof GOAL_TYPES)[number])}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:text-base"
                >
                  {GOAL_TYPES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="muse-format" className="mb-1 block text-sm font-semibold text-stone-800">{s.formatLabel}</label>
                  <select
                    id="muse-format"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as (typeof OUTPUT_FORMATS)[number])}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  >
                    {OUTPUT_FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="muse-tone" className="mb-1 block text-sm font-semibold text-stone-800">{s.toneLabel}</label>
                  <select
                    id="muse-tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value as (typeof TONES)[number])}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  >
                    {TONES.map((tn) => (
                      <option key={tn} value={tn}>{tn}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="muse-goal" className="mb-1 block text-sm font-semibold text-stone-800">{s.goalLabel}</label>
              <textarea
                id="muse-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder={s.goalPlaceholder}
                rows={3}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 sm:text-base"
              />
              {goalError && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" /> {goalError}
                </p>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="muse-context" className="mb-1 block text-sm font-semibold text-stone-800">{s.contextLabel}</label>
                <textarea
                  id="muse-context"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder={s.contextPlaceholder}
                  rows={3}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <div>
                <label htmlFor="muse-details" className="mb-1 block text-sm font-semibold text-stone-800">{s.detailsLabel}</label>
                <textarea
                  id="muse-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={s.detailsPlaceholder}
                  rows={3}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={buildPrompt}
                className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <ListChecks className="h-4 w-4" /> {s.build}
              </button>
              <button
                type="button"
                onClick={clearPrompt}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                <Trash2 className="h-4 w-4" /> {s.clear}
              </button>
            </div>

            {built && (
              <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
                <textarea
                  id="muse-prompt-output"
                  readOnly
                  value={built}
                  rows={9}
                  className="w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-800 outline-none sm:text-base"
                />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? s.copied : s.copy}
                  </button>
                  <button
                    type="button"
                    onClick={downloadPrompt}
                    className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50"
                  >
                    <Download className="h-4 w-4" /> {s.download}
                  </button>
                  <span className="text-xs text-stone-500">
                    {built.length} {s.charCount}
                  </span>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "faq" && (
          <section aria-label="Muse AI frequently asked questions">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-stone-900">
              <HelpCircle className="h-6 w-6 text-teal-700" /> Muse AI — honest answers
            </h2>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <div key={f.q} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-stone-900 sm:text-base"
                    aria-expanded={openFaq === i}
                  >
                    <span>{f.q}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-stone-500 transition ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <p className="border-t border-stone-100 px-5 py-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                      {f.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom disclaimer */}
        <footer className="mt-10 border-t border-stone-200 pt-4">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-500">
            <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              <strong className="text-stone-700">{s.disclaimerShort}</strong> {s.notAffiliated}
            </span>
          </p>
        </footer>
      </div>

      <ToolGuideSection toolId="museAiHub" selectedLanguage={selectedLanguage} />
    </div>
  );
}
