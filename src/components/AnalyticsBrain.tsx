import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Cell
} from "recharts";
import { 
  BarChart3, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight, DollarSign, Users, Target, Activity, RefreshCw,
  Download, FileSpreadsheet, CheckCircle2, ChevronDown, Archive, Zap, Sparkles, Filter, Sliders, Layers, GitCompare, ArrowRight,
  HelpCircle, Eye, AlertTriangle, AlertCircle, ShieldAlert, BellRing, Bell, SlidersHorizontal, Check, ShieldCheck, Compass
} from "lucide-react";
import { RoiPerformanceVisualizer } from "./RoiPerformanceVisualizer";
import { CampaignComparison } from "./CampaignComparison";
import { LeadFunnelVisualizer } from "./LeadFunnelVisualizer";
import { RoiAlert } from "../types";
import { loadStoredRoiAlerts, saveStoredRoiAlerts, initialRoiAlerts } from "../lib/roiAlertsData";

interface AnalyticsBrainProps {
  companyProfile: any;
  leads: any[];
  campaigns: any[];
  onLogAction: (action: string, details: string) => void;
  onNavigateToTab: (tab: string) => void;
  roiAlerts?: RoiAlert[];
  onUpdateRoiAlerts?: (alerts: RoiAlert[]) => void;
  onAcknowledgeRoiAlert?: (alertId: string) => void;
  onResolveRoiAlert?: (alertId: string) => void;
}

export interface ChannelRoiMetric {
  id: string;
  channel: string;
  category: "Paid Search" | "Paid Social" | "Organic" | "Email / Direct";
  projectedRoi: number; // percentage, e.g. 320 for 320%
  actualRoi: number;    // percentage, e.g. 380 for 380%
  projectedRoas: number; // multiplier, e.g. 3.2
  actualRoas: number;    // multiplier, e.g. 3.8
  allocatedBudget: number;
  actualSpend: number;
  projectedRevenue: number;
  actualRevenue: number;
  leadsGenerated: number;
  targetLeads: number;
  costPerLead: number;
  status: "Exceeding Target" | "On Track" | "Needs Optimization";
  recommendation: string;
}

const defaultChannelMetrics: ChannelRoiMetric[] = [
  {
    id: "ch-01",
    channel: "Google Ads (Search & PMax)",
    category: "Paid Search",
    projectedRoi: 320,
    actualRoi: 380,
    projectedRoas: 3.2,
    actualRoas: 3.8,
    allocatedBudget: 10000,
    actualSpend: 8400,
    projectedRevenue: 32000,
    actualRevenue: 40320,
    leadsGenerated: 284,
    targetLeads: 220,
    costPerLead: 29.58,
    status: "Exceeding Target",
    recommendation: "Scale budget by +20% on top 3 exact-match high-intent search themes"
  },
  {
    id: "ch-02",
    channel: "Meta Ads (Reels & Feed)",
    category: "Paid Social",
    projectedRoi: 280,
    actualRoi: 320,
    projectedRoas: 2.8,
    actualRoas: 3.2,
    allocatedBudget: 7500,
    actualSpend: 6200,
    projectedRevenue: 21000,
    actualRevenue: 19840,
    leadsGenerated: 195,
    targetLeads: 180,
    costPerLead: 31.79,
    status: "Exceeding Target",
    recommendation: "Reallocate creative budget to high-retention vertical video reels"
  },
  {
    id: "ch-03",
    channel: "LinkedIn Ads (B2B Sponsored)",
    category: "Paid Social",
    projectedRoi: 300,
    actualRoi: 260,
    projectedRoas: 3.0,
    actualRoas: 2.6,
    allocatedBudget: 8500,
    actualSpend: 7800,
    projectedRevenue: 34000,
    actualRevenue: 28080,
    leadsGenerated: 98,
    targetLeads: 110,
    costPerLead: 79.59,
    status: "Needs Optimization",
    recommendation: "Tighten company size filters and deploy conversational lead gen forms"
  },
  {
    id: "ch-04",
    channel: "Organic SEO & Content Hub",
    category: "Organic",
    projectedRoi: 450,
    actualRoi: 620,
    projectedRoas: 4.5,
    actualRoas: 6.2,
    allocatedBudget: 3500,
    actualSpend: 3100,
    projectedRevenue: 15750,
    actualRevenue: 22400,
    leadsGenerated: 165,
    targetLeads: 120,
    costPerLead: 18.79,
    status: "Exceeding Target",
    recommendation: "Accelerate provincial compliance guide cluster publication"
  },
  {
    id: "ch-05",
    channel: "Email Nurture & Automations",
    category: "Email / Direct",
    projectedRoi: 400,
    actualRoi: 500,
    projectedRoas: 4.0,
    actualRoas: 5.0,
    allocatedBudget: 2000,
    actualSpend: 1850,
    projectedRevenue: 8000,
    actualRevenue: 11100,
    leadsGenerated: 82,
    targetLeads: 90,
    costPerLead: 22.56,
    status: "Exceeding Target",
    recommendation: "Trigger SMS notification sequences for hot leads with score >85"
  },
  {
    id: "ch-06",
    channel: "TikTok Ads & Creator Hooks",
    category: "Paid Social",
    projectedRoi: 220,
    actualRoi: 190,
    projectedRoas: 2.2,
    actualRoas: 1.9,
    allocatedBudget: 4000,
    actualSpend: 3600,
    projectedRevenue: 8800,
    actualRevenue: 6840,
    leadsGenerated: 74,
    targetLeads: 85,
    costPerLead: 48.65,
    status: "Needs Optimization",
    recommendation: "Refine localized hooks to improve initial 3-second hook retention"
  }
];

