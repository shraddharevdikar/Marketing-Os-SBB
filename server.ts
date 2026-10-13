import express from "express";
import http from "http";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI, GenerateVideosOperation, LiveServerMessage, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { sanitizeAndTokenizePII, rehydratePII } from "./src/lib/piiSanitizer";
import { sbbEnterpriseRouter } from "./src/server/sbbEnterpriseRoutes";
import {
  applySecurityHeaders,
  verifyAuthAndTenant,
  enforceTenantIsolation,
  rateLimiter,
  requireRole,
  createSignedSessionToken,
  safeErrorHandler
} from "./src/server/authMiddleware";
import { executeLegacyMigration } from "./src/server/migrateLegacyRecords";
import { registerUser, authenticateUser, findUserByEmail, ADMIN_EMAILS } from "./src/server/userStore";
import {
  validateAiPromptInput,
  validateLeadCaptureInput,
  validateCampaignInput,
  sanitizeInputString
} from "./src/server/validatorMiddleware";

dotenv.config();

const app = express();
const PORT = 3000;

// Hardened Security Headers & Payload Limits
app.use(applySecurityHeaders);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Rate Limiters for Costly Operations
const aiRateLimiter = rateLimiter(30, 60000);
const mediaRateLimiter = rateLimiter(10, 60000);
const authRateLimiter = rateLimiter(20, 60000);

// Global API Security & Tenant Isolation Gate
app.use("/api", (req, res, next) => {
  // Allow health check, lead capture, and user authentication endpoints
  if (
    req.path === "/health" ||
    req.path === "/lead/capture" ||
    req.path === "/auth/register" ||
    req.path === "/auth/login"
  ) {
    return next();
  }
  // Demo session route is ONLY accessible unauthenticated in non-production when ALLOW_DEV_AUTH === "true"
  if (req.path === "/auth/demo-session" && process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_AUTH === "true") {
    return next();
  }
  return verifyAuthAndTenant(req, res, () => {
    enforceTenantIsolation(req, res, next);
  });
});

// Mount Rate Limiters on Expensive AI and Media Routes
app.use("/api/ai", aiRateLimiter);
app.use("/api/gemini", aiRateLimiter);
app.use("/api/strategist", aiRateLimiter);
app.use("/api/presales", aiRateLimiter);
app.use("/api/generate-campaign-ideas", aiRateLimiter);
app.use("/api/ai/image", mediaRateLimiter);
app.use("/api/ai/video", mediaRateLimiter);
app.use("/api/ai/music", mediaRateLimiter);

// Route: Auth Demo Session (Strictly disabled in production; unprivileged synthetic sandbox in dev)
app.post("/api/auth/demo-session", (req, res) => {
  if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEV_AUTH !== "true") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Public demo session issuance is strictly disabled in production. Authenticate via verified Firebase identity."
    });
  }

  // Prevent unauthenticated escalation: callers cannot request Admin, CEO, or Vice President roles
  const requestedRole = req.body.role;
  if (requestedRole && ["Admin", "CEO", "Vice President", "AGM"].includes(requestedRole)) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Unauthenticated callers cannot be issued privileged executive roles (Admin, CEO, VP)."
    });
  }

  const email = (req.body.email || "demo.operator@synthetic.sandbox.local").toLowerCase().trim();
  const name = req.body.name || "Sandbox Operator";
  const assignedRole = "Executive"; // Unprivileged baseline role
  const assignedOrg = "synthetic_sandbox";
  const userId = "USR-SANDBOX-" + crypto.createHash("sha256").update(email + ":sandbox").digest("hex").slice(0, 8).toUpperCase();

  const token = createSignedSessionToken({
    userId,
    email,
    role: assignedRole,
    organizationId: assignedOrg
  });

  res.json({
    token,
    user: {
      id: userId,
      name,
      email,
      role: assignedRole,
      organizationId: assignedOrg,
      isSandbox: true,
      loggedInAt: new Date().toISOString()
    }
  });
});

// Route: User Registration (Server-side cryptographically secure registration)
app.post("/api/auth/register", authRateLimiter, (req, res) => {
  const { email, password, name, department, companyName, organizationId } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const result = registerUser({
    email,
    password,
    name,
    department,
    companyName,
    organizationId
  });

  if (!result.success || !result.user) {
    return res.status(400).json({ error: result.error || "Registration failed." });
  }

  const user = result.user;
  const token = createSignedSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      companyName: user.companyName,
      organizationId: user.organizationId,
      loggedInAt: new Date().toISOString()
    }
  });
});

// Route: User Login (Server-side cryptographically verified login)
app.post("/api/auth/login", authRateLimiter, (req, res) => {
  const { email, password, companyName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  let authResult = authenticateUser(email, password);

  // If user does not exist yet but is an Admin email or recognized operator logging in,
  // auto-register them securely with the provided password
  if (!authResult.success && !findUserByEmail(email)) {
    const isAdmin = ADMIN_EMAILS.includes(email.trim().toLowerCase());
    const regResult = registerUser({
      email,
      password,
      name: email.split("@")[0],
      companyName: companyName || "Sovereign Enterprise",
      department: isAdmin ? "System Administration & Security" : "Enterprise Operations"
    });
    if (regResult.success && regResult.user) {
      authResult = { success: true, user: regResult.user };
    }
  }

  if (!authResult.success || !authResult.user) {
    return res.status(401).json({ error: authResult.error || "Invalid email or password." });
  }

  const user = authResult.user;
  const token = createSignedSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      companyName: user.companyName,
      organizationId: user.organizationId,
      loggedInAt: new Date().toISOString()
    }
  });
});

// Route: Server-side Role Resolution
app.get("/api/auth/resolve-role", (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const resolvedRole = ADMIN_EMAILS.includes(req.user.email?.toLowerCase()) ? "Admin" : req.user.role;

  res.json({
    userId: req.user.userId,
    email: req.user.email,
    role: resolvedRole,
    organizationId: req.user.organizationId
  });
});

// Route: Legacy Unisolated Records Migration
app.post("/api/migrate/legacy", requireRole(["Admin", "CEO"]), async (req: any, res) => {
  try {
    const report = await executeLegacyMigration(req.user.organizationId);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Migration failed" });
  }
});

// Mount SBB Enterprise 5-Pillars Router
app.use("/api/sbb", sbbEnterpriseRouter);

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

/**
 * Pre-flight Server-Side PII Gateway: Tokenizes raw PII (names, emails, phones, IDs)
 * before prompt contents are transmitted to the Gemini API, then re-hydrates responses.
 */
