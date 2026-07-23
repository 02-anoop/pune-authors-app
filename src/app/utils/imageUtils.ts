/**
 * Client-side image compression utility.
 * Compresses images before upload to avoid 413 "Request Entity Too Large" errors.
 */

interface CompressOptions {
  /** Max width in px. Image is scaled down proportionally if wider. Default: 1920 */
  maxWidth?: number;
  /** Max height in px. Image is scaled down proportionally if taller. Default: 1920 */
  maxHeight?: number;
  /** JPEG quality 0–1. Default: 0.82 */
  quality?: number;
  /** Output MIME type. Default: 'image/jpeg' */
  outputType?: 'image/jpeg' | 'image/webp' | 'image/png';
  /** Max allowed file size in bytes before compression kicks in. Default: 500 KB */
  sizeThreshold?: number;
}

/**
 * Compresses an image File using an off-screen canvas.
 * Returns the original file untouched if it's already under `sizeThreshold`
 * or is not a supported image type.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    outputType = 'image/jpeg',
    sizeThreshold = 500 * 1024, // 500 KB
  } = options;

  // Skip non-images or files already small enough
  if (!file.type.startsWith('image/') || file.size <= sizeThreshold) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions while preserving aspect ratio
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // fallback: return original if canvas is unavailable
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // fallback: return original if conversion fails
            return;
          }
          // Keep original filename but swap extension to match output type
          const ext = outputType === 'image/webp' ? 'webp' : outputType === 'image/png' ? 'png' : 'jpg';
          const newName = file.name.replace(/\.[^.]+$/, '') + '.' + ext;
          const compressed = new File([blob], newName, { type: outputType });

          // Safety net: if compression somehow made it larger, return original
          resolve(compressed.size < file.size ? compressed : file);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback: return original on load error
    };

    img.src = url;
  });
}

/**
 * Compresses multiple image files in parallel.
 */
export async function compressImages(
  files: File[],
  options: CompressOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}

/**
 * Compresses a single file and appends it to a FormData object.
 * Convenience wrapper for form submissions.
 */
export async function appendCompressedImage(
  formData: FormData,
  fieldName: string,
  file: File,
  options: CompressOptions = {}
): Promise<void> {
  const compressed = await compressImage(file, options);
  formData.append(fieldName, compressed, compressed.name);
}
