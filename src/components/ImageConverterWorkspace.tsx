import React, { useCallback, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Download, FileImage, Info, Repeat, ShieldCheck, Sparkles, Trash2, Upload, X,
} from "lucide-react";
import {
  convertImageFormat, detectInputFormat, downloadBlob, formatFileSize, OUTPUT_EXT, OutputFormat, ProcessedImage,
} from "../utils/imageEngine";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface ImageConverterWorkspaceProps { selectedLanguage?: LanguageCode; }

interface QueueItem {
  id: string;
  file: File;
  preview: string;
  detected: string;
  width: number;
  height: number;
  status: "ready" | "converting" | "done" | "error";
  result: ProcessedImage | null;
  errorKind: "decode" | "process" | null;
}

function uid(): string { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function ImageConverterWorkspace({ selectedLanguage = "en" }: ImageConverterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const cv = (t as any).imageConverter || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<QueueItem[]>([]);
  const [format, setFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState(85);
  const [bgChoice, setBgChoice] = useState<"white" | "black" | "custom">("white");
  const [bgCustom, setBgCustom] = useState("#ffffff");
  const [isDragging, setIsDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const bgColor = bgChoice === "white" ? "#FFFFFF" : bgChoice === "black" ? "#000000" : (bgCustom || "#FFFFFF");

  const probe = useCallback(async (file: File): Promise<QueueItem> => {
    const item: QueueItem = {
      id: uid(), file, preview: URL.createObjectURL(file),
      detected: detectInputFormat(file), width: 0, height: 0,
      status: "ready", result: null, errorKind: null,
    };
    // Real decode probe: HEIC and other browser-unreadable files fail HERE, honestly.
    try {
      const url = URL.createObjectURL(file);
      try {
        const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
          if (typeof createImageBitmap === "function") {
            createImageBitmap(file).then((b) => { const d = { w: b.width, h: b.height }; try { b.close(); } catch { /* noop */ } resolve(d); }, reject);
          } else {
            const img = new Image();
            img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = () => reject(new Error("decode"));
            img.src = url;
          }
        });
        item.width = dims.w; item.height = dims.h;
      } finally { URL.revokeObjectURL(url); }
    } catch {
      item.status = "error"; item.errorKind = "decode";
    }
    return item;
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|svg)$/i.test(f.name));
    if (list.length === 0) { setNotice(cv.errorType || "Please choose image files."); return; }
    setNotice("");
    const probed: QueueItem[] = [];
    for (const f of list) probed.push(await probe(f));
    setItems((prev) => [...prev, ...probed]);
  }, [cv.errorType, probe]);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const it = prev.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.preview);
      return prev.filter((i) => i.id !== id);
    });
  };
  const clearAll = () => { items.forEach((i) => URL.revokeObjectURL(i.preview)); setItems([]); setNotice(""); };

  const convertAll = async () => {
    if (busy) return;
    setBusy(true); setNotice("");
    for (const it of items) {
      if (it.status === "error") continue;
      setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "converting" } : p)));
      try {
        const r = await convertImageFormat(it.file, format, quality / 100, bgColor);
        setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "done", result: r } : p)));
      } catch {
        setItems((prev) => prev.map((p) => (p.id === it.id ? { ...p, status: "error", errorKind: "decode" } : p)));
      }
    }
    setBusy(false);
  };

  const downloadOne = (it: QueueItem) => {
    if (!it.result) return;
    const base = it.file.name.replace(/\.[^.]+$/, "") || "image";
    downloadBlob(it.result.blob, `${base}-converted.${OUTPUT_EXT[format]}`);
  };
  const downloadAll = async () => {
    for (const it of items) {
      if (it.status === "done" && it.result) {
        downloadOne(it);
        // Small gap so browsers treat each as its own user-approved download.
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  };

  const doneItems = items.filter((i) => i.status === "done" && i.result);
  const totalBefore = items.reduce((s, i) => s + i.file.size, 0);
  const totalAfter = doneItems.reduce((s, i) => s + (i.result?.size || 0), 0);
  const pct = (before: number, after: number) => (before > 0 ? Math.round((1 - after / before) * 100) : 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="imageConverter" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-700 text-white self-start shadow-sm">
            <Repeat className="w-3.5 h-3.5" /> {cv.badge || "Image Converter"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">{cv.pageTitle || "Convert Images Between JPG, PNG and WebP — Same Size, New Format"}</h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">{cv.subtitle || "Add one photo or a whole batch, pick PNG, JPG or WebP, set quality, then download. Dimensions stay exactly the same — only the format changes."}</p>
          <p className="text-xs text-stone-500">{cv.vsResizer || "Need different dimensions too? Use the Image Resizer — this tool changes format only."}{" "}
            <a className="font-bold text-violet-700 underline" href={`/${selectedLanguage}/image-resizer/`}>Image Resizer</a>
          </p>
        </div>
      </div>

      <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-violet-700 text-white rounded-xl shrink-0"><Info className="w-4 h-4" /></div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-violet-950">{cv.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{cv.quickAnswer || "It re-encodes your image into a different file format at the exact same pixel size, locally in your browser."}</p>
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); void addFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all ${isDragging ? "border-violet-600 bg-violet-50 scale-[1.01]" : "border-stone-300 bg-white hover:border-violet-400 hover:bg-violet-50/30"}`}
      >
        <input ref={fileInputRef} type="file" accept="image/*,.heic,.heif" multiple className="hidden" onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = ""; }} />
        <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-700 flex items-center justify-center mb-3 shadow"><Upload className="w-7 h-7 text-white" /></div>
        <h2 className="text-base sm:text-lg font-bold text-stone-800">{cv.dropTitle || "Drop images here or click to browse"}</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">{cv.dropSubtitle || "JPG, PNG, WebP — processed locally, never uploaded"}</p>
      </div>
      {notice && <p role="alert" className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{notice}</p>}

      {items.length > 0 && (
        <>
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-2">{cv.formatLabel || "Convert to"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["png", "jpeg", "webp"] as OutputFormat[]).map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={`px-3 py-2.5 rounded-xl text-sm font-bold uppercase cursor-pointer ${format === f ? "bg-violet-700 text-white" : "bg-stone-100 text-stone-600"}`}>{f === "jpeg" ? "JPG" : f}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-2">{(cv.qualityLabel || "Quality")}: <span className="text-violet-700">{quality}%</span></label>
                <input type="range" min={10} max={100} value={quality} disabled={format === "png"} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-violet-700 disabled:opacity-40" />
                {format === "png" && <p className="text-[11px] text-stone-400 mt-1">{cv.pngQualityNote || "PNG ignores the quality slider."}</p>}
              </div>
            </div>

            {format === "jpeg" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-amber-900">{cv.bgWarn || "JPG has no transparency. Transparent parts will be filled with the background colour below."}</p>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-2">{cv.bgLabel || "Background for JPG"}</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setBgChoice("white")} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border ${bgChoice === "white" ? "bg-stone-900 text-white" : "bg-white text-stone-700 border-stone-300"}`}>{cv.bgWhite || "White"}</button>
                    <button onClick={() => setBgChoice("black")} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer border ${bgChoice === "black" ? "bg-stone-900 text-white" : "bg-white text-stone-700 border-stone-300"}`}>{cv.bgBlack || "Black"}</button>
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-stone-300">
                      <span className="text-xs font-bold text-stone-600">{cv.bgCustom || "Custom:"}</span>
                      <input type="color" value={bgCustom} onChange={(e) => { setBgCustom(e.target.value); setBgChoice("custom"); }} className="w-8 h-8 cursor-pointer bg-transparent" aria-label={cv.bgCustom || "Custom background colour"} />
                      <span className="w-6 h-6 rounded-md border border-stone-300" style={{ background: bgColor }} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button onClick={convertAll} disabled={busy} className="px-4 py-3 rounded-2xl bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-extrabold cursor-pointer shadow flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {busy ? (cv.converting || "Converting…") : (cv.convertBtn || "Convert All")}
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-sm font-bold cursor-pointer">{cv.addMoreBtn || "Add more"}</button>
              <button onClick={clearAll} className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-red-100 text-sm font-bold cursor-pointer inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />{cv.clearAllBtn || "Clear all"}</button>
              {doneItems.length > 0 && (
                <button onClick={downloadAll} className="px-4 py-3 rounded-2xl bg-stone-900 hover:bg-stone-700 text-white text-sm font-extrabold cursor-pointer flex items-center gap-2"><Download className="w-4 h-4" />{cv.downloadAllBtn || "Download All (one by one)"}</button>
              )}
            </div>

            {doneItems.length > 0 && (
              <div className="grid grid-cols-3 gap-3 text-center border-t border-stone-100 pt-4">
                <div className="bg-stone-50 rounded-2xl p-3"><p className="text-[11px] font-bold text-stone-400 uppercase">{cv.totalBefore || cv.beforeLabel || "Before"}</p><p className="font-extrabold text-stone-800">{formatFileSize(totalBefore)}</p></div>
                <div className="bg-violet-50 rounded-2xl p-3"><p className="text-[11px] font-bold text-violet-600 uppercase">{cv.totalAfter || cv.afterLabel || "After"}</p><p className="font-extrabold text-violet-800">{formatFileSize(totalAfter)}</p></div>
                <div className="bg-stone-50 rounded-2xl p-3"><p className="text-[11px] font-bold text-stone-400 uppercase">{cv.afterLabel || "Change"}</p><p className="font-extrabold text-stone-800">{totalAfter <= totalBefore ? `−${pct(totalBefore, totalAfter)}%` : `+${Math.abs(pct(totalBefore, totalAfter))}%`}</p></div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-bold text-stone-800 mb-3">{cv.queueTitle || "Your images"} ({items.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((it) => (
                  <div key={it.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="relative aspect-video bg-stone-100">
                      <img src={it.result?.dataUrl || it.preview} alt="" className="w-full h-full object-contain" />
                      <button onClick={() => removeItem(it.id)} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer" aria-label={cv.removeBtn || "Remove"}><X className="w-4 h-4" /></button>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-semibold text-stone-600 truncate">{it.file.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {(cv.detectedLabel || "Detected")}: <strong className="text-stone-800">{it.detected}</strong>
                        {it.width > 0 && <> · {(cv.dimensionsLabel || "Size")}: {it.width} × {it.height}px</>} · {formatFileSize(it.file.size)}
                      </p>
                      {it.status === "error" && <p role="alert" className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">{cv.errorDecode || cv.errorLoad || "That image could not be read in this browser."}</p>}
                      {it.status === "converting" && <p className="text-[11px] font-bold text-violet-700">{cv.statusConverting || "Converting…"}</p>}
                      {it.result && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-400 line-through">{formatFileSize(it.file.size)}</span>
                          <span className="font-bold text-violet-700">{formatFileSize(it.result.size)} · {it.result.format}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${it.result.size <= it.file.size ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>{it.result.size <= it.file.size ? `−${pct(it.file.size, it.result.size)}%` : `+${Math.abs(pct(it.file.size, it.result.size))}%`}</span>
                        </div>
                      )}
                      {it.result ? (
                        <button onClick={() => downloadOne(it)} className="w-full py-2.5 rounded-xl bg-violet-700 text-white text-sm font-bold hover:bg-violet-600 flex items-center justify-center gap-2 cursor-pointer"><Download className="w-4 h-4" />{cv.downloadBtn || "Download"}</button>
                      ) : (
                        <p className="text-[11px] text-stone-400 text-center py-1">{it.status === "error" ? (cv.statusError || "Could not read") : (cv.statusReady || "Ready")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-amber-900 mb-1">{cv.supportTitle || "What this browser can and cannot do"}</h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{cv.supportText || "Input is whatever this browser can decode. HEIC usually cannot be read in browsers."}</p>
              <h3 className="text-sm font-bold text-amber-900 mt-4 mb-1">{cv.honestTitle || "Honest limits"}</h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{cv.honestText || "Converting does not change width or height and cannot add detail."}</p>
            </div>
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {cv.privacyTitle || "Private by design"}</h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{cv.privacyNote || "Your images are processed inside this browser tab and never uploaded."}</p>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-2">
                <a className="font-bold text-emerald-800 underline" href={`/${selectedLanguage}/image-resizer/`}>Image Resizer</a>{" · "}
                <a className="font-bold text-emerald-800 underline" href={`/${selectedLanguage}/image-compressor/`}>Image Compressor</a>
              </p>
            </div>
          </div>
        </>
      )}

      {items.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <FileImage className="w-5 h-5 text-stone-300" /> {cv.emptyHint || "No images yet. Drop JPG, PNG or WebP files above to convert the batch."}
        </div>
      )}

      <ToolGuideSection toolId="imageConverter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
