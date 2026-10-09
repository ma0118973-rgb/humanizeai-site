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
    const result: any = await worker.recognize(image as any);
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
