import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Share2,
  CheckCircle2,
  MessageSquare,
  Image as ImageIcon,
  ThumbsUp,
  Vault,
  Bot,
  Calendar,
  Inbox,
  BarChart3,
  TrendingUp,
  Zap,
  RefreshCw,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Plus,
  AlertTriangle,
  ChevronRight,
  Eye,
  Lock,
  Radio,
  Sliders,
  Check,
  X,
  FileText,
  Users,
  Target,
  ArrowUpRight,
  MousePointer
} from "lucide-react";

interface CampaignCreatorProps {
  userName?: string;
  currentRole?: string;
  onLogAction?: (action: string, details: string) => void;
  companyProfile?: any;
  onClose?: () => void;
  onCampaignCreated?: (campaign: any) => void;
}

type TabType = "vault" | "autopilot" | "composer" | "planner" | "inbox" | "reports";

export const CampaignCreator: React.FC<CampaignCreatorProps> = ({
  userName = "User",
  currentRole = "CEO",
  onLogAction,
  companyProfile = {}
}) => {
  const companyName = (companyProfile as any)?.companyName || "John & Jan Real Estate";
  const [activeSubTab, setActiveSubTab] = useState<TabType>("composer");

  // Toast Notification State
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    type?: "success" | "info";
  } | null>(null);

  const triggerToast = (
    message: string, 
    actionLabel?: string, 
    onAction?: () => void,
    type: "success" | "info" = "success"
  ) => {
    setToastNotification({ message, actionLabel, onAction, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  // State: AI Content Composer
  const [composerPlatform, setComposerPlatform] = useState("Instagram Reels");
  const [tone, setTone] = useState("Luxury Real Estate");
  const [postCopy, setPostCopy] = useState(
    `Discover Toronto's finest luxury waterfront penthouses with floor-to-ceiling skyline views. Featuring private elevator access, custom Italian marble, and panoramic Lake Ontario sunsets. Book your exclusive VIP tour with ${companyName} today.`
  );
  const [hashtags, setHashtags] = useState("#TorontoRealEstate #LuxuryPenthouse #GTALiving #WaterfrontProperty");
  const [ctaText, setCtaText] = useState("Book Private VIP Tour");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const sampleImages = [
    { name: "Waterfront Penthouse Skyline", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80" },
    { name: "Modern Architectural Interior", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" },
    { name: "Executive High-Rise Terrace", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" }
  ];

  // State: Sovereign Vault (3-Stage Reports)
  const [vaultStageFilter, setVaultStageFilter] = useState<"all" | "stage1" | "stage2" | "stage3">("all");
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultItems, setVaultItems] = useState([
    {
      id: "VLT-101",
      title: "Q3 Waterfront Luxury Penthouse Spotlight",
      platform: "Instagram Reels",
      stage: 3,
      stageLabel: "Stage 3: Sovereign Vaulted",
      complianceScore: "100%",
      caslVerified: true,
      hash: "0x8f2a...9c1b",
      createdDate: "2026-07-22",
      securityLevel: "High Security"
    },
    {
      id: "VLT-102",
      title: "CASL Opt-In Lead Magnet: GTA Market Report",
      platform: "LinkedIn ABM",
      stage: 2,
      stageLabel: "Stage 2: Peer Review Pending",
      complianceScore: "98%",
      caslVerified: true,
      hash: "0x3e1d...4a8f",
      createdDate: "2026-07-23",
      securityLevel: "Executive Clearance"
    },
    {
      id: "VLT-103",
      title: "Meta Sponsored Post - Yorkville Penthouse Tour",
      platform: "Meta Ads",
      stage: 1,
      stageLabel: "Stage 1: Pre-Compliance Draft",
      complianceScore: "95%",
      caslVerified: false,
      hash: "0x7c9b...1e2a",
      createdDate: "2026-07-24",
      securityLevel: "Standard Draft"
    }
  ]);

  // State: AI Autopilot Hub
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [cadence, setCadence] = useState("Every 6 Hours (Peak Engagement)");
  const [autoRefineCopy, setAutoRefineCopy] = useState(true);
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [caslFooterInject, setCaslFooterInject] = useState(true);
  const [crmLeadRoute, setCrmLeadRoute] = useState(true);

  const [autopilotLogs, setAutopilotLogs] = useState([
    { id: 1, time: "10:14 AM", action: "Auto-published Instagram Reel", detail: "Scored 98.4% engagement index on Toronto Luxury segment", status: "Success" },
    { id: 2, time: "08:30 AM", action: "Optimized Meta Ads Budget", detail: "Scaled daily spend +15% based on 5.2% CTR outlier", status: "Optimized" },
    { id: 3, time: "07:00 AM", action: "CASL & PIPEDA Compliance Audit", detail: "Verified double opt-in footer links across 4 active streams", status: "Verified" }
  ]);

  // State: Editorial Planner
  const [scheduledPosts, setScheduledPosts] = useState([
    {
      id: "SCH-01",
      title: "Yorkville Luxury Penthouse Reel",
      platform: "Instagram Reels",
      date: "2026-07-25",
      time: "10:00 AM EST",
      status: "Scheduled",
      hashtags: "#Yorkville #TorontoLuxury"
    },
    {
      id: "SCH-02",
      title: "GTA Commercial Property ABM Pulse",
      platform: "LinkedIn ABM",
      date: "2026-07-28",
      time: "02:00 PM EST",
      status: "Scheduled",
      hashtags: "#GTACommercial #B2BRealEstate"
    }
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDate, setNewPostDate] = useState("2026-07-26");
  const [newPostTime, setNewPostTime] = useState("11:30 AM EST");

  // State: Monitoring & Inbox
  const [inboxMessages, setInboxMessages] = useState([
    {
      id: "MSG-01",
      user: "Michael Vance (Managing Partner)",
      platform: "LinkedIn DM",
      message: "Saw your Yorkville penthouse listing. Can you send over the CAD $3.8M disclosure package and floor plan?",
      time: "12 mins ago",
      sentiment: "High Intent Lead",
      unread: true,
      caslAlert: false,
      routedToHubspot: false,
      hubspotDealId: undefined
    },
    {
      id: "MSG-02",
      user: "Sarah Jenkins",
      platform: "Instagram Reel Comment",
      message: "Is this waterfront penthouse still available for private viewings next weekend?",
      time: "45 mins ago",
      sentiment: "Inquiry",
      unread: true,
      caslAlert: false,
      routedToHubspot: false,
      hubspotDealId: undefined
    },
    {
      id: "MSG-03",
      user: "Compliance Monitor System",
      platform: "CASL Audit Alert",
      message: "User requested double opt-in consent receipt copy via footer link #CASL-9981.",
      time: "2 hours ago",
      sentiment: "CASL Audit Alert",
      unread: false,
      caslAlert: true,
      routedToHubspot: false,
      hubspotDealId: undefined
    }
  ]);

  const [selectedMsg, setSelectedMsg] = useState<any>(inboxMessages[0]);
  const [replyText, setReplyText] = useState("");

  // HubSpot Lead Modal State
  const [showHubspotModal, setShowHubspotModal] = useState(false);
  const [hubspotForm, setHubspotForm] = useState({
    contactName: "",
    email: "",
    company: "",
    sourceChannel: "",
    dealValue: "3,800,000",
    leadScore: "94/100 (Hot Prospect)",
    lifecycleStage: "Opportunity / High Intent",
    notes: "",
    caslConsent: true
  });
  const [isSyncingHubspot, setIsSyncingHubspot] = useState(false);

  const handleOpenHubspotModal = (msg: any) => {
    if (!msg) return;
    const cleanName = msg.user.split("(")[0].trim();
    const handleEmail = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "") + "@sovereign-lead.com";
    setHubspotForm({
      contactName: msg.user,
      email: handleEmail,
      company: companyName,
      sourceChannel: msg.platform,
      dealValue: "3,800,000",
      leadScore: msg.sentiment === "High Intent Lead" ? "94/100 (Hot Prospect)" : "82/100 (Qualified)",
      lifecycleStage: "Opportunity / High Intent",
      notes: msg.message,
      caslConsent: true
    });
    setShowHubspotModal(true);
  };

  const handleConfirmSyncHubspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg) return;
    setIsSyncingHubspot(true);

    setTimeout(() => {
      const dealId = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
      setInboxMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMsg.id
            ? { ...m, routedToHubspot: true, hubspotDealId: dealId }
            : m
        )
      );
      setSelectedMsg((prev: any) =>
        prev ? { ...prev, routedToHubspot: true, hubspotDealId: dealId } : null
      );
      setIsSyncingHubspot(false);
      setShowHubspotModal(false);

      if (onLogAction) {
        onLogAction(
          "Routed Lead to HubSpot CRM",
          `Created Contact & Deal ${dealId} for ${selectedMsg.user} in HubSpot Portal HS-PORTAL-7731.`
        );
      }

      triggerToast(
        `✓ Lead ${selectedMsg.user} routed to HubSpot CRM (Deal #${dealId})!`,
        "View Reports",
        () => setActiveSubTab("reports")
      );
    }, 750);
  };

  // Handlers
  const handleGenerateAICopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await fetch("/api/agent/run-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: {
            name: "AI Social Content Composer",
            systemPrompt: `You are a high-converting Social Media Copywriter specializing in ${tone}. Write an engaging social media post for ${composerPlatform} promoting ${companyName}. Include clear value proposition and a strong call-to-action.`
          },
          prompt: `Draft a high-performing post for ${composerPlatform} under tone '${tone}'.`,
          companyProfile: { companyName }
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.output || data.text) {
          setPostCopy(data.output || data.text);
        }
      }
    } catch (err) {
      console.warn("Using fallback social copy generator", err);
      setPostCopy(
        `🏆 VIP Listing Alert: Step inside Toronto's premier waterfront residence with ${companyName}. Offering 3,200+ sq.ft of floor-to-ceiling luxury, private elevator landing, and bespoke finishes. Click below to secure your private viewing.`
      );
    } finally {
      setIsGeneratingCopy(false);
      if (onLogAction) {
        onLogAction("Generated AI Social Copy", `Synthesized post for ${composerPlatform} using ${tone} tone.`);
      }
    }
  };

  const handleSchedulePost = () => {
    const newEntry = {
      id: `SCH-${Date.now().toString().slice(-3)}`,
      title: postCopy.slice(0, 35) + "...",
      platform: composerPlatform,
      date: new Date().toISOString().split("T")[0],
      time: "10:30 AM EST",
      status: "Scheduled",
      hashtags
    };
    setScheduledPosts((prev) => [newEntry, ...prev]);
    if (onLogAction) {
      onLogAction("Scheduled Social Campaign", `Scheduled ${composerPlatform} post for ${companyName}.`);
    }
    triggerToast(
      `Successfully scheduled dispatch for ${composerPlatform}!`,
      "View in Editorial Planner",
      () => setActiveSubTab("planner")
    );
  };

  const handleSubmitToVault = () => {
    const vaultEntry = {
      id: `VLT-${Date.now().toString().slice(-3)}`,
      title: postCopy.slice(0, 30) + "...",
      platform: composerPlatform,
      stage: 2,
      stageLabel: "Stage 2: Peer Review Pending",
      complianceScore: "100%",
      caslVerified: true,
      hash: `0x${Math.random().toString(16).substring(2, 10)}`,
      createdDate: new Date().toISOString().split("T")[0],
      securityLevel: "Executive Clearance"
    };
    setVaultItems((prev) => [vaultEntry, ...prev]);
    if (onLogAction) {
      onLogAction("Submitted to Vault", `Submitted asset ${vaultEntry.id} to Sovereign Vault for Peer Review.`);
    }
    triggerToast(
      `Submitted campaign asset (${vaultEntry.id}) to Sovereign Vault for Peer Review!`,
      "View in Sovereign Vault",
      () => setActiveSubTab("vault")
    );
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMsg) return;
    setInboxMessages(
      inboxMessages.map((m) =>
        m.id === selectedMsg.id ? { ...m, unread: false } : m
      )
    );
    if (onLogAction) {
      onLogAction("Replied to Social Message", `Sent response to ${selectedMsg.user} via ${selectedMsg.platform}.`);
    }
    setReplyText("");
    triggerToast(`Reply sent to ${selectedMsg.user} via ${selectedMsg.platform}!`);
  };

  const handleCreateScheduledPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;
    const post = {
      id: `SCH-${Date.now().toString().slice(-3)}`,
      title: newPostTitle,
      platform: composerPlatform,
      date: newPostDate,
      time: newPostTime,
      status: "Scheduled",
      hashtags: "#ScheduledPost #SBBHubSpot"
    };
    setScheduledPosts([post, ...scheduledPosts]);
    setNewPostTitle("");
    setShowScheduleModal(false);
    if (onLogAction) {
      onLogAction("Added Editorial Post", `Scheduled '${newPostTitle}' for ${newPostDate}.`);
    }
  };

  const filteredVaultItems = vaultItems.filter((item) => {
    const matchesStage =
      vaultStageFilter === "all"
        ? true
        : vaultStageFilter === "stage1"
        ? item.stage === 1
        : vaultStageFilter === "stage2"
        ? item.stage === 2
        : item.stage === 3;
    const matchesSearch =
      item.title.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      item.platform.toLowerCase().includes(vaultSearch.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header (Matches Screenshot) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-orange-600/90 text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                HUBSPOT SOCIAL SYNC V4.2
              </span>
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                Connected API Live
              </span>
            </div>

            <h1 className="text-2xl font-black text-white font-sans tracking-tight">
              Sovereign HubSpot Campaign Manager
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Plan, schedule, monitor, and report your social media strategies from one secure sovereign dashboard.
              Features an interactive monthly calendar planner, regulatory compliant filters, and automated client monitoring streams.
            </p>
          </div>

          {/* Right Metrics Box (Matches Screenshot) */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl self-start md:self-auto">
            <div className="text-center px-3 border-r border-slate-800">
              <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold">NETWORKS</span>
              <span className="text-sm font-black text-amber-400 font-mono">6 Channels</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-[10px] font-mono uppercase text-slate-400 font-bold">LEADS ROUTED</span>
              <span className="text-sm font-black text-emerald-400 font-mono">114 CAD</span>
            </div>
          </div>
        </div>

        {/* 6 Feature Sub-Navigation Tabs (Matches Screenshot) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setActiveSubTab("vault")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "vault"
                ? "bg-slate-800 text-white border border-emerald-500/50 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Vault className="w-4 h-4 text-emerald-400" />
            <span>Sovereign Vault</span>
            <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-emerald-800">
              3-Stage Reports
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("autopilot")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "autopilot"
                ? "bg-slate-800 text-white border border-indigo-500/50 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI Autopilot Hub</span>
            <span className="bg-indigo-950 text-indigo-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-indigo-800">
              Active
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("composer")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "composer"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Content Composer</span>
          </button>

          <button
            onClick={() => setActiveSubTab("planner")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "planner"
                ? "bg-slate-800 text-white border border-sky-500/50 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Editorial Planner</span>
            <span className="bg-sky-950 text-sky-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-sky-800">
              {scheduledPosts.length} Scheduled
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("inbox")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "inbox"
                ? "bg-slate-800 text-white border border-rose-500/50 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Inbox className="w-4 h-4 text-rose-400" />
            <span>Monitoring & Inbox</span>
            <span className="bg-rose-950 text-rose-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold border border-rose-800">
              {inboxMessages.filter((m) => m.unread).length} Alert
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("reports")}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "reports"
                ? "bg-slate-800 text-white border border-amber-500/50 shadow-md"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Social Reports</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: SOVEREIGN VAULT ==================== */}
      {activeSubTab === "vault" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">Stage 1: Draft Vault</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">1 Item</p>
              <p className="text-[11px] text-slate-500">Pre-Compliance CASL & PIPEDA automated draft scan.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">Stage 2: Peer Review</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">1 Pending</p>
              <p className="text-[11px] text-slate-500">Awaiting Legal & Executive clearance sign-off.</p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase font-mono">Stage 3: Sovereign Vaulted</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">1 Approved</p>
              <p className="text-[11px] text-slate-500">100% Cryptographically verified and CASL compliant.</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                placeholder="Search vaulted campaigns or reports..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setVaultStageFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  vaultStageFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Stages
              </button>
              <button
                onClick={() => setVaultStageFilter("stage1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  vaultStageFilter === "stage1" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Stage 1 Drafts
              </button>
              <button
                onClick={() => setVaultStageFilter("stage2")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  vaultStageFilter === "stage2" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Stage 2 Reviews
              </button>
              <button
                onClick={() => setVaultStageFilter("stage3")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  vaultStageFilter === "stage3" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Stage 3 Vaulted
              </button>
            </div>
          </div>

          {/* Vault Assets Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono uppercase text-slate-500">
                  <th className="py-3 px-4">Asset ID & Title</th>
                  <th className="py-3 px-4">Network</th>
                  <th className="py-3 px-4">Vault Stage</th>
                  <th className="py-3 px-4">CASL Score</th>
                  <th className="py-3 px-4">Crypto Hash</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredVaultItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold block">{item.id}</span>
                        {item.title}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{item.platform}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                          item.stage === 3
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : item.stage === 2
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {item.stageLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{item.complianceScore}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{item.hash}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => triggerToast(`Viewing vaulted cryptographic record for ${item.id}`, "Switch to Vault", () => setActiveSubTab("vault"))}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect Asset
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: AI AUTOPILOT HUB ==================== */}
      {activeSubTab === "autopilot" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Autopilot Control Box */}
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 text-white space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">HubSpot Social AI Autopilot Orchestrator</h3>
                  <p className="text-xs text-slate-400 font-mono">Status: {autopilotEnabled ? "ACTIVE (Autonomous Dispatch Engaged)" : "PAUSED"}</p>
                </div>
              </div>

              <button
                onClick={() => setAutopilotEnabled(!autopilotEnabled)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 ${
                  autopilotEnabled
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{autopilotEnabled ? "Autopilot ACTIVE" : "Enable Autopilot"}</span>
              </button>
            </div>

            {/* Autonomous Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">Autonomous Execution Rules</h4>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Dispatch Cadence Frequency</label>
                  <select
                    value={cadence}
                    onChange={(e) => setCadence(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Every 6 Hours (Peak Engagement)">Every 6 Hours (Peak Engagement)</option>
                    <option value="Daily Peak Hours (10 AM & 4 PM EST)">Daily Peak Hours (10 AM & 4 PM EST)</option>
                    <option value="3x Weekly ABM Sync">3x Weekly ABM Sync</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefineCopy}
                      onChange={(e) => setAutoRefineCopy(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300 font-medium">Auto-Refine Ad Copy based on GTA Real Estate market trends</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoHashtags}
                      onChange={(e) => setAutoHashtags(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300 font-medium">Dynamic Hashtag Injector (#TorontoRealEstate, #GTA)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={caslFooterInject}
                      onChange={(e) => setCaslFooterInject(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300 font-medium">Auto-Append Mandatory CASL & PIPEDA Opt-In Disclaimer Footer</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={crmLeadRoute}
                      onChange={(e) => setCrmLeadRoute(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-xs text-slate-300 font-medium">Auto-Route Social DMs & Lead Inquiries to HubSpot CRM Router</span>
                  </label>
                </div>
              </div>

              {/* Live Autopilot Action Logs */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Live Autopilot Event Feed
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Real-time Stream</span>
                </div>

                <div className="space-y-3 text-xs">
                  {(autopilotLogs || []).map((log) => (
                    <div key={log.id} className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">{log.action}</span>
                        <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{log.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: AI CONTENT COMPOSER ==================== */}
      {activeSubTab === "composer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Left Controls Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Content Composer & Visual Hook Engine
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded border border-indigo-200">
                HubSpot Ready
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Social Network</label>
              <select
                value={composerPlatform}
                onChange={(e) => setComposerPlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Instagram Reels">Instagram Reels / Feed Carousel</option>
                <option value="Meta Ads">Meta Facebook Sponsored Post</option>
                <option value="LinkedIn ABM">LinkedIn Professional ABM Ad</option>
                <option value="X / Twitter Thread">X / Twitter Executive Thread</option>
                <option value="YouTube Shorts">YouTube Shorts Ad Brief</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Brand Voice & Tone Selector</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Luxury Real Estate">Luxury Real Estate (High-Net-Worth GTA)</option>
                <option value="High-Growth Tech B2B">High-Growth Tech B2B (SaaS & Enterprise)</option>
                <option value="Executive Thought Leadership">Executive Thought Leadership (CEO Pitch)</option>
                <option value="Compliance & Legal">Compliance & Regulatory Audit Focus</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Synthesized Ad Copy</label>
                <button
                  onClick={handleGenerateAICopy}
                  disabled={isGeneratingCopy}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingCopy ? "animate-spin" : ""}`} />
                  <span>{isGeneratingCopy ? "Synthesizing..." : "AI Re-Generate"}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={postCopy}
                onChange={(e) => setPostCopy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Hashtags</label>
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Visual Asset Template</label>
              <div className="grid grid-cols-3 gap-2">
                {(sampleImages || []).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative rounded-xl overflow-hidden border-2 h-16 transition-all cursor-pointer ${
                      selectedImageIndex === idx ? "border-indigo-600 ring-2 ring-indigo-500/30" : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleSchedulePost}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Dispatch</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitToVault}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Vault className="w-4 h-4 text-emerald-600" />
                <span>Submit to Vault</span>
              </button>
            </div>
          </div>

          {/* Right Live Social Mockup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  Live Social Media Mockup ({composerPlatform})
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  CASL Verified
                </span>
              </div>

              {/* Realistic Social Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow">
                      JJ
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        {companyName}
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Sponsored • Toronto, ON</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">HubSpot Sync</span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">{postCopy}</p>

                <div className="relative rounded-xl overflow-hidden h-48 border border-slate-800 group">
                  <img
                    src={sampleImages[selectedImageIndex].url}
                    alt="Property Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[10px] font-mono text-white bg-slate-900/80 px-2 py-1 rounded backdrop-blur">
                      📷 {sampleImages[selectedImageIndex].name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-indigo-400 font-bold">{hashtags}</span>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1">
                    <span>{ctaText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Opt-in Footnote: "Double opt-in timestamped via CASL Registry."</span>
              <span className="text-emerald-400">100% Compliant</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: EDITORIAL PLANNER ==================== */}
      {activeSubTab === "planner" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  Interactive Social Media Editorial Planner
                </h3>
                <p className="text-xs text-slate-500">Scheduled dispatches across all 6 connected social channels.</p>
              </div>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Scheduled Post</span>
              </button>
            </div>

            {/* Calendar Scheduled Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(scheduledPosts || []).map((post) => (
                <div key={post.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-sky-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                      {post.platform}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {post.date} @ {post.time}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                  <p className="text-[11px] font-mono text-sky-700 font-bold">{post.hashtags}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {post.status}
                    </span>
                    <button
                      onClick={() => triggerToast(`Rescheduled ${post.id} to next optimal engagement window.`)}
                      className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Schedule Modal */}
          {showScheduleModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Schedule New Social Post</h3>
                  <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateScheduledPost} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Post Title / Topic</label>
                    <input
                      type="text"
                      required
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="e.g. GTA Real Estate Market Update Video"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
                      <input
                        type="date"
                        required
                        value={newPostDate}
                        onChange={(e) => setNewPostDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Time</label>
                      <input
                        type="text"
                        required
                        value={newPostTime}
                        onChange={(e) => setNewPostTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Confirm Schedule
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 5: MONITORING & INBOX ==================== */}
      {activeSubTab === "inbox" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Messages List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm md:col-span-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-rose-600" />
                Social Inbox Streams
              </h3>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                {inboxMessages.length} Messages
              </span>
            </div>

            <div className="space-y-2">
              {(inboxMessages || []).map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMsg(msg)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    selectedMsg?.id === msg.id
                      ? "bg-rose-50/60 border-rose-300 ring-2 ring-rose-500/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">{msg.user}</span>
                    <span className="text-[10px] font-mono text-slate-400">{msg.time}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{msg.message}</p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-500">{msg.platform}</span>
                    <span
                      className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                        msg.caslAlert
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {msg.sentiment}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Inspector & AI Response Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm md:col-span-2 flex flex-col justify-between">
            {selectedMsg ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedMsg.user}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Via {selectedMsg.platform} • {selectedMsg.time}
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                    {selectedMsg.sentiment}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                  "{selectedMsg.message}"
                </div>

                {/* AI Reply Synthesizer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Draft Response / AI Reply</label>
                    <button
                      onClick={() => {
                        if (selectedMsg.caslAlert) {
                          setReplyText(
                            "Thank you. Your double opt-in consent confirmation receipt #CASL-9981 has been generated and vaulted per PIPEDA requirements."
                          );
                        } else {
                          setReplyText(
                            `Hi ${selectedMsg.user.split(" ")[0]}, thank you for reaching out to ${companyName}! I'd be delighted to share the exclusive CAD penthouse disclosure package and floor plans with you.`
                          );
                        }
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Generate AI Reply</span>
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type or auto-generate your social reply..."
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenHubspotModal(selectedMsg)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                      selectedMsg?.routedToHubspot
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                    }`}
                  >
                    <Users className={`w-3.5 h-3.5 ${selectedMsg?.routedToHubspot ? "text-emerald-600" : "text-indigo-600"}`} />
                    <span>
                      {selectedMsg?.routedToHubspot
                        ? `✓ Synced to HubSpot (${selectedMsg.hubspotDealId})`
                        : "Route Lead to HubSpot CRM"}
                    </span>
                  </button>

                  <button
                    onClick={handleSendReply}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Reply</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">Select a message from the inbox to inspect and reply.</div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 6: SOCIAL REPORTS ==================== */}
      {activeSubTab === "reports" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Key KPI Cards (Matches Screenshot) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">IMPRESSIONS</span>
              <p className="text-2xl font-black text-slate-900 font-mono">14,720</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +12% vs last wk
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TOTAL CLICKS</span>
              <p className="text-2xl font-black text-slate-900 font-mono">1,158</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +18.4% click growth
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">TOTAL ENGAGEMENT</span>
              <p className="text-2xl font-black text-slate-900 font-mono">639</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +14.2% active interactions
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">AVG ENGAGEMENT RATE</span>
              <p className="text-2xl font-black text-slate-900 font-mono">4.3%</p>
              <p className="text-[11px] text-slate-400">Platform benchmark: 4.0%</p>
            </div>
          </div>

          {/* Social Network Performance Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">HubSpot Cross-Platform ROI & Lead Funnel</h3>
              <button
                onClick={() => triggerToast("Downloading Sovereign Social Performance PDF Report...")}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Report PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono">Share of Impressions by Network</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Instagram Reels & Stories</span>
                      <span className="font-mono text-indigo-600">42% (6,182)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: "42%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>LinkedIn ABM Sponsored Posts</span>
                      <span className="font-mono text-sky-600">28% (4,121)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-600 h-full rounded-full" style={{ width: "28%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Meta Facebook Ads</span>
                      <span className="font-mono text-blue-600">20% (2,944)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>X / Twitter & YouTube Shorts</span>
                      <span className="font-mono text-amber-600">10% (1,473)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-600 h-full rounded-full" style={{ width: "10%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Conversion Funnel */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase font-mono">HubSpot CRM Lead Attribution</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-600">Total Social Impressions</span>
                    <span className="font-mono font-bold text-slate-900">14,720</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-600">Website & Landing Page Clicks</span>
                    <span className="font-mono font-bold text-indigo-600">1,158</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-600">CASL Double Opt-In Leads</span>
                    <span className="font-mono font-bold text-emerald-600">114 CAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HubSpot Lead Routing Modal */}
      {showHubspotModal && selectedMsg && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 shadow-2xl relative my-8 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl border border-orange-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Route Lead to HubSpot CRM</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Portal ID: HS-PORTAL-7731 (Sovereign Inbound)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHubspotModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSyncHubspot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={hubspotForm.contactName}
                    onChange={(e) => setHubspotForm({ ...hubspotForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={hubspotForm.email}
                    onChange={(e) => setHubspotForm({ ...hubspotForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Source Channel</label>
                  <input
                    type="text"
                    value={hubspotForm.sourceChannel}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est. CAD Deal Value ($)</label>
                  <input
                    type="text"
                    value={hubspotForm.dealValue}
                    onChange={(e) => setHubspotForm({ ...hubspotForm, dealValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lifecycle Stage</label>
                  <select
                    value={hubspotForm.lifecycleStage}
                    onChange={(e) => setHubspotForm({ ...hubspotForm, lifecycleStage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option>Opportunity / High Intent</option>
                    <option>MQL - Marketing Qualified</option>
                    <option>SQL - Sales Qualified</option>
                    <option>Evangelist / VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">AI Lead Score</label>
                  <input
                    type="text"
                    value={hubspotForm.leadScore}
                    readOnly
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inbound Message & Notes</label>
                <textarea
                  rows={3}
                  value={hubspotForm.notes}
                  onChange={(e) => setHubspotForm({ ...hubspotForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-sans"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  CASL Double Opt-In Verification Linked
                </span>
                <span className="text-emerald-700 font-bold">Verified</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHubspotModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncingHubspot}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2"
                >
                  {isSyncingHubspot ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing to HubSpot...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Confirm & Route to HubSpot</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/80 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 max-w-md animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-white">{toastNotification.message}</p>
              {toastNotification.actionLabel && toastNotification.onAction && (
                <button
                  type="button"
                  onClick={() => {
                    toastNotification.onAction?.();
                    setToastNotification(null);
                  }}
                  className="mt-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer flex items-center gap-1"
                >
                  <span>{toastNotification.actionLabel}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CampaignCreator;
