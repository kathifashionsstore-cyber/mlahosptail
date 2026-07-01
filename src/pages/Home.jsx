import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarCheck, Clock, Phone, Star, Users, Award } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getDoctorPhoto } from "../hooks/useDoctorPhoto";
import { db } from "../firebase/config";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { fetchApprovedReviews } from "../utils/reviews";
import HeroSlider from "../components/home/HeroSlider";
import { buildSeedPlan } from "../firebase/seedDataHelpers";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const growthData = [
  { year: "2022", Patients: 4200, Doctors: 4, Departments: 4, SuccessRate: 91 },
  { year: "2023", Patients: 5800, Doctors: 5, Departments: 5, SuccessRate: 93 },
  { year: "2024", Patients: 7100, Doctors: 6, Departments: 6, SuccessRate: 95 },
  { year: "2025", Patients: 8900, Doctors: 7, Departments: 7, SuccessRate: 97 },
  { year: "2026", Patients: 10000, Doctors: 7, Departments: 8, SuccessRate: 99 }
];

const performanceData = [
  { subject: "Recovery Rate", value: 96, fullMark: 100 },
  { subject: "Patient Satisfaction", value: 98, fullMark: 100 },
  { subject: "Emergency Response", value: 95, fullMark: 100 },
  { subject: "Appointments Success", value: 92, fullMark: 100 },
  { subject: "Surgical Outcomes", value: 99, fullMark: 100 }
];

const fallbackHomePlan = buildSeedPlan();
const getFallbackHomeCollection = (collectionName) =>
  fallbackHomePlan.collections.find((item) => item.collectionName === collectionName)?.data || [];

