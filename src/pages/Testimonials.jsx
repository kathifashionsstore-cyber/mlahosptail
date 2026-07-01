import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useApp } from "../context/AppContext";
import { useForm } from "react-hook-form";
import { uploadImageToImgbb } from "../utils/imgbbUpload";
import { Star, CheckCircle2, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Testimonials() {
  const { treatments, getImageUrl } = useApp();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patientName: "",
      rating: 5,
      reviewText: "",
      treatmentTaken: "",
      photoFile: null,
    },
  });

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "testimonials"), where("isApproved", "==", true), orderBy("createdAt", "desc"));
      const querySnap = await getDocs(q);
      setReviews(querySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) {
      console.error("Failed to load patient reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((rev) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "video") return !!rev.videoUrl;
    return rev.rating === parseInt(activeFilter, 10);
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : "5.0";

  // Auto-advance Carousel slide state for featured reviews
  const [carouselIndex, setCarouselIndex] = useState(0);
  useEffect(() => {
    if (filteredReviews.length <= 1) return;
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % filteredReviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [filteredReviews]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    let photoUrl = "";

    if (data.photoFile && data.photoFile[0]) {
      try {
        const uploadResult = await uploadImageToImgbb(data.photoFile[0]);
        photoUrl = uploadResult.url;
      } catch (err) {
        console.error("Photo upload failed:", err);
      }
    }

    try {
      await addDoc(collection(db, "testimonials"), {
        patientName: data.patientName,
        rating: ratingInput,
        reviewText: data.reviewText,
        treatmentTaken: data.treatmentTaken,
        photoUrl,
        isApproved: false,
        isFeaturedOnHome: false,
        createdAt: serverTimestamp(),
      });
      setFormSubmitted(true);
      reset();
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#D81F26]">Patient Stories</span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight">Patient Experiences</h1>
          <p className="text-sm md:text-base text-slate-200 max-w-2xl font-medium">
            Read stories of recovery and restored mobility shared by our patients.
          </p>
        </div>
      </section>

      {/* 2. Overall Rating stats & filter chips */}
      <section className="py-10 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-b border-slate-100 dark:border-slate-800">
        <div className="lg:col-span-1 bg-[#F4F9FC] dark:bg-slate-900 p-6 rounded-[14px] border flex flex-col md:flex-row items-center justify-around gap-4 shadow-sm">
          <div>
            <span className="text-5xl font-black text-[#0B3C5D] dark:text-white font-serif">{avgRating}</span>
            <span className="text-slate-400 font-bold block mt-1 text-[10px] uppercase tracking-wider">Out of 5.0 Stars</span>
          </div>
          <div className="space-y-1 text-center">
            <div className="flex justify-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(parseFloat(avgRating)) ? "fill-amber-400 stroke-amber-400" : "text-slate-200 dark:text-slate-800"
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
              Based on {totalReviews} Reviews
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="lg:col-span-2 flex flex-wrap gap-2.5 justify-center lg:justify-end select-none">
          {[
            { label: "All Reviews", value: "all" },
            { label: "5 Star", value: "5" },
            { label: "4 Star", value: "4" }
          ].map((filt) => (
            <button
              key={filt.value}
              onClick={() => setActiveFilter(filt.value)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                activeFilter === filt.value
                  ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-md"
                  : "border-transparent text-[#1E7FC2] bg-[#E7F3FA] hover:bg-[#1E7FC2] hover:text-white"
              }`}
            >
              {filt.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Centered Single-Card Testimonials Slider */}
      {filteredReviews.length > 0 && (
        <section className="py-12 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[26px] p-8 md:p-12 shadow-[0_20px_45px_rgba(11,60,93,0.14)] border-t-4 border-t-[#D81F26] text-center space-y-6 min-h-[250px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={carouselIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex justify-center space-x-1">
                  {Array.from({ length: filteredReviews[carouselIndex]?.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>
                
                <blockquote className="text-sm md:text-base italic font-semibold text-slate-650 dark:text-slate-350 leading-relaxed max-w-2xl mx-auto">
                  "{filteredReviews[carouselIndex]?.reviewText}"
                </blockquote>

                <div className="flex items-center justify-center space-x-3.5 pt-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-150 flex-shrink-0 relative">
                    {filteredReviews[carouselIndex]?.photoUrl || getImageUrl(`review-photo-${filteredReviews[carouselIndex]?.id}`, "") ? (
                      <img src={getImageUrl(`review-photo-${filteredReviews[carouselIndex]?.id}`, filteredReviews[carouselIndex]?.photoUrl)} alt={filteredReviews[carouselIndex]?.patientName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400 absolute inset-0 m-auto" />
                    )}
                  </div>
                  <div className="text-left">
                    <h4 className="font-extrabold text-sm text-[#0B3C5D] dark:text-white leading-tight">
                      {filteredReviews[carouselIndex]?.patientName}
                    </h4>
                    {filteredReviews[carouselIndex]?.treatmentTaken && (
                      <span className="text-[9px] font-extrabold text-[#1E7FC2] uppercase tracking-wider block mt-0.5">
                        Recovered from: {filteredReviews[carouselIndex]?.treatmentTaken}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider dots indicators */}
            <div className="flex justify-center space-x-1.5 pt-6 border-t border-slate-50 dark:border-slate-800">
              {filteredReviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    carouselIndex === idx ? "w-5 bg-[#D81F26]" : "w-1.5 bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Share Your Story Form Section */}
      <section className="py-16 px-6 md:px-12 bg-[#F4F9FC] dark:bg-slate-900/10 border-t border-slate-150/40">
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-[26px] border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-[0_20px_45px_rgba(11,60,93,0.1)]">
          {formSubmitted ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-extrabold text-[#0B3C5D] dark:text-white font-serif">Review Submitted!</h3>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-sm mx-auto">
                Thank you for sharing your feedback. Your review will appear on the site once approved by our moderator desk.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-2 text-xs font-bold text-[#D81F26] hover:underline"
              >
                Submit another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-xl font-extrabold text-[#0B3C5D] dark:text-white font-serif">Share Your Story</h3>
                <p className="text-xs font-semibold text-slate-400">
                  Help other patient families by detailing your surgical recovery.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anand Kumar"
                  {...register("patientName", { required: "Name is required" })}
                  className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                />
                {errors.patientName && <p className="text-[#D81F26] text-[10px] font-bold">{errors.patientName.message}</p>}
              </div>

              {/* Treatment Undergone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Treatment Undergone
                </label>
                <select
                  {...register("treatmentTaken", { required: "Treatment is required" })}
                  className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                >
                  <option value="">-- Select Treatment --</option>
                  {treatments.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.treatmentTaken && <p className="text-[#D81F26] text-[10px] font-bold">{errors.treatmentTaken.message}</p>}
              </div>

              {/* Star Rating Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Rating Selection
                </label>
                <div className="flex space-x-2 py-1 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 transition ${
                          star <= ratingInput ? "fill-amber-400 stroke-amber-400 scale-105" : "text-slate-200 dark:text-slate-800"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Your Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("photoFile")}
                  className="w-full text-xs text-slate-405 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-[#E7F3FA] file:text-[#1E7FC2] hover:file:bg-[#1E7FC2] hover:file:text-white cursor-pointer"
                />
              </div>

              {/* Feedback text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Patient Story / Feedback
                </label>
                <textarea
                  placeholder="Detail your care, pain relief results, and hospital experience..."
                  rows="4"
                  {...register("reviewText", { required: "Review text is required" })}
                  className="w-full bg-[#F4F9FC] dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#1E7FC2] focus:border-[#1E7FC2] text-slate-850 dark:text-slate-100 transition"
                />
                {errors.reviewText && <p className="text-[#D81F26] text-[10px] font-bold">{errors.reviewText.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold py-3 rounded-xl shadow-md transition duration-150 text-xs disabled:opacity-50"
              >
                {submitting ? "Submitting Review..." : "Submit Review for Moderation"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default Testimonials;
