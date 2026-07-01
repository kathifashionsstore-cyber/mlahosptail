import React, { useState, useEffect } from "react";
import { doc, setDoc, deleteDoc, collection, getDocs, serverTimestamp, query, where, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { Upload, Trash2, Image as ImageIcon, Info, RefreshCw, FileText, User, Heart, Settings, Activity, Globe } from "lucide-react";
import imageCompression from "browser-image-compression";

const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

function stripDataUrlPrefix(image) {
  return image.includes("base64,") ? image.split("base64,")[1] : image;
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(fallbackMessage || `Upload endpoint returned an empty response (${response.status || "no status"}).`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(fallbackMessage || `Upload endpoint returned a non-JSON response (${response.status || "no status"}).`);
  }
}

async function uploadViaProxy(image, slotKey) {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image,
      name: `${slotKey}_${Date.now()}.jpg`,
    }),
  });

  const result = await readJsonResponse(response, "Local upload proxy is not available.");

  if (!response.ok || !result.success) {
    throw new Error(result.error || `Upload proxy returned HTTP ${response.status}.`);
  }

  return {
    imageUrl: result.imageUrl,
    deleteUrl: result.deleteUrl || "",
  };
}

async function uploadDirectlyToImgbb(image, slotKey) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("Upload proxy is unavailable and VITE_IMGBB_API_KEY is not configured for local uploads.");
  }

  const body = new URLSearchParams();
  body.append("image", stripDataUrlPrefix(image));
  body.append("name", `${slotKey}_${Date.now()}`);

  const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  const result = await readJsonResponse(response, "ImgBB returned an empty or invalid upload response.");

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || `ImgBB upload failed with HTTP ${response.status}.`);
  }

  return {
    imageUrl: result.data.url,
    deleteUrl: result.data.delete_url || "",
  };
}

