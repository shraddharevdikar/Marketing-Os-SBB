import React, { useState } from "react";
import { 
  Target, TrendingUp, CheckCircle2, Clock, AlertTriangle, Sparkles, 
  Plus, Layers, Flag, Award, Calendar, DollarSign, BarChart3, Edit3, 
  ArrowUpRight, Zap, RefreshCw, Filter, Check
} from "lucide-react";

export interface Campaign {
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

export interface StrategicObjective {
  id: string;
  campaignId: string;
  campaignTitle: string;
  category: "Lead Gen" | "Revenue" | "Conversion Rate" | "Brand Reach" | "ROI Optimization";
  goalName: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  status: "On Track" | "Behind" | "Exceeded" | "At Risk";
  copilot: string;
  notes: string;
}

interface StrategicObjectivesProps {
  campaigns?: Campaign[];
  onLogAction?: (action: string, details: string) => void;
}

const defaultObjectives: StrategicObjective[] = [
  {
    id: "OBJ-101",
    campaignId: "REQ-2026-001",
    campaignTitle: "Toronto Luxury Condo Meta Video Ads",
    category: "Lead Gen",
    goalName: "Generate Qualified GTA Luxury Leads",
    currentValue: 185,
    targetValue: 250,
    unit: "Qualified Leads",
    deadline: "Jul 31, 2026",
    status: "On Track",
    copilot: "Victoria VP Hastings",
    notes: "Meta Reel CTR pacing at 3.4%. Lead form completion up 18% MoM."
  },
  {
    id: "OBJ-102",
    campaignId: "REQ-2026-002",
    campaignTitle: "B2B SaaS LinkedIn Retargeting",
    category: "Revenue",
    goalName: "Pipeline Contract Value Ingestion",
    currentValue: 42000,
    targetValue: 50000,
    unit: "$ CAD",
    deadline: "Jul 31, 2026",
    status: "On Track",
    copilot: "Miriam Manager Mercer",
    notes: "High conversion on enterprise demo bookings. 4 deals in final closing."
  },
  {
    id: "OBJ-103",
    campaignId: "REQ-2026-003",
    campaignTitle: "SEO Pillar Page Organic Cluster Expansion",
    category: "Brand Reach",
    goalName: "Top-3 Organic Search Keyword Rankings",
    currentValue: 14,
    targetValue: 20,
    unit: "Keywords Ranked #1-3",
    deadline: "Jul 31, 2026",
    status: "Behind",
    copilot: "Thomas TL Jenkins",
    notes: "Indexing delayed for 3 GTA commercial real estate keywords. Submitting sitemap updates."
  },
  {
    id: "OBJ-104",
    campaignId: "REQ-2026-004",
    campaignTitle: "AI Email Nurture Re-engagement Drip",
    category: "Conversion Rate",
    goalName: "MQL to SQL Conversion Rate",
    currentValue: 8.4,
    targetValue: 10.0,
    unit: "% Conversion",
    deadline: "Jul 31, 2026",
    status: "At Risk",
    copilot: "Victoria VP Hastings",
    notes: "CASL double opt-in sequence complete. Needs secondary subject line A/B test."
  }
];

export const StrategicObjectives: React.FC<StrategicObjectivesProps> = ({
  campaigns = [],
  onLogAction
}) => {
  const [objectives, setObjectives] = useState<StrategicObjective[]>(() => {
    const saved = localStorage.getItem("sbb_strategic_objectives");
    return saved ? JSON.parse(saved) : defaultObjectives;
  });

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValueInput, setEditValueInput] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Objective Form State
  const [newCampaignTitle, setNewCampaignTitle] = useState("");
  const [newGoalName, setNewGoalName] = useState("");
  const [newCategory, setNewCategory] = useState<StrategicObjective["category"]>("Lead Gen");
  const [newTargetValue, setNewTargetValue] = useState<number>(100);
  const [newCurrentValue, setNewCurrentValue] = useState<number>(20);
  const [newUnit, setNewUnit] = useState("Leads");
  const [newDeadline, setNewDeadline] = useState("Jul 31, 2026");

