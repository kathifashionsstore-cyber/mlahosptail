import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import {
  CalendarDays,
  MessageSquare,
  UserRound,
  HeartPulse,
  BarChart2,
  PartyPopper,
  RefreshCw,
  ChevronRight,
  CalendarX,
  MessageSquareOff,
  Activity,
  Search,
  ArrowUpDown,
  TrendingUp,
  Layers,
  Clock,
  ExternalLink,
  ChevronLeft
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
  Cell,
  AreaChart,
  Area
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
  const { doctors, services, departments, festivalBanners, pendingEnquiriesCount } = useApp();

  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [pageViews, setPageViews] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'analytics' | 'operations'
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("30days"); // '7days' | '14days' | '30days' | '90days' | 'all'
  const [pageSearchQuery, setPageSearchQuery] = useState("");
  const [pageSortField, setPageSortField] = useState("count"); // 'page' | 'count'
  const [pageSortAsc, setPageSortAsc] = useState(false);
  const [pageTablePage, setPageTablePage] = useState(1);
  const pageTableRowsPerPage = 8;

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

  // --- OVERVIEW STATS & TRENDS ---
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

  // Sparkline data for Overview Card 1 (Last 7 Days Appointments)
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

  // --- ANALYTICS TIMEFRAME CALCULATORS ---
  const filteredPageViews = useMemo(() => {
    if (analyticsTimeframe === "all") return pageViews;
    const days =
      analyticsTimeframe === "7days"
        ? 7
        : analyticsTimeframe === "14days"
        ? 14
        : analyticsTimeframe === "30days"
        ? 30
        : analyticsTimeframe === "90days"
        ? 90
        : 30;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    return pageViews.filter((pv) => {
      const d = new Date(pv.date + "T00:00:00");
      return d >= cutoff;
    });
  }, [pageViews, analyticsTimeframe]);

  // Dynamic Timeframe Summary Metrics
  const analyticsSummary = useMemo(() => {
    const totalViews = filteredPageViews.reduce((sum, pv) => sum + pv.count, 0);

    // Group by Page
    const pageGroups = {};
    filteredPageViews.forEach((pv) => {
      pageGroups[pv.page] = (pageGroups[pv.page] || 0) + pv.count;
    });
    const uniquePages = Object.keys(pageGroups).length;

    // Group by Date for Avg/Peak
    const dateGroups = {};
    filteredPageViews.forEach((pv) => {
      dateGroups[pv.date] = (dateGroups[pv.date] || 0) + pv.count;
    });

    const datesArray = Object.keys(dateGroups);
    const totalDays = datesArray.length || 1;
    const avgViews = Math.round(totalViews / totalDays);

    let peakViews = 0;
    let peakDate = "N/A";
    Object.entries(dateGroups).forEach(([date, count]) => {
      if (count > peakViews) {
        peakViews = count;
        peakDate = date;
      }
    });

    // Conversion: Appointments in same period / Page Views
    const days =
      analyticsTimeframe === "7days"
        ? 7
        : analyticsTimeframe === "14days"
        ? 14
        : analyticsTimeframe === "30days"
        ? 30
        : analyticsTimeframe === "90days"
        ? 90
        : 365;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    const apptsInPeriod = analyticsTimeframe === "all"
      ? appointments.length
      : appointments.filter((app) => {
          const appDateStr = getAppointmentDate(app);
          if (!appDateStr) return false;
          const d = new Date(appDateStr + "T00:00:00");
          return d >= cutoff;
        }).length;

    const conversionRate = totalViews > 0 ? ((apptsInPeriod / totalViews) * 100).toFixed(1) : "0.0";

    return {
      totalViews,
      uniquePages,
      avgViews,
      peakDate: peakDate !== "N/A" ? new Date(peakDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A",
      peakViews,
      conversionRate
    };
  }, [filteredPageViews, appointments, analyticsTimeframe]);

  // Page Views Trend over time data
  const pageViewsTrendData = useMemo(() => {
    const dateMap = {};

    // Grouping by Date
    filteredPageViews.forEach((pv) => {
      dateMap[pv.date] = (dateMap[pv.date] || 0) + pv.count;
    });

    // Pad with zeroes for empty dates if timeframe is specific
    if (analyticsTimeframe !== "all") {
      const days =
        analyticsTimeframe === "7days"
          ? 7
          : analyticsTimeframe === "14days"
          ? 14
          : analyticsTimeframe === "30days"
          ? 30
          : 90;

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = formatLocalDate(d);
        if (dateMap[dateStr] === undefined) {
          dateMap[dateStr] = 0;
        }
      }
    }

    return Object.entries(dateMap)
      .map(([date, count]) => ({
        dateStr: date,
        label: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views: count
      }))
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [filteredPageViews, analyticsTimeframe]);

  // Popular Pages Top 10 data
  const topPagesData = useMemo(() => {
    const groups = {};
    filteredPageViews.forEach((pv) => {
      groups[pv.page] = (groups[pv.page] || 0) + pv.count;
    });

    return Object.entries(groups)
      .map(([page, count]) => {
        let displayPage = page;
        if (page === "/") displayPage = "Home Page (/)";
        return { page, displayPage, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredPageViews]);

  // Detailed Page Views List for Table with Search, Sort, Pagination
  const sortedAndFilteredPageList = useMemo(() => {
    const groups = {};
    const lastVisitedMap = {};

    filteredPageViews.forEach((pv) => {
      groups[pv.page] = (groups[pv.page] || 0) + pv.count;
      const lastVis = pv.lastVisited || pv.createdAt?.toDate?.()?.toISOString() || "";
      if (!lastVisitedMap[pv.page] || lastVis > lastVisitedMap[pv.page]) {
        lastVisitedMap[pv.page] = lastVis;
      }
    });

    const totalViewsSum = Object.values(groups).reduce((a, b) => a + b, 0);

    const list = Object.entries(groups)
      .map(([page, count]) => {
        let name = page;
        if (page === "/") name = "Home Page (/)";
        const share = totalViewsSum > 0 ? ((count / totalViewsSum) * 100).toFixed(1) : "0.0";
        return {
          page,
          name,
          count,
          share,
          lastVisited: lastVisitedMap[page] || ""
        };
      })
      .filter((item) =>
        item.page.toLowerCase().includes(pageSearchQuery.trim().toLowerCase())
      );

    // Sorting
    list.sort((a, b) => {
      let valA = a[pageSortField];
      let valB = b[pageSortField];

      if (typeof valA === "string") {
        return pageSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return pageSortAsc ? valA - valB : valB - valA;
      }
    });

    return list;
  }, [filteredPageViews, pageSearchQuery, pageSortField, pageSortAsc]);

  const paginatedPageList = useMemo(() => {
    const start = (pageTablePage - 1) * pageTableRowsPerPage;
    return sortedAndFilteredPageList.slice(start, start + pageTableRowsPerPage);
  }, [sortedAndFilteredPageList, pageTablePage]);

  const totalPageTablePages = Math.ceil(sortedAndFilteredPageList.length / pageTableRowsPerPage) || 1;

  // Toggle page sort helper
  const handlePageSort = (field) => {
    if (pageSortField === field) {
      setPageSortAsc(!pageSortAsc);
    } else {
      setPageSortField(field);
      setPageSortAsc(false);
    }
    setPageTablePage(1);
  };

  // --- OPERATIONAL & APPOINTMENT METRICS ---
  const doctorsAppointmentsData = useMemo(() => {
    const counts = {};
    appointments.forEach((app) => {
      counts[app.doctorId] = (counts[app.doctorId] || 0) + 1;
    });

    return doctors.map((doc) => ({
      name: doc.name.replace(/^Dr\.\s+/i, ""),
      appointments: counts[doc.id] || 0
    })).sort((a, b) => b.appointments - a.appointments);
  }, [appointments, doctors]);

  const servicesAppointmentsData = useMemo(() => {
    const counts = {};
    appointments.forEach((app) => {
      counts[app.departmentId] = (counts[app.departmentId] || 0) + 1;
    });

    return (departments || []).map((dept) => ({
      name: dept.name,
      appointments: counts[dept.id] || 0
    })).sort((a, b) => b.appointments - a.appointments);
  }, [appointments, departments]);

  const enquiriesStatusData = useMemo(() => {
    const pending = enquiries.filter((e) => e.status === "pending" || e.status === "unread" || !e.status).length;
    const progress = enquiries.filter((e) => e.status === "in progress" || e.status === "in-progress").length;
    const resolved = enquiries.filter((e) => e.status === "resolved").length;

    return [
      { name: "Pending", value: pending, color: "#F59E0B" },
      { name: "In Progress", value: progress, color: "#3B82F6" },
      { name: "Resolved", value: resolved, color: "#10B981" }
    ].filter((d) => d.value > 0);
  }, [enquiries]);

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
          <h1 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-xs font-semibold text-slate-400">Welcome back — here's your clinical and visitor overview today, {currentDateString}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchFullDashboardData}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            <span>🔄 Refresh Data</span>
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

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center space-x-2 py-3 px-6 font-bold text-xs border-b-2 tracking-wide uppercase transition-all ${
            activeTab === "overview"
              ? "border-[#1E7FC2] text-[#1E7FC2]"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center space-x-2 py-3 px-6 font-bold text-xs border-b-2 tracking-wide uppercase transition-all ${
            activeTab === "analytics"
              ? "border-[#1E7FC2] text-[#1E7FC2]"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <BarChart2 className="h-4 w-4" />
          <span>Analytics & Page Views</span>
        </button>
        <button
          onClick={() => setActiveTab("operations")}
          className={`flex items-center space-x-2 py-3 px-6 font-bold text-xs border-b-2 tracking-wide uppercase transition-all ${
            activeTab === "operations"
              ? "border-[#1E7FC2] text-[#1E7FC2]"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <UserRound className="h-4 w-4" />
          <span>Operational Metrics</span>
        </button>
      </div>

      {/* TAB CONTENT A: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* SIX STAT CARDS */}
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
                      <Bar dataKey="count" fill="#1E7FC2" radius={2} />
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
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Unresolved inquiries queue</span>
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
                <span className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider">In hospital directory</span>
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
                <span className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider">Published on website</span>
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
                      <h4 className="text-xs font-bold truncate max-w-[170px] m-0">{activeFestivalBannerObj.title}</h4>
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

          {/* TWO RECENT ACTIVITY TABLES */}
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

          {/* QUICK ACTIONS ROW */}
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
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-slate-800 text-purple-650 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-purple-655 text-center leading-tight">Upload Image</span>
              </Link>

              <Link to="/admin/announcements" className="flex flex-col items-center space-y-2 group w-24">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-slate-800 text-teal-650 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-teal-660 text-center leading-tight">Add Announcement</span>
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
      )}

      {/* TAB CONTENT B: ANALYTICS & PAGE VIEWS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* TIMEFRAME SELECTOR */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800 md:flex-row md:items-center">
            <h2 className="font-serif text-base font-extrabold text-[#0B3C5D] dark:text-white">Traffic & Page Views Analytics</h2>
            <div className="flex bg-slate-150 dark:bg-slate-800 rounded-xl p-1 text-xs font-bold w-fit">
              {[
                { key: "7days", label: "7 Days" },
                { key: "14days", label: "14 Days" },
                { key: "30days", label: "30 Days" },
                { key: "90days", label: "90 Days" },
                { key: "all", label: "All Time" }
              ].map((tf) => (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => {
                    setAnalyticsTimeframe(tf.key);
                    setPageTablePage(1);
                  }}
                  className={`px-3 py-2 rounded-lg transition ${
                    analyticsTimeframe === tf.key
                      ? "bg-white dark:bg-slate-900 shadow text-[#1E7FC2]"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC ANALYTICS SUMMARY CARDS */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Page Views</span>
              <h4 className="text-2xl font-black text-[#1E7FC2] dark:text-blue-400 mt-1">{analyticsSummary.totalViews}</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Unique Pages Visited</span>
              <h4 className="text-2xl font-black text-[#3FA535] dark:text-green-400 mt-1">{analyticsSummary.uniquePages}</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Daily Average Views</span>
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{analyticsSummary.avgViews}</h4>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-sm text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Peak Traffic Day</span>
              <h4 className="text-lg font-black text-red-600 dark:text-red-400 mt-1.5 truncate" title={`${analyticsSummary.peakViews} views on ${analyticsSummary.peakDate}`}>
                {analyticsSummary.peakDate} <span className="text-xs font-semibold text-slate-400">({analyticsSummary.peakViews} views)</span>
              </h4>
            </div>
          </div>

          {/* INTERACTIVE GRAPHS ROW */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Chart 1: Traffic Trend Line Chart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-center border-b pb-3 text-left">
                <div>
                  <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Page Views Trend</h3>
                  <p className="text-[10px] font-semibold text-slate-400">Daily traffic pattern over selected timeframe</p>
                </div>
                <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold">
                  <TrendingUp className="h-4 w-4" />
                  <span>Interactive Graph</span>
                </div>
              </div>
              <div className="h-72 w-full">
                {pageViewsTrendData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 font-bold text-xs">
                    No traffic logged in this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pageViewsTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E7FC2" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1E7FC2" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontWeight: "bold" }} />
                      <Area type="monotone" dataKey="views" name="Page Views" stroke="#1E7FC2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Top Pages Horizontal Bar Chart */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="border-b pb-3 text-left">
                <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Top 10 Most Visited Sections</h3>
                <p className="text-[10px] font-semibold text-slate-400">Total views share comparison</p>
              </div>
              <div className="h-72 w-full">
                {topPagesData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 font-bold text-xs">
                    No page visitor logs found.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topPagesData} margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <YAxis dataKey="displayPage" type="category" width={110} tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontWeight: "bold" }} />
                      <Bar dataKey="count" name="Views" fill="#3FA535" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* DETAILED TRAFFIC TABLE WITH SEARCH & SORT */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between overflow-hidden">
            <div>
              {/* Table search & header */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Page Traffic Detail Catalog</h3>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Filter, sort and analyze specific path metrics</p>
                </div>
                <div className="relative flex items-center max-w-xs">
                  <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search page URL..."
                    value={pageSearchQuery}
                    onChange={(e) => {
                      setPageSearchQuery(e.target.value);
                      setPageTablePage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs font-semibold outline-none focus:border-[#1E7FC2] text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {sortedAndFilteredPageList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-bold text-xs">
                  No matching page path views found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-xs">
                    <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-400 dark:bg-slate-950/40 select-none">
                      <tr>
                        <th className="px-5 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60" onClick={() => handlePageSort("page")}>
                          <div className="flex items-center space-x-1">
                            <span>Page Path</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="px-5 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/60" onClick={() => handlePageSort("count")}>
                          <div className="flex items-center space-x-1">
                            <span>View Count</span>
                            <ArrowUpDown className="h-3 w-3" />
                          </div>
                        </th>
                        <th className="px-5 py-3">Traffic Share %</th>
                        <th className="px-5 py-3">Last Visited Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-650 dark:divide-slate-800 dark:text-slate-350">
                      {paginatedPageList.map((row) => (
                        <tr key={row.page} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20">
                          <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                            <span className="truncate max-w-md" title={row.page}>{row.name}</span>
                            <a href={row.page} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#1E7FC2]">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-5 py-3.5 font-extrabold text-[#0B3C5D] dark:text-white">{row.count}</td>
                          <td className="px-5 py-3.5 font-bold">{row.share}%</td>
                          <td className="px-5 py-3.5 font-medium text-slate-400">
                            {row.lastVisited ? new Date(row.lastVisited).toLocaleString() : "Never logged"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {sortedAndFilteredPageList.length > pageTableRowsPerPage && (
              <div className="flex items-center justify-between border-t border-slate-105 dark:border-slate-850 px-5 py-3 bg-slate-50 dark:bg-slate-950/30 text-xs">
                <span className="font-semibold text-slate-400">
                  Showing {(pageTablePage - 1) * pageTableRowsPerPage + 1} - {Math.min(pageTablePage * pageTableRowsPerPage, sortedAndFilteredPageList.length)} of {sortedAndFilteredPageList.length} pages
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={pageTablePage === 1}
                    onClick={() => setPageTablePage(pageTablePage - 1)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-slate-650 dark:text-slate-300">{pageTablePage} / {totalPageTablePages}</span>
                  <button
                    disabled={pageTablePage === totalPageTablePages}
                    onClick={() => setPageTablePage(pageTablePage + 1)}
                    className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT C: OPERATIONAL METRICS */}
      {activeTab === "operations" && (
        <div className="space-y-6">
          {/* TOP METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Booked Appointments</span>
              <h3 className="text-3xl font-black text-[#1E7FC2] dark:text-blue-400 mt-1">{appointments.length}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Sum of all slots registered in Firestore</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Helpline Queries</span>
              <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{enquiries.length}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Queries captured from help channels</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Visitor-to-Booking Conversion</span>
              <h3 className="text-3xl font-black text-[#3FA535] dark:text-green-400 mt-1">{analyticsSummary.conversionRate}%</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Percentage of traffic creating appointments</p>
            </div>
          </div>

          {/* OPERATIONAL CHARTS ROW (2x2 GRID) */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Chart 1: Appointments per Doctor */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="border-b pb-3 text-left">
                <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Appointments per Doctor</h3>
                <p className="text-[10px] font-semibold text-slate-400">Patient allocation by consultant physician</p>
              </div>
              <div className="h-72 w-full">
                {doctorsAppointmentsData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 font-bold text-xs">
                    No active doctors cataloged.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorsAppointmentsData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontWeight: "bold" }} />
                      <Bar dataKey="appointments" name="Appointments" fill="#1E7FC2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Appointments per Department */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="border-b pb-3 text-left">
                <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Appointments per Specialty</h3>
                <p className="text-[10px] font-semibold text-slate-400">Demand distribution across clinical departments</p>
              </div>
              <div className="h-72 w-full">
                {servicesAppointmentsData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 font-bold text-xs">
                    No active departments setup.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicesAppointmentsData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 8 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontWeight: "bold" }} />
                      <Bar dataKey="appointments" name="Appointments" fill="#3FA535" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 3: Helpline Enquiries Status Donut */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="border-b pb-3 text-left">
                <h3 className="font-serif text-sm font-extrabold text-[#0B3C5D] dark:text-white">Enquiries by Status</h3>
                <p className="text-[10px] font-semibold text-slate-400">Helpline tickets resolution flow</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="h-56 relative flex items-center justify-center">
                  {enquiriesStatusData.length === 0 ? (
                    <span className="text-slate-400 text-xs font-bold">No tickets logged</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={enquiriesStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {enquiriesStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, fontWeight: "bold" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#0B3C5D] dark:text-white">{enquiries.length}</span>
                    <span className="text-[9px] font-bold text-slate-450 uppercase">Total Tickets</span>
                  </div>
                </div>
                <div className="space-y-2.5 text-left">
                  {enquiriesStatusData.map((entry, index) => {
                    const percentage = enquiries.length > 0 ? Math.round((entry.value / enquiries.length) * 100) : 0;
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
