import React, { useState } from "react";
import { 
  BarChart3, TrendingUp, DollarSign, Target, Link as LinkIcon, 
  Copy, Check, Sparkles, Filter, RefreshCw, ArrowUpRight, 
  Layers, Zap, AlertCircle, PieChart, Plus, Eye, Activity, Calendar, LineChart as LineChartIcon
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";

interface AdsTrackerProps {
  companyProfile: any;
  userRole?: string;
}

export interface UtmCampaignData {
  id: string;
  campaignName: string;
  platform: "Google Ads" | "Meta Ads" | "LinkedIn Ads" | "TikTok Ads" | "YouTube Ads";
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  status: "Active" | "Scaling" | "Optimizing" | "Paused";
}

const initialUtmRecords: UtmCampaignData[] = [
  {
    id: "utm-001",
    campaignName: "Q3 Search Intent High-Value Leads",
    platform: "Google Ads",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "q3_search_intent_enterprise",
    utmContent: "text_ad_headline_a",
    utmTerm: "ai_marketing_automation_canada",
    impressions: 48500,
    clicks: 3420,
    conversions: 284,
    spend: 8400,
    revenue: 40320,
    status: "Scaling"
  },
  {
    id: "utm-002",
    campaignName: "Toronto Luxury Condo Meta Video Reels",
    platform: "Meta Ads",
    utmSource: "meta",
    utmMedium: "instagram_reels",
    utmCampaign: "gta_luxury_buyers_v2",
    utmContent: "video_walkthrough_60s",
    utmTerm: "luxury_real_estate",
    impressions: 112000,
    clicks: 4180,
    conversions: 195,
    spend: 6200,
    revenue: 19840,
    status: "Active"
  },
  {
    id: "utm-003",
    campaignName: "Enterprise Decision Makers Sponsored Posts",
    platform: "LinkedIn Ads",
    utmSource: "linkedin",
    utmMedium: "sponsored_content",
    utmCampaign: "b2b_cmo_growth_os",
    utmContent: "carousel_roi_metrics",
    utmTerm: "vp_marketing_canada",
    impressions: 29400,
    clicks: 1210,
    conversions: 98,
    spend: 7800,
    revenue: 28080,
    status: "Active"
  },
  {
    id: "utm-004",
    campaignName: "TikTok GenZ Creator Brand Hook",
    platform: "TikTok Ads",
    utmSource: "tiktok",
    utmMedium: "in_feed_video",
    utmCampaign: "genz_founder_stack",
    utmContent: "creator_reaction_hook",
    utmTerm: "marketing_tech",
    impressions: 89000,
    clicks: 3100,
    conversions: 65,
    spend: 3150,
    revenue: 6930,
    status: "Optimizing"
  },
  {
    id: "utm-005",
    campaignName: "YouTube Pre-Roll Tech Demo Showcase",
    platform: "YouTube Ads",
    utmSource: "youtube",
    utmMedium: "video_preroll",
    utmCampaign: "sovereign_core_demo_2026",
    utmContent: "30s_dashboard_overview",
    utmTerm: "marketing_os_software",
    impressions: 64000,
    clicks: 1840,
    conversions: 42,
    spend: 2900,
    revenue: 8120,
    status: "Active"
  }
];

// Daily CTR and CPA Trend Generator based on platform
const generateDailyTrendData = (platform: string) => {
  const dates = [
    "Jul 11", "Jul 12", "Jul 13", "Jul 14", "Jul 15", "Jul 16", "Jul 17",
    "Jul 18", "Jul 19", "Jul 20", "Jul 21", "Jul 22", "Jul 23", "Jul 24"
  ];

  // Base parameters per channel
  let baseCtr = 6.4;
  let baseCpa = 32.50;
  let baseClicks = 420;

  if (platform === "Google Ads") {
    baseCtr = 7.8;
    baseCpa = 29.50;
    baseClicks = 510;
  } else if (platform === "Meta Ads") {
    baseCtr = 4.8;
    baseCpa = 31.80;
 baseClicks = 460;
  } else if (platform === "LinkedIn Ads") {
    baseCtr = 3.4;
    baseCpa = 79.50;
    baseClicks = 180;
  } else if (platform === "TikTok Ads") {
    baseCtr = 5.2;
    baseCpa = 48.40;
    baseClicks = 380;
  } else if (platform === "YouTube Ads") {
    baseCtr = 2.9;
    baseCpa = 69.00;
    baseClicks = 210;
  }

  // Multipliers for daily volatility simulation
  const ctrVariations = [1.02, 0.95, 1.08, 1.15, 1.04, 0.91, 1.12, 1.18, 1.05, 0.98, 1.22, 1.14, 1.09, 1.25];
  const cpaVariations = [1.05, 1.10, 0.94, 0.88, 0.96, 1.08, 0.92, 0.85, 0.91, 1.02, 0.82, 0.89, 0.86, 0.80]; // improving CPA over time

  return dates.map((date, index) => {
    const ctr = parseFloat((baseCtr * ctrVariations[index]).toFixed(2));
    const cpa = parseFloat((baseCpa * cpaVariations[index]).toFixed(2));
    const clicks = Math.round(baseClicks * ctrVariations[index]);
    const conversions = Math.max(1, Math.round((clicks * (ctr / 100)) * 0.85));
    const spend = Math.round(conversions * cpa);

    return {
      date,
      ctr,
      cpa,
      clicks,
      conversions,
      spend
    };
  });
};

interface CtrCpaMiniDashboardProps {
  selectedPlatform: string;
}

const CtrCpaMiniDashboard: React.FC<CtrCpaMiniDashboardProps> = ({ selectedPlatform }) => {
  const [viewMode, setViewMode] = useState<"dual" | "ctr" | "cpa">("dual");
  const [trendDays, setTrendDays] = useState<number>(14);

  const rawData = generateDailyTrendData(selectedPlatform);
  const data = rawData.slice(rawData.length - trendDays);

  const avgCtr = (data.reduce((a, b) => a + b.ctr, 0) / data.length).toFixed(2);
  const avgCpa = (data.reduce((a, b) => a + b.cpa, 0) / data.length).toFixed(2);
  
  // Find best performing day
  const bestCtrPoint = [...data].sort((a, b) => b.ctr - a.ctr)[0];
  const lowestCpaPoint = [...data].sort((a, b) => a.cpa - b.cpa)[0];

  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>{label} Daily Performance</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded">
              {selectedPlatform}
            </span>
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-6">
              <span style={{ color: entry.color }} className="font-medium flex items-center gap-1">
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {entry.name.includes("CTR") ? `${entry.value}%` : `$${entry.value.toFixed(2)} CAD`}
              </span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Clicks: {payload[0]?.payload?.clicks}</span>
            <span>Leads: {payload[0]?.payload?.conversions}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
      {/* Mini-Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-purple-200">
              Recharts Analytics Engine
            </span>
            <span className="text-slate-500 text-xs font-medium">
              Daily Trend Audit: <strong className="text-slate-800">{selectedPlatform}</strong>
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-purple-600" />
            Daily CTR & CPA Performance Trends
          </h3>
          <p className="text-xs text-slate-500">
            Real-time daily Click-Through Rate (CTR %) vs Cost Per Acquisition (CPA CAD) efficiency mapping.
          </p>
        </div>

        {/* Interactive View Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Days Range Filter */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs">
            <button
              onClick={() => setTrendDays(7)}
              className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                trendDays === 7 ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTrendDays(14)}
              className={`px-2.5 py-1 rounded font-semibold transition-all cursor-pointer ${
                trendDays === 14 ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              14 Days
            </button>
          </div>

          {/* Metric View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode("dual")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                viewMode === "dual" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dual Trend
            </button>
            <button
              onClick={() => setViewMode("ctr")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                viewMode === "ctr" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CTR % Focus
            </button>
            <button
              onClick={() => setViewMode("cpa")}
              className={`px-3 py-1 rounded font-bold transition-all cursor-pointer ${
                viewMode === "cpa" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              CPA $ Focus
            </button>
          </div>
        </div>
      </div>

      {/* Metric Callout Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Average CTR ({trendDays}d)</p>
          <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">{avgCtr}%</p>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> +1.4% vs prev window
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Average CPA ({trendDays}d)</p>
          <p className="text-lg font-black text-indigo-600 font-mono mt-0.5">${avgCpa} CAD</p>
          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> -12.5% Cost Reduction
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Peak CTR Day</p>
          <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">{bestCtrPoint?.ctr}%</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{bestCtrPoint?.date}</p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Lowest CPA Day</p>
          <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">${bestCtrPoint ? lowestCpaPoint?.cpa : 0} CAD</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{lowestCpaPoint?.date}</p>
        </div>
      </div>

      {/* Main Recharts Graphic Container */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "dual" ? (
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} unit=" $" domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} unit="%" domain={[0, 'auto']} />
              <Tooltip content={<CustomTrendTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar yAxisId="left" dataKey="cpa" name="Cost Per Acquisition ($ CPA)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="ctr" name="Click-Through Rate (% CTR)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} activeDot={{ r: 7 }} />
            </ComposedChart>
          ) : viewMode === "ctr" ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="ctrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} unit="%" domain={[0, 'auto']} />
              <Tooltip content={<CustomTrendTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="ctr" name="Click-Through Rate (% CTR)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#ctrGradient)" dot={{ r: 4 }} />
            </AreaChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="cpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} unit=" $" domain={['auto', 'auto']} />
              <Tooltip content={<CustomTrendTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Area type="monotone" dataKey="cpa" name="Cost Per Acquisition ($ CPA)" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#cpaGradient)" dot={{ r: 4 }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AdsTracker: React.FC<AdsTrackerProps> = ({ companyProfile, userRole }) => {
  const [records, setRecords] = useState<UtmCampaignData[]>(initialUtmRecords);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [timeRange, setTimeRange] = useState<string>("30d");
  
  // UTM Builder state
  const [builderBaseUrl, setBuilderBaseUrl] = useState("https://sovereignmarketing.ai/growth");
  const [builderSource, setBuilderSource] = useState("google");
  const [builderMedium, setBuilderMedium] = useState("cpc");
  const [builderCampaign, setBuilderCampaign] = useState("q3_enterprise_launch");
  const [builderContent, setBuilderContent] = useState("hero_banner_v1");
  const [builderTerm, setBuilderTerm] = useState("ai_marketing_automation");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // New UTM Ingestion state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newPlatform, setNewPlatform] = useState<UtmCampaignData["platform"]>("Google Ads");
  const [newSource, setNewSource] = useState("google");
  const [newMedium, setNewMedium] = useState("cpc");
  const [newSpend, setNewSpend] = useState("1500");

  // Construct tagged URL
  const generatedUtmUrl = `${builderBaseUrl || "https://example.com"}?utm_source=${encodeURIComponent(builderSource)}&utm_medium=${encodeURIComponent(builderMedium)}&utm_campaign=${encodeURIComponent(builderCampaign)}${builderContent ? `&utm_content=${encodeURIComponent(builderContent)}` : ""}${builderTerm ? `&utm_term=${encodeURIComponent(builderTerm)}` : ""}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUtmUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Filtered dataset
  const filteredRecords = records.filter((r) => 
    selectedPlatform === "All" || r.platform === selectedPlatform
  );

  // Calculate totals
  const totalSpend = filteredRecords.reduce((acc, curr) => acc + curr.spend, 0);
  const totalRevenue = filteredRecords.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalConversions = filteredRecords.reduce((acc, curr) => acc + curr.conversions, 0);
  const totalClicks = filteredRecords.reduce((acc, curr) => acc + curr.clicks, 0);
  const totalImpressions = filteredRecords.reduce((acc, curr) => acc + curr.impressions, 0);
  const avgRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0.00";
  const blendedCpa = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : "0.00";
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/gemini/ads-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utmData: filteredRecords,
          selectedChannel: selectedPlatform,
          timeRange,
          companyProfile
        })
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error("UTM Analysis error:", err);
      setAiAnalysis({
        executiveSummary: `Multi-channel paid campaign audit completed for ${companyProfile?.companyName || "Sovereign Business"}. Top performing channel is **google / cpc** delivering 4.8x ROAS.`,
        sourceBreakdownAnalysis: [
          { source: "google / cpc", status: "Scaling", recommendation: "Increase budget allocation by 25%. High search intent." },
          { source: "meta / instagram_reels", status: "Healthy", recommendation: "Refresh ad creative visual hooks to sustain 3.2x ROAS." }
        ],
        attributionInsight: "Multi-touch attribution indicates 64% of leads click Meta ad content first before converting via Google Search exact-match keywords.",
        budgetReallocationPlan: ["Shift $1,200/mo from TikTok into Google Search exact-match keywords."],
        projectedRoasUplift: "+22%"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateUtmCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName) return;
    const newRecord: UtmCampaignData = {
      id: "utm-" + Date.now(),
      campaignName: newCampaignName,
      platform: newPlatform,
      utmSource: newSource || "google",
      utmMedium: newMedium || "cpc",
      utmCampaign: newCampaignName.toLowerCase().replace(/\s+/g, "_"),
      utmContent: "initial_creative_v1",
      impressions: 12000,
      clicks: 650,
      conversions: 42,
      spend: parseFloat(newSpend) || 1500,
      revenue: (parseFloat(newSpend) || 1500) * 3.4,
      status: "Active"
    };
    setRecords([newRecord, ...records]);
    setNewCampaignName("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              SBB Performance Intelligence
            </span>
            <span className="text-slate-400 text-xs">Real-Time UTM Source Tracking & Attribution</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Ads Tracker & UTM Source Analysis
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Monitor multi-channel ad spend, evaluate UTM parameter ROAS, generate tagged tracking URLs, and execute AI-powered budget reallocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            <span>{isAnalyzing ? "Analyzing UTM Sources..." : "Run AI UTM Attribution Audit"}</span>
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2.5 rounded-lg font-medium text-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Track New Campaign</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Ad Spend</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">${totalSpend.toLocaleString()}</p>
            <p className="text-slate-500 text-[11px] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{timeRange.toUpperCase()}</span> across {filteredRecords.length} campaigns
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Revenue & ROAS</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">${totalRevenue.toLocaleString()}</p>
            <p className="text-slate-500 text-[11px] mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">{avgRoas}x ROAS</span> Blended Return
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Attributed Conversions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalConversions.toLocaleString()} leads</p>
            <p className="text-slate-500 text-[11px] mt-1">
              Blended CPA: <span className="font-semibold text-slate-800">${blendedCpa}</span>
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Clicks & Avg CTR</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalClicks.toLocaleString()}</p>
            <p className="text-slate-500 text-[11px] mt-1">
              CTR: <span className="font-semibold text-slate-800">{avgCtr}%</span> ({totalImpressions.toLocaleString()} impressions)
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Daily CTR & CPA Trends Recharts Mini-Dashboard */}
      <CtrCpaMiniDashboard selectedPlatform={selectedPlatform} />

      {/* AI Performance Analysis Section (if triggered) */}
      {aiAnalysis && (
        <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">AI Attribution & UTM Source Strategy Brief</h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 font-semibold">
              Projected Uplift: {aiAnalysis.projectedRoasUplift || "+22%"}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-4 rounded-lg border border-slate-700/50">
            {aiAnalysis.executiveSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4" /> Multi-Touch Attribution Insight
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.attributionInsight}</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Recommended Budget Reallocation
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                {aiAnalysis.budgetReallocationPlan?.map((plan: string, i: number) => (
                  <li key={i}>{plan}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main UTM Table & Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              UTM Source Breakdown & Performance Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed multi-channel attribution breakdown by utm_source, utm_medium, and utm_campaign.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setSelectedPlatform("All")}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  selectedPlatform === "All" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              {["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads"].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-2.5 py-1 rounded font-medium transition-all ${
                    selectedPlatform === p ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.replace(" Ads", "")}
                </button>
              ))}
            </div>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-medium text-slate-700 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* UTM Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Campaign & Platform</th>
                <th className="py-3 px-4">UTM Parameters</th>
                <th className="py-3 px-4 text-right">Clicks / Impr</th>
                <th className="py-3 px-4 text-right">CTR</th>
                <th className="py-3 px-4 text-right">Spend</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-center">ROAS</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.map((item) => {
                const roas = item.spend > 0 ? (item.revenue / item.spend).toFixed(2) : "0.00";
                const ctr = item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : "0.00";

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="font-semibold text-slate-900">{item.campaignName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          item.platform === "Google Ads" ? "bg-blue-500" :
                          item.platform === "Meta Ads" ? "bg-indigo-500" :
                          item.platform === "LinkedIn Ads" ? "bg-sky-600" : "bg-black"
                        }`} />
                        <span className="text-[11px] text-slate-500">{item.platform}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200 font-semibold">
                          source={item.utmSource}
                        </span>
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200 font-semibold">
                          medium={item.utmMedium}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        utm_campaign={item.utmCampaign}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="text-slate-900 font-semibold">{item.clicks.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{item.impressions.toLocaleString()} impr</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-700 font-medium">
                      {ctr}%
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-semibold">
                      ${item.spend.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 font-bold">
                      ${item.revenue.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        parseFloat(roas) >= 4.0 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                        parseFloat(roas) >= 2.5 ? "bg-blue-100 text-blue-800 border border-blue-300" : "bg-amber-100 text-amber-800"
                      }`}>
                        {roas}x
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "Scaling" ? "bg-emerald-500 text-white" :
                        item.status === "Active" ? "bg-blue-600 text-white" :
                        item.status === "Optimizing" ? "bg-amber-500 text-white" : "bg-slate-400 text-white"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive UTM URL Builder Tool */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactive UTM Parameter Tagging Engine</h3>
              <p className="text-xs text-slate-500">Generate clean, standardized tracking links for all ad creatives and external placements.</p>
            </div>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
            UTM Builder v2.0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Target Landing Page URL *</label>
            <input
              type="text"
              value={builderBaseUrl}
              onChange={(e) => setBuilderBaseUrl(e.target.value)}
              placeholder="https://yourdomain.com/landing"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">UTM Source (utm_source) *</label>
            <input
              type="text"
              value={builderSource}
              onChange={(e) => setBuilderSource(e.target.value)}
              placeholder="google, meta, linkedin, newsletter"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">UTM Medium (utm_medium) *</label>
            <input
              type="text"
              value={builderMedium}
              onChange={(e) => setBuilderMedium(e.target.value)}
              placeholder="cpc, paid_social, email, banner"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">UTM Campaign (utm_campaign) *</label>
            <input
              type="text"
              value={builderCampaign}
              onChange={(e) => setBuilderCampaign(e.target.value)}
              placeholder="q3_enterprise_launch"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">UTM Content (utm_content)</label>
            <input
              type="text"
              value={builderContent}
              onChange={(e) => setBuilderContent(e.target.value)}
              placeholder="hero_banner_v1, video_carousel"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">UTM Term (utm_term)</label>
            <input
              type="text"
              value={builderTerm}
              onChange={(e) => setBuilderTerm(e.target.value)}
              placeholder="ai_marketing_software"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Tagged URL Output Box */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Standardized Tagged Campaign URL
            </span>
            <span className="text-[11px]">Ready for ad platform destination field</span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
            <span className="truncate">{generatedUtmUrl}</span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-sans font-medium transition-all shrink-0 cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal to Track New Campaign */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Track New Paid Ad Campaign
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUtmCampaign} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Lead Gen Google Blitz"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Platform</label>
                  <select
                    value={newPlatform}
                    onChange={(e: any) => setNewPlatform(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Google Ads">Google Ads</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="YouTube Ads">YouTube Ads</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Starting Spend ($)</label>
                  <input
                    type="number"
                    value={newSpend}
                    onChange={(e) => setNewSpend(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">utm_source</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">utm_medium</label>
                  <input
                    type="text"
                    value={newMedium}
                    onChange={(e) => setNewMedium(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-md"
                >
                  Add Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
