import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Phone, X } from "lucide-react";
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

    if (sessionStorage.getItem("festivalBannerDismissed") === "true") return;

    const lastIdxStr = sessionStorage.getItem("last_festival_banner_idx");
    const lastIdx = lastIdxStr === null ? -1 : Number.parseInt(lastIdxStr, 10);
    const selectIndex = Number.isFinite(lastIdx) ? (lastIdx + 1) % activeBanners.length : 0;

    setSelectedBanner(activeBanners[selectIndex]);
    setIsOpen(true);
    sessionStorage.setItem("last_festival_banner_idx", String(selectIndex));
  }, [festivalBanners]);

  const handleClose = () => {
    sessionStorage.setItem("festivalBannerDismissed", "true");
    setIsOpen(false);
  };

  const handleBackdropClick = (event) => {
    if (backdropRef.current && event.target === backdropRef.current) {
      handleClose();
    }
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {isOpen && selectedBanner && (
        <motion.div
          ref={backdropRef}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.94 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.2, ease: "easeOut" }}
            className="relative flex w-full max-w-[640px] select-none flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
          >
            {selectedBanner.title && (
              <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 text-left">
                <h3 className="font-serif text-sm font-extrabold uppercase tracking-wider text-slate-100">
                  {selectedBanner.title}
                </h3>
              </div>
            )}

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-2 text-white/80 transition hover:bg-black/65 hover:text-white"
              aria-label="Close festival banner"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="relative flex max-h-[60vh] w-full items-center justify-center overflow-hidden bg-slate-950">
              <img
                src={selectedBanner.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"}
                alt={selectedBanner.title || "Festival Banner"}
                className="h-full min-h-[250px] w-full object-cover"
              />
            </div>

            {selectedBanner.subtitle && (
              <div className="border-t border-slate-800 bg-slate-900 px-6 py-4 text-left text-xs font-medium leading-relaxed text-slate-300">
                <p>{selectedBanner.subtitle}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 border-t border-slate-800 bg-slate-950 px-6 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                <span>Website made by WayzenTech</span>
                <span>|</span>
                <Phone className="h-3 w-3" />
                <span>9398724704</span>
              </span>

              <div className="flex w-full items-center justify-center gap-2.5 sm:w-auto">
                {selectedBanner.ctaLink ? (
                  <a
                    href={selectedBanner.ctaLink}
                    onClick={handleClose}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1E7FC2] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0B3C5D] sm:flex-none"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{selectedBanner.ctaText || "Continue to Website"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={handleClose}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1E7FC2] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0B3C5D] sm:flex-none"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{selectedBanner.ctaText || "Continue to Website"}</span>
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white sm:flex-none"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FestivalBannerPopup;
