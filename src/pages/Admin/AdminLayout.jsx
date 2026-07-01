import React, { useState, useEffect } from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { useApp, withTimeout } from "../../context/AppContext";
import { LoadingScreen } from "../../components/LoadingScreen";
import {
  Activity,
  CalendarCheck,
  FileText,
  Globe,
  Heart,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Tags,
  UserRound,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Palette,
  Megaphone
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AdminLayout() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Collapsible sidebar state
  
  const navigate = useNavigate();
  const { settings, theme, setTheme } = useApp();

  // strict 2-second timeout guard to ensure loader is released
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.warn("AdminLayout Auth checking timeout reached (2000ms). Forcing loader to hide.");
      setAuthChecking(false);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const adminDocRef = doc(db, "admins", currentUser.uid);
          const adminDocSnap = await withTimeout(getDoc(adminDocRef), 1500);
          
          if (adminDocSnap.exists() && adminDocSnap.data().active === true) {
            setUser(currentUser);
          } else {
            setUser(null);
            await signOut(auth);
            navigate("/admin/login");
          }
        } catch (err) {
          console.error("Admin verification in layout failed or timed out:", err);
          setUser(null);
          await signOut(auth);
          navigate("/admin/login");
        }
      } else {
        setUser(null);
        navigate("/admin/login");
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (setTheme) setTheme(nextTheme);
  };

  // Nav link active classes
  const navLinkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all ${
      isActive
        ? "bg-[#1E7FC2] text-white shadow-md shadow-[#1E7FC2]/20"
        : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1E7FC2] dark:hover:text-white"
    }`;

  const navItems = [
    { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
    { to: "/admin/doctors", label: "Doctors", icon: UserRound },
    { to: "/admin/services", label: "Services & Conditions", icon: FileText },
    { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
    { to: "/admin/blog", label: "Blog", icon: Newspaper },
    { to: "/admin/testimonials", label: "Reviews Queue", icon: Heart },
    { to: "/admin/image-manager", label: "Slot Images", icon: ImageIcon },
    { to: "/admin/media-library", label: "Media Library", icon: ImageIcon },
    { to: "/admin/hero-banners", label: "Hero Banners", icon: Sparkles },
    { to: "/admin/festival-banners", label: "Festival Banners", icon: Sparkles },
    { to: "/admin/theme", label: "Theme & Appearance", icon: Palette },
    { to: "/admin/announcements", label: "Announcement Bar", icon: Megaphone },
    { to: "/admin/users", label: "Staff Users", icon: UserRound },
    { to: "/admin/roles", label: "Access Roles", icon: ShieldAlert },
    { to: "/admin/backups", label: "Database Seeds", icon: Settings },
    { to: "/admin/activity-logs", label: "Audit Logs", icon: FileText },
    { to: "/admin/settings", label: "Site Settings", icon: Settings },
    { to: "/admin/seo-settings", label: "SEO Settings", icon: Search },
  ];

  if (authChecking) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-200 ${theme === "dark" ? "dark" : ""}`}>
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center justify-between shadow-sm z-50">
        <Link to="/admin" className="flex items-center space-x-2.5">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Amulya Nursing Home"
              className="w-8 h-8 object-contain rounded bg-white p-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#1E7FC2] text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m-8-8h16" />
              </svg>
            </div>
          )}
          <div className="text-left">
            <span className="font-extrabold text-sm text-slate-850 dark:text-slate-50 font-serif">Amulya</span>
            <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400 block -mt-1">
              Admin Portal
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-400" /> : <Menu className="w-6 h-6 text-slate-400" />}
        </button>
      </div>

      {/* Collapsible Sidebar (Desktop Panel) */}
      <aside 
        className={`hidden md:flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-850 p-6 flex-shrink-0 z-40 transition-all duration-300 ${
          isCollapsed ? "w-20 px-3" : "w-64"
        }`}
      >
        <div className="space-y-8">
          
          {/* Logo and Name */}
          <div className="flex items-center justify-between border-b pb-4 border-slate-50 dark:border-slate-800">
            {!isCollapsed ? (
              <Link to="/" className="flex items-center space-x-3 group px-2">
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Amulya"
                    className="w-9 h-9 object-contain rounded-xl bg-white p-0.5 shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#1E7FC2] text-white flex items-center justify-center shadow-xs">
                    <Activity className="w-5 h-5" />
                  </div>
                )}
                <div className="text-left">
                  <span className="font-extrabold text-base text-slate-850 dark:text-slate-50 font-serif block">
                    Amulya NH
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
                    Admin Panel
                  </span>
                </div>
              </Link>
            ) : (
              <Link to="/" className="mx-auto block">
                <div className="w-9 h-9 rounded-xl bg-[#1E7FC2] text-white flex items-center justify-center shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
              </Link>
            )}

            {/* Collapse toggle trigger button */}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-slate-150 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500"
            >
              {isCollapsed ? <ChevronRight className="w-4.5 h-4.5" /> : <ChevronLeft className="w-4.5 h-4.5" />}
            </button>
          </div>

          {/* Links list */}
          <nav className="space-y-1.5 max-h-[calc(100vh-290px)] overflow-y-auto pr-1 no-scrollbar">
            {navItems.map((item) => {
              const NavIcon = item.icon;
              return (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  end={item.end} 
                  className={navLinkClass}
                  title={isCollapsed ? item.label : ""}
                >
                  <NavIcon className="w-4.5 h-4.5 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer utilities */}
        <div className="space-y-2.5 pt-6 border-t border-slate-50 dark:border-slate-850">
          
          {/* Dark / Light Toggle Switch */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-[#1E7FC2] ${
              isCollapsed ? "justify-center" : "space-x-3 px-4"
            }`}
            title="Toggle theme mode"
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-[#0B3C5D]" />}
            {!isCollapsed && <span className="text-xs font-bold">Theme Mode</span>}
          </button>

          <Link
            to="/"
            className={`flex items-center text-slate-500 hover:text-[#1E7FC2] rounded-xl py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 ${
              isCollapsed ? "justify-center" : "space-x-3 px-4 text-xs font-bold"
            }`}
            title="Go to Public Site"
          >
            <Globe className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Go to Public Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center text-red-500 rounded-xl py-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 ${
              isCollapsed ? "justify-center" : "space-x-3 px-4 text-xs font-bold"
            }`}
            title="Sign Out Account"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out Account</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50"
            />
            <div className="md:hidden fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 z-40 flex flex-col justify-between overflow-y-auto text-left">
              <nav className="space-y-2" onClick={() => setIsMobileMenuOpen(false)}>
                {navItems.map((item) => {
                  const NavIcon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
                      <NavIcon className="w-4.5 h-4.5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="space-y-2 pt-6 border-t border-slate-100 dark:border-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5 text-[#0B3C5D]" />}
                  <span>Toggle Theme Mode</span>
                </button>
                <Link
                  to="/"
                  className="flex items-center space-x-3 px-4 py-2.5 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Globe className="w-4 h-4" />
                  <span>Go to Public Site</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-bold text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </button>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden pt-6 md:pt-10 mb-16 md:mb-0">
        {settings?.maintenanceMode && (
          <div className="mb-6 p-4 bg-yellow-50/50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-2xl flex items-center space-x-3 text-xs font-bold text-yellow-800 dark:text-yellow-400 select-none shadow-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Website is currently in Maintenance Mode. Visitors see an "Under Construction" page. Admin dashboard remains active.</span>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
