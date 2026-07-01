import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Phone, MessageSquare, BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";

export function RelatedActions({ itemName, itemSlug, departmentId }) {
  const { settings } = useApp();
  const phoneNumbers = settings?.phoneNumbers || [];
  const primaryPhone = phoneNumbers[0]?.number || "+918647223625";
  const whatsappNumber = settings?.whatsappNumber || "+918647223625";

  // Clean phone number for tel links
  const cleanPhone = (num) => num.replace(/[^+\d]/g, "");

  const whatsappMessage = encodeURIComponent(`Hi, I'd like to ask about ${itemName}`);
  const whatsappUrl = `https://wa.me/${cleanPhone(whatsappNumber)}?text=${whatsappMessage}`;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-850 p-6 md:p-8 mt-12 space-y-6">
      <div className="text-center md:text-left">
        <h3 className="text-lg md:text-xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">
          What Would You Like To Do?
        </h3>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Choose from the multiple options below to take your next step.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Option 1: Book Appointment */}
        <Link
          to={`/book-appointment?treatment=${itemSlug}&departmentId=${departmentId || ""}`}
          className="flex flex-col items-center justify-center text-center p-5 bg-brand-red hover:bg-brand-red-dark text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm">Book Appointment</span>
          <span className="text-[10px] text-white/80 mt-1">Schedule online slot</span>
        </Link>

        {/* Option 2: Call Us Now */}
        <a
          href={`tel:${cleanPhone(primaryPhone)}`}
          className="flex flex-col items-center justify-center text-center p-5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm">Call Us Now</span>
          <span className="text-[10px] text-white/80 mt-1">{primaryPhone}</span>
        </a>

        {/* Option 3: Chat on WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center text-center p-5 bg-brand-green hover:bg-brand-green-dark text-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm">Chat on WhatsApp</span>
          <span className="text-[10px] text-white/80 mt-1">Get instant updates</span>
        </a>

        {/* Option 4: Read Patient Stories */}
        <Link
          to={`/testimonials?treatment=${itemSlug}`}
          className="flex flex-col items-center justify-center text-center p-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border border-slate-100 dark:border-slate-700 group"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm">Read Patient Stories</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Real recovery stories</span>
        </Link>
      </div>
    </div>
  );
}

export default RelatedActions;
