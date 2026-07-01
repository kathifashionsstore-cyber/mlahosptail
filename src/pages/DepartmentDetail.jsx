import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ShieldCheck, Crosshair, ArrowRight, HelpCircle, UserCheck, Star, Clock, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

// Complete local structural configurations for all 8 hospital specialties
const departmentConfigs = {
  "orthopaedics": {
    name: "General Orthopaedics",
    accent: "brand-blue",
    tagline: "Comprehensive bone and skeletal health",
    overview: "Our General Orthopaedics unit provides comprehensive diagnostic and surgical treatments for degenerative bone disorders, osteoporosis, and arthritic conditions.",
    highlightMetric: "30,000+ Surgeries Performed",
    layoutStyle: "clean-grid",
    procedures: ["Osteoporosis management", "Arthritis treatment", "Deformity corrections", "Bone density (DEXA) scans"],
    faqs: [
      { q: "What is osteoporosis?", a: "Osteoporosis is a condition that weakens bones, making them fragile and more likely to break. We offer full bone density screening and medical management." },
      { q: "Do I need surgery for joint pain?", a: "Not always. Many joint pain conditions are managed with medication, splinting, physiotherapy, or joint injections." }
    ]
  },
  "spine-care": {
    name: "Spine Surgery",
    accent: "brand-blue",
    tagline: "Fellowship-trained spine corrections",
    overview: "Led by fellowship-trained spine specialists, we treat complex scoliosis, spinal disc herniations, and spinal trauma using minimal-access endoscopic techniques.",
    highlightMetric: "Fellowship Spine Center (FISS)",
    layoutStyle: "editorial-flow",
    procedures: ["Micro-endoscopic discectomy", "Spinal fusion surgery", "Scoliosis correction", "Cervical spine decompression"],
    faqs: [
      { q: "What is keyhole spine surgery?", a: "It is a minimally invasive surgery performed through a tiny incision using specialized endoscopic tubes, resulting in faster recovery and minimal muscle disruption." },
      { q: "When is spinal fusion necessary?", a: "Spinal fusion is used to join two or more vertebrae when there is spinal instability, severe degeneration, or deformity." }
    ]
  },
  "joint-replacement": {
    name: "Joint Replacement",
    accent: "brand-red",
    tagline: "Total hip and knee replacements",
    overview: "We offer advanced total knee and hip replacement solutions. Our modular joint replacement operating suites ensure the highest sterile standards for implants.",
    highlightMetric: "Modular Arthroplasty Suites",
    layoutStyle: "split-comparison",
    procedures: ["Total Knee Arthroplasty", "Total Hip Arthroplasty", "Partial Knee Replacement", "Revision Joint Surgery"],
    faqs: [
      { q: "How long does a joint implant last?", a: "Modern joint replacements last 15-20 years or more with advanced implant materials and precise alignment techniques." },
      { q: "When can I walk after knee replacement?", a: "Most patients walk with assistance within 24 hours of surgery under our rapid recovery mobilization protocols." }
    ]
  },
  "sports-medicine": {
    name: "Sports Medicine & Arthroscopy",
    accent: "brand-blue",
    tagline: "Keyhole arthroscopic ligament repairs",
    overview: "Specialized arthroscopic procedures for ACL, PCL, and meniscus tears. Focused on returning athletes to peak physical performance using modern recovery plans.",
    highlightMetric: "Arthroscopic Ligament Center",
    layoutStyle: "performance-grid",
    procedures: ["ACL/PCL Reconstruction", "Meniscus Repair", "Shoulder Stabilization", "Rotator Cuff Repair"],
    faqs: [
      { q: "What is arthroscopy?", a: "Arthroscopy is a keyhole surgical procedure where a tiny camera (arthroscope) is inserted into a joint to guide repairs with miniature instruments." },
      { q: "What is the recovery time for ACL surgery?", a: "Full recovery and return to active competitive sports typically takes 6 to 9 months of structured rehabilitation." }
    ]
  },
  "trauma-care": {
    name: "24/7 Trauma & Accident Care",
    accent: "brand-red",
    tagline: "Emergency AO fracture fixations",
    overview: "Round-the-clock emergency responses for poly-trauma, industrial accidents, and severe limb injuries. Powered by modular ICUs and AO Swiss implants.",
    highlightMetric: "24/7 Casualty & Triage",
    layoutStyle: "emergency-ticker",
    procedures: ["Swiss AO implant fixation", "Complex fracture reduction", "Poly-trauma stabilisation", "Emergency vascular repairs"],
    faqs: [
      { q: "What is AO Swiss fixation?", a: "AO (Association for the Study of Internal Fixation) is a global standard for premium surgical implants and instruments ensuring anatomical bone stabilization." },
      { q: "Do you have 24/7 emergency imaging?", a: "Yes, our high-frequency digital X-Ray and diagnostics lab operate 24 hours a day, 365 days a year." }
    ]
  },
  "physiotherapy": {
    name: "Rehabilitation & Physiotherapy",
    accent: "brand-green",
    tagline: "Post-surgical mobilization programs",
    overview: "Dedicated physical therapy to restore movement, improve walking patterns, and rebuild muscular strength after major joint replacements or spine surgeries.",
    highlightMetric: "Gait-training corridors",
    layoutStyle: "healing-green-timeline",
    procedures: ["Post-surgical rehabilitation", "Muscle stimulation therapies", "Gait analysis and correction", "Pain relief therapies"],
    faqs: [
      { q: "When should post-op physiotherapy begin?", a: "Rehabilitation begins almost immediately—usually within 24 to 48 hours after stable orthopaedic surgeries." },
      { q: "Do you offer outpatient physiotherapy?", a: "Yes, we run dedicated outpatient physiotherapy clinics daily for joint mobilization and muscle strengthening." }
    ]
  },
  "pediatric-orthopaedics": {
    name: "Pediatric Orthopaedics",
    accent: "brand-blue",
    tagline: "Corrective clubfoot and skeletal care",
    overview: "Dedicated to correcting congenital bone deformities, clubfoot (CTEV), cerebral palsy gait imbalances, and pediatric fractures with gentle casting and surgeries.",
    highlightMetric: "Ponseti Clubfoot Casting",
    layoutStyle: "nurture-card-deck",
    procedures: ["Ponseti casting for clubfoot", "Cerebral palsy tendon releases", "Pediatric fracture management", "Skeletal growth monitoring"],
    faqs: [
      { q: "What is the Ponseti method?", a: "The Ponseti method is a highly successful non-surgical treatment for clubfoot utilizing a series of gentle stretching and plaster casts." },
      { q: "Can cerebral palsy gait be improved?", a: "Yes, orthopedic surgery combined with gait training and tendon releases can significantly enhance mobility in children with cerebral palsy." }
    ]
  },
  "pain-management": {
    name: "Pain Management",
    accent: "brand-blue",
    tagline: "Targeted nerve blocks and epidurals",
    overview: "Non-surgical pain relief options for chronic back pain, joint stiffness, and arthritis. Guided epidural injections, nerve blocks, and joint lubrications.",
    highlightMetric: "Guided Spine Injections",
    layoutStyle: "pain-block-list",
    procedures: ["Epidural steroid injections", "Facet joint blocks", "Viscosupplementation for knees", "Trigger point injections"],
    faqs: [
      { q: "What are facet joint blocks?", a: "These are targeted injections of local anesthetic and anti-inflammatories near the small joints of the spine to relieve chronic back pain." },
      { q: "Is joint lubrication effective for arthritis?", a: "Yes, viscosupplementation injections restore cushioning fluid to mild-to-moderate osteoarthritic knee joints." }
    ]
  }
};

