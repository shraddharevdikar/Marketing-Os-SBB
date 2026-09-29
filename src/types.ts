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

export interface RoiAlert {
  id: string;
  campaignId?: string;
  channelName: string;
  type: "sudden_drop" | "sudden_spike" | "volatility_surge";
  severity: "critical" | "warning" | "info";
  previousRoi: number; // percentage, e.g. 300
  currentRoi: number;  // percentage, e.g. 215
  fluctuationPercentage: number; // percentage change, e.g. -28.3
  timeframe: string; // e.g. "Trailing 24h"
  thresholdTriggered: number; // e.g. 15
  timestamp: string;
  status: "action_required" | "acknowledged" | "resolved";
  recommendedAction: string;
  sourceMetric: string;
  details: string;
  attributedImpactCad: number;
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
