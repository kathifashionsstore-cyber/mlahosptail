import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";

export function AnnouncementBar() {
  const { announcements, announcementSettings } = useApp();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem("announcement_bar_dismissed") === "true";
  });

  const activeAnnouncements = (announcements || []).filter(a => a.isActive !== false);

  // Toggle dynamic document offset padding
  useEffect(() => {
    const isBarVisible = !isDismissed && activeAnnouncements.length > 0 && announcementSettings?.showAnnouncementBar !== false;
    
    if (isBarVisible) {
      document.documentElement.classList.add("has-announcement");
    } else {
      document.documentElement.classList.remove("has-announcement");
    }

    return () => {
      document.documentElement.classList.remove("has-announcement");
    };
  }, [isDismissed, activeAnnouncements.length, announcementSettings?.showAnnouncementBar]);

  // Rotator effect
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    
    const speed = announcementSettings?.rotationSpeed || 3000;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, speed);

    return () => clearInterval(interval);
  }, [activeAnnouncements.length, announcementSettings?.rotationSpeed]);

  if (isDismissed) return null;
  if (activeAnnouncements.length === 0) return null;
  if (announcementSettings?.showAnnouncementBar === false) return null;

  const currentItem = activeAnnouncements[currentIndex];
  const bgOverride = announcementSettings?.backgroundColor;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("announcement_bar_dismissed", "true");
  };

  return (
    <div
      style={{ backgroundColor: bgOverride || "var(--color-primary, #1E7FC2)" }}
      className="w-full h-9 md:h-10 fixed top-0 left-0 right-0 z-50 text-white flex items-center justify-between px-4 md:px-8 text-xs font-semibold overflow-hidden border-b border-white/10 select-none"
    >
      <div className="flex-1 flex justify-center text-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : -8 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.25, ease: "easeInOut" }}
            className="flex items-center space-x-2 md:space-x-3 text-center"
          >
            <span>{currentItem.text}</span>
            {currentItem.linkUrl && (
              <Link
                to={currentItem.linkUrl}
                className="inline-flex items-center space-x-0.5 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold transition"
              >
                <span>{currentItem.linkLabel || "View"}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition flex-shrink-0"
        aria-label="Dismiss Announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
