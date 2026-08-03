import React, { useState, useEffect } from "react";
import { 
  Bot, Globe, ShieldAlert, Sparkles, Sliders, LayoutDashboard, BarChart3, 
  Activity, FileText, Users2, TrendingUp, ClipboardCheck, HelpCircle, ShieldCheck, Globe2,
  Megaphone, Target, LogOut, UserCheck, Lock, SlidersHorizontal, KeyRound, AlertTriangle, ArrowRight, CreditCard, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_TABS, getAllowedTabsForUser, ActiveTabType, VALID_TABS } from "./lib/rbac";

// Import all workspace sub-modules
import { RoleSelector } from "./components/RoleSelector";
import { AiMarketplace } from "./components/AiMarketplace";
import { SeoBrain } from "./components/SeoBrain";
import { CampaignCommander } from "./components/CampaignCommander";
import { AnalyticsBrain } from "./components/AnalyticsBrain";
import { ExecutionBrain } from "./components/ExecutionBrain";
import { AiStrategist } from "./components/AiStrategist";
import { BusinessMemory } from "./components/BusinessMemory";
import { IntelligenceDiscovery } from "./components/IntelligenceDiscovery";
import { ExecutiveDashboard } from "./components/ExecutiveDashboard";
import { CampaignCreator } from "./components/CampaignCreator";
import { CrmManager } from "./components/CrmManager";
import { CrmConsultant } from "./components/CrmConsultant";
import { ResearchPortal } from "./components/ResearchPortal";
import { DiagnosticTriage } from "./components/DiagnosticTriage";
import { AdsTracker } from "./components/AdsTracker";
import { AiCampaignGenerator } from "./components/AiCampaignGenerator";
import { UserManagementPortal } from "./components/UserManagementPortal";
import { DigitalBusinessCard } from "./components/DigitalBusinessCard";
import { LoginScreen, UserSession } from "./components/LoginScreen";
import { BusinessOnboardingModal, CompanyBusinessProfile } from "./components/BusinessOnboardingModal";

const initialCampaigns = [
  {
    id: "WF-SEO-8A2",
    title: "Q3 High-Intent Luxury SEO Keywords Blitz",
    agent: "SEO Brain",
    agentName: "SBB SEO Brain",
    budgetImpact: 1200,
    approvalRequiredFrom: "Marketing Manager",
    status: "Approved",
    createdAt: "10:15 AM 07/20/2026",
    createdBy: "Miriam Manager Mercer",
    approvedBy: "John CEO Smith (CEO)",
    approvedAt: "10:30 AM 07/20/2026",
    comments: "Approved for immediate organic deployment across GTA region.",
    tactics: [
      { tactic: "Toronto Penthouse Keyword Aggression", status: "Active" },
      { tactic: "GTA Relocation Organic Landing Pages", status: "Active" }
    ]
  },
  {
    id: "WF-SOC-4F1",
    title: "Toronto Waterfront Condo Instagram & Meta Campaign",
    agent: "Social AI",
    agentName: "AI Social Campaign Engine",
    budgetImpact: 850,
    approvalRequiredFrom: "Marketing Manager",
    status: "Pending",
    createdAt: "02:00 PM 07/23/2026",
    createdBy: "Thomas TL Jenkins",
    comments: "Targeting high net worth professionals in Toronto Financial District.",
    tactics: [
      { tactic: "Instagram Reels Carousel Showcase", status: "Pending" }
    ]
  }
];

