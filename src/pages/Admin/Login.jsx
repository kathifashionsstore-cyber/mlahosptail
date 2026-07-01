import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { Shield, Key, Mail, UserCheck, AlertTriangle } from "lucide-react";
import { withTimeout } from "../../context/AppContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // for registration
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Redirect if already logged in and active admin
  useEffect(() => {
    console.time("Login Auth Check");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.timeLog("Login Auth Check", "onAuthStateChanged fired");
      if (user) {
        try {
          console.time("Login Admin Doc Fetch");
          const adminDocSnap = await withTimeout(getDoc(doc(db, "admins", user.uid)), 1500);
          console.timeEnd("Login Admin Doc Fetch");
          if (adminDocSnap.exists() && adminDocSnap.data().active === true) {
            navigate("/admin");
          } else {
            setError("Your account is not configured as an active administrator.");
            await signOut(auth);
          }
        } catch (err) {
          console.error("Admin verification on mount failed or timed out:", err);
          setError("Failed to verify administrative privileges.");
          await signOut(auth);
        }
      }
      try {
        console.timeEnd("Login Auth Check");
      } catch (e) {}
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Check if any admin exists in the database for bootstrap
  useEffect(() => {
    console.time("Login Bootstrap Check");
    const checkAdmins = async () => {
      try {
        const querySnap = await withTimeout(getDocs(collection(db, "admins"), limit(1)), 1500);
        if (querySnap.empty) {
          // If no admin doc exists in Firestore, allow registration of the first superadmin
          setAllowRegistration(true);
          setIsRegisterMode(true);
        } else {
          setAllowRegistration(false);
          setIsRegisterMode(false);
        }
      } catch (err) {
        console.error("Failed to check admin records:", err);
        // Fail closed: default to normal login mode if rules deny collection-wide queries or if timed out
        setAllowRegistration(false);
        setIsRegisterMode(false);
      } finally {
        try {
          console.timeEnd("Login Bootstrap Check");
        } catch (e) {}
      }
    };
    checkAdmins();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const adminDocRef = doc(db, "admins", user.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      
      if (adminDocSnap.exists() && adminDocSnap.data().active === true) {
        navigate("/admin");
      } else {
        setError("Your account is not configured as an active administrator.");
        await signOut(auth);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid administrative credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }

    try {
      let user;
      try {
        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user = userCredential.user;

        // 2. Write record in 'admins' collection
        await setDoc(doc(db, "admins", user.uid), {
          name,
          email,
          role: "superadmin",
          active: true,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });

        // 3. Navigate to Dashboard
        navigate("/admin");
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          // Gracefully sign in and verify or create the admins document
          const signInCredential = await signInWithEmailAndPassword(auth, email, password);
          user = signInCredential.user;

          const adminDocRef = doc(db, "admins", user.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists() && adminDocSnap.data().active === true) {
            navigate("/admin");
          } else {
            await setDoc(adminDocRef, {
              name: name || adminDocSnap.data()?.name || "Amulya",
              email,
              role: "superadmin",
              active: true,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
            navigate("/admin");
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Registration/Login failed:", err);
      setError(err.message || "Failed to register or authenticate admin account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 py-12 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-8 rounded-3xl shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-850 dark:text-slate-50 font-serif leading-tight">
            {isRegisterMode ? "Setup Admin Account" : "Administrative Access"}
          </h1>
          <p className="text-xs font-semibold text-slate-400">
            {isRegisterMode
              ? "Create the first administrator credential for the website."
              : "Access the Amulya website dashboard and operations panel."}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-xs font-bold text-red-650 dark:text-red-400 rounded-xl flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {allowRegistration && isRegisterMode && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-emerald-700 dark:text-emerald-450 rounded-xl leading-relaxed">
            🚀 **Database Bootstrap**: No administrative account found. Registration is temporarily open to create the first Superadmin.
          </div>
        )}

        {/* Forms */}
        {isRegisterMode ? (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide flex items-center">
                <UserCheck className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Admin Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Administrator"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide flex items-center">
                <Mail className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Admin Email</span>
              </label>
              <input
                type="email"
                placeholder="admin@amulyanursinghome.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide flex items-center">
                <Key className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Security Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold py-3 rounded-xl transition duration-150 text-sm shadow-md disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Admin Account"}
            </button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide flex items-center">
                <Mail className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wide flex items-center">
                <Key className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary text-slate-800 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary text-white font-bold py-3 rounded-xl transition duration-150 text-sm shadow-md disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Log in to Portal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
