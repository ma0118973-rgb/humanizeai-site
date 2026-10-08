import React, { useState, useRef, useCallback } from "react";
import { Upload, Download, Image as ImageIcon, Sparkles, ShieldCheck, Zap, RefreshCw, X, Check, FileImage } from "lucide-react";
import { compressImage, downloadBlob, formatFileSize, OutputFormat, CompressedImage } from "../utils/imageEngine";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface ImageCompressorWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  compressed: CompressedImage | null;
  isCompressing: boolean;
}

export function ImageCompressorWorkspace({ selectedLanguage = "en" }: ImageCompressorWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ic = (t as any).imageCompressor || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpeg");
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const newItems: ImageItem[] = validFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      compressed: null,
      isCompressing: false,
    }));
    setImages((prev) => [...prev, ...newItems]);
    // Auto-compress new images
    newItems.forEach((item) => compressSingle(item.id, item.file, quality, outputFormat));
  }, [quality, outputFormat]);

  const compressSingle = async (id: string, file: File, q: number, format: OutputFormat) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, isCompressing: true } : img)));
    try {
      const result = await compressImage(file, q / 100, format);
      setImages((prev) => prev.map((img) => (img.id === id ? { ...img, compressed: result, isCompressing: false } : img)));
    } catch {
      setImages((prev) => prev.map((img) => (img.id === id ? { ...img, isCompressing: false } : img)));
    }
  };

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    // Re-compress all with new quality
    images.forEach((img) => compressSingle(img.id, img.file, newQuality, outputFormat));
  };

  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format);
    images.forEach((img) => compressSingle(img.id, img.file, quality, format));
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const downloadSingle = (item: ImageItem) => {
    if (!item.compressed) return;
    const ext = item.compressed.format.toLowerCase();
    const name = item.file.name.replace(/\.[^.]+$/, "") + `-compressed.${ext}`;
    downloadBlob(item.compressed.blob, name);
  };

  const totalOriginal = images.reduce((s, i) => s + i.file.size, 0);
  const totalCompressed = images.reduce((s, i) => s + (i.compressed?.compressedSize || 0), 0);
  const totalSaved = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 overflow-hidden">
      {/* Hero Header — Tool FIRST, visible immediately */}
      <div className="bg-gradient-to-br from-sky-950 via-stone-900 to-stone-900 rounded-3xl p-4 sm:p-8 text-white shadow-2xl border border-sky-800/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              {ic.badge || "Image Compressor"}
            </span>
            <span className="text-xs text-stone-400 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% In-Browser • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
            {ic.title || "Compress Images Online — Free, Private, Instant"}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
            {ic.subtitle || "Drop your images below. They never leave your device — compression happens right in your browser."}
          </p>
        </div>
      </div>

      {/* TOOL — Upload Zone (visible immediately, no scrolling) */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-sky-500 bg-sky-50 scale-[1.01]"
            : "border-stone-300 bg-white hover:border-sky-400 hover:bg-sky-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-stone-800 mb-2">
          {ic.dropTitle || "Drop images here or click to browse"}
        </h2>
        <p className="text-sm text-stone-500">
          {ic.dropSubtitle || "JPG, PNG, WebP, GIF — processed locally, never uploaded"}
        </p>
      </div>

      {/* Settings Bar */}
      {images.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quality Slider */}
            <div>
              <label className="text-sm font-bold text-stone-700 mb-3 block">
                {ic.qualityLabel || "Quality"}: <span className="text-sky-600">{quality}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>{ic.smaller || "Smaller"}</span>
                <span>{ic.better || "Better quality"}</span>
              </div>
            </div>
            {/* Format Selector */}
            <div>
              <label className="text-sm font-bold text-stone-700 mb-3 block">
                {ic.formatLabel || "Output format"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["jpeg", "png", "webp"] as OutputFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleFormatChange(fmt)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold uppercase transition-all cursor-pointer ${
                      outputFormat === fmt
                        ? "bg-sky-600 text-white shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Total Stats */}
          {totalCompressed > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-extrabold text-stone-800">{formatFileSize(totalOriginal)}</div>
                <div className="text-xs font-bold text-stone-400 uppercase">{ic.original || "Original"}</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-sky-600">{formatFileSize(totalCompressed)}</div>
                <div className="text-xs font-bold text-stone-400 uppercase">{ic.compressed || "Compressed"}</div>
              </div>
              <div>
                <div className="text-xl font-extrabold text-emerald-600">-{totalSaved}%</div>
                <div className="text-xs font-bold text-stone-400 uppercase">{ic.saved || "Saved"}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-stone-200 shadow overflow-hidden">
              <div className="relative aspect-video bg-stone-100">
                <img src={item.compressed?.dataUrl || item.preview} alt="" className="w-full h-full object-contain" />
                <button
                  onClick={() => removeImage(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                {item.isCompressing && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-stone-500 truncate mb-2">{item.file.name}</p>
                {item.compressed ? (
                  <>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-stone-400 line-through">{formatFileSize(item.compressed.originalSize)}</span>
                      <span className="font-bold text-sky-600">{formatFileSize(item.compressed.compressedSize)}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        -{item.compressed.compressionRatio}%
                      </span>
                    </div>
                    <button
                      onClick={() => downloadSingle(item)}
                      className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      {ic.download || "Download"}
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-stone-400 text-center py-2">{ic.processing || "Processing..."}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AEO Capsule */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-500 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-sky-950">
              {ic.quickAnswerTitle || "How does browser-based image compression work?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {ic.quickAnswer || "Your browser's Canvas API re-encodes images at lower quality settings — entirely on your device. No upload, no server, no waiting. JPEG and WebP use lossy compression (smaller files, tiny quality trade-off); PNG stays lossless."}
            </p>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: ShieldCheck, label: ic.private || "100% Private" },
          { icon: Zap, label: ic.instant || "Instant" },
          { icon: Check, label: ic.free || "Free Forever" },
        ].map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4">
            <b.icon className="w-6 h-6 mx-auto mb-2 text-sky-600" />
            <p className="text-xs font-bold text-stone-600">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
