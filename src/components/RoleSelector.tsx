import React, { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Shield, Users, Briefcase, Star, User, ShieldCheck, Lock, ShieldAlert } from "lucide-react";

export const ROLE_RANKS: Record<string, number> = {
  Admin: 0,
  CEO: 1,
  "Vice President": 2,
  AGM: 3,
  "Marketing Manager": 4,
  "Team Lead": 5,
  Executive: 6
};

export const ci: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  desc: string;
  authority: string;
}> = {
  Admin: {
    label: "System Administrator",
    icon: ShieldCheck,
    color: "border-rose-500 text-rose-600 bg-rose-50",
    desc: "Full administrative access. Manages user accounts, configures RBAC tab permissions, oversees audit trails, and grants individual access rights.",
    authority: "Full System Control, User Permission Management, All Workspace Tabs"
  },
  CEO: {
    label: "Chief Executive Officer",
    icon: Crown,
    color: "border-yellow-500 text-yellow-600 bg-yellow-50",
    desc: "Full enterprise oversight. Can approve any budget, override lower-tier approvals, and view global performance logs.",
    authority: "All Budgets ($ Unlimited), Global Strategies, System Overrides"
  },
  "Vice President": {
    label: "Vice President of Marketing",
    icon: Shield,
    color: "border-indigo-500 text-indigo-600 bg-indigo-50",
    desc: "Manages cross-department activities. Approves enterprise campaigns and mid-tier regional strategies.",
    authority: "Budgets up to $15,000, Multi-Channel Campaigns"
  },
  AGM: {
    label: "Assistant General Manager",
    icon: Users,
    color: "border-emerald-500 text-emerald-600 bg-emerald-50",
    desc: "Oversight of tactical department managers, campaign performance review, and departmental budget checks.",
    authority: "Budgets up to $5,000, SEO & CRM Adjustments"
  },
  "Marketing Manager": {
    label: "Marketing Manager",
    icon: Briefcase,
    color: "border-blue-500 text-blue-600 bg-blue-50",
    desc: "Designs multi-channel campaign parameters, reviews AI outputs, assigns execution tasks, and guides creative teams.",
    authority: "Budgets up to $2,500, PPC & Ad copy review"
  },
  "Team Lead": {
    label: "Operational Team Lead",
    icon: Star,
    color: "border-purple-500 text-purple-600 bg-purple-50",
    desc: "Direct oversight of task execution. Reviews copy, approves immediate social postings, and keyword setups.",
    authority: "Budgets up to $500, Daily Social Calendar"
  },
  Executive: {
    label: "Marketing Executive",
    icon: User,
    color: "border-gray-400 text-gray-700 bg-gray-100",
    desc: "Executes campaigns, requests agent evaluations, operates CRM routing, and initiates workflow proposals.",
    authority: "Propose Campaigns, Execute approved tactical tasks, Query AI Assistant"
  }
};

interface RoleSelectorProps {
  currentRole: string;
  authenticatedRole?: string;
  onChangeRole: (role: string) => void;
  userName: string;
  onChangeName: (name: string) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  authenticatedRole,
  onChangeRole,
  userName,
  onChangeName
}) => {
  const [deniedToast, setDeniedToast] = useState<string | null>(null);
  
  // Base authenticated role defaults to Admin if not logged in
  const authRole = authenticatedRole || currentRole || "Admin";
  const authRank = ROLE_RANKS[authRole] ?? 0;

  const activeIcon = ci[currentRole]?.icon || User;

  const handleSelectRole = (targetRole: string) => {
    const targetRank = ROLE_RANKS[targetRole] ?? 6;

    // Security Clearance Check: Cannot elevate to higher clearance than authenticated account
    if (targetRank < authRank) {
      setDeniedToast(`Security Restriction: Your account level (${authRole}) cannot access higher clearance tier '${targetRole}'.`);
      setTimeout(() => setDeniedToast(null), 3500);
      return;
    }

    onChangeRole(targetRole);
  };

  return (
    <div id="role-selector-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-sans font-medium tracking-tight text-slate-800 flex items-center gap-2">
              {React.createElement(activeIcon, { className: "w-5 h-5 text-purple-600" })}
              <span>Active Enterprise Security Profile</span>
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              LOGGED IN AS: {authRole.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Role-Based Access Control (RBAC) active. You can only view and switch to profiles equal to or below your assigned operational rank ({authRole}).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-500 whitespace-nowrap">Operator Name:</label>
          <input
            id="operator-name-input"
            type="text"
            value={userName}
            onChange={(e) => onChangeName(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans text-slate-700 font-medium w-40"
            placeholder="Operator name"
          />
        </div>
      </div>

      {deniedToast && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-800 font-medium"
        >
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{deniedToast}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">
        {Object.keys(ci).map((role) => {
          const u = ci[role];
          const IconComp = u.icon;
          const isActive = currentRole === role;
          const targetRank = ROLE_RANKS[role] ?? 6;
          const isLocked = targetRank < authRank;

          return (
            <button
              key={role}
              id={`role-btn-${role.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => handleSelectRole(role)}
              disabled={isLocked}
              title={isLocked ? `Locked: Account rank (${authRole}) cannot access ${role}` : `Switch to ${role}`}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all relative ${
                isLocked
                  ? "bg-slate-100/80 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                  : isActive
                  ? `${u.color} shadow-sm font-semibold scale-102 cursor-pointer`
                  : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
              }`}
            >
              {isLocked && (
                <div className="absolute top-1.5 right-1.5 p-0.5 bg-slate-200 text-slate-500 rounded-full">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              <IconComp className={`w-5 h-5 mb-1.5 ${isLocked ? "text-slate-400" : isActive ? "scale-110" : "text-slate-500"}`} />
              <span className="text-xs font-sans tracking-tight block font-medium">{role}</span>
              {isLocked && (
                <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-tight font-semibold">
                  LOCKED
                </span>
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={currentRole}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-3 md:items-center justify-between"
      >
        <div className="md:max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold">
              {currentRole.toUpperCase()} STATUS
            </span>
            <span className="text-xs text-slate-600 font-sans font-medium">{ci[currentRole]?.label}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 font-sans leading-relaxed">{ci[currentRole]?.desc}</p>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4 whitespace-nowrap">
          <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider">Signing Authority Scope</span>
          <span className="text-xs font-mono font-semibold text-slate-700 block mt-1">
            {ci[currentRole]?.authority}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

