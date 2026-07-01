import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  CalendarDays,
  MessageSquare,
  UserRound,
  HeartPulse,
  BarChart2,
  PartyPopper,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  CalendarX,
  MessageSquareOff
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";

function toDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatLocalDate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getAppointmentDate(appointment) {
  if (appointment.rescheduledDate) return appointment.rescheduledDate;
  if (appointment.preferredDate) return appointment.preferredDate;
  const created = toDate(appointment.createdAt);
  return created ? formatLocalDate(created) : "";
}

function getCreatedTime(item) {
  return toDate(item.createdAt || item.timestamp || item.submittedAt)?.getTime() || 0;
}

function getTrendLabel(todayValue, yesterdayValue) {
  if (!Number.isFinite(yesterdayValue) || yesterdayValue === 0) {
    return todayValue > 0 ? { label: `↑ ${todayValue} today`, isUp: true } : { label: "0% change", isUp: false, isFlat: true };
  }

  const percent = Math.round(((todayValue - yesterdayValue) / yesterdayValue) * 100);
  if (percent === 0) return { label: "0% vs yesterday", isUp: false, isFlat: true };
  return {
    label: `${percent > 0 ? "↑" : "↓"} ${Math.abs(percent)}% vs yesterday`,
    isUp: percent > 0
  };
}

function formatWhen(appointment) {
  const date = appointment.rescheduledDate || appointment.preferredDate || "-";
  const time = appointment.rescheduledTime || appointment.preferredTime || "";
  return time ? `${date} ${time}` : date;
}

