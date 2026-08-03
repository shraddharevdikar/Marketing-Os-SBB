import React, { useState } from "react";
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, Area, AreaChart, PieChart as RePieChart, Pie, Cell 
} from "recharts";
import { 
  TrendingUp, DollarSign, Target, Users, ArrowUpRight, ArrowDownRight, 
  Filter, Sparkles, Sliders, BarChart2, Zap, RefreshCw, Layers, Download, CheckCircle2 
} from "lucide-react";

interface RoiPerformanceVisualizerProps {
  companyProfile?: any;
  campaigns?: any[];
  leads?: any[];
}

export interface CampaignRoiMetric {
  id: string;
  name: string;
  platform: "Google Ads" | "Meta Ads" | "LinkedIn Ads" | "SEO Content" | "Email Nurture";
  allocatedBudget: number;
  actualSpend: number;
  generatedLeads: number;
  targetLeads: number;
  revenue: number;
  costPerLead: number;
  roas: number;
  roiPercentage: number;
  status: "Exceeding" | "On Track" | "Underperforming";
}

const defaultCampaignMetrics: CampaignRoiMetric[] = [
  {
    id: "cmp-01",
    name: "Q3 Search Intent High-Value Leads",
    platform: "Google Ads",
    allocatedBudget: 10000,
    actualSpend: 8400,
    generatedLeads: 284,
    targetLeads: 220,
    revenue: 40320,
    costPerLead: 29.58,
    roas: 4.80,
    roiPercentage: 380,
    status: "Exceeding"
  },
  {
    id: "cmp-02",
    name: "GTA Luxury Buyer Meta Video Reels",
    platform: "Meta Ads",
    allocatedBudget: 7500,
    actualSpend: 6200,
    generatedLeads: 195,
    targetLeads: 180,
    revenue: 19840,
    costPerLead: 31.79,
    roas: 3.20,
    roiPercentage: 220,
    status: "Exceeding"
  },
  {
    id: "cmp-03",
    name: "Enterprise B2B Decision Maker Sponsored",
    platform: "LinkedIn Ads",
    allocatedBudget: 8500,
    actualSpend: 7800,
    generatedLeads: 98,
    targetLeads: 110,
    revenue: 28080,
    costPerLead: 79.59,
    roas: 3.60,
    roiPercentage: 260,
    status: "On Track"
  },
  {
    id: "cmp-04",
    name: "Organic CASL Compliance Hub Content",
    platform: "SEO Content",
    allocatedBudget: 3500,
    actualSpend: 3100,
    generatedLeads: 165,
    targetLeads: 120,
    revenue: 22400,
    costPerLead: 18.79,
    roas: 7.23,
    roiPercentage: 623,
    status: "Exceeding"
  },
  {
    id: "cmp-05",
    name: "Drip Nurture Double Opt-in Workflow",
    platform: "Email Nurture",
    allocatedBudget: 2000,
    actualSpend: 1850,
    generatedLeads: 82,
    targetLeads: 90,
    revenue: 11100,
    costPerLead: 22.56,
    roas: 6.00,
    roiPercentage: 500,
    status: "On Track"
  }
];

const COLORS = ["#10b981", "#6366f1", "#0284c7", "#f59e0b", "#ec4899"];

