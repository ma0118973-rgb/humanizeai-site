import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Crop, Download, Image as ImageIcon, Info, Lock, LockOpen, RotateCcw, ShieldCheck, Sparkles, Upload, X,
} from "lucide-react";
import { decodeImage, renderResized, downloadBlob, formatFileSize, DecodedImage, OutputFormat, ProcessedImage } from "../utils/imageEngine";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface ImageResizerWorkspaceProps { selectedLanguage?: LanguageCode; }

type Tab = "resize" | "crop";
interface Preset { key: string; w: number; h: number; labelKey: string; fallback: string; }

const PRESETS: Preset[] = [
  { key: "igPost", w: 1080, h: 1080, labelKey: "presetIgPost", fallback: "Instagram Post (1080×1080)" },
  { key: "igPortrait", w: 1080, h: 1350, labelKey: "presetIgPortrait", fallback: "Instagram Portrait (1080×1350)" },
  { key: "igStory", w: 1080, h: 1920, labelKey: "presetIgStory", fallback: "Instagram Story (1080×1920)" },
  { key: "ytThumb", w: 1280, h: 720, labelKey: "presetYtThumb", fallback: "YouTube Thumbnail (1280×720)" },
  { key: "xPost", w: 1200, h: 675, labelKey: "presetXPost", fallback: "X Post (1200×675)" },
  { key: "profile", w: 800, h: 800, labelKey: "presetProfile", fallback: "Profile Photo (800×800)" },
  { key: "a4_150", w: 1240, h: 1754, labelKey: "presetA4_150", fallback: "A4 @150 DPI (1240×1754)" },
  { key: "a4_300", w: 2480, h: 3508, labelKey: "presetA4_300", fallback: "A4 @300 DPI (2480×3508)" },
  { key: "hd", w: 1920, h: 1080, labelKey: "presetHd", fallback: "Full HD (1920×1080)" },
];

const CROP_RATIOS: { key: string; label: string; ratio: number | null }[] = [
  { key: "free", label: "Free", ratio: null },
  { key: "1:1", label: "1:1", ratio: 1 },
  { key: "4:5", label: "4:5", ratio: 4 / 5 },
  { key: "16:9", label: "16:9", ratio: 16 / 9 },
  { key: "3:2", label: "3:2", ratio: 3 / 2 },
  { key: "9:16", label: "9:16", ratio: 9 / 16 },
];

const MAX_OUT = 8000;

