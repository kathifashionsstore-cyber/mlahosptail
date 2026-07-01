import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { uploadImageToImgbb } from "../../utils/imgbbUpload";
import { FileEdit, Plus, Trash2, Save, X, Image as ImageIcon, Check, FileText } from "lucide-react";

export function ContentManager() {
  const { loadCollections } = useApp();
  const [activeTab, setActiveTab] = useState("hero"); // 'hero' | 'doctors' | 'treatments' | 'blogs' | 'albums'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null); // item object being edited
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form Fields State
  const [fields, setFields] = useState({});

  const fetchItems = async () => {
    setLoading(true);
    try {
      let q;
      switch (activeTab) {
        case "hero":
          q = query(collection(db, "heroSlides"), orderBy("order", "asc"));
          break;
        case "doctors":
          q = query(collection(db, "doctors"), orderBy("order", "asc"));
          break;
        case "treatments":
          q = query(collection(db, "treatments"), orderBy("order", "asc"));
          break;
        case "blogs":
          q = query(collection(db, "blogs"), orderBy("publishedAt", "desc"));
          break;
        case "albums":
          q = query(collection(db, "galleryAlbums"), orderBy("order", "asc"));
          break;
        default:
          return;
      }
      const querySnap = await getDocs(q);
      setItems(querySnap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    } catch (err) {
      console.error("Failed to load collection items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleOpenAddModal = () => {
    setEditItem(null);
    setUploadProgress(0);
    // Initialize default fields depending on activeTab
    switch (activeTab) {
      case "hero":
        setFields({ heading: "", subheading: "", badgeText: "", ctaText: "Book Appointment", ctaLink: "/book-appointment", order: 1, isActive: true, imageUrl: "", imageDeleteUrl: "" });
        break;
      case "doctors":
        setFields({ name: "", qualification: "", designation: "", specialization: "", experienceYears: 10, languages: "English, Telugu", bio: "", consultationTimings: "10:00 AM – 7:00 PM, Mon–Sat", consultationDays: "Mon, Tue, Wed, Thu, Fri, Sat", departmentId: "", order: 1, isActive: true, isFeaturedOnHome: true, photoUrl: "", photoDeleteUrl: "" });
        break;
      case "treatments":
        setFields({ name: "", slug: "", departmentId: "", shortDescription: "", description: "", symptoms: "", causes: "", treatmentProcess: "", benefits: "", order: 1, isActive: true, isFeaturedOnHome: true, thumbnailUrl: "", thumbnailDeleteUrl: "" });
        break;
      case "blogs":
        setFields({ title: "", slug: "", category: "Bone Health", excerpt: "", content: "", authorName: "Amulya Nursing Home", isPublished: true, views: 0, thumbnailUrl: "", thumbnailDeleteUrl: "" });
        break;
      case "albums":
        setFields({ title: "", order: 1, isActive: true, coverImageUrl: "", coverImageDeleteUrl: "" });
        break;
      default:
        break;
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditItem(item);
    setUploadProgress(0);
    // Map fields
    const copy = { ...item };
    if (activeTab === "doctors") {
      copy.specialization = item.specialization?.join(", ") || "";
      copy.languages = item.languages?.join(", ") || "";
      copy.consultationDays = item.consultationDays?.join(", ") || "";
    } else if (activeTab === "treatments") {
      copy.symptoms = item.symptoms?.join("\n") || "";
      copy.causes = item.causes?.join("\n") || "";
      copy.benefits = item.benefits?.join("\n") || "";
    }
    setFields(copy);
    setIsModalOpen(true);
  };

  const handleFieldChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  // Image Upload helper
  const handleImageUpload = async (e, urlField, deleteUrlField) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadImageToImgbb(file, (p) => {
        setUploadProgress(Math.round(p));
      });
      setFields((prev) => ({
        ...prev,
        [urlField]: result.url,
        [deleteUrlField]: result.deleteUrl,
      }));
    } catch (err) {
      console.error("Upload helper failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item? This action is permanent.")) return;
    try {
      let colName = "";
      switch (activeTab) {
        case "hero": colName = "heroSlides"; break;
        case "doctors": colName = "doctors"; break;
        case "treatments": colName = "treatments"; break;
        case "blogs": colName = "blogs"; break;
        case "albums": colName = "galleryAlbums"; break;
        default: return;
      }
      await deleteDoc(doc(db, colName, itemId));
      await fetchItems();
      await loadCollections();
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  // Save Item (Add or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let colName = "";
      switch (activeTab) {
        case "hero": colName = "heroSlides"; break;
        case "doctors": colName = "doctors"; break;
        case "treatments": colName = "treatments"; break;
        case "blogs": colName = "blogs"; break;
        case "albums": colName = "galleryAlbums"; break;
        default: return;
      }

      // Format fields back to Firestore schemas (lists, integers)
      const dataToSave = { ...fields };
      delete dataToSave.id; // remove local id field

      if (activeTab === "doctors") {
        dataToSave.specialization = fields.specialization.split(",").map((s) => s.trim()).filter(Boolean);
        dataToSave.languages = fields.languages.split(",").map((s) => s.trim()).filter(Boolean);
        dataToSave.consultationDays = fields.consultationDays.split(",").map((s) => s.trim()).filter(Boolean);
        dataToSave.experienceYears = parseInt(fields.experienceYears, 10);
        dataToSave.order = parseInt(fields.order, 10);
      } else if (activeTab === "treatments") {
        dataToSave.symptoms = fields.symptoms.split("\n").map((s) => s.trim()).filter(Boolean);
        dataToSave.causes = fields.causes.split("\n").map((s) => s.trim()).filter(Boolean);
        dataToSave.benefits = fields.benefits.split("\n").map((s) => s.trim()).filter(Boolean);
        dataToSave.order = parseInt(fields.order, 10);
      } else if (activeTab === "hero" || activeTab === "albums") {
        dataToSave.order = parseInt(fields.order, 10);
      }

      if (activeTab === "blogs" && !editItem) {
        dataToSave.publishedAt = serverTimestamp();
      }

      if (editItem) {
        // Update doc
        await updateDoc(doc(db, colName, editItem.id), dataToSave);
      } else {
        // Add doc
        await addDoc(collection(db, colName), dataToSave);
      }

      setIsModalOpen(false);
      await fetchItems();
      await loadCollections();
    } catch (err) {
      console.error("Save content failed:", err);
      alert("Failed to save content item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-55 font-serif">Content Repository</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Manage marketing sliders, surgeries, health articles and gallery albums.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md self-start"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Content</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-100 dark:border-slate-850 pb-2 scrollbar-none select-none">
        {[
          { label: "Hero Banners", value: "hero" },
          { label: "Consulting Surgeons", value: "doctors" },
          { label: "Surgical Procedures", value: "treatments" },
          { label: "Health Blog Articles", value: "blogs" },
          { label: "Gallery Albums", value: "albums" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4.5 py-2 text-xs font-extrabold rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.value
                ? "bg-primary text-white dark:bg-primary-light"
                : "bg-white text-slate-655 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List / Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-3 font-semibold text-xs">Loading items...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Title / Name</th>
                  {activeTab !== "blogs" && <th className="px-6 py-4">Sequence Order</th>}
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-850 flex-shrink-0 flex items-center justify-center">
                        {item.imageUrl || item.photoUrl || item.thumbnailUrl || item.coverImageUrl ? (
                          <img src={item.imageUrl || item.photoUrl || item.thumbnailUrl || item.coverImageUrl} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold truncate max-w-xs">{item.heading || item.name || item.title}</span>
                    </td>
                    {activeTab !== "blogs" && <td className="px-6 py-4">{item.order}</td>}
                    <td className="px-6 py-4">
                      {item.isActive || item.isPublished ? (
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-450">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-400 px-2.5 py-0.5 rounded-full dark:bg-slate-800">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition"
                        title="Edit Item"
                      >
                        <FileEdit className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-550 transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 text-slate-400 font-semibold">
          No records found in this repository. Click "Add New" to get started.
        </div>
      )}

      {/* Editor Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <h3 className="text-xl font-bold text-slate-850 dark:text-slate-55 font-serif border-b border-slate-50 dark:border-slate-800 pb-2.5">
                {editItem ? "Edit Content Item" : "Create Content Item"}
              </h3>

              <form onSubmit={handleSaveItem} className="space-y-4">
                {/* 1. Image File Input & Compression (Section 2.4/2.5 requirement) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Upload Banner / Photo Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(
                        e,
                        activeTab === "hero"
                          ? "imageUrl"
                          : activeTab === "doctors"
                          ? "photoUrl"
                          : activeTab === "albums"
                          ? "coverImageUrl"
                          : "thumbnailUrl",
                        activeTab === "hero"
                          ? "imageDeleteUrl"
                          : activeTab === "doctors"
                          ? "photoDeleteUrl"
                          : activeTab === "albums"
                          ? "coverImageDeleteUrl"
                          : "thumbnailDeleteUrl"
                      )
                    }
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer dark:file:bg-slate-850 dark:file:text-slate-350"
                  />
                  {uploading && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 dark:bg-slate-800">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <p className="text-[10px] text-primary dark:text-primary-light font-bold">Uploading: {uploadProgress}%</p>
                    </div>
                  )}
                  {(fields.imageUrl || fields.photoUrl || fields.thumbnailUrl || fields.coverImageUrl) && (
                    <div className="flex items-center space-x-2 text-[10px] text-emerald-500 font-bold">
                      <Check className="w-4 h-4" />
                      <span>Image uploaded and linked successfully!</span>
                    </div>
                  )}
                </div>

                {/* 2. Dynamic Text Fields depending on activeTab */}
                {activeTab === "hero" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Heading</label>
                      <input type="text" required value={fields.heading || ""} onChange={(e) => handleFieldChange("heading", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Subheading</label>
                      <textarea value={fields.subheading || ""} onChange={(e) => handleFieldChange("subheading", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Badge Text</label>
                        <input type="text" value={fields.badgeText || ""} onChange={(e) => handleFieldChange("badgeText", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Order</label>
                        <input type="number" value={fields.order || 1} onChange={(e) => handleFieldChange("order", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "doctors" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Doctor Name</label>
                        <input type="text" required value={fields.name || ""} onChange={(e) => handleFieldChange("name", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Qualifications</label>
                        <input type="text" required value={fields.qualification || ""} onChange={(e) => handleFieldChange("qualification", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Designation / Role</label>
                      <input type="text" value={fields.designation || ""} onChange={(e) => handleFieldChange("designation", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Specializations (comma separated)</label>
                      <input type="text" value={fields.specialization || ""} onChange={(e) => handleFieldChange("specialization", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Biography</label>
                      <textarea rows="3" value={fields.bio || ""} onChange={(e) => handleFieldChange("bio", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                  </>
                )}

                {activeTab === "treatments" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Procedure Name</label>
                        <input type="text" required value={fields.name || ""} onChange={(e) => handleFieldChange("name", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Slug (e.g. total-knee-replacement)</label>
                        <input type="text" required value={fields.slug || ""} onChange={(e) => handleFieldChange("slug", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Short Description</label>
                      <input type="text" value={fields.shortDescription || ""} onChange={(e) => handleFieldChange("shortDescription", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Description (Rich Text)</label>
                      <textarea rows="3" value={fields.description || ""} onChange={(e) => handleFieldChange("description", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                  </>
                )}

                {activeTab === "blogs" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Article Title</label>
                        <input type="text" required value={fields.title || ""} onChange={(e) => handleFieldChange("title", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                      <div className="space-y-1 col-span-2 md:col-span-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Slug</label>
                        <input type="text" required value={fields.slug || ""} onChange={(e) => handleFieldChange("slug", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Excerpt / Intro Summary</label>
                      <input type="text" value={fields.excerpt || ""} onChange={(e) => handleFieldChange("excerpt", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Content (HTML or Text)</label>
                      <textarea rows="5" value={fields.content || ""} onChange={(e) => handleFieldChange("content", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                    </div>
                  </>
                )}

                {activeTab === "albums" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Album Title</label>
                    <input type="text" required value={fields.title || ""} onChange={(e) => handleFieldChange("title", e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100" />
                  </div>
                )}

                {/* Common Toggles (Active / Published) */}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={activeTab === "blogs" ? !!fields.isPublished : !!fields.isActive}
                    onChange={(e) => handleFieldChange(activeTab === "blogs" ? "isPublished" : "isActive", e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <label htmlFor="isActiveToggle" className="text-xs font-bold text-slate-500 select-none">
                    {activeTab === "blogs" ? "Publish article immediately" : "Activate content display"}
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="inline-flex items-center justify-center space-x-2 w-full bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm"
                >
                  <Save className="w-4.5 h-4.5" />
                  <span>{editItem ? "Save Changes" : "Create Item"}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContentManager;
