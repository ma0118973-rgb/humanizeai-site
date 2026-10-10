import React, { useCallback, useEffect, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Camera, ClipboardPaste, Copy, Check, Download, FileText, Info, Languages,
  ScanText, ShieldCheck, Sparkles, Trash2, Upload, X,
} from "lucide-react";
import { OCR_LANGUAGES, cancelOcr, countWords, recognizeImageText, OcrProgress } from "../utils/ocrEngine";
import { formatFileSize, downloadBlob } from "../utils/imageEngine";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface ImageToTextWorkspaceProps { selectedLanguage?: LanguageCode; }

/** Default OCR pack per site language (only packs that genuinely exist). */
const SITE_TO_OCR: Partial<Record<LanguageCode, string>> = {
  en: "eng", es: "spa", ur: "urd", de: "deu", fr: "fra", tr: "tur",
  pt: "por", ja: "jpn", no: "nor", nl: "nld", it: "ita", ru: "rus", "ur-pk": "urd",
};

export function ImageToTextWorkspace({ selectedLanguage = "en" }: ImageToTextWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const o = (t as any).imageToText || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerBusyRef = useRef(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [lang, setLang] = useState<string>(SITE_TO_OCR[selectedLanguage] || "eng");
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState<OcrProgress | null>(null);
  const [statusKey, setStatusKey] = useState("");
  const [output, setOutput] = useState("");
  const [errorKind, setErrorKind] = useState<"" | "type" | "decode" | "ocr">("");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // If the site language changes, preselect the matching OCR pack (user may override).
  useEffect(() => { setLang(SITE_TO_OCR[selectedLanguage] || "eng"); }, [selectedLanguage]);

  // Terminate any running worker when leaving the tool.
  useEffect(() => () => { cancelOcr(); }, []);

  const setImage = useCallback(async (f: File) => {
    if (!f.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name)) {
      setErrorKind("type"); return;
    }
    setErrorKind("");
    // Real decode check: unreadable files fail HERE, honestly.
    try {
      await new Promise<void>((resolve, reject) => {
        if (typeof createImageBitmap === "function") {
          createImageBitmap(f).then((b) => { try { b.close(); } catch { /* noop */ } resolve(); }, reject);
        } else {
          const url = URL.createObjectURL(f);
          const img = new Image();
          img.onload = () => { URL.revokeObjectURL(url); resolve(); };
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); };
          img.src = url;
        }
      });
    } catch {
      setFile(null); setPreview(""); setErrorKind("decode"); return;
    }
    cancelOcr();
    setFile(f);
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(f); });
    setOutput(""); setProg(null); setStatusKey("");
  }, []);

  const clearAll = () => {
    cancelOcr();
    setFile(null);
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return ""; });
    setOutput(""); setProg(null); setStatusKey(""); setErrorKind(""); setBusy(false);
  };

  const runOcr = async () => {
    if (!file || busy || workerBusyRef.current) return;
    workerBusyRef.current = true;
    setBusy(true); setErrorKind(""); setProg({ phase: "starting", progress: 0 }); setStatusKey("starting");
    try {
      const text = await recognizeImageText(file, lang, (p) => {
        setProg(p);
        setStatusKey(p.phase === "starting" ? "starting" : p.phase === "loading-language" ? "loading" : "recognizing");
      });
      setOutput(text);
      setStatusKey("done");
    } catch (e: any) {
      if (e && e.message === "OCR_CANCELLED") { setStatusKey("cancelled"); }
      else { setErrorKind("ocr"); setStatusKey(""); }
    } finally {
      setBusy(false); workerBusyRef.current = false;
    }
  };

  const onCancel = () => { cancelOcr(); setStatusKey("cancelled"); };

  const copyOut = async () => {
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  const downloadOut = () => {
    const base = (file?.name || "image-text").replace(/\.[^.]+$/, "");
    downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), `${base}-text.txt`);
  };

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.files || [])[0];
    if (item) void setImage(item);
  }, [setImage]);

  const pct = prog ? Math.max(0, Math.min(100, Math.round(prog.progress * 100))) : 0;
  const words = countWords(output);

  return (
    <div className="space-y-6 animate-fade-in" onPaste={onPaste}>
      <MobileToolHero toolId="imageToText" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-700 text-white self-start shadow-sm">
            <ScanText className="w-3.5 h-3.5" /> {o.badge || "Image to Text OCR"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">{o.pageTitle || "Extract Text from an Image — Free OCR in Your Browser"}</h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">{o.subtitle || "Pick a photo, screenshot or scan, choose the language, and get editable text. Runs on your device — never uploaded."}</p>
        </div>
      </div>

      <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-cyan-700 text-white rounded-xl shrink-0"><Info className="w-4 h-4" /></div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-cyan-950">{o.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{o.quickAnswer || "It reads printed text inside one image with the open-source Tesseract OCR engine, entirely in this browser tab, and turns it into editable text. Engine and language data download from a CDN on first use and are cached after."}</p>
          </div>
        </div>
      </div>

      {!file && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) void setImage(f); }}
          onClick={() => fileInputRef.current?.click()}
          className={`rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all ${isDragging ? "border-cyan-600 bg-cyan-50 scale-[1.01]" : "border-stone-300 bg-white hover:border-cyan-400 hover:bg-cyan-50/30"}`}
        >
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void setImage(f); e.target.value = ""; }} />
          <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-700 flex items-center justify-center mb-3 shadow"><Upload className="w-7 h-7 text-white" /></div>
          <h2 className="text-base sm:text-lg font-bold text-stone-800">{o.dropTitle || "Drop one image here, click to browse, or paste"}</h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">{o.dropSubtitle || "JPG, PNG, WebP — one image at a time, processed locally, never uploaded"}</p>
          <p className="text-[11px] text-stone-400 mt-2 inline-flex items-center gap-1"><ClipboardPaste className="w-3.5 h-3.5" /> Ctrl/Cmd + V</p>
        </div>
      )}

      {errorKind && (
        <p role="alert" className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {errorKind === "type" ? (o.errorType || "Please choose an image file (JPG, PNG or WebP).") : errorKind === "decode" ? (o.errorDecode || "This browser could not read that image. Export HEIC photos as JPG first.") : (o.errorOcr || "OCR failed in this browser. Check your connection and try again.")}
        </p>
      )}

      {file && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative sm:w-64 shrink-0">
              <div className="rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 aspect-video sm:aspect-auto sm:h-44">
                <img src={preview} alt="" className="w-full h-full object-contain" />
              </div>
              <button onClick={clearAll} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer" aria-label={o.removeImage || "Remove image"}><X className="w-4 h-4" /></button>
              <p className="text-[11px] text-stone-500 mt-2 truncate">{o.fileLabel || "File"}: <strong className="text-stone-700">{file.name}</strong> · {formatFileSize(file.size)}</p>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-2 inline-flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> {o.langLabel || "Language of the text in the image"}</label>
                <div className="flex flex-wrap gap-2">
                  {OCR_LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => setLang(l.code)} disabled={busy} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 ${lang === l.code ? "bg-cyan-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>{l.label}</button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400 mt-2">{o.langDownloadNote || "First use of a language downloads its data file from a CDN (cached afterwards). Your image never leaves this device."}</p>
              </div>

              <div className="rounded-xl bg-cyan-50/70 border border-cyan-200/60 px-3 py-2.5">
                <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">{o.prepNote || "Automatic image cleanup: before reading, we brighten, sharpen and enlarge your photo automatically (still fully on this device) so small or faded text reads better. A sharper original still gives the best result."}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={runOcr} disabled={busy} className="px-4 py-3 rounded-2xl bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-sm font-extrabold cursor-pointer shadow flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {busy ? (o.extracting || "Reading image…") : (o.extractBtn || "Extract Text")}
                </button>
                {busy && <button onClick={onCancel} className="px-4 py-3 rounded-2xl bg-stone-900 text-white text-sm font-bold cursor-pointer">{o.cancelBtn || "Cancel"}</button>}
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-sm font-bold cursor-pointer">{o.dropTitle ? o.dropTitle.split(",")[0] : "Change image"}</button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void setImage(f); e.target.value = ""; }} />
              </div>

              {(busy || prog) && (
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-stone-500 uppercase mb-1">
                    <span>{o.progressLabel || "Progress"}: {statusKey === "starting" ? (o.statusStarting || "Starting the OCR engine…") : statusKey === "loading" ? (o.statusLoadingLang || "Downloading language data…") : statusKey === "recognizing" ? (o.statusRecognizing || "Recognising text…") : statusKey === "done" ? (o.statusDone || "Done.") : statusKey === "cancelled" ? (o.statusCancelled || "Cancelled.") : ""}</span>
                    <span className="text-cyan-700">{busy ? `${pct}%` : ""}</span>
                  </div>
                  <div className="h-3 rounded-full bg-stone-100 overflow-hidden"><div className="h-full bg-cyan-600 transition-all duration-300" style={{ width: `${busy ? pct : statusKey === "done" ? 100 : 0}%` }} /></div>
                </div>
              )}
              {statusKey === "done" && !busy && <p className="text-xs font-bold text-emerald-700">{o.statusDone || "Done — proofread the text below."}</p>}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="text-[11px] font-bold text-stone-500 uppercase inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {o.outputLabel || "Extracted text (edit it freely)"}</label>
              <p className="text-[11px] text-stone-400">{o.wordsLabel || "Words"}: <strong className="text-stone-700">{words}</strong> · {o.charsLabel || "Characters"}: <strong className="text-stone-700">{output.length}</strong></p>
            </div>
            <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={10} placeholder={o.outputPlaceholder || "The text found in your image will appear here."} className="w-full rounded-2xl border border-stone-200 p-4 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/40" />
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={copyOut} disabled={!output} className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-700 disabled:opacity-40 text-white text-sm font-bold cursor-pointer inline-flex items-center gap-2">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? (o.copied || "Copied") : (o.copyBtn || "Copy")}</button>
              <button onClick={downloadOut} disabled={!output} className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white text-sm font-bold cursor-pointer inline-flex items-center gap-2"><Download className="w-4 h-4" />{o.downloadBtn || "Download .txt"}</button>
            </div>
          </div>
        </div>
      )}

      {!file && !errorKind && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <Camera className="w-5 h-5 text-stone-300" /> {o.emptyHint || "No image yet. Drop a JPG, PNG or WebP above, pick the text language, then press Extract Text."}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-amber-900 mb-1">{o.supportTitle || "What this tool accepts"}</h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{o.supportText || "One image at a time: JPG, PNG or WebP. PDFs are not images — export a page as JPG or PNG first."}</p>
          <h3 className="text-sm font-bold text-amber-900 mt-4 mb-1">{o.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{o.honestText?.includes("sharp") ? o.honestText : "Printed text on a sharp, straight photo reads far better than handwriting; blur or glare hurts accuracy the most. No fixed accuracy percentage is promised. Proofread every result."}</p>
        </div>
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {o.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{o.privacyNote || "Your image is read inside this browser tab and never uploaded. The engine and language data download from a CDN on first use and are cached after; offline, first use fails."}</p>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-2">
            <a className="font-bold text-emerald-800 underline" href={`/${selectedLanguage}/image-converter/`}>Image Converter</a>{" · "}
            <a className="font-bold text-emerald-800 underline" href={`/${selectedLanguage}/image-resizer/`}>Image Resizer</a>{" · "}
            <a className="font-bold text-emerald-800 underline" href={`/${selectedLanguage}/image-compressor/`}>Image Compressor</a>
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="imageToText" selectedLanguage={selectedLanguage} />
    </div>
  );
}
