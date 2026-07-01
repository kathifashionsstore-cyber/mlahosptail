import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, addDoc, getDocs, collection, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { Palette, Layers, RefreshCw, Undo, Save, Info, Sparkles, Check, Type, Download, Upload, Sliders } from "lucide-react";

// 38 Premium Cohesive Themes
const PRESET_THEMES = [
  { id: "amulya-classic", name: "Amulya Classic", desc: "Navy blue + Red (classic defaults)", colors: { primaryColor: "#1E7FC2", primaryDarkColor: "#061F33", accentColor: "#2FA84F", bgColor: "#FFFFFF", textColor: "#152431", navBgColor: "#07365A", cardBgColor: "#FFFFFF", buttonColor: "#D81F26", buttonHoverColor: "#b3151b", headingColor: "#07365A", borderColor: "#E2E8F0", textMutedColor: "#64748B" } },
  { id: "deep-teal-gold", name: "Deep Teal & Gold", desc: "Rich teal + warm gold highlights", colors: { primaryColor: "#008080", primaryDarkColor: "#004d40", accentColor: "#D4AF37", bgColor: "#F9F9F6", textColor: "#1A2D2D", navBgColor: "#004d40", cardBgColor: "#FFFFFF", buttonColor: "#D4AF37", buttonHoverColor: "#B3922E", headingColor: "#004d40", borderColor: "#E5ECEC", textMutedColor: "#5C6E6E" } },
  { id: "midnight-white", name: "Midnight Blue & White", desc: "Dark navy + white + crimson", colors: { primaryColor: "#1A365D", primaryDarkColor: "#0F172A", accentColor: "#E2E8F0", bgColor: "#FFFFFF", textColor: "#1E293B", navBgColor: "#1E293B", cardBgColor: "#F8FAFC", buttonColor: "#DC2626", buttonHoverColor: "#B91C1C", headingColor: "#1E293B", borderColor: "#E2E8F0", textMutedColor: "#64748B" } },
  { id: "forest-cream", name: "Forest Green & Cream", desc: "Deep forest + warm cream", colors: { primaryColor: "#1E4620", primaryDarkColor: "#0F2A11", accentColor: "#D4AF37", bgColor: "#FAF8F5", textColor: "#1C2A1E", navBgColor: "#0F2A11", cardBgColor: "#FFFFFF", buttonColor: "#D4AF37", buttonHoverColor: "#B3922E", headingColor: "#0F2A11", borderColor: "#E8EFE9", textMutedColor: "#5C6E60" } },
  { id: "charcoal-coral", name: "Charcoal & Coral", desc: "Dark charcoal + warm coral orange", colors: { primaryColor: "#2D3748", primaryDarkColor: "#1A202C", accentColor: "#FF7F50", bgColor: "#F7FAFC", textColor: "#2D3748", navBgColor: "#1A202C", cardBgColor: "#FFFFFF", buttonColor: "#FF7F50", buttonHoverColor: "#E06D43", headingColor: "#1A202C", borderColor: "#E2E8F0", textMutedColor: "#718096" } },
  { id: "royal-silver", name: "Royal Blue & Silver", desc: "Bold royal + silver highlights", colors: { primaryColor: "#4169E1", primaryDarkColor: "#1D2A44", accentColor: "#C0C0C0", bgColor: "#F4F6F9", textColor: "#1E2530", navBgColor: "#1D2A44", cardBgColor: "#FFFFFF", buttonColor: "#4169E1", buttonHoverColor: "#3658C9", headingColor: "#1D2A44", borderColor: "#E2E5EB", textMutedColor: "#6B7280" } },
  { id: "burgundy-ivory", name: "Burgundy & Ivory", desc: "Elegant wine + soft ivory background", colors: { primaryColor: "#800020", primaryDarkColor: "#4A0012", accentColor: "#E3A857", bgColor: "#FFFFF0", textColor: "#2C1E21", navBgColor: "#4A0012", cardBgColor: "#FFFFFF", buttonColor: "#800020", buttonHoverColor: "#66001A", headingColor: "#4A0012", borderColor: "#EAE6DB", textMutedColor: "#7A6868" } },
  { id: "slate-amber", name: "Slate & Amber", desc: "Slate blue-gray + golden amber", colors: { primaryColor: "#4A5568", primaryDarkColor: "#2D3748", accentColor: "#D97706", bgColor: "#F8FAFC", textColor: "#334155", navBgColor: "#2D3748", cardBgColor: "#FFFFFF", buttonColor: "#D97706", buttonHoverColor: "#B45309", headingColor: "#2D3748", borderColor: "#E2E8F0", textMutedColor: "#64748B" } },
  { id: "purple-lavender", name: "Deep Purple & Lavender", desc: "Luxurious violet + soft lavender", colors: { primaryColor: "#4C1D95", primaryDarkColor: "#2E1065", accentColor: "#DDD6FE", bgColor: "#FAF5FF", textColor: "#3B0764", navBgColor: "#2E1065", cardBgColor: "#FFFFFF", buttonColor: "#6D28D9", buttonHoverColor: "#5B21B6", headingColor: "#2E1065", borderColor: "#F3E8FF", textMutedColor: "#7C3AED" } },
  { id: "ocean-seafoam", name: "Ocean Blue & Seafoam", desc: "Marine blue + cool seafoam green", colors: { primaryColor: "#0284C7", primaryDarkColor: "#0369A1", accentColor: "#0D9488", bgColor: "#F0FDF4", textColor: "#0F172A", navBgColor: "#0369A1", cardBgColor: "#FFFFFF", buttonColor: "#0D9488", buttonHoverColor: "#0F766E", headingColor: "#0369A1", borderColor: "#DCFCE7", textMutedColor: "#475569" } },
  { id: "carbon-red", name: "Carbon & Red", desc: "Tech black + hot red accent", colors: { primaryColor: "#1E1E1E", primaryDarkColor: "#000000", accentColor: "#EF4444", bgColor: "#F9F9F9", textColor: "#111111", navBgColor: "#111111", cardBgColor: "#FFFFFF", buttonColor: "#EF4444", buttonHoverColor: "#DC2626", headingColor: "#000000", borderColor: "#EAEAEA", textMutedColor: "#666666" } },
  { id: "olive-sand", name: "Olive & Sand", desc: "Earth tone olive + sand beige", colors: { primaryColor: "#556B2F", primaryDarkColor: "#3A4B20", accentColor: "#C2B280", bgColor: "#FAF7F0", textColor: "#2C351F", navBgColor: "#3A4B20", cardBgColor: "#FFFFFF", buttonColor: "#C2B280", buttonHoverColor: "#AFA170", headingColor: "#3A4B20", borderColor: "#EAE6DB", textMutedColor: "#606F4D" } },
  { id: "maroon-gold", name: "Dark Maroon & Gold", desc: "Deep maroon + royal gold accents", colors: { primaryColor: "#5C061F", primaryDarkColor: "#3A0311", accentColor: "#D4AF37", bgColor: "#FAF6F7", textColor: "#28010A", navBgColor: "#3A0311", cardBgColor: "#FFFFFF", buttonColor: "#D4AF37", buttonHoverColor: "#B3922E", headingColor: "#3A0311", borderColor: "#EDE4E6", textMutedColor: "#6E5258" } },
  { id: "steel-orange", name: "Steel Blue & Orange", desc: "Industrial steel + safety orange", colors: { primaryColor: "#4682B4", primaryDarkColor: "#2B547E", accentColor: "#FF7F00", bgColor: "#F5F8FA", textColor: "#1C2E3D", navBgColor: "#2B547E", cardBgColor: "#FFFFFF", buttonColor: "#FF7F00", buttonHoverColor: "#E07000", headingColor: "#2B547E", borderColor: "#E6ECEF", textMutedColor: "#5A6E7F" } },
  { id: "espresso-cream", name: "Espresso & Cream", desc: "Warm coffee + soft tan background", colors: { primaryColor: "#3E2723", primaryDarkColor: "#27120F", accentColor: "#D7CCC8", bgColor: "#EFEBE9", textColor: "#3E2723", navBgColor: "#27120F", cardBgColor: "#FFFFFF", buttonColor: "#3E2723", buttonHoverColor: "#2D1A17", headingColor: "#27120F", borderColor: "#D7CCC8", textMutedColor: "#795548" } },
  { id: "cobalt-white", name: "Cobalt & White", desc: "Vibrant cobalt + pure paper white", colors: { primaryColor: "#0047AB", primaryDarkColor: "#002F75", accentColor: "#0047AB", bgColor: "#FFFFFF", textColor: "#0A1128", navBgColor: "#002F75", cardBgColor: "#F0F4FA", buttonColor: "#0047AB", buttonHoverColor: "#003785", headingColor: "#002F75", borderColor: "#D0DCF0", textMutedColor: "#4B5563" } },
  { id: "emerald-white", name: "Emerald & White", desc: "Clean medical emerald + white", colors: { primaryColor: "#047857", primaryDarkColor: "#064E3B", accentColor: "#047857", bgColor: "#FFFFFF", textColor: "#064E3B", navBgColor: "#064E3B", cardBgColor: "#ECFDF5", buttonColor: "#047857", buttonHoverColor: "#065F46", headingColor: "#064E3B", borderColor: "#A7F3D0", textMutedColor: "#374151" } },
  { id: "graphite-lime", name: "Graphite & Lime", desc: "Graphite black + glowing lime highlights", colors: { primaryColor: "#374151", primaryDarkColor: "#111827", accentColor: "#84CC16", bgColor: "#F9FAFB", textColor: "#111827", navBgColor: "#111827", cardBgColor: "#FFFFFF", buttonColor: "#84CC16", buttonHoverColor: "#65A30D", headingColor: "#111827", borderColor: "#E5E7EB", textMutedColor: "#4B5563" } },
  { id: "rose-dark", name: "Rose & Dark", desc: "Dusty orchid rose + indigo night", colors: { primaryColor: "#C084FC", primaryDarkColor: "#1E1B4B", accentColor: "#FDA4AF", bgColor: "#FAF7F5", textColor: "#1E1B4B", navBgColor: "#1E1B4B", cardBgColor: "#FFFFFF", buttonColor: "#FDA4AF", buttonHoverColor: "#FB7185", headingColor: "#1E1B4B", borderColor: "#F3E8FF", textMutedColor: "#4F46E5" } },
  { id: "sapphire-ice", name: "Sapphire & Ice", desc: "True sapphire + ice cold teal", colors: { primaryColor: "#0F52BA", primaryDarkColor: "#082E6B", accentColor: "#A5F3FC", bgColor: "#ECFEFF", textColor: "#083344", navBgColor: "#082E6B", cardBgColor: "#FFFFFF", buttonColor: "#0F52BA", buttonHoverColor: "#0A3F91", headingColor: "#082E6B", borderColor: "#CFFAFE", textMutedColor: "#155E75" } },
  { id: "crimson-gray", name: "Crimson & Gray", desc: "Blood crimson + clean concrete gray", colors: { primaryColor: "#DC143C", primaryDarkColor: "#8B0000", accentColor: "#6B7280", bgColor: "#F3F4F6", textColor: "#1F2937", navBgColor: "#8B0000", cardBgColor: "#FFFFFF", buttonColor: "#DC143C", buttonHoverColor: "#B21031", headingColor: "#8B0000", borderColor: "#E5E7EB", textMutedColor: "#4B5563" } },
  { id: "indigo-peach", name: "Indigo & Peach", desc: "Deep indigo + warm pastel peach", colors: { primaryColor: "#4F46E5", primaryDarkColor: "#312E81", accentColor: "#FFD3B6", bgColor: "#FFF9F5", textColor: "#1E1B4B", navBgColor: "#312E81", cardBgColor: "#FFFFFF", buttonColor: "#FF8B94", buttonHoverColor: "#FF7580", headingColor: "#312E81", borderColor: "#FFE5D9", textMutedColor: "#4338CA" } },
  { id: "hunter-rust", name: "Hunter Green & Rust", desc: "Old hunter green + clay orange", colors: { primaryColor: "#355E3B", primaryDarkColor: "#1B3B2B", accentColor: "#B7410E", bgColor: "#F7F8F6", textColor: "#1B2A22", navBgColor: "#1B3B2B", cardBgColor: "#FFFFFF", buttonColor: "#B7410E", buttonHoverColor: "#96350B", headingColor: "#1B3B2B", borderColor: "#E3E8E4", textMutedColor: "#4B534D" } },
  
  // 15 New Presets (Totaling 38 Presets)
  { id: "sunset-onyx", name: "Sunset Gold & Onyx", desc: "Warm gold highlights + deep charcoal onyx", colors: { primaryColor: "#D4AF37", primaryDarkColor: "#121212", accentColor: "#F59E0B", bgColor: "#1A1A1A", textColor: "#E5E7EB", navBgColor: "#121212", cardBgColor: "#262626", buttonColor: "#D4AF37", buttonHoverColor: "#B3922E", headingColor: "#F3F4F6", borderColor: "#404040", textMutedColor: "#9CA3AF" } },
  { id: "muted-sage", name: "Muted Sage & Linen", desc: "Organic sage green + linen white background", colors: { primaryColor: "#8A9A86", primaryDarkColor: "#576354", accentColor: "#C2CBBF", bgColor: "#FAF9F6", textColor: "#2F3E2F", navBgColor: "#576354", cardBgColor: "#FFFFFF", buttonColor: "#8A9A86", buttonHoverColor: "#768672", headingColor: "#2F3E2F", borderColor: "#E5E3DC", textMutedColor: "#717E70" } },
  { id: "plum-cream", name: "Plum & Warm Cream", desc: "Muted plum red + vanilla cream background", colors: { primaryColor: "#5E2D5B", primaryDarkColor: "#3A1B38", accentColor: "#D9A0D7", bgColor: "#FDFBF7", textColor: "#2D142C", navBgColor: "#3A1B38", cardBgColor: "#FFFFFF", buttonColor: "#5E2D5B", buttonHoverColor: "#492247", headingColor: "#3A1B38", borderColor: "#EFEBE0", textMutedColor: "#786576" } },
  { id: "coral-reef", name: "Coral Reef & Ocean", desc: "Tropical coral orange + ocean floor navy", colors: { primaryColor: "#FF7F50", primaryDarkColor: "#0A192F", accentColor: "#64FFDA", bgColor: "#F0F8FF", textColor: "#0A192F", navBgColor: "#0A192F", cardBgColor: "#FFFFFF", buttonColor: "#FF7F50", buttonHoverColor: "#E06D43", headingColor: "#0A192F", borderColor: "#D0E1F9", textMutedColor: "#4A5A80" } },
  { id: "coffee-mint", name: "Coffee & Mint", desc: "Cappuccino brown + crisp mint highlights", colors: { primaryColor: "#4A3B32", primaryDarkColor: "#2B211B", accentColor: "#98FF98", bgColor: "#FDFCF7", textColor: "#2B211B", navBgColor: "#2B211B", cardBgColor: "#FFFFFF", buttonColor: "#4A3B32", buttonHoverColor: "#3C2F28", headingColor: "#2B211B", borderColor: "#ECE9DF", textMutedColor: "#75655B" } },
  { id: "electric-graphite", name: "Electric Blue & Graphite", desc: "Cyan/teal glow + dark graphite layout", colors: { primaryColor: "#00E5FF", primaryDarkColor: "#1E1E24", accentColor: "#00E5FF", bgColor: "#121214", textColor: "#E2E2E9", navBgColor: "#1E1E24", cardBgColor: "#282830", buttonColor: "#00D4EC", buttonHoverColor: "#00B8CD", headingColor: "#FFFFFF", borderColor: "#3A3A45", textMutedColor: "#9CA3AF" } },
  { id: "lavender-dusk", name: "Lavender Mist & Dusk", desc: "Pastel lavender + dusk slate backdrop", colors: { primaryColor: "#8B5CF6", primaryDarkColor: "#1E1B4B", accentColor: "#C084FC", bgColor: "#EEF2F6", textColor: "#1E1B4B", navBgColor: "#1E1B4B", cardBgColor: "#FFFFFF", buttonColor: "#8B5CF6", buttonHoverColor: "#7C3AED", headingColor: "#1E1B4B", borderColor: "#D8E2ED", textMutedColor: "#6366F1" } },
  { id: "nordic-spruce", name: "Nordic Spruce & Snow", desc: "Cold spruce green + snowy light gray background", colors: { primaryColor: "#2B4C3F", primaryDarkColor: "#183227", accentColor: "#E2E8F0", bgColor: "#F8FAF9", textColor: "#1F2937", navBgColor: "#183227", cardBgColor: "#FFFFFF", buttonColor: "#2B4C3F", buttonHoverColor: "#203A30", headingColor: "#183227", borderColor: "#E2EAE6", textMutedColor: "#6B7280" } },
  { id: "autumn-stone", name: "Autumn Leaf & Stone", desc: "Warm amber rust + stone clay gray", colors: { primaryColor: "#C2410C", primaryDarkColor: "#431407", accentColor: "#FDBA74", bgColor: "#FAF5F0", textColor: "#431407", navBgColor: "#431407", cardBgColor: "#FFFFFF", buttonColor: "#C2410C", buttonHoverColor: "#9A3412", headingColor: "#431407", borderColor: "#ECE4DB", textMutedColor: "#8C6E63" } },
  { id: "cyber-punk", name: "Cyber Neon", desc: "Glowing magenta + dark night sky", colors: { primaryColor: "#EC4899", primaryDarkColor: "#0F172A", accentColor: "#3B82F6", bgColor: "#090D1A", textColor: "#F1F5F9", navBgColor: "#090D1A", cardBgColor: "#1E293B", buttonColor: "#EC4899", buttonHoverColor: "#DB2777", headingColor: "#FFFFFF", borderColor: "#334155", textMutedColor: "#94A3B8" } },
  { id: "tuscan-sun", name: "Tuscan Sun & Terracotta", desc: "Warm mustard yellow + terracotta red", colors: { primaryColor: "#D97706", primaryDarkColor: "#7C2D12", accentColor: "#FBBF24", bgColor: "#FDFBF7", textColor: "#451A03", navBgColor: "#7C2D12", cardBgColor: "#FFFFFF", buttonColor: "#C2410C", buttonHoverColor: "#9A3412", headingColor: "#7C2D12", borderColor: "#F3EAE0", textMutedColor: "#92400E" } },
  { id: "orchid-slate", name: "Soft Orchid & Slate", desc: "Orchid pink + modern slate gray background", colors: { primaryColor: "#A855F7", primaryDarkColor: "#1E293B", accentColor: "#E9D5FF", bgColor: "#F8FAFC", textColor: "#0F172A", navBgColor: "#1E293B", cardBgColor: "#FFFFFF", buttonColor: "#A855F7", buttonHoverColor: "#9333EA", headingColor: "#1E293B", borderColor: "#E2E8F0", textMutedColor: "#64748B" } },
  { id: "copper-charcoal", name: "Warm Copper & Charcoal", desc: "Metallic copper + carbon gray backdrop", colors: { primaryColor: "#D97706", primaryDarkColor: "#1F2937", accentColor: "#FCD34D", bgColor: "#F9FAFB", textColor: "#111827", navBgColor: "#1F2937", cardBgColor: "#FFFFFF", buttonColor: "#B45309", buttonHoverColor: "#92400E", headingColor: "#1F2937", borderColor: "#E5E7EB", textMutedColor: "#6B7280" } },
  { id: "mint-chocolate", name: "Mint & Chocolate", desc: "Chocolate brown + refreshing mint accents", colors: { primaryColor: "#4E3629", primaryDarkColor: "#2F1E16", accentColor: "#A7F3D0", bgColor: "#F6F5F2", textColor: "#2F1E16", navBgColor: "#2F1E16", cardBgColor: "#FFFFFF", buttonColor: "#059669", buttonHoverColor: "#047857", headingColor: "#2F1E16", borderColor: "#E5E2D9", textMutedColor: "#78685E" } },
  { id: "classic-monochrome", name: "Classic Monochrome", desc: "High-end black + clean white outline", colors: { primaryColor: "#000000", primaryDarkColor: "#000000", accentColor: "#6B7280", bgColor: "#FFFFFF", textColor: "#000000", navBgColor: "#000000", cardBgColor: "#FFFFFF", buttonColor: "#000000", buttonHoverColor: "#1E1E1E", headingColor: "#000000", borderColor: "#E5E7EB", textMutedColor: "#4B5563" } }
];

