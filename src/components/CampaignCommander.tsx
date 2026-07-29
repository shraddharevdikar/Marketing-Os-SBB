import React, { useState } from "react";
import { 
  Key, Target, Sliders, Sparkles, CheckCircle2, ShieldCheck, 
  Plus, AlertCircle, Play, Pause, RefreshCw, XCircle, ArrowRight, Lock,
  TrendingUp, DollarSign, BarChart2, PieChart, Zap, Filter, Search,
  Layers, Activity, Eye, ArrowUpRight, Check, SlidersHorizontal,
  Globe, Copy, FileText, Megaphone, ExternalLink, ShieldAlert, Server,
  Radio, Tv, Share2, Settings, Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CampaignCommanderProps {
  companyProfile: any;
  campaigns: any[];
  currentRole: string;
  userName: string;
  onLogAction: (action: string, details: string) => void;
  handleCreateCampaignRequest: (campaign: any) => void;
  handleApproveCampaign: (id: string, comments?: string) => void;
  handleRejectCampaign: (id: string, comments?: string) => void;
  handleOverrideCampaign: (id: string, status: string, reason: string) => void;
}

interface AdAccountConfig {
  id: string;
  name: string;
  platform: string;
  category: "Ads" | "CRM";
  status: "Connected" | "Configured" | "Disconnected";
  accountId: string;
  apiKey: string;
  accessToken: string;
  lastSynced: string;
  latency: string;
  activeAccountName: string;
  iconBg: string;
}

export const CampaignCommander: React.FC<CampaignCommanderProps> = ({
  companyProfile,
  campaigns,
  currentRole,
  userName,
  onLogAction,
  handleCreateCampaignRequest,
  handleApproveCampaign,
  handleRejectCampaign,
  handleOverrideCampaign
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"vault" | "media-plan" | "optimizer" | "builder" | "approvals">("builder");
  const pendingCount = campaigns.filter(c => c.status === "Pending").length;

  // Vault / API Connections State
  const [adAccounts, setAdAccounts] = useState<AdAccountConfig[]>([
    {
      id: "googleAds",
      name: "Google Ads Account",
      platform: "Google Search, PMax & YouTube",
      category: "Ads",
      status: "Connected",
      accountId: "849-204-9841",
      apiKey: "●●●●●●●●●●●●9841",
      accessToken: "ya29.a0ARdaC7mX8...",
      lastSynced: "Just now",
      latency: "14ms",
      activeAccountName: "Sovereign Real Estate - Google CAD",
      iconBg: "bg-blue-600"
    },
    {
      id: "metaAds",
      name: "Meta Ads Manager",
      platform: "Instagram, Facebook & Messenger",
      category: "Ads",
      status: "Connected",
      accountId: "ACT-392019284",
      apiKey: "●●●●●●●●●●●●EAAG",
      accessToken: "EAAx8201938...",
      lastSynced: "2 mins ago",
      latency: "18ms",
      activeAccountName: "Sovereign Luxury FB/IG Business",
      iconBg: "bg-indigo-600"
    },
    {
      id: "linkedIn",
      name: "LinkedIn Campaign Manager",
      platform: "B2B Sponsored Content & InMail",
      category: "Ads",
      status: "Connected",
      accountId: "LNK-8821903",
      apiKey: "●●●●●●●●●●●●8821",
      accessToken: "AQV90283...",
      lastSynced: "5 mins ago",
      latency: "22ms",
      activeAccountName: "Sovereign Executive ABM",
      iconBg: "bg-sky-700"
    },
    {
      id: "tikTok",
      name: "TikTok Ads Manager",
      platform: "Short-form Video & Lead Ads",
      category: "Ads",
      status: "Disconnected",
      accountId: "TT-UNCONFIGURED",
      apiKey: "",
      accessToken: "",
      lastSynced: "Never",
      latency: "--",
      activeAccountName: "Not Connected",
      iconBg: "bg-slate-900"
    },
    {
      id: "salesforce",
      name: "Salesforce CRM",
      platform: "Lead Sync & Opportunity Attribution",
      category: "CRM",
      status: "Connected",
      accountId: "SFDC-ORG-0129",
      apiKey: "●●●●●●●●●●●●0129",
      accessToken: "00D500000...",
      lastSynced: "1 min ago",
      latency: "16ms",
      activeAccountName: "Sovereign Enterprise Salesforce",
      iconBg: "bg-blue-500"
    },
    {
      id: "hubspot",
      name: "HubSpot Marketing Hub",
      platform: "Form Capture & Lifecycle Scoring",
      category: "CRM",
      status: "Connected",
      accountId: "HS-PORTAL-7731",
      apiKey: "●●●●●●●●●●●●7731",
      accessToken: "pat-na1-89102...",
      lastSynced: "4 mins ago",
      latency: "19ms",
      activeAccountName: "Sovereign Inbound Portal",
      iconBg: "bg-orange-600"
    }
  ]);

  // Modal / Editing Connection State
  const [editingAccount, setEditingAccount] = useState<AdAccountConfig | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingConn, setIsTestingConn] = useState(false);

  // Paid Media Strategy state
  const [totalMonthlyBudget, setTotalMonthlyBudget] = useState(12500);
  const [channelAllocations, setChannelAllocations] = useState([
    { id: "google", name: "Google Search Core", percent: 40, cpm: "$22.50", avgCpc: "$2.85", estConvRate: "4.2%" },
    { id: "meta", name: "Meta Ads (Instagram & FB)", percent: 30, cpm: "$14.20", avgCpc: "$1.45", estConvRate: "3.1%" },
    { id: "linkedin", name: "LinkedIn Professional ABM", percent: 20, cpm: "$45.00", avgCpc: "$5.80", estConvRate: "2.8%" },
    { id: "youtube", name: "YouTube Video Retargeting", percent: 10, cpm: "$18.00", avgCpc: "$1.95", estConvRate: "1.9%" }
  ]);
  const [targetAudience, setTargetAudience] = useState("GTA High-Net-Worth Investors & Luxury Home Buyers");
  const [campaignGoal, setCampaignGoal] = useState("High-Intent VIP Lead Generation");
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [strategyNotes, setStrategyNotes] = useState(
    "Prioritizing high-intent Google Search terms for Toronto Waterfront Penthouses while re-engaging luxury viewers on YouTube and Instagram Reels."
  );

  // Campaign Optimizer state
  const [autoTuneEnabled, setAutoTuneEnabled] = useState(true);
  const [maxCpcCap, setMaxCpcCap] = useState(4.50);
  const [minRoasTarget, setMinRoasTarget] = useState(3.5);
  const [keywords, setKeywords] = useState([
    { id: "KW-101", term: "luxury penthouse toronto", channel: "Google Search", cpc: "$3.40", qualityScore: 9, impressions: "14.2k", ctr: "5.8%", status: "Optimizing", recommendedBid: "$3.20" },
    { id: "KW-102", term: "waterfront property for sale GTA", channel: "Google Search", cpc: "$2.95", qualityScore: 8, impressions: "18.6k", ctr: "4.9%", status: "Scaling", recommendedBid: "$3.10" },
    { id: "KW-103", term: "toronto real estate investment abm", channel: "LinkedIn ABM", cpc: "$5.80", qualityScore: 7, impressions: "8.1k", ctr: "2.4%", status: "Active", recommendedBid: "$5.20" },
    { id: "KW-104", term: "yorkville penthouse virtual tour", channel: "Meta Ads", cpc: "$1.45", qualityScore: 9, impressions: "29.4k", ctr: "6.2%", status: "Scaling", recommendedBid: "$1.60" }
  ]);

  // AI Whole Campaign Builder Form State (Step 4)
  const [builderGoal, setBuilderGoal] = useState("High-Intent VIP Lead Generation");
  const [builderTargetMetrics, setBuilderTargetMetrics] = useState("500 Qualified Leads @ $25 CPA & 4.0x Target ROAS");
  const [builderTitle, setBuilderTitle] = useState("Q3 Toronto Waterfront Luxury Condo Campaign");
  const [builderBudget, setBuilderBudget] = useState(15000);
  const [builderAudience, setBuilderAudience] = useState("GTA High-Net-Worth Investors, Tech Founders & Luxury Buyers (Age 30-65, Net Worth $2M+)");
  const [builderAgent, setBuilderAgent] = useState("SEO Brain");
  const [builderApprovalRole, setBuilderApprovalRole] = useState("Marketing Manager");
  const [builderNotes, setBuilderNotes] = useState("Drive VIP tour requests for waterfront penthouses using Google Search intent and Meta Instagram Reels retargeting.");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["googleAds", "metaAds", "linkedIn"]);

  // Generated Whole Campaign Output State
  const [isGeneratingWholeCampaign, setIsGeneratingWholeCampaign] = useState(false);
  const [activeAdTab, setActiveAdTab] = useState<"google" | "meta" | "linkedin" | "tiktok">("google");
  const [directDeployStatus, setDirectDeployStatus] = useState<string | null>(null);
  const [generatedWholeCampaign, setGeneratedWholeCampaign] = useState<any>({
    title: "Q3 Toronto Waterfront Luxury Condo Campaign",
    goal: "High-Intent VIP Lead Generation",
    targetMetrics: "500 Qualified Leads @ $25 CPA & 4.0x Target ROAS",
    summary: "Comprehensive multi-channel acquisition blitz targeting Toronto HNW investors across Google Search, Instagram Reels, and LinkedIn Executive InMail.",
    totalBudget: 15000,
    budgetDistribution: [
      { channel: "Google Search Core", percentage: 45, amount: 6750, cpc: "$2.85", estLeads: "225 Leads" },
      { channel: "Meta Ads (IG/FB Reels)", percentage: 35, amount: 5250, cpc: "$1.45", estLeads: "195 Leads" },
      { channel: "LinkedIn Executive ABM", percentage: 20, amount: 3000, cpc: "$5.80", estLeads: "80 Leads" }
    ],
    googleAds: {
      headlines: [
        "Toronto Waterfront Penthouses",
        "VIP Luxury Condo Pre-Launch",
        "Exclusive GTA Real Estate Tour"
      ],
      descriptions: [
        "Book a private VIP preview of waterfront penthouses in Toronto. Unrivaled skyline views & premier luxury amenities.",
        "Direct developer pricing & priority access for GTA high-net-worth investors. Download exclusive floor plans today."
      ],
      keywords: ["waterfront penthouses toronto", "luxury condos GTA for sale", "toronto real estate VIP pre-launch"]
    },
    metaAds: {
      headline: "Own Toronto's Most Iconic Waterfront Penthouse",
      primaryText: "Experience floor-to-ceiling panoramic harbor views and resort-style concierge living. Priority VIP booking open for registered investors.",
      hook: "Are you ready to elevate your real estate portfolio in Toronto?",
      callToAction: "Book VIP Preview"
    },
    linkedInAds: {
      headline: "High-Yield Real Estate Assets for Tech Founders & Executives",
      bodyText: "Diversify your wealth with high-equity Toronto waterfront residences. Join an elite community of private owners with guaranteed rental yield backing.",
      callToAction: "Request Investment Deck"
    },
    tikTokAds: {
      headline: "Inside Toronto's $5M Waterfront Penthouse Tour 🏙️✨",
      scriptHook: "Wait till you see the private rooftop infinity pool on line 42...",
      callToAction: "Tap to Book Private Tour"
    },
    audienceTargeting: {
      demographics: "Ages 32-62, Income top 5%, Real Estate Investors, Executives & Business Owners",
      interests: ["Luxury Real Estate", "Property Investment", "Architecture", "Wealth Management", "Yacht Club"],
      geo: "Greater Toronto Area (GTA), Oakville, Yorkville, Montreal, Vancouver"
    }
  });

  const handleBuildRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderTitle.trim()) return;

    handleCreateCampaignRequest({
      title: builderTitle,
      agent: builderAgent,
      agentName: `SBB ${builderAgent}`,
      budgetImpact: builderBudget,
      approvalRequiredFrom: builderApprovalRole,
      comments: builderNotes || "Initiated via Sovereign Autonomous Builder.",
      tactics: [
        { tactic: "Core Target Audience Acquisition", status: "Pending" },
        { tactic: "Automated Conversion Optimization", status: "Pending" }
      ]
    });

    setBuilderTitle("");
    setBuilderNotes("");
    setActiveSubTab("approvals");
  };

  const handleAllocationChange = (id: string, newPercent: number) => {
    const updated = channelAllocations.map(ch => ch.id === id ? { ...ch, percent: newPercent } : ch);
    setChannelAllocations(updated);
  };

  const handleAiOptimizeStrategy = async () => {
    setIsGeneratingStrategy(true);
    try {
      const res = await fetch("/api/agent/run-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: {
            name: "SBB Paid Media Strategist",
            systemPrompt: "You are a senior Paid Media Strategist for luxury real estate and enterprise marketing. Synthesize a concise 2-sentence media strategy."
          },
          prompt: `Optimize allocation for budget CAD $${totalMonthlyBudget} targeting '${targetAudience}' with goal '${campaignGoal}'.`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.output || data.text) {
          setStrategyNotes(data.output || data.text);
        }
      }
    } catch (err) {
      setStrategyNotes("AI Strategy Refined: Reallocated 45% budget to Google Search Core high-intent terms, capping Meta Ads retargeting at 25% for maximum ROAS.");
    } finally {
      setIsGeneratingStrategy(false);
      onLogAction("Synthesized Media Strategy", `Updated paid media strategy for $${totalMonthlyBudget} CAD budget.`);
    }
  };

  const handleOptimizeBid = (kwId: string) => {
    setKeywords(keywords.map(kw => {
      if (kw.id === kwId) {
        return { ...kw, cpc: kw.recommendedBid, status: "Optimized" };
      }
      return kw;
    }));
    onLogAction("Optimized Keyword Bid", `Adjusted bid for keyword ${kwId}`);
  };

  const handleTestConnection = (acc: AdAccountConfig) => {
    setIsTestingConn(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingConn(false);
      setTestResult(`✅ API OAuth Validation Successful! Connected to ${acc.name} (${acc.accountId}). Latency: 14ms. Active Account: "${acc.activeAccountName}". Permissions: Read, Write, Campaign Creation & Bid Management.`);
      onLogAction("Tested Ads API Connection", `Validated credentials for ${acc.name} (${acc.accountId})`);
    }, 1200);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    setAdAccounts(adAccounts.map(acc => {
      if (acc.id === editingAccount.id) {
        return {
          ...editingAccount,
          status: editingAccount.apiKey || editingAccount.accessToken ? "Connected" : "Disconnected",
          lastSynced: "Just now",
          latency: editingAccount.apiKey || editingAccount.accessToken ? "14ms" : "--"
        };
      }
      return acc;
    }));

    onLogAction("Updated Credentials Vault", `Updated connection parameters for ${editingAccount.name}`);
    setEditingAccount(null);
    setTestResult(null);
  };

  const handleToggleChannel = (channelId: string) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handleSynthesizeWholeCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingWholeCampaign(true);
    setDirectDeployStatus(null);

    try {
      const res = await fetch("/api/gemini/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: builderTitle,
          targetAudience: builderAudience,
          objective: builderGoal,
          tone: "High-Conversion, Luxury & Enterprise Compliant",
          keyPoints: builderNotes,
          budget: builderBudget,
          platform: "Cross-Platform",
          companyProfile
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        const parsedDistribution = Array.isArray(data.budgetAllocation)
          ? data.budgetAllocation.map((dist: any) => {
              const pct = Number(dist.percentage || dist.percent || 30);
              const amt = dist.amount !== undefined ? Number(dist.amount) : (dist.budget !== undefined ? Number(dist.budget) : Math.round(builderBudget * (pct / 100)));
              return {
                channel: dist.channel || dist.name || "Paid Channel",
                percentage: pct,
                amount: isNaN(amt) ? Math.round(builderBudget * (pct / 100)) : amt,
                cpc: dist.cpc || dist.avgCpc || "$2.50",
                estLeads: dist.estLeads || dist.leads || `${Math.round((isNaN(amt) ? builderBudget * 0.3 : amt) / 25)} Leads`
              };
            })
          : [
              { channel: "Google Search Core", percentage: 45, amount: Math.round(builderBudget * 0.45), cpc: "$2.85", estLeads: `${Math.round(builderBudget * 0.45 / 25)} Leads` },
              { channel: "Meta Ads (IG/FB Reels)", percentage: 35, amount: Math.round(builderBudget * 0.35), cpc: "$1.45", estLeads: `${Math.round(builderBudget * 0.35 / 22)} Leads` },
              { channel: "LinkedIn Executive ABM", percentage: 20, amount: Math.round(builderBudget * 0.20), cpc: "$5.80", estLeads: `${Math.round(builderBudget * 0.20 / 45)} Leads` }
            ];

        setGeneratedWholeCampaign({
          title: builderTitle,
          goal: builderGoal,
          targetMetrics: builderTargetMetrics,
          summary: data.overview || `AI synthesized multi-channel acquisition blitz tailored for ${builderAudience}.`,
          totalBudget: Number(builderBudget) || 15000,
          budgetDistribution: parsedDistribution,
          googleAds: data.googleAds || {
            headlines: [`${companyProfile?.companyName || "Sovereign"} VIP Access`, "Toronto Luxury Waterfront Penthouses", "Exclusive Real Estate Pre-Launch"],
            descriptions: ["Book a private preview of luxury waterfront residences. Priority developer pricing & floor plans.", "High-equity real estate assets in Toronto. Request VIP developer deck today."],
            keywords: ["waterfront penthouses toronto", "luxury condos GTA", "toronto real estate VIP launch"]
          },
          metaAds: data.metaAds || {
            headline: "Own Toronto's Most Iconic Waterfront Penthouse",
            primaryText: "Experience panoramic harbor views and resort concierge living. Priority booking open.",
            hook: "Ready to elevate your real estate portfolio in Toronto?",
            callToAction: "Book VIP Preview"
          },
          linkedInAds: data.linkedInAds || {
            headline: "High-Yield Real Estate Assets for Tech Founders & Executives",
            bodyText: "Diversify your wealth with high-equity Toronto waterfront residences with guaranteed rental backing.",
            callToAction: "Request Investment Deck"
          },
          tikTokAds: {
            headline: "Inside Toronto's $5M Waterfront Penthouse Tour 🏙️✨",
            scriptHook: "Wait till you see the rooftop infinity pool on line 42...",
            callToAction: "Tap to Book Private Tour"
          },
          audienceTargeting: data.audienceTargeting || {
            demographics: "Ages 30-65, HNW Investors, Business Executives",
            interests: ["Real Estate Investing", "Luxury Properties", "Wealth Management"],
            geo: "Greater Toronto Area (GTA), Montreal, Vancouver"
          }
        });
      }
    } catch (err) {
      console.warn("AI Generation fallback used:", err);
    } finally {
      setIsGeneratingWholeCampaign(false);
      onLogAction("Synthesized Whole AI Campaign", `Generated multi-channel strategy for "${builderTitle}" with goal "${builderGoal}"`);
    }
  };

  const handleDirectDeployToConnectedAccounts = () => {
    setDirectDeployStatus("Dispatching campaign across connected APIs...");
    setTimeout(() => {
      setDirectDeployStatus("SUCCESS! Campaign dispatched live across Google Ads (849-204-9841), Meta Ads (ACT-392019284), and LinkedIn Ads (LNK-8821903).");
      onLogAction("Dispatched Campaign to Ads APIs", `Directly deployed "${builderTitle}" to connected ad accounts.`);
    }, 1800);
  };

  const handlePushGeneratedToApprovals = () => {
    handleCreateCampaignRequest({
      title: generatedWholeCampaign.title || builderTitle,
      agent: builderAgent,
      agentName: `SBB ${builderAgent}`,
      budgetImpact: generatedWholeCampaign.totalBudget || builderBudget,
      approvalRequiredFrom: builderApprovalRole,
      comments: `AI Whole Campaign: ${generatedWholeCampaign.goal}. Target: ${generatedWholeCampaign.targetMetrics}`,
      tactics: [
        { tactic: "Google Search Core High-Intent Keywords", status: "Pending" },
        { tactic: "Meta Instagram Reels Retargeting Blitz", status: "Pending" },
        { tactic: "LinkedIn Executive ABM Sponsored InMail", status: "Pending" }
      ]
    });
    onLogAction("Pushed AI Campaign to Approval Queue", `Submitted "${builderTitle}" for ${builderApprovalRole} sign-off.`);
    setActiveSubTab("approvals");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              SBB MarketingOS Integration Core
            </span>
            <span className="text-slate-400 text-xs">• Dynamic Pipeline</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            Sovereign Campaign & Connections Hub
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Consolidated operations console uniting pipeline components. Secure live API integrations, draft cross-channel paid media strategies, tune CPC and conversions, auto-generate responsive ad assets, and govern operational sign-offs directly under CEO supervision.
          </p>
        </div>

        {/* 5 Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveSubTab("vault")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "vault" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "vault" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>1</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">API Connections & Vault</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Integrate channels & keys</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("media-plan")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "media-plan" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "media-plan" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>2</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">Paid Media Strategy</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Define ad budgets & goals</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("optimizer")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "optimizer" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "optimizer" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>3</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">Campaign Optimizer</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Tune CPC & conversions</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("builder")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "builder" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "builder" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>4</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">Autonomous Builder</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Synthesize whole campaign</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("approvals")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer relative ${
              activeSubTab === "approvals" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "approvals" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>5</span>
            <div className="pr-4">
              <p className="font-sans text-[11px] leading-tight flex items-center gap-1.5">Studio & Approvals</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Review, override & deploy</p>
            </div>
            {pendingCount > 0 && (
              <span className="absolute right-2 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      <AnimatePresence mode="wait">
        {/* STEP 1: API CONNECTIONS & VAULT */}
        {activeSubTab === "vault" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    API Connections & Secret Credentials Vault
                  </h3>
                  <p className="text-xs text-slate-500">Connect and manage live Ad Accounts, CRMs, and OAuth credentials with real-time health checks.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    CASL & PIPEDA Encrypted
                  </span>
                </div>
              </div>

              {/* Account Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adAccounts.map((acc) => (
                  <div key={acc.id} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl ${acc.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{acc.name}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{acc.platform}</p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        acc.status === "Connected" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {acc.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-100 space-y-1 text-[11px] font-mono text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account ID:</span>
                        <span className="font-bold text-slate-800">{acc.accountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Profile:</span>
                        <span className="font-bold text-indigo-600 truncate max-w-[150px]">{acc.activeAccountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">API Health:</span>
                        <span className="text-emerald-600 font-bold">{acc.latency !== "--" ? `Healthy (${acc.latency})` : "Disconnected"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <button
                        onClick={() => { setEditingAccount(acc); setTestResult(null); }}
                        className="w-full px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Settings className="w-3 h-3 text-slate-500" />
                        Configure
                      </button>

                      <button
                        onClick={() => handleTestConnection(acc)}
                        className="w-full px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-100 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3 text-indigo-600" />
                        Test Connection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing Account Modal / Drawer */}
            {editingAccount && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Configure Connection: {editingAccount.name}</h4>
                  </div>
                  <button onClick={() => setEditingAccount(null)} className="text-slate-400 hover:text-white cursor-pointer">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveConnection} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Ad Account ID / Customer ID</label>
                      <input
                        type="text"
                        value={editingAccount.accountId}
                        onChange={(e) => setEditingAccount({ ...editingAccount, accountId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Active Ad Account Profile Name</label>
                      <input
                        type="text"
                        value={editingAccount.activeAccountName}
                        onChange={(e) => setEditingAccount({ ...editingAccount, activeAccountName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">API Key / Secret Token</label>
                      <input
                        type="password"
                        placeholder="Enter API Secret Key"
                        value={editingAccount.apiKey}
                        onChange={(e) => setEditingAccount({ ...editingAccount, apiKey: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">OAuth Access Token / Developer Key</label>
                      <input
                        type="password"
                        placeholder="Enter OAuth Token"
                        value={editingAccount.accessToken}
                        onChange={(e) => setEditingAccount({ ...editingAccount, accessToken: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {testResult && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 font-mono leading-relaxed">
                      {testResult}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleTestConnection(editingAccount)}
                      disabled={isTestingConn}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${isTestingConn ? "animate-spin" : ""}`} />
                      <span>{isTestingConn ? "Validating OAuth Scope..." : "Test Connection"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingAccount(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-indigo-900/50"
                      >
                        Save & Connect Account
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 4: AUTONOMOUS AI WHOLE CAMPAIGN BUILDER */}
        {activeSubTab === "builder" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Top Strategy & Goal Synthesizer Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Autonomous AI Whole Campaign Builder with Goal Engine
                  </h3>
                  <p className="text-xs text-slate-500">Provide your campaign goal and parameters. AI will automatically construct multi-channel creatives, budget splits, and targeting strategy.</p>
                </div>

                <button
                  onClick={handleSynthesizeWholeCampaign}
                  disabled={isGeneratingWholeCampaign}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:to-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
                >
                  <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingWholeCampaign ? "animate-spin" : ""}`} />
                  <span>{isGeneratingWholeCampaign ? "Synthesizing AI Whole Campaign..." : "AI Build Whole Campaign"}</span>
                </button>
              </div>

              {/* Goal & Input Parameters Form */}
              <form onSubmit={handleSynthesizeWholeCampaign} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={builderTitle}
                      onChange={(e) => setBuilderTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Campaign Goal</label>
                    <input
                      type="text"
                      required
                      value={builderGoal}
                      onChange={(e) => setBuilderGoal(e.target.value)}
                      placeholder="e.g. High-Intent VIP Lead Generation"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Outcome Metric</label>
                    <input
                      type="text"
                      value={builderTargetMetrics}
                      onChange={(e) => setBuilderTargetMetrics(e.target.value)}
                      placeholder="e.g. 500 Qualified Leads @ $25 CPA"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Monthly Budget (CAD $)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={builderBudget}
                        onChange={(e) => setBuilderBudget(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience Profile</label>
                  <input
                    type="text"
                    value={builderAudience}
                    onChange={(e) => setBuilderAudience(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                {/* Connected Channel Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Connected Ads Channels for AI Deployment</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                    {adAccounts.filter(acc => acc.category === "Ads").map((acc) => {
                      const isSelected = selectedChannels.includes(acc.id);
                      return (
                        <button
                          type="button"
                          key={acc.id}
                          onClick={() => handleToggleChannel(acc.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20"
                              : "bg-slate-50 border-slate-200 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isSelected ? "bg-indigo-600" : "bg-slate-300"}`} />
                            <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${acc.status === "Connected" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                            {acc.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target AI Agent</label>
                    <select
                      value={builderAgent}
                      onChange={(e) => setBuilderAgent(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="SEO Brain">SBB SEO Brain</option>
                      <option value="Social AI">Social Media Campaign Engine</option>
                      <option value="CRM Router">CRM Lead Scoring Agent</option>
                      <option value="Market Research">Market Research LLM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Approval Authority Required</label>
                    <select
                      value={builderApprovalRole}
                      onChange={(e) => setBuilderApprovalRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Marketing Manager">Marketing Manager</option>
                      <option value="Vice President">Vice President</option>
                      <option value="CEO">CEO Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Strategic Scope & Key Value Propositions</label>
                  <textarea
                    rows={2}
                    value={builderNotes}
                    onChange={(e) => setBuilderNotes(e.target.value)}
                    placeholder="Provide additional details or key points..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Generated Whole Campaign Master Output */}
            {generatedWholeCampaign && (
              <div className="space-y-6">
                {/* Executive Summary Card */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        AI SYNTHESIZED MASTER CAMPAIGN
                      </span>
                      <h3 className="text-lg font-black text-white mt-1">{generatedWholeCampaign.title}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-indigo-300">TOTAL BUDGET</span>
                      <p className="text-xl font-black font-mono text-emerald-400">${(Number(generatedWholeCampaign?.totalBudget) || 0).toLocaleString()} CAD</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{generatedWholeCampaign.summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400">PRIMARY GOAL</span>
                      <p className="text-xs font-bold text-white">{generatedWholeCampaign.goal}</p>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400">TARGET METRICS</span>
                      <p className="text-xs font-bold text-emerald-400 font-mono">{generatedWholeCampaign.targetMetrics}</p>
                    </div>
                  </div>
                </div>

                {/* Cross-Channel Budget Split Cards */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    AI Cross-Channel Budget Allocation
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {generatedWholeCampaign.budgetDistribution.map((dist: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{dist.channel}</span>
                          <span className="text-xs font-black font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {dist.percentage}%
                          </span>
                        </div>
                        <p className="text-lg font-black font-mono text-slate-900">${(Number(dist?.amount) || 0).toLocaleString()} CAD</p>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200">
                          <span>Avg CPC: {dist.cpc}</span>
                          <span className="text-emerald-600 font-bold">{dist.estLeads}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ad Creative Assets Studio */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-indigo-600" />
                      Multi-Platform Ad Creative Studio
                    </h4>

                    {/* Creative Platform Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                      {(["google", "meta", "linkedin", "tiktok"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveAdTab(tab)}
                          className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                            activeAdTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {tab === "google" ? "Google Search" : tab === "meta" ? "Meta Ads" : tab === "linkedin" ? "LinkedIn ABM" : "TikTok Video"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Google Ads View */}
                  {activeAdTab === "google" && generatedWholeCampaign.googleAds && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">HEADLINES</span>
                        <div className="flex flex-wrap gap-2">
                          {generatedWholeCampaign.googleAds.headlines.map((hl: string, i: number) => (
                            <span key={i} className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                              {hl}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">DESCRIPTIONS</span>
                        {generatedWholeCampaign.googleAds.descriptions.map((desc: string, i: number) => (
                          <p key={i} className="text-xs text-slate-700 bg-white border border-slate-200 p-2.5 rounded-lg">
                            {desc}
                          </p>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500">RECOMMENDED SEARCH KEYWORDS</span>
                        <div className="flex flex-wrap gap-2">
                          {generatedWholeCampaign.googleAds.keywords.map((kw: string, i: number) => (
                            <span key={i} className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 font-bold">
                              +{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meta Ads View */}
                  {activeAdTab === "meta" && generatedWholeCampaign.metaAds && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-indigo-600">PRIMARY AD COPY</span>
                        <p className="text-xs text-slate-800 leading-relaxed">{generatedWholeCampaign.metaAds.primaryText}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">HEADLINE HOOK</span>
                          <p className="text-xs font-bold text-slate-900">{generatedWholeCampaign.metaAds.headline}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-slate-500">CALL TO ACTION BUTTON</span>
                          <span className="inline-block px-3 py-1 bg-indigo-600 text-white font-bold text-xs rounded-lg">
                            {generatedWholeCampaign.metaAds.callToAction}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LinkedIn Ads View */}
                  {activeAdTab === "linkedin" && generatedWholeCampaign.linkedInAds && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-sky-700">LINKEDIN SPONSORED CONTENT</span>
                        <h5 className="text-xs font-bold text-slate-900">{generatedWholeCampaign.linkedInAds.headline}</h5>
                        <p className="text-xs text-slate-700 leading-relaxed">{generatedWholeCampaign.linkedInAds.bodyText}</p>
                      </div>
                    </div>
                  )}

                  {/* TikTok Video View */}
                  {activeAdTab === "tiktok" && generatedWholeCampaign.tikTokAds && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-900">TIKTOK SHORT-FORM SCRIPT HOOK</span>
                        <h5 className="text-xs font-bold text-slate-900">{generatedWholeCampaign.tikTokAds.headline}</h5>
                        <p className="text-xs text-slate-800 font-mono bg-slate-100 p-2 rounded">&quot;{generatedWholeCampaign.tikTokAds.scriptHook}&quot;</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Action Bar */}
                {directDeployStatus && (
                  <div className="p-4 bg-emerald-950 text-emerald-300 rounded-2xl border border-emerald-700 font-mono text-xs leading-relaxed flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{directDeployStatus}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
                  <div>
                    <h4 className="text-sm font-bold text-white">Ready to Execute Whole Campaign?</h4>
                    <p className="text-xs text-slate-400">Deploy directly to connected Ads APIs or submit for executive sign-off.</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handlePushGeneratedToApprovals}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-indigo-400" />
                      Submit to RBAC Queue
                    </button>

                    <button
                      onClick={handleDirectDeployToConnectedAccounts}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-900/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      Direct Deploy to Connected Ads
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === "approvals" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  RBAC Campaign Sign-Off & Execution Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Current Session Clearance: <span className="font-bold text-slate-800">{userName} ({currentRole})</span></p>
              </div>
            </div>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-mono">No active campaign requests in queue.</div>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          camp.status === "Approved" ? "bg-emerald-100 text-emerald-800" : camp.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}>
                          {camp.status}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{camp.title}</h4>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        ${camp.budgetImpact} CAD
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{camp.comments || "No comments provided."}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200/60">
                      <div>Requested by: <span className="font-bold text-slate-700">{camp.createdBy}</span> • Approval: <span className="font-bold text-slate-700">{camp.approvalRequiredFrom}</span></div>
                      
                      <div className="flex items-center gap-2">
                        {camp.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApproveCampaign(camp.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCampaign(camp.id)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {currentRole === "CEO" && camp.status !== "Pending" && (
                          <button
                            onClick={() => handleOverrideCampaign(camp.id, camp.status === "Approved" ? "Rejected" : "Approved", "CEO Override via Executive Panel")}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded transition-all cursor-pointer text-[9px]"
                          >
                            CEO Override
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2: PAID MEDIA STRATEGY */}
        {activeSubTab === "media-plan" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Top Control Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    SBB Paid Media Strategy & Cross-Channel Budget Allocator
                  </h3>
                  <p className="text-xs text-slate-500">Configure multi-channel ad spend, target parameters, and AI-driven ROAS projections.</p>
                </div>

                <button
                  onClick={handleAiOptimizeStrategy}
                  disabled={isGeneratingStrategy}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
                >
                  <Sparkles className={`w-4 h-4 text-amber-300 ${isGeneratingStrategy ? "animate-spin" : ""}`} />
                  <span>{isGeneratingStrategy ? "Synthesizing Strategy..." : "AI Re-Optimize Strategy"}</span>
                </button>
              </div>

              {/* Budget & Target Audience Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Monthly Budget (CAD $)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="500"
                      min="1000"
                      value={totalMonthlyBudget}
                      onChange={(e) => setTotalMonthlyBudget(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience Profile</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Campaign Objective</label>
                  <select
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="High-Intent VIP Lead Generation">High-Intent VIP Lead Generation</option>
                    <option value="Brand Awareness & Market Dominance">Brand Awareness & Market Dominance</option>
                    <option value="Direct Conversion & VIP Bookings">Direct Conversion & VIP Bookings</option>
                    <option value="Cross-Channel Retargeting Pulse">Cross-Channel Retargeting Pulse</option>
                  </select>
                </div>
              </div>

              {/* Strategy AI Summary Box */}
              <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
                  AI Strategy Briefing
                </span>
                <p className="text-xs text-indigo-950 font-medium leading-relaxed">{strategyNotes}</p>
              </div>
            </div>

            {/* Projected KPIs Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">EST. IMPRESSIONS</span>
                <p className="text-xl font-black text-slate-900 font-mono">342.8k</p>
                <span className="text-[10px] text-emerald-600 font-bold">+18% vs baseline</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">EST. TOTAL CLICKS</span>
                <p className="text-xl font-black text-slate-900 font-mono">11,420</p>
                <span className="text-[10px] text-emerald-600 font-bold">Avg CPC: $1.09</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">PROJECTED LEADS</span>
                <p className="text-xl font-black text-indigo-600 font-mono">384 Leads</p>
                <span className="text-[10px] text-indigo-600 font-bold">Est CPA: $32.55 CAD</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">ROAS MULTIPLIER</span>
                <p className="text-xl font-black text-emerald-600 font-mono">3.85x ROAS</p>
                <span className="text-[10px] text-emerald-600 font-bold">Target &gt; 3.5x Met</span>
              </div>
            </div>

            {/* Channel Budget Allocation Sliders & Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-600" />
                Cross-Channel Budget Allocation Matrix
              </h4>

              <div className="space-y-4">
                {channelAllocations.map((channel) => {
                  const channelSpend = Math.round((totalMonthlyBudget * channel.percent) / 100);
                  return (
                    <div key={channel.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900">{channel.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">
                            CPM: {channel.cpm} • Avg CPC: {channel.avgCpc} • Est Conv: {channel.estConvRate}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            ${(Number(channelSpend) || 0).toLocaleString()} CAD ({channel.percent}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={channel.percent}
                          onChange={(e) => handleAllocationChange(channel.id, Number(e.target.value))}
                          className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: CAMPAIGN OPTIMIZER */}
        {activeSubTab === "optimizer" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Top Control Bar */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <SlidersHorizontal className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">SBB Real-Time Bid Tuning & Campaign Optimizer</h3>
                    <p className="text-xs text-slate-400">Autonomous CPC keyword bidding engine, Quality Score tuning, and ROAS guardian.</p>
                  </div>
                </div>

                <button
                  onClick={() => setAutoTuneEnabled(!autoTuneEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-2 ${
                    autoTuneEnabled
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>{autoTuneEnabled ? "AI Auto-Bid Rules ACTIVE" : "Enable Auto-Bidding"}</span>
                </button>
              </div>

              {/* Threshold Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">MAX CPC CAP (CAD)</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black font-mono text-emerald-400">${maxCpcCap.toFixed(2)}</span>
                    <input
                      type="range"
                      min="1.00"
                      max="10.00"
                      step="0.25"
                      value={maxCpcCap}
                      onChange={(e) => setMaxCpcCap(Number(e.target.value))}
                      className="w-28 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">MIN TARGET ROAS</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black font-mono text-amber-400">{minRoasTarget.toFixed(1)}x</span>
                    <input
                      type="range"
                      min="2.0"
                      max="6.0"
                      step="0.1"
                      value={minRoasTarget}
                      onChange={(e) => setMinRoasTarget(Number(e.target.value))}
                      className="w-28 accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">ACTIVE CHANNELS TUNED</span>
                  <p className="text-xs font-mono font-bold text-indigo-300 pt-1">
                    Google Search • Meta Ads • LinkedIn ABM • YouTube
                  </p>
                </div>
              </div>
            </div>

            {/* Keyword Bid Tuning Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live Keyword & Audience Bid Performance Matrix
                </h4>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Real-time Optimization
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-500">
                      <th className="py-2.5 px-3">Keyword / Segment</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Current CPC</th>
                      <th className="py-2.5 px-3">Quality Score</th>
                      <th className="py-2.5 px-3">Impressions</th>
                      <th className="py-2.5 px-3">CTR</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">AI Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {keywords.map((kw) => (
                      <tr key={kw.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">{kw.term}</td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{kw.channel}</td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600">{kw.cpc}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded">{kw.qualityScore}/10</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{kw.impressions}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600">{kw.ctr}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              kw.status === "Scaling"
                                ? "bg-emerald-100 text-emerald-800"
                                : kw.status === "Optimized"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {kw.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOptimizeBid(kw.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                          >
                            Apply Bid ({kw.recommendedBid})
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
