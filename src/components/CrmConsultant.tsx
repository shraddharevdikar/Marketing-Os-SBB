import React, { useState } from "react";
import { Database, Search, Sparkles, RefreshCw } from "lucide-react";

interface CrmConsultantProps {
  userName: string;
}

export const CrmConsultant: React.FC<CrmConsultantProps> = ({ userName }) => {
  const [crm, setCrm] = useState("HubSpot");
  const [level, setLevel] = useState("Beginner");
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/gemini/crm-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crm, level, topic })
      });
      const data = await res.json();
      setResponse(data.result);
    } catch (err) {
      console.error("CRM consultant API failure:", err);
      setResponse("Sync timeout. Please check your internet connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="crm-consultant-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
        <div className="p-2 rounded bg-slate-100">
          <Database className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="text-base font-sans font-semibold tracking-tight text-slate-800">
            CRM Intelligence LLM Copilot
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Learn automation setups, design secure integrations, and troubleshoot system workflows with our CRM expert.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target CRM System</label>
            <div className="grid grid-cols-2 gap-2">
              {["HubSpot", "Salesforce", "ActiveCampaign", "Pipedrive"].map((sys) => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => setCrm(sys)}
                  className={`py-1.5 px-3 border rounded-lg text-xs font-sans font-medium transition-all text-center cursor-pointer ${
                    crm === sys
                      ? "bg-slate-900 border-slate-900 text-white font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">Strategic Complexity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {["Beginner", "Intermediate", "Advanced"].map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLevel(lv)}
                  className={`py-1.5 px-2 border rounded-lg text-[10px] sm:text-xs font-sans font-medium transition-all text-center cursor-pointer ${
                    level === lv
                      ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 font-sans">Inquiry Topic</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. How do I build a CASL compliance opt-in form with automated double opt-in validation?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-sans text-slate-700 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isLoading ? "Consulting CRM..." : "Query CRM Expert"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[220px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>SBB CRM Intelligence response</span>
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Generating custom workflow blueprints...</span>
              </div>
            ) : response ? (
              <div className="text-xs text-slate-700 leading-relaxed font-sans font-medium bg-white p-3.5 rounded-lg border border-slate-150 shadow-inner whitespace-pre-line max-h-[260px] overflow-y-auto">
                {response}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-sans text-center">
                Configure your CRM target above and write a topic inquiry to view strategic setups and step-by-step blueprints.
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Operator: {userName}</span>
            <span>Active Integration: {crm} Node</span>
          </div>
        </div>
      </div>
    </div>
  );
};
