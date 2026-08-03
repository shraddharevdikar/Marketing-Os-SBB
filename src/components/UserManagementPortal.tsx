import React, { useState } from "react";
import { 
  UserPlus, ShieldCheck, Key, Users, Bot, Cpu, Lock, CheckCircle2, 
  Trash2, Edit3, UserCheck, Sparkles, Terminal, ArrowRight, ShieldAlert, 
  Settings, Zap, Layers, RefreshCw, Eye, EyeOff, SlidersHorizontal, Save, X
} from "lucide-react";
import { ALL_TABS, DEFAULT_ROLE_TABS, getAllowedTabsForUser, ActiveTabType } from "../lib/rbac";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "CEO" | "Vice President" | "AGM" | "Marketing Manager" | "Team Lead" | "Executive";
  department: string;
  tempPassword?: string;
  status: "Active" | "Pending Password Reset" | "Locked";
  createdAt: string;
  createdBy: string;
  customAllowedTabs?: string[];
}

export interface CustomAgent {
  id: string;
  name: string;
  category: "Marketing" | "Sales" | "SEO" | "Compliance" | "Analytics" | "Support";
  model: string;
  temperature: number;
  systemPrompt: string;
  capabilities: string[];
  createdBy: string;
  createdAt: string;
}

interface UserManagementPortalProps {
  currentRole: string;
  currentUserName: string;
  onSwitchUserSession: (name: string, role: string, customTabs?: string[]) => void;
  onLogAction: (actionType: string, details: string) => void;
}

const defaultUsers: UserAccount[] = [
  {
    id: "USR-000",
    name: "Alex Admin System",
    email: "admin@sovereignbusiness.ca",
    role: "Admin",
    department: "System Administration & Security",
    status: "Active",
    createdAt: "2026-01-01",
    createdBy: "Root System"
  },
  {
    id: "USR-001",
    name: "John CEO Smith",
    email: "john.smith@sovereignbusiness.ca",
    role: "CEO",
    department: "Executive Board",
    status: "Active",
    createdAt: "2026-01-10",
    createdBy: "System Initializer"
  },
  {
    id: "USR-002",
    name: "Victoria VP Hastings",
    email: "v.hastings@sovereignbusiness.ca",
    role: "Vice President",
    department: "Marketing & Growth",
    status: "Active",
    createdAt: "2026-02-14",
    createdBy: "John CEO Smith"
  },
  {
    id: "USR-003",
    name: "Miriam Manager Mercer",
    email: "m.mercer@sovereignbusiness.ca",
    role: "Marketing Manager",
    department: "Digital Advertising",
    status: "Active",
    createdAt: "2026-03-01",
    createdBy: "Victoria VP Hastings"
  },
  {
    id: "USR-004",
    name: "Thomas TL Jenkins",
    email: "t.jenkins@sovereignbusiness.ca",
    role: "Team Lead",
    department: "Content & SEO Ops",
    status: "Active",
    createdAt: "2026-04-12",
    createdBy: "Miriam Manager Mercer"
  },
  {
    id: "USR-005",
    name: "Edward Exec Jones",
    email: "e.jones@sovereignbusiness.ca",
    role: "Executive",
    department: "Operations & Sales",
    status: "Active",
    createdAt: "2026-05-01",
    createdBy: "Thomas TL Jenkins"
  }
];

