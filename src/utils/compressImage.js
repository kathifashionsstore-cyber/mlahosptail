import imageCompression from "browser-image-compression";

/**
 * Compresses an image file to under 500KB and converts it to WebP format.
 * @param {File} file - The raw image File object
 * @param {Function} [onProgress] - Optional callback function to receive compression progress (0 to 100)
 * @returns {Promise<File>} The compressed and converted File object
 */
export async function compressImage(file, onProgress) {
  const options = {
    maxSizeMB: 0.5, // 500KB cap
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    onProgress: onProgress ? (progressVal) => onProgress(progressVal) : undefined,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // Create a new File object with a .webp extension
    const originalName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const webpFile = new File([compressedFile], `${originalName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });
    return webpFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    throw error;
  }
}
