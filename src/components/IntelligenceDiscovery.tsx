import React, { useState } from "react";
import { Compass, Sparkles, RefreshCw, Layers, ShieldCheck, Heart, Info, BookOpen, Sliders, ChevronRight, CheckCircle, Terminal } from "lucide-react";

interface CompanyProfile {
  companyName: string;
  websiteUrl: string;
  sector: string;
  description: string;
  headquarters: string;
  countriesServed: string;
  teamSize: string;
  softwareStack: string;
  adBudget: number;
  complianceProfile: string;
  goals: string[];
}

interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface PestleAnalysis {
  political: string;
  economic: string;
  social: string;
  technological: string;
  environmental: string;
  legal: string;
}

interface BusinessReport {
  confidenceScore: number;
  executiveSummary: string;
  swotAnalysis: SwotAnalysis;
  pestleAnalysis: PestleAnalysis;
  icp: string;
  buyerJourney: string;
  growthRoadmap90Day: string[];
  missingInfo: string[];
}

interface IntelligenceDiscoveryProps {
  companyProfile: CompanyProfile;
  businessReport: BusinessReport | null;
  onUpdateProfile: (profile: CompanyProfile, report: BusinessReport) => void;
  onLogAction: (actionType: string, details: string) => void;
}

export const sectorTemplates = [
  {
    name: "Luxury Real Estate",
    sector: "Real Estate",
    description: "Premier high-end residential properties and advisory across major urban centers.",
    goals: ["Generate Leads", "Improve Brand Awareness", "Improve Customer Retention"],
    adBudget: 4500,
    softwareStack: "Salesforce CRM & ActiveCampaign"
  },
  {
    name: "SaaS Enterprise Tech",
    sector: "Software as a Service",
    description: "Enterprise workflows and AI automation tooling helping scale operations.",
    goals: ["Increase Revenue", "Reduce CAC", "Scale Sales"],
    adBudget: 8000,
    softwareStack: "HubSpot CRM & GA4 Analytics"
  },
  {
    name: "Organic Coffee Delivery",
    sector: "E-Commerce",
    description: "Sustainable, carbon-neutral subscriber model delivering fair-trade gourmet beans.",
    goals: ["Increase Revenue", "Improve Customer Retention", "Increase ROAS"],
    adBudget: 2500,
    softwareStack: "Shopify CRM & Meta Ads"
  },
  {
    name: "Cosmetic Medical & Dental",
    sector: "Healthcare Services",
    description: "At-home and on-site mobile cosmetic hygiene and teeth whitening.",
    goals: ["Generate Leads", "Improve Brand Awareness", "Reduce CAC"],
    adBudget: 3000,
    softwareStack: "Zoho CRM & WhatsApp Marketing"
  }
];

