import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, Activity, ShieldAlert, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function SearchOverlay({ isOpen, onClose }) {
  const { searchIndex } = useApp();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const filteredResults =
    query.trim() === ""
      ? []
      : searchIndex.filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.details.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase())
        );

  const getIcon = (type) => {
    switch (type) {
      case "Doctor":
        return <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      case "Treatment":
        return <Activity className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case "Service":
        return <ShieldAlert className="w-5 h-5 text-green-500 dark:text-green-400" />;
      default:
        return <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
    }
  };

  const handleSelectResult = (link) => {
    navigate(link);
    setQuery("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex justify-center items-start pt-20 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-6 h-6 text-slate-400 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search conditions, doctors, or services..."
                value={query}
                onChange={handleSearch}
                className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-lg py-1 focus:ring-0 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition duration-200"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {query.trim() === "" ? (
                <div className="text-center py-8 text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Search Amulya Nursing Home repository</p>
                  <p className="text-xs text-slate-500 mt-1">Search doctors, clinical conditions, services, and facilities</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectResult(result.link)}
                      className="w-full text-left flex items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-150 border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                    >
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mr-3 flex-shrink-0">
                        {getIcon(result.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {result.type}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100 text-base">{result.name}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{result.details}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto shadow-inner text-slate-450">
                    <ShieldAlert className="w-5 h-5 stroke-[1.5px]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">No matches found for "{query}"</p>
                    <p className="text-xs text-slate-500 mt-1">Verify spelling or try searching for "knee", "spine", "Aravinda", or "X-Ray"</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SearchOverlay;
