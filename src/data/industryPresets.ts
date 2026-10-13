export interface IndustryTemplate {
  id: string;
  name: string;
  icon: string;
  badge: string;
  description: string;
  companyProfile: {
    companyName: string;
    websiteUrl: string;
    sector: string;
    description: string;
    targetAudience: string;
    productsServices: string;
    usp: string;
    brandVoice: string;
    headquarters: string;
    teamSize: string;
    adBudget: number;
    goals: string[];
    complianceProfile: string;
    countriesServed: string;
    softwareStack: string;
  };
  sampleCampaigns: Array<{
    id: string;
    title: string;
    agent: string;
    agentName: string;
    budgetImpact: number;
    approvalRequiredFrom: string;
    status: string;
    createdAt: string;
    createdBy: string;
    approvedBy?: string;
    approvedAt?: string;
    comments: string;
    tactics: Array<{ tactic: string; status: string }>;
  }>;
  sampleLeads: Array<{
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    territory: string;
    source: string;
    serviceInterest: string;
    leadScore: number;
    status: string;
    leadOwner: string;
    notes: string;
  }>;
  composerPreset: {
    platform: string;
    tone: string;
    postCopy: string;
    hashtags: string;
    ctaText: string;
  };
}

export const INDUSTRY_PRESETS: IndustryTemplate[] = [
  {
    id: "b2b-saas",
    name: "B2B SaaS & Technology",
    icon: "Cpu",
    badge: "Cloud & Software",
    description: "Enterprise software, cloud infrastructure, AI platforms, and high-growth subscription tech.",
    companyProfile: {
      companyName: "Nexus Cloud AI Platform",
      websiteUrl: "https://nexuscloud.ai",
      sector: "B2B SaaS & Cloud Software",
      description: "Autonomous data orchestration and AI workflow automation engine for enterprise engineering and operations teams.",
      targetAudience: "Chief Technology Officers, VPs of Engineering, IT Directors, and Enterprise Cloud Architects.",
      productsServices: "Nexus Enterprise Orchestrator, Cloud Telemetry Suite, Automated API Integration Hub, SOC2 Security Gateway.",
      usp: "99.99% uptime guarantee, zero-code cloud integrations, and sub-10ms real-time data sync with SOC2 Type II certification.",
      brandVoice: "Authoritative, tech-forward, and data-driven with precise architectural clarity.",
      headquarters: "San Francisco, CA & Toronto, ON",
      teamSize: "50-200 employees",
      adBudget: 8500,
      goals: ["Scale Demo Bookings & SQLs", "Lower Cost Per Qualified Acquisition (CPA)", "Increase ARR Expansion"],
      complianceProfile: "SOC2 Type II, ISO 27001, GDPR & PIPEDA Certified",
      countriesServed: "Global / Worldwide (US, Canada, EU, UK, APAC)",
      softwareStack: "Salesforce, Snowflake, Segment, Google Ads & LinkedIn Ads"
    },
    sampleCampaigns: [
      {
        id: "WF-SAAS-01",
        title: "Q3 Enterprise Cloud Orchestration ABM Campaign",
        agent: "Campaign Commander",
        agentName: "SBB ABM Engine",
        budgetImpact: 2400,
        approvalRequiredFrom: "VP of Growth",
        status: "Approved",
        createdAt: "10:15 AM 10/01/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "10:45 AM 10/01/2026",
        comments: "Targeting Fortune 1000 CTOs and cloud architects with customized benchmark reports.",
        tactics: [
          { tactic: "LinkedIn InMail to VP Engineering tier", status: "Active" },
          { tactic: "Google Search exact match 'cloud data orchestration'", status: "Active" }
        ]
      },
      {
        id: "WF-SAAS-02",
        title: "Developer Documentation & Free Trial Retargeting",
        agent: "Social AI",
        agentName: "AI Social Campaign Engine",
        budgetImpact: 1100,
        approvalRequiredFrom: "Marketing Director",
        status: "Pending",
        createdAt: "02:00 PM 10/03/2026",
        createdBy: "Thomas TL Jenkins",
        comments: "Nurturing signups who started onboarding but have not integrated their first API key.",
        tactics: [
          { tactic: "Interactive Code Sandbox Video Ads", status: "Pending" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-SAAS-1",
        name: "Marcus Sterling",
        company: "Apex Fintech Global",
        email: "m.sterling@apexfintech.com",
        phone: "+1 (415) 555-0144",
        territory: "California (US)",
        source: "LinkedIn Sponsored InMail",
        serviceInterest: "Nexus Enterprise Orchestrator (1,000+ seats)",
        leadScore: 96,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Evaluating replacement for legacy ETL pipeline; budget approved for Q4 rollout."
      },
      {
        id: "LEAD-SAAS-2",
        name: "Sarah Lin",
        company: "BioHealth Systems",
        email: "slin@biohealthsystems.io",
        phone: "+1 (647) 555-0182",
        territory: "Ontario (Canada)",
        source: "Google Search Exact",
        serviceInterest: "Cloud Telemetry & Compliance Gateway",
        leadScore: 88,
        status: "Contacted",
        leadOwner: "Miriam Manager Mercer",
        notes: "Requested HIPAA and PIPEDA data residency verification documentation."
      }
    ],
    composerPreset: {
      platform: "LinkedIn Sponsored Post",
      tone: "High-Authority Enterprise SaaS",
      postCopy: "Tired of duct-taped data pipelines? Nexus Cloud AI automates enterprise data orchestration with sub-10ms latency and built-in SOC2 Type II compliance. Cut cloud sync costs by 34% while scaling to 10M+ events/sec. Request your architectural benchmark today.",
      hashtags: "#CloudArchitecture #DataEngineering #B2BSaaS #EnterpriseTech",
      ctaText: "Request Technical Benchmark"
    }
  },
  {
    id: "ecommerce-dtc",
    name: "E-Commerce & DTC Retail",
    icon: "ShoppingBag",
    badge: "Retail & Consumer",
    description: "Direct-to-consumer brands, lifestyle products, online stores, apparel, and omnichannel retail.",
    companyProfile: {
      companyName: "Lumina Organics & Wellness",
      websiteUrl: "https://luminaorganics.com",
      sector: "E-Commerce & DTC Consumer Goods",
      description: "Clean, sustainable plant-based skincare and daily wellness formulations shipped directly to over 150,000 global households.",
      targetAudience: "Eco-conscious consumers, wellness enthusiasts, and skincare shoppers aged 24-48 seeking non-toxic routines.",
      productsServices: "Lumina Restorative Facial Elixir, Pure Botanical Cleanser, Daily Mineral Shield SPF 50, Quarterly Subscription Box.",
      usp: "100% certified organic, plastic-neutral packaging, 30-day empty-bottle guarantee, and free 2-day climate-neutral shipping.",
      brandVoice: "Warm, empowering, transparent, and aesthetically refined.",
      headquarters: "Vancouver, BC & Seattle, WA",
      teamSize: "20-50 employees",
      adBudget: 12000,
      goals: ["Maximize Return on Ad Spend (Target 4.2x ROAS)", "Boost Subscription Retention (LTV)", "Slash Cart Abandonment Rate"],
      complianceProfile: "FDA Approved, Health Canada Verified, CCPA & GDPR Consumer Privacy",
      countriesServed: "North America, UK, Western Europe & Australia",
      softwareStack: "Shopify Plus, Klaviyo, Meta Ads, TikTok Shop & Google Shopping"
    },
    sampleCampaigns: [
      {
        id: "WF-ECOM-01",
        title: "Holiday Skincare Gift Bundle Meta & TikTok Blitz",
        agent: "Social AI",
        agentName: "AI Social Campaign Engine",
        budgetImpact: 3500,
        approvalRequiredFrom: "Marketing Manager",
        status: "Approved",
        createdAt: "09:00 AM 10/02/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "09:20 AM 10/02/2026",
        comments: "UGC video creator ads highlighting the 30-day glow transformation.",
        tactics: [
          { tactic: "TikTok Spark Ads with micro-influencers", status: "Active" },
          { tactic: "Instagram Carousel Bundle Discounts", status: "Active" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-ECOM-1",
        name: "Chloe Dupont",
        company: "Wholesale Boutique Network",
        email: "c.dupont@boutiquenet.ca",
        phone: "+1 (514) 555-0193",
        territory: "Quebec (Canada)",
        source: "Instagram DM Campaign",
        serviceInterest: "Retail Wholesale Distribution (50 store rollout)",
        leadScore: 92,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Looking to carry botanical skincare line across Montreal & Toronto locations."
      }
    ],
    composerPreset: {
      platform: "Instagram Reels & TikTok",
      tone: "Vibrant, Clean & Engaging DTC",
      postCopy: "Your skin barrier deserves better than 20-step chemical routines. 🌿 Meet Lumina's Pure Botanical Restorative Elixir: 100% organic, cold-pressed nutrients that restore deep hydration in just 7 days. Over 15,000 5-star reviews can't be wrong. Tap below for 20% off your first subscription order!",
      hashtags: "#CleanBeauty #OrganicSkincare #GlowRoutine #SustainableLiving",
      ctaText: "Shop the Glow Bundle (20% Off)"
    }
  },
  {
    id: "healthcare-medical",
    name: "Healthcare, Medical & Wellness",
    icon: "HeartPulse",
    badge: "Medical & Health",
    description: "Medical clinics, telehealth networks, dental groups, diagnostics, and pharmaceutical providers.",
    companyProfile: {
      companyName: "OmniCare Health & Diagnostics",
      websiteUrl: "https://omnicarehealth.com",
      sector: "Healthcare & Specialized Medical Services",
      description: "State-of-the-art diagnostic imaging, preventive telehealth, and specialized outpatient clinics across metropolitan centers.",
      targetAudience: "Patients seeking rapid diagnostic imaging, corporate wellness managers, and referring family physicians.",
      productsServices: "Advanced MRI & CT Diagnostics, Same-Day Telehealth Consultations, Executive Health Screenings, Chronic Care Management.",
      usp: "Zero-wait same-week appointments, board-certified radiologists, encrypted patient portal, and seamless insurance billing.",
      brandVoice: "Compassionate, scientifically rigorous, reassuring, and confidential.",
      headquarters: "Toronto, ON & Chicago, IL",
      teamSize: "100-300 employees",
      adBudget: 7500,
      goals: ["Increase Outpatient Consultation Bookings", "Expand Corporate Preventive Health Contracts", "Drive Local Geographic Patient Footprint"],
      complianceProfile: "HIPAA Compliant, PIPEDA Verified, Health Canada & CMS Accredited",
      countriesServed: "United States & Canada",
      softwareStack: "Epic EMR, Phreesia, Google Local Service Ads & Meta Healthcare Ads"
    },
    sampleCampaigns: [
      {
        id: "WF-HEALTH-01",
        title: "Local Geographic Same-Day MRI Booking Campaign",
        agent: "SEO Brain",
        agentName: "SBB Local GEO Engine",
        budgetImpact: 1800,
        approvalRequiredFrom: "Medical Director",
        status: "Approved",
        createdAt: "11:00 AM 10/01/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "11:30 AM 10/01/2026",
        comments: "Hyper-localized Google search terms for rapid diagnostic imaging.",
        tactics: [
          { tactic: "Google Local Service Ads for metro radiology", status: "Active" },
          { tactic: "Physician Referral Direct Portal Outreach", status: "Active" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-HEALTH-1",
        name: "Dr. Robert Chen",
        company: "Metro Medical Family Practice",
        email: "rchen@metromedical.ca",
        phone: "+1 (416) 555-0129",
        territory: "Ontario (Canada)",
        source: "Physician Referral Network",
        serviceInterest: "Priority Outpatient Diagnostic Imaging Referrals",
        leadScore: 94,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Practice handles 800+ active patients requiring regular MRI and ultrasound imaging."
      }
    ],
    composerPreset: {
      platform: "Google Search & Facebook Ads",
      tone: "Reassuring, Medical Authority & Caring",
      postCopy: "Waiting months for crucial medical scans shouldn't be the norm. At OmniCare Health, get scheduled for advanced 3T MRI and CT imaging in under 48 hours with board-certified radiologist reports delivered directly to your doctor. Fully accredited, compassionate care.",
      hashtags: "#PreventiveHealth #MedicalDiagnostics #PatientCare #HealthTech",
      ctaText: "Schedule Same-Week Scan"
    }
  },
  {
    id: "finance-fintech",
    name: "Financial Services & FinTech",
    icon: "DollarSign",
    badge: "Finance & Wealth",
    description: "Wealth management, commercial lending, accounting firms, investment advisory, and FinTech.",
    companyProfile: {
      companyName: "Vanguard Sovereign Wealth Partners",
      websiteUrl: "https://vanguardsovereign.com",
      sector: "Financial Advisory & Wealth Management",
      description: "Bespoke wealth preservation, private equity syndication, and tax-efficient portfolio management for high-net-worth families and founders.",
      targetAudience: "Business founders, tech executives with liquidity events, accredited investors, and family offices.",
      productsServices: "Discretionary Portfolio Management, Tax & Estate Planning, Private Credit Opportunities, Cross-Border Wealth Structuring.",
      usp: "Fiduciary-first transparent fee structure, multi-jurisdiction tax optimization, and direct access to private market deal flows.",
      brandVoice: "Sophisticated, discreet, analytical, and uncompromisingly compliant.",
      headquarters: "New York, NY & Montreal, QC",
      teamSize: "25-75 employees",
      adBudget: 9000,
      goals: ["Attract Qualified Accredited Investors ($2M+ AUM)", "Host High-Value Private Capital Webinars", "Comply with SEC & FINRA Advertising Standards"],
      complianceProfile: "SEC Registered, FINRA & IIROC Compliant, PIPEDA & SOC2 Audited",
      countriesServed: "United States, Canada & United Kingdom",
      softwareStack: "Black Diamond, Addepar, Salesforce Financial Services & LinkedIn ABM"
    },
    sampleCampaigns: [
      {
        id: "WF-FIN-01",
        title: "Founder Liquidity & Post-Exit Wealth Structuring ABM",
        agent: "Campaign Commander",
        agentName: "SBB Wealth ABM Engine",
        budgetImpact: 2800,
        approvalRequiredFrom: "Chief Compliance Officer",
        status: "Approved",
        createdAt: "08:30 AM 10/02/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "09:00 AM 10/02/2026",
        comments: "Strict adherence to SEC marketing rules with disclaimer footers.",
        tactics: [
          { tactic: "Executive Thought Leadership on Cross-Border Taxes", status: "Active" },
          { tactic: "Private Founder Dinner Invitations (Invite-only)", status: "Active" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-FIN-1",
        name: "David K. Ross",
        company: "Ross Industrial Logistics",
        email: "david@rossindustrial.com",
        phone: "+1 (212) 555-0177",
        territory: "New York (US)",
        source: "Executive Dinner Roundtable",
        serviceInterest: "Discretionary Asset Management ($12M Liquidity Event)",
        leadScore: 98,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Completed sale of logistics firm; seeking diversified tax-exempt portfolio."
      }
    ],
    composerPreset: {
      platform: "LinkedIn Executive Article",
      tone: "Discreet, Highly Sophisticated & Fiduciary",
      postCopy: "A liquidity event is only the beginning. Without proactive cross-border tax architecture and private credit diversification, inflation and regulatory shifts can erode capital rapidly. Discover the 4 portfolio defenses modern founders use to preserve multi-generational wealth.",
      hashtags: "#WealthManagement #PrivateWealth #FamilyOffice #FounderExit",
      ctaText: "Request Confidential Wealth Brief"
    }
  },
  {
    id: "professional-services",
    name: "Professional Services & Consulting",
    icon: "Briefcase",
    badge: "Legal & Consulting",
    description: "Corporate law firms, accounting & tax consultancies, management consulting, and marketing agencies.",
    companyProfile: {
      companyName: "Stratum Global Advisory Partners",
      websiteUrl: "https://stratumglobal.com",
      sector: "Enterprise Consulting & Strategic Advisory",
      description: "Senior management consulting specializing in cross-border M&A advisory, operational efficiency, and digital transformation.",
      targetAudience: "Mid-market enterprise CEOs, Private Equity operating partners, and corporate boards.",
      productsServices: "M&A Due Diligence, Organizational Restructuring, Digital Operations Overhaul, Executive Transition Advisory.",
      usp: "Ex-McKinsey/Bain senior partner oversight on every engagement, outcome-linked fee models, and 12-week ROI turnaround.",
      brandVoice: "Strategic, incisive, executive-level, and results-obsessed.",
      headquarters: "Chicago, IL & Toronto, ON",
      teamSize: "30-100 employees",
      adBudget: 6500,
      goals: ["Secure Retainer Engagements with $20M+ Enterprises", "Publish Quarterly Industry Benchmark Reports", "Lower CAC on Executive Inbound Proposals"],
      complianceProfile: "Strict Professional Privilege, NDA & CASL Compliant",
      countriesServed: "United States, Canada & Western Europe",
      softwareStack: "HubSpot Enterprise, LinkedIn Sales Navigator & Google Workspace"
    },
    sampleCampaigns: [
      {
        id: "WF-CONS-01",
        title: "2026 M&A Integration Playbook Content Syndicate",
        agent: "Research Portal",
        agentName: "SBB Intelligence Engine",
        budgetImpact: 1900,
        approvalRequiredFrom: "Managing Partner",
        status: "Approved",
        createdAt: "01:15 PM 10/01/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "01:45 PM 10/01/2026",
        comments: "Gated executive report generating qualified C-suite consultation requests.",
        tactics: [
          { tactic: "LinkedIn ABM to PE Operating Partners", status: "Active" },
          { tactic: "Direct outreach to corporate development VPs", status: "Active" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-CONS-1",
        name: "Evelyn Sterling",
        company: "Beacon Manufacturing Holdings",
        email: "evelyn.s@beaconholdings.com",
        phone: "+1 (312) 555-0155",
        territory: "Illinois (US)",
        source: "M&A Playbook Download",
        serviceInterest: "Post-Merger Operational Integration ($80M Acquisition)",
        leadScore: 95,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Board requested external integration counsel to accelerate synergy realization."
      }
    ],
    composerPreset: {
      platform: "LinkedIn Thought Leadership",
      tone: "Analytical, Strategic & Direct",
      postCopy: "70% of M&A integrations fail to hit projected synergies within the first 18 months. The culprit? Fragmented operating cultures and delayed system consolidation. Our 2026 M&A Playbook reveals the exact 90-day integration framework private equity leaders use to protect deal value.",
      hashtags: "#MergersAndAcquisitions #ManagementConsulting #CorporateStrategy #PrivateEquity",
      ctaText: "Download Executive Playbook"
    }
  },
  {
    id: "real-estate",
    name: "Real Estate & Property Development",
    icon: "Building2",
    badge: "Property & Estates",
    description: "Residential brokerages, luxury developments, commercial leasing, and architecture firms.",
    companyProfile: {
      companyName: "Sovereign Luxury Real Estate Partners",
      websiteUrl: "https://sovereignluxuryrealty.com",
      sector: "Luxury Real Estate & Development",
      description: "Premier luxury residential penthouses, architectural estates, and high-value commercial real estate across top metropolitan centers.",
      targetAudience: "High-net-worth individuals, international relocation buyers, property investors, and family offices.",
      productsServices: "Luxury Waterfront Condos, Private Penthouse Sales, Pre-Construction Advisory, Commercial Property Leasing.",
      usp: "Exclusive off-market pocket listings, 4K aerial cinematic marketing, and private jet/VIP viewing concierge.",
      brandVoice: "Opulent, architectural, prestigious, and deeply exclusive.",
      headquarters: "Toronto, ON & New York, NY",
      teamSize: "15-40 employees",
      adBudget: 6000,
      goals: ["Capture Qualified High-Net-Worth Buyer Leads", "Sell Out Luxury Pre-Construction Allocations", "Rank #1 in Regional Luxury Real Estate SEO"],
      complianceProfile: "RECO, CREA, Fair Housing Act & PIPEDA Compliant",
      countriesServed: "Canada, United States & Global Relocations",
      softwareStack: "Follow Up Boss, Meta Ads, Google Ads & Matterport 3D"
    },
    sampleCampaigns: [
      {
        id: "WF-RE-01",
        title: "Waterfront Penthouse Luxury Preview Campaign",
        agent: "Social AI",
        agentName: "AI Social Campaign Engine",
        budgetImpact: 1400,
        approvalRequiredFrom: "Broker of Record",
        status: "Approved",
        createdAt: "10:00 AM 10/02/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "10:20 AM 10/02/2026",
        comments: "Targeting verified accredited investors and luxury lifestyle followers.",
        tactics: [
          { tactic: "Instagram Reels 4K Architecture Tour", status: "Active" },
          { tactic: "Google Search exact 'luxury penthouse toronto'", status: "Active" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-RE-1",
        name: "Alexander Vance",
        company: "Vance Capital Group",
        email: "a.vance@vancecapital.ca",
        phone: "+1 (416) 555-0192",
        territory: "Ontario (Canada)",
        source: "Instagram Reels Tour",
        serviceInterest: "Waterfront Luxury Penthouse ($4.2M CAD)",
        leadScore: 94,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Requested private twilight viewing with private elevator demonstration."
      }
    ],
    composerPreset: {
      platform: "Instagram Reels & Architectural Digest",
      tone: "Opulent, Elegant & Exclusive Luxury",
      postCopy: "Discover unobstructed panoramic skyline and lakefront views. Step inside this 3,200 sq.ft custom penthouse featuring private elevator access, floor-to-ceiling Italian marble, and a private 800 sq.ft heated terrace. Exclusively listed with Sovereign Luxury Partners.",
      hashtags: "#LuxuryRealEstate #PenthouseLiving #ArchitectureLovers #WaterfrontEstate",
      ctaText: "Book Private Twilight VIP Tour"
    }
  },
  {
    id: "manufacturing-industrial",
    name: "Manufacturing, Logistics & B2B Supply",
    icon: "Factory",
    badge: "Industrial & Supply",
    description: "OEM manufacturers, precision tooling, supply chain logistics, wholesale distributors, and industrial equipment.",
    companyProfile: {
      companyName: "Precision Industrial Components Corp",
      websiteUrl: "https://precisionindustrialcorp.com",
      sector: "B2B Manufacturing & Precision Engineering",
      description: "ISO 9001 certified precision CNC machining, rapid prototyping, and automated contract manufacturing for aerospace, medical, and automotive sectors.",
      targetAudience: "Procurement directors, supply chain VPs, mechanical design engineers, and industrial plant managers.",
      productsServices: "5-Axis CNC Precision Machining, Rapid Prototyping, Metal Stamping, Automated Production Assembly.",
      usp: "ISO 9001 & AS9100D certified, guaranteed +/- 0.0002 tolerance, 3-day prototype turnaround, and domestic supply reliability.",
      brandVoice: "Rigorous, reliable, technically exact, and engineered for performance.",
      headquarters: "Detroit, MI & Hamilton, ON",
      teamSize: "75-250 employees",
      adBudget: 5500,
      goals: ["Generate RFQ (Request for Quote) Volume", "Secure Multi-Year OEM Supplier Contracts", "Diversify Beyond Automotive into Aerospace & Medical"],
      complianceProfile: "ISO 9001, AS9100D, ITAR Registered & OSHA Compliant",
      countriesServed: "United States, Canada & Mexico (USMCA)",
      softwareStack: "JobBOSS, ThomasNet, Google Search & LinkedIn ABM"
    },
    sampleCampaigns: [
      {
        id: "WF-MFG-01",
        title: "Aerospace Precision CNC Rapid Prototype RFQ Drive",
        agent: "Campaign Commander",
        agentName: "SBB Industrial RFQ Engine",
        budgetImpact: 1600,
        approvalRequiredFrom: "VP of Sales",
        status: "Approved",
        createdAt: "09:30 AM 10/01/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "10:00 AM 10/01/2026",
        comments: "Focusing on rapid turnaround prototypes for Tier 1 aerospace suppliers.",
        tactics: [
          { tactic: "Google Search exact match 'custom CNC machining RFQ'", status: "Active" },
          { tactic: "ThomasNet verified supplier banner placements", status: "Active" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-MFG-1",
        name: "Gary Thornton",
        company: "AeroDynamics Propulsion Ltd",
        email: "gthornton@aeropropulsion.com",
        phone: "+1 (313) 555-0168",
        territory: "Michigan (US)",
        source: "Google Search Exact",
        serviceInterest: "Titanium 5-Axis Machining (5,000 unit production run)",
        leadScore: 97,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Uploaded technical CAD drawings for immediate quote review."
      }
    ],
    composerPreset: {
      platform: "LinkedIn Industrial & Trade Media",
      tone: "Engineered, Exact & Quality-Obsessed",
      postCopy: "Tolerances down to +/- 0.0002 inches. When failure isn't an option in aerospace and medical devices, engineers trust Precision Industrial Corp. From rapid prototype in 72 hours to 50,000-unit certified production runs. Upload your CAD file today for a same-day engineering review.",
      hashtags: "#PrecisionMachining #AdvancedManufacturing #CNCMachining #IndustrialEngineering",
      ctaText: "Upload CAD for Instant RFQ"
    }
  },
  {
    id: "hospitality-travel",
    name: "Hospitality, Travel & Luxury Resorts",
    icon: "Utensils",
    badge: "Hospitality & Travel",
    description: "Boutique hotels, luxury destination resorts, culinary brands, travel management, and experiential tourism.",
    companyProfile: {
      companyName: "Solara Luxury Resorts & Escapes",
      websiteUrl: "https://solararesorts.com",
      sector: "Hospitality & Experiential Tourism",
      description: "Collection of eco-luxury wilderness lodges and private island retreats offering bespoke culinary experiences and private wellness.",
      targetAudience: "Luxury leisure travelers, honeymooners, corporate executive retreat organizers, and wellness seekers.",
      productsServices: "Private Cliffside Villas, Michelin-Trained Chef Dining, All-Inclusive Wellness Escapes, Corporate Executive Buyouts.",
      usp: "Exclusive 100% private island access, dedicated personal concierge, carbon-neutral operations, and bespoke itineraries.",
      brandVoice: "Inspiring, restorative, indulgent, and evocative of tranquil luxury.",
      headquarters: "Miami, FL & Banff, AB",
      teamSize: "40-120 employees",
      adBudget: 9500,
      goals: ["Increase Direct Online Bookings (Avoid OTA Commission)", "Sell Out High-Season Villa Reservations", "Drive Private Executive Retreat Buyouts"],
      complianceProfile: "PCI-DSS Level 1, GDPR & PIPEDA Verified",
      countriesServed: "Global / Worldwide (US, Canada, UK, Europe, Latin America)",
      softwareStack: "Opera Cloud PMS, Meta Travel Ads, Google Hotel Ads & Klaviyo"
    },
    sampleCampaigns: [
      {
        id: "WF-HOSP-01",
        title: "Winter Wilderness Wellness Escape Direct Booking Blitz",
        agent: "Social AI",
        agentName: "AI Social Campaign Engine",
        budgetImpact: 2200,
        approvalRequiredFrom: "General Manager",
        status: "Approved",
        createdAt: "02:00 PM 10/02/2026",
        createdBy: "Miriam Manager Mercer",
        approvedBy: "John CEO Smith (CEO)",
        approvedAt: "02:25 PM 10/02/2026",
        comments: "Targeting affluent urban couples looking for restorative nature getaways.",
        tactics: [
          { tactic: "Meta Cinematic Video Ads with complimentary spa credit", status: "Active" },
          { tactic: "Google Travel Ads targeting direct luxury booking", status: "Active" }
        ]
      }
    ],
    sampleLeads: [
      {
        id: "LEAD-HOSP-1",
        name: "Jessica Miller",
        company: "Venture Partners Global",
        email: "jmiller@vpglobal.com",
        phone: "+1 (305) 555-0184",
        territory: "Florida (US)",
        source: "Meta Video Ad",
        serviceInterest: "Full Resort Buyout for Annual Partner Retreat (45 guests)",
        leadScore: 96,
        status: "Qualified",
        leadOwner: "Victoria VP Hastings",
        notes: "Requires private chef dining, keynote presentation amphitheater, and wellness spa access."
      }
    ],
    composerPreset: {
      platform: "Instagram Reels & Travel Showcase",
      tone: "Evocative, Restorative & Refined Luxury",
      postCopy: "Escape the noise. Wake up to panoramic mountain vistas, cedar hot springs under the stars, and hyper-local farm-to-table culinary artistry. Book your private villa direct with Solara Resorts and receive a complimentary $500 wellness spa credit.",
      hashtags: "#LuxuryTravel #BoutiqueResort #WellnessEscape #Wanderlust",
      ctaText: "Reserve Your Private Villa Escape"
    }
  }
];

export const getTemplateById = (id: string): IndustryTemplate => {
  return INDUSTRY_PRESETS.find(p => p.id === id) || INDUSTRY_PRESETS[0];
};
