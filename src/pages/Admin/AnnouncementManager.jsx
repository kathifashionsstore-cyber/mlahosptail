import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { Plus, Trash2, Edit2, Check, ArrowUp, ArrowDown, Save, Info, Megaphone } from "lucide-react";

export function AnnouncementManager() {
  const { loadCollections } = useApp();

  const [announcements, setAnnouncements] = useState([]);
  const [showBar, setShowBar] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(3000);
  const [bgColorOverride, setBgColorOverride] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(null); // id of item being edited
  const [formData, setFormData] = useState({
    text: "",
    linkUrl: "",
    linkLabel: "",
    isActive: true
  });

  useEffect(() => {
    fetchSettings();
    fetchAnnouncements();
  }, []);

  const fetchSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "siteSettings", "announcementBar"));
      if (snap.exists()) {
        const data = snap.data();
        setShowBar(data.showAnnouncementBar !== false);
        setRotationSpeed(data.rotationSpeed || 3000);
        setBgColorOverride(data.backgroundColor || "");
      }
    } catch (err) {
      console.error("Failed to load announcement bar settings:", err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const q = query(collection(db, "announcements"), orderBy("order", "asc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      
      if (list.length === 0) {
        // Seed default items if empty
        const defaults = [
          { text: "🌐 Website made by WayzenTech | 📞 9398724704", linkUrl: "", linkLabel: "", isActive: true, order: 1 },
          { text: "🏥 Amulya Nursing Home — Spine, Joint & Trauma Care | Guntur Road, Narasaraopet", linkUrl: "/about", linkLabel: "About Us", isActive: true, order: 2 },
          { text: "📞 OPD Appointments: +91 8647223625 | Mon–Sat 9AM–6PM", linkUrl: "/book-appointment", linkLabel: "Book Now", isActive: true, order: 3 },
          { text: "🚑 24/7 Emergency & Trauma Care Available", linkUrl: "/contact", linkLabel: "Emergency contact", isActive: true, order: 4 }
        ];
        
        const seededList = [];
        for (const item of defaults) {
          const docRef = await addDoc(collection(db, "announcements"), item);
          seededList.push({ id: docRef.id, ...item });
        }
        setAnnouncements(seededList);
      } else {
        setAnnouncements(list);
      }
    } catch (err) {
      console.error("Failed to load announcements list:", err);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setStatus({ type: "info", text: "Saving settings..." });
    try {
      await setDoc(doc(db, "siteSettings", "announcementBar"), {
        showAnnouncementBar: showBar,
        rotationSpeed: Number(rotationSpeed),
        backgroundColor: bgColorOverride
      }, { merge: true });

      if (loadCollections) await loadCollections();
      setStatus({ type: "success", text: "Settings saved successfully!" });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to save announcement bar settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitItem = async (e) => {
    e.preventDefault();
    if (!formData.text.trim()) return;

    setLoading(true);
    try {
      if (isEditing) {
        // Update
        await setDoc(doc(db, "announcements", isEditing), formData, { merge: true });
        setAnnouncements((prev) =>
          prev.map((item) => (item.id === isEditing ? { ...item, ...formData } : item))
        );
        setIsEditing(null);
        setStatus({ type: "success", text: "Announcement updated!" });
      } else {
        // Create
        const nextOrder = announcements.length > 0 ? Math.max(...announcements.map((a) => a.order || 0)) + 1 : 1;
        const newItem = { ...formData, order: nextOrder };
        const docRef = await addDoc(collection(db, "announcements"), newItem);
        setAnnouncements((prev) => [...prev, { id: docRef.id, ...newItem }]);
        setStatus({ type: "success", text: "Announcement added!" });
      }

      setFormData({ text: "", linkUrl: "", linkLabel: "", isActive: true });
      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to save announcement item." });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(item.id);
    setFormData({
      text: item.text,
      linkUrl: item.linkUrl || "",
      linkLabel: item.linkLabel || "",
      isActive: item.isActive !== false
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setStatus({ type: "success", text: "Announcement deleted." });
      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to delete announcement." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (item) => {
    const nextActive = !item.isActive;
    try {
      await updateDoc(doc(db, "announcements", item.id), { isActive: nextActive });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isActive: nextActive } : a))
      );
      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error(err);
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= announcements.length) return;

    const list = [...announcements];
    const temp = list[index].order;
    list[index].order = list[targetIndex].order;
    list[targetIndex].order = temp;

    // Sort again
    const sorted = [...list].sort((a, b) => a.order - b.order);
    setAnnouncements(sorted);

    try {
      await updateDoc(doc(db, "announcements", list[index].id), { order: list[index].order });
      await updateDoc(doc(db, "announcements", list[targetIndex].id), { order: list[targetIndex].order });
      if (loadCollections) await loadCollections();
    } catch (err) {
      console.error("Failed to update orders:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Announcement Bar Settings</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Manage text announcements displayed at the very top of the public website.
          </p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-start space-x-2 text-xs font-bold border ${
          status.type === "success" 
            ? "bg-[#3FA535]/10 border-[#3FA535]/30 text-[#358E2C]" 
            : status.type === "error"
            ? "bg-[#D81F26]/10 border-[#D81F26]/30 text-[#D81F26]"
            : "bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 text-blue-600"
        }`}>
          <Info className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
          <span>{status.text}</span>
        </div>
      )}

      {/* Master settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl space-y-4 text-left shadow-sm">
        <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white border-b pb-2">
          Global Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBar}
              onChange={(e) => setShowBar(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-slate-200 text-[#1E7FC2] focus:ring-[#1E7FC2]"
            />
            <span className="text-xs font-extrabold text-slate-650 dark:text-slate-350">Show Announcement Bar</span>
          </label>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">Rotation Speed</label>
            <select
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-2.5 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="2000">2 Seconds</option>
              <option value="3000">3 Seconds (Default)</option>
              <option value="5000">5 Seconds</option>
              <option value="8000">8 Seconds</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">Bg Color Override (Optional)</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={bgColorOverride || "#1E7FC2"}
                onChange={(e) => setBgColorOverride(e.target.value)}
                className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 overflow-hidden"
              />
              <input
                type="text"
                placeholder="e.g. #D81F26"
                value={bgColorOverride}
                onChange={(e) => setBgColorOverride(e.target.value)}
                className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E7FC2] uppercase text-slate-850 dark:text-white"
              />
              {bgColorOverride && (
                <button
                  onClick={() => setBgColorOverride("")}
                  className="text-xs font-bold text-brand-red hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition active:scale-95 flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save Bar Settings</span>
        </button>
      </div>

      {/* Editor Form & List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-left">
        {/* Item Form */}
        <form onSubmit={handleSubmitItem} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white border-b pb-2">
            {isEditing ? "Edit Item" : "Create New Announcement"}
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">Announcement Text *</label>
            <textarea
              required
              rows="3"
              placeholder="Enter announcement text content..."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E7FC2] text-slate-850 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">Link URL (Optional)</label>
            <input
              type="text"
              placeholder="e.g. /book-appointment"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E7FC2] text-slate-850 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 block">Link Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Click Here"
              value={formData.linkLabel}
              onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E7FC2] text-slate-850 dark:text-white"
            />
          </div>

          <label className="flex items-center space-x-2 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded text-[#1E7FC2] focus:ring-[#1E7FC2]"
            />
            <span className="text-xs font-bold text-slate-650 dark:text-slate-350">Mark Active</span>
          </label>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#3FA535] hover:bg-[#358E2C] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow transition active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              {isEditing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isEditing ? "Update" : "Add Announcement"}</span>
            </button>
            
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(null);
                  setFormData({ text: "", linkUrl: "", linkLabel: "", isActive: true });
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Reorderable List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl shadow-sm md:col-span-2 space-y-4">
          <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white border-b pb-2">
            Announcements Directory
          </h3>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {announcements.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs">
                No announcement items registered.
              </div>
            ) : (
              announcements.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-2xl flex items-start justify-between gap-4 transition ${
                    item.isActive 
                      ? "border-slate-100 dark:border-slate-805 bg-white dark:bg-slate-900" 
                      : "border-slate-100/50 bg-slate-50/50 text-slate-400"
                  }`}
                >
                  <div className="flex-1 space-y-2 text-xs">
                    <p className="font-semibold leading-relaxed text-slate-800 dark:text-slate-200">{item.text}</p>
                    {(item.linkUrl || item.linkLabel) && (
                      <div className="flex items-center space-x-2 text-[10px] text-slate-450 font-bold">
                        <span className="bg-slate-105 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Link: {item.linkUrl || "None"}
                        </span>
                        {item.linkLabel && (
                          <span className="bg-slate-105 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Label: {item.linkLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* Sort buttons */}
                    <div className="flex flex-col space-y-1">
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveOrder(idx, 1)}
                        disabled={idx === announcements.length - 1}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit, Toggle, Trash */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`p-1.5 rounded-lg border font-bold text-[9px] uppercase tracking-wider transition ${
                        item.isActive 
                          ? "border-[#3FA535]/30 text-[#358E2C] hover:bg-[#3FA535]/5 bg-[#3FA535]/5" 
                          : "border-slate-200 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-[#1E7FC2] transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-red transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementManager;
