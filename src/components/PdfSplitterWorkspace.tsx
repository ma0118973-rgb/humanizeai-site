import React, { useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Scissors, Upload, Download, FileText, Files, ShieldCheck, Zap, RefreshCw, X, Check, Sparkles, TriangleAlert,
} from "lucide-react";
import {
  loadPdf, parsePageRanges, splitPdf, PdfLoadError, LARGE_FILE_BYTES,
  LoadedPdf, SplitOutputFile,
} from "../utils/pdfSplitterEngine";
import { downloadBlob, formatFileSize } from "../utils/pdfEngine";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface PdfSplitterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type SplitMode = "one" | "separate";
type ErrorKind = "" | "type" | "encrypted" | "load" | "range" | "empty";

export function PdfSplitterWorkspace({ selectedLanguage = "en" }: PdfSplitterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const ps = (t as any).pdfSplitter || {};
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedPdf | null>(null);
  const [rangeText, setRangeText] = useState("");
  const [mode, setMode] = useState<SplitMode>("one");
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [outputs, setOutputs] = useState<SplitOutputFile[]>([]);
  const [errorKind, setErrorKind] = useState<ErrorKind>("");

  const errorText = () => {
    switch (errorKind) {
      case "type": return ps.errorType || "Please choose a PDF file.";
      case "encrypted": return ps.errorEncrypted || "This PDF is password-protected, so it cannot be opened here. Remove the password in a desktop PDF app first, then split it.";
      case "load": return ps.errorLoad || "This PDF could not be opened. It may be damaged, in an unusual format, or too large for this browser's memory.";
      case "range": return ps.errorRange || "Check the page numbers: use pages between 1 and the page count, like 1-3, 5, 8-10.";
      case "empty": return ps.errorNoPages || "Type at least one page or range first.";
      default: return "";
    }
  };

  const pickFile = async (f: File) => {
    setOutputs([]);
    setErrorKind("");
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setFile(null);
      setLoaded(null);
      setErrorKind("type");
      return;
    }
    setFile(f);
    setLoaded(null);
    setIsBusy(true);
    try {
      const info = await loadPdf(f);
      setLoaded(info);
    } catch (e) {
      if (e instanceof PdfLoadError && e.kind === "encrypted") setErrorKind("encrypted");
      else setErrorKind("load");
    } finally {
      setIsBusy(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setLoaded(null);
    setRangeText("");
    setOutputs([]);
    setErrorKind("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const doSplit = async () => {
    if (!loaded || !file) return;
    setErrorKind("");
    setOutputs([]);
    let segments: number[][];
    try {
      segments = parsePageRanges(rangeText, loaded.pageCount);
    } catch (e) {
      setErrorKind((e as Error).message === "empty" ? "empty" : "range");
      return;
    }
    setIsBusy(true);
    try {
      const out = await splitPdf(loaded, segments, mode);
      setOutputs(out);
    } catch {
      setErrorKind("load");
    } finally {
      setIsBusy(false);
    }
  };

  const baseName = file ? file.name.replace(/\.pdf$/i, "") : "document";
  const downloadOne = (o: SplitOutputFile) => downloadBlob(o.blob, `${baseName}-pages-${o.label}.pdf`);
  const downloadAll = () => outputs.forEach((o, i) => setTimeout(() => downloadOne(o), i * 350));

  const isLarge = file !== null && file.size > LARGE_FILE_BYTES;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="pdfSplitter" selectedLanguage={selectedLanguage} />
      {/* Hero — Tool FIRST */}
      <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-orange-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,146,60,0.15),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-orange-400" />
              {ps.badge || "PDF Splitter"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> In-Browser • No Upload
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {ps.pageTitle || "Split a PDF & Extract Pages — Free, In Your Browser"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {ps.subtitle || "Pick one PDF, type the pages you need (like 1-3, 5, 8), and get one combined PDF or a separate PDF per range. The file never leaves your device."}
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) pickFile(f); }}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging ? "border-orange-500 bg-orange-50 scale-[1.01]" : "border-stone-300 bg-white hover:border-orange-400 hover:bg-orange-50/30"
        }`}
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-stone-800 mb-2">
          {ps.dropTitle || "Drop one PDF here or click to browse"}
        </h2>
        <p className="text-sm text-stone-500">
          {ps.dropSubtitle || "One PDF at a time — processed locally, never uploaded"}
        </p>
      </div>

      {errorKind && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{errorText()}</p>
      )}

      {!file && !errorKind && (
        <p className="text-sm text-stone-500 text-center">{ps.emptyHint || "No PDF yet. Add one above — you will see its real page count before choosing pages."}</p>
      )}

      {/* File + Range Builder */}
      {file && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
            <FileText className="w-6 h-6 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{file.name}</p>
              <p className="text-xs text-stone-400">
                {ps.sizeLabel || "Size"}: {formatFileSize(file.size)}
                {loaded && <> • {ps.pagesLabel || "Pages"}: {loaded.pageCount}</>}
                {isBusy && !loaded && <> • …</>}
              </p>
            </div>
            <button onClick={clearAll} className="p-1.5 rounded-lg hover:bg-red-100 cursor-pointer shrink-0" title={ps.removeFile || "Choose a different PDF"}>
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {isLarge && (
            <p className="text-xs sm:text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
              {ps.largeFileWarning || "This is a large file. Splitting runs in browser memory, so it may be slow or fail on a low-memory device — smaller ranges help."}
            </p>
          )}

          {loaded && (
            <>
              <div>
                <label className="block text-sm font-bold text-stone-800 mb-1.5" htmlFor="pdf-range-input">
                  {ps.rangeLabel || "Pages to extract"}
                </label>
                <input
                  id="pdf-range-input"
                  type="text"
                  value={rangeText}
                  onChange={(e) => setRangeText(e.target.value)}
                  placeholder={ps.rangePlaceholder || "e.g. 1-3, 5, 8-10"}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm sm:text-base font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
                <p className="text-xs text-stone-500 mt-1.5">{ps.rangeHint || "Use commas between groups and a hyphen for a range. Pages are numbered from 1."}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-stone-800 mb-2">{ps.modeLabel || "Output"}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode("one")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      mode === "one" ? "border-orange-500 bg-orange-50 shadow-md" : "border-stone-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <FileText className={`w-5 h-5 mb-1.5 ${mode === "one" ? "text-orange-600" : "text-stone-400"}`} />
                    <p className="font-bold text-sm text-stone-800">{ps.modeOneLabel || "One PDF"}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{ps.modeOneDesc || "All selected pages in a single new PDF, in the order written."}</p>
                  </button>
                  <button
                    onClick={() => setMode("separate")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      mode === "separate" ? "border-orange-500 bg-orange-50 shadow-md" : "border-stone-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    <Files className={`w-5 h-5 mb-1.5 ${mode === "separate" ? "text-orange-600" : "text-stone-400"}`} />
                    <p className="font-bold text-sm text-stone-800">{ps.modeSeparateLabel || "Separate PDFs"}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{ps.modeSeparateDesc || "One PDF per group above (1-3 becomes one file, 5 becomes another)."}</p>
                  </button>
                </div>
              </div>

              <button
                onClick={doSplit}
                disabled={isBusy}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-sm sm:text-base hover:from-orange-500 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isBusy ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> {ps.splitting || "Splitting…"}</>
                ) : (
                  <><Scissors className="w-5 h-5" /> {ps.splitBtn || "Split PDF"}</>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {outputs.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-extrabold text-emerald-900 text-base sm:text-lg">{ps.resultsTitle || "Your split PDFs"}</h3>
          </div>
          <div className="space-y-2.5">
            {outputs.map((o, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-emerald-100">
                <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{baseName}-pages-{o.label}.pdf</p>
                  <p className="text-xs text-stone-400">{o.pageCount} {ps.resultPagesLabel || "pages"} • {formatFileSize(o.fileSize)}</p>
                </div>
                <button
                  onClick={() => downloadOne(o)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" /> {ps.downloadBtn || "Download"}
                </button>
              </div>
            ))}
          </div>
          {outputs.length > 1 && (
            <button
              onClick={downloadAll}
              className="w-full py-3 rounded-2xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> {ps.downloadAllBtn || "Download all"}
            </button>
          )}
          <button onClick={clearAll} className="text-xs font-bold text-emerald-700 hover:text-emerald-600 cursor-pointer">
            {ps.clearBtn || "Clear"}
          </button>
        </div>
      )}

      {/* AEO Quick Answer */}
      <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500 text-white rounded-xl shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-orange-950">
              {ps.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {ps.quickAnswer || "It copies the pages you choose out of one PDF into new PDF files, using the open-source pdf-lib library inside this browser tab. Nothing is uploaded. Pages are copied exactly as they are — splitting does not edit, compress or read (OCR) the content, and a password-protected or damaged PDF will fail with a clear error instead of a fake result."}
            </p>
          </div>
        </div>
      </div>

      {/* Cross-link: merging lives on PDF Tools */}
      <a
        href={`/${selectedLanguage}/pdf-tools/`}
        className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-4 hover:border-orange-300 hover:bg-orange-50/40 transition-all"
      >
        <Files className="w-6 h-6 text-red-500 shrink-0" />
        <span className="text-sm text-stone-700">
          <strong className="text-stone-900">PDF Tools:</strong> {ps.supportText || "One standard PDF at a time. To combine PDFs instead, use the PDF Tools page (Merge)."}
        </span>
      </a>

      {/* Honest limits */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-stone-900 mb-1.5">{ps.honestTitle || "Honest limits — what splitting does and does not do"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {ps.honestText || "Splitting copies pages exactly: it does not edit text, shrink file size, or read scanned text (no OCR). A scanned PDF stays a scan. Password-protected files cannot be opened, damaged files can fail, and very large PDFs can exhaust a phone's browser memory."}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5">
          <h3 className="text-sm font-bold text-stone-900 mb-1.5">{ps.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {ps.privacyNote || "Your PDF is read and rewritten inside this browser tab with pdf-lib (JavaScript). It is never uploaded to a server."}
          </p>
        </div>
      </div>

      {/* Trust */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: ShieldCheck, label: "100% Private" },
          { icon: Zap, label: "Instant" },
          { icon: Check, label: "Free" },
        ].map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4">
            <b.icon className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <p className="text-xs font-bold text-stone-600">{b.label}</p>
          </div>
        ))}
      </div>

      <ToolGuideSection toolId="pdfSplitter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
