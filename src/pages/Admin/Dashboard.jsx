import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import {
  Calendar,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Megaphone,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
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
    return todayValue > 0 ? { label: "new today", direction: "up" } : { label: "no change", direction: "flat" };
  }

  const percent = Math.round(((todayValue - yesterdayValue) / yesterdayValue) * 100);
  if (percent === 0) return { label: "0% vs yesterday", direction: "flat" };
  return { label: `${percent > 0 ? "+" : ""}${percent}% vs yesterday`, direction: percent > 0 ? "up" : "down" };
}

function formatWhen(appointment) {
  const date = appointment.rescheduledDate || appointment.preferredDate || "-";
  const time = appointment.rescheduledTime || appointment.preferredTime || "";
  return time ? `${date} ${time}` : date;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="h-4 w-24 rounded bg-slate-100 shimmer-placeholder dark:bg-slate-800" />
      <div className="mt-5 h-8 w-16 rounded bg-slate-100 shimmer-placeholder dark:bg-slate-800" />
      <div className="mt-4 h-3 w-28 rounded bg-slate-100 shimmer-placeholder dark:bg-slate-800" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, accent = "text-[#1E7FC2]" }) {
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
          <p className="text-3xl font-black text-[#0B3C5D] dark:text-white">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className={`mt-4 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase ${
        trend?.direction === "down" ? "text-amber-600" : trend?.direction === "up" ? "text-emerald-600" : "text-slate-400"
      }`}>
        {trend?.direction === "flat" ? null : <TrendIcon className="h-3.5 w-3.5" />}
        <span>{trend?.label || "-"}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = status || "pending";
  const classes = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
    completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    rescheduled: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${classes[normalized] || classes.pending}`}>
      {normalized}
    </span>
  );
}

function DataTable({ title, emptyLabel, columns, rows, viewAllTo }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="font-serif text-base font-extrabold text-[#0B3C5D] dark:text-white">{title}</h2>
        {viewAllTo && (
          <Link to={viewAllTo} className="inline-flex items-center gap-1 text-xs font-bold text-[#1E7FC2] hover:underline">
            <span>View all</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {rows.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-9 w-9 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-500">{emptyLabel}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:bg-slate-950/40">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-5 py-3">{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600 dark:divide-slate-800 dark:text-slate-300">
              {rows.map((row, index) => (
                <tr key={row.id || index} className={index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/40 dark:bg-slate-950/20"}>
                  {columns.map((column, colIndex) => (
                    <td key={column.key} className={`px-5 py-4 font-semibold ${colIndex === 0 ? "sticky left-0 bg-inherit font-bold text-slate-800 dark:text-white" : ""}`}>
                      {column.render ? column.render(row) : row[column.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function Dashboard() {
  const { doctors, services } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [appointmentsSnap, enquiriesSnap] = await Promise.all([
        getDocs(collection(db, "appointments")),
        getDocs(collection(db, "enquiries")),
      ]);

      setAppointments(appointmentsSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
      setEnquiries(enquiriesSnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) {
      console.error("Dashboard database fetch failed:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = useMemo(() => {
    const today = formatLocalDate(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = formatLocalDate(yesterdayDate);

    const todayAppointments = appointments.filter((item) => getAppointmentDate(item) === today).length;
    const yesterdayAppointments = appointments.filter((item) => getAppointmentDate(item) === yesterday).length;

    const todayEnquiries = enquiries.filter((item) => formatLocalDate(toDate(item.createdAt || item.timestamp || item.submittedAt)) === today).length;
    const yesterdayEnquiries = enquiries.filter((item) => formatLocalDate(toDate(item.createdAt || item.timestamp || item.submittedAt)) === yesterday).length;

    return {
      todayAppointments,
      pendingEnquiries: enquiries.filter((item) => item.status !== "resolved" && item.status !== "closed").length,
      totalDoctors: doctors.length,
      activeServices: services.filter((item) => item.isActive !== false && item.status !== "archived").length,
      appointmentTrend: getTrendLabel(todayAppointments, yesterdayAppointments),
      enquiryTrend: getTrendLabel(todayEnquiries, yesterdayEnquiries),
    };
  }, [appointments, enquiries, doctors.length, services]);

  const recentAppointments = useMemo(
    () => [...appointments].sort((a, b) => getCreatedTime(b) - getCreatedTime(a)).slice(0, 5),
    [appointments]
  );

  const recentEnquiries = useMemo(
    () => [...enquiries].sort((a, b) => getCreatedTime(b) - getCreatedTime(a)).slice(0, 5),
    [enquiries]
  );

  const quickActions = [
    { to: "/admin/doctors", label: "Add Doctor", icon: Stethoscope },
    { to: "/admin/image-manager", label: "Upload Image", icon: ImageIcon },
    { to: "/admin/blog", label: "Write Blog Post", icon: FileText },
    { to: "/admin/announcements", label: "Add Announcement", icon: Megaphone },
    { to: "/admin/festival-banners", label: "Manage Festival Banner", icon: Sparkles },
  ];

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">At-a-glance operations for appointments, enquiries, clinical content, and common admin tasks.</p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
          <span>{error}</span>
          <button type="button" onClick={fetchDashboardData} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Calendar} label="Today's Appointments" value={metrics.todayAppointments} trend={metrics.appointmentTrend} />
          <StatCard icon={MessageSquare} label="Pending Enquiries" value={metrics.pendingEnquiries} trend={metrics.enquiryTrend} accent="text-[#D81F26]" />
          <StatCard icon={Users} label="Total Doctors" value={metrics.totalDoctors || "-"} trend={{ label: "directory total", direction: "flat" }} accent="text-[#3FA535]" />
          <StatCard icon={FileText} label="Active Services" value={metrics.activeServices || "-"} trend={{ label: "published services", direction: "flat" }} accent="text-[#0B3C5D]" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DataTable
          title="Recent Appointments"
          emptyLabel="No appointments yet."
          viewAllTo="/admin/appointments"
          rows={recentAppointments}
          columns={[
            { key: "patientName", label: "Patient" },
            { key: "when", label: "Date / Time", render: formatWhen },
            { key: "phone", label: "Phone", render: (row) => row.patientPhone || row.phone || "-" },
            { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
          ]}
        />

        <DataTable
          title="Recent Enquiries"
          emptyLabel="No helpline enquiries yet."
          viewAllTo="/admin/enquiries"
          rows={recentEnquiries}
          columns={[
            { key: "name", label: "Name" },
            { key: "subject", label: "Subject", render: (row) => row.subject || row.reason || "-" },
            { key: "phone", label: "Phone", render: (row) => row.phone || row.patientPhone || "-" },
            { key: "message", label: "Message", render: (row) => <span className="line-clamp-2">{row.message || row.notes || "-"}</span> },
          ]}
        />
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-base font-extrabold text-[#0B3C5D] dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#1E7FC2]/30 hover:bg-[#1E7FC2]/5 hover:text-[#1E7FC2] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4.5 w-4.5" />
                  {action.label}
                </span>
                <Plus className="h-4 w-4 text-slate-400" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