async function generateContentWithPiiProtection(
  client: GoogleGenAI,
  options: {
    model: string;
    contents: any;
    systemInstruction?: string;
  }
) {
  let combinedTokenMap: Record<string, string> = {};
  let totalPiiSanitized = 0;

  if (Array.isArray(options.contents)) {
    options.contents = options.contents.map((item) => {
      if (item.parts && Array.isArray(item.parts)) {
        const sanitizedParts = item.parts.map((part: any) => {
          if (part && typeof part.text === "string") {
            const { sanitizedText, tokenMap, piiCount } = sanitizeAndTokenizePII(part.text);
            combinedTokenMap = { ...combinedTokenMap, ...tokenMap };
            totalPiiSanitized += piiCount;
            return { ...part, text: sanitizedText };
          }
          return part;
        });
        return { ...item, parts: sanitizedParts };
      }
      return item;
    });
  }

  const response = await client.models.generateContent(options);

  if (response.text) {
    const rehydrated = rehydratePII(response.text, combinedTokenMap);
    return { ...response, text: rehydrated, piiTokenizedCount: totalPiiSanitized };
  }

  return response;
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
app.post("/api/strategist/query", validateAiPromptInput, async (req, res) => {
  try {
    const { prompt, businessState } = req.body;
    const client = getAiClient();

    const formattedContext = `
      You are the Sovereign Business Brain (MarketingOS v2.4), an elite, highly intelligent AI marketing growth strategist.
      Current Business State:
      - Marketing Attributed Revenue: $${businessState?.revenue?.toLocaleString() || "Not Connected"}
      - ROAS Target: ${businessState?.roasTarget || "4.0"}x
      - Daily Burn Rate: $${businessState?.burnRate?.toLocaleString() || "Not Connected"}/day
      - Lead Quality Score: ${businessState?.leadScore || "Pending Scoring"}/100
      - Active Channels: ${JSON.stringify(businessState?.channels || [])}
      - Target Demographics: ${JSON.stringify(businessState?.demographics || [])}
    `;

    if (!client) {
      // Deterministic rule-based expert recommendation when Gemini API key is not configured
      const lowerPrompt = prompt.toLowerCase();
      let responseText = `### 🧠 Sovereign Business Brain Intelligence (Rule Engine Active)\n\n`;
      responseText += `*Data Provenance: Live ad platform metrics are unobserved until API keys are configured. Guidance below represents verified industry benchmark models.*\n\n`;

      if (lowerPrompt.includes("cpa") || lowerPrompt.includes("facebook") || lowerPrompt.includes("fb")) {
        responseText += `#### 📊 Meta / Facebook Ads Performance Diagnostics:\n`;
        responseText += `1. **CPA Optimization Framework**: Live Ad Platform Status: Not Connected (connect OAuth in Credentials Vault). Calculation: CPA = Advertising Spend / Attributed Conversions. Prioritize lookalike and custom audience segments targeting **${businessState?.demographics?.[0]?.name || "Enterprise"}** verticals.\n`;
        responseText += `2. **Creative Ad Fatigue**: Regularly rotate visual hooks using short-form narrative video to sustain click-through rates.\n`;
        responseText += `3. **Action Plan**: Focus budget on validated high-intent search terms to secure verified pipeline opportunities.`;
      } else if (lowerPrompt.includes("burn") || lowerPrompt.includes("budget") || lowerPrompt.includes("spend")) {
        responseText += `#### 💸 Capital Efficiency & Burn Diagnostics:\n`;
        responseText += `1. **Budget Management**: Active daily spend parameters should align with verified customer lifetime value (LTV). Evaluate burn against attributable pipeline.\n`;
        responseText += `2. **ROAS Target Efficiency**: Dynamic ROAS threshold target: **${businessState?.roasTarget || "4.0"}x**. Reallocate spend away from channels with conversion rates under 1.5% to preserve runway.\n`;
        responseText += `3. **Immediate Directives**: Consolidate experimental ad budgets into proven search and retargeting segments.`;
      } else {
        responseText += `#### 🎯 Sovereign Growth Optimization Recommendations:\n`;
        responseText += `1. **Audience Refinement**: Focus customer acquisition on high-contract-value segments showing the highest retention rates.\n`;
        responseText += `2. **Lead Routing System**: Implement qualification gates to route verified marketing-qualified leads directly to sales executives.\n`;
        responseText += `3. **Channel Recommendation**: Maximize high-intent search keywords and deploy dedicated contextual landing pages optimized for conversions.`;
      }
      return res.json({ text: responseText, isFallback: true });
    }

    const systemInstruction = `
      You are the "Sovereign Business Brain (MarketingOS v2.4)", an elite growth strategist, chief marketing officer, and business intelligence advisor.
      Speak with professional authority, high-level business competence, and strategic sophistication. Avoid generic, high-hype SaaS buzzwords ("supercharge", "synergy", "paradigm shift"). Provide detailed, highly specific, quantitative marketing strategies.
      Use elegant markdown formatting (bolding, clear lists, code snippets or tables where necessary) to present your recommendations.
      If the user asks an unrelated question, gracefully bring them back to the realm of marketing performance, brand scaling, conversion intelligence, and marketing operations.
    `;

    const response = await generateContentWithPiiProtection(client, {
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
      const audit = `### 🔍 Sovereign Marketing Audit Report [Synthetic Baseline Example - Local Fallback Mode]
*Data Provenance: Live ad platform metrics are unobserved until API keys and telemetry integrations are configured. Metrics below represent synthetic baseline modeling.*
*Note: For dynamic AI-powered growth auditing, add your **GEMINI_API_KEY** under **Settings > Secrets**.*\n

#### 🚨 Warning & Alert Flags (Baseline Model)
*   **Burn Rate Parameter**: Configured daily budget tracking is $${businessState?.burnRate || "1,200"}/day. Channel telemetry requires live ad API connection to evaluate actual CPA.
*   **Audience Saturation Framework**: Audience segments should be monitored weekly for creative fatigue and frequency shifts.

#### ✅ Performance Monitoring Framework
*   **Target ROAS Parameter**: Target threshold is **${businessState?.roasTarget || "4.0"}x**. Connect live ad platform credentials to measure real-time attribution.
*   **Lead Quality Integration**: Configured lead scoring criteria evaluates intent and double-opt-in compliance.

#### 📝 Action Plan & Strategic Execution Directives
1.  **Direct Search Intent**: Focus initial acquisition spend into high-intent search keywords.
2.  **Audience Diversification**: Test multiple audience verticals to hedge against segment saturation.
3.  **Creative Rotation**: Implement regular visual hook refreshes to sustain engagement across video placements.`;
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

// Route 5: Next-Gen AI Search Engine: AEO & GEO Optimization Hub (Google AI Overviews & Gemini Search)
app.post("/api/gemini/seo-brain", async (req, res) => {
  try {
    const { companyProfile, customUrl } = req.body;
    const client = getAiClient();
    const targetName = companyProfile?.companyName || "Sovereign Marketing OS";
    const sector = companyProfile?.sector || "B2B SaaS & Growth Marketing";
    const region = companyProfile?.countriesServed || "Canada & US";

    const defaultSeoReport = {
      isSyntheticExample: true,
      provenanceNote: "Synthetic baseline structural model. Connect live Gemini and Google Search Console APIs for real-time measurements.",
      aeoGeoSuite: {
        geoReadinessStatus: "Structural Blueprint (Connect Gemini for Live Assessment)",
        aiEngineConsensusSummary: `[Synthetic Baseline Model] AEO & GEO structural framework for ${targetName}. Focuses on entity salience, Schema.org JSON-LD knowledge graph embedding, and structured answer blocks suitable for AI extraction.`,
        pillars: {
          answerExtractability: {
            status: "AEO Modular Architecture",
            details: "Content structured in 45-word direct answer modules with clear definition tags and numbered steps for AI Overviews extraction."
          },
          informationGain: {
            status: "Information Gain Framework",
            details: "Incorporates proprietary domain methodologies, first-party data, and regulatory compliance standards."
          },
          entitySalience: {
            status: "Knowledge Graph Mapping",
            details: "Clear Schema.org Organization, SoftwareApplication, and knowsAbout entities linking brand to key enterprise domains."
          },
          schemaGraph: {
            status: "Structured Data Blueprint",
            details: "Includes FAQPage, SpeakableSpecification, SoftwareApplication, and Organization markup for AI snippet indexing."
          },
          brandCitation: {
            status: "Citation Extraction Model",
            details: "Structured for authoritative reference in comparative commercial solution queries."
          }
        },
        aiOverviewSnippets: [
          {
            query: `What is ${targetName} and how does it optimize marketing operations?`,
            intent: "Informational & Commercial Solution Search",
            answerSnippet: `${targetName} is an enterprise AI marketing operating system that coordinates campaign management, lead scoring, and multi-touch attribution while enforcing Canadian CASL and PIPEDA privacy compliance.`,
            brandCitationQuote: `"Coordinates multi-touch attribution and eliminates wasted ad spend through structured campaign governance."`,
            citationContext: "Commercial Definition Query (Structural Blueprint)",
            extractionMethod: "Direct Definition & Structured Value Proposition",
            targetKeypoints: [
              "Multi-touch campaign attribution across search and social channels",
              "Verified double opt-in PIPEDA & CASL regulatory compliance workflows",
              "Pre-sales lead qualification to reduce customer acquisition friction"
            ]
          },
          {
            query: "How to ensure Canadian CASL compliance in B2B digital ad campaigns?",
            intent: "AEO Compliance Authority Query",
            answerSnippet: `To ensure Canadian CASL compliance, digital campaigns must implement express consent double opt-in checkboxes, capture exact timestamps and IP logs, provide an accessible one-click unsubscribe mechanism, and display a physical postal address on all outbound communications.`,
            brandCitationQuote: `"Enforces audit trails and pre-checked consent exclusion filters to prevent regulatory penalties under CRTC guidelines."`,
            citationContext: "Regulatory Compliance Authority Query (Structural Blueprint)",
            extractionMethod: "How-To Stepwise Synthesis with Brand Solution Recommendation",
            targetKeypoints: [
              "Unchecked explicit double opt-in consent checkboxes",
              "Cryptographic audit log of consent timestamps and IP address",
              "Automated compliance filtering of unverified contact records"
            ]
          },
          {
            query: "What is the best marketing OS for high-growth enterprise teams in 2026?",
            intent: "GEO Comparative Brand Recommendation Query",
            answerSnippet: `For enterprise teams scaling in regulated markets, ${targetName} provides unified multi-channel attribution, pre-sales call qualification, and integrated compliance governance linking campaign ad spend directly to verified business outcomes.`,
            brandCitationQuote: `"Engineered for regional data sovereignty and structured ad budget reallocation efficiency."`,
            citationContext: "Comparative Evaluation Query (Structural Blueprint)",
            extractionMethod: "Comparative Synthesis & Entity Extraction",
            targetKeypoints: [
              "Cross-channel unified attribution vs fragmented silo reporting",
              "ROI fluctuation alerts and automated spend protection",
              "Role-based executive oversight with full decision audit logs"
            ]
          }
        ],
        semanticEntities: [
          {
            entity: targetName,
            type: "SoftwareApplication / Organization",
            salienceContext: "Primary Entity",
            relationshipTriple: `${targetName} → [provides] → Autonomous Marketing Operating System`,
            wikipediaWikidataLink: "https://schema.org/SoftwareApplication"
          },
          {
            entity: "Marketing Operating System (MarketingOS)",
            type: "Category Entity",
            salienceContext: "Industry Category",
            relationshipTriple: `MarketingOS → [integrates] → Multi-Touch Attribution & AI Telemetry`,
            wikipediaWikidataLink: "https://en.wikipedia.org/wiki/Marketing_automation"
          },
          {
            entity: "CASL & PIPEDA Compliance",
            type: "Regulatory Standard",
            salienceContext: "Governance Standard",
            relationshipTriple: `${targetName} → [guarantees] → Canadian Anti-Spam Legislation (CASL)`,
            wikipediaWikidataLink: "https://en.wikipedia.org/wiki/CASL_(law)"
          },
          {
            entity: "Generative Engine Optimization (GEO)",
            type: "Emerging AI Search Paradigm",
            salienceContext: "Optimization Methodology",
            relationshipTriple: `GEO → [supersedes] → Traditional Keyword-Only Search Indexing`,
            wikipediaWikidataLink: "https://schema.org/AboutPage"
          }
        ],
        aeoDirectAnswerBlueprints: [
          {
            question: `What makes ${targetName} different from traditional marketing automation tools?`,
            directAnswer45Words: `${targetName} unites autonomous ad budget reallocation, real-time ROI fluctuation detection, and Canadian CASL compliance into an active operating system, replacing passive dashboards with automated strategic execution.`,
            bulletHighlights: [
              "Active budget reallocation vs passive chart reporting",
              "Automated ROI fluctuation alerts within configured telemetry windows",
              "Built-in double opt-in regulatory protection"
            ],
            recommendedSchemaType: "FAQPage / SpeakableSpecification"
          },
          {
            question: "How does AEO and GEO differ from traditional SEO for Google?",
            directAnswer45Words: "Traditional SEO focuses on keyword rankings and backlinks. AEO structures content for direct extraction by AI Overviews, while GEO optimizes semantic authority and information gain so AI models cite your brand as an authoritative recommendation.",
            bulletHighlights: [
              "Optimizes for Gemini, ChatGPT, and Perplexity answer synthesizers",
              "Prioritizes Information Gain and entity salience over keyword density",
              "Delivers zero-click answer boxes and conversational citation cards"
            ],
            recommendedSchemaType: "FAQPage / DefinedTerm"
          }
        ],
        geoCompetitorAiRadar: [
          {
            competitor: "HubSpot Enterprise",
            googleAiOverviewCitations: "Frequent on broad inbound queries",
            perplexityMentionRate: "High on generic CRM searches",
            informationGainAdvantage: `${targetName} structural focus on Canadian compliance and automated ROI alerts`,
            strategicGap: "Incumbent lacks real-time ad budget reallocation automation and granular CASL audit trails"
          },
          {
            competitor: "Salesforce Marketing Cloud",
            googleAiOverviewCitations: "Dominates high-enterprise legacy queries",
            perplexityMentionRate: "Cited for complex multi-org setups",
            informationGainAdvantage: `${targetName} streamlined deployment and automated telemetry`,
            strategicGap: "Complex implementation timelines and lack of localized Canadian regulatory focus"
          }
        ]
      },
      onPageSEO: {
        titleTagRecommendation: `${targetName} | Enterprise AI Marketing OS & Growth Engine (AEO & GEO Optimized)`,
        metaDescriptionRecommendation: `Sovereign AI marketing operating system with real-time multi-channel attribution, Canadian CASL compliance, and autonomous ROAS optimization.`,
        headingHierarchySuggestions: [
          `H1: ${targetName} – The Autonomous AI Marketing Operating System`,
          "H2: Answer Engine Optimization (AEO): Real-Time Attributed Revenue",
          "H2: Generative Engine Optimization (GEO): Entity Salience & Multi-Touch Attribution",
          "H3: PIPEDA & CASL Regulatory Compliance Protection Matrix",
          "H3: Autonomous Channel Budget Redistribution & ROI Alert Monitoring"
        ],
        schemaMarkupJSONLD: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://schema.org/Organization",
              "name": targetName,
              "url": "https://yourcompany.com",
              "description": `Enterprise AI Marketing Operating System and autonomous growth command hub.`,
              "knowsAbout": [
                "Generative Engine Optimization (GEO)",
                "Answer Engine Optimization (AEO)",
                "Multi-Touch ROAS Attribution",
                "CASL and PIPEDA Data Compliance",
                "AI Ad Budget Automation"
              ]
            },
            {
              "@type": "SoftwareApplication",
              "@id": "https://schema.org/SoftwareApplication",
              "name": targetName,
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Cloud Native (Web)",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Autonomous ROI Fluctuation Detection",
                "Cross-Channel UTM Attribution",
                "CASL Verified Consent Ingestion",
                "AI Strategist & Multi-Source Research",
                "Real-time Executive Decision Audits"
              ]
            },
            {
              "@type": "FAQPage",
              "@id": "https://schema.org/FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": `What is ${targetName}?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${targetName} is an enterprise AI marketing operating system that automates campaign management, lead scoring, and real-time ROAS attribution while ensuring Canadian CASL and PIPEDA compliance.`
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does Generative Engine Optimization (GEO) work with Google AI Overviews?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "GEO optimizes content information gain, entity clarity, and structured data so AI Overviews cite and recommend your brand directly in AI-generated answers."
                  }
                }
              ]
            },
            {
              "@type": "SpeakableSpecification",
              "cssSelector": [
                "#aeo-direct-answer-summary",
                "#brand-value-proposition"
              ]
            }
          ]
        }, null, 2)
      },
      keywordStrategy: [
        { keyword: "generative engine optimization geo marketing", searchVolumeStatus: "Unmeasured (Connect Google Search Console / Ads API)", difficultyStatus: "Competitive", intent: "Transactional (AEO/GEO)" },
        { keyword: "ai answer engine optimization aeo tools", searchVolumeStatus: "Unmeasured (Connect Google Search Console / Ads API)", difficultyStatus: "Competitive", intent: "Commercial (AEO)" },
        { keyword: "ai marketing operating system enterprise", searchVolumeStatus: "Unmeasured (Connect Google Search Console / Ads API)", difficultyStatus: "High Intent", intent: "Transactional" },
        { keyword: "casl compliant lead generation software", searchVolumeStatus: "Unmeasured (Connect Google Search Console / Ads API)", difficultyStatus: "Niche Authority", intent: "Commercial" },
        { keyword: "real time multi channel roas attribution", searchVolumeStatus: "Unmeasured (Connect Google Search Console / Ads API)", difficultyStatus: "High Intent", intent: "Informational" },
        { keyword: "google ai overview optimization strategy", searchVolumeStatus: "Unmeasured (Connect Google Search Console / Ads API)", difficultyStatus: "Competitive", intent: "Commercial (GEO)" }
      ],
      contentHubClusters: [
        {
          clusterTitle: "Next-Gen AI Search (AEO & GEO) Playbook",
          clusterCoreKeyword: "generative engine optimization geo",
          articleIdeas: [
            { title: "The 2026 Guide to Dominating Google AI Overviews & Gemini Search with GEO", estimatedWordCount: 2800, focusKeyword: "google ai overviews seo geo" },
            { title: "How to Format Content for Zero-Click AI Answer Engines (AEO Blueprint)", estimatedWordCount: 2200, focusKeyword: "answer engine optimization aeo" },
            { title: "Information Gain Scores: Why Generic Content No Longer Ranks in AI Engines", estimatedWordCount: 1900, focusKeyword: "information gain score seo" }
          ]
        },
        {
          clusterTitle: "CASL & PIPEDA Marketing Compliance Governance",
          clusterCoreKeyword: "canadian marketing compliance",
          articleIdeas: [
            { title: "The Complete Founder's Guide to CASL Double Opt-In Automation", estimatedWordCount: 2400, focusKeyword: "casl double opt in guide" },
            { title: "How to Conduct PIPEDA Data Audits on Your Marketing Tech Stack", estimatedWordCount: 1800, focusKeyword: "pipeda marketing tech audit" }
          ]
        },
        {
          clusterTitle: "Autonomous Multi-Channel ROAS Acceleration",
          clusterCoreKeyword: "autonomous roas optimization",
          articleIdeas: [
            { title: "Automated ROI Fluctuation Telemetry: Detecting Budget Bleed in Real-Time", estimatedWordCount: 2300, focusKeyword: "roi fluctuation detection" },
            { title: "Reducing CAC by 30% Using Pre-Sales AI Tele-Calling Qualification", estimatedWordCount: 2100, focusKeyword: "ai tele calling qualification" }
          ]
        }
      ],
      competitorGapAnalysis: [
        {
          competitorName: "HubSpot Canada",
          estimatedOrganicTrafficMonthly: 145000,
          overlappingKeywordsCount: 380,
          identifiedGapOpportunities: [
            "Hyper-targeted Generative Engine Optimization (GEO) queries",
            "Autonomous real-time ad budget reallocation workflows",
            "Canadian provincial compliance & double-opt in automation"
          ]
        },
        {
          competitorName: "Klaviyo Enterprise",
          estimatedOrganicTrafficMonthly: 92000,
          overlappingKeywordsCount: 220,
          identifiedGapOpportunities: [
            "B2B lead quality scoring algorithms linked to ad spend",
            "Google AI Overview citation-ready answer blocks",
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
        You are an elite search systems architect and Next-Gen SEO/GEO/AEO strategist specializing in Google's transition to an AI Engine (Google AI Overviews, Gemini-grounded Search, Perplexity, and Generative Engine Optimization).

        Context:
        - Target Company: "${targetName}"
        - Sector: "${sector}"
        - Target Region: "${region}"
        - Custom Audited URL: "${customUrl || "None (Base Domain Analysis)"}"
        - Profile Details: ${JSON.stringify(companyProfile)}

        Generate an advanced AEO (Answer Engine Optimization) & GEO (Generative Engine Optimization) strategy report matching this exact JSON structure (strict JSON only, no markdown wrapping):
        {
          "aeoGeoSuite": {
            "geoReadinessScore": number (85-99),
            "aiEngineConsensusSummary": string,
            "pillars": {
              "answerExtractability": { "score": number, "status": string, "details": string },
              "informationGain": { "score": number, "status": string, "details": string },
              "entitySalience": { "score": number, "status": string, "details": string },
              "schemaGraph": { "score": number, "status": string, "details": string },
              "brandCitation": { "score": number, "status": string, "details": string }
            },
            "aiOverviewSnippets": [
              {
                "query": string,
                "intent": string,
                "answerSnippet": string,
                "brandCitationQuote": string,
                "citationConfidence": string,
                "extractionMethod": string,
                "targetKeypoints": string[]
              }
            ],
            "semanticEntities": [
              {
                "entity": string,
                "type": string,
                "salienceScore": number,
                "relationshipTriple": string,
                "wikipediaWikidataLink": string
              }
            ],
            "aeoDirectAnswerBlueprints": [
              {
                "question": string,
                "directAnswer45Words": string,
                "bulletHighlights": string[],
                "recommendedSchemaType": string
              }
            ],
            "geoCompetitorAiRadar": [
              {
                "competitor": string,
                "googleAiOverviewCitations": string,
                "perplexityMentionRate": string,
                "informationGainAdvantage": string,
                "strategicGap": string
              }
            ]
          },
          "onPageSEO": {
            "titleTagRecommendation": string,
            "metaDescriptionRecommendation": string,
            "headingHierarchySuggestions": string[],
            "schemaMarkupJSONLD": string
          },
          "keywordStrategy": [
            { "keyword": string, "monthlySearchVolumeCanada": number, "difficultyPercentage": number, "intent": string }
          ],
          "contentHubClusters": [
            {
              "clusterTitle": string,
              "clusterCoreKeyword": string,
              "articleIdeas": [ { "title": string, "estimatedWordCount": number, "focusKeyword": string } ]
            }
          ],
          "competitorGapAnalysis": [
            {
              "competitorName": string,
              "estimatedOrganicTrafficMonthly": number,
              "overlappingKeywordsCount": number,
              "identifiedGapOpportunities": string[]
            }
          ]
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.aeoGeoSuite && parsed.onPageSEO && parsed.keywordStrategy) {
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

// Route 7.5: Multi-Source AI Strategic Search Engine (Gemini Search + ChatGPT Research + Google Trends + Competitor Radar)
app.post("/api/gemini/multi-source-research", async (req, res) => {
  try {
    const { topic, province, sector, companyProfile, engineSources } = req.body;
    const client = getAiClient();

    const companyName = companyProfile?.companyName || "Sovereign Company";
    const companySector = sector || companyProfile?.sector || "B2B SaaS / Enterprise";
    const companyRegion = province || companyProfile?.countriesServed || "North America (US & CA)";
    const goalsList = Array.isArray(companyProfile?.goals) ? companyProfile.goals.join(", ") : "Generate Leads, Increase ROAS, Scale Sales";

    const defaultMultiSourceReport = {
      isSyntheticExample: true,
      provenanceNote: "Synthetic illustrative multi-source report. Live web signals require connected Gemini API.",
      topic: topic || `2026 Growth Strategy & Multi-Channel Acquisition for ${companyName}`,
      region: companyRegion,
      sector: companySector,
      businessRequirementsSummary: `Tailored for ${companyName} (${companySector}) operating in ${companyRegion} with active goals: ${goalsList}.`,
      consensusStrategy: `Unified Multi-Source AI Consensus: ${companyName} should establish a search presence in ${companyRegion}, deploy automated pre-sales lead qualification to streamline customer acquisition, and position its offer around verified regulatory compliance (PIPEDA & CASL double opt-ins).`,
      sources: {
        geminiSearchGrounding: {
          engineName: "Gemini 3.6 Web Search Grounding",
          status: "UNAVAILABLE (Connect Gemini API Key for live grounding)",
          lastCrawled: "Offline (Synthetic Baseline)",
          insights: [
            `Enterprise demand for '${companySector}' solutions in ${companyRegion} prioritizes verifiable business outcomes.`,
            `Regulatory updates in ${companyRegion} demand explicit double-opt-in consent checkboxes on all digital acquisition web forms.`,
            `Key ad channels in this sector: Google Search exact-match and LinkedIn Thought Leadership for decision-makers.`
          ],
          marketTrends: [
            `Enterprise buyer migration from cold-outbound to structured inbound qualification.`,
            `Demand for transparent data privacy policies and clear ROI models.`
          ]
        },
        chatGptResearchSynthesis: {
          engineName: "Strategic Deep Research Engine",
          status: "SYNTHETIC_MODEL",
          lastCrawled: "Offline (Synthetic Baseline)",
          growthFlywheel: `1. High-Intent Content Hub → 2. Lead Scoring Filter → 3. Pre-Sales Qualifier → 4. High-Touch Demo Conversion`,
          positioningAngle: `Position ${companyName} as a regulatory-compliant growth platform for ${companySector}.`,
          tacticalRecommendations: [
            `Build a customer referral loop incentivizing existing clients with tier-based usage credits.`,
            `Deploy dynamic video landing page hooks addressing core pain points in ${companySector}.`,
            `Implement automated email nurture drips triggered shortly after lead capture.`
          ]
        },
        googleTrends: {
          engineName: "Google Trends & Search Volume Signals",
          status: "UNAVAILABLE (Connect Google Trends API)",
          trendingKeywords: [
            { keyword: `${companySector.toLowerCase()} automation`, volume: "Unmeasured (API Offline)", velocity: "Rising Search Interest", difficulty: "Medium" },
            { keyword: `best ${companySector.toLowerCase()} platform`, volume: "Unmeasured (API Offline)", velocity: "Active Demand", difficulty: "Low" },
            { keyword: `compliant lead generation ${companySector.toLowerCase()}`, volume: "Unmeasured (API Offline)", velocity: "Steady Demand", difficulty: "Low" },
            { keyword: `roas optimization software`, volume: "Unmeasured (API Offline)", velocity: "High Commercial Intent", difficulty: "Competitive" }
          ],
          peakDemandSeason: "Enterprise Budget Planning Windows"
        },
        competitorRadar: {
          engineName: "Competitor Intelligence & Ad Radar",
          status: "SYNTHETIC_TEMPLATE (Connect Competitive Radar API)",
          monitoredCompetitors: [
            { name: "Industry Incumbent A", topAdHook: "Automate Operations in 3 Clicks", primaryChannel: "Google Search & LinkedIn", weakness: "Lacks regional compliance customization" },
            { name: "Global Enterprise B", topAdHook: "Enterprise Growth Platform", primaryChannel: "Meta & YouTube Video", weakness: "Complex onboarding timeline" }
          ],
          unclaimedMarketGap: `Opportunity to capture budget by offering streamlined onboarding and explicit regional compliance verification that legacy incumbents lack.`
        }
      },
      actionableRoadmap: [
        { phase: "Phase 1", directive: "Optimize landing pages with targeted exact-match keywords and double-opt-in consent forms." },
        { phase: "Phase 2", directive: "Launch Google Search & LinkedIn campaigns with ad hooks tested against customer intent signals." },
        { phase: "Phase 3", directive: "Scale top-performing ad channels and integrate automated lead scoring to prioritize sales team time." }
      ]
    };

    if (!client) {
      return res.json(defaultMultiSourceReport);
    }

    try {
      const prompt = `
        You are a multi-source AI marketing strategist combining live web signals from Gemini Search, deep reasoning from ChatGPT, search volume data from Google Trends, and competitive intelligence.

        Company Context:
        - Name: "${companyName}"
        - Sector: "${companySector}"
        - Region: "${companyRegion}"
        - Business Requirements & Goals: "${goalsList}"
        - Topic / Query: "${topic || "Multi-Source Growth Strategy & Marketing Audit"}"

        Generate a complete multi-source AI marketing research report matching this exact JSON schema (strict JSON only, no markdown wrapping):
        {
          "topic": string,
          "region": string,
          "sector": string,
          "businessRequirementsSummary": string,
          "consensusStrategy": string,
          "sources": {
            "geminiSearchGrounding": {
              "engineName": string,
              "status": string,
              "lastCrawled": string,
              "insights": string[],
              "marketTrends": string[]
            },
            "chatGptResearchSynthesis": {
              "engineName": string,
              "status": string,
              "lastCrawled": string,
              "growthFlywheel": string,
              "positioningAngle": string,
              "tacticalRecommendations": string[]
            },
            "googleTrends": {
              "engineName": string,
              "status": string,
              "trendingKeywords": Array<{ "keyword": string, "volume": string, "velocity": string, "difficulty": string }>,
              "peakDemandSeason": string
            },
            "competitorRadar": {
              "engineName": string,
              "status": string,
              "monitoredCompetitors": Array<{ "name": string, "topAdHook": string, "primaryChannel": string, "weakness": string }>,
              "unclaimedMarketGap": string
            }
          },
          "actionableRoadmap": Array<{ "phase": string, "directive": string }>
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.consensusStrategy && parsed.sources) {
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("Multi-source research AI fallback:", aiErr);
    }

    return res.json(defaultMultiSourceReport);
  } catch (error: any) {
    console.error("Multi-source research error:", error);
    res.status(500).json({ error: error.message || "Failed to compile multi-source research report." });
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
app.post("/api/lead/capture", validateLeadCaptureInput, (req, res) => {
  const { name, email, source, territory, product, phone, organizationId } = req.body;
  const newLead = {
    id: "lead-" + Date.now(),
    name: name,
    email: email,
    phone: phone ? sanitizeInputString(phone, 30) : undefined,
    source: source || "Inbound Webhook",
    territory: territory || "General Market",
    product: product || "MarketingOS Service",
    score: null, // Untrusted incoming leads are initially unscored until AI triage
    status: "New Lead",
    value: null, // Deal value is estimated post-discovery rather than fabricated
    organizationId: organizationId || "default_org",
    aiCallStatus: "Pending Qualification",
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newLead);
});

// Route 12: Pre-sales Call Simulation
app.post("/api/presales/simulate-call", async (req, res) => {
  try {
    const { lead, companyProfile } = req.body;
    const client = getAiClient();
    const leadName = lead?.name || "Client";

    const fallbackSimulation = {
      isSyntheticExample: true,
      callSummary: `[Synthetic Simulation] AI Pre-Sales Specialist contacted ${leadName} to model qualification dialogue. Live dynamic evaluation requires connected Gemini API.`,
      qualificationOutcome: "Synthetic Simulation (Connect Gemini API for dynamic qualification)",
      dialogue: [
        { speaker: "Sam (AI Pre-Sales Specialist)", text: `Hello! This is Sam from ${companyProfile?.companyName || "Sovereign Systems"} following up on your inquiry about our Marketing OS platform. Am I speaking with ${leadName}?` },
        { speaker: leadName, text: "Yes, hi Sam. Thanks for calling. We're looking to streamline our ad spend and scale qualified leads." },
        { speaker: "Sam (AI Pre-Sales Specialist)", text: "Excellent! Our platform coordinates multi-touch attribution, lead scoring, and CASL compliance. What is your primary growth goal for the upcoming quarter?" },
        { speaker: leadName, text: "We want to improve our acquisition efficiency while increasing our conversion rate on B2B campaigns." },
        { speaker: "Sam (AI Pre-Sales Specialist)", text: "That aligns with our Growth Suite. I'll qualify this opportunity and schedule an executive briefing with our team." }
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
      isSyntheticExample: true,
      kpiNote: "Projections are synthetic baseline planning models, not measured historical performance.",
      title: `${productName || "Growth Suite"} - ${objective || "Conversions"} Blitz`,
      overview: `Cross-channel campaign blueprint designed for ${targetAudience || "B2B Decision Makers"} to drive high-intent leads and structured attribution. Content knowledge extracted from ${selectedSource}${sourceDetails ? ` (${sourceDetails})` : ""}.`,
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
          `Optimize Operations with ${companyName}`
        ],
        descriptions: [
          `Automate customer acquisition with real-time lead attribution & AI workflow execution. Sourced from ${selectedSource}.`,
          `Book a live demo today and see how ${companyName} streamlines acquisition.`
        ]
      },
      metaAds: {
        headline: `Transform Your Growth Strategy with ${companyName}`,
        primaryText: `Stop burning budget on unverified leads. ${companyName}'s ${productName || "Marketing OS"} combines pre-sales qualification, real-time UTM tracking, and double-opt-in CASL compliance into one powerful dashboard.\n\n👉 Sourced via ${selectedSource}: Click below to claim your growth audit.`,
        hook: `Are your ads driving clicks but no qualified demos?`,
        callToAction: "Learn More"
      },
      linkedInAds: {
        headline: `Enterprise Growth OS for Industry Leaders`,
        bodyText: `Decision makers at enterprises use ${companyName} to streamline campaign approvals, monitor multi-touch attribution, and automate lead scoring. Elevate your marketing operations today with content engineered from ${selectedSource}.`,
        callToAction: "Request Demo"
      },
      tikTokAds: {
        headline: `Level Up Your Marketing Pipeline`,
        scriptHook: `Stop throwing ad dollars into a black hole! Here's how ${companyName} optimizes pipeline with automated lead scoring.`,
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
        targetROAS: "Planning Model: 3.5x - 4.0x"
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
      isSyntheticExample: true,
      provenanceNote: "Synthetic baseline ad performance model. Connect live Google/Meta Ads API for measured attribution.",
      executiveSummary: `[Synthetic Baseline Example] Multi-channel paid campaign audit model across active UTM sources. Connect live Google and Meta Ads API for real-time measured performance data.`,
      sourceBreakdownAnalysis: [
        { source: "google / cpc", status: "Scaling (Model)", recommendation: "Focus budget allocation on high-intent search keywords." },
        { source: "meta / instagram_reels", status: "Healthy (Model)", recommendation: "Refresh ad creative visual hooks to lower CPM and maintain engagement." },
        { source: "linkedin / sponsored", status: "High Intent (Model)", recommendation: "Ideal for enterprise decision-maker capture. Maintain current targeting parameters." },
        { source: "tiktok / feed_video", status: "Testing (Model)", recommendation: "Monitor CPA threshold; re-evaluate video hooks if CTR drops." }
      ],
      attributionInsight: "Multi-touch attribution framework models touchpoints across video awareness and search capture.",
      budgetReallocationPlan: [
        "Reallocate experimental spend from low-performing display placements into high-intent search terms.",
        "Deploy automated pre-sales qualification on Meta form leads to raise lead qualification rates."
      ],
      projectedRoasUplift: "Baseline Attribution Model (API Disconnected)"
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
      model: "gemini-3.8-flash",
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

// Route 16: AEO Content Generator (Structured for Google SGE / AI Overviews & Semantic Markup)
app.post("/api/gemini/aeo-content-generator", async (req, res) => {
  try {
    const { topic, queryIntent, targetAudience, companyProfile, primaryKeyword, answerFormat } = req.body;
    const client = getAiClient();
    const companyName = companyProfile?.companyName || "Sovereign Marketing OS";
    const sector = companyProfile?.sector || "Enterprise B2B Growth";
    const kw = primaryKeyword || topic || "Generative Engine Optimization";

    const fallbackAeoContent = {
      isSyntheticExample: true,
      provenanceNote: "Synthetic blueprint template. Live evaluation requires connected Gemini API.",
      topic: topic || "Autonomous AI Marketing Operating Systems",
      primaryKeyword: kw,
      queryIntent: queryIntent || "Commercial & Technical Investigation",
      targetAudience: targetAudience || "Enterprise CMOs & Growth Leaders",
      headlineH1: `What is an AI Marketing Operating System? The Definitive 2026 Guide`,
      directAnswerBox: `${companyName} is an autonomous AI marketing operating system that unifies real-time multi-channel attribution, automated ad budget reallocation, and CASL/PIPEDA regulatory compliance into a continuous execution engine, eliminating fragmented spreadsheets and streamlining customer acquisition.`,
      directAnswerWordCount: 46,
      evaluationStatus: "Structural Blueprint Model (Gemini API Offline)",
      informationGainFramework: "Entity-Salience & Structured Schema",
      keyTakeaways: [
        "Replaces passive analytics dashboards with automated, real-time campaign budget reallocation.",
        "Enforces strict CASL double opt-in and PIPEDA compliance directly at customer ingestion.",
        "Provides 15-minute telemetry intervals for instant ROI fluctuation detection across Google and Meta."
      ],
      stepByStepBlueprint: [
        {
          stepNumber: 1,
          stepTitle: "Establish Real-Time Multi-Touch Telemetry",
          actionDescription: "Integrate first-party server-side tracking to capture unadulterated UTM touchpoints across all paid channels without third-party cookie reliance."
        },
        {
          stepNumber: 2,
          stepTitle: "Configure Automated Budget Reallocation Thresholds",
          actionDescription: "Set algorithmic triggers that divert ad spend away from channels with ROI dips greater than 15% toward top-converting campaigns."
        },
        {
          stepNumber: 3,
          stepTitle: "Inject Structured Semantic Schema Markup",
          actionDescription: "Deploy JSON-LD schemas including FAQPage, DefinedTerm, and SpeakableSpecification so AI overviews parse and cite key answers directly."
        },
        {
          stepNumber: 4,
          stepTitle: "Validate Privacy & Anti-Spam Governance",
          actionDescription: "Record cryptographic timestamps and IP audit logs for all lead captures to ensure full CASL and CRTC compliance."
        }
      ],
      aiPromptQueriesTargeted: [
        `What is the best AI marketing operating system for enterprise teams?`,
        `How does ${companyName} optimize marketing ROAS in real time?`,
        `How to automate CASL compliance in B2B paid ad campaigns?`,
        `What is the difference between marketing dashboards and an autonomous marketing OS?`
      ],
      semanticEntities: [
        { entity: companyName, type: "SoftwareApplication", role: "Primary Subject" },
        { entity: "Answer Engine Optimization (AEO)", type: "SearchParadigm", role: "Core Methodology" },
        { entity: "Generative Engine Optimization (GEO)", type: "InformationGainFramework", role: "Content Standard" },
        { entity: "CASL / PIPEDA Compliance", type: "RegulatoryStandard", role: "Governance Constraint" }
      ],
      schemaMarkupJSONLD: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "@id": `https://schema.org/Article#${encodeURIComponent((topic || "aeo-guide").toLowerCase().replace(/\\s+/g, "-"))}`,
            "headline": `What is an AI Marketing Operating System? Definitive Guide`,
            "description": `${companyName} autonomous marketing operating system architecture, real-time attribution, and regulatory compliance.`,
            "author": {
              "@type": "Organization",
              "name": companyName
            },
            "publisher": {
              "@type": "Organization",
              "name": companyName
            },
            "datePublished": "2026-09-28",
            "inLanguage": "en-CA"
          },
          {
            "@type": "FAQPage",
            "@id": "https://schema.org/FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `What is ${companyName} and how does it optimize ad spend?`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": `${companyName} is an autonomous AI marketing operating system that automates campaign management, lead scoring, and real-time ROAS attribution while ensuring Canadian CASL and PIPEDA compliance.`
                }
              },
              {
                "@type": "Question",
                "name": "How does AEO structured content get cited in Google AI Overviews?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Google AI Overviews extract concise, 40-50 word definitional answers placed immediately beneath H2 query headings, reinforced with high entity salience and valid FAQPage schema."
                }
              }
            ]
          },
          {
            "@type": "SpeakableSpecification",
            "cssSelector": [".aeo-direct-answer-box", ".aeo-key-takeaways"]
          }
        ]
      }, null, 2),
      formattedMarkdownContent: `# What is an AI Marketing Operating System? The Definitive 2026 Guide\n\n## Direct Answer (AEO Snippet Box)\n> **${companyName}** is an autonomous AI marketing operating system that unifies real-time multi-channel attribution, automated ad budget reallocation, and CASL/PIPEDA regulatory compliance into a continuous execution engine, eliminating fragmented spreadsheets and streamlining customer acquisition.\n\n### Key Takeaways for Generative Engines\n- **Automated Reallocation**: Replaces passive dashboards with instant channel budget rebalancing.\n- **Regulatory Integrity**: Built-in double opt-in consent guarantees under CASL and PIPEDA.\n- **Telemetric Precision**: 15-minute fluctuation alerts prevent wasted ad spend across Google and Meta.\n\n### Step-by-Step Implementation Blueprint\n1. **Establish Real-Time Multi-Touch Telemetry**: Deploy first-party server-side tracking.\n2. **Configure Budget Reallocation Thresholds**: Divert ad spend based on real-time ROAS telemetry.\n3. **Inject Structured Semantic Schema Markup**: Embed JSON-LD FAQPage and Speakable specs.\n4. **Validate Privacy & Anti-Spam Governance**: Ensure verifiable audit logging.`
    };

    if (!client) {
      return res.json(fallbackAeoContent);
    }

    try {
      const prompt = `
        You are an elite search systems engineer and expert in Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO).
        Google AI Overviews (SGE) and Gemini prioritize content with high Information Gain, concise 40-50 word direct answer blocks, numbered structured blueprints, and semantic schema markup.

        User Request:
        - Topic: "${topic}"
        - Focus Keyword: "${kw}"
        - Query Intent: "${queryIntent || "Informational / Solution"}"
        - Target Audience: "${targetAudience || "Enterprise Leaders"}"
        - Preferred Answer Format: "${answerFormat || "45-word snippet + structured steps + FAQ schema"}"
        - Company / Brand: "${companyName}" in sector "${sector}"

        Generate an ultra-structured AEO content package engineered for zero-click AI snippet extraction and Google AI Overview citations.
        Return strict JSON only (no markdown code fence, valid JSON):
        {
          "topic": string,
          "primaryKeyword": string,
          "queryIntent": string,
          "targetAudience": string,
          "headlineH1": string,
          "directAnswerBox": string (exactly 40-55 words, factual, authoritative, quoting brand value),
          "directAnswerWordCount": number,
          "aiOverviewReadinessScore": number (88-99),
          "citationProbability": string (e.g. "97.8%"),
          "informationGainRating": string,
          "keyTakeaways": string[] (3-5 items with high statistical or factual density),
          "stepByStepBlueprint": [
            { "stepNumber": number, "stepTitle": string, "actionDescription": string }
          ],
          "aiPromptQueriesTargeted": string[] (4-6 conversational queries that trigger this answer),
          "semanticEntities": [
            { "entity": string, "type": string, "role": string }
          ],
          "schemaMarkupJSONLD": string (valid Schema.org @graph with Article, FAQPage, and SpeakableSpecification),
          "formattedMarkdownContent": string
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text || "{}");
      if (parsed.directAnswerBox && parsed.headlineH1) {
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("AEO Content Generator AI fallback:", aiErr);
    }

    return res.json(fallbackAeoContent);
  } catch (error: any) {
    console.error("AEO Content Generator API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AEO content." });
  }
});

// Route 17: Competitive SEO Intel (Google Search Grounded Competitor Titles, Meta Descriptions & Keyword Density)
app.post("/api/gemini/competitive-seo-intel", async (req, res) => {
  try {
    const { focusTopic, primaryKeyword, targetMarket, companyProfile } = req.body;
    const client = getAiClient();
    const companyName = companyProfile?.companyName || "MarketingOS";
    const topic = focusTopic || primaryKeyword || "Enterprise Growth Solutions";
    const market = targetMarket || "Global Markets";
    const cleanTopicSlug = topic.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 15);

    const fallbackIntel = {
      isSyntheticExample: true,
      provenanceNote: "Synthetic baseline competitive model. Live search analysis requires connected Gemini API.",
      focusTopic: topic,
      primaryKeyword: primaryKeyword || topic,
      targetMarket: market,
      analyzedDate: new Date().toISOString().split("T")[0],
      totalCompetitorsAnalyzed: 3,
      searchGrounded: false,
      competitors: [
        {
          rank: 1,
          domain: `top-${cleanTopicSlug || "authority"}.org`,
          brandName: `Top Ranking ${topic} Authority`,
          url: `https://www.top-${cleanTopicSlug || "authority"}.org/solutions`,
          title: `${topic} Solutions & Industry Standards`,
          titleLength: 54,
          titleStatus: "Optimal (50-60 chars)",
          metaDescription: `Discover high-performance strategies and verified benchmark data for ${topic}. Comprehensive comparison and service overview for ${market}.`,
          metaDescriptionLength: 145,
          metaStatus: "Optimal (<160 chars)",
          keywordDensity: {
            focusKeywordOccurrences: 3,
            focusKeywordDensityPercent: 2.4,
            secondaryKeywordsFound: ["verified benchmark", "performance", "service overview"]
          },
          aeoStatus: "Cited in broad informational queries, but vulnerable on real-time interactive answers.",
          schemaTypesDetected: ["Organization", "WebSite"],
          vulnerabilities: [
            "Generic meta description with weak emotional conversion hook.",
            "Lacks 45-word direct answer box formatted for zero-click AI overviews.",
            "Missing FAQPage and Speakable structured schema."
          ]
        },
        {
          rank: 2,
          domain: `global-${cleanTopicSlug || "network"}.com`,
          brandName: `Global ${topic} Provider`,
          url: `https://www.global-${cleanTopicSlug || "network"}.com/platform`,
          title: `Premier ${topic} Network & Services Comparison Guide`,
          titleLength: 62,
          titleStatus: "Slightly Long (>60 chars, risk of truncation)",
          metaDescription: `Compare top providers and platforms for ${topic}. In-depth analysis of pricing, features, and operational efficiency across ${market}.`,
          metaDescriptionLength: 148,
          metaStatus: "Optimal (<160 chars)",
          keywordDensity: {
            focusKeywordOccurrences: 2,
            focusKeywordDensityPercent: 1.8,
            secondaryKeywordsFound: ["comparison guide", "operational efficiency", "pricing"]
          },
          aeoStatus: "Dominates legacy text queries; weak presence on modern conversational AI overviews.",
          schemaTypesDetected: ["Organization"],
          vulnerabilities: [
            "Title tag gets truncated in mobile Google SERPs at 62 characters.",
            "Slow mobile page load speed and lack of interactive calculators.",
            "No verifiable information gain advantage over competing results."
          ]
        },
        {
          rank: 3,
          domain: `specialist-${cleanTopicSlug || "hub"}.net`,
          brandName: `Specialist ${topic} Hub`,
          url: `https://www.specialist-${cleanTopicSlug || "hub"}.net/guide`,
          title: `${topic} - Complete Implementation Framework`,
          titleLength: 56,
          titleStatus: "Optimal (50-60 chars)",
          metaDescription: `Step-by-step implementation guide for ${topic}. Maximize ROI, automate workflows, and ensure complete regulatory compliance.`,
          metaDescriptionLength: 138,
          metaStatus: "Optimal (<160 chars)",
          keywordDensity: {
            focusKeywordOccurrences: 2,
            focusKeywordDensityPercent: 1.6,
            secondaryKeywordsFound: ["implementation guide", "workflows", "ROI"]
          },
          aeoStatus: "Moderate citation share, vulnerable to structured FAQ displacement.",
          schemaTypesDetected: ["Article"],
          vulnerabilities: [
            "Post-hoc analysis rather than real-time telemetry.",
            "Zero question-and-answer modules structured for SGE/AI Overviews.",
            "Under-utilizing 160-character meta description limit."
          ]
        }
      ],
      headToHeadComparison: {
        dimensions: [
          { feature: "Average Title Length", competitorsAvg: "57 chars", userRecommendation: "56 chars (Ideal)" },
          { feature: "Average Meta Description Length", competitorsAvg: "144 chars", userRecommendation: "155 chars (High CTR Hook)" },
          { feature: "Primary Keyword in Title Tag", competitorsAvg: "75% of competitors", userRecommendation: "100% Exact Front-Loaded" },
          { feature: "Keyword Density in SERP Snippets", competitorsAvg: "1.9%", userRecommendation: "2.8% (Optimal Natural Density)" },
          { feature: "AI Overview Answer Formatting", competitorsAvg: "Standard Unstructured Text", userRecommendation: "AEO Structured Direct Answer Modules" },
          { feature: "Rich Schema Graph (FAQ + Speakable)", competitorsAvg: "25% deployment", userRecommendation: "100% Rich @graph JSON-LD" }
        ]
      },
      winningStrategyRecommendations: {
        recommendedTitleTag: `${topic} | High-ROAS & Compliance Solutions`,
        titleTagCharacterCount: 56,
        titleRationale: "Front-loads the primary topic entity, includes a high-click intent modifier, and stays strictly under the 60-character mobile truncation threshold.",
        recommendedMetaDescription: `Maximize results with ${companyName}. Tailored ${topic.toLowerCase()} solutions, verified regulatory compliance, and rapid ROI. Get started.`,
        metaDescriptionCharacterCount: 154,
        metaRationale: "Uses active action verbs, mentions verified regulatory standards, and provides a clear call to action under 160 characters.",
        informationGainAdvantage: [
          "Include verified industry benchmark metrics to stand out against generic informational competitor pages.",
          "Provide an immediate 45-word direct answer box defining the core solution for zero-click AI snippet scrapers.",
          "Implement rich Schema markup (@graph with FAQPage and SpeakableSpecification) for AI overview prioritization."
        ]
      }
    };

    if (!client) {
      return res.json(fallbackIntel);
    }

    try {
      const searchPrompt = `
        You are an elite competitive SEO intelligence analyst. Use Google Search grounding to analyze the top-ranking competitors for:
        Topic: "${topic}"
        Primary Keyword: "${primaryKeyword || topic}"
        Market: "${market}"
        Brand: "${companyName}"

        Instructions:
        1. Query Google Search to locate the real current top-ranking competitor pages for "${topic}".
        2. Extract each competitor's Title Tag, Meta Description, URL, and estimate their keyword frequency/density.
        3. Audit their titles (character count, truncation risk) and meta descriptions (character count, CTA strength).
        4. Analyze their Answer Engine Optimization (AEO) status: are they cited in Google AI Overviews or vulnerable to displacement?
        5. Formulate winning title and meta description recommendations for "${companyName}" that outrank them and win Google AI Overview citations.

        Return strict JSON only (no markdown wrapper) matching this structure:
        {
          "focusTopic": string,
          "primaryKeyword": string,
          "targetMarket": string,
          "analyzedDate": string,
          "totalCompetitorsAnalyzed": number,
          "searchGrounded": true,
          "competitors": [
            {
              "rank": number,
              "domain": string,
              "brandName": string,
              "url": string,
              "title": string,
              "titleLength": number,
              "titleStatus": string,
              "metaDescription": string,
              "metaDescriptionLength": number,
              "metaStatus": string,
              "keywordDensity": {
                "focusKeywordOccurrences": number,
                "focusKeywordDensityPercent": number,
                "secondaryKeywordsFound": string[]
              },
              "aeoStatus": string,
              "schemaTypesDetected": string[],
              "vulnerabilities": string[]
            }
          ],
          "headToHeadComparison": {
            "dimensions": [
              { "feature": string, "competitorsAvg": string, "userRecommendation": string }
            ]
          },
          "winningStrategyRecommendations": {
            "recommendedTitleTag": string,
            "titleTagCharacterCount": number,
            "titleRationale": string,
            "recommendedMetaDescription": string,
            "metaDescriptionCharacterCount": number,
            "metaRationale": string,
            "informationGainAdvantage": string[]
          }
        }
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const rawText = response.text || "";
      // Clean possible json code fence
      const jsonStart = rawText.indexOf("{");
      const jsonEnd = rawText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = rawText.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed.competitors && parsed.winningStrategyRecommendations) {
          parsed.searchGrounded = true;
          return res.json(parsed);
        }
      }
    } catch (aiErr) {
      console.warn("Competitive SEO Intel AI Search fallback:", aiErr);
    }

    return res.json(fallbackIntel);
  } catch (error: any) {
    console.error("Competitive SEO Intel API Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze competitive SEO intel." });
  }
});

// Alias for legacy campaign ideas endpoint
app.post("/api/generate-campaign-ideas", async (req, res) => {
  req.url = "/api/agent/run-test";
  return app._router.handle(req, res, () => {});
});

// ==========================================
// Multimodal AI Creative Studio API Endpoints
// ==========================================

// 1. Create & Edit Images using gemini-nano-banana-2.1
app.post("/api/ai/image/generate", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1", imageSize = "1K", imageBase64, mimeType = "image/png", isEdit = false, useSearch = false } = req.body;
    const client = getAiClient();

    if (!client) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="50%" stop-color="#312e81"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
        </defs>
        <rect width="800" height="800" fill="url(#bg)"/>
        <circle cx="400" cy="350" r="140" fill="#6366f1" opacity="0.3"/>
        <text x="400" y="340" fill="#ffffff" font-size="28" font-weight="bold" font-family="sans-serif" text-anchor="middle">Sovereign Creative Studio</text>
        <text x="400" y="380" fill="#34d399" font-size="18" font-family="sans-serif" text-anchor="middle">Generated via gemini-nano-banana-2.1</text>
        <text x="400" y="440" fill="#cbd5e1" font-size="14" font-family="sans-serif" text-anchor="middle">${encodeURIComponent(prompt || "Enterprise Ad Creative").slice(0, 50)}</text>
      </svg>`;
      const fallbackUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      return res.json({ imageUrl: fallbackUrl, isFallback: true, description: "Preview creative asset generated. Connect GEMINI_API_KEY in Secrets for photorealistic render." });
    }

    const parts: any[] = [];
    if (isEdit && imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/png"
        }
      });
      parts.push({ text: prompt || "Enhance and edit this marketing advertisement creative." });
    } else {
      parts.push({ text: prompt || "High quality advertising creative image banner" });
    }

    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: imageSize
      }
    };

    if (useSearch) {
      config.tools = [
        {
          googleSearch: {
            searchTypes: {
              webSearch: {},
              imageSearch: {}
            }
          }
        }
      ];
    }

    let response: any;
    try {
      response = await client.models.generateContent({
        model: "gemini-nano-banana-2.1",
        contents: { parts },
        config
      });
    } catch (primaryErr: any) {
      console.warn("Primary gemini-nano-banana-2.1 call warning, retrying with simplified config:", primaryErr?.message);
      try {
        response = await client.models.generateContent({
          model: "gemini-nano-banana-2.1",
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: ["1:1", "16:9", "9:16", "4:3", "3:4"].includes(aspectRatio) ? aspectRatio : "1:1",
              imageSize: imageSize || "1K"
            }
          }
        });
      } catch (fallbackErr: any) {
        console.warn("Retrying with gemini-3.1-flash-lite-image as safety fallback:", fallbackErr?.message);
        response = await client.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: { parts }
        });
      }
    }

    let imageUrl = "";
    let description = "";

    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        } else if (part.text) {
          description = part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.json({ imageUrl: null, description: description || "Image generation completed without inline image bytes." });
    }

    res.json({ imageUrl, description, isFallback: false });
  } catch (err: any) {
    console.error("Image generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate image" });
  }
});

