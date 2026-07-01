import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Phone, 
  MessageSquare, 
  BookOpen, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Activity, 
  ShieldCheck, 
  Heart,
  AlertTriangle,
  ClipboardList,
  Sparkles,
  HelpCircle,
  FileText,
  Bookmark,
  ArrowRight,
  Stethoscope,
  Info,
  Clock,
  PlusCircle,
  Shield,
  Layers
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function DetailTemplate({ item, type = "service" }) {
  const { doctors, settings, getImageUrl } = useApp();
  const [activeFaq, setActiveFaq] = useState(null);
  const [sliderIndex, setSliderIndex] = useState(0);
  
  // Scrollspy active section state
  const [activeSection, setActiveSection] = useState("overview");
  const [faqSearch, setFaqSearch] = useState("");

  const sectionsList = [
    { id: "overview", label: "Clinical Overview" },
    { id: "symptoms", label: "Common Symptoms" },
    { id: "causes", label: "Causes & Risks" },
    { id: "diagnosis", label: "Diagnostics" },
    { id: "treatments", label: "Treatment Plans" },
    { id: "timeline", label: "Recovery Timeline" },
    { id: "tech", label: "Technologies" },
    { id: "doctors", label: "Specialist Surgeons" },
    { id: "faqs", label: "FAQs" }
  ];

  // Fallback slideshow images
  const fallbackSlides = [
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=800&q=80"
  ];

  const slides = item?.galleryImages || fallbackSlides;

  // Autoplay gallery slider
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setSliderIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Scrollspy intersection listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 220;
      for (const section of sectionsList) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  if (!item) return null;

  // Find related doctors linked to this condition
  const relatedDocs = doctors.filter((doc) => {
    if (item.relatedDoctorIds && item.relatedDoctorIds.includes(doc.id)) return true;
    if (doc.department === item.department || doc.department === item.categoryId) return true;
    return false;
  }).slice(0, 3);

  const finalDocs = relatedDocs.length > 0 ? relatedDocs : doctors.slice(0, 3);

  // Global clinical constants
  const techStack = [
    { name: "Modular Laminar Flow O.T.", desc: "Zero-bacteria airflow environment for bone implants." },
    { name: "High-Definition C-Arm Imaging", desc: "Real-time intraoperative skeletal visualization." },
    { name: "Swiss AO Fracture Plating", desc: "International gold-standard titanium fixation modules." },
    { name: "Ultrasonic Bone Scalpel", desc: "Precise skeletal resection minimizing soft-tissue trauma." }
  ];

  const facilities = [
    { name: "24/7 Trauma casualty wing", desc: "Equipped for polytrauma and open fracture triage." },
    { name: "Modular Joint Restorations", desc: "Sterility-controlled surgical suites for joint replacements." },
    { name: "Surgical ICU recovery wing", desc: "Post-operative monitor suites with dedicated nurses." },
    { name: "Physiotherapy & Rehab lab", desc: "On-site motion therapy and alignment rehabilitation." }
  ];

  const insurances = ["Star Health Insurance", "Max Bupa Health", "ICICI Lombard", "HDFC ERGO", "Aditya Birla Health", "Niva Bupa Cashless"];

  const emergencyPhone = settings?.phoneNumbers?.find((p) => p.label === "Hospital")?.number || "+91 8647223625";
  const whatsappNumber = settings?.whatsappNumber || "+917383085084";
  const heroBgImage = getImageUrl(`service-hero-${item.slug}`, item.heroImageUrl || item.heroUrl || item.bannerUrl || item.thumbnailUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=85");

  // Filter FAQs based on query
  const filteredFaqs = (item.faqs || []).filter((faq) =>
    faq.question.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="bg-[#F4F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 text-left relative font-sans">
      
      {/* 1. 🏷️ PARALLAX HERO SECTION WITH OVERLAY */}
      <section className="relative pt-36 pb-28 text-white overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBgImage}
            alt={item.name}
            className="w-full h-full object-cover opacity-20 scale-105 transition-transform duration-[20s]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#082A40]/98 via-[#0B3C5D]/98 to-[#082A40]/98 mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <nav className="flex space-x-2 text-[10px] font-extrabold uppercase tracking-widest text-[#1E7FC2] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 self-start w-max">
              <span>Services</span>
              <span>➔</span>
              <span>Orthopaedics</span>
              <span>➔</span>
              <span className="text-white">{item.name}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-tight">
              {item.name}
            </h1>
            <p className="text-sm md:text-lg text-slate-200 font-semibold max-w-2xl leading-relaxed">
              {item.heroHeadline || "Advanced Diagnosis & Reconstructive Orthopaedic Treatment"}
            </p>
            <p className="text-[11px] text-slate-350 italic max-w-xl font-medium">
              {item.heroSubheading || "Relieving joint stiffness, restoring motion, and correcting chronic skeletal deformities."}
            </p>
            
            {/* Quick 3-Button Helpline triggers */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/book-appointment"
                className="bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all transform active:scale-95 shadow-lg"
              >
                Book Appointment
              </Link>
              <a
                href={`tel:${emergencyPhone}`}
                className="bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Call Helpline
              </a>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
          
          {/* Quick diagnostic credentials box */}
          <div className="lg:col-span-4 bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-3xl space-y-4 text-left">
            <span className="text-[9px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block">Triage desk info</span>
            <h3 className="font-serif text-base font-bold text-white leading-tight">AO Trauma Standards</h3>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              Every bone, joint and spine correction at Amulya is managed using Swiss AO-standard diagnostics and implants under sterile laminar flow theatres.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>Cashless TPA Approved</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 2-COLUMN LAYOUT CONSOLE (LEFT STICKY SIDEBAR SCROLLSPY) */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 items-start relative">
        
        {/* Sticky Scrollspy Sidebar */}
        <aside className="hidden lg:block sticky top-36 w-60 space-y-5 flex-shrink-0 text-left bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl shadow-xs">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block pb-2 border-b">
            Section Nav
          </span>
          <nav className="flex flex-col space-y-1 text-xs font-bold text-slate-500">
            {sectionsList.map((section) => (
              <button
                key={section.id}
                onClick={() => handleScrollTo(section.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 truncate ${
                  activeSection === section.id
                    ? "bg-[#1E7FC2]/10 text-[#1E7FC2] border-l-4 border-l-[#1E7FC2]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1E7FC2]"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right content viewport */}
        <div className="space-y-24 flex-1">
          
          {/* SECTION 1: CLINICAL OVERVIEW */}
          <div id="overview" className="scroll-mt-36 space-y-6">
            <div className="relative bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[28px] border border-slate-100 dark:border-slate-850 shadow-xs overflow-hidden flex flex-col md:flex-row gap-8 items-start">
              <div className="absolute top-0 left-0 w-2.5 h-full bg-[#1E7FC2]"></div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-[#1E7FC2] flex items-center justify-center flex-shrink-0 shadow-inner">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-4 flex-1">
                <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block -mb-2">Condition overview</span>
                <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white leading-tight">
                  What is {item.name}?
                </h2>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                  {item.description}
                </p>
                {item.benefits && item.benefits.length > 0 && (
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-50 dark:border-slate-850/80">
                    {item.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <CheckCircle className="w-4 h-4 text-[#3FA535] flex-shrink-0" />
                        <span className="truncate">{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: COMMON SYMPTOMS */}
          <div id="symptoms" className="scroll-mt-36 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold text-brand-red tracking-widest block">Symptom checklist</span>
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Common Symptoms</h2>
              <p className="text-xs font-semibold text-slate-400 max-w-xl">Consult our triage team if you suffer from any of these indicators:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {item.symptoms?.map((sym, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[20px] shadow-xs hover:border-[#1E7FC2] transition duration-200">
                  <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-950/20 text-[#D81F26] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-350 leading-relaxed">{sym}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: CAUSES & RISKS */}
          <div id="causes" className="scroll-mt-36 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block">Mechanical & Systemic triggers</span>
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Causes & Risk Factors</h2>
              <p className="text-xs font-semibold text-slate-400 max-w-xl">Primary indicators behind the progression of {item.name}:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {item.causes?.map((cause, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xs">
                  <div className="w-5 h-5 rounded-full bg-red-50 dark:bg-red-950/20 text-[#D81F26] flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                    !
                  </div>
                  <p className="text-[11px] font-bold text-slate-650 dark:text-slate-300 leading-relaxed">{cause}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: DIAGNOSTICS */}
          <div id="diagnosis" className="scroll-mt-36 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block">Clinical screening workflows</span>
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">How We Diagnose It</h2>
              <p className="text-xs font-semibold text-slate-400 max-w-xl">Diagnostic procedures used at Amulya Hospital to verify structural conditions:</p>
            </div>
            
            {/* Timeline style diagnostic step grids */}
            <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 max-w-2xl">
              {item.diagnosis?.map((diag, idx) => (
                <div key={idx} className="relative group">
                  <span className="absolute -left-[45px] top-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-[#1E7FC2] text-[#1E7FC2] flex items-center justify-center font-black text-xs shadow-xs group-hover:bg-[#1E7FC2] group-hover:text-white transition duration-200">
                    0{idx + 1}
                  </span>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-[20px] border border-slate-100 dark:border-slate-850 shadow-xs group-hover:shadow-md transition text-left">
                    <p className="text-[11px] font-bold text-slate-650 dark:text-slate-300 leading-relaxed">{diag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: TREATMENT OPTIONS (TIMELINE COMPARISON) */}
          <div id="treatments" className="scroll-mt-36 space-y-12">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block">Sequence of Intervention</span>
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Treatment Modalities</h2>
              <p className="text-xs font-semibold text-slate-400 max-w-xl">From non-invasive rehab to modular AO-standard surgical reconstructions:</p>
            </div>

            {/* Premium Sequence Strip Diagram */}
            <div className="bg-white dark:bg-slate-900 border p-6 rounded-[22px] shadow-xs text-center space-y-4">
              <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block">Standard Care Progression Pathway</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px] font-extrabold text-slate-500">
                {[
                  { name: "Medicine", desc: "Pain offload" },
                  { name: "Physio", desc: "Restore motion" },
                  { name: "Injection", desc: "Lubrications" },
                  { name: "Surgery", desc: "Reconstruction" },
                  { name: "Rehab", desc: "Strengthening" },
                  { name: "Lifestyle", desc: "Prevention" }
                ].map((progress, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1 relative border">
                    <span className="text-[8px] text-[#1E7FC2] block">Step 0{i + 1}</span>
                    <span className="text-slate-850 dark:text-white block font-black">{progress.name}</span>
                    <span className="text-[8px] text-slate-400 font-normal block">{progress.desc}</span>
                    {i < 5 && <span className="hidden sm:block absolute top-1/2 -translate-y-1/2 -right-1 text-slate-300 z-10 text-xs">➔</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Split cards grid comparing non-surgical and surgical options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Conservative Care */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[28px] border-l-4 border-l-[#1E7FC2] border border-slate-100 dark:border-slate-850 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block mb-1">Conservative</span>
                  <h3 className="text-xl font-serif font-extrabold text-[#0B3C5D] dark:text-white mb-6">Non-Surgical Care Plans</h3>
                  <ul className="space-y-4">
                    {item.treatmentOptions?.nonSurgical.map((option, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-4.5 h-4.5 text-[#1E7FC2] mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-bold text-slate-650 dark:text-slate-350 leading-relaxed">{option}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Surgical Care */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[28px] border-r-4 border-r-[#D81F26] border border-slate-100 dark:border-slate-850 shadow-xs flex flex-col justify-between hover:shadow-md transition relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-50/50 dark:bg-red-950/5 rounded-bl-full flex items-center justify-center">
                  <span className="text-[#D81F26] text-[9px] font-extrabold rotate-45 translate-x-3 -translate-y-3">Surge</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-[#D81F26] tracking-widest block mb-1">Advanced Reconstructive</span>
                  <h3 className="text-xl font-serif font-extrabold text-[#0B3C5D] dark:text-white mb-6">Surgical Procedures</h3>
                  <ul className="space-y-4">
                    {item.treatmentOptions?.surgical.map((option, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-4.5 h-4.5 text-[#D81F26] mt-0.5 flex-shrink-0" />
                        <p className="text-xs font-bold text-slate-650 dark:text-slate-355 leading-relaxed">{option}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 6: RECOVERY TIMELINE */}
          {item.recoveryTimeline && item.recoveryTimeline.length > 0 && (
            <div id="timeline" className="scroll-mt-36 space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-extrabold text-[#3FA535] tracking-widest block">Healing Progression</span>
                <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Recovery Timeline</h2>
                <p className="text-xs font-semibold text-slate-400 max-w-xl">Expected rehabilitation outcomes under dedicated motion therapy:</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {item.recoveryTimeline.map((timeStep, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[22px] border border-slate-100 dark:border-slate-850 shadow-xs relative">
                    <span className="text-[9px] uppercase font-extrabold text-[#3FA535] bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-md mb-3 inline-block">
                      {timeStep.time || `Phase 0${idx + 1}`}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-[#0B3C5D] dark:text-white mb-1.5">{timeStep.milestone || "Healing phase"}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">{timeStep.activity || timeStep.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: TECHNOLOGIES & FACILITIES */}
          <div id="tech" className="scroll-mt-36 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Tech Stack */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block">Swiss AO Standards</span>
                  <h3 className="text-xl md:text-2xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Technologies Used</h3>
                </div>
                <div className="space-y-4">
                  {techStack.map((tech, i) => (
                    <div key={i} className="flex gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[#1E7FC2] flex items-center justify-center flex-shrink-0">
                        <Layers className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-xs text-left">
                        <h4 className="font-bold text-slate-850 dark:text-white">{tech.name}</h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">{tech.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facility setup */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-[#3FA535] tracking-widest block">Diagnostics & Ward Setup</span>
                  <h3 className="text-xl md:text-2xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Hospital Facilities</h3>
                </div>
                <div className="space-y-4">
                  {facilities.map((fac, i) => (
                    <div key={i} className="flex gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/20 text-[#3FA535] flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-xs text-left">
                        <h4 className="font-bold text-slate-850 dark:text-white">{fac.name}</h4>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">{fac.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Insurance Logos strip */}
            <div className="bg-white dark:bg-slate-900 border p-6 rounded-[22px] shadow-xs text-center space-y-4">
              <span className="text-[9px] uppercase font-extrabold text-slate-450 tracking-wider block">Cashless Insurance Partners Accepted</span>
              <div className="flex flex-wrap justify-center gap-3 font-extrabold text-[10px] text-[#0B3C5D] dark:text-white">
                {insurances.map((ins, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 rounded-lg border">
                    {ins}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 8: SPECIALIST SURGEONS */}
          <div id="doctors" className="scroll-mt-36 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block">Outpatient consultation</span>
              <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Available Specialists</h2>
              <p className="text-xs font-semibold text-slate-400 max-w-xl">Consult our UK-trained orthopedic surgeons for detailed joint or spinal assessments:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {finalDocs.map((docItem) => (
                <div key={docItem.id} className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition text-left flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center border">
                        <img
                          src={getImageUrl(`doctor-photo-${docItem.slug || docItem.id}`, docItem.photoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80")}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs truncate">
                        <h4 className="font-bold text-slate-850 dark:text-white truncate">{docItem.name}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{docItem.qualification}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[10px] font-bold text-slate-500">
                      <p>Designation: <span className="text-slate-700 dark:text-slate-350">{docItem.designation || "Senior Surgeon"}</span></p>
                      <p>Experience: <span className="text-slate-700 dark:text-slate-355">{docItem.experienceYears || 15} Years</span></p>
                      <p>Languages: <span className="text-slate-700 dark:text-slate-355">{Array.isArray(docItem.languages) ? docItem.languages.join(", ") : docItem.languages}</span></p>
                    </div>
                  </div>
                  <div className="p-4 border-t bg-slate-50 dark:bg-slate-850/50">
                    <Link
                      to={`/book-appointment?doctorId=${docItem.id}`}
                      className="w-full block text-center bg-[#0B3C5D] hover:bg-[#0B3C5D]/90 text-white font-bold py-2 rounded-lg text-[10px] transition"
                    >
                      Book Consultation Slot
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 9: FAQS */}
          <div id="faqs" className="scroll-mt-36 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-extrabold text-[#1E7FC2] tracking-widest block">Outpatient Info desk</span>
                <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Frequently Asked Questions</h2>
              </div>
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="bg-white dark:bg-slate-900 border rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-[#1E7FC2] text-slate-800 dark:text-white max-w-xs w-full"
              />
            </div>

            {filteredFaqs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No questions match your query.</p>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs hover:border-[#1E7FC2] transition duration-200">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full px-6 py-4.5 text-left flex justify-between items-center text-xs md:text-sm font-bold text-[#0B3C5D] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-[#1E7FC2]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-1 text-xs font-semibold leading-relaxed text-slate-500 dark:text-slate-450 border-t border-slate-50 dark:border-slate-850">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Related adjacent conditions */}
          {item.relatedConditions && item.relatedConditions.length > 0 && (
            <div className="pt-10 border-t border-slate-150/60 dark:border-slate-850 space-y-6">
              <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif">Adjacent Care Guidelines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {item.relatedConditions.map((rel, idx) => (
                  <Link
                    key={idx}
                    to={`/services/orthopaedics/${rel.slug}`}
                    className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-xs hover:border-[#1E7FC2] hover:shadow-md transition block"
                  >
                    <h4 className="font-serif font-bold text-xs text-[#0B3C5D] dark:text-white mb-2 group-hover:text-[#1E7FC2] transition-colors">{rel.name}</h4>
                    <span className="text-[9px] uppercase font-bold text-[#D81F26] group-hover:underline flex items-center gap-0.5">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Sticky Bottom Emergency Desk Widget strip */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-850 py-3.5 px-6 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-4 max-w-7xl mx-auto rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 text-[#D81F26] flex items-center justify-center flex-shrink-0 animate-pulse">
            <Phone className="w-4.5 h-4.5" />
          </div>
          <div className="text-left leading-tight text-xs">
            <span className="font-extrabold text-[#0B3C5D] dark:text-white block">24/7 Casualty Emergency desk</span>
            <span className="text-[10px] text-slate-400 font-semibold">Immediate critical care triage support</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`tel:${emergencyPhone}`}
            className="bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold py-2.5 px-4.5 rounded-xl text-[10px] uppercase tracking-wider transition"
          >
            Call Casualty Wing
          </a>
          <Link
            to="/book-appointment"
            className="border-2 border-[#0B3C5D] text-[#0B3C5D] hover:bg-[#0B3C5D]/5 dark:border-[#E7F3FA] dark:text-[#E7F3FA] font-bold py-2 px-4.5 rounded-xl text-[10px] uppercase tracking-wider transition"
          >
            OPD Booking
          </Link>
        </div>
      </div>

    </div>
  );
}

export default DetailTemplate;
