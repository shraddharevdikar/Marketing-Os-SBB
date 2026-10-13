import React, { useState } from "react";
import { Activity, Play, Pause, RefreshCw, Zap, CheckCircle2, ShieldAlert, Share2, ShieldCheck, ArrowRight, Cpu } from "lucide-react";

interface ExecutionBrainProps {
  companyProfile: any;
  campaigns: any[];
  onLogAction: (action: string, details: string) => void;
  currentRole: string;
  userName: string;
  onNavigateToTab?: (tab: string) => void;
}

export const ExecutionBrain: React.FC<ExecutionBrainProps> = ({
  companyProfile,
  campaigns,
  onLogAction,
  currentRole,
  userName,
  onNavigateToTab
}) => {
  const [executionState, setExecutionState] = useState<"IDLE" | "EXECUTING" | "PAUSED">("EXECUTING");
  const [logs, setLogs] = useState<string[]>([
    "[09:15 AM] SBB Autonomous Execution Engine armed.",
    "[09:16 AM] Syncing live ad bids across Meta, Google & LinkedIn APIs.",
    "[09:18 AM] Global privacy & security compliance check passed for active campaigns."
  ]);

  const handleRunCycle = () => {
    onLogAction("Triggered Execution Cycle", `${userName} executed real-time bid tuning for ${companyProfile.companyName}.`);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Manual execution trigger initiated by ${userName} (${currentRole}).`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6">
      {/* 5-Pillar Enterprise Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-950 to-purple-900/60 border border-indigo-500/40 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/40 rounded-xl border border-indigo-400/40">
            <Cpu className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
                SBB Enterprise Differentiation Core
              </span>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                PILLARS 2 & 4
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-0.5">
              Multi-Agent DAG Orchestration & Consequential Approval Gates
            </h4>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab && onNavigateToTab("enterprise-core")}
          className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-center whitespace-nowrap"
        >
          Open 5-Pillar Core Architecture
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-800/40 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                SBB Autonomous Execution Core
              </span>
              <span className="text-indigo-300 text-xs">• Live Automation Loop</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              SBB Execution Brain & Automation Hub
            </h2>
            <p className="text-xs text-indigo-200/80 mt-1">
              Autonomous ad dispatch, live bid tuning, and conversion optimization engine for {companyProfile.companyName}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCycle}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Trigger Tactical Execution Cycle
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
            Active Execution Workflows
          </h3>
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{c.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Budget: ${c.budgetImpact} • Agent: {c.agent}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  c.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {c.status === "Approved" ? "LIVE EXECUTION" : "PENDING SIGNOFF"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
            Live System Log
          </h3>
          <div className="space-y-2 h-64 overflow-y-auto custom-scrollbar pr-1 text-[11px] text-slate-400">
            {logs.map((log, index) => (
              <p key={index} className="leading-snug">{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