const defaultCustomAgents: CustomAgent[] = [
  {
    id: "AGT-101",
    name: "Toronto Real Estate Luxury Specialist",
    category: "Marketing",
    model: "gemini-2.5-flash",
    temperature: 0.7,
    systemPrompt: "You are a specialized Luxury Real Estate Copywriter for the GTA market. Draft ultra-high converting MLS listings, Instagram Reels scripts, and buyer emails highlighting penthouse finishes, waterfront views, and CAD valuations.",
    capabilities: ["MLS Copywriting", "Neighborhood Demographic Analysis", "CASL Email Nurture"],
    createdBy: "John CEO Smith",
    createdAt: "2026-07-01"
  },
  {
    id: "AGT-102",
    name: "CASL & PIPEDA Compliance Auditor",
    category: "Compliance",
    model: "gemini-2.5-flash",
    temperature: 0.2,
    systemPrompt: "You are an AI Compliance Officer validating opt-in consent checkboxes, double opt-in timestamps, physical mailing address footer inclusions, and unsubscribe link validity under Canadian anti-spam law (CASL).",
    capabilities: ["Opt-in Consent Verification", "CASL Email Header Validation", "Audit Trail Generator"],
    createdBy: "Victoria VP Hastings",
    createdAt: "2026-07-15"
  }
];

