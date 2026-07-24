import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  CircleCheck,
  TriangleAlert,
  Volume2,
  VolumeX,
  Power,
  RefreshCw,
  Search,
  ChevronRight,
  Filter,
  Plus,
  Play,
  Clock,
  Briefcase,
  Sparkles,
  Activity
} from "lucide-react";

interface Dialogue {
  speaker: "Agent" | "Lead";
  text: string;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  territory: string;
  product: string;
  leadScore: number;
  leadPriority: string;
  leadOwner: string;
  status: string; // "New" | "Contacted" | "Qualified" | "Closed Won"
  createdAt: string;

  // AI Call Fields
  aiCallStatus?: "Awaiting Call" | "Calling" | "Completed" | "Failed";
  aiCallDuration?: number;
  aiCallAgentName?: string;
  aiCallDialogue?: Dialogue[];
  aiCallObjections?: string[];
  aiCallHandledObjections?: string[];
  aiCallSummary?: string;
  aiCallFruitfulOutput?: string;
  aiCallTimestamp?: string;
}

interface CrmManagerProps {
  leads: Lead[];
  onAddLead: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, status: string) => void;
  onUpdateLead: (lead: Lead) => void;
  onLogAction: (actionType: string, details: string) => void;
  currentRole: string;
  userName: string;
  companyProfile: any;
}

