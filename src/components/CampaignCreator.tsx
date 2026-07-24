import React, { useState } from "react";
import { Sparkles, Send, Share2, CheckCircle2, MessageSquare, Image, ThumbsUp } from "lucide-react";

interface CampaignCreatorProps {
  userName?: string;
  currentRole?: string;
  onLogAction?: (action: string, details: string) => void;
  companyProfile?: any;
  onClose?: () => void;
  onCampaignCreated?: (campaign: any) => void;
}

export const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  userName = "User",
  currentRole = "CEO",
  onLogAction,
  companyProfile = {} as any
}) => {
  const [platform, setPlatform] = useState("Instagram Reels");
  const [postCopy, setPostCopy] = useState("Discover Toronto luxury waterfront penthouses with floor-to-ceiling skyline views. Book a private tour with John & Jan Real Estate today.");
  const [hashtags, setHashtags] = useState("#TorontoRealEstate #LuxuryPenthouse #GTAProperties #JohnAndJan");
  const [isScheduled, setIsScheduled] = useState(false);

  const handleSchedule = () => {
    setIsScheduled(true);
    if (onLogAction) {
      onLogAction("Scheduled AI Social Post", `Scheduled ${platform} campaign for ${companyProfile.companyName || "John & Jan Real Estate"}.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-indigo-600 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            SBB AI Social Campaign Engine
          </span>
          <span className="text-slate-400 text-xs">• Cross-Platform Synthesizer</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">
          Automated Social Media Ad Creator
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Synthesize high-converting ad copy, visual carousel hooks, and CASL-compliant opt-in links for Instagram, Meta, and LinkedIn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Campaign Content Controls</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Social Network</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Instagram Reels">Instagram Reels / Feed Carousel</option>
              <option value="Meta Ads">Meta Facebook Sponsored Post</option>
              <option value="LinkedIn ABM">LinkedIn Professional ABM Ad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">AI Generated Ad Copy</label>
            <textarea
              rows={4}
              value={postCopy}
              onChange={(e) => setPostCopy(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Hashtags & Keywords</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <button
            onClick={handleSchedule}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            {isScheduled ? "✓ Campaign Dispatch Scheduled" : "Schedule Autonomous Social Dispatch"}
          </button>
        </div>

        {/* Live Ad Mockup */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-500 uppercase">Live Social Preview ({platform})</h3>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                JJ
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{companyProfile.companyName || "John & Jan Real Estate"}</p>
                <p className="text-[10px] text-slate-400 font-mono">Sponsored • Toronto, ON</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{postCopy}</p>

            <div className="h-44 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-xs font-mono">
              [Luxury Penthouse Visual Asset Preview]
            </div>

            <p className="text-[11px] font-mono text-indigo-600 font-bold">{hashtags}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCreator;
