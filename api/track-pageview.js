import admin from "firebase-admin";

const ipCache = new Map();

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "127.0.0.1"
  ).split(",")[0].trim();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { page, timestamp } = req.body;
  if (!page || !timestamp) {
    return res.status(400).json({ error: "Missing page or timestamp parameter" });
  }

  const ip = getClientIp(req);
  const cacheKey = `${ip}:${page}`;
  const now = Date.now();
  if (ipCache.has(cacheKey)) {
    const lastWrite = ipCache.get(cacheKey);
    if (now - lastWrite < 10000) {
      return res.status(200).json({ success: true, rateLimited: true });
    }
  }
  ipCache.set(cacheKey, now);

  try {
    let sanitizedPage = page.replace(/^\//, "").replace(/\//g, "_").toLowerCase();
    sanitizedPage = sanitizedPage.replace(/[^a-z0-9_-]/g, "");
    if (!sanitizedPage) {
      sanitizedPage = "home";
    }

    const dateObj = new Date(timestamp);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const docKey = `${sanitizedPage}_${dateStr}`;

    if (!admin.apps.length) {
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountKey) {
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(serviceAccountKey);
        } catch (e) {
          serviceAccount = JSON.parse(Buffer.from(serviceAccountKey, "base64").toString("utf8"));
        }
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        admin.initializeApp({
          projectId: process.env.VITE_FIREBASE_PROJECT_ID || "mlahosptail"
        });
      }
    }

    const db = admin.firestore();
    const docRef = db.collection("pageViews").doc(docKey);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      await docRef.update({
        count: admin.firestore.FieldValue.increment(1),
        lastVisited: new Date().toISOString()
      });
    } else {
      await docRef.set({
        page,
        date: dateStr,
        count: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastVisited: new Date().toISOString()
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Firestore page view tracking failure:", error);
    return res.status(500).json({ error: error.message || "Firestore failure" });
  }
}
