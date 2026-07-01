import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Phone, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../../context/AppContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const textItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } }
};

const FALLBACK_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=85"
];

const HERO_SLOT_KEYS = ["hero-slide-1", "hero-slide-2", "hero-slide-3", "hero-slide-4", "hero-slide-5"];

const DEFAULT_HERO_SLIDES = [
  { id: "hero-slide-1", slotKey: "hero-slide-1", imageUrl: FALLBACK_HERO_IMAGES[0] },
  { id: "hero-slide-2", slotKey: "hero-slide-2", imageUrl: FALLBACK_HERO_IMAGES[1] },
  { id: "hero-slide-3", slotKey: "hero-slide-3", imageUrl: FALLBACK_HERO_IMAGES[2] },
  { id: "hero-slide-4", slotKey: "hero-slide-4", imageUrl: FALLBACK_HERO_IMAGES[3] },
  { id: "hero-slide-5", slotKey: "hero-slide-5", imageUrl: FALLBACK_HERO_IMAGES[4] }
];

const heroTrustItems = [
  { value: "15+", label: "Years Experience" },
  { value: "5000+", label: "Surgeries Performed" },
  { value: "4.9★", label: "Patient Rating" }
];

function CountUp({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const numericPart = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericPart)) {
      setCount(value);
      return;
    }

    let start = 0;
    const end = numericPart;
    const duration = 1000;
    const steps = 50;
    const stepTime = duration / steps;
    const increment = Math.ceil(end / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {typeof count === "number" ? count.toLocaleString() : count}
      {suffix}
    </span>
  );
}