const fallbackLeads = [
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
    leadOwner: "Victoria VP Hastings"
  },
  {
    id: "LEAD-102",
    name: "Sophia Chen",
    company: "Apex Tech Innovations",
    email: "s.chen@apextech.io",
    phone: "+1 (647) 555-0823",
    territory: "Ontario (ON)",
    source: "Google Ads Search",
    serviceInterest: "Enterprise Cloud Advisory",
    leadScore: 88,
    status: "In Discussion",
    leadOwner: "Thomas TL Jenkins"
  },
  {
    id: "LEAD-103",
    name: "Marcus Sterling",
    company: "Sterling Financial Group",
    email: "m.sterling@sterlingfin.com",
    phone: "+1 (416) 555-0411",
    territory: "British Columbia (BC)",
    source: "LinkedIn Ads",
    serviceInterest: "Asset Management Consultation",
    leadScore: 91,
    status: "Closed Won",
    leadOwner: "Victoria VP Hastings"
  },
  {
    id: "LEAD-104",
    name: "Elena Rostova",
    company: "Rostova Luxury Goods",
    email: "e.rostova@rostova.ca",
    phone: "+1 (905) 555-0988",
    territory: "Ontario (ON)",
    source: "Meta Ads Video",
    serviceInterest: "Private Wealth Marketing",
    leadScore: 82,
    status: "Closed Won",
    leadOwner: "Miriam Manager Mercer"
  },
  {
    id: "LEAD-105",
    name: "David Miller",
    company: "Miller Construction Ltd",
    email: "d.miller@millerconst.ca",
    phone: "+1 (519) 555-0344",
    territory: "Alberta (AB)",
    source: "Email Nurture Drip",
    serviceInterest: "Industrial Real Estate",
    leadScore: 76,
    status: "Attempted Contact",
    leadOwner: "Thomas TL Jenkins"
  }
];

const fallbackCampaigns = [
  { id: "CMP-01", title: "Q3 Search Intent High-Value Leads", platform: "Google Ads", budget: 10000, spend: 8400, leads: 284, cpl: 29.58, revenue: 40320, roas: "4.8x", status: "Exceeding" },
  { id: "CMP-02", title: "Luxury Buyer Meta Video Reels", platform: "Meta Ads", budget: 7500, spend: 6200, leads: 195, cpl: 31.79, revenue: 19840, roas: "3.2x", status: "Exceeding" },
  { id: "CMP-03", title: "Enterprise B2B Decision Maker Sponsored", platform: "LinkedIn Ads", budget: 8500, spend: 7800, leads: 98, cpl: 79.59, revenue: 28080, roas: "3.6x", status: "On Track" },
  { id: "CMP-04", title: "Organic Global Compliance Hub Content", platform: "SEO Content", budget: 3500, spend: 3100, leads: 165, cpl: 18.79, revenue: 22400, roas: "7.2x", status: "Exceeding" },
  { id: "CMP-05", title: "Drip Nurture Double Opt-in Workflow", platform: "Email Nurture", budget: 2000, spend: 1850, leads: 82, cpl: 22.56, revenue: 11100, roas: "6.0x", status: "On Track" }
];

