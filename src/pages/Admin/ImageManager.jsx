import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  Globe,
  Grid,
  Heart,
  Image as ImageIcon,
  Info,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";

const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

const FALLBACKS = {
  hospital: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  surgery: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80",
  trauma: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
  spine: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80",
  rehab: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
};

const SERVICE_GROUPS = [
  { id: "bone-health", label: "Bone Health" },
  { id: "joint-pain", label: "Joint" },
  { id: "spine", label: "Spine" },
  { id: "trauma", label: "Trauma" },
  { id: "sports", label: "Sports" },
  { id: "foot", label: "Foot" },
  { id: "pediatric", label: "Pediatric" },
  { id: "general", label: "General" },
];

const GALLERY_CATEGORIES = ["OT/Surgery", "Facilities", "Team", "Recovery", "Events", "General"];

const TAB_CONFIG = [
  { key: "hero", label: "Home Hero Slider", icon: Settings },
  { key: "home", label: "Home Page", icon: Globe },
  { key: "about", label: "About Page", icon: User },
  { key: "doctors", label: "Doctors", icon: User },
  { key: "services", label: "Services", icon: Heart },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "blog", label: "Blog", icon: FileText },
  { key: "footer-misc", label: "Footer & Misc", icon: Settings },
  { key: "media-library", label: "Media Library", icon: Grid },
];

