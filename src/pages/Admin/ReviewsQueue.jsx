import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Plus,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";

const REVIEWS_COLLECTION = "testimonials";
const STATUS_OPTIONS = ["pending", "approved", "rejected"];
const SOURCE_OPTIONS = ["Google", "Direct", "WhatsApp", "Other"];

const emptyForm = {
  patientName: "",
  rating: 5,
  reviewText: "",
  source: "Direct",
  status: "approved",
  receivedAt: "",
};

function normalizeStatus(data) {
  if (STATUS_OPTIONS.includes(data.status)) return data.status;
  if (data.isApproved === true) return "approved";
  if (data.isApproved === false) return "pending";
  return "pending";
}

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value.seconds) return new Date(value.seconds * 1000);
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toSortTime(review) {
  return toDate(review.createdAt || review.dateReceived || review.receivedAt)?.getTime() || 0;
}

function normalizeReview(docSnap) {
  const data = docSnap.data();
  const status = normalizeStatus(data);

  return {
    id: docSnap.id,
    ...data,
    patientName: data.patientName || data.name || "Anonymous Patient",
    rating: Math.min(5, Math.max(1, Number(data.rating || 5))),
    reviewText: data.reviewText || data.message || data.review || "",
    source: data.source || data.reviewSource || "Direct",
    status,
  };
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "Recent";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocal(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function StarRating({ value, interactive = false, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= Number(value || 0);
        const IconWrapper = interactive ? "button" : "span";

        return (
          <IconWrapper
            key={starValue}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange(starValue) : undefined}
            className={interactive ? "rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400" : ""}
            aria-label={interactive ? `${starValue} star rating` : undefined}
          >
            <Star
              className={`h-4.5 w-4.5 ${
                filled ? "fill-[#F59E0B] stroke-[#F59E0B]" : "fill-[#D1D5DB] stroke-[#D1D5DB]"
              }`}
            />
          </IconWrapper>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const classes = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${classes[status] || classes.pending}`}>
      {status}
    </span>
  );
}

function SourceBadge({ source }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
      {source || "Direct"}
    </span>
  );
}

export function ReviewsQueue() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState({});
  const [drawerMode, setDrawerMode] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm, receivedAt: toDateTimeLocal() });
  const [saving, setSaving] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
      const all = snap.docs.map(normalizeReview).sort((a, b) => toSortTime(b) - toSortTime(a));
      setReviews(all);
    } catch (error) {
      console.error("Reviews queue load failed:", error);
      setToast({ type: "error", text: error.message || "Failed to load reviews." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => {
    const next = { all: reviews.length, pending: 0, approved: 0, rejected: 0 };
    reviews.forEach((review) => {
      next[review.status] = (next[review.status] || 0) + 1;
    });
    return next;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === "all") return reviews;
    return reviews.filter((review) => review.status === activeFilter);
  }, [activeFilter, reviews]);

  const openAddDrawer = () => {
    setFormData({ ...emptyForm, receivedAt: toDateTimeLocal() });
    setSelectedReview(null);
    setDrawerMode("add");
  };

  const openDetailDrawer = (review) => {
    setSelectedReview(review);
    setDrawerMode("detail");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedReview(null);
  };

  const updateReviewStatus = async (review, status) => {
    const previousReviews = reviews;
    const patch = {
      status,
      isApproved: status === "approved",
      updatedAt: serverTimestamp(),
    };

    setReviews((current) =>
      current.map((item) => (item.id === review.id ? { ...item, ...patch, status } : item))
    );
    if (selectedReview?.id === review.id) {
      setSelectedReview((current) => current ? { ...current, ...patch, status } : current);
    }

    try {
      await updateDoc(doc(db, REVIEWS_COLLECTION, review.id), patch);
      setToast({ type: "success", text: status === "approved" ? "Review approved" : "Review rejected" });
    } catch (error) {
      console.error("Failed to update review status:", error);
      setReviews(previousReviews);
      setToast({ type: "error", text: error.message || "Failed to update review." });
    }
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewToDelete.id));
      setReviews((current) => current.filter((review) => review.id !== reviewToDelete.id));
      if (selectedReview?.id === reviewToDelete.id) closeDrawer();
      setReviewToDelete(null);
      setToast({ type: "success", text: "Review deleted" });
    } catch (error) {
      console.error("Failed to delete review:", error);
      setToast({ type: "error", text: error.message || "Failed to delete review." });
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAddReview = async (event) => {
    event.preventDefault();
    if (!formData.patientName.trim() || !formData.reviewText.trim()) return;

    setSaving(true);
    try {
      const receivedAt = formData.receivedAt ? new Date(formData.receivedAt) : new Date();
      const payload = {
        patientName: formData.patientName.trim(),
        rating: Number(formData.rating),
        reviewText: formData.reviewText.trim(),
        source: formData.source,
        status: formData.status,
        isApproved: formData.status === "approved",
        isActive: true,
        createdAt: Timestamp.fromDate(receivedAt),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), payload);
      const nextReview = normalizeReview({ id: docRef.id, data: () => payload });
      setReviews((current) => [nextReview, ...current].sort((a, b) => toSortTime(b) - toSortTime(a)));
      setToast({ type: "success", text: "Review added" });
      closeDrawer();
    } catch (error) {
      console.error("Failed to add review:", error);
      setToast({ type: "error", text: error.message || "Failed to add review." });
    } finally {
      setSaving(false);
    }
  };

  const renderReviewText = (review) => {
    const isExpanded = expandedRows[review.id];
    const text = review.reviewText || "";
    if (isExpanded || text.length <= 80) return text || "-";

    return (
      <>
        {text.slice(0, 80)}...
        <button
          type="button"
          onClick={() => setExpandedRows((current) => ({ ...current, [review.id]: true }))}
          className="ml-1 font-bold text-[#1E7FC2] hover:underline"
        >
          Read More
        </button>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed right-6 top-6 z-[70] rounded-xl px-4 py-3 text-sm font-bold shadow-xl ${
              toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white md:text-3xl">
            Reviews Queue
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Manage patient reviews and testimonials before they go live on the website.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {["all", "approved", "pending", "rejected"].map((key) => (
            <span key={key} className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              {key === "all" ? "Total" : key[0].toUpperCase() + key.slice(1)}: {counts[key] || 0}
            </span>
          ))}
          <button
            type="button"
            onClick={openAddDrawer}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E7FC2] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0B3C5D]"
          >
            <Plus className="h-4 w-4" />
            Add Review Manually
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending", icon: Clock3 },
          { key: "approved", label: "Approved", icon: CheckCircle2 },
          { key: "rejected", label: "Rejected", icon: XCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeFilter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                active
                  ? "border-[#1E7FC2] bg-[#1E7FC2] text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#1E7FC2] hover:text-[#1E7FC2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{tab.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>
                {counts[tab.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <Star className="h-14 w-14 text-slate-300" />
            <h2 className="mt-4 text-xl font-extrabold text-slate-800 dark:text-white">No reviews yet</h2>
            <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">
              Reviews submitted through the website will appear here.
            </p>
            <button
              type="button"
              onClick={openAddDrawer}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#1E7FC2] px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#0B3C5D]"
            >
              <Plus className="h-4 w-4" />
              Add Review Manually
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-sm font-semibold text-slate-400">No reviews match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:bg-slate-950/40">
                <tr>
                  <th className="px-5 py-4">Patient Name</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Review Text</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Date Received</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="align-top transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">{review.patientName}</td>
                    <td className="px-5 py-4"><StarRating value={review.rating} /></td>
                    <td className="max-w-xs px-5 py-4 text-slate-600 dark:text-slate-300">{renderReviewText(review)}</td>
                    <td className="px-5 py-4"><SourceBadge source={review.source} /></td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {formatDate(review.createdAt || review.dateReceived || review.receivedAt)}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={review.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        {review.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => updateReviewStatus(review, "approved")}
                            className="rounded-lg bg-emerald-50 p-2 text-emerald-700 transition hover:bg-emerald-100"
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {review.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => updateReviewStatus(review, "rejected")}
                            className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDetailDrawer(review)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                          title="View Full"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewToDelete(review)}
                          className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {drawerMode && (
          <div className="fixed inset-0 z-[60] flex justify-end bg-slate-950/50">
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.24 }}
              className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900 md:rounded-l-3xl md:p-8"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {drawerMode === "add" ? "Add Review Manually" : "Review Details"}
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {drawerMode === "add" ? "Create a moderated patient review." : "Review the full submission and moderate it."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  aria-label="Close drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {drawerMode === "detail" && selectedReview ? (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950/40">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedReview.patientName}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">{formatDate(selectedReview.createdAt || selectedReview.dateReceived || selectedReview.receivedAt)}</p>
                      </div>
                      <StatusBadge status={selectedReview.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <StarRating value={selectedReview.rating} />
                      <SourceBadge source={selectedReview.source} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Full Review</h4>
                    <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-100 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:text-slate-300">
                      {selectedReview.reviewText || "-"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                    {selectedReview.status !== "approved" && (
                      <button
                        type="button"
                        onClick={() => updateReviewStatus(selectedReview, "approved")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </button>
                    )}
                    {selectedReview.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => updateReviewStatus(selectedReview, "rejected")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setReviewToDelete(selectedReview)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-5">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Patient Name</span>
                    <input
                      required
                      value={formData.patientName}
                      onChange={(event) => handleFormChange("patientName", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <div className="space-y-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rating</span>
                    <StarRating
                      value={formData.rating}
                      interactive
                      onChange={(value) => handleFormChange("rating", value)}
                    />
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Review Text</span>
                    <textarea
                      required
                      rows={5}
                      value={formData.reviewText}
                      onChange={(event) => handleFormChange("reviewText", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Source</span>
                      <select
                        value={formData.source}
                        onChange={(event) => handleFormChange("source", event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {SOURCE_OPTIONS.map((source) => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Status</span>
                      <select
                        value={formData.status}
                        onChange={(event) => handleFormChange("status", event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Date Received</span>
                    <input
                      type="datetime-local"
                      value={formData.receivedAt}
                      onChange={(event) => handleFormChange("receivedAt", event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#1E7FC2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </label>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row dark:border-slate-800">
                    <button
                      type="button"
                      onClick={closeDrawer}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 rounded-xl bg-[#1E7FC2] px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0B3C5D] disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Review"}
                    </button>
                  </div>
                </form>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reviewToDelete && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Delete review?</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                This will permanently remove the review from the queue.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReviewToDelete(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={saving}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ReviewsQueue;
