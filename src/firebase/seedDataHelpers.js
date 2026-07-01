import {
  siteSettingsData,
  aboutContentData,
  awardsData,
  statisticsData,
  whyChooseUsData,
  departmentsData,
  doctorsData,
  heroSlidesData,
  serviceCategoriesData,
  allTreatmentsData,
  servicesData,
  insurancePartnersData,
  faqsData,
  testimonialsData,
} from "../data/hospitalData.js";
import { expandCondition } from "../utils/conditionExpander.js";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1400&q=85",
];

const TREATMENT_IMAGES = {
  orthopaedics: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85",
  spine: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&w=1200&q=85",
  trauma: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=85",
  "specialty-programs": "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=1200&q=85",
  "general-ortho": "https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1200&q=85",
};

const SERVICE_ICONS = {
  "operation-theatre": "ShieldCheck",
  icu: "Activity",
  laboratory: "FlaskConical",
  pharmacy: "Pill",
  opd: "Stethoscope",
  ambulance: "Ambulance",
  "insurance-tpa-desk": "FileText",
  "pulmonology-consultation": "Wind",
  "dermatology-consultation": "Sparkles",
  "general-medicine-consultation": "UserCheck",
  "physiotherapy-rehabilitation": "Dumbbell",
};

const RELATED_DOCTORS_BY_DEPARTMENT = {
  orthopaedics: ["dr-aravinda-babu", "dr-aditya", "dr-rambabu"],
  spine: ["dr-aditya", "dr-aravinda-babu"],
  trauma: ["dr-aravinda-babu", "dr-rambabu"],
  "specialty-programs": ["dr-aravinda-babu"],
  "general-ortho": ["dr-aravinda-babu", "dr-rambabu"],
  pulmonology: ["dr-krishna-mohan"],
  dermatology: ["dr-poornima-sridevi"],
  "general-medicine": ["dr-sk-galib", "dr-rama-mohan"],
};

const BLOGS_DATA = [
  {
    id: "understanding-knee-arthritis",
    title: "Understanding Knee Arthritis Before It Limits Daily Life",
    slug: "understanding-knee-arthritis",
    category: "Bone Health",
    excerpt: "Early signs, warning patterns, and when to seek an orthopaedic opinion for knee pain.",
    content:
      "Knee arthritis often starts as stiffness after rest, pain on stairs, or swelling after a longer walk. Early assessment helps patients delay progression with weight management, physiotherapy, injections, and timely surgical planning when needed.",
    authorName: "Amulya Nursing Home",
    thumbnailUrl: TREATMENT_IMAGES.orthopaedics,
    publishedAt: "2026-06-01T09:00:00.000Z",
    isPublished: true,
    views: 0,
    order: 1,
  },
  {
    id: "what-to-do-after-fracture",
    title: "What Families Should Do Immediately After a Suspected Fracture",
    slug: "what-to-do-after-fracture",
    category: "Trauma Care",
    excerpt: "Practical first steps before reaching a trauma casualty department.",
    content:
      "Do not force the injured limb into position. Keep the person still, support the injured area, avoid food or water if surgery may be needed, and reach a trauma facility as quickly as possible.",
    authorName: "Amulya Nursing Home",
    thumbnailUrl: TREATMENT_IMAGES.trauma,
    publishedAt: "2026-06-08T09:00:00.000Z",
    isPublished: true,
    views: 0,
    order: 2,
  },
  {
    id: "recovering-after-joint-replacement",
    title: "Recovery After Joint Replacement: Why Physiotherapy Matters",
    slug: "recovering-after-joint-replacement",
    category: "Recovery",
    excerpt: "Consistent guided movement is central to long-term pain relief and mobility after surgery.",
    content:
      "Joint replacement recovery is not only about the implant. Early guided movement, wound care, pain control, and steady physiotherapy determine how comfortably a patient returns to walking and daily activity.",
    authorName: "Amulya Nursing Home",
    thumbnailUrl: TREATMENT_IMAGES["general-ortho"],
    publishedAt: "2026-06-15T09:00:00.000Z",
    isPublished: true,
    views: 0,
    order: 3,
  },
];

const GALLERY_ALBUMS_DATA = [
  {
    id: "hospital-infrastructure",
    title: "Hospital Infrastructure",
    description: "Exterior, reception, wards, and accessible patient spaces.",
    coverImageUrl: HERO_IMAGES[0],
    order: 1,
    isActive: true,
  },
  {
    id: "operation-theatres",
    title: "Operation Theatres",
    description: "Surgical theatres, C-arm support, and orthopaedic operating setup.",
    coverImageUrl: HERO_IMAGES[3],
    order: 2,
    isActive: true,
  },
  {
    id: "icu-and-diagnostics",
    title: "ICU & Diagnostics",
    description: "Trauma ICU, in-house laboratory, and round-the-clock support services.",
    coverImageUrl: HERO_IMAGES[2],
    order: 3,
    isActive: true,
  },
];

