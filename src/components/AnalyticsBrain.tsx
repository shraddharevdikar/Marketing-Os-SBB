import React, { useState } from "react";
import { 
  BarChart3, TrendingUp, PieChart, ArrowUpRight, DollarSign, Users, Target, Activity, RefreshCw,
  Download, FileSpreadsheet, CheckCircle2, ChevronDown, Archive
} from "lucide-react";
import { RoiPerformanceVisualizer } from "./RoiPerformanceVisualizer";
import { CampaignComparison } from "./CampaignComparison";
import { LeadFunnelVisualizer } from "./LeadFunnelVisualizer";
import { GitCompare } from "lucide-react";

interface AnalyticsBrainProps {
  companyProfile: any;
  leads: any[];
  campaigns: any[];
  onLogAction: (action: string, details: string) => void;
  onNavigateToTab: (tab: string) => void;
}

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
  { id: "CMP-02", title: "GTA Luxury Buyer Meta Video Reels", platform: "Meta Ads", budget: 7500, spend: 6200, leads: 195, cpl: 31.79, revenue: 19840, roas: "3.2x", status: "Exceeding" },
  { id: "CMP-03", title: "Enterprise B2B Decision Maker Sponsored", platform: "LinkedIn Ads", budget: 8500, spend: 7800, leads: 98, cpl: 79.59, revenue: 28080, roas: "3.6x", status: "On Track" },
  { id: "CMP-04", title: "Organic CASL Compliance Hub Content", platform: "SEO Content", budget: 3500, spend: 3100, leads: 165, cpl: 18.79, revenue: 22400, roas: "7.2x", status: "Exceeding" },
  { id: "CMP-05", title: "Drip Nurture Double Opt-in Workflow", platform: "Email Nurture", budget: 2000, spend: 1850, leads: 82, cpl: 22.56, revenue: 11100, roas: "6.0x", status: "On Track" }
];

export const AnalyticsBrain: React.FC<AnalyticsBrainProps> = ({
  companyProfile,
  leads = [],
  campaigns = [],
  onLogAction,
  onNavigateToTab
}) => {
  const [attributionModel, setAttributionModel] = useState("Linear");
  const [activeTab, setActiveTab] = useState<"roi" | "comparison" | "overview" | "funnel" | "attribution">("roi");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeLeads = leads && leads.length > 0 ? leads : fallbackLeads;
  const activeCampaigns = campaigns && campaigns.length > 0 ? campaigns : fallbackCampaigns;

  const closedWonCount = activeLeads.filter((l: any) => l.status === "Closed Won").length || 4;
  const estimatedRevenue = (closedWonCount * 4500).toLocaleString();

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

  // Export 1: Campaigns CSV
  const exportCampaignsToCsv = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Campaign ID",
      "Campaign Title",
      "Platform Channel",
      "Allocated Budget (CAD)",
      "Actual Spend (CAD)",
      "Leads Generated",
      "Cost Per Lead (CAD)",
      "Attributed Revenue (CAD)",
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
                <p className="text-lg font-bold font-mono text-white">${estimatedRevenue} CAD</p>
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
                    onClick={exportFullArchiveToCsv}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-emerald-400">Full Performance Archive (.csv)</div>
                      <div className="text-[10px] text-emerald-200/70">Combined Campaigns & Leads</div>
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
          onClick={() => setActiveTab("roi")}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "roi" ? "border-emerald-600 text-emerald-700 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>ROI & Budget Visualizer</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">RECHARTS</span>
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
      {activeTab === "roi" && (
        <RoiPerformanceVisualizer
          companyProfile={companyProfile}
          campaigns={campaigns}
          leads={leads}
        />
      )}

      {activeTab === "comparison" && (
        <CampaignComparison campaigns={activeCampaigns} />
      )}

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
              <p className="text-2xl font-black text-slate-900 font-mono">$41.50 CAD</p>
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
              <span>CASL-Compliant Email Nurture</span>
              <span className="font-mono font-bold text-emerald-600">20% Weight</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
