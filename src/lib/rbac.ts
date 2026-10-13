export type ActiveTabType =
  | "enterprise-core"
  | "user-management"
  | "voice-conversations"
  | "create-edit-images"
  | "creative-studio"
  | "digital-card"
  | "marketplace"
  | "seo"
  | "campaign-commander"
  | "ads-tracker"
  | "campaign-generator"
  | "marketing-strategist"
  | "discovery"
  | "dashboard"
  | "analytics"
  | "execution"
  | "social"
  | "crm"
  | "advisor"
  | "research"
  | "troubleshoot";

export const VALID_TABS: ActiveTabType[] = [
  "enterprise-core",
  "user-management",
  "voice-conversations",
  "create-edit-images",
  "creative-studio",
  "digital-card",
  "marketplace",
  "seo",
  "campaign-commander",
  "ads-tracker",
  "campaign-generator",
  "marketing-strategist",
  "discovery",
  "dashboard",
  "analytics",
  "execution",
  "social",
  "crm",
  "advisor",
  "research",
  "troubleshoot"
];

export interface TabConfig {
  id: ActiveTabType;
  labelEN: string;
  labelFR: string;
  badgeText: string;
  badgeColor: string;
  iconName: string;
  description: string;
  minRole: "Admin" | "CEO" | "Vice President" | "AGM" | "Marketing Manager" | "Team Lead" | "Executive";
}

