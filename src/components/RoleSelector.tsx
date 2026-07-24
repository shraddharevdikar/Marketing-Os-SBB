import React from "react";
import { motion } from "motion/react";
import { Crown, Shield, Users, Briefcase, Star, User } from "lucide-react";

export const ci: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  desc: string;
  authority: string;
}> = {
  CEO: {
    label: "Chief Executive Officer",
    icon: Crown,
    color: "border-yellow-500 text-yellow-600 bg-yellow-50",
    desc: "Full enterprise oversight. Can approve any budget, override lower-tier approvals, and view global performance logs.",
    authority: "All Budgets (CAD ∞), Global Strategies, System Overrides"
  },
  "Vice President": {
    label: "Vice President of Marketing",
    icon: Shield,
    color: "border-indigo-500 text-indigo-600 bg-indigo-50",
    desc: "Manages cross-department activities. Approves enterprise campaigns and mid-tier regional strategies.",
    authority: "Budgets up to CAD 15,000, Multi-Channel Campaigns"
  },
  AGM: {
    label: "Assistant General Manager",
    icon: Users,
    color: "border-emerald-500 text-emerald-600 bg-emerald-50",
    desc: "Oversight of tactical department managers, campaign performance review, and departmental budget checks.",
    authority: "Budgets up to CAD 5,000, SEO & CRM Adjustments"
  },
  "Marketing Manager": {
    label: "Marketing Manager",
    icon: Briefcase,
    color: "border-blue-500 text-blue-600 bg-blue-50",
    desc: "Designs multi-channel campaign parameters, reviews AI outputs, assigns execution tasks, and guides creative teams.",
    authority: "Budgets up to CAD 2,500, PPC & Ad copy review"
  },
  "Team Lead": {
    label: "Operational Team Lead",
    icon: Star,
    color: "border-purple-500 text-purple-600 bg-purple-50",
    desc: "Direct oversight of task execution. Reviews copy, approves immediate social postings, and keyword setups.",
    authority: "Budgets up to CAD 500, Daily Social Calendar"
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
  onChangeRole: (role: string) => void;
  userName: string;
  onChangeName: (name: string) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  currentRole,
  onChangeRole,
  userName,
  onChangeName
}) => {
  const activeIcon = ci[currentRole]?.icon || User;

  return (
    <div id="role-selector-card" className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-sans font-medium tracking-tight text-slate-800 flex items-center gap-2">
            {React.createElement(activeIcon, { className: "w-5 h-5" })}
            <span>Active Enterprise Security Profile</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Toggle your operational tier below to simulate role-based authorization constraints, approval scopes, and custom reports.
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
        {Object.keys(ci).map((role) => {
          const u = ci[role];
          const IconComp = u.icon;
          const isActive = currentRole === role;
          return (
            <button
              key={role}
              id={`role-btn-${role.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => onChangeRole(role)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                isActive
                  ? `${u.color} shadow-sm font-semibold scale-102`
                  : "border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50"
              }`}
            >
              <IconComp className={`w-5 h-5 mb-1.5 ${isActive ? "scale-110" : "text-slate-400"}`} />
              <span className="text-xs font-sans tracking-tight block">{role}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        key={currentRole}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg flex flex-col md:flex-row gap-3 md:items-center justify-between"
      >
        <div className="md:max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
              {currentRole.toUpperCase()} STATUS
            </span>
            <span className="text-xs text-slate-500 font-sans">{ci[currentRole]?.label}</span>
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
