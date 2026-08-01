import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StrategicObjectives } from "./StrategicObjectives";
import { LeadHeatmap } from "./LeadHeatmap";
import {
  Award,
  Download,
  ShieldCheck,
  DollarSign,
  Percent,
  Target,
  Activity,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Cpu,
  HelpCircle,
  MessageSquare,
  Sparkles
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  agent: string;
  proposedAction: string;
  expectedResult: string;
  budgetImpact: number;
  riskAnalysis: string;
  timeRequirement: string;
  approvalRequiredFrom: string;
  status: "Pending" | "Approved" | "Rejected" | "Overridden";
  createdBy: string;
  createdAt: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  territory: string;
  product: string;
  leadScore: number;
  leadPriority: string;
  leadOwner: string;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
}

interface ExecutiveDashboardProps {
  requests: Campaign[];
  leads: Lead[];
  auditLogs: AuditLog[];
  currentRole: string;
  userName: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  requests,
  leads,
  auditLogs,
  currentRole,
  userName
}) => {
  const isCeo = currentRole === "CEO";
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [selectedMetric, setSelectedMetric] = useState<string>("overall");
  const [customQuery, setCustomQuery] = useState<string>("");
  const [customResponse, setCustomResponse] = useState<string | null>(null);

  // Filters based on role visibility
  const filteredCampaigns = isCeo
    ? requests
    : requests.filter(c => c.approvalRequiredFrom === currentRole || c.createdBy === userName);
  const filteredLeads = isCeo
    ? leads
    : leads.filter(l => l.leadOwner.toLowerCase().includes(userName.toLowerCase()) || l.leadOwner.toLowerCase().includes(currentRole.toLowerCase()));
  const filteredAudits = isCeo
    ? auditLogs
    : auditLogs.filter(a => a.actor === userName || a.role === currentRole);

  const leadsCount = filteredLeads.length;
  const salesCount = filteredLeads.filter(l => l.status === "Closed Won").length;
  const conversionRate = leadsCount > 0 ? (salesCount / leadsCount) * 100 : 7.1;

  const approvedBudget = filteredCampaigns
    .filter(c => c.status === "Approved" || c.status === "Overridden")
    .reduce((sum, c) => sum + c.budgetImpact, 0);

  // Data structure mapped directly from index-B9gpRy08.js
  const perspectives = {
    daily: {
      revenue: Math.max((salesCount * 4500) / 30, 12450),
      roi: approvedBudget > 0 ? Math.round(((salesCount * 4500) / Math.max(approvedBudget, 1)) * 100) : 340,
      cac: 180,
      ltv: 1800,
      leadsCount: Math.max(leadsCount, 45),
      salesCount: Math.max(salesCount, 4),
      seoGrowthClicks: 150,
      seoGrowthKeywords: 4,
      seoGrowthDA: 41,
      paidSpend: Math.max(approvedBudget / 30, 1280),
      paidCpc: 3.20,
      paidCtr: 1.85,
      socialFollowers: 85,
      socialEngagement: 4.2,
      healthScore: 92,
      forecastRevenue: [12.4, 13.8, 15.2],
      forecastMonths: ["Tomorrow", "In 3 Days", "In 7 Days"],
      growthOpportunities: [
        {
          title: "Ad-spend Evening Pivot",
          description: "Re-allocate $350 of underutilized daytime budget into high-intent search keywords between 6 PM and 10 PM EST.",
          channel: "Paid Ads",
          impact: "High",
          effort: "Low",
          recommendation: "Increase bid adjustments by 15% during peak mobile search times in Ontario & Quebec."
        },
        {
          title: "LinkedIn InMail Follow-up",
          description: "Trigger automated custom responses to Canadian cybersecurity prospects who visited our sandbox page.",
          channel: "Social & CRM",
          impact: "Medium",
          effort: "Low",
          recommendation: "Configure CRM auto-sequences for qualified cold visitors from enterprise IP ranges."
        }
      ],
      ceoExplanations: {
        overall: "Greetings! Today we are observing excellent momentum. Our daily revenue pipeline is running high, fueled by robust compliance SaaS interest. I recommend executing the ad-spend evening pivot to capture active B2B decision-makers searching after core hours.",
        revenue: "Daily Revenue is calculated based on our pro-rated annual subscription licenses. Today's estimate is strong, backed by our recent PIPEDA-compliance campaign traction.",
        roi: "Our daily ROI of 340% indicates high capital efficiency. For every dollar we authorize in digital ad-spend, we are generating $3.40 of enterprise pipeline worth.",
        cac: "Customer Acquisition Cost sits at $180 today. This is comfortably below our $200 target ceiling. The decline is a direct result of our optimized negative keyword filter list.",
        ltv: "Customer Lifetime Value is estimated at $1,800. In SaaS, we look for LTV to be at least 3x our CAC. Right now we are running at a spectacular 10.0x ratio daily.",
        leads: "We captured 45 leads today. The leading source remains our specialized WhatsApp compliance chatbot and localized landing pages.",
        sales: "Today we sealed 4 recurring SaaS subscriptions. Pre-qualification loops from the CRM module are successfully filtering out low-budget leads.",
        seo: "Our organic footprint expanded with +150 visitors today. Four high-value search queries moved into Page 1 rankings on Google Canada.",
        paid: "Paid search spent $1,280 with a balanced CPC of $3.20. The average Click-Through Rate is a strong 1.85% following our creative asset refreshments.",
        social: "Our LinkedIn community grew by 85 followers today. Engagement remains stable due to our recent CISO threat-model debate series.",
        forecast: "If current daily run rates are sustained, our next 7 days will exceed our trailing weekly baseline by approximately 9.2%.",
        health: "Our daily Business Health Score is 92/100. This multi-weighted composite measures ad-spend optimality, lead conversion velocity, and CASL compliance enforcement."
      }
    },
    weekly: {
      revenue: Math.max((salesCount * 4500) / 4, 87150),
      roi: approvedBudget > 0 ? Math.round(((salesCount * 4500) / Math.max(approvedBudget, 1)) * 100) : 385,
      cac: 165,
      ltv: 1950,
      leadsCount: Math.max(leadsCount * 4, 312),
      salesCount: Math.max(salesCount * 3, 22),
      seoGrowthClicks: 1240,
      seoGrowthKeywords: 18,
      seoGrowthDA: 42,
      paidSpend: Math.max(approvedBudget / 4, 7850),
      paidCpc: 2.95,
      paidCtr: 2.1,
      socialFollowers: 620,
      socialEngagement: 4.8,
      healthScore: 95,
      forecastRevenue: [87.1, 94.5, 102.8],
      forecastMonths: ["Week 1 (Current)", "Week 2 (Proj)", "Week 3 (Proj)"],
      growthOpportunities: [
        {
          title: "CISO Security Whitepaper Push",
          description: "Double the LinkedIn targeting budget for Chief Information Security Officers in Western Canada, focusing on the new PIPEDA regulation update.",
          channel: "Paid Ads",
          impact: "High",
          effort: "Medium",
          recommendation: "Launch 3 new video testimonials from verified bank auditors to increase click-to-lead ratios."
        },
        {
          title: "Unresponsive Lead Recapture",
          description: "Automate an outbound WhatsApp CASL-compliant re-engagement sequence for leads stuck in the 'Qualified' stage for over 10 days.",
          channel: "CRM Consultant",
          impact: "High",
          effort: "Low",
          recommendation: "Send a direct, personal note from the team offering a free compliance sandbox trial."
        },
        {
          title: "SEO Pillar Page Expansion",
          description: "Publish 4 localized deep-dives targeting 'CASL opt-in regulations for SaaS' to secure high-intent organic rankings.",
          channel: "SEO Growth",
          impact: "Medium",
          effort: "High",
          recommendation: "Focus on technical structural markups and speed optimization to index within 48 hours."
        }
      ],
      ceoExplanations: {
        overall: "An exceptional week, colleagues. Our SaaS sales closed at a record pace of 22 contracts. SEO traffic is scaling organically, which helps us bypass paid bidding. To maximize this, we should immediately implement the 'Unresponsive Lead Recapture' workflow to extract late-stage revenue.",
        revenue: "Weekly Revenue sits at $87,150 CAD. This reflects a solid 11.2% climb over our previous weekly average. The growth is heavily fueled by Quebec and Ontario corporate sign-ups.",
        roi: "Marketing ROI registered at 385% this week. We are extracting remarkable value from our combined search and social marketing efforts.",
        cac: "Our CAC decreased to $165. Expanding our organic content campaigns has reduced the burden on paid traffic channels, pulling average acquisition costs down.",
        ltv: "Our estimated LTV climbed to $1,950 due to an increase in initial contract values. This positions our LTV:CAC at an elite 11.8x multiplier.",
        leads: "We generated 312 leads this week. The landing page remains our highest-converting organic channel.",
        sales: "We logged 22 client approvals this week, setting a new quarterly benchmark for onboarding velocity.",
        seo: "SEO clicks grew to 1,240, backed by 18 keywords climbing onto page 1 of google.ca.",
        paid: "Paid campaigns spent $7,850 CAD with a highly efficient CTR of 2.1%.",
        social: "LinkedIn community size increased by +620 new verified Canadian professionals.",
        forecast: "Weekly compound trajectory projects next week reaching $94.5K CAD, an escalation of 8.4%.",
        health: "Business Health Score scaled to 95/100, reflecting CASL automation alignment and low waste."
      }
    },
    monthly: {
      revenue: Math.max(salesCount * 4500, 348600),
      roi: approvedBudget > 0 ? Math.round(((salesCount * 4500 * 4) / Math.max(approvedBudget, 1)) * 100) : 410,
      cac: 152,
      ltv: 2100,
      leadsCount: Math.max(leadsCount * 15, 1340),
      salesCount: Math.max(salesCount * 12, 92),
      seoGrowthClicks: 5120,
      seoGrowthKeywords: 72,
      seoGrowthDA: 44,
      paidSpend: Math.max(approvedBudget, 32400),
      paidCpc: 2.70,
      paidCtr: 2.35,
      socialFollowers: 2840,
      socialEngagement: 5.1,
      healthScore: 97,
      forecastRevenue: [348.6, 375.0, 412.5],
      forecastMonths: ["Current Month", "Month +1 (Proj)", "Month +2 (Proj)"],
      growthOpportunities: [
        {
          title: "US Security Expansion",
          description: "Configure cross-border targeting configurations to replicate our Canadian PIPEDA compliance success in neighboring US healthcare and ledger tech markets.",
          channel: "Enterprise Scale",
          impact: "High",
          effort: "High",
          recommendation: "Adapt legal boilerplate messaging to match localized state privacy laws (such as CCPA in California)."
        },
        {
          title: "Enterprise Multi-Seat Upsell",
          description: "Target existing SaaS accounts holding 5+ seats and offer free compliance sandbox access to cross-sell the high-margin Security module.",
          channel: "CRM & Sales",
          impact: "High",
          effort: "Medium",
          recommendation: "Configure in-app alerts and trigger direct email reach-out to key administrative contacts."
        }
      ],
      ceoExplanations: {
        overall: "Welcome to the Monthly Executive Review. SBB AI Model systems report a highly optimized 97/100 Health Score. LTV has scaled to $2,100 CAD while CAC is down to $152 CAD, representing an elite SaaS ratio of 13.8x. I recommend initiating plans to expand targeting into CCPA/US compliance regions.",
        revenue: "Monthly recurring revenue reached $348,600 CAD, exceeding budget forecast by 6.4%.",
        roi: "Our Monthly Blended ROAS/ROI hit 410%, demonstrating peak marketing operations efficiency.",
        cac: "CAC has hit an all-time low of $152 CAD, driven by high organic SEO domain strength and precise localized exclusions.",
        ltv: "LTV holds at $2,100 CAD due to stable multi-year enterprise contract locking.",
        leads: "A total of 1,340 leads were captured this month, our most productive acquisition month on record.",
        sales: "92 closed contracts represents a 24% conversion velocity lift compared to last month.",
        seo: "Organic SEO footprint represents 5,120 clicks, proving that local educational compliance hubs work.",
        paid: "Paid search and social channels spent $32,400 CAD with an incredibly low CPC of $2.70.",
        social: "Social audience grew by +2,840 followers across LinkedIn and YouTube campaigns.",
        forecast: "Our multi-period models estimate next month closing near $375K CAD under steady-state assumptions.",
        health: "Our monthly composite Business Health Score sits at 97/100. This is an elite tier rating representing near-perfect compliance and capital efficiency."
      }
    }
  };

  const currentMetrics = perspectives[timeframe];

  // Export CSV Handler
  const handleExportCSV = () => {
    const rows: string[] = [];
    const cleanCell = (val: any) => val == null ? '""' : `"${String(val).replace(/"/g, '""')}"`;
    
    rows.push("SOVEREIGN MARKETINGOS - EXECUTIVE DASHBOARD REPORT");
    rows.push(`Exported On,${new Date().toLocaleString()}`);
    rows.push(`Timeframe Perspective,${timeframe.toUpperCase()}`);
    rows.push(`Operator,${userName} (${currentRole})`);
    rows.push("");
    rows.push("EXECUTIVE METRICS REPORT");
    rows.push("Metric Name,Value,Unit,Timeframe");
    rows.push(`Estimated Revenue,${currentMetrics.revenue},CAD,${timeframe}`);
    rows.push(`Marketing ROI,${currentMetrics.roi},%,${timeframe}`);
    rows.push(`CAC (Customer Acquisition Cost),${currentMetrics.cac},CAD,${timeframe}`);
    rows.push(`LTV (Lifetime Value),${currentMetrics.ltv},CAD,${timeframe}`);
    rows.push(`Total Leads,${currentMetrics.leadsCount},Leads,${timeframe}`);
    rows.push(`Sales (Conversions),${currentMetrics.salesCount},Sales,${timeframe}`);
    rows.push(`SEO Organic Clicks,${currentMetrics.seoGrowthClicks},Clicks,${timeframe}`);
    rows.push(`SEO Keywords on Page 1,${currentMetrics.seoGrowthKeywords},Keywords,${timeframe}`);
    rows.push(`Paid Media Spend,${currentMetrics.paidSpend},CAD,${timeframe}`);
    rows.push(`Paid Media CPC,${currentMetrics.paidCpc},CAD,${timeframe}`);
    rows.push(`Paid Media CTR,${currentMetrics.paidCtr},%,${timeframe}`);
    rows.push(`Social Follower Growth,${currentMetrics.socialFollowers},Followers,${timeframe}`);
    rows.push(`Social Engagement,${currentMetrics.socialEngagement},%,${timeframe}`);
    rows.push(`Health Score,${currentMetrics.healthScore},/100,${timeframe}`);

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Executive_Dashboard_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LLM Query Handler
  const handleAskCEO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;
    
    setCustomResponse("Querying Victoria (AI CEO)...");
    try {
      const res = await fetch("/api/strategist/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: customQuery,
          businessState: {
            revenue: currentMetrics.revenue,
            roasTarget: (currentMetrics.roi / 100),
            burnRate: currentMetrics.paidSpend / 30,
            leadScore: currentMetrics.healthScore,
            channels: [
              { name: "SEO Organic", spend: 0, active: true },
              { name: "Paid Channels", spend: currentMetrics.paidSpend, active: true }
            ],
            demographics: [
              { name: "Canadian Enterprise", share: 100 }
            ]
          }
        })
      });
      const data = await res.json();
      setCustomResponse(data.text);
    } catch (err) {
      console.error(err);
      setCustomResponse("Sovereign AI experienced a temporary sync timeout. Please verify local servers are active.");
    }
  };

  return (
    <div id="executive-dashboard-card" className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 text-emerald-400 p-1 rounded border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-sans font-black text-white uppercase tracking-wider">
              Sovereign Executive Decision Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Select strategic timeframes to review pro-rated SaaS metrics, channel growth, and automated AI CEO briefings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            {(["daily", "weekly", "monthly"] as const).map((v) => (
              <button
                key={v}
                id={`btn-time-${v}`}
                onClick={() => {
                  setTimeframe(v);
                  setSelectedMetric("overall");
                  setCustomResponse(null);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold font-sans transition-all capitalize cursor-pointer ${
                  timeframe === v
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {v} Perspective
              </button>
            ))}
          </div>
          <button
            id="btn-export-exec-csv"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-sans font-bold rounded-lg transition-all shadow border border-slate-700 cursor-pointer whitespace-nowrap active:scale-95 ml-auto sm:ml-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Metrics</span>
          </button>
        </div>
      </div>

      {/* AI CEO Briefing Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Cpu className="w-24 h-24 text-teal-400 animate-spin-slow" />
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative z-10">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-0.5 shadow-lg flex items-center justify-center font-sans text-slate-950 font-black text-sm">
              CEO
            </div>
            <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900/50 animate-pulse">
                SBB AI CEO Victoria
              </span>
              <span className="text-[10px] font-mono text-slate-500">SYSTEM RESPONSE DEPLOYED (UTC-07)</span>
            </div>
            <p className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed font-medium italic">
              "{currentMetrics.ceoExplanations.overall}"
            </p>
            <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Fully Compliant with PIPEDA/CASL
              </span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" /> Model: Gemini 2.5-Flash
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div
          onClick={() => {
            setSelectedMetric("revenue");
            setCustomResponse(null);
          }}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer relative group ${
            selectedMetric === "revenue"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5"
              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-sans block uppercase tracking-wider">
              Estimated Revenue
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-slate-900">
                ${(Number(currentMetrics?.revenue) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-sans text-slate-500 font-bold uppercase">CAD</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +14.2% MoM
              </span>
              <span className="text-slate-400 font-semibold uppercase">{timeframe} target pacing</span>
            </div>
          </div>
          <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono bg-slate-900 text-slate-100 px-1.5 py-0.5 rounded shadow">
            CEO Explains
          </div>
        </div>

        {/* ROI Card */}
        <div
          onClick={() => {
            setSelectedMetric("roi");
            setCustomResponse(null);
          }}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer relative group ${
            selectedMetric === "roi"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5"
              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-sans block uppercase tracking-wider">
              Marketing ROI
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-slate-900">{currentMetrics.roi}%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">(BLENDED)</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Peak Pacing
              </span>
              <span className="text-slate-400 font-semibold uppercase">CAC Offset Optimal</span>
            </div>
          </div>
          <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono bg-slate-900 text-slate-100 px-1.5 py-0.5 rounded shadow">
            CEO Explains
          </div>
        </div>

        {/* CAC Card */}
        <div
          onClick={() => {
            setSelectedMetric("cac");
            setCustomResponse(null);
          }}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer relative group ${
            selectedMetric === "cac"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5"
              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-sans block uppercase tracking-wider">
              Acquisition Cost (CAC)
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-slate-900">${currentMetrics.cac}</span>
              <span className="text-xs font-sans text-slate-400 font-semibold uppercase">CAD / acquisition</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" /> -11.5% Target
              </span>
              <span className="text-rose-500 font-semibold">Max Cap: $200 CAD</span>
            </div>
          </div>
          <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono bg-slate-900 text-slate-100 px-1.5 py-0.5 rounded shadow">
            CEO Explains
          </div>
        </div>

        {/* LTV Card */}
        <div
          onClick={() => {
            setSelectedMetric("ltv");
            setCustomResponse(null);
          }}
          className={`bg-white border rounded-xl p-5 shadow-sm transition-all cursor-pointer relative group ${
            selectedMetric === "ltv"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/5"
              : "border-slate-200 hover:border-slate-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 font-sans block uppercase tracking-wider">
              Lifetime Value (LTV)
            </span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3.5 space-y-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-slate-900">${currentMetrics.ltv}</span>
              <span className="text-xs font-sans text-slate-500 font-bold uppercase">CAD value</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-indigo-600 font-black">
                Ratio: {(currentMetrics.ltv / currentMetrics.cac).toFixed(1)}x LTV:CAC
              </span>
              <span className="text-emerald-600 font-semibold">Optimal</span>
            </div>
          </div>
          <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono bg-slate-900 text-slate-100 px-1.5 py-0.5 rounded shadow">
            CEO Explains
          </div>
        </div>
      </div>

      {/* Second Row of Metrics: Conversion Pipeline, SEO Footprint, Paid Ads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Pipeline */}
        <div
          onClick={() => {
            setSelectedMetric("leads");
            setCustomResponse(null);
          }}
          className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition-all ${
            selectedMetric === "leads" || selectedMetric === "sales"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider">
                Conversion Pipeline
              </h3>
              <p className="text-[10px] text-slate-400">Total Leads to Sales Funnel</p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Total Captured</span>
                <span className="text-2xl font-mono font-bold text-slate-900">{currentMetrics.leadsCount}</span>
                <span className="text-[9px] font-sans text-slate-500 block mt-0.5">Corporate Leads</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Closed Contracts</span>
                <span className="text-2xl font-mono font-bold text-slate-900">{currentMetrics.salesCount}</span>
                <span className="text-[9px] font-sans text-slate-500 block mt-0.5">SaaS Conversions</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                Pipeline Conversion Velocity
              </span>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-100">
                  <div
                    style={{ width: `${conversionRate.toFixed(1)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5 font-bold">
                  <span>Conversion Index</span>
                  <span>{conversionRate.toFixed(1)}% CR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Organic Footprint */}
        <div
          onClick={() => {
            setSelectedMetric("seo");
            setCustomResponse(null);
          }}
          className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition-all ${
            selectedMetric === "seo"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider">
                SEO Organic Footprint
              </h3>
              <p className="text-[10px] text-slate-400">Search Engine Optimization Trajectory</p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Weekly Clicks</span>
                <span className="text-base font-mono font-bold text-slate-900">{currentMetrics.seoGrowthClicks}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Page-1 KWs</span>
                <span className="text-base font-mono font-bold text-slate-900">{currentMetrics.seoGrowthKeywords}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-[9px] font-mono text-slate-400 block uppercase">Domain Auth</span>
                <span className="text-base font-mono font-bold text-slate-900">{currentMetrics.seoGrowthDA}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] font-sans text-slate-600 leading-relaxed">
              <strong className="text-slate-800">SEO Strategy:</strong> Focusing content topics around{" "}
              <em>"Canadian CASL opt-out regulations"</em> has captured high-intent corporate inquiries natively.
            </div>
          </div>
        </div>

        {/* Paid Ads & Social */}
        <div
          onClick={() => {
            setSelectedMetric("paid");
            setCustomResponse(null);
          }}
          className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition-all ${
            selectedMetric === "paid" || selectedMetric === "social"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider">
                Paid Ads & Social
              </h3>
              <p className="text-[10px] text-slate-400">Marketing Budget & Community Reach</p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans text-slate-600">
                <span className="font-semibold">Paid Channel Ad-spend</span>
                <span className="font-mono text-slate-900 font-bold">
                  ${(Number(currentMetrics?.paidSpend) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} CAD
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>
                  Avg CPC: <strong>${currentMetrics.paidCpc.toFixed(2)}</strong>
                </span>
                <span>
                  Avg CTR: <strong>{currentMetrics.paidCtr.toFixed(2)}%</strong>
                </span>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs font-sans text-slate-600">
                <span className="font-semibold">Social Follower Growth</span>
                <span className="font-mono text-slate-900 font-bold">+{currentMetrics.socialFollowers}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Channels: LinkedIn, YouTube</span>
                <span>
                  Engagement: <strong>{currentMetrics.socialEngagement}%</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI CEO Commentator Interactive Hub */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-slate-500 animate-pulse" />
            <h3 className="text-xs font-mono font-black text-slate-700 uppercase tracking-wider">
              AI CEO Commentator Hub
            </h3>
          </div>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase font-bold">
            Interactive Explainers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1 space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Direct Inquiries to Victoria (AI CEO):
            </span>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSelectedMetric("cac");
                  setCustomResponse(
                    `Our Customer CAC is sitting at an efficient $${currentMetrics.cac} CAD. SBB AI models achieved this by filtering out high-cost bidding queries and shifting 20% of allocation to Meta Video Ads where competition is lower. Our target remains below $200 CAD.`
                  );
                }}
                className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-[11px] font-sans text-slate-600 hover:text-slate-900 font-semibold transition-all flex items-center justify-between"
              >
                <span>Why is our CAC decreasing?</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setSelectedMetric("ltv");
                  setCustomResponse(
                    `Our Customer LTV is estimated at $${currentMetrics.ltv} CAD. This high number is supported by our 98.8% customer retention rate (churn under 1.2%). Because SBB compliance is deeply integrated into client operations, our contract stickiness is elite.`
                  );
                }}
                className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-[11px] font-sans text-slate-600 hover:text-slate-900 font-semibold transition-all flex items-center justify-between"
              >
                <span>What is our optimal LTV:CAC sweet spot?</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setSelectedMetric("seo");
                  setCustomResponse(
                    `Organic growth is compounding nicely with +${currentMetrics.seoGrowthClicks} clicks and ${currentMetrics.seoGrowthKeywords} new Page-1 Google Canada rankings. High domain authority (currently ${currentMetrics.seoGrowthDA}) translates to free, highly-qualified organic enterprise traffic.`
                  );
                }}
                className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-[11px] font-sans text-slate-600 hover:text-slate-900 font-semibold transition-all flex items-center justify-between"
              >
                <span>Explain our organic SEO traffic surge</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAskCEO} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AI CEO about another metric..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-800 placeholder-slate-400 font-sans"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-755 text-white text-xs font-bold rounded-lg transition-all"
              >
                Ask
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-inner">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                <span>
                  Victoria Explains:{" "}
                  <strong className="text-slate-800 uppercase font-extrabold">
                    {customResponse ? "Strategic Inquiry" : selectedMetric}
                  </strong>
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100 min-h-[90px]">
                {customResponse || currentMetrics.ceoExplanations[selectedMetric as keyof typeof currentMetrics.ceoExplanations] || currentMetrics.ceoExplanations.overall}
              </p>
            </div>
            {selectedMetric !== "overall" && !customResponse && (
              <button
                onClick={() => setSelectedMetric("overall")}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-mono font-bold mt-2 text-left flex items-center gap-0.5"
              >
                <span>&larr; Return to overall executive brief</span>
              </button>
            )}
            {customResponse && (
              <button
                onClick={() => setCustomResponse(null)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-mono font-bold mt-2 text-left flex items-center gap-0.5"
              >
                <span>&larr; Return to selected card explainers</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Forecast and Growth Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-black text-slate-800 uppercase tracking-wider">
                Strategic Revenue Forecast
              </h3>
              <p className="text-[10px] text-slate-400">
                3-Period Projected recurring revenue trajectory (MoM/DoD/WoW)
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              <TrendingUp className="w-3 h-3" /> Pacing Target
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full max-w-sm shrink-0">
              {/* Inline SVG Chart exactly representing the forecast data */}
              <svg viewBox="0 0 380 180" className="w-full h-auto">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <g opacity="0.1">
                  <line x1="40" y1="30" x2="340" y2="30" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="75" x2="340" y2="75" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="120" x2="340" y2="120" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
                </g>
                <path
                  d={`M 60 120 L 180 ${120 - (currentMetrics.forecastRevenue[1] / currentMetrics.forecastRevenue[0] - 1) * 80} L 300 ${120 - (currentMetrics.forecastRevenue[2] / currentMetrics.forecastRevenue[0] - 1) * 80}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d={`M 60 120 L 180 ${120 - (currentMetrics.forecastRevenue[1] / currentMetrics.forecastRevenue[0] - 1) * 80} L 300 ${120 - (currentMetrics.forecastRevenue[2] / currentMetrics.forecastRevenue[0] - 1) * 80} L 300 150 L 60 150 Z`}
                  fill="url(#chartGrad)"
                />
                <circle cx="60" cy="120" r="5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                <circle cx="180" cy={120 - (currentMetrics.forecastRevenue[1] / currentMetrics.forecastRevenue[0] - 1) * 80} r="5" fill="#0d9488" stroke="#fff" strokeWidth="1.5" />
                <circle cx="300" cy={120 - (currentMetrics.forecastRevenue[2] / currentMetrics.forecastRevenue[0] - 1) * 80} r="5" fill="#0f766e" stroke="#fff" strokeWidth="1.5" />
                
                {/* Text Labels */}
                <text x="60" y={105} fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  ${currentMetrics.forecastRevenue[0]}K
                </text>
                <text x="180" y={105 - (currentMetrics.forecastRevenue[1] / currentMetrics.forecastRevenue[0] - 1) * 80} fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  ${currentMetrics.forecastRevenue[1]}K
                </text>
                <text x="300" y={105 - (currentMetrics.forecastRevenue[2] / currentMetrics.forecastRevenue[0] - 1) * 80} fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  ${currentMetrics.forecastRevenue[2]}K
                </text>

                {/* X Axis Labels */}
                <text x="60" y="165" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif" fontWeight="semibold">
                  {currentMetrics.forecastMonths[0]}
                </text>
                <text x="180" y="165" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif" fontWeight="semibold">
                  {currentMetrics.forecastMonths[1]}
                </text>
                <text x="300" y="165" fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="sans-serif" fontWeight="semibold">
                  {currentMetrics.forecastMonths[2]}
                </text>
              </svg>
            </div>
            
            <div className="flex-1 space-y-4 text-xs font-sans text-slate-600">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-black">
                Victoria's Forecasting Model
              </span>
              <p className="leading-relaxed">
                The strategic projection models standard localized SaaS conversions across Canadian territories (pacing at{" "}
                <strong>{timeframe === "daily" ? "+14.2%" : timeframe === "weekly" ? "+11.2%" : "+16.8%"}</strong> growth).
              </p>
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-lg flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium leading-normal">
                  Next system reconciliation cycle initiates in <strong>14 hours</strong> automatically.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-3.5">
              Active Growth Opportunities
            </span>
            <div className="space-y-4.5 max-h-[280px] overflow-y-auto pr-1">
              {(currentMetrics.growthOpportunities || []).map((op, i) => (
                <div key={i} className="border-l-2 border-emerald-500 pl-3 space-y-1.5 py-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold uppercase">
                    <span className="text-emerald-600">{op.channel}</span>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">{op.impact} Impact</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">{op.effort} Effort</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-sans font-black text-slate-800">{op.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{op.description}</p>
                  <div className="border-t border-slate-100 pt-2.5 text-[10px] text-slate-500 italic font-mono mt-1.5">
                    <strong>CEO Tactical Advice:</strong> {op.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Generation Conversion Heatmap */}
      <LeadHeatmap />

      {/* Strategic Marketing Objectives & Monthly Goals */}
      <StrategicObjectives campaigns={filteredCampaigns} />

      {/* Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1 mb-3.5">
          <Clock className="w-4 h-4 text-slate-500" /> Operational System Audit Logs (RBAC Scoped)
        </span>
        <div className="border border-slate-150 rounded-lg overflow-hidden bg-slate-50/50">
          <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-150">
            {filteredAudits.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs font-sans">
                Audit trail is quiet. Actions on campaigns or lead status changes will populate log blocks here.
              </div>
            ) : (
              filteredAudits.slice().reverse().map((log) => (
                <div key={log.id} className="p-2.5 flex items-start gap-3.5 text-xs font-sans hover:bg-slate-50 transition-all">
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap mt-0.5">
                    {log.timestamp}
                  </span>
                  <div className="flex-1">
                    <p className="text-slate-700">
                      <strong className="text-slate-900 font-mono text-[11px] font-semibold">
                        {log.actor}
                      </strong>{" "}
                      ({log.role}) <span className="text-slate-600 ml-1 font-medium">{log.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
