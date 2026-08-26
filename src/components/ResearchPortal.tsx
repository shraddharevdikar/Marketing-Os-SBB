import React, { useState } from "react";
import { Globe, Search, Sparkles, RefreshCw, Compass, Cpu, Bot, TrendingUp, ShieldCheck, Zap, Layers, ArrowRight, CheckCircle2, Building2 } from "lucide-react";

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
  const [sector, setSector] = useState(companyProfile?.sector || "Real Estate & B2B Growth");
  const [province, setProvince] = useState(Pb[0]);
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Search Engine Sources Toggle
  const [enableGeminiSearch, setEnableGeminiSearch] = useState(true);
  const [enableChatGptSearch, setEnableChatGptSearch] = useState(true);
  const [enableGoogleTrends, setEnableGoogleTrends] = useState(true);
  const [enableCompetitorRadar, setEnableCompetitorRadar] = useState(true);

  // Active Output View Tab
  const [activeOutputTab, setActiveOutputTab] = useState<"consensus" | "gemini" | "chatgpt" | "trends" | "competitors" | "roadmap">("consensus");

  // Multi-Source API Data
  const [multiSourceData, setMultiSourceData] = useState<any | null>(null);

  const handleRunMultiSourceResearch = async (searchTopic: string, targetProvince: string) => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/gemini/multi-source-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: searchTopic || `Multi-Channel Growth Strategy for ${companyProfile?.companyName || "Our Enterprise"}`,
          province: targetProvince,
          sector,
          companyProfile,
          engineSources: {
            gemini: enableGeminiSearch,
            chatgpt: enableChatGptSearch,
            trends: enableGoogleTrends,
            competitors: enableCompetitorRadar
          }
        })
      });
      const data = await res.json();
      setMultiSourceData(data);
      setActiveOutputTab("consensus");
    } catch (err) {
      console.error("Multi-source research API failure:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunMultiSourceResearch(topic, province);
  };

  return (
    <div id="research-portal-card" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header with Engine Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white shadow-sm">
            <Globe className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Multi-Source AI Marketing & Strategic Research Engine
              </h3>
              <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                Dual Search Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Synthesizes market intelligence by cross-referencing <strong>Gemini 3.6 Web Grounding</strong>, <strong>ChatGPT Deep Research</strong>, <strong>Google Trends Volume</strong>, and <strong>Competitor Ad Scrapers</strong> tailored explicitly to your business profile.
            </p>
          </div>
        </div>

        {/* Engine Status Indicators */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gemini Search</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>ChatGPT Search</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Trends</span>
          </div>
        </div>
      </div>

      {/* Active Business Requirements Context Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Active Business Profile Context:</span>
              <span className="text-indigo-300 font-mono">{companyProfile?.companyName || "Sovereign Enterprise"}</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Sector: <strong>{companyProfile?.sector || sector}</strong> • Ad Budget: <strong>${(companyProfile?.adBudget || 5000).toLocaleString()}/mo</strong> • Goals: <strong>{Array.isArray(companyProfile?.goals) ? companyProfile.goals.join(", ") : "Generate Leads, Increase ROAS"}</strong>
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono bg-indigo-950 border border-indigo-700/60 text-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto-Injected Business Memory</span>
        </div>
      </div>

      {/* Main Grid: Inputs vs Multi-Source Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-5 lg:border-r lg:border-slate-100 lg:pr-6">
          {/* Target Region */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Market Region</label>
            <div className="relative">
              <Compass className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
              >
                {Pb.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Industry Sector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Industry Sector</label>
            <input
              type="text"
              placeholder="e.g. Real Estate, B2B SaaS, Luxury Retail"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
            />
          </div>

          {/* Search Engine Sources Toggle Controls */}
          <div className="space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Active AI Search Sources:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={enableGeminiSearch}
                  onChange={(e) => setEnableGeminiSearch(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700 text-[11px]">Gemini Grounding</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={enableChatGptSearch}
                  onChange={(e) => setEnableChatGptSearch(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700 text-[11px]">ChatGPT Research</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={enableGoogleTrends}
                  onChange={(e) => setEnableGoogleTrends(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700 text-[11px]">Google Trends</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200 hover:border-emerald-300">
                <input
                  type="checkbox"
                  checked={enableCompetitorRadar}
                  onChange={(e) => setEnableCompetitorRadar(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700 text-[11px]">Competitor Radar</span>
              </label>
            </div>
          </div>

          {/* Search Query Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Specific Strategic Question or Goal</label>
            <textarea
              rows={3}
              placeholder="e.g. What are the top high-converting marketing channels and ad hooks for our company in 2026 according to search data?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Crawling Gemini & ChatGPT Search Engines...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Multi-Source Search & Strategy</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Queries */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
              Suggested Market Intelligence Queries:
            </span>
            <div className="space-y-2">
              {h3.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProvince(ex.province);
                    setTopic(ex.topic);
                    handleRunMultiSourceResearch(ex.topic, ex.province);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group"
                >
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-indigo-600 mb-1">
                    <span>{ex.province}</span>
                    <span className="text-slate-400 group-hover:text-indigo-600 flex items-center gap-0.5">
                      Run Dual Search <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <strong className="text-slate-900 text-xs font-bold block leading-snug">{ex.topic}</strong>
                  <span className="text-slate-500 text-[11px] block mt-1 leading-relaxed">{ex.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Screen (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 min-h-[500px] flex flex-col justify-between">
          <div>
            {/* Top Sub-Navigation Tabs */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs mb-5 overflow-x-auto">
              {[
                { id: "consensus", label: "Unified Consensus Strategy", icon: Sparkles },
                { id: "gemini", label: "Gemini Web Search", icon: Bot },
                { id: "chatgpt", label: "ChatGPT Research", icon: Zap },
                { id: "trends", label: "Google Trends", icon: TrendingUp },
                { id: "competitors", label: "Competitor Radar", icon: ShieldCheck },
                { id: "roadmap", label: "Action Roadmap", icon: Layers }
              ].map((tb) => {
                const IconComponent = tb.icon;
                const isActive = activeOutputTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    onClick={() => setActiveOutputTab(tb.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{tb.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Display State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 text-xs">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="font-bold text-slate-700">Connecting to Gemini 3.6 Search Grounding & ChatGPT Deep Search...</span>
                <p className="text-[11px] text-slate-400 max-w-sm text-center">
                  Synthesizing search volume index, competitive ad hooks, and strategic growth recommendations for {companyProfile?.companyName || "your company"}.
                </p>
              </div>
            ) : multiSourceData ? (
              <div className="space-y-5">
                {/* 1. Unified Consensus Tab */}
                {activeOutputTab === "consensus" && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                        <Sparkles className="w-4 h-4" />
                        <span>Unified AI Strategic Consensus</span>
                      </div>
                      <p className="text-sm leading-relaxed font-semibold text-slate-100">
                        {multiSourceData.consensusStrategy}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold">
                          <Bot className="w-4 h-4" />
                          <span>Gemini Search Key Finding</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {multiSourceData.sources?.geminiSearchGrounding?.insights?.[0] || "High search interest in localized compliant digital solutions."}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                          <Zap className="w-4 h-4" />
                          <span>ChatGPT Research Core Angle</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {multiSourceData.sources?.chatGptResearchSynthesis?.positioningAngle || "Position as an indispensable regulatory-compliant platform."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Gemini Web Search Tab */}
                {activeOutputTab === "gemini" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-indigo-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Gemini 3.6 Web Search Grounding Output</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Live Web Search • Status: {multiSourceData.sources?.geminiSearchGrounding?.status}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold px-2.5 py-1 rounded-lg">
                        Live Web Grounded
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Live Web Signals & Market News:</h5>
                      <ul className="space-y-2">
                        {multiSourceData.sources?.geminiSearchGrounding?.insights?.map((ins: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-150">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sector Market Trends:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {multiSourceData.sources?.geminiSearchGrounding?.marketTrends?.map((tr: string, idx: number) => (
                          <div key={idx} className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-indigo-950 font-semibold">
                            {tr}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ChatGPT Strategic Research Tab */}
                {activeOutputTab === "chatgpt" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">ChatGPT Strategic Deep Research Synthesis</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Deep Reasoning • Status: {multiSourceData.sources?.chatGptResearchSynthesis?.status}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold px-2.5 py-1 rounded-lg">
                        Deep Strategy Engine
                      </span>
                    </div>

                    <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Growth Flywheel Architecture:</span>
                      <p className="text-xs font-bold text-slate-100">{multiSourceData.sources?.chatGptResearchSynthesis?.growthFlywheel}</p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Tactical Recommendations:</h5>
                      <div className="space-y-2 text-xs">
                        {multiSourceData.sources?.chatGptResearchSynthesis?.tacticalRecommendations?.map((rec: string, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Google Trends Tab */}
                {activeOutputTab === "trends" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Google Trends Search Volume & Keyword Signals</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Search API • Peak Season: {multiSourceData.sources?.googleTrends?.peakDemandSeason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">Trending Search Keyword</th>
                            <th className="p-2.5">Monthly Volume</th>
                            <th className="p-2.5">YoY Growth</th>
                            <th className="p-2.5 rounded-r-lg">SEO Difficulty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                          {multiSourceData.sources?.googleTrends?.trendingKeywords?.map((kw: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-indigo-900">{kw.keyword}</td>
                              <td className="p-2.5 font-mono">{kw.volume}</td>
                              <td className="p-2.5 font-mono text-emerald-600 font-bold">{kw.velocity}</td>
                              <td className="p-2.5">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                  {kw.difficulty}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. Competitor Radar Tab */}
                {activeOutputTab === "competitors" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-rose-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Competitor Intelligence Radar</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Monitored Competitors in {multiSourceData.sector}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {multiSourceData.sources?.competitorRadar?.monitoredCompetitors?.map((comp: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <strong className="text-xs font-bold text-slate-900 block">{comp.name}</strong>
                          <p className="text-[11px] text-slate-600">Top Ad Hook: <em>"{comp.topAdHook}"</em></p>
                          <div className="text-[10px] font-mono text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg font-bold">
                            Weakness: {comp.weakness}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                      <strong className="text-emerald-950 font-bold block">🎯 Unclaimed High-Yield Market Gap:</strong>
                      <p className="text-emerald-900 font-medium leading-relaxed">{multiSourceData.sources?.competitorRadar?.unclaimedMarketGap}</p>
                    </div>
                  </div>
                )}

                {/* 6. Actionable Roadmap Tab */}
                {activeOutputTab === "roadmap" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Actionable 90-Day Execution Directives for {companyProfile?.companyName || "Your Company"}
                    </h4>
                    <div className="space-y-3">
                      {multiSourceData.actionableRoadmap?.map((rd: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">{rd.phase}</span>
                          <p className="text-xs font-bold text-slate-800 leading-relaxed">{rd.directive}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-xs text-center space-y-2">
                <Compass className="w-10 h-10 text-slate-300 stroke-1" />
                <h5 className="font-bold text-slate-700">Multi-Source Intelligence Ready</h5>
                <p className="max-w-sm text-slate-500">
                  Click <strong>"Execute Multi-Source Search & Strategy"</strong> to query live Gemini Search signals, ChatGPT Deep Research synthesis, Google Trends, and Competitor Radar tailored to {companyProfile?.companyName || "your business"}.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-200 pt-3 flex items-center justify-between">
            <span>Security Framework: PIPEDA & CASL compliant</span>
            <span>Active Region Node: {province}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

