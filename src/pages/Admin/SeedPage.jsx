import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { Database, Play, CheckCircle2, ShieldAlert } from "lucide-react";
import { seedDatabase } from "../../firebase/seed";
import { LoadingScreen } from "../../components/LoadingScreen";

export function SeedPage() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const adminDocSnap = await getDoc(doc(db, "admins", currentUser.uid));
          if (adminDocSnap.exists() && adminDocSnap.data().active === true) {
            setUser(currentUser);
          } else {
            navigate("/admin/login");
          }
        } catch (err) {
          console.error("Admin verification on seed route failed:", err);
          navigate("/admin/login");
        }
      } else {
        navigate("/admin/login");
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleRunSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      await seedDatabase(true);
      setSeedResult({ success: true, message: "Database re-seeded successfully with verified logo, branding colors, 8 core treatments, and 6 consulting doctors." });
    } catch (err) {
      console.error("Manual seed run failed:", err);
      setSeedResult({ success: false, message: err.message || "Failed to seed database. Check browser console logs for details." });
    } finally {
      setSeeding(false);
    }
  };

  if (authChecking) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-blue-50 dark:bg-brand-blue-950/30 text-brand-blue dark:text-brand-blue-500 flex items-center justify-center mx-auto shadow-md">
            <Database className="w-6.5 h-6.5" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-850 dark:text-slate-50 font-serif">Database Seeding Utility</h2>
          <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
            Run a full, forced database initialization to seed treatments, services, categories, doctors, and general configurations.
          </p>
        </div>

        {seedResult && (
          <div className={`p-4 rounded-2xl flex items-start space-x-3 text-xs font-bold border ${
            seedResult.success 
              ? "bg-brand-green-50/50 dark:bg-brand-green-950/10 border-brand-green-100 dark:border-brand-green-900/30 text-brand-green-700 dark:text-brand-green-450" 
              : "bg-brand-red-50/50 dark:bg-brand-red-950/10 border-brand-red-100 dark:border-brand-red-900/30 text-brand-red-700 dark:text-brand-red-450"
          }`}>
            {seedResult.success ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-green" />
            ) : (
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-red" />
            )}
            <span className="leading-relaxed">{seedResult.message}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleRunSeed}
            disabled={seeding}
            className="w-full inline-flex items-center justify-center space-x-2 bg-brand-blue hover:bg-brand-blue-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition duration-150 disabled:opacity-50"
          >
            <Play className="w-4.5 h-4.5 fill-current" />
            <span>{seeding ? "Writing Documents..." : "Run Database Seeding"}</span>
          </button>
          
          <button
            onClick={() => navigate("/admin")}
            disabled={seeding}
            className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-205 py-3 transition duration-150"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeedPage;