const initialLeads = [
  {
    id: "LEAD-101",
    name: "Alexander Vance",
    company: "Vance Capital Partners",
    email: "a.vance@vancecapital.ca",
    phone: "+1 (416) 555-0192",
    territory: "Ontario (ON)",
    source: "SEO Organic Search",
    serviceInterest: "Luxury Commercial Real Estate",
    leadScore: 94,
    status: "Qualified",
    leadOwner: "Victoria VP Hastings",
    notes: "Expressed strong interest in Yorkville luxury development."
  },
  {
    id: "LEAD-102",
    name: "Dr. Eleanor Wright",
    company: "Wright Medical Group",
    email: "eleanor.wright@wrightmed.ca",
    phone: "+1 (604) 555-0188",
    territory: "British Columbia (BC)",
    source: "Ad Campaign",
    serviceInterest: "Residential Penthouse Acquisition",
    leadScore: 82,
    status: "Contacted",
    leadOwner: "Miriam Manager Mercer",
    notes: "Scheduled initial discovery consultation for next Tuesday."
  }
];

const initialAudits = [
  {
    id: "LOG-SYS-01",
    timestamp: "09:00 AM 07/20/2026",
    actor: "System Security Engine",
    role: "CEO",
    action: "System Initialized",
    details: "Sovereign Business Brain MarketingOS v1.2 session logged with full PIPEDA & CASL compliance verification."
  }
];

const getTabFromUrl = (): ActiveTabType => {
  const pathname = window.location.pathname.replace(/^\/+/, "").split("/")[0];
  if (VALID_TABS.includes(pathname as ActiveTabType)) {
    return pathname as ActiveTabType;
  }
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (VALID_TABS.includes(hash as ActiveTabType)) {
    return hash as ActiveTabType;
  }
  const searchParam = new URLSearchParams(window.location.search).get("page");
  if (searchParam && VALID_TABS.includes(searchParam as ActiveTabType)) {
    return searchParam as ActiveTabType;
  }
  return "campaign-commander";
};

