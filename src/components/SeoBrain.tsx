import React, { useState, useEffect } from "react";
import { Search, Sparkles, RefreshCw, Compass, Shield, BookOpen, Layers, Award, Target, HelpCircle, FileText, CheckCircle } from "lucide-react";

interface Keyword {
  keyword: string;
  monthlySearchVolumeCanada: number; // Volume field
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

interface SeoReport {
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
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [customUrl, setCustomUrl] = useState("");
  const [auditedUrl, setAuditedUrl] = useState<string | null>(null);

  const fetchSeoReport = async (forceRegenerate = false, urlToAudit?: string) => {
    setIsLoading(true);
    try {
      if (!forceRegenerate && !urlToAudit) {
        const cached = localStorage.getItem(`sbb_seo_report_${companyProfile.companyName}`);
        if (cached) {
          setReport(JSON.parse(cached));
          setAuditedUrl(null);
          setIsLoading(false);
          return;
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
        onLogAction("Custom URL SEO Audited", `Performed SBB SEO Analysis & Keyword audit for custom link: ${urlToAudit}`);
      } else {
        setAuditedUrl(null);
        localStorage.setItem(`sbb_seo_report_${companyProfile.companyName}`, JSON.stringify(data));
        if (forceRegenerate) {
          onLogAction("SEO Brain Synchronized", `Regenerated global SEO strategy & content clusters for ${companyProfile.companyName}`);
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
      onLogAction("Schema Copied", "Copied recommended JSON-LD LocalBusiness Schema markup to clipboard.");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-800 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-slate-600" />
            <span>SBB SEO Content & Analytics Engine</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Conduct keyword search density audits, discover competitor gaps, and build privacy-compliant global cluster hierarchies.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchSeoReport(true)}
            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-sans text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Strategy</span>
          </button>
        </div>
      </div>

      {/* Audit custom website input */}
      <form onSubmit={handleAuditCustomUrl} className="flex gap-2 max-w-lg">
        <input
          type="url"
          required
          placeholder="e.g. https://my-competitor-site.com/blog"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg outline-none bg-slate-50 focus:bg-white focus:border-slate-400 font-sans text-slate-700"
        />
        <button
          type="submit"
          className="py-1.5 px-3 bg-slate-850 hover:bg-slate-750 text-white font-bold font-sans text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap"
        >
          Audit Competitor URL
        </button>
      </form>

      {auditedUrl && (
        <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-mono text-indigo-700 flex justify-between items-center">
          <span>Viewing SEO Audit for Custom URL: <strong>{auditedUrl}</strong></span>
          <button
            onClick={() => fetchSeoReport(false)}
            className="text-[10px] font-sans font-bold text-slate-500 hover:text-indigo-600 cursor-pointer"
          >
            Clear and view base report
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-400 text-xs font-mono">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Analyzing global search landscapes and indexing keyword vectors...</span>
        </div>
      ) : report ? (
        <div className="space-y-4">
          {/* Subtabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: "overview", label: "On-Page Metadata" },
              { id: "keywords", label: "Keyword Strategies" },
              { id: "clusters", label: "Content Clusters" },
              { id: "competitors", label: "Competitor Analysis" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveSubTab(st.id)}
                className={`flex-1 px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold font-sans transition-all cursor-pointer ${
                  activeSubTab === st.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Tab 1: On-Page metadata */}
          {activeSubTab === "overview" && report.onPageSEO && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans text-xs leading-relaxed">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3 shadow-inner">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  Recommended On-Page MetaTags
                </span>
                <div className="space-y-2">
                  <div className="bg-white p-3 border border-slate-150 rounded-lg">
                    <strong className="text-slate-500 block text-[9px] uppercase font-mono mb-1">Title Tag Recommend (CAD)</strong>
                    <p className="text-slate-800 font-bold">{report.onPageSEO.titleTagRecommendation}</p>
                  </div>
                  <div className="bg-white p-3 border border-slate-150 rounded-lg">
                    <strong className="text-slate-500 block text-[9px] uppercase font-mono mb-1">Meta Description</strong>
                    <p className="text-slate-700 font-semibold leading-normal">{report.onPageSEO.metaDescriptionRecommendation}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <strong className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                    Heading Hierarchy (H1 - H3 Suggestions)
                  </strong>
                  <ul className="space-y-1 list-disc pl-4 text-slate-600 font-medium">
                    {report.onPageSEO.headingHierarchySuggestions?.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-4.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      LocalBusiness JSON-LD Schema
                    </span>
                    <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-900 font-bold uppercase">
                      SEO Markup
                    </span>
                  </div>
                  <pre className="text-[10px] bg-slate-950 border border-slate-800 rounded p-3 text-emerald-400 font-mono overflow-auto max-h-[190px]">
                    {report.onPageSEO.schemaMarkupJSONLD}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Copy Schema Markup</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Keyword strategy */}
          {activeSubTab === "keywords" && report.keywordStrategy && (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs font-sans text-left border-collapse bg-slate-50/20">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Keyword Idea</th>
                    <th className="p-3">Monthly Volume (Global)</th>
                    <th className="p-3">Difficulty %</th>
                    <th className="p-3">Search Intent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(report.keywordStrategy || []).map((kw, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all font-medium">
                      <td className="p-3 font-semibold text-slate-800">{kw.keyword}</td>
                      <td className="p-3 font-mono">{kw.monthlySearchVolumeCanada?.toLocaleString() || "1,200"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${kw.difficultyPercentage}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px]">{kw.difficultyPercentage}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                          {kw.intent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Content clusters */}
          {activeSubTab === "clusters" && report.contentHubClusters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Tab 4: Competitor Gaps */}
          {activeSubTab === "competitors" && report.competitorGapAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.competitorGapAnalysis.map((comp, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 font-sans">{comp.competitorName}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">CAD Market Competitor</span>
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
