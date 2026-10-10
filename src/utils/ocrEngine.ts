// Image-to-text OCR engine — real Tesseract.js, 100% client-side recognition.
// The IMAGE is never uploaded. Honest caveat: the Tesseract engine and the
// chosen language traineddata are program/data files that download from a CDN
// on FIRST use and are cached by the browser afterwards (so first use needs
// internet and fails offline). That behaviour is stated in the UI, not hidden.
//
// Tesseract.js is loaded lazily (dynamic import) only when the user picks an
// image, so it never bloats the initial page load.

export interface OcrLanguage {
  /** Tesseract traineddata code */
  code: string;
  /** Endonym shown in the picker */
  label: string;
}

/** Only genuinely available Tesseract traineddata packs that map to our site languages. */
export const OCR_LANGUAGES: OcrLanguage[] = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Español" },
  { code: "urd", label: "اردو (Urdu script)" },
  { code: "deu", label: "Deutsch" },
  { code: "fra", label: "Français" },
  { code: "tur", label: "Türkçe" },
  { code: "por", label: "Português" },
  { code: "jpn", label: "日本語" },
  { code: "nor", label: "Norsk" },
  { code: "nld", label: "Nederlands" },
  { code: "ita", label: "Italiano" },
];

export type OcrPhase = "starting" | "loading-language" | "recognizing";

export interface OcrProgress {
  phase: OcrPhase;
  /** 0..1 within the current phase (engine-reported). */
  progress: number;
}

type ProgressFn = (p: OcrProgress) => void;

interface ActiveRun {
  worker: any;
  cancelled: boolean;
}

let activeRun: ActiveRun | null = null;

/**
 * Client-side image preprocessing for OCR (still 100% privacy-safe: the
 * image never leaves the browser). Three steps, in order:
 *   1) Upscale 2x — Tesseract/LSTM reads bigger glyphs noticeably better;
 *   2) Per-pixel grayscale (luminance) + autocontrast normalize —
 *     stretches the histogram to near-black..near-white, sharpening text
 *     against its background without binarizing (thin strokes and subtle
 *     antialiasing survive, which usually reads best for real-world
 *     photos/screenshots at low resolution);
 *   3) High-quality smoothing during the upscale.
 * Returns a canvas ready for Tesseract, or null if preprocessing failed
 * (caller falls back to the untouched original image).
 */
export function preprocessForOcr(source: ImageBitmap | HTMLImageElement): Promise<HTMLCanvasElement | null> {
  return new Promise((resolve) => {
    try {
      const w = source.width;
      const h = source.height;
      if (!w || !h) { resolve(null); return; }
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = Math.min(w * scale, 8192);
      canvas.height = Math.min(canvas.width * (h / w), 8192);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) { resolve(null); return; }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const lut = new Uint8ClampedArray(256);
      // Pass 1: find min/max of the raw pixels.
      let minv = 255, maxv = 0;
      for (let i = 0; i < d.length; i += 4) {
        const g = luminance(d[i], d[i + 1], d[i + 2]);
        if (g < minv) minv = g;
        if (g > maxv) maxv = g;
      }
      // Stretch contrast only if there is meaningful range.
      const range = maxv - minv;
      for (let v = 0; v < 256; v++) {
        lut[v] = range > 32 ? Math.max(0, Math.min(255, Math.round(((v - minv) / range) * 255))) : v;
      }
      // Pass 2: grayscale + lookup.
      for (let i = 0; i < d.length; i += 4) {
        const g = lut[luminance(d[i], d[i + 1], d[i + 2])];
        d[i] = g; d[i + 1] = g; d[i + 2] = g;
        d[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas);
    } catch {
      resolve(null);
    }
  });
}

function luminance(r: number, g: number, b: number): number {
  // Rec. 601 luma coefficients (fine for OCR prep).
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/** Decodes a File/Blob into an ImageBitmap; returns null when decode fails
 * (HEIC-family in non-Safari browsers surfaces cleanly as a null here). */
export async function decodeForOcr(image: File | Blob): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(image, { imageOrientation: "from-image" });
  } catch {
    // Fallback through <img> for browsers where createImageBitmap rejects.
    try {
      const url = URL.createObjectURL(image);
      const img = new Image();
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("decode"));
        img.src = url;
      });
      try {
        const bmp = await createImageBitmap(img);
        URL.revokeObjectURL(url);
        return bmp;
      } catch {
        URL.revokeObjectURL(url);
        return null;
      }
    } catch {
      return null;
    }
  }
}

/**
 * Runs OCR on one image, reporting real status/progress from the engine.
 * Rejects with Error("OCR_CANCELLED") when cancelOcr() is called, or with the
 * underlying engine error (e.g. first-use CDN download failed while offline).
 */
export async function recognizeImageText(
  image: File | Blob,
  langCode: string,
  onProgress: ProgressFn
): Promise<string> {
  // Lazy-load the real engine only now (user has picked an image).
  const Tesseract = await import("tesseract.js");
  const run: ActiveRun = { worker: null, cancelled: false };
  activeRun = run;
  onProgress({ phase: "starting", progress: 0 });

  const logger = (m: { status?: string; progress?: number }) => {
    if (!m || typeof m.progress !== "number") return;
    const s = m.status || "";
    if (s.includes("loading tesseract core") || s.includes("initializing") || s.includes("loading language")) {
      onProgress({ phase: s.includes("language") || s.includes("traineddata") ? "loading-language" : "starting", progress: m.progress });
    } else if (s.includes("recognizing")) {
      onProgress({ phase: "recognizing", progress: m.progress });
    } else if (s.includes("loading")) {
      onProgress({ phase: "loading-language", progress: m.progress });
    }
  };

  try {
    const worker = await Tesseract.createWorker(langCode, Tesseract.OEM ? Tesseract.OEM.DEFAULT : undefined, { logger } as any);
    run.worker = worker;
    if (run.cancelled) throw new Error("OCR_CANCELLED");
    // Preprocess client-side (grayscale + autocontrast + 2x upscale).
    // Falls back silently to the untouched original image if decode or any
    // canvas step fails — preprocessing must never break the OCR path.
    const decoded = await decodeForOcr(image);
    const prepared = decoded ? await preprocessForOcr(decoded) : null;
    const payload: any = prepared || image;
    const result: any = await worker.recognize(payload);
    if (run.cancelled) throw new Error("OCR_CANCELLED");
    return (result && result.data && typeof result.data.text === "string") ? result.data.text : "";
  } finally {
    try { if (run.worker) await run.worker.terminate(); } catch { /* already gone */ }
    if (activeRun === run) activeRun = null;
  }
}

/** Cancels the in-flight OCR run (terminates its worker). */
export function cancelOcr(): void {
  if (activeRun) {
    activeRun.cancelled = true;
    const w = activeRun.worker;
    if (w) { try { void w.terminate(); } catch { /* noop */ } }
  }
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
