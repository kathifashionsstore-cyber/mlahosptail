import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getDoctorPhoto } from "../hooks/useDoctorPhoto";

export function Doctors() {
  const { doctors, departments, siteImages } = useApp();
  const [selectedDept, setSelectedDept] = useState("all");

  const filteredDoctors =
    selectedDept === "all"
      ? doctors
      : doctors.filter((docItem) => docItem.departmentId === selectedDept);

  return (
    <div className="pt-24 min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Header Banner */}
      <section className="bg-white px-6 py-16 dark:bg-slate-950 md:px-12">
        <div className="max-w-7xl mx-auto text-center space-y-0">
          <span className="section-label">Our Specialists</span>
          <h1 className="mb-4 text-[clamp(32px,5vw,48px)] font-extrabold leading-[1.15] tracking-normal text-[#0D2137] dark:text-white">
            Meet Our Medical Team
          </h1>
          <p className="section-subheading centered">
            Experienced orthopaedic surgeons, spine specialists, and medical officers serving Palnadu.
          </p>
        </div>
      </section>

      {/* 2. Filter Chips Bar */}
      <section className="py-6 bg-[#F4F9FC] dark:bg-[#132635]/30 border-b border-[#1E7FC2]/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2.5 justify-center">
            {/* 'All' Chip */}
            <button
              onClick={() => setSelectedDept("all")}
              className={`rounded-[24px] px-[18px] py-2 text-[14px] font-semibold transition-all duration-200 border ${
                selectedDept === "all"
                  ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-md font-semibold"
                  : "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE] hover:bg-[#1E7FC2] hover:text-white"
              }`}
            >
              All Specialists
            </button>

            {/* Department-specific Chips */}
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`rounded-[24px] px-[18px] py-2 text-[14px] font-semibold transition-all duration-200 border ${
                  selectedDept === dept.id
                    ? "bg-[#1E7FC2] border-[#1E7FC2] text-white shadow-md font-semibold"
                    : "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE] hover:bg-[#1E7FC2] hover:text-white"
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Doctors Grid */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {filteredDoctors.map((docItem) => (
                <div
                  key={docItem.id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[14px] p-6 shadow-[0_10px_30px_rgba(11,60,93,0.08)] flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 items-center hover:shadow-[0_20px_45px_rgba(11,60,93,0.14)] transition-all duration-200"
                >
                  {/* Photo or Circular gradient avatar placeholder */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1E7FC2] to-[#0B3C5D] flex items-center justify-center flex-shrink-0 text-white shadow-md overflow-hidden relative">
                    <img
                      src={getDoctorPhoto(docItem, null, siteImages)}
                      alt={docItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="flex-grow space-y-3 text-center md:text-left w-full">
                    <div>
                      <span className="block text-[12px] font-bold uppercase tracking-[1.5px] text-[#1E7FC2]">
                        {docItem.designation}
                      </span>
                      <h2 className="mt-1 text-[20px] font-bold leading-tight text-[#0D2137] dark:text-white">
                        {docItem.name}
                      </h2>
                      <p className="mt-1 text-[14px] font-normal text-[#6B7280] dark:text-slate-400">
                        {docItem.qualification}
                      </p>
                    </div>

                    {/* Checklist spec info */}
                    <ul className="space-y-1 text-[14px] leading-[1.7] text-[#374151] dark:text-slate-300 font-normal flex flex-col items-center md:items-start">
                      {(Array.isArray(docItem.specialization) ? docItem.specialization : []).map((spec, i) => (
                        <li key={i} className="flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-[#D81F26] flex-shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Actions bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                      <Link
                        to={`/doctors/${docItem.id}`}
                        className="border-2 border-[#1E7FC2] text-[#1E7FC2] hover:bg-[#1E7FC2]/5 font-bold text-xs py-2 px-4 rounded-xl flex-1 text-center transition"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/book-appointment?doctorId=${docItem.id}`}
                        className="bg-[#D81F26] hover:bg-[#B3151B] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex-1 text-center shadow-md shadow-[#D81F26]/10 transition"
                      >
                        Book Slot
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-[#F4F9FC] dark:bg-slate-900/20 rounded-3xl border border-slate-100 dark:border-slate-800 max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                <UserRound className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-200">No specialists found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">There are no doctors listed under this specific department currently.</p>
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

export default Doctors;
