import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, onSnapshot, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { seedDatabase } from "../firebase/seed";
import { buildSeedPlan } from "../firebase/seedDataHelpers";

// Utility to wrap a promise in a timeout
export function withTimeout(promise, timeoutMs = 1500) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

const AppContext = createContext();
const fallbackSeedPlan = buildSeedPlan();
const fallbackSettingsData = fallbackSeedPlan.singletons.find((item) => item.collectionName === "siteSettings")?.data || {};
const getFallbackCollection = (collectionName) =>
  fallbackSeedPlan.collections.find((item) => item.collectionName === collectionName)?.data || [];

function isWithinSchedule(item) {
  const now = Date.now();
  const publishAt = item?.publishDate ? new Date(item.publishDate).getTime() : null;
  const expiryAt = item?.expiryDate ? new Date(item.expiryDate).getTime() : null;

  if (publishAt && Number.isFinite(publishAt) && now < publishAt) return false;
  if (expiryAt && Number.isFinite(expiryAt) && now > expiryAt) return false;
  return true;
}

function isPublicDocumentLive(item) {
  const status = item?.status || "published";
  return item?.isActive !== false && status !== "draft" && status !== "archived" && isWithinSchedule(item);
}

function sortByOrder(list) {
  return [...list].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
}

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [theme, setTheme] = useState("light");

  // Cache collections
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [siteImages, setSiteImages] = useState({});
  const [welcomeBanner, setWelcomeBanner] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementSettings, setAnnouncementSettings] = useState(null);
  const [festivalBanners, setFestivalBanners] = useState([]);

  // Search index for global search
  const [searchIndex, setSearchIndex] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "siteImages"),
      (snapshot) => {
        const imagesMap = {};
        snapshot.forEach((docSnap) => {
          imagesMap[docSnap.id] = docSnap.data();
        });
        setSiteImages(imagesMap);
      },
      (err) => {
        console.error("Failed to subscribe to site image slots:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fallbackBanner = getFallbackCollection("welcomeBanner").find(isPublicDocumentLive) || null;

    const unsubscribe = onSnapshot(
      collection(db, "welcomeBanner"),
      (snapshot) => {
        const banners = snapshot.empty
          ? fallbackBanner ? [fallbackBanner] : []
          : snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

        const activeBanners = banners.filter(isPublicDocumentLive);
        setWelcomeBanner(sortByOrder(activeBanners)[0] || null);
      },
      (err) => {
        console.error("Failed to subscribe to welcome banner:", err);
        setWelcomeBanner(fallbackBanner);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "announcements"),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        const activeSorted = list
          .filter(a => a.isActive !== false)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
        setAnnouncements(activeSorted);
      },
      (err) => {
        console.error("Failed to subscribe to announcements:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "siteSettings", "announcementBar"),
      (snapshot) => {
        if (snapshot.exists()) {
          setAnnouncementSettings(snapshot.data());
        } else {
          setAnnouncementSettings({ showAnnouncementBar: true });
        }
      },
      (err) => {
        console.error("Failed to subscribe to announcement settings:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "festivalBanners"),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        const activeSorted = list
          .filter(b => b.isActive !== false)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
        setFestivalBanners(activeSorted);
      },
      (err) => {
        console.error("Failed to subscribe to festival banners:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time enquiries subscription
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "enquiries"),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setEnquiries(list);
        const pendingCount = list.filter((e) => e.status === "pending" || e.status === "unread" || !e.status).length;
        setPendingEnquiriesCount(pendingCount);
      },
      (err) => {
        console.error("Failed to subscribe to enquiries in AppContext:", err);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time typography settings - Google Fonts dynamic injection
  useEffect(() => {
    function injectGoogleFonts(headingFont, bodyFont) {
      const fonts = [headingFont, bodyFont].filter(Boolean);
      if (fonts.length === 0) return;
      
      const fontId = "dynamic-google-fonts";
      let link = document.getElementById(fontId);
      if (!link) {
        link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      
      const formattedNames = fonts.map(f => f.replace(/\s+/g, "+")).join("&family=");
      link.href = `https://fonts.googleapis.com/css2?family=${formattedNames}:wght@300;400;500;600;700;800;900&display=swap`;
    }

    const unsubscribe = onSnapshot(
      doc(db, "siteSettings", "typography"),
      (snapshot) => {
        const root = document.documentElement;
        if (snapshot.exists()) {
          const data = snapshot.data();
          const headingFont = data.headingFont || "Poppins";
          const bodyFont = data.bodyFont || "Inter";
          const fontSize = data.fontSize || 16;
          const headingWeight = data.headingWeight || "700";

          root.style.setProperty("--font-heading", `'${headingFont}', sans-serif`);
          root.style.setProperty("--font-body", `'${bodyFont}', sans-serif`);
          root.style.setProperty("--font-size-base", `${fontSize}px`);
          root.style.setProperty("--font-heading-weight", `${headingWeight}`);

          injectGoogleFonts(headingFont, bodyFont);
        } else {
          root.style.setProperty("--font-heading", "'Poppins', sans-serif");
          root.style.setProperty("--font-body", "'Inter', sans-serif");
          root.style.setProperty("--font-size-base", "16px");
          root.style.setProperty("--font-heading-weight", "700");
          injectGoogleFonts("Poppins", "Inter");
        }
      },
      (err) => {
        console.error("Failed to subscribe to typography settings:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const configs = [
      { collectionName: "doctors", setter: setDoctors },
      { collectionName: "departments", setter: setDepartments },
      { collectionName: "treatments", setter: setTreatments },
      { collectionName: "serviceCategories", setter: setCategories },
      { collectionName: "services", setter: setServices },
      { collectionName: "insurancePartners", setter: setInsurance },
    ];

    const unsubscribers = configs.map(({ collectionName, setter }) => {
      const fallbackList = getFallbackCollection(collectionName).filter(isPublicDocumentLive);

      return onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
          const list = snapshot.empty
            ? fallbackList
            : snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

          const processed = list.filter(isPublicDocumentLive);
          setter(sortByOrder(processed));
        },
        (err) => {
          console.error(`Failed to subscribe to ${collectionName}:`, err);
          setter(sortByOrder(fallbackList));
        }
      );
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  // App Startup Timeout (NEVER remain longer than 2 seconds)
  useEffect(() => {
    console.time("App Startup");
    const timeoutId = setTimeout(() => {
      console.warn("Startup timeout reached (2000ms). Forcing loader to hide.");
      setLoading(false);
      console.timeEnd("App Startup");
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  // 1. Initial Load: Check database status and seed if needed, then fetch settings
  useEffect(() => {
    console.time("Settings Load");
    const settingsRef = doc(db, "siteSettings", "general");

    const unsubscribe = onSnapshot(
      settingsRef,
      async (docSnap) => {
        console.timeLog("Settings Load", "onSnapshot settings fired");
        if (!docSnap.exists()) {
          console.log("No site settings found. Seeding database with initial structures...");
          try {
            console.time("Auto Seeding");
            await seedDatabase();
            console.timeEnd("Auto Seeding");
          } catch (err) {
            console.error("Auto-seeding failed:", err);
          }
          applySettingsData(fallbackSettingsData);
          await loadCollections();
        } else {
          applySettingsData(docSnap.data());
          await loadCollections();
          try {
            console.timeEnd("Settings Load");
          } catch (e) {}
          try {
            console.timeEnd("App Startup");
          } catch (e) {}
        }
      },
      (err) => {
        console.error("onSnapshot settings failed:", err);
        applySettingsData(fallbackSettingsData);
        loadCollections();
        try {
          console.timeEnd("Settings Load");
        } catch (e) {}
        try {
          console.timeEnd("App Startup");
        } catch (e) {}
        setLoading(false); // Fail gracefully, hide loading screen
      }
    );

    return () => unsubscribe();
  }, []);

  // Utility to adjust color brightness (hex to hex)
  function adjustColorBrightness(hex, percent) {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = R > 0 ? R : 0;
    G = G > 0 ? G : 0;
    B = B > 0 ? B : 0;

    const rHex = R.toString(16).padStart(2, "0");
    const gHex = G.toString(16).padStart(2, "0");
    const bHex = B.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  }

  function applySettingsData(data) {
    setSettings(data);

    const defaultColors = {
      primaryColor: "#1E7FC2",
      primaryDarkColor: "#061F33",
      accentColor: "#2FA84F",
      bgColor: "#FFFFFF",
      textColor: "#152431",
      navBgColor: "#07365A",
      cardBgColor: "#FFFFFF",
      buttonColor: "#D81F26",
      buttonHoverColor: "#b3151b",
      headingColor: "#07365A",
      borderColor: "#E2E8F0"
    };

    const themeData = data?.themeConfig || defaultColors;
    const root = document.documentElement;

    root.style.setProperty("--color-primary", themeData.primaryColor || defaultColors.primaryColor);
    root.style.setProperty("--color-primary-dark", themeData.primaryDarkColor || defaultColors.primaryDarkColor);
    root.style.setProperty("--color-accent", themeData.accentColor || defaultColors.accentColor);
    root.style.setProperty("--color-bg", themeData.bgColor || defaultColors.bgColor);
    root.style.setProperty("--color-text", themeData.textColor || defaultColors.textColor);
    root.style.setProperty("--color-nav-bg", themeData.navBgColor || defaultColors.navBgColor);
    root.style.setProperty("--color-card-bg", themeData.cardBgColor || defaultColors.cardBgColor);
    root.style.setProperty("--color-button", themeData.buttonColor || defaultColors.buttonColor);
    root.style.setProperty("--color-button-hover", themeData.buttonHoverColor || defaultColors.buttonHoverColor);
    root.style.setProperty("--color-heading", themeData.headingColor || defaultColors.headingColor);
    root.style.setProperty("--color-border", themeData.borderColor || defaultColors.borderColor);

    const primColor = themeData.primaryColor || defaultColors.primaryColor;
    const accColor = themeData.accentColor || defaultColors.accentColor;

    root.style.setProperty("--color-primary-light", adjustColorBrightness(primColor, 30));
    root.style.setProperty("--color-accent-light", adjustColorBrightness(accColor, 30));

    // Legacy variables compatibility mapping
    root.style.setProperty("--navy", themeData.headingColor || defaultColors.headingColor);
    root.style.setProperty("--navy-dark", themeData.primaryDarkColor || defaultColors.primaryDarkColor);
    root.style.setProperty("--blue", primColor);
    root.style.setProperty("--blue-light", adjustColorBrightness(primColor, 30));
    root.style.setProperty("--leaf-green", accColor);
    root.style.setProperty("--mint-green", adjustColorBrightness(accColor, 30));
    root.style.setProperty("--warm-red", themeData.buttonColor || defaultColors.buttonColor);
    root.style.setProperty("--accent", accColor);
    root.style.setProperty("--bg-soft", themeData.bgColor || defaultColors.bgColor);
    root.style.setProperty("--text-dark", themeData.textColor || defaultColors.textColor);
    root.style.setProperty("--deep-trust-blue", themeData.primaryDarkColor || defaultColors.primaryDarkColor);
    root.style.setProperty("--active-blue", primColor);
    root.style.setProperty("--care-red", themeData.buttonColor || defaultColors.buttonColor);
    root.style.setProperty("--healing-green", accColor);
    root.style.setProperty("--warm-paper", themeData.bgColor || defaultColors.bgColor);
    root.style.setProperty("--ink", themeData.textColor || defaultColors.textColor);
  }

  const applyCollectionState = (docsList, deptsList, trtsList, catsList, srvsList, insList) => {
    const liveDoctors = sortByOrder(docsList.filter(isPublicDocumentLive));
    const liveDepartments = sortByOrder(deptsList.filter(isPublicDocumentLive));
    const liveTreatments = sortByOrder(trtsList.filter(isPublicDocumentLive));
    const liveCategories = sortByOrder(catsList.filter(isPublicDocumentLive));
    const liveServices = sortByOrder(srvsList.filter(isPublicDocumentLive));
    const liveInsurance = sortByOrder(insList.filter(isPublicDocumentLive));

    setDoctors(liveDoctors);
    setDepartments(liveDepartments);
    setTreatments(liveTreatments);
    setCategories(liveCategories);
    setServices(liveServices);
    setInsurance(liveInsurance);

    const index = [
      ...liveDoctors.map((doctor) => ({
        type: "Doctor",
        name: doctor.name,
        details: `${doctor.qualification || ""} - ${doctor.designation || ""} (${(doctor.specialization || []).join(", ")})`,
        link: `/doctors/${doctor.id}`,
      })),
      ...liveTreatments.map((treatment) => ({
        type: "Treatment",
        name: treatment.name,
        details: treatment.shortDescription,
        link: `/treatments/${treatment.slug}`,
      })),
      ...liveServices.map((service) => ({
        type: "Service",
        name: service.name,
        details: service.shortDescription,
        link: `/services/${service.slug}`,
      })),
    ];
    setSearchIndex(index);
  };

  const applyFallbackCollections = () => {
    applyCollectionState(
      getFallbackCollection("doctors"),
      getFallbackCollection("departments"),
      getFallbackCollection("treatments"),
      getFallbackCollection("serviceCategories"),
      getFallbackCollection("services"),
      getFallbackCollection("insurancePartners")
    );
  };

  // 2. Cache Firestore collections in memory and build search index
  const loadCollections = async () => {
    console.time("Cache Collections Load");
    try {
      const [
        docsSnap,
        deptsSnap,
        trtsSnap,
        catsSnap,
        srvsSnap,
        insSnap,
        imagesSnap
      ] = await withTimeout(
        Promise.all([
          getDocs(collection(db, "doctors")),
          getDocs(collection(db, "departments")),
          getDocs(collection(db, "treatments")),
          getDocs(collection(db, "serviceCategories")),
          getDocs(collection(db, "services")),
          getDocs(collection(db, "insurancePartners")),
          getDocs(collection(db, "siteImages"))
        ]),
        10000
      );

      const docsList = docsSnap.empty
        ? getFallbackCollection("doctors")
        : docsSnap.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((item) => item.isActive !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const deptsList = deptsSnap.empty
        ? getFallbackCollection("departments")
        : deptsSnap.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((item) => item.isActive !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const trtsList = trtsSnap.empty
        ? getFallbackCollection("treatments")
        : trtsSnap.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((item) => item.isActive !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const catsList = catsSnap.empty
        ? getFallbackCollection("serviceCategories")
        : catsSnap.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((item) => item.isActive !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const srvsList = srvsSnap.empty
        ? getFallbackCollection("services")
        : srvsSnap.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((item) => item.isActive !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const insList = insSnap.empty
        ? getFallbackCollection("insurancePartners")
        : insSnap.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((item) => item.isActive !== false)
            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const imagesMap = {};
      if (!imagesSnap.empty) {
        imagesSnap.forEach((docSnap) => {
          imagesMap[docSnap.id] = docSnap.data();
        });
      }
      setSiteImages(imagesMap);

      applyCollectionState(docsList, deptsList, trtsList, catsList, srvsList, insList);
    } catch (err) {
      console.error("Failed to load and cache collections in parallel:", err);
      applyFallbackCollections();
    } finally {
      console.timeEnd("Cache Collections Load");
      setLoading(false);
    }
  };

  // 3. Theme administration (Dark / Light Mode)
  useEffect(() => {
    const index = [
      ...doctors.map((doctor) => ({
        type: "Doctor",
        name: doctor.name,
        details: `${doctor.qualification || ""} - ${doctor.designation || ""} (${(doctor.specialization || []).join(", ")})`,
        link: `/doctors/${doctor.id}`,
      })),
      ...treatments.map((treatment) => ({
        type: "Treatment",
        name: treatment.name,
        details: treatment.shortDescription,
        link: `/treatments/${treatment.slug}`,
      })),
      ...services.map((service) => ({
        type: "Service",
        name: service.name,
        details: service.shortDescription,
        link: `/services/${service.slug}`,
      })),
    ];
    setSearchIndex(index);
  }, [doctors, treatments, services]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || (settings?.themeMode === "dark" ? "dark" : "light");
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeMode(newTheme);
  };

  const setThemeMode = (newTheme) => {
    const nextTheme = newTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const getImageUrl = (slotKey, defaultUrl) => {
    return siteImages[slotKey]?.imageUrl || defaultUrl;
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        settings,
        theme,
        toggleTheme,
        setTheme: setThemeMode,
        doctors,
        departments,
        treatments,
        services,
        categories,
        insurance,
        searchIndex,
        siteImages,
        welcomeBanner,
        getImageUrl,
        loadCollections,
        announcements,
        announcementSettings,
        festivalBanners,
        enquiries,
        pendingEnquiriesCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
