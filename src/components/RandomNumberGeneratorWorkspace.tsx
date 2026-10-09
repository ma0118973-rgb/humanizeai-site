import React, { useMemo, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Coins, Copy, Dices, Eraser, Hash, Info, RefreshCw, ShieldCheck, Sparkles,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface RandomNumberGeneratorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Mode = "numbers" | "coin" | "dice";

interface HistoryEntry {
  id: number;
  numbers: number[];
  min: number;
  max: number;
  repeats: boolean;
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

/** Uniform integer in [0, rangeSize) from crypto.getRandomValues — rejection sampling, no modulo bias. */
function secureBelow(rangeSize: number): number {
  const limit = Math.floor(4294967296 / rangeSize) * rangeSize;
  const buf = new Uint32Array(1);
  let x = 0;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % rangeSize;
}

function drawNumbers(min: number, max: number, count: number, allowRepeats: boolean): number[] {
  const rangeSize = max - min + 1;
  if (allowRepeats) {
    return Array.from({ length: count }, () => min + secureBelow(rangeSize));
  }
  const picked = new Set<number>();
  while (picked.size < count) {
    picked.add(min + secureBelow(rangeSize));
  }
  return [...picked];
}

const toggleCls = (on: boolean) =>
  `px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition ${
    on ? "bg-violet-700 text-white shadow" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
  }`;

export function RandomNumberGeneratorWorkspace({ selectedLanguage = "en" }: RandomNumberGeneratorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const rn = (t as any).randomNumber || {};

  const [mode, setMode] = useState<Mode>("numbers");
  const [minStr, setMinStr] = useState("1");
  const [maxStr, setMaxStr] = useState("100");
  const [count, setCount] = useState(6);
  const [allowRepeats, setAllowRepeats] = useState(true);
  const [sortResults, setSortResults] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [coinFace, setCoinFace] = useState<"heads" | "tails" | null>(null);
  const [coinCounts, setCoinCounts] = useState({ heads: 0, tails: 0 });
  const [coinTrail, setCoinTrail] = useState<Array<"heads" | "tails">>([]);

  const [diceCount, setDiceCount] = useState(2);
  const [dice, setDice] = useState<number[]>([]);

  const min = useMemo(() => {
    const n = Number.parseInt(minStr, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [minStr]);
  const max = useMemo(() => {
    const n = Number.parseInt(maxStr, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [maxStr]);

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const generate = () => {
    setError("");
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
      setError(rn.rangeError || "Minimum must be smaller than maximum.");
      return;
    }
    const rangeSize = max - min + 1;
    const howMany = Math.min(1000, Math.max(1, Math.floor(count) || 1));
    if (!allowRepeats && howMany > rangeSize) {
      setError(rn.uniqueError || "With repeats off, you cannot draw more unique numbers than the range contains.");
      return;
    }
    const drawn = drawNumbers(min, max, howMany, allowRepeats);
    const shown = sortResults ? [...drawn].sort((a, b) => a - b) : drawn;
    setResults(shown);
    setHistory((prev) =>
      [{ id: Date.now(), numbers: shown, min, max, repeats: allowRepeats }, ...prev].slice(0, 12)
    );
  };

  const flipCoin = () => {
    const face: "heads" | "tails" = secureBelow(2) === 0 ? "heads" : "tails";
    setCoinFace(face);
    setCoinCounts((c) => ({ ...c, [face]: c[face] + 1 }));
    setCoinTrail((prev) => [face, ...prev].slice(0, 12));
  };

  const resetCoin = () => {
    setCoinFace(null);
    setCoinCounts({ heads: 0, tails: 0 });
    setCoinTrail([]);
  };

  const rollDice = () => {
    setDice(Array.from({ length: diceCount }, () => 1 + secureBelow(6)));
  };

  const historyLabel = (entry: HistoryEntry) =>
    String(rn.historyRange || "{count} numbers · {min} to {max}")
      .replace("{count}", String(entry.numbers.length))
      .replace("{min}", String(entry.min))
      .replace("{max}", String(entry.max));

  const coinStatsText = String(rn.coinStats || "Heads {heads} · Tails {tails} · Flips {total}")
    .replace("{heads}", String(coinCounts.heads))
    .replace("{tails}", String(coinCounts.tails))
    .replace("{total}", String(coinCounts.heads + coinCounts.tails));

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="randomNumber" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl -z-0 opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-700 text-white self-start shadow-sm">
            <Dices className="w-3.5 h-3.5" /> {rn.badge || "Random Number Generator"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {rn.pageTitle || "Random Numbers, Fair and Instant"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {rn.subtitle || "Set a minimum and maximum, choose how many numbers you need, and draw. Everything runs in your browser — nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-700 text-white rounded-xl shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-violet-950">{rn.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {rn.quickAnswer || "It draws random whole numbers inside your range using your browser's cryptographic randomness. You can allow or block repeats, sort the result, flip a coin or roll dice in the same tool, and copy everything with one tap."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-5">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setMode("numbers")} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition flex items-center justify-center gap-2 ${mode === "numbers" ? "bg-violet-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
            <Hash className="w-4 h-4" /> {rn.modeNumbers || "Numbers"}
          </button>
          <button onClick={() => setMode("coin")} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition flex items-center justify-center gap-2 ${mode === "coin" ? "bg-violet-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
            <Coins className="w-4 h-4" /> {rn.modeCoin || "Coin Flip"}
          </button>
          <button onClick={() => setMode("dice")} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition flex items-center justify-center gap-2 ${mode === "dice" ? "bg-violet-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>
            <Dices className="w-4 h-4" /> {rn.modeDice || "Dice Roll"}
          </button>
        </div>

        {mode === "numbers" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="rn-min">
                  {rn.minLabel || "Minimum"}
                </label>
                <input
                  id="rn-min"
                  type="number"
                  value={minStr}
                  onChange={(e) => setMinStr(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-violet-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="rn-max">
                  {rn.maxLabel || "Maximum"}
                </label>
                <input
                  id="rn-max"
                  type="number"
                  value={maxStr}
                  onChange={(e) => setMaxStr(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-violet-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="rn-count">
                  {rn.countLabel || "How many numbers"}
                </label>
                <input
                  id="rn-count"
                  type="number"
                  min={1}
                  max={1000}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-800 focus:outline-none focus:border-violet-600"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between gap-3 bg-stone-50 rounded-2xl p-3">
                <div>
                  <div className="text-xs font-bold text-stone-800">{rn.allowRepeats || "Allow repeats"}</div>
                  <div className="text-[11px] text-stone-500">{rn.repeatsHint || "On: a number may appear twice. Off: every number is unique."}</div>
                </div>
                <button onClick={() => setAllowRepeats(!allowRepeats)} className={toggleCls(allowRepeats)}>
                  {allowRepeats ? "ON" : "OFF"}
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 bg-stone-50 rounded-2xl p-3">
                <div>
                  <div className="text-xs font-bold text-stone-800">{rn.sortResults || "Sort results"}</div>
                  <div className="text-[11px] text-stone-500">{rn.sortHint || "Show the drawn numbers from low to high."}</div>
                </div>
                <button onClick={() => setSortResults(!sortResults)} className={toggleCls(sortResults)}>
                  {sortResults ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs sm:text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              onClick={generate}
              className="w-full px-4 py-3.5 rounded-2xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-extrabold cursor-pointer transition shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> {rn.generateBtn || "Generate"}
            </button>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wide">{rn.resultsTitle || "Your numbers"}</h3>
                {results.length > 0 && (
                  <button
                    onClick={() => copyText(results.join(", "), "results")}
                    className="text-[11px] font-bold text-violet-700 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    {copiedId === "results" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === "results" ? (rn.copied || "Copied!") : (rn.copyBtn || "Copy numbers")}
                  </button>
                )}
              </div>
              {results.length === 0 ? (
                <p className="text-xs sm:text-sm text-stone-500 bg-stone-50 rounded-xl px-3 py-3">{rn.resultsEmpty || "Press Generate to draw your first numbers."}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.map((n, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-violet-700 text-white text-sm font-extrabold shadow-sm">
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wide">{rn.historyTitle || "History (this tab only)"}</h3>
                {history.length > 0 && (
                  <button
                    onClick={() => setHistory([])}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Eraser className="w-3.5 h-3.5" /> {rn.clearHistoryBtn || "Clear history"}
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-stone-500">{rn.historyEmpty || "Nothing drawn yet. Your draws will appear here, only in this tab."}</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div key={entry.id} className="flex items-start justify-between gap-3 bg-stone-50 rounded-xl px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-stone-500">{historyLabel(entry)}{entry.repeats ? "" : " · unique"}</div>
                        <div className="text-xs sm:text-sm font-bold text-stone-800 break-words">{entry.numbers.join(", ")}</div>
                      </div>
                      <button
                        onClick={() => copyText(entry.numbers.join(", "), `h-${entry.id}`)}
                        className="shrink-0 p-1.5 rounded-lg text-violet-700 hover:bg-violet-100 cursor-pointer"
                        aria-label={rn.copyBtn || "Copy numbers"}
                      >
                        {copiedId === `h-${entry.id}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {mode === "coin" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-stone-800">{rn.coinTitle || "Heads or tails?"}</h3>
            <div className="flex items-center justify-center py-4">
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center text-center shadow-lg border-4 ${
                  coinFace === null
                    ? "bg-stone-100 border-stone-200 text-stone-400"
                    : coinFace === "heads"
                      ? "bg-amber-300 border-amber-500 text-amber-900"
                      : "bg-stone-300 border-stone-400 text-stone-800"
                }`}
              >
                <span className="text-sm font-extrabold px-2">
                  {coinFace === null ? "?" : coinFace === "heads" ? (rn.heads || "Heads") : (rn.tails || "Tails")}
                </span>
              </div>
            </div>
            <p className="text-center text-xs sm:text-sm font-bold text-stone-600">{coinStatsText}</p>
            {coinTrail.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {coinTrail.map((f, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold ${f === "heads" ? "bg-amber-200 text-amber-900" : "bg-stone-200 text-stone-700"}`}
                  >
                    {f === "heads" ? (rn.heads || "Heads") : (rn.tails || "Tails")}
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={flipCoin}
                className="px-4 py-3 rounded-2xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-extrabold cursor-pointer transition shadow flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" /> {rn.flipBtn || "Flip the coin"}
              </button>
              <button
                onClick={resetCoin}
                className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-bold cursor-pointer transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> {rn.coinReset || "Reset counts"}
              </button>
            </div>
          </div>
        )}

        {mode === "dice" && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-stone-800">{rn.diceTitle || "Roll the dice"}</h3>
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
                {rn.diceCount || "Number of dice"}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setDiceCount(n)}
                    className={`flex-1 px-2 py-2.5 rounded-xl text-sm font-extrabold cursor-pointer transition ${diceCount === n ? "bg-violet-700 text-white shadow" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {dice.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap justify-center gap-2 py-2">
                  {dice.map((d, i) => (
                    <span key={i} className="w-14 h-14 rounded-2xl bg-white border-2 border-stone-300 shadow flex items-center justify-center text-4xl text-stone-800">
                      {DICE_FACES[d - 1]}
                    </span>
                  ))}
                </div>
                <p className="text-center text-sm font-extrabold text-stone-700">
                  {rn.diceTotal || "Total"}: {dice.reduce((a, b) => a + b, 0)}
                </p>
              </div>
            )}
            <button
              onClick={rollDice}
              className="w-full px-4 py-3.5 rounded-2xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-extrabold cursor-pointer transition shadow flex items-center justify-center gap-2"
            >
              <Dices className="w-4 h-4" /> {rn.rollBtn || "Roll"}
            </button>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-amber-900 mb-1">{rn.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {rn.honestText || "This tool uses your browser's cryptographic random source — strong, unpredictable randomness for games, classrooms and everyday draws. It is not a certified random source for regulated gambling, official lotteries or legal prize draws, and no draw here can predict or improve your chances in any lottery."}
          </p>
        </div>
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> {rn.privacyTitle || "Private by design"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {rn.privacyNote || "Your ranges, numbers and history never leave this browser tab. Nothing is uploaded, saved to an account or shared. Close the tab and everything is gone."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="randomNumber" selectedLanguage={selectedLanguage} />
    </div>
  );
}
