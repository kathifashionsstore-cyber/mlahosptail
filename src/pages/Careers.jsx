import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Award, Briefcase, FileText, ChevronRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const openPositions = [
  {
    slug: "senior-physiotherapist",
    title: "Senior Physiotherapist",
    department: "Rehabilitation Wing",
    experience: "3-5 Years Orthopaedic experience",
    type: "Full-Time",
    description: "Looking for an experienced physiotherapist specializing in post-operative knee/hip replacement and spinal instrumentation recovery routines.",
    requirements: [
      "Bachelor/Master of Physiotherapy (BPT/MPT).",
      "Demonstrated clinical experience in orthopedic post-op mobilization.",
      "Empathetic patient communication and motivational training."
    ]
  },
  {
    slug: "icu-nurse",
    title: "Critical Care ICU Nurse",
    department: "Trauma & ICU",
    experience: "2+ Years Critical Care experience",
    type: "Full-Time (Rotational Shifts)",
    description: "Requires expertise in monitoring ventilators, cardiac parameters, post-surgical fracture triage, and coordination with trauma anesthesiologists.",
    requirements: [
      "B.Sc. Nursing / GNM.",
      "Proven track record in intensive care units (ICU/NICU/SICU).",
      "Expertise in handling multi-para monitors and emergency drug protocols."
    ]
  }
];

export function Careers() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    cvUrl: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in all required fields.");
      return;
    }
    // Mock submit trigger
    setIsSubmitSuccess(true);
    setTimeout(() => {
      setIsSubmitSuccess(false);
      setSelectedJob(null);
      setFormData({ name: "", email: "", phone: "", experience: "", cvUrl: "" });
    }, 3000);
  };

  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Careers</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            Join Our Clinical Team
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
            Build your medical career with Narasaraopet's leading orthopaedic and trauma specialists. We prioritize clinical growth, ethical values, and research.
          </p>
        </div>
      </section>

      {/* 2. Job Openings list */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side: Job Cards List (cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-bold text-slate-850 dark:text-slate-50 font-serif border-b pb-3">
              Open Opportunities
            </h2>

            <div className="space-y-4">
              {openPositions.map((job) => (
                <div
                  key={job.slug}
                  className={`premium-card-blue p-6 space-y-4 cursor-pointer transition-all border-l-4 ${
                    selectedJob?.slug === job.slug ? "border-brand-blue bg-[#EAF4FC]/20" : "border-transparent"
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3FA535] bg-[#3FA535]/10 px-2.5 py-0.5 rounded-full">
                      {job.department}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      {job.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{job.title}</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 font-semibold">Exp: {job.experience}</p>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {job.description}
                  </p>

                  <div className="flex items-center text-xs font-extrabold text-brand-blue">
                    <span>View requirements & apply</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Apply Form Widget (cols 8-12) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm">
              <AnimatePresence mode="wait">
                {!selectedJob ? (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 space-y-3"
                  >
                    <Briefcase className="w-12 h-12 text-slate-350 mx-auto" />
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Job Selected</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-medium max-w-xs mx-auto">
                      Select an active position from the left list to read details and submit your credentials.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedJob.slug}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#3FA535]">
                        Apply for position
                      </span>
                      <h3 className="text-lg font-bold text-slate-850 dark:text-slate-50 font-serif">
                        {selectedJob.title}
                      </h3>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-450">Candidate Requirements:</h5>
                      <ul className="space-y-2.5">
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-350 font-medium">
                            <Check className="w-3.5 h-3.5 text-[#3FA535] flex-shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-850" />

                    {/* Form Details */}
                    {isSubmitSuccess ? (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                        <UserCheck className="w-5 h-5 flex-shrink-0" />
                        <span>Application submitted successfully! Our HR team will reach out.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Anjali Verma"
                            className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Email Address *</label>
                            <input
                              type="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="anjali@gmail.com"
                              className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Phone Number *</label>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+91"
                              className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">CV Link / Portfolio Link *</label>
                          <input
                            type="url"
                            name="cvUrl"
                            required
                            value={formData.cvUrl}
                            onChange={handleInputChange}
                            placeholder="https://drive.google.com/..."
                            className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-3 rounded-xl text-xs shadow-md transition duration-200"
                        >
                          Submit Job Application
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Careers;