// 2. Veo Video Generation & Image Animation using veo-3.1-fast-generate-preview
app.post("/api/ai/video/generate", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", imageBase64, mimeType = "image/png" } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        isFallback: true,
        operationName: "mock-operation-" + Date.now(),
        status: "completed",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        description: "Preview sample video rendered with Veo Fast Preview template."
      });
    }

    const videoConfig: any = {
      numberOfVideos: 1,
      aspectRatio: aspectRatio === "9:16" ? "9:16" : "16:9",
      resolution: "720p"
    };

    const payload: any = {
      model: "veo-3.1-fast-generate-preview",
      prompt: prompt || "Cinematic high-converting commercial video advertisement",
      config: videoConfig
    };

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      payload.image = {
        imageBytes: cleanBase64,
        mimeType: mimeType || "image/png"
      };
    }

    let operation;
    try {
      operation = await client.models.generateVideos(payload);
    } catch (veoFastErr) {
      console.warn("veo-3.1-fast-generate-preview fallback to veo-3.1-lite-generate-preview:", veoFastErr);
      payload.model = "veo-3.1-lite-generate-preview";
      operation = await client.models.generateVideos(payload);
    }

    res.json({ operationName: operation.name, isFallback: false, status: "processing" });
  } catch (err: any) {
    console.error("Video generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate video" });
  }
});

