import React, { useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  AtSign, Check, Copy, Heart, RefreshCw, ShieldCheck, Sparkles, Trash2, TriangleAlert, Wand2,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface UsernameGeneratorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type ThemeKey = "gaming" | "creator" | "study" | "business" | "aesthetic" | "funny";
type SeparatorKey = "none" | "dot" | "underscore";
type LengthKey = "any" | "short" | "medium" | "long";

const THEME_KEYS: ThemeKey[] = ["gaming", "creator", "study", "business", "aesthetic", "funny"];

const WORD_BANKS: Record<ThemeKey, { adjectives: string[]; nouns: string[] }> = {
  gaming: {
    adjectives: ["shadow", "neon", "pixel", "turbo", "cosmic", "stealth", "epic", "rapid", "mystic", "iron", "lunar", "solar", "blaze", "frost", "nova", "hyper"],
    nouns: ["wolf", "dragon", "quest", "arena", "knight", "raven", "titan", "vortex", "legend", "phantom", "striker", "rogue", "falcon", "oracle", "viper", "comet"],
  },
  creator: {
    adjectives: ["bright", "daily", "golden", "vivid", "clever", "happy", "bold", "prime", "fresh", "lively", "cosmic", "urban", "gentle", "modern", "radiant", "swift"],
    nouns: ["studio", "stories", "frame", "lens", "notes", "talks", "vibes", "canvas", "clips", "craft", "corner", "journal", "lab", "muse", "waves", "channel"],
  },
  study: {
    adjectives: ["focused", "curious", "bright", "calm", "clever", "rapid", "steady", "sharp", "golden", "quiet", "eager", "wise", "daily", "ready", "patient", "curious"],
    nouns: ["notes", "books", "mind", "class", "scholar", "tutor", "pages", "desk", "brain", "quest", "lessons", "library", "pencil", "grades", "focus", "mentor"],
  },
  business: {
    adjectives: ["prime", "smart", "trusted", "global", "fresh", "bold", "clear", "modern", "swift", "bright", "elite", "urban", "noble", "agile", "solid", "sharp"],
    nouns: ["studio", "works", "labs", "media", "brand", "market", "office", "venture", "partners", "digital", "agency", "group", "solutions", "craft", "hub", "growth"],
  },
  aesthetic: {
    adjectives: ["lunar", "pastel", "velvet", "dreamy", "soft", "honey", "crystal", "misty", "golden", "ivory", "peachy", "silent", "blooming", "starry", "cloudy", "serene"],
    nouns: ["moon", "bloom", "aura", "muse", "glow", "petals", "dreams", "mist", "light", "garden", "sky", "pearl", "breeze", "halo", "meadow", "willow"],
  },
  funny: {
    adjectives: ["wonky", "silly", "giggly", "quirky", "noodle", "bouncy", "cheeky", "wobbly", "zany", "merry", "pickle", "banana", "dorky", "snazzy", "loopy", "jolly"],
    nouns: ["potato", "llama", "muffin", "panda", "waffle", "pickle", "goose", "noodle", "banana", "socks", "donkey", "burger", "taco", "penguin", "moose", "beans"],
  },
};

const BLOCKED_TERMS = [
  "google", "youtube", "instagram", "tiktok", "facebook", "twitter", "twitch", "discord", "roblox",
  "minecraft", "fortnite", "netflix", "spotify", "amazon", "apple", "nike", "adidas", "disney", "marvel",
  "official", "support", "admin", "moderator", "mrbeast", "pewdiepie", "ronaldo", "messi", "taylorswift",
  "fuck", "shit", "bitch", "bastard", "whore", "slut", "porn", "sex", "nigger", "nigga", "faggot",
  "retard", "nazi", "hitler", "isis", "terrorist", "chutiya", "madarchod", "behenchod", "harami",
];

function randomIndex(max: number): number {
  if (max <= 0) return 0;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const limit = Math.floor(0xffffffff / max) * max;
    const values = new Uint32Array(1);
    let value = 0;
    do {
      crypto.getRandomValues(values);
      value = values[0];
    } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function pick<T>(items: T[]): T {
  return items[randomIndex(items.length)];
}

function cleanSeed(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 14);
}

function unleet(value: string): string {
  return value.replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t").replace(/@/g, "a");
}

function isBlocked(value: string): boolean {
  const normalized = unleet(value.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return BLOCKED_TERMS.some((term) => normalized.includes(term));
}

function formatName(tokens: string[], separator: SeparatorKey): string {
  const sep = separator === "dot" ? "." : separator === "underscore" ? "_" : "";
  return tokens.filter(Boolean).join(sep).replace(/^[._]+|[._]+$/g, "").replace(/[._]{2,}/g, sep || "");
}

function lengthMatches(name: string, length: LengthKey): boolean {
  const count = name.length;
  if (length === "short") return count >= 4 && count <= 12;
  if (length === "medium") return count >= 13 && count <= 18;
  if (length === "long") return count >= 19 && count <= 24;
  return count >= 4 && count <= 24;
}

function generateNames(theme: ThemeKey, seed: string, useNumbers: boolean, separator: SeparatorKey, length: LengthKey): string[] {
  const bank = WORD_BANKS[theme];
  const seen = new Set<string>();
  const results: string[] = [];
  let attempts = 0;

  while (results.length < 20 && attempts < 1600) {
    attempts += 1;
    const adjective = pick(bank.adjectives);
    const noun = pick(bank.nouns);
    const noun2 = pick(bank.nouns);
    let tokens: string[];

    if (seed) {
      const pattern = randomIndex(6);
      if (pattern === 0) tokens = [seed, noun];
      else if (pattern === 1) tokens = [adjective, seed];
      else if (pattern === 2) tokens = [seed, adjective];
      else if (pattern === 3) tokens = [seed, noun, noun2];
      else if (pattern === 4) tokens = [adjective, seed, noun];
      else tokens = [seed, pick(["hub", "lab", "daily", "world", "club", "notes"] )];
    } else {
      const pattern = randomIndex(6);
      if (pattern === 0) tokens = [adjective, noun];
      else if (pattern === 1) tokens = [noun, noun2];
      else if (pattern === 2) tokens = [adjective, noun, noun2];
      else if (pattern === 3) tokens = [noun, adjective];
      else if (pattern === 4) tokens = [pick(["the", "its", "hey", "go", "my"]), adjective, noun];
      else tokens = [adjective, pick(["club", "hub", "lab", "world", "daily", "quest"]), noun];
    }

    let name = formatName(tokens, separator);
    if (useNumbers && randomIndex(100) < 65) {
      const suffix = String(randomIndex(90) + 10) + (randomIndex(100) < 25 ? String(randomIndex(90) + 10) : "");
      name += suffix.slice(0, 4);
    }

    if (!/^[a-z]/.test(name) || !lengthMatches(name, length) || isBlocked(name) || seen.has(name)) continue;
    seen.add(name);
    results.push(name);
  }

  return results;
}

export function UsernameGeneratorWorkspace({ selectedLanguage = "en" }: UsernameGeneratorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ug = (t as any).usernameGenerator || {};

  const [theme, setTheme] = useState<ThemeKey>("creator");
  const [seedRaw, setSeedRaw] = useState("");
  const [useNumbers, setUseNumbers] = useState(false);
  const [separator, setSeparator] = useState<SeparatorKey>("none");
  const [length, setLength] = useState<LengthKey>("any");
  const [results, setResults] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(text);
    window.setTimeout(() => setCopied((current) => (current === text ? "" : current)), 1600);
  };

  const handleGenerate = () => {
    const seed = cleanSeed(seedRaw);
    if (seedRaw.trim() && (!/[a-z]/.test(seed) || isBlocked(seed))) {
      setResults([]);
      setError(ug.seedBlockedError || "That seed word cannot be used. Try a neutral word that does not copy a brand, public figure, account identity, or offensive term.");
      return;
    }
    setError("");
    setResults(generateNames(theme, seed, useNumbers, separator, length));
  };

  const toggleFavourite = (name: string) => {
    setFavourites((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name].slice(0, 50));
  };

  const themeLabel = (key: ThemeKey) => {
    switch (key) {
      case "gaming": return ug.themeGaming || "Gaming";
      case "creator": return ug.themeCreator || "Creator";
      case "study": return ug.themeStudy || "Study";
      case "business": return ug.themeBusiness || "Business";
      case "aesthetic": return ug.themeAesthetic || "Aesthetic";
      case "funny": return ug.themeFunny || "Funny";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="usernameGenerator" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-fuchsia-100 via-pink-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-fuchsia-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(217,70,239,0.14),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-300 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5" />
              {ug.badge || "Username Generator"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {ug.pageTitle || "Username Ideas That Sound Like You — Not a Random String"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ug.subtitle || "Pick a theme, add a word that matters to you (or leave it blank), and get 20 clean username ideas. Favourite the ones worth checking on your platform."}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{ug.noticeTitle || "Availability is not checked"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {ug.noticeText || "These are brainstorming ideas only. This tool does not query YouTube, TikTok, Instagram, Twitch, Roblox, Discord or any other platform, so a name shown here may already be taken. Check availability on the platform itself, follow its current username rules, and check trademarks before using a name for a business or channel. Avoid names that copy real brands, celebrities, or official/support accounts."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-6">
        <div>
          <label className="block text-sm font-extrabold text-stone-900 mb-2">{ug.themeLabel || "Theme"}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {THEME_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`px-3 py-3 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer ${theme === key ? "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-900 shadow-md" : "border-stone-200 bg-white text-stone-600 hover:border-fuchsia-300"}`}
              >
                {themeLabel(key)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="username-seed">
            {ug.seedLabel || "Seed word (optional)"}
          </label>
          <input
            id="username-seed"
            type="text"
            value={seedRaw}
            onChange={(event) => setSeedRaw(event.target.value)}
            placeholder={ug.seedPlaceholder || "e.g. mango, pixel, coach, luna"}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400"
          />
          <p className="text-xs text-stone-500 mt-1.5">{ug.seedHint || "One short word works best. It is cleaned to lowercase letters and numbers; spaces and symbols are removed."}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-stone-200 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={useNumbers} onChange={(event) => setUseNumbers(event.target.checked)} className="mt-1 w-4 h-4 accent-fuchsia-600" />
              <span>
                <span className="block text-sm font-extrabold text-stone-900">{ug.numbersLabel || "Add numbers"}</span>
                <span className="block text-xs text-stone-500 mt-0.5">{ug.numbersDesc || "End some names with a short number"}</span>
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-stone-200 p-4">
            <label className="block text-sm font-extrabold text-stone-900 mb-2" htmlFor="username-separator">{ug.separatorLabel || "Separator"}</label>
            <select id="username-separator" value={separator} onChange={(event) => setSeparator(event.target.value as SeparatorKey)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white">
              <option value="none">{ug.separatorNone || "None"}</option>
              <option value="dot">{ug.separatorDot || "Dot (.)"}</option>
              <option value="underscore">{ug.separatorUnderscore || "Underscore (_)"}</option>
            </select>
          </div>

          <div className="rounded-2xl border border-stone-200 p-4">
            <label className="block text-sm font-extrabold text-stone-900 mb-2" htmlFor="username-length">{ug.lengthLabel || "Length style"}</label>
            <select id="username-length" value={length} onChange={(event) => setLength(event.target.value as LengthKey)} className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white">
              <option value="any">{ug.lengthAny || "Any length"}</option>
              <option value="short">{ug.lengthShort || "Short (up to 12)"}</option>
              <option value="medium">{ug.lengthMedium || "Medium (13–18)"}</option>
              <option value="long">{ug.lengthLong || "Long (19–24)"}</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

        <button
          onClick={handleGenerate}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-extrabold text-sm sm:text-base hover:from-fuchsia-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          <Wand2 className="w-5 h-5" />
          {results.length ? (ug.regenerateBtn || "Generate a fresh batch") : (ug.generateBtn || "Generate 20 usernames")}
        </button>
        <p className="text-xs text-stone-500 text-center -mt-3">{ug.batchNote || "Duplicates are removed within a batch, but that never means a platform name is available."}</p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-fuchsia-600" /> {ug.resultsTitle || "Your username ideas"}
          </h2>
          {results.length > 0 && <span className="text-xs font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 rounded-full px-2.5 py-1">{results.length}</span>}
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-stone-500 text-center py-8">{ug.resultsEmpty || "No names yet. Choose a theme and press Generate."}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((name) => {
              const isFavourite = favourites.includes(name);
              const isCopied = copied === name;
              return (
                <div key={name} className="group rounded-2xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-fuchsia-300 p-3.5 transition-all">
                  <button onClick={() => copyText(name)} className="w-full text-left cursor-pointer" title={ug.copyBtn || "Copy"}>
                    <span className="block font-mono font-bold text-sm sm:text-base text-stone-900 break-all">@{name}</span>
                    <span className="block text-[11px] text-stone-500 mt-1">{name.length} {ug.charactersLabel || "characters"}</span>
                  </button>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => copyText(name)} className={`flex-1 px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${isCopied ? "bg-emerald-600 text-white" : "bg-stone-900 text-white hover:bg-fuchsia-700"}`}>
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {isCopied ? (ug.copiedLabel || "Copied") : (ug.copyBtn || "Copy")}
                    </button>
                    <button
                      onClick={() => toggleFavourite(name)}
                      aria-label={isFavourite ? (ug.favouriteRemoveLabel || "Remove favourite") : (ug.favouriteAddLabel || "Save favourite")}
                      title={isFavourite ? (ug.favouriteRemoveLabel || "Remove favourite") : (ug.favouriteAddLabel || "Save favourite")}
                      className={`p-2.5 rounded-xl border cursor-pointer ${isFavourite ? "bg-pink-100 border-pink-300 text-pink-700" : "bg-white border-stone-200 text-stone-400 hover:text-pink-600 hover:border-pink-300"}`}
                    >
                      <Heart className="w-4 h-4" fill={isFavourite ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-pink-50 border border-pink-200 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-base sm:text-lg font-extrabold text-pink-950 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" /> {ug.favouritesTitle || "Favourites (this tab only)"}
          </h2>
          {favourites.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => copyText(favourites.join("\n"))} className="px-3 py-2 rounded-xl bg-pink-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer">
                <Copy className="w-3.5 h-3.5" /> {ug.copyAllBtn || "Copy all favourites"}
              </button>
              <button onClick={() => setFavourites([])} className="px-3 py-2 rounded-xl bg-white border border-pink-300 text-pink-800 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" /> {ug.clearFavouritesBtn || "Clear favourites"}
              </button>
            </div>
          )}
        </div>
        {favourites.length === 0 ? (
          <p className="text-sm text-pink-900/70">{ug.favouritesEmpty || "Tap the heart on any name to keep it here while you compare."}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {favourites.map((name) => (
              <button key={name} onClick={() => copyText(name)} className="px-3 py-2 rounded-full bg-white border border-pink-300 font-mono text-xs sm:text-sm font-bold text-pink-950 cursor-pointer hover:border-pink-500">
                @{name} <span className="text-pink-500 font-sans">({name.length})</span>
              </button>
            ))}
          </div>
        )}
        {copied === favourites.join("\n") && copied && <p className="text-xs font-bold text-emerald-700 mt-3 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {ug.copiedLabel || "Copied"}</p>}
      </div>

      <div className="bg-fuchsia-50/70 border border-fuchsia-200/80 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-fuchsia-600 text-white rounded-xl shrink-0"><Sparkles className="w-4 h-4" /></div>
          <div className="space-y-1">
            <h2 className="text-sm font-extrabold text-fuchsia-950">{ug.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {ug.quickAnswer || "It combines clean theme word banks with your optional seed word inside your browser. Nothing is uploaded, favourites stay only in this tab until you clear them or close it, and every result shows its character length so you can shortlist names before checking them where you will actually register."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5">
          <h3 className="text-sm font-extrabold text-stone-900 mb-1.5">{ug.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {ug.honestText || "A generated name is not guaranteed free, original in a legal sense, or allowed on every platform. Rules on length, dots, underscores and repeated characters change and differ by service. Read the name aloud, search it exactly, and choose something you would still like if your account grows."}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5">
          <h3 className="text-sm font-extrabold text-stone-900 mb-1.5">{ug.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {ug.privacyNote || "Generation happens in this browser tab with local word lists. The seed word and favourites are not sent to a server, stored in an account, or written to permanent storage by this tool."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: ShieldCheck, label: "100% Private" },
          { icon: RefreshCw, label: "Fresh Batches" },
          { icon: Check, label: "Free" },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-2xl border border-stone-200 p-4">
            <item.icon className="w-6 h-6 mx-auto mb-2 text-fuchsia-600" />
            <p className="text-xs font-bold text-stone-600">{item.label}</p>
          </div>
        ))}
      </div>

      <ToolGuideSection toolId="usernameGenerator" selectedLanguage={selectedLanguage} />
    </div>
  );
}