  const saveObjectives = (updated: StrategicObjective[]) => {
    setObjectives(updated);
    localStorage.setItem("sbb_strategic_objectives", JSON.stringify(updated));
  };

  // Filter objectives based on active category
  const filteredObjectives = objectives.filter(o => {
    if (activeCategory === "All") return true;
    return o.category === activeCategory;
  });

  // Calculate Monthly Metrics
  const totalObjectives = objectives.length;
  const onTrackCount = objectives.filter(o => o.status === "On Track" || o.status === "Exceeded").length;
  const avgProgressPct = totalObjectives > 0
    ? Math.round(objectives.reduce((sum, o) => sum + Math.min(100, (o.currentValue / (o.targetValue || 1)) * 100), 0) / totalObjectives)
    : 0;

  // Handle Quick Progress Update
  const handleUpdateValue = (id: string) => {
    const updated = objectives.map(obj => {
      if (obj.id === id) {
        const pct = (editValueInput / obj.targetValue) * 100;
        let newStatus: StrategicObjective["status"] = obj.status;
        if (pct >= 100) newStatus = "Exceeded";
        else if (pct >= 75) newStatus = "On Track";
        else if (pct >= 50) newStatus = "Behind";
        else newStatus = "At Risk";

        return { ...obj, currentValue: editValueInput, status: newStatus };
      }
      return obj;
    });

    saveObjectives(updated);
    if (onLogAction) {
      onLogAction("UPDATE_STRATEGIC_OBJECTIVE", `Updated progress value for objective ID ${id} to ${editValueInput}`);
    }
    setEditingId(null);
  };

  // Handle Adding New Objective
  const handleAddObjective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    const pct = (newCurrentValue / (newTargetValue || 1)) * 100;
    let statusVal: StrategicObjective["status"] = "On Track";
    if (pct >= 100) statusVal = "Exceeded";
    else if (pct >= 75) statusVal = "On Track";
    else if (pct >= 50) statusVal = "Behind";
    else statusVal = "At Risk";

    const newObj: StrategicObjective = {
      id: "OBJ-" + Math.floor(100 + Math.random() * 900),
      campaignId: "CAMP-" + Math.floor(1000 + Math.random() * 9000),
      campaignTitle: newCampaignTitle.trim() || "Active Monthly Campaign Goal",
      category: newCategory,
      goalName: newGoalName.trim(),
      currentValue: newCurrentValue,
      targetValue: newTargetValue,
      unit: newUnit.trim() || "Units",
      deadline: newDeadline,
      status: statusVal,
      copilot: "Executive Marketing Copilot",
      notes: "Custom monthly strategic marketing objective initialized."
    };

    const updated = [newObj, ...objectives];
    saveObjectives(updated);
    if (onLogAction) {
      onLogAction("ADD_STRATEGIC_OBJECTIVE", `Added new monthly strategic objective: '${newObj.goalName}'`);
    }

