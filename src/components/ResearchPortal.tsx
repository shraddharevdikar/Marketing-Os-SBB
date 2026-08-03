import React, { useState } from "react";
import { Globe, Search, Sparkles, RefreshCw, Compass } from "lucide-react";

interface ResearchPortalProps {
  currentProvince: string;
  companyProfile: any;
}

export const Pb = [
  "North America (US & CA)",
  "Europe (UK & EU)",
  "Asia Pacific (APAC)",
  "Latin America (LATAM)",
  "Middle East & Africa (MEA)",
  "Worldwide / Global"
];

export const h3 = [
  {
    topic: "Global Enterprise AI & Tech Market",
    province: "North America (US & CA)",
    desc: "High-growth B2B SaaS, fintech & AI automation demand analysis."
  },
  {
    topic: "European Sustainable & Tech Innovation",
    province: "Europe (UK & EU)",
    desc: "Cross-border e-commerce, green energy, and GDPR-compliant tech trends."
  },
  {
    topic: "APAC E-Commerce & Mobile Growth",
    province: "Asia Pacific (APAC)",
    desc: "Rapid digital expansion, super-app integration & mobile consumer analytics."
  }
];

export const ResearchPortal: React.FC<ResearchPortalProps> = ({
  currentProvince,
  companyProfile
}) => {
  const [sector, setSector] = useState(companyProfile?.sector || "");
  const [province, setProvince] = useState(Pb[0]);
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleRunResearch = async (searchTopic: string, targetProvince: string) => {
    if (!searchTopic.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/gemini/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: searchTopic, province: targetProvince, sector })
      });
      const data = await res.json();
      setResponse(data.report);
    } catch (err) {
      console.error("Research API failure:", err);
      setResponse("Sync timeout. Please check your internet connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunResearch(topic, province);
  };

  return (
    <div id="research-portal-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
        <div className="p-2 rounded bg-slate-100">
          <Globe className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="text-base font-sans font-semibold tracking-tight text-slate-800">
            Canadian Market Specialization Research LLM
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Conduct in-depth market research, SWOT analysis, and customer persona profiling specialized for Canadian provincial compliance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:border-r lg:border-slate-100 lg:pr-6">
          {/* Province select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">Target Province / Territory</label>
            <div className="relative">
              <Compass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none text-slate-700 font-sans"
              >
                {Pb.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sector input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">Strategic Business Sector</label>
            <input
              type="text"
              placeholder="e.g. Cybersecurity SaaS / Organic Delivery"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-sans text-slate-700"
            />
          </div>

          {/* Custom Search Topic */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 font-sans">Deep Market Inquiry</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Evaluate market entry challenges and digital marketing channels for compliance automation in Ontario."
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
              <span>{isLoading ? "Analyzing Market..." : "Initiate Provincial Audit"}</span>
            </button>
          </form>

          {/* Research Predefined Examples */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Suggested Provincial Pipelines:
            </span>
            <div className="space-y-1.5">
              {h3.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProvince(ex.province);
                    setTopic(ex.topic);
                    handleRunResearch(ex.topic, ex.province);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-100/50 text-[11px] transition-all"
                >
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-indigo-600 mb-0.5">
                    <span>{ex.province}</span>
                    <span className="text-slate-400 uppercase">Predefined</span>
                  </div>
                  <strong className="text-slate-800 font-sans block leading-snug">{ex.topic}</strong>
                  <span className="text-slate-500 font-sans block text-[10px] mt-0.5 leading-normal">{ex.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Report Screen */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[340px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Sovereign Regional SWOT Report Output</span>
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Harvesting global market signals and privacy policies...</span>
              </div>
            ) : response ? (
              <div className="text-xs text-slate-700 leading-relaxed font-sans font-medium bg-white p-4 rounded-lg border border-slate-150 shadow-inner whitespace-pre-line max-h-[380px] overflow-y-auto">
                {response}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-slate-400 text-xs font-sans text-center">
                Select a suggestions card or fill in your market inquiry to trigger sovereign-backed SWOT, competitor profiling, and regional compliance audits.
              </div>
            )}
          </div>
          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Security Framework: GDPR, CCPA & PIPEDA compliant</span>
            <span>Focus Node: {province}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
