import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  X,
  Layers,
  Users,
  ShieldCheck,
  FileText,
  ArrowRight,
  TrendingUp,
  Tag,
  Building2,
  Mail,
  UserCheck,
  Clock,
  Sparkles,
  ChevronRight,
  Command,
  RotateCcw
} from "lucide-react";
import { ActiveTabType } from "../lib/rbac";

export interface GlobalSearchBarProps {
  campaigns: any[];
  leads: any[];
  auditLogs: any[];
  onNavigateTab: (tab: ActiveTabType) => void;
  onOpenOnboarding?: () => void;
  companyName?: string;
  sector?: string;
}

type FilterCategory = "all" | "campaigns" | "leads" | "audits";

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  campaigns = [],
  leads = [],
  auditLogs = [],
  onNavigateTab,
  onOpenOnboarding,
  companyName,
  sector
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Cmd+K / Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    if (!query.trim()) return campaigns.slice(0, 4);
    const q = query.toLowerCase().trim();
    return campaigns.filter(c =>
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q)) ||
      (c.agentName && c.agentName.toLowerCase().includes(q)) ||
      (c.agent && c.agent.toLowerCase().includes(q)) ||
      (c.status && c.status.toLowerCase().includes(q)) ||
      (c.comments && c.comments.toLowerCase().includes(q)) ||
      (c.createdBy && c.createdBy.toLowerCase().includes(q))
    );
  }, [campaigns, query]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!query.trim()) return leads.slice(0, 4);
    const q = query.toLowerCase().trim();
    return leads.filter(l =>
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.serviceInterest && l.serviceInterest.toLowerCase().includes(q)) ||
      (l.territory && l.territory.toLowerCase().includes(q)) ||
      (l.source && l.source.toLowerCase().includes(q)) ||
      (l.status && l.status.toLowerCase().includes(q)) ||
      (l.id && l.id.toLowerCase().includes(q))
    );
  }, [leads, query]);

  // Filtered audit logs
  const filteredAudits = useMemo(() => {
    if (!query.trim()) return auditLogs.slice(0, 4);
    const q = query.toLowerCase().trim();
    return auditLogs.filter(a =>
      (a.action && a.action.toLowerCase().includes(q)) ||
      (a.details && a.details.toLowerCase().includes(q)) ||
      (a.actor && a.actor.toLowerCase().includes(q)) ||
      (a.role && a.role.toLowerCase().includes(q)) ||
      (a.id && a.id.toLowerCase().includes(q)) ||
      (a.timestamp && a.timestamp.toLowerCase().includes(q))
    );
  }, [auditLogs, query]);

  const totalResultsCount = filteredCampaigns.length + filteredLeads.length + filteredAudits.length;

  const handleSelectCampaign = (c: any) => {
    setIsOpen(false);
    onNavigateTab("campaign-commander");
  };

  const handleSelectLead = (l: any) => {
    setIsOpen(false);
    onNavigateTab("crm");
  };

  const handleSelectAudit = (a: any) => {
    setIsOpen(false);
    onNavigateTab("dashboard");
  };

  const handleClearAll = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedIndex(0);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-amber-300 text-amber-950 font-bold px-0.5 rounded">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full md:w-80 lg:w-96">
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center bg-white border rounded-xl transition-all shadow-xs ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
            : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search campaigns, leads, audit logs..."
          className="w-full pl-2.5 pr-16 py-2 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
        />

        {query ? (
          <div className="flex items-center gap-1 mr-1.5 shrink-0">
            <button
              type="button"
              id="global-search-clear-all-input"
              onClick={handleClearAll}
              className="px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded transition-all cursor-pointer whitespace-nowrap active:scale-95"
              title="Clear all search and close results"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* Dropdown / Modal Results Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[82vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-100 min-w-[320px] sm:min-w-[420px] lg:min-w-[480px]">
          {/* Header & Filter Tabs */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                {query.trim() ? (
                  <span>
                    Results for <span className="text-indigo-600 font-bold">"{query}"</span>
                  </span>
                ) : (
                  <span className="text-slate-600">Quick Global Search & Jump</span>
                )}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                  {totalResultsCount} Matches
                </span>
                <button
                  type="button"
                  id="global-search-clear-all-modal-btn"
                  onClick={handleClearAll}
                  className="px-2 py-0.5 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                  title="Reset search state and close modal"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                All ({totalResultsCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("campaigns")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  selectedCategory === "campaigns"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50"
                }`}
              >
                <Layers className="w-3 h-3" />
                Campaigns ({filteredCampaigns.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("leads")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  selectedCategory === "leads"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50"
                }`}
              >
                <Users className="w-3 h-3" />
                Leads ({filteredLeads.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("audits")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  selectedCategory === "audits"
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-50"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                Audit Logs ({filteredAudits.length})
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-3">
            {/* If no query, show helpful suggestions & recent shortcuts */}
            {!query.trim() && (
              <div className="p-2 space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2">
                  System Shortcuts & Quick Navigation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("campaign-commander");
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/80 text-left transition-all cursor-pointer flex items-center gap-2 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="block font-bold text-slate-900 group-hover:text-indigo-900">
                        Campaign Commander
                      </span>
                      <span className="text-[10px] text-slate-500">View all active campaigns</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("crm");
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/80 text-left transition-all cursor-pointer flex items-center gap-2 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="block font-bold text-slate-900 group-hover:text-emerald-900">
                        CRM Leads Pipeline
                      </span>
                      <span className="text-[10px] text-slate-500">Track high-intent leads</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("dashboard");
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/80 text-left transition-all cursor-pointer flex items-center gap-2 group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="block font-bold text-slate-900 group-hover:text-purple-900">
                        Audit Logs & Governance
                      </span>
                      <span className="text-[10px] text-slate-500">Security & action audit trail</span>
                    </div>
                  </button>

                  {onOpenOnboarding && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenOnboarding();
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200/80 text-left transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="block font-bold text-slate-900 group-hover:text-amber-900">
                          Industry Setup / Profile
                        </span>
                        <span className="text-[10px] text-slate-500">{sector || "Switch sector parameters"}</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {query.trim() && totalResultsCount === 0 && (
              <div className="py-8 text-center px-4 space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  No matches found for "{query}"
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Try searching by campaign name, client company, contact email, or audit action.
                </p>
              </div>
            )}

            {/* SECTION 1: Campaigns */}
            {(selectedCategory === "all" || selectedCategory === "campaigns") && filteredCampaigns.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between px-2 text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    Campaigns ({filteredCampaigns.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("campaign-commander");
                    }}
                    className="hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  {filteredCampaigns.map((c) => (
                    <div
                      key={c.id || c.title}
                      onClick={() => handleSelectCampaign(c)}
                      className="p-2.5 rounded-xl hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {highlightMatch(c.id || "CAMP", query)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            c.status === "Approved" || c.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {c.status || "Active"}
                          </span>
                          {c.agentName && (
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                              • {highlightMatch(c.agentName, query)}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 line-clamp-1">
                          {highlightMatch(c.title || "Untitled Campaign", query)}
                        </h4>
                        {c.comments && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {highlightMatch(c.comments, query)}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        {c.budgetImpact ? (
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            ${c.budgetImpact.toLocaleString()}
                          </span>
                        ) : null}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: Leads */}
            {(selectedCategory === "all" || selectedCategory === "leads") && filteredLeads.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between px-2 text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-emerald-600" />
                    Leads Pipeline ({filteredLeads.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("crm");
                    }}
                    className="hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Open CRM <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  {filteredLeads.map((l) => (
                    <div
                      key={l.id || l.email}
                      onClick={() => handleSelectLead(l)}
                      className="p-2.5 rounded-xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                            {highlightMatch(l.name, query)}
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium">
                            @ {highlightMatch(l.company, query)}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Score: {l.leadScore || 85}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 truncate font-mono text-[10px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {highlightMatch(l.email, query)}
                          </span>
                          {l.territory && (
                            <span className="text-slate-400 hidden sm:inline">• {l.territory}</span>
                          )}
                        </div>
                        {l.serviceInterest && (
                          <div className="text-[10px] text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded inline-block truncate max-w-full">
                            Interest: {highlightMatch(l.serviceInterest, query)}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {l.status || "Qualified"}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: Audit Logs */}
            {(selectedCategory === "all" || selectedCategory === "audits") && filteredAudits.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between px-2 text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                    Security & Audit Trail ({filteredAudits.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onNavigateTab("dashboard");
                    }}
                    className="hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View All Audits <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1">
                  {filteredAudits.map((a) => (
                    <div
                      key={a.id || a.timestamp + a.action}
                      onClick={() => handleSelectAudit(a)}
                      className="p-2.5 rounded-xl hover:bg-purple-50/60 border border-slate-100 hover:border-purple-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-purple-900">
                            {highlightMatch(a.action, query)}
                          </span>
                          <span className="text-[10px] font-mono text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                            {a.role || "Executive"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {a.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 font-mono">
                          {highlightMatch(a.details || a.actor, query)}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Keyboard Hints & Clear All */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded font-bold">Esc</kbd> to exit</span>
              <span>•</span>
              <span>Click any record to navigate</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="global-search-clear-all-footer"
                onClick={handleClearAll}
                className="text-rose-600 hover:text-rose-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All</span>
              </button>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <div className="text-slate-400 hidden sm:block">
                {companyName || "MarketingOS"} Global Index
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
