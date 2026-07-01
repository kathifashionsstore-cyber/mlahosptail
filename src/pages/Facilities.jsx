import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Crosshair, HelpCircle, Star, Award, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const clinicalFacilities = [
  {
    id: "operating-theatres",
    name: "Advanced Operating Theatres",
    tagline: "Orthopaedic and Joint Arthroplasty Suites",
    description: "Equipped with positive pressure Laminar Airflow systems to maintain ultra-sterile environment, Swiss AO surgical fixation systems, and high-frequency C-Arm fluoroscopic imaging for real-time surgical precision.",
    icon: Crosshair,
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Laminar flow ventilation (Class 100 cleanroom compliance)",
      "High-resolution C-Arm image intensifiers",
      "Ergonomic LED surgical lights and modular tables",
      " Swiss pneumatic and battery-operated drill suites"
    ]
  },
  {
    id: "trauma-icu",
    name: "24/7 Trauma ICU",
    tagline: "Dedicated Intensive Care for Poly-Trauma Relief",
    description: "Equipped with multi-para patient monitors, ventilators, and central oxygen infrastructure. Managed by specialized critical care nurses and in-house trauma physicians to handle severe emergency casualties.",
    icon: ShieldCheck,
    imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Continuous cardiac, pulse, and oxygen monitoring",
      "In-house respiratory ventilators and oxygen backup",
      "Dedicated critical care nurses (1:1/1:2 patient-nurse ratio)",
      "24/7 in-house anesthesiologist availability"
    ]
  },
  {
    id: "imaging-diagnostics",
    name: "Digital Imaging & Diagnostics",
    tagline: "Instant Radiography for Bone & Joint Trauma",
    description: "Features high-resolution digital X-ray processing systems for instant image sharing, allowing rapid assessment of fractures, joint dislocations, and spinal alignments within minutes of arrival.",
    icon: Zap,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Ultra-low dose digital radiography",
      "Instant imaging integration in trauma rooms",
      "Advanced bone density (DEXA scan) options",
      "Comprehensive laboratory screening support"
    ]
  },
  {
    id: "physiotherapy",
    name: "Rehabilitation & Physiotherapy",
    tagline: "Post-Surgical Mobilization & Deformity Care",
    description: "Dedicated rehabilitation center assisting knee/hip replacement and spine surgery recovery. Focuses on restoring motor function, building muscle integrity, and correcting post-traumatic walking patterns.",
    icon: Heart,
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=80",
    features: [
      "Custom post-surgical rehabilitation plans",
      "Ultrasound, muscle stimulation, and heat therapies",
      "Deformity correction physical therapy training",
      "Dedicated gait-training corridors"
    ]
  }
];

const tourHotspots = [
  {
    id: "ot",
    label: "Operating Suite (OT)",
    coords: { top: "35%", left: "28%" },
    title: "Orthopaedic Operating Theatre",
    description: "Our main surgical suite featuring laminar airflow, German LED arrays, and C-Arm fluoroscopic guidance systems.",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "icu",
    label: "Critical ICU",
    coords: { top: "52%", left: "68%" },
    title: "Trauma Critical Care ICU",
    description: "Equipped with intensive multi-para patient monitors, ventilators, and dedicated bedside critical nursing care.",
    imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rehab",
    label: "Physiotherapy Room",
    coords: { top: "70%", left: "42%" },
    title: "Rehabilitation & Physiotherapy Space",
    description: "Fully-stocked muscle stimulation and mobilization space where patients undergo post-surgical physiotherapy care.",
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80"
  }
];

export function Facilities() {
  const [activeTourIndex, setActiveTourIndex] = useState(0);

  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Clinical Infrastructure</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            Surgical Facilities & Tech
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
            Discover our modular operating theatres, critical care ICU chambers, and digital diagnostics engineered for premium clinical outcomes.
          </p>
        </div>
      </section>

      {/* 2. Detailed Facility Sections */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-28">
        {clinicalFacilities.map((facility, idx) => {
          const isEven = idx % 2 === 0;
          const IconComponent = facility.icon;

          return (
            <div
              key={facility.id}
              id={facility.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center scroll-mt-28`}
            >
              {/* Media panel */}
              <div className={`lg:col-span-6 space-y-4 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55 }}
                  className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group"
                >
                  <img
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </div>

              {/* Text panel */}
              <div className={`lg:col-span-6 space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">
                      {facility.tagline}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
                    {facility.name}
                  </h2>
                </div>

                <p className="text-sm text-slate-550 dark:text-slate-400 font-medium leading-relaxed">
                  {facility.description}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {facility.features.map((feat, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-350">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. 360 Virtual Hotspots Interactive Map */}
      <section className="py-20 px-6 md:px-12 bg-[#EAF4FC] dark:bg-[#132635]/30 border-y border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-blue">Interactive Walkthrough</span>
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
              Virtual Tour & Media Hotspots
            </h2>
            <p className="text-sm text-slate-450 dark:text-slate-400 font-medium">
              Explore Amulya Nursing Home's main wings. Click a hotspot pin to load the panoramic scene detail.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Hotspot Viewport */}
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden aspect-video bg-slate-900 border-4 border-white dark:border-slate-800 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80"
                alt="Hospital Virtual Walkthrough"
                className="w-full h-full object-cover opacity-70 filter blur-[1px]"
              />
              <div className="absolute inset-0 bg-black/30" />

              {/* Pins overlays */}
              {tourHotspots.map((spot, index) => (
                <button
                  key={spot.id}
                  onClick={() => setActiveTourIndex(index)}
                  style={{ top: spot.coords.top, left: spot.coords.left }}
                  className={`absolute w-6 h-6 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-300 ${
                    activeTourIndex === index
                      ? "bg-brand-red text-white scale-125 z-20 ring-4 ring-white"
                      : "bg-brand-blue text-white hover:bg-brand-red z-10 animate-pulse"
                  }`}
                  title={spot.label}
                >
                  <Crosshair className="w-3 h-3" />
                </button>
              ))}

              <div className="absolute bottom-5 left-5 bg-black/60 backdrop-blur-sm text-[10px] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider">
                Active Viewport: {tourHotspots[activeTourIndex].label}
              </div>
            </div>

            {/* Right: Info Widget Card */}
            <div className="lg:col-span-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tourHotspots[activeTourIndex].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="premium-card-blue p-6 space-y-4"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                    <img
                      src={tourHotspots[activeTourIndex].imageUrl}
                      alt={tourHotspots[activeTourIndex].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-50 font-serif">
                      {tourHotspots[activeTourIndex].title}
                    </h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 font-medium leading-relaxed mt-2">
                      {tourHotspots[activeTourIndex].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Facilities;
