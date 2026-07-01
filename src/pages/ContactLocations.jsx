import React, { useState } from "react";
import { Phone, MapPin, Mail, Clock } from "lucide-react";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const branches = [
  {
    id: "narasaraopet-main",
    name: "Amulya Nursing Home (Main Hospital)",
    address: "Opp. Sub Registrar Office, Narasaraopet, Palnadu District, Andhra Pradesh - 522601",
    reception: "+91 8647 223625",
    emergency: "+91 9494 332625",
    email: "contact@amulyanh.com",
    hours: "24/7 Casualty & Critical Care. OPD: 9:30 AM - 1:30 PM, 4:30 PM - 8:30 PM",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.786523955681!2d80.0435!3d16.2235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4b000000000001%3A0x0000000000000000!2sAmulya%20Nursing%20Home!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
  },
  {
    id: "guntur-consult-clinic",
    name: "Amulya Orthopaedic Consultation Clinic",
    address: "Suburban Medical Chambers, Arundpat, Guntur, Andhra Pradesh - 522002",
    reception: "+91 8632 225678",
    emergency: "+91 9494 332625",
    email: "guntur@amulyanh.com",
    hours: "Saturday Consultation Only: 4:30 PM - 8:00 PM (Prior Booking Required)",
    mapEmbed: ""
  }
];

export function ContactLocations() {
  const [activeBranchId, setActiveBranchId] = useState("narasaraopet-main");
  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Enquiry",
    message: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      await addDoc(collection(db, "enquiries"), {
        ...formData,
        timestamp: serverTimestamp()
      });
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({ name: "", email: "", phone: "", subject: "General Enquiry", message: "" });
      }, 3000);
    } catch (err) {
      console.error("Failed to send contact enquiry:", err);
      alert("Failed to send enquiry. Please check connection and try again.");
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#D81F26]">Contact Wings</span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight">Locations & Helplines</h1>
          <p className="text-sm md:text-base text-slate-200 max-w-2xl font-medium">
            Reach our 24/7 trauma emergency lines, outpatient desks, or locate our primary consultation chambers.
          </p>
        </div>
      </section>

      {/* 2. Branch Selection Tabs */}
      <section className="py-6 bg-[#F4F9FC] dark:bg-[#132635]/30 border-b border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex space-x-3 justify-center whitespace-nowrap min-w-max">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                  activeBranchId === b.id
                    ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-md"
                    : "border-transparent text-[#1E7FC2] bg-[#E7F3FA] hover:bg-[#1E7FC2] hover:text-white"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Main Contact Info & Map panel */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Active Branch Info & Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#D81F26]">Branch Details</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B3C5D] dark:text-white font-serif">
                {activeBranch.name}
              </h2>
            </div>

            {/* Direct Information list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Address */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[14px] shadow-sm flex items-start space-x-3.5">
                <MapPin className="w-5 h-5 text-[#1E7FC2] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Postal Address</h4>
                  <p className="text-xs text-[#5C6E7A] dark:text-slate-350 leading-relaxed font-semibold">{activeBranch.address}</p>
                </div>
              </div>

              {/* Consultation Timings */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[14px] shadow-sm flex items-start space-x-3.5">
                <Clock className="w-5 h-5 text-[#1E7FC2] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Clinical Timings</h4>
                  <p className="text-xs text-[#5C6E7A] dark:text-slate-350 leading-relaxed font-semibold">{activeBranch.hours}</p>
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[14px] shadow-sm flex items-start space-x-3.5">
                <Phone className="w-5 h-5 text-[#1E7FC2] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Phone Helplines</h4>
                  <p className="text-xs text-[#0B3C5D] dark:text-slate-200 font-extrabold">OPD Reception: {activeBranch.reception}</p>
                  <p className="text-xs text-[#D81F26] font-extrabold mt-1">24/7 Trauma: {activeBranch.emergency}</p>
                </div>
              </div>

              {/* Emails */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-[14px] shadow-sm flex items-start space-x-3.5">
                <Mail className="w-5 h-5 text-[#1E7FC2] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Email Helpline</h4>
                  <p className="text-xs text-[#5C6E7A] dark:text-slate-350 font-semibold">{activeBranch.email}</p>
                </div>
              </div>
            </div>

            {/* Map Embed */}
            {activeBranch.mapEmbed && (
              <div className="rounded-[26px] overflow-hidden shadow-md border border-slate-100 dark:border-slate-850 aspect-video w-full bg-slate-50 dark:bg-slate-900">
                <iframe
                  title="Hospital Map Locator"
                  src={activeBranch.mapEmbed}
                  className="w-full h-full border-none"
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
            )}
          </div>

          {/* Right Side: Enquiry Form */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[26px] shadow-[0_20px_45px_rgba(11,60,93,0.1)] space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif border-b pb-3">
                Send Quick Message
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold leading-relaxed mt-2">
                Have general questions about scheduling or medical programs? Submit our quick form below.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <span>Message sent successfully! Our desk team will call you back shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-450 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ram Kumar"
                    className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ram@gmail.com"
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91"
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-455 mb-1.5">Message / Details *</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Brief description of query..."
                    className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-205 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition duration-200"
                >
                  Send Helpline Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactLocations;
