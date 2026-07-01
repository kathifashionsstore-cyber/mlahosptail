import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Grid, List, Activity, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Treatments() {
  const { treatments, departments } = useApp();
  const [selectedDept, setSelectedDept] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  const filteredTreatments =
    selectedDept === "all"
      ? treatments
      : treatments.filter((t) => t.departmentId === selectedDept);

  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="premium-banner text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#D81F26]">Treatments</span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-serif tracking-tight">Surgical Treatments & Procedures</h1>
          <p className="text-sm md:text-base text-slate-200 max-w-2xl font-medium">
            Clinical specialties spanning joint replacements, spine surgery, and complex trauma care.
          </p>
        </div>
      </section>

      {/* 2. Filter Bar with View Mode Toggle */}
      <section className="py-6 bg-[#F4F9FC] dark:bg-[#132635]/30 border-b border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Department Chips */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setSelectedDept("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                selectedDept === "all"
                  ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-md"
                  : "border-transparent text-[#1E7FC2] bg-[#E7F3FA] hover:bg-[#1E7FC2] hover:text-white"
              }`}
            >
              All Procedures
            </button>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border-2 ${
                  selectedDept === dept.id
                    ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-md"
                    : "border-transparent text-[#1E7FC2] bg-[#E7F3FA] hover:bg-[#1E7FC2] hover:text-white"
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>

          {/* Grid / List view mode toggles */}
          <div className="flex space-x-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700 flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-white dark:bg-slate-700 text-[#1E7FC2] dark:text-white shadow-sm" : "text-slate-400"
              }`}
              title="Grid View"
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list" ? "bg-white dark:bg-slate-700 text-[#1E7FC2] dark:text-white shadow-sm" : "text-slate-400"
              }`}
              title="List View"
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Treatments List/Grid */}
      <section className="py-16 px-6 md:px-12 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {filteredTreatments.length > 0 ? (
            viewMode === "grid" ? (
              /* Rebuilt Gastro Grid Overlay Pattern */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {filteredTreatments.map((treatment) => {
                  const dept = departments.find((d) => d.id === treatment.departmentId);
                  return (
                    <Link
                      key={treatment.id}
                      to={`/treatments/${treatment.slug}`}
                      className="group relative w-full aspect-[4/5] rounded-[14px] overflow-hidden shadow-md flex items-end p-6 border border-slate-100 dark:border-slate-850 hover:shadow-[0_20px_45px_rgba(11,60,93,0.14)] transition-all duration-200"
                    >
                      <img
                        src={treatment.thumbnailUrl || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80"}
                        alt={treatment.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                      
                      <div className="relative z-20 space-y-1 w-full text-left">
                        {dept && (
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#D81F26]">
                            {dept.name}
                          </span>
                        )}
                        <h3 className="text-white font-extrabold text-base font-serif leading-tight">
                          {treatment.name}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* List Layout */
              <div className="space-y-4 max-w-4xl mx-auto">
                {filteredTreatments.map((treatment) => {
                  const dept = departments.find((d) => d.id === treatment.departmentId);
                  return (
                    <div
                      key={treatment.id}
                      className="p-5 bg-[#F4F9FC] dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[14px] flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#1E7FC2]">
                          {dept?.name || "Specialty"}
                        </span>
                        <h3 className="text-lg font-bold text-[#0B3C5D] dark:text-white font-serif">
                          {treatment.name}
                        </h3>
                        <p className="text-xs text-[#5C6E7A] dark:text-slate-400 font-semibold line-clamp-2 max-w-xl">
                          {treatment.shortDescription}
                        </p>
                      </div>
                      <Link
                        to={`/treatments/${treatment.slug}`}
                        className="bg-white dark:bg-slate-800 text-[#0B3C5D] dark:text-white p-3 rounded-full hover:bg-[#1E7FC2] hover:text-white shadow-sm border transition"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-16 px-6 bg-[#F4F9FC] dark:bg-[#132635]/30 rounded-3xl border border-slate-100 dark:border-slate-800 max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-slate-450 flex items-center justify-center mx-auto shadow-inner">
                <Activity className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-200">No procedures found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">There are no surgical procedures listed under this clinical wing currently.</p>
              </div>
              <button
                onClick={() => setSelectedDept("all")}
                className="border-2 border-[#1E7FC2] text-[#1E7FC2] font-bold text-xs px-4 py-2 rounded-xl"
              >
                Clear Filters & View All
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Treatments;
