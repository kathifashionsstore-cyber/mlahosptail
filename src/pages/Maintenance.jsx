import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Phone, Wrench } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Maintenance() {
  const { settings } = useApp();

  const emergencyPhone = settings?.phoneNumbers?.find((p) => p.label === "Hospital")?.number || "+918647223625";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 rounded-3xl shadow-xl space-y-6">
        {/* Pulsing Wrench/Shield Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-full flex items-center justify-center animate-pulse">
            <Wrench className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-50 font-serif leading-tight">
            We'll Be Right Back!
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
            Amulya Nursing Home website is currently undergoing routine system updates to enhance patient services. We appreciate your patience.
          </p>
        </div>

        {/* Emergency contact box */}
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-left space-y-3">
          <h3 className="font-extrabold text-red-700 dark:text-red-400 text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4.5 h-4.5" />
            <span>Casualty & Emergency Support</span>
          </h3>
          <p className="text-xs text-red-650 dark:text-red-300 leading-relaxed font-semibold">
            Our clinical operations are fully functional in Narasaraopeta! If you require immediate emergency transport or trauma admissions, call:
          </p>
          <a
            href={`tel:${emergencyPhone}`}
            className="flex items-center justify-center space-x-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Call: {emergencyPhone}</span>
          </a>
        </div>

        {/* Quiet Admin Bypass Link */}
        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold pt-4 border-t border-slate-100 dark:border-slate-800">
          <span>Authorized staff? </span>
          <Link to="/admin/login" className="underline hover:text-slate-600 dark:hover:text-slate-350">
            Log in to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Maintenance;
