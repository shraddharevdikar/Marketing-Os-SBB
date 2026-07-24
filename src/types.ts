export interface MarketingChannel {
  id: string;
  name: string;
  subtext: string;
  spend: number;
  active: boolean;
  adsCount: number;
  color: string;
  badge: string; // "FB", "YT", "GG", etc.
}

export interface AudienceVertical {
  id: string;
  name: string;
  share: number; // percentage (0 - 100)
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  goal: string;
  audience: string;
  budget: number;
  status: "Active" | "Paused" | "Completed";
  dateCreated: string;
}

export interface BusinessState {
  revenue: number;
  roasTarget: number;
  burnRate: number;
  leadScore: number;
  channels: MarketingChannel[];
  demographics: AudienceVertical[];
  campaigns: Campaign[];
}
