import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Heart, UserCheck, DollarSign, Clock, HelpCircle, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const healthPackages = [
  {
    name: "Orthopaedic Wellness screening",
    price: "₹1,499",
    tagline: "Basic Bone & Joint Check",
    description: "Ideal for patients experiencing mild joint pain or seeking basic bone health metrics.",
    features: [
      "Digital Joint X-Ray (1 view)",
      "Serum Calcium screening",
      "Uric Acid test",
      "Orthopaedic specialist consult"
    ]
  },
  {
    name: "Advanced Spine Screening",
    price: "₹2,999",
    tagline: "Comprehensive back & disc profile",
    description: "Designed for chronic back pain, spinal strain, and disc wear analysis.",
    features: [
      "Digital Spine X-Ray (2 views)",
      "Vitamin D3 (25-Hydroxy) test",
      "Serum Calcium & Phosphorus",
      "Specialist Spine Surgeon consult"
    ]
  },
  {
    name: "Total Joint Wear Screening",
    price: "₹3,999",
    tagline: "Total knee/hip replacement eligibility check",
    description: "Complete diagnostic alignment screen for patients considering replacement surgery.",
    features: [
      "Bilateral joint weight-bearing X-Rays",
      "Rheumatoid Factor (RF) test",
      "Complete blood picture & CRP test",
      "Senior Joint replacement surgeon consult"
    ]
  }
];

const faqCategories = {
  general: [
    { q: "What are your outpatient consultancy timings?", a: "Outpatient clinics operate daily from 9:30 AM to 1:30 PM, and 4:30 PM to 8:30 PM. Sunday consultancy is emergency-only." },
    { q: "Do you have in-house diagnostics?", a: "Yes, our high-frequency digital X-Ray and diagnostic laboratory run 24 hours a day." }
  ],
  insurance: [
    { q: "Which TPAs do you support for cashless hospitalisation?", a: "We support major TPAs including Medi Assist, Star Health, Heritage TPA, Paramount TPA, FHPL, and MDIndia." },
    { q: "How long does cashless pre-authorisation take?", a: "Pre-authorization approval typically takes 2 to 4 hours from the time we submit the clinical documents." }
  ],
  rehab: [
    { q: "Do you offer post-surgery home physiotherapy?", a: "Yes, our physiotherapists provide home mobilization visits within Narasaraopet for post-knee and spine surgery patients." }
  ]
};

