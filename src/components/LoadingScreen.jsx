import React from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

export function LoadingScreen({ size = "full" }) {
  let settings = null;
  try {
    const context = useApp();
    settings = context?.settings;
  } catch (e) {
    // fallback
  }
  const hospitalName = settings?.hospitalName || "Amulya Nursing Home";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Drawing animation properties
  const drawVariants = {
    hidden: { pathLength: 0, opacity: 0.15 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          duration: 1.8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
        opacity: {
          duration: 0.4,
        }
      }
    }
  };

  // Pre-reduced motion static fallback opacity variants
  const staticVariants = {
    hidden: { opacity: 0.3 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const activeVariants = prefersReducedMotion ? staticVariants : drawVariants;

  if (size === "small") {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#1E7FC2]">
          {/* Central Staff */}
          <motion.line
            x1="50" y1="15" x2="50" y2="85"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={activeVariants}
          />
          {/* Snakes */}
          <motion.path
            d="M 50 80 C 35 70, 35 60, 50 50 C 65 40, 65 30, 50 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={activeVariants}
          />
        </svg>
        <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 mt-2 animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
    >
      {/* Branded centerpiece: Caduceus Staff */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Soft glowing ambient circle */}
        <div className="absolute inset-0 bg-[#1E7FC2]/5 dark:bg-[#1E7FC2]/10 rounded-full blur-xl animate-pulse" />
        
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#1E7FC2] dark:text-[#1E7FC2] relative z-10">
          {/* Top Knob */}
          <motion.circle
            cx="50"
            cy="10"
            r="3"
            className="fill-[#D81F26]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Central Staff */}
          <motion.line
            x1="50"
            y1="13"
            x2="50"
            y2="88"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={activeVariants}
          />

          {/* Left and Right Wings */}
          <motion.path
            d="M 50 25 C 30 10, 15 20, 15 32 C 15 42, 38 40, 50 35 C 62 40, 85 42, 85 32 C 85 20, 70 10, 50 25 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinejoin="round"
            initial="hidden"
            animate="visible"
            variants={activeVariants}
          />

          {/* Serpent 1 (Left Winding) */}
          <motion.path
            d="M 50 80 C 35 70, 35 60, 50 50 C 65 40, 65 30, 50 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={activeVariants}
          />

          {/* Serpent 2 (Right Winding) */}
          <motion.path
            d="M 50 80 C 65 70, 65 60, 50 50 C 35 40, 35 30, 50 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            initial="hidden"
            animate="visible"
            variants={activeVariants}
          />
        </svg>
      </div>

      {/* Hospital Credentials lockup */}
      <div className="text-center mt-8 space-y-2 select-none">
        <h1 className="text-xl md:text-2xl font-serif font-extrabold tracking-tight text-[#0B3C5D] dark:text-white">
          {hospitalName}
        </h1>
        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#D81F26] dark:text-[#D81F26] mt-1">
          Spine, Joint & Trauma Care
        </p>
      </div>
    </motion.div>
  );
}

export default LoadingScreen;
