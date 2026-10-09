// Image compression engine — 100% client-side using Canvas API
// No uploads, no servers, everything happens in the browser.

export interface CompressedImage {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
}

export type OutputFormat = "jpeg" | "png" | "webp";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function compressImage(
  file: File,
  quality: number = 0.8,
  outputFormat: OutputFormat = "jpeg",
  maxDimension?: number
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Resize if max dimension specified
      if (maxDimension && Math.max(width, height) > maxDimension) {
        const ratio = maxDimension / Math.max(width, height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      // White background for JPEG (transparency → white)
      if (outputFormat === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = `image/${outputFormat}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const compressedSize = blob.size;
            const originalSize = file.size;
            resolve({
              blob,
              dataUrl: reader.result as string,
              originalSize,
              compressedSize,
              compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
              width,
              height,
              format: outputFormat.toUpperCase(),
            });
          };
          reader.readAsDataURL(blob);
        },
        mimeType,
        outputFormat === "png" ? undefined : quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/** Decoded source image with EXIF orientation applied where the browser supports it. */
export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** True when createImageBitmap honoured EXIF orientation ("from-image"). */
  exifHonoured: boolean;
  cleanup: () => void;
}

/**
 * Decode an image file respecting EXIF orientation where supported.
 * Prefers createImageBitmap(file, { imageOrientation: "from-image" }); falls back
 * to a plain <img> decode (modern browsers auto-apply EXIF orientation to <img>,
 * but we report exifHonoured=false so the UI can stay honest about the path taken).
 */
export async function decodeImage(file: File | Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return {
        source: bmp,
        width: bmp.width,
        height: bmp.height,
        exifHonoured: true,
        cleanup: () => { try { bmp.close(); } catch { /* already closed */ } },
      };
    } catch { /* fall through to <img> decode */ }
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Failed to load image"));
      el.src = objectUrl;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      exifHonoured: false,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (e) {
    URL.revokeObjectURL(objectUrl);
    throw e;
  }
}

export interface CropRect { x: number; y: number; w: number; h: number; }
export interface ProcessedImage { blob: Blob; dataUrl: string; width: number; height: number; size: number; format: string; }

/**
 * Render a (optionally cropped) region of a decoded image to outW×outH and encode it.
 * Fully local Canvas work. PNG ignores quality; JPG gets a white matte for transparency.
 */
export async function renderResized(
  decoded: DecodedImage,
  crop: CropRect | null,
  outW: number,
  outH: number,
  format: OutputFormat,
  quality: number
): Promise<ProcessedImage> {
  const sx = crop ? crop.x : 0;
  const sy = crop ? crop.y : 0;
  const sw = crop ? crop.w : decoded.width;
  const sh = crop ? crop.h : decoded.height;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(outW));
  canvas.height = Math.max(1, Math.round(outH));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  if (format === "jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(decoded.source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, `image/${format}`, format === "png" ? undefined : quality)
  );
  if (!blob) throw new Error("Encoding failed");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Read failed"));
    r.readAsDataURL(blob);
  });
  return { blob, dataUrl, width: canvas.width, height: canvas.height, size: blob.size, format: format.toUpperCase() };
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
