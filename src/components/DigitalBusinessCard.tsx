import React, { useState } from "react";
import { 
  CreditCard, Smartphone, QrCode, Download, Share2, Phone, Mail, Globe, 
  MapPin, Send, CheckCircle2, Sparkles, MessageSquare, ShoppingBag, DollarSign, 
  Copy, ExternalLink, ShieldCheck, UserCheck, Star, Zap, ChevronRight, BarChart2, Users
} from "lucide-react";

interface DigitalBusinessCardProps {
  currentRole: string;
  currentUserName: string;
  onLogAction: (actionType: string, details: string) => void;
}

interface ProductItem {
  id: string;
  name: string;
  price: string;
  category: string;
  description: string;
  badge?: string;
  image: string;
}

interface TeamCard {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  company: string;
  designation: string;
  avatar: string;
  tagline: string;
  upiId: string;
  website: string;
  location: string;
}

const DEFAULT_TEAM_CARDS: TeamCard[] = [
  {
    id: "CARD-001",
    name: "John CEO Smith",
    role: "CEO",
    designation: "Chief Executive Officer & Founder",
    company: "Sovereign Business Corp",
    phone: "+1 (437) 997-6707",
    email: "john.smith@sovereignbusiness.ca",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    tagline: "Empowering AI-Driven Enterprise Marketing & Autonomous Growth Engines.",
    upiId: "johnsmith@okicici",
    website: "https://sovereignbusinessbrain.com",
    location: "Financial District, Toronto, ON"
  },
  {
    id: "CARD-002",
    name: "Miriam Manager Mercer",
    role: "Marketing Manager",
    designation: "Senior Marketing Manager",
    company: "Sovereign Business Corp",
    phone: "+1 (437) 997-6707",
    email: "miriam.mercer@sovereignbusiness.ca",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    tagline: "Omnichannel Ads Strategy, High-ROAS UTM Tracking & Conversion Funnels.",
    upiId: "miriammercer@upi",
    website: "https://sovereignbusinessbrain.com",
    location: "Tech Hub Quarter, Vancouver, BC"
  },
  {
    id: "CARD-003",
    name: "Sarah Sales Executive",
    role: "Executive",
    designation: "Enterprise Solutions Lead",
    company: "Sovereign Business Corp",
    phone: "+1 (437) 997-6707",
    email: "sarah.executive@sovereignbusiness.ca",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    tagline: "Helping businesses automate leads & close 5-figure enterprise deals faster.",
    upiId: "sarahsales@sbi",
    website: "https://sovereignbusinessbrain.com",
    location: "Bay Street Corporate Centre, Toronto, ON"
  }
];

const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "PROD-1",
    name: "SBB Autonomous AI Marketing Engine",
    price: "$2,499 / mo",
    category: "Software",
    description: "Complete AI marketing suite featuring automated campaign generator, UTM tracker, and lead router.",
    badge: "BEST SELLER",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-2",
    name: "Enterprise Smart NFC Digital Card Package",
    price: "$149 / user",
    category: "Hardware & SaaS",
    description: "Custom engraved metallic NFC card with unlimited tap digital business profile & instant vCard download.",
    badge: "NEW LAUNCH",
    image: "https://images.unsplash.com/photo-1556742049-0a67568d0d9f?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "PROD-3",
    name: "High-ROAS Google & Meta Ads Audit",
    price: "$850 (One-time)",
    category: "Consulting",
    description: "Deep statistical audit of conversion funnels, retargeting pixels, and ad spend attribution.",
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80"
  }
];

