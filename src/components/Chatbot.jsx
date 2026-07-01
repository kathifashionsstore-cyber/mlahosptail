import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X, Send, User, Sparkles, Phone, ArrowUp, Calendar, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";

const QUICK_ACTIONS = [
  { label: "🦴 Find a Service", value: "Find a Treatment/Service" },
  { label: "👨‍⚕️ Meet Our Doctors", value: "Meet Our Doctors" },
  { label: "📅 Book Appointment", value: "Book Appointment" },
  { label: "📍 Location & Hours", value: "Hospital Location & Hours" },
  { label: "🚑 Emergency Line", value: "Emergency / Ambulance" },
  { label: "❓ FAQs", value: "FAQs" },
];

function parseMessageText(text, closePanel) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const plainText = text.slice(lastIndex, match.index);
    if (plainText) parts.push(plainText);

    const linkText = match[1];
    const linkUrl = match[2];

    const isExternal = linkUrl.startsWith("http");
    if (isExternal) {
      parts.push(
        <a key={match.index} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-[#1E7FC2] hover:underline font-bold inline">
          {linkText}
        </a>
      );
    } else {
      parts.push(
        <Link key={match.index} to={linkUrl} onClick={closePanel} className="text-[#1E7FC2] hover:underline font-bold inline">
          {linkText}
        </Link>
      );
    }

    lastIndex = linkRegex.lastIndex;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText) parts.push(remainingText);

  return parts.length > 0 ? parts : text;
}

function findIntent(input, services, doctors) {
  const query = input.toLowerCase().trim();

  // 1. Check Emergency / Ambulance
  if (query.match(/\b(emergency|ambulance|siren|casualty|icu|accident)\b/)) {
    return {
      type: "emergency",
      text: "🚨 **Emergency & Casualty Services are open 24/7.** For immediate ambulance coordination or critical trauma admissions, call our trauma desk directly.",
      buttons: [
        { label: "Call Trauma Desk", type: "phone", value: "+918647223625" },
        { label: "WhatsApp Desk", type: "whatsapp", value: "+917383085084" }
      ],
      suggested: ["Book Appointment", "Hospital Location & Hours"]
    };
  }

  // 2. Check Location / Directions
  if (query.match(/\b(location|address|directions|map|where|reach|find)\b/)) {
    return {
      type: "faq",
      text: "📍 **Amulya Hospital Location:**\nGuntur Road, Narasaraopet, Andhra Pradesh - 522601.\n\n**Hours:** OPD is open 10:00 AM – 7:00 PM (Mon-Sat). Casualty/ER is open 24/7.",
      buttons: [
        { label: "Get Directions on Google Maps", type: "link_external", value: "https://www.google.com/maps?daddr=Amulya+Nursing+Home,+Narasaraopet" },
        { label: "OPD Schedule", type: "quick_reply", value: "Hospital Location & Hours" }
      ],
      suggested: ["Meet Our Doctors", "Book Appointment"]
    };
  }

  // 3. Check Aarogyasri / Cashless / Insurance
  if (query.match(/\b(aarogyasri|arogyasri|insurance|cashless|tpa|ehs|wjhs|free|card)\b/)) {
    return {
      type: "faq",
      text: "💳 **Cashless & Schemes:**\nAmulya Hospital accepts **Dr. YSR Aarogyasri**, Employee Health Scheme (EHS), WJHS, and major private insurance TPAs.\n\nYou can view more details on our [Insurance Info](/patient-care/insurance) page.",
      buttons: [
        { label: "View Insurance Page", type: "link_internal", value: "/patient-care/insurance" },
        { label: "Book Consultation", type: "link_internal", value: "/book-appointment" }
      ],
      suggested: ["Find a Treatment/Service", "Meet Our Doctors"]
    };
  }

  // 4. Check Appointment booking
  if (query.match(/\b(appointment|book|slot|consult|visit|schedule)\b/)) {
    return {
      type: "faq",
      text: "📅 **Appointment Booking:**\nYou can book an OPD slot online instantly. Select your doctor, preferred date, and submit your details.",
      buttons: [
        { label: "Book Online Now", type: "link_internal", value: "/book-appointment" },
        { label: "Call for Booking", type: "phone", value: "+918647223625" }
      ],
      suggested: ["Meet Our Doctors", "Hospital Location & Hours"]
    };
  }

  // 5. Search Doctors
  const matchedDocs = doctors.filter(doc => {
    return doc.name.toLowerCase().includes(query) ||
           doc.specialization.some(s => s.toLowerCase().includes(query)) ||
           doc.designation.toLowerCase().includes(query) ||
           (doc.qualification && doc.qualification.toLowerCase().includes(query));
  });

  if (matchedDocs.length > 0) {
    return {
      type: "doctors",
      text: `👨‍⚕️ I found ${matchedDocs.length} specialist(s) matching your request:`,
      items: matchedDocs,
      suggested: ["Book Appointment", "Find a Treatment/Service"]
    };
  }

  // 6. Search Services / Conditions
  const matchedServices = services.filter(service => {
    return service.name.toLowerCase().includes(query) ||
           service.slug.toLowerCase().includes(query) ||
           (service.shortDescription && service.shortDescription.toLowerCase().includes(query)) ||
           (service.symptoms && service.symptoms.some(s => s.toLowerCase().includes(query))) ||
           (service.causes && service.causes.some(c => c.toLowerCase().includes(query)));
  });

  if (matchedServices.length > 0) {
    return {
      type: "services",
      text: `🦴 Here are the services/treatments related to your search:`,
      items: matchedServices.slice(0, 3), // max 3 cards
      suggested: ["Meet Our Doctors", "Book Appointment"]
    };
  }

  // 7. General FAQs
  if (query.match(/\b(hours|timings|open|close|sunday|saturday)\b/)) {
    return {
      type: "faq",
      text: "⏰ **Hospital Operating Hours:**\n- **Casualty & Emergency:** 24/7, Open Daily.\n- **OPD Consultations:** 10:00 AM – 7:00 PM, Monday – Saturday.\n- **In-house Pharmacy & Diagnostics:** 24/7.",
      buttons: [
        { label: "Call Hospital Desk", type: "phone", value: "+918647223625" }
      ],
      suggested: ["Book Appointment", "Hospital Location & Hours"]
    };
  }

  return null;
}

