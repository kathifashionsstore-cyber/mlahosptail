import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowUp, Calendar } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Link } from "react-router-dom";
import Chatbot from "./Chatbot";

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
      <div className="fixed bottom-6 left-6 z-45">
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
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-45 items-end">
        {/* Book Appointment (Red/Accent) */}
        <Link
          to="/book-appointment"
          className="w-12 h-12 rounded-full bg-[#D81F26] hover:bg-[#B3151B] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
          aria-label="Book Appointment"
        >
          <Calendar className="w-5.5 h-5.5" />
        </Link>

        {/* Quick Call (Blue) */}
        <a
          href={`tel:${primaryPhone}`}
          className="w-12 h-12 rounded-full bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
          aria-label="Phone Call"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>

        {/* WhatsApp Chat (Green) */}
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
          aria-label="WhatsApp Chat"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.63 2.012 14.15 1.002 11.52 1c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.47 3.393 1.359 4.881l-.98 3.584 3.638-.954z" />
          </svg>
        </a>

        {/* Chatbot Virtual Assistant */}
        <Chatbot />
      </div>
    </>
  );
}

export default FloatingWidgets;