function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase();
  const classes = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
    confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
    completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${classes[normalized] || classes.pending}`}>
      {status || "Pending"}
    </span>
  );
}

export function Dashboard() {
  const { doctors, services, festivalBanners, pendingEnquiriesCount } = useApp();

  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [chartTimeframe, setChartTimeframe] = useState("30days"); // '30days' | '12months'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [realtimeStats, setRealtimeStats] = useState({
    todayAppointments: 0,
    yesterdayAppointments: 0,
    todayPageViews: 0,
    yesterdayPageViews: 0
  });

  const fetchFullDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const today = formatLocalDate(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = formatLocalDate(yesterdayDate);

      // Fetch all collections
      const [appointmentsSnap, enquiriesSnap, pageViewsSnap] = await Promise.all([
        getDocs(collection(db, "appointments")),
        getDocs(collection(db, "enquiries")),
        getDocs(collection(db, "pageViews")),
      ]);

      const apptsList = appointmentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      const enqsList = enquiriesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      const viewsList = pageViewsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

      setAppointments(apptsList);
      setEnquiries(enqsList);
      setPageViews(viewsList);

      // Calculate initial stats
      const todayApptsCount = apptsList.filter((app) => getAppointmentDate(app) === today).length;
      const yesterdayApptsCount = apptsList.filter((app) => getAppointmentDate(app) === yesterday).length;

      const todayViewsSum = viewsList.filter((pv) => pv.date === today).reduce((sum, pv) => sum + pv.count, 0);
      const yesterdayViewsSum = viewsList.filter((pv) => pv.date === yesterday).reduce((sum, pv) => sum + pv.count, 0);

      setRealtimeStats({
        todayAppointments: todayApptsCount,
        yesterdayAppointments: yesterdayApptsCount,
        todayPageViews: todayViewsSum,
        yesterdayPageViews: yesterdayViewsSum
      });
    } catch (err) {
      console.error("Dashboard database fetch failed:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const refreshLightweightStats = async () => {
    try {
      const today = formatLocalDate(new Date());
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = formatLocalDate(yesterdayDate);

      const [appointmentsSnap, pageViewsSnap] = await Promise.all([
        getDocs(collection(db, "appointments")),
        getDocs(collection(db, "pageViews")),
      ]);

      const apptsList = appointmentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      const viewsList = pageViewsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

      const todayApptsCount = apptsList.filter((app) => getAppointmentDate(app) === today).length;
      const yesterdayApptsCount = apptsList.filter((app) => getAppointmentDate(app) === yesterday).length;

      const todayViewsSum = viewsList.filter((pv) => pv.date === today).reduce((sum, pv) => sum + pv.count, 0);
      const yesterdayViewsSum = viewsList.filter((pv) => pv.date === yesterday).reduce((sum, pv) => sum + pv.count, 0);

      setRealtimeStats({
        todayAppointments: todayApptsCount,
        yesterdayAppointments: yesterdayApptsCount,
        todayPageViews: todayViewsSum,
        yesterdayPageViews: yesterdayViewsSum
      });
    } catch (err) {
      console.warn("Silent lightweight dashboard stats refresh failed:", err);
    }
  };

  useEffect(() => {
    fetchFullDashboardData();
  }, []);

  // 60 seconds auto-refresh interval for top stats cards
  useEffect(() => {
    const timer = setInterval(() => {
      refreshLightweightStats();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // --- STATS RESOLVERS ---
  const activeServicesCount = useMemo(() => {
    return (services || []).filter((s) => s.isActive !== false).length;
  }, [services]);

  const activeFestivalBannerObj = useMemo(() => {
    const now = new Date();
    return (festivalBanners || []).find((b) => {
      if (b.isActive === false || b.active === false) return false;
      const start = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate);
      const end = b.endDate?.toDate ? b.endDate.toDate() : new Date(b.endDate);
      return start && end && now >= start && now <= end;
    });
  }, [festivalBanners]);

  const apptTrend = useMemo(() => {
    return getTrendLabel(realtimeStats.todayAppointments, realtimeStats.yesterdayAppointments);
  }, [realtimeStats.todayAppointments, realtimeStats.yesterdayAppointments]);

  const pvTrend = useMemo(() => {
    return getTrendLabel(realtimeStats.todayPageViews, realtimeStats.yesterdayPageViews);
  }, [realtimeStats.todayPageViews, realtimeStats.yesterdayPageViews]);

  // Last 7 days sparkline calculations for Card 1
  const sparklineData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatLocalDate(d);
      const count = appointments.filter((app) => getAppointmentDate(app) === dateStr).length;
      data.push({ name: dateStr, count });
    }
    return data;
  }, [appointments]);

  // --- CHARTS CALCULATORS ---
  const appointmentsOverTimeData = useMemo(() => {
    if (chartTimeframe === "30days") {
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last30Days.push(formatLocalDate(d));
      }
      return last30Days.map((date, index) => {
        const count = appointments.filter((app) => getAppointmentDate(app) === date).length;
        // Only show label for every 5th date to avoid crowding
        const displayLabel = index % 5 === 0 ? new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
        return { name: displayLabel, fullDate: date, count };
      });
    } else {
      const last12Months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        last12Months.push(yearMonth);
      }
      return last12Months.map((ym) => {
        const count = appointments.filter((app) => {
          const appDate = getAppointmentDate(app);
          return appDate && appDate.startsWith(ym);
        }).length;
        const displayLabel = new Date(ym + "-02T00:00:00").toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        return { name: displayLabel, fullMonth: ym, count };
      });
    }
  }, [appointments, chartTimeframe]);

  const enquiriesDonutData = useMemo(() => {
    const pending = enquiries.filter((e) => e.status === "pending" || e.status === "unread" || !e.status).length;
    const resolved = enquiries.filter((e) => e.status === "resolved").length;
    const progress = enquiries.filter((e) => e.status === "in progress" || e.status === "in-progress").length;
    const other = enquiries.filter((e) => e.status && e.status !== "pending" && e.status !== "unread" && e.status !== "resolved" && e.status !== "in progress" && e.status !== "in-progress").length;

    const total = pending + resolved + progress + other;
    const data = [
      { name: "Pending", value: pending, color: "#F59E0B" },
      { name: "In Progress", value: progress, color: "#3B82F6" },
      { name: "Resolved", value: resolved, color: "#10B981" },
      { name: "Other", value: other, color: "#6B7280" }
    ].filter((d) => d.value > 0);

    return {
      total,
      data: data.length > 0 ? data : [{ name: "No Enquiries", value: 1, color: "#E2E8F0" }]
    };
  }, [enquiries]);

  const topPagesViewsData = useMemo(() => {
    const groups = {};
    pageViews.forEach((pv) => {
      groups[pv.page] = (groups[pv.page] || 0) + pv.count;
    });

    return Object.entries(groups)
      .map(([page, count]) => {
        const label = page.length > 30 ? page.slice(0, 30) + "..." : page;
        return { name: label, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [pageViews]);

  const appointmentsByWeekdayData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    appointments.forEach((app) => {
      const dateStr = getAppointmentDate(app);
      if (dateStr) {
        const d = new Date(dateStr + "T00:00:00");
        const day = d.getDay();
        const mapped = day === 0 ? 6 : day - 1; // Map Sun(0) to 6, Mon(1) to 0...
        if (mapped >= 0 && mapped < 7) {
          counts[mapped]++;
        }
      }
    });

    return weekdays.map((day, idx) => ({
      name: day,
      count: counts[idx],
      isWeekend: idx >= 5
    }));
  }, [appointments]);

  // --- RECENT LISTS ---
  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => getCreatedTime(b) - getCreatedTime(a))
      .slice(0, 10);
  }, [appointments]);

  const recentEnquiries = useMemo(() => {
    return [...enquiries]
      .sort((a, b) => getCreatedTime(b) - getCreatedTime(a))
      .slice(0, 10);
  }, [enquiries]);

  const quickActions = [
    { to: "/admin/appointments", label: "New Appointment", icon: CalendarDays },
    { to: "/admin/doctors", label: "Add Doctor", icon: UserRound },
    { to: "/admin/image-manager", label: "Upload Image", icon: ImageIcon => <PartyPopper className="h-6 w-6" /> }, // placeholder mapping below
    { to: "/admin/announcements", label: "Add Announcement", icon: Megaphone => <PartyPopper className="h-6 w-6" /> },
    { to: "/admin/festival-banners", label: "Festival Banner", icon: PartyPopper },
    { to: "/admin/blog", label: "Write Blog Post", icon: RefreshCw } // overridden locally
  ];

  const currentDateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-6 text-[#1F2937] dark:text-slate-100 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">Welcome back — here's what's happening today, {currentDateString}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchFullDashboardData}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>🔄 Refresh</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#1E7FC2] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#0B3C5D]"
          >
            <span>Go to Public Site ↗</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 dark:border-red-950/20 dark:text-red-300">
          <span>{error}</span>
          <button type="button" onClick={fetchFullDashboardData} className="rounded-lg bg-red-650 px-3 py-1.5 text-xs text-white">
            Retry
          </button>
        </div>
      )}

      {/* SECTION A: SIX STAT CARDS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Today's Appointments */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's Appointments</span>
              <h3 className="text-3xl font-black text-[#0B3C5D] dark:text-white leading-none">{realtimeStats.todayAppointments}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 dark:bg-slate-800 text-[#1E7FC2] rounded-xl">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-end justify-between pt-2">
            <span className={`text-[10px] font-extrabold uppercase ${apptTrend.isFlat ? "text-slate-400" : apptTrend.isUp ? "text-emerald-600" : "text-red-600"}`}>
              {apptTrend.label}
            </span>
            <div className="w-24 h-10 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sparklineData}>
                  <Bar dataKey="count" fill="var(--color-primary, #1E7FC2)" radius={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Card 2: Pending Helpline Enquiries */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Helpline Enquiries</span>
              <div className="flex items-center gap-2">
                <h3 className="text-3xl font-black text-[#0B3C5D] dark:text-white leading-none">{pendingEnquiriesCount}</h3>
                {pendingEnquiriesCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-[#D81F26] animate-pulse" />
                )}
              </div>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-slate-800 text-[#D81F26] rounded-xl">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Unresolved inquiries queue</span>
            <Link to="/admin/enquiries" className="text-xs font-bold text-[#1E7FC2] hover:underline flex items-center gap-0.5">
              <span>View All →</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Total Doctors */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Doctors</span>
              <h3 className="text-3xl font-black text-[#0B3C5D] dark:text-white leading-none">{doctors?.length || 0}</h3>
            </div>
            <div className="p-2.5 bg-green-50 dark:bg-slate-800 text-[#3FA535] rounded-xl">
              <UserRound className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">In hospital directory</span>
            <Link to="/admin/doctors" className="text-xs font-bold text-[#1E7FC2] hover:underline flex items-center gap-0.5">
              <span>+ Add Doctor</span>
            </Link>
          </div>
        </div>

        {/* Card 4: Active Services */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Services</span>
              <h3 className="text-3xl font-black text-[#0B3C5D] dark:text-white leading-none">{activeServicesCount}</h3>
            </div>
            <div className="p-2.5 bg-teal-50 dark:bg-slate-800 text-teal-650 rounded-xl">
              <HeartPulse className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Published on website</span>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Live Catalog</span>
          </div>
        </div>

        {/* Card 5: Page Views Today */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Page Views Today</span>
              <h3 className="text-3xl font-black text-[#0B3C5D] dark:text-white leading-none">{realtimeStats.todayPageViews}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 dark:bg-slate-800 text-purple-650 rounded-xl">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-extrabold uppercase ${pvTrend.isFlat ? "text-slate-400" : pvTrend.isUp ? "text-emerald-600" : "text-red-600"}`}>
              {pvTrend.label}
            </span>
            <span className="text-[10px] font-extrabold text-slate-400">Yesterday: {realtimeStats.yesterdayPageViews}</span>
          </div>
        </div>

        {/* Card 6: Active Festival Banner */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Festival Banner</span>
              {activeFestivalBannerObj ? (
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>● ACTIVE</span>
                  </span>
                  <h4 className="text-xs font-bold truncate max-w-[170px]" style={{ margin: 0 }}>{activeFestivalBannerObj.title}</h4>
                </div>
              ) : (
                <span className="inline-flex text-[10px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  No Active Banner
                </span>
              )}
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-slate-800 text-amber-550 rounded-xl">
              <PartyPopper className="h-5 w-5" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-extrabold text-slate-400">
              {activeFestivalBannerObj ? `Ends: ${activeFestivalBannerObj.endDate}` : "Campaign schedule"}
            </span>
            <Link to="/admin/festival-banners" className="text-xs font-bold text-[#1E7FC2] hover:underline">
              Manage →
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION B: CHARTS ROW (2x2 GRID) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Chart 1: Appointments Over Time */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Appointments Over Time</h3>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setChartTimeframe("30days")}
                className={`px-2.5 py-1.5 rounded-md transition ${chartTimeframe === "30days" ? "bg-white dark:bg-slate-900 shadow text-[#1E7FC2]" : "text-slate-500"}`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setChartTimeframe("12months")}
                className={`px-2.5 py-1.5 rounded-md transition ${chartTimeframe === "12months" ? "bg-white dark:bg-slate-900 shadow text-[#1E7FC2]" : "text-slate-500"}`}
              >
                12 Months
              </button>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={appointmentsOverTimeData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary, #1E7FC2)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Enquiries by Status */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="border-b pb-3 text-left">
            <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Enquiries by Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={enquiriesDonutData.data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {enquiriesDonutData.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#0B3C5D] dark:text-white">{enquiriesDonutData.total}</span>
                <span className="text-[9px] font-bold text-slate-450 uppercase">Total</span>
              </div>
            </div>
            <div className="space-y-2.5 text-left">
              {enquiriesDonutData.data.map((entry, index) => {
                const percentage = enquiriesDonutData.total > 0 ? Math.round((entry.value / enquiriesDonutData.total) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between text-xs border-b pb-1.5 border-slate-50 dark:border-slate-850">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="font-bold text-slate-700 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="font-black text-slate-450">{entry.value} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 3: Top 10 Pages by Views */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="border-b pb-3 text-left">
            <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Top 10 Most Visited Pages</h3>
          </div>
          <div className="h-80 w-full">
            {topPagesViewsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400 font-bold text-xs">
                No visitor traffic logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={topPagesViewsData} margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 9 }} stroke="#94A3B8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-accent, #2FA84F)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Appointments by Day of Week */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="border-b pb-3 text-left">
            <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Appointments by Day of Week</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsByWeekdayData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {appointmentsByWeekdayData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isWeekend ? "var(--color-primary-light, #E7F3FA)" : "var(--color-primary, #1E7FC2)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION C: RECENT ACTIVITY TABLES */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Table 1: Recent Appointments */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Recent Appointments</h2>
              <Link to="/admin/appointments" className="inline-flex items-center gap-1 text-xs font-bold text-[#1E7FC2] hover:underline">
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentAppointments.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <CalendarX className="mx-auto h-9 w-9 text-slate-300" />
                <p className="text-xs font-bold text-slate-400">No appointments yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-xs">
                  <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:bg-slate-950/40">
                    <tr>
                      <th className="px-5 py-3">Patient Name</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Date / Time</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-650 dark:divide-slate-800 dark:text-slate-300">
                    {recentAppointments.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                        <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-white">
                          {row.patientName}
                          <span className="block text-[9px] text-slate-400 font-normal">Dr. {doctors.find(d => d.id === row.doctorId)?.name || "General"}</span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">{row.patientPhone || row.phone || "-"}</td>
                        <td className="px-5 py-3.5 font-medium">{formatWhen(row)}</td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-850 text-center">
            <Link to="/admin/appointments" className="text-xs font-bold text-[#D81F26] hover:underline">
              View All Appointments →
            </Link>
          </div>
        </div>

        {/* Table 2: Recent Enquiries */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Recent Enquiries</h2>
              <Link to="/admin/enquiries" className="inline-flex items-center gap-1 text-xs font-bold text-[#1E7FC2] hover:underline">
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {recentEnquiries.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <MessageSquareOff className="mx-auto h-9 w-9 text-slate-300" />
                <p className="text-xs font-bold text-slate-400">No helpline enquiries yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-xs">
                  <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:bg-slate-950/40">
                    <tr>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Phone</th>
                      <th className="px-5 py-3">Message</th>
                      <th className="px-5 py-3">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-650 dark:divide-slate-800 dark:text-slate-300">
                    {recentEnquiries.map((row) => {
                      const msg = row.message || row.notes || "-";
                      const truncated = msg.length > 50 ? msg.slice(0, 50) + "..." : msg;
                      const pubDate = row.createdAt ? new Date(getCreatedTime(row)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent";
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                          <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-white">
                            {row.name}
                            <span className="block text-[9px] text-[#1E7FC2] font-semibold">{row.subject || "-"}</span>
                          </td>
                          <td className="px-5 py-3.5 font-medium">{row.phone || "-"}</td>
                          <td className="px-5 py-3.5 font-medium max-w-xs">{truncated}</td>
                          <td className="px-5 py-3.5 font-medium">{pubDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-850 text-center">
            <Link to="/admin/enquiries" className="text-xs font-bold text-[#D81F26] hover:underline">
              View All Enquiries →
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION D: QUICK ACTIONS ROW */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-start">
          <Link to="/admin/appointments" className="flex flex-col items-center space-y-2 group w-24">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 text-[#1E7FC2] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <CalendarDays className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-[#1E7FC2] text-center leading-tight">New Appointment</span>
          </Link>

          <Link to="/admin/doctors" className="flex flex-col items-center space-y-2 group w-24">
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-slate-800 text-[#3FA535] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <UserRound className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-[#3FA535] text-center leading-tight">Add Doctor</span>
          </Link>

          <Link to="/admin/image-manager" className="flex flex-col items-center space-y-2 group w-24">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-slate-800 text-purple-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <BarChart2 className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-purple-650 text-center leading-tight">Upload Image</span>
          </Link>

          <Link to="/admin/announcements" className="flex flex-col items-center space-y-2 group w-24">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-slate-800 text-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-teal-650 text-center leading-tight">Add Announcement</span>
          </Link>

          <Link to="/admin/festival-banners" className="flex flex-col items-center space-y-2 group w-24">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-slate-800 text-amber-550 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <PartyPopper className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-amber-550 text-center leading-tight">Festival Banner</span>
          </Link>

          <Link to="/admin/blog" className="flex flex-col items-center space-y-2 group w-24">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-slate-800 text-[#D81F26] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <RefreshCw className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 group-hover:text-[#D81F26] text-center leading-tight">Write Blog Post</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