app.post("/api/ai/video/status", async (req, res) => {
  try {
    const { operationName } = req.body;
    const client = getAiClient();
    if (!client || (typeof operationName === "string" && operationName.startsWith("mock-operation-"))) {
      return res.json({ done: true, isFallback: true, videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await client.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done, error: updated.error });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to check video status" });
  }
});

app.post("/api/ai/video/download", async (req, res) => {
  try {
    const { operationName } = req.body;
    const client = getAiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!client || !apiKey || (typeof operationName === "string" && operationName.startsWith("mock-operation-"))) {
      return res.redirect("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await client.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: "Video URI not found on completed operation" });
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey }
    });

    res.setHeader("Content-Type", "video/mp4");
    if (videoRes.body) {
      const reader = videoRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    console.error("Video download error:", err);
    res.status(500).json({ error: err.message || "Failed to download video" });
  }
});

// 3. Audio Transcription using gemini-3.5-transcribe
app.post("/api/ai/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        transcript: "Transcribed audio preview: Customer responded favorably to our multi-channel campaign. Key conversion interest centers on ROI automation and real-time attribution telemetry.",
        isFallback: true
      });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9]+;base64,/, "");
    const audioPart = {
      inlineData: {
        mimeType: mimeType || "audio/webm",
        data: cleanBase64
      }
    };

    const response = await client.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: { parts: [audioPart, { text: "Transcribe this audio precisely with punctuation." }] }
    });

    res.json({ transcript: response.text || "", isFallback: false });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: err.message || "Failed to transcribe audio" });
  }
});

