import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowUp, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Link } from "react-router-dom";
import Chatbot from "./Chatbot";

const INSTAGRAM_URL = "https://www.instagram.com/amulya_nursing_home/?hl=en";
const FACEBOOK_URL = "https://www.facebook.com/amulyanursinghome/";

function FloatingAction({ children, className = "", href, to, label, external = false }) {
  const content = (
    <>
      <span className="floating-tooltip" role="tooltip">{label}</span>
      {children}
    </>
  );

  const sharedClassName = `floating-action-button group ${className}`;

  if (to) {
    return (
      <Link to={to} className={sharedClassName} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={sharedClassName}
      aria-label={label}
    >
      {content}
    </a>
  );
}

export function FloatingWidgets() {
  const { settings } = useApp();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const whatsappNumber = settings?.whatsappNumber || "+918647223625";
  const primaryPhone = settings?.phoneNumbers?.[0]?.number || "+918647223625";

  // Monitor scroll height to show/hide Back-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Left-Side: Back to Top Button */}
      <div className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-[900]">
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 15 }}
              onClick={scrollToTop}
              className="w-11 h-11 rounded-full bg-[#0B3C5D] hover:bg-[#082A40] text-white shadow-lg flex items-center justify-center transition-all duration-200 border border-white/10"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Right-Side: Book, Call, WhatsApp Buttons Stack */}
      <div className="floating-widget-stack fixed bottom-20 right-4 md:bottom-6 md:right-6 flex flex-col space-y-3 z-[900] items-end">
        {/* Book Appointment (Red/Accent) */}
        <FloatingAction to="/book-appointment" label="Book Appointment" className="bg-[#D81F26] hover:bg-[#B3151B]">
          <Calendar className="w-5.5 h-5.5" />
        </FloatingAction>

        {/* Quick Call (Blue) */}
        <FloatingAction
          href={`tel:${primaryPhone}`}
          label="Call Hospital"
          className="bg-[#1E7FC2] hover:bg-[#0B3C5D]"
        >
          <Phone className="w-5 h-5 fill-current" />
        </FloatingAction>

        {/* Instagram */}
        <FloatingAction
          href={INSTAGRAM_URL}
          label="Follow us on Instagram"
          external
          className="bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)]"
        >
          <svg viewBox="0 0 24 24" fill="white" width="22" height="22" aria-hidden="true" className="floating-action-icon">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </FloatingAction>

        {/* Facebook */}
        <FloatingAction
          href={FACEBOOK_URL}
          label="Follow us on Facebook"
          external
          className="bg-[#1877F2] hover:bg-[#0f5ec8]"
        >
          <svg viewBox="0 0 24 24" fill="white" width="22" height="22" aria-hidden="true" className="floating-action-icon">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </FloatingAction>

        {/* WhatsApp Chat (Green) */}
        <FloatingAction
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
          label="WhatsApp Chat"
          external
          className="bg-[#25D366] hover:bg-[#20ba59]"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.63 2.012 14.15 1.002 11.52 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.47 3.393 1.359 4.881l-.98 3.584 3.638-.954z" />
          </svg>
        </FloatingAction>

        {/* Chatbot Virtual Assistant */}
        <Chatbot />
      </div>
    </>
  );
}

export default FloatingWidgets;
