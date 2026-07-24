import React, { useState, useEffect } from "react";
import { Cpu, Search, Sparkles, RefreshCw, Plus, Trash2, ArrowRight, MessageSquare, Compass, Shield, Coins, UserCheck, Activity, TrendingUp, Layers, GraduationCap } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  category: string;
  description: string;
  systemPrompt: string;
  iconName: string;
  developerName: string;
  pricing: string;
  version: string;
  isPredefined?: boolean;
}

interface AiMarketplaceProps {
  companyProfile: any;
  onLogAction: (actionType: string, details: string) => void;
}

export const standardAgents: Agent[] = [
  {
    id: "agent-legal",
    name: "Legal Agent",
    category: "Legal",
    description: "Automates NDA drafting, service level agreements, and provincial compliance checks under PIPEDA and CASL.",
    systemPrompt: "You are a Sovereign Canadian Legal Assistant. Help draft contracts, NDAs, privacy clauses, and regulatory check sheets aligned with Canadian PIPEDA and provincial labor laws.",
    iconName: "Shield",
    developerName: "Sovereign Law Systems",
    pricing: "Free",
    version: "v1.4.0",
    isPredefined: true
  },
  {
    id: "agent-tax",
    name: "Tax Agent",
    category: "Tax",
    description: "Prepares Canadian CRA-compliant corporate tax write-offs, CCA depreciation planning, and HST/GST thresholds monitoring.",
    systemPrompt: "You are an AI Tax Strategist specialized in Canadian Corporate Tax (CRA). Guide corporate deductions, CCA Class 50 equipment write-offs, and HST filing requirements.",
    iconName: "Coins",
    developerName: "Sovereign Audit Labs",
    pricing: "Free",
    version: "v2.1.2",
    isPredefined: true
  },
  {
    id: "agent-hr",
    name: "HR Agent",
    category: "HR",
    description: "Generates provincial Employment Standards Act handbook guidelines, team onboarding sequences, and PTO policies.",
    systemPrompt: "You are a Sovereign HR Director. Build ESA-compliant onboarding templates, sick leave policies, and employee role descriptions.",
    iconName: "UserCheck",
    developerName: "Sovereign Core Labs",
    pricing: "Free",
    version: "v1.0.5",
    isPredefined: true
  },
  {
    id: "agent-medical",
    name: "Medical Marketing Agent",
    category: "Marketing",
    description: "Designs Health Canada compliance reviews, HIPAA-aligned intake rules, and non-comparative clinic growth copy.",
    systemPrompt: "You are a Medical Marketing Expert. Help structure campaigns that comply with Health Canada, protect patient PII under PIPEDA, and educate patients without making restricted health claims.",
    iconName: "Activity",
    developerName: "Health-Tech Agency",
    pricing: "Enterprise",
    version: "v1.1.0",
    isPredefined: true
  },
  {
    id: "agent-real-estate",
    name: "Real Estate Marketing Agent",
    category: "Marketing",
    description: "Drafts premium MLS listings, high-end visual scripts, regional market reports, and lead-routing drips.",
    systemPrompt: "You are a Luxury Real Estate Marketing Copilot. Formulate high-impact MLS listing descriptions, neighbor email campaigns, and open house follow-up strategies.",
    iconName: "TrendingUp",
    developerName: "Sovereign Realty Solutions",
    pricing: "Free",
    version: "v2.0.0",
    isPredefined: true
  },
  {
    id: "agent-restaurant",
    name: "Restaurant Marketing Agent",
    category: "Marketing",
    description: "Generates localized geofenced promotions, seasonal menu launches, and positive Google review templates.",
    systemPrompt: "You are an AI Restaurant Growth Hacker. Build time-sensitive visual promo ideas, review responder guides, and SMS customer loyalty loyalty metrics.",
    iconName: "Layers",
    developerName: "Sovereign Food Operations",
    pricing: "Free",
    version: "v1.2.1",
    isPredefined: true
  },
  {
    id: "agent-finance",
    name: "Finance Agent",
    category: "Finance",
    description: "Analyzes corporate CAC/LTV unit economics, operational cash runways, and CDAP grant optimization outlines.",
    systemPrompt: "You are a Corporate Financial Advisor. Model CAC, client acquisition metrics, CDAP micro-grants eligibility, and run-rate runways.",
    iconName: "Coins",
    developerName: "Sovereign Advisory Lab",
    pricing: "Free",
    version: "v1.0.2",
    isPredefined: true
  }
];

