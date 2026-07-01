import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { uploadImageToImgbb } from "../../utils/imgbbUpload";
import { useApp } from "../../context/AppContext";
import { 
  Upload, 
  Trash2, 
  Search, 
  Copy, 
  Check, 
  Grid, 
  List, 
  FileText, 
  Info, 
  RefreshCw, 
  Eye, 
  Edit3, 
  ArrowUpDown, 
  CheckCircle,
  Download,
  AlertCircle,
  X
} from "lucide-react";

export function MediaLibrary() {
  const { doctors, services } = useApp();
  
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc"); // name-asc | name-desc | date-asc | date-desc | size-asc | size-desc
  const [sizeFilter, setSizeFilter] = useState("all"); // all | small | medium | large
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  // Selection states
  const [selectedItems, setSelectedItems] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  // Modal states
  const [previewItem, setPreviewItem] = useState(null);
  const [renameMode, setRenameMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingRename, setSavingRename] = useState(false);

  // Dynamic references searcher
  const [usages, setUsages] = useState([]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "mediaLibrary"));
      const list = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setMedia(list);
    } catch (err) {
      console.error("Failed to load media library:", err);
      // fallback mock media
      setMedia([
        { id: "dr-aravinda-babu", name: "dr-aravinda-babu.jpg", url: "https://i.ibb.co/3sS7H9y/dr-aravinda-babu.jpg", size: 45, originalSize: 120, uploadedAt: null },
        { id: "exterior", name: "exterior.jpg", url: "https://i.ibb.co/3sS7H9y/exterior.jpg", size: 128, originalSize: 340, uploadedAt: null }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Multi-file bulk upload
  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setStatusMessage({ type: "info", text: `Compressing and uploading ${files.length} images...` });

    let successCount = 0;
    let failCount = 0;

    for (let file of files) {
      try {
        await uploadImageToImgbb(file);
        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        failCount++;
      }
    }

    setUploading(false);
    setStatusMessage({
      type: successCount > 0 ? "success" : "error",
      text: `Upload finished: ${successCount} successful, ${failCount} failed.`,
    });
    
    await fetchMedia();
  };

  // Delete media item
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete image "${item.name}"?`)) return;
    try {
      await deleteDoc(doc(db, "mediaLibrary", item.id));
      setMedia((prev) => prev.filter((m) => m.id !== item.id));
      if (previewItem?.id === item.id) setPreviewItem(null);
      setStatusMessage({ type: "success", text: `Deleted "${item.name}" successfully.` });
    } catch (err) {
      console.error("Failed to delete media:", err);
      setStatusMessage({ type: "error", text: "Failed to delete from database." });
    }
  };

  // Bulk Delete selected items
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Delete ${selectedItems.length} selected images?`)) return;

    setLoading(true);
    let deletedCount = 0;
    for (let id of selectedItems) {
      try {
        await deleteDoc(doc(db, "mediaLibrary", id));
        deletedCount++;
      } catch (err) {
        console.error("Failed to delete", id, err);
      }
    }
    setSelectedItems([]);
    setStatusMessage({ type: "success", text: `Bulk deleted ${deletedCount} images.` });
    await fetchMedia();
  };

  // Copy Link utility
  const handleCopyLink = (item) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Rename media item
  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !previewItem) return;
    setSavingRename(true);
    try {
      const updatedItem = { ...previewItem, name: newName.trim() };
      await setDoc(doc(db, "mediaLibrary", previewItem.id), { name: newName.trim() }, { merge: true });
      setMedia((prev) => prev.map((m) => (m.id === previewItem.id ? updatedItem : m)));
      setPreviewItem(updatedItem);
      setRenameMode(false);
      setStatusMessage({ type: "success", text: "Image renamed successfully." });
    } catch (err) {
      console.error("Failed to rename:", err);
      alert("Rename failed.");
    } finally {
      setSavingRename(false);
    }
  };

  // Check where image is used in collections (doctor profiles, services data, page slots)
  const trackUsage = (item) => {
    const list = [];
    const url = item.url;

    // Search doctors
    doctors.forEach((d) => {
      if (d.photoUrl === url) {
        list.push(`Doctor Profile: ${d.name}`);
      }
    });

    // Search services
    services.forEach((s) => {
      if (s.thumbnailUrl === url) {
        list.push(`Service Page: ${s.name}`);
      }
    });

    setUsages(list);
  };

  useEffect(() => {
    if (previewItem) {
      trackUsage(previewItem);
      setNewName(previewItem.name);
    }
  }, [previewItem]);

  // Filtering & Sorting Math
  const filteredMedia = media
    .filter((item) => {
      // 1. Search Query
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Size Filter
      if (sizeFilter === "small") return matchSearch && (item.size || 0) < 150;
      if (sizeFilter === "medium") return matchSearch && (item.size || 0) >= 150 && (item.size || 0) <= 500;
      if (sizeFilter === "large") return matchSearch && (item.size || 0) > 500;

      return matchSearch;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "size-asc") return (a.size || 0) - (b.size || 0);
      if (sortBy === "size-desc") return (b.size || 0) - (a.size || 0);
      if (sortBy === "date-asc") return (a.uploadedAt?.seconds || 0) - (b.uploadedAt?.seconds || 0);
      return (b.uploadedAt?.seconds || 0) - (a.uploadedAt?.seconds || 0); // date-desc (default)
    });

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredMedia.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredMedia.map((m) => m.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Page header details */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Centralized Media Library</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Access hospital asset logs, upload images, perform bulk deletions, and track asset usage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedia}
            className="flex items-center space-x-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-500 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Files</span>
          </button>
          
          <label className="bg-[#1E7FC2] hover:bg-[#1E7FC2]/90 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer shadow-sm transition flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Bulk Upload Files</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleBulkUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-start space-x-2 text-xs font-bold border ${
          statusMessage.type === "success" 
            ? "bg-[#3FA535]/10 border-[#3FA535]/30 text-[#358E2C]" 
            : statusMessage.type === "error"
            ? "bg-[#D81F26]/10 border-[#D81F26]/30 text-[#D81F26]"
            : "bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30 text-blue-600"
        }`}>
          <Info className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
          <span className="leading-relaxed">{statusMessage.text}</span>
        </div>
      )}

      {/* Filter panel strip */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl shadow-xs">
        
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search image name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E7FC2] text-slate-800 dark:text-white"
          />
        </div>

        {/* Sort & Size Filters */}
        <div className="flex flex-wrap items-center gap-3 font-bold text-xs text-slate-500">
          
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-850 border rounded-lg p-1.5 focus:outline-none"
            >
              <option value="date-desc">Newest Uploads</option>
              <option value="date-asc">Oldest Uploads</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="size-desc">Largest size</option>
              <option value="size-asc">Smallest size</option>
            </select>
          </div>

          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-850 border rounded-lg p-1.5 focus:outline-none"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small (&lt;150 KB)</option>
            <option value="medium">Optimized (150-500 KB)</option>
            <option value="large">Heavy (&gt;500 KB)</option>
          </select>

          {/* Toggle Grid/List */}
          <div className="flex bg-slate-100 dark:bg-slate-850 rounded-lg p-0.5 border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${viewMode === "grid" ? "bg-white dark:bg-slate-750 text-[#1E7FC2]" : "text-slate-400"}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${viewMode === "list" ? "bg-white dark:bg-slate-750 text-[#1E7FC2]" : "text-slate-400"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Bulk actions status panel */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 px-5 py-3 rounded-2xl flex justify-between items-center text-xs font-bold text-[#1E7FC2]">
          <span>{selectedItems.length} images selected</span>
          <button
            onClick={handleBulkDelete}
            className="flex items-center space-x-1 border border-brand-red text-brand-red bg-white dark:bg-slate-900 hover:bg-brand-red/5 px-3 py-1.5 rounded-lg text-[10px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[#1E7FC2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 mt-4">Loading library catalog...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border rounded-3xl p-6 text-slate-400 font-semibold">
          No files match your filter settings. Upload new images above.
        </div>
      ) : (
        <>
          {/* Check All Selector */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 pl-2">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredMedia.length}
              onChange={toggleSelectAll}
              className="rounded text-primary h-3.5 w-3.5"
            />
            <span>Select All Visible ({filteredMedia.length} items)</span>
          </div>

          {/* GRID VIEW */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredMedia.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`relative group bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 ${
                      isSelected ? "border-[#1E7FC2] ring-2 ring-[#1E7FC2]/10" : "border-slate-100 dark:border-slate-850"
                    }`}
                  >
                    
                    {/* Select box top left */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="absolute top-2.5 left-2.5 z-20 rounded text-primary h-4 w-4 cursor-pointer"
                    />

                    {/* Preview box */}
                    <div 
                      onClick={() => setPreviewItem(item)}
                      className="aspect-square bg-slate-50 dark:bg-slate-850 cursor-pointer overflow-hidden flex items-center justify-center relative"
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Footer text */}
                    <div className="p-3 text-xs space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-350 truncate max-w-full" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
                        <span>{item.size || 0} KB</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition duration-150">
                          <button onClick={() => handleCopyLink(item)} className="hover:text-[#1E7FC2]">
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDeleteItem(item)} className="hover:text-brand-red">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            
            /* LIST VIEW */
            <div className="bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3 w-10"></th>
                    <th className="px-5 py-3">File Asset</th>
                    <th className="px-5 py-3">Size Metrics</th>
                    <th className="px-5 py-3">Compression</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-semibold text-slate-650 dark:text-slate-350">
                  {filteredMedia.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    const compressionRate = item.originalSize && item.size 
                      ? Math.round((1 - (item.size / item.originalSize)) * 100) 
                      : 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item.id)}
                            className="rounded text-primary h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-5 py-3 flex items-center space-x-3 cursor-pointer" onClick={() => setPreviewItem(item)}>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="truncate max-w-xs text-left">
                            <p className="font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                            <span className="text-[9px] text-[#1E7FC2] block font-mono truncate">{item.url}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span>{item.size || 0} KB</span>
                          {item.originalSize && (
                            <span className="text-[10px] text-slate-400 block font-normal">Original: {item.originalSize} KB</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {compressionRate > 0 ? (
                            <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-450">
                              -{compressionRate}% saved
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end space-x-3">
                            <button onClick={() => handleCopyLink(item)} className="p-1 text-slate-400 hover:text-[#1E7FC2]" title="Copy URL">
                              {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDeleteItem(item)} className="p-1 text-slate-400 hover:text-brand-red" title="Delete file">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* PHOTO PREVIEW DETAILS MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setPreviewItem(null);
                setRenameMode(false);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-6 h-6 text-slate-450" />
            </button>

            <h2 className="text-xl font-serif font-extrabold text-[#0B3C5D] dark:text-white pb-3 border-b">
              File Details & usage
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
              
              {/* Preview image */}
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-850 border relative flex items-center justify-center">
                <img src={previewItem.url} alt={previewItem.name} className="max-w-full max-h-full object-contain" />
              </div>

              {/* Attributes & usage details */}
              <div className="space-y-5 text-xs font-semibold">
                
                {/* Rename block */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">File Name</span>
                  {renameMode ? (
                    <form onSubmit={handleRename} className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#1E7FC2] text-slate-800 dark:text-white"
                        required
                      />
                      <button
                        type="submit"
                        disabled={savingRename}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition disabled:opacity-50"
                      >
                        {savingRename ? "Saving..." : "Save"}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="truncate max-w-[200px] text-slate-850 dark:text-slate-50 font-mono">{previewItem.name}</span>
                      <button 
                        onClick={() => setRenameMode(true)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-750 text-[#1E7FC2] rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* File size & direct url stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">WebP size</span>
                    <span className="text-sm font-black text-[#0B3C5D] dark:text-white">{previewItem.size || 0} KB</span>
                  </div>
                  {previewItem.originalSize && (
                    <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Raw Original</span>
                      <span className="text-sm font-black text-[#0B3C5D] dark:text-white">{previewItem.originalSize} KB</span>
                    </div>
                  )}
                </div>

                {/* Direct ImgBB Link trigger */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Direct CDN Link</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={previewItem.url}
                      readOnly
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-[10px] font-mono focus:outline-none text-slate-400"
                    />
                    <button
                      onClick={() => handleCopyLink(previewItem)}
                      className="bg-[#0B3C5D] hover:bg-[#0B3C5D]/90 text-white p-2.5 rounded-xl transition flex items-center justify-center"
                      title="Copy URL to clipboard"
                    >
                      {copiedId === previewItem.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Dynamic usages tracking checklists */}
                <div className="space-y-1.5 border-t pt-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    System usage references
                  </span>
                  {usages.length === 0 ? (
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px]">Unused file. Safe to delete.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {usages.map((usage, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{usage}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions bottom */}
                <div className="flex gap-3 pt-2">
                  <a
                    href={previewItem.url}
                    download={previewItem.name}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 border text-center p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 text-slate-650 dark:text-slate-350"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Raw</span>
                  </a>
                  <button
                    onClick={() => handleDeleteItem(previewItem)}
                    className="flex-1 bg-brand-red text-white p-2.5 rounded-xl hover:bg-brand-red/90 transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete File</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MediaLibrary;
