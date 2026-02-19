/**
 * Client-side image compression utility.
 *
 * Uses an off-screen <canvas> to resize and re-encode an image so the
 * resulting Blob stays under `maxSizeKB` kilobytes.
 */

interface CompressOptions {
  /** Maximum output size in kilobytes (default 1024 = 1 MB). */
  maxSizeKB?: number;
  /** MIME type for the output image (default "image/jpeg"). */
  type?: string;
  /** Minimum quality value to try before giving up (0-1, default 0.1). */
  minQuality?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const {
    maxSizeKB = 1024,
    type = "image/jpeg",
    minQuality = 0.1,
  } = options;

  const maxSizeBytes = maxSizeKB * 1024;

  // If the file is already small enough, return it as-is.
  if (file.size <= maxSizeBytes) {
    return file;
  }

  // Load the image into an HTMLImageElement.
  const bitmap = await createImageBitmap(file);
  const { width: originalWidth, height: originalHeight } = bitmap;

  // Determine the scale factor so the largest dimension fits a reasonable
  // bound while still reducing file size.  We start at full resolution and
  // step down if quality alone is not enough.
  let scale = 1;
  let quality = 0.9;
  let blob: Blob | null = null;

  // Outer loop: reduce dimensions if needed.
  while (scale > 0.1) {
    const width = Math.round(originalWidth * scale);
    const height = Math.round(originalHeight * scale);

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not obtain 2D context from OffscreenCanvas");
    }

    ctx.drawImage(bitmap, 0, 0, width, height);

    // Inner loop: reduce quality at the current resolution.
    quality = 0.9;
    while (quality >= minQuality) {
      blob = await canvas.convertToBlob({ type, quality });

      if (blob.size <= maxSizeBytes) {
        bitmap.close();
        return blob;
      }

      quality -= 0.1;
    }

    // Quality alone wasn't enough at this resolution -- scale down.
    scale -= 0.1;
  }

  bitmap.close();

  // Return the last attempt even if it still exceeds the limit (best effort).
  if (blob) {
    return blob;
  }

  // Fallback: return the original file.
  return file;
}
