import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  MessageSquare,
  Moon,
  Newspaper,
  Palette,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Star,
  UserCircle,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { auth, db } from "../../firebase/config";
import { useApp, withTimeout } from "../../context/AppContext";
import { LoadingScreen } from "../../components/LoadingScreen";

const ADMIN_VERIFIED_KEY = "amulyaAdminVerifiedUid";

const NAV_SECTIONS = [
  {
    items: [
      { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Appointments & Patients",
    items: [
      { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
      { to: "/admin/enquiries", label: "Helpline Enquiries", icon: MessageSquare },
    ],
  },
  {
    label: "Content Management",
    items: [
      { to: "/admin/image-manager", label: "Image Manager", icon: ImageIcon },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
      { to: "/admin/festival-banners", label: "Festival Banners", icon: Sparkles },
      { to: "/admin/blog", label: "Blog", icon: Newspaper },
      { to: "/admin/reviews-queue", label: "Reviews Queue", icon: Star },
    ],
  },
  {
    label: "Hospital Setup",
    items: [
      { to: "/admin/doctors", label: "Doctors", icon: UserRound },
      { to: "/admin/services", label: "Services & Conditions", icon: FileText },
      { to: "/admin/about", label: "About Page Editor", icon: ClipboardList },
      { to: "/admin/facilities", label: "Facilities Setup", icon: Building2 },
    ],
  },
  {
    label: "Appearance",
    items: [
      { to: "/admin/theme", label: "Theme & Appearance", icon: Palette },
      { action: "theme", label: "Theme Mode", icon: Moon },
    ],
  },
  {
    label: "Admin Tools",
    items: [
      { to: "/admin/users", label: "Staff Users", icon: Users },
    ],
  },
];

const FLAT_NAV = NAV_SECTIONS.flatMap((section) => section.items).filter((item) => item.to);

function getPageLabel(pathname) {
  const exact = FLAT_NAV.find((item) => pathname === item.to);
  if (exact) return exact.label;

  const nested = [...FLAT_NAV].sort((a, b) => b.to.length - a.to.length).find((item) => pathname.startsWith(`${item.to}/`));
  if (nested) return nested.label;

  if (pathname === "/admin/settings") return "Website Settings";
  if (pathname === "/admin/content") return "Content Repository";
  return "Administration";
}

function formatNotificationCount(value) {
  if (!value) return "0";
  return value > 99 ? "99+" : String(value);
}

export function AdminLayout() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingEnquiriesCount, setPendingEnquiriesCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { settings, theme, setTheme } = useApp();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;

      if (!currentUser) {
        localStorage.removeItem(ADMIN_VERIFIED_KEY);
        setUser(null);
        setAuthChecking(false);
        navigate("/admin/login", { replace: true });
        return;
      }

      try {
        const adminDocSnap = await withTimeout(getDoc(doc(db, "admins", currentUser.uid)), 10000);

        if (adminDocSnap.exists() && adminDocSnap.data().active === true) {
          localStorage.setItem(ADMIN_VERIFIED_KEY, currentUser.uid);
          setUser(currentUser);
        } else {
          localStorage.removeItem(ADMIN_VERIFIED_KEY);
          setUser(null);
          await signOut(auth);
          navigate("/admin/login", { replace: true });
        }
      } catch (err) {
        console.error("Admin verification failed; keeping cached session only if previously verified:", err);
        if (localStorage.getItem(ADMIN_VERIFIED_KEY) === currentUser.uid) {
          setUser(currentUser);
        } else {
          setUser(null);
          navigate("/admin/login", { replace: true });
        }
      } finally {
        if (isMounted) setAuthChecking(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [appointmentsSnap, enquiriesSnap] = await Promise.all([
          getDocs(query(collection(db, "appointments"), where("status", "==", "pending"))),
          getDocs(collection(db, "enquiries")),
        ]);
        setNotificationCount(appointmentsSnap.size + enquiriesSnap.size);
      } catch (err) {
        console.warn("Failed to load admin notification counts:", err);
      }
    };

    loadNotifications();

    const q = query(collection(db, "enquiries"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPendingEnquiriesCount(snapshot.size);
      },
      (err) => {
        console.warn("Failed to subscribe to pending enquiries in layout:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem(ADMIN_VERIFIED_KEY);
      await signOut(auth);
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const toggleTheme = () => {
    setTheme?.(theme === "dark" ? "light" : "dark");
  };

  const searchResults = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];
    return FLAT_NAV.filter((item) => item.label.toLowerCase().includes(term)).slice(0, 6);
  }, [searchQuery]);

  const runSearch = (event) => {
    if (event.key !== "Enter" || searchResults.length === 0) return;
    navigate(searchResults[0].to);
  };

  const pageLabel = getPageLabel(location.pathname);

  const renderNavItem = (item, compact = false) => {
    const Icon = item.icon;

    if (item.action === "theme") {
      return (
        <button
          key={item.label}
          type="button"
          onClick={toggleTheme}
          title={compact ? item.label : ""}
          className={`group relative flex min-h-11 w-full items-center gap-3 border-l-4 border-transparent px-3 py-2.5 text-sm font-bold text-slate-600 transition duration-150 hover:border-[#1E7FC2]/30 hover:bg-[#1E7FC2]/5 hover:text-[#1E7FC2] dark:text-slate-300 dark:hover:bg-slate-800 ${
            compact ? "justify-center rounded-xl px-2" : "rounded-r-xl"
          }`}
        >
          <Icon className="h-4.5 w-4.5 flex-shrink-0" />
          {!compact && <span className="truncate">{item.label}</span>}
        </button>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        title={compact ? item.label : ""}
        className={({ isActive }) =>
          `group relative flex min-h-11 items-center gap-3 border-l-4 px-3 py-2.5 text-sm font-bold transition duration-150 ${
            compact ? "justify-center rounded-xl px-2" : "rounded-r-xl"
          } ${
            isActive
              ? "border-[#1E7FC2] bg-[#1E7FC2]/10 text-[#0B3C5D] dark:bg-[#1E7FC2]/15 dark:text-white"
              : "border-transparent text-slate-600 hover:border-[#1E7FC2]/30 hover:bg-[#1E7FC2]/5 hover:text-[#1E7FC2] dark:text-slate-300 dark:hover:bg-slate-800"
          }`
        }
      >
        <Icon className="h-4.5 w-4.5 flex-shrink-0" />
        {!compact && <span className="truncate">{item.label}</span>}
        
        {/* Pulsing green dot on Dashboard item */}
        {item.label === "Dashboard" && pendingEnquiriesCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}

        {/* Red badge notification count on Helpline Enquiries */}
        {item.label === "Helpline Enquiries" && pendingEnquiriesCount > 0 && (
          compact ? (
            <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center text-[9px] font-black text-white bg-[#D81F26] rounded-full">
              {pendingEnquiriesCount}
            </span>
          ) : (
            <span className="ml-auto inline-flex items-center justify-center h-5 px-2 text-[10px] font-black text-white bg-[#D81F26] rounded-full">
              {pendingEnquiriesCount}
            </span>
          )
        )}
      </NavLink>
    );
  };

  const sidebar = (compact = false) => (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-5">
        <div className={`flex items-center border-b border-slate-100 pb-4 dark:border-slate-800 ${compact ? "justify-center" : "justify-between"}`}>
          <Link to="/admin" className={`flex items-center gap-3 ${compact ? "justify-center" : ""}`}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Amulya Hospital" className="h-9 w-9 rounded-xl bg-white object-contain p-0.5 shadow-sm" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E7FC2] text-white">
                <LayoutDashboard className="h-5 w-5" />
              </div>
            )}
            {!compact && (
              <div className="leading-tight">
                <span className="block text-base font-extrabold text-slate-900 dark:text-white">Amulya</span>
                <span className="block text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Admin Panel</span>
              </div>
            )}
          </Link>

          {!compact && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E7FC2] md:flex dark:hover:bg-slate-800"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {compact && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#1E7FC2] dark:hover:bg-slate-800"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <nav className="max-h-[calc(100vh-250px)] space-y-5 overflow-y-auto pr-1 no-scrollbar">
          {NAV_SECTIONS.map((section, index) => (
            <div key={section.label || "dashboard"} className="space-y-1.5">
              {section.label && !compact && (
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  {section.label}
                </p>
              )}
              {index > 0 && compact && <div className="mx-auto h-px w-8 bg-slate-100 dark:bg-slate-800" />}
              {section.items.map((item) => renderNavItem(item, compact))}
            </div>
          ))}
        </nav>
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <Link
          to="/"
          title={compact ? "Go to Public Site" : ""}
          className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-[#1E7FC2] dark:text-slate-300 dark:hover:bg-slate-800 ${
            compact ? "justify-center px-2" : ""
          }`}
        >
          <Globe className="h-4.5 w-4.5 flex-shrink-0" />
          {!compact && <span>Go to Public Site</span>}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          title={compact ? "Sign Out" : ""}
          className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/20 ${
            compact ? "justify-center px-2" : ""
          }`}
        >
          <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
          {!compact && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  if (authChecking) return <LoadingScreen />;
  if (!user) return null;

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 ${theme === "dark" ? "dark" : ""}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 md:block dark:border-slate-800 dark:bg-slate-900 ${
          isCollapsed ? "w-20" : "w-72"
        }`}
      >
        {sidebar(isCollapsed)}
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close admin menu"
              className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[82vw] max-w-80 bg-white p-5 shadow-2xl md:hidden dark:bg-slate-900"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
            >
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebar(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={`min-h-screen transition-all duration-300 ${isCollapsed ? "md:pl-20" : "md:pl-72"}`}>
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/92 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/92 md:px-8">
          <div className="flex min-h-14 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
                aria-label="Open admin menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 md:flex dark:hover:bg-slate-800"
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Admin</p>
                <h1 className="truncate text-base font-extrabold text-slate-900 dark:text-white md:text-lg">
                  {pageLabel}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={runSearch}
                  placeholder="Search admin..."
                  className="h-10 w-52 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#1E7FC2] focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:w-72"
                />
                {searchResults.length > 0 && (
                  <div className="absolute right-0 top-12 w-full overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    {searchResults.map((item) => (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => navigate(item.to)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <item.icon className="h-4 w-4 text-[#1E7FC2]" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-[#D81F26] px-1.5 py-0.5 text-[9px] font-black text-white">
                    {formatNotificationCount(notificationCount)}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAvatarOpen((prev) => !prev)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <UserCircle className="h-5 w-5 text-[#1E7FC2]" />
                  <span className="hidden max-w-28 truncate lg:block">{user.email || "Admin"}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                    >
                      <Link to="/admin/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                        <UserRound className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link to="/admin/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Settings className="h-4 w-4" />
                        Change Password
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 pb-24 md:p-8">
          {settings?.maintenanceMode && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5 flex-shrink-0" />
              <span>Website maintenance mode is enabled. Public visitors see the maintenance page while this dashboard remains available.</span>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
