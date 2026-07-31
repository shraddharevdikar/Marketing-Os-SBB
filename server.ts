import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily to prevent crash if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API Routes

// Route 0: Health check endpoint
app.get("/api/health", (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    hasGeminiKey: hasKey,
    message: hasKey ? "Connected to Sovereign Core Engine (Gemini AI active)." : "Connected to Sovereign Core Engine (Local Rule Engine active)."
  });
});

// Route 1: Query the AI marketing strategist
app.post("/api/strategist/query", async (req, res) => {
  try {
    const { prompt, businessState } = req.body;
    const client = getAiClient();

    const formattedContext = `
      You are the Sovereign Business Brain (MarketingOS v2.4), an elite, highly intelligent AI marketing growth strategist.
      Current Business State:
      - Marketing Attributed Revenue: $${businessState?.revenue?.toLocaleString() || "482,910"}
      - ROAS Target: ${businessState?.roasTarget || "4.2"}x
      - Daily Burn Rate: $${businessState?.burnRate?.toLocaleString() || "1,200"}/day
      - Lead Quality Score: ${businessState?.leadScore || "88"}/100
      - Active Channels: ${JSON.stringify(businessState?.channels || [])}
      - Target Demographics: ${JSON.stringify(businessState?.demographics || [])}
    `;

    if (!client) {
      // Return a highly intelligent mock rule-based expert recommendation when API key is missing.
      // We will include a helpful note showing how to connect their actual key
      const lowerPrompt = prompt.toLowerCase();
      let responseText = `### 🧠 Sovereign Business Brain Intelligence (Local Fallback Mode)\n\n`;
      responseText += `*Note: To enable custom live AI-powered strategic deep dives, please add your **GEMINI_API_KEY** in the **Settings > Secrets** panel in the AI Studio UI.*\n\n`;

      if (lowerPrompt.includes("cpa") || lowerPrompt.includes("facebook") || lowerPrompt.includes("fb")) {
        responseText += `#### 📊 Facebook Ads Performance Diagnostics:\n`;
        responseText += `1. **CPA Optimization**: Your Meta Brand Awareness CPA is currently running at approximately $18.40. We recommend shifting 15% of the static awareness budget to mid-funnel lookalike campaigns targeting **${businessState?.demographics?.[0]?.name || "Enterprise"}** verticals.\n`;
        responseText += `2. **Creative Ad fatigue**: Average click-through-rate (CTR) has seen a minor decline of 4% over the past 14 days. Rotate ad creatives using short-form narrative videos.\n`;
        responseText += `3. **Action Plan**: Re-allocate $400/day from Facebook General to Google Search high-intent keywords to secure immediate high-scoring leads.`;
      } else if (lowerPrompt.includes("burn") || lowerPrompt.includes("budget") || lowerPrompt.includes("spend")) {
        responseText += `#### 💸 Capital Efficiency & Burn Diagnostics:\n`;
        responseText += `1. **Current Spend**: Your total Daily Burn Rate is **$${businessState?.burnRate || "1,200"}/day** against an active attribution of **$${businessState?.revenue ? (businessState.revenue / 30).toFixed(2) : "16,097"}/day** in pipeline value.\n`;
        responseText += `2. **ROAS Target Efficiency**: You are operating at an dynamic ROAS target of **${businessState?.roasTarget || "4.2"}x**. Reducing channels with conversion rates under 1.5% (e.g., experimental awareness campaigns) will cut your burn by 25% while lifting average ROAS to 4.5x.\n`;
        responseText += `3. **Immediate Directives**: Temporarily scale down YouTube retargeting by 10% and focus resources on Google Core Search high-quality segments.`;
      } else {
        responseText += `#### 🎯 Sovereign Growth Optimization Recommendations:\n`;
        responseText += `1. **Audience Refinement**: Double-down on **SaaS Founders** and **E-commerce Enterprise** segments which are showing a lead conversion index of 92/100 and a high average contract value.\n`;
        responseText += `2. **Lead Routing System**: Since your Lead Quality Score is **${businessState?.leadScore || "88"}/100**, implement an automated lead scoring filter. Only route MQLs scored above 85 directly to your sales pipeline.\n`;
        responseText += `3. **Channel Recommendation**: Increase budget for search intent keywords and write standard contextual landing pages optimized for mobile users.`;
      }
      return res.json({ text: responseText, isFallback: true });
    }

    const systemInstruction = `
      You are the "Sovereign Business Brain (MarketingOS v2.4)", an elite growth strategist, chief marketing officer, and business intelligence advisor.
      Speak with professional authority, high-level business competence, and strategic sophistication. Avoid generic, high-hype SaaS buzzwords ("supercharge", "synergy", "paradigm shift"). Provide detailed, highly specific, quantitative marketing strategies.
      Use elegant markdown formatting (bolding, clear lists, code snippets or tables where necessary) to present your recommendations.
      If the user asks an unrelated question, gracefully bring them back to the realm of marketing performance, brand scaling, conversion intelligence, and marketing operations.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nContext:\n${formattedContext}\n\nUser Question:\n${prompt}` }] }
      ]
    });

    res.json({ text: response.text || "No response received from the Business Brain.", isFallback: false });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with the strategic advisor." });
  }
});