export const CrmManager: React.FC<CrmManagerProps> = ({
  leads,
  onAddLead,
  onUpdateLeadStatus,
  onUpdateLead,
  onLogAction,
  currentRole,
  userName,
  companyProfile
}) => {
  // Add Lead States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("Ad Campaign");
  const [territory, setTerritory] = useState("Ontario (ON)");
  const [product, setProduct] = useState("SEO Boost Pack");
  const [isAddingLead, setIsAddingLead] = useState(false);

  // Filter States
  const [filterStatus, setFilterStatus] = useState("All");

  // Call States
  const [scheduledLead, setScheduledLead] = useState<Lead | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStep, setCallStep] = useState<"dialing" | "connected" | "completed">("dialing");
  const [isMuted, setIsMuted] = useState(false);
  const [isSimulatingApi, setIsSimulatingApi] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [selectedHistoricalLead, setSelectedHistoricalLead] = useState<Lead | null>(null);
  const [waveformHeights, setWaveformHeights] = useState<number[]>([
    15, 20, 10, 30, 25, 45, 12, 18, 35, 20, 8, 14, 28, 40, 15
  ]);

  const countdownTimerRef = useRef<any>(null);
  const dialogueIntervalRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript when dialogue increments
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [dialogueIndex, callStep]);

  // Waveform animation when call is active & connected
  useEffect(() => {
    if (isCallActive && callStep === "connected") {
      const interval = setInterval(() => {
        setWaveformHeights((prev) => prev.map(() => Math.floor(5 + Math.random() * 40)));
      }, 120);
      return () => clearInterval(interval);
    }
  }, [isCallActive, callStep]);

  // Lead auto call countdown handler
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        countdownTimerRef.current = setTimeout(() => {
          setCountdown((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else {
        setCountdown(null);
        if (scheduledLead) {
          handleStartCall(scheduledLead);
        }
      }
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, scheduledLead]);

  // Cancel call countdown queue
  const handleCancelCountdown = () => {
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    setCountdown(null);
    if (scheduledLead) {
      const updated = { ...scheduledLead, aiCallStatus: "Awaiting Call" as const };
      onUpdateLead(updated);
      onLogAction(
        "Presales Call Canceled",
        `User bypassed or canceled autonomous 5-second call queue for ${scheduledLead.name}.`
      );
    }
    setScheduledLead(null);
  };

  // Add Lead Form Ingestion
  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsAddingLead(true);
    try {
      const res = await fetch("/api/lead/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source, territory, product })
      });
      const data = await res.json();
      const newLead: Lead = { ...data, aiCallStatus: "Awaiting Call" };
      
      onAddLead(newLead);

      const delaySeconds = Math.floor(5 + Math.random() * 4);
      setScheduledLead(newLead);
      setCountdown(delaySeconds);

      onLogAction(
        "Lead Ingested & Scheduled",
        `Sovereign ad hook captured lead ${newLead.name}. Pre-Sales Tele-calling scheduled in ${delaySeconds}s.`
      );

      setName("");
      setEmail("");
    } catch (err) {
      console.error("Failed to capture lead:", err);
    } finally {
      setIsAddingLead(false);
    }
  };

  // Tele-calling Simulation Trigger
  const handleStartCall = async (leadToCall: Lead) => {
    if (dialogueIntervalRef.current) clearInterval(dialogueIntervalRef.current);
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    setCountdown(null);

    setScheduledLead(leadToCall);
    setIsCallActive(true);
    setCallStep("dialing");
    setIsSimulatingApi(true);
    setDialogueIndex(0);

    const callInitLead = { ...leadToCall, aiCallStatus: "Calling" as const };
    onUpdateLead(callInitLead);
    onLogAction(
      "Presales Call Initiated",
      `AI calling specialist (Sam) dialed ${callInitLead.name} (${callInitLead.phone || "Canadian lines"}).`
    );

    try {
      const res = await fetch("/api/presales/simulate-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: leadToCall, companyProfile })
      });
      const data = await res.json();
      
      setSimulationData(data);
      setIsSimulatingApi(false);
      setCallStep("connected");

      let currentStep = 0;
      dialogueIntervalRef.current = setInterval(() => {
        currentStep++;
        setDialogueIndex(currentStep);

        if (data.dialogue && currentStep >= data.dialogue.length) {
          clearInterval(dialogueIntervalRef.current);
          setCallStep("completed");

          const completedStatus = data.qualificationStatus === "Qualified" ? "Qualified" : "Contacted";
          const updatedLead: Lead = {
            ...leadToCall,
            status: completedStatus,
            aiCallStatus: "Completed",
            aiCallDuration: data.durationSeconds,
            aiCallAgentName: data.agentName,
            aiCallDialogue: data.dialogue,
            aiCallObjections: data.objectionsRaised,
            aiCallHandledObjections: data.objectionsHandled,
            aiCallSummary: data.summary,
            aiCallFruitfulOutput: data.fruitfulOutput,
            aiCallTimestamp:
              new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) +
              " " +
              new Date().toLocaleDateString("en-US")
          };

          onUpdateLead(updatedLead);
          onUpdateLeadStatus(leadToCall.id, completedStatus);
          onLogAction(
            "Presales Call Completed",
            `Sam completed ${data.durationSeconds}s call with ${leadToCall.name}. Outcome: ${data.qualificationStatus}. Output: "${data.fruitfulOutput}"`
          );
        }
      }, 2400);
    } catch (err) {
      console.error("Tele-calling api error:", err);
      setIsSimulatingApi(false);
      setCallStep("completed");
      const failedLead = { ...leadToCall, aiCallStatus: "Failed" as const };
      onUpdateLead(failedLead);
    }
  };

  // Skip / Fast Forward Dialogue
  const handleSkipCall = () => {
    if (!simulationData) return;
    if (dialogueIntervalRef.current) clearInterval(dialogueIntervalRef.current);
    
    setCallStep("completed");
    setDialogueIndex(simulationData.dialogue?.length || 0);

    const completedStatus = simulationData.qualificationStatus === "Qualified" ? "Qualified" : "Contacted";
    const completedLead: Lead = {
      ...scheduledLead!,
      status: completedStatus,
      aiCallStatus: "Completed",
      aiCallDuration: simulationData.durationSeconds,
      aiCallAgentName: simulationData.agentName,
      aiCallDialogue: simulationData.dialogue,
      aiCallObjections: simulationData.objectionsRaised,
      aiCallHandledObjections: simulationData.objectionsHandled,
      aiCallSummary: simulationData.summary,
      aiCallFruitfulOutput: simulationData.fruitfulOutput,
      aiCallTimestamp:
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) +
        " " +
        new Date().toLocaleDateString("en-US")
    };

    onUpdateLead(completedLead);
    onUpdateLeadStatus(scheduledLead!.id, completedStatus);
    onLogAction(
      "Call Fast Forwarded",
      `AI Presales conversation with ${scheduledLead!.name} completed instantly. Outcome: ${simulationData.qualificationStatus}.`
    );
  };

  // Hang Up Call
  const handleHangUp = () => {
    if (dialogueIntervalRef.current) clearInterval(dialogueIntervalRef.current);
    setIsCallActive(false);
    if (scheduledLead) {
      const updated = { ...scheduledLead, aiCallStatus: "Failed" as const };
      onUpdateLead(updated);
      onLogAction("Presales Call Terminated", `Call with ${scheduledLead.name} was disconnected or hung up by agent override.`);
    }
    setScheduledLead(null);
  };

  // Role visibility filtration
  const rbacLeads = currentRole === "CEO"
    ? leads
    : leads.filter((l) => l.leadOwner.toLowerCase().includes(userName.toLowerCase()) || l.leadOwner.toLowerCase().includes(currentRole.toLowerCase()));

  const filteredLeads = rbacLeads.filter((l) => (filterStatus === "All" ? true : l.status === filterStatus));

  return (
    <div className="space-y-6">
      {/* Active Call Warning Queue */}
      <AnimatePresence>
        {countdown !== null && scheduledLead && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-900 text-white rounded-xl p-4 shadow-md border border-indigo-700 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-indigo-200">Autonomous Queue Active</h4>
                <p className="text-sm font-sans font-medium mt-0.5">
                  Sovereign ad hook captured lead <strong>{scheduledLead.name}</strong>. Calling in{" "}
                  <strong className="text-emerald-400 font-mono text-base">{countdown}s</strong>...
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStartCall(scheduledLead)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold font-sans rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 stroke-none" /> Call Now
              </button>
              <button
                onClick={handleCancelCountdown}
                className="px-3.5 py-1.5 bg-indigo-950/50 hover:bg-indigo-950 text-white font-semibold font-sans rounded-lg text-xs border border-indigo-700 transition-all cursor-pointer"
              >
                Hold Queue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Dialer/Voice Panel */}
      <AnimatePresence>
        {isCallActive && scheduledLead && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xl overflow-hidden"
          >
            {/* Call Header */}
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    SBB Active Outbound Voice Channel
                  </h4>
                  <p className="text-sm font-sans font-semibold mt-0.5">
                    Sam (AI Agent) &harr; <span className="text-indigo-400">{scheduledLead.name}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                  {callStep === "dialing" ? "Dialing..." : callStep === "connected" ? "Connected" : "Completed"}
                </span>
                {simulationData && (
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-800 font-mono">
                    {scheduledLead.phone || "+1 (416) 555-0192"}
                  </span>
                )}
              </div>
            </div>

            {/* Call Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Left Info Column */}
              <div className="p-5 border-r border-slate-800 flex flex-col justify-between gap-5 bg-slate-900/60">
                <div className="space-y-4">
                  {/* Status Block / Visualizers */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[110px]">
                    {callStep === "dialing" ? (
                      <div className="flex flex-col items-center gap-2 animate-pulse">
                        <Phone className="w-7 h-7 text-indigo-400 animate-bounce" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                          Placing Secure Call...
                        </span>
                      </div>
                    ) : callStep === "connected" ? (
                      <div className="w-full flex flex-col items-center gap-3">
                        <div className="flex items-end justify-center gap-1 h-12 w-full">
                          {waveformHeights.map((h, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: isMuted ? 4 : h }}
                              className="w-1.5 bg-indigo-500 rounded-full"
                              style={{ maxHeight: "100%" }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between w-full text-[9px] font-mono text-slate-500">
                          <span>0.0 kHz</span>
                          <span className="text-indigo-400 animate-pulse font-bold tracking-wider">
                            AI AUDIO ACTIVE
                          </span>
                          <span>Bilingual Node</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-emerald-400">
                        <CircleCheck className="w-8 h-8" />
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                          Call Completed Successfully
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metrics block */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/60">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Duration</span>
                      <span className="font-mono text-slate-200 mt-0.5 block font-bold">
                        {callStep === "dialing"
                          ? "00:00"
                          : callStep === "connected"
                          ? "Streaming..."
                          : `${simulationData?.durationSeconds || 45} seconds`}
                      </span>
                    </div>
                    <div className="bg-slate-950/70 p-2.5 rounded border border-slate-800/60">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Language Filter</span>
                      <span className="text-slate-200 mt-0.5 block font-bold">
                        {scheduledLead.territory.includes("QC") ? "FR / EN (Quebec)" : "EN (Sovereign)"}
                      </span>
                    </div>
                  </div>

                  {/* Objections Log */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Objections Board
                    </span>
                    {callStep === "dialing" ? (
                      <span className="text-[10px] text-slate-500 block italic">Awaiting connection...</span>
                    ) : simulationData?.objectionsRaised && simulationData.objectionsRaised.length > 0 ? (
                      <div className="space-y-1.5">
                        {simulationData.objectionsRaised.map((obj: string, i: number) => {
                          const resolved = dialogueIndex >= (simulationData.dialogue?.length || 0) * 0.6;
                          return (
                            <div
                              key={i}
                              className={`p-2 rounded border text-[10px] flex items-center justify-between gap-2 transition-all ${
                                resolved
                                  ? "bg-emerald-950/30 border-emerald-800/80 text-emerald-300"
                                  : "bg-rose-950/20 border-rose-900/60 text-rose-300 animate-pulse"
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <TriangleAlert className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{obj}</span>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold ${
                                  resolved ? "bg-emerald-900 text-emerald-200" : "bg-rose-900 text-rose-200"
                                }`}
                              >
                                {resolved ? "RESOLVED" : "PENDING"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 block italic">No major objections registered.</span>
                    )}
                  </div>
                </div>

                {/* Call Controls */}
                <div className="flex items-center gap-2 border-t border-slate-800/80 pt-4">
                  <button
                    id="crm-mute-btn"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded border text-xs font-semibold flex-1 flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      isMuted
                        ? "bg-amber-950 border-amber-800 text-amber-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? "Unmute" : "Mute"}</span>
                  </button>
                  {callStep === "connected" && (
                    <button
                      id="crm-ff-btn"
                      onClick={handleSkipCall}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Skip to Result</span>
                    </button>
                  )}
                  <button
                    id="crm-hangup-btn"
                    onClick={handleHangUp}
                    className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded transition-all cursor-pointer"
                    title="Terminate Call"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Transcript Feed Column */}
              <div className="lg:col-span-2 p-5 flex flex-col justify-between min-h-[340px] max-h-[460px] bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                    Speech-to-Text Transcript Feed
                  </span>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                    <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />
                    <span>Real-time diarization</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {isSimulatingApi ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                      <span>Contacting SBB CRM tele-calling gateway...</span>
                    </div>
                  ) : simulationData?.dialogue && simulationData.dialogue.length > 0 ? (
                    <>
                      {simulationData.dialogue.slice(0, dialogueIndex).map((dia: Dialogue, idx: number) => {
                        const isAgent = dia.speaker === "Agent";
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 max-w-[85%] ${isAgent ? "ml-0" : "ml-auto flex-row-reverse text-right"}`}
                          >
                            <div
                              className={`p-1.5 h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 ${
                                isAgent
                                  ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                                  : "bg-slate-800 text-slate-200"
                              }`}
                            >
                              {isAgent ? "AI" : "LD"}
                            </div>
                            <div>
                              <div
                                className={`p-3 rounded-lg text-xs leading-relaxed ${
                                  isAgent
                                    ? "bg-indigo-950/40 text-slate-200 border border-indigo-900/60 rounded-tl-none"
                                    : "bg-slate-900 text-slate-200 border border-slate-800/80 rounded-tr-none"
                                }`}
                              >
                                {dia.text}
                              </div>
                              <span className="text-[8px] font-mono text-slate-500 block mt-1 uppercase tracking-wider">
                                {isAgent ? "SAM (VOICEBOT)" : scheduledLead.name}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                      <div ref={scrollRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-600 text-xs font-mono">
                      Awaiting call sync...
                    </div>
                  )}
                </div>

                {/* Footer Call Report Summary Summary (Only shown on completed) */}
                {callStep === "completed" && simulationData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-indigo-950/30 border border-indigo-900 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                        Call Outcome Summary ({simulationData.qualificationStatus})
                      </span>
                      <p className="text-slate-200 leading-normal font-medium">{simulationData.summary}</p>
                    </div>
                    <button
                      onClick={() => setIsCallActive(false)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold font-sans rounded transition-all cursor-pointer whitespace-nowrap align-self-end sm:align-self-auto"
                    >
                      Close Voice Panel
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Add Lead form & CRM Leads List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Capture Lead Ad Ingestion Mock Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-slate-600" />
              <span>Sovereign Lead Ingestor Hook</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulate an incoming marketing lead webhook event. Ad hook auto-triggers a live tele-sales call queue.
            </p>
          </div>

          <form onSubmit={handleAddLeadSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">Lead Full Name</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Tremblay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-2 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-slate-400 font-sans text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">Lead Corporate Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. liam@tremblaytech.ca"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-2 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-slate-400 font-sans text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 block">Traffic Source</label>
                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none text-slate-700 font-sans"
                  >
                    <option value="Ad Campaign">Ad Campaign</option>
                    <option value="LinkedIn Inbound">LinkedIn Inbound</option>
                    <option value="SEO Organic">SEO Organic</option>
                    <option value="WhatsApp Bot">WhatsApp Bot</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 block">Territory Region</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <select
                    value={territory}
                    onChange={(e) => setTerritory(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none text-slate-700 font-sans"
                  >
                    <option value="Ontario (ON)">Ontario (ON)</option>
                    <option value="Quebec (QC)">Quebec (QC)</option>
                    <option value="British Columbia (BC)">British Columbia (BC)</option>
                    <option value="Alberta (AB)">Alberta (AB)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 block">Interested Product Pack</label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none text-slate-700 font-sans"
                >
                  <option value="SEO Boost Pack">SEO Boost Pack</option>
                  <option value="Security Audit Portal">Security Audit Portal</option>
                  <option value="Campaign Autopilot v2">Campaign Autopilot v2</option>
                  <option value="Enterprise Compliance Suite">Enterprise Compliance Suite</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAddingLead}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingLead ? "Capturing..." : "Ingest Local Lead Webhook"}</span>
            </button>
          </form>
        </div>

        {/* Right Column (Col-Span-2): CRM Leads Database Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-600" />
                <span>Enterprise CRM Leads Database</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Qualified lead contracts tracked across active marketing campaigns.
              </p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {["All", "New", "Contacted", "Qualified", "Closed Won"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold font-sans transition-all cursor-pointer ${
                    filterStatus === st ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Leads List Box */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-sans">
                No active CRM leads logged under this status.
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const scoreBg =
                  lead.leadScore >= 80
                    ? "text-rose-600 bg-rose-50 border-rose-100"
                    : lead.leadScore >= 60
                    ? "text-amber-600 bg-amber-50 border-amber-100"
                    : "text-slate-600 bg-slate-50 border-slate-100";
                
                return (
                  <div
                    key={lead.id}
                    id={`lead-row-${lead.id}`}
                    className="p-3 border border-slate-150 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-slate-800 font-semibold">{lead.name}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">({lead.email})</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${scoreBg}`}>
                          Score: {lead.leadScore}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500">
                        <span className="flex items-center gap-0.5 font-mono">
                          <MapPin className="w-3 h-3 text-slate-400" /> {lead.territory}
                        </span>
                        <span className="flex items-center gap-0.5 font-sans">
                          <Briefcase className="w-3 h-3 text-slate-400" /> {lead.product}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>Source: <strong>{lead.source}</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>Owner: <strong className="font-mono text-slate-600">{lead.leadOwner}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select
                        value={lead.status}
                        onChange={(e) => {
                          onUpdateLeadStatus(lead.id, e.target.value);
                          onLogAction("Lead Status Adjusted", `Status of ${lead.name} shifted to ${e.target.value}.`);
                        }}
                        className="text-[11px] bg-white border border-slate-200 rounded p-1 outline-none text-slate-600 font-sans focus:border-slate-400"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Closed Won">Closed Won</option>
                      </select>

                      <button
                        onClick={() => handleStartCall(lead)}
                        className={`px-3 py-1 rounded text-[11px] font-sans font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          lead.aiCallStatus === "Completed"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.aiCallStatus === "Completed" ? "Report" : "Call"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