export const ALL_TABS: TabConfig[] = [
  {
    id: "enterprise-core",
    labelEN: "SBB Enterprise Core (5 Pillars)",
    labelFR: "Cœur Entreprise SBB (5 Piliers)",
    badgeText: "5 DIFFERENTIATED PILLARS",
    badgeColor: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white",
    iconName: "Cpu",
    description: "The 5 core differentiation pillars: Business-Wide Intelligence Decision Engine, Real Agent Orchestration Layer, Reliable Business Memory, Secure Execution & Approval Gates, and Proven Business Outcomes.",
    minRole: "Executive"
  },
  {
    id: "voice-conversations",
    labelEN: "Voice Conversations",
    labelFR: "Conversations Vocales",
    badgeText: "GEMINI 3.8 LIVE",
    badgeColor: "bg-gradient-to-r from-teal-500 to-emerald-600 text-white",
    iconName: "AudioSpark",
    description: "Two-way real-time voice conversations using gemini-3.8-live (Live API) with microphone streaming, 24kHz neural audio playback, interruption handling, and gemini-3.8-flash strategy reasoning.",
    minRole: "Executive"
  },
  {
    id: "create-edit-images",
    labelEN: "Create & Edit Images",
    labelFR: "Créer & Modifier des Images",
    badgeText: "NANO BANANA 2.1",
    badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
    iconName: "ImageEditAuto",
    description: "Use text prompts to create or edit high-impact commercial images using gemini-nano-banana-2.1 with resolution selection, aspect ratio, and iterative editing.",
    minRole: "Executive"
  },
  {
    id: "creative-studio",
    labelEN: "AI Multimodal Studio",
    labelFR: "Studio Multimodal IA",
    badgeText: "VEO • NANO • LYRIA",
    badgeColor: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
    iconName: "Sparkles",
    description: "Multimodal AI production suite: Veo Video generator & animator, Gemini Nano Banana 2.1 image creator, Lyria Music composer, Live voice chat, transcription, grounded search & maps.",
    minRole: "Executive"
  },
  {
    id: "user-management",
    labelEN: "User Logins & Agent Factory",
    labelFR: "Utilisateurs & Usine d'Agents",
    badgeText: "ADMIN ONLY",
    badgeColor: "bg-emerald-600 text-white",
    iconName: "ShieldCheck",
    description: "Manage system user logins, position role clearances, custom tab permissions, and AI Agent Factory. Accessible exclusively to Admin role.",
    minRole: "Admin"
  },
  {
    id: "digital-card",
    labelEN: "SBB Digital Business Card & NFC Hub",
    labelFR: "Carte de Visite SBB & Hub NFC",
    badgeText: "SBB CARD & NFC",
    badgeColor: "bg-purple-600 text-white",
    iconName: "CreditCard",
    description: "Digital business card builder, vCard download, WhatsApp lead collection, QR code generator, and NFC sharing.",
    minRole: "Executive"
  },
  {
    id: "dashboard",
    labelEN: "CEO Telemetry Hub",
    labelFR: "Tableau de Bord CEO",
    badgeText: "EXECUTIVE",
    badgeColor: "bg-amber-600 text-white",
    iconName: "LayoutDashboard",
    description: "High-level corporate KPI summary, ROI metrics, budget approvals, and executive telemetry.",
    minRole: "CEO"
  },
  {
    id: "campaign-commander",
    labelEN: "SBB Campaign Commander",
    labelFR: "Commandant de Campagne SBB",
    badgeText: "RBAC QUEUE",
    badgeColor: "bg-indigo-600 text-white",
    iconName: "ShieldAlert",
    description: "Campaign approval workflow queue, signing authorization limits, and budget allocation.",
    minRole: "Marketing Manager"
  },
  {
    id: "marketing-strategist",
    labelEN: "SBB AI Marketing Strategist",
    labelFR: "Stratège Marketing IA SBB",
    badgeText: "STRATEGY",
    badgeColor: "bg-emerald-600 text-white",
    iconName: "Sparkles",
    description: "AI Marketing Strategist generating campaign roadmaps, budget plans, and channel splits.",
    minRole: "Marketing Manager"
  },
  {
    id: "analytics",
    labelEN: "SBB Analytics Brain",
    labelFR: "Cerveau d'Analyse SBB",
    badgeText: "ANALYTICS",
    badgeColor: "bg-emerald-600 text-white",
    iconName: "BarChart3",
    description: "Deep statistical analytics, campaign performance graphs, and ROI attribution model.",
    minRole: "Marketing Manager"
  },
  {
    id: "ads-tracker",
    labelEN: "Ads & UTM Tracker",
    labelFR: "Suivi des Pubs & UTM",
    badgeText: "TRACKING",
    badgeColor: "bg-emerald-600 text-white",
    iconName: "Target",
    description: "Multi-channel advertising tracker, Google/Meta Ads UTM links, and spend monitoring.",
    minRole: "Marketing Manager"
  },
  {
    id: "campaign-generator",
    labelEN: "AI Campaign Generator",
    labelFR: "Générateur de Campagne IA",
    badgeText: "AI GEN",
    badgeColor: "bg-indigo-600 text-white",
    iconName: "Megaphone",
    description: "Multi-prompt automated campaign draft builder for social, email, and PPC media.",
    minRole: "Marketing Manager"
  },
  {
    id: "marketplace",
    labelEN: "SBB AI Marketplace",
    labelFR: "Marketplace d'IA SBB",
    badgeText: "AGENTS",
    badgeColor: "bg-emerald-600 text-white",
    iconName: "Bot",
    description: "Storefront of specialized domain AI agents (Real Estate, Legal, Compliance, Copywriters).",
    minRole: "AGM"
  },
  {
    id: "seo",
    labelEN: "AEO / GEO & AI Search Engine",
    labelFR: "Moteur AEO / GEO & IA",
    badgeText: "AEO / GEO",
    badgeColor: "bg-indigo-600 text-white",
    iconName: "Globe",
    description: "Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) visualizer, local geographic search queries footprint, and Google AI Overview indexing.",
    minRole: "Team Lead"
  },
  {
    id: "discovery",
    labelEN: "SBB Intelligence Discovery",
    labelFR: "Découverte d'Intelligence SBB",
    badgeText: "MEMORY",
    badgeColor: "bg-emerald-600 text-white",
    iconName: "Sliders",
    description: "Enterprise memory bank, vector knowledge retrieval, and strategic brand guidelines.",
    minRole: "CEO"
  },
  {
    id: "execution",
    labelEN: "SBB Execution Brain",
    labelFR: "Cerveau d'Exécution SBB",
    badgeText: "EXEC",
    badgeColor: "bg-indigo-600 text-white",
    iconName: "Activity",
    description: "Live operational action queue, task execution triggers, and team task assignments.",
    minRole: "Executive"
  },
  {
    id: "social",
    labelEN: "AI Social Campaign",
    labelFR: "Campagne Sociale AI",
    badgeText: "SOCIAL",
    badgeColor: "bg-indigo-600 text-white",
    iconName: "FileText",
    description: "Social media content calendar, Instagram/LinkedIn caption generation, and draft submission.",
    minRole: "Executive"
  },
  {
    id: "crm",
    labelEN: "CRM Lead Scoring Router",
    labelFR: "Routage Leads CRM",
    badgeText: "CRM",
    badgeColor: "bg-blue-600 text-white",
    iconName: "Users2",
    description: "Lead contact directory, intent scoring router, global privacy compliance verification, and sales tasks.",
    minRole: "Executive"
  },
  {
    id: "advisor",
    labelEN: "CRM Intelligence Advisor",
    labelFR: "Conseiller CRM LLM",
    badgeText: "ADVISOR",
    badgeColor: "bg-indigo-600 text-white",
    iconName: "TrendingUp",
    description: "Predictive lead advisor providing deal closure recommendations and email response drafts.",
    minRole: "Marketing Manager"
  },
  {
    id: "research",
    labelEN: "Market Research LLM",
    labelFR: "Recherche de Marché LLM",
    badgeText: "RESEARCH",
    badgeColor: "bg-slate-700 text-white",
    iconName: "ClipboardCheck",
    description: "Competitor market analysis, industry trends compiler, and demographic buyer persona insights.",
    minRole: "Team Lead"
  },
  {
    id: "troubleshoot",
    labelEN: "Operational Troubleshooter",
    labelFR: "Outil de Diagnostic",
    badgeText: "TRIAGE",
    badgeColor: "bg-amber-600 text-white",
    iconName: "HelpCircle",
    description: "AI Diagnostic triage tool for campaign failures, low CTRs, or lead conversion bottlenecks.",
    minRole: "Executive"
  }
];