// Route 2: Generate a custom campaign copywriting & strategy brief
app.post("/api/strategist/generate-campaign", async (req, res) => {
  try {
    const { campaignName, platform, goal, audience, budget } = req.body;
    const client = getAiClient();

    if (!client) {
      // Local fallback strategic brief
      const brief = `### 📋 Campaign Strategy & Copywriting Brief (Local Fallback Mode)
*Note: To generate dynamic custom campaign plans using deep AI models, add your **GEMINI_API_KEY** under **Settings > Secrets**.*\n

**Campaign Title:** ${campaignName || "Acquisition Core"}  
**Target Platform:** ${platform || "Meta Ads"}  
**Core Objective:** ${goal || "High-Quality Lead Generation"}  
**Target Segment:** ${audience || "Enterprise Founders"}  
**Allocated Daily Budget:** $${budget || "500"}/day

---

#### ✍️ High-Converting Ad Copy Variations:
*   **Angle A: The Efficiency Blueprint (Direct & Pain-focused)**
    *   **Headline:** Stop Burning 40% of Your Ad Spend on Empty Clicks.
    *   **Primary Text:** "SaaS teams waste millions on low-intent awareness campaigns. Sovereign Business Brain automates your marketing operations, filters low-quality leads, and guarantees clean ROAS targets. Connect your data in minutes."
    *   **CTA:** Get Free Marketing Audit
*   **Angle B: The High-Yield Outcome (Desire-focused)**
    *   **Headline:** Your Business Intelligence, Unified in One Dashboard.
    *   **Primary Text:** "Get an operating system designed strictly for scaling founders. Track attributed revenue, optimize lead scores in real-time, and let autonomous algorithms manage your channel budgets."
    *   **CTA:** Start Scaling Today

---

#### 🎯 Strategic Targeting Directives:
1.  **Lookalike Target**: Build a 1% Lookalike Audience based on your highest-converting pipeline customers.
2.  **Exclusions**: Exclude all active customers, existing leads, and users who have visited your landing page in the past 14 days to prevent redundant ad spend.
3.  **Core Demographics**: Age 30-55, Interests: B2B Marketing, SaaS, Venture Capital, and Enterprise Sales.
4.  **Device Targeting**: Optimize placements exclusively for Desktop (65%) and high-end Mobile devices (35%).`;
      return res.json({ text: brief, isFallback: true });
    }

    const prompt = `
      Create a highly professional, ready-to-launch marketing campaign brief and ad copy options.
      Campaign Specs:
      - Name: "${campaignName}"
      - Platform: "${platform}"
      - Objective: "${goal}"
      - Target Audience: "${audience}"
      - Allocated Budget: $${budget}/day

      Please output:
      1. A brief overview of the strategic angle and psychological triggers for this target audience.
      2. Two high-converting ad copy variations (Headline, Primary Text, Call to Action, and Visual Concept).
      3. Audience targeting recommendations (Interests, Demographics, Behaviors, and recommended retargeting filters).
      4. Creative & Formatting checklist (e.g., visual assets, aspect ratios, dynamic components to test).
      
      Make it look like a highly polished marketing agency brief, formatted in beautiful markdown.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ]
    });

    res.json({ text: response.text || "Failed to generate campaign brief.", isFallback: false });
  } catch (error: any) {
    console.error("Campaign Generator Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate campaign strategy." });
  }
});

// Route 3: Full-Channel Business Brain Audit
app.post("/api/strategist/audit", async (req, res) => {
  try {
    const { businessState } = req.body;
    const client = getAiClient();

    if (!client) {
      const audit = `### 🔍 Sovereign Marketing Audit Report (Local Fallback Mode)
*Note: For dynamic AI-powered growth auditing, add your **GEMINI_API_KEY** under **Settings > Secrets**.*\n

#### 🚨 Warning & Alert Flags
*   **Burn Rate Alert**: Daily burn is currently $${businessState?.burnRate || "1,200"}/day. Facebook channel is generating a slightly higher CPA ($18.40) than target benchmarks.
*   **Audience Saturation**: E-commerce Enterprise audience is highly optimized (42% share) but has experienced a 3% fatigue factor over the past week.

#### ✅ High Performance Markers
*   **ROAS Health**: Current active ROAS index of **${businessState?.roasTarget || "4.2"}x** is exceeding the industry median of 3.1x.
*   **Lead Quality Integration**: Lead Quality Score **${businessState?.leadScore || "88"}/100** indicates strong qualification criteria and landing page alignment.

#### 📝 Action Plan & Strategic Execution Directives
1.  **Immediate Spend Shift**: Shift $200/day from Facebook Brand Awareness into Google Search core intent keywords.
2.  **Audience Expansion**: Initiate an A/B test targeting the **Marketing Agencies** segment (currently 15%) to diversify lead capture sources and hedge against E-commerce saturation.
3.  **Creative Refresh**: Launch a video-first retargeting campaign on YouTube using high-retention shorts.`;
      return res.json({ text: audit, isFallback: true });
    }

    const prompt = `
      Conduct a professional marketing audit of the following business metrics:
      - Marketing Attributed Revenue: $${businessState?.revenue?.toLocaleString()}
      - ROAS Target: ${businessState?.roasTarget}x
      - Daily Burn Rate: $${businessState?.burnRate?.toLocaleString()}/day
      - Lead Quality Score: ${businessState?.leadScore}/100
      - Channels: ${JSON.stringify(businessState?.channels)}
      - Demographics distribution: ${JSON.stringify(businessState?.demographics)}

      Formulate a rigorous, quantitative assessment. Identify:
      1. Alert Flags (areas where the client is burning cash or converting poorly).
      2. Performance Wins (best performing demographics or channels).
      3. Precise spend redistribution recommendations to boost average ROAS by 10-15%.
      4. An executive "To-Do" list for the marketing coordinator.
      
      Ensure your tone is premium, objective, and analytical. Format elegantly in markdown.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ]
    });

    res.json({ text: response.text || "Failed to conduct marketing audit.", isFallback: false });
  } catch (error: any) {
    console.error("Audit API Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute audit." });
  }
});

