import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Braces, Check, ChevronDown, ChevronRight, CircleCheck, CircleX, Copy,
  Download, Eraser, FileJson, Info, ListTree, ShieldAlert, ShieldCheck,
  Upload,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface JsonFormatterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type IndentChoice = "2" | "4" | "tab";
type ActionKind = "beautify" | "minify" | "validate";

interface ParseStatus {
  kind: "idle" | "valid" | "invalid";
  message: string;
  position?: number;
  line?: number;
  column?: number;
  context?: string;
}

interface JsonStats {
  chars: number;
  bytes: number;
  lines: number;
  rootType: string;
  keys: number;
  objects: number;
  arrays: number;
  values: number;
  maxDepth: number;
}

const SAMPLE_JSON = `{"school":"Demo High School","class":"10-A","students":[{"name":"Amina","score":92,"passed":true},{"name":"Lucas","score":87,"passed":true}],"room":null,"subjects":["Math","Science","Art"]}`;

function typeName(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function computeStats(input: string, parsed: unknown, hasParsed: boolean): JsonStats {
  const encoder = new TextEncoder();
  const stats: JsonStats = {
    chars: [...input].length,
    bytes: encoder.encode(input).length,
    lines: input ? input.split(/\r\n|\r|\n/).length : 0,
    rootType: hasParsed ? typeName(parsed) : "—",
    keys: 0,
    objects: 0,
    arrays: 0,
    values: 0,
    maxDepth: 0,
  };
  if (!hasParsed) return stats;

  // Iterative walk: counts the same shapes a recursive walk would, without
  // risking a call-stack overflow on deeply nested documents.
  const stack: { value: unknown; depth: number }[] = [{ value: parsed, depth: 1 }];
  while (stack.length) {
    const { value, depth } = stack.pop()!;
    stats.values += 1;
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    if (Array.isArray(value)) {
      stats.arrays += 1;
      for (let i = value.length - 1; i >= 0; i--) stack.push({ value: value[i], depth: depth + 1 });
    } else if (value !== null && typeof value === "object") {
      stats.objects += 1;
      const entries = Object.entries(value as Record<string, unknown>);
      stats.keys += entries.length;
      for (let i = entries.length - 1; i >= 0; i--) stack.push({ value: entries[i][1], depth: depth + 1 });
    }
  }
  return stats;
}

function lineColumnAt(input: string, position: number): { line: number; column: number } {
  const upto = input.slice(0, Math.max(0, Math.min(position, input.length)));
  const lines = upto.split(/\r\n|\r|\n/);
  return { line: lines.length, column: [...lines[lines.length - 1]].length + 1 };
}

function parseStatusFromError(input: string, err: unknown): ParseStatus {
  const raw = err instanceof Error ? err.message : String(err);
  const posMatch = raw.match(/position\s+(\d+)/i);
  const lineColMatch = raw.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (posMatch) {
    const position = Number(posMatch[1]);
    const lc = lineColumnAt(input, position);
    const start = Math.max(0, position - 40);
    const end = Math.min(input.length, position + 40);
    return {
      kind: "invalid",
      message: raw,
      position,
      line: lc.line,
      column: lc.column,
      context: input.slice(start, end),
    };
  }
  if (lineColMatch) {
    return {
      kind: "invalid",
      message: raw,
      line: Number(lineColMatch[1]),
      column: Number(lineColMatch[2]),
    };
  }
  // Some browsers only say "Unexpected end of JSON input" or name the token.
  // In that case the exact position is genuinely unavailable; we say so.
  return { kind: "invalid", message: raw };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function TreeNode({
  name,
  value,
  depth,
  expandSignal,
}: {
  name: string;
  value: unknown;
  depth: number;
  expandSignal: { version: number; open: boolean };
}) {
  const isContainer = value !== null && typeof value === "object";
  const [open, setOpen] = useState(depth < 2);
  React.useEffect(() => {
    if (expandSignal.version > 0) setOpen(expandSignal.open);
  }, [expandSignal]);

  if (!isContainer) {
    const text = typeof value === "string" ? `"${value}"` : String(value);
    const color = value === null
      ? "text-stone-400"
      : typeof value === "string"
        ? "text-emerald-700"
        : typeof value === "number"
          ? "text-blue-700"
          : "text-amber-700";
    return (
      <div className="flex gap-2 py-0.5 font-mono text-xs leading-relaxed" style={{ paddingLeft: `${depth * 16}px` }}>
        <span className="text-stone-500 shrink-0">{name}:</span>
        <span className={`${color} break-all`}>{text}</span>
        <span className="text-[10px] text-stone-400 shrink-0">({typeName(value)})</span>
      </div>
    );
  }

  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((v, i) => [String(i), v] as [string, unknown])
    : Object.entries(value as Record<string, unknown>);
  const summary = Array.isArray(value) ? `[ ${entries.length} ]` : `{ ${entries.length} }`;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 py-0.5 font-mono text-xs text-left cursor-pointer hover:bg-sky-50 rounded px-1 w-full"
        style={{ paddingLeft: `${depth * 16}px` }}
        aria-expanded={open}
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-500 shrink-0" />}
        <span className="text-stone-600 shrink-0">{name}:</span>
        <span className="text-sky-800 font-bold">{summary}</span>
        <span className="text-[10px] text-stone-400">({typeName(value)})</span>
      </button>
      {open && entries.map(([childName, childValue]) => (
        <TreeNode
          key={childName}
          name={childName}
          value={childValue}
          depth={depth + 1}
          expandSignal={expandSignal}
        />
      ))}
    </div>
  );
}

export function JsonFormatterWorkspace({ selectedLanguage = "en" }: JsonFormatterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const jf = (t as any).jsonFormatter || {};

  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentChoice>("2");
  const [output, setOutput] = useState("");
  const [parsed, setParsed] = useState<unknown>(undefined);
  const [hasParsed, setHasParsed] = useState(false);
  const [status, setStatus] = useState<ParseStatus>({ kind: "idle", message: "" });
  const [lastAction, setLastAction] = useState<ActionKind>("beautify");
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState("");
  const [expandSignal, setExpandSignal] = useState({ version: 0, open: true });
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => computeStats(input, parsed, hasParsed), [input, parsed, hasParsed]);
  const isLarge = stats.bytes > 1024 * 1024;
  const treeTooLarge = hasParsed && stats.values > 1500;

  const resetResult = () => {
    setOutput("");
    setParsed(undefined);
    setHasParsed(false);
  };

  const process = (action: ActionKind) => {
    setLastAction(action);
    setFileError("");
    if (!input.trim()) {
      setStatus({ kind: "idle", message: "" });
      resetResult();
      return;
    }
    try {
      const value = JSON.parse(input);
      setParsed(value);
      setHasParsed(true);
      setStatus({ kind: "valid", message: jf.validText || "Valid JSON. The document parsed successfully." });
      if (action === "beautify") {
        setOutput(JSON.stringify(value, null, indent === "tab" ? "\t" : Number(indent)));
      } else if (action === "minify") {
        setOutput(JSON.stringify(value));
      }
    } catch (err) {
      resetResult();
      setStatus(parseStatusFromError(input, err));
    }
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    setFileError("");
    if (file.size > 10 * 1024 * 1024) {
      setFileError(jf.fileTooBig || "That file is larger than 10 MB. Very large files can freeze a browser tab, so this tool will not read it.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result || ""));
      resetResult();
      setStatus({ kind: "idle", message: "" });
    };
    reader.onerror = () => setFileError(jf.fileError || "The file could not be read. Try copying its text and pasting it instead.");
    reader.readAsText(file);
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable in this context */ }
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = lastAction === "minify" ? "minified.json" : "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput("");
    resetResult();
    setStatus({ kind: "idle", message: "" });
    setFileError("");
  };

  const indentOptions: { id: IndentChoice; label: string }[] = [
    { id: "2", label: jf.indent2 || "2 spaces" },
    { id: "4", label: jf.indent4 || "4 spaces" },
    { id: "tab", label: jf.indentTab || "Tab" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <MobileToolHero toolId="jsonFormatter" selectedLanguage={selectedLanguage} />

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-5 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -z-0 opacity-70" />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-700 text-white self-start shadow-sm">
            <Braces className="w-3.5 h-3.5" /> {jf.badge || "JSON Formatter"}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {jf.pageTitle || "Beautify, Minify & Validate JSON in Your Browser"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {jf.subtitle || "Paste JSON, open a file, then beautify it with 2 or 4 spaces, compress it to one line, validate it with honest error positions, or walk the result as a collapsible tree. Everything is parsed locally with JSON.parse — nothing is uploaded."}
          </p>
        </div>
      </div>

      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 sm:p-6 text-stone-800">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sky-700 text-white rounded-xl shrink-0">
            <Braces className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-sky-950">{jf.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {jf.quickAnswer || "It reads your JSON once with the browser's own parser. Beautify rewrites it with the indentation you choose, Minify removes the whitespace, Validate reports whether the document is legal JSON (and where the parser stopped, when the browser reports a position), and the tree view lets you open and close nested objects and arrays without hunting for commas."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-amber-950">{jf.secretTitle || "Before you paste: keep secrets out"}</h2>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            {jf.secretText || "This tool parses on your device and sends nothing. Even so, never paste passwords, API keys, access tokens, session cookies or private customer data into any website tool — replace real values with harmless demo values first, exactly like the sample on this page."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer">
            <Upload className="w-4 h-4" /> {jf.uploadBtn || "Open .json file"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.txt,application/json,text/plain"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0] || null); e.target.value = ""; }}
          />
          <button
            onClick={() => { setInput(SAMPLE_JSON); resetResult(); setStatus({ kind: "idle", message: "" }); setFileError(""); }}
            className="px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer"
          >
            {jf.sampleBtn || "Try sample"}
          </button>
          <button onClick={clearAll} disabled={!input && !output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 cursor-pointer">
            <Eraser className="w-4 h-4" /> {jf.clearBtn || "Clear"}
          </button>
          <span className="text-[11px] font-bold text-stone-500 ml-auto">
            {stats.chars.toLocaleString()} {(jf.charsLabel || "characters")} · {formatBytes(stats.bytes)} · {stats.lines.toLocaleString()} {(jf.linesLabel || "lines")}
          </span>
        </div>

        {fileError && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">{fileError}</p>
        )}

        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2" htmlFor="json-input">
            {jf.inputLabel || "Your JSON (paste or drop a file here)"}
          </label>
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] || null); }}
            onDragOver={(e) => e.preventDefault()}
            placeholder={jf.placeholder || "Paste JSON here, for example {\"name\":\"Demo\",\"items\":[1,2,3]} …"}
            spellCheck={false}
            className="w-full h-44 rounded-2xl border border-stone-300 p-4 font-mono text-xs sm:text-sm leading-relaxed text-stone-800 placeholder-stone-400 focus:outline-none focus:border-sky-600 resize-y"
          />
        </div>

        {isLarge && (
          <p className="flex items-start gap-2 text-[11px] sm:text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{jf.largeText || "This is a large document (over 1 MB). Parsing and the tree view can take a moment and may slow down a small phone. The formatted text output is the safer view for very large payloads."}</span>
          </p>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">{jf.indentLabel || "Indent"}</span>
            <div className="flex gap-1.5">
              {indentOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setIndent(opt.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${indent === opt.id ? "bg-sky-700 text-white border-sky-700 shadow" : "bg-stone-50 text-stone-700 border-stone-200 hover:border-sky-300"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button onClick={() => process("beautify")} disabled={!input.trim()} className="px-4 py-2.5 rounded-xl bg-sky-700 text-white text-xs font-bold hover:bg-sky-600 disabled:opacity-50 cursor-pointer">
              {jf.beautifyBtn || "Beautify"}
            </button>
            <button onClick={() => process("minify")} disabled={!input.trim()} className="px-4 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
              {jf.minifyBtn || "Minify"}
            </button>
            <button onClick={() => process("validate")} disabled={!input.trim()} className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 cursor-pointer">
              {jf.validateBtn || "Validate"}
            </button>
          </div>
        </div>

        <div aria-live="polite">
          {status.kind === "valid" && (
            <p className="flex items-start gap-2 text-xs sm:text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <CircleCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>{jf.validTitle || "Valid JSON."}</strong> {status.message}</span>
            </p>
          )}
          {status.kind === "invalid" && (
            <div className="text-xs sm:text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 space-y-1.5">
              <p className="flex items-start gap-2">
                <CircleX className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>{jf.invalidTitle || "Invalid JSON."}</strong> {status.message}</span>
              </p>
              {typeof status.line === "number" && typeof status.column === "number" ? (
                <p className="font-mono text-[11px] sm:text-xs">
                  {(jf.lineLabel || "Line")} {status.line} · {(jf.columnLabel || "Column")} {status.column}
                  {typeof status.position === "number" ? ` · ${(jf.positionLabel || "Position")} ${status.position}` : ""}
                </p>
              ) : (
                <p className="text-[11px] sm:text-xs">{jf.positionUnavailable || "This browser's parser did not report an exact position for this error, so the tool will not guess one. Check the end of the document and the last comma or bracket you edited."}</p>
              )}
              {status.context && (
                <pre className="font-mono text-[11px] bg-white/70 border border-rose-200 rounded-lg px-2 py-1.5 overflow-x-auto whitespace-pre-wrap break-all">{status.context}</pre>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <span className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-2">
              {jf.outputLabel || "Formatted output"}
            </span>
            <textarea
              readOnly
              value={output}
              placeholder={jf.outputPlaceholder || "Beautified or minified JSON will appear here after you press Beautify or Minify."}
              spellCheck={false}
              className="w-full h-56 rounded-2xl border border-stone-300 p-4 font-mono text-xs sm:text-sm leading-relaxed text-stone-800 placeholder-stone-400 bg-stone-50 focus:outline-none resize-y"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={copyOutput} disabled={!output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-700 disabled:opacity-50 cursor-pointer">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? (jf.copied || "Copied!") : (jf.copyBtn || "Copy output")}
              </button>
              <button onClick={downloadOutput} disabled={!output} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 disabled:opacity-50 cursor-pointer">
                <Download className="w-4 h-4" /> {jf.downloadBtn || "Download .json"}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide flex items-center gap-1.5">
                <ListTree className="w-4 h-4" /> {jf.treeTitle || "Tree view"}
              </span>
              {hasParsed && !treeTooLarge && (
                <span className="ml-auto flex gap-1.5">
                  <button onClick={() => setExpandSignal((s) => ({ version: s.version + 1, open: true }))} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-bold hover:bg-stone-200 cursor-pointer">
                    {jf.expandAll || "Expand all"}
                  </button>
                  <button onClick={() => setExpandSignal((s) => ({ version: s.version + 1, open: false }))} className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-bold hover:bg-stone-200 cursor-pointer">
                    {jf.collapseAll || "Collapse all"}
                  </button>
                </span>
              )}
            </div>
            <div className="w-full h-56 rounded-2xl border border-stone-300 p-3 bg-white overflow-auto">
              {hasParsed ? (
                treeTooLarge ? (
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {jf.treeTooLarge || "This document has a very large number of values, so the tree is paused to keep the tab responsive. Use the formatted text output, or split the document into smaller pieces to inspect it here."}
                  </p>
                ) : (
                  <TreeNode name="$" value={parsed} depth={0} expandSignal={expandSignal} />
                )
              ) : (
                <p className="text-xs text-stone-400 leading-relaxed">{jf.treeEmpty || "After a successful Beautify, Minify or Validate, the same data appears here as an open-and-close tree."}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            [jf.rootLabel || "Root type", stats.rootType],
            [jf.keysLabel || "Keys", hasParsed ? stats.keys.toLocaleString() : "—"],
            [jf.objectsLabel || "Objects", hasParsed ? stats.objects.toLocaleString() : "—"],
            [jf.arraysLabel || "Arrays", hasParsed ? stats.arrays.toLocaleString() : "—"],
            [jf.valuesLabel || "Values", hasParsed ? stats.values.toLocaleString() : "—"],
            [jf.depthLabel || "Max depth", hasParsed ? String(stats.maxDepth) : "—"],
            [jf.charsLabel || "Characters", stats.chars.toLocaleString()],
            [jf.sizeLabel || "Size", formatBytes(stats.bytes)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-stone-200 bg-stone-50 px-2 py-2.5">
              <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">{label}</span>
              <span className="block text-sm font-extrabold text-stone-800 mt-0.5">{value}</span>
            </div>
          ))}
        </div>

        <p className="flex items-start gap-2 text-[11px] sm:text-xs text-stone-500 leading-relaxed">
          <FileJson className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
          <span>{jf.honestNote || "Formatting changes whitespace only. It does not repair invalid JSON, sort your keys, or change values — and standard JSON.parse keeps only the last value when a key is repeated, and can lose precision on whole numbers beyond 2^53−1."}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><Info className="w-4 h-4 text-sky-700" /> {jf.honestTitle || "Honest limits"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {jf.honestText || "This is a syntax tool, not a schema checker: it can say whether the document is legal JSON, not whether your API will accept the fields. It never guesses a repair, because changing a comma or quote can change meaning. Comments, trailing commas, single quotes and unquoted keys are JavaScript habits, not JSON — the validator will reject them and the guide explains each one."}
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4 text-sky-700" /> {jf.privacyTitle || "Private by design"}</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {jf.privacyNote || "Your JSON is parsed in this browser tab with JSON.parse. It is not uploaded, stored on a server, saved to an account or shared by this tool, and closing the tab forgets it. The safe habit still applies: keep real passwords and API keys out of every web tool, including this one."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="jsonFormatter" selectedLanguage={selectedLanguage} />
    </div>
  );
}
