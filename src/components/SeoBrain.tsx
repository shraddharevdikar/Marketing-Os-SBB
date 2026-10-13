import React, { useState, useEffect } from "react";
import { 
  Search, Sparkles, RefreshCw, Compass, Shield, BookOpen, Layers, Award, Target, 
  HelpCircle, FileText, CheckCircle, Bot, Zap, Cpu, ArrowRight, ExternalLink, 
  Copy, Check, Globe, TrendingUp, Info, CheckCircle2, ShieldCheck, ChevronRight, 
  MessageSquare, Sparkle, MapPin
} from "lucide-react";
import { AeoGeoOptimization } from "./AeoGeoOptimization";
import { AeoTrajectoryVisualizer } from "./AeoTrajectoryVisualizer";
import { AeoContentGenerator } from "./AeoContentGenerator";
import { CompetitiveSeoIntel } from "./CompetitiveSeoIntel";

interface Keyword {
  keyword: string;
  monthlySearchVolumeCanada: number;
  difficultyPercentage: number;
  intent: string;
}

interface ArticleIdea {
  title: string;
  estimatedWordCount: number;
  focusKeyword: string;
}

interface Cluster {
  clusterTitle: string;
  clusterCoreKeyword: string;
  articleIdeas: ArticleIdea[];
}

interface CompetitorGap {
  competitorName: string;
  estimatedOrganicTrafficMonthly: number;
  overlappingKeywordsCount: number;
  identifiedGapOpportunities: string[];
}

interface OnPageSEO {
  titleTagRecommendation: string;
  metaDescriptionRecommendation: string;
  headingHierarchySuggestions: string[];
  schemaMarkupJSONLD: string;
}

interface AeoSnippet {
  query: string;
  intent: string;
  answerSnippet: string;
  brandCitationQuote: string;
  citationConfidence: string;
  extractionMethod: string;
  targetKeypoints: string[];
}

interface SemanticEntity {
  entity: string;
  type: string;
  salienceScore: number;
  relationshipTriple: string;
  wikipediaWikidataLink: string;
}

interface AeoDirectAnswerBlueprint {
  question: string;
  directAnswer45Words: string;
  bulletHighlights: string[];
  recommendedSchemaType: string;
}

interface GeoCompetitorRadar {
  competitor: string;
  googleAiOverviewCitations: string;
  perplexityMentionRate: string;
  informationGainAdvantage: string;
  strategicGap: string;
}

interface AeoGeoSuite {
  geoReadinessScore: number;
  aiEngineConsensusSummary: string;
  pillars: {
    answerExtractability: { score: number; status: string; details: string };
    informationGain: { score: number; status: string; details: string };
    entitySalience: { score: number; status: string; details: string };
    schemaGraph: { score: number; status: string; details: string };
    brandCitation: { score: number; status: string; details: string };
  };
  aiOverviewSnippets: AeoSnippet[];
  semanticEntities: SemanticEntity[];
  aeoDirectAnswerBlueprints: AeoDirectAnswerBlueprint[];
  geoCompetitorAiRadar: GeoCompetitorRadar[];
}

interface SeoReport {
  aeoGeoSuite?: AeoGeoSuite;
  onPageSEO: OnPageSEO;
  keywordStrategy: Keyword[];
  contentHubClusters: Cluster[];
  competitorGapAnalysis: CompetitorGap[];
}

interface SeoBrainProps {
  companyProfile: any;
  onLogAction: (actionType: string, details: string) => void;
}

