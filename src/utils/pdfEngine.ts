// PDF toolkit — 100% client-side using pdf-lib
// Merge PDFs and create PDFs from images. No uploads, no servers.

import { PDFDocument } from "pdf-lib";

export interface MergedPdf {
  blob: Blob;
  pageCount: number;
  fileSize: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function mergePdfs(files: File[]): Promise<MergedPdf> {
  const merged = await PDFDocument.create();
  let totalPages = 0;

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
    totalPages += pages.length;
  }

  const mergedBytes = await merged.save();
  const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

  return {
    blob,
    pageCount: totalPages,
    fileSize: blob.size,
  };
}

export async function imagesToPdf(files: File[], quality: number = 0.85): Promise<MergedPdf> {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let img;
    if (file.type === "image/png") {
      img = await pdf.embedPng(bytes);
    } else {
      // Convert to JPEG via canvas for consistent compression
      const jpegBytes = await convertToJpeg(bytes, quality);
      img = await pdf.embedJpg(jpegBytes);
    }

    const page = pdf.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }

  const pdfBytes = await pdf.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });

  return {
    blob,
    pageCount: files.length,
    fileSize: blob.size,
  };
}

async function convertToJpeg(imageBytes: ArrayBuffer, quality: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([imageBytes]);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (b) => {
          if (!b) {
            reject(new Error("Conversion failed"));
            return;
          }
          b.arrayBuffer().then(resolve).catch(reject);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
