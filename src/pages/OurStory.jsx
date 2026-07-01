import React from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, ShieldCheck, Heart, Award, Star } from "lucide-react";
import { Link } from "react-router-dom";

const milestones = [
  {
    year: "1992",
    title: "Foundation of Amulya Nursing Home",
    description: "Founded by Dr. Chadalavada Aravinda Babu on May 8, 1992, bringing modern orthopaedic care and polio correction surgery to Narasaraopet and surrounding Tier-3 regions.",
    icon: Star,
    imageUrl: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
  },
  {
    year: "2000",
    title: "Joint Replacement Wing",
    description: "Inaugurated Narasaraopet's first dedicated modular Joint Replacement unit, establishing a high-end facility for Total Knee and Hip replacements.",
    icon: Award,
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80",
  },
  {
    year: "2008",
    title: "Accreditation and Advanced Fixations",
    description: "Adopted Swiss AO fixation implants and obtained accreditation to implement state-of-the-art fracture care solutions for round-the-clock emergency trauma response.",
    icon: ShieldCheck,
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  },
  {
    year: "2016",
    title: "Advanced Spine Surgery Wing",
    description: "Expanded facility scope by setting up specialized spinal cord trauma and keyhole disc surgery protocols.",
    icon: Activity,
    imageUrl: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80",
  },
  {
    year: "2021",
    title: "Fellowship Spine Core Addition",
    description: "Dr. Chadalavada Aditya, a Fellowship-trained Spine Surgeon (FISS), joined the clinic, driving forward-thinking micro-endoscopic and spinal deformity corrections.",
    icon: Heart,
    imageUrl: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80",
  },
  {
    year: "2026",
    title: "PWA and Smart Health Records",
    description: "Completed full digital record integration and introduced progressive offline-capable PWA support to ensure patient access anywhere, anytime.",
    icon: Calendar,
    imageUrl: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80",
  }
];

// Fallback icon resolver inside file to ensure no breaking imports
function Activity(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function OurStory() {
  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      {/* 1. Immersive Story Hero */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Our Heritage</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            A 33-Year Journey of Mobility & Trust
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
            From a single-room polio correction clinic in Narasaraopet to a landmark trauma, spine, and joint replacement center in Andhra Pradesh.
          </p>
        </div>
      </section>

      {/* 2. Interactive Milestone Timeline */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto relative">
        {/* Center Line for Desktop, Left Line for Mobile */}
        <div className="absolute left-8 md:left-1/2 top-32 bottom-20 w-0.5 bg-brand-blue/20 dark:bg-brand-blue/10 transform md:-translate-x-1/2" />

        <div className="space-y-20">
          {milestones.map((milestone, idx) => {
            const IconComponent = milestone.icon;
            const isEven = idx % 2 === 0;

            return (
              <div
                key={milestone.year}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Milestone Node Badge */}
                <div className="absolute left-8 md:left-1/2 w-8 h-8 rounded-full bg-brand-blue dark:bg-brand-blue border-4 border-white dark:border-slate-950 flex items-center justify-center transform -translate-x-1/2 z-10 shadow-md">
                  <IconComponent className="w-3.5 h-3.5 text-white" />
                </div>

                {/* Content Panel */}
                <div className="w-full md:w-[45%] pl-16 md:pl-0 md:px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="premium-card-blue p-6 md:p-8 space-y-4 hover:-translate-y-1 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-brand-blue dark:text-brand-blue font-serif">
                        {milestone.year}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#3FA535] bg-[#3FA535]/10 px-2 py-0.5 rounded-full">
                        Milestone
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-850 dark:text-slate-55 font-serif">
                      {milestone.title}
                    </h3>

                    {/* Image Reveal Section */}
                    <div className="relative h-44 rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 group">
                      <img
                        src={milestone.imageUrl}
                        alt={milestone.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      {milestone.description}
                    </p>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Bottom Call To Action */}
      <section className="py-20 px-6 md:px-12 text-center max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-blue dark:text-brand-blue">Looking Forward</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
            Continuing the Legacy of Clinical Care
          </h2>
          <p className="text-sm text-slate-450 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Read about our clinical leadership, specialized hospital infrastructure, or book an appointment online with our expert surgeons.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/leadership"
            className="border-2 border-brand-blue bg-transparent text-brand-blue hover:bg-brand-blue hover:text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 w-full sm:w-auto"
          >
            Meet Our Leadership
          </Link>
          <Link
            to="/book-appointment"
            className="border-2 border-brand-red bg-transparent text-brand-red hover:bg-brand-red hover:text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 w-full sm:w-auto"
          >
            Book Appointment
          </Link>
        </div>
      </section>
    </div>
  );
}

export default OurStory;
