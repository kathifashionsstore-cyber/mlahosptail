import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Footer() {
  const { settings, services } = useApp();

  const socialLinks = settings?.socialLinks || {};
  const phoneNumbers = settings?.phoneNumbers || [];
  const address = settings?.address || "30/13, 18-1, Guntur Rd, Panasathota, Barampet, Narasaraopeta, Andhra Pradesh 522601";
  const email = settings?.email || "info@amulyanursinghome.com";
  const opdHours = settings?.openingHours?.opd || "10:00 AM – 7:00 PM, Monday – Saturday";
  const emergencyHours = settings?.openingHours?.emergency || "24/7, All Days";
  const mapEmbedUrl = settings?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3830.4074712411624!2d80.04671131486043!3d16.235700088780367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!2f49!3m3!1m2!1s0x3a4b1bb64c679a95%3A0xe5a3eef9386c965b!2sAmulya%20Nursing%20Home!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin";

  return (
    <footer className="bg-[#082A40] text-slate-350 pt-16 pb-24 md:pb-8 border-t border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
        {/* Column 1: Hospital Logo, Tagline & Socials */}
        <div className="space-y-5 lg:col-span-1">
          <Link to="/" className="flex items-center space-x-3.5 group">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings?.hospitalName || "Amulya Nursing Home"}
                className="w-10 h-10 object-contain rounded-xl bg-white p-0.5"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m-8-8h16" />
                </svg>
              </div>
            )}
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white font-serif block">
                Amulya
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#D81F26] block -mt-0.5">
                Nursing Home
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            Center for Trauma, Spine, Polio & Joint Replacements. Serving Narasaraopeta with surgical excellence and trust since 1992.
          </p>
          <div className="flex space-x-2.5">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#D81F26] hover:text-white flex items-center justify-center transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#1E7FC2] hover:text-white flex items-center justify-center transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {socialLinks.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#D81F26] hover:text-white flex items-center justify-center transition-colors duration-200"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-[13px] uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2 text-xs font-semibold text-slate-400">
            <li>
              <Link to="/about" className="hover:text-white transition">
                About Hospital
              </Link>
            </li>
            <li>
              <Link to="/our-story" className="hover:text-white transition">
                Heritage Story
              </Link>
            </li>
            <li>
              <Link to="/leadership" className="hover:text-white transition">
                Medical Leadership
              </Link>
            </li>
            <li>
              <Link to="/doctors" className="hover:text-white transition">
                Consultant Doctors
              </Link>
            </li>
            <li>
              <Link to="/patient-stories" className="hover:text-white transition">
                Patient Stories
              </Link>
            </li>
            <li>
              <Link to="/careers" className="hover:text-white transition">
                Careers & Jobs
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Service Focus */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-[13px] uppercase tracking-wider">Service Focus</h3>
          <ul className="space-y-2 text-xs font-semibold text-slate-400">
            <li>
              <Link to="/services" className="hover:text-white transition">
                Services & Conditions
              </Link>
            </li>
            <li>
              <Link to="/services/orthopaedics/knee-pain" className="hover:text-white transition">
                Knee & Joint Care
              </Link>
            </li>
            <li>
              <Link to="/services/orthopaedics/back-pain" className="hover:text-white transition">
                Spine Care
              </Link>
            </li>
            <li>
              <Link to="/services/orthopaedics/fractures" className="hover:text-white transition">
                Trauma & Fracture Care
              </Link>
            </li>
            <li>
              <Link to="/services/orthopaedics/sports-injury" className="hover:text-white transition">
                Sports Injury Care
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Services */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-[13px] uppercase tracking-wider">Medical Services</h3>
          <ul className="space-y-2 text-xs font-semibold text-slate-400">
            {services.slice(0, 5).map((srv) => (
              <li key={srv.id}>
                <Link to={`/services/${srv.slug}`} className="hover:text-white transition block truncate">
                  {srv.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 5: Contact Info */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-[13px] uppercase tracking-wider">Contact Details</h3>
          <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-[#1E7FC2] flex-shrink-0 mt-0.5" />
              <span>{address}</span>
            </li>
            {phoneNumbers.slice(0, 2).map((p, idx) => (
              <li key={idx} className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#1E7FC2] flex-shrink-0" />
                <a href={`tel:${p.number}`} className="hover:text-white transition">
                  {p.label}: {p.number}
                </a>
              </li>
            ))}
            <li className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-[#1E7FC2] flex-shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-white transition block truncate">
                {email}
              </a>
            </li>
            <li className="pt-1 border-t border-white/5 flex items-start space-x-2 text-[10px]">
              <Clock className="w-3.5 h-3.5 text-[#D81F26] flex-shrink-0 mt-0.5" />
              <div>
                <p>OPD: {opdHours}</p>
                <p className="text-red-500 font-extrabold">Casualty: {emergencyHours}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Google Maps Full Width Embed */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-12">
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Amulya Nursing Home Map Location"
          ></iframe>
        </div>
      </div>

      {/* Bottom Copyright and Credit Strip */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-semibold space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center md:justify-start text-[11px]">
          <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms-and-conditions" className="hover:text-white transition">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/disclaimer" className="hover:text-white transition">Disclaimer</Link>
          <span>•</span>
          <Link to="/refund-policy" className="hover:text-white transition">Refunds</Link>
          <span>•</span>
          <Link to="/accessibility" className="hover:text-white transition">Accessibility</Link>
          <span>•</span>
          <Link to="/sitemap" className="hover:text-white transition">Sitemap</Link>
          <span>•</span>
          <Link to="/emergency" className="text-red-500 hover:text-red-400 transition">Emergency</Link>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-3 text-center md:text-right">
          <div>
            &copy; {new Date().getFullYear()} Amulya Nursing Home. All Rights Reserved.
          </div>
          <div className="hidden md:inline text-slate-700">|</div>
          <div className="flex items-center justify-center space-x-1">
            <span>Designed by</span>
            <a
              href="tel:+919398724704"
              className="text-slate-400 hover:text-white font-bold transition-colors duration-150"
            >
              WayzenTech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
