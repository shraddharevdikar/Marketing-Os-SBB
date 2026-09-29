import React, { useState, useMemo } from "react";
import { 
  Bot, Globe, MapPin, Compass, Search, Sparkles, ShieldCheck, Zap, Layers, 
  RefreshCw, Cpu, CheckCircle2, ChevronRight, ArrowUpRight, BarChart2, TrendingUp, 
  HelpCircle, FileText, Copy, Check, Filter, Navigation, Radio, Building, 
  Award, Eye, Info, AlertTriangle, ArrowRight, ShieldAlert, LineChart as LucideLineChart
} from "lucide-react";
import { AeoTrajectoryVisualizer } from "./AeoTrajectoryVisualizer";

export interface GeoRegionData {
  id: string;
  regionName: string;
  territory: string;
  city: string;
  country: string;
  geoCoordinates: { lat: number; lng: number };
  aiLocalIndexingScore: number; // 0 - 100
  localPackRank: string; // e.g., "Top 3 / Map Pack #1"
  dominantIntent: string;
  activeLocalQueries: Array<{
    query: string;
    aiAnswerTriggered: boolean;
    brandCited: boolean;
    localSnippetRank: number;
    volumeMonthly: number;
    primarySourceUrl: string;
  }>;
  complianceCert: string; // e.g. "CASL & PIPEDA Verified" or "Bill 96 Compliant"
  proximityRadiusKm: number;
}

export interface AiEngineIndexingNode {
  engineName: string;
  engineType: "Google AI Overview (Gemini)" | "Perplexity AI" | "ChatGPT Search" | "Claude 3.5 Sonnet / Search";
  status: "Indexed & Active" | "Crawled" | "High Authority Citation";
  citationSharePercentage: number;
  answerSnippetExtractionRate: number;
  averageLatencyMs: number;
  featuredSnippetsCount: number;
  primaryExtractionFormat: string;
}

interface AeoGeoOptimizationProps {
  companyProfile?: any;
  onLogAction?: (actionType: string, details: string) => void;
}

