import React, { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Bot, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AiStrategistProps {
  campaigns?: any[];
  onCreateCampaign?: (req: any) => void;
  onLogAction?: (action: string, details: string) => void;
  currentRole?: string;
  userName?: string;
  businessState?: any;
  onAuditComplete?: (report: string) => void;
}

export const AiStrategist: React.FC<AiStrategistProps> = ({
  campaigns = [],
  onCreateCampaign,
  onLogAction,
  currentRole = "CEO",
  userName = "User",
}) => {
  const [formData, setFormData] = useState({
    business: "",
    industry: "",
    goals: "",
    targetAudience: "",
    budget: "5000",
    products: "",
    competitors: "",
    usp: "",
    location: "Toronto, Ontario",
    salesProcess: ""
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyReport, setStrategyReport] = useState<any>(null);

  const questions = [
    { key: "business", description: "What is your company or brand name?", placeholder: "e.g. John and Jan Real Estate Company" },
    { key: "industry", description: "What vertical or industry sector do you operate in?", placeholder: "e.g. Luxury Commercial & Residential Real Estate" },
    { key: "goals", description: "What are your core growth targets for Q3/Q4?", placeholder: "e.g. Generate 50+ high-intent lead submissions in GTA region" },
    { key: "targetAudience", description: "Describe your ideal customer persona.", placeholder: "e.g. High net worth investors & luxury home buyers in Ontario" },
    { key: "budget", description: "Monthly advertising budget allocation (CAD)?", placeholder: "5000" }
  ];

  const handleNext = () => {
    if (stepIndex < questions.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setStrategyReport({
        title: `${formData.business || "Enterprise"} Growth Strategy`,
        roasTarget: "4.2x",
        summary: `SBB Multi-Agent strategy synthesized for ${formData.business || "John and Jan Real Estate Company"}. Focus on high-intent search ads, GEO-fenced Meta retargeting, and CASL-compliant lead nurture.`,
        tactics: [
          "Google High-Intent Search Keyword Bidding",
          "Meta Carousel Penthouse Showcase",
          "CASL Automated Lead Nurture Sequence"
        ]
      });
      if (onLogAction) {
        onLogAction("Generated Strategy Report", `Synthesized growth strategy for ${formData.business || "Business"}.`);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-emerald-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            SBB AI Marketing Strategist v2.4
          </span>
          <span className="text-slate-400 text-xs">• Real-Time Copilot</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">
          Sovereign AI Strategy Synthesizer
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
          Conduct an interactive diagnostic questionnaire to generate a full-funnel, CASL & PIPEDA compliant B2B/DTC marketing roadmap.
        </p>
      </div>

      {!strategyReport ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-mono font-bold text-slate-500">
              STEP {stepIndex + 1} OF {questions.length} • <span className="text-emerald-600 uppercase">{questions[stepIndex].key}</span>
            </span>
            <span className="text-xs font-mono text-slate-400">{Math.round(((stepIndex + 1) / questions.length) * 100)}% Complete</span>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900 font-sans">{questions[stepIndex].description}</label>
            <input
              type="text"
              value={(formData as any)[questions[stepIndex].key]}
              onChange={(e) => setFormData({ ...formData, [questions[stepIndex].key]: e.target.value })}
              placeholder={questions[stepIndex].placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleBack}
              disabled={stepIndex === 0}
              className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            {stepIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2 shadow-md hover:bg-emerald-700"
              >
                {isGenerating ? "Synthesizing Strategy..." : "Generate Sovereign Strategy"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {strategyReport.title}
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded">
              ROAS TARGET: {strategyReport.roasTarget}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{strategyReport.summary}</p>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-800">Tactical Deployments:</h4>
            {strategyReport.tactics.map((tac: string, idx: number) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                <span className="font-medium text-slate-800">{tac}</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">READY FOR EXECUTION</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStrategyReport(null)}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Create Another Strategy
          </button>
        </div>
      )}
    </div>
  );
};

export default AiStrategist;
