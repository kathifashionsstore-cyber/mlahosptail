import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertCircle, 
  Phone, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Play
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { db } from "../firebase/config";
import { useApp } from "../context/AppContext";
import { useDoctorPhoto, getDoctorPhoto } from "../hooks/useDoctorPhoto";
import { expandCondition } from "../utils/conditionExpander";
import { extractYouTubeId, getEmbedUrl, getThumbnailUrl } from "../utils/youtube";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Category chips color styling and names based on cluster
const getCategoryChip = (cluster) => {
  switch (cluster) {
    case "bone-health": return "🦴 BONE HEALTH";
    case "joint-pain": return "🦵 JOINT CARE";
    case "spine": return "🩻 SPINE";
    case "trauma": return "🚨 TRAUMA & FRACTURES";
    case "sports": return "🏃 SPORTS MEDICINE";
    case "foot": return "🦶 FOOT & ANKLE";
    case "pediatric": return "👶 PEDIATRIC ORTHO";
    default: return "🩺 GENERAL CARE";
  }
};

// Return emoji for H1 title based on service slug
const getServiceEmoji = (slug = "") => {
  if (slug.includes("osteoporosis")) return "🦴";
  if (slug.includes("arthritis") || slug.includes("joint")) return "🦵";
  if (slug.includes("fracture") || slug.includes("trauma") || slug.includes("injury")) return "🩹";
  if (slug.includes("spine") || slug.includes("back") || slug.includes("spondylosis") || slug.includes("scoliosis") || slug.includes("disc")) return "🩻";
  if (slug.includes("knee")) return "🦵";
  if (slug.includes("hip")) return "🦿";
  if (slug.includes("pediatric") || slug.includes("child")) return "👶";
  if (slug.includes("foot") || slug.includes("ankle") || slug.includes("heel")) return "🦶";
  if (slug.includes("sports") || slug.includes("ligament") || slug.includes("acl") || slug.includes("meniscus")) return "🏃";
  return "🩺";
};

// Return custom bullets for learning points in the video section
const getLearningPoints = (name, slug) => {
  if (slug === "osteoporosis") {
    return [
      "What causes bone density loss",
      "How to identify early warning signs",
      "Modern treatment approaches available",
      "Prevention tips & lifestyle changes",
      "When to seek medical help"
    ];
  } else if (slug === "arthritis-osteoarthritis") {
    return [
      "Understand joint wear and tear causes",
      "Key symptoms like stiffness and joint pain",
      "Non-surgical therapies & surgical joint replacements",
      "Lifestyle modifications & physical therapy support",
      "Effective pain management techniques"
    ];
  } else {
    return [
      `What causes ${name} and related risk factors`,
      `How to spot warning signs & symptoms early`,
      `Our advanced clinical diagnosis process`,
      `Surgical and non-surgical treatment options`,
      `Effective prevention and home-care tips`
    ];
  }
};

// Quick helper to split lines by dividers (— or -)
const splitLine = (text = "") => {
  const parts = text.split(/(?:\s*[—–-]\s*)/);
  if (parts.length > 1) {
    return { title: parts[0].trim(), desc: parts.slice(1).join(" — ").trim() };
  }
  return { title: text.trim(), desc: "" };
};

