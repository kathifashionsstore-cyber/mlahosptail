import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useApp } from "../../context/AppContext";
import { Settings as SettingsIcon, Save, Phone, MapPin, Mail, Clock, Palette, MonitorPlay, ShieldAlert } from "lucide-react";
import { seedDatabase } from "../../firebase/seed";

export function Settings() {
  const { settings, loadCollections } = useApp();
  const [formData, setFormData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        hospitalName: settings.hospitalName || "Amulya Nursing Home",
        tagline: settings.tagline || "Center for Trauma, Spine, Polio & Joint Replacements",
        logoUrl: settings.logoUrl || "",
        faviconUrl: settings.faviconUrl || "",
        themePrimaryColor: settings.themePrimaryColor || "#0F4C81",
        themeAccentColor: settings.themeAccentColor || "#16A34A",
        phoneNumbers: settings.phoneNumbers || [
          { label: "Hospital", number: "+918647223625" },
          { label: "Pharmacy / Medical", number: "+918647228624" },
        ],
        whatsappNumber: settings.whatsappNumber || "+918647223625",
        email: settings.email || "info@amulyanursinghome.com",
        address: settings.address || "30/13, 18-1, Guntur Rd, Panasathota, Narasaraopeta, Andhra Pradesh 522601",
        mapEmbedUrl: settings.mapEmbedUrl || "",
        openingHours: {
          opd: settings.openingHours?.opd || "10:00 AM – 7:00 PM, Monday – Saturday",
          emergency: settings.openingHours?.emergency || "24/7, All Days",
        },
        socialLinks: {
          instagram: settings.socialLinks?.instagram || "",
          facebook: settings.socialLinks?.facebook || "",
          youtube: settings.socialLinks?.youtube || "",
          twitter: settings.socialLinks?.twitter || "",
        },
        maintenanceMode: settings.maintenanceMode || false,
        installPromptEnabled: settings.installPromptEnabled !== undefined ? settings.installPromptEnabled : true,
      });
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpeningHoursChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [field]: value,
      },
    }));
  };

  const handleSocialLinkChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  const handlePhoneChange = (index, field, value) => {
    setFormData((prev) => {
      const phones = [...prev.phoneNumbers];
      phones[index] = { ...phones[index], [field]: value };
      return { ...prev, phoneNumbers: phones };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const docRef = doc(db, "siteSettings", "general");
      await updateDoc(docRef, formData);
      await loadCollections(); // reload collections caching
      alert("Website settings updated successfully!");
    } catch (err) {
      console.error("Failed to update general settings:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleForceSeed = async () => {
    if (window.confirm("Warning: This will overwrite all custom changes and reset the treatments, services, and default settings to the verified logo/brand color setup. Appointments and admin accounts will be preserved. Do you want to proceed?")) {
      setSaving(true);
      try {
        await seedDatabase(true);
        await loadCollections();
        alert("Database successfully reset and re-seeded with latest branding and content!");
        window.location.reload();
      } catch (err) {
        console.error("Force seed failed:", err);
        alert("Re-seeding failed: " + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  if (!formData) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 mt-3 font-semibold text-xs">Loading website settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif flex items-center space-x-2.5">
          <SettingsIcon className="w-7 h-7 text-primary" />
          <span>Website Settings</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">Adjust primary configurations, contact lines, maintenance mode and color styling.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Card 1: Hospital details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-55 text-base flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <span>Hospital Identity</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hospital Name</label>
              <input
                type="text"
                value={formData.hospitalName}
                onChange={(e) => handleChange("hospitalName", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Contact channels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-55 text-base flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary" />
            <span>Contact Channels & Timings</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone numbers */}
            {formData.phoneNumbers.map((phone, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Phone Line ({phone.label})
                </label>
                <input
                  type="text"
                  value={phone.number}
                  onChange={(e) => handlePhoneChange(idx, "number", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                />
              </div>
            ))}

            {/* WhatsApp */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">WhatsApp Chatline</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hospital Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* OPD Timings */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">OPD Timings</label>
              <input
                type="text"
                value={formData.openingHours.opd}
                onChange={(e) => handleOpeningHoursChange("opd", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Emergency hours */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Emergency Support Hours</label>
              <input
                type="text"
                value={formData.openingHours.emergency}
                onChange={(e) => handleOpeningHoursChange("emergency", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Brand Styling */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-55 text-base flex items-center space-x-2">
            <Palette className="w-5 h-5 text-primary" />
            <span>Brand Styling & Colors</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary color */}
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={formData.themePrimaryColor}
                onChange={(e) => handleChange("themePrimaryColor", e.target.value)}
                className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-750 cursor-pointer overflow-hidden bg-transparent"
              />
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Primary Theme Color
                </label>
                <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-350">{formData.themePrimaryColor}</span>
              </div>
            </div>

            {/* Accent color */}
            <div className="flex items-center space-x-4">
              <input
                type="color"
                value={formData.themeAccentColor}
                onChange={(e) => handleChange("themeAccentColor", e.target.value)}
                className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-750 cursor-pointer overflow-hidden bg-transparent"
              />
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Accent Theme Color
                </label>
                <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-350">{formData.themeAccentColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Location & Address */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-55 text-base flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Location details</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Postal Address</label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Google Maps Iframe Embed Source URL (src attribute only)
              </label>
              <input
                type="text"
                value={formData.mapEmbedUrl}
                onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
                placeholder="e.g. https://www.google.com/maps/embed?pb=..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Social Channels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-55 text-base flex items-center space-x-2">
            <Palette className="w-5 h-5 text-primary" />
            <span>Social Networking Links</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["instagram", "facebook", "youtube", "twitter"].map((soc) => (
              <div key={soc} className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 capitalize">{soc} Link</label>
                <input
                  type="text"
                  value={formData.socialLinks[soc]}
                  onChange={(e) => handleSocialLinkChange(soc, e.target.value)}
                  placeholder={`e.g. https://www.${soc}.com/...`}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 6: Operations & Maintenance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-slate-55 text-base flex items-center space-x-2">
            <MonitorPlay className="w-5 h-5 text-primary" />
            <span>Operations Management</span>
          </h3>

          <div className="space-y-4">
            {/* Maintenance toggler */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/80">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>Maintenance Mode</span>
                </h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Enable this to show an "Under Maintenance" placeholder to public visitors.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-slate-700 peer-checked:bg-primary dark:peer-checked:bg-primary-light"></div>
              </label>
            </div>

            {/* PWA Prompt Toggler */}
            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">PWA Install Widget</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Allow Android and iOS mobile devices to display the PWA "Install App" triggers.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.installPromptEnabled}
                  onChange={(e) => handleChange("installPromptEnabled", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:bg-slate-700 peer-checked:bg-primary dark:peer-checked:bg-primary-light"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center space-x-2 w-full bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary/20 transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? "Saving Configurations..." : "Save Website Settings"}</span>
        </button>
      </form>

      {/* Advanced Database Actions Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 mt-8">
        <div className="flex items-center space-x-3.5 border-b border-slate-50 dark:border-slate-850 pb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-850 dark:text-slate-50 font-serif">Administrative Diagnostics</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Database maintenance, seeding recovery and content initialization.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-750 dark:text-red-450">Factory Reset & Re-Seed</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold max-w-xl">
              Overwrites all existing treatments, services, and default configurations in Firestore with the verified factory-seeded content, colors, and logo structures. This does not delete user appointments or admin accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleForceSeed}
            disabled={saving}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-center disabled:opacity-50 flex-shrink-0"
          >
            Reset & Re-Seed
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