// Route 4: Query the Sovereign Business Memory Advisor
app.post("/api/gemini/memory-advisor", async (req, res) => {
  try {
    const { businessMemory, agentName, question } = req.body;
    const client = getAiClient();

    if (!client) {
      // Return a professional rule-based expert recommendation when API key is missing.
      const fallback = `### 🧠 Strategic Advisor Response (${agentName}) [Local Fallback Mode]

*Note: For live AI strategic intelligence using your business database, please supply your **GEMINI_API_KEY** under **Settings > Secrets**.*

Based on your active **Business Memory** matrices:
- **Core Goals**: ${businessMemory?.businessGoals?.map((g: any) => g.goal).join(", ") || "No business goals defined yet."}
- **Past Campaigns**: ${businessMemory?.pastCampaigns?.map((c: any) => `${c.title} (ROI: ${c.roi}x)`).join(", ") || "No past campaigns recorded."}
- **Top Personas**: ${businessMemory?.winningPersonas?.map((p: any) => p.name).join(", ") || "No winning personas configured."}

#### Growth Advisory:
1. **Target Persona Alignment**: Optimize your marketing campaign copy explicitly targeting **${businessMemory?.winningPersonas?.[0]?.name || "your ideal demographics"}**. Frame the value proposition directly around resolving their core pain points: *"${businessMemory?.winningPersonas?.[0]?.painPoints || "efficiency & scale"}"*.
2. **Double Down on Successful Channels**: Your campaigns with high performance (like *${businessMemory?.pastCampaigns?.[0]?.title || "organic referral pathways"}*) should receive 15% budget re-allocations from lower ROI channels.
3. **Brand Tone Compliance**: Ensure all messaging adheres strictly to your brand voice guidelines: *"${businessMemory?.brandVoice || "Professional, authoritative, and direct."}"* to preserve brand consistency.`;
      return res.json({ text: fallback, isFallback: true });
    }

    const systemInstruction = `
      You are the "Sovereign Business Memory Matrix Analyzer" (v2.4).
      Your role is to analyze a company's detailed strategic context (Business Memory) and provide highly competent, context-aware strategic marketing guidance matching the persona of the chosen Agent: "${agentName}".
      
      Available Agents:
      - "SBB Chief Growth Officer" (Aggressive scaling, acquisition focus, ROAS & CAC optimization)
      - "Brand Compliance Officer" (Protecting brand consistency, adhering to brand voice, regional legal restrictions like CASL, and tone validation)
      - "CEO Virtual Twin / strategist" (High-level capital efficiency, burn rates, resource allocation, structural positioning)
      
      Adopt the tone of the selected Agent (${agentName}). Speak with extreme professional authority, clear quantitative metrics, and direct execution directives. Avoid generic or high-hype SaaS buzzwords ("supercharge", "disrupt"). Format your advice elegantly in markdown.
    `;

    const formattedContext = `
      Strategic Business Memory Context:
      - Brand Voice: "${businessMemory?.brandVoice || "N/A"}"
      - Business Goals: ${JSON.stringify(businessMemory?.businessGoals || [])}
      - Past Campaigns & Performance: ${JSON.stringify(businessMemory?.pastCampaigns || [])}
      - Winning Personas: ${JSON.stringify(businessMemory?.winningPersonas || [])}
      - Competitor Analysis: ${JSON.stringify(businessMemory?.competitors || [])}
      - Financial Records: ${JSON.stringify(businessMemory?.financialRecords || [])}
      - Multi-Channel Attribution: ${JSON.stringify(businessMemory?.channelAttributions || [])}
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nContext:\n${formattedContext}\n\nUser Question:\n${question}` }] }
      ]
    });

    res.json({ text: response.text || "No response received from the memory advisor.", isFallback: false });
  } catch (error: any) {
    console.error("Memory Advisor API Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with the strategic memory advisor." });
  }
});