export const promptExamples: Record<string, string[]> = {
  Legal: [
    "Draft a standard bilingual Non-Disclosure Agreement for new contractors",
    "Audit our website Terms of Service for PIPEDA and CASL requirements",
    "Draft a Limitation of Liability clause for luxury client representation"
  ],
  Tax: [
    "Analyze Canadian CRA tax write-offs for our $3,500 monthly digital ad budget",
    "Assess Class 50 (55% declining balance) CCA hardware depreciation eligibility",
    "Evaluate multi-province HST/GST remittance thresholds for Ontario expansion"
  ],
  HR: [
    "Draft an Employment Standards Act (ESA) compliant 14-day onboarding timeline",
    "Create a standard sick leave and PTO policy guideline for small teams",
    "Draft a team leader security awareness and compliance handbook outline"
  ],
  Marketing: [
    "Develop a localized clinic growth campaign concept complying with Health Canada regulations",
    "Compose high-end MLS description for a 5-bedroom luxury estate in Forest Hill, Toronto",
    "Create a WhatsApp customer loyalty broadcast campaign outline for a local bistro"
  ]
};

export const AiMarketplace: React.FC<AiMarketplaceProps> = ({
  companyProfile,
  onLogAction
}) => {
  const [viewMode, setViewMode] = useState<"browse" | "chat">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [installedAgentIds, setInstalledAgentIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("sbb_marketplace_installed");
    return saved ? JSON.parse(saved) : ["agent-real-estate", "agent-hr"];
  });

  const [customAgents, setCustomAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem("sbb_marketplace_custom");
    return saved ? JSON.parse(saved) : [];
  });

  // Create Custom Agent States
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    name: "",
    category: "Marketing",
    description: "",
    systemPrompt: "",
    iconName: "Cpu",
    developerName: "My Company",
    pricing: "Free",
    version: "1.0.0"
  });

  const [isCreating, setIsCreating] = useState(false);

  // Chat/Collaboration States
  const [selectedAgentId, setSelectedAgentId] = useState<string>("agent-real-estate");
  const [taskInput, setTaskInput] = useState("");
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [collaborateResponse, setCollaborateResponse] = useState<any>(null);

  const allAgents = [...standardAgents, ...customAgents];

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("sbb_marketplace_installed", JSON.stringify(installedAgentIds));
  }, [installedAgentIds]);

  useEffect(() => {
    localStorage.setItem("sbb_marketplace_custom", JSON.stringify(customAgents));
  }, [customAgents]);

  const handleInstall = (id: string) => {
    if (!installedAgentIds.includes(id)) {
      setInstalledAgentIds((prev) => [...prev, id]);
      const agent = allAgents.find((a) => a.id === id);
      onLogAction("Agent Installed", `Installed custom neural capability: "${agent?.name}".`);
    }
  };

  const handleUninstall = (id: string) => {
    setInstalledAgentIds((prev) => prev.filter((i) => i !== id));
    const agent = allAgents.find((a) => a.id === id);
    onLogAction("Agent Uninstalled", `Removed neural node: "${agent?.name}".`);
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name || !newAgent.systemPrompt) return;

    const id = "custom-" + Math.random().toString(36).substring(2, 9);
    const created: Agent = {
      id,
      name: newAgent.name,
      category: newAgent.category || "Marketing",
      description: newAgent.description || "Custom enterprise agent.",
      systemPrompt: newAgent.systemPrompt,
      iconName: "Cpu",
      developerName: "Local Sandbox",
      pricing: "Free",
      version: "1.0.0"
    };

    setCustomAgents((prev) => [...prev, created]);
    setInstalledAgentIds((prev) => [...prev, id]);
    setIsCreating(false);
    onLogAction("Custom Agent Compiled", `Successfully engineered custom local agent: "${created.name}".`);
    
    // Reset form
    setNewAgent({
      name: "",
      category: "Marketing",
      description: "",
      systemPrompt: "",
      iconName: "Cpu",
      developerName: "My Company",
      pricing: "Free",
      version: "1.0.0"
    });
  };

  const handleCollaborate = async (e: React.FormEvent) => {
    e.preventDefault();
    const agent = allAgents.find((a) => a.id === selectedAgentId);
    if (!agent || !taskInput.trim()) return;

    setIsCollaborating(true);
    setCollaborateResponse(null);

    const stages = [
      "Establishing high-speed RPC handshake...",
      "Sovereign context injection completed...",
      "Synchronizing workspace parameters with Sovereign CEO Agent...",
      "Drafting boardroom roadmap..."
    ];

    let stageIdx = 0;
    const interval = setInterval(() => {
      if (stageIdx < stages.length) {
        setLoadingStatus(stages[stageIdx]);
        stageIdx++;
      } else {
        clearInterval(interval);
      }
    }, 900);

    try {
      const res = await fetch("/api/marketplace/collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName: agent.name,
          category: agent.category,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          task: taskInput,
          companyProfile
        })
      });

      clearInterval(interval);
      if (!res.ok) throw new Error("Collaboration request failed");

      const data = await res.json();
      setCollaborateResponse(data);
      onLogAction(
        "Agent Collaboration Executed",
        `CEO Agent & "${agent.name}" completed joint session on task: "${taskInput}".`
      );
    } catch (err) {
      console.error(err);
      setCollaborateResponse({
        result: "Error establishing secure proxy. Running boardroom offline mode. Check your internet connection or API keys."
      });
    } finally {
      setIsCollaborating(false);
    }
  };

  const getAgentIcon = (name: string) => {
    switch (name) {
      case "Shield": return <Shield className="w-5 h-5 text-indigo-500" />;
      case "Coins": return <Coins className="w-5 h-5 text-indigo-500" />;
      case "UserCheck": return <UserCheck className="w-5 h-5 text-indigo-500" />;
      case "Activity": return <Activity className="w-5 h-5 text-indigo-500" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5 text-indigo-500" />;
      case "Layers": return <Layers className="w-5 h-5 text-indigo-500" />;
      default: return <Cpu className="w-5 h-5 text-indigo-500" />;
    }
  };

  const filteredAgents = allAgents.filter((a) => {
    const matchesQuery =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.developerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const categories = ["All", "Legal", "Tax", "HR", "Marketing", "Finance", "Custom"];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
        <button
          onClick={() => setViewMode("browse")}
          className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
            viewMode === "browse" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Browse Marketplace ({allAgents.length})
        </button>
        <button
          onClick={() => setViewMode("chat")}
          className={`flex-1 py-2 text-xs font-bold font-sans rounded-lg transition-all cursor-pointer ${
            viewMode === "chat" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Boardroom Chat Room ({installedAgentIds.length} Installed)
        </button>
      </div>

      {/* VIEW 1: Browse & Create Agents */}
      {viewMode === "browse" && (
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-slate-600" />
                <span>Sovereign Neural Marketplace</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Install advanced LLM strategic agents specialized in Canadian law, tax guidelines, HR handbook drafting, and industry-targeted marketing frameworks.
              </p>
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-sans text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? "View Catalog" : "Create Custom Agent"}</span>
            </button>
          </div>

          {/* Create custom agent form */}
          {isCreating ? (
            <form onSubmit={handleCreateAgent} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Compile Custom Local Workspace Agent</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 font-sans block">Agent Prompt Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ontario Real Estate Contract Agent"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400 font-sans text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 font-sans block">Workspace Category</label>
                  <select
                    value={newAgent.category}
                    onChange={(e) => setNewAgent({ ...newAgent, category: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none text-slate-700 font-sans"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Legal">Legal</option>
                    <option value="Tax">Tax</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 font-sans block">Short Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Specialized in drafting custom residential leases compliant with the Ontario Standard Lease."
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400 font-sans text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 font-sans block">System Directives & Role Prompt</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify absolute instructions. e.g. You are an expert Ontario property conveyancer. You always verify Land Transfer Tax rates and municipal zoning definitions across the GTHA."
                  value={newAgent.systemPrompt}
                  onChange={(e) => setNewAgent({ ...newAgent, systemPrompt: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400 font-sans text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Compile & Install Node
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8.5 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-slate-400 font-sans text-slate-700"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold font-sans transition-all cursor-pointer ${
                        activeCategory === cat
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map((agent) => {
                  const isInstalled = installedAgentIds.includes(agent.id);
                  return (
                    <div
                      key={agent.id}
                      className="border border-slate-200 hover:border-slate-350 rounded-xl p-4 flex flex-col justify-between bg-slate-50/20 hover:bg-white transition-all space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            {getAgentIcon(agent.iconName)}
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 font-bold flex gap-1">
                            <span className="bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {agent.category}
                            </span>
                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100">
                              {agent.pricing}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 font-sans leading-snug">{agent.name}</h4>
                          <span className="text-[9px] font-mono text-slate-400">Developer: {agent.developerName} • {agent.version}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">{agent.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {isInstalled ? (
                          <>
                            <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Installed
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUninstall(agent.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                              title="Uninstall Agent Node"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleInstall(agent.id)}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Install Capability</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: Chat Sandbox (Boardroom Chat) */}
      {viewMode === "chat" && (
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active installed list */}
          <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-6">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                Boardroom Executive Suite:
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select an installed agent node to run strategic briefings or draft joint documents.
              </p>
            </div>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {installedAgentIds.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-sans">
                  No active strategic nodes installed. Go to Browse and install some capabilities!
                </div>
              ) : (
                installedAgentIds.map((id) => {
                  const agent = allAgents.find((a) => a.id === id);
                  if (!agent) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedAgentId(id);
                        setCollaborateResponse(null);
                      }}
                      className={`w-full text-left p-2.5 border rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedAgentId === id
                          ? "bg-slate-900 border-slate-900 text-white shadow"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                        {getAgentIcon(agent.iconName)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <strong className="text-xs font-bold leading-none block font-sans truncate">{agent.name}</strong>
                        <span className={`text-[9px] font-mono block ${selectedAgentId === id ? "text-slate-400" : "text-slate-400"}`}>
                          Category: {agent.category}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Prompts Suggestions */}
            {allAgents.find((a) => a.id === selectedAgentId) && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  Suggested Action Briefs:
                </span>
                <div className="space-y-1">
                  {(promptExamples[allAgents.find((a) => a.id === selectedAgentId)!.category] || [
                    "Draft an executive status report based on my corporate profile.",
                    "Analyze my current marketing stack compliance."
                  ]).map((pr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTaskInput(pr)}
                      className="w-full text-left p-1.5 bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 text-[10px] font-sans font-semibold text-slate-600 rounded transition-all truncate"
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sandbox Workspace Screen */}
          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[380px] flex flex-col justify-between">
            {allAgents.find((a) => a.id === selectedAgentId) ? (
              <div className="w-full flex flex-col justify-between h-full gap-5">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 font-sans">
                        Boardroom Session &harr; {allAgents.find((a) => a.id === selectedAgentId)!.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Security Layer: PIPEDA & CASL Enforced Isolation Node
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 font-bold uppercase">
                    Installed
                  </span>
                </div>

                {/* Response / Workspace display */}
                <div className="flex-1 bg-white border border-slate-150 rounded-xl p-4 shadow-inner max-h-[250px] overflow-y-auto">
                  {isCollaborating ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 text-xs text-center font-mono">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                      <span className="font-bold tracking-wider">{loadingStatus}</span>
                    </div>
                  ) : collaborateResponse ? (
                    <div className="text-xs text-slate-700 leading-relaxed font-sans font-medium whitespace-pre-line">
                      {collaborateResponse.result}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-sans text-center">
                      Task board is currently empty. Define a prompt inquiry below to initiate secure LLM execution.
                    </div>
                  )}
                </div>

                {/* Form Input */}
                <form onSubmit={handleCollaborate} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Draft a 3-paragraph executive compliance review based on my business goals..."
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-400 font-sans text-slate-700"
                  />
                  <button
                    type="submit"
                    disabled={isCollaborating || !taskInput.trim()}
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold font-sans text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span>Run Collaboration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-sans text-center py-16">
                Install or select a strategic agent node from the left menu to open the interactive collaborative courtroom workspace.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
