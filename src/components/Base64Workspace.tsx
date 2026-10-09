import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  AlertTriangle, ArrowLeftRight, Binary, Check, Copy, Download, Eraser, FileUp, Info, ShieldCheck,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface Base64WorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Mode = "encode" | "decode";

const MAX_TEXT_CHARS = 1_000_000;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function encodeText(text: string, urlSafe: boolean): string {
  const encoded = bytesToBase64(new TextEncoder().encode(text));
  return urlSafe ? encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : encoded;
}

function decodeBase64(input: string, labels: Record<string, string>): string {
  const compact = input.replace(/\s/g, "");
  if (!compact) return "";

  const bad = compact.match(/[^A-Za-z0-9+/_=-]/);
  if (bad) {
    throw new Error(`${labels.errorInvalidChar || "Invalid character"}: ${bad[0]}`);
  }

  const firstPad = compact.indexOf("=");
  if (firstPad !== -1 && !/^={1,2}$/.test(compact.slice(firstPad))) {
    throw new Error(labels.errorPadding || "Padding (=) can only appear at the end, once or twice.");
  }

  let normalized = compact.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  if (normalized.length % 4 === 1) {
    throw new Error(labels.errorLength || "This Base64 length cannot be valid. A character may be missing or extra.");
  }
  while (normalized.length % 4 !== 0) normalized += "=";

  let bytes: Uint8Array;
  try {
    const binary = atob(normalized);
    bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  } catch {
    throw new Error(labels.errorInvalid || "This is not valid Base64. Check for missing, extra or changed characters.");
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(labels.errorBinary || "This decoded to binary bytes, not readable UTF-8 text. This tool displays text only, so it has not guessed or garbled the result.");
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function Base64Workspace({ selectedLanguage = "en" }: Base64WorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const b = (t as any).base64 || {};
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileMessage, setFileMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const conversion = useMemo(() => {
    if (!input) return { output: "", error: "" };
    if (input.length > MAX_TEXT_CHARS) {
      return { output: "", error: b.errorTooLarge || "This text is very large for a browser tab. Split it into smaller parts and try again." };
    }
    try {
      return {
        output: mode === "encode" ? encodeText(input, urlSafe) : decodeBase64(input, b),
        error: "",
      };
    } catch (error) {
      return { output: "", error: error instanceof Error ? error.message : (b.errorInvalid || "Invalid Base64 input.") };
    }
  }, [input, mode, urlSafe, b]);

  const byteCount = useMemo(() => new TextEncoder().encode(input).length, [input]);

  const handleCopy = async () => {
    if (!conversion.output) return;
    try {
      await navigator.clipboard.writeText(conversion.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const handleSwap = () => {
    if (!conversion.output) return;
    setInput(conversion.output);
    setMode(mode === "encode" ? "decode" : "encode");
    setFileMessage("");
    setFileError("");
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setFileMessage("");
    setFileError("");
    if (file.size > MAX_FILE_BYTES) {
      setFileError(b.fileTooLarge || "That file is too large for this small-file feature. Keep it under 2 MB, because Base64 output is about one-third larger and browser memory is limited.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        const encoded = bytesToBase64(bytes);
        setMode("encode");
        setUrlSafe(false);
        setInput("");
        setFileMessage(`${file.name} · ${file.size.toLocaleString()} bytes → ${encoded.length.toLocaleString()} Base64 characters`);
        // Store file output in the input-side state via the output panel using a one-off conversion state.
        // We reuse the clipboard/download path by placing it in the input of decode mode if the user swaps;
        // simplest honest UX: put the encoded text into the output by switching to a synthetic file result.
        setFileEncoded(encoded);
      } catch {
        setFileError(b.fileError || "That file could not be read locally. Please try a smaller file.");
      }
    };
    reader.onerror = () => setFileError(b.fileError || "That file could not be read locally. Please try a smaller file.");
    reader.readAsArrayBuffer(file);
  };

  const [fileEncoded, setFileEncoded] = useState("");
  const visibleOutput = fileEncoded || conversion.output;
  const visibleError = fileEncoded ? "" : conversion.error;

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="base64" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-0 opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white self-start shadow-sm">
            <Binary className="w-3.5 h-3.5" /> {b.badge || "Base64 Encoder & Decoder"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {b.pageTitle || "Encode and Decode Base64 Without Breaking Your Text"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {b.subtitle || "Convert text to Base64 and back with correct UTF-8 handling for emoji, Urdu script, Japanese and accented characters — all locally in your browser."}
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-amber-950">{b.warningTitle || "Base64 is encoding, not encryption"}</h2>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed mt-1">
            {b.warningText || "Anyone who has a Base64 string can decode it without a key. It does not protect passwords, tokens or secrets. Use real encryption and a password manager for anything private."}
          </p>
        </div>
      </div>

      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0"><Info className="w-4 h-4" /></div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-indigo-950">{b.quickAnswerTitle || "Quick answer"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{b.quickAnswer || "Choose Encode to turn readable text into Base64, or Decode to turn Base64 back into text. Turn on URL-safe when the result must travel inside a web address or filename."}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div>
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{b.modeTitle || "Choose a mode"}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setMode("encode"); setFileEncoded(""); }} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "encode" ? "bg-indigo-600 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{b.encodeBtn || "Encode"}</button>
            <button onClick={() => { setMode("decode"); setFileEncoded(""); }} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer transition ${mode === "decode" ? "bg-indigo-600 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{b.decodeBtn || "Decode"}</button>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-3 cursor-pointer">
          <input type="checkbox" checked={urlSafe} onChange={(e) => setUrlSafe(e.target.checked)} className="mt-0.5 accent-indigo-600 w-4 h-4" />
          <span>
            <span className="block text-sm font-bold text-stone-800">{b.urlSafeLabel || "URL-safe Base64"}</span>
            <span className="block text-xs text-stone-500 leading-relaxed">{b.urlSafeHint || "Uses - and _ instead of + and /, and removes trailing = padding. Best for URLs, filenames and tokens. Decode accepts standard and URL-safe input."}</span>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setInput(b.sampleText || "Hello, world! 🌍 السلام علیکم"); setFileEncoded(""); }} className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">{b.sampleBtn || "Try sample"}</button>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            <FileUp className="w-4 h-4" /> {b.fileBtn || "Encode a small file"}
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
          <button onClick={handleSwap} disabled={!visibleOutput} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
            <ArrowLeftRight className="w-4 h-4" /> {b.swapBtn || "Swap"}
          </button>
          <button onClick={() => { setInput(""); setFileEncoded(""); setFileMessage(""); setFileError(""); }} disabled={!input && !fileEncoded} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {b.clearBtn || "Clear"}
          </button>
        </div>

        {fileMessage && <p className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2.5">{fileMessage}</p>}
        {fileError && <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">{fileError}</p>}

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="base64-input">
            {mode === "encode" ? (b.inputEncodeLabel || "Text to encode") : (b.inputDecodeLabel || "Base64 to decode")}
          </label>
          <textarea
            id="base64-input"
            value={input}
            onChange={(e) => { setInput(e.target.value); setFileEncoded(""); setFileMessage(""); setFileError(""); }}
            placeholder={mode === "encode" ? (b.encodePlaceholder || "Type or paste text here. Emoji and non-English scripts are safe.") : (b.decodePlaceholder || "Paste Base64 here. Standard and URL-safe forms are accepted.")}
            className="w-full h-48 rounded-2xl border border-stone-300 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-indigo-500 resize-y font-mono"
          />
          <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-bold text-stone-500">
            <span className="rounded-full bg-stone-100 px-2.5 py-1">{(b.charsLabel || "Characters")}: {input.length.toLocaleString()}</span>
            <span className="rounded-full bg-stone-100 px-2.5 py-1">{(b.bytesLabel || "UTF-8 bytes")}: {byteCount.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide" htmlFor="base64-output">{b.outputLabel || "Result"}</label>
            <div className="flex gap-2">
              <button onClick={async () => { if (!visibleOutput) return; try { await navigator.clipboard.writeText(visibleOutput); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} }} disabled={!visibleOutput} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? (b.copied || "Copied!") : (b.copyBtn || "Copy result")}
              </button>
              <button onClick={() => visibleOutput && downloadText(mode === "encode" ? "base64-output.txt" : "decoded-text.txt", visibleOutput)} disabled={!visibleOutput} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
                <Download className="w-4 h-4" /> {b.downloadBtn || "Download .txt"}
              </button>
            </div>
          </div>
          {visibleError ? (
            <p className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">{visibleError}</p>
          ) : (
            <textarea id="base64-output" readOnly value={visibleOutput} placeholder={b.outputPlaceholder || "Your converted result will appear here."} className="w-full h-48 rounded-2xl border border-stone-300 bg-stone-50 p-4 text-sm leading-relaxed text-stone-800 placeholder-stone-400 resize-y font-mono" />
          )}
          <p className="text-[11px] text-stone-500 mt-2">{(b.outputCharsLabel || "Result characters")}: {visibleOutput.length.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Binary className="w-4 h-4 text-indigo-600" /> {b.methodTitle || "How it works"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{b.methodText || "Text is first turned into UTF-8 bytes, then those bytes are represented with the Base64 alphabet. Decoding reverses the steps and checks that the bytes form valid UTF-8 text before showing them."}</p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-indigo-600" /> {b.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{b.privacyNote || "Text and files are processed locally in this browser tab. Nothing is uploaded, saved on a server, or shared by this tool."}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
          <h3 className="font-bold text-amber-950 flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> {b.limitsTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{b.limitsText || "Base64 output is about one-third larger than the original bytes. Very large text or files can slow a browser tab, and decoded binary data may not be readable text."}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
        <h2 className="text-lg font-extrabold text-stone-900 mb-3">{b.examplesTitle || "Small examples"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3"><div className="font-bold text-stone-500 text-[11px] uppercase">{b.examplePlain || "Plain text"}</div><code className="block mt-1 text-stone-800 break-all">Hello → SGVsbG8=</code></div>
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3"><div className="font-bold text-stone-500 text-[11px] uppercase">{b.exampleUnicode || "Unicode stays intact"}</div><code className="block mt-1 text-stone-800 break-all">🌍 → 8J+MjQ==</code></div>
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3"><div className="font-bold text-stone-500 text-[11px] uppercase">{b.exampleUrl || "URL-safe changes two symbols"}</div><code className="block mt-1 text-stone-800 break-all">+ / → - _</code></div>
        </div>
      </div>

      <ToolGuideSection toolId="base64" selectedLanguage={selectedLanguage} />
    </div>
  );
}
