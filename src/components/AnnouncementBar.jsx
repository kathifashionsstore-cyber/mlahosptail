import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

function resolveAnnouncementText(item) {
  if (!item) return "";

  const candidate = item.text ?? item.message ?? item.title ?? item.content ?? item.description ?? "";
  if (Array.isArray(candidate)) return candidate.join(" ").trim();
  if (typeof candidate === "string") return candidate.trim();
  return String(candidate || "").trim();
}

export function AnnouncementBar() {
  const { announcements, announcementSettings, settings } = useApp();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem("announcementDismissed") === "1";
  });
  const [screenWidth, setScreenWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  // Resize listener
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const activeAnnouncements = (announcements || []).filter(a => a.isActive !== false);

  const fallbackItems = useMemo(() => [
    { text: `🏥 ${settings?.hospitalName || "Amulya Nursing Home"} — Spine, Joint & Trauma Care | Narasaraopet` },
    { text: "📞 OPD: +91 8647223625 | Mon–Sat 9AM–6PM" },
    { text: "🌐 Website by WayzenTech | 9398724704" }
  ], [settings?.hospitalName]);

  const normalizedActiveItems = useMemo(() => (
    activeAnnouncements
      .map((item) => ({ ...item, text: resolveAnnouncementText(item) }))
      .filter((item) => item.text.length > 1)
  ), [activeAnnouncements]);

  // Resolve active items list
  const rawItems = normalizedActiveItems.length > 0 ? normalizedActiveItems : fallbackItems;

  // Filter out developer credit on screens smaller than 360px
  const items = useMemo(() => {
    if (screenWidth < 360) {
      return rawItems.filter(
        item => !item.text.includes("WayzenTech") && !item.text.includes("9398724704")
      );
    }
    return rawItems;
  }, [rawItems, screenWidth]);

  // Master show toggle checks
  const showBar = announcementSettings ? announcementSettings.showAnnouncementBar !== false : true;
  const isBarVisible = showBar && !isDismissed && items.length > 0;

  // Keep the fixed navbar and page wrapper in sync with the visible bar height.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--announcement-bar-height", isBarVisible ? "40px" : "0px");

    if (isBarVisible) {
      root.classList.add("has-announcement");
      document.body.classList.add("has-announcement");
    } else {
      root.classList.remove("has-announcement");
      document.body.classList.remove("has-announcement");
    }

    return () => {
      root.style.setProperty("--announcement-bar-height", "0px");
      root.classList.remove("has-announcement");
      document.body.classList.remove("has-announcement");
    };
  }, [isBarVisible]);

  useEffect(() => {
    if (currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, items.length]);

  // Rotator effect with custom opacity transition
  useEffect(() => {
    if (items.length <= 1) return;
    
    const speed = announcementSettings?.rotationSpeed || 3000;
    const interval = setInterval(() => {
      // 1. Fade out (200ms)
      setOpacity(0);
      
      // 2. Swap item and Fade in (200ms)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setOpacity(1);
      }, 200);
    }, speed);

    return () => clearInterval(interval);
  }, [items.length, announcementSettings?.rotationSpeed]);

  if (!isBarVisible) return null;

  const currentItem = items[currentIndex] || items[0];
  const bgOverride = announcementSettings?.backgroundColor;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("announcementDismissed", "1");
  };

  return (
    <div
      style={{
        backgroundColor: bgOverride || "var(--color-primary, #1E7FC2)",
        height: "40px",
        lineHeight: "40px",
        zIndex: 1001,
        transition: "opacity 200ms ease"
      }}
      className="announcement-bar w-full fixed top-0 left-0 right-0 text-white flex items-center justify-between px-3 md:px-8 text-[12px] md:text-[13px] font-medium overflow-hidden border-b border-white/10 select-none"
    >
      <div 
        className="min-w-0 flex-1 flex justify-center text-center px-2 md:px-4 transition-opacity duration-200"
        style={{ opacity: opacity }}
      >
        <div className="min-w-0 max-w-full flex items-center justify-center gap-2 md:gap-3 text-center">
          <span className="block min-w-0 truncate whitespace-nowrap overflow-hidden text-ellipsis">
            {currentItem?.text || ""}
          </span>
          {currentItem?.linkUrl && (
            <Link
              to={currentItem.linkUrl}
              className="inline-flex items-center space-x-0.5 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold transition"
            >
              <span>{currentItem.linkLabel || "View"}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          )}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{ minWidth: "32px", minHeight: "32px" }}
        className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition flex-shrink-0 flex items-center justify-center"
        aria-label="Dismiss Announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default AnnouncementBar;
