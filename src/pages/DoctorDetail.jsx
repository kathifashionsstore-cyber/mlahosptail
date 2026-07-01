import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useApp } from "../context/AppContext";
import { UserRound, Clock, Languages, Award, ChevronLeft, Calendar } from "lucide-react";
import { useDoctorPhoto } from "../hooks/useDoctorPhoto";

export function DoctorDetail() {
  const { doctorId } = useParams();
  const { doctors, treatments, getImageUrl } = useApp();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const doctorPhoto = useDoctorPhoto(doctor);

  useEffect(() => {
    const cachedDoc = doctors.find((d) => d.id === doctorId);
    if (cachedDoc) {
      setDoctor(cachedDoc);
      setLoading(false);
    } else {
      const fetchDoctor = async () => {
        try {
          const docRef = doc(db, "doctors", doctorId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setDoctor({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (err) {
          console.error("Failed to load doctor profile:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoctor();
    }
  }, [doctorId, doctors]);

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-[#1E7FC2] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 mt-4 font-semibold">Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="pt-32 text-center py-20 min-h-[50vh]">
        <h2 className="text-2xl font-bold text-[#0B3C5D] dark:text-slate-100 font-serif">Doctor Profile Not Found</h2>
        <Link to="/doctors" className="mt-4 inline-block text-[#1E7FC2] font-bold hover:underline">
          &larr; Back to all doctors
        </Link>
      </div>
    );
  }

  const relatedTreatments = treatments.filter((t) => t.relatedDoctorIds?.includes(doctor.id));

  const daysOfWeek = [
    { label: "Mon", full: "Monday" },
    { label: "Tue", full: "Tuesday" },
    { label: "Wed", full: "Wednesday" },
    { label: "Thu", full: "Thursday" },
    { label: "Fri", full: "Friday" },
    { label: "Sat", full: "Saturday" },
    { label: "Sun", full: "Sunday" },
  ];

  const activeDays = doctor.consultationDays || [];

  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Helmet>
        <title>{`Dr. ${doctor.name} | ${doctor.designation || 'Orthopaedic Specialist'} | Amulya Hospital`}</title>
        <meta
          name="description"
          content={`Consult Dr. ${doctor.name}, ${doctor.designation || 'specialist surgeon'} at Amulya Hospital, Narasaraopet. Specializing in ${doctor.speciality || 'orthopaedics and trauma care'}. Experience: ${doctor.experience || 'Over 20 Years'}. Book appointment online.`}
        />
        <meta name="keywords" content={`Dr. ${doctor.name}, orthopedic surgeon narasaraopet, spine doctor amulya hospital, best trauma surgeon palnadu`} />
        <link rel="canonical" href={window.location.href} />
        
        {/* Physician JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Physician",
            "@id": `${window.location.href}#physician`,
            "name": `Dr. ${doctor.name}`,
            "image": doctorPhoto,
            "description": doctor.bio || doctor.designation,
            "telephone": "+918647223625",
            "medicalSpecialty": doctor.speciality || "OrthopedicSurgery",
            "worksFor": {
              "@type": "Hospital",
              "name": "Amulya Nursing Home",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "30/13, Guntur Rd, Panasathota, Barampet",
                "addressLocality": "Narasaraopeta",
                "addressRegion": "Andhra Pradesh",
                "postalCode": "522601",
                "addressCountry": "IN"
              }
            }
          })}
        </script>
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-12">
        {/* Back Link */}
        <Link
          to="/doctors"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-[#1E7FC2] transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Specialists</span>
        </Link>

        {/* 1. Profile Hero Section */}
        <section className="p-8 md:p-12 bg-[#F4F9FC] dark:bg-slate-900/50 rounded-[26px] border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-12 items-center">
          {/* Avatar column */}
          <div className="flex justify-center">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-[#1E7FC2] to-[#0B3C5D] flex items-center justify-center text-white shadow-lg overflow-hidden border-4 border-white dark:border-slate-800 relative">
              <img
                src={doctorPhoto}
                alt={doctor?.name || "Doctor"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details column */}
          <div className="space-y-4 text-center md:text-left">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#1E7FC2] block">
                {doctor.designation}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0B3C5D] dark:text-white font-serif mt-1">
                {doctor.name}
              </h1>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">
                {doctor.qualification}
              </p>
            </div>
            <p className="text-xs md:text-sm text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
              {doctor.bio}
            </p>
            {doctor.languages && (
              <p className="text-xs font-bold text-slate-400">
                Speaks: {doctor.languages.join(", ")}
              </p>
            )}
          </div>
        </section>

        {/* 2. Credentials Subsections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Specializations & Awards */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[14px] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0B3C5D] dark:text-white font-serif border-b pb-2">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.specialization.map((spec, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-[#E7F3FA] dark:bg-slate-850 text-[#1E7FC2]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {doctor.awards && doctor.awards.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[14px] shadow-sm space-y-3">
                <h3 className="text-base font-bold text-[#0B3C5D] dark:text-white font-serif border-b pb-2">Awards & Recognitions</h3>
                <div className="space-y-2">
                  {doctor.awards.map((award, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs font-semibold text-[#5C6E7A] dark:text-slate-300">
                      <span className="text-amber-500">★</span>
                      <span>{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Consultation Schedule Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[14px] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#0B3C5D] dark:text-white font-serif border-b pb-2 flex items-center space-x-1.5">
              <Clock className="w-4.5 h-4.5 text-[#1E7FC2]" />
              <span>OPD Consultation Schedule</span>
            </h3>

            {/* 7-box week strip */}
            <div className="grid grid-cols-7 gap-1.5">
              {daysOfWeek.map((day) => {
                const isAvailable = activeDays.includes(day.label);
                return (
                  <div
                    key={day.label}
                    className={`text-center py-2.5 rounded-lg text-xs font-bold border transition ${
                      isAvailable
                        ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-sm font-extrabold"
                        : "border-slate-200 text-slate-350 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950/20"
                    }`}
                  >
                    {day.label}
                  </div>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 space-y-1.5 pt-2">
              <p>Timings: {doctor.consultationTimings}</p>
              {doctor.experienceYears && <p>Clinical Experience: {doctor.experienceYears} Years</p>}
            </div>
          </div>
        </section>

        {/* 3. Related Treatments Section: Gastro style cards */}
        {relatedTreatments.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif border-b pb-2">
              Related Treatment Procedures
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTreatments.map((t) => (
                <Link
                  key={t.id}
                  to={`/treatments/${t.slug}`}
                  className="group relative w-full aspect-[4/5] rounded-[14px] overflow-hidden shadow-md flex items-end p-6 border border-slate-100 dark:border-slate-850"
                >
                  <img
                    src={t.thumbnailUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"}
                    alt={t.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                  <div className="relative z-20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#D81F26]">Speciality</span>
                    <h3 className="text-white font-extrabold text-sm font-serif leading-tight">{t.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. Large Navy Banner */}
        <section className="bg-gradient-to-r from-[#0B3C5D] to-[#082A40] text-white p-8 md:p-10 rounded-[26px] shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D81F26] block">Consultation scheduling</span>
            <h3 className="text-xl md:text-2xl font-bold font-serif leading-tight">Ready to consult {doctor.name}?</h3>
            <p className="text-xs text-slate-300 font-medium max-w-md leading-relaxed">
              Book a clinic visit or coordinate cashless Aarogyasri approvals with our active desk.
            </p>
          </div>
          <Link
            to={`/book-appointment?doctorId=${doctor.id}`}
            className="bg-[#D81F26] hover:bg-[#B3151B] text-white px-7 py-3 rounded-xl font-bold text-xs shadow-md transition duration-200 whitespace-nowrap self-center md:self-auto"
          >
            Book Appointment
          </Link>
        </section>

      </div>
    </div>
  );
}

export default DoctorDetail;