    setNewGoalName("");
    setNewCampaignTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
              Monthly Goal Telemetry
            </span>
            <span className="text-slate-400 text-xs">• Active Campaign Execution Tracking</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Strategic Objectives & Monthly Goal Tracker
          </h3>
          <p className="text-xs text-slate-500 max-w-2xl">
            Monitor real-time progress toward monthly revenue, lead volume, brand reach, and conversion targets across active marketing campaigns.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Strategic Goal</span>
        </button>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Monthly Objective Pace</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{avgProgressPct}%</p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target Completion Rate</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold font-mono">
            {avgProgressPct}%
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Active Goals Tracked</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalObjectives}</p>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
              Across active marketing campaigns
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Flag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">On-Track Objectives</p>
            <p className="text-2xl font-black text-emerald-600 font-mono mt-0.5">
              {onTrackCount} / {totalObjectives}
            </p>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
              {totalObjectives > 0 ? Math.round((onTrackCount / totalObjectives) * 100) : 0}% High Health Index
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Filtering Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
        <span className="text-slate-400 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Category:
        </span>
        {["All", "Lead Gen", "Revenue", "Conversion Rate", "Brand Reach"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Campaign Progress Bars Grid */}
      <div className="space-y-4">
        {filteredObjectives.map((obj) => {
          const pct = Math.min(100, Math.round((obj.currentValue / (obj.targetValue || 1)) * 100));

          let barColor = "bg-emerald-500";
          let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";

          if (obj.status === "Exceeded") {
            barColor = "bg-emerald-600";
            badgeStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
          } else if (obj.status === "On Track") {
            barColor = "bg-emerald-500";
            badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
          } else if (obj.status === "Behind") {
            barColor = "bg-amber-500";
            badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
          } else {
            barColor = "bg-rose-500";
            badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
          }

          const isEditingThis = editingId === obj.id;

          return (
            <div key={obj.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3.5">
              {/* Campaign Title & Goal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      {obj.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{obj.campaignTitle}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-1 flex items-center gap-2">
                    {obj.goalName}
                  </h4>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeStyle}`}>
                    {obj.status} ({pct}%)
                  </span>

                  <button
                    onClick={() => {
                      if (isEditingThis) {
                        setEditingId(null);
                      } else {
                        setEditingId(obj.id);
                        setEditValueInput(obj.currentValue);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Update Progress Value"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Value Metrics */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-800">
                    Current: {obj.unit.includes("$") ? `$${obj.currentValue.toLocaleString()}` : `${obj.currentValue} ${obj.unit}`}
                  </span>
                  <span className="text-slate-500 font-medium">
                    Target Goal: {obj.unit.includes("$") ? `$${obj.targetValue.toLocaleString()}` : `${obj.targetValue} ${obj.unit}`}
                  </span>
                </div>

                {/* Styled Progress Bar Container */}
                <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
                  <div
                    className={`${barColor} h-full rounded-full transition-all duration-500 shadow-sm`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Quick Update Value Form if Active */}
              {isEditingThis && (
                <div className="p-3 bg-white rounded-lg border border-slate-300 flex items-center gap-3 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-700">Update Current Progress Value:</span>
                  <input
                    type="number"
                    value={editValueInput}
                    onChange={(e) => setEditValueInput(parseFloat(e.target.value) || 0)}
                    className="w-28 bg-slate-50 border border-slate-300 text-xs px-2.5 py-1 rounded text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => handleUpdateValue(obj.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              )}

              {/* Footer Meta & Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Deadline: <strong className="text-slate-700">{obj.deadline}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Copilot: <strong className="text-slate-700">{obj.copilot}</strong>
                  </span>
                </div>
                <p className="italic text-slate-600 font-sans truncate max-w-md">
                  "{obj.notes}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Strategic Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add Monthly Strategic Objective
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddObjective} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Associated Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g., GTA Penthouse Meta Video Campaign"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Strategic Objective / Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Generate 300 Qualified Inbound Buyers"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Goal Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Lead Gen">Lead Generation</option>
                    <option value="Revenue">Revenue Ingestion</option>
                    <option value="Conversion Rate">Conversion Rate</option>
                    <option value="Brand Reach">Brand Reach</option>
                    <option value="ROI Optimization">ROI Optimization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Metric Unit Label</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g., Leads, $, %, ROAS"
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Progress Value</label>
                  <input
                    type="number"
                    value={newCurrentValue}
                    onChange={(e) => setNewCurrentValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Monthly Goal</label>
                  <input
                    type="number"
                    required
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Target Deadline</label>
                <input
                  type="text"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  placeholder="e.g., Jul 31, 2026"
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Strategic Objective</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
