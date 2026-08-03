import React, { useState, useEffect } from "react";
import { 
  Building2, Sparkles, Target, DollarSign, Globe, CheckCircle2, ArrowRight, 
  HelpCircle, ShieldCheck, Zap, Lightbulb, Users, Phone, MessageSquare, Briefcase, 
  Layers, Bot, BookOpen, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CompanyBusinessProfile {
  companyName: string;
  websiteUrl: string;
  sector: string;
  description: string;
  countriesServed: string;
  targetAudience: string;
  headquarters: string;
  teamSize: string;
  softwareStack: string;
  goals: string[];
  adBudget: number;
  productsServices: string;
  usp: string;
  phone: string;
  brandVoice: string;
  instagram: string;
  linkedin: string;
  complianceProfile: string;
}

interface BusinessOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyProfile: CompanyBusinessProfile;
  onSaveProfile: (updatedProfile: CompanyBusinessProfile) => void;
  onLogAction: (actionType: string, details: string) => void;
  isFirstTime?: boolean;
}

export const BusinessOnboardingModal: React.FC<BusinessOnboardingModalProps> = ({
  isOpen,
  onClose,
  companyProfile,
  onSaveProfile,
  onLogAction,
  isFirstTime = false
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states initialized with current profile
  const [companyName, setCompanyName] = useState(companyProfile?.companyName || "Sovereign Enterprise Solutions");
  const [websiteUrl, setWebsiteUrl] = useState(companyProfile?.websiteUrl || "https://sovereignbusiness.ca");
  const [sector, setSector] = useState(companyProfile?.sector || "Real Estate & Enterprise Tech");
  const [description, setDescription] = useState(companyProfile?.description || "Providing high-value enterprise consulting, automation, and luxury real estate advisory.");
  const [headquarters, setHeadquarters] = useState(companyProfile?.headquarters || "Toronto, Ontario, Canada");
  const [targetAudience, setTargetAudience] = useState(companyProfile?.targetAudience || "High-net-worth homebuyers, business owners, and corporate decision makers");
  
  const [productsServices, setProductsServices] = useState(companyProfile?.productsServices || "Luxury Residential Listings, Autonomous AI Ad Management, Enterprise Consulting");
  const [usp, setUsp] = useState(companyProfile?.usp || "Guaranteed 24/7 AI-driven lead response, high-ROAS UTM tracking, and PIPEDA-compliant workflows");
  const [phone, setPhone] = useState(companyProfile?.phone || "+1 (437) 997-6707");
  const [adBudget, setAdBudget] = useState<number>(companyProfile?.adBudget || 5000);
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    companyProfile?.goals?.length ? companyProfile.goals : ["Generate High-Quality Leads", "Maximize Ad ROAS", "Increase Brand Authority"]
  );
  
  const [brandVoice, setBrandVoice] = useState(companyProfile?.brandVoice || "Professional & Authoritative");
  const [instagram, setInstagram] = useState(companyProfile?.instagram || "@sovereignbusiness");
  const [linkedin, setLinkedin] = useState(companyProfile?.linkedin || "linkedin.com/company/sovereign-business");
  const [teamSize, setTeamSize] = useState(companyProfile?.teamSize || "10-50 employees");

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (companyProfile) {
      if (companyProfile.companyName) setCompanyName(companyProfile.companyName);
      if (companyProfile.websiteUrl) setWebsiteUrl(companyProfile.websiteUrl);
      if (companyProfile.sector) setSector(companyProfile.sector);
      if (companyProfile.description) setDescription(companyProfile.description);
      if (companyProfile.headquarters) setHeadquarters(companyProfile.headquarters);
      if (companyProfile.targetAudience) setTargetAudience(companyProfile.targetAudience);
      if (companyProfile.productsServices) setProductsServices(companyProfile.productsServices);
      if (companyProfile.usp) setUsp(companyProfile.usp);
      if (companyProfile.phone) setPhone(companyProfile.phone);
      if (companyProfile.adBudget) setAdBudget(companyProfile.adBudget);
      if (companyProfile.goals) setSelectedGoals(companyProfile.goals);
      if (companyProfile.brandVoice) setBrandVoice(companyProfile.brandVoice);
      if (companyProfile.instagram) setInstagram(companyProfile.instagram);
      if (companyProfile.linkedin) setLinkedin(companyProfile.linkedin);
      if (companyProfile.teamSize) setTeamSize(companyProfile.teamSize);
    }
  }, [companyProfile]);

  if (!isOpen) return null;

  const AVAILABLE_GOALS = [
    "Generate High-Quality Leads",
    "Maximize Ad ROAS & Lower CAC",
    "E-Commerce & Service Sales",
    "Increase Brand Authority & Organic SEO",
    "Automate Customer Support & WhatsApp Inquiries",
    "Local Foot Traffic & Phone Call Inquiries"
  ];

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinishOnboarding = () => {
    const updated: CompanyBusinessProfile = {
      companyName,
      websiteUrl,
      sector,
      description,
      countriesServed: "Canada & North America",
      targetAudience,
      headquarters,
      teamSize,
      softwareStack: companyProfile?.softwareStack || "Salesforce, Meta Ads & HubSpot",
      goals: selectedGoals,
      adBudget,
      productsServices,
      usp,
      phone,
      brandVoice,
      instagram,
      linkedin,
      complianceProfile: "PIPEDA, CASL, GDPR"
    };

    onSaveProfile(updated);
    localStorage.setItem("sbb_onboarding_completed", "true");
    onLogAction("SBB_BUSINESS_KNOWLEDGE_BASE_UPDATED", `Saved business profile for ${companyName} (${sector}). SBB AI Knowledge Base re-indexed for future ads.`);
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full text-white shadow-2xl overflow-hidden my-auto"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-6 border-b border-purple-800/50 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 border border-purple-800/60 px-2 py-0.5 rounded">
                  {isFirstTime ? "FIRST-TIME LOGIN SETUP" : "BUSINESS KNOWLEDGE BASE"}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  SBB Business Requirements & AI Context
                </h2>
              </div>
            </div>

            {!isFirstTime && (
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className="text-xs text-purple-200/90 mt-2 leading-relaxed">
            Provide your business requirements so SBB AI (Campaign Generator, Marketing Strategist, SEO Brain & Digital Cards) can understand your brand, target audience, and ad goals for future automated actions.
          </p>

          {/* Wizard Step Progress Bar */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-purple-800/30 text-[11px] font-mono">
            {[
              { id: 1, label: "1. Brand Identity" },
              { id: 2, label: "2. Target & Offerings" },
              { id: 3, label: "3. Ad Goals & Budget" },
              { id: 4, label: "4. Voice & Sync" }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStep(s.id as any)}
                className={`flex-1 py-1 px-2 rounded-md font-bold text-center transition-all cursor-pointer ${
                  step === s.id
                    ? "bg-purple-500 text-white shadow-md"
                    : step > s.id
                    ? "bg-purple-900/40 text-purple-200 border border-purple-700/50"
                    : "bg-slate-800/60 text-slate-400 border border-slate-700/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {isSaved ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-extrabold text-white">SBB Knowledge Base Indexed!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your business profile for <strong className="text-purple-300">{companyName}</strong> has been saved. SBB AI agents will now utilize this context for future ad generation and automated campaign strategies.
              </p>
            </div>
          ) : (
            <>
              {/* STEP 1: Brand & Company Identity */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-mono">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>STEP 1: COMPANY & BRAND IDENTITY</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Company / Brand Name *</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Sovereign Business Corp"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Website URL *</label>
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourbusiness.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Industry / Sector *</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        placeholder="e.g. Real Estate, SaaS, E-commerce, Legal"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Headquarters / Main Region</label>
                      <input
                        type="text"
                        value={headquarters}
                        onChange={(e) => setHeadquarters(e.target.value)}
                        placeholder="e.g. Toronto, Ontario, Canada"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Business Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what your business does and what value you provide..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Target Audience & Offerings */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-mono">
                    <Target className="w-4 h-4 text-purple-400" />
                    <span>STEP 2: TARGET AUDIENCE & PRODUCTS / SERVICES</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience & Customer Persona *</label>
                    <textarea
                      rows={2}
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Who are your ideal customers? Demographics, income, location, key interests..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Core Products / Services Offered *</label>
                    <textarea
                      rows={2}
                      value={productsServices}
                      onChange={(e) => setProductsServices(e.target.value)}
                      placeholder="List key offerings, e.g. Luxury Condo Sales, AI Marketing Management, Consulting Packages..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Unique Selling Proposition (USP)</label>
                    <input
                      type="text"
                      value={usp}
                      onChange={(e) => setUsp(e.target.value)}
                      placeholder="What makes you stand out from competitors?"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Ad Goals & Budget */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-mono">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                    <span>STEP 3: MARKETING OBJECTIVES & AD BUDGET</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Primary Marketing & Ad Goals (Select all that apply)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AVAILABLE_GOALS.map((goal) => {
                        const isSelected = selectedGoals.includes(goal);
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => toggleGoal(goal)}
                            className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-purple-950/80 border-purple-500 text-purple-200"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <span>{goal}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Ad Budget ($ CAD) *</label>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={adBudget}
                        onChange={(e) => setAdBudget(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Business WhatsApp Contact Phone *</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (437) 997-6707"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Brand Voice & Sync */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-purple-300 text-xs font-bold font-mono">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>STEP 4: BRAND VOICE & SBB MEMORY SYNC</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Brand Voice & Copywriting Tone</label>
                      <select
                        value={brandVoice}
                        onChange={(e) => setBrandVoice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="Professional & Authoritative">Professional & Authoritative</option>
                        <option value="Energetic & High-Converting">Energetic & High-Converting</option>
                        <option value="Friendly & Approachable">Friendly & Approachable</option>
                        <option value="Luxury, Modern & Refined">Luxury, Modern & Refined</option>
                        <option value="Bold & Disrupted">Bold & Disrupted</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Company Size / Team</label>
                      <input
                        type="text"
                        value={teamSize}
                        onChange={(e) => setTeamSize(e.target.value)}
                        placeholder="e.g. 1-10, 10-50, 50+"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Instagram Handle</label>
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@sovereignbusiness"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn Profile/Page</label>
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="linkedin.com/company/sovereign"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="bg-purple-950/40 border border-purple-800/50 p-3.5 rounded-xl text-xs space-y-1.5">
                    <span className="font-bold text-purple-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> SBB Knowledge Base Storage
                    </span>
                    <p className="text-slate-300 text-[11px]">
                      This profile is stored securely in SBB Business Memory. Whenever you generate Meta/Google Ads, SEO keywords, or CRM sequences, SBB will automatically incorporate these exact business requirements.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {!isSaved && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
            <button
              disabled={step === 1}
              onClick={() => setStep(step - 1 as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                step === 1 ? "opacity-30 cursor-not-allowed text-slate-500" : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1 as any)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleFinishOnboarding}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Save to SBB Knowledge Base</span>
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