export const DEFAULT_ROLE_TABS: Record<string, ActiveTabType[]> = {
  Admin: [
    "enterprise-core", "user-management", "voice-conversations", "create-edit-images", "creative-studio", "digital-card", "marketplace", "seo", "campaign-commander", "ads-tracker",
    "campaign-generator", "marketing-strategist", "discovery", "dashboard",
    "analytics", "execution", "social", "crm", "advisor", "research", "troubleshoot"
  ],
  CEO: [
    "enterprise-core", "dashboard", "voice-conversations", "create-edit-images", "creative-studio", "digital-card", "campaign-commander", "marketing-strategist", "analytics",
    "ads-tracker", "crm", "marketplace"
  ],
  "Vice President": [
    "enterprise-core", "dashboard", "voice-conversations", "create-edit-images", "creative-studio", "digital-card", "campaign-commander", "marketing-strategist", "analytics",
    "ads-tracker", "crm", "marketplace", "seo"
  ],
  AGM: [
    "enterprise-core", "dashboard", "voice-conversations", "create-edit-images", "creative-studio", "digital-card", "campaign-commander", "ads-tracker", "crm", "seo",
    "campaign-generator", "marketing-strategist"
  ],
  "Marketing Manager": [
    "enterprise-core", "voice-conversations", "create-edit-images", "creative-studio", "digital-card", "campaign-commander", "campaign-generator", "seo", "ads-tracker",
    "social", "crm", "marketing-strategist", "advisor", "research"
  ],
  "Team Lead": [
    "enterprise-core", "voice-conversations", "create-edit-images", "creative-studio", "digital-card", "execution", "social", "seo", "crm", "troubleshoot", "research"
  ],
  Executive: [
    "enterprise-core", "voice-conversations", "create-edit-images", "creative-studio", "digital-card", "execution", "social", "crm", "troubleshoot"
  ]
};

export function getAllowedTabsForUser(role: string, customTabs?: string[]): ActiveTabType[] {
  if (role === "Admin") {
    return DEFAULT_ROLE_TABS.Admin;
  }
  if (customTabs && customTabs.length > 0) {
    return customTabs as ActiveTabType[];
  }
  return DEFAULT_ROLE_TABS[role] || DEFAULT_ROLE_TABS.Executive;
}