// 4. Music Generation using lyria-3-clip-preview (up to 30s) or lyria-3-pro-preview (full track)
app.post("/api/ai/music/generate", async (req, res) => {
  try {
    const { prompt, mode = "clip", imageBase64 } = req.body;
    const client = getAiClient();
    const model = mode === "pro" ? "lyria-3-pro-preview" : "lyria-3-clip-preview";

    if (!client) {
      return res.json({
        isFallback: true,
        lyrics: "Dynamic high-converting marketing score.",
        audioDataUrl: "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=",
        description: "Preview audio synthesizer ready. Connect GEMINI_API_KEY in Secrets for full Lyria audio stream."
      });
    }

    const contents: any = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      contents.push({
        parts: [
          { text: prompt || "Generate a commercial advertisement track." },
          { inlineData: { data: cleanBase64, mimeType: "image/jpeg" } }
        ]
      });
    } else {
      contents.push(prompt || "Generate an energetic 30-second commercial background music track.");
    }

    const responseStream = await client.models.generateContentStream({
      model: model,
      contents: contents
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    const audioDataUrl = audioBase64 ? `data:${mimeType};base64,${audioBase64}` : null;
    res.json({ audioDataUrl, lyrics, isFallback: false });
  } catch (err: any) {
    console.error("Music generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate music" });
  }
});

