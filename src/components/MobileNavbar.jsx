import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, Calendar, LayoutGrid, Menu, X, Sun, Moon, Info, Phone, MessageSquare, BookOpen, Image } from "lucide-react";
import { useApp } from "../context/AppContext";

export function MobileNavbar() {
  const { theme, toggleTheme, settings } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const primaryPhone = settings?.phoneNumbers?.[0]?.number || "+918647223625";

  // Check PWA installation prompt availability
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-2 text-xs font-semibold transition-all duration-200 ${
      isActive
        ? "text-brand-blue dark:text-brand-blue scale-105"
        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350"
    }`;

  return (
    <>
       {/* 1. Bottom-Fixed Mobile Tab Bar (Visible on mobile screens only) */}
       <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-[0_-4px_16px_rgba(15,27,36,0.08)] pb-safe">
         <div className="grid grid-cols-5 h-16 items-center px-2">
           {/* Tab 1: Services */}
           <NavLink to="/services" className={navLinkClass}>
             {({ isActive }) => (
               <>
                 <LayoutGrid className={`w-5 h-5 mb-0.5 ${isActive ? "stroke-[2.5px] fill-brand-blue text-brand-blue" : "stroke-[2px]"}`} />
                 <span>Services</span>
               </>
             )}
           </NavLink>
 
           {/* Tab 2: Gallery */}
           <NavLink to="/gallery" className={navLinkClass}>
             {({ isActive }) => (
               <>
                 <Image className={`w-5 h-5 mb-0.5 ${isActive ? "stroke-[2.5px] fill-brand-blue text-brand-blue" : "stroke-[2px]"}`} />
                 <span>Gallery</span>
               </>
             )}
           </NavLink>
 
           {/* Tab 3: Home (Raised Center Tab) */}
           <div className="flex justify-center -mt-6">
             <Link
               to="/"
               className="w-14 h-14 rounded-full bg-brand-red text-white flex flex-col items-center justify-center shadow-lg shadow-brand-red/35 border-4 border-slate-50 dark:border-slate-950 transform active:scale-95 transition-transform duration-100"
             >
               <Home className="w-5 h-5 stroke-[2.5px]" />
               <span className="text-[9px] font-extrabold uppercase mt-0.5 tracking-wider">Home</span>
             </Link>
           </div>
 
           {/* Tab 4: Book Appointment */}
           <NavLink to="/book-appointment" className={navLinkClass}>
             {({ isActive }) => (
               <>
                 <Calendar className={`w-5 h-5 mb-0.5 ${isActive ? "stroke-[2.5px] fill-brand-blue text-brand-blue" : "stroke-[2px]"}`} />
                 <span>Book</span>
               </>
             )}
           </NavLink>
 
           {/* Tab 5: Menu */}
           <button
             onClick={() => setIsDrawerOpen(true)}
             className="flex flex-col items-center justify-center py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300"
           >
             <Menu className="w-5 h-5 mb-0.5" />
             <span>Menu</span>
           </button>
         </div>
       </div>

      {/* 2. Slide-In Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
            />

            {/* Drawer Body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-4/5 max-w-sm bg-white dark:bg-slate-950 shadow-2xl md:hidden overflow-y-auto flex flex-col border-l border-slate-100 dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-50 font-serif">Amulya NH</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                    Hospital Menu
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition duration-200"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 py-4 px-5 space-y-4">
                <Link
                  to="/about"
                  className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold py-2"
                >
                  <Info className="w-5 h-5 text-slate-400" />
                  <span>About Hospital</span>
                </Link>
                <Link
                  to="/doctors"
                  className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold py-2"
                >
                  <Users className="w-5 h-5 text-slate-400" />
                  <span>Meet Our Doctors</span>
                </Link>
                <Link
                  to="/services"
                  className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold py-2"
                >
                  <LayoutGrid className="w-5 h-5 text-slate-400" />
                  <span>Services & Conditions</span>
                </Link>
                <Link
                  to="/gallery"
                  className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold py-2"
                >
                  <Image className="w-5 h-5 text-slate-400" />
                  <span>Photo Gallery</span>
                </Link>
                <Link
                  to="/testimonials"
                  className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold py-2"
                >
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  <span>Patient Reviews</span>
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center space-x-3 text-slate-700 dark:text-slate-300 font-semibold py-2"
                >
                  <BookOpen className="w-5 h-5 text-slate-400" />
                  <span>Health Blog</span>
                </Link>

                <hr className="border-slate-100 dark:border-slate-850 my-2" />

                {/* Theme Toggle in Drawer */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Appearance</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold transition duration-200"
                  >
                    {theme === "light" ? (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span>Light</span>
                      </>
                    )}
                  </button>
                </div>

                {/* PWA App Install Button (conditionally rendered) */}
                {deferredPrompt && (
                  <button
                    onClick={handleInstallApp}
                    className="w-full mt-4 flex items-center justify-center space-x-2 bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-200 text-sm"
                  >
                    <span>Install App on Device</span>
                  </button>
                )}
              </div>

              {/* Drawer Footer Contact */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-medium">Need immediate help?</p>
                <a
                  href={`tel:${primaryPhone}`}
                  className="btn-primary w-full text-sm"
                >
                  <Phone className="w-4 h-4 fill-current mr-2" />
                  <span>Call Hospital: {primaryPhone}</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileNavbar;
