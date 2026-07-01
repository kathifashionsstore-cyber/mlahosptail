import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Award, Heart, Check, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const leaders = [
  {
    name: "Dr. Chadalavada Aravinda Babu",
    role: "Founder & Chief Orthopaedic Surgeon",
    credentials: "MBBS, MS (Orthopaedics)",
    experience: "33+ Years of Orthopaedic Excellence",
    philosophy: "Healthcare is a service to restore dignity and function. Every patient, regardless of background, deserves access to standard orthopaedic techniques.",
    photoUrl: "https://i.ibb.co/3sS7H9y/dr-aravinda-babu.jpg", // Fallback URL or placeholder
    bio: "Dr. Aravinda Babu founded Amulya Nursing Home in Narasaraopet in 1992. Over three decades, he has performed more than 30,000 successful orthopaedic surgeries, establishing a peerless legacy of trust and surgical precision.",
    achievements: [
      "Pioneered polio deformity correction surgery in Andhra Pradesh with over 5,000 corrective cases.",
      "Inaugurated Narasaraopet's first modular joint replacement operating suite.",
      "Recipient of community health leadership awards for rural medical services."
    ]
  },
  {
    name: "Dr. Chadalavada Aditya",
    role: "Fellowship-trained Spine Surgeon (FISS)",
    credentials: "MBBS, MS (Ortho), FISS (Spine Surgery)",
    experience: "Fellowship-trained Specialized Spine Care",
    philosophy: "Modern spine surgery should focus on minimal tissue disruption. Keyhole and micro-endoscopic techniques get patients back to active life in days, not months.",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
    bio: "Dr. Chadalavada Aditya brings advanced minimally invasive spine surgery procedures to Narasaraopet. Specializing in micro-endoscopy, spinal fusion, and scoliosis correction, he holds recognized fellowships from top spine training institutes.",
    achievements: [
      "Fellowship-trained in advanced keyhole and endoscopic disc surgeries.",
      "Successfully performed Narasaraopet's first endoscopic lumbar discectomy.",
      "Active researcher and speaker at regional and national spinal cord trauma forums."
    ]
  }
];

export function Leadership() {
  const { doctors } = useApp();
  const leaderAravinda = doctors.find((d) => d.id === "dr-aravinda-babu");
  const leaderAditya = doctors.find((d) => d.id === "dr-aditya");

  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Clinical Governance</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            Medical Leadership & Philosophy
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
            Led by two generations of dedicated orthopaedic and fellowship-trained spine surgeons committed to ethical, evidence-based surgery.
          </p>
        </div>
      </section>

      {/* 2. Executive Profiles */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-24">
        {leaders.map((leader, idx) => {
          const isEven = idx % 2 === 0;
          const activePhoto = idx === 0 
            ? (leaderAravinda?.photoUrl || leader.photoUrl) 
            : (leaderAditya?.photoUrl || leader.photoUrl);

          return (
            <div
              key={leader.name}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                isEven ? "" : "lg:flex-row-reverse"
              }`}
            >
              {/* Leader Photo panel (cols 1-5) */}
              <div className={`lg:col-span-5 space-y-4 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group"
                >
                  <img
                    src={activePhoto}
                    alt={leader.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Absolute Experience Badge */}
                  <div className="absolute bottom-5 left-5 bg-brand-blue text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                    {leader.experience}
                  </div>
                </motion.div>
              </div>

              {/* Leader Info panel (cols 6-12) */}
              <div className={`lg:col-span-7 space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                <div className="space-y-2">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">
                    {leader.role}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
                    {leader.name}
                  </h2>
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    {leader.credentials}
                  </p>
                </div>

                <div className="relative p-6 bg-[#EAF4FC] dark:bg-[#132635]/30 border-l-4 border-brand-blue rounded-r-3xl rounded-bl-3xl shadow-sm text-sm italic text-slate-650 dark:text-slate-300 font-medium leading-relaxed">
                  <span className="absolute top-2 left-2 text-6xl text-brand-blue/10 font-serif leading-none select-none">“</span>
                  <p className="relative z-10">{leader.philosophy}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Professional Biography
                  </h4>
                  <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed font-medium">
                    {leader.bio}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    Key Accomplishments
                  </h4>
                  <ul className="space-y-2.5">
                    {leader.achievements.map((ach, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-350 font-medium">
                        <Check className="w-4 h-4 text-[#3FA535] mt-0.5 flex-shrink-0" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default Leadership;
