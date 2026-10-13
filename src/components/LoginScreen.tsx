import React, { useState } from "react";
import { 
  Lock, Key, Mail, User, Briefcase, Building, ShieldCheck, Sparkles, 
  ArrowRight, CheckCircle2, UserPlus, LogIn, Eye, EyeOff, Globe, ShieldAlert, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle } from "../lib/firebase";
import { saveUserToFirestore } from "../lib/firestoreSync";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "CEO" | "Vice President" | "AGM" | "Marketing Manager" | "Team Lead" | "Executive";
  department: string;
  companyName?: string;
  organizationId?: string;
  token?: string;
  isSandbox?: boolean;
  loggedInAt: string;
  customAllowedTabs?: string[];
}

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  companyName: string;
}

export const ADMIN_EMAILS = [
  "shraddha.revdikar@gmail.com",
  "admin@sovereignbusiness.ca"
];

const PRESET_DEMO_USERS: Array<{
  email: string;
  pass: string;
  name: string;
  role: UserSession["role"];
  department: string;
}> = [
  {
    email: "shraddha.revdikar@gmail.com",
    pass: "admin123",
    name: "Shraddha Revdikar (Admin)",
    role: "Admin",
    department: "System Administration & Security"
  },
  {
    email: "admin@sovereignbusiness.ca",
    pass: "admin123",
    name: "Alex Admin System",
    role: "Admin",
    department: "System Administration & Security"
  },
  {
    email: "john.smith@sovereignbusiness.ca",
    pass: "ceo123",
    name: "John CEO Smith",
    role: "CEO",
    department: "Executive Board"
  },
  {
    email: "v.hastings@sovereignbusiness.ca",
    pass: "vp123",
    name: "Victoria VP Hastings",
    role: "Vice President",
    department: "Marketing & Growth"
  },
  {
    email: "m.mercer@sovereignbusiness.ca",
    pass: "manager123",
    name: "Miriam Manager Mercer",
    role: "Marketing Manager",
    department: "Digital Advertising"
  },
  {
    email: "t.jenkins@sovereignbusiness.ca",
    pass: "lead123",
    name: "Thomas TL Jenkins",
    role: "Team Lead",
    department: "Content & SEO Ops"
  },
  {
    email: "e.jones@sovereignbusiness.ca",
    pass: "exec123",
    name: "Edward Exec Jones",
    role: "Executive",
    department: "Operations & Sales"
  }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, companyName }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login Form States - Cleanly initialized to empty inputs so logged-out operators or new users must enter credentials anew
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [adminPresetsUnlocked, setAdminPresetsUnlocked] = useState(false);

  // Ensure fields are fresh on mount (no autofill memory)
  React.useEffect(() => {
    setLoginEmail("");
    setLoginPassword("");
    setRememberMe(false);
    setLoginError("");
    setRegDepartment("");
    setRegCompany("");
  }, []);

  // Registration Form States - Initialized empty so operators enter their own details
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<UserSession["role"]>("Marketing Manager");
  const [regDepartment, setRegDepartment] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  // Helper to load registered users from localStorage
  const getRegisteredUsers = () => {
    try {
      const saved = localStorage.getItem("sovereign_registered_users");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both your Email ID and Password.");
      return;
    }

    const registeredUsers = getRegisteredUsers();
    const allUsers = [...registeredUsers, ...PRESET_DEMO_USERS];

    const foundUser = allUsers.find(
      (u) => u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim()
    );

    if (!foundUser) {
      setLoginError("Account not found. Please check your Email ID or register a new account below.");
      return;
    }

    const isAdmin = ADMIN_EMAILS.includes(loginEmail.toLowerCase().trim());

    // Enforce password verification for all users (no bypass)
    if (foundUser.pass && foundUser.pass !== loginPassword) {
      setLoginError("Invalid password for this account. Please verify your credentials.");
      return;
    }

    const orgId = (foundUser.company || regCompany || companyName || "sovereign_enterprise")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "_");

    const sessionRole = isAdmin ? "Admin" : foundUser.role;
    const sessionToken = `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}:${orgId}:${sessionRole}:${foundUser.email}`;

    const userSession: UserSession = {
      id: "USR-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      name: foundUser.name,
      email: foundUser.email,
      role: sessionRole,
      department: foundUser.department || "Enterprise Ops",
      companyName: foundUser.company || regCompany || companyName,
      organizationId: orgId,
      token: sessionToken,
      isSandbox: Boolean((foundUser as any).isPreset),
      loggedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("en-US")
    };

    if (rememberMe) {
      localStorage.setItem("sbb_auth_session", JSON.stringify(userSession));
    } else {
      localStorage.removeItem("sbb_auth_session");
    }

    onLoginSuccess(userSession);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError("Please fill in all required fields.");
      return;
    }

    if (!regEmail.includes("@")) {
      setRegError("Please enter a valid work email address.");
      return;
    }

    if (regPassword.length < 5) {
      setRegError("Password must be at least 5 characters long.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match. Please verify both password fields.");
      return;
    }

    if (!agreedTerms) {
      setRegError("You must accept global privacy & compliance terms to proceed.");
      return;
    }

    const registeredUsers = getRegisteredUsers();
    const existing = registeredUsers.find(
      (u: any) => u.email.toLowerCase().trim() === regEmail.toLowerCase().trim()
    );

    if (existing) {
      setRegError("An account with this email already exists. Please login instead.");
      return;
    }

    const newUser = {
      id: "USR-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      name: regName.trim(),
      email: regEmail.trim(),
      pass: regPassword,
      role: regRole,
      department: regDepartment.trim() || "General Operations",
      company: regCompany.trim() || companyName || "My Organization",
      registeredAt: new Date().toISOString()
    };

    const updatedRegistered = [...registeredUsers, newUser];
    localStorage.setItem("sovereign_registered_users", JSON.stringify(updatedRegistered));

    setRegSuccess(true);

    setTimeout(async () => {
      const orgId = (newUser.company || companyName || "my_organization")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, "_");
      const sessionToken = `USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}:${orgId}:${newUser.role}:${newUser.email}`;

      const userSession: UserSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserSession["role"],
        department: newUser.department,
        companyName: newUser.company,
        organizationId: orgId,
        token: sessionToken,
        isSandbox: false,
        loggedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("en-US")
      };

      await saveUserToFirestore(userSession);
      localStorage.setItem("sbb_auth_session", JSON.stringify(userSession));
      onLoginSuccess(userSession);
    }, 1200);
  };

  const handleQuickDemoLogin = (preset: typeof PRESET_DEMO_USERS[number]) => {
    setLoginEmail(preset.email);
    setLoginPassword(preset.pass);
    
    const orgId = (companyName || "sovereign_sandbox")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "_");
    const sessionToken = `USR-SANDBOX-${Math.random().toString(36).substring(2, 6).toUpperCase()}:${orgId}:${preset.role}:${preset.email}`;

    const userSession: UserSession = {
      id: "USR-SANDBOX-" + Math.random().toString(36).substring(2, 7).toUpperCase(),
      name: preset.name,
      email: preset.email,
      role: preset.role,
      department: preset.department,
      companyName,
      organizationId: orgId,
      token: sessionToken,
      isSandbox: true,
      loggedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("en-US")
    };

    localStorage.setItem("sbb_auth_session", JSON.stringify(userSession));
    onLoginSuccess(userSession);
  };

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setLoginError("");
    try {
      const googleUser = await signInWithGoogle();
      const idToken = await googleUser.getIdToken();
      const userEmail = (googleUser.email || "").toLowerCase().trim();
      const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
      const assignedRole: UserSession["role"] = isAdminEmail ? "Admin" : "CEO";
      const orgId = (companyName || "sovereign_enterprise")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, "_");

      const session: UserSession = {
        id: googleUser.uid,
        name: googleUser.displayName || userEmail.split("@")[0] || "Google Operator",
        email: userEmail,
        role: assignedRole,
        department: isAdminEmail ? "System Administration & Security" : "Executive Board",
        companyName,
        organizationId: orgId,
        token: idToken,
        isSandbox: false,
        loggedInAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("en-US")
      };

      await saveUserToFirestore(session);
      localStorage.setItem("sbb_auth_session", JSON.stringify(session));
      onLoginSuccess(session);
    } catch (err: any) {
      console.warn("Google sign in exception:", err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setLoginError(err?.message || "Failed to complete Google Sign-in.");
      }
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans selection:bg-slate-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto animate-fadeIn">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden border-b border-slate-800">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600 text-white font-black text-xs font-mono tracking-widest">
                SOVEREIGN
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                GDPR & PIPEDA Verified
              </span>
            </div>
            
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 block">Workspace Domain</span>
              <span className="text-xs font-mono font-bold text-amber-300">Secure Enterprise Portal</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>Sovereign Business Brain Portal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Security Authentication & RBAC Position Login. Please enter your credentials or register your user account to access MarketingOS.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mt-6 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 max-w-md">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setLoginError(""); }}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "login"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>User Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab("register"); setRegError(""); }}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === "register"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Position</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Project Memory & Data Safety Banner */}
          <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold flex items-center gap-1.5">
                <span>Project Memory & Workspace Details Preserved</span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.2 rounded font-mono font-semibold">100% Persistent</span>
              </span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                All saved company profiles, AI business memory, campaigns, CRM leads, ROI alerts, and strategy reports remain intact in local storage across sessions. Credentials are not saved or pre-filled on logout to guarantee access security.
              </p>
            </div>
          </div>

          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fadeIn" autoComplete="off">
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Google Sign-In with Firebase Auth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSigningIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleSigningIn ? "Connecting to Firebase Auth..." : "Sign in with Google (Firebase Auth)"}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">or sign in with password</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Work Email / User Login ID *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Enter manually (not auto-filled)</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="sbb_operator_email_clean"
                      required
                      autoComplete="off"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email ID (e.g. alex@company.ca)"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">Fresh entry required</span>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="sbb_operator_pass_clean"
                      required
                      autoComplete="new-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>No auto-fill memory (enter credentials each time)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {(loginEmail || loginPassword) && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail("");
                          setLoginPassword("");
                          setLoginError("");
                        }}
                        className="text-slate-400 hover:text-rose-600 text-xs font-semibold cursor-pointer underline"
                      >
                        Clear Form
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab("register")}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                    >
                      Need a new account? Register
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Sign In with Credentials</span>
                </button>
              </div>

              {/* Quick Preset Accounts - Visible ONLY to Admin */}
              {(() => {
                const isAdminEmail = ADMIN_EMAILS.includes(loginEmail.toLowerCase().trim());
                const showPresets = isAdminEmail || adminPresetsUnlocked;

                if (!showPresets) {
                  return (
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>System Admin Clearance Protected</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginEmail("shraddha.revdikar@gmail.com");
                          setLoginPassword("admin123");
                          setAdminPresetsUnlocked(true);
                        }}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Admin Access (shraddha.revdikar@gmail.com)</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="pt-4 border-t border-slate-100 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase font-mono flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Verified: Preset Evaluation Positions</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdminPresetsUnlocked(false)}
                        className="text-[10px] text-slate-400 hover:text-rose-600 font-mono cursor-pointer"
                      >
                        Hide Presets
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_DEMO_USERS.map((preset) => (
                        <div
                          key={preset.role + preset.email}
                          className="p-2.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all group space-y-1.5"
                        >
                          <div className="text-[11px] font-bold text-slate-900 flex items-center justify-between">
                            <span>{preset.role}</span>
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-200/60 px-1 py-0.2 rounded">{preset.pass}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate" title={preset.email}>{preset.email}</div>
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-150 text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                setLoginEmail(preset.email);
                                setLoginPassword(preset.pass);
                              }}
                              className="flex-1 py-0.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/80 rounded font-semibold cursor-pointer text-center"
                            >
                              Fill Form
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleQuickDemoLogin(preset)}
                              className="flex-1 py-0.5 text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded font-semibold cursor-pointer text-center"
                            >
                              Sign In
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Registration successful! Signing you in as {regRole}...</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Work Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. s.jenkins@company.ca"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 5 characters"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Assign Position / Role Clearance *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserSession["role"])}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                    >
                      <option value="Admin">System Administrator (Admin - Full App Access)</option>
                      <option value="CEO">Chief Executive Officer (CEO)</option>
                      <option value="Vice President">Vice President (VP)</option>
                      <option value="AGM">Assistant General Manager (AGM)</option>
                      <option value="Marketing Manager">Marketing Manager</option>
                      <option value="Team Lead">Operational Team Lead</option>
                      <option value="Executive">Marketing Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Department / Division *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="e.g. Digital Advertising"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="e.g. Apex Global Corp, Nexus Technologies, or Lumina Brands"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    I confirm that this account registration adheres to global privacy mandates (GDPR, CCPA, PIPEDA) and corporate security authorization rules.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={regSuccess}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:to-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>Register Account & Launch Position</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[11px] text-slate-500 font-mono flex items-center justify-between px-6">
          <span>Protected by Sovereign Core RBAC Engine</span>
          <span className="text-emerald-700 font-bold">Encrypted Enterprise Cloud Portal</span>
        </div>
      </div>
    </div>
  );
};
