import React, { useState } from "react";
import { 
  Sparkles, Send, Copy, Check, Target, DollarSign, 
  Layers, ShieldAlert, ArrowRight, Zap, Image, 
  Sliders, Megaphone, FileText, Globe, CheckCircle2
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

  // Output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<any>(null);
  const [activeAdPreviewTab, setActiveAdPreviewTab] = useState<"google" | "meta" | "linkedin">("google");
  const [copiedText, setCopiedText] = useState(false);
  const [pushedToQueue, setPushedToQueue] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setPushedToQueue(false);

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
          companyProfile
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
        overview: `Cross-channel AI generated campaign designed for ${targetAudience} to drive high-intent leads and maximum ROAS.`,
        googleAds: {
          headlines: [
            `Scale ${productName} Fast`,
            `CASL Compliant B2B Marketing`,
            `Get 3.8x ROAS with ${companyProfile?.companyName || "Sovereign"}`
          ],
          descriptions: [
            `Automate customer acquisition with real-time lead attribution & AI workflow execution.`,
            `Book a live demo today and see how our platform slashes customer acquisition costs.`
          ]
        },
        metaAds: {
          headline: `Transform Your B2B Growth Strategy`,
          primaryText: `Stop burning ad budget on unverified leads. ${companyProfile?.companyName || "Sovereign"}'s Marketing OS combines AI pre-sales qualification, real-time UTM tracking, and double-opt-in CASL compliance into one powerful workspace.`,
          hook: `Are your ads driving clicks but zero qualified sales demos?`,
          callToAction: "Learn More"
        },
        linkedInAds: {
          headline: `Enterprise Growth OS for B2B Industry Leaders`,
          bodyText: `Decision makers at top enterprises use our workspace to streamline campaign approvals, monitor multi-touch ROAS, and automate lead scoring. Elevate your marketing ROI today.`,
          callToAction: "Request Demo"
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
      comments: `Generated cross-channel ad package for ${productName}. Target ROAS: ${generatedCampaign.expectedKpis?.targetROAS || "3.8x"}.`,
      tactics: [
        { tactic: "Google Search Exact Match Ad Copy", status: "Pending" },
        { tactic: "Meta Reels & Feed Video Ad Assets", status: "Pending" },
        { tactic: "LinkedIn Decision Maker Sponsored Posts", status: "Pending" }
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
            <span className="text-slate-400 text-xs">Autonomous Multi-Platform Copy & Strategy Studio</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-400 animate-pulse" />
            AI Campaign Generator
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Instantly engineer high-converting ad copy, visual prompts, target audience parameters, and budget allocations ready for deployment.
          </p>
        </div>
      </div>

      {/* Campaign Specification Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Sliders className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">1. Campaign Parameters & Value Proposition</h2>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
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
                <option value="Cross-Platform">Cross-Platform (Google, Meta & LinkedIn)</option>
                <option value="Google Search Ads">Google Search Ads Focus</option>
                <option value="Meta (Instagram & Facebook)">Meta Ads Focus</option>
                <option value="LinkedIn Ads">LinkedIn B2B Focus</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Synthesizing AI Campaign Package..." : "Generate AI Campaign Package"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Campaign Package Section */}
      {generatedCampaign && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overview & Action Toolbar */}
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Campaign Output Ready
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{generatedCampaign.title}</h2>
                <p className="text-xs text-slate-300 mt-1">{generatedCampaign.overview}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={copyFullCopyPack}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedText ? "Copy Pack Saved!" : "Copy Full Ad Copy Pack"}</span>
                </button>

                <button
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
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Multi-Platform Ad Creative & Copy Mockups
              </h3>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setActiveAdPreviewTab("google")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    activeAdPreviewTab === "google" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Google Search
                </button>
                <button
                  onClick={() => setActiveAdPreviewTab("meta")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    activeAdPreviewTab === "meta" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Meta (IG & FB)
                </button>
                <button
                  onClick={() => setActiveAdPreviewTab("linkedin")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    activeAdPreviewTab === "linkedin" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  LinkedIn
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
                      <span className="text-slate-500">https://sovereignmarketing.ai</span>
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
                        <div className="text-[10px] text-slate-500 font-mono">SOVEREIGNMARKETING.AI</div>
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
                        <div className="text-[10px] text-slate-500">sovereignmarketing.ai</div>
                      </div>
                      <button className="bg-sky-700 text-white text-xs font-bold px-3 py-1.5 rounded">
                        {generatedCampaign.linkedInAds.callToAction || "Request Demo"}
                      </button>
                    </div>
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
