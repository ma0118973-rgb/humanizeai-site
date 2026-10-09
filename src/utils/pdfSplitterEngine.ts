// PDF Splitter — 100% client-side using pdf-lib.
// Extract selected pages into one new PDF, or one PDF per page-range.
// The file is read and rewritten in the browser tab; nothing is uploaded.

import { PDFDocument } from "pdf-lib";

export interface LoadedPdf {
  bytes: ArrayBuffer;
  pageCount: number;
}

export type PdfLoadErrorKind = "encrypted" | "invalid";

export class PdfLoadError extends Error {
  kind: PdfLoadErrorKind;
  constructor(kind: PdfLoadErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

/**
 * Load a PDF and report its real page count.
 * Deliberately does NOT pass ignoreEncryption: a password-protected PDF
 * must fail honestly instead of producing empty or garbled output pages.
 */
export async function loadPdf(file: File): Promise<LoadedPdf> {
  const bytes = await file.arrayBuffer();
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes);
  } catch (e) {
    const msg = String((e as Error)?.message || e);
    if (/encrypt/i.test(msg)) throw new PdfLoadError("encrypted", msg);
    throw new PdfLoadError("invalid", msg);
  }
  return { bytes, pageCount: doc.getPageCount() };
}

/**
 * Parse a range string like "1-3, 5, 8-10" into segments of 0-based page
 * indices (one segment per comma-separated group). Pages are 1-based in the
 * input. Throws Error("empty") when nothing was typed and Error("range")
 * for malformed or out-of-range input.
 */
export function parsePageRanges(input: string, pageCount: number): number[][] {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) throw new Error("empty");
  const segments: number[][] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
    if (!m) throw new Error("range");
    const start = parseInt(m[1], 10);
    const end = m[2] ? parseInt(m[2], 10) : start;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start || end > pageCount) {
      throw new Error("range");
    }
    const seg: number[] = [];
    for (let p = start; p <= end; p++) seg.push(p - 1);
    segments.push(seg);
  }
  return segments;
}

/** Human label for a segment, e.g. [0,1,2] -> "1-3", [4] -> "5". */
export function segmentLabel(indices: number[]): string {
  if (indices.length === 0) return "";
  const first = indices[0] + 1;
  const last = indices[indices.length - 1] + 1;
  return first === last ? String(first) : `${first}-${last}`;
}

export interface SplitOutputFile {
  blob: Blob;
  pageCount: number;
  fileSize: number;
  label: string;
}

/** Build one new PDF containing exactly the given 0-based page indices, in order. */
export async function buildPdfFromPages(
  source: PDFDocument,
  indices: number[],
  label: string
): Promise<SplitOutputFile> {
  const out = await PDFDocument.create();
  const pages = await out.copyPages(source, indices);
  pages.forEach((p) => out.addPage(p));
  const saved = await out.save();
  const blob = new Blob([saved.buffer as ArrayBuffer], { type: "application/pdf" });
  return { blob, pageCount: indices.length, fileSize: blob.size, label };
}

/**
 * Split a loaded PDF.
 * mode "one": every selected page (deduplicated, in written order) in a single PDF.
 * mode "separate": one PDF per comma-separated group.
 */
export async function splitPdf(
  loaded: LoadedPdf,
  segments: number[][],
  mode: "one" | "separate"
): Promise<SplitOutputFile[]> {
  const source = await PDFDocument.load(loaded.bytes);
  if (mode === "one") {
    const seen = new Set<number>();
    const all: number[] = [];
    for (const seg of segments) {
      for (const idx of seg) {
        if (!seen.has(idx)) {
          seen.add(idx);
          all.push(idx);
        }
      }
    }
    const label = segments.map(segmentLabel).join("-");
    return [await buildPdfFromPages(source, all, label)];
  }
  const outputs: SplitOutputFile[] = [];
  for (const seg of segments) {
    outputs.push(await buildPdfFromPages(source, seg, segmentLabel(seg)));
  }
  return outputs;
}

/** Files above this size get the honest large-file caution in the UI. */
export const LARGE_FILE_BYTES = 30 * 1024 * 1024;
