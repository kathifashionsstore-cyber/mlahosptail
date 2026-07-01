import { collection, getDocs, query, where } from "firebase/firestore";

export const REVIEWS_COLLECTION = "testimonials";

export function getReviewStatus(review) {
  if (review?.status) return review.status;
  return review?.isApproved === true ? "approved" : "pending";
}

export function isApprovedReview(review) {
  const status = getReviewStatus(review);
  return status === "approved" || (review?.status === undefined && review?.isApproved === true);
}

export function getReviewTime(review) {
  const value = review?.createdAt || review?.dateReceived || review?.receivedAt;
  if (!value) return 0;
  if (value.toDate) return value.toDate().getTime();
  if (value.seconds) return value.seconds * 1000;

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeReview(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    patientName: data.patientName || data.name || "Anonymous Patient",
    reviewText: data.reviewText || data.message || data.review || "",
    source: data.source || "Direct",
    status: getReviewStatus(data),
  };
}

export async function fetchApprovedReviews(db, fallbackReviews = []) {
  const approvedByStatus = query(collection(db, REVIEWS_COLLECTION), where("status", "==", "approved"));
  const approvedByLegacyFlag = query(collection(db, REVIEWS_COLLECTION), where("isApproved", "==", true));

  const results = await Promise.allSettled([
    getDocs(approvedByStatus),
    getDocs(approvedByLegacyFlag),
  ]);

  const reviewMap = new Map();
  results.forEach((result) => {
    if (result.status !== "fulfilled") {
      console.error("Approved reviews query failed:", result.reason);
      return;
    }

    result.value.docs.forEach((docSnap) => {
      const review = normalizeReview(docSnap);
      if (isApprovedReview(review)) {
        reviewMap.set(review.id, review);
      }
    });
  });

  const reviews = Array.from(reviewMap.values()).sort((a, b) => getReviewTime(b) - getReviewTime(a));

  if (reviews.length > 0) return reviews;
  return fallbackReviews.filter(isApprovedReview).sort((a, b) => getReviewTime(b) - getReviewTime(a));
}