export function DepartmentDetail() {
  const { deptSlug } = useParams();
  const { doctors, treatments, settings } = useApp();

  const config = departmentConfigs[deptSlug] || departmentConfigs["orthopaedics"];
  
  // Filter doctors and treatments related to this specialty
  const relatedDoctors = doctors.filter(
    (doc) => doc.departmentId === deptSlug || (deptSlug === "orthopaedics" && doc.specialization?.toLowerCase().includes("ortho"))
  );
  
  const relatedTreatments = treatments.filter(
    (t) => t.departmentId === deptSlug || (deptSlug === "orthopaedics" && t.slug?.includes("knee"))
  );

  const [activeFaq, setActiveFaq] = useState(null);

  // Layout Themes based on LayoutStyle property
  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      <Helmet>
        <title>{`${config.name} | ${settings?.hospitalName || "Amulya Nursing Home"} | Narasaraopet`}</title>
        <meta
          name="description"
          content={`${config.name} at ${settings?.hospitalName || "Amulya Nursing Home"}: ${config.overview} Located in Narasaraopet, Palnadu. Expert treatment, modular surgical theaters, and rehabilitative care.`}
        />
        <meta name="keywords" content={`${config.name} narasaraopet, orthopedic hospital, spine surgery, joint replacement, amulya nursing home specialty`} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      {/* 1. Cinematic Specialty Hero */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">{config.tagline}</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            {config.name} Department
          </h1>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#3FA535]/20 text-white rounded-full text-xs font-bold shadow-sm">
            <span>{config.highlightMetric}</span>
          </div>
        </div>
      </section>

      {/* 2. Department Overview and Procedures */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Overview & Unique Layout Grid (cols 1-7) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Overview</h3>
            <p className="text-base text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
              {config.overview}
            </p>
          </div>

          {/* Render unique visual layouts based on department personality */}
          {config.layoutStyle === "split-comparison" && (
            <div className="p-6 bg-brand-red/5 rounded-3xl border border-brand-red/10 space-y-4">
              <h4 className="text-sm font-extrabold text-brand-red uppercase tracking-wider">Joint Wear Visualizer</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                Severe arthritis causes cartilage degradation and bone-on-bone contact. Joint replacements resurface these worn areas with premium implants, restoring smooth flexion.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center text-xs font-bold text-slate-550 dark:text-slate-400">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm">Degenerated Joint</div>
                <div className="p-3 bg-brand-blue text-white rounded-xl shadow-sm">Arthroplasty Restore</div>
              </div>
            </div>
          )}

          {config.layoutStyle === "emergency-ticker" && (
            <div className="p-6 bg-[#C81E29]/10 rounded-3xl border border-[#C81E29]/20 space-y-4 animate-pulse">
              <h4 className="text-sm font-extrabold text-[#C81E29] uppercase tracking-wider flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C81E29] mr-2 block animate-ping" />
                Emergency Casualty Line
              </h4>
              <p className="text-xs text-slate-650 dark:text-slate-350 font-bold leading-relaxed">
                Our surgical team and trauma theater remain active 24/7. Continuous coverage for compound fractures, dislocations, and crush injuries.
              </p>
            </div>
          )}

          {config.layoutStyle === "editorial-flow" && (
            <div className="p-6 bg-brand-blue/5 rounded-3xl border border-brand-blue/10 space-y-4">
              <h4 className="text-sm font-extrabold text-brand-blue uppercase tracking-wider">Spinal Decompression Map</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                By relieving pressure on spinal nerves (caused by herniated discs or stenosis), our micro-discectomy procedures resolve radiating leg pain (sciatica) instantly.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Treatments & Procedures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.procedures.map((proc, index) => (
                <div key={index} className="premium-card-blue p-4 flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-brand-blue" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{proc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Related Doctors & Quick CTA (cols 8-12) */}
        <div className="lg:col-span-5 space-y-8">
          {/* Related Doctors List */}
          {relatedDoctors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Specialists in this Wing</h3>
              <div className="space-y-3">
                {relatedDoctors.slice(0, 2).map((doc) => (
                  <div key={doc.id} className="premium-card-blue p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-850 overflow-hidden flex-shrink-0">
                        <img
                          src={doc.photoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{doc.name}</h4>
                        <p className="text-[10px] text-[#3FA535] uppercase font-bold tracking-wide mt-0.5">{doc.designation || doc.specialization}</p>
                      </div>
                    </div>
                    <Link to={`/doctors/${doc.id}`} className="text-xs font-bold text-brand-blue hover:underline">
                      Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Surgical Treatments */}
          {relatedTreatments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400">Related Treatments</h3>
              <div className="space-y-3.5">
                {relatedTreatments.slice(0, 3).map((treatment) => (
                  <Link
                    key={treatment.id}
                    to={`/treatments/${treatment.slug}`}
                    className="flex items-center justify-between p-3.5 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition text-sm font-bold text-slate-700 dark:text-slate-300"
                  >
                    <span>{treatment.name}</span>
                    <ArrowRight className="w-4 h-4 text-brand-blue" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Booking Widget */}
          <div className="p-6 bg-brand-blue text-white rounded-3xl shadow-lg space-y-4">
            <h4 className="text-lg font-bold font-serif">Need a consultation schedule?</h4>
            <p className="text-xs text-slate-100 leading-relaxed font-semibold">
              Find verified consult availability with our clinical specialists and book your visit slots online in seconds.
            </p>
            <Link
              to="/book-appointment"
              className="block w-full text-center bg-white hover:bg-slate-100 text-brand-blue font-bold py-2.5 rounded-xl shadow-md text-xs transition duration-200"
            >
              Book Specialty Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Department FAQs Accordion */}
      <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 transition-colors duration-300">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Common Queries</span>
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
              Specialty FAQ Accordion
            </h2>
          </div>

          <div className="space-y-4">
            {config.faqs.map((faq, index) => {
              const isOpen = activeFaq === index;

              return (
                <div key={index} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden transition shadow-sm bg-surface-light dark:bg-surface-dark">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
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

export default DepartmentDetail;