// 5. Search & Maps Grounding using gemini-3.5-flash with googleSearch or googleMaps
app.post("/api/ai/grounded", async (req, res) => {
  try {
    const { query, toolType = "search", systemInstruction } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        answer: `Grounding analysis for "${query}": Telemetry indicates top-converting demographic clusters in major metropolitan commercial sectors with 24% lower acquisition costs.`,
        groundingMetadata: {
          webSearchQueries: [query],
          searchEntryPoint: { renderedContent: "Google Grounding Engine" }
        },
        isFallback: true
      });
    }

    const tools: any[] = [];
    if (toolType === "maps") {
      tools.push({ googleMaps: {} });
    } else {
      tools.push({ googleSearch: {} });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        systemInstruction: systemInstruction || "You are an accurate, real-time grounded marketing research intelligence analyst.",
        tools
      }
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    res.json({
      answer: response.text || "",
      groundingMetadata,
      isFallback: false
    });
  } catch (err: any) {
    console.error("Grounded query error:", err);
    res.status(500).json({ error: err.message || "Failed to perform grounded query" });
  }
});

// 6. Multi-turn Role Chatbot using gemini-3.1-pro-preview, gemini-3.5-flash, or gemini-3.1-flash-lite
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, model = "gemini-3.5-flash", systemInstruction } = req.body;
    const client = getAiClient();

    const allowedModels = ["gemini-3.1-pro-preview", "gemini-3.5-flash", "gemini-3.1-flash-lite"];
    const targetModel = allowedModels.includes(model) ? model : "gemini-3.5-flash";

    if (!client) {
      const lastUserMsg = messages[messages.length - 1]?.text || "";
      return res.json({
        role: "model",
        text: `[${targetModel} Response]: Understood. Operating under role: "${systemInstruction?.slice(0, 80) || "Executive Copilot"}". In response to "${lastUserMsg}": The Sovereign Business Brain recommends prioritizing high-ROAS UTM attribution and continuous CASL/GDPR guardrails.`,
        isFallback: true
      });
    }

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await client.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction: systemInstruction || "You are an expert AI enterprise marketing copilot assisting the executive team."
      }
    });

    res.json({
      role: "model",
      text: response.text || "",
      isFallback: false
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message || "Failed to process chat" });
  }
});

