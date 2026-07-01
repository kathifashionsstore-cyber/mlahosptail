import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db, auth } from "../../firebase/config";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { useApp } from "../../context/AppContext";
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  FileText, 
  Settings, 
  Key, 
  UserCheck, 
  ShieldAlert, 
  Award,
  RefreshCw,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Local helper to log admin actions
async function logActivity(action, meta = "") {
  try {
    const userEmail = auth.currentUser?.email || "admin@amulyanh.com";
    await addDoc(collection(db, "auditLogs"), {
      user: userEmail,
      action,
      meta,
      timestamp: new Date().toLocaleString()
    });
  } catch (err) {
    console.warn("Failed to write audit log:", err);
  }
}

export function DynamicAdminSubPages() {
  const location = useLocation();
  const { settings, loadCollections } = useApp();
  const path = location.pathname.split("/").pop(); // Get last route segment

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Firestore Dynamic Collections States
  const [enquiries, setEnquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Custom Dynamic Content Forms States
  const [aboutForm, setAboutForm] = useState({
    storyTitle: "Our Story",
    storyText: "Founded on May 8, 1992, by Dr. Chadalavada Aravinda Babu, Amulya Nursing Home has served Narasaraopeta for over three decades.",
    missionText: "To restore mobility, relieve pain, and improve spinal alignment.",
    visionText: "To be Narasaraopeta's leading orthopaedic hospital center."
  });

  const [widgetSettings, setWidgetSettings] = useState({
    heroSlider: true,
    statsCounter: true,
    growthGraphs: true,
    doctorsCarousel: true,
    testimonials: true
  });

  const [facilities, setFacilities] = useState([]);
  const [newFacilityName, setNewFacilityName] = useState("");

  // Load Data Depending on Active Tab Path
  const loadSubpageData = async () => {
    setIsLoading(true);
    try {
      if (path === "about") {
        const docRef = doc(db, "aboutContent", "main");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAboutForm(snap.data());
        }
      } else if (path === "homepage") {
        const docRef = doc(db, "siteSettings", "homepageWidgets");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setWidgetSettings(snap.data());
        }
      } else if (path === "enquiries") {
        const qSnap = await getDocs(collection(db, "enquiries"));
        const list = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // sort by date/timestamp
        list.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setEnquiries(list);
      } else if (path === "users") {
        const qSnap = await getDocs(collection(db, "admins"));
        setUsers(qSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else if (path === "facilities") {
        const docRef = doc(db, "siteSettings", "facilitiesList");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setFacilities(snap.data().items || []);
        } else {
          setFacilities(["Modular Joint Replacement Suite", "Ultrasonic Spine Care Wing", "Emergency Triage Unit", "Surgical ICU Room"]);
        }
      } else if (path === "activity-logs") {
        const qSnap = await getDocs(collection(db, "auditLogs"));
        const list = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setLogs(list);
      }
    } catch (err) {
      console.error("Failed to load subpage resources:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubpageData();
  }, [path]);

  // Saves
  const handleAboutSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const docRef = doc(db, "aboutContent", "main");
      await setDoc(docRef, aboutForm, { merge: true });
      await logActivity("Updated About content details", aboutForm.storyTitle);
      setSuccessMsg("About content details saved successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update about content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWidgetSave = async () => {
    setIsLoading(true);
    try {
      await setDoc(doc(db, "siteSettings", "homepageWidgets"), widgetSettings, { merge: true });
      await logActivity("Updated homepage layout settings");
      setSuccessMsg("Homepage widget configuration saved.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to save widgets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFacility = async (e) => {
    e.preventDefault();
    if (!newFacilityName.trim()) return;
    const nextItems = [...facilities, newFacilityName.trim()];
    try {
      await setDoc(doc(db, "siteSettings", "facilitiesList"), { items: nextItems }, { merge: true });
      setFacilities(nextItems);
      setNewFacilityName("");
      await logActivity("Added new hospital facility item", newFacilityName.trim());
      setSuccessMsg("Facility added successfully.");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      alert("Failed to add facility.");
    }
  };

  const handleDeleteFacility = async (index) => {
    const nextItems = facilities.filter((_, idx) => idx !== index);
    try {
      await setDoc(doc(db, "siteSettings", "facilitiesList"), { items: nextItems }, { merge: true });
      setFacilities(nextItems);
      await logActivity("Removed facility item index: " + index);
      setSuccessMsg("Facility removed.");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      alert("Failed to delete facility.");
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Delete this form entry permanently?")) return;
    try {
      await deleteDoc(doc(db, "enquiries", id));
      setEnquiries((prev) => prev.filter((enq) => enq.id !== id));
      await logActivity("Deleted helpline form submission entry ID: " + id);
    } catch (err) {
      alert("Failed to delete enquiry.");
    }
  };

  const handleAddStaffUser = async () => {
    const email = window.prompt("Enter new staff user email address:");
    if (!email) return;
    const name = window.prompt("Enter staff full name:");
    if (!name) return;
    
    setIsLoading(true);
    try {
      const mockUid = "staff-" + Date.now();
      await setDoc(doc(db, "admins", mockUid), {
        id: mockUid,
        email,
        name,
        role: "Desk Coordinator / Assistant",
        active: true
      });
      await logActivity("Created staff login role", name);
      loadSubpageData();
    } catch (err) {
      alert("Failed to save user.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Title Resolver
  const getPageMeta = () => {
    switch (path) {
      case "homepage":
        return { title: "Homepage Layout Manager", desc: "Enable/disable homepage widgets, update slide configs, and configure stats counter widgets." };
      case "about":
        return { title: "About Content Editor", desc: "Manage mission, vision, founder story paragraphs and hospital history panels." };
      case "facilities":
        return { title: "Facilities Setup", desc: "Edit detailed clinical facilities lists displayed on the public tour pages." };
      case "enquiries":
        return { title: "Helpline Enquiries Log", desc: "Track messages and requests sent through public contact forms." };
      case "users":
        return { title: "Staff Users Directory", desc: "Manage clinical staff dashboard login credentials." };
      case "roles":
        return { title: "Privileges & Access Roles", desc: "Configure access roles (Chief Surgeon, Desk Agent, Pharmacist)." };
      case "backups":
        return { title: "Database Backups & Seeds", desc: "Restore seed records or backup current collections." };
      case "activity-logs":
        return { title: "System Audit Logs", desc: "Review database modifications and admin actions." };
      default:
        return { title: "Administration Module", desc: "Manage hospital assets." };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="space-y-8 text-left">
      
      {/* Header details */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-white font-serif">
            {meta.title}
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">{meta.desc}</p>
        </div>
        <button
          onClick={loadSubpageData}
          className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Config</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 text-xs font-bold text-[#358E2C] dark:text-emerald-450">
          {successMsg}
        </div>
      )}

      {/* Renders Dynamically Based on Path */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm">
        
        {/* HOMEPAGE WIDGETS MANAGER */}
        {path === "homepage" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Homepage Widget Settings</h3>
            <div className="space-y-4">
              {[
                { key: "heroSlider", title: "Cinematic Hero Slider", desc: "Enable dynamic slider transitions and fallback photographic panels." },
                { key: "statsCounter", title: "Statistics Counter", desc: "Display count-up metrics for surgeries, recoveries and department counts." },
                { key: "growthGraphs", title: "Growth & Performance Graphs", desc: "Render scroll-animated Recharts statistics charts on the landing page." },
                { key: "doctorsCarousel", title: "Doctors Directory Preview", desc: "Feature specialized orthopedic surgeons cards carousel." },
                { key: "testimonials", title: "Patient Testimonials Carousel", desc: "Showcase rating cards of joint replacements and spinal correction recoveries." }
              ].map((widget) => (
                <div key={widget.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                  <div className="text-left pr-4">
                    <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200">{widget.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{widget.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetSettings[widget.key]}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, [widget.key]: e.target.checked })}
                    className="rounded text-primary focus:ring-primary h-4.5 w-4.5 cursor-pointer"
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={handleWidgetSave}
              className="bg-[#1E7FC2] hover:bg-[#1E7FC2]/90 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
            >
              Save Widget Layout
            </button>
          </div>
        )}

        {/* ABOUT CONTENT EDITOR */}
        {path === "about" && (
          <form onSubmit={handleAboutSave} className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Edit Hospital Story Details</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Story Headline</label>
                <input
                  type="text"
                  value={aboutForm.storyTitle}
                  onChange={(e) => setAboutForm({ ...aboutForm, storyTitle: e.target.value })}
                  className="w-full text-xs font-bold text-slate-855 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-[#1E7FC2]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Hospital Story Paragraph</label>
                <textarea
                  value={aboutForm.storyText}
                  rows="4"
                  onChange={(e) => setAboutForm({ ...aboutForm, storyText: e.target.value })}
                  className="w-full text-xs font-bold text-slate-855 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-[#1E7FC2]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Mission Statement</label>
                  <textarea
                    value={aboutForm.missionText}
                    rows="3"
                    onChange={(e) => setAboutForm({ ...aboutForm, missionText: e.target.value })}
                    className="w-full text-xs font-bold text-slate-855 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-[#1E7FC2]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Vision Statement</label>
                  <textarea
                    value={aboutForm.visionText}
                    rows="3"
                    onChange={(e) => setAboutForm({ ...aboutForm, visionText: e.target.value })}
                    className="w-full text-xs font-bold text-slate-855 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-800 rounded-xl px-4 py-2.5 outline-none focus:border-[#1E7FC2]"
                  />
                </div>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="bg-[#1E7FC2] hover:bg-[#1E7FC2]/90 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md">
              {isLoading ? "Saving..." : "Save About Content"}
            </button>
          </form>
        )}

        {/* FACILITIES SETUP */}
        {path === "facilities" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Edit Hospital Facilities List</h3>
            
            <form onSubmit={handleAddFacility} className="flex gap-3">
              <input
                type="text"
                placeholder="Enter facility name (e.g., 24/7 Digital X-Ray Lab)"
                value={newFacilityName}
                onChange={(e) => setNewFacilityName(e.target.value)}
                className="flex-1 text-xs font-bold bg-slate-50 dark:bg-slate-950 border rounded-xl px-4 py-2.5 outline-none focus:border-[#1E7FC2] text-slate-800 dark:text-white"
                required
              />
              <button type="submit" className="bg-[#1E7FC2] hover:bg-[#1E7FC2]/90 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </form>

            <div className="space-y-2">
              {facilities.map((fac, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span>{fac}</span>
                  <button 
                    onClick={() => handleDeleteFacility(idx)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-750 text-red-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENQUIRIES LOGS */}
        {path === "enquiries" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Submitted Contact Log</h3>
            {enquiries.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center font-semibold">No helpline forms submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600 dark:text-slate-350">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-450 uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Sender Details</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Message Body</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((enq) => (
                      <tr key={enq.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                        <td className="py-4 px-4 font-bold text-slate-800 dark:text-white">
                          {enq.name}
                          <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{enq.phone} • {enq.email || "N/A"}</span>
                        </td>
                        <td className="py-4 px-4 text-[#1E7FC2] font-bold">{enq.subject}</td>
                        <td className="py-4 px-4 font-medium text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{enq.message}</td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleDeleteEnquiry(enq.id)}
                            className="p-1.5 text-slate-400 hover:text-brand-red rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STAFF USERS MANAGER */}
        {path === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Clinical Dashboard Users</h3>
              <button 
                onClick={handleAddStaffUser}
                className="bg-[#1E7FC2] hover:bg-[#1E7FC2]/90 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Staff User</span>
              </button>
            </div>
            <div className="space-y-3">
              {users.map((usr) => (
                <div key={usr.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-between">
                  <div className="text-left">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{usr.name}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{usr.role} • {usr.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">
                      {usr.active !== false ? "Active" : "Disabled"}
                    </span>
                    <button 
                      onClick={async () => {
                        if (window.confirm(`Toggle active status for ${usr.name}?`)) {
                          await updateDoc(doc(db, "admins", usr.id), { active: !usr.active });
                          loadSubpageData();
                        }
                      }}
                      className="text-[10px] font-bold border rounded-lg px-2.5 py-1 text-slate-500 hover:bg-slate-100"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCESS ROLES SETUP */}
        {path === "roles" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Manage Access Roles</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Configure strict permissions and access levels for administrative staff.
            </p>
            <div className="space-y-4 text-xs font-bold text-slate-650 dark:text-slate-350">
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div className="text-left">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">Chief Surgeon (Super Admin)</span>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Full global reads, database backups and delete privileges.</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#1E7FC2] self-start sm:self-center">Unrestricted Access</span>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between gap-4">
                <div className="text-left">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">Desk Coordinator (Staff Role)</span>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">Allowed to read/write Appointments, read enquiries, modify doctors consultation timings.</p>
                </div>
                <div className="flex flex-wrap gap-2 self-start sm:self-center font-bold text-[9px] uppercase">
                  <span className="bg-blue-100 text-[#0B3C5D] px-2 py-0.5 rounded">Appointments</span>
                  <span className="bg-emerald-100 text-[#3FA535] px-2 py-0.5 rounded">Enquiries</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Timings</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BACKUPS & SEEDS */}
        {path === "backups" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Export & Database Seeding console</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Maintain database backups or trigger fresh catalog seeds to populate clinical treatments or services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ backupDate: new Date(), version: "1.0.0" }));
                  const downloadAnchor = document.createElement("a");
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `amulya_db_backup_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  setSuccessMsg("Backup downloaded successfully.");
                  setTimeout(() => setSuccessMsg(""), 3000);
                }}
                className="bg-[#1E7FC2] hover:bg-[#1E7FC2]/90 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm"
              >
                Backup Site Configurations
              </button>
              <a href="/admin/seed" className="border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition duration-200 text-center">
                Run DB Seeding Console
              </a>
            </div>
          </div>
        )}

        {/* AUDIT LOGS */}
        {path === "activity-logs" && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 border-b pb-2">Recent Administrator Actions</h3>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center font-semibold">No actions recorded in audit logs yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-start justify-between text-xs font-bold text-left">
                    <div>
                      <span className="text-[#1E7FC2] font-extrabold">{log.user}</span>
                      <p className="text-slate-550 dark:text-slate-300 font-semibold mt-0.5">{log.action}</p>
                      {log.meta && <span className="text-[10px] text-slate-400 block font-normal mt-0.5">{log.meta}</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal ml-3 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default DynamicAdminSubPages;
