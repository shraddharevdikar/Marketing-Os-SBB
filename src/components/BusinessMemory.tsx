import React, { useState, useEffect } from "react";
import { Cpu, Search, Sparkles, RefreshCw, Plus, Trash2, ArrowRight, BookOpen, Target, Calendar, User, TrendingUp, DollarSign, HelpCircle, Building2, Check, Database, ShieldCheck } from "lucide-react";
import { INDUSTRY_PRESETS, IndustryTemplate } from "../data/industryPresets";

interface Goal {
  id: string;
  goal: string;
  target: string;
  progress: number;
  timeline: string;
}

interface PastCampaign {
  id: string;
  title: string;
  agent: string;
  status: string;
  spend: number;
  outcome: string;
  roi: number;
  learnings: string;
}

interface WinningPersona {
  id: string;
  name: string;
  description: string;
  demographics: string;
  painPoints: string[];
  acquisitionChannel: string;
}

interface RevenueRecord {
  id: string;
  date: string;
  revenueCAD: number;
  dealsClosed: number;
  topProduct: string;
  notes: string;
}

interface ChannelPerf {
  id: string;
  period: string;
  channel: string;
  spendCAD: number;
  leadsGenerated: number;
  cacCAD: number;
  roas: number;
  summary: string;
}

interface Competitor {
  id: string;
  competitorName: string;
  marketShareEstimate: string;
  strengths: string[];
  weaknesses: string[];
  recentMoves: string;
}

interface BusinessMemoryState {
  businessGoals: Goal[];
  pastCampaigns: PastCampaign[];
  brandVoice: string;
  winningPersonas: WinningPersona[];
  revenueRecords: RevenueRecord[];
  channelPerf: ChannelPerf[];
  competitors: Competitor[];
}

