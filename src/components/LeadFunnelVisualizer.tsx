import React, { useState } from "react";
import { 
  ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { 
  Filter, Users, CheckCircle2, ArrowRight, TrendingUp, Target, 
  Sparkles, ShieldCheck, ArrowDownRight, PhoneCall, Award, UserCheck, Layers
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  source: string;
  territory?: string;
  serviceInterest?: string;
  leadScore: number;
  status: string;
  leadOwner?: string;
}

interface LeadFunnelVisualizerProps {
  leads: Lead[];
  onLogAction?: (action: string, details: string) => void;
}

export const LeadFunnelVisualizer: React.FC<LeadFunnelVisualizerProps> = ({
  leads = [],
  onLogAction
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>("All");
  const [activeStageFilter, setActiveStageFilter] = useState<string>("All");

  // Filter leads by channel if selected
  const filteredLeads = leads.filter(l => {
    if (selectedChannel === "All") return true;
    return (l.source || "").toLowerCase().includes(selectedChannel.toLowerCase());
  });

  // Categorize leads into conversion stages
  const totalLeads = filteredLeads.length;

  const contactedLeadsList = filteredLeads.filter(l => {
    const s = (l.status || "").toLowerCase();
    return (
      s.includes("contact") || 
      s.includes("discussion") || 
      s.includes("qualif") || 
      s.includes("won") || 
      s.includes("convert")
    );
  });

  const qualifiedLeadsList = filteredLeads.filter(l => {
    const s = (l.status || "").toLowerCase();
    return s.includes("qualif") || s.includes("discussion") || s.includes("won") || s.includes("convert");
  });

  const convertedLeadsList = filteredLeads.filter(l => {
    const s = (l.status || "").toLowerCase();
    return s.includes("won") || s.includes("convert");
  });

  const countTotal = totalLeads;
  const countContacted = contactedLeadsList.length;
  const countQualified = qualifiedLeadsList.length;
  const countConverted = convertedLeadsList.length;

  // Rates
  const contactedRate = countTotal > 0 ? ((countContacted / countTotal) * 100).toFixed(1) : "0.0";
  const qualifiedConversionRate = countContacted > 0 ? ((countQualified / countContacted) * 100).toFixed(1) : "0.0";
  const closedConversionRate = countQualified > 0 ? ((countConverted / countQualified) * 100).toFixed(1) : "0.0";
  const overallWinRate = countTotal > 0 ? ((countConverted / countTotal) * 100).toFixed(1) : "0.0";

  // Recharts Funnel Data Structure
  const funnelData = [
    {
      stage: "1. Total Inbound Leads",
      name: "Captured Leads",
      value: countTotal,
      fill: "#3b82f6", // Blue
      description: "Total leads generated from marketing channels"
    },
    {
      stage: "2. Contacted Stage",
      name: "Contacted Leads",
      value: countContacted,
      fill: "#8b5cf6", // Purple
      description: "Engaged via call, email drip, or discovery session"
    },
    {
      stage: "3. Qualified Stage",
      name: "Qualified Opps",
      value: countQualified,
      fill: "#f59e0b", // Amber
      description: "Vetted sales-ready opportunities with intent"
    },
    {
      stage: "4. Converted Stage",
      name: "Closed Customers",
      value: countConverted,
      fill: "#10b981", // Emerald
      description: "Signed customer deals & attributed revenue"
    }
  ];

  // Stage comparison bar data
  const stageBarData = [
    { name: "Total Inbound", count: countTotal, fill: "#3b82f6" },
    { name: "Contacted", count: countContacted, fill: "#8b5cf6" },
    { name: "Qualified", count: countQualified, fill: "#f59e0b" },
    { name: "Converted", count: countConverted, fill: "#10b981" }
  ];

  // Lead table filtering by active stage button
  const displayLeadsInTable = filteredLeads.filter(l => {
    const s = (l.status || "").toLowerCase();
    if (activeStageFilter === "All") return true;
    if (activeStageFilter === "Contacted") {
      return s.includes("contact") || s.includes("discussion") || s.includes("qualif") || s.includes("won") || s.includes("convert");
    }
    if (activeStageFilter === "Qualified") {
      return s.includes("qualif") || s.includes("discussion") || s.includes("won") || s.includes("convert");
    }
    if (activeStageFilter === "Converted") {
      return s.includes("won") || s.includes("convert");
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Channel Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
              Lead Conversion Telemetry
            </span>
            <span className="text-slate-400 text-xs">• Real-Time CRM Pipeline Metrics</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Lead-to-Customer Conversion Funnel
          </h3>
          <p className="text-xs text-slate-500">
            Track lead velocity and conversion efficiency from initial outreach ("Contacted") to vetting ("Qualified") and closing ("Converted").
          </p>
        </div>

        {/* Channel Filter Selector */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700">Source Channel:</span>
          <select
            value={selectedChannel}
            onChange={(e) => {
              setSelectedChannel(e.target.value);
              if (onLogAction) {
                onLogAction("FILTER_FUNNEL_CHANNEL", `Filtered conversion funnel by channel: ${e.target.value}`);
              }
            }}
            className="bg-white border border-slate-300 text-xs font-bold text-slate-800 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Acquisition Channels</option>
            <option value="Google">Google Ads Search</option>
            <option value="Meta">Meta Ads Video / Reels</option>
            <option value="LinkedIn">LinkedIn Sponsored</option>
            <option value="SEO">SEO Organic Search</option>
            <option value="Email">Email Nurture Drip</option>
          </select>
        </div>
      </div>

      {/* KPI Progression Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stage 1: Captured */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Stage 1: Captured</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{countTotal}</p>
          <div className="text-[11px] text-slate-600 font-medium">
            Total Inbound CRM Leads
          </div>
          <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded w-fit">
            100% Ingestion Rate
          </div>
        </div>

        {/* Stage 2: Contacted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Stage 2: Contacted</span>
            <PhoneCall className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{countContacted}</p>
          <div className="text-[11px] text-purple-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{contactedRate}% Contact Rate</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Leads reached via AI calling & email
          </div>
        </div>

        {/* Stage 3: Qualified */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Stage 3: Qualified</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{countQualified}</p>
          <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-amber-500" />
            <span>{qualifiedConversionRate}% Contacted → Qualified</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Vetted opportunities with budget
          </div>
        </div>

        {/* Stage 4: Converted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Stage 4: Converted</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">{countConverted}</p>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>{closedConversionRate}% Qualified → Closed Won</span>
          </div>
          <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded w-fit">
            {overallWinRate}% Overall Win Rate
          </div>
        </div>
      </div>

      {/* Main Funnel Chart Visualizer & Drop-off Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recharts Funnel Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                Interactive Funnel Stage Diagram
              </h4>
              <p className="text-xs text-slate-500">Proportional volume across conversion stages</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
              RECHARTS FUNNEL
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} Leads (${item.payload.description})`,
                    item.payload.stage
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "12px"
                  }}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList
                    position="right"
                    fill="#1e293b"
                    stroke="none"
                    dataKey="name"
                    style={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* Stage Legend Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            {funnelData.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.fill }} />
                <div className="truncate">
                  <p className="font-bold text-slate-800 truncate">{f.name}</p>
                  <p className="font-mono text-slate-500">{f.value} leads</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Stage Conversion Drop-off & Velocity Analysis */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Stage Conversion & Drop-off Telemetry
              </h4>
              <p className="text-xs text-slate-500">Step-by-step lead qualification velocity</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Step 1 -> 2: Inbound to Contacted */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Inbound → Contacted
                </span>
                <span className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {contactedRate}% Conversion
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, parseFloat(contactedRate))}%` }} />
              </div>
              <p className="text-[11px] text-slate-600">
                {countContacted} of {countTotal} leads engaged. Drop-off: {countTotal - countContacted} unresponsive leads.
              </p>
            </div>

            {/* Step 2 -> 3: Contacted to Qualified */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Contacted → Qualified
                </span>
                <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {qualifiedConversionRate}% Conversion
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, parseFloat(qualifiedConversionRate))}%` }} />
              </div>
              <p className="text-[11px] text-slate-600">
                {countQualified} of {countContacted} contacted leads verified as high-intent opportunities.
              </p>
            </div>

            {/* Step 3 -> 4: Qualified to Converted */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Qualified → Converted
                </span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {closedConversionRate}% Conversion
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, parseFloat(closedConversionRate))}%` }} />
              </div>
              <p className="text-[11px] text-slate-600">
                {countConverted} of {countQualified} qualified opportunities signed into paying clients.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Stage Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Lead Conversion Stage Roster
            </h4>
            <p className="text-xs text-slate-500">Live records pulled directly from the CRM leads list</p>
          </div>

          {/* Stage Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {["All", "Contacted", "Qualified", "Converted"].map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStageFilter(stage)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeStageFilter === stage
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Lead Contact</th>
                <th className="py-3 px-4">Acquisition Channel</th>
                <th className="py-3 px-4">Lead Score</th>
                <th className="py-3 px-4">Current Stage Status</th>
                <th className="py-3 px-4">Assigned Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayLeadsInTable.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No leads matching stage filter '{activeStageFilter}' in channel '{selectedChannel}'
                  </td>
                </tr>
              ) : (
                displayLeadsInTable.map((lead) => {
                  const s = (lead.status || "").toLowerCase();
                  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";
                  let stageLabel = lead.status || "New";

                  if (s.includes("won") || s.includes("convert")) {
                    badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
                    stageLabel = "Converted (Closed Won)";
                  } else if (s.includes("qualif")) {
                    badgeStyle = "bg-amber-100 text-amber-800 border-amber-300 font-bold";
                    stageLabel = "Qualified Opportunity";
                  } else if (s.includes("contact") || s.includes("discussion")) {
                    badgeStyle = "bg-purple-100 text-purple-800 border-purple-300 font-bold";
                    stageLabel = "Contacted / In Discussion";
                  } else {
                    badgeStyle = "bg-blue-100 text-blue-800 border-blue-300 font-bold";
                    stageLabel = "New Inbound Lead";
                  }

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{lead.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{lead.company || lead.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200 font-medium">
                          {lead.source || "Organic Search"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          (lead.leadScore || 80) >= 85 ? "bg-emerald-50 text-emerald-700 font-bold" : "bg-slate-100 text-slate-600"
                        }`}>
                          {lead.leadScore || 80} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border ${badgeStyle}`}>
                          {stageLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] font-medium">
                        {lead.leadOwner || "Unassigned"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
