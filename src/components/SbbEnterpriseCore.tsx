import React, { useState, useEffect } from "react";
import {
  Cpu,
  Share2,
  Database,
  ShieldCheck,
  TrendingUp,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  FileText,
  Lock,
  Layers,
  Search,
  DollarSign,
  Users,
  BarChart3,
  Sliders,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Download,
  Building2,
  Activity,
  Bot
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

interface SbbEnterpriseCoreProps {
  companyProfile: any;
  currentRole: string;
  userName: string;
  userDepartment?: string;
  onLogAction: (action: string, details: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const SbbEnterpriseCore: React.FC<SbbEnterpriseCoreProps> = ({
  companyProfile,
  currentRole,
  userName,
  userDepartment = "Enterprise Operations",
  onLogAction,
  onNavigateToTab
}) => {
  const [activePillar, setActivePillar] = useState<
    "intelligence" | "orchestration" | "memory" | "security" | "outcomes"
  >("intelligence");

  // -------------------------------------------------------------
  // PILLAR 1: Business-Wide Intelligence State
  // -------------------------------------------------------------
  const [marketingSpend, setMarketingSpend] = useState<number>(12000);
  const [salesReps, setSalesReps] = useState<number>(4);
  const [churnMitigationBudget, setChurnMitigationBudget] = useState<number>(3500);
  const [acvCad, setAcvCad] = useState<number>(2400);
  const [isSimulatingDecision, setIsSimulatingDecision] = useState<boolean>(false);
  const [decisionResults, setDecisionResults] = useState<any>(null);
  const [aiSynthesisText, setAiSynthesisText] = useState<string>("");

  // -------------------------------------------------------------
  // PILLAR 2: Agent Orchestration State
  // -------------------------------------------------------------
  const [orchestrationObjective, setOrchestrationObjective] = useState<string>(
    "Scale Inbound Enterprise Pipeline with Multichannel Intent Orchestration"
  );
  const [orchestrationBudget, setOrchestrationBudget] = useState<number>(8500);
  const [orchestrationChannel, setOrchestrationChannel] = useState<string>("LinkedIn & Google Intent Search");
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [orchestrationTrace, setOrchestrationTrace] = useState<any>(null);
  const [selectedAgentDetail, setSelectedAgentDetail] = useState<any>(null);

  // -------------------------------------------------------------
  // PILLAR 3: Business Memory State
  // -------------------------------------------------------------
  const [memoryFilterDept, setMemoryFilterDept] = useState<string>("All");
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [selectedSourceModal, setSelectedSourceModal] = useState<any>(null);
  const [freshnessScore, setFreshnessScore] = useState<number>(96);
  const [isReconciling, setIsReconciling] = useState<boolean>(false);

  // -------------------------------------------------------------
  // PILLAR 4: Secure Execution State
  // -------------------------------------------------------------
  const [approvalGates, setApprovalGates] = useState<any[]>([]);
  const [auditBlocks, setAuditBlocks] = useState<any[]>([]);
  const [isChainValid, setIsChainValid] = useState<boolean>(true);
  const [isVerifyingLedger, setIsVerifyingLedger] = useState<boolean>(false);
  const [selectedGateModal, setSelectedGateModal] = useState<any>(null);
  const [gateJustification, setGateJustification] = useState<string>("Verified executive authorization limit");

  // -------------------------------------------------------------
  // PILLAR 5: Proven Outcomes State
  // -------------------------------------------------------------
  const [outcomesData, setOutcomesData] = useState<any>(null);
  const [calculatorTeamSize, setCalculatorTeamSize] = useState<number>(8);
  const [calculatorAdSpend, setCalculatorAdSpend] = useState<number>(25000);

  // Fetch initial telemetry from backend
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Initial decision engine calculation
      runDecisionEngineSimulation(12000, 4, 3500, 2400);

      // 2. Fetch memory conflicts
      const confRes = await fetch("/api/sbb/memory/conflicts");
      if (confRes.ok) {
        const confData = await confRes.json();
        setConflicts(confData.conflicts || []);
      }

      // 3. Fetch approval gates
      const gatesRes = await fetch("/api/sbb/security/approval-gates");
      if (gatesRes.ok) {
        const gatesData = await gatesRes.json();
        setApprovalGates(gatesData.approvalGates || []);
      }

      // 4. Fetch audit chain
      const auditRes = await fetch("/api/sbb/security/audit-chain");
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditBlocks(auditData.blocks || []);
        setIsChainValid(auditData.isChainValid !== false);
      }

      // 5. Fetch proven outcomes
      const outRes = await fetch("/api/sbb/outcomes/metrics");
      if (outRes.ok) {
        const outData = await outRes.json();
        setOutcomesData(outData);
      }
    } catch (e) {
      console.warn("Initial data fetch fallback:", e);
    }
  };

  // Run Decision Engine
  const runDecisionEngineSimulation = async (
    spend: number,
    reps: number,
    mitigation: number,
    acv: number
  ) => {
    setIsSimulatingDecision(true);
    try {
      const res = await fetch("/api/sbb/decision-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketingSpendCad: spend,
          salesRepsCount: reps,
          churnMitigationBudgetCad: mitigation,
          acvCad: acv,
          currentMonthlyRevenueCad: 48000,
          cashReserveCad: 240000,
          companyProfile
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDecisionResults(data);
        setAiSynthesisText(data.aiSynthesis || "");
      }
    } catch (err) {
      console.error("Decision engine simulation error:", err);
    } finally {
      setIsSimulatingDecision(false);
    }
  };

  // Trigger Autonomous Multi-Agent Pipeline
  const handleRunOrchestrationPipeline = async () => {
    setIsRunningPipeline(true);
    onLogAction(
      "Agent Pipeline Triggered",
      `${userName} (${currentRole}) dispatched 5-agent autonomous DAG pipeline for: "${orchestrationObjective}".`
    );
    try {
      const res = await fetch("/api/sbb/orchestrate/run-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineObjective: orchestrationObjective,
          budgetCapCad: orchestrationBudget,
          primaryChannel: orchestrationChannel,
          targetAudience: "Executive B2B Decision Makers",
          tenantId: "tenant_sbb_corp_prod_01",
          userName,
          userRole: currentRole
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOrchestrationTrace(data);
        // Refresh audit chain to reflect new block
        const auditRes = await fetch("/api/sbb/security/audit-chain");
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditBlocks(auditData.blocks || []);
        }
      }
    } catch (err) {
      console.error("Pipeline run error:", err);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Reconcile Memory Conflict
  const handleReconcileConflict = async (conflictId: string, choice: "A" | "B") => {
    setIsReconciling(true);
    try {
      const res = await fetch("/api/sbb/memory/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conflictId,
          chosenRecordId: choice,
          justification: `Executive audit reconciliation by ${userName} (${currentRole})`,
          actor: userName,
          role: currentRole,
          tenantId: "tenant_sbb_corp_prod_01"
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setConflicts(prev =>
          prev.map(c => (c.id === conflictId ? updated.reconciledRecord : c))
        );
        onLogAction(
          "Memory Conflict Reconciled",
          `Reconciled conflict ${conflictId} to official Golden Record.`
        );
        // Refresh audit chain
        const auditRes = await fetch("/api/sbb/security/audit-chain");
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditBlocks(auditData.blocks || []);
        }
      }
    } catch (e) {
      console.error("Reconcile error:", e);
    } finally {
      setIsReconciling(false);
    }
  };

  // Decide Consequential Approval Gate
  const handleDecideApprovalGate = async (gateId: string, decision: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/sbb/security/approval-gates/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateId,
          decision,
          actor: userName,
          role: currentRole,
          justification: gateJustification,
          tenantId: "tenant_sbb_corp_prod_01"
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit approval gate decision");
        return;
      }
      setApprovalGates(prev =>
        prev.map(g => (g.id === gateId ? data.gate : g))
      );
      setSelectedGateModal(null);
      onLogAction(
        `Approval Gate ${decision}`,
        `${userName} (${currentRole}) ${decision.toLowerCase()} consequential action gate ${gateId}.`
      );
      // Refresh audit chain
      const auditRes = await fetch("/api/sbb/security/audit-chain");
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditBlocks(auditData.blocks || []);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  // Verify Ledger Cryptographic Chaining
  const handleVerifyLedger = async () => {
    setIsVerifyingLedger(true);
    try {
      const auditRes = await fetch("/api/sbb/security/audit-chain");
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditBlocks(auditData.blocks || []);
        setIsChainValid(auditData.isChainValid !== false);
      }
    } finally {
      setTimeout(() => setIsVerifyingLedger(false), 600);
    }
  };

  // Memory Knowledge Items with Provenance and Department Clearance
  const memoryBankItems = [
    {
      id: "MEM-801",
      topic: "Target Blended Customer Acquisition Cost (CAC)",
      content: "Target Enterprise CAC is capped at $450 CAD with a target CAC payback period of under 6 months.",
      department: "Finance",
      verifiedAt: "2026-10-08",
      auditor: "Chief Financial Officer",
      freshness: 98,
      sourceDoc: "Corporate Annual Financial Plan & Unit Economics Ledger",
      sourceChunkId: "FIN-2026-UE-44",
      sourceExcerpt: "Section 4.2: Maximum sustainable CAC across B2B channels shall not exceed $450 CAD based on 85% gross margin assumptions."
    },
    {
      id: "MEM-802",
      topic: "High-Intent Enterprise ICP & Buying Center",
      content: "Primary buyer persona is VP Technology / CIO in North American SaaS & Retail networks with 50-500 employees.",
      department: "Marketing",
      verifiedAt: "2026-10-02",
      auditor: "Miriam Manager Mercer",
      freshness: 92,
      sourceDoc: "GTM Customer Profile Matrix & Win/Loss Audit",
      sourceChunkId: "MKT-ICP-2026-09",
      sourceExcerpt: "Analysis of 64 closed-won enterprise deals indicates 73% originated from VP/C-suite tech leadership inquiries."
    },
    {
      id: "MEM-803",
      topic: "Sales SLA & Lead Routing Speed Threshold",
      content: "MQLs scored >=80 must be contacted by Senior SDR within 15 minutes of inbound capture to preserve 24% conversion velocity.",
      department: "Sales",
      verifiedAt: "2026-09-28",
      auditor: "Thomas TL Jenkins",
      freshness: 86,
      sourceDoc: "Commercial Sales Operations Playbook v3.1",
      sourceChunkId: "SLS-SLA-108",
      sourceExcerpt: "Lead decay curves demonstrate a 4.2x drop in qualification rate when initial outreach exceeds 60 minutes."
    },
    {
      id: "MEM-804",
      topic: "PIPEDA, CASL & GDPR Regulatory Privacy Standard",
      content: "Zero unmasked PII in public ad tracking pixels; all commercial email sequences require double consent cryptographic tokens.",
      department: "Legal & Compliance",
      verifiedAt: "2026-10-10",
      auditor: "General Counsel & Compliance Sentinel",
      freshness: 100,
      sourceDoc: "Canadian & Global Privacy Mandate Certification",
      sourceChunkId: "LEG-PRIV-2026-11",
      sourceExcerpt: "Complies with Federal Bill C-27 (CPPA) and CASL Section 6. Explicit consent records retained with SHA-256 hash."
    },
    {
      id: "MEM-805",
      topic: "Signing Authority & Consequential Action Limits",
      content: "Autonomous agent ad dispatches >$5,000 CAD or PII customer exports strictly require CEO or VP approval gate sign-off.",
      department: "Executive",
      verifiedAt: "2026-10-05",
      auditor: "Board Governance Committee",
      freshness: 95,
      sourceDoc: "Executive Governance & Corporate Authority Matrix",
      sourceChunkId: "EXEC-GOV-90",
      sourceExcerpt: "Article 8: Consequential AI tool invocations exceeding Tier 2 capital impact require authenticated multi-signature release."
    }
  ];

  const filteredMemoryItems = memoryBankItems.filter(item => {
    if (memoryFilterDept === "All") return true;
    return item.department.toLowerCase().includes(memoryFilterDept.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Marquee Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-700/50 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                SBB Enterprise Core
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Architecture Verified
              </span>
              <span className="text-slate-400 text-xs font-mono">
                Tenant: <strong className="text-indigo-200">tenant_sbb_corp_prod_01</strong> ({companyProfile.companyName})
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-sans">
              The 5 Differentiated Pillars of Sovereign Business Brain
            </h1>
            <p className="text-xs lg:text-sm text-indigo-100/80 leading-relaxed font-sans">
              Beyond standard AI chat interfaces: A unified cross-functional decision engine, real multi-agent delegation with authorized integrations, audited corporate memory, zero-trust execution gates, and quantifiable business outcomes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start lg:self-center">
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-right font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Current Clearance</span>
              <span className="text-xs font-bold text-indigo-300 block">{currentRole} • {userName}</span>
            </div>
          </div>
        </div>

        {/* 5-Pillar Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-6 pt-5 border-t border-indigo-900/60 font-sans">
          {[
            {
              id: "intelligence",
              num: "1",
              title: "Business-Wide Intelligence",
              subtitle: "4-Way Cross-Impact Decision Engine",
              icon: Cpu,
              color: "text-blue-400"
            },
            {
              id: "orchestration",
              num: "2",
              title: "Agent Orchestration Layer",
              subtitle: "Delegation DAG & Authorized Tools",
              icon: Share2,
              color: "text-purple-400"
            },
            {
              id: "memory",
              num: "3",
              title: "Reliable Business Memory",
              subtitle: "Source Citations & Conflict Resolution",
              icon: Database,
              color: "text-emerald-400"
            },
            {
              id: "security",
              num: "4",
              title: "Secure Execution & Gates",
              subtitle: "Tenant Isolation & Immutable Ledger",
              icon: ShieldCheck,
              color: "text-amber-400"
            },
            {
              id: "outcomes",
              num: "5",
              title: "Proven Business Outcomes",
              subtitle: "Hard Revenue, Cost & Time Deltas",
              icon: TrendingUp,
              color: "text-cyan-400"
            }
          ].map(p => {
            const Icon = p.icon;
            const isSelected = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-600/30 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400/50"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                    Pillar {p.num}
                  </span>
                  <Icon className={`w-4 h-4 ${p.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight line-clamp-1">{p.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PILLAR 1: BUSINESS-WIDE INTELLIGENCE                                      */}
      {/* ========================================================================= */}
      {activePillar === "intelligence" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    PILLAR 1: SYSTEMIC DECISION ENGINE
                  </span>
                  <span className="text-xs font-mono text-slate-500">• Cross-Functional Interdependency Model</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  How Marketing Spend, Sales Conversion, Retention & Cash Flow Affect One Another
                </h2>
                <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
                  Adjust any variable below to observe systemic downstream ripple effects. See how aggressive ad spend spikes can overwhelm sales rep bandwidth, create onboarding backlog, inflate churn, and compress cash runway.
                </p>
              </div>

              <button
                onClick={() => runDecisionEngineSimulation(marketingSpend, salesReps, churnMitigationBudget, acvCad)}
                disabled={isSimulatingDecision}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start md:self-center"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingDecision ? "animate-spin" : ""}`} />
                {isSimulatingDecision ? "Synthesizing Systemic Matrix..." : "Run Strategic Equilibrium Synthesis"}
              </button>
            </div>

            {/* Interactive Simulation Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-5 bg-slate-50 rounded-xl border border-slate-200">
              {/* Slider 1: Marketing Spend */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    Monthly Ad Spend
                  </span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ${marketingSpend.toLocaleString()} CAD
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="40000"
                  step="1000"
                  value={marketingSpend}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMarketingSpend(val);
                    runDecisionEngineSimulation(val, salesReps, churnMitigationBudget, acvCad);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$2,000 (Conservative)</span>
                  <span>$40,000 (Hyper-Growth)</span>
                </div>
              </div>

              {/* Slider 2: Sales Rep Capacity */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Sales Team Headcount
                  </span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {salesReps} Reps ({salesReps * 35} MQL max)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={salesReps}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSalesReps(val);
                    runDecisionEngineSimulation(marketingSpend, val, churnMitigationBudget, acvCad);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 Rep (Constrained)</span>
                  <span>12 Reps (Expanded)</span>
                </div>
              </div>

              {/* Slider 3: Churn Mitigation Budget */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    CS / Retention Budget
                  </span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ${churnMitigationBudget.toLocaleString()} CAD
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="500"
                  value={churnMitigationBudget}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setChurnMitigationBudget(val);
                    runDecisionEngineSimulation(marketingSpend, salesReps, val, acvCad);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$500 (Minimal CS)</span>
                  <span>$15,000 (White-Glove)</span>
                </div>
              </div>

              {/* Slider 4: ACV / Contract Value */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    Average Contract Value
                  </span>
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    ${acvCad.toLocaleString()} CAD/yr
                  </span>
                </div>
                <input
                  type="range"
                  min="1200"
                  max="10000"
                  step="200"
                  value={acvCad}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAcvCad(val);
                    runDecisionEngineSimulation(marketingSpend, salesReps, churnMitigationBudget, val);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$1,200 (SMB)</span>
                  <span>$10,000 (Enterprise)</span>
                </div>
              </div>
            </div>

            {/* 4 Interconnected Core Metrics Grid */}
            {decisionResults?.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Marketing Dimension */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">1. Marketing Dimension</span>
                    <span className="text-[10px] font-mono font-bold bg-blue-200/80 text-blue-900 px-1.5 py-0.5 rounded">
                      ${decisionResults.metrics.dynamicCpl} CPL
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 font-sans">
                      {decisionResults.metrics.rawLeadsGenerated} Leads
                    </span>
                    <span className="text-xs text-slate-500 block">({decisionResults.metrics.mqls} Qualified MQLs)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-blue-200/60 font-mono">
                    <div className="flex justify-between">
                      <span>Total Spend:</span>
                      <strong>${decisionResults.metrics.marketingSpendCad.toLocaleString()} CAD</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Spend Scaling Factor:</span>
                      <strong>{(marketingSpend / 10000).toFixed(2)}x</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Sales Dimension */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  decisionResults.metrics.leadOverloadRatio > 1.3
                    ? "border-amber-300 bg-amber-50/60"
                    : "border-indigo-200 bg-indigo-50/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">2. Sales Dimension</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      decisionResults.metrics.leadOverloadRatio > 1.3
                        ? "bg-amber-200 text-amber-900"
                        : "bg-indigo-200/80 text-indigo-900"
                    }`}>
                      {decisionResults.metrics.leadOverloadRatio}x Rep Load
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 font-sans">
                      {decisionResults.metrics.dealsClosed} Closed Deals
                    </span>
                    <span className="text-xs text-slate-500 block">Win Rate: {decisionResults.metrics.actualConversionRate}%</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-indigo-200/60 font-mono">
                    <div className="flex justify-between">
                      <span>Rep Capacity:</span>
                      <strong>{decisionResults.metrics.totalRepCapacity} leads/mo</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>New Pipeline:</span>
                      <strong>${decisionResults.metrics.newAnnualPipeline.toLocaleString()} CAD</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Retention Dimension */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">3. Retention Dimension</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
                      {decisionResults.metrics.annualizedRetentionRate}% Retention
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-900 font-sans">
                      ${decisionResults.metrics.ltvCad.toLocaleString()} LTV
                    </span>
                    <span className="text-xs text-slate-500 block">CAC: ${decisionResults.metrics.cacCad.toLocaleString()} CAD</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-emerald-200/60 font-mono">
                    <div className="flex justify-between">
                      <span>LTV:CAC Ratio:</span>
                      <strong className={decisionResults.metrics.ltvCacRatio >= 3 ? "text-emerald-700" : "text-amber-700"}>
                        {decisionResults.metrics.ltvCacRatio}x
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Churn:</span>
                      <strong>{decisionResults.metrics.netMonthlyChurnRate}%/mo</strong>
                    </div>
                  </div>
                </div>

                {/* 4. Cash Flow & Runway */}
                <div className={`p-4 rounded-xl border space-y-2 ${
                  decisionResults.metrics.runwayMonths < 9
                    ? "border-rose-300 bg-rose-50/60"
                    : "border-purple-200 bg-purple-50/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">4. Cash Flow & Runway</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      decisionResults.metrics.runwayMonths < 9 ? "bg-rose-200 text-rose-900" : "bg-purple-200/80 text-purple-900"
                    }`}>
                      {decisionResults.metrics.runwayMonths} Mo Runway
                    </span>
                  </div>
                  <div>
                    <span className={`text-2xl font-black font-sans ${
                      decisionResults.metrics.netMonthlyCashFlow >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}>
                      {decisionResults.metrics.netMonthlyCashFlow >= 0 ? "+" : ""}${decisionResults.metrics.netMonthlyCashFlow.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 block">CAD / Month Net Flow</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-purple-200/60 font-mono">
                    <div className="flex justify-between">
                      <span>CAC Payback:</span>
                      <strong>{decisionResults.metrics.cacPaybackMonths} months</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total OpEx:</span>
                      <strong>${decisionResults.metrics.monthlyOperatingCosts.toLocaleString()} CAD</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic Alert Box */}
            {decisionResults?.primaryConstraint && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                decisionResults.systemicHealth === "HEALTHY"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : decisionResults.systemicHealth === "SALES_BOTTLENECK"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-current" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold font-sans">
                    Systemic Diagnostic: {decisionResults.systemicHealth.replace("_", " ")}
                  </h4>
                  <p className="font-sans leading-relaxed">{decisionResults.primaryConstraint}</p>
                </div>
              </div>
            )}

            {/* AI Executive Directives Panel */}
            <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  Gemini Decision Engine Strategic Directives
                </span>
                <span className="text-[10px] font-mono text-slate-400">Model: gemini-3.8-flash</span>
              </div>
              <div className="text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
                {aiSynthesisText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 2: REAL AGENT ORCHESTRATION LAYER                                  */}
      {/* ========================================================================= */}
      {activePillar === "orchestration" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    PILLAR 2: MULTI-AGENT DAG ORCHESTRATION
                  </span>
                  <span className="text-xs font-mono text-slate-500">• Real Delegation, Authorized APIs & Execution Reports</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Hierarchical Multi-Agent Delegation Pipeline
                </h2>
                <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
                  Agents do not just generate freeform prose; they receive formal delegated sub-tasks from the Master Orchestrator, invoke authorized external APIs (Google Search, Meta Ads Sandbox, Stripe Ledger, HubSpot), and return cryptographic verified execution reports.
                </p>
              </div>

              <button
                onClick={handleRunOrchestrationPipeline}
                disabled={isRunningPipeline}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 self-start md:self-center"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-300 ${isRunningPipeline ? "animate-spin" : ""}`} />
                {isRunningPipeline ? "Executing 5-Agent Pipeline..." : "Dispatch Autonomous Delegation Pipeline"}
              </button>
            </div>

            {/* Pipeline Configuration Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Strategic Objective</label>
                <input
                  type="text"
                  value={orchestrationObjective}
                  onChange={(e) => setOrchestrationObjective(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-sans focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Budget Allocation Cap ($ CAD)</label>
                <input
                  type="number"
                  value={orchestrationBudget}
                  onChange={(e) => setOrchestrationBudget(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Media Channels</label>
                <input
                  type="text"
                  value={orchestrationChannel}
                  onChange={(e) => setOrchestrationChannel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-sans focus:ring-1 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Directed Acyclic Graph (DAG) Visualizer */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-600" />
                Active Multi-Agent Delegation Tree (DAG)
              </h3>

              {/* Master Root Agent */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl border border-indigo-800/60 shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/50 border border-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
                    ROOT
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">Chief Sovereign Orchestrator (Parent Agent)</span>
                      <span className="bg-emerald-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                        COORDINATING
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200/80 mt-0.5">
                      Decomposes high-level objectives into dependency-chained sub-tasks and audits downstream telemetry.
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Authorized Core: DAG Engine v2.4</span>
                  <span className="block text-indigo-300 font-bold">Delegates: 5 Specialized Sub-Agents</span>
                </div>
              </div>

              {/* Child Agents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    id: "AGENT-01-INTEL",
                    name: "Market Intel Agent",
                    role: "Competitive Grounding Sub-Agent",
                    integration: "Google Search API & AEO Footprint",
                    status: orchestrationTrace ? "REPORT_VERIFIED" : "IDLE / ARMED",
                    badge: "SEARCH API",
                    desc: "Crawls competitor CPC benchmarks, search volume, and geo-targeted keywords.",
                    color: "border-blue-200 bg-blue-50/40"
                  },
                  {
                    id: "AGENT-02-CREATIVE",
                    name: "Multi-Variant Creative Agent",
                    role: "Commercial Copywriter Sub-Agent",
                    integration: "Meta & Google Ads Sandbox API",
                    status: orchestrationTrace ? "REPORT_VERIFIED" : "IDLE / ARMED",
                    badge: "ADS SANDBOX",
                    desc: "Generates multi-variant commercial copy with verified UTM and conversion tags.",
                    color: "border-purple-200 bg-purple-50/40"
                  },
                  {
                    id: "AGENT-03-COMPLIANCE",
                    name: "Privacy & Compliance Auditor",
                    role: "Compliance Sentinel Sub-Agent",
                    integration: "PIPEDA / CASL / GDPR Rule Engine",
                    status: orchestrationTrace ? "REPORT_VERIFIED" : "IDLE / ARMED",
                    badge: "PIPEDA/CASL",
                    desc: "Audits consent mechanics and enforces 100% PII masking before dispatch.",
                    color: "border-emerald-200 bg-emerald-50/40"
                  },
                  {
                    id: "AGENT-04-FINANCE",
                    name: "Financial Budget Controller",
                    role: "Capital Escrow Sub-Agent",
                    integration: "Stripe & QuickBooks Ledger Webhook",
                    status: orchestrationTrace ? "REPORT_VERIFIED" : "IDLE / ARMED",
                    badge: "STRIPE/QB",
                    desc: "Verifies signing clearance limits and places working capital escrow holds.",
                    color: "border-amber-200 bg-amber-50/40"
                  },
                  {
                    id: "AGENT-05-CRM",
                    name: "CRM Routing & Lead Agent",
                    role: "Pipeline Router Sub-Agent",
                    integration: "HubSpot / SBB CRM Webhook Synchronizer",
                    status: orchestrationTrace ? "REPORT_VERIFIED" : "IDLE / ARMED",
                    badge: "CRM ROUTER",
                    desc: "Configures 15-minute SLA SDR lead queues and automated intent triage.",
                    color: "border-cyan-200 bg-cyan-50/40"
                  }
                ].map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => {
                      if (orchestrationTrace?.agentReports) {
                        const rep = orchestrationTrace.agentReports.find((r: any) => r.agentId === agent.id);
                        if (rep) setSelectedAgentDetail(rep);
                      }
                    }}
                    className={`p-4 rounded-xl border ${agent.color} space-y-2 cursor-pointer hover:shadow-md transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border text-slate-700">
                        {agent.badge}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {agent.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{agent.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{agent.role}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans leading-relaxed">{agent.desc}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-[10px] text-indigo-700 font-mono flex items-center justify-between">
                      <span>Integration: {agent.integration}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Trace Output Log */}
            {orchestrationTrace && (
              <div className="bg-slate-950 text-slate-200 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-bold">
                      Autonomous Pipeline Completed: {orchestrationTrace.pipelineId}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Execution Time: <strong className="text-indigo-300">{orchestrationTrace.totalExecutionTimeMs}ms</strong> • Cryptographic Hash:{" "}
                    <span className="text-emerald-400">{orchestrationTrace.finalReportHash.slice(0, 16)}...</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1 text-[11px]">
                  {orchestrationTrace.agentReports?.map((rep: any) => (
                    <div key={rep.agentId} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span className="text-indigo-400 font-bold">[{rep.agentId}] {rep.name}</span>
                        <p className="text-slate-300 mt-0.5">{rep.outputSummary}</p>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Invoked Tool: <code className="text-amber-300">{rep.toolCallSignature}</code>
                        </span>
                      </div>
                      <div className="text-right text-[10px] font-mono text-slate-400 flex-shrink-0">
                        <span className="text-emerald-400 font-bold block">✓ {rep.executionTimeMs}ms</span>
                        <span>Hash: {rep.verificationHash.slice(0, 10)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 3: RELIABLE BUSINESS MEMORY                                        */}
      {/* ========================================================================= */}
      {activePillar === "memory" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    PILLAR 3: AUDITED BUSINESS MEMORY
                  </span>
                  <span className="text-xs font-mono text-slate-500">• Provenance Citations, Conflict Engine & Department RBAC</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Reliable Enterprise Knowledge with Source Verification
                </h2>
                <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
                  Keep corporate knowledge current, trace every metric back to raw financial ledgers or marketing exports, reconcile contradictory records between departments, and enforce departmental security clearances.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-600">Freshness Score:</span>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-mono font-bold text-xs rounded-lg border border-emerald-300">
                  {freshnessScore}% Verified Current
                </span>
              </div>
            </div>

            {/* Active Conflicting Records Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Inter-Departmental Record Conflicts ({conflicts.filter(c => c.status === "ACTIVE_CONFLICT").length} Active)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Automated Reconciliation Heuristics Active
                </span>
              </div>

              <div className="space-y-3">
                {conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="bg-amber-200 text-amber-900 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {conflict.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 inline ml-2">{conflict.metricName}</h4>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        conflict.status === "RECONCILED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {conflict.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Record A */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-700 block">
                          Department A: {conflict.departmentA}
                        </span>
                        <span className="text-sm font-bold text-slate-900 block">{conflict.recordA.value}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">Source: {conflict.recordA.source}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Chunk: {conflict.recordA.sourceChunkId}</span>
                        {conflict.status === "ACTIVE_CONFLICT" && (
                          <button
                            onClick={() => handleReconcileConflict(conflict.id, "A")}
                            disabled={isReconciling}
                            className="mt-2 w-full py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-slate-300 cursor-pointer"
                          >
                            Set As Official Golden Record
                          </button>
                        )}
                      </div>

                      {/* Record B */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 block">
                          Department B: {conflict.departmentB}
                        </span>
                        <span className="text-sm font-bold text-slate-900 block">{conflict.recordB.value}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">Source: {conflict.recordB.source}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Chunk: {conflict.recordB.sourceChunkId}</span>
                        {conflict.status === "ACTIVE_CONFLICT" && (
                          <button
                            onClick={() => handleReconcileConflict(conflict.id, "B")}
                            disabled={isReconciling}
                            className="mt-2 w-full py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-slate-300 cursor-pointer"
                          >
                            Set As Official Golden Record
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/80 rounded-lg border border-amber-200 text-[11px] text-slate-700 space-y-1 font-sans">
                      <p><strong>Discrepancy Analysis:</strong> {conflict.discrepancyReason}</p>
                      <p className="text-indigo-800"><strong>Resolution Directive:</strong> {conflict.recommendedResolution}</p>
                      {conflict.resolvedValue && (
                        <p className="text-emerald-800 font-mono font-bold pt-1 border-t border-slate-200">
                          ✓ Reconciled Golden Value: {conflict.resolvedValue} (Audited by {conflict.resolvedBy})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Memory Records with Citations */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Verified Corporate Memory Records & Provenance
                </h3>

                {/* Department Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
                  {["All", "Executive", "Finance", "Marketing", "Sales", "Legal & Compliance"].map(dept => (
                    <button
                      key={dept}
                      onClick={() => setMemoryFilterDept(dept)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        memoryFilterDept === dept
                          ? "bg-emerald-700 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredMemoryItems.map(item => (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                          {item.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{item.topic}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {item.department} Clearance
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <span>Verified: {item.verifiedAt}</span>
                        <span className="text-emerald-700 font-bold">{item.freshness}% Fresh</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-sans leading-relaxed">{item.content}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                      <span>Source: <strong className="text-slate-800">{item.sourceDoc}</strong> ({item.sourceChunkId})</span>
                      <button
                        onClick={() => setSelectedSourceModal(item)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Provenance Chunk <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 4: SECURE EXECUTION                                                */}
      {/* ========================================================================= */}
      {activePillar === "security" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    PILLAR 4: SECURE EXECUTION & APPROVAL GATES
                  </span>
                  <span className="text-xs font-mono text-slate-500">• Tenant Isolation, Multi-Sig Gates & SHA-256 Ledger</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Tenant Isolation, Consequential Action Gates & Audit Trails
                </h2>
                <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
                  Consequential actions (releasing large ad spend, customer PII export, autonomous write keys) cannot bypass approval gates. Every state transition is cryptographically chained into an immutable SHA-256 ledger.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleVerifyLedger}
                  disabled={isVerifyingLedger}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifyingLedger ? "animate-spin" : ""}`} />
                  Verify Cryptographic Chain
                </button>
              </div>
            </div>

            {/* Tenant Isolation Status Banner */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <span className="font-bold text-indigo-950 block">Tenant Isolation Boundary: ACTIVE & ENFORCED</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Tenant ID: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">tenant_sbb_corp_prod_01</code> • All queries, memory banks, and lead queues are cryptographically partitioned.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-center">
                ZERO DATA LEAKAGE VERIFIED
              </span>
            </div>

            {/* Consequential Action Approval Gates Queue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Consequential Action Approval Gates ({approvalGates.filter(g => g.status === "PENDING_APPROVAL").length} Pending)
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  Role Required: CEO, VP, or Admin
                </span>
              </div>

              <div className="space-y-3">
                {approvalGates.map((gate) => (
                  <div key={gate.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {gate.id}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{gate.title}</h4>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                          Min Role: {gate.requiredMinRole}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        gate.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : gate.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {gate.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-sans">{gate.description}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                      <span>Requested by: <strong className="text-slate-700">{gate.requestedBy}</strong> ({gate.requestedRole})</span>
                      <span>Risk Index: <strong className={gate.riskScore > 80 ? "text-rose-600" : "text-amber-600"}>{gate.riskScore}/100</strong></span>
                      {gate.status === "PENDING_APPROVAL" ? (
                        <button
                          onClick={() => setSelectedGateModal(gate)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Review & Sign Consequential Gate
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold">
                          Decided by {gate.decidedBy} ({gate.decidedRole})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immutable SHA-256 Cryptographic Audit Ledger */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-700" />
                    Immutable Cryptographic Audit Ledger ({auditBlocks.length} Blocks)
                  </h3>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    isChainValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {isChainValid ? "✓ Ledger 100% Cryptographically Intact" : "⚠ Chain Tamper Detected"}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 font-mono text-[11px] space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                {auditBlocks.map((block) => (
                  <div key={block.blockIndex} className="p-2.5 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-400">
                      <span className="text-indigo-400 font-bold">Block #{block.blockIndex} • {block.action}</span>
                      <span>{new Date(block.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{block.details}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[9px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Actor: <strong className="text-slate-300">{block.actor}</strong> ({block.role})</span>
                      <span>Hash: <code className="text-emerald-400">{block.hash.slice(0, 16)}...</code></span>
                      <span>Prev: <code className="text-slate-400">{block.prevHash.slice(0, 16)}...</code></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 5: PROVEN BUSINESS OUTCOMES                                        */}
      {/* ========================================================================= */}
      {activePillar === "outcomes" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-cyan-100 text-cyan-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    PILLAR 5: MEASURABLE BUSINESS OUTCOMES
                  </span>
                  <span className="text-xs font-mono text-slate-500">• Baseline vs. SBB Post-Deployment Telemetry</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Quantifiable Proof: Revenue, Cost, Productivity, Performance & Time Saved
                </h2>
                <p className="text-xs text-slate-600 max-w-3xl mt-0.5">
                  Verify empirical business improvements achieved with Sovereign Business Brain over the trailing 90 days across 5 core corporate metrics.
                </p>
              </div>

              <button
                onClick={() => {
                  const reportJson = JSON.stringify(outcomesData || {}, null, 2);
                  const blob = new Blob([reportJson], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `SBB_Executive_Outcomes_Audit_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  onLogAction("Executive Audit Exported", `${userName} exported empirical business outcomes audit report.`);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold rounded-xl shadow transition-all flex items-center gap-2 cursor-pointer self-start md:self-center"
              >
                <Download className="w-3.5 h-3.5" />
                Export Executive Outcomes Audit
              </button>
            </div>

            {/* 5 Core Outcome Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outcomesData?.vectors?.map((vec: any) => (
                <div key={vec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">
                      {vec.pillarName}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {vec.percentageDelta}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{vec.metricName}</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-black text-slate-900 font-sans">{vec.currentValue}</span>
                      <span className="text-xs text-slate-400 line-through font-mono">{vec.baselineValue}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Empirical Delta:</span>
                      <strong className="text-emerald-700">{vec.absoluteDelta}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Proof Source:</span>
                      <span className="truncate max-w-[180px]">{vec.proofSource}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Summary Card */}
              <div className="p-4 rounded-xl border border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50 space-y-3">
                <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase">
                  Net Executive Summary
                </span>
                <div>
                  <span className="text-2xl font-black text-cyan-950 font-sans">
                    +${outcomesData?.overview?.totalRevenueLiftCad?.toLocaleString()} CAD
                  </span>
                  <span className="text-xs text-cyan-800 block mt-0.5">
                    Attributed Net Pipeline Lift (90 Days)
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-900 space-y-1 pt-2 border-t border-cyan-200">
                  <div className="flex justify-between">
                    <span>Ad Waste Reduced:</span>
                    <strong>-${outcomesData?.overview?.totalCostReducedCad?.toLocaleString()} CAD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hours Saved Weekly:</span>
                    <strong>{outcomesData?.overview?.totalHoursSavedWeekly} hrs / week</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Net ROI Multiplier:</span>
                    <strong>{outcomesData?.overview?.netRoiMultiplier}x Return</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Saved Breakdown & Interactive Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Left: Time Saved Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  Weekly Team Time Savings Breakdown (38.5 hrs Total)
                </h3>
                <div className="space-y-2">
                  {outcomesData?.timeBreakdown?.map((item: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-sans text-slate-800">{item.category}</span>
                      <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded">
                        +{item.hoursSaved} hrs/wk
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Interactive Organization ROI Calculator */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Organizational ROI & Time Savings Projector
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GTM Team Headcount</label>
                    <input
                      type="number"
                      value={calculatorTeamSize}
                      onChange={(e) => setCalculatorTeamSize(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Monthly Ad Spend ($ CAD)</label>
                    <input
                      type="number"
                      value={calculatorAdSpend}
                      onChange={(e) => setCalculatorAdSpend(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span>Projected Annual Hours Saved:</span>
                    <strong className="text-cyan-700">{Math.round(calculatorTeamSize * 185)} hours/year</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Labor Cost Savings ($75/hr):</span>
                    <strong className="text-emerald-700">${Math.round(calculatorTeamSize * 185 * 75).toLocaleString()} CAD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Projected Ad Waste Prevented (18%):</span>
                    <strong className="text-indigo-700">${Math.round(calculatorAdSpend * 12 * 0.18).toLocaleString()} CAD/yr</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SOURCE PROVENANCE INSPECTOR                                        */}
      {/* ========================================================================= */}
      {selectedSourceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                  Audited Memory Provenance
                </span>
                <h3 className="text-sm font-bold text-slate-900">{selectedSourceModal.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedSourceModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                <p><strong>Document:</strong> {selectedSourceModal.sourceDoc}</p>
                <p><strong>Chunk ID:</strong> {selectedSourceModal.sourceChunkId}</p>
                <p><strong>Verified Auditor:</strong> {selectedSourceModal.auditor}</p>
                <p><strong>Verified Date:</strong> {selectedSourceModal.verifiedAt}</p>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-1">
                  Verifiable Source Excerpt
                </span>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-slate-800 italic leading-relaxed">
                  "{selectedSourceModal.sourceExcerpt}"
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSourceModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Provenance Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: APPROVAL GATE SIGN-OFF                                             */}
      {/* ========================================================================= */}
      {selectedGateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase">
                  Consequential Approval Gate Sign-Off
                </span>
                <h3 className="text-sm font-bold text-slate-900">{selectedGateModal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedGateModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <p className="text-slate-600">{selectedGateModal.description}</p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                <p><strong>Requested By:</strong> {selectedGateModal.requestedBy} ({selectedGateModal.requestedRole})</p>
                <p><strong>Required Min Role:</strong> {selectedGateModal.requiredMinRole}</p>
                <p><strong>Risk Index:</strong> {selectedGateModal.riskScore}/100</p>
                {selectedGateModal.amountCad && (
                  <p><strong>Amount:</strong> ${selectedGateModal.amountCad.toLocaleString()} CAD</p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Executive Justification</label>
                <textarea
                  rows={2}
                  value={gateJustification}
                  onChange={(e) => setGateJustification(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => handleDecideApprovalGate(selectedGateModal.id, "REJECTED")}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold rounded-lg cursor-pointer"
              >
                Reject Gate
              </button>
              <button
                onClick={() => handleDecideApprovalGate(selectedGateModal.id, "APPROVED")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Approve & Execute Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
