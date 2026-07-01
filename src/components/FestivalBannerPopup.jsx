import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../context/AppContext";

function parseBannerDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function FestivalBannerPopup() {
  const { festivalBanners } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    // If the banner has been seen/dismissed in this session, do not show
    if (sessionStorage.getItem("festivalBannerSeen") === "1") {
      setIsOpen(false);
      return;
    }

    const now = new Date();
    const activeBanners = (festivalBanners || []).filter((banner) => {
      if (banner.isActive === false || banner.active === false) return false;

      const start = parseBannerDate(banner.startDate);
      const end = parseBannerDate(banner.endDate);

      if (start && now < start) return false;
      if (end && now > end) return false;
      return true;
    });

    if (activeBanners.length === 0) {
      setIsOpen(false);
      setSelectedBanner(null);
      return;
    }

    const lastIdxStr = sessionStorage.getItem("last_festival_banner_idx");
    const lastIdx = lastIdxStr === null ? -1 : Number.parseInt(lastIdxStr, 10);
    const selectIndex = Number.isFinite(lastIdx) ? (lastIdx + 1) % activeBanners.length : 0;

    setSelectedBanner(activeBanners[selectIndex]);
    setIsOpen(true);
    sessionStorage.setItem("last_festival_banner_idx", String(selectIndex));
  }, [festivalBanners]);

  const handleClose = () => {
    sessionStorage.setItem("festivalBannerSeen", "1");
    setIsOpen(false);
  };

  const handleBackdropClick = (event) => {
    if (backdropRef.current && event.target === backdropRef.current) {
      handleClose();
    }
  };

  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {isOpen && selectedBanner && (
        <motion.div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.25 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.25, ease: "easeOut" }}
            className="relative flex w-full max-w-lg select-none flex-col overflow-hidden rounded-3xl border border-slate-200/10 bg-slate-900 shadow-2xl text-left"
          >
            {/* Title Header */}
            {selectedBanner.title && (
              <div className="border-b border-slate-800 bg-slate-900/90 px-6 py-4">
                <h3 className="font-serif text-sm font-extrabold uppercase tracking-wider text-slate-100">
                  {selectedBanner.title}
                </h3>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-2 text-white/90 transition hover:bg-black/85 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Banner Image Container */}
            <div className="relative flex max-h-[50vh] w-full items-center justify-center overflow-hidden bg-slate-950">
              <img
                src={selectedBanner.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"}
                alt={selectedBanner.title || "Festival Banner"}
                className="w-full h-auto max-h-[50vh] object-contain"
              />
            </div>

            {/* Subtitle details */}
            {selectedBanner.subtitle && (
              <div className="border-t border-slate-800 bg-slate-900 px-6 py-3.5 text-xs font-medium leading-relaxed text-slate-300">
                <p>{selectedBanner.subtitle}</p>
              </div>
            )}

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2.5 border-t border-slate-800 bg-slate-950 px-6 py-3.5">
              {selectedBanner.ctaLink ? (
                <a
                  href={selectedBanner.ctaLink}
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1E7FC2] px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#0B3C5D]"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{selectedBanner.ctaText || "Continue"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1E7FC2] px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-[#0B3C5D]"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{selectedBanner.ctaText || "Continue"}</span>
                </button>
              )}

              <button
                onClick={handleClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                <span>Close</span>
              </button>
            </div>

            {/* Developer Credit Footer */}
            <div className="w-full text-center py-2 bg-slate-950 border-t border-slate-800/60">
              <span className="text-[9px] font-bold text-slate-500 tracking-wider">
                Website Developed by WayzenTech (9398724704)
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FestivalBannerPopup;
