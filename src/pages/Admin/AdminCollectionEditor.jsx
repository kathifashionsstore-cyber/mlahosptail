import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Eye,
  FileEdit,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { uploadImageToImgbb } from "../../utils/imgbbUpload";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDisplayTitle(item) {
  return item.heading || item.name || item.title || item.page || item.slug || item.id;
}

function formatFieldValue(field, value) {
  if (field.type === "csv") return Array.isArray(value) ? value.join(", ") : value || "";
  if (field.type === "lines") return Array.isArray(value) ? value.join("\n") : value || "";
  if (field.type === "json") return value === undefined ? JSON.stringify(field.default ?? null, null, 2) : JSON.stringify(value, null, 2);
  if (field.type === "checkbox") return !!value;
  return value ?? field.default ?? "";
}

function parseFieldValue(field, value) {
  if (field.type === "number") return Number(value || 0);
  if (field.type === "checkbox") return !!value;
  if (field.type === "csv") {
    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (field.type === "lines") {
    return String(value || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (field.type === "json") {
    const text = String(value || "").trim();
    if (!text) return field.default ?? null;
    return JSON.parse(text);
  }
  return value;
}

export function AdminCollectionEditor({
  collectionName,
  title,
  description,
  fields,
  sortField = "order",
  idField = "slug",
  allowOrdering = true,
  previewPath,
  bulkImageField = "",
  bulkDefaults = {},
}) {
  const { loadCollections } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [draggedId, setDraggedId] = useState("");

  const orderedFields = useMemo(() => fields, [fields]);

  const visibleItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const textMatch = !normalizedSearch || JSON.stringify(item).toLowerCase().includes(normalizedSearch);
      const isArchived = item.status === "archived";
      const isDraft = item.status === "draft" || item.isActive === false || item.isPublished === false;
      const isPublished = !isArchived && !isDraft;

      if (statusFilter === "published" && !isPublished) return false;
      if (statusFilter === "draft" && !isDraft) return false;
      if (statusFilter === "archived" && !isArchived) return false;
      return textMatch;
    });
  }, [items, searchTerm, statusFilter]);

  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedIds.includes(item.id));

  const fetchItems = async () => {
    setLoading(true);
    try {
      let snapshot;
      try {
        snapshot = await getDocs(query(collection(db, collectionName), orderBy(sortField, "asc")));
      } catch {
        snapshot = await getDocs(collection(db, collectionName));
      }
      const docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      docs.sort((a, b) => Number(a[sortField] || 0) - Number(b[sortField] || 0));
      setItems(docs);
      setSelectedIds([]);
    } catch (error) {
      console.error(`Failed to load ${collectionName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [collectionName]);

  const openAddModal = () => {
    const defaults = {};
    orderedFields.forEach((field) => {
      defaults[field.name] = formatFieldValue(field, field.default);
    });
    if (sortField && defaults[sortField] === "") defaults[sortField] = items.length + 1;
    setEditingItem(null);
    setFormData(defaults);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    const nextData = {};
    orderedFields.forEach((field) => {
      nextData[field.name] = formatFieldValue(field, item[field.name]);
    });
    setEditingItem(item);
    setFormData(nextData);
    setIsModalOpen(true);
  };

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleImageUpload = async (event, fieldName) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    try {
      const result = await uploadImageToImgbb(file);
      handleChange(fieldName, result.url);
      handleChange(`${fieldName}DeleteUrl`, result.deleteUrl);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(error.message || "Image upload failed.");
    } finally {
      setUploadingField("");
    }
  };

  const handleBulkImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!bulkImageField || files.length === 0) return;

    setBulkUploading(true);
    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const result = await uploadImageToImgbb(file);
        const fileBaseName = file.name.replace(/\.[^.]+$/, "");
        const documentId = `${slugify(fileBaseName) || "image"}-${Date.now()}-${index + 1}`;
        await setDoc(doc(db, collectionName, documentId), {
          id: documentId,
          ...bulkDefaults,
          [bulkImageField]: result.url,
          [`${bulkImageField}DeleteUrl`]: result.deleteUrl || "",
          caption: bulkDefaults.caption || fileBaseName,
          order: items.length + index + 1,
          isActive: true,
        });
      }
      await fetchItems();
      await loadCollections();
    } catch (error) {
      console.error(`Bulk upload failed for ${collectionName}:`, error);
      alert(error.message || "Bulk upload failed.");
    } finally {
      setBulkUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = {};
      orderedFields.forEach((field) => {
        data[field.name] = parseFieldValue(field, formData[field.name]);
      });

      Object.keys(formData)
        .filter((key) => key.endsWith("DeleteUrl"))
        .forEach((key) => {
          data[key] = formData[key];
        });

      if (collectionName === "blogs" && !editingItem && !data.publishedAt) {
        data.publishedAt = new Date().toISOString();
      }

      const requestedId = data[idField] || data.id || data.name || data.title || data.heading || data.page;
      const documentId = editingItem?.id || slugify(requestedId) || `${collectionName}-${Date.now()}`;

      if (editingItem) {
        await updateDoc(doc(db, collectionName, documentId), data);
      } else {
        await setDoc(doc(db, collectionName, documentId), { id: documentId, ...data });
      }

      setIsModalOpen(false);
      await fetchItems();
      await loadCollections();
    } catch (error) {
      console.error(`Failed to save ${collectionName}:`, error);
      alert(error.message || "Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${getDisplayTitle(item)}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, collectionName, item.id));
      await fetchItems();
      await loadCollections();
    } catch (error) {
      console.error(`Failed to delete ${collectionName}:`, error);
      alert(error.message || "Failed to delete item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (item) => {
    setSaving(true);
    try {
      const clone = { ...item };
      delete clone.id;

      const labelField = ["name", "title", "heading", "caption"].find((key) => clone[key]);
      if (labelField) clone[labelField] = `${clone[labelField]} Copy`;
      if (clone.slug) clone.slug = `${clone.slug}-copy`;
      if (sortField) clone[sortField] = items.length + 1;

      const requestedId = clone[idField] || clone.slug || clone.name || clone.title || clone.heading || `${collectionName}-${Date.now()}`;
      const documentId = `${slugify(requestedId)}-${Date.now()}`;
      await setDoc(doc(db, collectionName, documentId), { id: documentId, ...clone });
      await fetchItems();
      await loadCollections();
    } catch (error) {
      console.error(`Failed to duplicate ${collectionName}:`, error);
      alert(error.message || "Failed to duplicate item.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSelection = (itemId) => {
    setSelectedIds((prev) => (
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    ));
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleItems.some((item) => item.id === id));
      }

      return Array.from(new Set([...prev, ...visibleItems.map((item) => item.id)]));
    });
  };

  const handleBulkUpdate = async (patch, confirmMessage) => {
    if (selectedIds.length === 0) return;
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setSaving(true);
    try {
      await Promise.all(selectedIds.map((itemId) => updateDoc(doc(db, collectionName, itemId), patch)));
      await fetchItems();
      await loadCollections();
    } catch (error) {
      console.error(`Bulk update failed for ${collectionName}:`, error);
      alert(error.message || "Bulk update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected record(s)? This cannot be undone.`)) return;

    setSaving(true);
    try {
      await Promise.all(selectedIds.map((itemId) => deleteDoc(doc(db, collectionName, itemId))));
      await fetchItems();
      await loadCollections();
    } catch (error) {
      console.error(`Bulk delete failed for ${collectionName}:`, error);
      alert(error.message || "Bulk delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (item, direction) => {
    const sortedItems = [...items].sort((a, b) => Number(a[sortField] || 0) - Number(b[sortField] || 0));
    const index = sortedItems.findIndex((entry) => entry.id === item.id);
    const swapWith = sortedItems[index + direction];
    if (!swapWith) return;

    await Promise.all([
      updateDoc(doc(db, collectionName, item.id), { [sortField]: Number(swapWith[sortField] || 0) }),
      updateDoc(doc(db, collectionName, swapWith.id), { [sortField]: Number(item[sortField] || 0) }),
    ]);
    await fetchItems();
    await loadCollections();
  };

  const handleDrop = async (targetItem) => {
    if (!draggedId || draggedId === targetItem.id) return;

    const sortedItems = [...items].sort((a, b) => Number(a[sortField] || 0) - Number(b[sortField] || 0));
    const draggedIndex = sortedItems.findIndex((entry) => entry.id === draggedId);
    const targetIndex = sortedItems.findIndex((entry) => entry.id === targetItem.id);
    if (draggedIndex < 0 || targetIndex < 0) return;

    const [draggedItem] = sortedItems.splice(draggedIndex, 1);
    sortedItems.splice(targetIndex, 0, draggedItem);

    setSaving(true);
    try {
      await Promise.all(
        sortedItems.map((entry, index) => updateDoc(doc(db, collectionName, entry.id), { [sortField]: index + 1 }))
      );
      await fetchItems();
      await loadCollections();
    } catch (error) {
      console.error(`Failed to reorder ${collectionName}:`, error);
      alert(error.message || "Failed to reorder records.");
    } finally {
      setSaving(false);
      setDraggedId("");
    }
  };

  const openPreview = (item) => {
    if (!previewPath) return;
    const path = previewPath(item);
    if (path) window.open(path, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">{title}</h1>
          {description && <p className="text-xs font-semibold text-slate-400 mt-1">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          {bulkImageField && (
            <label className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md cursor-pointer">
              <UploadCloud className="w-4.5 h-4.5" />
              <span>{bulkUploading ? "Uploading..." : "Bulk Upload"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={bulkUploading || saving}
                onChange={handleBulkImageUpload}
                className="hidden"
              />
            </label>
          )}
          <button
            onClick={openAddModal}
            className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
          <label className="relative block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-primary text-slate-700 dark:text-slate-100"
          >
            <option value="all">All statuses</option>
            <option value="published">Published / active</option>
            <option value="draft">Draft / disabled</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => handleBulkUpdate({ isActive: true, isPublished: true, status: "published" })}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Publish
            </button>
            <button
              onClick={() => handleBulkUpdate({ isActive: false, status: "draft" })}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              Draft
            </button>
            <button
              onClick={() => handleBulkUpdate({ isActive: false, status: "archived" })}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white disabled:opacity-50"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-3 font-semibold text-xs">Loading records...</p>
        </div>
      ) : visibleItems.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
                  <th className="px-6 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                  </th>
                  <th className="px-6 py-4">Record</th>
                  {allowOrdering && <th className="px-6 py-4">Order</th>}
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {visibleItems.map((item) => (
                  <tr
                    key={item.id}
                    draggable={allowOrdering}
                    onDragStart={() => setDraggedId(item.id)}
                    onDragOver={(event) => allowOrdering && event.preventDefault()}
                    onDrop={() => allowOrdering && handleDrop(item)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelection(item.id)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-850 flex-shrink-0 flex items-center justify-center">
                          {item.imageUrl || item.photoUrl || item.thumbnailUrl || item.coverImageUrl ? (
                            <img
                              src={item.imageUrl || item.photoUrl || item.thumbnailUrl || item.coverImageUrl}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold truncate max-w-xs">{getDisplayTitle(item)}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{item.slug || item.page || item.id}</p>
                        </div>
                      </div>
                    </td>
                    {allowOrdering && <td className="px-6 py-4">{item[sortField] ?? "-"}</td>}
                    <td className="px-6 py-4">
                      {item.status === "archived" ? (
                        <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full dark:bg-slate-800">
                          Archived
                        </span>
                      ) : item.status === "draft" || item.isActive === false || item.isPublished === false ? (
                        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-350">
                          Draft
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-450">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end space-x-2">
                        {previewPath && (
                          <button onClick={() => openPreview(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-600 transition" title="Preview">
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                        )}
                        {allowOrdering && (
                          <>
                            <button onClick={() => handleMove(item, -1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" title="Move up">
                              <ArrowUp className="w-4.5 h-4.5" />
                            </button>
                            <button onClick={() => handleMove(item, 1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" title="Move down">
                              <ArrowDown className="w-4.5 h-4.5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDuplicate(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-600 transition" title="Duplicate">
                          <Copy className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => openEditModal(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition" title="Edit">
                          <FileEdit className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-550 transition" title="Delete">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 text-slate-400 font-semibold">
          {items.length === 0 ? "No records found. Click \"Add New\" to create one." : "No records match the current search or filter."}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <h2 className="text-xl font-bold text-slate-850 dark:text-slate-55 font-serif border-b border-slate-50 dark:border-slate-800 pb-2.5">
                {editingItem ? "Edit Record" : "Create Record"}
              </h2>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderedFields.map((field) => {
                  const isWide = field.type === "textarea" || field.type === "json" || field.type === "lines" || field.wide;
                  return (
                    <div key={field.name} className={`space-y-1 ${isWide ? "md:col-span-2" : ""}`}>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{field.label}</label>
                      {field.type === "textarea" || field.type === "json" || field.type === "lines" ? (
                        <textarea
                          rows={field.type === "json" ? 7 : 4}
                          value={formData[field.name] ?? ""}
                          onChange={(event) => handleChange(field.name, event.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100 font-sans"
                        />
                      ) : field.type === "checkbox" ? (
                        <label className="flex items-center space-x-2 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData[field.name]}
                            onChange={(event) => handleChange(field.name, event.target.checked)}
                            className="rounded text-primary focus:ring-primary h-4 w-4"
                          />
                          <span className="text-xs font-bold text-slate-500">{field.checkboxLabel || "Enabled"}</span>
                        </label>
                      ) : field.type === "select" ? (
                        <select
                          value={formData[field.name] ?? ""}
                          required={field.required}
                          onChange={(event) => handleChange(field.name, event.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                        >
                          {(field.options || []).map((option) => (
                            <option key={option.value ?? option} value={option.value ?? option}>
                              {option.label ?? option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "image" ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formData[field.name] ?? ""}
                            onChange={(event) => handleChange(field.name, event.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleImageUpload(event, field.name)}
                            className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer dark:file:bg-slate-850 dark:file:text-slate-350"
                          />
                          {uploadingField === field.name && <p className="text-[10px] font-bold text-primary">Uploading image...</p>}
                          {formData[field.name] && (
                            <div className="flex items-center gap-3">
                              <img
                                src={formData[field.name]}
                                alt=""
                                className="h-14 w-20 rounded-lg object-cover bg-slate-100 dark:bg-slate-800"
                              />
                              <p className="flex items-center space-x-1 text-[10px] text-emerald-500 font-bold">
                                <Check className="w-3.5 h-3.5" />
                                <span>Image URL linked</span>
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "datetime-local" ? "datetime-local" : "text"}
                          required={field.required}
                          value={formData[field.name] ?? ""}
                          onChange={(event) => handleChange(field.name, event.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                        />
                      )}
                      {field.help && <p className="text-[10px] text-slate-400 font-semibold">{field.help}</p>}
                    </div>
                  );
                })}

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving || !!uploadingField}
                    className="inline-flex items-center justify-center space-x-2 w-full bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm"
                  >
                    <Save className="w-4.5 h-4.5" />
                    <span>{saving ? "Saving..." : "Save Record"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminCollectionEditor;