function stripDataUrlPrefix(image) {
  return image.includes("base64,") ? image.split("base64,")[1] : image;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDoctorSlotSlug(doctor) {
  return doctor.slug || doctor.id || slugify(doctor.name);
}

function getServiceSlotSlug(service) {
  return service.slug || slugify(service.name);
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
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

function SkeletonSlots() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="h-32 w-full rounded-xl bg-slate-100 shimmer-placeholder dark:bg-slate-800 md:w-44" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/2 rounded bg-slate-100 shimmer-placeholder dark:bg-slate-800" />
              <div className="h-3 w-1/3 rounded bg-slate-100 shimmer-placeholder dark:bg-slate-800" />
              <div className="h-10 w-44 rounded-xl bg-slate-100 shimmer-placeholder dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ImageManager() {
  const { doctors, services, loadCollections } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = TAB_CONFIG.some((tab) => tab.key === searchParams.get("tab")) ? searchParams.get("tab") : "hero";
  const [activeCategory, setActiveCategory] = useState(initialTab);
  const [siteImages, setSiteImages] = useState({});
  const [blogsList, setBlogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedBase64, setCompressedBase64] = useState("");
  const [caption, setCaption] = useState("");
  const [altText, setAltText] = useState("");
  const [categoryTag, setCategoryTag] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");
  const [copiedSlot, setCopiedSlot] = useState("");
  const [openServiceGroups, setOpenServiceGroups] = useState({ "bone-health": true });

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (TAB_CONFIG.some((item) => item.key === tab)) {
      setActiveCategory(tab);
    }
  }, [searchParams]);

  const fetchSlotImages = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "siteImages"));
      const mapping = {};
      snap.forEach((docSnap) => {
        mapping[docSnap.id] = { slotKey: docSnap.id, ...docSnap.data() };
      });
      setSiteImages(mapping);
    } catch (err) {
      console.error("Failed to load site image slots:", err);
      setStatusMessage({ type: "error", text: "Failed to load image slot mappings." });
    } finally {
      setLoading(false);
    }
  };

  const fetchExtraCollections = async () => {
    try {
      const blogsSnap = await getDocs(collection(db, "blogs"));
      setBlogsList(blogsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) {
      console.error("Failed to fetch blog list in ImageManager:", err);
    }
  };

  useEffect(() => {
    fetchSlotImages();
    fetchExtraCollections();
  }, []);

  const resetSelectedUpload = () => {
    setSelectedFile(null);
    setSelectedSlot("");
    setCompressedBase64("");
    setCaption("");
    setAltText("");
    setCategoryTag("");
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const changeTab = (key) => {
    setActiveCategory(key);
    setSearchParams({ tab: key });
    resetSelectedUpload();
    setStatusMessage(null);
  };

  const handleFileChange = async (event, slotKey) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedSlot(slotKey);
    setSelectedFile(file);
    setOriginalSize(Math.round(file.size / 1024));

    const existing = siteImages[slotKey];
    setCaption(existing?.caption || "");
    setAltText(existing?.altText || "");
    setCategoryTag(existing?.categoryTag || "");

    try {
      setStatusMessage({ type: "info", text: "Compressing image client-side..." });
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.48,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      setCompressedSize(Math.round(compressedFile.size / 1024));

      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setCompressedBase64(reader.result);
        setStatusMessage({ type: "success", text: "Image compressed. Confirm to save this slot." });
      };
    } catch (err) {
      console.error("Compression failed:", err);
      setStatusMessage({ type: "error", text: "Failed to compress image." });
    }
  };

  const syncSlotBackToSource = async (slotKey, imageUrl) => {
    if (slotKey.startsWith("service-thumb-") || slotKey.startsWith("service-hero-")) {
      const serviceSlug = slotKey.replace("service-thumb-", "").replace("service-hero-", "");
      const fieldName = slotKey.startsWith("service-thumb-") ? "thumbnailUrl" : "heroImageUrl";
      const snap = await getDocs(query(collection(db, "services"), where("slug", "==", serviceSlug)));
      if (!snap.empty) {
        await updateDoc(doc(db, "services", snap.docs[0].id), { [fieldName]: imageUrl });
      }
    }

    if (slotKey.startsWith("doctor-photo-")) {
      const doctorSlot = slotKey.replace("doctor-photo-", "");
      const doctor = doctors.find((item) => getDoctorSlotSlug(item) === doctorSlot || item.id === doctorSlot);
      if (doctor?.id) {
        await updateDoc(doc(db, "doctors", doctor.id), { photoUrl: imageUrl });
      }
    }

    if (slotKey.startsWith("blog-featured-")) {
      const blogSlug = slotKey.replace("blog-featured-", "");
      const snap = await getDocs(query(collection(db, "blogs"), where("slug", "==", blogSlug)));
      if (!snap.empty) {
        await updateDoc(doc(db, "blogs", snap.docs[0].id), { thumbnailUrl: imageUrl });
      }
    }
  };

  const handleUpload = async (slotKey) => {
    if (!compressedBase64) return;
    setSaving(true);
    setStatusMessage({ type: "info", text: "Uploading image..." });

    try {
      let result;
      try {
        result = await uploadViaProxy(compressedBase64, slotKey);
      } catch (proxyError) {
        console.warn("Upload proxy unavailable; trying direct ImgBB upload:", proxyError);
        result = await uploadDirectlyToImgbb(compressedBase64, slotKey);
      }

      const docData = {
        imageUrl: result.imageUrl,
        deleteUrl: result.deleteUrl || "",
        caption: caption || "",
        altText: altText || "",
        categoryTag: categoryTag || "",
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "siteImages", slotKey), docData, { merge: true });
      await syncSlotBackToSource(slotKey, result.imageUrl);

      setSiteImages((prev) => ({
        ...prev,
        [slotKey]: { slotKey, ...docData, updatedAt: new Date() },
      }));

      resetSelectedUpload();
      setStatusMessage({ type: "success", text: `Slot "${slotKey}" updated.` });

      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: `Upload failed: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotKey) => {
    if (!window.confirm(`Clear the image for slot "${slotKey}"? This cannot be undone.`)) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, "siteImages", slotKey));
      await syncSlotBackToSource(slotKey, "");

      setSiteImages((prev) => {
        const copy = { ...prev };
        delete copy[slotKey];
        return copy;
      });

      if (selectedSlot === slotKey) resetSelectedUpload();
      setStatusMessage({ type: "success", text: `Slot "${slotKey}" cleared.` });
      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Failed to clear slot mapping." });
    } finally {
      setSaving(false);
    }
  };

  const buildSlots = (category) => {
    switch (category) {
      case "hero":
        return [
          { key: "hero-slide-1", label: "Hero Slider - Slide 1", def: FALLBACKS.hospital },
          { key: "hero-slide-2", label: "Hero Slider - Slide 2", def: FALLBACKS.surgery },
          { key: "hero-slide-3", label: "Hero Slider - Slide 3", def: FALLBACKS.trauma },
          { key: "hero-slide-4", label: "Hero Slider - Slide 4", def: FALLBACKS.spine },
          { key: "hero-slide-5", label: "Hero Slider - Slide 5", def: FALLBACKS.rehab },
        ];
      case "home":
        return [
          { key: "home-about-thumbnail", label: "About Section Preview Image", def: FALLBACKS.trauma },
          { key: "home-stats-bg", label: "Stats Section Background", def: "" },
          { key: "home-why-choose-bg", label: "Why Choose Us Section Background", def: "" },
          { key: "home-cta-bg", label: "Bottom CTA Banner Background", def: FALLBACKS.hospital },
          { key: "home-services-bg", label: "Services Section Background", def: "" },
          { key: "home-doctor-photo-1", label: "Dr. Amulya (Home Carousel)", def: "" },
          { key: "home-doctor-photo-2", label: "Dr. Ravindranath (Home Carousel)", def: "" },
          { key: "home-doctor-photo-3", label: "Dr. Tejaswi (Home Carousel)", def: "" },
          { key: "home-doctor-photo-4", label: "Dr. Bharat (Home Carousel)", def: "" },
        ];
      case "about":
        return [
          { key: "about-founder", label: "Dr. Aravinda Babu Photo", def: "https://i.ibb.co/3sS7H9y/dr-aravinda-babu.jpg" },
          { key: "about-facilities", label: "Main Facilities Photo", def: "https://i.ibb.co/3sS7H9y/exterior.jpg" },
          { key: "about-team-group", label: "Team / Group Photo", def: "" },
          { key: "about-hospital-building", label: "Hospital Exterior Photo", def: "https://i.ibb.co/3sS7H9y/exterior.jpg" },
          { key: "about-mission-image", label: "Mission Section Image", def: FALLBACKS.hospital },
        ];
      case "doctors":
        return doctors.flatMap((doctor) => {
          const slotSlug = getDoctorSlotSlug(doctor);
          return [
            { key: `doctor-photo-${slotSlug}`, label: `${doctor.name} - Profile Photo`, def: doctor.photoUrl || "" },
            { key: `doctor-banner-${slotSlug}`, label: `${doctor.name} - Detail Header Banner`, def: "" },
          ];
        });
      case "services":
        return services.flatMap((service) => {
          const slotSlug = getServiceSlotSlug(service);
          return [
            { key: `service-thumb-${slotSlug}`, label: `${service.name} - Card Thumbnail`, def: service.thumbnailUrl || FALLBACKS.surgery },
            { key: `service-hero-${slotSlug}`, label: `${service.name} - Detail Hero Banner`, def: service.heroImageUrl || service.thumbnailUrl || FALLBACKS.hospital },
          ];
        });
      case "gallery": {
        const slots = [];
        for (let i = 1; i <= 50; i += 1) {
          const numStr = String(i).padStart(3, "0");
          slots.push({ key: `gallery-${numStr}`, label: `Gallery Slot ${numStr}`, def: "", isGallery: true });
        }
        return slots;
      }
      case "blog":
        return blogsList.map((blog) => ({
          key: `blog-featured-${blog.slug || slugify(blog.title)}`,
          label: `${blog.title} - Featured Image`,
          def: blog.thumbnailUrl || "",
        }));
      case "footer-misc":
        return [
          { key: "footer-logo", label: "Footer Logo", def: "" },
          { key: "404-page-image", label: "404 Page Image", def: "" },
          { key: "og-default-image", label: "Open Graph Default Share Image", def: FALLBACKS.hospital },
          { key: "favicon-upload", label: "Favicon Upload", def: "" },
        ];
      default:
        return [];
    }
  };

  const serviceGroups = useMemo(() => {
    return SERVICE_GROUPS.map((group) => ({
      ...group,
      slots: services
        .filter((service) => (service.cluster || "general") === group.id)
        .flatMap((service) => {
          const slotSlug = getServiceSlotSlug(service);
          return [
            { key: `service-thumb-${slotSlug}`, label: `${service.name} - Card Thumbnail`, def: service.thumbnailUrl || FALLBACKS.surgery },
            { key: `service-hero-${slotSlug}`, label: `${service.name} - Detail Hero Banner`, def: service.heroImageUrl || service.thumbnailUrl || FALLBACKS.hospital },
          ];
        }),
    })).filter((group) => group.slots.length > 0);
  }, [services]);

  const mediaItems = useMemo(() => {
    const term = mediaSearch.trim().toLowerCase();
    return Object.values(siteImages)
      .filter((item) => item.imageUrl)
      .filter((item) => {
        if (!term) return true;
        return [item.slotKey, item.caption, item.altText, item.categoryTag].filter(Boolean).join(" ").toLowerCase().includes(term);
      })
      .sort((a, b) => String(a.slotKey).localeCompare(String(b.slotKey)));
  }, [siteImages, mediaSearch]);

  const copyImageUrl = async (slotKey, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlot(slotKey);
      setTimeout(() => setCopiedSlot(""), 1800);
    } catch {
      setStatusMessage({ type: "error", text: "Could not copy image URL." });
    }
  };

  const renderSlotCard = (slot) => {
    const slotData = siteImages[slot.key];
    const currentUrl = slotData?.imageUrl || slot.def;
    const isSlotSelected = selectedSlot === slot.key && selectedFile;

    return (
      <div key={slot.key} className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-start">
        <div className="relative flex h-32 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-100 dark:bg-slate-800 md:w-44">
          {currentUrl ? (
            <img src={currentUrl} alt={slot.label} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-10 w-10 text-slate-300" />
          )}
          {slotData?.imageUrl && (
            <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
              Active
            </span>
          )}
        </div>

        <div className="w-full flex-1 space-y-4 text-left">
          <div>
            <h4 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">{slot.label}</h4>
            <span className="block font-mono text-[10px] text-slate-400">{slot.key}</span>
            {slotData?.caption && <p className="mt-1 text-[10px] font-semibold text-slate-500">{slotData.caption}</p>}
            {slotData?.categoryTag && (
              <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-[#1E7FC2]">
                {slotData.categoryTag}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1E7FC2] px-4 py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#1E7FC2]/90 active:scale-95">
              <Upload className="h-4 w-4" />
              <span>Choose Replacement</span>
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFileChange(event, slot.key)} />
            </label>

            {slotData?.imageUrl && (
              <button
                type="button"
                onClick={() => handleDeleteSlot(slot.key)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-red px-4 py-2.5 text-xs font-bold text-brand-red transition hover:bg-brand-red/5 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {isSlotSelected && (
            <div className="space-y-3 rounded-xl border border-blue-100 bg-[#F4F9FC] p-4 dark:border-blue-900/30 dark:bg-slate-800">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#0B3C5D] dark:text-slate-300">Original: {originalSize} KB</span>
                <span className="text-[#3FA535]">Compressed: {compressedSize} KB</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Image caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Alt text"
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                {slot.isGallery ? (
                  <select
                    value={categoryTag}
                    onChange={(event) => setCategoryTag(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="">Category</option>
                    {GALLERY_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Category tag"
                    value={categoryTag}
                    onChange={(event) => setCategoryTag(event.target.value)}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleUpload(slot.key)}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3FA535] px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-[#358E2C] disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{saving ? "Saving..." : "Confirm & Save Slot"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-[#0B3C5D] dark:text-white">Image Manager</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">Manage public website image slots and uploaded slot media.</p>
        </div>
        <button
          type="button"
          onClick={fetchSlotImages}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {statusMessage && (
        <div className={`flex items-start gap-2 rounded-xl border p-4 text-xs font-bold ${
          statusMessage.type === "success"
            ? "border-[#3FA535]/30 bg-[#3FA535]/10 text-[#358E2C]"
            : statusMessage.type === "error"
            ? "border-[#D81F26]/30 bg-[#D81F26]/10 text-[#D81F26]"
            : "border-blue-100 bg-blue-50/70 text-blue-600 dark:border-blue-900/30 dark:bg-blue-950/10"
        }`}>
          <Info className="mt-0.5 h-4.5 w-4.5 flex-shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wider dark:border-slate-800">
        {TAB_CONFIG.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                isActive
                  ? "border-transparent bg-[#0B3C5D] text-white"
                  : "border-slate-100 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <SkeletonSlots />
      ) : activeCategory === "media-library" ? (
        <div className="space-y-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={mediaSearch}
              onChange={(event) => setMediaSearch(event.target.value)}
              placeholder="Search by slot, caption, alt text, or category..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#1E7FC2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {mediaItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-500">No uploaded slot images found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {mediaItems.map((item) => (
                <div key={item.slotKey} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800">
                    <img src={item.imageUrl} alt={item.altText || item.slotKey} className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-2 p-4 text-left">
                    <p className="truncate font-mono text-[10px] font-bold text-[#1E7FC2]" title={item.slotKey}>{item.slotKey}</p>
                    <p className="line-clamp-2 min-h-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {item.caption || item.altText || "Uploaded slot image"}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyImageUrl(item.slotKey, item.imageUrl)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {copiedSlot === item.slotKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSlot === item.slotKey ? "Copied" : "Copy URL"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeCategory === "services" ? (
        <div className="space-y-4">
          {serviceGroups.map((group) => {
            const isOpen = !!openServiceGroups[group.id];
            return (
              <section key={group.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setOpenServiceGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div>
                    <h2 className="text-sm font-extrabold text-[#0B3C5D] dark:text-white">{group.label}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.slots.length} image slots</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t border-slate-100 p-4 dark:border-slate-800">
                    {group.slots.map((slot) => renderSlotCard(slot))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : activeCategory === "home" ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border-b pb-2 text-left">
              <h3 className="text-xs font-black text-[#0B3C5D] dark:text-white uppercase tracking-wider">Home Page Section Layouts</h3>
            </div>
            {buildSlots("home")
              .filter(slot => !slot.key.startsWith("home-doctor-photo-"))
              .map((slot) => renderSlotCard(slot))}
          </div>

          <div className="space-y-4 pt-4">
            <div className="border-b pb-2 text-left">
              <h3 className="text-xs font-black text-[#0B3C5D] dark:text-white uppercase tracking-wider">Doctor Homepage Photo Slots</h3>
            </div>
            {buildSlots("home")
              .filter(slot => slot.key.startsWith("home-doctor-photo-"))
              .map((slot) => renderSlotCard(slot))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {buildSlots(activeCategory).length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-500">No slots available for this section.</p>
            </div>
          ) : (
            buildSlots(activeCategory).map((slot) => renderSlotCard(slot))
          )}
        </div>
      )}
    </div>
  );
}

export default ImageManager;