const GALLERY_IMAGES_DATA = [
  { id: "hospital-exterior-main", albumId: "hospital-infrastructure", category: "Hospital", imageUrl: HERO_IMAGES[0], caption: "Amulya Nursing Home patient care facility", altText: "Amulya nursing home building and patient care facility", order: 1, isActive: true, status: "published", isFeatured: true },
  { id: "operation-theatre-main", albumId: "operation-theatres", category: "Operation Theatre", imageUrl: HERO_IMAGES[3], caption: "Advanced orthopaedic operation theatre support", altText: "Modern orthopaedic operation theatre", order: 2, isActive: true, status: "published", isFeatured: true },
  { id: "diagnostic-support-main", albumId: "icu-and-diagnostics", category: "Emergency", imageUrl: HERO_IMAGES[2], caption: "Emergency and diagnostic support services", altText: "Emergency and diagnostic hospital support", order: 3, isActive: true, status: "published", isFeatured: false },
];

const WELCOME_BANNER_DATA = [
  {
    id: "main",
    slot: "main",
    backgroundImageUrl: HERO_IMAGES[0],
    backgroundVideoUrl: "",
    logoUrl: "/logo.png",
    kicker: "Welcome to",
    heading: "Amulya Nursing Home",
    subheading: "Spine, Joint & Trauma Care",
    tagline: "Your Health, Our Commitment",
    developerCredit: "Website Designed & Developed by WayZenTech",
    phoneNumber: "9398724704",
    displayDurationSeconds: 4,
    displayFrequency: "session",
    animationStyle: "luxury-fade",
    overlayColor: "#06263A",
    overlayOpacity: 0.64,
    buttonText: "Enter Website",
    buttonLink: "/",
    publishDate: "",
    expiryDate: "",
    status: "published",
    order: 1,
    isActive: true,
  },
];

const FESTIVAL_BANNERS_DATA = [
  {
    id: "healthy-mobility-campaign",
    title: "Healthy Mobility Awareness",
    subtitle: "Seasonal awareness banner for joint, spine, and trauma care.",
    imageUrl: HERO_IMAGES[1],
    ctaText: "Book Consultation",
    ctaLink: "/book-appointment",
    startDate: "",
    endDate: "",
    order: 1,
    isActive: false,
  },
];

