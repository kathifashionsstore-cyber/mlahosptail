import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ArrowRight, Bone, Activity, Siren, Footprints, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Services() {
  const { services, getImageUrl } = useApp();

  const clusters = [
    { id: "bone-health", name: "General Bone & Joint Health", icon: <Bone className="w-5.5 h-5.5" />, description: "Osteoporosis, arthritis, metabolic bone disorders, and general bone strength care." },
    { id: "joint-pain", name: "Joint Pain Conditions", icon: <Activity className="w-5.5 h-5.5" />, description: "Expert management for knee, hip, shoulder, and extremity joint pain." },
    { id: "spine", name: "Spine Conditions", icon: <Activity className="w-5.5 h-5.5" />, description: "Back pain, neck pain, sciatica, slip disc, and advanced spine interventions." },
    { id: "trauma", name: "Trauma & Fractures", icon: <Siren className="w-5.5 h-5.5" />, description: "24/7 emergency fracture care, polytrauma, and Swiss AO-standard stabilizations." },
    { id: "sports", name: "Sports & Soft Tissue Injuries", icon: <Activity className="w-5.5 h-5.5" />, description: "ACL tears, ligament injuries, tennis elbow, and athletic rehabilitation." },
    { id: "foot", name: "Foot & Ankle Conditions", icon: <Footprints className="w-5.5 h-5.5" />, description: "Flat feet, plantar fasciitis, heel pain, and arch alignment support." },
    { id: "pediatric", name: "Pediatric & Congenital Orthopaedics", icon: <ShieldCheck className="w-5.5 h-5.5" />, description: "Clubfoot correction, cerebral palsy support, and polio deformity care." }
  ];

  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 140;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-[#F4F9FC] dark:bg-slate-950 transition-colors duration-300">
      
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-br from-[#082A40] via-[#0B3C5D] to-[#1E7FC2] text-white py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#1E7FC2] blur-3xl"></div>
          <div className="absolute -bottom-20 -left-25 w-96 h-96 rounded-full bg-[#D81F26] blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto space-y-5 relative z-10 text-center md:text-left">
          <span className="inline-flex items-center space-x-1.5 text-[10px] uppercase font-extrabold tracking-widest text-white bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1E7FC2]" />
            <span>Clinical Directory</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight leading-tight max-w-4xl">
            Our Orthopaedic Services & Conditions
          </h1>
          <p className="text-xs md:text-sm text-slate-350 max-w-2xl font-semibold leading-relaxed">
            Explore our comprehensive 40-condition treatment sitemap configured into 7 clinical categories. 
            Providing Swiss AO-standard spine, joint, trauma and deformity corrections since 1992.
          </p>
        </div>
      </section>

      {/* 2. Sticky Sub-Navigation Chip Bar */}
      <div className="sticky top-[108px] md:top-[128px] z-30 bg-white/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-850 py-4 backdrop-blur-md shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 md:justify-center whitespace-nowrap min-w-max">
            {clusters.map((cluster) => (
              <button
                key={cluster.id}
                onClick={() => handleScrollToSection(cluster.id)}
                className="px-4.5 py-2.5 rounded-xl text-xs font-extrabold bg-[#E7F3FA] dark:bg-slate-800 text-[#0B3C5D] dark:text-slate-300 hover:bg-[#1E7FC2] hover:text-white dark:hover:bg-[#1E7FC2] transition duration-200 shadow-xs border border-[#1E7FC2]/5"
              >
                {cluster.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Cluster Sections */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-24">
        {clusters.map((cluster) => {
          const clusterServices = services.filter((s) => s.cluster === cluster.id);
          if (clusterServices.length === 0) return null;

          return (
            <div key={cluster.id} id={cluster.id} className="space-y-8 scroll-mt-32 text-left">
              
              {/* Cluster Header */}
              <div className="border-b border-slate-150/60 dark:border-slate-850 pb-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 text-[#1E7FC2] flex items-center justify-center flex-shrink-0 shadow-md border border-slate-100 dark:border-slate-800">
                  {cluster.icon}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl md:text-2xl font-extrabold text-[#0B3C5D] dark:text-white font-serif">
                    {cluster.name}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-3xl leading-relaxed">
                    {cluster.description}
                  </p>
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {clusterServices.map((srv) => {
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

                  const cardImageUrl = getImageUrl(`service-thumb-${srv.slug}`, srv.thumbnailUrl || getClusterFallback(srv.cluster));
                  
                  return (
                    <motion.div
                      key={srv.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="group bg-white dark:bg-slate-900 rounded-[22px] overflow-hidden border border-slate-100 dark:border-slate-850 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(11,60,93,0.06)] dark:hover:shadow-[0_20px_40px_rgba(30,127,194,0.03)] transition-all duration-300"
                    >
                      {/* Image header with hover zoom */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={cardImageUrl}
                          alt={srv.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Glassmorphic Category Eyebrow */}
                        <span className="absolute top-3.5 left-3.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md text-[9px] font-extrabold uppercase tracking-widest text-[#1E7FC2] px-2.5 py-1 rounded-lg border border-white/20 dark:border-slate-800">
                          Orthopaedics
                        </span>
                      </div>

                      {/* Content details */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-sm md:text-[15px] text-[#0B3C5D] dark:text-white font-serif leading-snug group-hover:text-[#1E7FC2] transition-colors">
                            {srv.name}
                          </h3>
                          <p className="text-[11px] text-[#5C6E7A] dark:text-slate-400 leading-relaxed font-semibold line-clamp-3">
                            {srv.shortDescription || srv.description}
                          </p>
                        </div>

                        <div className="pt-3.5 border-t border-slate-50 dark:border-slate-850/80 flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold text-slate-400">AO Foundation</span>
                          <Link
                            to={`/services/orthopaedics/${srv.slug}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-[#D81F26] hover:text-[#B3151B] transition-colors"
                          >
                            <span>Learn More</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-200" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default Services;