export const RoiPerformanceVisualizer: React.FC<RoiPerformanceVisualizerProps> = ({
  companyProfile,
  campaigns,
  leads
}) => {
  const [metrics, setMetrics] = useState<CampaignRoiMetric[]>(defaultCampaignMetrics);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [chartViewMode, setChartViewMode] = useState<"financial" | "volume" | "efficiency">("financial");
  const [budgetMultiplier, setBudgetMultiplier] = useState<number>(100); // 100% baseline simulation
  const [exportedNotice, setExportedNotice] = useState<string | null>(null);

  const companyName = companyProfile?.companyName || "Sovereign Business";

  // CSV Export handler for campaign metrics
  const handleExportCampaignsCsv = () => {
    const headers = [
      "Campaign ID",
      "Campaign Name",
      "Platform",
      "Allocated Budget ($)",
      "Actual Spend ($)",
      "Generated Leads",
      "Target Leads",
      "Cost Per Lead ($ CPL)",
      "Attributed Revenue ($)",
      "ROAS",
      "Performance Status"
    ];

    const escapeCell = (cell: any) => {
      if (cell === null || cell === undefined) return '""';
      const str = String(cell).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = simulatedData.map(item => [
      item.id,
      item.name,
      item.platform,
      item.allocatedBudget,
      item.simulatedSpend,
      item.simulatedLeads,
      item.targetLeads,
      item.simulatedCpl,
      item.simulatedRevenue,
      `${item.simulatedRoas}x`,
      item.status
    ]);

    const csvContent = [
      headers.map(escapeCell).join(","),
      ...rows.map(row => row.map(escapeCell).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `campaign_roi_metrics_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedNotice(`Campaign ROI performance CSV archived (${simulatedData.length} records)`);
    setTimeout(() => setExportedNotice(null), 4000);
  };

  // Filtered campaigns
  const filteredData = metrics.filter(m => selectedPlatform === "All" || m.platform === selectedPlatform);

  // Scaled metrics based on interactive simulation slider
  const simulatedData = filteredData.map(m => {
    const factor = budgetMultiplier / 100;
    const simulatedSpend = Math.round(m.actualSpend * factor);
    const simulatedLeads = Math.round(m.generatedLeads * Math.pow(factor, 0.88)); // diminishing returns modeling
    const simulatedRevenue = Math.round(m.revenue * Math.pow(factor, 0.92));
    const simulatedCpl = simulatedLeads > 0 ? Number((simulatedSpend / simulatedLeads).toFixed(2)) : 0;
    const simulatedRoas = simulatedSpend > 0 ? Number((simulatedRevenue / simulatedSpend).toFixed(2)) : 0;

    return {
      ...m,
      nameShort: m.name.length > 22 ? m.name.substring(0, 22) + "..." : m.name,
      simulatedSpend,
      simulatedLeads,
      simulatedRevenue,
      simulatedCpl,
      simulatedRoas
    };
  });

  // Calculate totals
  const totalBudget = simulatedData.reduce((a, b) => a + b.allocatedBudget, 0);
  const totalSpend = simulatedData.reduce((a, b) => a + b.simulatedSpend, 0);
  const totalRevenue = simulatedData.reduce((a, b) => a + b.simulatedRevenue, 0);
  const totalLeads = simulatedData.reduce((a, b) => a + b.simulatedLeads, 0);
  const totalTargetLeads = simulatedData.reduce((a, b) => a + b.targetLeads, 0);
  const avgCpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0.00";
  const overallRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0.00";
  const totalNetProfit = totalRevenue - totalSpend;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-lg border border-slate-700 shadow-xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-100">
                {typeof entry.value === "number" && entry.name.toLowerCase().includes("lead")
                  ? entry.value.toLocaleString() + " leads"
                  : typeof entry.value === "number" && (entry.name.toLowerCase().includes("cpl") || entry.name.toLowerCase().includes("cost"))
                  ? `$${entry.value.toFixed(2)}`
                  : typeof entry.value === "number" && entry.name.toLowerCase().includes("roas")
                  ? `${entry.value}x`
                  : typeof entry.value === "number"
                  ? `$${entry.value.toLocaleString()}`
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
      {/* Top Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Interactive Recharts Visualizer
              </span>
              <span className="text-slate-400 text-xs">Live Budget vs Lead Generation Performance</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-emerald-400" />
              ROI & Lead Performance Engine
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Cross-campaign financial ROI analysis for {companyName}. Compare allocated budgets against actual lead volumes, revenue yield, and cost-per-lead efficiency.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700 p-3 rounded-xl">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Net Profit Yield</p>
              <p className="text-lg font-black text-emerald-400 font-mono">
                ${totalNetProfit > 0 ? `+${totalNetProfit.toLocaleString()}` : totalNetProfit.toLocaleString()}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-700" />
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Overall ROAS</p>
              <p className="text-lg font-black text-white font-mono">{overallRoas}x</p>
            </div>
          </div>
        </div>

        {/* Simulation Slider Control */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Budget Scaling Simulator:</span>
            <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              {budgetMultiplier}% Budget Baseline
            </span>
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-slate-400 text-[10px] font-mono">50%</span>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={budgetMultiplier}
              onChange={(e) => setBudgetMultiplier(parseInt(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-slate-400 text-[10px] font-mono">200%</span>
          </div>

          <button
            onClick={() => setBudgetMultiplier(100)}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Allocated vs Actual Spend</p>
            <p className="text-xl font-bold text-slate-900 mt-1 font-mono">${totalSpend.toLocaleString()}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Budget: <span className="font-semibold text-slate-700">${totalBudget.toLocaleString()}</span>
            </p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Actual Leads Generated</p>
            <p className="text-xl font-bold text-emerald-600 mt-1 font-mono">{totalLeads.toLocaleString()} leads</p>
            <p className="text-emerald-600 text-[11px] mt-0.5 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {totalLeads >= totalTargetLeads ? "Exceeding Target" : "Under Target"} ({totalTargetLeads} target)
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Average Cost Per Lead (CPL)</p>
            <p className="text-xl font-bold text-indigo-600 mt-1 font-mono">${avgCpl}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Target CPL Benchmark: <span className="font-semibold text-slate-700">$38.00</span>
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Attributed Revenue</p>
            <p className="text-xl font-bold text-slate-900 mt-1 font-mono">${totalRevenue.toLocaleString()}</p>
            <p className="text-emerald-600 text-[11px] mt-0.5 font-bold">
              {overallRoas}x Return on Ad Spend
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recharts Visualizer Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              Campaign Performance Recharts Visualizer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select visual mode to compare financial outlay against lead conversion volume and CPL efficiency.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setChartViewMode("financial")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  chartViewMode === "financial" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Budget vs Revenue
              </button>
              <button
                onClick={() => setChartViewMode("volume")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  chartViewMode === "volume" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Leads vs Target
              </button>
              <button
                onClick={() => setChartViewMode("efficiency")}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  chartViewMode === "efficiency" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                CPL & ROAS Efficiency
              </button>
            </div>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Channels</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="LinkedIn Ads">LinkedIn Ads</option>
              <option value="SEO Content">SEO Content</option>
              <option value="Email Nurture">Email Nurture</option>
            </select>
          </div>
        </div>

        {/* Dynamic Chart Container */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartViewMode === "financial" ? (
              <ComposedChart data={simulatedData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="nameShort" 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} unit=" $" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} unit=" $" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar yAxisId="left" dataKey="allocatedBudget" name="Allocated Budget ($)" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar yAxisId="left" dataKey="simulatedSpend" name="Actual Spend ($)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="simulatedRevenue" name="Attributed Revenue ($)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            ) : chartViewMode === "volume" ? (
              <ComposedChart data={simulatedData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="nameShort" 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} unit=" $" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar yAxisId="left" dataKey="targetLeads" name="Target Leads" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar yAxisId="left" dataKey="simulatedLeads" name="Actual Generated Leads" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="simulatedSpend" name="Campaign Spend ($)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            ) : (
              <ComposedChart data={simulatedData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="nameShort" 
                  tick={{ fontSize: 11, fill: "#64748b" }} 
                  interval={0}
                  angle={-10}
                  textAnchor="end"
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#64748b" }} unit=" $" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} unit="x" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar yAxisId="left" dataKey="simulatedCpl" name="Cost Per Lead ($ CPL)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28} />
                <Line yAxisId="right" type="monotone" dataKey="simulatedRoas" name="ROAS (Return Multiple)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportedNotice && (
        <div className="bg-emerald-900 text-emerald-100 p-3.5 rounded-xl border border-emerald-500/40 shadow-lg flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">{exportedNotice}</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-800 text-emerald-300 px-2 py-0.5 rounded">CSV DOWNLOADED</span>
        </div>
      )}

      {/* Campaign Detail Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Detailed Campaign Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Individual campaign variance and efficiency statistics</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1.5 rounded">
              {simulatedData.length} Campaigns
            </span>
            <button
              onClick={handleExportCampaignsCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Campaign & Platform</th>
                <th className="py-3 px-4 text-right">Budget</th>
                <th className="py-3 px-4 text-right">Actual Spend</th>
                <th className="py-3 px-4 text-right">Leads (Target)</th>
                <th className="py-3 px-4 text-right">Cost / Lead</th>
                <th className="py-3 px-4 text-right">Attributed Rev</th>
                <th className="py-3 px-4 text-center">ROAS</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {simulatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono border border-slate-200 mt-0.5">
                      {item.platform}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    ${item.allocatedBudget.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-semibold">
                    ${item.simulatedSpend.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className="font-bold text-emerald-600">{item.simulatedLeads}</span>
                    <span className="text-slate-400 text-[10px]"> / {item.targetLeads}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-indigo-600">
                    ${item.simulatedCpl.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ${item.simulatedRevenue.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-xs">
                      {item.simulatedRoas}x
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      item.status === "Exceeding" ? "bg-emerald-600 text-white" :
                      item.status === "On Track" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
