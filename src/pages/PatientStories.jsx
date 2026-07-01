import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ShieldAlert, Heart, Calendar, ArrowRight, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const recoveryStories = [
  {
    id: "total-knee-flexion",
    patientName: "M. Venkata Rao",
    age: 62,
    condition: "Severe Osteoarthritis (Grade IV)",
    procedure: "Bilateral Total Knee Replacement",
    recoveryWeeks: 6,
    doctor: "Dr. C. Aravinda Babu",
    storySummary: "After 5 years of severe knee pain that confined him to a wheelchair, Venkata Rao underwent bilateral knee replacement. He achieved full extension and 125° flexion within 6 weeks of rehabilitation.",
    beforeState: "Severe joint space loss, bow-leg deformity, unable to stand for more than 2 minutes.",
    afterState: "Corrected alignment, fully pain-free walking, active daily life without walking aids.",
    flexionTimeline: [
      { week: "Week 1", angle: "70° Flexion", milestone: "Passive knee bending on CPM machine" },
      { week: "Week 2", angle: "90° Flexion", milestone: "Stitch removal and walk with walker" },
      { week: "Week 4", angle: "110° Flexion", milestone: "Independent walking, climbing steps" },
      { week: "Week 6", angle: "125° Flexion", milestone: "Complete recovery, full extension" }
    ],
    beforeImg: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80",
    afterImg: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "scoliosis-correction",
    patientName: "K. Lakshmi Priya",
    age: 16,
    condition: "Adolescent Idiopathic Scoliosis (48° Cobb Angle)",
    procedure: "Posterior Spinal Instrumented Fusion",
    recoveryWeeks: 12,
    doctor: "Dr. C. Aditya",
    storySummary: "Lakshmi was diagnosed with a rapid progressive spinal curve that affected her breathing. Spinal instrumented fusion corrected the Cobb angle from 48° to less than 8°, restoring normal spinal alignment.",
    beforeState: "Severe lateral spinal deformity, thoracic rib hump, persistent postural back pain.",
    afterState: "Full correction of trunk balance, scoliosis resolved, returns to schooling.",
    flexionTimeline: [
      { week: "Week 1", angle: "Post-op Alignment", milestone: "Assisted standing and walking in ICU" },
      { week: "Week 3", angle: "Brace Mobility", milestone: "Walking independently, light home activities" },
      { week: "Week 6", angle: "Trunk Extension", milestone: "No brace needed, normal light walking" },
      { week: "Week 12", angle: "Full Restructuring", milestone: "Complete fusion, return to active schooling" }
    ],
    beforeImg: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80",
    afterImg: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=400&q=80"
  }
];

export function PatientStories() {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const activeStory = recoveryStories[activeStoryIndex];

  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Recovery Journals</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            Patient Stories & Recovery Journeys
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
            Real bone, joint, and spine recoveries. Documented before/after surgical alignment and joint mobilization timelines.
          </p>
        </div>
      </section>

      {/* 2. Story Selection Tabs */}
      <section className="py-8 bg-[#EAF4FC] dark:bg-[#132635]/30 border-b border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex space-x-3 justify-center whitespace-nowrap min-w-max">
            {recoveryStories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => setActiveStoryIndex(index)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
                  activeStoryIndex === index
                    ? "bg-brand-blue border-brand-blue text-white shadow-md"
                    : "border-brand-blue/30 text-brand-blue bg-white dark:bg-slate-900 hover:bg-brand-blue hover:text-white"
                }`}
              >
                {story.patientName} ({story.condition})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Immersive recovery journal display */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column - Before/After Comparisons (cols 1-5) */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="text-xl font-bold text-slate-850 dark:text-slate-50 font-serif border-b pb-3">
              Comparative Visual Journal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Before Frame */}
              <div className="space-y-3">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-red-500/20 bg-slate-100 dark:bg-slate-950">
                  <img
                    src={activeStory.beforeImg}
                    alt="Pre-operative state"
                    className="w-full h-full object-cover grayscale"
                  />
                  <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md shadow-md">
                    Pre-Op Deformity
                  </span>
                </div>
                <div className="p-3 bg-red-50/50 dark:bg-red-950/10 rounded-xl border border-red-100/50 dark:border-red-950/20">
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{activeStory.beforeState}</p>
                </div>
              </div>

              {/* After Frame */}
              <div className="space-y-3">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-emerald-500/20 bg-slate-100 dark:bg-slate-950">
                  <img
                    src={activeStory.afterImg}
                    alt="Post-operative state"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md shadow-md">
                    Post-Op Restoration
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/50 dark:border-emerald-950/20">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{activeStory.afterState}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Story Summary & Rehabilitation Timeline (cols 6-12) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535] bg-[#3FA535]/10 px-3 py-1 rounded-full">
                Surgical Case File
              </span>
              <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
                {activeStory.patientName}'s Journey
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-500 dark:text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-450 uppercase mb-1">Condition</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeStory.condition}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-450 uppercase mb-1">Surgery Performed</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeStory.procedure}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-450 uppercase mb-1">Primary Surgeon</span>
                  <span className="text-slate-800 dark:text-slate-200">{activeStory.doctor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Case Summary</h4>
              <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                {activeStory.storySummary}
              </p>
            </div>

            {/* Flexion Mobilization Timeline */}
            <div className="space-y-5">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide">Mobilization & Recovery Steps</h4>

              <div className="relative border-l-2 border-brand-blue/20 dark:border-brand-blue/10 pl-6 space-y-6">
                {activeStory.flexionTimeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Bullet marker */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand-blue border-2 border-white dark:border-slate-950 flex items-center justify-center shadow-sm">
                      <UserCheck className="w-2.5 h-2.5 text-white" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-brand-blue uppercase tracking-wider">{step.week}</span>
                        <span className="text-xs font-bold text-slate-450">•</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{step.angle}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{step.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PatientStories;
