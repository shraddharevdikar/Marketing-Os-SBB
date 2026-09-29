import { RoiAlert } from "../types";

export const initialRoiAlerts: RoiAlert[] = [
  {
    id: "ALERT-ROI-01",
    campaignId: "CMP-03",
    channelName: "LinkedIn Ads (B2B Sponsored)",
    type: "sudden_drop",
    severity: "critical",
    previousRoi: 300,
    currentRoi: 215,
    fluctuationPercentage: -28.3,
    timeframe: "Trailing 48h",
    thresholdTriggered: 15,
    timestamp: "Today, 08:30 AM",
    status: "action_required",
    recommendedAction: "Pause underperforming audience cluster with CPL >$85 and reallocate $1,500 budget to exact-match Google Search.",
    sourceMetric: "LinkedIn B2B Sponsored Ad Group #4",
    details: "Cost per lead surged by +63% while demo booking conversion rate dropped from 4.2% to 1.8%, causing net channel ROI to plunge from 300% to 215% (-28.3% sudden drop).",
    attributedImpactCad: 5920
  },
  {
    id: "ALERT-ROI-02",
    campaignId: "CMP-06",
    channelName: "TikTok Ads & Creator Hooks",
    type: "sudden_drop",
    severity: "warning",
    previousRoi: 220,
    currentRoi: 165,
    fluctuationPercentage: -25.0,
    timeframe: "Trailing 24h",
    thresholdTriggered: 15,
    timestamp: "Today, 06:15 AM",
    status: "action_required",
    recommendedAction: "Rotate fresh video creative assets and tighten localized targeting to high-converting Canadian metropolitan zip codes.",
    sourceMetric: "TikTok Video Hook Batch B",
    details: "Creative fatigue in top 2 video ads drove CPM up by 42% and hook retention rate down from 28% to 14%, resulting in a -25% sudden ROI compression over the past 24 hours.",
    attributedImpactCad: 1960
  },
  {
    id: "ALERT-ROI-03",
    campaignId: "CMP-02",
    channelName: "Meta Ads (Reels & Feed)",
    type: "sudden_spike",
    severity: "info",
    previousRoi: 280,
    currentRoi: 365,
    fluctuationPercentage: 30.4,
    timeframe: "Trailing 72h",
    thresholdTriggered: 20,
    timestamp: "Yesterday, 04:45 PM",
    status: "acknowledged",
    recommendedAction: "Scale winning commercial walkthrough reels budget by +25% before viral algorithmic decay.",
    sourceMetric: "Meta Reels Campaign #02",
    details: "Organic sharing on Toronto luxury penthouse tour creative triggered an unanticipated +30.4% surge in high-value inbound leads, outpacing modeled projections.",
    attributedImpactCad: 8400
  }
];

export const loadStoredRoiAlerts = (): RoiAlert[] => {
  try {
    const stored = localStorage.getItem("sbb_roi_fluctuation_alerts");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Failed to parse stored ROI alerts", err);
  }
  return initialRoiAlerts;
};

export const saveStoredRoiAlerts = (alerts: RoiAlert[]) => {
  try {
    localStorage.setItem("sbb_roi_fluctuation_alerts", JSON.stringify(alerts));
  } catch (err) {
    console.error("Failed to save ROI alerts", err);
  }
};
