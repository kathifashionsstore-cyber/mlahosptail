import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, addDoc, getDocs, collection, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { Palette, Layers, RefreshCw, Undo, Save, Info, Sparkles, Check } from "lucide-react";

const PRESET_THEMES = [
  {
    id: "amulya-classic",
    name: "Amulya Classic",
    desc: "Navy blue + Red (current site colors, default)",
    colors: {
      primaryColor: "#1E7FC2",
      primaryDarkColor: "#061F33",
      accentColor: "#2FA84F",
      bgColor: "#FFFFFF",
      textColor: "#152431",
      navBgColor: "#07365A",
      cardBgColor: "#FFFFFF",
      buttonColor: "#D81F26",
      buttonHoverColor: "#b3151b",
      headingColor: "#07365A",
      borderColor: "#E2E8F0"
    }
  },
  {
    id: "deep-teal-gold",
    name: "Deep Teal & Gold",
    desc: "Rich teal + warm gold accents",
    colors: {
      primaryColor: "#008080",
      primaryDarkColor: "#004d40",
      accentColor: "#D4AF37",
      bgColor: "#F9F9F6",
      textColor: "#1A2D2D",
      navBgColor: "#004d40",
      cardBgColor: "#FFFFFF",
      buttonColor: "#D4AF37",
      buttonHoverColor: "#B3922E",
      headingColor: "#004d40",
      borderColor: "#E5ECEC"
    }
  },
  {
    id: "midnight-white",
    name: "Midnight Blue & White",
    desc: "Dark navy + crisp white + red CTA",
    colors: {
      primaryColor: "#1A365D",
      primaryDarkColor: "#0F172A",
      accentColor: "#E2E8F0",
      bgColor: "#FFFFFF",
      textColor: "#1E293B",
      navBgColor: "#1E293B",
      cardBgColor: "#F8FAFC",
      buttonColor: "#DC2626",
      buttonHoverColor: "#B91C1C",
      headingColor: "#1E293B",
      borderColor: "#E2E8F0"
    }
  },
  {
    id: "forest-cream",
    name: "Forest Green & Cream",
    desc: "Deep green + warm cream + gold",
    colors: {
      primaryColor: "#1E4620",
      primaryDarkColor: "#0F2A11",
      accentColor: "#D4AF37",
      bgColor: "#FAF8F5",
      textColor: "#1C2A1E",
      navBgColor: "#0F2A11",
      cardBgColor: "#FFFFFF",
      buttonColor: "#D4AF37",
      buttonHoverColor: "#B3922E",
      headingColor: "#0F2A11",
      borderColor: "#E8EFE9"
    }
  },
  {
    id: "charcoal-coral",
    name: "Charcoal & Coral",
    desc: "Dark gray + coral/salmon accent",
    colors: {
      primaryColor: "#2D3748",
      primaryDarkColor: "#1A202C",
      accentColor: "#FF7F50",
      bgColor: "#F7FAFC",
      textColor: "#2D3748",
      navBgColor: "#1A202C",
      cardBgColor: "#FFFFFF",
      buttonColor: "#FF7F50",
      buttonHoverColor: "#E06D43",
      headingColor: "#1A202C",
      borderColor: "#E2E8F0"
    }
  },
  {
    id: "royal-silver",
    name: "Royal Blue & Silver",
    desc: "Bold royal blue + silver gray",
    colors: {
      primaryColor: "#4169E1",
      primaryDarkColor: "#1D2A44",
      accentColor: "#C0C0C0",
      bgColor: "#F4F6F9",
      textColor: "#1E2530",
      navBgColor: "#1D2A44",
      cardBgColor: "#FFFFFF",
      buttonColor: "#4169E1",
      buttonHoverColor: "#3658C9",
      headingColor: "#1D2A44",
      borderColor: "#E2E5EB"
    }
  },
  {
    id: "burgundy-ivory",
    name: "Burgundy & Ivory",
    desc: "Deep wine red + ivory white",
    colors: {
      primaryColor: "#800020",
      primaryDarkColor: "#4A0012",
      accentColor: "#E3A857",
      bgColor: "#FFFFF0",
      textColor: "#2C1E21",
      navBgColor: "#4A0012",
      cardBgColor: "#FFFFFF",
      buttonColor: "#800020",
      buttonHoverColor: "#66001A",
      headingColor: "#4A0012",
      borderColor: "#EAE6DB"
    }
  },
  {
    id: "slate-amber",
    name: "Slate & Amber",
    desc: "Blue-gray + warm amber",
    colors: {
      primaryColor: "#4A5568",
      primaryDarkColor: "#2D3748",
      accentColor: "#D97706",
      bgColor: "#F8FAFC",
      textColor: "#334155",
      navBgColor: "#2D3748",
      cardBgColor: "#FFFFFF",
      buttonColor: "#D97706",
      buttonHoverColor: "#B45309",
      headingColor: "#2D3748",
      borderColor: "#E2E8F0"
    }
  },
  {
    id: "purple-lavender",
    name: "Deep Purple & Lavender",
    desc: "Rich purple + soft lavender",
    colors: {
      primaryColor: "#4C1D95",
      primaryDarkColor: "#2E1065",
      accentColor: "#DDD6FE",
      bgColor: "#FAF5FF",
      textColor: "#3B0764",
      navBgColor: "#2E1065",
      cardBgColor: "#FFFFFF",
      buttonColor: "#6D28D9",
      buttonHoverColor: "#5B21B6",
      headingColor: "#2E1065",
      borderColor: "#F3E8FF"
    }
  },
  {
    id: "ocean-seafoam",
    name: "Ocean Blue & Seafoam",
    desc: "Mid-blue + fresh green-blue",
    colors: {
      primaryColor: "#0284C7",
      primaryDarkColor: "#0369A1",
      accentColor: "#0D9488",
      bgColor: "#F0FDF4",
      textColor: "#0F172A",
      navBgColor: "#0369A1",
      cardBgColor: "#FFFFFF",
      buttonColor: "#0D9488",
      buttonHoverColor: "#0F766E",
      headingColor: "#0369A1",
      borderColor: "#DCFCE7"
    }
  },
  {
    id: "carbon-red",
    name: "Carbon & Red",
    desc: "Near-black + bright red (bold, modern)",
    colors: {
      primaryColor: "#1E1E1E",
      primaryDarkColor: "#000000",
      accentColor: "#EF4444",
      bgColor: "#F9F9F9",
      textColor: "#111111",
      navBgColor: "#111111",
      cardBgColor: "#FFFFFF",
      buttonColor: "#EF4444",
      buttonHoverColor: "#DC2626",
      headingColor: "#000000",
      borderColor: "#EAEAEA"
    }
  },
  {
    id: "olive-sand",
    name: "Olive & Sand",
    desc: "Muted olive green + warm sand",
    colors: {
      primaryColor: "#556B2F",
      primaryDarkColor: "#3A4B20",
      accentColor: "#C2B280",
      bgColor: "#FAF7F0",
      textColor: "#2C351F",
      navBgColor: "#3A4B20",
      cardBgColor: "#FFFFFF",
      buttonColor: "#C2B280",
      buttonHoverColor: "#AFA170",
      headingColor: "#3A4B20",
      borderColor: "#EAE6DB"
    }
  },
  {
    id: "maroon-gold",
    name: "Dark Maroon & Gold",
    desc: "Maroon + gold (premium feel)",
    colors: {
      primaryColor: "#5C061F",
      primaryDarkColor: "#3A0311",
      accentColor: "#D4AF37",
      bgColor: "#FAF6F7",
      textColor: "#28010A",
      navBgColor: "#3A0311",
      cardBgColor: "#FFFFFF",
      buttonColor: "#D4AF37",
      buttonHoverColor: "#B3922E",
      headingColor: "#3A0311",
      borderColor: "#EDE4E6"
    }
  },
  {
    id: "steel-orange",
    name: "Steel Blue & Orange",
    desc: "Steel blue + vibrant orange CTA",
    colors: {
      primaryColor: "#4682B4",
      primaryDarkColor: "#2B547E",
      accentColor: "#FF7F00",
      bgColor: "#F5F8FA",
      textColor: "#1C2E3D",
      navBgColor: "#2B547E",
      cardBgColor: "#FFFFFF",
      buttonColor: "#FF7F00",
      buttonHoverColor: "#E07000",
      headingColor: "#2B547E",
      borderColor: "#E6ECEF"
    }
  },
  {
    id: "espresso-cream",
    name: "Espresso & Cream",
    desc: "Dark brown + warm cream (warm, clinic feel)",
    colors: {
      primaryColor: "#3E2723",
      primaryDarkColor: "#27120F",
      accentColor: "#D7CCC8",
      bgColor: "#EFEBE9",
      textColor: "#3E2723",
      navBgColor: "#27120F",
      cardBgColor: "#FFFFFF",
      buttonColor: "#3E2723",
      buttonHoverColor: "#2D1A17",
      headingColor: "#27120F",
      borderColor: "#D7CCC8"
    }
  },
  {
    id: "cobalt-white",
    name: "Cobalt & White",
    desc: "Bright cobalt blue + pure white",
    colors: {
      primaryColor: "#0047AB",
      primaryDarkColor: "#002F75",
      accentColor: "#0047AB",
      bgColor: "#FFFFFF",
      textColor: "#0A1128",
      navBgColor: "#002F75",
      cardBgColor: "#F0F4FA",
      buttonColor: "#0047AB",
      buttonHoverColor: "#003785",
      headingColor: "#002F75",
      borderColor: "#D0DCF0"
    }
  },
  {
    id: "emerald-white",
    name: "Emerald & White",
    desc: "Rich emerald green + white",
    colors: {
      primaryColor: "#047857",
      primaryDarkColor: "#064E3B",
      accentColor: "#047857",
      bgColor: "#FFFFFF",
      textColor: "#064E3B",
      navBgColor: "#064E3B",
      cardBgColor: "#ECFDF5",
      buttonColor: "#047857",
      buttonHoverColor: "#065F46",
      headingColor: "#064E3B",
      borderColor: "#A7F3D0"
    }
  },
  {
    id: "graphite-lime",
    name: "Graphite & Lime",
    desc: "Dark graphite + fresh lime green CTA",
    colors: {
      primaryColor: "#374151",
      primaryDarkColor: "#111827",
      accentColor: "#84CC16",
      bgColor: "#F9FAFB",
      textColor: "#111827",
      navBgColor: "#111827",
      cardBgColor: "#FFFFFF",
      buttonColor: "#84CC16",
      buttonHoverColor: "#65A30D",
      headingColor: "#111827",
      borderColor: "#E5E7EB"
    }
  },
  {
    id: "rose-dark",
    name: "Rose & Dark",
    desc: "Dusty rose + very dark charcoal",
    colors: {
      primaryColor: "#C084FC",
      primaryDarkColor: "#1E1B4B",
      accentColor: "#FDA4AF",
      bgColor: "#FAF7F5",
      textColor: "#1E1B4B",
      navBgColor: "#1E1B4B",
      cardBgColor: "#FFFFFF",
      buttonColor: "#FDA4AF",
      buttonHoverColor: "#FB7185",
      headingColor: "#1E1B4B",
      borderColor: "#F3E8FF"
    }
  },
  {
    id: "sapphire-ice",
    name: "Sapphire & Ice",
    desc: "Deep sapphire + icy light blue",
    colors: {
      primaryColor: "#0F52BA",
      primaryDarkColor: "#082E6B",
      accentColor: "#A5F3FC",
      bgColor: "#ECFEFF",
      textColor: "#083344",
      navBgColor: "#082E6B",
      cardBgColor: "#FFFFFF",
      buttonColor: "#0F52BA",
      buttonHoverColor: "#0A3F91",
      headingColor: "#082E6B",
      borderColor: "#CFFAFE"
    }
  },
  {
    id: "crimson-gray",
    name: "Crimson & Gray",
    desc: "Deep crimson + medium gray",
    colors: {
      primaryColor: "#DC143C",
      primaryDarkColor: "#8B0000",
      accentColor: "#6B7280",
      bgColor: "#F3F4F6",
      textColor: "#1F2937",
      navBgColor: "#8B0000",
      cardBgColor: "#FFFFFF",
      buttonColor: "#DC143C",
      buttonHoverColor: "#B21031",
      headingColor: "#8B0000",
      borderColor: "#E5E7EB"
    }
  },
  {
    id: "indigo-peach",
    name: "Indigo & Peach",
    desc: "Indigo + soft peach accent",
    colors: {
      primaryColor: "#4F46E5",
      primaryDarkColor: "#312E81",
      accentColor: "#FFD3B6",
      bgColor: "#FFF9F5",
      textColor: "#1E1B4B",
      navBgColor: "#312E81",
      cardBgColor: "#FFFFFF",
      buttonColor: "#FF8B94",
      buttonHoverColor: "#FF7580",
      headingColor: "#312E81",
      borderColor: "#FFE5D9"
    }
  },
  {
    id: "hunter-rust",
    name: "Hunter Green & Rust",
    desc: "Hunter green + rust/terra cotta",
    colors: {
      primaryColor: "#355E3B",
      primaryDarkColor: "#1B3B2B",
      accentColor: "#B7410E",
      bgColor: "#F7F8F6",
      textColor: "#1B2A22",
      navBgColor: "#1B3B2B",
      cardBgColor: "#FFFFFF",
      buttonColor: "#B7410E",
      buttonHoverColor: "#96350B",
      headingColor: "#1B3B2B",
      borderColor: "#E3E8E4"
    }
  }
];

