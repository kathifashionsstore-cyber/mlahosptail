import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, Video, Calendar, Clock, Clipboard, ArrowRight, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";

export function VideoConsultation() {
  const { doctors } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    timeSlot: "",
    symptoms: "",
    name: "",
    phone: "",
    platform: "WhatsApp Video"
  });

  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1 && !formData.doctorId) {
      alert("Please select a consultant.");
      return;
    }
    if (step === 2 && (!formData.date || !formData.timeSlot)) {
      alert("Please pick a slot.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please enter patient credentials.");
      return;
    }
    setBookingConfirmed(true);
  };

  const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);

  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-20 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">Telemedicine Desk</span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-serif max-w-3xl">
            Virtual Video Consultations
          </h1>
          <p className="text-sm md:text-lg text-slate-200 max-w-2xl font-medium leading-relaxed">
            Consult our expert spine and orthopaedic surgeons from the comfort of your home. Secure video appointments on WhatsApp or Google Meet.
          </p>
        </div>
      </section>

      {/* 2. Step Progress Track */}
      <section className="py-6 bg-[#EAF4FC] dark:bg-[#132635]/30 border-b border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-xl mx-auto px-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className={step >= 1 ? "text-brand-blue" : ""}>1. Select Doctor</span>
            <span className={step >= 2 ? "text-brand-blue" : ""}>2. Pick Slot</span>
            <span className={step >= 3 ? "text-brand-blue" : ""}>3. Patient details</span>
          </div>
          <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-brand-blue transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. Wizard content block */}
      <section className="py-20 px-6 md:px-12 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-10 rounded-3xl shadow-sm">
          <AnimatePresence mode="wait">
            {bookingConfirmed ? (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                  <Video className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-850 dark:text-slate-50 font-serif">
                    Video Consultation Booked!
                  </h3>
                  <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
                    Your appointment has been logged. Our clinical desk will send the video call credentials to your WhatsApp number ({formData.phone}) before the slot.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border text-left text-xs font-bold text-slate-600 dark:text-slate-350 space-y-2 max-w-md mx-auto">
                  <p>Consultant: {selectedDoctor?.name}</p>
                  <p>Date & Slot: {formData.date} at {formData.timeSlot}</p>
                  <p>Platform: {formData.platform}</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Step 1: Select Doctor */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-50 font-serif">
                      Choose Your Consultant Specialist
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctors.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => setFormData((prev) => ({ ...prev, doctorId: doc.id }))}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center space-x-3.5 ${
                            formData.doctorId === doc.id
                              ? "border-brand-blue bg-brand-blue/5"
                              : "border-slate-100 dark:border-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-850 overflow-hidden flex-shrink-0">
                            <img
                              src={doc.photoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                              alt={doc.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{doc.name}</h4>
                            <p className="text-[10px] text-[#3FA535] uppercase font-bold tracking-wide mt-0.5">{doc.specialization}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Pick Slot */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-50 font-serif">
                      Select Date and Time Slot
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 font-serif">Date *</label>
                        <input
                          type="date"
                          name="date"
                          required
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 font-serif">Time Slot *</label>
                        <select
                          name="timeSlot"
                          required
                          value={formData.timeSlot}
                          onChange={handleInputChange}
                          className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                        >
                          <option value="">-- Choose Slot --</option>
                          <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                          <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                          <option value="05:30 PM - 06:00 PM">05:30 PM - 06:00 PM</option>
                          <option value="07:00 PM - 07:30 PM">07:00 PM - 07:30 PM</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Patient Credentials */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-bold text-slate-850 dark:text-slate-50 font-serif">
                      Enter Patient Credentials & Notes
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Patient Name *</label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Mobile Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+91"
                            className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Preferred App *</label>
                          <select
                            name="platform"
                            value={formData.platform}
                            onChange={handleInputChange}
                            className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                          >
                            <option value="WhatsApp Video">WhatsApp Video</option>
                            <option value="Google Meet">Google Meet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Symptoms Description</label>
                          <input
                            type="text"
                            name="symptoms"
                            value={formData.symptoms}
                            onChange={handleInputChange}
                            placeholder="e.g. chronic knee pain"
                            className="w-full text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-brand-blue"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-850">
                  {step > 1 ? (
                    <button
                      onClick={prevStep}
                      className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-brand-blue"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      onClick={nextStep}
                      className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmBooking}
                      className="bg-brand-red hover:bg-brand-red text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-brand-red/15 animate-colors"
                    >
                      <span>Book Video Session</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default VideoConsultation;