// 7. Voice Conversation with Gemini Live Voice using gemini-3.8-live, gemini-3.8-flash, & gemini-3.8-flash-lite-tts
app.post("/api/ai/voice/converse", async (req, res) => {
  try {
    const { message, voiceName = "Zephyr", model = "gemini-3.8-flash" } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        textResponse: "Hello! I am your Sovereign Voice Copilot powered by Gemini Live. How can I assist your marketing and campaign strategy today?",
        audioBase64: null,
        isFallback: true
      });
    }

    // Step 1: Generate conversational reasoning via gemini-3.8-flash
    let spokenScript = "Here is your executive strategic briefing.";
    try {
      const flashResponse = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are the Sovereign Executive Voice Copilot powered by Gemini Live & Flash. Provide a clear, natural, spoken-ready executive response (2 to 4 sentences maximum, conversational and impactful without markdown bullet lists or unpronounceable characters).\n\nUser: ${message || "Provide an executive marketing briefing."}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: "You are an executive voice copilot for strategic marketing, ROI, and campaign management."
        }
      });
      if (flashResponse.text) {
        spokenScript = flashResponse.text.trim();
      }
    } catch (e: any) {
      console.warn("Flash text generation fallback:", e?.message);
      spokenScript = message || "Executive briefing ready for execution.";
    }

    // Step 2: Synthesize neural audio using gemini-3.8-flash-lite-tts with chosen voice
    let base64Audio: string | null = null;
    try {
      const ttsResponse = await client.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [{ text: spokenScript }]
          }
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || "Zephyr" }
            }
          }
        }
      });
      base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (ttsErr: any) {
      console.warn("TTS generation warning:", ttsErr?.message);
    }

    res.json({
      textResponse: spokenScript,
      audioBase64: base64Audio,
      voiceName,
      model: "models/gemini-3.8-flash",
      isFallback: false
    });
  } catch (err: any) {
    console.error("Voice converse error:", err);
    res.status(500).json({ error: err.message || "Failed to process voice conversation" });
  }
});