export const DigitalBusinessCard: React.FC<DigitalBusinessCardProps> = ({
  currentRole,
  currentUserName,
  onLogAction
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string>("CARD-001");
  const [cardTheme, setCardTheme] = useState<"navy" | "dark" | "emerald" | "gold">("navy");

  // Lead Collection State
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Stats Counters
  const [stats, setStats] = useState({
    views: 1420,
    saves: 384,
    whatsappClicks: 219,
    leadsCaptured: 47
  });

  const activeCard = DEFAULT_TEAM_CARDS.find(c => c.id === selectedCardId) || DEFAULT_TEAM_CARDS[0];

  // vCard (.vcf) download handler
  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${activeCard.name}
ORG:${activeCard.company}
TITLE:${activeCard.designation}
TEL;TYPE=CELL:${activeCard.phone}
EMAIL:${activeCard.email}
URL:${activeCard.website}
NOTE:${activeCard.tagline}
END:VCARD`;

    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeCard.name.replace(/\s+/g, "_")}_SBBCard.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStats(prev => ({ ...prev, saves: prev.saves + 1 }));
    onLogAction("VCARD_DOWNLOADED", `Downloaded vCard for ${activeCard.name}.`);
  };

  // WhatsApp click handler
  const handleWhatsAppClick = (customMsg?: string) => {
    const defaultMsg = customMsg || `Hi ${activeCard.name}, I viewed your SBB Digital Business Card and would like to connect regarding ${activeCard.company} services.`;
    const encoded = encodeURIComponent(defaultMsg);
    const cleanPhone = activeCard.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    setStats(prev => ({ ...prev, whatsappClicks: prev.whatsappClicks + 1 }));
    onLogAction("WHATSAPP_CARD_TAP", `Initiated WhatsApp conversation with ${activeCard.name}.`);
  };

  // Submit Visitor Lead Form
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) return;

    setLeadSubmitted(true);
    setStats(prev => ({ ...prev, leadsCaptured: prev.leadsCaptured + 1 }));

    // Store lead locally for CRM integration
    try {
      const existingLeads = JSON.parse(localStorage.getItem("sbb_card_captured_leads") || "[]");
      const newLead = {
        id: "CARD-LEAD-" + Date.now(),
        name: visitorName,
        phone: visitorPhone,
        email: visitorEmail,
        message: visitorMessage,
        cardOwner: activeCard.name,
        timestamp: new Date().toLocaleString()
      };
      localStorage.setItem("sbb_card_captured_leads", JSON.stringify([newLead, ...existingLeads]));
    } catch {
      // ignore storage errors
    }

    onLogAction("SBB_CARD_LEAD_SUBMITTED", `Visitor ${visitorName} (${visitorPhone}) submitted contact details via ${activeCard.name}'s digital business card.`);

    setTimeout(() => {
      setVisitorName("");
      setVisitorPhone("");
      setVisitorEmail("");
      setVisitorMessage("");
      setLeadSubmitted(false);
    }, 4000);
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}/#card=${activeCard.id}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Theme color maps
  const themeClasses = {
    navy: {
      bg: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900",
      cardHeader: "bg-slate-900 border-b border-indigo-900/50",
      accent: "bg-indigo-600 hover:bg-indigo-500 text-white",
      badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
      iconBg: "bg-indigo-900/50 text-indigo-300"
    },
    dark: {
      bg: "bg-gradient-to-br from-neutral-950 via-zinc-900 to-black",
      cardHeader: "bg-zinc-950 border-b border-zinc-800",
      accent: "bg-zinc-100 hover:bg-white text-zinc-950 font-extrabold",
      badge: "bg-zinc-800 text-zinc-300 border border-zinc-700",
      iconBg: "bg-zinc-800 text-zinc-200"
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900",
      cardHeader: "bg-emerald-950 border-b border-emerald-800/50",
      accent: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold",
      badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      iconBg: "bg-emerald-900/50 text-emerald-300"
    },
    gold: {
      bg: "bg-gradient-to-br from-amber-950 via-stone-900 to-slate-950",
      cardHeader: "bg-amber-950 border-b border-amber-800/50",
      accent: "bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold",
      badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      iconBg: "bg-amber-900/50 text-amber-300"
    }
  }[cardTheme];

  return (
    <div className="space-y-6">
      {/* Top Banner & High Impact Context Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 border border-purple-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                SBB DIGITAL BUSINESS CARD & NFC HUB
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
                ENHANCED SBB CRM ENGINE
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Instant Contact Sharing, vCard & WhatsApp NFC Business Suite
            </h2>

            <p className="text-sm text-purple-200/90 leading-relaxed">
              Equip your CEO, managers, and sales team with interactive SBB Digital Business Cards. Share via NFC tap, dynamic QR code, or instant link. Any visitor contact details captured automatically route into your <strong>SBB CRM Lead Router</strong>!
            </p>
          </div>

          {/* Real-time Card Telemetry Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 backdrop-blur-md p-3.5 rounded-xl border border-white/10 w-full lg:w-auto">
            <div className="text-center px-3 py-1">
              <span className="text-xs text-purple-300 font-mono block">Views</span>
              <span className="text-lg font-extrabold text-white">{stats.views.toLocaleString()}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-xs text-purple-300 font-mono block">vCard Saves</span>
              <span className="text-lg font-extrabold text-emerald-400">{stats.saves}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-xs text-purple-300 font-mono block">WhatsApp</span>
              <span className="text-lg font-extrabold text-amber-300">{stats.whatsappClicks}</span>
            </div>

            <div className="text-center px-3 py-1 border-l border-white/10">
              <span className="text-xs text-purple-300 font-mono block">CRM Leads</span>
              <span className="text-lg font-extrabold text-purple-300">{stats.leadsCaptured}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout: Controls + Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Management Controls & Team Card Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Customizer & Team Card Switcher */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Corporate Digital Cards Directory</h3>
                  <p className="text-xs text-slate-500">Select team member to preview or customize their SBB Digital Card</p>
                </div>
              </div>

              {/* Theme Picker */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                {(["navy", "dark", "emerald", "gold"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCardTheme(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all cursor-pointer ${
                      cardTheme === t
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEFAULT_TEAM_CARDS.map((card) => {
                const isSelected = card.id === selectedCardId;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-purple-50/70 border-purple-500 ring-2 ring-purple-200 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 text-purple-600">
                        <CheckCircle2 className="w-4 h-4 fill-purple-600 text-white" />
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <img
                        src={card.avatar}
                        alt={card.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{card.name}</h4>
                        <p className="text-[10px] font-medium text-slate-500 truncate">{card.role}</p>
                        <span className="text-[9px] font-mono text-purple-700 font-bold block pt-0.5">{card.id}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Share & NFC Hardware Order Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold">NFC Smart Card & QR Sharing Suite</h3>
              </div>

              <span className="text-[10px] font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded border border-purple-700/50">
                COMPATIBLE WITH APPLE & ANDROID NFC
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tap the NFC metallic business card against any smartphone to instantly launch this digital profile, download vCard contacts, or trigger direct WhatsApp inquiries.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Link Copied!" : "Copy Digital Card URL"}</span>
              </button>

              <button
                onClick={handleDownloadVCard}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download vCard (.vcf)</span>
              </button>

              <button
                onClick={() => handleWhatsAppClick()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Test WhatsApp Direct</span>
              </button>
            </div>
          </div>

          {/* SBB Card Feature Breakdown vs Traditional Paper Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Why SBB Digital Business Card Enhances Sovereign Business Brain
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">📇 One-Tap vCard Save</span>
                <p className="text-slate-500 text-[11px]">No manual typing. Clients save full corporate contact cards directly into iPhone or Android contact books.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">💬 WhatsApp Direct Messaging</span>
                <p className="text-slate-500 text-[11px]">Instant 1-click WhatsApp conversation with pre-filled service inquiry templates.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">🛍️ Live Showcase Catalog</span>
                <p className="text-slate-500 text-[11px]">Showcase key products, SaaS offerings, or consulting packages right inside your business card.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">🎯 SBB CRM Lead Routing</span>
                <p className="text-slate-500 text-[11px]">Every visitor contact form submission automatically converts into an AI-scored lead in SBB CRM.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Phone Digital Business Card Mockup (5 cols) */}
        <div className="lg:col-span-5 flex justify-center">
          {/* Smartphone Frame Outer Shell */}
          <div className="w-full max-w-sm bg-slate-950 rounded-[40px] p-3 border-4 border-slate-800 shadow-2xl relative">
            {/* Phone Speaker Notch */}
            <div className="w-32 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-12 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Inner Screen Canvas */}
            <div className={`rounded-[30px] overflow-hidden text-white min-h-[640px] shadow-inner font-sans flex flex-col justify-between ${themeClasses.bg}`}>
              {/* Card Banner Header & Avatar */}
              <div className="relative pt-6 px-4 pb-4 text-center">
                {/* Background Banner Decor */}
                <div className="absolute inset-x-0 top-0 h-28 bg-white/10 backdrop-blur-md border-b border-white/10" />

                {/* Verified Corporate Badge */}
                <div className="relative z-10 flex justify-end mb-2">
                  <span className="bg-emerald-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED CARD
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative z-10 mx-auto w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-lg">
                  <img
                    src={activeCard.avatar}
                    alt={activeCard.name}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                  />
                </div>

                {/* Name & Designation */}
                <div className="relative z-10 mt-3 space-y-1">
                  <h3 className="text-lg font-extrabold tracking-tight">{activeCard.name}</h3>
                  <p className="text-xs font-semibold text-purple-200">{activeCard.designation}</p>
                  <p className="text-[11px] font-mono text-slate-400">{activeCard.company}</p>
                  <p className="text-[11px] text-slate-300/90 italic pt-1 max-w-xs mx-auto leading-tight">
                    "{activeCard.tagline}"
                  </p>
                </div>
              </div>

              {/* Action Buttons Bar (vCard, Call, WhatsApp, Email, Maps) */}
              <div className="px-4 py-2 grid grid-cols-4 gap-2 text-center">
                <button
                  onClick={handleDownloadVCard}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${themeClasses.iconBg}`}
                  title="Save vCard Contact"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-1">vCard</span>
                </button>

                <button
                  onClick={() => handleWhatsAppClick()}
                  className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 flex flex-col items-center justify-center transition-all cursor-pointer"
                  title="Direct WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-[9px] font-bold mt-1">WhatsApp</span>
                </button>

                <a
                  href={`tel:${activeCard.phone}`}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${themeClasses.iconBg}`}
                  title="Call Phone"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-1">Call</span>
                </a>

                <a
                  href={`mailto:${activeCard.email}`}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${themeClasses.iconBg}`}
                  title="Send Email"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-1">Email</span>
                </a>
              </div>

              {/* Scrollable Card Sections */}
              <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[300px] custom-scrollbar">
                {/* Contact Information Box */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{activeCard.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <a href={activeCard.website} target="_blank" rel="noreferrer" className="hover:underline text-purple-300">
                      {activeCard.website.replace("https://", "")}
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 font-mono text-slate-400">
                    <span>UPI Payment:</span>
                    <span className="text-amber-300 font-bold">{activeCard.upiId}</span>
                  </div>
                </div>

                {/* Showcase Products & Services Catalog */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-purple-300 font-bold tracking-wider block">
                    Featured Products & Services Catalog
                  </span>

                  <div className="space-y-2">
                    {DEFAULT_PRODUCTS.map((prod) => (
                      <div key={prod.id} className="bg-white/10 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs truncate">{prod.name}</span>
                            {prod.badge && (
                              <span className="bg-amber-400 text-slate-950 font-extrabold text-[8px] px-1 rounded">
                                {prod.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold block">{prod.price}</span>
                        </div>

                        <button
                          onClick={() => handleWhatsAppClick(`Hi ${activeCard.name}, I'm interested in purchasing/inquiring about your product: ${prod.name} (${prod.price}).`)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          Enquire
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visitor Lead Collection Form */}
                <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-200">
                      Share Your Contact Details
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">Syncs to SBB CRM</span>
                  </div>

                  {leadSubmitted ? (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300 text-[11px] text-center space-y-1">
                      <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-400" />
                      <p className="font-bold">Thank you! Contact Received.</p>
                      <p className="text-[9px] text-slate-400">Added to SBB CRM Lead Router queue.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitLead} className="space-y-2">
                      <input
                        type="text"
                        placeholder="Your Full Name *"
                        required
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />

                      <input
                        type="tel"
                        placeholder="Mobile Phone Number *"
                        required
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />

                      <input
                        type="email"
                        placeholder="Email Address"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />

                      <button
                        type="submit"
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Contact Card to {activeCard.name.split(" ")[0]}</span>
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Bottom Footer Signature */}
              <div className="p-3 text-center border-t border-white/10 bg-black/40 text-[9px] font-mono text-slate-400 flex items-center justify-between">
                <span>SBB Digital Business Card v4.2</span>
                <span className="text-purple-300 font-bold">SOVEREIGN BRAIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
