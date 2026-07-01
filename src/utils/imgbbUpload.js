import { compressImage } from "./compressImage";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Uploads an image to imgbb after compressing it.
 * @param {File} file - The raw File object from a file input
 * @param {Function} [onCompressProgress] - Optional callback for compression progress
 * @returns {Promise<{ url: string, deleteUrl: string, originalSize: number, compressedSize: number }>}
 */
export async function uploadImageToImgbb(file, onCompressProgress) {
  const originalSize = file.size;

  // 1. Compress the image file
  let compressedFile;
  try {
    compressedFile = await compressImage(file, onCompressProgress);
  } catch (error) {
    throw new Error("Image compression failed: " + error.message);
  }

  const compressedSize = compressedFile.size;

  // 2. Prepare FormData and upload to imgbb
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY || "14f390c52fb5fbc113982e8bdcb0e009";
  if (!apiKey) {
    throw new Error("Imgbb API key is missing. Check your environment variables.");
  }

  const formData = new FormData();
  formData.append("image", compressedFile);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Imgbb upload server returned HTTP ${response.status}`);
    }

    const resData = await response.json();
    if (!resData.success) {
      throw new Error(resData.error?.message || "Imgbb upload was not successful");
    }

    // Auto-register in centralized mediaLibrary collection in Firestore
    const mediaId = resData.data.id || slugify(file.name.substring(0, file.name.lastIndexOf("."))) || `img-${Date.now()}`;
    try {
      await setDoc(doc(db, "mediaLibrary", mediaId), {
        id: mediaId,
        name: file.name,
        url: resData.data.url,
        deleteUrl: resData.data.delete_url || "",
        size: Math.round(compressedSize / 1024),
        originalSize: Math.round(originalSize / 1024),
        uploadedAt: serverTimestamp()
      }, { merge: true });
    } catch (logErr) {
      console.warn("Failed to register image in mediaLibrary:", logErr);
    }

    // Return the image URL and the delete URL so the admin can delete from imgbb if needed
    return {
      url: resData.data.url,
      deleteUrl: resData.data.delete_url,
      originalSize,
      compressedSize,
    };
  } catch (error) {
    console.error("Imgbb upload error:", error);
    throw new Error("Imgbb image upload failed: " + error.message);
  }
}