export function HeroSlider() {
  const { settings, siteImages, getImageUrl } = useApp();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const minSwipeDistance = 50;

  const primaryPhone = settings?.phoneNumbers?.[0]?.number || "+918647223625";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Auto-play interval with pause-on-hover
  useEffect(() => {
    if (prefersReducedMotion || isHovered) return undefined;
    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5);
    }, 4500); // 4.5s slide duration
    return () => clearInterval(intervalId);
  }, [isHovered, prefersReducedMotion]);

  const activeSlotKey = HERO_SLOT_KEYS[currentSlide];
  const activeImageUrl = getImageUrl(activeSlotKey, "");

  const goToPreviousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 5) % 5);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 5);
  };

  const handleTouchStart = (event) => {
    setTouchEnd(null);
    setTouchStart(event.targetTouches[0].clientX);
  };

  const handleTouchMove = (event) => {
    setTouchEnd(event.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) goToNextSlide();
    if (distance < -minSwipeDistance) goToPreviousSlide();
  };

  // Render fallback placeholder
  const renderPlaceholder = () => (
    <div className="w-full h-full bg-[#07365A] flex flex-col items-center justify-center p-8 select-none">
      {settings?.logoUrl ? (
        <img src={settings.logoUrl} alt="Amulya Hospital Logo" className="w-16 h-16 object-contain rounded-full bg-white p-2 shadow-lg mb-3" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg mb-3 text-[#07365A]">
          <Sparkles className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-white font-serif font-black text-base tracking-wide">Amulya Hospital</h3>
      <p className="text-white/60 text-[9px] uppercase font-extrabold tracking-widest mt-0.5">Spine, Joint & Trauma Care</p>
    </div>
  );

  return (
    <section className="relative min-h-[90vh] md:min-h-[85vh] lg:min-h-[92vh] flex items-center bg-white dark:bg-slate-950 px-6 py-12 md:py-20 text-slate-800 dark:text-slate-100 overflow-hidden transition-colors duration-200">
      
      {/* 2-Column Grid */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full relative z-10">
        
        {/* MOBILE VIEW — Slider image on top */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="lg:hidden relative w-full h-[260px] sm:h-[320px] rounded-3xl overflow-hidden shadow-lg select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Overlapping top-left badge (positioned bottom-left on mobile) */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-white/95 text-slate-900 border border-slate-100 px-3 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D81F26] animate-pulse" />
            <span>500+ Knee Replacements</span>
          </div>

          {/* Swipe indicator dots */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-1.5">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 rounded-full transition-all ${
                  currentSlide === idx ? "w-4 bg-white" : "w-1 bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 h-full w-full"
            >
              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt="Hospital Hero"
                  onLoad={() => setImageLoaded(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                renderPlaceholder()
              )}
              {/* Internal dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ==================== LEFT COLUMN: Text details & CTAs ==================== */}
        <div className="flex flex-col justify-center space-y-6 text-left max-w-xl mx-auto lg:mx-0">
          <motion.div
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {/* Small Label Chip */}
            <motion.div variants={textItemVariants} className="inline-block">
              <span className="relative inline-flex items-center text-xs font-extrabold uppercase tracking-widest text-[#D81F26] border-l-2 border-l-[#D81F26] pl-3 py-0.5 select-none">
                Narasaraopet's #1 Orthopaedic Center
              </span>
            </motion.div>

            {/* Bold Main Heading */}
            <motion.h1
              variants={textItemVariants}
              className="text-3.5xl md:text-5xl lg:text-[46px] xl:text-[54px] font-extrabold leading-[1.1] tracking-tight text-slate-900 dark:text-white font-serif"
            >
              Expert Care for Spine, Joint & Trauma
            </motion.h1>

            {/* Subheading Statement */}
            <motion.p
              variants={textItemVariants}
              className="text-sm font-semibold leading-relaxed text-slate-500 dark:text-slate-400 max-w-lg"
            >
              Amulya Hospital has provided dedicated orthopedic surgeries, trauma triage, and deformity corrections in Narasaraopet for over three decades.
            </motion.p>

            {/* CTA Buttons stack */}
            <motion.div
              variants={textItemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <Link
                to="/book-appointment"
                className="bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold text-center text-xs uppercase tracking-[0.16em] py-4 px-8 rounded-full transition shadow-md hover:shadow-lg active:scale-98 select-none"
              >
                Book Appointment
              </Link>
              <a
                href={`tel:${primaryPhone}`}
                className="border-2 border-[#D81F26] hover:bg-[#D81F26]/5 text-[#D81F26] font-bold text-center text-xs uppercase tracking-[0.16em] py-3.5 px-8 rounded-full transition flex items-center justify-center gap-2 select-none"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call OPD: {primaryPhone}</span>
              </a>
            </motion.div>

            {/* Stats row with count-up */}
            <motion.div
              variants={textItemVariants}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-slate-805/40 text-left max-w-lg select-none"
            >
              {heroTrustItems.map((item) => {
                const numericPart = item.value.replace(/[^0-9]/g, "");
                const suffix = item.value.replace(/[0-9]/g, "");
                return (
                  <div key={item.label} className="space-y-0.5">
                    <p className="text-lg md:text-2xl font-extrabold text-[#D81F26] dark:text-[#E25C62] tracking-tight">
                      {prefersReducedMotion ? (
                        <span>{item.value}</span>
                      ) : (
                        <CountUp value={numericPart} suffix={suffix} />
                      )}
                    </p>
                    <p className="text-[9px] md:text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-snug">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* ==================== DESKTOP VIEW: Slider image with offset backdrop shape ==================== */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="hidden lg:block relative w-full max-w-[560px] mx-auto select-none"
        >
          {/* Behind the image: offset brand red background rectangle */}
          <div className="absolute bottom-[-14px] right-[-14px] bg-[#C0392B] rounded-[32px] w-full h-full z-0 pointer-events-none shadow-md" />

          {/* Main image container */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative z-10 w-full aspect-[4/3] rounded-[32px] overflow-hidden bg-slate-105 border border-slate-200 dark:border-slate-800 shadow-[0_40px_40px_rgba(0,0,0,0.15)] bg-slate-900"
          >
            {/* Overlapping top-left floating badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white text-slate-900 border border-slate-100 px-3.5 py-2 rounded-full text-[9px] font-extrabold uppercase tracking-wider shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D81F26] animate-pulse" />
              <span>500+ Knee Replacements</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full"
              >
                {activeImageUrl ? (
                  <img
                    src={activeImageUrl}
                    alt="Amulya Hospital Facility Slider"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  renderPlaceholder()
                )}
                {/* Subtle dark bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            </AnimatePresence>

            {/* Slider touch/click arrows */}
            <button
              onClick={goToPreviousSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Dots indicators below the frame */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
            {[0, 1, 2, 3, 4].map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "w-6 bg-[#D81F26]" : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-[#D81F26]"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSlider;