export default function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem("sbb_auth_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => userSession?.role || "CEO");
  const [userName, setUserName] = useState(() => userSession?.name || "John CEO Smith");
  const [activeTab, setActiveTabState] = useState<ActiveTabType>(getTabFromUrl);

  const allowedTabs = getAllowedTabsForUser(currentRole, userSession?.customAllowedTabs);

  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  useEffect(() => {
    if (userSession) {
      setUserName(userSession.name);
      setCurrentRole(userSession.role);
      // Auto-trigger onboarding modal for first-time login if business requirements not completed
      if (!localStorage.getItem("sbb_onboarding_completed")) {
        setOnboardingModalOpen(true);
      }
    }
  }, [userSession]);

  // Guard activeTab against RBAC permissions
  useEffect(() => {
    if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTabState(allowedTabs[0] as ActiveTabType);
    }
  }, [currentRole, userSession, allowedTabs, activeTab]);

  const setActiveTab = (tab: ActiveTabType) => {
    setActiveTabState(tab);
    const targetPath = `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, "", targetPath);
    }
    const pageTitle = tab
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    document.title = `Sovereign Business Brain - ${pageTitle}`;
  };

  const [discoverySubTab, setDiscoverySubTab] = useState<"memory" | "discovery">("memory");

  const [companyProfile, setCompanyProfile] = useState(() => {
    const saved = localStorage.getItem("sbb_company_profile");
    return saved ? JSON.parse(saved) : {
      companyName: "John and Jan Real Estate Company",
      websiteUrl: "https://johnandjanrealestate.ca",
      sector: "Real Estate",
      description: "Premier luxury residential properties across Toronto and the Greater Toronto Area.",
      countriesServed: "Canada",
      headquarters: "Toronto, Ontario",
      teamSize: "1-10 employees",
      softwareStack: "Salesforce & HubSpot",
      goals: ["Increase Revenue", "Generate Leads", "Improve Customer Retention"],
      adBudget: 3500,
      complianceProfile: "PIPEDA, CASL"
    };
  });

  const [businessReport, setBusinessReport] = useState(() => {
    const saved = localStorage.getItem("sbb_business_report");
    return saved ? JSON.parse(saved) : null;
  });

  const [campaigns, setCampaigns] = useState<any[]>(() => {
    const saved = localStorage.getItem("sovereign_campaigns");
    return saved ? JSON.parse(saved) : initialCampaigns;
  });

  const [leads, setLeads] = useState<any[]>(() => {
    const saved = localStorage.getItem("sovereign_leads");
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem("sovereign_audits");
    return saved ? JSON.parse(saved) : initialAudits;
  });

  const [config, setConfig] = useState({
    language: "EN",
    compliance: { casl: true, pipeda: true, gdpr: true },
    timezone: "Eastern Standard Time (EST)",
    currency: "CAD"
  });

  const [coreStatus, setCoreStatus] = useState({
    online: true,
    hasKey: true,
    message: "Connected to Sovereign Core Engine."
  });

  useEffect(() => {
    const handlePopState = () => {
      const urlTab = getTabFromUrl();
      setActiveTabState(urlTab);
      const pageTitle = urlTab
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      document.title = `Sovereign Business Brain - ${pageTitle}`;
    };

    window.addEventListener("popstate", handlePopState);

    // Sync initial route path
    const initial = getTabFromUrl();
    if (window.location.pathname === "/" || window.location.pathname === "") {
      window.history.replaceState({ tab: initial }, "", `/${initial}`);
    }
    const pageTitle = initial
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    document.title = `Sovereign Business Brain - ${pageTitle}`;

    fetch("/api/health")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCoreStatus({
          online: true,
          hasKey: data.hasGeminiKey ?? true,
          message: data.message || "Connected to Sovereign Core Engine."
        });
      })
      .catch((err) => {
        console.warn("Core server health check notice:", err);
      });

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const saveCampaigns = (updated: any[]) => {
    setCampaigns(updated);
    localStorage.setItem("sovereign_campaigns", JSON.stringify(updated));
  };

  const saveLeads = (updated: any[]) => {
    setLeads(updated);
    localStorage.setItem("sovereign_leads", JSON.stringify(updated));
  };

  const saveAudits = (updated: any[]) => {
    setAuditLogs(updated);
    localStorage.setItem("sovereign_audits", JSON.stringify(updated));
  };

  const logAction = (action: string, details: string) => {
    const logEntry = {
      id: "LOG-" + Math.random().toString(36).substring(2, 6).toUpperCase(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("en-US"),
      actor: userName,
      role: currentRole,
      action,
      details
    };
    saveAudits([...auditLogs, logEntry]);
  };

  const handleCreateCampaignRequest = (req: any) => {
    const newCamp = {
      ...req,
      id: "WF-" + req.agent + "-" + Math.random().toString(36).substring(2, 5).toUpperCase(),
      createdAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " " + new Date().toLocaleDateString("en-US"),
      status: "Pending",
      createdBy: userName
    };
    saveCampaigns([...campaigns, newCamp]);
    logAction("Created campaign request", `Initiated '${newCamp.title}' requiring signoff from ${newCamp.approvalRequiredFrom}.`);
    setActiveTab("campaign-commander");
  };

  const handleApproveCampaign = (id: string, comments?: string) => {
    const updated = campaigns.map((c) => c.id === id ? {
      ...c,
      status: "Approved",
      approvedBy: `${userName} (${currentRole})`,
      approvedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      comments: comments || "Budget verified & approved for tactical launch."
    } : c);
    saveCampaigns(updated);
    const target = campaigns.find((c) => c.id === id);
    logAction("Approved Campaign Workflow", `Authorized '${target?.title}' ($${target?.budgetImpact} CAD). Remarks: "${comments || "None"}"`);
  };

  const handleRejectCampaign = (id: string, comments?: string) => {
    const updated = campaigns.map((c) => c.id === id ? {
      ...c,
      status: "Rejected",
      approvedBy: `${userName} (${currentRole})`,
      approvedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      comments: comments || "Campaign request declined by authority."
    } : c);
    saveCampaigns(updated);
    const target = campaigns.find((c) => c.id === id);
    logAction("Rejected Campaign Workflow", `Declined '${target?.title}'. Remarks: "${comments || "None"}"`);
  };

  const handleOverrideCampaign = (id: string, nextStatus: string, reason: string) => {
    const updated = campaigns.map((c) => c.id === id ? {
      ...c,
      status: nextStatus === "Approved" ? "Approved" : "Rejected",
      approvedBy: `CEO Override: ${userName}`,
      approvedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      comments: reason || "CEO Overrode initial decision or authority constraints."
    } : c);
    saveCampaigns(updated);
    const target = campaigns.find((c) => c.id === id);
    logAction("CEO Absolute Override", `Overrode '${target?.title}' status to ${nextStatus.toUpperCase()}. Reason: "${reason}"`);
  };

  const handleAddLead = (lead: any) => {
    saveLeads([...leads, lead]);
    logAction("Captured Customer Lead", `Sovereign router captured ${lead.name} (${lead.territory}), scored at ${lead.leadScore}/100 and routed to ${lead.leadOwner}.`);
  };

  const handleUpdateLead = (updatedLead: any) => {
    const updated = leads.map((l) => l.id === updatedLead.id ? updatedLead : l);
    saveLeads(updated);
  };

  const handleUpdateLeadStatus = (id: string, nextStatus: string) => {
    const updated = leads.map((l) => l.id === id ? { ...l, status: nextStatus } : l);
    saveLeads(updated);
    const target = leads.find((l) => l.id === id);
    logAction("Updated Lead Status", `Changed lead ${target?.name} status to ${nextStatus.toUpperCase()}.`);
  };

  const toggleLanguage = () => {
    setConfig((prev) => ({ ...prev, language: prev.language === "EN" ? "FR" : "EN" }));
  };

  const t = (enText: string, frText: string) => config.language === "EN" ? enText : frText;

  const handleLogout = () => {
    logAction("User Signed Out", `Operator ${userName} (${currentRole}) signed out from sovereignbusinessbrain.com.`);
    localStorage.removeItem("sbb_auth_session");
    setUserSession(null);
  };

  // If user is not authenticated, display login & registration screen
  if (!userSession) {
    return (
      <LoginScreen
        companyName={companyProfile.companyName}
        onLoginSuccess={(session) => {
          setUserSession(session);
          setUserName(session.name);
          setCurrentRole(session.role);
          if (session.companyName) {
            setCompanyProfile((prev: any) => ({ ...prev, companyName: session.companyName! }));
          }
          setOnboardingModalOpen(true);
          logAction("User Authenticated", `Operator ${session.name} logged in as ${session.role} on sovereignbusinessbrain.com.`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-200">
      {/* Compliance & Auth Top Banner */}
      <div id="compliance-top-banner" className="bg-slate-900 text-white py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono font-medium">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t("CANADIAN DATA RESIDENCY ENFORCED", "RÉSIDENCE DES DONNÉES CANADIENNES APPLIQUÉE")}</span>
            <span className="text-slate-500">|</span>
            <span>PIPEDA & CASL {t("ACTIVE AUDIT", "AUDIT ACTIF")}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnboardingModalOpen(true)}
              className="flex items-center gap-1.5 bg-purple-900/80 hover:bg-purple-800 text-purple-200 px-2.5 py-1 rounded border border-purple-700/60 transition-all cursor-pointer font-bold text-[11px]"
              title="SBB Business Requirements & AI Knowledge Base Setup"
            >
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Business Profile & Goals</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <div className="flex items-center gap-2 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">{userSession.name}</span>
              <span className="text-amber-300 font-bold bg-amber-950/60 text-[10px] px-1.5 py-0.5 rounded border border-amber-800/50">
                {userSession.role}
              </span>
            </div>

            <button
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded border border-slate-700 transition-all cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{config.language === "EN" ? "FRANÇAIS" : "ENGLISH"}</span>
            </button>

            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white px-2.5 py-1 rounded border border-rose-800/60 transition-all cursor-pointer font-bold"
              title="Sign Out from sovereignbusinessbrain.com"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Main Header */}
        <header id="main-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-900 text-white font-black text-xs font-mono tracking-widest">
                SOVEREIGN
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                MarketingOS v1.2
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 font-sans flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{companyProfile.companyName}</span>
              <span className="text-slate-300 font-light hidden sm:inline">|</span>
              <span className="text-slate-500 text-lg font-medium">
                {t("SBB MarketingOS", "SBB Système de Marketing")}
              </span>
            </h1>

            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase">
                {companyProfile.sector}
              </span>
              <span>•</span>
              <span>
                {t(
                  "Unified Enterprise Copilot, CRM Scoring router, research compiler, and RBAC signing queue.",
                  "Copilote d'entreprise unifié, routeur de scoring CRM, compilateur de recherche et file d'attente de signature RBAC."
                )}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3.5 py-2">
            <span className={`w-2.5 h-2.5 rounded-full ${coreStatus.online ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
            <div className="text-[11px] font-mono leading-none">
              <span className="block font-bold text-slate-700">
                {coreStatus.online ? "SOVEREIGN CORE ONLINE" : "SOVEREIGN CORE OFFLINE"}
              </span>
              <span className="text-[9px] text-slate-400 block mt-1 leading-snug max-w-xs">
                {coreStatus.message}
              </span>
            </div>
          </div>
        </header>

        {/* Role Selector */}
        <RoleSelector
          currentRole={currentRole}
          authenticatedRole={userSession?.role || currentRole}
          userName={userName}
          onChangeRole={(role) => {
            setCurrentRole(role);
            const defaultName = role === "CEO" ? "John CEO Smith" :
              role === "Vice President" ? "Victoria VP Hastings" :
              role === "AGM" ? "Albert AGM Vance" :
              role === "Marketing Manager" ? "Miriam Manager Mercer" :
              role === "Team Lead" ? "Thomas TL Jenkins" : "Edward Exec Jones";
            setUserName(defaultName);
            logAction("Session Role Switched", `User session assigned to security clearance tier: ${role}.`);
          }}
          onChangeName={(name) => setUserName(name)}
        />

        {/* Workspace Navigation Tabs - Filtered by RBAC Role Security Clearance */}
        <div className="bg-slate-900 text-white text-[11px] px-4 py-2 rounded-t-xl flex items-center justify-between border-b border-slate-800 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-200">Position Clearance:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              currentRole === "Admin" ? "bg-purple-900/80 text-purple-200 border border-purple-500/50" :
              currentRole === "CEO" ? "bg-amber-900/80 text-amber-200 border border-amber-500/50" :
              currentRole === "Vice President" ? "bg-indigo-900/80 text-indigo-200 border border-indigo-500/50" :
              currentRole === "AGM" ? "bg-sky-900/80 text-sky-200 border border-sky-500/50" :
              currentRole === "Marketing Manager" ? "bg-blue-900/80 text-blue-200 border border-blue-500/50" :
              currentRole === "Team Lead" ? "bg-teal-900/80 text-teal-200 border border-teal-500/50" :
              "bg-slate-800 text-slate-300 border border-slate-700"
            }`}>
              {currentRole}
            </span>
            <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">
              ({allowedTabs.length} of {ALL_TABS.length} Workspace Modules Clearance)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 hidden md:inline">
              Logins & Roles: <strong className="text-slate-200">{userName}</strong>
            </span>
            {currentRole === "Admin" && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                Full RBAC Override Active
              </span>
            )}
          </div>
        </div>

        <nav id="workspace-tabs" className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar pb-1 gap-1 bg-white px-2">
          {ALL_TABS.filter((tab) => allowedTabs.includes(tab.id)).map((tab) => {
            const IconComponent = {
              ShieldCheck, CreditCard, Bot, Globe, ShieldAlert, Target, Megaphone, Sparkles, Sliders, LayoutDashboard, BarChart3, Activity, FileText, Users2, TrendingUp, ClipboardCheck, HelpCircle
            }[tab.iconName] || Activity;

            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id as ActiveTabType)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-sans font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "border-indigo-600 text-slate-900 font-bold bg-indigo-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{t(tab.labelEN, tab.labelFR)}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono ${tab.badgeColor}`}>
                  {tab.badgeText}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Workspace Main Content View */}
        <main id="workspace-main-content">
          <AnimatePresence mode="wait">
            {activeTab === "user-management" && (
              <motion.div key="user-management-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <UserManagementPortal
                  currentRole={currentRole}
                  currentUserName={userName}
                  onSwitchUserSession={(name, role, customTabs) => {
                    setUserName(name);
                    setCurrentRole(role);
                    const newSession: UserSession = {
                      id: "USR-" + Math.floor(100 + Math.random() * 900),
                      name,
                      email: name.toLowerCase().replace(/\s+/g, ".") + "@sovereignbusiness.ca",
                      role: role as any,
                      department: "Enterprise Operations",
                      loggedInAt: "Just now",
                      customAllowedTabs: customTabs
                    };
                    setUserSession(newSession);
                    localStorage.setItem("sbb_auth_session", JSON.stringify(newSession));

                    const newAllowed = getAllowedTabsForUser(role, customTabs);
                    if (newAllowed.length > 0 && !newAllowed.includes(activeTab)) {
                      setActiveTab(newAllowed[0] as ActiveTabType);
                    }
                    logAction("User Session Changed", `Switched active user session to ${name} (${role}).`);
                  }}
                  onLogAction={logAction}
                />
              </motion.div>
            )}

            {activeTab === "digital-card" && (
              <motion.div key="digital-card-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <DigitalBusinessCard
                  currentRole={currentRole}
                  currentUserName={userName}
                  onLogAction={logAction}
                />
              </motion.div>
            )}

            {activeTab === "marketplace" && (
              <motion.div key="marketplace-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <AiMarketplace companyProfile={companyProfile} onLogAction={logAction} />
              </motion.div>
            )}

            {activeTab === "seo" && (
              <motion.div key="seo-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <SeoBrain companyProfile={companyProfile} onLogAction={logAction} />
              </motion.div>
            )}

            {activeTab === "campaign-commander" && (
              <motion.div key="campaign-commander-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <CampaignCommander
                  companyProfile={companyProfile}
                  campaigns={campaigns}
                  currentRole={currentRole}
                  userName={userName}
                  onLogAction={logAction}
                  handleCreateCampaignRequest={handleCreateCampaignRequest}
                  handleApproveCampaign={handleApproveCampaign}
                  handleRejectCampaign={handleRejectCampaign}
                  handleOverrideCampaign={handleOverrideCampaign}
                />
              </motion.div>
            )}

            {activeTab === "ads-tracker" && (
              <motion.div key="ads-tracker-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <AdsTracker companyProfile={companyProfile} userRole={currentRole} />
              </motion.div>
            )}

            {activeTab === "campaign-generator" && (
              <motion.div key="campaign-generator-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <AiCampaignGenerator
                  companyProfile={companyProfile}
                  userRole={currentRole}
                  onPushToCommander={handleCreateCampaignRequest}
                />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div key="analytics-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <AnalyticsBrain
                  companyProfile={companyProfile}
                  leads={leads}
                  campaigns={campaigns}
                  onLogAction={logAction}
                  onNavigateToTab={(tab) => setActiveTab(tab as any)}
                />
              </motion.div>
            )}

            {activeTab === "execution" && (
              <motion.div key="execution-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <ExecutionBrain
                  companyProfile={companyProfile}
                  campaigns={campaigns}
                  onLogAction={logAction}
                  currentRole={currentRole}
                  userName={userName}
                />
              </motion.div>
            )}

            {activeTab === "marketing-strategist" && (
              <motion.div key="marketing-strategist-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <AiStrategist
                  campaigns={campaigns}
                  onCreateCampaign={handleCreateCampaignRequest}
                  onLogAction={logAction}
                  currentRole={currentRole}
                  userName={userName}
                />
              </motion.div>
            )}

            {activeTab === "discovery" && (
              <motion.div key="discovery-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-6">
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setDiscoverySubTab("memory")}
                    className={`py-3 px-6 text-sm font-sans font-bold border-b-2 transition-all cursor-pointer ${
                      discoverySubTab === "memory" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🧠 SBB Business Memory System
                  </button>
                  <button
                    onClick={() => setDiscoverySubTab("discovery")}
                    className={`py-3 px-6 text-sm font-sans font-bold border-b-2 transition-all cursor-pointer ${
                      discoverySubTab === "discovery" ? "border-emerald-600 text-emerald-700 font-black" : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🏢 Company Profile & Intelligence Discovery
                  </button>
                </div>

                {discoverySubTab === "memory" ? (
                  <BusinessMemory onLogAction={logAction} />
                ) : (
                  <IntelligenceDiscovery
                    companyProfile={companyProfile}
                    businessReport={businessReport}
                    onUpdateProfile={(updatedProfile, updatedReport) => {
                      setCompanyProfile(updatedProfile);
                      setBusinessReport(updatedReport);
                      localStorage.setItem("sbb_company_profile", JSON.stringify(updatedProfile));
                      if (updatedReport) {
                        localStorage.setItem("sbb_business_report", JSON.stringify(updatedReport));
                      } else {
                        localStorage.removeItem("sbb_business_report");
                      }
                    }}
                    onLogAction={logAction}
                  />
                )}
              </motion.div>
            )}

            {activeTab === "dashboard" && (
              <motion.div key="dashboard-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <ExecutiveDashboard
                  requests={campaigns}
                  leads={leads}
                  auditLogs={auditLogs}
                  currentRole={currentRole}
                  userName={userName}
                />
              </motion.div>
            )}

            {activeTab === "social" && (
              <motion.div key="social-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <CampaignCreator
                  userName={userName}
                  currentRole={currentRole}
                  onLogAction={logAction}
                  companyProfile={companyProfile}
                />
              </motion.div>
            )}

            {activeTab === "crm" && (
              <motion.div key="crm-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <CrmManager
                  leads={leads}
                  onAddLead={handleAddLead}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onUpdateLead={handleUpdateLead}
                  onLogAction={logAction}
                  currentRole={currentRole}
                  userName={userName}
                  companyProfile={companyProfile}
                />
              </motion.div>
            )}

            {activeTab === "advisor" && (
              <motion.div key="advisor-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <CrmConsultant userName={userName} />
              </motion.div>
            )}

            {activeTab === "research" && (
              <motion.div key="research-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <ResearchPortal currentProvince="Ontario (ON)" companyProfile={companyProfile} />
              </motion.div>
            )}

            {activeTab === "troubleshoot" && (
              <motion.div key="troubleshoot-tab" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                <DiagnosticTriage />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Main Footer */}
      <footer id="main-footer" className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center mt-20 text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>Sovereign Business Brain MarketingOS © 2026. All corporate systems logged and secured.</p>
          <p className="text-[10px] text-slate-600">CASL Consent registry: #CASL-EST-2026 | PIPEDA Data Residency standard certified.</p>
        </div>
      </footer>

      {/* SBB First-Time Onboarding & Business Requirements Modal */}
      <BusinessOnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        companyProfile={companyProfile}
        onSaveProfile={(updatedProfile) => {
          setCompanyProfile(updatedProfile);
          localStorage.setItem("sbb_company_profile", JSON.stringify(updatedProfile));
        }}
        onLogAction={logAction}
        isFirstTime={!localStorage.getItem("sbb_onboarding_completed")}
      />
    </div>
  );
}