export function ServiceDetail() {
  const { slug } = useParams();
  const { services, doctors, getImageUrl, settings, siteImages } = useApp();
  const [rawService, setRawService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Fetch / find service
  useEffect(() => {
    const cachedService = services.find((item) => item.slug === slug);
    if (cachedService) {
      setRawService(cachedService);
      setLoading(false);
      return;
    }

    const fetchService = async () => {
      try {
        const serviceQuery = query(collection(db, "services"), where("slug", "==", slug), limit(1));
        const querySnap = await getDocs(serviceQuery);
        if (!querySnap.empty) {
          setRawService({ id: querySnap.docs[0].id, ...querySnap.docs[0].data() });
        }
      } catch (error) {
        console.error("Failed to load service detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug, services]);

  // Expand service data with fallbacks using expandCondition utility
  const service = useMemo(() => {
    if (!rawService) return null;
    const srvIdx = services.findIndex((s) => s.slug === rawService.slug);
    return expandCondition(rawService, srvIdx >= 0 ? srvIdx : 0, services);
  }, [rawService, services]);

  // Associated doctor lookup (first related doctor, or first doctor in list as fallback)
  const specialistDoctor = useMemo(() => {
    if (!service || !doctors || doctors.length === 0) return null;
    const docId = service.relatedDoctorIds?.[0];
    if (docId) {
      const found = doctors.find((d) => d.id === docId);
      if (found) return found;
    }
    return doctors[0];
  }, [service, doctors]);

  const specialistPhoto = useDoctorPhoto(specialistDoctor);

  // Filter exactly the founder and senior spine consultant in that order
  const orderedDoctors = useMemo(() => {
    if (!doctors || doctors.length === 0) return [];
    const SPECIALIST_DOCTOR_SLUGS = [
      'dr-aravinda-babu',
      'dr-aditya'
    ];
    const serviceDoctors = doctors.filter((d) =>
      SPECIALIST_DOCTOR_SLUGS.includes(d.slug || d.id)
    );
    return SPECIALIST_DOCTOR_SLUGS
      .map((slug) => {
        const d = serviceDoctors.find((doc) => (doc.slug || doc.id) === slug);
        if (!d) return null;
        return {
          ...d,
          opdTiming: d.opdTiming || d.consultationTimings || "10:00 AM – 7:00 PM",
          availableDays: d.availableDays || (Array.isArray(d.consultationDays) ? d.consultationDays.join(", ") : (d.consultationDays || "Mon – Sat"))
        };
      })
      .filter(Boolean);
  }, [doctors]);

  // Related conditions lookup
  const relatedServices = useMemo(() => {
    if (!service || !services) return [];
    
    // First check relatedServiceSlugs
    let slugs = [];
    if (Array.isArray(service.relatedServiceSlugs)) {
      slugs = service.relatedServiceSlugs;
    } else if (typeof service.relatedServiceSlugs === "string") {
      slugs = service.relatedServiceSlugs.split(",").map((s) => s.trim()).filter(Boolean);
    }
    
    if (slugs.length > 0) {
      return services.filter((s) => slugs.includes(s.slug) && s.slug !== service.slug);
    }
    
    // Fallback to relatedConditions array
    if (Array.isArray(service.relatedConditions)) {
      return service.relatedConditions.map((rc) => {
        const rcSlug = typeof rc === "string" ? rc : rc.slug;
        return services.find((s) => s.slug === rcSlug);
      }).filter((s) => s && s.slug !== service.slug);
    }
    
    return [];
  }, [service, services]);

  // Gallery slider images slots (1 to 5)
  const galleryList = useMemo(() => {
    if (!service) return [];
    const list = [];
    for (let i = 1; i <= 5; i++) {
      const url = getImageUrl(`service-gallery-${service.slug}-${i}`, "");
      if (url) {
        list.push({
          url,
          caption: siteImages[`service-gallery-${service.slug}-${i}`]?.caption || `Facility View ${i}`
        });
      }
    }
    return list;
  }, [service, getImageUrl, siteImages]);

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[50vh] bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-[#1E7FC2] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 mt-4 font-bold text-xs uppercase tracking-widest">Loading details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-32 text-center py-20 min-h-[50vh] bg-slate-50 dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-[#0B3C5D] dark:text-slate-100 font-serif">Service Not Found</h2>
        <Link to="/services" className="mt-4 inline-block text-[#1E7FC2] font-bold hover:underline">
          &larr; Back to all services
        </Link>
      </div>
    );
  }

  // Pre-calculations for images and paths
  const fallbackOgImage = getImageUrl(
    "og-default-image",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80"
  );
  const serviceShareImage = getImageUrl(`service-thumb-${service.slug}`, service.thumbnailUrl || fallbackOgImage);
  const heroBgImage = getImageUrl(`service-hero-${service.slug}`, service.heroImageUrl || "");
  const hasHeroImage = !!heroBgImage;

  const emergencyPhone = settings?.phoneNumbers?.find((p) => p.label === "Hospital")?.number || "+91 8647223625";
  const serviceEmoji = getServiceEmoji(service.slug);

  const parsedVideoId = extractYouTubeId(service.videoUrl);
  const isValidVideo = !!parsedVideoId;

  return (
    <>
      <Helmet>
        <title>{service.seoTitle || service.metaTitle || `${service.name} Treatment | ${settings?.hospitalName || "Amulya Hospital"}`}</title>
        <meta name="description" content={service.seoDescription || service.metaDescription || service.shortDescription || service.description} />
        {service.seoKeywords && <meta name="keywords" content={service.seoKeywords} />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={service.seoTitle || service.name} />
        <meta property="og:description" content={service.seoDescription || service.shortDescription} />
        <meta property="og:image" content={serviceShareImage} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={service.seoTitle || service.name} />
        <meta name="twitter:description" content={service.seoDescription || service.shortDescription} />
        <meta name="twitter:image" content={serviceShareImage} />

        <link rel="canonical" href={window.location.href} />

        {/* FAQ Schema */}
        {service.faqs && service.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": service.faqs.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}

        {/* Medical Specialty Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": service.name,
            "description": service.shortDescription || service.description,
            "aspect": ["diagnosis", "treatment", "symptoms", "prevention"],
            "mainContentOfPage": {
              "@type": "WebPageElement",
              "cssSelector": "main"
            },
            "medicalAudience": "Patient"
          })}
        </script>
      </Helmet>

      <main className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 text-left font-sans overflow-hidden">
        
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 1 — HERO BANNER
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section 
          className="relative text-white overflow-hidden" 
          style={{ height: "clamp(320px, 45vw, 480px)" }}
        >
          {/* Background image / overlay */}
          <div className="absolute inset-0 z-0">
            {hasHeroImage ? (
              <img
                src={heroBgImage}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full"
                style={{ background: "linear-gradient(135deg, #0D2137 0%, #1B4F72 50%, #0D2137 100%)" }}
              />
            )}
            <div 
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)"
              }}
            />
          </div>

          {/* Banner Contents */}
          <div className="relative z-10 max-w-[1100px] h-full mx-auto px-6 md:px-8 flex items-center justify-between">
            <div className="max-w-[600px] flex flex-col justify-center h-full pt-16">
              
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-1.5 text-xs text-white/70 font-semibold mb-5 flex-wrap">
                <Link to="/" className="hover:underline hover:text-white">Home</Link>
                <span className="text-[#C0392B] font-bold">›</span>
                <Link to="/services" className="hover:underline hover:text-white">Services</Link>
                <span className="text-[#C0392B] font-bold">›</span>
                <span className="text-white/60">Orthopaedics</span>
                <span className="text-[#C0392B] font-bold">›</span>
                <span className="text-white font-bold">{service.name}</span>
              </nav>

              {/* Category Chip */}
              <div className="mb-4">
                <span className="bg-red-900/30 border border-red-500/50 text-[#FF8A80] text-[11px] tracking-[2px] font-extrabold px-4 py-1.5 rounded-full inline-block">
                  {getCategoryChip(service.cluster)}
                </span>
              </div>

              {/* Service Title */}
              <h1 className="text-[clamp(32px,4.5vw,50px)] font-black text-white leading-[1.1] mb-4 drop-shadow-md">
                {serviceEmoji} {service.name}
              </h1>

              {/* Tagline */}
              <p className="text-sm md:text-base text-white/90 leading-relaxed mb-7 max-w-[485px] font-medium">
                {service.heroHeadline || service.shortDescription}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 items-center">
                <Link
                  to="/book-appointment"
                  className="bg-[#D81F26] hover:bg-[#b3151b] text-white h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center transition-all transform active:scale-95 shadow-md shadow-[#D81F26]/20"
                >
                  📅 Book Appointment
                </Link>
                <a
                  href={`tel:${emergencyPhone}`}
                  className="border border-white/60 hover:bg-white/10 hover:border-white text-white h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center transition"
                >
                  📞 Call OPD
                </a>
              </div>
            </div>

            {/* Quick stats card (desktop only) */}
            <div className="hidden lg:block w-[320px] bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 self-center mt-12 flex-shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏥</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Available at Amulya Hospital</span>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="flex items-center gap-3">
                  <span className="text-xl">⏱️</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {service.availability || "Same-day OPD available"}
                  </span>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="flex items-center gap-3">
                  <span className="text-xl">💊</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {service.treatmentOptions?.surgical?.length > 0 ? "Medical + Surgical options" : "Advanced Conservative Care"}
                  </span>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <div className="pt-2 text-center">
                  <a 
                    href={`tel:${emergencyPhone}`} 
                    className="text-[#C0392B] font-extrabold text-sm hover:underline block"
                  >
                    📞 {emergencyPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 2 — QUICK OVERVIEW STRIP
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-5 shadow-sm relative z-20">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              
              {/* Pill 1 */}
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">🩺</span>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Condition Type</p>
                  <p className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white">
                    {service.cluster === "spine" ? "Spine Care" : service.cluster === "trauma" ? "Fracture & Trauma" : "Bone & Joint"}
                  </p>
                </div>
              </div>

              {/* Pill 2 */}
              <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
                <span className="text-2xl flex-shrink-0">💊</span>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Treatment</p>
                  <p className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white">
                    {service.treatmentOptions?.surgical?.length > 0 ? "Medical + Surgical" : "Conservative Care"}
                  </p>
                </div>
              </div>

              {/* Pill 3 */}
              <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
                <span className="text-2xl flex-shrink-0">⏱️</span>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">OPD Timing</p>
                  <p className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white">10 AM – 7 PM, Mon–Sat</p>
                </div>
              </div>

              {/* Pill 4 */}
              <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
                <span className="text-2xl flex-shrink-0">🏥</span>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Available At</p>
                  <p className="text-xs md:text-sm font-extrabold text-slate-800 dark:text-white truncate">Amulya, Narasaraopet</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 12 — VIDEO SECTION (Upgrade 1)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {isValidVideo && (
          <section className="pt-12 pb-16 md:pb-20 text-white bg-gradient-to-br from-[#0D2137] to-[#1a3a5c] border-t border-slate-850">
            <div className="max-w-[1100px] mx-auto px-6 md:px-8">
              
              {/* Header */}
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-1.5 bg-[#C0392B]/12 text-[#FF8A80] text-[11px] tracking-[2.5px] font-bold uppercase px-4 py-1.5 rounded-full mb-4">
                  🎬 WATCH FIRST
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                  Watch Our Specialist Explain {service.name}
                </h2>
                <p className="text-white/70 text-sm md:text-base font-semibold mt-2">
                  Before reading further — watch our doctor walk you through this condition and treatment in under 5 minutes
                </p>
              </div>

              {/* Video Player Wrapper */}
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                
                {/* Left Column: Embed Player (60%) */}
                <div className="w-full lg:w-[60%] flex items-center justify-center">
                  <div className="w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-700 aspect-[16/9] relative">
                    {!videoLoaded ? (
                      <div 
                        className="relative cursor-pointer w-full h-full group"
                        onClick={() => setVideoLoaded(true)}
                      >
                        <img
                          src={getThumbnailUrl(service.videoUrl)}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition duration-500"
                          alt={`${service.name} video overview`}
                        />
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition hover:bg-black/45">
                          <div className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full bg-red-650 flex items-center justify-center shadow-lg shadow-red-600/50 transition-all duration-300 transform group-hover:scale-110">
                            <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-current ml-1" />
                          </div>
                        </div>
                        {/* Play badge */}
                        <div className="bg-black/70 text-white text-[11px] font-bold px-3.5 py-1.5 rounded absolute bottom-3 right-3">
                          ▶ Play Video
                        </div>
                      </div>
                    ) : (
                      <iframe
                        src={getEmbedUrl(service.videoUrl) + "&autoplay=1"}
                        title={`${service.name} video tutorial`}
                        className="w-full h-full border-none"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>

                {/* Right Column: Info Panel (40%) */}
                <div className="w-full lg:w-[40%] bg-white/7 border border-white/12 rounded-2xl p-6 md:p-8 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="text-base md:text-lg font-bold flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                      📚 What You'll Learn
                    </h3>
                    <div className="space-y-3">
                      {getLearningPoints(service.name, service.slug).map((bullet, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start">
                          <span className="text-emerald-450 font-bold">✓</span>
                          <span className="text-xs text-white/85 font-medium">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-5">
                    {specialistDoctor && (
                      <div className="flex items-center gap-3 mb-5">
                        <img
                          src={specialistPhoto}
                          className="w-10 h-10 rounded-full border border-white/30 object-cover"
                          alt={`Specialist ${specialistDoctor.name}`}
                        />
                        <div>
                          <p className="text-[10px] uppercase text-white/50 tracking-wider font-extrabold">Explained by our specialist</p>
                          <p className="text-xs font-bold">Dr. {specialistDoctor.name}</p>
                          <p className="text-[10px] text-white/70 font-semibold">{specialistDoctor.designation}</p>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/book-appointment"
                      className="bg-[#D81F26] hover:bg-[#b3151b] text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider block text-center transition w-full shadow-md shadow-red-900/35 hover:-translate-y-0.5"
                    >
                      📅 Book a Consultation
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 3 — WHAT IS [CONDITION]? (Overview)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 md:py-20 bg-white dark:bg-slate-950">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              
              {/* Left Column: Text content */}
              <div className="w-full lg:w-[55%] text-left space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[#C0392B]/8 text-[#C0392B] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                    📋 OVERVIEW
                  </span>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-850 dark:text-white leading-tight">
                    What is {service.name}?
                  </h2>
                </div>

                <div className="text-slate-650 dark:text-slate-300 text-sm md:text-[15px] leading-relaxed space-y-4 font-medium">
                  {service.description.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>

                {/* Did You Know fact box */}
                <div className="bg-gradient-to-br from-[#C0392B]/6 to-[#C0392B]/2 border-l-4 border-[#C0392B] rounded-r-2xl p-5 mt-6">
                  <p className="text-xs font-bold text-[#C0392B] uppercase tracking-wider mb-1">💡 Did You Know?</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                    {service.slug === "osteoporosis" 
                      ? "Osteoporosis is often called a 'silent disease' because bone loss occurs silently without any symptoms until a sudden fracture happens."
                      : `Early diagnosis and specialized orthopaedic care for ${service.name.toLowerCase()} can prevent surgical intervention in over 85% of cases.`
                    }
                  </p>
                </div>
              </div>

              {/* Right Column: Image content */}
              <div className="w-full lg:w-[45%] flex flex-col items-center">
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 bg-slate-900 relative flex items-center justify-center">
                  {service.thumbnailUrl ? (
                    <img
                      src={getImageUrl(`service-thumb-${service.slug}`, service.thumbnailUrl)}
                      className="w-full h-full object-cover"
                      alt={`${service.name} clinical thumbnail`}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0D2137] to-[#1B4F72] flex flex-col items-center justify-center text-white">
                      <span className="text-7xl mb-2">{serviceEmoji}</span>
                      <span className="text-xs uppercase tracking-widest font-bold text-white/50">{service.name}</span>
                    </div>
                  )}
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-5 py-3 shadow-md mt-4 w-11/12 text-center">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    🏥 Treated at Amulya Hospital, Narasaraopet
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 4 — TYPES / CLASSIFICATION (Conditional)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {service.types && service.types.length > 0 && (
          <section className="py-16 bg-[#F8FAFF] dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-850">
            <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center">
              <span className="inline-flex items-center gap-1.5 bg-[#1E7FC2]/10 text-[#1E7FC2] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                🔍 CLASSIFICATION
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white mb-10">
                Types of {service.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                {service.types.map((type, idx) => (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-full bg-[#1E7FC2] text-white text-sm font-black flex items-center justify-center mb-4">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-2">
                        {type.name}
                      </h3>
                      <p className="text-xs font-semibold text-slate-450 leading-relaxed">
                        {type.detail || type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 5 — CAUSES & RISK FACTORS
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Left Column: Causes (45%) */}
              <div className="w-full lg:w-[45%] text-left space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                    ⚠️ CAUSES
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white leading-snug">
                    What Causes {service.name}?
                  </h2>
                  <p className="text-slate-450 text-xs font-bold mt-2">
                    Several biological and environmental factors contribute to this condition.
                  </p>
                </div>

                <div className="space-y-4">
                  {service.causes?.slice(0, 6).map((cause, idx) => {
                    const parsed = splitLine(cause);
                    return (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                          ⚠️
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{parsed.title}</p>
                          {parsed.desc && <p className="text-xs font-semibold text-slate-450 mt-0.5">{parsed.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Risk Factors Card (55%) */}
              <div className="w-full lg:w-[55%]">
                <div className="bg-gradient-to-br from-[#1B4F72] to-[#0D2137] rounded-3xl p-8 text-white text-left h-full flex flex-col justify-between shadow-xl">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 mb-6">
                      🎯 Are You at Risk?
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {(service.causes || []).slice(2).map((item, idx) => {
                        const parsed = splitLine(item);
                        return (
                          <span 
                            key={idx}
                            className="bg-white/10 border border-white/20 hover:bg-white/15 text-xs font-medium px-4 py-2 rounded-full transition"
                          >
                            {parsed.title}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-white/15 pt-6 mt-8">
                    <p className="text-xs text-white/75 mb-3 font-semibold">Think you're at risk?</p>
                    <Link
                      to="/book-appointment"
                      className="bg-[#D81F26] hover:bg-[#b3151b] text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider inline-block text-center transition w-full"
                    >
                      📅 Book a Risk Assessment
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 6 — SYMPTOMS
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 md:py-20 bg-[#FFF5F5] dark:bg-red-950/10 border-t border-red-100 dark:border-red-950/20">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center space-y-12">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#C0392B]/10 text-[#C0392B] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                🩺 SYMPTOMS
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">
                Signs & Symptoms to Watch For
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-2 max-w-[600px] mx-auto">
                Don't ignore these warning signs — early diagnosis leads to better outcomes and prevents structural progression.
              </p>
            </div>

            {/* Symptoms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {service.symptoms?.map((symptom, idx) => {
                const parsed = splitLine(symptom);
                // Choose relevant medical emoji
                const emojis = ["😣", "💔", "🩹", "💥", "🩻", "🚨", "⚠️"];
                const symEmoji = emojis[idx % emojis.length];

                return (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-[#FEE2E2] dark:border-red-950/20 border-t-4 border-t-[#C0392B] rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                  >
                    <span className="text-3xl block mb-4">{symEmoji}</span>
                    <h3 className="text-sm font-extrabold text-slate-850 dark:text-white mb-1.5">
                      {parsed.title}
                    </h3>
                    {parsed.desc && (
                      <p className="text-xs font-semibold text-slate-450 leading-relaxed">
                        {parsed.desc}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Alert Banner */}
            <div className="bg-gradient-to-r from-[#C0392B] to-[#E74C3C] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white text-left shadow-lg">
              <div className="flex items-center gap-4">
                <span className="text-3xl md:text-4xl flex-shrink-0">🚨</span>
                <div>
                  <p className="text-base font-extrabold">If you experience 3 or more of these symptoms, consult a specialist immediately</p>
                  <p className="text-xs text-white/80 font-medium mt-0.5">Prompt medical evaluation prevents long-term joint or bone complications.</p>
                </div>
              </div>
              <a
                href={`tel:${emergencyPhone}`}
                className="bg-white hover:bg-slate-100 text-[#C0392B] font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition flex-shrink-0 text-center shadow-md shadow-[#C0392B]/10"
              >
                📞 Call Now
              </a>
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 7 — DIAGNOSIS
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8">
            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* Left Column: Timeline Steps (60%) */}
              <div className="w-full lg:w-[60%] text-left space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 bg-[#C0392B]/8 text-[#C0392B] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                    🧪 DIAGNOSIS
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">
                    How We Diagnose It
                  </h2>
                </div>

                {/* Vertical timeline */}
                <div className="relative pl-8 border-l-2 border-dashed border-red-500/50 space-y-8 mt-6">
                  {service.diagnosis?.map((diag, idx) => {
                    const parsed = splitLine(diag);
                    return (
                      <div key={idx} className="relative">
                        {/* Circle node */}
                        <div className="absolute -left-[49px] top-0.5 w-8 h-8 rounded-full bg-[#C0392B] text-white text-xs font-black flex items-center justify-center border-4 border-white dark:border-slate-950">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-850 dark:text-white leading-tight">
                            {parsed.title}
                          </h3>
                          {parsed.desc && (
                            <p className="text-xs font-semibold text-slate-450 mt-1 leading-relaxed">
                              {parsed.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Expect Card (40%) */}
              <div className="w-full lg:w-[40%]">
                <div className="bg-[#F0FDF4] dark:bg-emerald-950/10 border border-[#BBF7D0] dark:border-emerald-900/50 rounded-2xl p-6 md:p-8 text-left space-y-6">
                  <h3 className="text-base md:text-lg font-bold text-[#14532D] dark:text-emerald-400 flex items-center gap-2">
                    ✅ What to Expect at Your Visit
                  </h3>

                  <div className="space-y-4">
                    {[
                      "Register at OPD counter",
                      "Initial consultation with our specialist",
                      "Required diagnostic tests ordered",
                      "Results review + diagnosis confirmation",
                      "Personalized treatment plan discussion"
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{step}</span>
                      </div>
                    ))}
                  </div>

                  <hr className="border-[#BBF7D0] dark:border-emerald-900/50" />
                  
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#166534] dark:text-emerald-400">
                    <span>⏱️</span>
                    <span>Typical first visit: 45–60 minutes</span>
                  </div>

                  <Link
                    to="/book-appointment"
                    className="bg-[#16A34A] hover:bg-[#166534] text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider block text-center transition w-full shadow-md"
                  >
                    📅 Book OPD Appointment
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 8 — TREATMENT OPTIONS
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 md:py-20 bg-[#F8FAFF] dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-850">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center space-y-12">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#1E7FC2]/10 text-[#1E7FC2] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                💉 TREATMENT
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">
                Treatment Options at Amulya Hospital
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-2 max-w-[600px] mx-auto">
                We offer a staged approach — the least invasive effective treatment is always recommended first before considering surgical options.
              </p>
            </div>

            {/* Treatment Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              
              {/* Column 1: Non-Surgical */}
              <div className="flex flex-col">
                <div className="bg-gradient-to-br from-[#0D2137] to-[#1B4F72] text-white px-6 py-4 rounded-t-2xl font-bold flex items-center gap-2">
                  <span>🩹</span>
                  <span>Non-Surgical Options</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-t-0 rounded-b-2xl p-6 flex-grow space-y-4 shadow-sm">
                  {service.treatmentOptions?.nonSurgical?.map((item, idx) => {
                    const parsed = splitLine(item);
                    return (
                      <div key={idx} className="flex gap-3 items-start py-2 border-b border-slate-50 dark:border-slate-850 last:border-b-0">
                        <span className="text-lg">💊</span>
                        <div>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white">{parsed.title}</p>
                          {parsed.desc && <p className="text-xs font-semibold text-slate-400 mt-0.5">{parsed.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Surgical */}
              <div className="flex flex-col">
                <div className="bg-gradient-to-br from-[#C0392B] to-[#E74C3C] text-white px-6 py-4 rounded-t-2xl font-bold flex items-center gap-2">
                  <span>🔬</span>
                  <span>Surgical Options</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 border-t-0 rounded-b-2xl p-6 flex-grow flex flex-col justify-between shadow-sm">
                  <div className="space-y-4">
                    {service.treatmentOptions?.surgical && service.treatmentOptions.surgical.length > 0 ? (
                      service.treatmentOptions.surgical.map((item, idx) => {
                        const parsed = splitLine(item);
                        return (
                          <div key={idx} className="flex gap-3 items-start py-2 border-b border-slate-50 dark:border-slate-850 last:border-b-0">
                            <span className="text-lg">🔬</span>
                            <div>
                              <p className="text-sm font-extrabold text-slate-800 dark:text-white">{parsed.title}</p>
                              {parsed.desc && <p className="text-xs font-semibold text-slate-400 mt-0.5">{parsed.desc}</p>}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs font-bold text-slate-450 italic py-6 text-center">
                        Surgical intervention is rarely indicated for this condition.
                      </p>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] text-slate-400 italic">
                      ⚕️ Surgery is only recommended when conservative treatment has been tried and is no longer sufficient to restore function or control pain.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 9 — WHY CHOOSE AMULYA HOSPITAL
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section 
          className="py-16 md:py-20 text-white"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1B4F72 100%)" }}
        >
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center space-y-12">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                🏆 WHY US
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">Why Choose Amulya Hospital?</h2>
              <p className="text-white/70 text-xs font-medium mt-2 max-w-[600px] mx-auto">
                Decades of medical leadership, high success rates, and patient-centered skeletal and joint restoration.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { emoji: "🏅", title: "33+ Years of Excellence", desc: "Over three decades serving Narasaraopet and Palnadu district" },
                { emoji: "👨‍⚕️", title: "Specialist Surgeons", desc: "MS Ortho surgeons with subspecialty training" },
                { emoji: "🔬", title: "Swiss AO Standard", desc: "International fracture fixation protocols" },
                { emoji: "🚑", title: "24/7 Emergency Care", desc: "Round-the-clock trauma and casualty services" },
                { emoji: "🏥", title: "Advanced OT Facilities", desc: "Modular operation theatres with laminar airflow" },
                { emoji: "💊", title: "In-House Pharmacy & Lab", desc: "Round-the-clock diagnostic and pharmaceutical services" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white/8 border border-white/15 rounded-2xl p-6 md:p-8 hover:bg-white/14 transition duration-200"
                >
                  <span className="text-4xl block mb-4">{item.emoji}</span>
                  <h3 className="text-base font-extrabold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-white/70 leading-relaxed font-semibold">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div className="pt-10 border-t border-white/10 mt-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl md:text-4xl font-black text-[#FFD700]">5000+</p>
                  <p className="text-[10px] text-white/60 tracking-wider font-extrabold uppercase mt-1">Surgeries Performed</p>
                </div>
                <div className="border-l border-white/10 pl-2">
                  <p className="text-3xl md:text-4xl font-black text-[#FFD700]">33+</p>
                  <p className="text-[10px] text-white/60 tracking-wider font-extrabold uppercase mt-1">Years Experience</p>
                </div>
                <div className="border-l border-white/10 pl-2">
                  <p className="text-3xl md:text-4xl font-black text-[#FFD700]">4.9★</p>
                  <p className="text-[10px] text-white/60 tracking-wider font-extrabold uppercase mt-1">Patient Rating</p>
                </div>
                <div className="border-l border-white/10 pl-2">
                  <p className="text-3xl md:text-4xl font-black text-[#FFD700]">24/7</p>
                  <p className="text-[10px] text-white/60 tracking-wider font-extrabold uppercase mt-1">Emergency Care</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 10 — PREVENTION & SELF-CARE
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 md:py-20 bg-[#F0FDF4] dark:bg-emerald-950/10 border-t border-emerald-100 dark:border-emerald-950/20">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center space-y-12">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                🛡️ PREVENTION
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">
                Prevention & Self-Care Tips
              </h2>
            </div>

            {/* Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {service.prevention?.map((tip, idx) => {
                const parsed = splitLine(tip);
                return (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-900 border-l-4 border-l-[#16A34A] rounded-r-xl p-5 shadow-xs flex gap-4 items-start"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-850 dark:text-white">
                        {parsed.title}
                      </h3>
                      {parsed.desc && (
                        <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
                          {parsed.desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 11 — WHEN TO SEE A DOCTOR
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8">
            <div className="max-w-[900px] mx-auto bg-gradient-to-br from-[#FFF5F5] to-[#FEF2F2] dark:from-red-950/10 dark:to-red-950/5 border-2 border-[#FECACA] dark:border-red-900/30 rounded-3xl p-8 md:p-10 shadow-sm text-left space-y-6">
              
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚩</span>
                <h3 className="text-xl md:text-2xl font-black text-[#991B1B] dark:text-red-400">
                  When to See a Doctor Immediately
                </h3>
              </div>

              {/* Warning signs 2-col list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-red-200/50 dark:border-red-900/30 pb-6">
                {service.whenToSeeDoctor?.map((sign, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-650 flex-shrink-0 mt-1.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-350 font-semibold">{sign}</span>
                  </div>
                ))}
              </div>

              {/* Bottom strip */}
              <div className="bg-[#C0392B] rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
                <p className="text-sm font-bold text-center sm:text-left">
                  Don't wait — early treatment leads to better outcomes 🏥
                </p>
                <Link
                  to="/book-appointment"
                  className="bg-white hover:bg-slate-100 text-[#C0392B] font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-lg transition text-center flex-shrink-0 shadow-md"
                >
                  📞 Book Appointment Now
                </Link>
              </div>

            </div>
          </div>
        </section>



        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 13 — PHOTO GALLERY SLIDER
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 bg-[#F8FAFF] dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-850 relative">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center space-y-12">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-[#1E7FC2]/10 text-[#1E7FC2] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                📸 GALLERY
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">
                Inside Our Facility
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-2">
                Our state-of-the-art infrastructure configured for patient hygiene and orthopaedic rehabilitation.
              </p>
            </div>

            {/* Carousel Slider */}
            <div>
              {galleryList.length > 0 ? (
                <Swiper
                  modules={[Autoplay, Pagination, Navigation]}
                  spaceBetween={16}
                  slidesPerView={1.2}
                  loop={true}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  navigation={true}
                  breakpoints={{
                    640: { slidesPerView: 2.3 },
                    1024: { slidesPerView: 3 }
                  }}
                  className="pb-12"
                >
                  {galleryList.map((img, idx) => (
                    <SwiperSlide key={idx} className="rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-100 dark:border-slate-800 relative shadow-sm group">
                      <img
                        src={img.url}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        alt={img.caption}
                        loading="lazy"
                      />
                      {/* Caption overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-10 text-left">
                        <p className="text-white text-xs font-bold">{img.caption}</p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                /* Fallback slideshow placeholders */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {[
                    { title: "Modular OT Wing", desc: "Zero-bacteria laminar airflow layout." },
                    { title: "Surgical Recovery ICU", desc: "Post-operative vital monitoring units." },
                    { title: "Physio & Rehab Wing", desc: "Post-surgical joint motion training labs." }
                  ].map((p, idx) => (
                    <div 
                      key={idx} 
                      className="rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br from-[#0D2137] to-[#1B4F72] p-6 text-white flex flex-col justify-end text-left shadow-sm border border-slate-800"
                    >
                      <h3 className="text-sm font-bold">{p.title}</h3>
                      <p className="text-[10px] text-white/70 font-semibold mt-1">{p.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 14 — MEET THE SPECIALIST
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {orderedDoctors.length > 0 && (
          <section className="py-16 md:py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
            <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center space-y-12">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-[#0284C7]/10 text-[#0284C7] text-[11px] tracking-[2px] font-bold uppercase px-4 py-1.5 rounded-full mb-4">
                  👨‍⚕️ OUR SPECIALISTS
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">Meet Our Doctors</h2>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[860px] mx-auto">
                {orderedDoctors.map((doctor) => {
                  const doctorPhoto = getDoctorPhoto(doctor, null, siteImages);
                  return (
                    <div 
                      key={doctor.id}
                      className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] dark:from-sky-950/20 dark:to-sky-950/5 border border-[#BAE6FD] dark:border-sky-900/30 rounded-[20px] p-7 text-center shadow-lg shadow-[#0ea5e9]/10 flex flex-col items-center"
                    >
                      {/* Doctor Photo */}
                      <img
                        src={doctorPhoto}
                        alt={doctor.name}
                        className="w-[110px] h-[110px] rounded-full border-4 border-white dark:border-slate-900 shadow-md object-cover mb-3.5"
                      />

                      {/* Role Label */}
                      <span className="text-[11px] tracking-[2px] font-bold text-[#0284C7] uppercase mb-1.5">
                        {doctor.designation}
                      </span>

                      {/* Name */}
                      <h3 className="text-[19px] font-extrabold text-[#0C4A6E] dark:text-sky-300 mb-1.5">
                        {doctor.name}
                      </h3>

                      {/* Qualification */}
                      <p className="text-sm text-[#0369A1] dark:text-sky-450 mb-3.5">
                        {doctor.qualification}
                      </p>

                      {/* Specialty Pills (wrap) */}
                      <div className="flex flex-wrap justify-center gap-1 mb-4">
                        {(Array.isArray(doctor.specialization) ? doctor.specialization : []).map((spec, idx) => (
                          <span 
                            key={idx}
                            className="bg-[#E0F2FE] text-[#0369A1] dark:bg-sky-900/35 dark:text-sky-300 px-3 py-1 rounded-full text-xs font-semibold m-[3px]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>

                      {/* OPD timing row */}
                      <div className="text-[13px] text-[#0C4A6E] dark:text-sky-300 font-semibold mt-3">
                        ⏰ {doctor.opdTiming} &nbsp;&nbsp; 📅 {doctor.availableDays}
                      </div>

                      {/* Two Buttons */}
                      <div className="flex gap-2.5 mt-4 w-full">
                        <Link
                          to={`/doctors/${doctor.slug || doctor.id}`}
                          className="border-[1.5px] border-[#0284C7] hover:bg-[#0284C7]/10 text-[#0284C7] rounded-lg py-[9px] px-[16px] text-[13px] font-semibold text-center transition flex-1"
                        >
                          👤 View Profile
                        </Link>
                        <Link
                          to={`/book-appointment?doctorId=${doctor.id}`}
                          className="bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg py-[9px] px-[16px] text-[13px] font-semibold text-center transition flex-1 shadow-md shadow-[#0284C7]/15"
                        >
                          📅 Book Appointment
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 15 — FAQs
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {service.faqs && service.faqs.length > 0 && (
          <section className="py-16 md:py-20 bg-[#F8FAFF] dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-850">
            <div className="max-w-[800px] mx-auto px-6 md:px-8 text-center space-y-12">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-[#1E7FC2]/10 text-[#1E7FC2] text-[11px] tracking-[2px] font-black uppercase px-4 py-1.5 rounded-full mb-4">
                  ❓ FAQS
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white">Frequently Asked Questions</h2>
              </div>

              {/* Accordion container */}
              <div className="space-y-3.5 text-left">
                {service.faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs transition"
                    >
                      {/* Trigger row */}
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full px-5 py-4.5 flex justify-between items-center text-slate-800 dark:text-white font-serif hover:bg-slate-50 dark:hover:bg-slate-850 transition text-left"
                      >
                        <span className="text-sm md:text-base font-extrabold pr-4">❓ {faq.question}</span>
                        <ChevronDown 
                          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#C0392B]" : ""}`} 
                        />
                      </button>

                      {/* Content panel */}
                      <div 
                        className={`transition-all duration-350 ease-out overflow-hidden`}
                        style={{
                          maxHeight: isOpen ? "400px" : "0",
                          borderTop: isOpen ? "1px solid #F3F4F6" : "none"
                        }}
                      >
                        <div className="p-5 text-xs md:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 16 — FINAL CTA BLOCK
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-16 md:py-20 text-white bg-gradient-to-br from-[#C0392B] to-[#922B21]">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 text-center space-y-12">
            <div className="space-y-4">
              <span className="text-5xl block">🏥</span>
              <h2 className="text-3xl md:text-4xl font-black">Ready to Get the Right Treatment?</h2>
              <p className="text-white/85 text-sm md:text-base font-medium max-w-[620px] mx-auto">
                Book an appointment with our specialists today. OPD is available Monday to Saturday, from 10 AM to 7 PM.
              </p>
            </div>

            {/* Action Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-slate-800">
              
              {/* Card 1 */}
              <div className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md">
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-3">📅</span>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Book Appointment</h4>
                  <p className="text-xs text-slate-400 font-semibold mb-6">Quick & easy online booking</p>
                </div>
                <Link
                  to="/book-appointment"
                  className="bg-[#0D2137] hover:bg-[#1B4F72] text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider block text-center w-full transition shadow-sm"
                >
                  Book Online Now
                </Link>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md">
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-3">📞</span>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Call Us</h4>
                  <p className="text-lg font-black text-[#C0392B] dark:text-red-400 mb-1 leading-none">{emergencyPhone}</p>
                  <p className="text-[10px] text-slate-450 font-black uppercase tracking-widest mb-6">OPD: Mon–Sat, 10AM–7PM</p>
                </div>
                <a
                  href={`tel:${emergencyPhone}`}
                  className="bg-[#D81F26] hover:bg-[#b3151b] text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider block text-center w-full transition shadow-sm"
                >
                  Call Now
                </a>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-slate-900 dark:text-slate-100 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-md">
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-3">📍</span>
                  <h4 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider mb-1">Visit Us</h4>
                  <p className="text-xs text-slate-550 font-semibold mb-6">Guntur Road, Narasaraopet</p>
                </div>
                <a
                  href="https://maps.app.goo.gl/r6v9b2GZJjL4238e7"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-100 hover:bg-slate-200 text-[#0D2137] dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider block text-center w-full transition"
                >
                  Get Directions
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SECTION 17 — RELATED CONDITIONS
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {relatedServices.length > 0 && (
          <section className="py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
            <div className="max-w-[1100px] mx-auto px-6 md:px-8 space-y-6 text-left">
              <div>
                <span className="inline-flex items-center gap-1.5 bg-[#C0392B]/8 text-[#C0392B] text-[11px] tracking-[2.5px] font-black uppercase px-4 py-1.5 rounded-full mb-3">
                  🔗 RELATED
                </span>
                <h3 className="text-xl font-bold text-slate-850 dark:text-white">Related Conditions</h3>
              </div>

              {/* Horizontal scroll strip */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {relatedServices.map((rel, idx) => {
                  const relEmoji = getServiceEmoji(rel.slug);
                  return (
                    <Link
                      key={idx}
                      to={`/services/orthopaedics/${rel.slug}`}
                      className="bg-[#F8FAFF] dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 min-w-[220px] transition duration-200 hover:border-[#C0392B] hover:shadow-md"
                    >
                      <span className="text-3xl block mb-2">{relEmoji}</span>
                      <p className="text-sm font-extrabold text-slate-850 dark:text-white truncate">
                        {rel.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-[#C0392B] font-bold mt-2">
                        <span>Learn More</span>
                        <span>➔</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </main>
    </>
  );
}

export default ServiceDetail;
