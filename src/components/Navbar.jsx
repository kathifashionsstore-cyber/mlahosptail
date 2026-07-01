import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sun, Moon, Phone, ChevronDown, Menu, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SearchOverlay } from "./SearchOverlay";

export function Navbar() {
  const { settings, theme, toggleTheme, services } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emergencyPhone = settings?.phoneNumbers?.find((p) => p.label === "Hospital")?.number || "+91 8647223625";
  const isHomePage = location.pathname === "/";

  const toggleDropdown = (menuName) => {
    setActiveDropdown((prev) => (prev === menuName ? null : menuName));
  };

  // Nav link style generator
  const getNavLinkClass = (isActive) =>
    `relative text-[15px] ${isActive ? "font-semibold" : "font-medium"} py-1.5 transition-colors duration-200 ${
      isScrolled
        ? isActive
          ? "text-[#D81F26]"
          : "text-white/80 hover:text-white"
        : isActive
        ? "text-[#D81F26]"
        : "text-[#0B3C5D] dark:text-slate-205 hover:text-[#1E7FC2] dark:hover:text-[#1E7FC2]"
    }`;

  // Menu button style generator
  const getMenuBtnClass = (menuName) => {
    const isActive = activeDropdown === menuName;
    return `flex items-center space-x-1 text-[15px] ${isActive ? "font-semibold" : "font-medium"} py-1.5 transition-colors duration-200 ${
      isScrolled
        ? isActive
          ? "text-[#D81F26]"
          : "text-white/80 hover:text-white"
        : isActive
        ? "text-[#D81F26]"
        : "text-[#0B3C5D] dark:text-slate-205 hover:text-[#1E7FC2] dark:hover:text-[#1E7FC2]"
    }`;
  };

  return (
    <>
      <header className="navbar-fixed left-0 right-0 transition-all duration-300" ref={dropdownRef}>
        {/* Main Header Row */}
        <nav
          className={`transition-all duration-300 border-b relative z-50 ${
            isScrolled
              ? "bg-[#0B3C5D] shadow-md py-2 text-white border-transparent"
              : isHomePage
              ? "bg-white/95 dark:bg-slate-900/95 md:bg-transparent md:dark:bg-transparent border-transparent py-2 md:py-[9px]"
              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 py-2 md:py-[9px]"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
            {/* Logo lockup */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 md:w-[52px] md:h-[52px] rounded-xl bg-white flex items-center justify-center shadow-sm">
                <img
                  src={settings?.logoUrl || "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=150&q=80"}
                  alt="Hospital Logo"
                  className="block h-full w-auto max-w-full object-contain"
                />
              </div>
              <div className="text-left">
                <span className={`font-extrabold text-sm md:text-base tracking-tight block ${isScrolled ? "text-white font-serif" : "text-[#0B3C5D] dark:text-white font-serif"}`}>
                  Amulya Hospital
                </span>
                <span className="text-[8px] uppercase font-extrabold tracking-widest block text-[#D81F26] mt-0.5">
                  Spine, Joint & Trauma Care
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Click toggled dropdowns, no hover) */}
            <div className="hidden lg:flex items-center gap-7">
              <NavLink to="/" className={({ isActive }) => getNavLinkClass(isActive)}>
                Home
              </NavLink>

              {/* About Us (Click to toggle) */}
              <div className="relative">
                <button onClick={() => toggleDropdown("about")} className={getMenuBtnClass("about")}>
                  <span>About</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${activeDropdown === "about" ? "rotate-180" : ""}`} />
                </button>
              </div>

              <NavLink to="/doctors" className={({ isActive }) => getNavLinkClass(isActive)}>
                Doctors
              </NavLink>

              {/* Services (Click to toggle) */}
              <div className="relative">
                <button onClick={() => toggleDropdown("services")} className={getMenuBtnClass("services")}>
                  <span>Services</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${activeDropdown === "services" ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Patient Care (Click to toggle) */}
              <div className="relative">
                <button onClick={() => toggleDropdown("patient")} className={getMenuBtnClass("patient")}>
                  <span>Patient Care</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${activeDropdown === "patient" ? "rotate-180" : ""}`} />
                </button>
              </div>

              <NavLink to="/gallery" className={({ isActive }) => getNavLinkClass(isActive)}>
                Gallery
              </NavLink>
              <NavLink to="/testimonials" className={({ isActive }) => getNavLinkClass(isActive)}>
                Reviews
              </NavLink>
              <NavLink to="/blog" className={({ isActive }) => getNavLinkClass(isActive)}>
                Blog
              </NavLink>
            </div>

            {/* Right side CTAs */}
            <div className="flex items-center space-x-3.5">
              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-full transition ${isScrolled ? "text-white/80 hover:bg-white/10" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400"}`}
                aria-label="Open Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition ${isScrolled ? "text-white/80 hover:bg-white/10" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400"}`}
                aria-label="Toggle Theme"
              >
                {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
              </button>

              {/* Booking Button */}
              <Link
                to="/book-appointment"
                className="hidden md:inline-flex bg-[#D81F26] hover:bg-[#B3151B] text-white text-xs font-bold py-2.5 px-4.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                Book Appointment
              </Link>

              {/* Hamburger Button (Mobile Menu toggle) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition ${isScrolled ? "text-white hover:bg-white/10" : "text-[#0B3C5D] dark:text-white hover:bg-slate-50"}`}
              >
                {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
              </button>
            </div>
          </div>

          {/* Desktop Click dropdown panel overlays */}
          <AnimatePresence>
            {activeDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-full bg-white dark:bg-slate-900 shadow-xl border-t border-slate-100 dark:border-slate-800 z-40 py-8 px-8"
              >
                <div className="max-w-7xl mx-auto">
                  {/* About dropdown content */}
                  {activeDropdown === "about" && (
                    <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-[#D81F26] tracking-wider block">Hospital Story</span>
                        <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
                          Amulya Hospital has anchored trauma care in Guntur and Palnadu since 1992 under chief surgeon Dr. Chadalavada Aravinda Babu.
                        </p>
                      </div>
                      <div className="flex flex-col space-y-3 text-xs font-extrabold text-[#0B3C5D] dark:text-slate-350">
                        <Link to="/about" className="hover:text-[#1E7FC2] transition">About Hospital</Link>
                        <Link to="/our-story" className="hover:text-[#1E7FC2] transition">Our Story & Timeline</Link>
                        <Link to="/leadership" className="hover:text-[#1E7FC2] transition">Medical Leadership</Link>
                      </div>
                      <div className="flex flex-col space-y-3 text-xs font-extrabold text-[#0B3C5D] dark:text-slate-350">
                        <Link to="/facilities" className="hover:text-[#1E7FC2] transition">Clinical Facilities</Link>
                        <Link to="/patient-stories" className="hover:text-[#1E7FC2] transition">Patient Recovery Stories</Link>
                        <Link to="/careers" className="hover:text-[#1E7FC2] transition">Careers</Link>
                      </div>
                    </div>
                  )}

                  {/* Services dropdown content */}
                  {activeDropdown === "services" && (() => {
                    const spineConditions = services.filter((s) => s.cluster === "spine");
                    const jointConditions = services.filter((s) => s.cluster === "joint-pain");
                    const traumaConditions = services.filter((s) => s.cluster === "trauma");
                    const sportsConditions = services.filter((s) => s.cluster === "sports");
                    const footConditions = services.filter((s) => s.cluster === "foot");
                    const pediatricConditions = services.filter((s) => s.cluster === "pediatric");
                    const boneHealthConditions = services.filter((s) => s.cluster === "bone-health");

                    const clusters = [
                      { name: "General Bone Health", items: boneHealthConditions, description: "Osteoporosis & arthritis" },
                      { name: "Joint Pain Conditions", items: jointConditions, description: "Knee, hip & shoulder solutions" },
                      { name: "Spine Conditions", items: spineConditions, description: "Back pain, disc & sciatica" },
                      { name: "Trauma & Fractures", items: traumaConditions, description: "24/7 casualty restoration" },
                      { name: "Sports & Soft Tissue", items: sportsConditions, description: "ACL & ligament reconstruction" },
                      { name: "Foot & Ankle", items: footConditions, description: "Plantar fasciitis & heel pain" },
                      { name: "Pediatric Orthopaedics", items: pediatricConditions, description: "Clubfoot & polio correction" }
                    ];

                    return (
                      <div className="grid grid-cols-4 gap-x-8 gap-y-6 max-w-6xl mx-auto">
                        {/* Col 1 */}
                        <div className="space-y-6">
                          {[clusters[0], clusters[1]].map((cluster) => (
                            <div key={cluster.name} className="space-y-2 text-left">
                              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1 border-b">
                                {cluster.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug my-1">
                                {cluster.description}
                              </p>
                              <ul className="space-y-1.5">
                                {cluster.items.slice(0, 4).map((item) => (
                                  <li key={item.id}>
                                    <Link
                                      to={`/services/orthopaedics/${item.slug}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-xs text-[#0B3C5D] hover:text-[#1E7FC2] dark:text-slate-350 dark:hover:text-[#1E7FC2] font-bold block"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                                {cluster.items.length > 4 && (
                                  <li>
                                    <Link
                                      to="/services"
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[10px] text-[#D81F26] font-bold hover:underline"
                                    >
                                      + {cluster.items.length - 4} More Conditions ➜
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Col 2 */}
                        <div className="space-y-6">
                          {[clusters[2], clusters[3]].map((cluster) => (
                            <div key={cluster.name} className="space-y-2 text-left">
                              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1 border-b">
                                {cluster.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug my-1">
                                {cluster.description}
                              </p>
                              <ul className="space-y-1.5">
                                {cluster.items.slice(0, 4).map((item) => (
                                  <li key={item.id}>
                                    <Link
                                      to={`/services/orthopaedics/${item.slug}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-xs text-[#0B3C5D] hover:text-[#1E7FC2] dark:text-slate-355 dark:hover:text-[#1E7FC2] font-bold block"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                                {cluster.items.length > 4 && (
                                  <li>
                                    <Link
                                      to="/services"
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[10px] text-[#D81F26] font-bold hover:underline"
                                    >
                                      + {cluster.items.length - 4} More Conditions ➜
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Col 3 */}
                        <div className="space-y-6">
                          {[clusters[4], clusters[5]].map((cluster) => (
                            <div key={cluster.name} className="space-y-2 text-left">
                              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1 border-b">
                                {cluster.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug my-1">
                                {cluster.description}
                              </p>
                              <ul className="space-y-1.5">
                                {cluster.items.slice(0, 4).map((item) => (
                                  <li key={item.id}>
                                    <Link
                                      to={`/services/orthopaedics/${item.slug}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-xs text-[#0B3C5D] hover:text-[#1E7FC2] dark:text-slate-355 dark:hover:text-[#1E7FC2] font-bold block"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                                {cluster.items.length > 4 && (
                                  <li>
                                    <Link
                                      to="/services"
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-[10px] text-[#D81F26] font-bold hover:underline"
                                    >
                                      + {cluster.items.length - 4} More Conditions ➜
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Col 4 */}
                        <div className="space-y-6 flex flex-col justify-between">
                          {[clusters[6]].map((cluster) => (
                            <div key={cluster.name} className="space-y-2 text-left">
                              <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1 border-b">
                                {cluster.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug my-1">
                                {cluster.description}
                              </p>
                              <ul className="space-y-1.5">
                                {cluster.items.slice(0, 4).map((item) => (
                                  <li key={item.id}>
                                    <Link
                                      to={`/services/orthopaedics/${item.slug}`}
                                      onClick={() => setActiveDropdown(null)}
                                      className="text-xs text-[#0B3C5D] hover:text-[#1E7FC2] dark:text-slate-355 dark:hover:text-[#1E7FC2] font-bold block"
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          <div className="bg-[#F4F9FC] dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-2">
                            <h4 className="text-xs font-bold text-[#0B3C5D] dark:text-white">OPD Helpline</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                              Direct scheduling or insurance coverage confirmation.
                            </p>
                            <Link
                              to="/book-appointment"
                              onClick={() => setActiveDropdown(null)}
                              className="text-[10px] font-extrabold text-[#D81F26] hover:underline block"
                            >
                              Book Appointment Online ➜
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Patient Care dropdown content */}
                  {activeDropdown === "patient" && (
                    <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-[#D81F26] tracking-wider block">Patient Helpdesk</span>
                        <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold leading-relaxed">
                          Access insurance approvals, preventative diagnostic screening rates, and video OPD scheduling.
                        </p>
                      </div>
                      <div className="flex flex-col space-y-3 text-xs font-extrabold text-[#0B3C5D] dark:text-slate-350">
                        <Link to="/patient-care/insurance" className="hover:text-[#1E7FC2] transition">Cashless Insurance Schemes</Link>
                        <Link to="/patient-care/health-packages" className="hover:text-[#1E7FC2] transition">Health Screening Packages</Link>
                        <Link to="/patient-care/international-patients" className="hover:text-[#1E7FC2] transition">International Patients</Link>
                      </div>
                      <div className="flex flex-col space-y-3 text-xs font-extrabold text-[#0B3C5D] dark:text-slate-350">
                        <Link to="/patient-care/faqs" className="hover:text-[#1E7FC2] transition">FAQ Help Directory</Link>
                        <Link to="/video-consultation" className="hover:text-[#1E7FC2] transition font-bold text-[#D81F26]">Book Video Consultation</Link>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Mobile slide-out fullscreen drawer (Click activated, no hover) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="public-mobile-drawer fixed left-0 right-0 bottom-0 bg-white dark:bg-slate-900 z-40 overflow-y-auto px-6 py-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Main Navigation Links */}
                <div className="flex flex-col space-y-4 text-sm font-extrabold text-[#0B3C5D] dark:text-slate-200">
                  <Link to="/" className="pb-2 border-b">Home</Link>
                  <Link to="/doctors" className="pb-2 border-b">Specialists</Link>
                  <Link to="/services" className="pb-2 border-b">Services & Conditions</Link>
                  <Link to="/gallery" className="pb-2 border-b">Photo Gallery</Link>
                  <Link to="/testimonials" className="pb-2 border-b">Patient Reviews</Link>
                  <Link to="/blog" className="pb-2 border-b">Health Blog</Link>
                </div>

                {/* Sub Menu Quick Links */}
                <div className="space-y-3 bg-[#F4F9FC] dark:bg-slate-850 p-4 rounded-xl">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Pages</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#0B3C5D] dark:text-slate-350">
                    <Link to="/about">About Hospital</Link>
                    <Link to="/our-story">Our Story</Link>
                    <Link to="/leadership">Leadership</Link>
                    <Link to="/facilities">Facilities</Link>
                    <Link to="/patient-care/insurance">Cashless Insurance</Link>
                    <Link to="/video-consultation" className="text-[#D81F26]">Video OPD</Link>
                  </div>
                </div>
              </div>

              {/* Mobile Drawer Footer Contacts */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <a
                  href={`tel:${emergencyPhone}`}
                  className="w-full bg-[#D81F26] hover:bg-[#B3151B] text-white text-center font-bold py-3.5 rounded-xl text-xs shadow-md block"
                >
                  Call OPD Helpline: {emergencyPhone}
                </a>
                <Link
                  to="/book-appointment"
                  className="w-full border-2 border-[#0B3C5D] dark:border-white text-center font-bold py-3 rounded-xl text-xs block dark:text-white"
                >
                  Book Appointment Slot
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay component */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

export default Navbar;