export function ThemeManager() {
  const { settings, loadCollections } = useApp();
  
  const [activeTab, setActiveTab] = useState("presets"); // 'presets' | 'custom'
  const [customColors, setCustomColors] = useState({
    primaryColor: "#1E7FC2",
    primaryDarkColor: "#061F33",
    accentColor: "#2FA84F",
    bgColor: "#FFFFFF",
    textColor: "#152431",
    navBgColor: "#07365A",
    cardBgColor: "#FFFFFF",
    buttonColor: "#D81F26",
    buttonHoverColor: "#b3151b",
    headingColor: "#07365A",
    borderColor: "#E2E8F0"
  });
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Get active theme variables on mount
  useEffect(() => {
    if (settings?.themeConfig) {
      setCustomColors({ ...customColors, ...settings.themeConfig });
    }
    fetchHistory();
  }, [settings]);

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "themeHistory"), orderBy("createdAt", "desc"), limit(15));
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setHistory(list);
    } catch (err) {
      console.error("Failed to load theme history:", err);
    }
  };

  const handleApplyTheme = async (themeName, colors, isPreset = true) => {
    setLoading(true);
    setStatus({ type: "info", text: "Applying theme globally..." });
    
    try {
      // 1. Update general settings
      const settingsRef = doc(db, "siteSettings", "general");
      await setDoc(settingsRef, {
        activeThemeName: themeName,
        isCustomTheme: !isPreset,
        themeConfig: colors
      }, { merge: true });

      // 2. Add to history
      await addDoc(collection(db, "themeHistory"), {
        themeName,
        colors,
        createdAt: serverTimestamp()
      });

      // 3. Reload collections/settings in app context
      if (loadCollections) {
        await loadCollections();
      }

      setStatus({ type: "success", text: `Theme "${themeName}" applied successfully!` });
      fetchHistory();
    } catch (err) {
      console.error("Failed to apply theme:", err);
      setStatus({ type: "error", text: "Failed to save theme variables in database." });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustom = async () => {
    const customName = `Custom Theme (${new Date().toLocaleDateString()})`;
    await handleApplyTheme(customName, customColors, false);
  };

  const handleColorChange = (key, val) => {
    setCustomColors((prev) => ({
      ...prev,
      [key]: val
    }));
  };

  const activeThemeName = settings?.activeThemeName || "Amulya Classic";

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-serif font-extrabold text-[#0B3C5D] dark:text-white">Theme & Appearance</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Configure site-wide presets, custom hex pickers, and manage appearance logs.
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

      {/* Tabs */}
      <div className="flex space-x-2 border-b pb-1 font-bold text-xs uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("presets")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            activeTab === "presets" 
              ? "bg-[#0B3C5D] text-white border-transparent"
              : "border-slate-105 hover:bg-slate-100 text-slate-500"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Template Presets</span>
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            activeTab === "custom" 
              ? "bg-[#0B3C5D] text-white border-transparent"
              : "border-slate-105 hover:bg-slate-100 text-slate-500"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Custom Override</span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "presets" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRESET_THEMES.map((theme) => {
            const isActive = activeThemeName === theme.name;
            return (
              <div
                key={theme.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between transition ${
                  isActive ? "border-brand-blue ring-2 ring-brand-blue/10" : "border-slate-100 dark:border-slate-800"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white leading-tight">
                      {theme.name}
                    </h3>
                    {isActive && (
                      <span className="bg-[#3FA535]/15 text-[#358E2C] text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                        <Check className="w-3 h-3" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">{theme.desc}</p>
                </div>

                {/* Swatches (5 dots) */}
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.primaryColor }} title="Primary" />
                  <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.accentColor }} title="Accent" />
                  <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.bgColor }} title="Bg" />
                  <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.textColor }} title="Text" />
                  <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.cardBgColor }} title="Card Bg" />
                </div>

                <button
                  disabled={loading}
                  onClick={() => handleApplyTheme(theme.name, theme.colors)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default" 
                      : "bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white shadow-sm"
                  }`}
                >
                  {isActive ? "Currently Active" : "Apply Template"}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Pickers Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl space-y-6">
            <h3 className="font-serif font-extrabold text-base text-[#0B3C5D] dark:text-white border-b pb-2">
              Color Selectors
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "primaryColor", label: "Primary Theme" },
                { key: "primaryDarkColor", label: "Primary Dark" },
                { key: "accentColor", label: "Accent Highlights" },
                { key: "bgColor", label: "Page Background" },
                { key: "textColor", label: "Primary Text" },
                { key: "navBgColor", label: "Navbar Background" },
                { key: "cardBgColor", label: "Card Background" },
                { key: "buttonColor", label: "Button Color" },
                { key: "buttonHoverColor", label: "Button Hover" },
                { key: "headingColor", label: "Heading Colors" },
                { key: "borderColor", label: "Borders & Separators" }
              ].map((item) => (
                <div key={item.key} className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-slate-500 block">{item.label}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customColors[item.key] || "#FFFFFF"}
                      onChange={(e) => handleColorChange(item.key, e.target.value)}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer p-0 overflow-hidden"
                    />
                    <input
                      type="text"
                      value={customColors[item.key] || ""}
                      onChange={(e) => handleColorChange(item.key, e.target.value)}
                      className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1E7FC2] uppercase text-slate-850 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveCustom}
              disabled={loading}
              className="w-full bg-[#3FA535] hover:bg-[#358E2C] text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
            >
              <Save className="w-4.5 h-4.5" />
              <span>Save & Apply Custom Theme</span>
            </button>
          </div>

          {/* Live Preview Mockup */}
          <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl border space-y-4 select-none">
            <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white border-b pb-2">
              Mock Live Preview (Updates Real-time)
            </h3>
            
            {/* Miniature Page Box */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md text-left flex flex-col" style={{ backgroundColor: customColors.bgColor }}>
              
              {/* Mock Header */}
              <div className="p-3 flex items-center justify-between" style={{ backgroundColor: customColors.navBgColor }}>
                <span className="text-[10px] font-black tracking-wider text-white">AMULYA CLINIC</span>
                <div className="flex space-x-2">
                  <span className="w-8 h-1.5 rounded-full bg-white/30" />
                  <span className="w-8 h-1.5 rounded-full bg-white/30" />
                </div>
              </div>

              {/* Mock Hero Section */}
              <div className="p-4 grid grid-cols-2 gap-4 items-center border-b" style={{ borderColor: customColors.borderColor }}>
                <div className="space-y-2">
                  <h4 className="text-xs font-black font-serif" style={{ color: customColors.headingColor }}>
                    Expert Orthopaedic Surgery
                  </h4>
                  <p className="text-[9px] leading-tight" style={{ color: customColors.textColor }}>
                    Trust-built recovery pathways under Gold-medal surgeons.
                  </p>
                  <div className="flex space-x-1.5 pt-1">
                    <span className="w-14 h-4 rounded text-[7px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: customColors.buttonColor }}>
                      Book OPD
                    </span>
                    <span className="w-14 h-4 rounded border text-[7px] font-bold flex items-center justify-center bg-transparent" style={{ color: customColors.primaryColor, borderColor: customColors.primaryColor }}>
                      Call Desk
                    </span>
                  </div>
                </div>
                
                {/* Mock Card */}
                <div className="p-3 rounded-lg border flex flex-col justify-between space-y-1.5" style={{ backgroundColor: customColors.cardBgColor, borderColor: customColors.borderColor }}>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: customColors.accentColor }} />
                    <span className="w-12 h-1.5 rounded bg-slate-200" />
                  </div>
                  <span className="w-full h-1 bg-slate-100 block" />
                  <span className="w-10 h-1 bg-slate-100 block" />
                </div>
              </div>

              {/* Mock Footer */}
              <div className="p-3 bg-slate-900 text-slate-500 text-[8px] flex justify-between">
                <span>© 2026 Amulya Hospital</span>
                <span className="text-white/60">WayzenTech</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent theme changes table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-extrabold text-base text-[#0B3C5D] dark:text-white border-b pb-2 text-left">
          Theme Application History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Template Name</th>
                <th className="py-3 px-4">Color Swatches</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 font-semibold">
                    No theme changes found in database history logs.
                  </td>
                </tr>
              ) : (
                history.map((record) => {
                  const formattedDate = record.createdAt?.toDate 
                    ? record.createdAt.toDate().toLocaleString() 
                    : "Recently";
                  const recordColors = record.colors || {};
                  
                  return (
                    <tr key={record.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="py-3 px-4 font-semibold text-slate-500">{formattedDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{record.themeName}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: recordColors.primaryColor }} title="Primary" />
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: recordColors.accentColor }} title="Accent" />
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: recordColors.bgColor }} title="Bg" />
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: recordColors.textColor }} title="Text" />
                          <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: recordColors.cardBgColor }} title="Card Bg" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          disabled={loading}
                          onClick={() => handleApplyTheme(record.themeName, recordColors)}
                          className="inline-flex items-center space-x-1 border border-[#1E7FC2] text-[#1E7FC2] hover:bg-[#1E7FC2]/5 font-bold px-3 py-1.5 rounded-xl transition"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          <span>Restore Theme</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ThemeManager;
