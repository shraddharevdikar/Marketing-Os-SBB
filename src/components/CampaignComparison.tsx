import React, { useState } from "react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from "recharts";
import { 
  GitCompare, ArrowRightLeft, Trophy, Zap, TrendingUp, DollarSign, 
  Users, Target, Check, AlertCircle, Sparkles, Scale, Sliders
} from "lucide-react";

export interface ComparisonCampaign {
  id: string;
  name: string;
  platform: string;
  budget: number;
  spend: number;
  leads: number;
  targetLeads: number;
  cpl: number;
  revenue: number;
  roas: number;
  ctr: number;
  convRate: number;
  status: string;
}

const defaultComparisonPool: ComparisonCampaign[] = [
  {
    id: "cmp-01",
    name: "Q3 Search Intent High-Value Leads",
    platform: "Google Ads",
    budget: 10000,
    spend: 8400,
    leads: 284,
    targetLeads: 220,
    cpl: 29.58,
    revenue: 40320,
    roas: 4.80,
    ctr: 7.8,
    convRate: 14.2,
    status: "Exceeding"
  },
  {
    id: "cmp-02",
    name: "GTA Luxury Buyer Meta Video Reels",
    platform: "Meta Ads",
    budget: 7500,
    spend: 6200,
    leads: 195,
    targetLeads: 180,
    cpl: 31.79,
    revenue: 19840,
    roas: 3.20,
    ctr: 4.8,
    convRate: 9.6,
    status: "Exceeding"
  },
  {
    id: "cmp-03",
    name: "Enterprise B2B Decision Maker Sponsored",
    platform: "LinkedIn Ads",
    budget: 8500,
    spend: 7800,
    leads: 98,
    targetLeads: 110,
    cpl: 79.59,
    revenue: 28080,
    roas: 3.60,
    ctr: 3.4,
    convRate: 18.5,
    status: "On Track"
  },
  {
    id: "cmp-04",
    name: "Organic CASL Compliance Hub Content",
    platform: "SEO Content",
    budget: 3500,
    spend: 3100,
    leads: 165,
    targetLeads: 120,
    cpl: 18.79,
    revenue: 22400,
    roas: 7.23,
    ctr: 8.5,
    convRate: 21.0,
    status: "Exceeding"
  },
  {
    id: "cmp-05",
    name: "Drip Nurture Double Opt-in Workflow",
    platform: "Email Nurture",
    budget: 2000,
    spend: 1850,
    leads: 82,
    targetLeads: 90,
    cpl: 22.56,
    revenue: 11100,
    roas: 6.00,
    ctr: 12.4,
    convRate: 28.5,
    status: "On Track"
  }
];

interface CampaignComparisonProps {
  campaigns?: any[];
}