export const AnalyticsBrain: React.FC<AnalyticsBrainProps> = ({
  companyProfile,
  leads = [],
  campaigns = [],
  onLogAction,
  onNavigateToTab,
  roiAlerts,
  onUpdateRoiAlerts,
  onAcknowledgeRoiAlert,
  onResolveRoiAlert
}) => {
  const [attributionModel, setAttributionModel] = useState("Linear");
  const [activeTab, setActiveTab] = useState<"channel-roi" | "fluctuation-alerts" | "roi" | "comparison" | "overview" | "funnel" | "attribution">("channel-roi");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ROI Fluctuation Alert System State
  const [internalAlerts, setInternalAlerts] = useState<RoiAlert[]>(() => roiAlerts || loadStoredRoiAlerts());
  const alerts = roiAlerts || internalAlerts;

  const updateAlertsState = (newAlerts: RoiAlert[]) => {
    setInternalAlerts(newAlerts);
    saveStoredRoiAlerts(newAlerts);
    onUpdateRoiAlerts?.(newAlerts);
  };

  const [alertFilter, setAlertFilter] = useState<"all" | "action_required" | "acknowledged" | "resolved">("all");
  const [sensitivityThreshold, setSensitivityThreshold] = useState<number>(15);
  const [monitoringWindow, setMonitoringWindow] = useState<string>("Trailing 48h");
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const actionRequiredAlerts = alerts.filter(a => a.status === "action_required");
  const actionRequiredCount = actionRequiredAlerts.length;

  const handleAcknowledge = (alertId: string) => {
    if (onAcknowledgeRoiAlert) {
      onAcknowledgeRoiAlert(alertId);
    } else {
      const updated = alerts.map(a => a.id === alertId ? { ...a, status: "acknowledged" as const } : a);
      updateAlertsState(updated);
    }
    const target = alerts.find(a => a.id === alertId);
    onLogAction("ROI_ALERT_ACKNOWLEDGED", `User acknowledged sudden ROI fluctuation alert on ${target?.channelName || alertId}.`);
    showToast(`Alert acknowledged for ${target?.channelName || alertId}`);
  };

  const handleResolve = (alertId: string) => {
    if (onResolveRoiAlert) {
      onResolveRoiAlert(alertId);
    } else {
      const updated = alerts.map(a => a.id === alertId ? { ...a, status: "resolved" as const } : a);
      updateAlertsState(updated);
    }
    const target = alerts.find(a => a.id === alertId);
    onLogAction("ROI_ALERT_RESOLVED", `User marked ROI fluctuation on ${target?.channelName || alertId} as resolved.`);
    showToast(`ROI alert resolved for ${target?.channelName || alertId}`);
  };

  const handleRunDiagnosticScan = () => {
    setIsScanning(true);
    setScanMessage(`AnalyticsBrain Daemon scanning 6 omni-channels against ${sensitivityThreshold}% variance hurdle...`);
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage(null);
      showToast(`Scan complete: ${actionRequiredCount} active sudden ROI fluctuations detected exceeding ${sensitivityThreshold}% hurdle.`);
      onLogAction("ROI_DIAGNOSTIC_SCAN", `Ran live ROI fluctuation diagnostic scan. Detected ${actionRequiredCount} action-required events.`);
    }, 850);
  };

  const handleSimulateSuddenDrop = () => {
    const candidateChannels = [
      { name: "Google Ads (Search & PMax)", previous: 380, dropTo: 245, delta: -35.5, campaign: "CMP-01", impact: 6400, reason: "Sudden spike in negative keyword leakage drove CPC from $2.80 to $6.10, compressing net channel ROI by -35.5%." },
      { name: "Meta Ads (Reels & Feed)", previous: 320, dropTo: 210, delta: -34.4, campaign: "CMP-02", impact: 4800, reason: "Ad creative saturation on Ontario luxury buyer audience caused CPM surge and -34.4% drop in ROAS." },
      { name: "Organic SEO & Content Hub", previous: 620, dropTo: 430, delta: -30.6, campaign: "CMP-04", impact: 3200, reason: "Search algorithm core update caused transient volatility in page 1 SERP rankings, dropping organic ROI." }
    ];
    const chosen = candidateChannels.find(c => !alerts.some(a => a.channelName === c.name && a.status === "action_required")) || candidateChannels[0];
    
    const newAlert: RoiAlert = {
      id: "ALERT-ROI-" + Math.floor(100 + Math.random() * 900),
      campaignId: chosen.campaign,
      channelName: chosen.name,
      type: "sudden_drop",
      severity: "critical",
      previousRoi: chosen.previous,
      currentRoi: chosen.dropTo,
      fluctuationPercentage: chosen.delta,
      timeframe: "Last 24h",
      thresholdTriggered: sensitivityThreshold,
      timestamp: "Just now",
      status: "action_required",
      recommendedAction: `Inspect ${chosen.name} ad sets and reallocate underutilized budget to high-performing baseline campaigns.`,
      sourceMetric: `${chosen.name} Telemetry Stream`,
      details: chosen.reason,
      attributedImpactCad: chosen.impact
    };

    const updated = [newAlert, ...alerts];
    updateAlertsState(updated);
    onLogAction("SIMULATE_ROI_DROP", `Simulated sudden ROI drop of ${chosen.delta}% on ${chosen.name}. Action Required flag dispatched to ExecutiveDashboard.`);
    showToast(`⚠️ Simulated sudden ROI drop on ${chosen.name}: Action Required flag dispatched to ExecutiveDashboard!`);
  };

  const handleResetAlerts = () => {
    updateAlertsState(initialRoiAlerts);
    showToast("Reset ROI alerts to default diagnostic set");
    onLogAction("RESET_ROI_ALERTS", "Reset ROI alerts to default diagnostic state.");
  };

  // Recharts Channel ROI Controls
  const [channelCategoryFilter, setChannelCategoryFilter] = useState<string>("All");
  const [channelRoiMetricMode, setChannelRoiMetricMode] = useState<"percentage" | "roas" | "revenue">("percentage");
  const [channelSortBy, setChannelSortBy] = useState<"actualRoi" | "variance" | "spend">("actualRoi");
  const [channelMetrics] = useState<ChannelRoiMetric[]>(defaultChannelMetrics);

  const activeLeads = leads && leads.length > 0 ? leads : fallbackLeads;
  const activeCampaigns = campaigns && campaigns.length > 0 ? campaigns : fallbackCampaigns;

  const closedWonCount = activeLeads.filter((l: any) => l.status === "Closed Won").length || 4;
  const estimatedRevenue = (closedWonCount * 4500).toLocaleString();

  // Aggregate stats for Channel ROI visualizer
  const filteredChannels = channelMetrics.filter(
    c => channelCategoryFilter === "All" || c.category === channelCategoryFilter
  );

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    if (channelSortBy === "actualRoi") return b.actualRoi - a.actualRoi;
    if (channelSortBy === "variance") return (b.actualRoi - b.projectedRoi) - (a.actualRoi - a.projectedRoi);
    if (channelSortBy === "spend") return b.actualSpend - a.actualSpend;
    return 0;
  });

  const topRoiChannel = [...channelMetrics].sort((a, b) => b.actualRoi - a.actualRoi)[0];
  const avgProjectedRoi = Math.round(channelMetrics.reduce((acc, c) => acc + c.projectedRoi, 0) / channelMetrics.length);
  const avgActualRoi = Math.round(channelMetrics.reduce((acc, c) => acc + c.actualRoi, 0) / channelMetrics.length);
  const netRoiSpread = avgActualRoi - avgProjectedRoi;
  const totalAttributedRevenue = channelMetrics.reduce((acc, c) => acc + c.actualRevenue, 0);
  const totalActualSpend = channelMetrics.reduce((acc, c) => acc + c.actualSpend, 0);
  const totalLeadsCount = channelMetrics.reduce((acc, c) => acc + c.leadsGenerated, 0);
  const blendedRoas = totalActualSpend > 0 ? (totalAttributedRevenue / totalActualSpend).toFixed(2) : "0.00";

  // CSV Generator Helper
  const triggerCsvDownload = (filename: string, headers: string[], rows: (string | number | boolean)[][]) => {
    const escapeCell = (cell: any) => {
      if (cell === null || cell === undefined) return '""';
      const str = String(cell).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvContent = [
      headers.map(escapeCell).join(","),
      ...rows.map(row => row.map(escapeCell).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Export: Channel Projected vs Actual ROI CSV
  const exportChannelRoiToCsv = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Marketing Channel",
      "Category",
      "Allocated Budget ($)",
      "Actual Spend ($)",
      "Projected ROI (%)",
      "Actual ROI (%)",
      "ROI Variance (%)",
      "Projected ROAS",
      "Actual ROAS",
      "Projected Revenue ($)",
      "Actual Revenue ($)",
      "Generated Leads",
      "Target Leads",
      "Cost Per Lead ($ CPL)",
      "Performance Status",
      "Strategic Directive"
    ];

    const rows = channelMetrics.map(c => [
      c.channel,
      c.category,
      c.allocatedBudget,
      c.actualSpend,
      `${c.projectedRoi}%`,
      `${c.actualRoi}%`,
      `${c.actualRoi >= c.projectedRoi ? "+" : ""}${c.actualRoi - c.projectedRoi}%`,
      `${c.projectedRoas}x`,
      `${c.actualRoas}x`,
      c.projectedRevenue,
      c.actualRevenue,
      c.leadsGenerated,
      c.targetLeads,
      c.costPerLead.toFixed(2),
      c.status,
      c.recommendation
    ]);

    triggerCsvDownload(`channel_projected_vs_actual_roi_${dateStr}.csv`, headers, rows);
    onLogAction("EXPORT_CHANNEL_ROI_CSV", `Exported channel projected vs actual ROI performance to CSV (${rows.length} records).`);
    showToast(`Channel ROI analysis exported to CSV (${rows.length} channels)`);
    setIsExportOpen(false);
  };

  // Export 1: Campaigns CSV
  const exportCampaignsToCsv = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Campaign ID",
      "Campaign Title",
      "Platform Channel",
      "Allocated Budget ($)",
      "Actual Spend ($)",
      "Leads Generated",
      "Cost Per Lead ($)",
      "Attributed Revenue ($)",
      "ROAS",
      "Status"
    ];

    const rows = activeCampaigns.map((c: any) => [
      c.id || c.title?.substring(0, 8),
      c.title || c.name || "Campaign",
      c.platform || c.agent || "Multi-Channel",
      c.budget || c.allocatedBudget || 5000,
      c.spend || c.actualSpend || 4200,
      c.leads || c.generatedLeads || 120,
      c.cpl || c.costPerLead || 35.00,
      c.revenue || c.attributedRevenue || 18500,
      c.roas || "3.5x",
      c.status || "Active"
    ]);

    triggerCsvDownload(`analytics_campaign_roi_${dateStr}.csv`, headers, rows);
    onLogAction("EXPORT_CAMPAIGN_CSV", `Exported ${rows.length} campaign ROI records to CSV.`);
    showToast(`Campaign ROI performance exported to CSV (${rows.length} campaigns)`);
    setIsExportOpen(false);
  };

  // Export 2: Leads Telemetry CSV
  const exportLeadsToCsv = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Lead ID",
      "Contact Name",
      "Company",
      "Email Address",
      "Phone Number",
      "Territory",
      "Acquisition Channel Source",
      "Service Interest",
      "Lead Score",
      "Lead Owner",
      "Pipeline Status"
    ];

    const rows = activeLeads.map((l: any) => [
      l.id || "LEAD-00",
      l.name || "N/A",
      l.company || "N/A",
      l.email || "N/A",
      l.phone || "N/A",
      l.territory || "Ontario (ON)",
      l.source || "SEO Organic",
      l.serviceInterest || "General Inquiry",
      l.leadScore || 80,
      l.leadOwner || "Unassigned",
      l.status || "New"
    ]);

    triggerCsvDownload(`analytics_lead_telemetry_${dateStr}.csv`, headers, rows);
    onLogAction("EXPORT_LEADS_CSV", `Exported ${rows.length} lead telemetry records to CSV.`);
    showToast(`Lead telemetry database exported to CSV (${rows.length} leads)`);
    setIsExportOpen(false);
  };

  // Export 3: Complete Archive CSV
  const exportFullArchiveToCsv = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Record Type",
      "ID / Ref",
      "Name / Title",
      "Platform / Source",
      "Budget / Email",
      "Spend / Phone",
      "Leads / Territory",
      "Revenue / Interest",
      "ROAS / Score",
      "Status"
    ];

    const campaignRows = activeCampaigns.map((c: any) => [
      "CAMPAIGN_METRIC",
      c.id || "CMP",
      c.title || c.name || "Campaign",
      c.platform || "Digital Ads",
      c.budget || 5000,
      c.spend || 4200,
      c.leads || 120,
      c.revenue || 18500,
      c.roas || "3.5x",
      c.status || "Active"
    ]);

    const leadRows = activeLeads.map((l: any) => [
      "LEAD_RECORD",
      l.id || "LEAD",
      l.name || "Contact",
      l.source || "Organic",
      l.email || "-",
      l.phone || "-",
      l.territory || "ON",
      l.serviceInterest || "Consultation",
      l.leadScore || 85,
      l.status || "Qualified"
    ]);

    const combinedRows = [...campaignRows, ...leadRows];

    triggerCsvDownload(`analytics_full_archive_${dateStr}.csv`, headers, combinedRows);
    onLogAction("EXPORT_FULL_ARCHIVE_CSV", `Exported full analytics archive (${combinedRows.length} combined records) to CSV.`);
    showToast(`Full performance archive downloaded (${combinedRows.length} total records)`);
    setIsExportOpen(false);
  };

  // Custom Recharts Tooltip for Channel Projected vs Actual ROI
  const ChannelCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload as ChannelRoiMetric;
      if (!data) return null;
      const varianceRoi = data.actualRoi - data.projectedRoi;
      const isAhead = varianceRoi >= 0;

      return (
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-2xl text-xs space-y-2.5 font-sans max-w-xs z-50">
          <div className="border-b border-slate-800 pb-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white text-sm">{data.channel}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {data.category}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                data.status === "Exceeding Target" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                data.status === "On Track" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {data.status}
              </span>
              <span className={`text-[10px] font-mono font-bold ${isAhead ? "text-emerald-400" : "text-amber-400"}`}>
                {isAhead ? `+${varianceRoi}%` : `${varianceRoi}%`} vs Projected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] py-1">
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Projected ROI</p>
              <p className="font-bold text-slate-300 font-mono text-base">{data.projectedRoi}%</p>
              <p className="text-[10px] text-slate-400 font-mono">{data.projectedRoas}x ROAS</p>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Actual Realized ROI</p>
              <p className="font-bold text-emerald-400 font-mono text-base">{data.actualRoi}%</p>
              <p className="text-[10px] text-emerald-300 font-mono">{data.actualRoas}x ROAS</p>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Budget vs Spend:</span>
              <span className="font-mono font-bold">${data.actualSpend.toLocaleString()} <span className="text-slate-500">/ ${data.allocatedBudget.toLocaleString()}</span></span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Attributed Revenue:</span>
              <span className="font-mono font-bold text-emerald-400">${data.actualRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Leads & CPL:</span>
              <span className="font-mono font-bold">{data.leadsGenerated} leads (${data.costPerLead.toFixed(2)} CPL)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-300/90 italic flex items-start gap-1.5 leading-snug">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>{data.recommendation}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-900 text-emerald-100 p-4 rounded-xl border border-emerald-500/40 shadow-xl flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
          <span className="text-[10px] font-mono bg-emerald-800 text-emerald-200 px-2.5 py-1 rounded border border-emerald-700">
            CSV LOCAL ARCHIVE
          </span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-800/40 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                SBB Analytics Core v2.4
              </span>
              <span className="text-emerald-400 text-xs">• Real-Time Telemetry & CSV Archiving</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              SBB Analytics & Attribution Brain
            </h2>
            <p className="text-xs text-emerald-200/80 max-w-2xl">
              Multi-touch attribution modeling, conversion funnel telemetry, and cross-channel ROI analytics for {companyProfile?.companyName || "Sovereign Business"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-emerald-800/50 rounded-xl p-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[10px] font-mono text-emerald-300 uppercase">Attributed Pipeline Revenue</p>
                <p className="text-lg font-bold font-mono text-white">${estimatedRevenue}</p>
              </div>
            </div>

            {/* CSV Export Suite Menu */}
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl border border-emerald-400/30 flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export CSV Data</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-1 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Archive Performance CSV
                    </p>
                    <p className="text-[10px] text-slate-400">Download formatted spreadsheet metrics</p>
                  </div>

                  <button
                    onClick={exportCampaignsToCsv}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold group-hover:text-emerald-400">Campaign ROI Metrics (.csv)</div>
                      <div className="text-[10px] text-slate-400">{activeCampaigns.length} Active Campaigns & Spend</div>
                    </div>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  </button>

                  <button
                    onClick={exportLeadsToCsv}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold group-hover:text-emerald-400">Lead Telemetry Records (.csv)</div>
                      <div className="text-[10px] text-slate-400">{activeLeads.length} Captured CRM Leads</div>
                    </div>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </button>

                  <button
                    onClick={exportChannelRoiToCsv}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold group-hover:text-emerald-400">Channel Projected vs Actual ROI (.csv)</div>
                      <div className="text-[10px] text-slate-400">{channelMetrics.length} Channels with ROI & ROAS Spread</div>
                    </div>
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                  </button>

                  <button
                    onClick={exportFullArchiveToCsv}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-emerald-400">Full Performance Archive (.csv)</div>
                      <div className="text-[10px] text-emerald-200/70">Combined Campaigns, Channels & Leads</div>
                    </div>
                    <Archive className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("channel-roi")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "channel-roi" ? "border-emerald-600 text-emerald-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>Channel ROI: Projected vs Actual</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-mono font-bold">RECHARTS BAR CHART</span>
        </button>
        <button
          id="tab-btn-fluctuation-alerts"
          onClick={() => setActiveTab("fluctuation-alerts")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "fluctuation-alerts" ? "border-rose-600 text-rose-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${actionRequiredCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-400"}`} />
          <span>ROI Fluctuation Alerts</span>
          {actionRequiredCount > 0 ? (
            <span className="bg-rose-100 text-rose-700 text-[9px] px-2 py-0.5 rounded-full font-mono font-black border border-rose-300 animate-pulse">
              {actionRequiredCount} ACTION REQUIRED
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
              ALL STABLE
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("roi")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "roi" ? "border-emerald-600 text-emerald-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>ROI & Budget Visualizer</span>
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "comparison" ? "border-emerald-600 text-emerald-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <GitCompare className="w-4 h-4 text-emerald-600" />
          <span>Campaign Comparison</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">VS</span>
        </button>
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "overview" ? "border-emerald-600 text-emerald-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Executive Metrics Overview
        </button>
        <button
          onClick={() => setActiveTab("funnel")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "funnel" ? "border-emerald-600 text-emerald-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Conversion Funnel Telemetry
        </button>
        <button
          onClick={() => setActiveTab("attribution")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "attribution" ? "border-emerald-600 text-emerald-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Multi-Touch Attribution
        </button>
      </div>

      {/* Content Sections */}

      {/* TAB 1: Channel ROI Projected vs Actual Recharts Visualizer */}
      {activeTab === "channel-roi" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Action Required Alert Banner inside Channel ROI */}
          {actionRequiredCount > 0 && (
            <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-500/80 rounded-2xl p-4 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-600 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                      ACTION REQUIRED
                    </span>
                    <span className="font-bold text-xs sm:text-sm font-sans">
                      {actionRequiredCount} Channel ROI Sudden Fluctuation{actionRequiredCount > 1 ? "s" : ""} Monitored
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 mt-1 leading-relaxed">
                    Channels breaching the {sensitivityThreshold}% risk hurdle: <strong>{actionRequiredAlerts.map(a => `${a.channelName} (${a.fluctuationPercentage}%)`).join(", ")}</strong>. Executive triage flag active on ExecutiveDashboard.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("fluctuation-alerts")}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-sans rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <span>Triage in Fluctuation Monitor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Executive Channel KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Top Performing Channel</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  +{topRoiChannel.actualRoi - topRoiChannel.projectedRoi}% Spread
                </span>
              </div>
              <p className="text-lg font-bold text-slate-900 truncate">{topRoiChannel.channel}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 font-mono">{topRoiChannel.actualRoi}%</span>
                <span className="text-xs text-slate-500 font-medium">vs {topRoiChannel.projectedRoi}% projected</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {topRoiChannel.actualRoas}x ROAS (${topRoiChannel.actualRevenue.toLocaleString()} Revenue)
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Avg Projected vs Actual ROI</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${netRoiSpread >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {netRoiSpread >= 0 ? `+${netRoiSpread}% Net Lift` : `${netRoiSpread}% Delta`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">{avgActualRoi}%</span>
                <span className="text-xs text-slate-500 font-medium">Actual</span>
                <span className="text-slate-300">/</span>
                <span className="text-lg font-bold text-slate-500 font-mono">{avgProjectedRoi}%</span>
                <span className="text-xs text-slate-400 font-medium">Target</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Portfolio performance across <span className="font-bold text-slate-700">{channelMetrics.length} active channels</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Attributed Revenue</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                  {blendedRoas}x ROAS
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">${totalAttributedRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">
                Generated from <span className="font-bold text-slate-700">${totalActualSpend.toLocaleString()}</span> marketing spend ({totalLeadsCount} total leads)
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">AI Strategic Focus</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-slate-800 leading-tight">
                Scale Google Ads & Organic SEO; restructure TikTok hooks
              </p>
              <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 p-2 rounded-lg leading-snug">
                Paid search & organic content are delivering 60%–170% higher ROI than initially projected.
              </p>
            </div>
          </div>

          {/* Primary Recharts Bar Chart Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Recharts Visualization
                  </span>
                  <span className="text-slate-400 text-xs">• Cross-Channel Projected vs Actual Returns</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Projected versus Actual ROI by Marketing Channel
                </h3>
                <p className="text-xs text-slate-500 max-w-2xl">
                  Analyze forecasted campaign hurdle rates against actual closed pipeline yield. Pinpoint outperforming channels to scale and identify low-efficiency channels for targeting adjustments.
                </p>
              </div>

              {/* Controls Suite */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Metric View Mode Toggle */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs">
                  <button
                    onClick={() => setChannelRoiMetricMode("percentage")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      channelRoiMetricMode === "percentage" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ROI (%)
                  </button>
                  <button
                    onClick={() => setChannelRoiMetricMode("roas")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      channelRoiMetricMode === "roas" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ROAS (x)
                  </button>
                  <button
                    onClick={() => setChannelRoiMetricMode("revenue")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      channelRoiMetricMode === "revenue" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Revenue ($)
                  </button>
                </div>

                {/* Sorter Selector */}
                <select
                  value={channelSortBy}
                  onChange={(e: any) => setChannelSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="actualRoi">Sort: Highest Actual ROI</option>
                  <option value="variance">Sort: Largest Variance (+/-)</option>
                  <option value="spend">Sort: Highest Spend</option>
                </select>

                {/* Export Button */}
                <button
                  onClick={exportChannelRoiToCsv}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export this dataset as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Channel Category:
              </span>
              {["All", "Paid Search", "Paid Social", "Organic", "Email / Direct"].map((category) => (
                <button
                  key={category}
                  onClick={() => setChannelCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    channelCategoryFilter === category
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {category === "All" ? `All Channels (${channelMetrics.length})` : category}
                </button>
              ))}
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="w-full h-96 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedChannels}
                  margin={{ top: 25, right: 30, left: 10, bottom: 40 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="channel" 
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    unit={channelRoiMetricMode === "percentage" ? "%" : channelRoiMetricMode === "roas" ? "x" : " $"}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChannelCustomTooltip />} />
                  <Legend 
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: "16px", fontSize: "12px", fontWeight: 600 }}
                  />
                  <ReferenceLine 
                    y={channelRoiMetricMode === "percentage" ? 250 : channelRoiMetricMode === "roas" ? 2.5 : 15000} 
                    stroke="#94a3b8" 
                    strokeDasharray="4 4"
                    label={{ 
                      value: channelRoiMetricMode === "percentage" ? "Hurdle Rate: 250% ROI" : channelRoiMetricMode === "roas" ? "Target Benchmark: 2.5x" : "Revenue Target: $15,000", 
                      fill: "#64748b", 
                      fontSize: 10,
                      position: "insideTopLeft"
                    }}
                  />
                  <Bar 
                    dataKey={channelRoiMetricMode === "percentage" ? "projectedRoi" : channelRoiMetricMode === "roas" ? "projectedRoas" : "projectedRevenue"} 
                    name={channelRoiMetricMode === "percentage" ? "Projected ROI (%)" : channelRoiMetricMode === "roas" ? "Projected ROAS (x)" : "Projected Revenue ($)"}
                    fill="#94a3b8" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar 
                    dataKey={channelRoiMetricMode === "percentage" ? "actualRoi" : channelRoiMetricMode === "roas" ? "actualRoas" : "actualRevenue"} 
                    name={channelRoiMetricMode === "percentage" ? "Actual ROI (%)" : channelRoiMetricMode === "roas" ? "Actual ROAS (x)" : "Actual Revenue ($)"}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={36}
                  >
                    {sortedChannels.map((entry, index) => {
                      const isOutperforming = entry.actualRoi >= entry.projectedRoi;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isOutperforming ? "#10b981" : "#f59e0b"} 
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Guide Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-[#94a3b8]" /> Projected Model
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-[#10b981]" /> Actual Realized (Exceeding Target)
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 rounded bg-[#f59e0b]" /> Actual Realized (Under Projection)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Formula: ROI = ((Attributed Pipeline Revenue - Actual Spend) / Actual Spend) * 100
              </span>
            </div>
          </div>

          {/* Channel Variance Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Detailed Channel ROI & Allocation Variance Breakdown
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actionable strategic recommendations matched to actual performance spreads
                </p>
              </div>
              <button
                onClick={exportChannelRoiToCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Breakdown CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Marketing Channel</th>
                    <th className="py-3 px-4 text-right">Budget vs Spend</th>
                    <th className="py-3 px-4 text-center">Projected ROI</th>
                    <th className="py-3 px-4 text-center">Actual ROI</th>
                    <th className="py-3 px-4 text-center">Spread Delta</th>
                    <th className="py-3 px-4 text-right">CPL</th>
                    <th className="py-3 px-4 text-right">Attributed Rev</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Tactical Recommendation</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedChannels.map((item) => {
                    const varianceRoi = item.actualRoi - item.projectedRoi;
                    const isAhead = varianceRoi >= 0;

                    // Match channel alert
                    const channelAlert = alerts.find(a => 
                      a.channelName.toLowerCase().includes(item.channel.toLowerCase()) || 
                      item.channel.toLowerCase().includes(a.channelName.toLowerCase())
                    );
                    const hasActiveAlert = channelAlert && channelAlert.status === "action_required";

                    return (
                      <tr key={item.id} className={`transition-colors ${hasActiveAlert ? "bg-rose-50/20 hover:bg-rose-50/40" : "hover:bg-slate-50"}`}>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{item.channel}</span>
                            {hasActiveAlert && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono border border-slate-200">
                              {item.category}
                            </span>
                            {hasActiveAlert && (
                              <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-mono font-black px-2 py-0.5 rounded border border-rose-300">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Action Required: {channelAlert.fluctuationPercentage}%
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          <div className="font-bold text-slate-900">${item.actualSpend.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">Budget: ${item.allocatedBudget.toLocaleString()}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-slate-600 font-semibold">
                          {item.projectedRoi}%
                          <div className="text-[10px] text-slate-400">{item.projectedRoas}x</div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                          <span className={isAhead ? "text-emerald-600 font-black text-sm" : "text-amber-600 font-black text-sm"}>
                            {item.actualRoi}%
                          </span>
                          <div className="text-[10px] text-slate-500">{item.actualRoas}x ROAS</div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            isAhead 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}>
                            {isAhead ? `+${varianceRoi}%` : `${varianceRoi}%`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-600">
                          ${item.costPerLead.toFixed(2)}
                          <div className="text-[10px] text-slate-400 font-normal">{item.leadsGenerated} leads</div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          ${item.actualRevenue.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            item.status === "Exceeding Target" ? "bg-emerald-600 text-white" :
                            item.status === "On Track" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs">
                          <div className="flex items-start gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item.recommendation}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {hasActiveAlert ? (
                            <button
                              onClick={() => setActiveTab("fluctuation-alerts")}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-sm transition-all cursor-pointer inline-flex items-center gap-1 active:scale-95"
                            >
                              <span>Triage Alert</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigateToTab("campaign-commander")}
                              className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] hover:underline cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>Manage</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ROI Fluctuation Alerts Monitoring Engine */}
      {activeTab === "fluctuation-alerts" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Engine Telemetry & Controls Daemon Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <ShieldAlert className="w-32 h-32 text-rose-500" />
            </div>

            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-600/90 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    Live Telemetry Daemon
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    24/7 Volatility & Sudden Deviation Watchdog
                  </span>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    Connected to ExecutiveDashboard
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2.5">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                  Campaign ROI Fluctuation & Sudden Deviation Alert Engine
                </h3>

                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Continuously inspects trailing performance across all marketing channels. When actual ROI drops abruptly past the configured sensitivity hurdle rate or experiences anomalous CPL surges, this engine automatically raises an <strong>'Action Required'</strong> flag on the <strong>ExecutiveDashboard</strong> for CEO triage.
                </p>
              </div>

              {/* Daemon Interactive Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                <button
                  id="btn-run-diagnostic-scan"
                  onClick={handleRunDiagnosticScan}
                  disabled={isScanning}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold font-sans rounded-xl border border-slate-700 shadow flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isScanning ? "animate-spin" : ""}`} />
                  <span>{isScanning ? "Running Scan..." : "Run Telemetry Scan"}</span>
                </button>

                <button
                  id="btn-simulate-sudden-drop"
                  onClick={handleSimulateSuddenDrop}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black font-sans rounded-xl shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simulate Sudden ROI Drop</span>
                </button>

                <button
                  id="btn-reset-roi-alerts"
                  onClick={handleResetAlerts}
                  className="px-3 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-bold font-sans rounded-xl border border-slate-800 transition-all cursor-pointer whitespace-nowrap"
                  title="Reset to baseline alerts dataset"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {/* Scan Progress Feedback */}
            {scanMessage && (
              <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
                <span>{scanMessage}</span>
              </div>
            )}

            {/* Parameters Settings Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Fluctuation Sensitivity Hurdle:</span>
                  <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1 font-mono text-[11px]">
                    {[10, 15, 20, 30].map(val => (
                      <button
                        key={val}
                        onClick={() => {
                          setSensitivityThreshold(val);
                          showToast(`Fluctuation hurdle updated to ${val}% threshold.`);
                        }}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          sensitivityThreshold === val ? "bg-rose-600 text-white font-black shadow" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {val}% Drop
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Monitoring Window:</span>
                  <select
                    value={monitoringWindow}
                    onChange={(e) => setMonitoringWindow(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-mono focus:outline-none cursor-pointer"
                  >
                    <option value="Trailing 24h">Trailing 24 Hours</option>
                    <option value="Trailing 48h">Trailing 48 Hours</option>
                    <option value="Trailing 7d">Trailing 7 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Executive Alert Sync Active</span>
              </div>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border shadow-sm space-y-1 transition-all ${
              actionRequiredCount > 0 ? "bg-rose-50/20 border-rose-400 ring-2 ring-rose-500/20" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Action Required Flags
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                  actionRequiredCount > 0 ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {actionRequiredCount > 0 ? "URGENT" : "STABLE"}
                </span>
              </div>
              <p className="text-3xl font-black font-mono text-slate-900">{actionRequiredCount}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {actionRequiredCount > 0 
                  ? "Alerting CEO via ExecutiveDashboard"
                  : "All monitored channels within hurdle bounds"
                }
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Max Negative Fluctuation
                </span>
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-3xl font-black font-mono text-rose-600">
                {alerts.length > 0 ? `${Math.min(...alerts.map(a => a.fluctuationPercentage))}%` : "0%"}
              </p>
              <p className="text-[11px] text-slate-500">
                Largest sudden drop observed across channels
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Capital Impact At Risk
                </span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-black font-mono text-slate-900">
                ${actionRequiredAlerts.reduce((sum, a) => sum + (a.attributedImpactCad || 0), 0).toLocaleString()}
                <span className="text-xs font-sans text-slate-400 font-bold ml-1">CAD</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Modeled pipeline variance across flagged channels
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Configured Hurdle Rate
                </span>
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-3xl font-black font-mono text-indigo-600">{sensitivityThreshold}%</p>
              <p className="text-[11px] text-slate-500">
                Deviations beyond {sensitivityThreshold}% dispatch executive alerts
              </p>
            </div>
          </div>

          {/* Alert Filter Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setAlertFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  alertFilter === "all" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                All Events ({alerts.length})
              </button>
              <button
                onClick={() => setAlertFilter("action_required")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  alertFilter === "action_required" ? "bg-rose-600 text-white shadow-sm" : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Action Required ({actionRequiredCount})</span>
              </button>
              <button
                onClick={() => setAlertFilter("acknowledged")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  alertFilter === "acknowledged" ? "bg-amber-600 text-white shadow-sm" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Acknowledged ({alerts.filter(a => a.status === "acknowledged").length})
              </button>
              <button
                onClick={() => setAlertFilter("resolved")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  alertFilter === "resolved" ? "bg-emerald-600 text-white shadow-sm" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Resolved ({alerts.filter(a => a.status === "resolved").length})
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Showing {alerts.filter(a => alertFilter === "all" || a.status === alertFilter).length} of {alerts.length} registered alerts</span>
            </div>
          </div>

          {/* Alert Cards Container */}
          <div className="space-y-4">
            {alerts.filter(a => alertFilter === "all" || a.status === alertFilter).length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No alerts found in this view</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Either all alerts have been triaged or no campaigns have breached the {sensitivityThreshold}% hurdle in this category.
                </p>
                <button
                  onClick={handleSimulateSuddenDrop}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Simulate a Sudden Fluctuation</span>
                </button>
              </div>
            ) : (
              alerts
                .filter(a => alertFilter === "all" || a.status === alertFilter)
                .map((alert) => {
                  const isActionRequired = alert.status === "action_required";
                  const isAcknowledged = alert.status === "acknowledged";
                  const isResolved = alert.status === "resolved";

                  return (
                    <div
                      key={alert.id}
                      className={`bg-white rounded-2xl border p-6 shadow-sm transition-all space-y-4 ${
                        isActionRequired
                          ? "border-rose-400 ring-2 ring-rose-500/20 shadow-rose-100"
                          : isAcknowledged
                          ? "border-amber-300 bg-amber-50/10"
                          : "border-slate-200 opacity-80"
                      }`}
                    >
                      {/* Top Row: Channel, Badges, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-slate-900 font-sans">{alert.channelName}</span>
                            {alert.campaignId && (
                              <span className="bg-slate-100 text-slate-600 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                                {alert.campaignId}
                              </span>
                            )}
                            <span className="text-slate-400 text-xs font-mono">• {alert.timestamp} ({alert.timeframe})</span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">{alert.sourceMetric}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Severity Badge */}
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            alert.severity === "critical"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : alert.severity === "warning"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          }`}>
                            {alert.severity}
                          </span>

                          {/* Status Badge */}
                          <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 ${
                            isActionRequired
                              ? "bg-rose-600 text-white animate-pulse"
                              : isAcknowledged
                              ? "bg-amber-500 text-white"
                              : "bg-emerald-600 text-white"
                          }`}>
                            {isActionRequired && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                            {alert.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Middle Grid: ROI Variance Metrics */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Previous Baseline ROI</span>
                          <span className="text-xl font-black font-mono text-slate-700">{alert.previousRoi}%</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Historical hurdle</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Current Realized ROI</span>
                          <span className="text-xl font-black font-mono text-rose-600">{alert.currentRoi}%</span>
                          <span className="text-[10px] text-rose-500 block font-mono font-bold">
                            {alert.fluctuationPercentage}% Sudden Delta
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Hurdle Tolerance Breached</span>
                          <span className="text-xl font-black font-mono text-amber-600">{alert.thresholdTriggered}%</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Allowed drop limit</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Attributed Capital Risk</span>
                          <span className="text-xl font-black font-mono text-slate-900">
                            ${(alert.attributedImpactCad || 0).toLocaleString()} CAD
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">Pipeline value variance</span>
                        </div>
                      </div>

                      {/* Root Cause & Diagnostic Detail */}
                      <div className="space-y-2 text-xs">
                        <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-900 font-mono text-[11px] uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Telemetry Root-Cause Analysis</span>
                          </div>
                          <p className="text-rose-900/90 leading-relaxed font-sans">{alert.details}</p>
                        </div>

                        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-900 font-mono text-[11px] uppercase tracking-wider">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>AI Strategic Directive & Remediation</span>
                          </div>
                          <p className="text-emerald-900/90 leading-relaxed font-sans font-medium">{alert.recommendedAction}</p>
                        </div>
                      </div>

                      {/* Actions Toolbar */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isActionRequired && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Acknowledge Fluctuation</span>
                            </button>
                          )}

                          {!isResolved && (
                            <button
                              onClick={() => handleResolve(alert.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Mark as Resolved</span>
                            </button>
                          )}

                          {isResolved && (
                            <span className="text-emerald-700 text-xs font-mono font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Triage Completed & Hurdle Restored</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigateToTab("campaign-commander")}
                            className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>Triage in Campaign Commander</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          </button>

                          <button
                            onClick={() => onNavigateToTab("dashboard")}
                            className="text-xs font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>View on Executive Dashboard</span>
                            <ArrowRight className="w-3 h-3 text-indigo-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Architecture Card: How Alert Sync Works */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              <h4 className="text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">
                Telemetry Synchronization Architecture
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-slate-600">
              <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-1">
                <span className="font-bold text-slate-900 block font-mono text-[11px]">1. Automated Fluctuation Scanning</span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  AnalyticsBrain compares trailing returns against historical projections across Google Ads, Meta, LinkedIn, and organic channels.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-1">
                <span className="font-bold text-slate-900 block font-mono text-[11px]">2. Risk Hurdle Breach Detection</span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Sudden drops exceeding the configured sensitivity threshold trigger an instantaneous 'Action Required' status.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-150 space-y-1">
                <span className="font-bold text-slate-900 block font-mono text-[11px]">3. Executive Notification Dispatch</span>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  The ExecutiveDashboard surfaces the persistent Action Required banner and alters ROI card indicators for rapid leadership decision-making.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROI & Budget Visualizer */}
      {activeTab === "roi" && (
        <RoiPerformanceVisualizer
          companyProfile={companyProfile}
          campaigns={campaigns}
          leads={leads}
        />
      )}

      {/* TAB 3: Campaign Comparison */}
      {activeTab === "comparison" && (
        <CampaignComparison campaigns={activeCampaigns} />
      )}

      {/* TAB 4: Executive Metrics Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Return On Ad Spend (ROAS)</span>
              <p className="text-2xl font-black text-slate-900 font-mono">3.8x</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +14.2% vs target</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Cost Per Acquisition (CPA)</span>
              <p className="text-2xl font-black text-slate-900 font-mono">$41.50</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> -8.5% CPA Reduction</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Average Click-Through Rate</span>
              <p className="text-2xl font-black text-slate-900 font-mono">2.45%</p>
              <p className="text-[10px] text-slate-500 font-medium">Industry median: 1.80%</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Captured Pipeline Leads</span>
              <p className="text-2xl font-black text-indigo-600 font-mono">{leads.length || 24}</p>
              <p className="text-[10px] text-indigo-600 font-bold">100% Routed to CRM</p>
            </div>
          </div>

          {/* Embedded Recharts Channel ROI Bar Chart Section in Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Channel ROI Performance: Projected vs Realized Yield
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual snapshot of marketing channel efficiency against hurdle benchmark
                </p>
              </div>
              <button
                onClick={() => setActiveTab("channel-roi")}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Full Channel Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedChannels}
                  margin={{ top: 20, right: 20, left: 0, bottom: 25 }}
                  barGap={6}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="channel" 
                    tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }} 
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} unit="%" />
                  <Tooltip content={<ChannelCustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <ReferenceLine y={250} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: "250% Target", fill: "#94a3b8", fontSize: 9 }} />
                  <Bar dataKey="projectedRoi" name="Projected ROI (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="actualRoi" name="Actual ROI (%)" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {sortedChannels.map((entry, index) => (
                      <Cell key={`ov-cell-${index}`} fill={entry.actualRoi >= entry.projectedRoi ? "#10b981" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <RoiPerformanceVisualizer
            companyProfile={companyProfile}
            campaigns={campaigns}
            leads={leads}
          />

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Attribution Model Controls</h3>
            <div className="flex flex-wrap gap-2">
              {["Linear", "Time Decay", "First Touch", "Last Touch"].map((model) => (
                <button
                  key={model}
                  onClick={() => setAttributionModel(model)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    attributionModel === model ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {model} Model
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "funnel" && (
        <LeadFunnelVisualizer leads={activeLeads} onLogAction={onLogAction} />
      )}

      {activeTab === "attribution" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Touchpoint Weighting ({attributionModel})</h3>
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span>Google Search Core Ads</span>
              <span className="font-mono font-bold text-emerald-600">35% Weight</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span>Organic SEO Content Landing Pages</span>
              <span className="font-mono font-bold text-emerald-600">25% Weight</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span>Meta Retargeting Pixels</span>
              <span className="font-mono font-bold text-emerald-600">20% Weight</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <span>Privacy-Compliant Email Nurture</span>
              <span className="font-mono font-bold text-emerald-600">20% Weight</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