export function PatientCare() {
  const [activeTab, setActiveTab] = useState("insurance");
  const [activeFaqCategory, setActiveFaqCategory] = useState("general");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Support Center</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            Patient Support & Cashless Care
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
            Find details on cashless insurance coverage, orthopaedic health screening packages, and international patient assistance.
          </p>
        </div>
      </section>

      {/* 2. Patient Care Sub-Tabs */}
      <section className="py-8 bg-[#EAF4FC] dark:bg-[#132635]/30 border-b border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex space-x-3 justify-center whitespace-nowrap min-w-max">
            <button
              onClick={() => setActiveTab("insurance")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
                activeTab === "insurance"
                  ? "bg-brand-blue border-brand-blue text-white shadow-md"
                  : "border-brand-blue/30 text-brand-blue bg-white dark:bg-slate-900 hover:bg-brand-blue hover:text-white"
              }`}
            >
              Cashless Insurance
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
                activeTab === "packages"
                  ? "bg-brand-blue border-brand-blue text-white shadow-md"
                  : "border-brand-blue/30 text-brand-blue bg-white dark:bg-slate-900 hover:bg-brand-blue hover:text-white"
              }`}
            >
              Health Screening Packages
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
                activeTab === "international"
                  ? "bg-brand-blue border-brand-blue text-white shadow-md"
                  : "border-brand-blue/30 text-brand-blue bg-white dark:bg-slate-900 hover:bg-brand-blue hover:text-white"
              }`}
            >
              International Patient Support
            </button>
          </div>
        </div>
      </section>

      {/* 3. Tab Body Display */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "insurance" && (
            <motion.div
              key="insurance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Cashless info */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">TPAs & Cashless Desk</span>
                  <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
                    Cashless Claims & Approvals
                  </h2>
                </div>
                <p className="text-sm text-slate-550 dark:text-slate-400 font-medium leading-relaxed">
                  Amulya Nursing Home maintains active tie-ups with leading health insurance providers and Third-Party Administrators (TPAs) to offer cashless hospitalization services.
                </p>
                <div className="space-y-4">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-450">Step-by-Step Claim Process</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-350 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0">1</div>
                      <p>Present active health insurance card and ID document at the Cashless Desk during admission scheduling.</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-350 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0">2</div>
                      <p>Our TPA team submits clinical diagnosis records and pre-authorisation forms directly to your TPA portal.</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-350 flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-brand-blue text-white flex items-center justify-center flex-shrink-0">3</div>
                      <p>Approval response is typically issued within 2 to 4 hours. Patient is discharged cashless after final clearance.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance partners */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-serif border-b pb-3">
                  Cashless Partners
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>Star Health</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>Medi Assist</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>Paramount TPA</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>ICICI Lombard</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>HDFC Ergo</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    <span>Heritage TPA</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "packages" && (
            <motion.div
              key="packages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-10"
            >
              <div className="text-center max-w-xl mx-auto space-y-3">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Preventative Bone Health</span>
                <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
                  Orthopaedic Health Packages
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {healthPackages.map((pkg) => (
                  <div key={pkg.name} className="premium-card-blue p-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-450 block">{pkg.tagline}</span>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif">{pkg.name}</h3>
                      <div className="text-3xl font-black text-brand-blue dark:text-brand-blue">{pkg.price}</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-450 border-t pt-3">Includes:</h5>
                      <ul className="space-y-2">
                        {pkg.features.map((feat, index) => (
                          <li key={index} className="flex items-center space-x-2 text-xs text-slate-650 dark:text-slate-350 font-semibold">
                            <Activity className="w-3.5 h-3.5 text-brand-blue" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      to="/book-appointment"
                      className="block w-full text-center bg-brand-blue text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-brand-blue/15 hover:bg-brand-blue-dark transition duration-200"
                    >
                      Book Screening Package
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "international" && (
            <motion.div
              key="international"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Global patients desk</span>
                  <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
                    International Patient Care
                  </h2>
                </div>
                <p className="text-sm text-slate-550 dark:text-slate-400 font-medium leading-relaxed">
                  We welcome patients from all over the world. Our dedicated International Patient Desk assists you from airport pickup in Hyderabad/Vijayawada through to surgical completion, accommodation booking, and virtual follow-ups.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-350 space-y-2">
                    <h5 className="text-brand-blue font-extrabold uppercase">Travel & Logistics</h5>
                    <p className="text-slate-500 font-semibold leading-relaxed">Visa invitation letters, local lodging bookings, and coordinate airport transportation.</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-350 space-y-2">
                    <h5 className="text-brand-blue font-extrabold uppercase">Clinical Coordination</h5>
                    <p className="text-slate-500 font-semibold leading-relaxed">Schedule consultations, diagnostic clearances, surgery scheduling, and detailed post-op reviews.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 font-serif border-b pb-3">
                  Enquiry Desk
                </h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Have an international patient query? Coordinate directly with our administrative desk via phone or WhatsApp.
                </p>
                <a
                  href="tel:+918647223625"
                  className="block w-full text-center bg-brand-blue text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition duration-200"
                >
                  Contact Desk: +91 8647223625
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. Categorized FAQ Accordion */}
      <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 transition-colors duration-300">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-blue">FAQ Accordion</span>
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
              Hospital FAQ Directory
            </h2>
          </div>

          {/* FAQ categories selectors */}
          <div className="flex space-x-3 justify-center text-xs font-bold">
            <button
              onClick={() => { setActiveFaqCategory("general"); setOpenFaqIndex(null); }}
              className={`px-4 py-1.5 rounded-xl border ${
                activeFaqCategory === "general" ? "bg-brand-blue text-white border-brand-blue" : "border-slate-200 text-slate-500"
              }`}
            >
              General Info
            </button>
            <button
              onClick={() => { setActiveFaqCategory("insurance"); setOpenFaqIndex(null); }}
              className={`px-4 py-1.5 rounded-xl border ${
                activeFaqCategory === "insurance" ? "bg-brand-blue text-white border-brand-blue" : "border-slate-200 text-slate-500"
              }`}
            >
              Insurance
            </button>
            <button
              onClick={() => { setActiveFaqCategory("rehab"); setOpenFaqIndex(null); }}
              className={`px-4 py-1.5 rounded-xl border ${
                activeFaqCategory === "rehab" ? "bg-brand-blue text-white border-brand-blue" : "border-slate-200 text-slate-500"
              }`}
            >
              Physiotherapy
            </button>
          </div>

          <div className="space-y-4">
            {faqCategories[activeFaqCategory].map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div key={index} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-surface-light dark:bg-surface-dark">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between font-bold text-left text-sm text-slate-800 dark:text-slate-100 transition"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-brand-blue transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PatientCare;
