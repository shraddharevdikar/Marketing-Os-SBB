import crypto from "crypto";
import {
  persistUserRecord,
  findStoredUserByEmail,
  findStoredUserById,
  appendAuthoritativeAuditBlock,
  type StoredUser
} from "./managedStore";

export type { StoredUser };

// In-memory active lookup cache
const usersCache: Record<string, StoredUser> = {};

// Revocation registries
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

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

/**
 * Public Registration:
 * Mandatory Security Constraint: Public registration MUST NEVER automatically assign Admin privileges.
 * Every public account is assigned standard 'Executive' role by default.
 */
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

  // Public registration role is strictly non-privileged Executive (no automatic Admin assignment)
  const assignedRole: StoredUser["role"] = "Executive";

  const orgId = (params.organizationId || params.companyName || "sovereign_enterprise")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "_");

  const newUser: StoredUser = {
    id: userId,
    email: normalizedEmail,
    name: params.name.trim() || normalizedEmail.split("@")[0],
    role: assignedRole,
    department: params.department?.trim() || "Enterprise Operations",
    companyName: params.companyName?.trim() || "Sovereign Enterprise",
    organizationId: orgId,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };

  usersCache[normalizedEmail] = newUser;
  persistUserRecord(newUser).catch(err => {
    console.error(`[STORAGE] Asynchronous managed store persistence failed:`, err);
  });

  return { success: true, user: newUser };
}

/**
 * Trusted, Auditable Administrator Provisioning Workflow:
 * Only an existing verified Administrator or cryptographically authorized bootstrap provisioning process
 * can grant the Admin role. Every grant is recorded in the immutable audit ledger.
 */
export function provisionAdministrator(params: {
  targetEmailOrId: string;
  authorizedByActor: string;
  authorizedByRole: string;
  justification: string;
  bootstrapSecret?: string;
}): { success: boolean; user?: StoredUser; error?: string } {
  const isBootstrap = Boolean(
    params.bootstrapSecret &&
    process.env.ADMIN_PROVISION_SECRET &&
    params.bootstrapSecret === process.env.ADMIN_PROVISION_SECRET
  );

  if (!isBootstrap && params.authorizedByRole !== "Admin") {
    return {
      success: false,
      error: `Forbidden: Only an authorized Administrator can provision Admin accounts. Caller has role '${params.authorizedByRole}'.`
    };
  }

  const normalized = params.targetEmailOrId.trim().toLowerCase();
  const targetUser = usersCache[normalized] || findUserById(params.targetEmailOrId);

  if (!targetUser) {
    return {
      success: false,
      error: `Target user '${params.targetEmailOrId}' not found in authoritative records.`
    };
  }

  targetUser.role = "Admin";
  targetUser.department = "System Administration & Security";
  usersCache[targetUser.email.toLowerCase()] = targetUser;

  persistUserRecord(targetUser).catch(err => {
    console.error(`[STORAGE] Administrator update persistence failed:`, err);
  });

  appendAuthoritativeAuditBlock({
    actor: params.authorizedByActor,
    role: params.authorizedByRole,
    tenantId: targetUser.organizationId,
    department: "System Administration & Security",
    action: "ADMINISTRATOR_ROLE_PROVISIONED",
    details: `Administrator role granted to ${targetUser.email} (${targetUser.id}). Justification: ${params.justification}`,
    payload: { targetUserId: targetUser.id, targetEmail: targetUser.email, grantedRole: "Admin" }
  }).catch(err => {
    console.error(`[AUDIT] Administrator provisioning audit block failed:`, err);
  });

  return { success: true, user: targetUser };
}

export function authenticateUser(email: string, password: string): { success: boolean; user?: StoredUser; error?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const user = usersCache[normalizedEmail];

  if (!user) {
    return { success: false, error: "Account not found with this email. Please check credentials or register." };
  }

  if (isUserRevoked(user.id)) {
    return { success: false, error: "This user account has been revoked. Access denied." };
  }

  const incomingHash = hashPassword(password, user.salt);
  const hashBuf = Buffer.from(incomingHash, "hex");
  const storedBuf = Buffer.from(user.passwordHash, "hex");

  if (hashBuf.length !== storedBuf.length || !crypto.timingSafeEqual(hashBuf, storedBuf)) {
    return { success: false, error: "Invalid password. Please verify your credentials." };
  }

  return { success: true, user };
}

export function _resetUserStore() {
  for (const k of Object.keys(usersCache)) {
    delete usersCache[k];
  }
  revokedTokens.clear();
  revokedUsers.clear();
}