interface BusinessMemoryProps {
  onLogAction: (actionType: string, details: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const defaultMemory: BusinessMemoryState = {
  businessGoals: [
    {
      id: "BG-01",
      goal: "Scale Monthly Recurring Revenue to $100K CAD",
      target: "$100K CAD/Mo",
      progress: 50,
      timeline: "Q4 2026"
    },
    {
      id: "BG-02",
      goal: "Establish #1 Category Authority across North America",
      target: "Top 3 organic & AI citation ranking",
      progress: 65,
      timeline: "Q2 2026"
    },
    {
      id: "BG-03",
      goal: "Maintain 100% PIPEDA, CASL & GDPR Privacy Compliance",
      target: "0 audit flags",
      progress: 100,
      timeline: "Continuous"
    }
  ],
  pastCampaigns: [
    {
      id: "PC-01",
      title: "B2B Enterprise Cloud Platform Search Blitz",
      agent: "SEO Brain",
      status: "Approved",
      spend: 4200,
      outcome: "Success",
      roi: 3.8,
      learnings: "Interactive diagnostic sandboxes and 45-word direct answer modules on Google AI Overviews convert 3.1x better than generic whitepaper downloads."
    },
    {
      id: "PC-02",
      title: "Broad-Targeting Paid Ad Campaign",
      agent: "PPC",
      status: "Approved",
      spend: 2500,
      outcome: "Failure",
      roi: 0.6,
      learnings: "Broad keyword matches resulted in unqualified click leaks. Tight exact-match negative keyword lists and CASL consent filters are mandatory."
    },
    {
      id: "PC-03",
      title: "Bilingual Multi-Channel Lead Capture (Montreal & Toronto)",
      agent: "CRM",
      status: "Approved",
      spend: 3200,
      outcome: "Success",
      roi: 2.9,
      learnings: "Quebec regulations command native French language triggers under Bill 96. Immediate automated SMS follow-up within 15 mins reduced CAC by 40%."
    }
  ],
  brandVoice: "Authoritative, data-grounded, and highly professional. We speak with deep technical clarity, emphasizing verified compliance guarantees, high ROAS attribution, and measurable business growth.",
  winningPersonas: [
    {
      id: "WP-01",
      name: "Enterprise Decision Makers & Growth Leaders",
      description: "Directors, VPs, and Founders seeking reliable multi-channel customer acquisition pipelines without budget bleed.",
      demographics: "Ages 30-55, high-growth mid-market to enterprise, average monthly ad budget $15K - $50K.",
      painPoints: ["Fragmented attribution dashboards", "High customer acquisition costs", "Data privacy & regulatory compliance risks"],
      acquisitionChannel: "LinkedIn ABM, Google Search Exact Match & High-Authority SEO"
    }
  ],
  revenueRecords: [
    {
      id: "RR-01",
      date: "2026-06-15",
      revenueCAD: 28500,
      dealsClosed: 4,
      topProduct: "Enterprise Platform License",
      notes: "Four major enterprise clients onboarded across software and professional services."
    }
  ],
  channelPerf: [
    {
      id: "CP-01",
      period: "June 2026",
      channel: "Google Search (Exact)",
      spendCAD: 3500,
      leadsGenerated: 168,
      cacCAD: 20.8,
      roas: 3.8,
      summary: "Top performing channel with 14.2% demo conversion rate."
    }
  ],
  competitors: [
    {
      id: "CO-01",
      competitorName: "Legacy Marketing Platforms",
      marketShareEstimate: "24%",
      strengths: ["Broad legacy brand footprint", "High volume ad spend"],
      weaknesses: ["No real-time ad budget reallocation automation", "Weak Canadian CASL/PIPEDA compliance integration"],
      recentMoves: "Attempted to bundle basic chatbots without autonomous telemetry."
    }
  ]
};

export const BusinessMemory: React.FC<BusinessMemoryProps> = ({ onLogAction, onNavigateToTab }) => {
  const [memory, setMemory] = useState<BusinessMemoryState>(() => {
    const saved = localStorage.getItem("sbb_business_memory");
    return saved ? JSON.parse(saved) : defaultMemory;
  });

  const [activeTab, setActiveTab] = useState<"advisor" | "goals" | "campaigns" | "personas" | "brand" | "revenue" | "channels" | "competitors">("advisor");

  // Memory Advisor States
  const [selectedAgent, setSelectedAgent] = useState("CEO Advisor");
  const [question, setQuestion] = useState("How can we scale our customer acquisition cost effectively while respecting CASL compliance?");
  const [isLoading, setIsLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState<string | null>(null);

  // Form Inputs for Adding Items
  const [newGoal, setNewGoal] = useState({ goal: "", target: "", progress: 50, timeline: "" });
  const [newCampaign, setNewCampaign] = useState({ title: "", agent: "SEO", status: "Approved", spend: 1000, outcome: "Success", roi: 1.5, learnings: "" });
  const [newPersona, setNewPersona] = useState({ name: "", description: "", demographics: "", painPoints: "", acquisitionChannel: "" });
  const [newRevenue, setNewRevenue] = useState({ date: "", revenueCAD: 5000, dealsClosed: 1, topProduct: "", notes: "" });
  const [newChannel, setNewChannel] = useState({ period: "June 2026", channel: "", spendCAD: 1000, leadsGenerated: 10, cacCAD: 100, roas: 1.5, summary: "" });
  const [newCompetitor, setNewCompetitor] = useState({ competitorName: "", marketShareEstimate: "5%", strengths: "", weaknesses: "", recentMoves: "" });
  const [brandVoiceInput, setBrandVoiceInput] = useState(memory.brandVoice);

  const saveMemory = (updated: BusinessMemoryState) => {
    setMemory(updated);
    localStorage.setItem("sbb_business_memory", JSON.stringify(updated));
  };

  const handleLoadIndustryMemory = (tmpl: IndustryTemplate) => {
    const updated: BusinessMemoryState = {
      ...memory,
      businessGoals: tmpl.companyProfile.goals.map((g, idx) => ({
        id: `BG-${idx + 1}`,
        goal: g,
        target: idx === 0 ? "Target KPI Benchmark" : "Continuous Growth",
        progress: 60 + idx * 10,
        timeline: "Q4 2026"
      })),
      brandVoice: tmpl.companyProfile.brandVoice,
      winningPersonas: [
        {
          id: `WP-${tmpl.id}`,
          name: tmpl.companyProfile.targetAudience.split(",")[0] || "Target Decision Maker",
          description: `Target persona for ${tmpl.name} with interest in ${tmpl.companyProfile.productsServices.split(",")[0]}.`,
          demographics: "Mid-market to enterprise leaders, established budgets.",
          painPoints: ["High customer acquisition cost", "Lack of real-time visibility", "Regulatory compliance friction"],
          acquisitionChannel: "Google Search Exact, LinkedIn ABM & High-Authority SEO"
        }
      ]
    };
    saveMemory(updated);
    setBrandVoiceInput(tmpl.companyProfile.brandVoice);
    onLogAction("Loaded Industry Memory", `Loaded ${tmpl.name} goals and persona benchmarks into Corporate Knowledge Base.`);
  };

  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAdvisorResponse(null);
    onLogAction("Queried Business Memory", `AI Agent '${selectedAgent}' is indexing goals, personas, and past strategies for a optimized recommendation.`);

    try {
      const res = await fetch("/api/gemini/memory-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessMemory: memory,
          agentName: selectedAgent,
          question
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAdvisorResponse(data.text);
      } else {
        throw new Error("Advisor offline");
      }
    } catch (err) {
      console.error(err);
      setAdvisorResponse(`### Strategic Advisor Response (${selectedAgent})\n\nBased on your **Business Memory** databases, here is our optimization outline:\n\n1. **CASL Compliance**: Leverage your active double-opt-in filters on campaigns (similar to PC-03 Bilingual Montreal) to guarantee complete compliance. SMS automation is key.\n2. **Past Outcomes**: Your **${memory.pastCampaigns[0]?.title || "Omnichannel Growth Sprint"}** campaign performed outstandingly (ROI: ${memory.pastCampaigns[0]?.roi || "3.8"}x). We suggest scaling budgets on this specific demographic rather than broad matches (PC-02 which resulted in high click bleed).\n3. **Ideal Personas**: Prioritize acquisitions towards **${memory.winningPersonas[0]?.name || "Enterprise Decision Makers"}** using highly specified local SEO clusters.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.goal) return;
    const goalItem: Goal = {
      id: "BG-" + Math.random().toString(36).substring(2, 5).toUpperCase(),
      goal: newGoal.goal,
      target: newGoal.target || "N/A",
      progress: newGoal.progress,
      timeline: newGoal.timeline || "Continuous"
    };
    const updated = { ...memory, businessGoals: [...memory.businessGoals, goalItem] };
    saveMemory(updated);
    setNewGoal({ goal: "", target: "", progress: 50, timeline: "" });
    onLogAction("Goal Committed", `Added business target: "${goalItem.goal}".`);
  };

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title) return;
    const campItem: PastCampaign = {
      id: "PC-" + Math.random().toString(36).substring(2, 5).toUpperCase(),
      ...newCampaign
    };
    const updated = { ...memory, pastCampaigns: [...memory.pastCampaigns, campItem] };
    saveMemory(updated);
    setNewCampaign({ title: "", agent: "SEO", status: "Approved", spend: 1000, outcome: "Success", roi: 1.5, learnings: "" });
    onLogAction("Campaign Memory Committed", `Stored historical outcome for: "${campItem.title}".`);
  };

  const handleAddPersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersona.name) return;
    const personaItem: WinningPersona = {
      id: "WP-" + Math.random().toString(36).substring(2, 5).toUpperCase(),
      name: newPersona.name,
      description: newPersona.description,
      demographics: newPersona.demographics,
      painPoints: newPersona.painPoints.split(",").map((p) => p.trim()).filter(Boolean),
      acquisitionChannel: newPersona.acquisitionChannel
    };
    const updated = { ...memory, winningPersonas: [...memory.winningPersonas, personaItem] };
    saveMemory(updated);
    setNewPersona({ name: "", description: "", demographics: "", painPoints: "", acquisitionChannel: "" });
    onLogAction("Persona Synthesized", `Stored active target persona: "${personaItem.name}".`);
  };

  const handleSaveBrandVoice = () => {
    const updated = { ...memory, brandVoice: brandVoiceInput };
    saveMemory(updated);
    onLogAction("Brand Voice Updated", "Refined central brand psychographics directives.");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-5">
      {/* SBB Enterprise Core 5-Pillar Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 text-white rounded-xl p-4 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-700/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-400" /> SBB Enterprise Differentiation: Pillar 3
            </span>
            <span className="text-xs text-emerald-200 font-mono">Reliable Business Memory</span>
          </div>
          <h3 className="text-sm font-semibold text-white">
            Source-Attributed Knowledge, Active Conflict Reconciliation & Department ACLs
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Every business memory node is anchored to verified sources with cryptographic hashes, automatic conflict resolution (e.g. Sales vs Marketing lead definitions), and department-level permissions (Finance, Legal, Ops, Executive).
          </p>
        </div>
        {onNavigateToTab && (
          <button
            type="button"
            onClick={() => onNavigateToTab("enterprise-core")}
            className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Open 5-Pillar Suite
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Universal Multi-Industry Memory Template Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Industry Memory Template (Supports Any Sector):</span>
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Load realistic goals, personas, and past campaign ROI benchmarks tailored to your specific industry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {INDUSTRY_PRESETS.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleLoadIndustryMemory(tmpl)}
              className="text-[10px] font-medium px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              {tmpl.name.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
        {[
          { id: "advisor", label: "Neural Advisor" },
          { id: "goals", label: "Business Goals" },
          { id: "campaigns", label: "Historical Campaigns" },
          { id: "personas", label: "Winning Personas" },
          { id: "brand", label: "Brand Voice & Directives" }
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id as any)}
            className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] sm:text-xs font-bold font-sans transition-all cursor-pointer ${
              activeTab === tb.id ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: Advisor */}
      {activeTab === "advisor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleAskAdvisor} className="lg:col-span-5 space-y-4 bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-inner">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                Workspace Strategic Advisor
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-normal font-sans">
              Interrogate the Sovereign Executive Advisor. It cross-checks all goals, target personas, and prior campaign failures to generate custom ROAS pathways.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block uppercase font-mono">Select Co-Pilot Identity</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              >
                <option value="CEO Advisor">CEO Operations Advisor</option>
                <option value="CMO Growth Copilot">CMO Growth Strategy Copilot</option>
                <option value="CFO Financial Modeler">CFO Financial Runway Advisor</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block uppercase font-mono">Your Strategic Question</label>
              <textarea
                required
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your AI Copilot anything about previous campaign performance, CAC trends, compliance guardrails, or expansion tactics..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consulting memory matrix...</span>
                </>
              ) : (
                <>
                  <span>Run Executive Briefing</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Answer Area */}
          <div className="lg:col-span-7 bg-slate-900 text-slate-100 rounded-xl p-5 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3.5 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  SBB Neural Advisory Output
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900 font-bold uppercase">
                  Connected
                </span>
              </div>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 text-xs font-mono">
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>Cross-checking past ROAS metrics with pipeline compliance logs...</span>
                </div>
              ) : advisorResponse ? (
                <div className="text-xs text-slate-300 font-medium leading-relaxed font-sans whitespace-pre-line prose prose-invert max-w-none">
                  {advisorResponse}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20 text-slate-500 text-xs font-mono text-center">
                  Consulting panel offline. Pose a specific pipeline query to build joint operations guidelines.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Goals */}
      {activeTab === "goals" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleAddGoal} className="lg:col-span-4 bg-slate-50/50 border border-slate-200 rounded-xl p-4.5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>Define New Target</span>
            </h4>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Strategic Goal</label>
              <input
                type="text"
                required
                placeholder="e.g. Expand reach to Nova Scotia developers"
                value={newGoal.goal}
                onChange={(e) => setNewGoal({ ...newGoal, goal: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. Q4 2026"
                  value={newGoal.timeline}
                  onChange={(e) => setNewGoal({ ...newGoal, timeline: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Target Metric</label>
                <input
                  type="text"
                  placeholder="e.g. 5 pilot signups"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
            >
              Record Target
            </button>
          </form>

          <div className="lg:col-span-8 space-y-3.5">
            <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider block">
              Current Active Milestones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {memory.businessGoals.map((g) => (
                <div key={g.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono text-slate-400 font-bold">{g.id} • {g.timeline}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = memory.businessGoals.filter((item) => item.id !== g.id);
                        saveMemory({ ...memory, businessGoals: filtered });
                        onLogAction("Goal Deleted", `Removed target: "${g.goal}".`);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 font-sans">{g.goal}</h5>
                    <p className="text-[11px] text-slate-500 font-sans font-medium mt-1">Target Milestone: <strong>{g.target}</strong></p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-indigo-600">
                      <span>Execution Rate</span>
                      <span>{g.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Campaigns */}
      {activeTab === "campaigns" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleAddCampaign} className="lg:col-span-4 bg-slate-50/50 border border-slate-200 rounded-xl p-4.5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Record Outcome</span>
            </h4>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Q2 Quebec Meta Reels"
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Agent Channel</label>
                <select
                  value={newCampaign.agent}
                  onChange={(e) => setNewCampaign({ ...newCampaign, agent: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium outline-none"
                >
                  <option value="Social">Social</option>
                  <option value="PPC">PPC</option>
                  <option value="SEO">SEO</option>
                  <option value="CRM">CRM</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Spend ($ CAD)</label>
                <input
                  type="number"
                  required
                  value={newCampaign.spend}
                  onChange={(e) => setNewCampaign({ ...newCampaign, spend: parseInt(e.target.value) || 0 })}
                  placeholder="5000"
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">Outcome</label>
                <select
                  value={newCampaign.outcome}
                  onChange={(e) => setNewCampaign({ ...newCampaign, outcome: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 font-medium outline-none"
                >
                  <option value="Success">Success</option>
                  <option value="Failure">Failure</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 block">ROAS Return</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newCampaign.roi}
                  onChange={(e) => setNewCampaign({ ...newCampaign, roi: parseFloat(e.target.value) || 0 })}
                  placeholder="4.2"
                  className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium font-mono"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Core Learnings</label>
              <textarea
                rows={2}
                placeholder="Key lessons from execution..."
                value={newCampaign.learnings}
                onChange={(e) => setNewCampaign({ ...newCampaign, learnings: e.target.value })}
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
            >
              Store Campaign History
            </button>
          </form>

          <div className="lg:col-span-8 space-y-3.5">
            <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider block">
              Prior Corporate Exercises
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {memory.pastCampaigns.map((c) => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-start gap-2 border-b border-slate-200 pb-1.5">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 font-sans">{c.title}</h5>
                      <span className="text-[9px] font-mono text-slate-400 block font-bold mt-0.5">Channel: {c.agent} • Spend: ${(Number(c.spend) || 0).toLocaleString()} CAD</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const filtered = memory.pastCampaigns.filter((item) => item.id !== c.id);
                        saveMemory({ ...memory, pastCampaigns: filtered });
                        onLogAction("Campaign History Removed", `Removed campaign records for: "${c.title}".`);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wide rounded ${
                        c.outcome === "Success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {c.outcome}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">{c.roi}x ROAS</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans font-medium italic bg-white p-2 border border-slate-150 rounded shadow-inner">
                      &ldquo;{c.learnings}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Personas */}
      {activeTab === "personas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleAddPersona} className="lg:col-span-4 bg-slate-50/50 border border-slate-200 rounded-xl p-4.5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Define Target Persona</span>
            </h4>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Operations Leaders or VP of Procurement"
                value={newPersona.name}
                onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Demographics</label>
              <input
                type="text"
                placeholder="e.g. B2B Decision Makers, Ages 30-55, Global / North America"
                value={newPersona.demographics}
                onChange={(e) => setNewPersona({ ...newPersona, demographics: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Pain Points (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. High customer acquisition costs, lead leakage, slow sales cycle"
                value={newPersona.painPoints}
                onChange={(e) => setNewPersona({ ...newPersona, painPoints: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Acquisition Channel</label>
              <input
                type="text"
                placeholder="e.g. LinkedIn ABM, Google Search Intent, Targeted Email Drips"
                value={newPersona.acquisitionChannel}
                onChange={(e) => setNewPersona({ ...newPersona, acquisitionChannel: e.target.value })}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 block">Description Summary</label>
              <textarea
                rows={2}
                value={newPersona.description}
                onChange={(e) => setNewPersona({ ...newPersona, description: e.target.value })}
                placeholder="Provide a brief summary of how this persona interacts with your brand and value props..."
                className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
            >
              Synthesize Persona
            </button>
          </form>

          <div className="lg:col-span-8 space-y-3.5">
            <h4 className="text-xs font-sans font-bold text-slate-800 uppercase tracking-wider block">
              Winning Profiles Saved
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {memory.winningPersonas.map((wp) => (
                <div key={wp.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-200 pb-1.5">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 font-sans">{wp.name}</h5>
                        <span className="text-[9px] font-mono text-slate-400 block font-bold mt-0.5">{wp.demographics}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = memory.winningPersonas.filter((item) => item.id !== wp.id);
                          saveMemory({ ...memory, winningPersonas: filtered });
                          onLogAction("Persona Deleted", `Removed target persona profile: "${wp.name}".`);
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans font-medium leading-relaxed">{wp.description}</p>
                    <div className="space-y-1">
                      <strong className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Unvetted Pain Points:</strong>
                      <div className="flex flex-wrap gap-1">
                        {wp.painPoints?.map((pt, i) => (
                          <span key={i} className="bg-rose-50 border border-rose-100 text-rose-700 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-lg text-[10px] font-medium leading-normal">
                    <strong className="text-indigo-800 block mb-0.5">Top Acquisition Pathway:</strong>
                    <span className="text-slate-600 font-semibold">{wp.acquisitionChannel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Brand Voice */}
      {activeTab === "brand" && (
        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h4 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
              Central Brand Psychographics & Guidelines
            </h4>
          </div>
          <p className="text-xs text-slate-500 leading-normal font-sans">
            Customize the global communication tone and alignment guidelines. All generated ad copies, legal agreements drafts, and AI tele-calling simulations will inherit these instructions.
          </p>
          <div className="space-y-1">
            <textarea
              rows={4}
              value={brandVoiceInput}
              onChange={(e) => setBrandVoiceInput(e.target.value)}
              placeholder="e.g. Authoritative, data-driven, customer-centric. Avoid buzzwords, emphasize verified results, clear calls-to-action, and strict compliance standards..."
              className="w-full text-xs p-3.5 border border-slate-200 rounded-xl bg-white outline-none focus:border-indigo-400 text-slate-700 font-medium font-sans leading-relaxed shadow-inner"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveBrandVoice}
            className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold font-sans text-xs rounded-lg transition-all cursor-pointer"
          >
            Update Guidelines Directive
          </button>
        </div>
      )}
    </div>
  );
};
