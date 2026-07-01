import admin from "firebase-admin";

export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const host = req.headers.host || "mlahospital.com";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const baseUrl = `${protocol}://${host}`;

  // Initialize firebase-admin if not already initialized
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

  try {
    const db = admin.firestore();

    // Fetch dynamic content from Firestore
    const [doctorsSnap, servicesSnap, blogsSnap] = await Promise.all([
      db.collection("doctors").get(),
      db.collection("services").get(),
      db.collection("blogs").get()
    ]);

    const staticPages = [
      { path: "", changefreq: "daily", priority: "1.0" },
      { path: "/about", changefreq: "weekly", priority: "0.8" },
      { path: "/our-story", changefreq: "monthly", priority: "0.6" },
      { path: "/leadership", changefreq: "monthly", priority: "0.6" },
      { path: "/facilities", changefreq: "monthly", priority: "0.7" },
      { path: "/doctors", changefreq: "weekly", priority: "0.8" },
      { path: "/services", changefreq: "weekly", priority: "0.9" },
      { path: "/patient-care", changefreq: "monthly", priority: "0.7" },
      { path: "/book-appointment", changefreq: "monthly", priority: "0.9" },
      { path: "/video-consultation", changefreq: "monthly", priority: "0.8" },
      { path: "/testimonials", changefreq: "weekly", priority: "0.7" },
      { path: "/patient-stories", changefreq: "weekly", priority: "0.7" },
      { path: "/gallery", changefreq: "weekly", priority: "0.6" },
      { path: "/blog", changefreq: "daily", priority: "0.8" },
      { path: "/careers", changefreq: "weekly", priority: "0.7" },
      { path: "/contact", changefreq: "monthly", priority: "0.9" },
      { path: "/emergency", changefreq: "monthly", priority: "0.9" }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // 1. Add static URLs
    staticPages.forEach((page) => {
      xml += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // 2. Add dynamic doctors URLs
    doctorsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false) {
        xml += `
  <url>
    <loc>${baseUrl}/doctors/${doc.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    // 3. Add dynamic services URLs
    servicesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false && data.status !== "draft") {
        const category = data.category || "orthopaedics";
        xml += `
  <url>
    <loc>${baseUrl}/services/${category}/${data.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    });

    // 4. Add dynamic blogs URLs
    blogsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false && data.status !== "draft") {
        xml += `
  <url>
    <loc>${baseUrl}/blog/${data.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    });

    xml += `
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Failed to generate dynamic sitemap:", error);
    // Return a minimal fallback sitemap in case of error so search engines don't break
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    return res.status(200).send(fallbackXml);
  }
}