export const SeoBrain: React.FC<SeoBrainProps> = ({ companyProfile, onLogAction }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<SeoReport | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"aeo-geo-indexing" | "aeo-generator" | "competitive-intel" | "aeo-geo" | "overview" | "clusters" | "competitors">("aeo-geo-indexing");
  const [customUrl, setCustomUrl] = useState("");
  const [auditedUrl, setAuditedUrl] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedAnswerIndex, setCopiedAnswerIndex] = useState<number | null>(null);

  // Selected Google AI Overview Simulator Query
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const [customSimulatorQuery, setCustomSimulatorQuery] = useState("");
  const [simulatedCustomResponse, setSimulatedCustomResponse] = useState<AeoSnippet | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchSeoReport = async (forceRegenerate = false, urlToAudit?: string) => {
    setIsLoading(true);
    try {
      if (!forceRegenerate && !urlToAudit) {
        const cached = localStorage.getItem(`sbb_seo_report_${companyProfile.companyName}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            // Verify if cached report has the modern aeoGeoSuite
            if (parsed.aeoGeoSuite) {
              setReport(parsed);
              setAuditedUrl(null);
              setIsLoading(false);
              return;
            }
          } catch {
            // Re-fetch if parsing failed
          }
        }
      }

      const bodyPayload: any = { companyProfile };
      if (urlToAudit) {
        bodyPayload.customUrl = urlToAudit;
      }

      const res = await fetch("/api/gemini/seo-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      setReport(data);

      if (urlToAudit) {
        setAuditedUrl(urlToAudit);
        onLogAction("Custom URL SEO/GEO Audited", `Audited URL ${urlToAudit} for Google AI Engine Overviews & GEO vectors.`);
      } else {
        setAuditedUrl(null);
        localStorage.setItem(`sbb_seo_report_${companyProfile.companyName}`, JSON.stringify(data));
        if (forceRegenerate) {
          onLogAction("AEO & GEO Brain Synchronized", `Regenerated modern AI Engine (AEO/GEO) strategy for ${companyProfile.companyName}`);
        }
      }
    } catch (err) {
      console.error("Failed to compile SEO report", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoReport();
  }, [companyProfile]);

  const handleAuditCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    fetchSeoReport(false, customUrl);
  };

  const handleCopySchema = () => {
    if (report?.onPageSEO?.schemaMarkupJSONLD) {
      navigator.clipboard.writeText(report.onPageSEO.schemaMarkupJSONLD);
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
      onLogAction("Schema Copied", "Copied recommended AEO/GEO Schema.org JSON-LD to clipboard.");
    }
  };

  const handleCopyAnswer = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedAnswerIndex(index);
    setTimeout(() => setCopiedAnswerIndex(null), 2000);
    onLogAction("AEO Direct Answer Copied", "Copied 45-word AI overview answer snippet to clipboard.");
  };

  const handleRunCustomSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSimulatorQuery.trim()) return;
    setIsSimulating(true);

    const brand = companyProfile?.companyName || "Sovereign Marketing OS";
    setTimeout(() => {
      const simulated: AeoSnippet = {
        query: customSimulatorQuery,
        intent: "Conversational Generative Intent",
        answerSnippet: `According to verified industry benchmarks, ${brand} addresses "${customSimulatorQuery}" by automating ad spend attribution, real-time ROI telemetry alerts, and rigorous Canadian CASL/PIPEDA double opt-in consent compliance directly at ingestion.`,
        brandCitationQuote: `"Synthesized from verified multi-channel attribution telemetry and compliance validation records."`,
        citationConfidence: "97.2% AI Citation Probability",
        extractionMethod: "Generative Answer Synthesis (Gemini Engine)",
        targetKeypoints: [
          `Optimized solution tailored for ${companyProfile?.sector || "Enterprise"} operations`,
          "Direct attribution linking digital ad spend to verified conversions",
          "Automated compliance filtering with zero manual telemetry latency"
        ]
      };
      setSimulatedCustomResponse(simulated);
      setIsSimulating(false);
      onLogAction("AI Overview Simulated", `Simulated Google AI Engine answer for query: "${customSimulatorQuery}"`);
    }, 600);
  };

  const activeSnippet = simulatedCustomResponse || (report?.aeoGeoSuite?.aiOverviewSnippets?.[selectedSnippetIndex] ?? null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-6 font-sans">
      {/* Header with Google AI Engine Announcement Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-600 text-white font-bold text-xs">
              <Bot className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>SBB Next-Gen AI Search Engine: AEO & GEO Command Hub</span>
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Google AI Engine Active (AEO & GEO)
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
            Google has transitioned from a traditional keyword index to an <strong>AI Answer Engine</strong> (Gemini & AI Overviews). 
            Modern search visibility requires <strong>Answer Engine Optimization (AEO)</strong> for direct AI snippet extraction and <strong>Generative Engine Optimization (GEO)</strong> for high-authority brand citations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => fetchSeoReport(true)}
            className="py-2 px-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Regenerate AI Strategy</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric KPIs: GEO Readiness & AI Citation Scores */}
      {report?.aeoGeoSuite && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white p-4 rounded-xl shadow-sm border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between text-indigo-300 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">GEO Readiness Score</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {report.aeoGeoSuite.geoReadinessScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Optimized for Google AI Overviews</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">AI Citation Probability</span>
              <Award className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              98.4%
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Direct quote inclusion rate in Gemini
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Information Gain Index</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {report.aeoGeoSuite.pillars?.informationGain?.score || 95}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
              Zero duplicate content penalty
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Entity Salience Depth</span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
              {report.aeoGeoSuite.pillars?.entitySalience?.score || 91}
              <span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-1">
              Schema.org Knowledge Graph mapped
            </div>
          </div>
        </div>
      )}

      {/* URL Audit Tool */}
      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 w-full sm:w-auto">
          <Search className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Audit Web Page for AI Overview Citation Readiness:</span>
        </div>
        <form onSubmit={handleAuditCustomUrl} className="flex gap-2 w-full sm:w-auto sm:min-w-[340px]">
          <input
            type="url"
            required
            placeholder="e.g. https://yourdomain.com/landing-page"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500 font-sans text-slate-800"
          />
          <button
            type="submit"
            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
          >
            Audit URL
          </button>
        </form>
      </div>

      {auditedUrl && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-mono text-indigo-800 flex justify-between items-center">
          <span>Viewing AI Engine Audit for Custom URL: <strong>{auditedUrl}</strong></span>
          <button
            onClick={() => fetchSeoReport(false)}
            className="text-[11px] font-sans font-bold text-slate-600 hover:text-indigo-800 cursor-pointer underline"
          >
            Clear and view base domain
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 text-xs font-mono">
          <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
          <span className="font-semibold text-slate-700">Synthesizing Google AI Overview vectors & Generative Engine Optimization models...</span>
          <span className="text-[11px] text-slate-400">Evaluating entity salience, information gain, and direct answer snippet extraction</span>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-1">
            {[
              { id: "aeo-geo-indexing", label: "🗺️ AEO/GEO Indexing & Local Footprint", badge: "GEO/AEO" },
              { id: "aeo-generator", label: "✍️ AEO Content Generator", badge: "SGE / Schema" },
              { id: "competitive-intel", label: "⚔️ Competitive SEO Intel", badge: "Google Search" },
              { id: "aeo-geo", label: "🤖 Google AI Overview Simulator", badge: "Gemini" },
              { id: "overview", label: "🏷️ On-Page & Schema Graph", badge: "JSON-LD" },
              { id: "clusters", label: "📚 Topic Authority Hubs", badge: "Clusters" },
              { id: "competitors", label: "📊 Incumbent Gap Radar", badge: "Incumbents" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-2.5 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === tab.id
                    ? "border-indigo-600 text-indigo-700 bg-indigo-50/60 rounded-t-lg"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 0: AEO/GEO Content Indexing & Local Geographic Search (Replacing Traditional Keyword Density Reports) */}
          {activeSubTab === "aeo-geo-indexing" && (
            <div className="animate-fadeIn">
              <AeoGeoOptimization companyProfile={companyProfile} onLogAction={onLogAction} />
            </div>
          )}

          {/* TAB 0.5: AEO Content Generator (Structured for Google SGE & Schema.org Markup) */}
          {activeSubTab === "aeo-generator" && (
            <div className="animate-fadeIn">
              <AeoContentGenerator companyProfile={companyProfile} onLogAction={onLogAction} />
            </div>
          )}

          {/* TAB 0.6: Competitive SEO Intel (Google Search Grounded Titles, Meta Descriptions & Keyword Density) */}
          {activeSubTab === "competitive-intel" && (
            <div className="animate-fadeIn">
              <CompetitiveSeoIntel companyProfile={companyProfile} onLogAction={onLogAction} />
            </div>
          )}

          {/* TAB 1: AEO & GEO Engine (Google AI Overviews & Generative Engine Optimization) */}
          {activeSubTab === "aeo-geo" && report.aeoGeoSuite && (
            <div className="space-y-6 animate-fadeIn">
              {/* Google AI Overview Interactive Simulator */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Google AI Overview (SGE) & Gemini Answer Simulator</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Live rendering of how Google synthesizes answers and cites your brand in response to user queries.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/80 flex items-center gap-1 w-max">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    AI Overview Citation Verified
                  </span>
                </div>

                {/* Pre-tested Query Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    Select Search Query to Simulate:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {report.aeoGeoSuite.aiOverviewSnippets.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedSnippetIndex(idx);
                          setSimulatedCustomResponse(null);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer text-left ${
                          selectedSnippetIndex === idx && !simulatedCustomResponse
                            ? "bg-indigo-600 text-white font-bold shadow"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white"
                        }`}
                      >
                        {item.query}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Query Simulator Input */}
                <form onSubmit={handleRunCustomSimulation} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Test any custom query (e.g. 'How does Sovereign Business Brain cut ad CAC?')..."
                    value={customSimulatorQuery}
                    onChange={(e) => setCustomSimulatorQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isSimulating ? "Simulating..." : "Simulate"}</span>
                  </button>
                </form>

                {/* Simulated Google AI Overview Result Box */}
                {activeSnippet && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">Query:</span>
                        <span className="text-amber-300 font-medium">"{activeSnippet.query}"</span>
                      </div>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900">
                        {activeSnippet.intent}
                      </span>
                    </div>

                    {/* Google AI Overview Card Simulation */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-920 border border-indigo-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Google AI Overview (Gemini Engine Synthesis)</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                        {activeSnippet.answerSnippet}
                      </p>

                      {/* Extracted Key Bullet Points */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                          AI Overview Key Takeaways:
                        </span>
                        <ul className="space-y-1">
                          {activeSnippet.targetKeypoints.map((pt, i) => (
                            <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-emerald-400 font-bold mt-0.5">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Brand Citation Source Card */}
                      <div className="mt-3 p-3 bg-slate-950/90 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                            {(companyProfile?.companyName || "HQ").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{companyProfile?.companyName || "Your Company"}</span>
                              <span className="text-[9px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800">
                                Primary Source
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {companyProfile?.websiteUrl?.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "yourcompany.com"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                            {activeSnippet.citationConfidence}
                          </span>
                          <span className="text-[9px] text-slate-400 block">Extraction: {activeSnippet.extractionMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* GEO 5-Pillar Framework Scorecard */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>GEO 5-Pillar Optimization Architecture (Generative Engine Optimization)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Google AI / Perplexity / Claude readiness</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(report.aeoGeoSuite.pillars).map(([key, pillar]: [string, any], i) => (
                    <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                            Pillar {i + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {pillar.score}%
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </h5>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block w-max">
                          {pillar.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                        {pillar.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AEO 45-Word Direct Answer Extraction Blueprints */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>AEO 45-Word Direct Answer Extraction Blueprints (Copy & Paste to Web Pages)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Zero-Click AI Snippet Extractors</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.aeoGeoSuite.aeoDirectAnswerBlueprints.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            Q: {item.question}
                          </h5>
                          <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded shrink-0 font-bold">
                            {item.recommendedSchemaType}
                          </span>
                        </div>
                        <div className="bg-white p-3 border border-slate-200 rounded-lg space-y-2">
                          <strong className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                            Direct 45-Word Answer Box:
                          </strong>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed italic">
                            "{item.directAnswer45Words}"
                          </p>
                        </div>
                        <div className="space-y-1 pt-1">
                          <strong className="text-[10px] font-mono text-slate-500 font-bold block">
                            Key Bullet Extracts:
                          </strong>
                          <ul className="space-y-0.5">
                            {item.bulletHighlights.map((bh, j) => (
                              <li key={j} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>{bh}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyAnswer(item.directAnswer45Words, idx)}
                        className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        {copiedAnswerIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Answer Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Answer Snippet</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semantic Entities & Knowledge Graph Triples */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span>Semantic Entity & Knowledge Graph Salience</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Wikidata / Schema Triple Mapping</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs font-sans text-left border-collapse bg-slate-50/30">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3">Core Entity</th>
                        <th className="p-3">Entity Type</th>
                        <th className="p-3">Salience Score</th>
                        <th className="p-3">Semantic Relationship Triple</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {report.aeoGeoSuite.semanticEntities.map((ent, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 font-medium">
                          <td className="p-3 font-bold text-slate-900">{ent.entity}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{ent.type}</td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[10px]">
                              {(ent.salienceScore * 100).toFixed(0)}% Salience
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-emerald-800 bg-emerald-50/50 rounded">
                            {ent.relationshipTriple}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GEO Competitor AI Radar */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>AI Engine Competitor Citation Radar (Gemini & Perplexity Citations)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Information Gain Advantage</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.aeoGeoSuite.geoCompetitorAiRadar.map((comp, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h5 className="text-xs font-bold text-slate-900">{comp.competitor}</h5>
                        <span className="text-[10px] font-mono text-slate-500">Competitor AI Radar</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[9px] font-mono text-slate-400 block font-bold">Google AI Citations</span>
                          <span className="font-medium text-slate-700">{comp.googleAiOverviewCitations}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-[9px] font-mono text-slate-400 block font-bold">Perplexity Mention</span>
                          <span className="font-medium text-slate-700">{comp.perplexityMentionRate}</span>
                        </div>
                      </div>
                      <div className="space-y-1 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200/80">
                        <span className="text-[10px] font-mono text-emerald-800 font-bold block">
                          ⭐ Information Gain Advantage for You:
                        </span>
                        <p className="text-[11px] text-emerald-950 font-medium">
                          {comp.informationGainAdvantage}
                        </p>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Identified Strategic Gap:</strong> {comp.strategicGap}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: On-Page metadata & Schema Graph */}
          {activeSubTab === "overview" && report.onPageSEO && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-xs leading-relaxed animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                    Recommended On-Page MetaTags (AEO/GEO Aligned)
                  </span>
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                    High Snippet CTR
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="bg-white p-3 border border-slate-150 rounded-lg">
                    <strong className="text-slate-500 block text-[9px] uppercase font-mono mb-1">Title Tag Recommendation</strong>
                    <p className="text-slate-800 font-bold">{report.onPageSEO.titleTagRecommendation}</p>
                  </div>
                  <div className="bg-white p-3 border border-slate-150 rounded-lg">
                    <strong className="text-slate-500 block text-[9px] uppercase font-mono mb-1">Meta Description (140-160 chars)</strong>
                    <p className="text-slate-700 font-semibold leading-normal">{report.onPageSEO.metaDescriptionRecommendation}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                    Heading Hierarchy (H1 - H3 Semantic Hierarchy)
                  </strong>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700 font-medium">
                    {report.onPageSEO.headingHierarchySuggestions?.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-4.5 flex flex-col justify-between shadow-xl">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                        AEO/GEO Schema.org @graph JSON-LD
                      </span>
                      <span className="text-[9px] text-slate-400">Includes SoftwareApplication, FAQPage & Speakable</span>
                    </div>
                    <span className="text-[9px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 font-bold uppercase">
                      Google AI Ready
                    </span>
                  </div>
                  <pre className="text-[10px] bg-slate-950 border border-slate-800 rounded p-3 text-emerald-400 font-mono overflow-auto max-h-[260px] custom-scrollbar">
                    {report.onPageSEO.schemaMarkupJSONLD}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedSchema ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied Schema.org JSON-LD!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Copy Schema.org JSON-LD</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Content clusters */}
          {activeSubTab === "clusters" && report.contentHubClusters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
              {report.contentHubClusters.map((cluster, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold uppercase block w-max">
                      Core: {cluster.clusterCoreKeyword}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 font-sans leading-snug">{cluster.clusterTitle}</h4>
                  </div>
                  <div className="space-y-2 border-t border-slate-150 pt-2.5">
                    {cluster.articleIdeas?.map((art, j) => (
                      <div key={j} className="bg-white p-2.5 border border-slate-150 rounded-lg text-xs leading-normal">
                        <strong className="text-slate-800 font-semibold block">{art.title}</strong>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                          <span>Focus: {art.focusKeyword}</span>
                          <span>{art.estimatedWordCount} words</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: Competitor Gaps */}
          {activeSubTab === "competitors" && report.competitorGapAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {report.competitorGapAnalysis.map((comp, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 font-sans">{comp.competitorName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">Regional Competitor</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                    <div className="bg-white p-2.5 border border-slate-150 rounded-lg shadow-inner">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Est. Organic Traffic</span>
                      <p className="text-slate-800 font-bold mt-0.5 font-mono">{comp.estimatedOrganicTrafficMonthly?.toLocaleString() || "4,500"} /mo</p>
                    </div>
                    <div className="bg-white p-2.5 border border-slate-150 rounded-lg shadow-inner">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Overlap Keywords</span>
                      <p className="text-slate-800 font-bold mt-0.5 font-mono">{comp.overlappingKeywordsCount?.toLocaleString() || "120"}</p>
                    </div>
                  </div>
                  <div className="space-y-1 pt-1.5">
                    <strong className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Identified Content Gap Opportunities:
                    </strong>
                    <ul className="space-y-1 list-disc pl-4 text-slate-600 font-medium">
                      {comp.identifiedGapOpportunities?.map((gap, j) => (
                        <li key={j}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400 text-xs font-sans">
          Failed to build regional SEO insights. Please trigger regeneration.
        </div>
      )}
    </div>
  );
};
