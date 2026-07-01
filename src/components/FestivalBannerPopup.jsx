import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";

export function FestivalBannerPopup() {
  const { festivalBanners } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const backdropRef = useRef(null);

  const now = new Date();
  
  // Find banners active in the current date/time window
  const activeBanners = (festivalBanners || []).filter((banner) => {
    if (banner.isActive === false) return false;
    const start = banner.startDate ? new Date(banner.startDate) : null;
    const end = banner.endDate ? new Date(banner.endDate) : null;
    
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  });

  useEffect(() => {
    if (activeBanners.length === 0) {
      setIsOpen(false);
      return;
    }

    const hasShownInSession = sessionStorage.getItem("festival_banner_shown") === "true";
    if (hasShownInSession) return;

    // Pick banner in sequence or rotate based on session index
    const lastIdxStr = sessionStorage.getItem("last_festival_banner_idx");
    let selectIndex = 0;
    if (lastIdxStr !== null) {
      const lastIdx = parseInt(lastIdxStr, 10);
      selectIndex = (lastIdx + 1) % activeBanners.length;
    }

    setSelectedBanner(activeBanners[selectIndex]);
    setIsOpen(true);

    // Save index for subsequent visits
    sessionStorage.setItem("last_festival_banner_idx", selectIndex.toString());
  }, [festivalBanners, activeBanners.length]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("festival_banner_shown", "true");
  };

  const handleBackdropClick = (e) => {
    if (backdropRef.current && e.target === backdropRef.current) {
      handleClose();
    }
  };

  if (!isOpen || !selectedBanner) return null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      <div
        ref={backdropRef}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.93 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-slate-900 border border-slate-800 max-w-[640px] w-full rounded-3xl overflow-hidden shadow-2xl relative flex flex-col select-none"
        >
          {/* Header/Title if provided */}
          {selectedBanner.title && (
            <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 text-left">
              <h3 className="font-serif font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                {selectedBanner.title}
              </h3>
            </div>
          )}

          {/* Close button top right */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition"
            aria-label="Close Announcement"
          >
            <X className="w-4.5 h-4.5" />
          </button>

          {/* Main banner image */}
          <div className="w-full max-h-[60vh] overflow-hidden bg-slate-950 flex items-center justify-center relative">
            <img
              src={selectedBanner.imageUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"}
              alt={selectedBanner.title || "Festival Banner"}
              className="w-full h-full object-cover min-h-[250px]"
            />
          </div>

          {/* Subtitle / Description if exists */}
          {selectedBanner.subtitle && (
            <div className="bg-slate-900 px-6 py-4 text-left border-t border-slate-800 text-xs font-medium text-slate-350 leading-relaxed">
              <p>{selectedBanner.subtitle}</p>
            </div>
          )}

          {/* Bottom Footer Strip */}
          <div className="bg-slate-950 border-t border-slate-805/40 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Developer Tag */}
            <span className="text-[10px] font-extrabold tracking-wide text-slate-500 uppercase self-start sm:self-center">
              Website by WayzenTech | 📞 9398724704
            </span>

            {/* Action buttons */}
            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <button
                onClick={handleClose}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Close
              </button>
              
              {selectedBanner.ctaLink ? (
                <a
                  href={selectedBanner.ctaLink}
                  onClick={handleClose}
                  className="flex-grow sm:flex-grow-0 inline-flex items-center justify-center space-x-1 bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md"
                >
                  <span>{selectedBanner.ctaText || "Continue"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex-grow sm:flex-grow-0 bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md"
                >
                  {selectedBanner.ctaText || "Continue to Website"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default FestivalBannerPopup;