// Route 5: SEO Brain Report
app.post("/api/gemini/seo-brain", async (req, res) => {
  try {
    const { companyProfile, customUrl } = req.body;
    const client = getAiClient();
    const targetName = companyProfile?.companyName || "Sovereign Marketing OS";

    const defaultSeoReport = {
      onPageSEO: {
        titleTagRecommendation: `${targetName} | Enterprise AI Marketing OS & Growth Engine`,
        metaDescriptionRecommendation: `Automate marketing operations, track multi-channel ROAS, and optimize lead capture with CASL-compliant AI growth strategies.`,
        headingHierarchySuggestions: [
          `H1: ${targetName} Marketing Operating System for Enterprise Growth`,
          "H2: Autonomous Multi-Channel Campaign Management",
          "H2: Real-time ROAS & Lead Score Attribution",
          "H3: PIPEDA & CASL Compliance Protection Matrix"
        ],
        schemaMarkupJSONLD: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": targetName,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Cloud Native"
        }, null, 2)
      },
      keywordStrategy: [
        { keyword: "ai marketing automation canada", monthlySearchVolumeCanada: 4800, difficultyPercentage: 38, intent: "Transactional" },
        { keyword: "casl compliant lead generation", monthlySearchVolumeCanada: 2900, difficultyPercentage: 24, intent: "Commercial" },
        { keyword: "b2b roas optimization engine", monthlySearchVolumeCanada: 3600, difficultyPercentage: 42, intent: "Informational" },
        { keyword: "enterprise growth marketing software", monthlySearchVolumeCanada: 5200, difficultyPercentage: 51, intent: "Transactional" }
      ],
      contentHubClusters: [
        {
          clusterTitle: "CASL & PIPEDA Marketing Compliance",
          clusterCoreKeyword: "canadian marketing compliance",
          articleIdeas: [
            { title: "The Complete 2026 Founder's Guide to CASL Double Opt-In Automation", estimatedWordCount: 2400, focusKeyword: "casl double opt in guide" },
            { title: "How to Conduct PIPEDA Data Audits on Your Marketing Tech Stack", estimatedWordCount: 1800, focusKeyword: "pipeda marketing tech audit" }
          ]
        },
        {
          clusterTitle: "Multi-Channel ROAS Acceleration",
          clusterCoreKeyword: "roas optimization canada",
          articleIdeas: [
            { title: "Reducing CAC by 30% Using Pre-Sales AI Tele-Calling Qualification", estimatedWordCount: 2100, focusKeyword: "ai tele calling qualification" },
            { title: "Meta Ads vs Google Search: B2B Attribution Strategies for 2026", estimatedWordCount: 2600, focusKeyword: "b2b attribution strategies" }
          ]
        }
      ],
      competitorGapAnalysis: [
        {
          competitorName: "HubSpot Canada",
          estimatedOrganicTrafficMonthly: 125000,
          overlappingKeywordsCount: 340,
          identifiedGapOpportunities: [
            "Hyper-targeted Canadian provincial compliance keywords",
            "Autonomous pre-sales AI phone agent workflows"
          ]
        },
        {
          competitorName: "Klaviyo Enterprise",
          estimatedOrganicTrafficMonthly: 89000,
          overlappingKeywordsCount: 210,
          identifiedGapOpportunities: [
            "B2B lead quality scoring algorithms",
            "CASL-verified ad hook ingestion integrations"
          ]
        }
      ]
    };

    if (!client) {
      return res.json(defaultSeoReport);
    }

    try {
      const prompt = `
        You are an elite SEO strategist specializing in Canadian B2B search analytics and technical SEO.
        Generate a comprehensive SEO strategy report for:
        Company: ${targetName}
        Custom URL to audit (optional): ${customUrl || "N/A"}
        Company Profile: ${JSON.stringify(companyProfile)}

        Return strict JSON only (no markdown code fence, just pure JSON object) with keys:
        - onPageSEO: { titleTagRecommendation: string, metaDescriptionRecommendation: string, headingHierarchySuggestions: string[], schemaMarkupJSONLD: string }
        - keywordStrategy: Array of { keyword: string, monthlySearchVolumeCanada: number, difficultyPercentage: number, intent: string }
        - contentHubClusters: Array of { clusterTitle: string, clusterCoreKeyword: string, articleIdeas: Array of { title: string, estimatedWordCount: number, focusKeyword: string } }
        - competitorGapAnalysis: Array of { competitorName: string, estimatedOrganicTrafficMonthly: number, overlappingKeywordsCount: number, identifiedGapOpportunities: string[] }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.onPageSEO && parsed.keywordStrategy) {
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("Gemini SEO report generation fallback:", aiErr);
    }

    return res.json(defaultSeoReport);
  } catch (error: any) {
    console.error("SEO Brain API Error:", error);
    res.status(500).json({ error: error.message || "Failed to compile SEO report." });
  }
});

// Route 6: AI Business Discovery & SWOT
app.post("/api/gemini/analyze-business", async (req, res) => {
  try {
    const profile = req.body;
    const name = profile?.companyName || "Sovereign Company";
    const client = getAiClient();

    const fallbackReport = {
      confidenceScore: 92,
      executiveSummary: `Sovereign Business intelligence audit completed for ${name}. Based on parameters in ${profile?.countriesServed || "Canada & US"}, our core trajectory focuses on securing highly certified local market authority.`,
      swotAnalysis: {
        strengths: ["Strong regulatory CASL compliant data capture framework.", "Flexible operational agility with specialized software integration."],
        weaknesses: ["Limited historical local attribution benchmarks.", "Ad budget constraints compared to national aggregates."],
        opportunities: ["Localized geo-fenced search campaign expansions.", "Positioning brand as organic authority niche under SEO clusters."],
        threats: ["Rising CPC search auction thresholds in major zones.", "Tightening provincial privacy audits under PIPEDA."]
      },
      pestleAnalysis: {
        political: "Local municipal small-business clean subsidies create potential growth runways.",
        economic: "High interest rate trends require extremely careful CAC and LTV mapping.",
        social: "Consumers demanding 100% data visibility, requiring audited double-opt-ins.",
        technological: "Low-code AI CRM frameworks allow small teams to scale at enterprise rate.",
        environmental: "Sustainability metrics becoming core buying consideration in local hubs.",
        legal: "Double-opt-in CASL audits demand compliant registration forms with zero risk."
      },
      icp: `### SBB Custom Ideal Customer Persona (ICP)\n- **Profile Roles**: Senior decision makers, operations leads, local luxury consumers.\n- **Demographics**: Major metropolitan hubs in Canada.\n- **Pain Points**: High compliance audit risk, CAC bleed, tracking leakage.`,
      buyerJourney: `### 3-Stage Acquisition Journey\n1. **Discovery**: Found via hyper-targeted local SEO or CASL-compliant opt-in ads.\n2. **Evaluation**: Automated CRM tele-calling triggers build trust and verify service standards.\n3. **Commitment**: Interactive strategic brief delivery leads to close.`,
      growthRoadmap90Day: [
        "**Month 1 (Setup)**: Audit compliance double-opt-ins and localize directories.",
        "**Month 2 (SEO Content)**: Write 8 highly relevant blog pieces for core keywords.",
        "**Month 3 (Scoring Sync)**: Interlink CRM filters with custom scoring pipelines."
      ]
    };

    if (!client) {
      return res.json(fallbackReport);
    }

    try {
      const prompt = `
        Analyze the business profile and generate a comprehensive SWOT & market strategy report.
        Company Data: ${JSON.stringify(profile)}

        Return JSON matching this schema:
        {
          "confidenceScore": number (80-99),
          "executiveSummary": string,
          "swotAnalysis": { "strengths": string[], "weaknesses": string[], "opportunities": string[], "threats": string[] },
          "pestleAnalysis": { "political": string, "economic": string, "social": string, "technological": string, "environmental": string, "legal": string },
          "icp": string (markdown),
          "buyerJourney": string (markdown),
          "growthRoadmap90Day": string[]
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.swotAnalysis && parsed.executiveSummary) {
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("Business analysis AI error:", aiErr);
    }

    return res.json(fallbackReport);
  } catch (error: any) {
    console.error("Analyze Business Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze business profile." });
  }
});

// Route 7: Market Research LLM
app.post("/api/gemini/research", async (req, res) => {
  try {
    const { topic, province, sector } = req.body;
    const client = getAiClient();

    if (!client) {
      const fallbackReport = `### 📊 Canadian Market Specialization Research Brief
**Topic:** ${topic || "Market Trends"}  
**Target Region:** ${province || "National"}  
**Industry Sector:** ${sector || "B2B & Enterprise"}  

---

#### 🎯 Executive Insights
1. **Market Landscape**: Demand for automated, compliant digital operations is growing at 18% YoY in ${province || "Canada"}.
2. **Regulatory Standards**: PIPEDA & CASL enforcement requires verified opt-in mechanisms for B2B and B2C direct marketing.
3. **Strategic Recommendation**: Deploy hyper-localized organic content, optimize lead scoring for regional intent, and automate pre-sales qualification to lower overall customer acquisition costs.`;

      return res.json({ report: fallbackReport });
    }

    const prompt = `
      You are an expert Canadian market analyst specializing in regional compliance, industry benchmarks, and provincial economic strategy.
      Provide a detailed research report in beautiful markdown format on:
      Topic: "${topic}"
      Province/Region: "${province}"
      Sector: "${sector}"

      Include:
      - Regional market dynamics & competitive landscape
      - Regulatory considerations (CASL, PIPEDA, provincial consumer laws)
      - Actionable growth & acquisition directives
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    res.json({ report: response.text || "No report generated." });
  } catch (error: any) {
    console.error("Research API Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute research request." });
  }
});

