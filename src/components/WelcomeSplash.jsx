import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "../context/AppContext";

function isWithinSchedule(item) {
  if (!item) return false;

  const now = Date.now();
  const publishAt = item.publishDate ? new Date(item.publishDate).getTime() : null;
  const expiryAt = item.expiryDate ? new Date(item.expiryDate).getTime() : null;

  if (publishAt && Number.isFinite(publishAt) && now < publishAt) return false;
  if (expiryAt && Number.isFinite(expiryAt) && now > expiryAt) return false;
  return true;
}

function getStorage(frequency) {
  if (frequency === "firstVisit") return window.localStorage;
  return window.sessionStorage;
}

export function WelcomeSplash() {
  const { welcomeBanner, settings } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  const banner = useMemo(() => {
    if (!welcomeBanner || welcomeBanner.isActive === false || welcomeBanner.status === "archived" || welcomeBanner.status === "draft") {
      return null;
    }

    if (!isWithinSchedule(welcomeBanner)) return null;
    return welcomeBanner;
  }, [welcomeBanner]);

  const markSeen = useCallback(() => {
    if (!banner) return;
    const frequency = banner.displayFrequency || "session";
    if (frequency === "always") return;

    try {
      getStorage(frequency).setItem(`amulya-welcome-${banner.id || banner.slot || "main"}`, "seen");
    } catch (error) {
      console.warn("Unable to persist welcome splash state:", error);
    }
  }, [banner]);

  const closeSplash = useCallback(() => {
    markSeen();
    setIsVisible(false);
  }, [markSeen]);

  useEffect(() => {
    if (!banner) {
      setIsVisible(false);
      return undefined;
    }

    const frequency = banner.displayFrequency || "session";
    const storageKey = `amulya-welcome-${banner.id || banner.slot || "main"}`;

    try {
      const storage = getStorage(frequency);
      if (frequency !== "always" && storage.getItem(storageKey) === "seen") {
        setIsVisible(false);
        return undefined;
      }
    } catch (error) {
      console.warn("Welcome splash storage unavailable:", error);
    }

    setIsVisible(true);
    const durationMs = Math.max(1500, Number(banner.displayDurationSeconds || 4) * 1000);
    const timer = window.setTimeout(() => closeSplash(), durationMs);

    return () => window.clearTimeout(timer);
  }, [banner, closeSplash]);

  const handleEnter = () => {
    closeSplash();
    if (banner?.buttonLink && banner.buttonLink !== window.location.pathname) {
      window.location.assign(banner.buttonLink);
    }
  };

  if (!banner) return null;

  const overlayOpacity = Math.min(0.9, Math.max(0.15, Number(banner.overlayOpacity ?? 0.64)));
  const logoUrl = banner.logoUrl || settings?.logoUrl || "/logo.png";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[90] overflow-hidden bg-[#061923] text-white"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Amulya Hospital"
        >
          {banner.backgroundVideoUrl ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={banner.backgroundVideoUrl}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : banner.backgroundImageUrl ? (
            <img
              src={banner.backgroundImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#061923_0%,#0B3C5D_46%,#0F6B5E_73%,#12331F_100%)]" />
          )}

          <div
            className="absolute inset-0"
            style={{ backgroundColor: banner.overlayColor || "#06263A", opacity: overlayOpacity }}
          />
          <div className="absolute inset-0 welcome-particle-field opacity-70" />

          <button
            type="button"
            onClick={closeSplash}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
            aria-label="Close welcome banner"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-12">
            <motion.div
              initial={{ opacity: 0, y: 28, scale: banner.animationStyle === "zoom-glass" ? 0.94 : 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="welcome-glass-frame w-full max-w-3xl rounded-[28px] border border-white/20 bg-white/[0.12] px-6 py-9 text-center shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl md:px-12 md:py-12"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.65 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[24px] border border-white/30 bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Amulya Hospital" className="h-full w-full object-contain" />
                ) : (
                  <Activity className="h-12 w-12 text-[#0B7D6B]" />
                )}
              </motion.div>

              <p className="text-xs font-extrabold uppercase tracking-[0.35em] text-[#B8F7D4]">
                {banner.kicker || "Welcome to"}
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-normal md:text-6xl">
                {banner.heading || "Amulya Hospital"}
              </h1>
              <p className="mt-3 text-base font-bold text-sky-100 md:text-xl">
                {banner.subheading || "Spine, Joint & Trauma Care"}
              </p>
              <p className="mx-auto mt-5 max-w-xl text-sm font-semibold leading-relaxed text-white/80 md:text-base">
                {banner.tagline || "Your Health, Our Commitment"}
              </p>

              <div className="mx-auto mt-8 h-px max-w-md bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="mt-7 space-y-2 text-sm font-bold text-white/80">
                <p>{banner.developerCredit || "Website Designed & Developed by WayZenTech"}</p>
                {banner.phoneNumber && (
                  <a href={`tel:${banner.phoneNumber}`} className="inline-flex items-center gap-2 text-[#F6C95C] hover:text-white">
                    <Phone className="h-4 w-4" />
                    <span>{banner.phoneNumber}</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={handleEnter}
                className="mt-8 rounded-full bg-white px-7 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#0B3C5D] shadow-[0_16px_40px_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5 hover:bg-[#B8F7D4]"
              >
                {banner.buttonText || "Enter Website"}
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WelcomeSplash;