export function ThemeManager() {
  const { settings, loadCollections } = useApp();
  
  // Custom states
  const [activeTab, setActiveTab] = useState("presets"); // 'presets' | 'custom' | 'typography' | 'io'
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
    borderColor: "#E2E8F0",
    textMutedColor: "#64748B",
    gradientEnabled: false
  });

  const [typography, setTypography] = useState({
    headingFont: "Poppins",
    bodyFont: "Inter",
    fontSize: 16,
    headingWeight: "700"
  });
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [jsonText, setJsonText] = useState("");

  // Get active theme variables on mount
  useEffect(() => {
    if (settings?.themeConfig) {
      setCustomColors((prev) => ({ 
        ...prev, 
        ...settings.themeConfig,
        gradientEnabled: settings.themeConfig.gradientEnabled || false
      }));
      setJsonText(JSON.stringify({ ...settings.themeConfig }, null, 2));
    }
    fetchHistory();
    fetchTypography();
  }, [settings]);

  const fetchTypography = async () => {
    try {
      const snap = await getDoc(doc(db, "siteSettings", "typography"));
      if (snap.exists()) {
        const data = snap.data();
        setTypography({
          headingFont: data.headingFont || "Poppins",
          bodyFont: data.bodyFont || "Inter",
          fontSize: data.fontSize || 16,
          headingWeight: data.headingWeight || "700"
        });
      }
    } catch (e) {
      console.warn("Failed to load typography in ThemeManager:", e);
    }
  };

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "themeHistory"), orderBy("createdAt", "desc"), limit(25));
      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setHistory(list);
    } catch (err) {
      console.error("Failed to load theme history:", err);
    }
  };

  const handleApplyTheme = async (themeName, colors, isPreset = true) => {
    setLoading(true);
    setStatus({ type: "info", text: "Publishing and applying theme..." });
    
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

      setCustomColors((prev) => ({ ...prev, ...colors }));
      setJsonText(JSON.stringify(colors, null, 2));
      setStatus({ type: "success", text: `Theme "${themeName}" published successfully!` });
      fetchHistory();
    } catch (err) {
      console.error("Failed to apply theme:", err);
      setStatus({ type: "error", text: "Failed to save theme in Firestore." });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustom = async () => {
    const customName = `Custom Theme (${new Date().toLocaleDateString()})`;
    await handleApplyTheme(customName, customColors, false);
  };

  const handleSaveTypography = async () => {
    setLoading(true);
    setStatus({ type: "info", text: "Updating typography styles..." });
    try {
      const typoRef = doc(db, "siteSettings", "typography");
      await setDoc(typoRef, typography);
      
      // Save history log entry
      await addDoc(collection(db, "themeHistory"), {
        themeName: `Typography Update (${typography.headingFont} / ${typography.bodyFont})`,
        colors: customColors,
        typographyConfig: typography,
        createdAt: serverTimestamp()
      });

      if (loadCollections) await loadCollections();
      setStatus({ type: "success", text: "Typography settings published successfully!" });
      fetchHistory();
    } catch (e) {
      console.error(e);
      setStatus({ type: "error", text: "Failed to save typography settings." });
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (key, val) => {
    setCustomColors((prev) => {
      const next = { ...prev, [key]: val };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const handleToggleGradient = () => {
    setCustomColors((prev) => {
      const next = { ...prev, gradientEnabled: !prev.gradientEnabled };
      setJsonText(JSON.stringify(next, null, 2));
      return next;
    });
  };

  const handleRestoreFromRecord = (record) => {
    if (record.colors) {
      setCustomColors({ ...customColors, ...record.colors });
      setStatus({ type: "success", text: `Loaded values from history into editors. Click 'Publish Theme' or 'Save' to apply globally.` });
    }
    if (record.typographyConfig) {
      setTypography({ ...typography, ...record.typographyConfig });
    }
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setCustomColors({ ...customColors, ...parsed });
      setStatus({ type: "success", text: "JSON configuration loaded into editor. Verify parameters and click Publish to save." });
    } catch (e) {
      setStatus({ type: "error", text: "Invalid JSON format. Check parameters." });
    }
  };

  const activeThemeName = settings?.activeThemeName || "Amulya Classic";

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 text-[#1F2937] dark:text-slate-100 text-left theme-manager-admin-scope">
      {/* HEADER SECTION (Static Admin Styling) */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-serif font-extrabold text-slate-900 dark:text-white">Theme & Appearance</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Configure site-wide presets, custom hex swatches, gradient effects, and typography.
          </p>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-xl flex items-start space-x-2 text-xs font-bold border ${
          status.type === "success" 
            ? "bg-emerald-50 border-emerald-250 text-emerald-700" 
            : status.type === "error"
            ? "bg-red-50 border-red-250 text-red-700"
            : "bg-blue-50 border-blue-200 text-blue-700"
        }`}>
          <Info className="w-4.5 h-4.5 mt-0.5 flex-shrink-0" />
          <span>{status.text}</span>
        </div>
      )}

      {/* TABS SELECTOR (Static Admin Design) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 font-bold text-xs uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("presets")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            activeTab === "presets" 
              ? "bg-[#0B3C5D] text-white border-transparent"
              : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Template Presets ({PRESET_THEMES.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            activeTab === "custom" 
              ? "bg-[#0B3C5D] text-white border-transparent"
              : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Custom Swatches</span>
        </button>
        <button
          onClick={() => setActiveTab("typography")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            activeTab === "typography" 
              ? "bg-[#0B3C5D] text-white border-transparent"
              : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500"
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Typography & Fonts</span>
        </button>
        <button
          onClick={() => setActiveTab("io")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition ${
            activeTab === "io" 
              ? "bg-[#0B3C5D] text-white border-transparent"
              : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export / Import</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. PRESETS TAB */}
      {activeTab === "presets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRESET_THEMES.map((theme) => {
            const isActive = activeThemeName === theme.name;
            return (
              <div
                key={theme.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between transition ${
                  isActive ? "border-[#1E7FC2] ring-2 ring-[#1E7FC2]/10" : "border-slate-200 dark:border-slate-850"
                }`}
              >
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white leading-tight">
                      {theme.name}
                    </h3>
                    {isActive && (
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        <span>ACTIVE</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-normal">{theme.desc}</p>
                </div>

                {/* Micro Swatches Row */}
                <div className="flex items-center space-x-1.5 pt-1">
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.primaryColor }} title="Primary" />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.accentColor }} title="Accent" />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.bgColor }} title="Background" />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.cardBgColor }} title="Card/Surface" />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.textColor }} title="Text" />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.headingColor }} title="Heading" />
                  <div className="w-4 h-4 rounded-full border border-black/5" style={{ backgroundColor: theme.colors.borderColor }} title="Border" />
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
      )}

      {/* 2. CUSTOM OVERRIDES TAB */}
      {activeTab === "custom" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Swatches Color Selectors */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
            <div className="border-b pb-2 text-left">
              <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white">
                Active Theme Variables (8 Core Swatches)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "primaryColor", label: "Primary Theme Color (--color-primary)" },
                { key: "accentColor", label: "Accent Highlight Color (--color-accent)" },
                { key: "bgColor", label: "Page Background (--color-bg)" },
                { key: "cardBgColor", label: "Surface / Card Background (--color-surface)" },
                { key: "textColor", label: "Body Text Color (--color-text)" },
                { key: "textMutedColor", label: "Text Muted Helper (--color-text-muted)" },
                { key: "headingColor", label: "Heading Color (--color-heading)" },
                { key: "borderColor", label: "Border & Divider Color (--color-border)" },
                
                { key: "primaryDarkColor", label: "Primary Dark Accent" },
                { key: "navBgColor", label: "Navbar Header Background" },
                { key: "buttonColor", label: "Primary CTA Button" },
                { key: "buttonHoverColor", label: "CTA Button Hover" }
              ].map((item) => (
                <div key={item.key} className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">{item.label}</label>
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
                      className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 p-2 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#1E7FC2] uppercase text-slate-850 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Gradient toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
              <div className="text-left">
                <h4 className="text-xs font-black text-[#0B3C5D] dark:text-white">Custom Header & Button Gradients</h4>
                <p className="text-[10px] font-semibold text-slate-450 mt-0.5">Blend Primary and Accent colors dynamically across overlays</p>
              </div>
              <button
                type="button"
                onClick={handleToggleGradient}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${customColors.gradientEnabled ? "bg-[#3FA535]" : "bg-slate-300 dark:bg-slate-700"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${customColors.gradientEnabled ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            <button
              onClick={handleSaveCustom}
              disabled={loading}
              className="w-full bg-[#3FA535] hover:bg-[#358E2C] text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
            >
              <Save className="w-4.5 h-4.5" />
              <span>Save & Publish Custom Theme Config</span>
            </button>
          </div>

          {/* Live Preview Mockup Column */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-5 text-left select-none">
            <div className="border-b pb-2">
              <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white">
                Live Miniature Preview
              </h3>
            </div>
            
            {/* Miniature Mockup */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col w-full" style={{ backgroundColor: customColors.bgColor }}>
              {/* Navbar header */}
              <div className="p-3.5 flex items-center justify-between" style={{ backgroundColor: customColors.navBgColor }}>
                <span className="text-[10px] font-black tracking-wider text-white">🏥 AMULYA CLINIC</span>
                <div className="flex space-x-2">
                  <span className="w-10 h-2 rounded bg-white/20" />
                  <span className="w-10 h-2 rounded bg-white/20" />
                </div>
              </div>

              {/* Hero Banner Area */}
              <div 
                className="p-5 border-b flex flex-col space-y-2" 
                style={{ 
                  borderColor: customColors.borderColor,
                  background: customColors.gradientEnabled 
                    ? `linear-gradient(135deg, ${customColors.primaryColor}22, ${customColors.accentColor}22)` 
                    : customColors.bgColor 
                }}
              >
                <span className="inline-flex text-[7px] font-black uppercase text-[#D81F26] tracking-wider">
                  Narasaraopet's #1 Orthopaedic Center
                </span>
                <h4 className="text-xs font-black font-serif leading-tight" style={{ color: customColors.headingColor }}>
                  Expert Care for Spine, Joint & Trauma
                </h4>
                <p className="text-[9px] leading-normal" style={{ color: customColors.textColor }}>
                  Consult our Gold-Medalist UK-Trained surgeons daily.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <button 
                    type="button" 
                    className="px-3 py-1 rounded text-[7px] font-extrabold text-white" 
                    style={{ backgroundColor: customColors.buttonColor }}
                  >
                    Book OPD
                  </button>
                  <button 
                    type="button" 
                    className="px-3 py-1 rounded border text-[7px] font-extrabold bg-transparent" 
                    style={{ color: customColors.primaryColor, borderColor: customColors.primaryColor }}
                  >
                    Call desk: +91 8647223625
                  </button>
                </div>
              </div>

              {/* Card preview */}
              <div className="p-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border flex flex-col space-y-1.5" style={{ backgroundColor: customColors.cardBgColor, borderColor: customColors.borderColor }}>
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: customColors.accentColor }} />
                    <span className="w-12 h-2 rounded bg-slate-200" />
                  </div>
                  <span className="w-full h-1 bg-slate-100 block rounded" />
                  <span className="w-4/5 h-1 bg-slate-100 block rounded" />
                </div>

                <div className="p-3 rounded-xl border flex flex-col space-y-1.5" style={{ backgroundColor: customColors.cardBgColor, borderColor: customColors.borderColor }}>
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: customColors.primaryColor }} />
                    <span className="w-10 h-2 rounded bg-slate-200" />
                  </div>
                  <span className="w-full h-1 bg-slate-100 block rounded" />
                  <span className="w-2/3 h-1 bg-slate-100 block rounded" />
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-950 text-slate-500 text-[8px] flex justify-between border-t border-slate-800">
                <span>© 2026 Amulya Hospital</span>
                <span className="text-white/40">Website by WayzenTech</span>
              </div>
            </div>

            {/* Gradient block visualizer */}
            {customColors.gradientEnabled && (
              <div className="p-3.5 rounded-xl border text-center space-y-1" style={{ borderColor: customColors.borderColor }}>
                <span className="text-[9px] font-black text-slate-450 uppercase block">Active Gradient Blend</span>
                <div 
                  className="h-10 w-full rounded-lg"
                  style={{ background: `linear-gradient(90deg, ${customColors.primaryColor}, ${customColors.accentColor})` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TYPOGRAPHY TAB */}
      {activeTab === "typography" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="border-b pb-2 text-left">
            <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white">
              Typography Controls (Google Fonts Injection)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Font Selectors */}
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Heading Font Family</label>
                <select
                  value={typography.headingFont}
                  onChange={(e) => setTypography({ ...typography, headingFont: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                >
                  {["Poppins", "Montserrat", "Playfair Display", "Inter", "Outfit", "Roboto", "Lato", "Merriweather"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Body Font Family</label>
                <select
                  value={typography.bodyFont}
                  onChange={(e) => setTypography({ ...typography, bodyFont: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                >
                  {["Inter", "Roboto", "Open Sans", "Lato", "Outfit", "Poppins", "Montserrat", "Nunito"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Base Font Size (px)</label>
                  <span className="text-xs font-bold text-[#1E7FC2]">{typography.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="18"
                  value={typography.fontSize}
                  onChange={(e) => setTypography({ ...typography, fontSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Heading Weight</label>
                <select
                  value={typography.headingWeight}
                  onChange={(e) => setTypography({ ...typography, headingWeight: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none"
                >
                  <option value="600">600 (Semi-Bold)</option>
                  <option value="700">700 (Bold)</option>
                  <option value="800">800 (Extra Bold)</option>
                </select>
              </div>
            </div>

            {/* Typography Live Preview Card */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Live Typography Sandbox</span>
              
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 space-y-3">
                <h4 
                  style={{ 
                    fontFamily: `'${typography.headingFont}', sans-serif`,
                    fontWeight: typography.headingWeight,
                    color: customColors.headingColor 
                  }}
                  className="text-lg leading-tight"
                >
                  Expert Spine, Joint & Orthopaedic Care
                </h4>
                <p 
                  style={{ 
                    fontFamily: `'${typography.bodyFont}', sans-serif`,
                    fontSize: `${typography.fontSize}px`,
                    color: customColors.textColor 
                  }}
                  className="leading-relaxed"
                >
                  Our senior clinical leaders have over 33 years of clinical surgery history, restoring patient mobility and correcting complex spinal deformations.
                </p>
              </div>
              
              <div className="flex gap-2">
                <span className="bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-450 px-2.5 py-1 rounded text-[9px] font-mono">
                  heading: {typography.headingFont} ({typography.headingWeight})
                </span>
                <span className="bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-450 px-2.5 py-1 rounded text-[9px] font-mono">
                  body: {typography.bodyFont} ({typography.fontSize}px)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveTypography}
            disabled={loading}
            className="w-full bg-[#3FA535] hover:bg-[#358E2C] text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
          >
            <Save className="w-4.5 h-4.5" />
            <span>Publish Typography Settings</span>
          </button>
        </div>
      )}

      {/* 4. IMPORT / EXPORT TAB */}
      {activeTab === "io" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
          <div className="border-b pb-2 text-left">
            <h3 className="font-serif font-extrabold text-sm text-[#0B3C5D] dark:text-white">
              JSON Configuration Backup
            </h3>
          </div>

          <div className="space-y-4 text-left">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Raw Theme JSON Content</label>
            <textarea
              rows="12"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#1E7FC2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleImportJson}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
            >
              <Upload className="w-4.5 h-4.5" />
              <span>Import pasted JSON</span>
            </button>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(jsonText);
                setStatus({ type: "success", text: "JSON copied to clipboard!" });
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
            >
              <Check className="w-4.5 h-4.5" />
              <span>Copy configuration JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* HISTORY TIMELINE SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b pb-2 text-left">
          <h3 className="font-serif font-extrabold text-base text-[#0B3C5D] dark:text-white">
            Theme History & Restore Timeline
          </h3>
        </div>

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
                    No theme logs found in the database.
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
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recordColors.primaryColor }} title="Primary" />
                          <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recordColors.accentColor }} title="Accent" />
                          <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recordColors.bgColor }} title="Bg" />
                          <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recordColors.cardBgColor }} title="Card/Surface" />
                          <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recordColors.textColor }} title="Text" />
                          <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recordColors.headingColor }} title="Heading" />
                          <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recordColors.borderColor }} title="Border" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          disabled={loading}
                          onClick={() => handleRestoreFromRecord(record)}
                          className="inline-flex items-center space-x-1 border border-[#1E7FC2] text-[#1E7FC2] hover:bg-[#1E7FC2]/5 font-bold px-3 py-1.5 rounded-xl transition"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          <span>Restore to Editor</span>
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