// Route 8: Diagnostic Triage
app.post("/api/gemini/troubleshoot", async (req, res) => {
  try {
    const { problem, step, answers } = req.body;
    const client = getAiClient();

    if (step === 1) {
      if (!client) {
        return res.json({
          analysis: `Diagnostic triage initiated for problem: "${problem}". Evaluating infrastructure, API handshake protocols, and payload structures.`,
          diagnosticQuestions: [
            "Has the GEMINI_API_KEY environment variable been configured in Settings > Secrets?",
            "Are network firewall policies permitting outbound HTTPS requests on port 443?",
            "Is the current database or server environment running in local fallback mode?"
          ]
        });
      }

      const prompt = `
        You are a diagnostic systems engineer for an enterprise marketing operating system.
        Problem described: "${problem}"
        Return strict JSON only:
        {
          "analysis": "Brief initial triage summary",
          "diagnosticQuestions": ["Question 1", "Question 2", "Question 3"]
        }
      `;

      try {
        const response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" }
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.diagnosticQuestions) {
          return res.json(parsed);
        }
      } catch (aiErr) {
        console.warn("Troubleshoot step 1 AI fallback:", aiErr);
      }

      return res.json({
        analysis: `Diagnostic triage initiated for problem: "${problem}".`,
        diagnosticQuestions: [
          "Has the API credentials or configuration key been recently modified?",
          "Are network firewall policy settings permitting outbound HTTPS requests?",
          "Is the server operating within normal latency parameters?"
        ]
      });
    } else {
      // Step 2
      if (!client) {
        return res.json({
          rootCause: "System operating in local rule fallback mode due to unconfigured API key or network partition.",
          recommendedSolution: "Add valid GEMINI_API_KEY in AI Studio Settings > Secrets and restart the dev server.",
          verificationStep: "Execute a test endpoint check via /api/health to confirm active handshake status."
        });
      }

      const prompt = `
        You are a diagnostic systems engineer.
        Original Problem: "${problem}"
        User Answers: ${JSON.stringify(answers)}
        Return strict JSON only:
        {
          "rootCause": "Clear explanation of the root cause",
          "recommendedSolution": "Step-by-step fix recommendation",
          "verificationStep": "How to verify the issue is resolved"
        }
      `;

      try {
        const response = await client.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" }
        });

        const parsed = JSON.parse(response.text || "{}");
        if (parsed.rootCause) {
          return res.json(parsed);
        }
      } catch (aiErr) {
        console.warn("Troubleshoot step 2 AI fallback:", aiErr);
      }

      return res.json({
        rootCause: "Credential mismatch or transient network timeout in upstream microservice connection.",
        recommendedSolution: "Verify secret environment variables in Settings > Secrets and restart the application dev server.",
        verificationStep: "Execute a test endpoint check via /api/health to confirm active handshake status."
      });
    }
  } catch (error: any) {
    console.error("Troubleshoot API Error:", error);
    res.status(500).json({ error: error.message || "Failed to run diagnostic triage." });
  }
});

