import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AppProvider, useApp } from "./context/AppContext";
import { db } from "./firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

// Components
import Navbar from "./components/Navbar";
import MobileNavbar from "./components/MobileNavbar";
import Footer from "./components/Footer";
import FloatingWidgets from "./components/FloatingWidgets";
import LoadingScreen from "./components/LoadingScreen";
import WelcomeSplash from "./components/WelcomeSplash";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import OurStory from "./pages/OurStory";
import Leadership from "./pages/Leadership";
import Facilities from "./pages/Facilities";
import Doctors from "./pages/Doctors";
import DoctorDetail from "./pages/DoctorDetail";
import DepartmentDetail from "./pages/DepartmentDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import PatientCare from "./pages/PatientCare";
import BookAppointment from "./pages/BookAppointment";
import VideoConsultation from "./pages/VideoConsultation";
import Testimonials from "./pages/Testimonials";
import PatientStories from "./pages/PatientStories";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import ContactLocations from "./pages/ContactLocations";
import AnnouncementBar from "./components/AnnouncementBar";
import FestivalBannerPopup from "./components/FestivalBannerPopup";
import Maintenance from "./pages/Maintenance";
import {
  PrivacyPolicy,
  TermsConditions,
  Disclaimer,
  RefundPolicy,
  Accessibility,
  Sitemap,
  EmergencyInfo
} from "./pages/UtilityPages";

// Admin Pages
import Login from "./pages/Admin/Login";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Appointments from "./pages/Admin/Appointments";
import ContentManager from "./pages/Admin/ContentManager";
import Settings from "./pages/Admin/Settings";
import SeedPage from "./pages/Admin/SeedPage";
import DynamicAdminSubPages from "./pages/Admin/DynamicAdminSubPages";
import ImageManager from "./pages/Admin/ImageManager";
import ThemeManager from "./pages/Admin/ThemeManager";
import AnnouncementManager from "./pages/Admin/AnnouncementManager";
import {
  AdminBlog,
  AdminDoctors,
  AdminFestivalBanners,
  AdminGallery,
  AdminReviewsQueue,
  AdminServiceCategories,
  AdminServices,
  AdminTreatments,
} from "./pages/Admin/CollectionEditorPages";

// Helper to redirect old treatments detail paths to the new services location
function RedirectTreatment() {
  const { slug } = useParams();
  return <Navigate to={`/services/orthopaedics/${slug}`} replace />;
}

function AppContent() {
  const { loading, settings } = useApp();
  const location = useLocation();
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    setRouteLoading(true);
    const timer = setTimeout(() => {
      setRouteLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [location.pathname, loading]);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Page View Tracker (Site Analytics)
  useEffect(() => {
    // Skip tracking for admin console paths or when data is initially loading
    if (loading || location.pathname.startsWith("/admin")) return;

    const sessionKey = `pv_${location.pathname}`;
    if (sessionStorage.getItem(sessionKey) === "1") return;

    const logPageView = () => {
      fetch("/api/track-pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: location.pathname, timestamp: Date.now() }),
      })
        .then((res) => {
          if (res.ok) {
            sessionStorage.setItem(sessionKey, "1");
          }
        })
        .catch(console.error);
    };
    logPageView();
  }, [location.pathname, loading]);

  // Early return only for admin paths to prevent unseeded mounts; public paths load covered by the loader
  if (loading && (location.pathname.startsWith("/admin") || location.pathname === "/admin/login" || location.pathname === "/admin/seed")) {
    return <LoadingScreen />;
  }

  // Admin login layout bypasses public layouts
  if (location.pathname === "/admin/login") {
    return <Login />;
  }

  // Admin seed layout bypasses public layouts
  if (location.pathname === "/admin/seed") {
    return <SeedPage />;
  }

  // Admin nested dashboard paths bypass public layout wrappers
  if (location.pathname.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="treatments" element={<AdminTreatments />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="service-categories" element={<AdminServiceCategories />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="reviews-queue" element={<AdminReviewsQueue />} />
          <Route path="festival-banners" element={<AdminFestivalBanners />} />
          <Route path="settings" element={<Settings />} />
          <Route path="image-manager" element={<ImageManager />} />
          <Route path="theme" element={<ThemeManager />} />
          <Route path="announcements" element={<AnnouncementManager />} />
          <Route path="homepage" element={<DynamicAdminSubPages />} />
          <Route path="enquiries" element={<DynamicAdminSubPages />} />
          <Route path="about" element={<DynamicAdminSubPages />} />
          <Route path="facilities" element={<DynamicAdminSubPages />} />
          <Route path="users" element={<DynamicAdminSubPages />} />
          <Route path="menu-manager" element={<DynamicAdminSubPages />} />
          <Route path="footer-manager" element={<DynamicAdminSubPages />} />
          <Route path="theme-manager" element={<DynamicAdminSubPages />} />
          <Route path="backups" element={<DynamicAdminSubPages />} />
          <Route path="profile" element={<DynamicAdminSubPages />} />
        </Route>
      </Routes>
    );
  }

  // Maintenance mode layout checks (Section 3.1 & 9.9)
  if (settings?.maintenanceMode) {
    return <Maintenance />;
  }

  const showLoader = loading || routeLoading;

  return (
    <div className="flex flex-col min-h-screen relative">
      <AnimatePresence mode="wait">
        {showLoader && (
          <LoadingScreen key="loader" />
        )}
      </AnimatePresence>

      <motion.div
        key={location.pathname}
        initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.995 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col min-h-screen flex-grow"
      >
        <WelcomeSplash />

        <AnnouncementBar />
        <FestivalBannerPopup />

        {/* Sticky Header Desktop Nav */}
        <Navbar />

        {/* Public Pages Viewport */}
        <main className="page-wrapper flex-grow pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-story" element={<OurStory />} />
            <Route path="/leadership" element={<Leadership />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/virtual-tour" element={<Facilities />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:doctorId" element={<DoctorDetail />} />
            <Route path="/departments/:deptSlug" element={<DepartmentDetail />} />
            <Route path="/treatments" element={<Navigate to="/services" replace />} />
            <Route path="/treatments/:slug" element={<RedirectTreatment />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:category/:slug" element={<ServiceDetail />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/patient-care" element={<PatientCare />} />
            <Route path="/patient-care/international-patients" element={<PatientCare />} />
            <Route path="/patient-care/insurance" element={<PatientCare />} />
            <Route path="/patient-care/health-packages" element={<PatientCare />} />
            <Route path="/patient-care/faqs" element={<PatientCare />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/book-appointment/success" element={<BookAppointment />} />
            <Route path="/video-consultation" element={<VideoConsultation />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/patient-stories" element={<PatientStories />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/photos" element={<Gallery />} />
            <Route path="/gallery/videos" element={<Gallery />} />
            <Route path="/gallery/events" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:jobSlug" element={<Careers />} />
            <Route path="/contact" element={<ContactLocations />} />
            <Route path="/contact/locations" element={<ContactLocations />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsConditions />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/accessibility" element={<Accessibility />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/emergency" element={<EmergencyInfo />} />
            {/* Fallback redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Floating Speed Dial & Chatbot Cluster */}
        <FloatingWidgets />

        {/* Footer & Map Iframe */}
        <Footer />

        {/* Mobile Tab-Bar Footer */}
        <MobileNavbar />
      </motion.div>
    </div>
  );
}

export function App() {
  return (
    <HelmetProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </HelmetProvider>
  );
}

export default App;
