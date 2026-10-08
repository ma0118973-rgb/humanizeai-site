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
