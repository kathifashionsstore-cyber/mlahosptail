import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Image as ImageIcon,
  Maximize2,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { db } from "../firebase/config";
import { buildSeedPlan } from "../firebase/seedDataHelpers";
import { useApp } from "../context/AppContext";

const fallbackGallery =
  buildSeedPlan().collections.find((item) => item.collectionName === "galleryImages")?.data || [];

function isLiveImage(item) {
  return item?.isActive !== false && item?.status !== "draft" && item?.status !== "archived";
}

function getImageCategory(item) {
  return item.category || item.albumId || "Hospital";
}

export function Gallery() {
  const { settings } = useApp();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(18);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        // Query standard gallery images raw (index-resilient)
        const gallerySnap = await getDocs(collection(db, "galleryImages"));
        const listGallery = gallerySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

        // Query slots from siteImages starting with 'gallery-'
        const siteImagesSnap = await getDocs(collection(db, "siteImages"));
        const listSite = [];
        siteImagesSnap.forEach((docSnap) => {
          if (docSnap.id.startsWith("gallery-")) {
            const data = docSnap.data();
            listSite.push({
              id: docSnap.id,
              imageUrl: data.imageUrl,
              caption: data.caption || "",
              altText: data.altText || "",
              category: data.categoryTag || "Facilities",
              order: parseInt(docSnap.id.replace("gallery-", ""), 10) || 999,
              isActive: true,
            });
          }
        });

        const combined = [...listGallery, ...listSite];
        combined.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        setImages(combined.filter(isLiveImage));
        setLoading(false);
      } catch (error) {
        console.error("Failed to load gallery images:", error);
        setImages(fallbackGallery.filter(isLiveImage));
        setLoading(false);
      }
    };

    loadGalleryData();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(images.map(getImageCategory).filter(Boolean)));
    return ["All", ...uniqueCategories];
  }, [images]);

  const filteredImages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = images.filter((item) => {
      const categoryMatch = activeCategory === "All" || getImageCategory(item) === activeCategory;
      const text = `${item.caption || ""} ${item.altText || ""} ${getImageCategory(item)} ${item.credit || ""}`.toLowerCase();
      const searchMatch = !normalizedSearch || text.includes(normalizedSearch);
      return categoryMatch && searchMatch;
    });

    return filtered.sort((a, b) => {
      if (!!a.isFeatured !== !!b.isFeatured) return a.isFeatured ? -1 : 1;
      return Number(a.order || 0) - Number(b.order || 0);
    });
  }, [activeCategory, images, searchTerm]);

  const visibleImages = filteredImages.slice(0, visibleCount);
  const selectedImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  const showNext = useCallback(() => {
    if (filteredImages.length === 0) return;
    setLightboxIndex((index) => (index === null ? 0 : (index + 1) % filteredImages.length));
  }, [filteredImages.length]);

  const showPrevious = useCallback(() => {
    if (filteredImages.length === 0) return;
    setLightboxIndex((index) => (index === null ? 0 : (index - 1 + filteredImages.length) % filteredImages.length));
  }, [filteredImages.length]);

  useEffect(() => {
    setVisibleCount(18);
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY < document.body.offsetHeight - 900) return;
      setVisibleCount((count) => Math.min(count + 12, filteredImages.length));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredImages.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (lightboxIndex === null) return;
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") showNext();
      if (event.key === "ArrowLeft") showPrevious();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrevious]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) showNext();
      else showPrevious();
    }
    touchStartX.current = null;
  };

  const handleMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    event.currentTarget.style.setProperty("--mx", `${x}%`);
    event.currentTarget.style.setProperty("--my", `${y}%`);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen unavailable:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#07131C] text-white transition-colors duration-300">
      <Helmet>
        <title>Gallery | {settings?.hospitalName || "Amulya Nursing Home"}</title>
        <meta
          name="description"
          content={`Explore ${settings?.hospitalName || "Amulya Nursing Home"}'s live media gallery with facilities, emergency care, operation theatre, and hospital moments.`}
        />
      </Helmet>

      <section className="relative overflow-hidden px-6 pb-12 pt-32 md:px-12 md:pb-16">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#07131C_0%,#0A2F47_48%,#0F6B5E_72%,#12301F_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07131C] to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl space-y-7">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#B8F7D4] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Gallery
            </span>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Hospital Media Gallery
            </h1>
            <p className="max-w-2xl text-sm font-semibold leading-relaxed text-slate-250 md:text-base">
              A live visual wall of hospital spaces, clinical teams, events, facilities, and featured moments.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search gallery..."
                className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-11 pr-4 text-sm font-bold text-white outline-none backdrop-blur-md placeholder:text-white/45 focus:border-[#B8F7D4]"
              />
            </label>

            <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/10 p-1.5 backdrop-blur-md no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                    activeCategory === category
                      ? "bg-white text-[#0B3C5D] shadow-lg"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        {loading ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className={`mb-5 break-inside-avoid rounded-[24px] bg-white/10 shimmer-placeholder ${
                  index % 3 === 0 ? "h-80" : index % 3 === 1 ? "h-64" : "h-96"
                }`}
              />
            ))}
          </div>
        ) : visibleImages.length > 0 ? (
          <>
            <motion.div layout className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
              {visibleImages.map((item, index) => (
                <motion.button
                  layout
                  key={item.id}
                  type="button"
                  onClick={() => openLightbox(index)}
                  onMouseMove={handleMouseMove}
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.015, 0.2) }}
                  className="gallery-card group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.08] text-left shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-500 hover:-translate-y-1 hover:border-[#B8F7D4]/50 hover:shadow-[0_30px_85px_rgba(48,196,142,0.18)]"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.altText || item.caption || "Hospital gallery"}
                    loading="lazy"
                    className={`w-full object-cover transition duration-700 group-hover:scale-[1.07] ${
                      index % 5 === 0
                        ? "aspect-[4/5]"
                        : index % 5 === 1
                          ? "aspect-[3/2]"
                          : index % 5 === 2
                            ? "aspect-[1/1]"
                            : "aspect-[5/6]"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04101A]/85 via-[#04101A]/15 to-transparent opacity-80 transition group-hover:opacity-95" />
                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                    <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      {getImageCategory(item)}
                    </span>
                    {item.isFeatured && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F6C95C] text-[#111827] shadow-lg">
                        <Star className="h-4 w-4 fill-current" />
                      </span>
                    )}
                  </div>
                  {item.caption && item.caption !== "Amulya Hospital" && item.caption !== "Amulya Nursing Home" && item.caption !== settings?.hospitalName && (
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-2xl border border-white/15 bg-white/15 p-4 backdrop-blur-xl">
                        <h3 className="text-sm font-extrabold text-white">{item.caption}</h3>
                        {item.credit && <p className="mt-1 text-[11px] font-bold text-white/70">{item.credit}</p>}
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {visibleCount < filteredImages.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => Math.min(count + 12, filteredImages.length))}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-md transition hover:bg-white hover:text-[#0B3C5D]"
                >
                  <Grid2X2 className="h-4 w-4" />
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.08] p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-white/40" />
            <h2 className="mt-4 text-xl font-extrabold">No gallery images found</h2>
            <p className="mt-2 text-sm font-semibold text-white/55">Upload and publish images from the admin gallery panel.</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col bg-[#02070B]/95 text-white backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            onTouchStart={(event) => {
              touchStartX.current = event.touches[0].clientX;
            }}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/45">
                  {lightboxIndex + 1} of {filteredImages.length}
                </p>
                <h3 className="truncate text-sm font-bold md:text-base">{selectedImage.caption || getImageCategory(selectedImage)}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition hover:bg-white hover:text-[#0B3C5D]"
                  aria-label="Toggle fullscreen"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightboxIndex(null);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition hover:bg-white hover:text-[#0B3C5D]"
                  aria-label="Close lightbox"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-7 md:px-20">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                className="absolute left-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition hover:bg-white hover:text-[#0B3C5D] md:flex"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <motion.img
                key={selectedImage.id}
                src={selectedImage.imageUrl}
                alt={selectedImage.altText || selectedImage.caption || "Gallery preview"}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28 }}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[74vh] max-w-full rounded-[24px] object-contain shadow-[0_35px_100px_rgba(0,0,0,0.42)]"
              />

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className="absolute right-4 z-10 hidden h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition hover:bg-white hover:text-[#0B3C5D] md:flex"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Gallery;
