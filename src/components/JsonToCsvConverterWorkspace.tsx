import React, { useMemo, useRef, useState } from "react";
import { MobileToolHero } from "./MobileToolHero";
import { ToolGuideSection } from "./ToolGuideSection";
import {
  Check, Copy, Download, FileJson, ShieldAlert, ShieldCheck, Table2, TriangleAlert, Upload,
} from "lucide-react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../data/translations";

interface JsonToCsvConverterWorkspaceProps {
  selectedLanguage?: LanguageCode;
}

type Delimiter = "," | ";" | "\t";

const PREVIEW_ROWS = 50;
const PREVIEW_COLS = 12;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const SAMPLE_JSON = `[
  { "id": 1, "name": "Alice", "address": { "city": "Lahore", "zip": "54000" }, "tags": ["admin", "owner"], "note": "=not-a-formula demo" },
  { "id": 2, "name": "Bob", "address": { "city": "Karachi" }, "tags": ["viewer"], "active": true }
]`;

interface Converted {
  headers: string[];
  rows: string[][];
  csv: string;
  formulaCount: number;
  note: string; // translation key suffix for shape note, or ""
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * The flattening rule (also printed on the page):
 * - nested objects become dot-path columns (address.city)
 * - arrays of primitives become one cell joined with "; "
 * - arrays containing any object become compact JSON text in one cell
 * - null/undefined become an empty cell; other primitives use String()
 */
function flattenInto(obj: Record<string, unknown>, prefix: string, out: Map<string, string>): void {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      if (Object.keys(value).length === 0) {
        if (!out.has(path)) out.set(path, "");
      } else {
        flattenInto(value, path, out);
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        if (!out.has(path)) out.set(path, "");
      } else if (value.every((v) => !isPlainObject(v) && !Array.isArray(v))) {
        out.set(path, value.map((v) => (v === null || v === undefined ? "" : String(v))).join("; "));
      } else {
        out.set(path, JSON.stringify(value));
      }
    } else if (value === null || value === undefined) {
      out.set(path, "");
    } else {
      out.set(path, String(value));
    }
  }
}

function escapeCell(raw: string, delim: Delimiter, safeExport: boolean): string {
  let v = raw;
  if (safeExport && /^[=+\-@]/.test(v)) v = `'${v}`;
  if (v.includes(delim) || v.includes('"') || v.includes("\n") || v.includes("\r")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function buildConverted(data: unknown, delim: Delimiter, includeHeader: boolean, safeExport: boolean): Converted | { errorKey: string } {
  let records: Record<string, unknown>[];
  let note = "";
  if (Array.isArray(data)) {
    if (data.length === 0) return { errorKey: "errorEmptyArray" };
    if (data.every(isPlainObject)) {
      records = data as Record<string, unknown>[];
    } else if (data.every((v) => !isPlainObject(v) && !Array.isArray(v))) {
      records = data.map((v) => ({ value: v }));
      note = "notePrimitiveArray";
    } else {
      return { errorKey: "errorMixedArray" };
    }
  } else if (isPlainObject(data)) {
    records = [data];
    note = "noteSingleObject";
  } else {
    return { errorKey: "errorShape" };
  }

  const flatRows: Map<string, string>[] = records.map((rec) => {
    const m = new Map<string, string>();
    flattenInto(rec, "", m);
    return m;
  });

  // Union of keys, first-seen order.
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of flatRows) {
    for (const k of row.keys()) {
      if (!seen.has(k)) { seen.add(k); headers.push(k); }
    }
  }
  if (headers.length === 0) return { errorKey: "errorNoColumns" };

  const rows: string[][] = flatRows.map((row) => headers.map((h) => row.get(h) ?? ""));

  let formulaCount = 0;
  for (const row of rows) {
    for (const cell of row) {
      if (/^[=+\-@]/.test(cell)) formulaCount++;
    }
  }

  const lines: string[] = [];
  if (includeHeader) lines.push(headers.map((h) => escapeCell(h, delim, false)).join(delim));
  for (const row of rows) lines.push(row.map((c) => escapeCell(c, delim, safeExport)).join(delim));

  return { headers, rows, csv: lines.join("\r\n"), formulaCount, note };
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }
}