// Route 9: Neural Marketplace Agent Collaboration
app.post("/api/marketplace/collaborate", async (req, res) => {
  try {
    const { agentName, category, description, systemPrompt, task, companyProfile } = req.body;
    const client = getAiClient();

    if (!client) {
      const fallbackResult = `### 🤝 Strategic Boardroom Collaboration Brief (Local Fallback Mode)

**Agent Specialist:** ${agentName || "Specialized AI Agent"} (${category || "General"})  
**Assigned Task:** "${task || "General Business Strategy"}"  

---

#### 🎯 Executive Recommendations
1. **Strategic Direction**: Align task execution directly with core company goals for ${companyProfile?.companyName || "your business"}.
2. **Operational Blueprint**: Implement automated tracking and maintain strict compliance standards under Canadian regulatory guidelines (PIPEDA & CASL).
3. **Next Steps**: Re-evaluate campaign parameters, optimize ad placement budgets, and route high-scoring leads directly to your sales pipeline.`;

      return res.json({ result: fallbackResult });
    }

    const prompt = `
      You are "${agentName}", an expert ${category} specialist agent.
      Agent Description: ${description}
      System Instructions: ${systemPrompt}
      Company Context: ${JSON.stringify(companyProfile)}
      
      User Task: "${task}"

      Provide a comprehensive, expert boardroom response in clear markdown format.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    res.json({ result: response.text || "Collaboration complete." });
  } catch (error: any) {
    console.error("Marketplace Collaboration API Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute collaboration task." });
  }
});

// Route 10: CRM Consultant
app.post("/api/gemini/crm-consultant", async (req, res) => {
  try {
    const { crm, level, topic } = req.body;
    const client = getAiClient();

    if (!client) {
      const fallbackResult = `### 📊 CRM Optimization Advisory (Local Fallback Mode)

**CRM Platform:** ${crm || "General CRM"}  
**User Expertise:** ${level || "Intermediate"}  
**Inquiry Topic:** "${topic || "Pipeline Management"}"  

---

#### 🚀 Recommended Action Plan
1. **Pipeline Structuring**: Standardize deal stages to reflect actual buyer journey checkpoints.
2. **Automated Qualification**: Connect pre-sales lead scoring triggers to route high-intent leads to senior reps.
3. **Data Hygiene**: Enforce required field validations to prevent incomplete records.`;

      return res.json({ result: fallbackResult });
    }

    const prompt = `
      You are an expert CRM architect specializing in ${crm}.
      User Skill Level: ${level}
      Question/Topic: "${topic}"

      Provide actionable, step-by-step CRM optimization advice formatted in markdown.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    res.json({ result: response.text || "Consultation complete." });
  } catch (error: any) {
    console.error("CRM Consultant API Error:", error);
    res.status(500).json({ error: error.message || "Failed to consult on CRM architecture." });
  }
});

// Route 11: Lead Capture Ingestion
app.post("/api/lead/capture", (req, res) => {
  const { name, email, source, territory, product } = req.body;
  const newLead = {
    id: "lead-" + Date.now(),
    name: name || "Captured Lead",
    email: email || "contact@example.com",
    phone: "+1 (416) 555-0192",
    source: source || "Ad Hook Ingestion",
    territory: territory || "Ontario (ON)",
    product: product || "Enterprise Growth Suite",
    score: 85,
    status: "New Lead",
    value: 12500,
    aiCallStatus: "Awaiting Call"
  };
  res.json(newLead);
});

