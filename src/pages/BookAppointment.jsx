import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useApp } from "../context/AppContext";
import { uploadImageToImgbb } from "../utils/imgbbUpload";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Calendar, Clock, User, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export function BookAppointment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { doctors, departments, settings } = useApp();

  const queryDoctorId = searchParams.get("doctorId");
  const queryDeptId = searchParams.get("departmentId");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [successData, setSuccessData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      departmentId: queryDeptId || "",
      doctorId: queryDoctorId || "",
      preferredDate: "",
      preferredTime: "",
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      patientAge: "",
      patientGender: "male",
      reasonForVisit: "",
      reportFile: null,
    },
  });

  const selectedDeptId = watch("departmentId");
  const selectedDoctorId = watch("doctorId");
  const selectedDate = watch("preferredDate");
  const selectedTime = watch("preferredTime");

  const filteredDoctors = doctors.filter((d) => d.departmentId === selectedDeptId);

  useEffect(() => {
    if (queryDoctorId) {
      const docItem = doctors.find((d) => d.id === queryDoctorId);
      if (docItem) {
        setValue("departmentId", docItem.departmentId);
        setValue("doctorId", docItem.id);
        setStep(2);
      }
    } else if (queryDeptId) {
      setValue("departmentId", queryDeptId);
    }
  }, [queryDoctorId, queryDeptId, doctors, setValue]);

  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;
    const slots = [
      "10:00 AM", "10:20 AM", "10:40 AM",
      "11:00 AM", "11:20 AM", "11:40 AM",
      "12:00 PM", "12:20 PM", "12:40 PM",
      "02:00 PM", "02:20 PM", "02:40 PM",
      "03:00 PM", "03:20 PM", "03:40 PM",
      "04:00 PM", "04:20 PM", "04:40 PM",
      "05:00 PM", "05:20 PM", "05:40 PM",
      "06:00 PM", "06:20 PM", "06:40 PM"
    ];
    setAvailableSlots(slots);
  }, [selectedDoctorId, selectedDate]);

  const handleDateChange = (e) => {
    const dateStr = e.target.value;
    const dateObj = new Date(dateStr);
    const dayIndex = dateObj.getDay();
    const dayMapping = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayLabel = dayMapping[dayIndex];

    const docItem = doctors.find((d) => d.id === selectedDoctorId);
    if (docItem) {
      const docDays = docItem.consultationDays || [];
      if (!docDays.includes(dayLabel)) {
        alert(`${docItem.name} is not available on Sundays or days outside their active schedule (${dayLabel}). Please choose another date.`);
        setValue("preferredDate", "");
        return;
      }
    }
    setValue("preferredDate", dateStr);
  };

  const nextStep = () => {
    if (step === 1 && (!selectedDeptId || !selectedDoctorId)) {
      alert("Please select a department and a consulting doctor.");
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      alert("Please choose both a preferred date and time slot.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    let reportUrl = "";
    let reportDeleteUrl = "";

    if (data.reportFile && data.reportFile[0]) {
      const file = data.reportFile[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Report files must be under 2MB. Please compress your file.");
        setLoading(false);
        return;
      }

      setUploadProgressText("Uploading report...");
      try {
        const uploadResult = await uploadImageToImgbb(file, (p) => {
          setUploadProgress(Math.round(p));
        });
        reportUrl = uploadResult.url;
        reportDeleteUrl = uploadResult.deleteUrl;
      } catch (err) {
        console.error("Report upload failed:", err);
        alert("Medical report upload failed. We will write your booking without the attachment.");
      }
    }

    try {
      const appointmentData = {
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail,
        patientAge: parseInt(data.patientAge, 10),
        patientGender: data.patientGender,
        departmentId: data.departmentId,
        doctorId: data.doctorId,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        reasonForVisit: data.reasonForVisit,
        reportFileUrl: reportUrl,
        reportFileDeleteUrl: reportDeleteUrl,
        status: "pending",
        adminNotes: "",
        createdAt: serverTimestamp(),
        source: "website",
      };

      await addDoc(collection(db, "appointments"), appointmentData);
      setSuccessData(appointmentData);
      setStep(5);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to submit appointment request. Please contact the hospital help desk.");
    } finally {
      setLoading(false);
    }
  };

  const primaryPhone = settings?.phoneNumbers?.[0]?.number || "+918647223625";

  if (step === 5 && successData) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[26px] border border-slate-100 dark:border-slate-800 p-8 text-center space-y-6 shadow-xl"
        >
          {/* Green Confirmation Success Banner */}
          <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350 p-6 rounded-[14px] border border-emerald-100 flex flex-col items-center space-y-3.5 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-xl font-extrabold font-serif">Request Logged!</h2>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                Our front office desk will contact you shortly to finalize admission steps.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F4F9FC] dark:bg-slate-800/80 text-left text-xs font-semibold text-slate-600 dark:text-slate-350 space-y-2.5 border">
            <p>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Patient Full Name</span>
              <strong className="text-[#0B3C5D] dark:text-white font-extrabold">{successData.patientName}</strong>
            </p>
            <p>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Consulting Surgeon</span>
              <strong className="text-[#0B3C5D] dark:text-white font-extrabold">
                {doctors.find((d) => d.id === successData.doctorId)?.name}
              </strong>
            </p>
            <p>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Preferred Schedule</span>
              <strong className="text-[#0B3C5D] dark:text-white font-extrabold">{successData.preferredDate} at {successData.preferredTime}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#E7F3FA] dark:bg-blue-950/20 border border-blue-200/50 text-[11px] text-[#0B3C5D] dark:text-slate-300 font-bold leading-relaxed">
            📢 Slot call validation will be triggered to: <strong className="text-[#D81F26]">{successData.patientPhone}</strong>.
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold py-3 rounded-xl transition duration-150 text-xs shadow-md"
          >
            Return to Home Page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-[#F4F9FC] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-10">
        
        {/* Wizard Form Frame */}
        <div className="bg-white dark:bg-slate-900 rounded-[26px] border border-slate-100 dark:border-slate-800 shadow-[0_20px_45px_rgba(11,60,93,0.14)] overflow-hidden p-6 md:p-8 space-y-6">
          
          {/* Step dots Progress Indicator */}
          <div className="flex justify-center items-center space-x-2.5 pb-6 border-b border-slate-100 dark:border-slate-800">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  step === s ? "w-8 bg-[#1E7FC2]" : "w-2.5 bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Select Care */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-[#0B3C5D] dark:text-slate-50 flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#1E7FC2]" />
                  <span>Choose Doctor & Department</span>
                </h3>

                <div className="space-y-4">
                  {/* Department Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Select Department
                    </label>
                    <select
                      {...register("departmentId")}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    >
                      <option value="" className="text-slate-400">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Select Consultant
                    </label>
                    <select
                      {...register("doctorId")}
                      disabled={!selectedDeptId}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 disabled:opacity-50 transition"
                    >
                      <option value="">-- Choose Surgeon --</option>
                      {filteredDoctors.map((docItem) => (
                        <option key={docItem.id} value={docItem.id}>
                          {docItem.name} ({docItem.qualification})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time Picker */}
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-[#0B3C5D] dark:text-slate-50 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#1E7FC2]" />
                  <span>Choose Preferred Schedule</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Consultation Date
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                      onChange={handleDateChange}
                      value={selectedDate}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                  </div>

                  {/* Time Slots Pickers */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Available Time Slots
                    </label>
                    {!selectedDate ? (
                      <div className="text-xs font-semibold text-slate-400 py-3">Please choose a date first</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setValue("preferredTime", slot)}
                            className={`py-2 text-[10px] md:text-xs font-bold rounded-lg border text-center transition ${
                              selectedTime === slot
                                ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-sm font-extrabold"
                                : "bg-white border-slate-200 text-slate-655 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:hover:bg-slate-700"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Patient Details */}
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-[#0B3C5D] dark:text-slate-50 flex items-center space-x-2">
                  <User className="w-5 h-5 text-[#1E7FC2]" />
                  <span>Patient Demographics</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter patient name"
                      {...register("patientName", { required: "Name is required" })}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                    {errors.patientName && <p className="text-[#D81F26] text-[10px] font-bold">{errors.patientName.message}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      {...register("patientPhone", {
                        required: "Mobile is required",
                        pattern: { value: /^[6789]\d{9}$/, message: "Invalid 10-digit Indian phone number" },
                      })}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                    {errors.patientPhone && <p className="text-[#D81F26] text-[10px] font-bold">{errors.patientPhone.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. name@domain.com"
                      {...register("patientEmail")}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      placeholder="Age in years"
                      {...register("patientAge", {
                        required: "Age is required",
                        min: { value: 1, message: "Age must be positive" },
                        max: { value: 120, message: "Invalid age" },
                      })}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                    {errors.patientAge && <p className="text-[#D81F26] text-[10px] font-bold">{errors.patientAge.message}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Patient Gender
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {["male", "female", "other"].map((g) => (
                        <label
                          key={g}
                          className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F4F9FC] dark:bg-slate-855 cursor-pointer font-bold text-xs uppercase text-slate-600 dark:text-slate-350"
                        >
                          <input type="radio" value={g} {...register("patientGender")} className="mr-2" />
                          <span>{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Attachment */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Upload Medical Reports (Under 2MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      {...register("reportFile")}
                      className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#E7F3FA] file:text-[#1E7FC2] hover:file:bg-[#1E7FC2] hover:file:text-white cursor-pointer"
                    />
                  </div>

                  {/* Reason */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Symptoms / Reason for Visit
                    </label>
                    <textarea
                      placeholder="Describe what bone/joint/medical issues you are experiencing..."
                      rows="3"
                      {...register("reasonForVisit")}
                      className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review and Confirm */}
            {step === 4 && (
              <div className="space-y-5">
                <h3 className="text-base font-bold text-[#0B3C5D] dark:text-slate-50 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#1E7FC2]" />
                  <span>Review Booking Details</span>
                </h3>

                <div className="space-y-4 bg-[#F4F9FC] dark:bg-slate-900 p-6 rounded-2xl border text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-350">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Patient Name:</p>
                      <p className="font-extrabold text-[#0B3C5D] dark:text-slate-100 mt-0.5">{watch("patientName")}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Mobile Phone:</p>
                      <p className="font-extrabold text-[#0B3C5D] dark:text-slate-100 mt-0.5">{watch("patientPhone")}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Consulting Surgeon:</p>
                      <p className="font-extrabold text-[#0B3C5D] dark:text-slate-100 mt-0.5">
                        {doctors.find((d) => d.id === selectedDoctorId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Schedule Timing:</p>
                      <p className="font-extrabold text-[#0B3C5D] dark:text-slate-100 mt-0.5">
                        {selectedDate} at {selectedTime}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Reason for Visit:</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">{watch("reasonForVisit") || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-250/50 text-[10px] text-yellow-800 dark:text-yellow-450 rounded-xl leading-relaxed font-semibold">
                  ⚠️ Note: This is an appointment request. Our front office coordinators will contact you to finalize approvals within 2 hours.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850 font-bold text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#1E7FC2] text-white font-bold text-xs shadow-md"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-xl bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <span>{uploadProgressText || "Confirming..."}</span>
                  ) : (
                    <span>Confirm Booking</span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;
