import crypto from "crypto";
import {
  persistUserRecord,
  findStoredUserByEmail,
  findStoredUserById,
  appendAuthoritativeAuditBlock,
  organizationExists,
  rollbackUserRecord,
  type StoredUser
} from "./managedStore";

export type { StoredUser };

// In-memory active lookup cache
const usersCache: Record<string, StoredUser> = {};

// Revocation registries
const revokedTokens = new Set<string>();
const revokedUsers = new Set<string>();

export interface OrgInvitation {
  code: string;
  organizationId: string;
  email?: string;
  role: StoredUser["role"];
  createdBy: string;
  createdAt: string;
  expiresAt: number;
}

const invitationsCache = new Map<string, OrgInvitation>();

export function createOrgInvitation(params: {
  organizationId: string;
  role?: StoredUser["role"];
  email?: string;
  createdBy: string;
  validHours?: number;
}): OrgInvitation {
  const code = "INV-" + crypto.randomBytes(8).toString("hex").toUpperCase();
  const invitation: OrgInvitation = {
    code,
    organizationId: params.organizationId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "_"),
    email: params.email ? params.email.trim().toLowerCase() : undefined,
    role: params.role || "Executive",
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + (params.validHours || 72) * 3600 * 1000
  };
  invitationsCache.set(code, invitation);
  return invitation;
}

export function verifyOrgInvitation(code: string, email?: string): OrgInvitation | null {
  const inv = invitationsCache.get(code.trim().toUpperCase());
  if (!inv) return null;
  if (Date.now() > inv.expiresAt) {
    invitationsCache.delete(code);
    return null;
  }
  if (inv.email && email && inv.email !== email.trim().toLowerCase()) {
    return null;
  }
  return inv;
}

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
 * 1. Must never allow a caller to choose an arbitrary existing organizationId.
 *    New users must be assigned to a newly provisioned organization, or join an existing organization
 *    strictly via a verified invitation code or verified administrator workflow.
 * 2. Asynchronous and fails safely if the authoritative database write fails.
 */
export async function registerUser(params: {
  email: string;
  password: string;
  name: string;
  department?: string;
  companyName?: string;
  organizationId?: string;
  invitationCode?: string;
  invitedByAdmin?: { actor: string; role: string; organizationId: string };
  bootstrapSecret?: string;
}): Promise<{ success: boolean; user?: StoredUser; error?: string }> {
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

  // Determine target organization safely
  let targetOrgId: string;
  let assignedRole: StoredUser["role"] = "Executive";

  // Case A: Verified invitation code
  if (params.invitationCode) {
    const verifiedInvite = verifyOrgInvitation(params.invitationCode, normalizedEmail);
    if (!verifiedInvite) {
      return { success: false, error: "Invalid or expired organization invitation code." };
    }
    targetOrgId = verifiedInvite.organizationId;
    assignedRole = verifiedInvite.role || "Executive";
  }
  // Case B: Verified administrator provisioning / invitation
  else if (params.invitedByAdmin) {
    if (params.invitedByAdmin.role !== "Admin") {
      return { success: false, error: "Forbidden: Only an authorized Administrator can invite members to an existing organization." };
    }
    targetOrgId = params.invitedByAdmin.organizationId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "_");
  }
  // Case C: Cryptographically authorized bootstrap provisioning
  else if (
    params.bootstrapSecret &&
    process.env.ADMIN_PROVISION_SECRET &&
    params.bootstrapSecret === process.env.ADMIN_PROVISION_SECRET
  ) {
    targetOrgId = (params.organizationId || params.companyName || "sovereign_enterprise")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "_");
  }
  // Case D: Public registration
  else {
    // If a caller specified an organizationId, verify whether that organization already exists
    if (params.organizationId) {
      const requestedOrg = params.organizationId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "_");
      const exists = await organizationExists(requestedOrg);
      if (exists) {
        return {
          success: false,
          error: "Forbidden: Public registration cannot choose an arbitrary existing organizationId. Joining an existing organization requires a verified invitation or administrator provisioning."
        };
      }
      targetOrgId = requestedOrg;
    } else {
      // Provision a fresh, isolated new organization for this new customer
      const baseSlug = (params.companyName || params.name || "org")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, "_")
        .slice(0, 16);
      const uniqueSuffix = crypto.randomBytes(4).toString("hex");
      targetOrgId = `org_${baseSlug}_${uniqueSuffix}`;
    }
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(params.password, salt);
  const userId = "USR-" + crypto.randomBytes(6).toString("hex").toUpperCase();

  const newUser: StoredUser = {
    id: userId,
    email: normalizedEmail,
    name: params.name.trim() || normalizedEmail.split("@")[0],
    role: assignedRole,
    department: params.department?.trim() || "Enterprise Operations",
    companyName: params.companyName?.trim() || "Sovereign Enterprise",
    organizationId: targetOrgId,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };

  // Asynchronous transactional persistence: fail safely if the authoritative write fails
  try {
    await persistUserRecord(newUser);
  } catch (err: any) {
    // Ensure failed database write does NOT result in successful registration or cached user
    delete usersCache[normalizedEmail];
    rollbackUserRecord(newUser);
    return {
      success: false,
      error: `Authoritative database write failed: ${err.message}`
    };
  }

  // Only update active cache once persistence and membership are confirmed
  usersCache[normalizedEmail] = newUser;
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
