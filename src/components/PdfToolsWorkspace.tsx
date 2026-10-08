import React, { useState, useRef } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { Upload, Download, FileText, Files, ImagePlus, ShieldCheck, Zap, RefreshCw, X, Check, Sparkles, ArrowUp, ArrowDown } from "lucide-react";
import { mergePdfs, imagesToPdf, downloadBlob, formatFileSize, MergedPdf } from "../utils/pdfEngine";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface PdfToolsWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type ToolMode = "merge" | "images";

interface FileItem {
  id: string;
  file: File;
}

export function PdfToolsWorkspace({ selectedLanguage = "en" }: PdfToolsWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const pt = (t as any).pdfTools || {};
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<ToolMode>("merge");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<MergedPdf | null>(null);
  const [error, setError] = useState<string | null>(null);

  const acceptType = mode === "merge" ? "application/pdf" : "image/*";

  const addFiles = (newFiles: FileList | File[]) => {
    const valid = Array.from(newFiles).filter((f) =>
      mode === "merge" ? f.type === "application/pdf" : f.type.startsWith("image/")
    );
    const items = valid.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
    }));
    setFiles((prev) => [...prev, ...items]);
    setResult(null);
    setError(null);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setResult(null);
  };

  const moveFile = (id: string, dir: -1 | 1) => {
    setFiles((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
    setResult(null);
  };

  const process = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    try {
      const fileList = files.map((f) => f.file);
      const out = mode === "merge" ? await mergePdfs(fileList) : await imagesToPdf(fileList);
      setResult(out);
    } catch {
      setError(pt.errorMsg || "Could not process these files. For merge: use valid PDF files. For images: use JPG or PNG. Encrypted PDFs are not supported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const name = mode === "merge" ? "merged.pdf" : "images.pdf";
    downloadBlob(result.blob, name);
  };

  const switchMode = (m: ToolMode) => {
    setMode(m);
    setFiles([]);
    setResult(null);
    setError(null);
  };

  const totalSize = files.reduce((s, f) => s + f.file.size, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="pdfTools" selectedLanguage={selectedLanguage} />
      {/* Hero — Tool FIRST */}
      <div className="bg-gradient-to-br from-red-100 via-red-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-red-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(248,113,113,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-400" />
              {pt.badge || "PDF Tools"}
            </span>
            <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% In-Browser • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {pt.title || "Merge PDF & Convert Images to PDF — Free"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {pt.subtitle || "Combine PDFs or turn images into a PDF. Everything happens in your browser — files never leave your device."}
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => switchMode("merge")}
          className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
            mode === "merge" ? "border-red-500 bg-red-50 shadow-md" : "border-stone-200 bg-white hover:border-red-300"
          }`}
        >
          <Files className={`w-6 h-6 mb-2 ${mode === "merge" ? "text-red-600" : "text-stone-400"}`} />
          <p className="font-bold text-sm sm:text-base text-stone-800">{pt.mergeTitle || "Merge PDF"}</p>
          <p className="text-xs text-stone-500 mt-1">{pt.mergeDesc || "Combine multiple PDFs into one"}</p>
        </button>
        <button
          onClick={() => switchMode("images")}
          className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
            mode === "images" ? "border-red-500 bg-red-50 shadow-md" : "border-stone-200 bg-white hover:border-red-300"
          }`}
        >
          <ImagePlus className={`w-6 h-6 mb-2 ${mode === "images" ? "text-red-600" : "text-stone-400"}`} />
          <p className="font-bold text-sm sm:text-base text-stone-800">{pt.imagesTitle || "Images to PDF"}</p>
          <p className="text-xs text-stone-500 mt-1">{pt.imagesDesc || "Turn JPG/PNG into a PDF"}</p>
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => (mode === "merge" ? fileInputRef : imgInputRef).current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging ? "border-red-500 bg-red-50 scale-[1.01]" : "border-stone-300 bg-white hover:border-red-400 hover:bg-red-50/30"
        }`}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
        <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-stone-800 mb-2">
          {mode === "merge"
            ? pt.dropPdf || "Drop PDF files here or click to browse"
            : pt.dropImg || "Drop images here or click to browse"}
        </h2>
        <p className="text-sm text-stone-500">
          {pt.dropSub || "Processed locally, never uploaded"}
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-800 text-sm">
              {files.length} {pt.files || "files"} • {formatFileSize(totalSize)}
            </h3>
            <button
              onClick={() => { setFiles([]); setResult(null); }}
              className="text-xs font-bold text-red-600 hover:text-red-500 cursor-pointer"
            >
              {pt.clearAll || "Clear all"}
            </button>
          </div>
          {files.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <FileText className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-medium text-stone-700 truncate flex-1">{item.file.name}</p>
              <span className="text-xs text-stone-400 shrink-0 hidden sm:block">{formatFileSize(item.file.size)}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => moveFile(item.id, -1)} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 cursor-pointer">
                  <ArrowUp className="w-4 h-4 text-stone-500" />
                </button>
                <button onClick={() => moveFile(item.id, 1)} disabled={idx === files.length - 1} className="p-1.5 rounded-lg hover:bg-stone-200 disabled:opacity-30 cursor-pointer">
                  <ArrowDown className="w-4 h-4 text-stone-500" />
                </button>
                <button onClick={() => removeFile(item.id)} className="p-1.5 rounded-lg hover:bg-red-100 cursor-pointer">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={process}
            disabled={isProcessing || files.length < (mode === "merge" ? 1 : 1)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm sm:text-base hover:from-red-500 hover:to-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            {isProcessing ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /> {pt.processing || "Processing..."}</>
            ) : (
              <><Zap className="w-5 h-5" /> {mode === "merge" ? pt.mergeBtn || "Merge PDFs" : pt.convertBtn || "Create PDF"}</>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center">
            <Check className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-emerald-900 text-lg">{pt.doneTitle || "Done!"}</h3>
            <p className="text-sm text-emerald-700">
              {result.pageCount} {pt.pages || "pages"} • {formatFileSize(result.fileSize)}
            </p>
          </div>
          <button
            onClick={download}
            className="px-8 py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all flex items-center gap-2 mx-auto cursor-pointer shadow-lg"
          >
            <Download className="w-5 h-5" /> {pt.download || "Download PDF"}
          </button>
        </div>
      )}

      {/* AEO */}
      <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-red-950">
              {pt.quickTitle || "How do I merge PDFs without uploading them?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {pt.quickAnswer || "Select your PDF files above — they are combined entirely in your browser using local processing. No upload, no account, no waiting on a server. Reorder files with the arrow buttons before merging."}
            </p>
          </div>
        </div>
      </div>

      {/* Trust */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: ShieldCheck, label: pt.private || "100% Private" },
          { icon: Zap, label: pt.instant || "Instant" },
          { icon: Check, label: pt.free || "Free" },
        ].map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4">
            <b.icon className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <p className="text-xs font-bold text-stone-600">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