const typingTransition = {
  y: {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
  },
};

function TypingIndicator() {
  return (
    <div className="flex space-x-1.5 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl w-16 items-center justify-center">
      <motion.span
        transition={{ ...typingTransition, delay: 0 }}
        animate={{ y: [0, -5, 0] }}
        className="w-1.5 h-1.5 bg-[#1E7FC2] rounded-full"
      />
      <motion.span
        transition={{ ...typingTransition, delay: 0.12 }}
        animate={{ y: [0, -5, 0] }}
        className="w-1.5 h-1.5 bg-[#1E7FC2] rounded-full"
      />
      <motion.span
        transition={{ ...typingTransition, delay: 0.24 }}
        animate={{ y: [0, -5, 0] }}
        className="w-1.5 h-1.5 bg-[#1E7FC2] rounded-full"
      />
    </div>
  );
}

export function Chatbot() {
  const { settings, services, doctors } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse chat history:", err);
      }
    }
    return [
      {
        id: "welcome",
        sender: "bot",
        text: "👋 Hello! Welcome to **Amulya Hospital Assistant**.\n\nHow can I help you find services, specialists, or hospital information today?",
        isGreeting: true,
      }
    ];
  });
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [unread, setUnread] = useState(0);

  const messagesEndRef = useRef(null);
  const chatPanelRef = useRef(null);

  const primaryPhone = settings?.phoneNumbers?.[0]?.number || "+918647223625";
  const whatsappNumber = settings?.whatsappNumber || "+917383085084";

  // Persistent storage of chat history
  useEffect(() => {
    sessionStorage.setItem("chat_history", JSON.stringify(messages));
  }, [messages]);

  // Delayed proactive nudge after 15 seconds
  useEffect(() => {
    const hasOpened = sessionStorage.getItem("chatbot_opened");
    if (hasOpened) return;

    const timer = setTimeout(() => {
      setShowNudge(true);
      setUnread(1);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnread(0);
        setShowNudge(false);
        sessionStorage.setItem("chatbot_opened", "true");
      }
      return next;
    });
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    const userMsg = { id: `user-${Date.now()}`, sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulated thinking latency
    setTimeout(() => {
      let botReplyText = "";
      let botReplyType = "text";
      let buttons = [];
      let items = [];
      let suggested = [];

      const query = text.toLowerCase().trim();

      if (query === "find a treatment/service") {
        botReplyText = "🦴 **Our Services & Specialities:**\nAmulya Hospital provides advanced diagnostics, surgeries, and correction therapies under one roof. Please type a condition (e.g. knee pain, disc slip, trauma) or review our major departments:";
        items = services.slice(0, 3);
        botReplyType = "services";
        suggested = ["Meet Our Doctors", "Book Appointment", "FAQs"];
      } else if (query === "meet our doctors") {
        botReplyText = "👨‍⚕️ **Meet Our Specialists:**\nOur clinical team is led by receiving Gold-medal orthopedic surgeon Dr. C. Aravinda Babu and fellowship-trained spine consultant Dr. C. Aditya.";
        items = doctors.slice(0, 3);
        botReplyType = "doctors";
        suggested = ["Book Appointment", "Find a Treatment/Service"];
      } else if (query === "book appointment") {
        botReplyText = "📅 **Online Registration:**\nSelect a specialist and date slot to coordinate a consultation instantly. Click the button below:";
        buttons = [
          { label: "Book Appointment Now", type: "link_internal", value: "/book-appointment" },
          { label: "Call Registration Desk", type: "phone", value: primaryPhone }
        ];
        suggested = ["Meet Our Doctors", "Hospital Location & Hours"];
      } else if (query === "hospital location & hours") {
        botReplyText = "📍 **Location & Schedule:**\nAmulya Hospital is situated on **Guntur Road, Narasaraopet, Palnadu District, AP - 522601**.\n\n- **Casualty & Trauma ICU:** Open 24/7\n- **General OPD Timings:** 10:00 AM – 7:00 PM, Mon-Sat";
        buttons = [
          { label: "Get Directions on Google Maps", type: "link_external", value: "https://www.google.com/maps?daddr=Amulya+Nursing+Home,+Narasaraopet" }
        ];
        suggested = ["Book Appointment", "Meet Our Doctors"];
      } else if (query === "emergency / ambulance") {
        botReplyText = "🚑 **Ambulance & Casualty Triage:**\nOur modular laminar theatres, emergency diagnostic labs, pharmacy, and ICU triage are open 24/7.";
        buttons = [
          { label: "Call Emergency Desk", type: "phone", value: primaryPhone },
          { label: "WhatsApp Desk Coordinator", type: "whatsapp", value: whatsappNumber }
        ];
        suggested = ["Book Appointment", "Hospital Location & Hours"];
      } else if (query === "faqs" || query === "faq") {
        botReplyText = "❓ **Common Questions:**\nSelect a topic below to review rules and benefits:";
        suggested = ["Do you accept Aarogyasri?", "Are you open on Sundays?", "OPD Consultation fee"];
      } else if (query === "do you accept aarogyasri?") {
        botReplyText = "💳 **Cashless Services:**\nYes, we accept **Dr. YSR Aarogyasri**, EHS, WJHS, and private corporate health insurance schemes.";
        buttons = [
          { label: "View Insurance & TPA Guide", type: "link_internal", value: "/patient-care/insurance" }
        ];
        suggested = ["Book Appointment", "Meet Our Doctors"];
      } else if (query === "are you open on sundays?") {
        botReplyText = "📅 **Sunday Schedule:**\nOutpatient consultations are closed on Sundays. However, **Emergency triage, Casualty admissions, and Pharmacy remain open 24/7**.";
        suggested = ["Hospital Location & Hours", "Book Appointment"];
      } else if (query.includes("fee") || query.includes("cost") || query === "opd consultation fee") {
        botReplyText = "💰 **Consultation Fees:**\nOPD registration fees are nominal. Please verify with the front admissions desk on arrival.";
        suggested = ["Book Appointment", "Hospital Location & Hours"];
      } else {
        const matchResult = findIntent(text, services, doctors);
        if (matchResult) {
          botReplyText = matchResult.text;
          botReplyType = matchResult.type;
          buttons = matchResult.buttons || [];
          items = matchResult.items || [];
          suggested = matchResult.suggested || [];
        } else {
          botReplyText = "🔍 I couldn't find a direct match. Please type a specific condition, procedure, doctor name, or coordinate directly with our desk:";
          buttons = [
            { label: "Call Hospital Desk", type: "phone", value: primaryPhone }
          ];
          suggested = ["Find a Treatment/Service", "Meet Our Doctors", "FAQs"];
        }
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: botReplyText,
        type: botReplyType,
        buttons,
        items,
        suggested,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend(inputText);
    }
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. Proactive nudge popover bubble */}
      <AnimatePresence>
        {showNudge && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-6 z-[950] max-w-[240px] bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-white/10 text-xs font-bold leading-normal select-none"
          >
            <button
              onClick={() => { setShowNudge(false); setUnread(0); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border border-white/20 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
            <p>👋 Need help? Chat with our virtual hospital assistant!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating action button */}
      <button
        onClick={toggleChat}
        className="w-12 h-12 rounded-full bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white shadow-lg flex items-center justify-center transition-all duration-200 relative border border-white/10"
        aria-label="Toggle chatbot"
      >
        <MessageSquareText className="w-5.5 h-5.5" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#D81F26] text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-white">
            {unread}
          </span>
        )}
      </button>

      {/* 3. Sliding chatbot panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatPanelRef}
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-20 right-4 z-50 w-[calc(100%-2rem)] max-w-[360px] h-[450px] md:bottom-20 md:right-6 md:w-[380px] md:h-[600px] md:max-h-[85vh] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header lockup */}
            <div className="bg-[#0B3C5D] text-white p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
                  <Sparkles className="w-5 h-5 text-[#B8F7D4]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold font-serif leading-tight">Hospital Assistant</h4>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#24B37A] animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-350">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable messages viewport */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div key={msg.id} className={`flex flex-col space-y-2 ${isBot ? "" : "items-end"}`}>
                    <div className={`flex items-start space-x-2 max-w-[85%] ${isBot ? "" : "flex-row-reverse space-x-reverse"}`}>
                      {/* Avatar */}
                      {isBot && (
                        <div className="w-7 h-7 rounded-full bg-[#1E7FC2] text-white flex items-center justify-center text-[10px] font-bold shadow-inner flex-shrink-0 mt-0.5">
                          A
                        </div>
                      )}
                      {/* Message Bubble */}
                      <div
                        className={`p-3 text-xs leading-relaxed font-medium rounded-2xl ${
                          isBot
                            ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-xs"
                            : "bg-[#D81F26] text-white rounded-tr-none shadow-sm"
                        }`}
                      >
                        <div className="whitespace-pre-line">
                          {parseMessageText(msg.text, closePanel)}
                        </div>
                      </div>
                    </div>

                    {/* Rich Response Types (Carousel service cards) */}
                    {isBot && msg.type === "services" && msg.items && msg.items.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 pl-9 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 snap-x">
                        {msg.items.map((srv) => (
                          <div
                            key={srv.id}
                            className="min-w-[190px] max-w-[200px] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between snap-start flex-shrink-0"
                          >
                            <div className="h-20 overflow-hidden bg-slate-50 dark:bg-slate-850">
                              <img
                                src={srv.thumbnailUrl || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80"}
                                alt={srv.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2.5 flex-grow flex flex-col justify-between space-y-2">
                              <div>
                                <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate">{srv.name}</h5>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2 leading-snug">{srv.shortDescription}</p>
                              </div>
                              <Link
                                to={`/services/${srv.slug}`}
                                onClick={closePanel}
                                className="block text-center bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white text-[9px] font-extrabold py-1.5 rounded-lg transition"
                              >
                                View Page
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rich Response Types (Carousel doctor cards) */}
                    {isBot && msg.type === "doctors" && msg.items && msg.items.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 pl-9 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 snap-x">
                        {msg.items.map((docItem) => (
                          <div
                            key={docItem.id}
                            className="min-w-[190px] max-w-[200px] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between snap-start flex-shrink-0"
                          >
                            <div className="h-20 overflow-hidden bg-slate-50 dark:bg-slate-850">
                              <img
                                src={docItem.photoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"}
                                alt={docItem.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2.5 flex-grow flex flex-col justify-between space-y-2">
                              <div>
                                <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-white truncate">{docItem.name}</h5>
                                <p className="text-[8px] text-[#3FA535] font-extrabold uppercase mt-0.5 tracking-wider truncate">{docItem.designation}</p>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{docItem.qualification}</p>
                              </div>
                              <Link
                                to={`/doctors/${docItem.id}`}
                                onClick={closePanel}
                                className="block text-center border border-[#1E7FC2] text-[#1E7FC2] hover:bg-[#1E7FC2]/5 text-[9px] font-extrabold py-1.5 rounded-lg transition"
                              >
                                View Profile
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rich Response Types (Action buttons) */}
                    {isBot && msg.buttons && msg.buttons.length > 0 && (
                      <div className="flex flex-col space-y-1.5 pl-9 max-w-[85%] w-full">
                        {msg.buttons.map((btn, bIdx) => {
                          if (btn.type === "link_internal") {
                            return (
                              <Link
                                key={bIdx}
                                to={btn.value}
                                onClick={closePanel}
                                className="inline-flex items-center justify-center space-x-1.5 w-full bg-[#1E7FC2] hover:bg-[#0B3C5D] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition"
                              >
                                {btn.label}
                              </Link>
                            );
                          }
                          if (btn.type === "phone") {
                            return (
                              <a
                                key={bIdx}
                                href={`tel:${btn.value}`}
                                className="inline-flex items-center justify-center space-x-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#0B3C5D] dark:text-[#63B3ED] hover:bg-slate-50 text-xs font-bold py-2.5 px-4 rounded-xl transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{btn.label}</span>
                              </a>
                            );
                          }
                          if (btn.type === "whatsapp") {
                            return (
                              <a
                                key={bIdx}
                                href={`https://wa.me/${btn.value.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center space-x-1.5 w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
                              >
                                <span>{btn.label}</span>
                              </a>
                            );
                          }
                          if (btn.type === "quick_reply") {
                            return (
                              <button
                                key={bIdx}
                                onClick={() => handleSend(btn.value)}
                                className="inline-flex items-center justify-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 text-xs font-bold py-2.5 px-4 rounded-xl transition"
                              >
                                {btn.label}
                              </button>
                            );
                          }
                          return (
                            <a
                              key={bIdx}
                              href={btn.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center space-x-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#0B3C5D] dark:text-[#63B3ED] hover:bg-slate-50 text-xs font-bold py-2.5 px-4 rounded-xl transition"
                            >
                              <span>{btn.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Rich Response Types (Context follow-up quick replies) */}
                    {isBot && msg.suggested && msg.suggested.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pl-9 pt-1 max-w-[85%]">
                        {msg.suggested.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSend(sug)}
                            className="bg-[#E7F3FA] dark:bg-slate-850 hover:bg-[#1E7FC2]/15 text-[#1E7FC2] text-[10px] font-extrabold px-3 py-1.5 rounded-full transition"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing indicator animation */}
              {isTyping && (
                <div className="flex items-start space-x-2">
                  <div className="w-7 h-7 rounded-full bg-[#1E7FC2] text-white flex items-center justify-center text-[10px] font-bold shadow-inner flex-shrink-0 mt-0.5">
                    A
                  </div>
                  <TypingIndicator />
                </div>
              )}

              {/* Greeting quick action chips */}
              {messages.length === 1 && (
                <div className="pl-9 pt-2 grid grid-cols-2 gap-2 max-w-[88%] select-none">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => handleSend(action.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-[11px] font-bold text-slate-700 dark:text-slate-350 p-2.5 rounded-xl shadow-xs transition"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input submission cluster */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-850 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about treatments, doctors, hours..."
                className="flex-grow bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-[#1E7FC2] text-slate-850 dark:text-white"
              />
              <button
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-xl bg-[#D81F26] hover:bg-[#B3151B] text-white flex items-center justify-center shadow-md disabled:opacity-40 transition flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chatbot;