export const CampaignComparison: React.FC<CampaignComparisonProps> = ({ campaigns }) => {
  // Map props or fallback
  const availableCampaigns: ComparisonCampaign[] = campaigns && campaigns.length >= 2
    ? campaigns.map((c, idx) => ({
        id: c.id || `cmp-${idx}`,
        name: c.title || c.name || `Campaign ${idx + 1}`,
        platform: c.platform || c.agent || "Multi-Channel",
        budget: Number(c.budget || c.allocatedBudget || 5000),
        spend: Number(c.spend || c.actualSpend || 4000),
        leads: Number(c.leads || c.generatedLeads || 100),
        targetLeads: Number(c.targetLeads || 100),
        cpl: Number(c.cpl || c.costPerLead || 40),
        revenue: Number(c.revenue || c.attributedRevenue || 15000),
        roas: Number(parseFloat(String(c.roas || "3.5")).toFixed(2)),
        ctr: Number(c.ctr || 5.2),
        convRate: Number(c.convRate || 12.0),
        status: c.status || "Active"
      }))
    : defaultComparisonPool;

  const [campaignAId, setCampaignAId] = useState<string>(availableCampaigns[0]?.id || "cmp-01");
  const [campaignBId, setCampaignBId] = useState<string>(availableCampaigns[1]?.id || "cmp-02");
  const [chartType, setChartType] = useState<"grouped" | "radar" | "financial">("grouped");

  const campaignA = availableCampaigns.find(c => c.id === campaignAId) || availableCampaigns[0];
  const campaignB = availableCampaigns.find(c => c.id === campaignBId) || availableCampaigns[1];

  // Helper for metric delta comparison
  const calculateDelta = (valA: number, valB: number, isLowerBetter = false) => {
    if (valB === 0) return { diff: valA, pct: 0, winner: "A" };
    const diff = valA - valB;
    const pct = ((valA - valB) / valB) * 100;
    
    let winner = "A";
    if (isLowerBetter) {
      winner = valA < valB ? "A" : valA > valB ? "B" : "Tie";
    } else {
      winner = valA > valB ? "A" : valA < valB ? "B" : "Tie";
    }

    return { diff, pct, winner };
  };

  const spendDelta = calculateDelta(campaignA.spend, campaignB.spend, true);
  const leadsDelta = calculateDelta(campaignA.leads, campaignB.leads);
  const cplDelta = calculateDelta(campaignA.cpl, campaignB.cpl, true);
  const revenueDelta = calculateDelta(campaignA.revenue, campaignB.revenue);
  const roasDelta = calculateDelta(campaignA.roas, campaignB.roas);
  const ctrDelta = calculateDelta(campaignA.ctr, campaignB.ctr);

  // Recharts Side-By-Side Grouped Data
  const groupedChartData = [
    { metric: "Spend ($ CAD)", [campaignA.name]: campaignA.spend, [campaignB.name]: campaignB.spend },
    { metric: "Leads Generated", [campaignA.name]: campaignA.leads, [campaignB.name]: campaignB.leads },
    { metric: "Revenue ($ CAD)", [campaignA.name]: campaignA.revenue, [campaignB.name]: campaignB.revenue },
    { metric: "CPL ($ CAD)", [campaignA.name]: campaignA.cpl, [campaignB.name]: campaignB.cpl },
    { metric: "ROAS (Multiple)", [campaignA.name]: campaignA.roas * 1000, [campaignB.name]: campaignB.roas * 1000 }, // scaled for visibility
  ];

  const financialChartData = [
    { category: "Allocated Budget", [campaignA.name]: campaignA.budget, [campaignB.name]: campaignB.budget },
    { category: "Actual Spend", [campaignA.name]: campaignA.spend, [campaignB.name]: campaignB.spend },
    { category: "Attributed Revenue", [campaignA.name]: campaignA.revenue, [campaignB.name]: campaignB.revenue },
    { category: "Net Profit", [campaignA.name]: campaignA.revenue - campaignA.spend, [campaignB.name]: campaignB.revenue - campaignB.spend },
  ];

  // Normalized 100-point scale radar data
  const maxLeads = Math.max(campaignA.leads, campaignB.leads) || 1;
  const maxRevenue = Math.max(campaignA.revenue, campaignB.revenue) || 1;
  const maxRoas = Math.max(campaignA.roas, campaignB.roas) || 1;
  const maxCtr = Math.max(campaignA.ctr, campaignB.ctr) || 1;
  const minCpl = Math.min(campaignA.cpl, campaignB.cpl) || 1;

  const radarData = [
    {
      subject: "Lead Volume",
      [campaignA.name]: Math.round((campaignA.leads / maxLeads) * 100),
      [campaignB.name]: Math.round((campaignB.leads / maxLeads) * 100),
    },
    {
      subject: "Revenue Yield",
      [campaignA.name]: Math.round((campaignA.revenue / maxRevenue) * 100),
      [campaignB.name]: Math.round((campaignB.revenue / maxRevenue) * 100),
    },
    {
      subject: "ROAS Efficiency",
      [campaignA.name]: Math.round((campaignA.roas / maxRoas) * 100),
      [campaignB.name]: Math.round((campaignB.roas / maxRoas) * 100),
    },
    {
      subject: "CTR Engagement",
      [campaignA.name]: Math.round((campaignA.ctr / maxCtr) * 100),
      [campaignB.name]: Math.round((campaignB.ctr / maxCtr) * 100),
    },
    {
      subject: "CPL Efficiency",
      [campaignA.name]: Math.round((minCpl / campaignA.cpl) * 100),
      [campaignB.name]: Math.round((minCpl / campaignB.cpl) * 100),
    }
  ];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">{entry.name}:</span>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === "number" && label.includes("ROAS")
                  ? `${(entry.value / 1000).toFixed(2)}x`
                  : typeof entry.value === "number" && (label.includes("$") || label.includes("Budget") || label.includes("Spend") || label.includes("Revenue") || label.includes("Profit"))
                  ? `$${entry.value.toLocaleString()} CAD`
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Head-to-Head Analytics
              </span>
              <span className="text-slate-400 text-xs">Side-by-Side Performance Matrix</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-emerald-400" />
              Campaign Comparison Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Compare two active campaigns side-by-side. Analyze efficiency deltas across spend, lead volume, CPL, revenue, and return on ad spend (ROAS).
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
            <Scale className="w-5 h-5 text-emerald-400" />
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-mono">Comparing</p>
              <p className="text-xs font-bold text-white font-mono truncate max-w-[180px]">
                {campaignA.platform} vs {campaignB.platform}
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Campaign A Dropdown */}
          <div className="bg-slate-950 p-3.5 rounded-xl border-2 border-emerald-500/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Campaign A (Primary)
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800">
                {campaignA.platform}
              </span>
            </div>
            <select
              value={campaignAId}
              onChange={(e) => setCampaignAId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-medium px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {availableCampaigns.map((c) => (
                <option key={`a-${c.id}`} value={c.id}>
                  {c.name} ({c.platform})
                </option>
              ))}
            </select>
          </div>

          {/* Campaign B Dropdown */}
          <div className="bg-slate-950 p-3.5 rounded-xl border-2 border-indigo-500/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Campaign B (Challenger)
              </span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-800">
                {campaignB.platform}
              </span>
            </div>
            <select
              value={campaignBId}
              onChange={(e) => setCampaignBId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-medium px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableCampaigns.map((c) => (
                <option key={`b-${c.id}`} value={c.id}>
                  {c.name} ({c.platform})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side KPI Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign A Scorecard */}
        <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Campaign A</p>
              <h3 className="text-sm font-bold text-slate-900">{campaignA.name}</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              {campaignA.roas}x ROAS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Actual Spend</p>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">${campaignA.spend.toLocaleString()} CAD</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Generated Leads</p>
              <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">{campaignA.leads} leads</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Cost Per Lead (CPL)</p>
              <p className="text-base font-bold text-indigo-600 font-mono mt-0.5">${campaignA.cpl.toFixed(2)} CAD</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Attributed Revenue</p>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">${campaignA.revenue.toLocaleString()} CAD</p>
            </div>
          </div>
        </div>

        {/* Campaign B Scorecard */}
        <div className="bg-white p-5 rounded-xl border-2 border-indigo-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Campaign B</p>
              <h3 className="text-sm font-bold text-slate-900">{campaignB.name}</h3>
            </div>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-200">
              {campaignB.roas}x ROAS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Actual Spend</p>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">${campaignB.spend.toLocaleString()} CAD</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Generated Leads</p>
              <p className="text-base font-bold text-indigo-600 font-mono mt-0.5">{campaignB.leads} leads</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Cost Per Lead (CPL)</p>
              <p className="text-base font-bold text-purple-600 font-mono mt-0.5">${campaignB.cpl.toFixed(2)} CAD</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-slate-500 text-[10px] uppercase font-medium">Attributed Revenue</p>
              <p className="text-base font-bold text-slate-900 font-mono mt-0.5">${campaignB.revenue.toLocaleString()} CAD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Recharts Comparison Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-emerald-600" />
              Side-by-Side Performance Chart
            </h3>
            <p className="text-xs text-slate-500">Visual comparison of key performance metrics across both campaigns</p>
          </div>

          {/* Chart Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1 text-xs">
            <button
              onClick={() => setChartType("grouped")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                chartType === "grouped" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview Bar
            </button>
            <button
              onClick={() => setChartType("financial")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                chartType === "financial" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Financial Outlay
            </button>
            <button
              onClick={() => setChartType("radar")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                chartType === "radar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Efficiency Radar
            </button>
          </div>
        </div>

        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "grouped" ? (
              <BarChart data={groupedChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey={campaignA.name} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey={campaignB.name} fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : chartType === "financial" ? (
              <BarChart data={financialChartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} unit=" $" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar dataKey={campaignA.name} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey={campaignB.name} fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#475569" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name={campaignA.name} dataKey={campaignA.name} stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name={campaignB.name} dataKey={campaignB.name} stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Tooltip />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delta Variance Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
              Metric Delta Variance & Outperformance Table
            </h3>
            <p className="text-xs text-slate-500">Calculated variance deltas between Campaign A and Campaign B</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded">
            Variance Analysis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Performance Metric</th>
                <th className="py-3 px-4 text-right">Campaign A ({campaignA.platform})</th>
                <th className="py-3 px-4 text-right">Campaign B ({campaignB.platform})</th>
                <th className="py-3 px-4 text-right">Absolute Difference</th>
                <th className="py-3 px-4 text-center">Percentage Delta</th>
                <th className="py-3 px-4 text-center">Outperforming Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* ROAS Row */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Return on Ad Spend (ROAS)</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{campaignA.roas}x</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">{campaignB.roas}x</td>
                <td className="py-3 px-4 text-right font-mono">{Math.abs(roasDelta.diff).toFixed(2)}x</td>
                <td className="py-3 px-4 text-center font-mono font-bold">
                  {roasDelta.pct > 0 ? `+${roasDelta.pct.toFixed(1)}%` : `${roasDelta.pct.toFixed(1)}%`}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    roasDelta.winner === "A" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                    roasDelta.winner === "B" ? "bg-indigo-100 text-indigo-800 border border-indigo-300" : "bg-slate-100 text-slate-700"
                  }`}>
                    {roasDelta.winner === "A" ? "Campaign A" : roasDelta.winner === "B" ? "Campaign B" : "Tie"}
                  </span>
                </td>
              </tr>

              {/* Cost Per Lead Row */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Cost Per Lead (CPL CAD)</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">${campaignA.cpl.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">${campaignB.cpl.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono">${Math.abs(cplDelta.diff).toFixed(2)}</td>
                <td className="py-3 px-4 text-center font-mono font-bold">
                  {cplDelta.pct > 0 ? `+${cplDelta.pct.toFixed(1)}%` : `${cplDelta.pct.toFixed(1)}%`}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    cplDelta.winner === "A" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                    cplDelta.winner === "B" ? "bg-indigo-100 text-indigo-800 border border-indigo-300" : "bg-slate-100 text-slate-700"
                  }`}>
                    {cplDelta.winner === "A" ? "Campaign A (Lower CPL)" : cplDelta.winner === "B" ? "Campaign B (Lower CPL)" : "Tie"}
                  </span>
                </td>
              </tr>

              {/* Lead Volume Row */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Generated Leads</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{campaignA.leads}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">{campaignB.leads}</td>
                <td className="py-3 px-4 text-right font-mono">{Math.abs(leadsDelta.diff)} leads</td>
                <td className="py-3 px-4 text-center font-mono font-bold">
                  {leadsDelta.pct > 0 ? `+${leadsDelta.pct.toFixed(1)}%` : `${leadsDelta.pct.toFixed(1)}%`}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    leadsDelta.winner === "A" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                    leadsDelta.winner === "B" ? "bg-indigo-100 text-indigo-800 border border-indigo-300" : "bg-slate-100 text-slate-700"
                  }`}>
                    {leadsDelta.winner === "A" ? "Campaign A" : leadsDelta.winner === "B" ? "Campaign B" : "Tie"}
                  </span>
                </td>
              </tr>

              {/* Revenue Row */}
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">Attributed Revenue (CAD)</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">${campaignA.revenue.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">${campaignB.revenue.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-mono">${Math.abs(revenueDelta.diff).toLocaleString()}</td>
                <td className="py-3 px-4 text-center font-mono font-bold">
                  {revenueDelta.pct > 0 ? `+${revenueDelta.pct.toFixed(1)}%` : `${revenueDelta.pct.toFixed(1)}%`}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    revenueDelta.winner === "A" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" :
                    revenueDelta.winner === "B" ? "bg-indigo-100 text-indigo-800 border border-indigo-300" : "bg-slate-100 text-slate-700"
                  }`}>
                    {revenueDelta.winner === "A" ? "Campaign A" : revenueDelta.winner === "B" ? "Campaign B" : "Tie"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Delta Strategic Summary Box */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>AI Campaign Comparison Insight</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed">
          {roasDelta.winner === "A" ? (
            <>
              <strong>{campaignA.name} ({campaignA.platform})</strong> outperforms <strong>{campaignB.name} ({campaignB.platform})</strong> with a <strong>{campaignA.roas}x ROAS</strong> vs {campaignB.roas}x. Campaign A captures leads at <strong>${campaignA.cpl.toFixed(2)} CPL</strong> (${Math.abs(campaignA.cpl - campaignB.cpl).toFixed(2)} CAD lower per lead than Campaign B).
            </>
          ) : (
            <>
              <strong>{campaignB.name} ({campaignB.platform})</strong> outperforms <strong>{campaignA.name} ({campaignA.platform})</strong> with a <strong>{campaignB.roas}x ROAS</strong> vs {campaignA.roas}x. Campaign B captures leads at <strong>${campaignB.cpl.toFixed(2)} CPL</strong> (${Math.abs(campaignA.cpl - campaignB.cpl).toFixed(2)} CAD lower per lead than Campaign A).
            </>
          )}
        </p>
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Optimization Directive: Reallocate budget toward {roasDelta.winner === "A" ? campaignA.platform : campaignB.platform}</span>
          <span className="text-emerald-400 font-bold">Estimated Lift: +22% Pipeline Yield</span>
        </div>
      </div>
    </div>
  );
};