export const IntelligenceDiscovery: React.FC<IntelligenceDiscoveryProps> = ({
  companyProfile,
  businessReport,
  onUpdateProfile,
  onLogAction
}) => {
  const [name, setName] = useState(companyProfile.companyName);
  const [website, setWebsite] = useState(companyProfile.websiteUrl);
  const [sector, setSector] = useState(companyProfile.sector);
  const [description, setDescription] = useState(companyProfile.description);
  const [headquarters, setHeadquarters] = useState(companyProfile.headquarters || "Global Headquarters");
  const [countriesServed, setCountriesServed] = useState(companyProfile.countriesServed || "Global / Worldwide");
  const [teamSize, setTeamSize] = useState(companyProfile.teamSize || "5-50");
  const [softwareStack, setSoftwareStack] = useState(companyProfile.softwareStack);
  const [adBudget, setAdBudget] = useState(companyProfile.adBudget);
  const [complianceProfile, setComplianceProfile] = useState(companyProfile.complianceProfile || "Global Standards (GDPR, CCPA, PIPEDA)");
  const [goals, setGoals] = useState<string[]>(companyProfile.goals);

  const [isLoading, setIsLoading] = useState(false);
  const [reportTab, setReportTab] = useState<"summary" | "swot" | "pestle" | "icp" | "roadmap">("summary");

  const goalOptions = [
    "Increase Revenue",
    "Generate Leads",
    "Improve Brand Awareness",
    "Reduce CAC",
    "Increase ROAS",
    "Expand to New Countries",
    "Launch New Products",
    "Recruit Employees",
    "Improve Customer Retention",
    "Improve SEO",
    "Scale Sales"
  ];

  const handleToggleGoal = (g: string) => {
    if (goals.includes(g)) {
      setGoals(goals.filter((item) => item !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const handleApplyTemplate = (tpl: typeof sectorTemplates[0]) => {
    setName(`Sovereign ${tpl.name}`);
    setSector(tpl.sector);
    setDescription(tpl.description);
    setGoals(tpl.goals);
    setAdBudget(tpl.adBudget);
    setSoftwareStack(tpl.softwareStack);
    onLogAction("Applied Sector Template", `Pre-configured onboarding inputs with ${tpl.name} template.`);
  };

  const handleRunDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onLogAction("Triggered AI Business Discovery", `Sovereign Business Brain running SWOT & market synthesis for "${name}".`);

    const updatedProfile: CompanyProfile = {
      companyName: name,
      websiteUrl: website,
      sector,
      description,
      headquarters,
      countriesServed,
      teamSize,
      softwareStack,
      adBudget,
      complianceProfile,
      goals
    };

    try {
      const res = await fetch("/api/gemini/analyze-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateProfile(updatedProfile, data);
        onLogAction("Committed Business Memory", `Committed new Business Profile & Report for "${name}" with a Confidence Score of ${data.confidenceScore}%.`);
        setReportTab("swot");
      } else {
        throw new Error("API Offline");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackReport: BusinessReport = {
        confidenceScore: 88,
        executiveSummary: `Sovereign Business intelligence audit completed for ${name}. Based on global market parameters in ${countriesServed}, our core trajectory focuses on securing high-value international market authority.`,
        swotAnalysis: {
          strengths: ["Strong global privacy compliant data capture framework.", "Flexible operational agility with specialized software integration."],
          weaknesses: ["Limited historical attribution benchmarks in newly entered regions.", "Ad budget constraints compared to multi-billion conglomerates."],
          opportunities: ["Global search campaign expansions & hyper-targeted localized audiences.", "Positioning brand as organic authority under SEO clusters."],
          threats: ["Rising CPC search auction thresholds in major competitive zones.", "Evolving cross-border privacy regulations."]
        },
        pestleAnalysis: {
          political: "International digital trade agreements create friction-free global expansion runways.",
          economic: "Global market trends require extremely careful CAC and LTV mapping.",
          social: "Consumers demanding 100% data transparency and consent controls.",
          technological: "AI-driven marketing frameworks allow teams to scale at enterprise rate.",
          environmental: "ESG & sustainability metrics becoming core buying considerations globally.",
          legal: "Global privacy standards (GDPR, CCPA, PIPEDA) demand compliant data pipelines."
        },
        icp: `### SBB Custom Ideal Customer Persona (ICP)\n- **Profile Roles**: Senior decision makers, operations leads, global enterprise consumers.\n- **Demographics**: Major metropolitan hubs worldwide.\n- **Pain Points**: High regulatory audit risk, CAC bleed, tracking leakage.`,
        buyerJourney: `### 3-Stage Acquisition Journey\n1. **Discovery**: Found via hyper-targeted SEO or privacy-compliant opt-in ads.\n2. **Evaluation**: Automated CRM tele-calling & email workflows build trust.\n3. **Commitment**: Interactive strategic brief delivery leads to close.`,
        growthRoadmap90Day: [
          "**Month 1 (Setup)**: Audit global privacy opt-ins and optimize marketing funnel.",
          "**Month 2 (SEO Content)**: Write 8 high-ranking articles for core global keywords.",
          "**Month 3 (Scoring Sync)**: Interlink CRM filters with custom scoring pipelines."
        ],
        missingInfo: [
          "Prior Cost-Per-Lead (CPL) statistics.",
          "Typical sales cycle durations and typical close rates.",
          "Competitors' localized ad schedules."
        ]
      };
      onUpdateProfile(updatedProfile, fallbackReport);
      onLogAction("Committed Business Memory", `Committed Fallback Business Profile & Report for "${name}" with a Confidence Score of 88%.`);
      setReportTab("swot");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Column 1: Config profile Form */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-5 h-5 text-slate-800" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">SBB Business Discovery</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Onboard any business below. Define company metrics, targets, and software. The Sovereign Business Brain will synthesize complete strategic business intelligence to power all other operations.
          </p>
        </div>

        {/* Templates */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Apply Sector Template:</span>
          <div className="flex flex-wrap gap-1.5">
            {sectorTemplates.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-250 hover:border-indigo-400 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700 transition-all cursor-pointer"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleRunDiscovery} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Website URL</label>
              <input
                type="url"
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Business Sector</label>
              <input
                type="text"
                required
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Headquarters Zone</label>
              <input
                type="text"
                required
                value={headquarters}
                onChange={(e) => setHeadquarters(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 block">Corporate Mission Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-700 font-medium placeholder-slate-400"
              placeholder="e.g. Scaling organic local lead pipelines with high regulatory compliance rules..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Ad Budget ($ USD / Local Currency)</label>
              <input
                type="number"
                required
                value={adBudget}
                onChange={(e) => setAdBudget(parseInt(e.target.value) || 0)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-700 font-medium font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Software Tech Stack</label>
              <input
                type="text"
                required
                value={softwareStack}
                onChange={(e) => setSoftwareStack(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-slate-400 outline-none text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Goals Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-600 block">Primary Business Goals</label>
            <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto border border-slate-200 p-2.5 rounded-lg bg-slate-50/50">
              {goalOptions.map((g) => {
                const isActive = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleToggleGoal(g)}
                    className={`px-2 py-1 rounded text-[10px] font-bold font-sans transition-all cursor-pointer border ${
                      isActive
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Business Intelligence discovery...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Commit & Synthesize Strategy</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Column 2: Intelligence report Output Screen */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[500px]">
        {businessReport ? (
          <div className="flex-1 flex flex-col justify-between gap-5 h-full">
            {/* Header / Score */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-sans">
                    Sovereign Strategic Report: {name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    System Handshake Completed • Confidence Score: {businessReport.confidenceScore}%
                  </p>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold px-3 py-1 rounded text-xs">
                SCORE: {businessReport.confidenceScore}%
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {[
                { id: "summary", label: "Executive Summary" },
                { id: "swot", label: "SWOT Audit" },
                { id: "pestle", label: "PESTLE Analysis" },
                { id: "icp", label: "ICP & Journey" },
                { id: "roadmap", label: "90-Day Roadmap" }
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setReportTab(tb.id as any)}
                  className={`flex-1 py-1 px-2 rounded-md text-[10px] sm:text-xs font-bold font-sans transition-all cursor-pointer ${
                    reportTab === tb.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Content Display */}
            <div className="flex-1 bg-slate-50 border border-slate-150 rounded-xl p-4.5 overflow-y-auto max-h-[340px] shadow-inner text-xs leading-relaxed text-slate-700">
              {/* Summary */}
              {reportTab === "summary" && (
                <div className="space-y-4 font-sans font-medium">
                  <div className="prose prose-sm prose-slate">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Executive Summary
                    </h4>
                    <p className="leading-relaxed font-semibold">{businessReport.executiveSummary}</p>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Identified Missing Operational Metrics:</span>
                    <ul className="list-disc pl-4 space-y-1 font-semibold text-slate-600">
                      {businessReport.missingInfo?.map((info, i) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* SWOT */}
              {reportTab === "swot" && businessReport.swotAnalysis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl space-y-1.5">
                    <strong className="text-emerald-800 font-bold text-xs uppercase flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Strengths
                    </strong>
                    <ul className="list-disc pl-4 text-slate-600 font-semibold space-y-1 text-[11px]">
                      {businessReport.swotAnalysis.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="bg-rose-50/50 border border-rose-100 p-3.5 rounded-xl space-y-1.5">
                    <strong className="text-rose-800 font-bold text-xs uppercase flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" /> Weaknesses
                    </strong>
                    <ul className="list-disc pl-4 text-slate-600 font-semibold space-y-1 text-[11px]">
                      {businessReport.swotAnalysis.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>

                  <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl space-y-1.5">
                    <strong className="text-indigo-800 font-bold text-xs uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Opportunities
                    </strong>
                    <ul className="list-disc pl-4 text-slate-600 font-semibold space-y-1 text-[11px]">
                      {businessReport.swotAnalysis.opportunities?.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </div>

                  <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl space-y-1.5">
                    <strong className="text-slate-800 font-bold text-xs uppercase flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Threats
                    </strong>
                    <ul className="list-disc pl-4 text-slate-600 font-semibold space-y-1 text-[11px]">
                      {businessReport.swotAnalysis.threats?.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* PESTLE */}
              {reportTab === "pestle" && businessReport.pestleAnalysis && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center gap-1">
                    <Layers className="w-4 h-4 text-indigo-500" /> PESTLE Analysis (Global Market Context)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-[11px]">
                    {[
                      { title: "Political Context", text: businessReport.pestleAnalysis.political },
                      { title: "Economic Guidelines", text: businessReport.pestleAnalysis.economic },
                      { title: "Social Demographics", text: businessReport.pestleAnalysis.social },
                      { title: "Technological Automation", text: businessReport.pestleAnalysis.technological },
                      { title: "Environmental/Carbon", text: businessReport.pestleAnalysis.environmental },
                      { title: "Legal (GDPR / CCPA / PIPEDA)", text: businessReport.pestleAnalysis.legal }
                    ].map((pst) => (
                      <div key={pst.title} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                        <strong className="text-slate-700 block mb-0.5">{pst.title}</strong>
                        <p className="text-slate-500 font-semibold leading-relaxed">{pst.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ICP & Journey */}
              {reportTab === "icp" && (
                <div className="space-y-4 font-sans font-medium whitespace-pre-line text-slate-700">
                  <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                    {businessReport.icp}
                  </div>
                  <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm border-t-2 border-t-indigo-500">
                    {businessReport.buyerJourney || "### Buyer Acquisition Pipeline\nCustom 3-step lead lifecycle triggered on CRM capture."}
                  </div>
                </div>
              )}

              {/* Roadmap */}
              {reportTab === "roadmap" && businessReport.growthRoadmap90Day && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1.5 flex items-center gap-1">
                    <Sliders className="w-4 h-4 text-indigo-500" /> 90-Day Tactical Scaling Plan
                  </h4>
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100 pl-7">
                    {businessReport.growthRoadmap90Day.map((step, i) => (
                      <div key={i} className="relative bg-white p-3.5 border border-slate-150 rounded-xl shadow-sm">
                        <span className="absolute -left-7 top-3 w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center text-[9px] font-bold text-indigo-700 font-mono">
                          {i + 1}
                        </span>
                        <p className="text-slate-600 font-semibold" dangerouslySetInnerHTML={{ __html: step }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400 text-xs font-sans">
            <Compass className="w-12 h-12 text-slate-300 stroke-1 mb-3" />
            <h5 className="font-bold text-slate-600">Company Intelligence Awaiting Discovery</h5>
            <p className="text-slate-400 max-w-sm mt-1">
              Onboard your business metrics in the discovery sandbox to compose a strategic digital SWOT and compliance framework.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
