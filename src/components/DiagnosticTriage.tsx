import React, { useState } from "react";
import { Wrench, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";

export const DiagnosticTriage: React.FC = () => {
  const [problem, setProblem] = useState("");
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1 Output
  const [analysis, setAnalysis] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  
  // Step 2 Answers
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Step 3 Solution Output
  const [rootCause, setRootCause] = useState("");
  const [recommendedSolution, setRecommendedSolution] = useState("");
  const [verificationStep, setVerificationStep] = useState("");

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, step: 1 })
      });
      const data = await res.json();
      setAnalysis(data.analysis || "Triage in progress.");
      const qs = data.diagnosticQuestions || [];
      setQuestions(qs);
      
      const initialAnswers: Record<string, string> = {};
      qs.forEach((q: string) => {
        initialAnswers[q] = "";
      });
      setAnswers(initialAnswers);
      setStep(2);
    } catch (err) {
      console.error("Triage step 1 failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (q: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [q]: value }));
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(answers).some((ans) => !(ans as string).trim())) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/troubleshoot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, step: 2, answers })
      });
      const data = await res.json();
      setRootCause(data.rootCause || "Undetermined sync anomaly.");
      setRecommendedSolution(data.recommendedSolution || "Verify credentials and restart connection.");
      setVerificationStep(data.verificationStep || "Conduct a standard test transaction.");
      setStep(3);
    } catch (err) {
      console.error("Triage step 2 failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setProblem("");
    setStep(1);
    setAnalysis("");
    setQuestions([]);
    setAnswers({});
    setRootCause("");
    setRecommendedSolution("");
    setVerificationStep("");
  };

  return (
    <div id="troubleshooter-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
        <div className="p-2 rounded bg-slate-100">
          <Wrench className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="text-base font-sans font-semibold tracking-tight text-slate-800">
            Strategic Campaign & CRM Triage Troubleshooter
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Isolate system anomalies, campaign fatigue, pixel delivery failures, or lead sync bottlenecks in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Steps Progress Indicator */}
        <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-6">
          <div className="flex flex-col gap-3 font-sans">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Triage Diagnostics Process:
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                1
              </span>
              <span className={`text-xs ${step === 1 ? "text-slate-800 font-bold" : "text-slate-500 font-medium"}`}>
                Submit Operational Problem
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200 ml-3" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                2
              </span>
              <span className={`text-xs ${step === 2 ? "text-slate-800 font-bold" : "text-slate-500 font-medium"}`}>
                Answer AI Diagnostic Prompts
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200 ml-3" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                  step >= 3 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                3
              </span>
              <span className={`text-xs ${step === 3 ? "text-slate-800 font-bold" : "text-slate-500 font-medium"}`}>
                Review Strategic Resolution
              </span>
            </div>
          </div>

          {step > 1 && (
            <button
              onClick={handleReset}
              className="mt-6 flex items-center gap-1 text-[11px] font-mono font-bold text-rose-600 hover:text-rose-800 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Triage Hub</span>
            </button>
          )}
        </div>

        {/* Right Side: Step Execution Screens */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[260px] flex flex-col justify-between">
          <div className="w-full">
            {/* STEP 1: Problem Submission */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Step 1: Problem Definition</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 font-sans">
                    What system or campaign anomaly are you experiencing?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="e.g. Meta Ads click-to-lead ratio plummeted by 25% today, and lead integration to HubSpot shows API timeout flags."
                    className="w-full text-xs p-3 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-400 font-sans text-slate-700 placeholder-slate-400 shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !problem.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                      <span>Diagnosing Problem...</span>
                    </>
                  ) : (
                    <>
                      <span>Initiate Autonomous Diagnostic Triage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Answering Prompts */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Step 2: AI Diagnostic Prompts</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-xs leading-relaxed text-slate-600 font-medium mb-3">
                  <strong className="text-slate-800 block mb-1">AI Initial Analysis:</strong>
                  {analysis}
                </div>

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-[11px] sm:text-xs font-semibold text-slate-700 font-sans block leading-normal">
                        {q}
                      </label>
                      <input
                        type="text"
                        required
                        value={answers[q] || ""}
                        onChange={(e) => handleAnswerChange(q, e.target.value)}
                        placeholder="Provide details..."
                        className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-400 font-sans text-slate-700 shadow-inner"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || Object.values(answers).some((ans) => !(ans as string).trim())}
                  className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                      <span>Formulating Resolution...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Triage Resolution</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: SWOT / Recommended Solution */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span>Step 3: Diagnostic Resolution Brief</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase">
                    Isolated
                  </span>
                </div>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-lg text-xs leading-relaxed">
                    <strong className="text-rose-800 font-semibold block uppercase font-mono tracking-wider text-[10px] mb-1.5">
                      Isolated Root Cause Analysis:
                    </strong>
                    <p className="text-rose-900 font-medium font-sans">{rootCause}</p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-lg text-xs leading-relaxed">
                    <strong className="text-indigo-800 font-semibold block uppercase font-mono tracking-wider text-[10px] mb-1.5">
                      Tactical Growth-OS Solution:
                    </strong>
                    <p className="text-indigo-900 font-medium font-sans">{recommendedSolution}</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-lg text-xs leading-relaxed font-sans">
                    <strong className="text-emerald-800 font-semibold block uppercase font-mono tracking-wider text-[10px] mb-1.5">
                      Verification & Proof Method:
                    </strong>
                    <p className="text-emerald-900 font-medium font-sans">{verificationStep}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Start New Diagnostics Triage</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
