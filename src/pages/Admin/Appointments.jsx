import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { Check, X, Calendar, Clock, FileText, User, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

export function Appointments() {
  const { doctors, departments } = useApp();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null); // for reschedule/notes modal
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Listen to appointments collection in real-time
  useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (querySnap) => {
        setAppointments(querySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load appointments:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const docRef = doc(db, "appointments", appId);
      await updateDoc(docRef, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    }
  };

  const handleOpenRescheduleModal = (app) => {
    setSelectedApp(app);
    setRescheduleDate(app.rescheduledDate || app.preferredDate);
    setRescheduleTime(app.rescheduledTime || app.preferredTime);
    setAdminNotes(app.adminNotes || "");
  };

  const handleSaveReschedule = async () => {
    if (!selectedApp) return;
    try {
      const docRef = doc(db, "appointments", selectedApp.id);
      await updateDoc(docRef, {
        status: "rescheduled",
        rescheduledDate: rescheduleDate,
        rescheduledTime: rescheduleTime,
        adminNotes: adminNotes,
      });
      setSelectedApp(null);
    } catch (err) {
      console.error("Failed to reschedule:", err);
      alert("Failed to save reschedule details.");
    }
  };

  const handleSaveNotesOnly = async () => {
    if (!selectedApp) return;
    try {
      const docRef = doc(db, "appointments", selectedApp.id);
      await updateDoc(docRef, {
        adminNotes: adminNotes,
      });
      setSelectedApp(null);
    } catch (err) {
      console.error("Failed to save notes:", err);
      alert("Failed to save administrative notes.");
    }
  };

  // Filter list
  const filteredApps = appointments.filter((app) => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400";
      case "approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400";
      case "rescheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400";
      case "completed":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
      case "rejected":
        return "bg-red-100 text-red-850 dark:bg-red-950/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">Patient Appointments</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Approve, reject, or reschedule incoming consultation slots.</p>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-100 dark:border-slate-850 pb-2 scrollbar-none select-none">
        {[
          { label: "All Bookings", value: "all" },
          { label: "Pending Requests", value: "pending" },
          { label: "Confirmed Slots", value: "approved" },
          { label: "Rescheduled", value: "rescheduled" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled / Rejected", value: "rejected" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-xs font-extrabold rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.value
                ? "bg-primary text-white dark:bg-primary-light"
                : "bg-white text-slate-655 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-3 font-semibold text-sm">Loading bookings list...</p>
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const doctor = doctors.find((d) => d.id === app.doctorId);
            const dept = departments.find((d) => d.id === app.departmentId);
            return (
              <div
                key={app.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusBadgeClass(app.status)}`}>
                      {app.status}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center pt-1.5">
                      <User className="w-4.5 h-4.5 mr-2 text-slate-400" />
                      <span>{app.patientName}</span>
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold pl-6">
                      Age: {app.patientAge} • {app.patientGender} • Phone: {app.patientPhone}
                    </p>
                  </div>

                  <div className="space-y-1 text-sm text-slate-550 dark:text-slate-400 font-medium">
                    <p className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                      <span>
                        Date: {app.status === "rescheduled" ? app.rescheduledDate : app.preferredDate}
                      </span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="w-4 h-4 text-slate-400 mr-2" />
                      <span>
                        Time: {app.status === "rescheduled" ? app.rescheduledTime : app.preferredTime}
                      </span>
                    </p>
                    {app.status === "rescheduled" && (
                      <p className="text-[10px] text-blue-500 font-bold pl-6">Rescheduled from {app.preferredDate}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">
                      Consultant:
                    </p>
                    <p className="font-bold text-slate-700 dark:text-slate-350 text-sm">
                      {doctor?.name || "Unassigned"}
                    </p>
                    {dept && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
                        {dept.name}
                      </span>
                    )}
                  </div>

                  {app.reasonForVisit && (
                    <div className="md:col-span-3 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 mt-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Reason for Visit:</p>
                      <p>{app.reasonForVisit}</p>
                    </div>
                  )}

                  {app.adminNotes && (
                    <div className="md:col-span-3 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/10 p-3.5 rounded-2xl border border-blue-100/30 dark:border-blue-900 mt-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Admin Notes:</p>
                      <p>{app.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="flex flex-row lg:flex-col gap-2 justify-end lg:justify-center items-stretch flex-shrink-0">
                  {/* Confirm Button */}
                  {app.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "approved")}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition"
                      title="Confirm Slot"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm</span>
                    </button>
                  )}

                  {/* Reschedule Dialog trigger */}
                  {app.status !== "completed" && app.status !== "rejected" && (
                    <button
                      onClick={() => handleOpenRescheduleModal(app)}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reschedule</span>
                    </button>
                  )}

                  {/* Complete Button */}
                  {app.status === "approved" && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "completed")}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Complete</span>
                    </button>
                  )}

                  {/* Cancel / Reject Button */}
                  {app.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus(app.id, "rejected")}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold text-xs py-2.5 px-4 rounded-xl transition border border-red-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  )}

                  {/* Download reports link */}
                  {app.reportFileUrl && (
                    <a
                      href={app.reportFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 lg:flex-none inline-flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-750"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View File</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 text-slate-400 font-semibold">
          No appointments found under this filter.
        </div>
      )}

      {/* Reschedule / Notes Dialog Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-50 font-serif">
                Manage Booking: {selectedApp.patientName}
              </h3>

              <div className="space-y-4">
                {/* Reschedule Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Rescheduled Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Reschedule Time */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Rescheduled Time
                  </label>
                  <input
                    type="text"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Admin Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Administrative Notes / Instructions
                  </label>
                  <textarea
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Advised patient to bring previous MRI files. Confirmed over call."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveNotesOnly}
                  className="flex-1 border border-slate-200 dark:border-slate-700 hover:bg-slate-55 dark:hover:bg-slate-800 text-slate-655 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl transition"
                >
                  Save Notes Only
                </button>
                <button
                  onClick={handleSaveReschedule}
                  className="flex-1 bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition"
                >
                  Save Reschedule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Appointments;
