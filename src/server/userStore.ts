import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "CEO" | "Vice President" | "AGM" | "Marketing Manager" | "Team Lead" | "Executive";
  department: string;
  companyName: string;
  organizationId: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

const USERS_FILE = path.join(DATA_DIR, "sbb_users.json");

export const ADMIN_EMAILS = [
  "shraddha.revdikar@gmail.com",
  "admin@sovereignbusiness.ca"
];

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function loadUsers(): Record<string, StoredUser> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to load users from storage:", err);
  }
  return {};
}

function saveUsers(users: Record<string, StoredUser>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist users to storage:", err);
  }
}

// In-memory cache synced with disk
let usersCache: Record<string, StoredUser> = loadUsers();

const revokedTokens = new Set<string>();
const revokedUsers = new Set<string>();

export function revokeToken(token: string) {
  revokedTokens.add(token);
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

export function revokeUser(userId: string) {
  revokedUsers.add(userId);
}

export function isUserRevoked(userId: string): boolean {
  return revokedUsers.has(userId);
}

export function findUserByEmail(email: string): StoredUser | null {
  const normalized = email.trim().toLowerCase();
  return usersCache[normalized] || null;
}

export function findUserById(id: string): StoredUser | null {
  for (const user of Object.values(usersCache)) {
    if (user.id === id) return user;
  }
  return null;
}

export function registerUser(params: {
  email: string;
  password: string;
  name: string;
  department?: string;
  companyName?: string;
  organizationId?: string;
}): { success: boolean; user?: StoredUser; error?: string } {
  const normalizedEmail = params.email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { success: false, error: "Invalid email address format." };
  }
  if (!params.password || params.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  if (usersCache[normalizedEmail]) {
    return { success: false, error: "An account with this email already exists." };
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(params.password, salt);
  const userId = "USR-" + crypto.randomBytes(6).toString("hex").toUpperCase();

  const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
  const assignedRole: StoredUser["role"] = isAdmin ? "Admin" : "Executive";

  const orgId = (params.organizationId || params.companyName || "sovereign_enterprise")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_");

  const newUser: StoredUser = {
    id: userId,
    email: normalizedEmail,
    name: params.name.trim() || normalizedEmail.split("@")[0],
    role: assignedRole,
    department: params.department?.trim() || (isAdmin ? "System Administration & Security" : "Enterprise Operations"),
    companyName: params.companyName?.trim() || "Sovereign Enterprise",
    organizationId: orgId,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };

  usersCache[normalizedEmail] = newUser;
  saveUsers(usersCache);

  return { success: true, user: newUser };
}

export function authenticateUser(email: string, password: string): { success: boolean; user?: StoredUser; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = usersCache[normalizedEmail];

  if (!user) {
    return { success: false, error: "Account not found with this email. Please check credentials or register." };
  }

  const incomingHash = hashPassword(password, user.salt);
  const hashBuf = Buffer.from(incomingHash, "hex");
  const storedBuf = Buffer.from(user.passwordHash, "hex");

  if (hashBuf.length !== storedBuf.length || !crypto.timingSafeEqual(hashBuf, storedBuf)) {
    return { success: false, error: "Invalid password. Please verify your credentials." };
  }

  return { success: true, user };
}