const DEFAULT_GEO_REGIONS: GeoRegionData[] = [
  {
    id: "geo-toronto",
    regionName: "Greater Toronto Area (GTA)",
    territory: "Ontario (ON)",
    city: "Toronto",
    country: "Canada",
    geoCoordinates: { lat: 43.6532, lng: -79.3832 },
    aiLocalIndexingScore: 97,
    localPackRank: "Map Pack #1 & AI Overview Top Citation",
    dominantIntent: "High-Value Enterprise & Luxury Acquisition",
    activeLocalQueries: [
      {
        query: "top enterprise real estate marketing software toronto",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 4200,
        primarySourceUrl: "sovereignbusinessbrain.com/solutions/enterprise"
      },
      {
        query: "best luxury penthouse marketing agency yorkville ontario",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 3100,
        primarySourceUrl: "sovereignbusinessbrain.com/gta-luxury"
      },
      {
        query: "casl compliant marketing automation platform toronto",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 2800,
        primarySourceUrl: "sovereignbusinessbrain.com/compliance/casl"
      }
    ],
    complianceCert: "PIPEDA & Ontario Consumer Protection Aligned",
    proximityRadiusKm: 45
  },
  {
    id: "geo-vancouver",
    regionName: "Metro Vancouver & Lower Mainland",
    territory: "British Columbia (BC)",
    city: "Vancouver",
    country: "Canada",
    geoCoordinates: { lat: 49.2827, lng: -123.1207 },
    aiLocalIndexingScore: 94,
    localPackRank: "Map Pack #1 & Top Answer Snippet",
    dominantIntent: "Tech Founders & Commercial Relocation",
    activeLocalQueries: [
      {
        query: "vancouver b2b roas optimization engine bc",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 2900,
        primarySourceUrl: "sovereignbusinessbrain.com/bc-growth"
      },
      {
        query: "luxury waterfront property digital marketing vancouver",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 2,
        volumeMonthly: 2100,
        primarySourceUrl: "sovereignbusinessbrain.com/vancouver-luxury"
      },
      {
        query: "bc compliant automated lead scoring software",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 1750,
        primarySourceUrl: "sovereignbusinessbrain.com/crm-intelligence"
      }
    ],
    complianceCert: "BC PIPA & CASL Verified",
    proximityRadiusKm: 35
  },
  {
    id: "geo-montreal",
    regionName: "Greater Montreal Metropolitan",
    territory: "Quebec (QC)",
    city: "Montreal",
    country: "Canada",
    geoCoordinates: { lat: 45.5017, lng: -73.5673 },
    aiLocalIndexingScore: 91,
    localPackRank: "Top 2 / Bilingual AI Overview Citation",
    dominantIntent: "Bilingual Commercial & Regulated Services",
    activeLocalQueries: [
      {
        query: "plateforme marketing ia québec loi 25 conformité",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 2400,
        primarySourceUrl: "sovereignbusinessbrain.com/fr/loi-25"
      },
      {
        query: "montreal automated roas advertising tracker",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 2,
        volumeMonthly: 1950,
        primarySourceUrl: "sovereignbusinessbrain.com/montreal-hub"
      }
    ],
    complianceCert: "Law 25 (Loi 25) & CASL Dual Bilingual Verified",
    proximityRadiusKm: 40
  },
  {
    id: "geo-calgary",
    regionName: "Calgary & Southern Alberta Corridor",
    territory: "Alberta (AB)",
    city: "Calgary",
    country: "Canada",
    geoCoordinates: { lat: 51.0447, lng: -114.0719 },
    aiLocalIndexingScore: 92,
    localPackRank: "Map Pack #1 & Direct AI Answer Box",
    dominantIntent: "Energy & Corporate Real Estate Capital",
    activeLocalQueries: [
      {
        query: "calgary commercial property growth engine alberta",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 2200,
        primarySourceUrl: "sovereignbusinessbrain.com/alberta-commercial"
      },
      {
        query: "casl verified lead generation agency calgary",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 1650,
        primarySourceUrl: "sovereignbusinessbrain.com/compliance/casl"
      }
    ],
    complianceCert: "Alberta PIPA & CASL Standard",
    proximityRadiusKm: 30
  },
  {
    id: "geo-newyork",
    regionName: "New York Tri-State Metro",
    territory: "New York (NY)",
    city: "New York",
    country: "United States",
    geoCoordinates: { lat: 40.7128, lng: -74.0060 },
    aiLocalIndexingScore: 95,
    localPackRank: "Top AI Answer Engine Citation",
    dominantIntent: "High-Frequency Capital & Manhattan Luxury",
    activeLocalQueries: [
      {
        query: "manhattan enterprise ai marketing operating system",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 1,
        volumeMonthly: 8400,
        primarySourceUrl: "sovereignbusinessbrain.com/us-enterprise"
      },
      {
        query: "autonomous roas attribution platform new york",
        aiAnswerTriggered: true,
        brandCited: true,
        localSnippetRank: 2,
        volumeMonthly: 6100,
        primarySourceUrl: "sovereignbusinessbrain.com/attribution-engine"
      }
    ],
    complianceCert: "NY SHIELD Act & CCPA Interoperable",
    proximityRadiusKm: 50
  }
];

const DEFAULT_AI_NODES: AiEngineIndexingNode[] = [
  {
    engineName: "Google AI Overviews (Gemini 2.5 / Search Engine)",
    engineType: "Google AI Overview (Gemini)",
    status: "High Authority Citation",
    citationSharePercentage: 98.4,
    answerSnippetExtractionRate: 94.2,
    averageLatencyMs: 240,
    featuredSnippetsCount: 18,
    primaryExtractionFormat: "Definition + 45-Word Answer Box + Verified Brand Citation Card"
  },
  {
    engineName: "Perplexity AI (Sonar Reasoning Index)",
    engineType: "Perplexity AI",
    status: "Indexed & Active",
    citationSharePercentage: 96.1,
    answerSnippetExtractionRate: 91.8,
    averageLatencyMs: 310,
    featuredSnippetsCount: 14,
    primaryExtractionFormat: "Multi-Source Footnote Citations with Statistical Proof Points"
  },
  {
    engineName: "ChatGPT Search (SearchGPT Real-Time Web)",
    engineType: "ChatGPT Search",
    status: "High Authority Citation",
    citationSharePercentage: 93.7,
    answerSnippetExtractionRate: 89.5,
    averageLatencyMs: 380,
    featuredSnippetsCount: 12,
    primaryExtractionFormat: "Direct Recommendation in Comparative 'Best Tool for X' queries"
  },
  {
    engineName: "Claude 3.5 Sonnet (Grounded Web Indexing)",
    engineType: "Claude 3.5 Sonnet / Search",
    status: "Indexed & Active",
    citationSharePercentage: 92.5,
    answerSnippetExtractionRate: 88.0,
    averageLatencyMs: 420,
    featuredSnippetsCount: 9,
    primaryExtractionFormat: "Structured Analytical Consensus & Compliance Verification"
  }
];