const SEO_SETTINGS_DATA = [
  {
    id: "home",
    page: "/",
    title: "Amulya Nursing Home | Orthopaedic Hospital in Narasaraopet",
    description: "Orthopaedics, trauma, spine care, joint replacement, ICU, laboratory, and pharmacy services in Narasaraopet.",
    keywords: "Amulya Nursing Home, orthopaedic hospital Narasaraopet, trauma care, joint replacement",
    imageUrl: HERO_IMAGES[0],
    order: 1,
    isActive: true,
  },
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function textExcerpt(value, fallback) {
  const text = String(value || fallback || "").replace(/\s+/g, " ").trim();
  return text.length > 170 ? `${text.slice(0, 167)}...` : text;
}

function withId(item, fallbackPrefix, index) {
  const id = item.id || item.slug || slugify(item.name || item.title || item.label) || `${fallbackPrefix}-${index + 1}`;
  return { id, ...item };
}

function normalizeDepartment(item, index) {
  const normalized = withId(item, "department", index);
  const slug = normalized.slug || normalized.id;
  return {
    ...normalized,
    id: normalized.id || slug,
    slug,
    isActive: normalized.isActive !== false,
    order: Number(normalized.order || index + 1),
  };
}

function normalizeDoctor(item, index) {
  const normalized = withId(item, "doctor", index);
  const departmentId = item.departmentId || item.department || "orthopaedics";
  return {
    ...normalized,
    departmentId,
    specialization: Array.isArray(item.specialization) ? item.specialization : [],
    languages: Array.isArray(item.languages) ? item.languages : [],
    consultationDays: Array.isArray(item.consultationDays) ? item.consultationDays : [],
    experienceYears: Number(item.experienceYears || 0),
    isActive: item.isActive !== false,
    isFeaturedOnHome: !!item.isFeaturedOnHome,
    order: Number(item.order || index + 1),
  };
}

function normalizeHeroSlide(item, index) {
  const normalized = withId(item, "hero-slide", index);
  return {
    ...normalized,
    imageUrl: item.imageUrl || HERO_IMAGES[index % HERO_IMAGES.length],
    isActive: item.isActive !== false,
    order: Number(item.order || index + 1),
  };
}

function normalizeServiceCategory(item, index) {
  const normalized = withId(item, "service-category", index);
  const slug = normalized.slug || normalized.id;
  return {
    ...normalized,
    id: normalized.id || slug,
    slug,
    isActive: normalized.isActive !== false,
    order: Number(normalized.order || index + 1),
  };
}

function normalizeTreatment(item, index) {
  const normalized = withId(item, "treatment", index);
  const departmentId = item.departmentId || item.department || "orthopaedics";
  const slug = item.slug || normalized.id;
  return {
    ...normalized,
    id: normalized.id || slug,
    slug,
    departmentId,
    shortDescription: item.shortDescription || textExcerpt(item.description, item.name),
    thumbnailUrl: item.thumbnailUrl || TREATMENT_IMAGES[departmentId] || TREATMENT_IMAGES.orthopaedics,
    treatmentProcess: item.treatmentProcess || (Array.isArray(item.stepByStepAtHospital) ? item.stepByStepAtHospital.join("\n") : ""),
    symptoms: Array.isArray(item.symptoms) ? item.symptoms : [],
    causes: Array.isArray(item.causes) ? item.causes : [],
    benefits: Array.isArray(item.benefits) ? item.benefits : [],
    recoveryTimeline: Array.isArray(item.recoveryTimeline) ? item.recoveryTimeline : [],
    quickFacts: Array.isArray(item.quickFacts) ? item.quickFacts : [],
    stepByStepAtHospital: Array.isArray(item.stepByStepAtHospital) ? item.stepByStepAtHospital : [],
    whatToDoAtHome: Array.isArray(item.whatToDoAtHome) ? item.whatToDoAtHome : [],
    beforeAfterInfo: item.beforeAfterInfo || { before: [], after: [] },
    faqs: Array.isArray(item.faqs) ? item.faqs : [],
    relatedDoctorIds: item.relatedDoctorIds || RELATED_DOCTORS_BY_DEPARTMENT[departmentId] || ["dr-aravinda-babu"],
    isActive: item.isActive !== false,
    isFeaturedOnHome: item.isFeaturedOnHome !== undefined ? !!item.isFeaturedOnHome : index < 6,
    order: Number(item.order || index + 1),
  };
}

function normalizeService(item, index, allList = []) {
  const categoryId = item.categoryId || item.category || "orthopaedics";
  
  let baseItem = item;
  if (categoryId === "orthopaedics") {
    baseItem = expandCondition(item, index, allList);
  }

  const normalized = withId(baseItem, "service", index);
  const slug = baseItem.slug || normalized.id;
  
  return {
    ...normalized,
    id: normalized.id || slug,
    slug,
    categoryId,
    icon: baseItem.icon || "Activity",
    shortDescription: baseItem.shortDescription || baseItem.description?.slice(0, 150) || "",
    description: baseItem.description || "",
    types: baseItem.types || null,
    causes: baseItem.causes || [],
    symptoms: baseItem.symptoms || [],
    diagnosis: baseItem.diagnosis || [],
    treatmentOptions: baseItem.treatmentOptions || { nonSurgical: [], surgical: [] },
    whyChooseUs: baseItem.whyChooseUs || [],
    prevention: baseItem.prevention || [],
    whenToSeeDoctor: baseItem.whenToSeeDoctor || [],
    galleryImages: baseItem.galleryImages || [],
    faqs: baseItem.faqs || [],
    relatedConditions: baseItem.relatedConditions || [],
    relatedDoctorIds: baseItem.relatedDoctorIds || ["dr-aravinda-babu"],
    contentType: baseItem.contentType || "condition",
    status: baseItem.status || "published",
    relatedServiceSlugs: baseItem.relatedServiceSlugs || [],
    heroImageUrl: baseItem.heroImageUrl || "",
    seoTitle: baseItem.seoTitle || baseItem.metaTitle || "",
    seoDescription: baseItem.seoDescription || baseItem.metaDescription || "",
    seoKeywords: baseItem.seoKeywords || "",
    isActive: baseItem.isActive !== false,
    order: Number(baseItem.order || index + 1),
  };
}

function normalizeSimple(item, fallbackPrefix, index) {
  const normalized = withId(item, fallbackPrefix, index);
  return {
    ...normalized,
    isActive: item.isActive !== false,
    order: Number(item.order || index + 1),
  };
}

export function buildSeedPlan() {
  const settings = {
    ...siteSettingsData,
    logoUrl: siteSettingsData.logoUrl || "/logo.png",
    faviconUrl: siteSettingsData.faviconUrl || "/favicon.svg",
  };

  return {
    singletons: [
      { collectionName: "siteSettings", id: "general", data: settings },
      { collectionName: "aboutContent", id: "main", data: aboutContentData },
    ],
    collections: [
      { collectionName: "awards", data: awardsData.map((item, index) => normalizeSimple(item, "award", index)) },
      { collectionName: "statistics", data: statisticsData.map((item, index) => normalizeSimple(item, "statistic", index)) },
      { collectionName: "whyChooseUs", data: whyChooseUsData.map((item, index) => normalizeSimple(item, "why-choose-us", index)) },
      { collectionName: "departments", data: departmentsData.map(normalizeDepartment) },
      { collectionName: "doctors", data: doctorsData.map(normalizeDoctor) },
      { collectionName: "heroSlides", data: heroSlidesData.map(normalizeHeroSlide) },
      { collectionName: "serviceCategories", data: serviceCategoriesData.map(normalizeServiceCategory) },
      { collectionName: "treatments", data: allTreatmentsData.map(normalizeTreatment) },
      { collectionName: "services", data: servicesData.map((item, index) => normalizeService(item, index, servicesData)) },
      { collectionName: "insurancePartners", data: insurancePartnersData.map((item, index) => normalizeSimple(item, "insurance", index)) },
      { collectionName: "faqs", data: faqsData.map((item, index) => normalizeSimple(item, "faq", index)) },
      { collectionName: "testimonials", data: testimonialsData.map((item, index) => withId(item, "testimonial", index)) },
      { collectionName: "blogs", data: BLOGS_DATA },
      { collectionName: "galleryAlbums", data: GALLERY_ALBUMS_DATA },
      { collectionName: "galleryImages", data: GALLERY_IMAGES_DATA },
      { collectionName: "welcomeBanner", data: WELCOME_BANNER_DATA },
      { collectionName: "festivalBanners", data: FESTIVAL_BANNERS_DATA },
      { collectionName: "seoSettings", data: SEO_SETTINGS_DATA },
    ],
  };
}

async function commitBatch(db, writeBatch, operations) {
  for (let i = 0; i < operations.length; i += 450) {
    const batch = writeBatch(db);
    operations.slice(i, i + 450).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

export async function applySeedPlan({ db, firestore, force = false, logger = console.log }) {
  const { collection, doc, getDoc, getDocs, writeBatch } = firestore;
  const plan = buildSeedPlan();
  const messages = [];
  const counts = {};

  const log = (message) => {
    messages.push(message);
    logger(message);
  };

  for (const singleton of plan.singletons) {
    const docRef = doc(db, singleton.collectionName, singleton.id);
    const existing = await getDoc(docRef);
    if (existing.exists() && !force) {
      counts[singleton.collectionName] = 0;
      log(`Skipped ${singleton.collectionName}/${singleton.id} - already exists.`);
      continue;
    }

    const batch = writeBatch(db);
    batch.set(docRef, singleton.data);
    await batch.commit();
    counts[singleton.collectionName] = 1;
    log(`Seeded ${singleton.collectionName}/${singleton.id}.`);
  }

  for (const target of plan.collections) {
    const colRef = collection(db, target.collectionName);
    const existing = await getDocs(colRef);

    if (!existing.empty && !force) {
      counts[target.collectionName] = 0;
      log(`Skipped ${target.collectionName} - already has ${existing.size} documents.`);
      continue;
    }

    if (!existing.empty && force) {
      await commitBatch(
        db,
        writeBatch,
        existing.docs.map((docSnap) => (batch) => batch.delete(docSnap.ref))
      );
      log(`Cleared ${existing.size} existing documents from ${target.collectionName}.`);
    }

    await commitBatch(
      db,
      writeBatch,
      target.data.map((item) => {
        const { id, ...data } = item;
        const docId = id || slugify(data.slug || data.name || data.title);
        return (batch) => batch.set(doc(db, target.collectionName, docId), { id: docId, ...data });
      })
    );
    counts[target.collectionName] = target.data.length;
    log(`Seeded ${target.data.length} documents into ${target.collectionName}.`);
  }

  log("SEEDING COMPLETE.");
  return { status: "seeded", counts, messages };
}