// Alias for Live Converse REST
app.post("/api/ai/live/converse", async (req, res) => {
  try {
    const { message, voiceName = "Zephyr" } = req.body;
    const client = getAiClient();

    if (!client) {
      return res.json({
        textResponse: "Gemini 3.8 Live API connected in sandbox mode. Set GEMINI_API_KEY to activate full duplex streaming.",
        audioBase64: null,
        isFallback: true
      });
    }

    const ttsResponse = await client.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [{ text: message || "Executive marketing overview." }]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || "Zephyr" }
          }
        }
      }
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    res.json({
      textResponse: `Voice response generated by gemini-3.8-live using voice: ${voiceName}.`,
      audioBase64: base64Audio,
      isFallback: false
    });
  } catch (err: any) {
    console.error("Live converse error:", err);
    res.status(500).json({ error: err.message || "Failed to process Live conversation" });
  }
});

// Centralized Safe Error Handling Middleware
app.use(safeErrorHandler);

// Serve static React files and Vite middleware
async function startServer() {
  const server = http.createServer(app);

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

  // WebSocket Server for Gemini Live API (gemini-3.8-live) duplex voice streaming
  const wss = new WebSocketServer({ server, path: "/live" });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("[Gemini Live API] Client connected to /live");
    const client = getAiClient();

    if (!client) {
      clientWs.send(JSON.stringify({
        text: "Connected in sandbox voice mode. Configure your GEMINI_API_KEY in settings to enable full real-time gemini-3.8-live neural voice streaming.",
        isFallback: true
      }));
      return;
    }

    let liveSession: any = null;

    try {
      liveSession = await client.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are the Sovereign Executive Voice Copilot. Provide concise, strategic, high-impact verbal insights on marketing, ROI, business strategy, and campaigns. Keep answers conversational, natural, and concise suitable for spoken voice.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && Array.isArray(parts)) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                  }
                  if (part.text) {
                    clientWs.send(JSON.stringify({ text: part.text }));
                  }
                }
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ interrupted: true }));
              }
            } catch (sendErr) {
              console.error("[Live API] Error sending server message:", sendErr);
            }
          },
          onclose: () => {
            console.log("[Gemini Live API] Remote session closed");
          },
          onerror: (err: any) => {
            console.error("[Gemini Live API] Error from Gemini:", err);
            try {
              clientWs.send(JSON.stringify({ error: String(err?.message || err) }));
            } catch (e) {}
          }
        },
      });

      // Confirm session handshake
      clientWs.send(JSON.stringify({ status: "connected", model: "gemini-3.8-live" }));

      clientWs.on("message", (raw) => {
        try {
          const payload = JSON.parse(raw.toString());
          if (payload.audio) {
            // Send real-time audio chunk (16kHz PCM little-endian)
            liveSession.sendRealtimeInput({
              audio: { data: payload.audio, mimeType: "audio/pcm;rate=16000" }
            });
          } else if (payload.text) {
            // Send real-time text input
            liveSession.sendRealtimeInput({
              text: payload.text
            });
          }
        } catch (msgErr) {
          console.error("[Live API] Error forwarding client input:", msgErr);
        }
      });

      clientWs.on("close", () => {
        console.log("[Gemini Live API] Client disconnected from /live");
        try {
          if (liveSession && typeof liveSession.close === "function") {
            liveSession.close();
          }
        } catch (e) {}
      });
    } catch (sessionErr: any) {
      console.error("[Gemini Live API] Connection failure:", sessionErr);
      clientWs.send(JSON.stringify({
        error: sessionErr?.message || "Failed to initialize gemini-3.8-live session",
        isFallback: true
      }));
    }
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`MarketingOS backend running on http://localhost:${PORT}`);
  });
}

startServer();
