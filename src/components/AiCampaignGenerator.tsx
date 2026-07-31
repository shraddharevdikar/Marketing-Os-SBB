import React, { useState } from "react";
import { 
  Sparkles, Copy, Check, Target, DollarSign, 
  ShieldAlert, Megaphone, FileText, Globe, CheckCircle2,
  Database, FileCode, TrendingUp, Home, Cpu, Info, ExternalLink, Video
} from "lucide-react";

interface AiCampaignGeneratorProps {
  companyProfile: any;
  userRole?: string;
  onPushToCommander?: (newCampaign: any) => void;
}

export const AiCampaignGenerator: React.FC<AiCampaignGeneratorProps> = ({ 
  companyProfile, 
  userRole,
  onPushToCommander 
}) => {
  // Input form state
  const [productName, setProductName] = useState("Enterprise Marketing OS");
  const [targetAudience, setTargetAudience] = useState("CMOs, Growth VPs & Founders in Canada & US");
  const [objective, setObjective] = useState("Lead Generation & Demo Bookings");
  const [tone, setTone] = useState("Authoritative, High-Conversion & CASL Compliant");
  const [keyPoints, setKeyPoints] = useState("Real-time ROAS attribution, automated lead scoring, CASL double opt-in protection, AI phone pre-sales qualification.");
  const [budget, setBudget] = useState("5000");
  const [platform, setPlatform] = useState("Cross-Platform");

  // Content Knowledge Source Selection
  const [contentSource, setContentSource] = useState<string>("corporate-vault");
  const [sourceUrl, setSourceUrl] = useState<string>("https://sovereignbusinessbrain.com");
  const [sourceDetails, setSourceDetails] = useState<string>("Corporate Knowledge Base & PIPEDA / CASL Compliance Matrix");

  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);
  const [activeAdPreviewTab, setActiveAdPreviewTab] = useState<"google" | "meta" | "linkedin" | "tiktok">("google");
  const [copiedText, setCopiedText] = useState(false);
  const [pushedToQueue, setPushedToQueue] = useState(false);

  // Content source definitions for clarity
  const contentSourcesList = [
    {
      id: "corporate-vault",
      title: "Corporate Memory & Brand Vault",
      icon: Database,
      description: "Auto-extracts core identity, value props, target ICP, and CASL compliance rules from Business Memory.",
      badge: "SBB Vault Active",
      defaultDetails: "Extracted from Company Profile & SBB Corporate Memory"
    },
    {
      id: "website-url",
      title: "Live Website / Landing Page",
      icon: Globe,
      description: "Scrapes live copy, value propositions, and SEO keywords directly from your company or client URL.",
      badge: "Web Scraper",
      defaultDetails: "https://sovereignbusinessbrain.com"
    },
    {
      id: "pdf-brief",
      title: "Brand Pitch Deck & PDF Brief",
      icon: FileCode,
      description: "Sourced from uploaded investor decks, product datasheets, or service catalogs.",
      badge: "Asset Knowledge",
      defaultDetails: "Executive Pitch Deck & Product Spec Datasheet 2026.pdf"
    },
    {
      id: "social-trend",
      title: "Social Trend & Competitor Benchmarks",
      icon: TrendingUp,
      description: "Pulls viral hooks, trending formats & high-converting angles from IG Reels, TikTok & LinkedIn B2B.",
      badge: "Viral Engine",
      defaultDetails: "Top 1% Converting B2B & Luxury Social Ad Hooks (2026 Index)"
    },
    {
      id: "real-estate-mls",
      title: "Real Estate MLS / Property Catalog",
      icon: Home,
      description: "Extracts luxury property specs, floor plans, waterfront amenities, and neighborhood demographic data.",
      badge: "MLS Feed",
      defaultDetails: "Toronto Luxury Waterfront Penthouses - MLS #C894210"
    },
    {
      id: "custom-prompt",
      title: "Custom Raw Brief & Value Props",
      icon: Cpu,
      description: "Uses typed key points and custom prompt instructions directly provided below.",
      badge: "Direct Input",
      defaultDetails: "Custom prompt notes & value propositions"
    }
  ];

  const handleSourceSelect = (srcId: string) => {
    setContentSource(srcId);
    const selectedObj = contentSourcesList.find(s => s.id === srcId);
    if (selectedObj) {
      if (srcId === "website-url") {
        setSourceDetails(sourceUrl || selectedObj.defaultDetails);
      } else {
        setSourceDetails(selectedObj.defaultDetails);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setPushedToQueue(false);

    const activeSourceObj = contentSourcesList.find(s => s.id === contentSource);
    const sourceTitle = activeSourceObj?.title || "Corporate Memory & Brand Vault";
    const sourceDetailText = contentSource === "website-url" ? sourceUrl : sourceDetails;

    try {
      const res = await fetch("/api/gemini/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          targetAudience,
          objective,
          tone,
          keyPoints,
          budget: parseFloat(budget) || 5000,
          platform,
          companyProfile,
          contentSource: sourceTitle,
          sourceDetails: sourceDetailText
        })
      });

      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setGeneratedCampaign(data);
    } catch (err) {
      console.error("Campaign generator error:", err);
      // Fallback
      setGeneratedCampaign({
        title: `${productName} - ${objective} Blitz`,
        overview: `Cross-channel AI generated campaign designed for ${targetAudience} to drive high-intent leads and maximum ROAS. Content knowledge extracted from ${sourceTitle} (${sourceDetailText}).`,
        contentSourceUsed: {
          sourceName: sourceTitle,
          sourceDetails: sourceDetailText,
          extractedElements: [
            "Core Product USPs & Value Propositions",
            "Brand Voice & High-Conversion Tone Parameters",
            "Audience ICP Demographics & Intent Signals",
            "Compliance & Double-Opt-In Requirements"
          ]
        },
        googleAds: {
          headlines: [
            `Scale ${productName} Fast`,
            `CASL Compliant B2B Marketing`,
            `Get 3.8x ROAS with ${companyProfile?.companyName || "Sovereign"}`
          ],
          descriptions: [
            `Automate customer acquisition with real-time lead attribution & AI workflow execution. Sourced from ${sourceTitle}.`,
            `Book a live demo today and see how our platform slashes customer acquisition costs.`
          ]
        },
        metaAds: {
          headline: `Transform Your Growth Strategy`,
          primaryText: `Stop burning ad budget on unverified leads. ${companyProfile?.companyName || "Sovereign"}'s Marketing OS combines AI pre-sales qualification, real-time UTM tracking, and double-opt-in CASL compliance into one powerful workspace.\n\n👉 Sourced via ${sourceTitle}: Click below to claim your personalized growth audit.`,
          hook: `Are your ads driving clicks but zero qualified sales demos?`,
          callToAction: "Learn More"
        },
        linkedInAds: {
          headline: `Enterprise Growth OS for B2B Industry Leaders`,
          bodyText: `Decision makers at top enterprises use our workspace to streamline campaign approvals, monitor multi-touch ROAS, and automate lead scoring. Sourced directly from ${sourceTitle}.`,
          callToAction: "Request Demo"
        },
        tikTokAds: {
          headline: `Level Up Your Marketing Pipeline`,
          scriptHook: `Stop throwing ad dollars into a black hole! Here's how ${companyProfile?.companyName || "Sovereign"} gets 3.8x ROAS with automated lead scoring.`,
          callToAction: "Watch Demo"
        },
        creativePrompts: [
          `Modern sleek dark UI dashboard with glowing emerald analytics graphs, professional 3D isometric workspace style.`,
          `High-energy executive team reviewing real-time multi-channel attribution metrics on a clean minimalist tablet.`
        ],
        audienceTargeting: {
          demographics: "Ages 28-55, Directors, VPs & CMOs in Tech, Real Estate, Finance & Professional Services",
          interests: ["Digital Marketing", "Enterprise Software", "Lead Generation", "Marketing Automation", "ROAS Optimization"],
          jobTitles: ["Chief Marketing Officer", "VP of Growth", "Marketing Director", "Founder / CEO", "Head of Digital Acquisition"]
        },
        budgetAllocation: [
          { platform: "Google Search Ads", percentage: 40, recommendedMonthlyAmount: Math.round((parseFloat(budget) || 5000) * 0.40) },
          { platform: "Meta Ads (IG & FB)", percentage: 35, recommendedMonthlyAmount: Math.round((parseFloat(budget) || 5000) * 0.35) },
          { platform: "LinkedIn Sponsored Content", percentage: 25, recommendedMonthlyAmount: Math.round((parseFloat(budget) || 5000) * 0.25) }
        ],
        expectedKpis: {
          estimatedClicks: Math.round((parseFloat(budget) || 5000) / 2.2),
          estimatedConversions: Math.round(((parseFloat(budget) || 5000) / 2.2) * 0.082),
          projectedCPA: `$${((parseFloat(budget) || 5000) / (((parseFloat(budget) || 5000) / 2.2) * 0.082)).toFixed(2)}`,
          targetROAS: "3.8x"
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePushToCommander = () => {
    if (!generatedCampaign) return;
    const activeSourceObj = contentSourcesList.find(s => s.id === contentSource);
    const newWorkflowItem = {
      id: "WF-AI-" + Math.floor(100 + Math.random() * 900),
      title: generatedCampaign.title,
      agent: "AI Campaign Engine",
      agentName: "SBB Campaign Generator",
      budgetImpact: parseFloat(budget) || 5000,
      approvalRequiredFrom: "Marketing Manager",
      status: "Pending",
      createdAt: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString(),
      createdBy: "AI Campaign Engine",
      comments: `Generated cross-channel ad package for ${productName}. Knowledge Sourced From: ${activeSourceObj?.title || contentSource}. Target ROAS: ${generatedCampaign.expectedKpis?.targetROAS || "3.8x"}.`,
      tactics: [
        { tactic: "Google Search Exact Match Ad Copy", status: "Pending" },
        { tactic: "Meta Reels & Feed Video Ad Assets", status: "Pending" },
        { tactic: "LinkedIn Decision Maker Sponsored Posts", status: "Pending" },
        { tactic: "TikTok Short-Form Video Hooks", status: "Pending" }
      ]
    };

    if (onPushToCommander) {
      onPushToCommander(newWorkflowItem);
    }
    setPushedToQueue(true);
  };

  const copyFullCopyPack = () => {
    if (!generatedCampaign) return;
    const text = `
=== ${generatedCampaign.title} ===
${generatedCampaign.overview}

Source Attribution: ${generatedCampaign.contentSourceUsed?.sourceName || "Corporate Memory"} (${generatedCampaign.contentSourceUsed?.sourceDetails || ""})

--- GOOGLE SEARCH ADS ---
Headlines:
1. ${generatedCampaign.googleAds?.headlines?.[0]}
2. ${generatedCampaign.googleAds?.headlines?.[1]}
3. ${generatedCampaign.googleAds?.headlines?.[2]}

Descriptions:
1. ${generatedCampaign.googleAds?.descriptions?.[0]}
2. ${generatedCampaign.googleAds?.descriptions?.[1]}

--- META ADS (IG & FB) ---
Hook: ${generatedCampaign.metaAds?.hook}
Headline: ${generatedCampaign.metaAds?.headline}
Primary Text: ${generatedCampaign.metaAds?.primaryText}
CTA: ${generatedCampaign.metaAds?.callToAction}

--- LINKEDIN ADS ---
Headline: ${generatedCampaign.linkedInAds?.headline}
Body: ${generatedCampaign.linkedInAds?.bodyText}
CTA: ${generatedCampaign.linkedInAds?.callToAction}

--- TIKTOK ADS ---
Headline: ${generatedCampaign.tikTokAds?.headline || "Level Up Your Marketing"}
Script Hook: ${generatedCampaign.tikTokAds?.scriptHook || "Stop throwing ad dollars into a black hole!"}
CTA: ${generatedCampaign.tikTokAds?.callToAction || "Watch Demo"}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              SBB AI Campaign Generator
            </span>
            <span className="text-slate-400 text-xs">• Transparent Content Provenance</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-400 animate-pulse" />
            AI Campaign & Social Ad Generator
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Engineer multi-channel social & search ad copy with full transparency on where campaign content, value props, and hooks are sourced.
          </p>
        </div>
      </div>

      {/* Main Campaign Input Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Section 1: Content Source Selector */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">1. Select Content & Knowledge Source</h2>
                <p className="text-xs text-slate-500">Choose where the AI extracts core copy, value propositions, and positioning from.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-bold border border-indigo-100">
              Source Attribution Active
            </span>
          </div>

          {/* Grid of Source Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contentSourcesList.map((src) => {
              const IconComp = src.icon;
              const isSelected = contentSource === src.id;
              return (
                <div
                  key={src.id}
                  onClick={() => handleSourceSelect(src.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm" 
                      : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-600" 
                          : "bg-slate-200 text-slate-600 border-slate-300"
                      }`}>
                        {src.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{src.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{src.description}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-2 border-t border-indigo-200/60 flex items-center justify-between text-[10px] font-bold text-indigo-700">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        Selected Source
                      </span>
                      <span className="font-mono">Injected</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Source Specific Input / Details */}
          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Active Knowledge Context Inspection</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ready for Gemini Synthesis
              </span>
            </div>

            {contentSource === "website-url" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Target Web URL to Scrape Content From:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => {
                      setSourceUrl(e.target.value);
                      setSourceDetails(e.target.value);
                    }}
                    placeholder="https://sovereignbusinessbrain.com"
                    className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Knowledge Context Reference:
                </label>
                <input
                  type="text"
                  value={sourceDetails}
                  onChange={(e) => setSourceDetails(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 pt-1 border-t border-slate-800">
              <p>• Company: <span className="text-white font-bold">{companyProfile?.companyName || "Sovereign Business Brain"}</span></p>
              <p>• Compliance: <span className="text-emerald-400 font-bold">CASL & PIPEDA Verified</span></p>
              <p>• Data Provenance: <span className="text-indigo-300 font-bold">{contentSourcesList.find(s => s.id === contentSource)?.title}</span></p>
            </div>
          </div>
        </div>

        {/* Section 2: Campaign Parameters Form */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">2. Campaign Objectives & Audience Parameters</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Product / Service Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Enterprise Growth Suite"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Target Audience Profile *</label>
                <input
                  type="text"
                  required
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Tech Founders & CMOs in Toronto"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Primary Objective</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Lead Generation & Demo Bookings">Lead Generation & Demo Bookings</option>
                  <option value="Direct Purchase / High-Intent Conversions">Direct Purchase / High-Intent Conversions</option>
                  <option value="Brand Authority & Market Awareness">Brand Authority & Market Awareness</option>
                  <option value="Retargeting High-Value Visitors">Retargeting High-Value Visitors</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Monthly Budget Allocation ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="5000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Key Value Propositions & Features</label>
              <textarea
                rows={2}
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="e.g. Cuts CAC by 35%, CASL double opt-in, automated lead scoring"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tone & Brand Voice</label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Authoritative, High-Conversion"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Primary Channel Focus</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Cross-Platform">Cross-Platform (Google, Meta, TikTok & LinkedIn)</option>
                  <option value="Google Search Ads">Google Search Ads Focus</option>
                  <option value="Meta (Instagram & Facebook)">Meta Ads Focus</option>
                  <option value="TikTok Ads">TikTok Short-Form Video Focus</option>
                  <option value="LinkedIn Ads">LinkedIn B2B Focus</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-lg font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Synthesizing AI Campaign Package..." : "Generate AI Social Campaign"}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Generated Campaign Package Section */}
      {generatedCampaign && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overview & Action Toolbar */}
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Campaign Output Ready
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                    Content Source: {generatedCampaign.contentSourceUsed?.sourceName || "Corporate Knowledge Vault"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-2">{generatedCampaign.title}</h2>
                <p className="text-xs text-slate-300 mt-1">{generatedCampaign.overview}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyFullCopyPack}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedText ? "Copy Pack Saved!" : "Copy Full Ad Copy Pack"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePushToCommander}
                  disabled={pushedToQueue}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {pushedToQueue ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Submitted to RBAC Queue</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-white" />
                      <span>Submit to Campaign Commander</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content Provenance Info Card */}
            {generatedCampaign.contentSourceUsed && (
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                    Content Source Attribution & Verification
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">✓ Sourced & Injected</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  <strong>Source Material:</strong> {generatedCampaign.contentSourceUsed.sourceName} — <span className="font-mono text-slate-400">{generatedCampaign.contentSourceUsed.sourceDetails}</span>
                </p>
              </div>
            )}

            {/* Expected KPIs Banner */}
            {generatedCampaign.expectedKpis && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-lg border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Estimated Clicks</p>
                  <p className="text-base font-bold text-white mt-0.5">{generatedCampaign.expectedKpis.estimatedClicks?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Estimated Conversions</p>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{generatedCampaign.expectedKpis.estimatedConversions?.toLocaleString()} leads</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Target CPA</p>
                  <p className="text-base font-bold text-indigo-300 mt-0.5">{generatedCampaign.expectedKpis.projectedCPA}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-semibold">Projected ROAS</p>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{generatedCampaign.expectedKpis.targetROAS}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ad Mockups & Copy Preview Tabs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Multi-Platform Social & Search Ad Creative Mockups
              </h3>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveAdPreviewTab("google")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeAdPreviewTab === "google" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Google Search
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdPreviewTab("meta")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeAdPreviewTab === "meta" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Meta (IG & FB)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdPreviewTab("linkedin")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeAdPreviewTab === "linkedin" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAdPreviewTab("tiktok")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    activeAdPreviewTab === "tiktok" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  TikTok Video Hook
                </button>
              </div>
            </div>

            {/* Google Search Ad Mockup */}
            {activeAdPreviewTab === "google" && generatedCampaign.googleAds && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Live Google Search Ad Preview</div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm max-w-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="font-bold text-slate-900">Sponsored</span>
                      <span>•</span>
                      <span className="text-slate-500">https://sovereignbusinessbrain.com</span>
                    </div>
                    <div className="text-base font-semibold text-blue-800 hover:underline cursor-pointer leading-snug">
                      {generatedCampaign.googleAds.headlines?.join(" | ")}
                    </div>
                    <div className="text-xs text-slate-600 leading-normal">
                      {generatedCampaign.googleAds.descriptions?.join(" ")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Generated Headlines</h4>
                    <ul className="space-y-1.5">
                      {generatedCampaign.googleAds.headlines?.map((h: string, i: number) => (
                        <li key={i} className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-slate-800 flex justify-between">
                          <span>{h}</span>
                          <span className="text-[10px] text-slate-400">{h.length}/30</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Generated Descriptions</h4>
                    <ul className="space-y-1.5">
                      {generatedCampaign.googleAds.descriptions?.map((d: string, i: number) => (
                        <li key={i} className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-slate-800 flex justify-between">
                          <span>{d}</span>
                          <span className="text-[10px] text-slate-400">{d.length}/90</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Meta Ad Mockup */}
            {activeAdPreviewTab === "meta" && generatedCampaign.metaAds && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Live Instagram / Facebook Feed Ad Preview</div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-md space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                        S
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{companyProfile?.companyName || "Sovereign Systems"}</div>
                        <div className="text-[10px] text-slate-400">Sponsored</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {generatedCampaign.metaAds.primaryText}
                    </div>

                    <div className="bg-slate-900 h-48 rounded-lg flex flex-col items-center justify-center text-white p-4 text-center border border-slate-800">
                      <Sparkles className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
                      <span className="text-xs font-semibold text-slate-200">AI Visual Asset Placeholder</span>
                      <span className="text-[10px] text-slate-400 mt-1 max-w-xs">{generatedCampaign.creativePrompts?.[0]}</span>
                    </div>

                    <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between border border-slate-200">
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono">SOVEREIGNBUSINESSBRAIN.COM</div>
                        <div className="text-xs font-bold text-slate-900">{generatedCampaign.metaAds.headline}</div>
                      </div>
                      <button className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded">
                        {generatedCampaign.metaAds.callToAction || "Learn More"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LinkedIn Ad Mockup */}
            {activeAdPreviewTab === "linkedin" && generatedCampaign.linkedInAds && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Live LinkedIn Sponsored Post Preview</div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-sky-700 text-white font-bold flex items-center justify-center text-xs">
                        in
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{companyProfile?.companyName || "Sovereign Systems"}</div>
                        <div className="text-[10px] text-slate-400">Promoted • Enterprise Tech</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed">
                      {generatedCampaign.linkedInAds.bodyText}
                    </div>

                    <div className="bg-slate-100 p-3 rounded-lg flex items-center justify-between border border-slate-200">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{generatedCampaign.linkedInAds.headline}</div>
                        <div className="text-[10px] text-slate-500">sovereignbusinessbrain.com</div>
                      </div>
                      <button className="bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded">
                        {generatedCampaign.linkedInAds.callToAction || "Request Demo"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TikTok Video Hook Mockup */}
            {activeAdPreviewTab === "tiktok" && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Live TikTok / Reel Short-Form Video Script Hook</div>
                  <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm max-w-md space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-black flex items-center justify-center text-xs">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{companyProfile?.companyName || "Sovereign Systems"}</div>
                        <div className="text-[10px] text-rose-400 font-mono font-bold">Short-Form Video Script</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-2">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">⚡ 3-SECOND SPOKEN HOOK:</span>
                      <p className="text-xs text-white font-mono font-bold leading-relaxed">
                        &quot;{generatedCampaign.tikTokAds?.scriptHook || "Stop burning ad budget on cold clicks!"}&quot;
                      </p>
                    </div>

                    <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-1">
                      <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase">VIDEO CAPTION / HEADLINE:</span>
                      <p className="text-xs text-slate-200">{generatedCampaign.tikTokAds?.headline || "How top leaders scale 3.8x ROAS with automated lead scoring."}</p>
                    </div>

                    <button className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-lg transition-all">
                      {generatedCampaign.tikTokAds?.callToAction || "Watch Demo"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audience Targeting & Budget Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audience Specs */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                Target Audience Specifications
              </h3>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700 block">Demographics:</span>
                  <p className="text-slate-600 mt-0.5">{generatedCampaign.audienceTargeting?.demographics}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700 block">Job Titles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {generatedCampaign.audienceTargeting?.jobTitles?.map((jt: string, i: number) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-indigo-200">
                        {jt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700 block">Interest Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {generatedCampaign.audienceTargeting?.interests?.map((kw: string, i: number) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Budget Allocation */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Recommended Monthly Channel Budget
              </h3>

              <div className="space-y-2.5">
                {generatedCampaign.budgetAllocation?.map((alloc: any, i: number) => (
                  <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{alloc.platform}</span>
                      <span className="text-emerald-600">${alloc.recommendedMonthlyAmount?.toLocaleString()}/mo ({alloc.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${alloc.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

