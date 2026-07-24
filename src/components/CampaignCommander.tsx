import React, { useState } from "react";
import { 
  Key, Target, Sliders, Sparkles, CheckCircle2, ShieldCheck, 
  Plus, AlertCircle, Play, Pause, RefreshCw, XCircle, ArrowRight, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CampaignCommanderProps {
  companyProfile: any;
  campaigns: any[];
  currentRole: string;
  userName: string;
  onLogAction: (action: string, details: string) => void;
  handleCreateCampaignRequest: (campaign: any) => void;
  handleApproveCampaign: (id: string, comments?: string) => void;
  handleRejectCampaign: (id: string, comments?: string) => void;
  handleOverrideCampaign: (id: string, status: string, reason: string) => void;
}

export const CampaignCommander: React.FC<CampaignCommanderProps> = ({
  companyProfile,
  campaigns,
  currentRole,
  userName,
  onLogAction,
  handleCreateCampaignRequest,
  handleApproveCampaign,
  handleRejectCampaign,
  handleOverrideCampaign
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"vault" | "media-plan" | "optimizer" | "builder" | "approvals">("builder");
  const pendingCount = campaigns.filter(c => c.status === "Pending").length;

  // Vault state
  const [apiKeys, setApiKeys] = useState({
    metaAds: "●●●●●●●●●●●●EAAG",
    googleAds: "●●●●●●●●●●●●9841",
    linkedIn: "●●●●●●●●●●●●8821",
    salesforce: "●●●●●●●●●●●●0129",
    hubspot: "●●●●●●●●●●●●7731"
  });

  // Builder form state
  const [newTitle, setNewTitle] = useState("");
  const [newAgent, setNewAgent] = useState("SEO Brain");
  const [newBudget, setNewBudget] = useState(1500);
  const [newApprovalRole, setNewApprovalRole] = useState("Marketing Manager");
  const [newComments, setNewComments] = useState("");

  const handleBuildRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    handleCreateCampaignRequest({
      title: newTitle,
      agent: newAgent,
      agentName: `SBB ${newAgent}`,
      budgetImpact: newBudget,
      approvalRequiredFrom: newApprovalRole,
      comments: newComments || "Initiated via Sovereign Autonomous Builder.",
      tactics: [
        { tactic: "Core Target Audience Acquisition", status: "Pending" },
        { tactic: "Automated Conversion Optimization", status: "Pending" }
      ]
    });

    setNewTitle("");
    setNewComments("");
    setActiveSubTab("approvals");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              SBB MarketingOS Integration Core
            </span>
            <span className="text-slate-400 text-xs">• Dynamic Pipeline</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            Sovereign Campaign & Connections Hub
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Consolidated operations console uniting pipeline components. Secure live API integrations, draft cross-channel paid media strategies, tune CPC and conversions, auto-generate responsive ad assets, and govern operational sign-offs directly under CEO supervision.
          </p>
        </div>

        {/* 5 Process Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveSubTab("vault")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "vault" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "vault" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>1</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">API Connections & Vault</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Integrate channels & keys</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("media-plan")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "media-plan" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "media-plan" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>2</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">Paid Media Strategy</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Define ad budgets & goals</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("optimizer")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "optimizer" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "optimizer" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>3</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">Campaign Optimizer</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Tune CPC & conversions</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("builder")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === "builder" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "builder" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>4</span>
            <div>
              <p className="font-sans text-[11px] leading-tight">Autonomous Builder</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Synthesize creatives</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("approvals")}
            className={`flex items-start gap-2.5 text-left p-2.5 rounded-xl transition-all cursor-pointer relative ${
              activeSubTab === "approvals" ? "bg-white/10 border border-white/10 font-bold" : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] ${activeSubTab === "approvals" ? "bg-indigo-500 text-white font-black" : "bg-slate-800 text-slate-400"}`}>5</span>
            <div className="pr-4">
              <p className="font-sans text-[11px] leading-tight flex items-center gap-1.5">Studio & Approvals</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Review, override & deploy</p>
            </div>
            {pendingCount > 0 && (
              <span className="absolute right-2 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === "vault" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              API Connections & Secret Credentials Vault
            </h3>
            <p className="text-xs text-slate-500">Encrypted token store adhering to CASL and PIPEDA security frameworks.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {Object.entries(apiKeys).map(([key, value]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-[10px] font-mono text-slate-500">{value}</p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">CONNECTED</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === "builder" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Autonomous Campaign Request Synthesizer
              </h3>
              <p className="text-xs text-slate-500 mt-1">Draft a structured marketing campaign request and route it through the RBAC approval hierarchy.</p>
            </div>

            <form onSubmit={handleBuildRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q3 Toronto Waterfront Luxury Condo Campaign"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target AI Agent</label>
                  <select
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SEO Brain">SBB SEO Brain</option>
                    <option value="Social AI">Social Media Campaign Engine</option>
                    <option value="CRM Router">CRM Lead Scoring Agent</option>
                    <option value="Market Research">Market Research LLM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget Allocation (CAD)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Approval Authority Required</label>
                  <select
                    value={newApprovalRole}
                    onChange={(e) => setNewApprovalRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Vice President">Vice President</option>
                    <option value="CEO">CEO Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Strategic Justification & Scope</label>
                <textarea
                  rows={3}
                  value={newComments}
                  onChange={(e) => setNewComments(e.target.value)}
                  placeholder="Detail campaign KPIs, audience parameters, and anticipated ROAS..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                Submit Campaign Request to RBAC Queue
              </button>
            </form>
          </motion.div>
        )}

        {activeSubTab === "approvals" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  RBAC Campaign Sign-Off & Execution Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Current Session Clearance: <span className="font-bold text-slate-800">{userName} ({currentRole})</span></p>
              </div>
            </div>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-mono">No active campaign requests in queue.</div>
              ) : (
                campaigns.map((camp) => (
                  <div key={camp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          camp.status === "Approved" ? "bg-emerald-100 text-emerald-800" : camp.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}>
                          {camp.status}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{camp.title}</h4>
                      </div>
                      <div className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        ${camp.budgetImpact} CAD
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{camp.comments || "No comments provided."}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200/60">
                      <div>Requested by: <span className="font-bold text-slate-700">{camp.createdBy}</span> • Approval: <span className="font-bold text-slate-700">{camp.approvalRequiredFrom}</span></div>
                      
                      <div className="flex items-center gap-2">
                        {camp.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApproveCampaign(camp.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectCampaign(camp.id)}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {currentRole === "CEO" && camp.status !== "Pending" && (
                          <button
                            onClick={() => handleOverrideCampaign(camp.id, camp.status === "Approved" ? "Rejected" : "Approved", "CEO Override via Executive Panel")}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded transition-all cursor-pointer text-[9px]"
                          >
                            CEO Override
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {["media-plan", "optimizer"].includes(activeSubTab) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">SBB Paid Media & Campaign Optimizer</h3>
            <p className="text-xs text-slate-500">Autonomous budget allocation engine tuning cross-channel ROAS and keyword bids.</p>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-medium">
              Live channels tuned: Google Search Core, Meta Brand Awareness, LinkedIn ABM, YouTube Video Retargeting.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