export function ImageManager() {
  const { doctors, services, loadCollections } = useApp();
  
  const [activeCategory, setActiveCategory] = useState("hero");
  const [siteImages, setSiteImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Lists from extra collections
  const [blogsList, setBlogsList] = useState([]);
  const [testimonialsList, setTestimonialsList] = useState([]);

  // Compression metrics
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedBase64, setCompressedBase64] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [categoryTag, setCategoryTag] = useState("");

  const fetchSlotImages = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "siteImages"));
      const mapping = {};
      snap.forEach((doc) => {
        mapping[doc.id] = { slotKey: doc.id, ...doc.data() };
      });
      setSiteImages(mapping);
    } catch (err) {
      console.error("Failed to load site image slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExtraCollections = async () => {
    try {
      const blogsSnap = await getDocs(collection(db, "blogs"));
      setBlogsList(blogsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const testimonialsSnap = await getDocs(collection(db, "testimonials"));
      setTestimonialsList(testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to fetch blogs and testimonials in ImageManager:", err);
    }
  };

  useEffect(() => {
    fetchSlotImages();
    fetchExtraCollections();
  }, []);

  const handleFileChange = async (e, slotKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedSlot(slotKey);
    setSelectedFile(file);
    setOriginalSize(Math.round(file.size / 1024));

    // Populate with existing fields
    const existing = siteImages[slotKey];
    setCaption(existing?.caption || "");
    setAltText(existing?.altText || "");
    setCategoryTag(existing?.categoryTag || "");

    const options = {
      maxSizeMB: 0.48,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    };

    try {
      setStatusMessage({ type: "info", text: "Compressing image client-side..." });
      const compressedFile = await imageCompression(file, options);
      setCompressedSize(Math.round(compressedFile.size / 1024));

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setCompressedBase64(reader.result);
        setStatusMessage({ type: "success", text: "Image compressed successfully! Click Save below to confirm." });
      };
    } catch (err) {
      console.error("Compression failed:", err);
      setStatusMessage({ type: "error", text: "Failed to compress image." });
    }
  };

  const handleUpload = async (slotKey) => {
    if (!compressedBase64) return;
    setSaving(true);
    setStatusMessage({ type: "info", text: "Uploading securely..." });

    try {
      let result;
      try {
        result = await uploadViaProxy(compressedBase64, slotKey);
      } catch (proxyError) {
        console.warn("Upload proxy unavailable; trying local ImgBB upload:", proxyError);
        result = await uploadDirectlyToImgbb(compressedBase64, slotKey);
      }

      const docData = {
        imageUrl: result.imageUrl,
        deleteUrl: result.deleteUrl || "",
        caption: caption || "",
        altText: altText || "",
        updatedAt: serverTimestamp(),
      };

      if (categoryTag) {
        docData.categoryTag = categoryTag;
      }

      await setDoc(doc(db, "siteImages", slotKey), docData, { merge: true });

      // Double-write sync for services thumbnails
      if (slotKey.startsWith("service-thumb-")) {
        const serviceSlug = slotKey.replace("service-thumb-", "");
        try {
          const q = query(collection(db, "services"), where("slug", "==", serviceSlug));
          const snap = await getDocs(q);
          if (!snap.empty) {
            await updateDoc(doc(db, "services", snap.docs[0].id), { thumbnailUrl: result.imageUrl });
          }
        } catch (syncErr) {
          console.warn("Failed to sync service thumbnail:", syncErr);
        }
      }

      // Double-write sync for doctors photo
      if (slotKey.startsWith("doctor-photo-")) {
        const doctorId = slotKey.replace("doctor-photo-", "");
        try {
          await updateDoc(doc(db, "doctors", doctorId), { photoUrl: result.imageUrl });
        } catch (syncErr) {
          console.warn("Failed to sync doctor photoUrl:", syncErr);
        }
      }

      setSiteImages((prev) => ({
        ...prev,
        [slotKey]: { slotKey, ...docData },
      }));

      setSelectedFile(null);
      setCompressedBase64("");
      setCaption("");
      setAltText("");
      setCategoryTag("");
      setStatusMessage({ type: "success", text: `Slot "${slotKey}" updated successfully!` });

      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: `Upload failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotKey) => {
    if (!window.confirm(`Clear the image for slot "${slotKey}"?`)) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, "siteImages", slotKey));

      if (slotKey.startsWith("service-thumb-")) {
        const serviceSlug = slotKey.replace("service-thumb-", "");
        try {
          const q = query(collection(db, "services"), where("slug", "==", serviceSlug));
          const snap = await getDocs(q);
          if (!snap.empty) {
            await updateDoc(doc(db, "services", snap.docs[0].id), { thumbnailUrl: "" });
          }
        } catch (syncErr) {
          console.warn(syncErr);
        }
      }

      if (slotKey.startsWith("doctor-photo-")) {
        const doctorId = slotKey.replace("doctor-photo-", "");
        try {
          await updateDoc(doc(db, "doctors", doctorId), { photoUrl: "" });
        } catch (syncErr) {
          console.warn(syncErr);
        }
      }

      setSiteImages((prev) => {
        const copy = { ...prev };
        delete copy[slotKey];
        return copy;
      });
      setStatusMessage({ type: "success", text: `Slot "${slotKey}" cleared.` });
      
      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Failed to delete slot mapping." });
    } finally {
      setSaving(false);
    }
  };

  const getActiveSlots = () => {
    switch (activeCategory) {
      case "hero":
        return [
          { key: "hero-slide-1", label: "Hero Slider - Slide 1", def: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80" },
          { key: "hero-slide-2", label: "Hero Slider - Slide 2", def: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80" },
          { key: "hero-slide-3", label: "Hero Slider - Slide 3", def: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80" },
          { key: "hero-slide-4", label: "Hero Slider - Slide 4", def: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80" },
          { key: "hero-slide-5", label: "Hero Slider - Slide 5", def: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80" },
        ];
      case "home-nonhero":
        return [
          { key: "home-stats-bg", label: "Home Page - Stats Section Background", def: "" },
          { key: "home-about-thumbnail", label: "Home Page - About Preview Thumbnail", def: "" },
          { key: "home-why-choose-bg", label: "Home Page - Why Choose Us Background", def: "" },
          { key: "home-cta-bg", label: "Home Page - Bottom CTA Background", def: "" }
        ];
      case "services": {
        const slots = [];
        services.forEach((s) => {
          slots.push({
            key: `service-thumb-${s.slug}`,
            label: `${s.name} - Grid Card Thumbnail`,
            def: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80"
          });
          slots.push({
            key: `service-hero-${s.slug}`,
            label: `${s.name} - Page Detail Banner`,
            def: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
          });
        });
        return slots;
      }
      case "doctors": {
        const slots = [];
        doctors.forEach((d) => {
          slots.push({
            key: `doctor-photo-${d.id}`,
            label: `${d.name} - Profile Picture`,
            def: ""
          });
          slots.push({
            key: `doctor-banner-${d.id}`,
            label: `${d.name} - Detail Banner`,
            def: ""
          });
        });
        return slots;
      }
      case "gallery": {
        const slots = [];
        for (let i = 1; i <= 50; i++) {
          const numStr = String(i).padStart(3, "0");
          slots.push({
            key: `gallery-${numStr}`,
            label: `Gallery Slot #${numStr}`,
            def: "",
            isGallery: true
          });
        }
        return slots;
      }
      case "blog":
        return blogsList.map((b) => ({
          key: `blog-featured-${b.slug}`,
          label: `${b.title} - Featured Image`,
          def: ""
        }));
      case "reviews":
        return testimonialsList.map((t) => ({
          key: `review-photo-${t.id}`,
          label: `${t.patientName} (${t.treatmentTaken}) - Patient Photo`,
          def: ""
        }));
      case "footer-misc":
        return [
          { key: "footer-logo", label: "Alternate Footer Logo", def: "" },
          { key: "404-page-image", label: "404 Page Illustration", def: "" },
          { key: "favicon-upload", label: "Favicon Upload (Converts dynamically)", def: "" }
        ];
      default:
        return [];
    }
  };

  const renderSlotCard = (slotKey, label, defaultUrl, isGallery = false) => {
    const slotData = siteImages[slotKey];
    const currentUrl = slotData?.imageUrl || defaultUrl;
    const isSlotSelected = selectedSlot === slotKey && selectedFile;

    return (
      <div key={slotKey} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border relative flex-shrink-0 flex items-center justify-center">
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-10 h-10 text-slate-350" />
          )}
          <span className="absolute top-2 left-2 text-[9px] uppercase font-extrabold tracking-wider bg-black/60 text-white px-2 py-0.5 rounded-full">
            Active Image
          </span>
        </div>

        <div className="flex-1 w-full space-y-4 text-left">
          <div>
            <h4 className="font-extrabold text-sm text-[#0B3C5D] dark:text-white font-serif">{label}</h4>
            <span className="text-[10px] font-mono text-slate-400 block">{slotKey}</span>
            {slotData?.categoryTag && (
              <span className="inline-block bg-blue-50 text-[#1E7FC2] text-[9px] font-bold px-2 py-0.5 rounded-md mt-1">
                Category: {slotData.categoryTag}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="bg-[#1E7FC2] hover:bg-[#1E7FC2]/90 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer shadow-sm transition active:scale-95 text-center flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Choose Replacement</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, slotKey)}
              />
            </label>

            {slotData && (
              <button
                onClick={() => handleDeleteSlot(slotKey)}
                className="border border-brand-red text-brand-red hover:bg-brand-red/5 text-xs font-bold py-2.5 px-4 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {isSlotSelected && (
            <div className="bg-[#F4F9FC] dark:bg-slate-850 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#0B3C5D] dark:text-slate-300">Original: {originalSize} KB</span>
                <span className="text-[#3FA535]">Compressed: {compressedSize} KB (≤500KB)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Image Caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Alt Tag (SEO)"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                />
                {isGallery && (
                  <select
                    value={categoryTag}
                    onChange={(e) => setCategoryTag(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Select Category Tag</option>
                    <option value="OT/Surgery">OT/Surgery</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Team">Team</option>
                    <option value="Recovery">Recovery</option>
                    <option value="Events">Events</option>
                  </select>
                )}
              </div>
              <button
                onClick={() => handleUpload(slotKey)}
                disabled={saving}
                className="w-full bg-[#3FA535] hover:bg-[#358E2C] text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition disabled:opacity-50"
              >
                {saving ? "Processing Upload..." : "Confirm & Save Replacement Image"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Admin Image Manager</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Re-skin and replace site-wide visual assets. All uploads are compressed under 500KB and securely proxied.
          </p>
        </div>
        <button
          onClick={fetchSlotImages}
          className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Mappings</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-start space-x-2 text-xs font-bold border ${
          statusMessage.type === "success" 
            ? "bg-[#3FA535]/10 border-[#3FA535]/30 text-[#358E2C]" 
            : statusMessage.type === "error"
            ? "bg-[#D81F26]/10 border-[#D81F26]/30 text-[#D81F26]"
            : "bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 text-blue-600"
        }`}>
          <Info className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
          <span className="leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-1 font-bold text-xs uppercase tracking-wider">
        {[
          { key: "hero", label: "Home Hero", icon: Settings },
          { key: "home-nonhero", label: "Home Page (Misc)", icon: Globe },
          { key: "services", label: "Services & Conditions", icon: Heart },
          { key: "doctors", label: "Doctors", icon: User },
          { key: "gallery", label: "Gallery", icon: ImageIcon },
          { key: "blog", label: "Blog", icon: FileText },
          { key: "reviews", label: "Reviews", icon: Heart },
          { key: "footer-misc", label: "Footer & Misc", icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveCategory(tab.key);
                setSelectedFile(null);
                setCompressedBase64("");
                setStatusMessage(null);
              }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl border transition ${
                isActive 
                  ? "bg-[#0B3C5D] text-white border-transparent"
                  : "border-slate-105 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 mt-4">Loading active image slot mappings...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {getActiveSlots().map((slot) => renderSlotCard(slot.key, slot.label, slot.def, slot.isGallery))}
        </div>
      )}
    </div>
  );
}

export default ImageManager;