export function ImageResizerWorkspace({ selectedLanguage = "en" }: ImageResizerWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const rs = (t as any).imageResizer || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const decodedRef = useRef<DecodedImage | null>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ px: number; py: number; rect: { x: number; y: number; w: number; h: number } } | null>(null);

  const [fileName, setFileName] = useState("");
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [origSize, setOrigSize] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [exifHonoured, setExifHonoured] = useState(false);
  const [tab, setTab] = useState<Tab>("resize");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"pixels" | "percent">("pixels");
  const [wStr, setWStr] = useState("");
  const [hStr, setHStr] = useState("");
  const [pct, setPct] = useState(50);
  const [lock, setLock] = useState(true);

  const [cropRatio, setCropRatio] = useState<number | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState(85);
  const [result, setResult] = useState<ProcessedImage | null>(null);
  const [busy, setBusy] = useState(false);

  const cleanup = useCallback(() => { decodedRef.current?.cleanup(); decodedRef.current = null; }, []);
  useEffect(() => cleanup, [cleanup]);

  const loadFile = useCallback(async (file: File) => {
    setError("");
    if (!/^image\/(jpeg|png|webp)/.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setError(rs.errorType || "Please choose a JPG, PNG or WebP image.");
      return;
    }
    cleanup();
    try {
      const dec = await decodeImage(file);
      decodedRef.current = dec;
      setFileName(file.name);
      setOrigW(dec.width); setOrigH(dec.height); setOrigSize(file.size);
      setExifHonoured(dec.exifHonoured);
      setPreviewUrl(URL.createObjectURL(file));
      setWStr(String(dec.width)); setHStr(String(dec.height)); setPct(100);
      setCrop({ x: 0, y: 0, w: dec.width, h: dec.height });
      setResult(null);
    } catch { setError(rs.errorLoad || "That image could not be read in this browser."); }
  }, [cleanup, rs.errorType, rs.errorLoad]);

  const srcW = tab === "crop" && crop ? crop.w : origW;
  const srcH = tab === "crop" && crop ? crop.h : origH;

  const outDims = useMemo(() => {
    if (!origW) return { w: 0, h: 0 };
    if (mode === "percent") {
      return { w: Math.max(1, Math.round((srcW * pct) / 100)), h: Math.max(1, Math.round((srcH * pct) / 100)) };
    }
    const w = Math.min(MAX_OUT, Math.max(1, parseInt(wStr, 10) || 0));
    const h = Math.min(MAX_OUT, Math.max(1, parseInt(hStr, 10) || 0));
    return { w, h };
  }, [origW, mode, pct, wStr, hStr, srcW, srcH]);

  const enlarged = outDims.w > srcW || outDims.h > srcH;

  const onW = (v: string) => {
    setWStr(v);
    if (lock && origW && mode === "pixels") {
      const w = parseInt(v, 10);
      if (w > 0) setHStr(String(Math.max(1, Math.round((w * srcH) / srcW))));
    }
  };
  const onH = (v: string) => {
    setHStr(v);
    if (lock && origH && mode === "pixels") {
      const h = parseInt(v, 10);
      if (h > 0) setWStr(String(Math.max(1, Math.round((h * srcW) / srcH))));
    }
  };

  const applyPreset = (p: Preset) => { setMode("pixels"); setLock(false); setWStr(String(p.w)); setHStr(String(p.h)); };
  const applyCropRatio = (r: number | null) => {
    setCropRatio(r);
    if (!origW || r === null) { setCrop({ x: 0, y: 0, w: origW, h: origH }); return; }
    let w = origW; let h = Math.round(w / r);
    if (h > origH) { h = origH; w = Math.round(h * r); }
    setCrop({ x: Math.round((origW - w) / 2), y: Math.round((origH - h) / 2), w, h });
  };

  // Visual crop dragging (pointer on preview, in displayed-image coordinates).
  const toNatural = (e: React.PointerEvent) => {
    const el = imgWrapRef.current; if (!el || !origW) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: Math.min(origW, Math.max(0, ((e.clientX - r.left) / r.width) * origW)), y: Math.min(origH, Math.max(0, ((e.clientY - r.top) / r.height) * origH)) };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    if (tab !== "crop" || !origW) return;
    const p = toNatural(e);
    dragRef.current = { px: p.x, py: p.y, rect: crop || { x: 0, y: 0, w: origW, h: origH } };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    const p = toNatural(e);
    let x = Math.min(d.px, p.x); let y = Math.min(d.py, p.y);
    let w = Math.abs(p.x - d.px); let h = Math.abs(p.y - d.py);
    if (cropRatio) { h = w / cropRatio; if (y + h > origH) { h = origH - y; w = h * cropRatio; } }
    setCrop({ x: Math.round(x), y: Math.round(y), w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) });
  };
  const onPointerUp = () => { dragRef.current = null; };

  const process = async () => {
    const dec = decodedRef.current; if (!dec || busy) return;
    setBusy(true); setError("");
    try {
      const r = await renderResized(dec, tab === "crop" ? crop : null, outDims.w, outDims.h, format, quality / 100);
      setResult(r);
    } catch { setError(rs.errorProcess || "Processing failed in this browser. Try a smaller output size."); }
    finally { setBusy(false); }
  };

  const download = () => {
    if (!result) return;
    const base = fileName.replace(/\.[^.]+$/, "") || "image";
    downloadBlob(result.blob, `${base}-resized-${result.width}x${result.height}.${format}`);
  };

  const reset = () => { cleanup(); setFileName(""); setOrigW(0); setOrigH(0); setPreviewUrl(""); setResult(null); setCrop(null); setError(""); };

  const cropPct = crop && origW ? { left: (crop.x / origW) * 100, top: (crop.y / origH) * 100, width: (crop.w / origW) * 100, height: (crop.h / origH) * 100 } : null;
  const numCls = "w-full px-3 py-2.5 rounded-xl border border-stone-300 text-center font-bold text-stone-900 focus:outline-none focus:border-teal-600";

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="imageResizer" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-80" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-700 text-white self-start shadow-sm">
            <Crop className="w-3.5 h-3.5" /> {rs.badge || "Image Resizer & Cropper"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">{rs.pageTitle || "Resize and Crop an Image to the Exact Size You Need"}</h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">{rs.subtitle || "Drop one photo, set exact pixels or a percentage, crop with a preset ratio if you need it, then download as JPG, PNG or WebP. Everything happens in your browser — nothing is uploaded."}</p>
          <p className="text-xs text-stone-500">{rs.vsCompressor || "Need the same dimensions but a smaller file? Use the Image Compressor instead — this tool changes dimensions and crop; the Compressor changes file weight."}</p>
        </div>
      </div>

      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-700 text-white rounded-xl shrink-0"><Info className="w-4 h-4" /></div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-teal-950">{rs.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rs.quickAnswer || "It changes an image's pixel dimensions — by exact size, by percentage, or by cropping to a ratio — and re-encodes it as JPG, PNG or WebP, entirely in your browser tab. Shrinking discards detail permanently; enlarging cannot invent real detail."}</p>
          </div>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) void loadFile(f); }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-all ${isDragging ? "border-teal-600 bg-teal-50 scale-[1.01]" : "border-stone-300 bg-white hover:border-teal-400 hover:bg-teal-50/30"}`}
      >
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void loadFile(f); e.target.value = ""; }} />
        <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-700 flex items-center justify-center mb-3 shadow"><Upload className="w-7 h-7 text-white" /></div>
        <h2 className="text-base sm:text-lg font-bold text-stone-800">{rs.dropTitle || "Drop an image here or click to browse"}</h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">{rs.dropSubtitle || "JPG, PNG or WebP — processed locally, never uploaded"}</p>
      </div>
      {error && <p role="alert" className="text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>}

      {origW > 0 && (
        <>
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-stone-800 truncate max-w-[70%]">{fileName}</p>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold cursor-pointer">{rs.changeBtn || "Change image"}</button>
                <button onClick={reset} className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-red-100 text-xs font-bold cursor-pointer inline-flex items-center gap-1"><X className="w-3.5 h-3.5" />{rs.removeBtn || "Remove"}</button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-600">
              {(rs.originalLabel || "Original")}: <strong className="text-stone-900">{origW} × {origH}px</strong> · {formatFileSize(origSize)}
              {!exifHonoured && <span className="block text-[11px] text-stone-400 mt-1">{rs.exifNote || "Orientation note: this browser decoded the image without the EXIF orientation flag, so a sideways phone photo may need rotating first in your photo app."}</span>}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setTab("resize")} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer ${tab === "resize" ? "bg-teal-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{rs.tabResize || "Resize"}</button>
              <button onClick={() => setTab("crop")} className={`px-3 py-3 rounded-2xl text-sm font-bold cursor-pointer ${tab === "crop" ? "bg-teal-700 text-white shadow" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{rs.tabCrop || "Crop"}</button>
            </div>

            <div
              ref={imgWrapRef}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
              className={`relative mx-auto max-w-xl rounded-2xl overflow-hidden bg-stone-100 select-none ${tab === "crop" ? "cursor-crosshair touch-none" : ""}`}
            >
              <img src={previewUrl} alt="" className="w-full h-auto block" draggable={false} />
              {tab === "crop" && cropPct && (
                <div className="absolute border-2 border-teal-500 bg-teal-400/20 pointer-events-none" style={{ left: `${cropPct.left}%`, top: `${cropPct.top}%`, width: `${cropPct.width}%`, height: `${cropPct.height}%` }} />
              )}
            </div>
            {tab === "crop" && <p className="text-center text-xs text-stone-500">{rs.cropHint || "Drag on the image to draw the crop area. Pick a ratio below to keep the box proportional."}</p>}

            {tab === "crop" && (
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{rs.cropRatioLabel || "Crop ratio"}</p>
                <div className="flex flex-wrap gap-2">
                  {CROP_RATIOS.map((r) => (
                    <button key={r.key} onClick={() => applyCropRatio(r.ratio)} className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${cropRatio === r.ratio ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`}>{r.label === "Free" ? (rs.ratioFree || "Free") : r.label}</button>
                  ))}
                  <button onClick={() => setCrop({ x: 0, y: 0, w: origW, h: origH })} className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 cursor-pointer inline-flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" />{rs.resetCrop || "Reset crop"}</button>
                </div>
                {crop && <p className="text-xs text-stone-500 mt-2">{(rs.cropSizeLabel || "Crop area")}: {crop.w} × {crop.h}px</p>}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">{rs.sizeLabel || "Output size"}</p>
                <button onClick={() => setLock(!lock)} className={`text-xs font-bold cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${lock ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600"}`} title={rs.lockHint || ""}>
                  {lock ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />} {rs.lockLabel || "Lock aspect ratio"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button onClick={() => setMode("pixels")} className={`px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer ${mode === "pixels" ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-700"}`}>{rs.modePixels || "Exact pixels"}</button>
                <button onClick={() => setMode("percent")} className={`px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer ${mode === "percent" ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-700"}`}>{rs.modePercent || "Percentage"}</button>
              </div>
              {mode === "pixels" ? (
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <div><label className="block text-[11px] font-bold text-stone-500 uppercase mb-1" htmlFor="rs-w">{rs.widthLabel || "Width (px)"}</label><input id="rs-w" type="number" min={1} max={MAX_OUT} value={wStr} onChange={(e) => onW(e.target.value)} className={numCls} /></div>
                  <div><label className="block text-[11px] font-bold text-stone-500 uppercase mb-1" htmlFor="rs-h">{rs.heightLabel || "Height (px)"}</label><input id="rs-h" type="number" min={1} max={MAX_OUT} value={hStr} onChange={(e) => onH(e.target.value)} className={numCls} /></div>
                </div>
              ) : (
                <div className="max-w-md">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">{(rs.percentLabel || "Scale")}: <span className="text-teal-700">{pct}%</span> → {outDims.w} × {outDims.h}px</label>
                  <input type="range" min={1} max={400} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full accent-teal-700" />
                  <div className="flex gap-2 mt-2">{[25, 50, 75, 100, 200].map((p) => (<button key={p} onClick={() => setPct(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${pct === p ? "bg-teal-700 text-white" : "bg-stone-100"}`}>{p}%</button>))}</div>
                </div>
              )}
              <p className="text-xs text-stone-500 mt-3">{(rs.outputLabel || "Output")}: <strong className="text-stone-900">{outDims.w} × {outDims.h}px</strong>{enlarged && <span className="block text-amber-700 font-semibold mt-1">{rs.enlargeWarn || "You are enlarging. The result will be softer — enlarging cannot add real detail that was not in the original."}</span>}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{rs.presetsLabel || "Presets"}</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (<button key={p.key} onClick={() => applyPreset(p)} className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-teal-100 text-xs font-bold text-stone-700 cursor-pointer">{rs[p.labelKey] || p.fallback}</button>))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-2">{rs.formatLabel || "Output format"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["jpeg", "png", "webp"] as OutputFormat[]).map((f) => (<button key={f} onClick={() => setFormat(f)} className={`px-3 py-2.5 rounded-xl text-sm font-bold uppercase cursor-pointer ${format === f ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-600"}`}>{f === "jpeg" ? "JPG" : f}</button>))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase mb-2">{(rs.qualityLabel || "Quality")}: <span className="text-teal-700">{quality}%</span></label>
                <input type="range" min={10} max={100} value={quality} disabled={format === "png"} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-teal-700 disabled:opacity-40" />
                {format === "png" && <p className="text-[11px] text-stone-400 mt-1">{rs.pngQualityNote || "PNG ignores the quality slider — it is always lossless and usually larger."}</p>}
              </div>
            </div>

            <button onClick={process} disabled={busy || outDims.w < 1 || outDims.h < 1} className="w-full px-4 py-3.5 rounded-2xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-extrabold cursor-pointer shadow flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> {busy ? (rs.processing || "Processing…") : (rs.processBtn || "Resize Image")}
            </button>

            {result && (
              <div className="border-t border-stone-100 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-stone-50 rounded-2xl p-3"><p className="text-[11px] font-bold text-stone-400 uppercase">{rs.beforeLabel || "Before"}</p><p className="font-extrabold text-stone-800">{origW} × {origH}px</p><p className="text-xs text-stone-500">{formatFileSize(origSize)}</p></div>
                  <div className="bg-teal-50 rounded-2xl p-3"><p className="text-[11px] font-bold text-teal-600 uppercase">{rs.afterLabel || "After"}</p><p className="font-extrabold text-teal-800">{result.width} × {result.height}px</p><p className="text-xs text-teal-700">{formatFileSize(result.size)} · {result.format}</p></div>
                </div>
                <img src={result.dataUrl} alt="" className="mx-auto max-h-64 rounded-xl border border-stone-200" />
                <button onClick={download} className="w-full px-4 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-700 text-white text-sm font-extrabold cursor-pointer flex items-center justify-center gap-2"><Download className="w-4 h-4" /> {rs.downloadBtn || "Download Resized Image"}</button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-amber-900 mb-1">{rs.honestTitle || "Honest limits"}</h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rs.honestText || "Making an image smaller throws pixels away for good — detail is lost, and the only way back is the original file. Making it bigger invents pixels by blending neighbours, so the result looks softer, never sharper. JPG and WebP also trade a little quality for size each time you re-encode; PNG stays exact but larger. Keep your original file safe."}</p>
            </div>
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-emerald-900 mb-1 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {rs.privacyTitle || "Private by design"}</h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{rs.privacyNote || "Your image is decoded and re-encoded inside this browser tab with the Canvas API. It is never uploaded, and closing the tab leaves nothing behind. For comparison: this tool changes dimensions and crop — if you only need a smaller file at the same size, use the Image Compressor."}</p>
            </div>
          </div>
        </>
      )}

      {!origW && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <ImageIcon className="w-5 h-5 text-stone-300" /> {rs.emptyHint || "No image yet. Drop a JPG, PNG or WebP above to see its real dimensions and start resizing."}
        </div>
      )}

      <ToolGuideSection toolId="imageResizer" selectedLanguage={selectedLanguage} />
    </div>
  );
}
