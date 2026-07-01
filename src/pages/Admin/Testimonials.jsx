import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Star, Check, Trash2, Heart, ShieldAlert, Clock, User } from "lucide-react";

export function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("pending"); // 'pending' | 'approved'

  // Listen to testimonials collection in real-time
  useEffect(() => {
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnap) => {
        setReviews(querySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load testimonials:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleApprove = async (id, isApproved) => {
    try {
      const docRef = doc(db, "testimonials", id);
      await updateDoc(docRef, { isApproved });
    } catch (err) {
      console.error("Failed to update testimonial approval status:", err);
    }
  };

  const handleToggleFeatured = async (id, isFeaturedOnHome) => {
    try {
      const docRef = doc(db, "testimonials", id);
      await updateDoc(docRef, { isFeaturedOnHome });
    } catch (err) {
      console.error("Failed to update featured status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this testimonial?")) return;
    try {
      await deleteDoc(doc(db, "testimonials", id));
    } catch (err) {
      console.error("Failed to delete testimonial:", err);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterMode === "pending") return !r.isApproved;
    return !!r.isApproved;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">Testimonial Moderator</h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">Approve user-submitted reviews or feature them on the homepage.</p>
      </div>

      {/* Filter Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-850 pb-2 select-none">
        <button
          onClick={() => setFilterMode("pending")}
          className={`px-4 py-2 text-xs font-extrabold rounded-full transition ${
            filterMode === "pending"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-white text-slate-655 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 border border-slate-200/50"
          }`}
        >
          Moderation Queue (Pending Approval)
        </button>
        <button
          onClick={() => setFilterMode("approved")}
          className={`px-4 py-2 text-xs font-extrabold rounded-full transition ${
            filterMode === "approved"
              ? "bg-primary text-white dark:bg-primary-light"
              : "bg-white text-slate-655 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 border border-slate-200/50"
          }`}
        >
          Approved Reviews
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-3 font-semibold text-sm">Loading reviews list...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  {rev.createdAt?.toDate && (
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {rev.createdAt.toDate().toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Body text */}
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">
                  "{rev.reviewText}"
                </p>
              </div>

              {/* Footer info & moderation tools */}
              <div className="pt-4 border-t border-slate-50 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                    {rev.photoUrl ? (
                      <img src={rev.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <User className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight">
                      {rev.patientName}
                    </h4>
                    {rev.treatmentTaken && (
                      <span className="text-[9px] uppercase tracking-wider font-bold text-primary dark:text-primary-light block">
                        {rev.treatmentTaken}
                      </span>
                    )}
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl transition border border-red-100"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {rev.isApproved ? (
                    <>
                      {/* Featured button */}
                      <button
                        onClick={() => handleToggleFeatured(rev.id, !rev.isFeaturedOnHome)}
                        className={`p-2 rounded-xl transition border ${
                          rev.isFeaturedOnHome
                            ? "bg-pink-100 border-pink-200 text-pink-600"
                            : "bg-slate-50 border-slate-200 text-slate-450 hover:bg-slate-100"
                        }`}
                        title={rev.isFeaturedOnHome ? "Unfeature from Home" : "Feature on Homepage Carousel"}
                      >
                        <Heart className={`w-4 h-4 ${rev.isFeaturedOnHome ? "fill-pink-500" : ""}`} />
                      </button>
                      {/* Reject / Unapprove button */}
                      <button
                        onClick={() => handleApprove(rev.id, false)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs rounded-xl"
                      >
                        Unapprove
                      </button>
                    </>
                  ) : (
                    /* Approve button */
                    <button
                      onClick={() => handleApprove(rev.id, true)}
                      className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 text-slate-400 font-semibold">
          No reviews found in this queue.
        </div>
      )}
    </div>
  );
}

export default Testimonials;