// CountUp Component for animated statistics
function CountUp({ value, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;

    let totalDuration = 1500;
    let incrementTime = Math.abs(Math.floor(totalDuration / end));
    incrementTime = Math.max(incrementTime, 10);

    const timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-extrabold text-[#D81F26]">
      {count}
      {suffix}
    </span>
  );
}

export function Home() {
  const { doctors, insurance, settings, services, siteImages, getImageUrl } = useApp();
  const [statistics, setStatistics] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const statsQuery = query(collection(db, "statistics"), where("isActive", "==", true), orderBy("order", "asc"));
    let cancelled = false;

    const unsubscribeStats = onSnapshot(
      statsQuery,
      (snapshot) => {
        setStatistics(snapshot.empty ? getFallbackHomeCollection("statistics") : snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => {
        console.error("Error loading homepage statistics:", err);
        setStatistics(getFallbackHomeCollection("statistics"));
      }
    );

    fetchApprovedReviews(db, getFallbackHomeCollection("testimonials"))
      .then((approvedReviews) => {
        if (!cancelled) setTestimonials(approvedReviews.slice(0, 5));
      })
      .catch((err) => {
        console.error("Error loading homepage testimonials:", err);
        if (!cancelled) setTestimonials(getFallbackHomeCollection("testimonials").slice(0, 5));
      });

    return () => {
      cancelled = true;
      unsubscribeStats();
    };
  }, []);

  const featuredDoctors = doctors
    .filter((d) => d.isFeaturedOnHome)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .slice(0, 2);

  // Testimonials rotation
  const [testIndex, setTestIndex] = useState(0);
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setTestIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [testimonials]);

  const primaryPhone = settings?.phoneNumbers?.[0]?.number || "+918647223625";
  const homeAboutImage = getImageUrl(
    "home-about-thumbnail",
    "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=700&q=80"
  );
  const homeStatsBg = getImageUrl("home-stats-bg", "");
  const homeServicesBg = getImageUrl("home-services-bg", "");
  const homeCtaImage = getImageUrl(
    "home-cta-bg",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80"
  );

  return (
    <div className="overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <Helmet>
        <title>{settings?.hospitalName || "Amulya Nursing Home"} | Spine, Joint & Trauma Care</title>
        <meta
          name="description"
          content={settings?.tagline ? `${settings.hospitalName} - ${settings.tagline}. Located at ${settings.address || 'Narasaraopet, Palnadu District'}.` : `${settings?.hospitalName || "Amulya Nursing Home"} provides orthopaedic, spine, joint, trauma, emergency, and rehabilitation care in Narasaraopet.`}
        />
        <meta name="keywords" content="hospital in narasaraopet, orthopaedic hospital near me, spine specialist near me, joint replacement hospital, trauma care 24/7, amulya nursing home, best hospital in narasaraopet, palnadu hospital, nearby hospital" />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${settings?.hospitalName || "Amulya Nursing Home"} | Spine, Joint & Trauma Care`} />
        <meta property="og:description" content={`${settings?.hospitalName || "Amulya Nursing Home"} provides orthopaedic, spine, joint, trauma, emergency, and rehabilitation care in Narasaraopet.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:image" content={settings?.logoUrl || `${window.location.origin}/logo.png`} />

        {/* Structured Data: Local Business / Hospital */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Hospital",
            "@id": `${window.location.origin}/#hospital`,
            "name": settings?.hospitalName || "Amulya Nursing Home",
            "alternateName": ["Amulya Hospital", "Amulya Orthopaedic Hospital", "Amulya Spine & Joint Replacement Center"],
            "description": settings?.tagline || "Center for Trauma, Spine, Polio & Joint Replacements",
            "url": window.location.origin,
            "logo": settings?.logoUrl || `${window.location.origin}/logo.png`,
            "image": settings?.logoUrl || `${window.location.origin}/logo.png`,
            "telephone": settings?.phoneNumbers?.[0]?.number || "+918647223625",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": settings?.address || "30/13, 18-1, Guntur Rd, Panasathota, Barampet",
              "addressLocality": "Narasaraopeta",
              "addressRegion": "Andhra Pradesh",
              "postalCode": "522601",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "16.235700",
              "longitude": "80.046711"
            },
            "hasMap": settings?.mapEmbedUrl || "https://maps.google.com/?q=Amulya+Nursing+Home+Narasaraopet",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "10:00",
              "closes": "19:00"
            },
            "emergencyService": true,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": settings?.phoneNumbers?.[0]?.number || "+918647223625",
              "contactType": "emergency",
              "availableLanguage": ["English", "Telugu", "Hindi"]
            },
            "medicalSpecialty": [
              "Orthopedics",
              "EmergencyMedicine",
              "PhysicalTherapy"
            ]
          })}
        </script>
      </Helmet>

      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Overlapping Quick Cards */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 md:px-8 -mt-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 shadow-[0_20px_45px_rgba(11,60,93,0.14)] border border-slate-100 dark:border-slate-800 flex items-start space-x-4 transform hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#E7F3FA] dark:bg-blue-950/40 text-[#1E7FC2] flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[#0B3C5D] dark:text-white font-bold text-base font-serif">Best Doctors</h3>
              <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
                Consult with our UK-trained surgeons and expert trauma teams.
              </p>
              <Link to="/doctors" className="text-xs font-bold text-[#1E7FC2] hover:underline inline-flex items-center space-x-0.5">
                <span>Meet Surgeons</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 shadow-[0_20px_45px_rgba(11,60,93,0.14)] border border-slate-100 dark:border-slate-800 flex items-start space-x-4 transform hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#FDECEC] dark:bg-red-950/20 text-[#D81F26] flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[#0B3C5D] dark:text-white font-bold text-base font-serif">Our Hospital</h3>
              <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
                Over 33 years of clinical history restoring mobility and correcting polio.
              </p>
              <Link to="/about" className="text-xs font-bold text-[#D81F26] hover:underline inline-flex items-center space-x-0.5">
                <span>Our Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 shadow-[0_20px_45px_rgba(11,60,93,0.14)] border border-slate-100 dark:border-slate-800 flex items-start space-x-4 transform hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[#E7F3FA] dark:bg-blue-950/40 text-[#1E7FC2] flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[#0B3C5D] dark:text-white font-bold text-base font-serif">Call for Enquiry</h3>
              <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
                Contact our active OPD and trauma reception lines directly.
              </p>
              <a href={`tel:${primaryPhone}`} className="text-xs font-bold text-[#1E7FC2] hover:underline">
                Call: {primaryPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Section */}
      <section
        className="py-20 px-6 md:px-12 bg-[#0B3C5D] text-white bg-cover bg-center"
        style={homeStatsBg ? { backgroundImage: `linear-gradient(rgba(11, 60, 93, 0.88), rgba(11, 60, 93, 0.88)), url(${homeStatsBg})` } : undefined}
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[13px] tracking-[1.5px] font-bold text-[#D81F26] uppercase block">Hospital Stats</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif">Legacy in Numbers</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-semibold">
              Serving the Palnadu district with trusted clinical excellence and critical care.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {statistics.map((stat) => (
              <div key={stat.id} className="space-y-2.5 bg-slate-900/10 p-6 rounded-2xl border border-white/5 shadow-inner">
                <CountUp value={stat.value} suffix={stat.suffix} />
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest block">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3b. Hospital Growth & Performance Benchmarks */}
      <section className="py-20 px-6 md:px-12 bg-slate-50/50 dark:bg-slate-900/10 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[13px] tracking-[1.5px] font-bold text-[#D81F26] uppercase block">Performance Metrics</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0B3C5D] dark:text-white">Growth & Quality Benchmarks</h2>
            <p className="text-sm text-[#5C6E7A] dark:text-slate-400 leading-relaxed font-semibold">
              Transparent reporting of our operational growth and clinical success rates over recent years.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Graph 1: Hospital Growth Statistics (Area Chart) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-[26px] shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif">Hospital Growth Statistics</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Multi-Year Scale of Facilities & Success Rate</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E7FC2" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1E7FC2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3FA535" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3FA535" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0F293A", borderRadius: "16px", border: "none", color: "#fff" }} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
                    <Area type="monotone" dataKey="Patients" stroke="#1E7FC2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPatients)" name="Total Patients" />
                    <Area type="monotone" dataKey="SuccessRate" stroke="#3FA535" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSuccess)" name="Success Rate (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Graph 2: Hospital Performance (Radar Chart) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-[26px] shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif">Clinical Performance Metrics</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quality benchmarks & Response Rates</p>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" radius="70%" data={performanceData}>
                    <PolarGrid stroke="rgba(148, 163, 184, 0.15)" />
                    <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} tick={{ fontWeight: "bold" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={9} />
                    <Radar name="Performance" dataKey="value" stroke="#D81F26" fill="#D81F26" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ backgroundColor: "#0F293A", borderRadius: "16px", border: "none", color: "#fff" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. About Preview Section */}
      <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16 items-center">
          {/* Left Column: Image with Blobs */}
          <div className="relative w-full max-w-md mx-auto lg:mx-0">
            <div className="absolute -inset-4 bg-[#1E7FC2]/8 rounded-[50%_30%_70%_40%/_50%_60%_30%_60%] pointer-events-none scale-105 z-0 blur-sm" />
            <img
              src={homeAboutImage}
              alt="Hospital Facility"
              className="w-full relative z-10 aspect-[4/3] rounded-[26px] object-cover border-4 border-slate-50 dark:border-slate-900 shadow-md"
            />
          </div>

          {/* Right Column: Info */}
          <div className="space-y-6">
            <span className="text-[13px] tracking-[1.5px] font-bold text-[#D81F26] uppercase block">About {settings?.hospitalName || "Amulya Nursing Home"}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B3C5D] dark:text-white font-serif leading-tight">
              33 Years of Dedicated Clinical Restoration
            </h2>
            <p className="text-sm text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
              Established in 1992 by gold-medalist chief surgeon Dr. Chadalavada Aravinda Babu, our nursing home is an anchor of trauma and orthopaedic care. We believe in high-ethics patient triage, modern surgical interventions, and post-op rehabilitation programs.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-350 font-bold">
                <span className="w-5 h-5 rounded-full bg-[#FDECEC] text-[#D81F26] flex items-center justify-center text-[10px]">✓</span>
                <span>Modular clean operating theater complexes</span>
              </li>
              <li className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-350 font-bold">
                <span className="w-5 h-5 rounded-full bg-[#FDECEC] text-[#D81F26] flex items-center justify-center text-[10px]">✓</span>
                <span>Government approved Arogyasri & cashless services</span>
              </li>
              <li className="flex items-center space-x-2.5 text-xs text-slate-700 dark:text-slate-350 font-bold">
                <span className="w-5 h-5 rounded-full bg-[#FDECEC] text-[#D81F26] flex items-center justify-center text-[10px]">✓</span>
                <span>Advanced rehabilitation gym mobilizations</span>
              </li>
            </ul>
            <Link
              to="/about"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#D81F26] hover:underline"
            >
              <span>Explore Our Full Heritage</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Doctors Preview Section */}
      <section className="py-20 px-6 md:px-12 bg-[#F4F9FC] dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-850 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[13px] tracking-[1.5px] font-bold text-[#D81F26] uppercase block">Surgical Leaders</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B3C5D] dark:text-white font-serif">Senior Surgeons</h2>
            <p className="text-sm text-[#5C6E7A] dark:text-slate-400 font-semibold">
              Our clinical leaders specialize in complex joint arthroplasties and spine instrumentations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {featuredDoctors.map((docItem, idx) => (
              <motion.article
                key={docItem.id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.25 }}
                className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#1E7FC2] via-[#24B37A] to-[#0B3C5D] p-[1.5px] shadow-[0_24px_70px_rgba(11,60,93,0.16)]"
              >
                <div className="relative h-full overflow-hidden rounded-[25px] bg-white/90 p-5 backdrop-blur-xl dark:bg-slate-900/90 md:p-6">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,127,194,0.08),rgba(36,179,122,0.08)_46%,transparent_72%)]" />

                  <div className="relative grid gap-5 md:grid-cols-[190px_1fr] md:items-center">
                    <div className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#E7F3FA] to-[#EAFBF0] shadow-[0_18px_44px_rgba(15,76,129,0.14)] md:mx-0">
                      <div className="aspect-[4/5]">
                        <img
                          src={getDoctorPhoto(docItem, idx + 1, siteImages)}
                          alt={docItem.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0B3C5D] shadow-md backdrop-blur-md">
                        {Number(docItem.experienceYears || 0)}+ yrs
                      </div>
                    </div>

                    <div className="relative space-y-4 text-center md:text-left">
                      <div className="space-y-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAFBF0] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#147A45] dark:bg-emerald-950/30 dark:text-emerald-300">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          Featured Doctor
                        </span>
                        <h3 className="text-xl font-extrabold leading-tight text-[#0B3C5D] dark:text-white md:text-2xl">
                          {docItem.name}
                        </h3>
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1E7FC2]">{docItem.designation}</p>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-350">{docItem.qualification}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                        <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800 md:justify-start">
                          <Clock className="h-4 w-4 text-[#24B37A]" />
                          {docItem.availability || docItem.consultationTimings || "Available Today"}
                        </span>
                        <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800 md:justify-start">
                          <CalendarCheck className="h-4 w-4 text-[#1E7FC2]" />
                          {Array.isArray(docItem.consultationDays) && docItem.consultationDays.length > 0
                            ? docItem.consultationDays.slice(0, 3).join(", ")
                            : "OPD Schedule"}
                        </span>
                      </div>

                      <ul className="flex flex-wrap justify-center gap-1.5 md:justify-start">
                        {(docItem.specialization || []).slice(0, 4).map((spec, i) => (
                          <li key={i} className="rounded-full border border-[#1E7FC2]/10 bg-[#E7F3FA] px-2.5 py-1 text-[10px] font-extrabold text-[#0B3C5D] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-250">
                            {spec}
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap justify-center gap-3 pt-1 md:justify-start">
                        <Link to={`/doctors/${docItem.id}`} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1E7FC2] px-4 py-2.5 text-xs font-extrabold text-[#1E7FC2] transition hover:bg-[#1E7FC2] hover:text-white">
                          <span>View Profile</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link to={`/book-appointment?doctorId=${docItem.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#D81F26] px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-red-600/20 transition hover:bg-[#B3151B]">
                          Book Appointment
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Services Section: 4-Column Image-on-top style */}
      <section
        className="py-20 px-6 md:px-12 bg-[#F4F9FC] dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-850 transition-colors duration-300 bg-cover bg-center"
        style={homeServicesBg ? { backgroundImage: `linear-gradient(rgba(244, 249, 252, 0.92), rgba(244, 249, 252, 0.92)), url(${homeServicesBg})` } : undefined}
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-3">
              <span className="text-[13px] tracking-[1.5px] font-bold text-[#D81F26] uppercase block">Our Facilities</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B3C5D] dark:text-white font-serif">Clinical Services</h2>
            </div>
            <Link to="/services" className="text-xs font-bold text-[#1E7FC2] hover:underline flex items-center space-x-1">
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.slice(0, 4).map((s) => {
              const getClusterFallback = (clusterId) => {
                switch (clusterId) {
                  case "bone-health": return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80";
                  case "joint-pain": return "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80";
                  case "spine": return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80";
                  case "trauma": return "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80";
                  case "sports": return "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=600&q=80";
                  case "foot": return "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80";
                  case "pediatric": return "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=600&q=80";
                  default: return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80";
                }
              };

              const cardImageUrl = getImageUrl(`service-thumb-${s.slug}`, s.thumbnailUrl || getClusterFallback(s.cluster));

              return (
                <div key={s.id} className="bg-white dark:bg-slate-900 rounded-[14px] overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 flex flex-col justify-between group">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={cardImageUrl}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#0B3C5D] dark:text-white font-serif leading-snug">{s.name}</h3>
                      <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold line-clamp-2 leading-relaxed">{s.description}</p>
                    </div>
                    <Link to={`/services/orthopaedics/${s.slug}`} className="text-xs font-bold text-[#D81F26] hover:underline inline-flex items-center space-x-1">
                      <span>Learn More ➜</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Mission / Vision / Values */}
      <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 shadow-md border border-slate-100 dark:border-slate-800 border-t-4 border-t-[#1E7FC2] space-y-3">
            <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif">Our Mission</h3>
            <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
              "To do service for Trauma & Emergency Services and to Eradicate Poliomyelitis in our community."
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 shadow-md border border-slate-100 dark:border-slate-800 border-t-4 border-t-[#D81F26] space-y-3">
            <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif">Our Vision</h3>
            <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
              "To Detect, Prevent and Educate about Osteoarthritis, while delivering world-class bone reconstructions."
            </p>
          </div>

          {/* Values */}
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 shadow-md border border-slate-100 dark:border-slate-800 border-t-4 border-t-[#0B3C5D] space-y-3">
            <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif">Our Values</h3>
            <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
              Patient-first clinical focus, maintaining a 33-year legacy of honesty, empathy, and surgical reliability.
            </p>
          </div>
        </div>
      </section>

      {/* 9. CTA Banner */}
      <section className="py-12 px-6 md:px-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-[#0B3C5D] to-[#082A40] rounded-[26px] overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-8 md:p-12 space-y-5 text-white">
            <span className="text-xs font-bold text-[#D81F26] uppercase tracking-widest block">Immediate Consultations</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif leading-tight">
              Restore Your Mobility & Lead a Pain-Free Life
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
              Secure outpatient slots with senior orthopaedic consultants or request virtual video sessions easily.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/book-appointment" className="bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition">
                Book Appointment
              </Link>
              <a href={`tel:${primaryPhone}`} className="border border-white/30 hover:bg-white/5 text-white font-bold text-xs px-6 py-3 rounded-xl transition">
                Call Clinic Desk
              </a>
            </div>
          </div>
          <div className="hidden lg:block h-full min-h-[320px] relative overflow-hidden bg-slate-900/10">
            <img
              src={homeCtaImage}
              alt="Medical Consultation Clinic"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 10. Testimonials Carousel Slide */}
      {testimonials.length > 0 && (
        <section className="py-20 px-6 md:px-12 bg-[#F4F9FC] dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-850 transition-colors duration-300">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[13px] tracking-[1.5px] font-bold text-[#D81F26] uppercase block">Testimonials</span>
              <h2 className="text-3xl font-extrabold text-[#0B3C5D] dark:text-white font-serif">What Patients Say</h2>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[14px] p-8 md:p-10 shadow-[0_10px_30px_rgba(11,60,93,0.08)] border-t-4 border-t-[#D81F26] min-h-[220px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testIndex}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-5 text-center"
                >
                  <div className="flex justify-center space-x-1">
                    {Array.from({ length: testimonials[testIndex]?.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm md:text-base italic font-semibold text-slate-650 dark:text-slate-350 leading-relaxed max-w-2xl mx-auto">
                    "{testimonials[testIndex]?.reviewText}"
                  </blockquote>
                  <div>
                    <h4 className="font-bold text-slate-850 dark:text-slate-100 text-sm">{testimonials[testIndex]?.patientName}</h4>
                    {testimonials[testIndex]?.treatmentTaken && (
                      <p className="text-[10px] text-[#1E7FC2] font-bold uppercase tracking-wider mt-0.5">
                        Recovered from: {testimonials[testIndex]?.treatmentTaken}
                      </p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-center space-x-1.5 pt-6">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      testIndex === idx ? "w-4 bg-[#D81F26]" : "w-1.5 bg-slate-200 dark:bg-slate-850"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 11. Insurance Partner Logo Marquee */}
      {insurance.length > 0 && (
        <section className="py-12 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400 block">
              Government Approved Schemes & Cashless Insurance TPA Partners
            </span>
          </div>
          <div className="flex w-[200%] md:w-[150%] items-center animate-marquee">
            <div className="flex justify-around w-1/2">
              {insurance.map((ins) => (
                <div key={ins.id} className="flex items-center space-x-2 px-8 py-2 filter grayscale dark:invert hover:grayscale-0 transition duration-150 bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 tracking-wide">{ins.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-around w-1/2">
              {insurance.map((ins) => (
                <div key={`${ins.id}-clone`} className="flex items-center space-x-2 px-8 py-2 filter grayscale dark:invert hover:grayscale-0 transition duration-150 bg-white dark:bg-slate-850 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 tracking-wide">{ins.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