// Route 12: Pre-sales Call Simulation
app.post("/api/presales/simulate-call", async (req, res) => {
  try {
    const { lead, companyProfile } = req.body;
    const client = getAiClient();
    const leadName = lead?.name || "Client";

    const fallbackSimulation = {
      callSummary: `AI Tele-calling Specialist (Sam) contacted ${leadName} to verify purchase intent, budget allocation, and implementation timeline. Lead confirmed active interest in marketing OS upgrade.`,
      qualificationOutcome: "Qualified Opportunity (Score: 92/100)",
      dialogue: [
        { speaker: "Sam (AI Pre-Sales Specialist)", text: `Hello! This is Sam from ${companyProfile?.companyName || "Sovereign Systems"} following up on your recent inquiry about our Marketing OS platform. Am I speaking with ${leadName}?` },
        { speaker: leadName, text: "Yes, hi Sam. Thanks for calling. We're looking to streamline our ad spend and scale qualified leads." },
        { speaker: "Sam (AI Pre-Sales Specialist)", text: "Excellent! Our platform automates ROAS tracking, lead scoring, and CASL compliance. What is your primary growth goal for the upcoming quarter?" },
        { speaker: leadName, text: "We want to cut our current CPA while increasing our conversion rate on B2B campaigns." },
        { speaker: "Sam (AI Pre-Sales Specialist)", text: "That aligns perfectly with our Growth Suite. I'll qualify this opportunity and schedule an executive demo with our growth team." }
      ]
    };

    if (!client) {
      return res.json(fallbackSimulation);
    }

    try {
      const prompt = `
        You are simulating an automated pre-sales phone call between Sam (AI Pre-Sales Specialist) and a new lead:
        Lead Name: ${leadName}
        Product Interest: ${lead?.product || "Enterprise Growth Suite"}
        Territory: ${lead?.territory || "Canada"}
        Company: ${companyProfile?.companyName || "Sovereign Business Brain"}

        Return strict JSON matching:
        {
          "callSummary": "Summary of the phone conversation",
          "qualificationOutcome": "Outcome status and score",
          "dialogue": [
            { "speaker": "Sam (AI Pre-Sales Specialist)", "text": "..." },
            { "speaker": "${leadName}", "text": "..." }
          ]
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.dialogue && parsed.callSummary) {
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("Call simulation AI fallback:", aiErr);
    }

    return res.json(fallbackSimulation);
  } catch (error: any) {
    console.error("Simulate Call API Error:", error);
    res.status(500).json({ error: error.message || "Failed to simulate call." });
  }
});

// Route 13: AI Campaign Generator
app.post("/api/gemini/generate-campaign", async (req, res) => {
  try {
    const { 
      productName, 
      targetAudience, 
      objective, 
      tone, 
      keyPoints, 
      budget, 
      platform, 
      companyProfile,
      contentSource,
      sourceDetails
    } = req.body;
    const client = getAiClient();
    const companyName = companyProfile?.companyName || "Sovereign Business Brain";
    const selectedSource = contentSource || "Corporate Memory & Brand Vault";

    const fallbackCampaign = {
      title: `${productName || "Growth Suite"} - ${objective || "Conversions"} Blitz`,
      overview: `Cross-channel AI generated campaign designed for ${targetAudience || "B2B Decision Makers"} to drive high-intent leads and maximum ROAS. Content knowledge extracted from ${selectedSource}${sourceDetails ? ` (${sourceDetails})` : ""}.`,
      contentSourceUsed: {
        sourceName: selectedSource,
        sourceDetails: sourceDetails || "Corporate Knowledge Vault & PIPEDA/CASL Compliance Rules",
        extractedElements: [
          "Core Product USPs & Value Propositions",
          "Brand Voice & High-Conversion Tone Parameters",
          "Audience ICP Demographics & Intent Signals",
          "Compliance & Double-Opt-In Requirements"
        ]
      },
      googleAds: {
        headlines: [
          `Scale ${productName || "Growth"} Fast`,
          `CASL Compliant ${productName || "Marketing"}`,
          `Get 3x ROAS with ${companyName}`
        ],
        descriptions: [
          `Automate customer acquisition with real-time lead attribution & AI workflow execution. Sourced from ${selectedSource}.`,
          `Book a live demo today and see how ${companyName} slashes CAC by 35%.`
        ]
      },
      metaAds: {
        headline: `Transform Your Growth Strategy with ${companyName}`,
        primaryText: `Stop burning budget on unverified leads. ${companyName}'s ${productName || "Marketing OS"} combines AI pre-sales qualification, real-time UTM tracking, and double-opt-in CASL compliance into one powerful dashboard.\n\n👉 Sourced via ${selectedSource}: Click below to claim your personalized growth audit.`,
        hook: `Are your ads driving clicks but no qualified demos?`,
        callToAction: "Learn More"
      },
      linkedInAds: {
        headline: `Enterprise Growth OS for Industry Leaders`,
        bodyText: `Decision makers at top enterprises use ${companyName} to streamline campaign approvals, monitor multi-touch ROAS, and automate lead scoring. Elevate your marketing ROI today with content engineered from ${selectedSource}.`,
        callToAction: "Request Demo"
      },
      tikTokAds: {
        headline: `Level Up Your Marketing Pipeline`,
        scriptHook: `Stop throwing ad dollars into a black hole! Here's how ${companyName} gets 3.8x ROAS with automated lead scoring.`,
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
        { platform: "Google Search Ads", percentage: 40, recommendedMonthlyAmount: Math.round((budget || 5000) * 0.40) },
        { platform: "Meta Ads (IG & FB)", percentage: 35, recommendedMonthlyAmount: Math.round((budget || 5000) * 0.35) },
        { platform: "LinkedIn Sponsored Content", percentage: 25, recommendedMonthlyAmount: Math.round((budget || 5000) * 0.25) }
      ],
      expectedKpis: {
        estimatedClicks: Math.round((budget || 5000) / 2.2),
        estimatedConversions: Math.round(((budget || 5000) / 2.2) * 0.082),
        projectedCPA: `$${((budget || 5000) / (((budget || 5000) / 2.2) * 0.082)).toFixed(2)}`,
        targetROAS: "3.8x"
      }
    };

    if (!client) {
      return res.json(fallbackCampaign);
    }

    try {
      const prompt = `
        You are an elite growth marketer and AI ad campaign strategist.
        Generate a complete multi-platform campaign package.
        
        CRITICAL KNOWLEDGE SOURCE CONTEXT:
        The content and messaging MUST be extracted and synthesized directly from the following Knowledge Source:
        - Source Name: ${selectedSource}
        - Source Specific Details / URL / Asset: ${sourceDetails || "Corporate Knowledge Base & Company Profile"}
        
        Campaign Inputs:
        - Product/Service Name: ${productName}
        - Target Audience: ${targetAudience}
        - Campaign Objective: ${objective}
        - Brand Tone: ${tone}
        - Key Selling Points: ${keyPoints}
        - Monthly Budget: $${budget}
        - Focus Platform: ${platform || "Cross-Platform"}
        - Company Context: ${JSON.stringify(companyProfile)}

        Return strict JSON only (no markdown wrapping) matching this schema:
        {
          "title": string,
          "overview": string,
          "contentSourceUsed": {
            "sourceName": string,
            "sourceDetails": string,
            "extractedElements": string[]
          },
          "googleAds": { "headlines": string[], "descriptions": string[] },
          "metaAds": { "headline": string, "primaryText": string, "hook": string, "callToAction": string },
          "linkedInAds": { "headline": string, "bodyText": string, "callToAction": string },
          "tikTokAds": { "headline": string, "scriptHook": string, "callToAction": string },
          "creativePrompts": string[],
          "audienceTargeting": { "demographics": string, "interests": string[], "jobTitles": string[] },
          "budgetAllocation": [ { "platform": string, "percentage": number, "recommendedMonthlyAmount": number } ],
          "expectedKpis": { "estimatedClicks": number, "estimatedConversions": number, "projectedCPA": string, "targetROAS": string }
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.title && parsed.googleAds && parsed.metaAds) {
        if (!parsed.contentSourceUsed) {
          parsed.contentSourceUsed = {
            sourceName: selectedSource,
            sourceDetails: sourceDetails || "Extracted from knowledge base",
            extractedElements: ["Brand Positioning", "Target Audience Demographics", "Core Product Features"]
          };
        }
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("AI Campaign Generation fallback:", aiErr);
    }

    return res.json(fallbackCampaign);
  } catch (error: any) {
    console.error("Generate Campaign API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI campaign package." });
  }
});

// Route 14: Ads Tracker & UTM Source Analysis AI Endpoint
app.post("/api/gemini/ads-analysis", async (req, res) => {
  try {
    const { utmData, selectedChannel, timeRange, companyProfile } = req.body;
    const client = getAiClient();

    const fallbackAnalysis = {
      executiveSummary: `Multi-channel paid campaign audit completed across active UTM sources. Top performing channel is **google / cpc** delivering 4.8x ROAS, followed by **linkedin / sponsored** at $42 CPA.`,
      sourceBreakdownAnalysis: [
        { source: "google / cpc", status: "Scaling", recommendation: "Increase budget allocation by 25%. Search intent keywords show 12.4% conversion rate." },
        { source: "meta / instagram_reels", status: "Healthy", recommendation: "Refresh ad creative visual hooks to lower CPM and sustain 3.2x ROAS." },
        { source: "linkedin / sponsored", status: "High Intent", recommendation: "Ideal for enterprise decision-maker capture. Maintain current targeting parameters." },
        { source: "tiktok / feed_video", status: "Testing", recommendation: "Monitor CPA threshold; re-evaluate video hooks if CTR drops below 1.5%." }
      ],
      attributionInsight: "Multi-touch attribution indicates 64% of high-scoring B2B leads touch Meta video ads first before converting via Google Search exact-match keywords.",
      budgetReallocationPlan: [
        "Reallocate $1,200/mo from low-performing display placements into Google Search exact-match terms.",
        "Deploy automated AI tele-calling qualification on Meta form leads to raise lead-to-opportunity conversion by 18%."
      ],
      projectedRoasUplift: "+22%"
    };

    if (!client) {
      return res.json(fallbackAnalysis);
    }

    try {
      const prompt = `
        You are a principal ad performance & attribution strategist.
        Analyze the following UTM source & ad campaign performance dataset:
        UTM Data: ${JSON.stringify(utmData)}
        Selected Channel Filter: ${selectedChannel || "All Channels"}
        Time Range: ${timeRange || "30 Days"}
        Company Context: ${JSON.stringify(companyProfile)}

        Return strict JSON only (no code fence):
        {
          "executiveSummary": string,
          "sourceBreakdownAnalysis": [ { "source": string, "status": string, "recommendation": string } ],
          "attributionInsight": string,
          "budgetReallocationPlan": string[],
          "projectedRoasUplift": string
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.executiveSummary && parsed.sourceBreakdownAnalysis) {
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("Ads analysis AI fallback:", aiErr);
    }

    return res.json(fallbackAnalysis);
  } catch (error: any) {
    console.error("Ads Analysis API Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute ad performance analysis." });
  }
});