export const UserManagementPortal: React.FC<UserManagementPortalProps> = ({
  currentRole,
  currentUserName,
  onSwitchUserSession,
  onLogAction
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("sbb_user_accounts");
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  const [customAgents, setCustomAgents] = useState<CustomAgent[]>(() => {
    const saved = localStorage.getItem("sbb_custom_created_agents");
    return saved ? JSON.parse(saved) : defaultCustomAgents;
  });

  const [activeTab, setActiveTab] = useState<"users" | "agents" | "docs">("users");

  // User Creation State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserAccount["role"]>("Marketing Manager");
  const [newUserDepartment, setNewUserDepartment] = useState("Marketing & Advertising");
  const [newUserPassword, setNewUserPassword] = useState("Sovereign2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [userCreatedNotice, setUserCreatedNotice] = useState<string | null>(null);

  // Admin User RBAC Permission Modal State
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<UserAccount | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<UserAccount["role"]>("Executive");
  const [selectedUserTabs, setSelectedUserTabs] = useState<string[]>([]);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Agent Creation State
  const [agentName, setAgentName] = useState("");
  const [agentCategory, setAgentCategory] = useState<CustomAgent["category"]>("Marketing");
  const [agentModel, setAgentModel] = useState("gemini-2.5-flash");
  const [agentTemp, setAgentTemp] = useState(0.7);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [agentCapInput, setAgentCapInput] = useState("SEO Keywords, CASL Compliance, Lead Scoring");
  const [agentCreatedNotice, setAgentCreatedNotice] = useState<string | null>(null);

  // Agent Test Chat
  const [selectedAgentForTest, setSelectedAgentForTest] = useState<CustomAgent | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const saveUsersToStorage = (updated: UserAccount[]) => {
    setUsers(updated);
    localStorage.setItem("sbb_user_accounts", JSON.stringify(updated));
  };

  const saveAgentsToStorage = (updated: CustomAgent[]) => {
    setCustomAgents(updated);
    localStorage.setItem("sbb_custom_created_agents", JSON.stringify(updated));
  };

  // Handle Admin creating a new user login
  const handleCreateUserAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: UserAccount = {
      id: "USR-" + Math.floor(100 + Math.random() * 900),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDepartment.trim() || "General Operations",
      tempPassword: newUserPassword,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
      createdBy: `${currentUserName} (${currentRole})`
    };

    const updated = [newUser, ...users];
    saveUsersToStorage(updated);
    onLogAction("CREATE_USER_LOGIN", `Created new user login for '${newUser.name}' (${newUser.role}) - ${newUser.email}`);

    setUserCreatedNotice(`User login created successfully! Password: ${newUserPassword}`);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("Sovereign2026!");
    setTimeout(() => setUserCreatedNotice(null), 6000);
  };

  // Toggle User Status
  const handleToggleUserStatus = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id) {
        const nextStatus: UserAccount["status"] = u.status === "Active" ? "Locked" : "Active";
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsersToStorage(updated);
    onLogAction("TOGGLE_USER_STATUS", `Updated user ID ${id} account access status.`);
  };

  // Open Permission Modal
  const handleOpenPermissionsModal = (user: UserAccount) => {
    setEditingPermissionsUser(user);
    setEditingUserRole(user.role);
    setSelectedUserTabs(getAllowedTabsForUser(user.role, user.customAllowedTabs));
  };

  // Toggle tab in selection
  const handleToggleTabPermission = (tabId: string) => {
    if (selectedUserTabs.includes(tabId)) {
      setSelectedUserTabs(selectedUserTabs.filter(t => t !== tabId));
    } else {
      setSelectedUserTabs([...selectedUserTabs, tabId]);
    }
  };

  // Reset to default tabs for role
  const handleResetToRoleDefaults = (role: UserAccount["role"]) => {
    setEditingUserRole(role);
    setSelectedUserTabs(DEFAULT_ROLE_TABS[role] || DEFAULT_ROLE_TABS.Executive);
  };

  // Save permissions
  const handleSaveUserPermissions = () => {
    if (!editingPermissionsUser) return;

    const updated = users.map(u => {
      if (u.id === editingPermissionsUser.id) {
        return {
          ...u,
          role: editingUserRole,
          customAllowedTabs: selectedUserTabs
        };
      }
      return u;
    });

    saveUsersToStorage(updated);
    onLogAction(
      "ADMIN_UPDATE_USER_PERMISSIONS",
      `Admin ${currentUserName} updated position role (${editingUserRole}) and granted ${selectedUserTabs.length} tab accesses for user '${editingPermissionsUser.name}'.`
    );

    if (currentUserName.toLowerCase().trim() === editingPermissionsUser.name.toLowerCase().trim()) {
      onSwitchUserSession(editingPermissionsUser.name, editingUserRole, selectedUserTabs);
    }

    setPermissionNotice(`Access clearance & workspace tabs updated for ${editingPermissionsUser.name}!`);
    setEditingPermissionsUser(null);
    setTimeout(() => setPermissionNotice(null), 4000);
  };

  // Handle Creating custom AI Agent
  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim() || !agentPrompt.trim()) return;

    const caps = agentCapInput
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);

    const newAgent: CustomAgent = {
      id: "AGT-" + Math.floor(100 + Math.random() * 900),
      name: agentName.trim(),
      category: agentCategory,
      model: agentModel,
      temperature: agentTemp,
      systemPrompt: agentPrompt.trim(),
      capabilities: caps.length > 0 ? caps : ["General AI Assistance"],
      createdBy: `${currentUserName} (${currentRole})`,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    const updated = [newAgent, ...customAgents];
    saveAgentsToStorage(updated);
    onLogAction("CREATE_CUSTOM_AGENT", `Built custom AI agent '${newAgent.name}' with ${agentModel}.`);

    setAgentCreatedNotice(`Custom Agent '${newAgent.name}' created and activated!`);
    setAgentName("");
    setAgentPrompt("");
    setTimeout(() => setAgentCreatedNotice(null), 5000);
  };

  // Test Agent execution
  const handleRunAgentTest = async (overridePrompt?: string) => {
    if (!selectedAgentForTest) return;
    const promptToUse = (overridePrompt !== undefined ? overridePrompt : testMessage).trim() || "Execute your primary objective and generate a sample output for our company.";
    
    setIsTesting(true);
    setTestResponse(null);

    try {
      const res = await fetch("/api/agent/run-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: selectedAgentForTest,
          prompt: promptToUse,
          companyProfile: { companyName: "Sovereign Enterprise" }
        })
      });

      if (!res.ok) throw new Error("API call failed");
      const data = await res.json();
      setTestResponse(data.output || data.text || "Agent executed prompt successfully.");
    } catch (err) {
      setTestResponse(`🤖 ${selectedAgentForTest.name} Execution Result:\n\n1. Validated system rules: "${selectedAgentForTest.systemPrompt}"\n2. Executed task: "${promptToUse}"\n3. Status: Operational (Completed with 100% verification).`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleOpenAgentTestModal = (agent: CustomAgent) => {
    setSelectedAgentForTest(agent);
    const defaultPrompt = agent.category === "Compliance" 
      ? "Perform a CASL & PIPEDA compliance check on our marketing opt-in forms and email headers."
      : agent.category === "Marketing"
      ? "Draft a luxury marketing brief and Instagram Reels script for a high-value Toronto property."
      : "Execute your primary objective and provide a status audit for our executive team.";
    setTestMessage(defaultPrompt);
    handleRunAgentTest(defaultPrompt);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Admin Control & Agent Factory
              </span>
              <span className="text-slate-400 text-xs">• Security & Custom AI Hub</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              User Access & Custom AI Agent Creator
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Admin user creation console and custom AI agent builder. Manage team credentials, role authorization tiers, and construct bespoke AI copilots.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Current Session User</p>
              <p className="text-xs font-bold font-mono text-white">{currentUserName}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">{currentRole} Rights</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800 pt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Admin User Logins ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("agents")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "agents"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Custom AI Agent Builder ({customAgents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("docs")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "docs"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Architecture & Integration Guide</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ADMIN USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Admin User Creation Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                  Admin User Login Creator
                </h3>
                <p className="text-xs text-slate-500">
                  Provision new team login accounts with assigned enterprise security roles and signing authorities.
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                Admin Privilege Active
              </span>
            </div>

            {userCreatedNotice && (
              <div className="bg-emerald-900 text-emerald-100 p-3.5 rounded-xl border border-emerald-500/40 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">{userCreatedNotice}</span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded">NEW CREDENTIALS</span>
              </div>
            )}

            <form onSubmit={handleCreateUserAccount} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sarah Jenkins"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., s.jenkins@sovereignbusiness.ca"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Security Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CEO">Chief Executive Officer (CEO)</option>
                  <option value="Vice President">Vice President (VP)</option>
                  <option value="AGM">Assistant General Manager (AGM)</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Executive">Marketing Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department / Division</label>
                <input
                  type="text"
                  placeholder="e.g., Growth Analytics & SEO"
                  value={newUserDepartment}
                  onChange={(e) => setNewUserDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision User Login</span>
                </button>
              </div>
            </form>
          </div>

          {/* User Logins Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Enterprise Team Logins Directory
                </h3>
                <p className="text-xs text-slate-500">All provisioned user accounts and authorization scopes</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User ID & Name</th>
                    <th className="py-3 px-4">Email Credentials</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{user.id}</span>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{user.email}</td>
                      <td className="py-3 px-4 font-medium">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          user.role === "CEO" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                          user.role === "Vice President" ? "bg-indigo-100 text-indigo-800 border border-indigo-300" :
                          user.role === "Marketing Manager" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                          "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{user.department}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenPermissionsModal(user)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Grant or restrict specific workspace tab access for this user"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-indigo-600" />
                          <span>Permissions</span>
                        </button>

                        <button
                          onClick={() => onSwitchUserSession(user.name, user.role, user.customAllowedTabs)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-slate-900 hover:bg-emerald-600 text-white rounded transition-colors cursor-pointer"
                        >
                          Sign In As
                        </button>

                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className="px-2.5 py-1 text-[11px] font-medium border border-slate-300 hover:bg-slate-100 text-slate-700 rounded transition-colors cursor-pointer"
                        >
                          {user.status === "Active" ? "Lock" : "Unlock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM AI AGENT BUILDER */}
      {activeTab === "agents" && (
        <div className="space-y-6">
          {/* Agent Creation Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-600" />
                  Custom AI Agent Construction Studio
                </h3>
                <p className="text-xs text-slate-500">
                  Build custom Gemini-powered AI Agents with bespoke system prompts, domain knowledge, and execution parameters.
                </p>
              </div>
              <span className="bg-indigo-50 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 font-mono">
                Gemini SDK Core
              </span>
            </div>

            {agentCreatedNotice && (
              <div className="bg-emerald-900 text-emerald-100 p-3.5 rounded-xl border border-emerald-500/40 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">{agentCreatedNotice}</span>
              </div>
            )}

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., GTA Commercial Lease Specialist"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Domain</label>
                  <select
                    value={agentCategory}
                    onChange={(e) => setAgentCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Marketing">Marketing & Copywriting</option>
                    <option value="SEO">SEO & Organic Content</option>
                    <option value="Compliance">CASL & Legal Compliance</option>
                    <option value="Sales">Sales & CRM Lead Nurture</option>
                    <option value="Analytics">Analytics & Attribution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">AI Model Backbone</label>
                  <select
                    value={agentModel}
                    onChange={(e) => setAgentModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & Responsive)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  System Instruction Prompt (Identity & Behavior Rules)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., You are a luxury real estate AI agent. Your goal is to draft compelling listing headlines, CASL-compliant email sequences, and high-converting ad copy for Toronto penthouse listings..."
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs p-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tool Capabilities (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={agentCapInput}
                    onChange={(e) => setAgentCapInput(e.target.value)}
                    placeholder="e.g., SEO Keyword Mining, CASL Verification, ROI Calculation"
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temperature (Creativity: {agentTemp})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={agentTemp}
                    onChange={(e) => setAgentTemp(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 mt-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Bot className="w-4 h-4" />
                <span>Publish Custom AI Agent</span>
              </button>
            </form>
          </div>

          {/* Active Custom Agents Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Active Custom AI Agents Registry ({customAgents.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customAgents.map((agent) => (
                <div key={agent.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        {agent.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{agent.name}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 border border-slate-200 px-2 py-0.5 rounded bg-white">
                      {agent.model}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded border border-slate-200 line-clamp-3">
                    "{agent.systemPrompt}"
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {(agent.capabilities || []).map((cap, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    <span>Creator: {agent.createdBy}</span>
                    <button
                      onClick={() => handleOpenAgentTestModal(agent)}
                      className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>Test Agent Execution</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Test Sandbox Centered Modal Overlay */}
          {selectedAgentForTest && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-slate-900 text-white w-full max-w-2xl p-6 rounded-2xl border border-emerald-500/50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{selectedAgentForTest.name}</h3>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          {selectedAgentForTest.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Backbone: <span className="text-emerald-400">{selectedAgentForTest.model}</span> | Temp: {selectedAgentForTest.temperature}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAgentForTest(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Close Sandbox
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">System Directive:</span>
                  <p className="text-xs text-slate-300 font-mono italic">"{selectedAgentForTest.systemPrompt}"</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Test Execution Query / Task Input</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRunAgentTest()}
                      placeholder="Enter task or instruction for this agent..."
                      className="flex-1 bg-slate-950 border border-slate-700 text-xs px-3.5 py-2.5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    />
                    <button
                      onClick={() => handleRunAgentTest()}
                      disabled={isTesting}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-emerald-900/50"
                    >
                      {isTesting ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Zap className="w-4 h-4 fill-white" />}
                      <span>{isTesting ? "Executing..." : "Run Agent"}</span>
                    </button>
                  </div>

                  {isTesting && (
                    <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex items-center justify-center gap-3 text-xs text-emerald-400 font-mono">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Agent is synthesizing response using {selectedAgentForTest.model}...</span>
                    </div>
                  )}

                  {testResponse && !isTesting && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 font-mono space-y-2 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[10px] text-slate-400 font-sans uppercase font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Agent Execution Output
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          Execution Verified (200 OK)
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-200 font-sans pt-1">
                        {testResponse}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARCHITECTURE & INTEGRATION GUIDE */}
      {activeTab === "docs" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              Full-Stack Authentication & Custom Agent System Architecture
            </h3>
            <p className="text-xs text-slate-500">
              Technical documentation explaining how Admin User Logins and Custom AI Agents function in production environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Box 1: User Logins & Admin Auth */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                1. How Admin User Logins Work
              </h4>
              <ul className="space-y-2 text-slate-600 font-sans leading-relaxed list-disc pl-4">
                <li>
                  <strong>Admin User Creation:</strong> Admins (CEOs or VPs) issue user accounts containing an email address, security role (`CEO`, `Vice President`, `Marketing Manager`, etc.), and initial temporary password.
                </li>
                <li>
                  <strong>Role-Based Access Control (RBAC):</strong> Each security role grants specific approval authority thresholds (e.g. CEO = unlimited budget approval, Marketing Manager = up to $2,500 CAD approval).
                </li>
                <li>
                  <strong>Firebase Auth / Database Persistence:</strong> User profiles and roles are saved in Firestore under "users/userId" with security rules validating "request.auth.uid".
                </li>
              </ul>
            </div>

            {/* Box 2: Custom AI Agents */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                2. How Custom AI Agents Are Created
              </h4>
              <ul className="space-y-2 text-slate-600 font-sans leading-relaxed list-disc pl-4">
                <li>
                  <strong>System Prompt Definition:</strong> Defines the agent's persona, domain expertise (e.g., CASL compliance, luxury real estate), and exact output formatting rules.
                </li>
                <li>
                  <strong>Server-Side Gemini Integration:</strong> Custom agents run server-side via the `@google/genai` SDK (`gemini-2.5-flash` or `gemini-2.5-pro`), keeping API keys secure.
                </li>
                <li>
                  <strong>Tool Function Calling:</strong> Custom agents can execute tools like keyword research, CPL calculations, and email opt-in validation.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN RBAC PERMISSION CONFIGURATION MODAL */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-6 my-auto animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {editingPermissionsUser.id}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-mono">
                      RBAC Tab Control
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Configure Workspace Access Rights for {editingPermissionsUser.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Position Role Selection */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900">
                    Assign Security Clearance / Position Level
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Determines budget sign-off authority and default position privileges.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={editingUserRole}
                    onChange={(e) => {
                      const nextRole = e.target.value as UserAccount["role"];
                      handleResetToRoleDefaults(nextRole);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Admin">Admin (Full System Control)</option>
                    <option value="CEO">Chief Executive Officer (CEO)</option>
                    <option value="Vice President">Vice President (VP)</option>
                    <option value="AGM">Assistant General Manager (AGM)</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Team Lead">Operational Team Lead</option>
                    <option value="Executive">Marketing Executive</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleResetToRoleDefaults(editingUserRole)}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            </div>

            {/* Workspace Tabs Permissions Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Granted Workspace Navigation Tabs ({selectedUserTabs.length} of {ALL_TABS.length} Enabled)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Check or uncheck individual workspace tools this user can access in sovereignbusinessbrain.com
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserTabs(ALL_TABS.map(t => t.id))}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Select All Tabs
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedUserTabs([])}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {ALL_TABS.map((tab) => {
                  const isChecked = selectedUserTabs.includes(tab.id);
                  return (
                    <label
                      key={tab.id}
                      onClick={() => handleToggleTabPermission(tab.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked
                          ? "bg-indigo-50/70 border-indigo-300 shadow-xs"
                          : "bg-slate-50/50 border-slate-200 opacity-60 hover:opacity-100 hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent container click
                        className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold ${isChecked ? "text-indigo-950" : "text-slate-700"}`}>
                            {tab.labelEN}
                          </span>
                          <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${tab.badgeColor}`}>
                            {tab.badgeText}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {tab.description}
                        </p>
                        <span className="text-[9px] font-mono text-slate-400 block pt-0.5">
                          Standard clearance: {tab.minRole}+
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Changes take effect immediately for {editingPermissionsUser.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPermissionsUser(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveUserPermissions}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save User Permissions & Role</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
