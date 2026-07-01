import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Calendar, Phone, Activity, Globe, Heart } from "lucide-react";

// 1. Generic layout wrapper for legal/plain text pages to look premium
function UtilityWrapper({ title, category, children }) {
  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      <section className="premium-banner text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#3FA535]">{category}</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif">{title}</h1>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 md:p-10 rounded-3xl shadow-sm space-y-6 text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
          {children}
        </div>
      </section>
    </div>
  );
}

// 2. Privacy Policy Component
export function PrivacyPolicy() {
  return (
    <UtilityWrapper title="Privacy Policy" category="Legal & Compliance">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif">1. Information Collection</h3>
      <p>We collect patient names, phone numbers, and symptoms details during appointment scheduling. Medical records and prescription documents uploaded are securely stored within restricted Google Cloud / Firebase platforms.</p>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif mt-6">2. Security Safeguards</h3>
      <p>Patient health details are never shared with marketing platforms. Cashless insurance details are shared exclusively with your designated TPAs for billing clearance.</p>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif mt-6">3. Patient Access Rights</h3>
      <p>Under the Digital Personal Data Protection Act, patients retain full rights to request updates, review, or removal of their registered clinical contact details from our records.</p>
    </UtilityWrapper>
  );
}

// 3. Terms and Conditions Component
export function TermsConditions() {
  return (
    <UtilityWrapper title="Terms & Conditions" category="Legal & Compliance">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif">1. Medical Advice Disclaimer</h3>
      <p>Consultation schedules booked online or telemedicine calls do not substitute in-person clinical diagnostics. In cases of severe trauma, spinal cord compression, or high-grade pain, please proceed directly to the nearest physical casualty room.</p>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif mt-6">2. Appointment Scheduling</h3>
      <p>While we make every effort to honor scheduled slots, consulting schedules may undergo delayed adjustments due to emergency surgical calls in the operating theater.</p>
    </UtilityWrapper>
  );
}

// 4. Disclaimer Component
export function Disclaimer() {
  return (
    <UtilityWrapper title="Medical Disclaimer" category="Legal & Compliance">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif">Clinical Outcomes</h3>
      <p>The before/after visual journals and recovery case files published reflect individual case histories and surgical responses. Actual clinical recovery timelines vary per patient depending on age, bone density, post-operative rehabilitation compliance, and concurrent health parameters.</p>
    </UtilityWrapper>
  );
}

// 5. Refund Policy Component
export function RefundPolicy() {
  return (
    <UtilityWrapper title="Refund & Cancellation Guidelines" category="Finance & Claims">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif">Cancellations</h3>
      <p>Consultation bookings can be cancelled or rescheduled up to 2 hours before the slot. Refunds for online consultation fees are processed back to the original source bank accounts within 5 to 7 working days.</p>
    </UtilityWrapper>
  );
}

// 6. Accessibility Statement Component
export function Accessibility() {
  return (
    <UtilityWrapper title="Accessibility Statement" category="Patient Care Support">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-serif">Inclusive Care</h3>
      <p>Amulya Nursing Home is committed to digital and physical accessibility. Our hospital corridors, toilets, and elevator spaces are fully wheelchair accessible. Our web application conforms to WCAG 2.1 AA standards supporting screen readers and high contrast modes.</p>
    </UtilityWrapper>
  );
}

// 7. Sitemap Component
export function Sitemap() {
  return (
    <UtilityWrapper title="Website Sitemap" category="Navigation Hub">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-slate-700 dark:text-slate-350">
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Public Pages</h4>
          <ul className="space-y-2 text-xs font-bold">
            <li><Link to="/" className="text-brand-blue hover:underline">Home Landing</Link></li>
            <li><Link to="/about" className="text-brand-blue hover:underline">About Hospital</Link></li>
            <li><Link to="/our-story" className="text-brand-blue hover:underline">Heritage & Story</Link></li>
            <li><Link to="/leadership" className="text-brand-blue hover:underline">Surgeon Leadership</Link></li>
            <li><Link to="/facilities" className="text-brand-blue hover:underline">Clinical Facilities</Link></li>
            <li><Link to="/testimonials" className="text-brand-blue hover:underline">Patient Reviews</Link></li>
            <li><Link to="/gallery" className="text-brand-blue hover:underline">Media Gallery</Link></li>
            <li><Link to="/blog" className="text-brand-blue hover:underline">Health Blog</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Clinical Specialities</h4>
          <ul className="space-y-2 text-xs font-bold">
            <li><Link to="/departments/orthopaedics" className="text-brand-blue hover:underline">General Orthopaedics</Link></li>
            <li><Link to="/departments/spine-care" className="text-brand-blue hover:underline">Spine Surgery</Link></li>
            <li><Link to="/departments/joint-replacement" className="text-brand-blue hover:underline">Joint Replacement</Link></li>
            <li><Link to="/departments/sports-medicine" className="text-brand-blue hover:underline">Sports & Arthroscopy</Link></li>
            <li><Link to="/departments/trauma-care" className="text-brand-blue hover:underline">24/7 Trauma Care</Link></li>
            <li><Link to="/departments/physiotherapy" className="text-brand-blue hover:underline">Physiotherapy Rehab</Link></li>
          </ul>
        </div>
      </div>
    </UtilityWrapper>
  );
}

// 8. Emergency Info Component
export function EmergencyInfo() {
  return (
    <div className="pt-24 min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      <section className="bg-brand-red text-white py-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-3 relative z-10">
          <span className="text-xs uppercase font-extrabold tracking-widest text-white/85 animate-pulse">24/7 Casualty Response</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif">Trauma Emergency Hotline</h1>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12 max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 md:p-10 rounded-3xl shadow-sm text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium space-y-4 text-center">
          <Phone className="w-12 h-12 text-brand-red mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-slate-850 dark:text-slate-50 font-serif">Call Casualty Desk Immediately</h3>
          <p className="max-w-md mx-auto text-xs text-slate-500 font-semibold leading-relaxed">
            Our trauma rooms, modular operating suites, and critical care units are staffed 24 hours a day, 365 days a year.
          </p>
          <a
            href="tel:+919494332625"
            className="inline-block bg-brand-red hover:bg-brand-red/90 text-white font-bold px-8 py-4 rounded-xl text-sm shadow-md animate-colors"
          >
            Emergency Contact: +91 9494332625
          </a>
        </div>
      </section>
    </div>
  );
}