// Route 15: Custom AI Agent Test Execution Endpoint
app.post("/api/agent/run-test", async (req, res) => {
  try {
    const { agent, prompt: userQuery, companyProfile } = req.body;
    const client = getAiClient();
    const agentName = agent?.name || "Custom AI Agent";
    const systemPrompt = agent?.systemPrompt || "You are a helpful AI assistant.";
    const query = userQuery || "Execute your primary objective and generate a sample output.";

    if (!client) {
      // Local Fallback Execution when Gemini API key is not configured
      let output = `### 🤖 ${agentName} (Local Execution Mode)\n\n`;
      output += `*Note: To execute this custom agent with real-time generative AI, add your **GEMINI_API_KEY** under Settings > Secrets.*\n\n`;
      output += `**Agent Persona & System Rules:**\n> "${systemPrompt}"\n\n`;
      output += `**Input Execution Query:** "${query}"\n\n`;
      output += `---\n\n`;
      output += `#### 📋 Agent Task Execution Output:\n`;

      const cat = (agent?.category || "").toLowerCase();
      const promptLower = (systemPrompt + " " + query).toLowerCase();

      if (promptLower.includes("legal") || promptLower.includes("accountant") || cat.includes("compliance")) {
        output += `1. **CASL & PIPEDA Legal Audit**: Validated opt-in consent checkboxes, timestamping protocols, and physical mailing address footers.\n`;
        output += `2. **Compliance Verification**: All marketing automated emails pass 100% Canadian anti-spam law (CASL) double opt-in requirements.\n`;
        output += `3. **Executive Action**: Generated zero-risk audit logs and submitted compliance verification report to CEO.`;
      } else if (promptLower.includes("real estate") || promptLower.includes("mls") || cat.includes("marketing")) {
        output += `1. **MLS High-Converting Headline**: *"Toronto Penthouse Luxury - Unobstructed Waterfront Views & Custom Finishes"*\n`;
        output += `2. **Instagram Reel Script**: *"Looking for Toronto's finest luxury living? Step inside this 2,800 sq.ft penthouse featuring private elevator entry, marble finishes, and panoramic lake views."*\n`;
        output += `3. **Target Buyer Email Drip**: Drafted 3-part exclusive buyer preview invitation targeting qualified high-net-worth GTA investors.`;
      } else {
        output += `1. **Task Processing**: Analyzed input query against system instructions and corporate memory.\n`;
        output += `2. **Strategic Output**: Generated optimized execution recommendations tailored for ${companyProfile?.companyName || "Sovereign Enterprise"}.\n`;
        output += `3. **Operational Directive**: Workflow completed successfully with 100% confidence rating.`;
      }

      return res.json({ output, text: output, isFallback: true });
    }

    // AI Execution via Gemini API
    const systemInstruction = `
      You are "${agentName}", an expert custom AI agent.
      Your System Instructions and Identity Rules:
      ${systemPrompt}

      Adopt this exact persona and follow all system instructions strictly.
      Provide a comprehensive, professional execution response in clean markdown format.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\nTask/Query from User:\n${query}` }] }
      ]
    });

    const outputText = response.text || "Agent executed task successfully.";
    res.json({ output: outputText, text: outputText, isFallback: false });
  } catch (error: any) {
    console.error("Agent Test Execution API Error:", error);
    res.status(500).json({ error: error.message || "Failed to execute agent test." });
  }
});

// Alias for legacy campaign ideas endpoint
app.post("/api/generate-campaign-ideas", async (req, res) => {
  req.url = "/api/agent/run-test";
  return app._router.handle(req, res, () => {});
});

// Serve static React files and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MarketingOS backend running on http://localhost:${PORT}`);
  });
}

startServer();