export function JsonToCsvConverterWorkspace({ selectedLanguage = "en" }: JsonToCsvConverterWorkspaceProps) {
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;
  const jc = (t as any).jsonToCsv || {};

  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [includeHeader, setIncludeHeader] = useState(true);
  const [safeExport, setSafeExport] = useState(true);
  const [fileError, setFileError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => {
    const s = input.trim();
    if (s === "") return { kind: "empty" as const };
    let data: unknown;
    try {
      data = JSON.parse(s);
    } catch (e) {
      return { kind: "parseError" as const, message: e instanceof Error ? e.message : String(e) };
    }
    const built = buildConverted(data, delimiter, includeHeader, safeExport);
    if ("errorKey" in built) return { kind: "shapeError" as const, errorKey: built.errorKey };
    return { kind: "ok" as const, ...built };
  }, [input, delimiter, includeHeader, safeExport]);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError(jc.fileTooBig || "That file is larger than 10 MB. Very large files can freeze a browser tab, so this tool will not read it.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFileError("");
      setInput(typeof reader.result === "string" ? reader.result : "");
    };
    reader.onerror = () => setFileError(jc.fileError || "The file could not be read. Try copying its text and pasting it instead.");
    reader.readAsText(file);
  };

  const downloadCsv = () => {
    if (result.kind !== "ok") return;
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doCopy = async () => {
    if (result.kind !== "ok") return;
    await copyText(result.csv);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const delimLabel = delimiter === "," ? (jc.delimComma || "Comma (,)") : delimiter === ";" ? (jc.delimSemicolon || "Semicolon (;)") : (jc.delimTab || "Tab");
  const previewNote = (jc.previewNote || "Preview shows the first {rows} rows and {cols} columns. The download and copy always contain every row and column.").replace("{rows}", String(PREVIEW_ROWS)).replace("{cols}", String(PREVIEW_COLS));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-hidden">
      <MobileToolHero toolId="jsonToCsv" selectedLanguage={selectedLanguage} />

      <div className="bg-gradient-to-br from-emerald-100 via-teal-50 to-white rounded-3xl p-4 sm:p-8 text-stone-900 shadow-2xl border border-emerald-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.13),transparent_52%)] pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <FileJson className="w-3.5 h-3.5" />
              {jc.badge || "JSON to CSV Converter"}
            </span>
            <span className="text-xs text-stone-600 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Local • No Upload • JSON.parse
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {jc.pageTitle || "Turn JSON into a Clean CSV — Flattening Rule Shown, Not Hidden"}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
            {jc.subtitle || "Paste or upload JSON, preview the flattened table, choose your delimiter, and download a spreadsheet-safe CSV. Nested objects become dot-path columns, and fields that could turn into spreadsheet formulas are flagged before you export. Nothing is uploaded, ever."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
        <h2 className="text-sm font-extrabold text-stone-900">{jc.quickAnswerTitle || "Quick Answer: What Does This Tool Do?"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {jc.quickAnswer || "It converts a JSON array of objects into CSV rows in this browser tab. Each object becomes one row; nested objects are flattened into dot-path columns like address.city, lists of plain values are joined with '; ' inside one cell, and a list that contains objects is kept as compact JSON text in one cell, because one record must stay one row. Pick a comma, semicolon or tab delimiter, preview the result, then download or copy it. A safe-export option protects fields that begin with =, +, - or @ so a spreadsheet cannot mistake them for formulas."}
        </p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-red-900/85 leading-relaxed">
          <span className="font-bold">{jc.secretTitle || "Before you paste: keep secrets out."} </span>
          {jc.secretText || "This tool parses on your device and sends nothing. Even so, never paste passwords, API keys, access tokens or private customer data into any website tool — replace real values with harmless demo values first, exactly like the sample on this page."}
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> {jc.uploadBtn || "Open .json file"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.txt,application/json"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button
            onClick={() => setInput(SAMPLE_JSON)}
            className="px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-sm font-bold transition-all cursor-pointer"
          >
            {jc.sampleBtn || "Try sample"}
          </button>
          <button
            onClick={() => setInput("")}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-sm font-bold transition-all cursor-pointer"
          >
            {jc.clearBtn || "Clear"}
          </button>
        </div>
        {fileError && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex gap-3">
            <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-900/85 leading-relaxed">{fileError}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-extrabold text-stone-900 mb-1.5" htmlFor="jsoncsv-input">
            {jc.inputLabel || "Your JSON (paste or open a file)"}
          </label>
          <textarea
            id="jsoncsv-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={jc.placeholder || 'Paste JSON here, for example [{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}] …'}
            rows={9}
            spellCheck={false}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          />
          <p className="text-xs text-stone-500 mt-1">{input.length.toLocaleString()} {jc.charsLabel || "characters"}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-stone-800 mb-1.5" htmlFor="jsoncsv-delim">{jc.delimiterLabel || "Delimiter"}</label>
            <select
              id="jsoncsv-delim"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as Delimiter)}
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value=",">{jc.delimComma || "Comma (,)"}</option>
              <option value=";">{jc.delimSemicolon || "Semicolon (;)"}</option>
              <option value={"\t"}>{jc.delimTab || "Tab"}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer pb-2.5">
            <input type="checkbox" checked={includeHeader} onChange={(e) => setIncludeHeader(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
            {jc.headerLabel || "Header row"}
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer pb-2.5">
            <input type="checkbox" checked={safeExport} onChange={(e) => setSafeExport(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
            {jc.safeExportLabel || "Safe export (escape =, +, -, @)"}
          </label>
        </div>
        <p className="text-xs text-stone-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          {jc.localNote || "Converted on this device with JSON.parse — no server, no upload, no record kept."}
        </p>
      </div>

      {/* States + output */}
      {result.kind === "empty" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6">
          <p className="text-sm text-stone-500">{jc.emptyHint || "Paste JSON above or try the sample. An array of objects converts best: each object becomes one row. A single object becomes one row, and the flattening rule below is applied exactly as written."}</p>
        </div>
      )}

      {result.kind === "parseError" && (
        <div className="bg-red-50 border border-red-300 rounded-2xl p-4 sm:p-5 flex gap-3">
          <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-extrabold text-red-950">{jc.parseErrorTitle || "That is not valid JSON yet."}</h2>
            <p className="text-xs sm:text-sm text-red-900/85 leading-relaxed mt-1">
              {jc.parseErrorText || "The browser parser stopped here:"} <code className="font-mono font-bold">{result.message}</code>
            </p>
            <p className="text-xs sm:text-sm text-red-900/70 leading-relaxed mt-1">{jc.parseErrorHint || "Common causes: a missing comma or quote, a trailing comma after the last item, single quotes instead of double quotes, or comments — JSON allows none of those. This tool never guesses a repair, because a guessed comma can change your data."}</p>
          </div>
        </div>
      )}

      {result.kind === "shapeError" && (
        <div className="bg-red-50 border border-red-300 rounded-2xl p-4 sm:p-5 flex gap-3">
          <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-900/85 leading-relaxed">
            {result.errorKey === "errorEmptyArray" && (jc.errorEmptyArray || "The JSON is an empty array, so there are no rows and no columns to export. Add at least one object, for example [{\"id\":1}].")}
            {result.errorKey === "errorMixedArray" && (jc.errorMixedArray || "This array mixes objects with plain values or nested arrays, so it cannot become a clean table. Make every item an object — or, for a simple list, remove the objects so each value lands in one 'value' column.")}
            {result.errorKey === "errorNoColumns" && (jc.errorNoColumns || "These objects have no fields, so there are no columns to export. CSV needs at least one named field per row.")}
            {result.errorKey === "errorShape" && (jc.errorShape || "CSV needs rows, and a single number, text value or true/false cannot become a table. Wrap your records in an array of objects — [{\"id\":1},{\"id\":2}] — or paste one object to convert it as a single row.")}
          </p>
        </div>
      )}

      {result.kind === "ok" && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-extrabold text-stone-900">{jc.statsLabel || "Result"}</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">{result.rows.length.toLocaleString()} {jc.rowsLabel || "rows"}</span>
              <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold">{result.headers.length.toLocaleString()} {jc.columnsLabel || "columns"}</span>
              <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold">{delimLabel}</span>
            </div>
            {result.note === "noteSingleObject" && (
              <p className="text-xs sm:text-sm font-semibold text-teal-900 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">{jc.noteSingleObject || "Shape note: you pasted one object, not a list, so it was converted as a single row. For many rows, wrap your records in [ … ]."}</p>
            )}
            {result.note === "notePrimitiveArray" && (
              <p className="text-xs sm:text-sm font-semibold text-teal-900 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">{jc.notePrimitiveArray || "Shape note: this is a list of plain values, so each value became one row in a single 'value' column."}</p>
            )}
            {result.formulaCount > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-900/85 leading-relaxed">
                  <span className="font-bold">{(jc.formulaWarningTitle || "Spreadsheet safety: {count} field(s) start with =, +, - or @.").replace("{count}", String(result.formulaCount))} </span>
                  {safeExport
                    ? (jc.formulaWarningSafe || "Safe export is ON, so those fields are exported with a leading apostrophe and open as plain text, not formulas. Check the CSV text below to see the apostrophes.")
                    : (jc.formulaWarningUnsafe || "Safe export is OFF, so those fields are exported exactly as written. If this file will be opened in Excel or Google Sheets, a field starting with = can run as a formula — turn Safe export on unless you truly want formulas.")}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3 overflow-hidden">
            <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2"><Table2 className="w-4 h-4 text-emerald-600" /> {jc.previewTitle || "Preview table"}</h2>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="min-w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-emerald-50">
                    {result.headers.slice(0, PREVIEW_COLS).map((h) => (
                      <th key={h} className="px-3 py-2 font-extrabold text-stone-800 border-b border-stone-200 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, PREVIEW_ROWS).map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-stone-50">
                      {row.slice(0, PREVIEW_COLS).map((cell, j) => (
                        <td key={j} className="px-3 py-1.5 text-stone-700 border-b border-stone-100 max-w-[220px] truncate" title={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-stone-500">{previewNote}</p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-extrabold text-stone-900 flex-1">{jc.csvTitle || "CSV output"}</h2>
              <button
                onClick={downloadCsv}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> {jc.downloadBtn || "Download .csv"}
              </button>
              <button
                onClick={doCopy}
                className="px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? (jc.copiedBtn || "Copied!") : (jc.copyBtn || "Copy CSV")}
              </button>
            </div>
            <textarea
              readOnly
              value={result.csv}
              rows={9}
              spellCheck={false}
              aria-label={jc.csvTitle || "CSV output"}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm font-mono bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-5 sm:p-6">
        <h2 className="text-sm font-extrabold text-stone-900">{jc.ruleTitle || "The flattening rule — exactly what happens to nested data"}</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
          {jc.ruleText || "There is no single correct way to flatten nested JSON, so this page states its rule instead of hiding it. Nested objects become dot-path columns: {\"address\":{\"city\":\"Lahore\"}} becomes a column named address.city. A list of plain values becomes one cell joined with '; '. A list that contains objects stays as compact JSON text in one cell — one input record always stays one output row, so inner lists never explode into extra rows. Columns are the union of every flattened key across all records, in first-seen order; a record missing a key gets an empty cell. Numbers and true/false are written as they appear in the JSON, and null becomes an empty cell."}
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex gap-3">
        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-extrabold text-amber-950">{jc.honestTitle || "Honest notes — read before you import the file"}</h2>
          <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed mt-1">
            {jc.honestText || "CSV is a flat table, so conversion is a choice, not a copy: deeply nested data, repeated keys inside one record, and lists of objects all lose their original shape, and converting back will not restore it. A cell that begins with =, +, - or @ can be read as a formula by Excel or Google Sheets (formula injection); Safe export prefixes those cells with an apostrophe so they open as text, which slightly changes the value if you later parse the CSV as data. Text that contains the delimiter, quotes or line breaks is quoted per the CSV convention, and spreadsheets may still reformat dates and long numbers on open — that happens inside the spreadsheet, not here. Very large JSON can slow a small phone; if the tab feels stuck, split the file and convert it in parts."}
          </p>
          <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {jc.privacyNote || "Your JSON is parsed in this browser tab with JSON.parse. It is not uploaded, stored on a server, saved to an account or shared by this tool, and closing the tab forgets it. The safe habit still applies: keep real passwords and API keys out of every web tool, including this one."}
          </p>
        </div>
      </div>

      <ToolGuideSection toolId="jsonToCsv" selectedLanguage={selectedLanguage} />
    </div>
  );
}