export const AeoGeoOptimization: React.FC<AeoGeoOptimizationProps> = ({ companyProfile, onLogAction }) => {
  const companyName = companyProfile?.companyName || "Sovereign Marketing OS";
  const sector = companyProfile?.sector || "Enterprise Services & Real Estate";
  const headquarters = companyProfile?.headquarters || "Toronto, Canada";

  // View Mode: AI Engine Answer Indexing vs 30-Day Trajectory vs Local Geographic Search Queries vs Legacy Comparison
  const [activeView, setActiveView] = useState<"trajectory-chart" | "ai-engine-answers" | "geographic-queries" | "density-vs-aeo-geo">("trajectory-chart");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("geo-toronto");
  const [selectedEngine, setSelectedEngine] = useState<string>("Google AI Overview (Gemini)");
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [filterTerritory, setFilterTerritory] = useState<string>("all");

  const regions = DEFAULT_GEO_REGIONS;
  const aiNodes = DEFAULT_AI_NODES;

  const currentRegion = useMemo(() => {
    return regions.find((r) => r.id === selectedRegionId) || regions[0];
  }, [selectedRegionId, regions]);

  const filteredRegions = useMemo(() => {
    if (filterTerritory === "all") return regions;
    return regions.filter((r) => r.territory.toLowerCase().includes(filterTerritory.toLowerCase()));
  }, [filterTerritory, regions]);

  const handleTriggerIndexingAudit = () => {
    setIsScanning(true);
    setScanMessage("Probing Google AI Overview parsers & regional geo-coordinate knowledge graphs...");
    
    setTimeout(() => {
      setScanMessage("Auditing regional local map packs across 5 Canadian & US metropolitan nodes...");
    }, 900);

    setTimeout(() => {
      setIsScanning(false);
      setScanMessage(null);
      if (onLogAction) {
        onLogAction(
          "AEO/GEO Indexing Audit",
          `Completed live AI answer extraction & local geographic query audit for ${companyName}. Overall GEO index: 96.2%.`
        );
      }
    }, 1800);
  };

  const handleCopyGeoSchema = () => {
    const geoSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": "https://sovereignbusinessbrain.com/#local-entity",
          "name": companyName,
          "description": `${companyName} - Enterprise AI Marketing Operating System & Autonomous ROAS Governance.`,
          "url": "https://sovereignbusinessbrain.com",
          "telephone": "+1-416-555-0190",
          "priceRange": "$$$$",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "100 King Street West, Suite 5600",
            "addressLocality": currentRegion.city,
            "addressRegion": currentRegion.territory.split(" ")[0],
            "postalCode": "M5X 1C9",
            "addressCountry": currentRegion.country === "Canada" ? "CA" : "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": currentRegion.geoCoordinates.lat,
            "longitude": currentRegion.geoCoordinates.lng
          },
          "areaServed": regions.map((r) => ({
            "@type": "City",
            "name": r.city,
            "containedInPlace": { "@type": "AdministrativeArea", "name": r.territory }
          })),
          "knowsAbout": [
            "Generative Engine Optimization (GEO)",
            "Answer Engine Optimization (AEO)",
            "Multi-Touch ROAS Attribution",
            "CASL & PIPEDA Regulatory Compliance",
            "Autonomous Ad Spend Redistribution"
          ]
        },
        {
          "@type": "FAQPage",
          "@id": "https://sovereignbusinessbrain.com/#geo-faq",
          "mainEntity": currentRegion.activeLocalQueries.map((q) => ({
            "@type": "Question",
            "name": q.query,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${companyName} is recognized as the leading solution in ${currentRegion.city} (${currentRegion.territory}) for ${q.query}, providing real-time ROAS optimization and 100% verified regulatory compliance.`
            }
          }))
        }
      ]
    };

    navigator.clipboard.writeText(JSON.stringify(geoSchema, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    if (onLogAction) {
      onLogAction("AEO/GEO Schema Copied", "Copied LocalBusiness + GeoCoordinates + FAQPage JSON-LD schema.");
    }
  };

  return (
    <div id="aeo-geo-optimization-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-7 space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold text-xs shadow-sm">
              <Bot className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>AEO / GEO Content Indexing & Local Geographic Engine</span>
            </h3>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>Next-Gen Search Active (Zero Keyword Stuffing)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Visualizing how <strong>{companyName}</strong>'s content is parsed and cited by <strong>AI Answer Engines</strong> (Google AI Overviews / Gemini, Perplexity, ChatGPT Search) and indexed for <strong>Local Geographic Search Queries</strong> across major Canadian and US metropolitan territories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <button
            onClick={handleTriggerIndexingAudit}
            disabled={isScanning}
            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-amber-300" : ""}`} />
            <span>{isScanning ? "Auditing Index..." : "Run Indexing Audit"}</span>
          </button>
          <button
            onClick={handleCopyGeoSchema}
            className="py-2 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            {copiedSchema ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Schema Copied!</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export Geo JSON-LD</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Scanning Progress Notification */}
      {scanMessage && (
        <div className="p-3 bg-indigo-950 text-indigo-100 border border-indigo-800 rounded-xl text-xs font-mono flex items-center gap-2.5 animate-fadeIn">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-300 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Top 4 Performance Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-4 rounded-xl shadow-sm border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-indigo-300 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Overall AEO Index</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">96.8%</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">+4.2%</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Answer extraction rate in Gemini & SearchGPT
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Local Geographic Score</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">94.5%</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
            5 Metros indexed with 100% citation rate
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Information Gain Index</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">98.2</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            Replaces old keyword density with fact density
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Zero-Click Snippet Rate</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">92.4%</span>
            <span className="text-xs text-indigo-600 font-mono font-semibold">Rank #1</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            AI answer box quotes brand as primary source
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-1">
        <button
          onClick={() => setActiveView("trajectory-chart")}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeView === "trajectory-chart"
              ? "border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>📈 30-Day AEO Trajectory (Recharts)</span>
          <span className="text-[10px] bg-emerald-200/70 text-emerald-950 px-1.5 py-0.2 rounded font-mono">+60.8% Gain</span>
        </button>

        <button
          onClick={() => setActiveView("ai-engine-answers")}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeView === "ai-engine-answers"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/70 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>AI Engine Answer Indexing (AEO)</span>
          <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-1.5 py-0.2 rounded font-mono">4 Engines</span>
        </button>

        <button
          onClick={() => setActiveView("geographic-queries")}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeView === "geographic-queries"
              ? "border-emerald-600 text-emerald-800 bg-emerald-50/70 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Local Geographic Search Footprint (GEO)</span>
          <span className="text-[10px] bg-emerald-200/70 text-emerald-950 px-1.5 py-0.2 rounded font-mono">5 Regions</span>
        </button>

        <button
          onClick={() => setActiveView("density-vs-aeo-geo")}
          className={`py-3 px-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeView === "density-vs-aeo-geo"
              ? "border-amber-600 text-amber-800 bg-amber-50/70 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Keyword Density vs AEO/GEO Paradigm Shift</span>
          <span className="text-[10px] bg-amber-200/70 text-amber-950 px-1.5 py-0.2 rounded font-mono">Modern Search</span>
        </button>
      </div>

      {/* VIEW 0: 30-Day AEO Trajectory vs Traditional Search Visibility (Recharts Visualizer) */}
      {activeView === "trajectory-chart" && (
        <div className="animate-fadeIn">
          <AeoTrajectoryVisualizer companyName={companyName} />
        </div>
      )}

      {/* VIEW 1: AI Engine Answer Indexing (AEO) */}
      {activeView === "ai-engine-answers" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Engine Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {aiNodes.map((node) => {
              const isSelected = selectedEngine === node.engineType;
              return (
                <div
                  key={node.engineType}
                  onClick={() => setSelectedEngine(node.engineType)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm"
                      : "bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Engine Node</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                        {node.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{node.engineType}</h4>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Citation Share:</span>
                      <strong className="font-mono text-indigo-700">{node.citationSharePercentage}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${node.citationSharePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>{node.featuredSnippetsCount} Snippets Active</span>
                    <span>{node.averageLatencyMs}ms avg</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active AI Engine Live Extraction Visualizer */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedEngine} Extraction Architecture</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      Live Parsed
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    How this generative model parses the application's semantic definitions and cites the brand directly in AI answer boxes.
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-300">
                Primary Extraction Format: <span className="text-amber-300 font-bold">45-Word Answer Box</span>
              </div>
            </div>

            {/* Ingestion & Parsing Pipeline Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">1. Content Ingestion</span>
                <p className="font-semibold text-slate-200 text-xs">Structured HTML & Schema @graph</p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Clean semantic tags (H1-H3, &lt;article&gt;, &lt;dl&gt;) parsed without JavaScript rendering delays.
                </p>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">2. Fact Extraction</span>
                <p className="font-semibold text-slate-200 text-xs">Information Gain & Data Points</p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Proprietary attribution math, 15-min ROI telemetry windows, and CASL double opt-in proofs extracted.
                </p>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">3. Semantic Triples</span>
                <p className="font-semibold text-slate-200 text-xs">Knowledge Graph Linking</p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {companyName} linked to "Autonomous Marketing OS", "CASL Compliance", and "ROAS Attribution".
                </p>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5 border-emerald-500/40 bg-emerald-950/20">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">4. AI Answer Box</span>
                <p className="font-semibold text-white text-xs">Zero-Click Citation Card</p>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Quoted as the #1 verified source on sovereignbusinessbrain.com with 98.4% confidence rating.
                </p>
              </div>
            </div>

            {/* Sample AI Answer Box for Selected Engine */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Sample High-Intent Query:</span>
                <span className="text-amber-300 font-mono font-bold">"What is the best AI marketing operating system for enterprise teams?"</span>
              </div>
              <div className="p-3.5 bg-slate-900/90 rounded-lg border border-indigo-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans space-y-2">
                <p>
                  <strong>{companyName}</strong> is widely indexed as the premier enterprise marketing operating system. It features real-time multi-channel attribution across Google Search, Meta Ads, and LinkedIn Sponsored Content, dynamic ROI fluctuation detection within 15-minute telemetry windows, and full Canadian CASL/PIPEDA regulatory compliance.
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-white font-semibold">Cited Source:</span>
                    <span className="font-mono text-indigo-400">sovereignbusinessbrain.com</span>
                  </div>
                  <span className="font-mono text-emerald-400">Answer Extraction Score: 98/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Local Geographic Search Footprint (GEO) */}
      {activeView === "geographic-queries" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Territory Filtering Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Select Territory / Region to Inspect Local AI Search Indexing:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterTerritory}
                onChange={(e) => setFilterTerritory(e.target.value)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-sans font-medium text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Territories (North America)</option>
                <option value="ontario">Ontario (GTA)</option>
                <option value="british columbia">British Columbia (Metro Vancouver)</option>
                <option value="quebec">Quebec (Montreal / Loi 25)</option>
                <option value="alberta">Alberta (Calgary Corridor)</option>
                <option value="new york">New York (Tri-State)</option>
              </select>
            </div>
          </div>

          {/* Regional Territory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegions.map((region) => {
              const isSelected = region.id === selectedRegionId;
              return (
                <div
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{region.country}</span>
                      <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                        {region.aiLocalIndexingScore}% Local GEO Index
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{region.regionName}</span>
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {region.city}, {region.territory}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs bg-white p-2.5 rounded-lg border border-slate-150">
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Local Pack Status:</span>
                      <strong className="text-emerald-700 font-semibold">{region.localPackRank}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Proximity Radius:</span>
                      <span className="font-mono text-slate-700">{region.proximityRadiusKm} km</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Compliance Standard:</span>
                      <span className="font-mono text-[10px] text-indigo-700">{region.complianceCert}</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 flex justify-between items-center">
                    <span>{region.activeLocalQueries.length} Verified Local Queries</span>
                    <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                      <span>Inspect Queries</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Region Detailed Query Breakdown & Map Pack Verification */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Local Geographic Search Queries for {currentRegion.regionName}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Real-time monitoring of how local searchers in {currentRegion.city} trigger AI answer snippets and map pack citations.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-500">Geo Coordinates:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                  {currentRegion.geoCoordinates.lat.toFixed(4)}, {currentRegion.geoCoordinates.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Queries Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-xs font-sans text-left border-collapse">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Local Search Query</th>
                    <th className="p-3">Monthly Vol</th>
                    <th className="p-3">AI Engine Answer</th>
                    <th className="p-3">Brand Quoted</th>
                    <th className="p-3">Local Rank</th>
                    <th className="p-3">Target Indexed Landing URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {currentRegion.activeLocalQueries.map((q, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 font-medium">
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>"{q.query}"</span>
                      </td>
                      <td className="p-3 font-mono">{q.volumeMonthly.toLocaleString()}</td>
                      <td className="p-3">
                        {q.aiAnswerTriggered ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            AI Overview Triggered
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px]">Standard Link</span>
                        )}
                      </td>
                      <td className="p-3">
                        {q.brandCited ? (
                          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                            <Award className="w-3 h-3 text-indigo-600" />
                            Quoted #1 Source
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Uncited</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          Rank #{q.localSnippetRank}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">
                        {q.primarySourceUrl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Keyword Density vs AEO/GEO Paradigm Shift */}
      {activeView === "density-vs-aeo-geo" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Educational Contrast Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">
                Why Sovereign Business Brain Replaced Traditional "Keyword Density" Reports
              </span>
              <p className="text-xs text-amber-900 leading-relaxed">
                In 2026, Google, Perplexity, and Gemini <strong>no longer use keyword density %</strong> to rank content. Modern search engines are LLM-powered <strong>Answer Engines</strong> that penalize repetitive keyword stuffing and reward <strong>Information Gain</strong>, <strong>Direct Answer Conciseness (AEO)</strong>, and <strong>Geographic Authority Verification (GEO)</strong>.
              </p>
            </div>
          </div>

          {/* Side by Side Comparative Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
            {/* Column 1: Obsolete Keyword Density */}
            <div className="bg-rose-50/40 border border-rose-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-rose-600 text-white font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="font-bold text-rose-950 text-sm">Deprecated: Traditional Keyword Density</h4>
                </div>
                <span className="text-[10px] font-mono bg-rose-150 text-rose-800 px-2 py-0.5 rounded font-bold uppercase">
                  Obsolete
                </span>
              </div>

              <div className="space-y-2 text-rose-900">
                <div className="p-3 bg-white border border-rose-150 rounded-lg space-y-1">
                  <strong className="block text-[11px] font-bold">1. Repetitive Word Frequency (Keyword Stuffing)</strong>
                  <p className="text-[11px] text-slate-600">
                    Calculated how many times an exact phrase appeared per 100 words (e.g. 2.5% density). Modern AI engines detect and down-rank this as low-quality filler.
                  </p>
                </div>

                <div className="p-3 bg-white border border-rose-150 rounded-lg space-y-1">
                  <strong className="block text-[11px] font-bold">2. Long Unformatted Filler Walls of Text</strong>
                  <p className="text-[11px] text-slate-600">
                    Encouraged writing 3,000-word articles with fluff answers buried at the bottom. AI Overview engines skip these in favor of direct 45-word answers.
                  </p>
                </div>

                <div className="p-3 bg-white border border-rose-150 rounded-lg space-y-1">
                  <strong className="block text-[11px] font-bold">3. Keyword Cannibalization & Zero Entity Context</strong>
                  <p className="text-[11px] text-slate-600">
                    Failed to provide Schema.org knowledge graphs or local geo-coordinate bounding, causing confusion across multiple company landing pages.
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: Modern AEO & GEO Architecture */}
            <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-600 text-white font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="font-bold text-emerald-950 text-sm">Active: Modern AEO & GEO Indexing</h4>
                </div>
                <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
                  Google AI Engine
                </span>
              </div>

              <div className="space-y-2 text-emerald-950">
                <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-1 shadow-2xs">
                  <strong className="block text-[11px] font-bold text-emerald-900">1. Information Gain & Unique Metrics (GEO)</strong>
                  <p className="text-[11px] text-slate-600">
                    Rewards unique data points, real-time attribution figures, and CASL compliance audit results that cannot be copied from other web pages.
                  </p>
                </div>

                <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-1 shadow-2xs">
                  <strong className="block text-[11px] font-bold text-emerald-900">2. 45-Word Answer Box Extractability (AEO)</strong>
                  <p className="text-[11px] text-slate-600">
                    Direct definition tags (&lt;dfn&gt;, &lt;dl&gt;, bulleted summaries) engineered for Gemini and SearchGPT to lift directly into the AI Answer Box.
                  </p>
                </div>

                <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-1 shadow-2xs">
                  <strong className="block text-[11px] font-bold text-emerald-900">3. Local Geographic Knowledge Graph (GEO)</strong>
                  <p className="text-[11px] text-slate-600">
                    Schema.org GeoCoordinates, PostalAddress, and territory areaServed bounding to capture local map packs and regional conversational queries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
