export interface AdAccountConfig {
  id: string;
  name: string;
  platform: string;
  category: "Ads" | "CRM";
  status: "Connected" | "Configured" | "Disconnected";
  accountId: string;
  apiKey: string;
  accessToken: string;
  lastSynced: string;
  latency: string;
  activeAccountName: string;
  iconBg: string;
  authType?: "OAuth 2.0" | "API Key" | "System Access Token";
  channelType?: "google" | "meta" | "linkedin" | "tiktok" | "youtube" | "salesforce" | "hubspot";
}

export const initialAdAccounts: AdAccountConfig[] = [
  {
    id: "googleAds",
    name: "Google Ads Account",
    platform: "Google Search, PMax & YouTube",
    category: "Ads",
    channelType: "google",
    authType: "OAuth 2.0",
    status: "Connected",
    accountId: "849-204-9841",
    apiKey: "••••••••••••9841",
    accessToken: "ya29.a0ARdaC7mX8-GoogleAdsLiveOAuth2Token",
    lastSynced: "Just now",
    latency: "14ms",
    activeAccountName: "Sovereign SaaS - Google Ads Global",
    iconBg: "bg-blue-600"
  },
  {
    id: "metaAds",
    name: "Meta Ads Manager",
    platform: "Instagram Reels, Facebook Feed & Messenger",
    category: "Ads",
    channelType: "meta",
    authType: "OAuth 2.0",
    status: "Connected",
    accountId: "ACT-392019284",
    apiKey: "••••••••••••EAAG",
    accessToken: "EAAx8201938-MetaMarketingApiPermanentToken",
    lastSynced: "2 mins ago",
    latency: "18ms",
    activeAccountName: "Sovereign FB/IG Business Suite",
    iconBg: "bg-indigo-600"
  },
  {
    id: "linkedIn",
    name: "LinkedIn Campaign Manager",
    platform: "B2B Sponsored Content & InMail ABM",
    category: "Ads",
    channelType: "linkedin",
    authType: "OAuth 2.0",
    status: "Connected",
    accountId: "LNK-8821903",
    apiKey: "••••••••••••8821",
    accessToken: "AQV90283-LinkedInMarketingSolutionsOAuthToken",
    lastSynced: "5 mins ago",
    latency: "22ms",
    activeAccountName: "Executive ABM High-Intent Channel",
    iconBg: "bg-sky-700"
  },
  {
    id: "tikTok",
    name: "TikTok Ads Manager",
    platform: "Short-form Creator Hooks & In-Feed Video",
    category: "Ads",
    channelType: "tiktok",
    authType: "OAuth 2.0",
    status: "Disconnected",
    accountId: "TT-UNCONFIGURED",
    apiKey: "",
    accessToken: "",
    lastSynced: "Never",
    latency: "--",
    activeAccountName: "Click to Connect TikTok Business",
    iconBg: "bg-slate-900"
  },
  {
    id: "youtubeAds",
    name: "YouTube Advertising",
    platform: "Pre-Roll, Discovery & Shorts Ads",
    category: "Ads",
    channelType: "youtube",
    authType: "OAuth 2.0",
    status: "Connected",
    accountId: "YT-9182-4190",
    apiKey: "••••••••••••4190",
    accessToken: "ya29.a0YT-YouTubeBrandDirectChannelAccess",
    lastSynced: "12 mins ago",
    latency: "20ms",
    activeAccountName: "Sovereign YouTube Pre-Roll Channel",
    iconBg: "bg-red-600"
  },
  {
    id: "salesforce",
    name: "Salesforce CRM Attribution",
    platform: "Opportunity Pipeline & Lead Stage Sync",
    category: "CRM",
    channelType: "salesforce",
    authType: "System Access Token",
    status: "Connected",
    accountId: "SFDC-ORG-0129",
    apiKey: "••••••••••••0129",
    accessToken: "00D500000-EnterpriseSalesforceSyncToken",
    lastSynced: "1 min ago",
    latency: "16ms",
    activeAccountName: "Enterprise Salesforce Sync",
    iconBg: "bg-blue-500"
  },
  {
    id: "hubspot",
    name: "HubSpot Marketing Hub",
    platform: "Form Submissions & Lifecycle Attribution",
    category: "CRM",
    channelType: "hubspot",
    authType: "API Key",
    status: "Connected",
    accountId: "HS-PORTAL-7731",
    apiKey: "••••••••••••7731",
    accessToken: "pat-na1-89102-HubspotPrivateAppToken",
    lastSynced: "4 mins ago",
    latency: "19ms",
    activeAccountName: "Inbound Marketing Hub",
    iconBg: "bg-orange-600"
  }
];

export const loadStoredAdAccounts = (): AdAccountConfig[] => {
  try {
    const stored = localStorage.getItem("sbb_ad_accounts_vault");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load stored ad accounts vault:", e);
  }
  return initialAdAccounts;
};

export const saveStoredAdAccounts = (accounts: AdAccountConfig[]) => {
  try {
    localStorage.setItem("sbb_ad_accounts_vault", JSON.stringify(accounts));
  } catch (e) {
    console.warn("Failed to persist ad accounts vault:", e);
  }
};
