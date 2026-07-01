import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Award, Target, Eye, Quote, Heart, ChevronDown } from "lucide-react";
import { db } from "../firebase/config";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useApp } from "../context/AppContext";

export function About() {
  const { doctors } = useApp();
  const [aboutContent, setAboutContent] = useState(null);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRooms, setOpenRooms] = useState({ 0: true });

  const toggleRoom = (idx) => {
    setOpenRooms((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutSnap = await getDoc(doc(db, "aboutContent", "main"));
        if (aboutSnap.exists()) {
          setAboutContent(aboutSnap.data());
        }

        const awardsSnap = await getDocs(query(collection(db, "awards"), where("isActive", "==", true), orderBy("order", "asc")));
        setAwards(awardsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
      } catch (err) {
        console.error("Failed to load about page details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, []);

  const storyTitle = aboutContent?.storyTitle || "Our Story";
  const storyText = aboutContent?.storyText || "Founded on May 8, 1992, by Dr. Chadalavada Aravinda Babu, Amulya Nursing Home has served Narasaraopeta for over three decades with dedicated healthcare services.";
  const missionText = aboutContent?.missionText || "To restore mobility, relieve pain, and improve the quality of life for our patients by providing world-class, accessible, and evidence-based orthopaedic, spine, and trauma care.";
  const visionText = aboutContent?.visionText || "To be the leading, most trusted orthopaedic center in Andhra Pradesh, recognized for surgical excellence, state-of-the-art facilities, and empathetic patient care.";
  const founderMessage = aboutContent?.founderMessage || "For over 30 years, our commitment has been to provide the highest standard of orthopaedic surgery and patient care. We believe in transparency, ethical practice, and adopting the latest medical advancements to serve our community.";
  const founderDoc = doctors.find((d) => d.id === "dr-aravinda-babu");
  const founderPhotoUrl = founderDoc?.photoUrl || aboutContent?.founderPhotoUrl || "https://i.ibb.co/3sS7H9y/dr-aravinda-babu.jpg";
  const facilitiesList = aboutContent?.facilitiesList || [
    "Two advanced operation theatres with Laminar Flow & C-Arm",
    "Dedicated Trauma ICU with multi-para monitors & ventilators",
    "Digital X-Ray and in-house diagnostics",
    "In-house diagnostic laboratory",
    "24/7 emergency pharmacy",
    "Dual Kirloskar generator backup for uninterrupted power",
    "Wheelchair-accessible corridors and elevator systems",
  ];

  return (
    <div className="pt-24 min-h-screen">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535] dark:text-[#3FA535]">About Hospital</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif">About Amulya Nursing Home</h1>
          <p className="text-sm md:text-base text-slate-200 max-w-2xl font-medium">
            Over three decades of surgical excellence, trauma relief, and orthopedic restoration.
          </p>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="py-20 px-6 md:px-12 bg-surface-light dark:bg-surface-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary dark:text-primary-light">Establishment</span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-50 font-serif">{storyTitle}</h2>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{storyText}</p>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <img
              src="https://i.ibb.co/3sS7H9y/exterior.jpg"
              alt="Hospital Facility"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="py-16 px-6 md:px-12 bg-[#EAF4FC] dark:bg-[#132635]/30 border-y border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission Card */}
          <div className="premium-card-blue p-8 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-50">Our Mission & Aims</h3>
              <p className="text-sm text-slate-555 dark:text-slate-400 leading-relaxed font-medium">
                {aboutContent?.aims || missionText}
              </p>
            </div>
          </div>

          {/* Goals Card */}
          <div className="premium-card-green p-8 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-50">Our Goals</h3>
              <p className="text-sm text-slate-555 dark:text-slate-400 leading-relaxed font-medium">
                {aboutContent?.goals || "Eradicate Poliomyelitis."}
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div className="premium-card-blue p-8 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-50">Our Vision</h3>
              <p className="text-sm text-slate-555 dark:text-slate-400 leading-relaxed font-medium">
                {aboutContent?.vision || visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Founder's Message */}
      <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1 flex flex-col items-center text-center space-y-4">
            <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg relative bg-slate-100">
              {founderPhotoUrl ? (
                <img src={founderPhotoUrl} alt="Dr. Chadalavada Aravinda Babu" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">Chief Surgeon</div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-50 font-serif">Dr. C. Aravinda Babu</h3>
              <p className="text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider mt-1">
                Founder & Chief Surgeon
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">M.S. (Ortho) • Gold Medalist</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <Quote className="w-12 h-12 text-primary/10 dark:text-primary-light/10 absolute -top-6 -left-6 transform scale-x-[-1]" />
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-50 font-serif mb-4">Letter from the Founder</h3>
              <blockquote className="text-base text-slate-600 dark:text-slate-350 italic font-medium leading-relaxed relative z-10 pl-6 border-l-4 border-primary dark:border-primary-light py-2">
                "{founderMessage}"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Certifications & Awards */}
      {awards.length > 0 && (
        <section className="py-16 px-6 md:px-12 bg-[#EAF4FC] dark:bg-[#132635]/30 border-y border-[#1E7FC2]/10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-50 font-serif">Honors & Certifications</h3>
              <p className="text-sm text-slate-550 dark:text-slate-455 font-medium">Recognized for surgical precision and healthcare dedication.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map((award) => (
                <div
                  key={award.id}
                  className="premium-card-green p-6 flex items-start space-x-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">{award.title}</h4>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1">
                      {award.issuedBy} {award.year ? `• ${award.year}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* 6. Facilities checklist */}
      <section className="py-20 px-6 md:px-12 bg-surface-light dark:bg-surface-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary dark:text-primary-light">Infrastructure</span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-50 font-serif">Equipped Hospital Facilities</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Equipped setups optimized for bone surgery, trauma ICU stability and 24/7 casualty intake.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {facilitiesList.map((facility, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm font-medium text-slate-700 dark:text-slate-350 text-sm"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{facility}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6.5 Our Equipment Section */}
      <section className="py-20 px-6 md:px-12 bg-[#EAF4FC] dark:bg-[#132635]/30 border-y border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-blue dark:text-brand-blue-500">Technology</span>
            <h2 className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">Our Medical & Laboratory Equipment</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Room-by-room clinical inventory supporting our critical and surgical operations.</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {(aboutContent?.equipmentByRoom || [
              { room: "Operation Theatre", items: ["O.T. Table", "Lighting System", "Suction Apparatus", "Cautery", "Oxygen Cylinders", "Laminar Air Flow Theatre"] },
              { room: "Intensive Care Unit", items: ["Pulse Oximeter", "Suction Apparatus", "Oxygen Cylinder", "Tourniquet", "Fumigation Machine"] },
              { room: "Wards", items: ["BP Apparatus", "Thermometer", "Water Bed", "Weighing Machine", "Nebuliser"] },
              { room: "Lab / Radiology", items: ["Auto Analyser", "Centrifuge", "UPS Power Backup", "X-Ray 300 MA", "X-Ray 60 MA"] }
            ]).map((roomData, idx) => {
              const isOpen = !!openRooms[idx];
              return (
                <div key={idx} className="border border-slate-100 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(15,27,36,0.08),0_8px_24px_rgba(15,27,36,0.06)] transition-all duration-200">
                  <button
                    onClick={() => toggleRoom(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-850 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-850 transition duration-150"
                  >
                    <span>{roomData.room}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t border-slate-50 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-900/40 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {roomData.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-center space-x-2 text-xs font-semibold text-slate-650 dark:text-slate-350 p-2.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-blue flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Gallery Preview Banner */}
      <section className="premium-banner text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-5">
          <h3 className="text-2xl font-extrabold font-serif">Take a Tour of Our Facility</h3>
          <p className="text-sm text-slate-200 font-medium">Explore the operation theatres, patient wards, and diagnostic labs in our photo gallery.</p>
          <Link
            to="/gallery"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-100 text-[#0F4267] font-bold px-6 py-2.5 rounded-xl transition duration-150 text-sm shadow-md"
          >
            <span>Browse Photo Gallery</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
