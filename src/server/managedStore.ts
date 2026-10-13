import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

export interface ApprovalGate {
  id: string;
  tenantId: string;
  title: string;
  category: "CRITICAL_BUDGET_RELEASE" | "PUBLIC_AD_DISPATCH" | "CUSTOMER_PII_EXPORT" | "AGENT_INTEGRATION_KEY_GRANT";
  requestedBy: string;
  requestedRole: string;
  department: string;
  amountCad?: number;
  description: string;
  riskScore: number;
  requiredMinRole: "CEO" | "Vice President" | "Admin";
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "EXECUTED";
  createdAt: string;
  parameters?: Record<string, any>;
  parameterHash?: string;
  decidedAt?: string;
  decidedBy?: string;
  decidedRole?: string;
  justification?: string;
  executedAt?: string;
  executedBy?: string;
}

export interface AuditBlock {
  blockIndex: number;
  timestamp: string;
  actor: string;
  role: string;
  tenantId: string;
  department: string;
  action: string;
  details: string;
  payloadHash: string;
  prevHash: string;
  hash: string;
}

export interface TenantBackup {
  tenantId: string;
  timestamp: string;
  checksum: string;
  users: StoredUser[];
  approvalGates: ApprovalGate[];
  auditBlocks: AuditBlock[];
}

// In-memory tenant concurrency lock registry
const tenantLocks = new Map<string, Promise<void>>();

export async function withTenantLock<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  const sanitizedTenant = (tenantId || "default_org").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  while (tenantLocks.has(sanitizedTenant)) {
    await tenantLocks.get(sanitizedTenant);
  }

  let resolveLock!: () => void;
  const lockPromise = new Promise<void>((res) => { resolveLock = res; });
  tenantLocks.set(sanitizedTenant, lockPromise);

  try {
    return await fn();
  } finally {
    tenantLocks.delete(sanitizedTenant);
    resolveLock();
  }
}

// In-process memory stores (acting as transactional buffer & cache)
const userStoreByEmail = new Map<string, StoredUser>();
const userStoreById = new Map<string, StoredUser>();
const approvalGatesByTenant = new Map<string, Map<string, ApprovalGate>>();
const auditBlocksByTenant = new Map<string, AuditBlock[]>();

// Directory for durable crash-resilient tenant partitioned snapshots
const MANAGED_DATA_DIR = path.resolve(process.cwd(), "data", "managed_storage");
if (!fs.existsSync(MANAGED_DATA_DIR)) {
  try {
    fs.mkdirSync(MANAGED_DATA_DIR, { recursive: true });
  } catch {}
}

function getTenantDir(tenantId: string): string {
  const sanitized = (tenantId || "default_org").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const dir = path.join(MANAGED_DATA_DIR, sanitized);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Atomic crash-resilient write
export function atomicWriteSnapshot(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tmpPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tmpPath, filePath);
  } catch (err: any) {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
    throw new Error(`[TRANSACTIONAL STORAGE FAILURE] ${err.message}`);
  }
}

// Helper to determine if Firestore Admin is live
function getFirestoreAdmin() {
  if (getApps().length > 0) {
    try {
      return getFirestore();
    } catch {
      return null;
    }
  }
  return null;
}

export async function organizationExists(orgId: string): Promise<boolean> {
  const sanitized = (orgId || "").toLowerCase().trim().replace(/[^a-z0-9_-]/g, "_");
  if (!sanitized) return false;

  for (const u of userStoreByEmail.values()) {
    if (u.organizationId === sanitized) return true;
  }

  const tenantDir = path.join(MANAGED_DATA_DIR, sanitized);
  if (fs.existsSync(tenantDir)) {
    const usersFile = path.join(tenantDir, "users.json");
    if (fs.existsSync(usersFile)) {
      try {
        const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
        if (Array.isArray(users) && users.length > 0) return true;
      } catch {}
    }
  }

  const fsAdmin = getFirestoreAdmin();
  if (fsAdmin) {
    try {
      const orgDoc = await fsAdmin.collection("organizations").doc(sanitized).get();
      if (orgDoc.exists) return true;
    } catch {}
  }

  return false;
}

export function rollbackUserRecord(user: StoredUser): void {
  userStoreByEmail.delete(user.email.toLowerCase());
  userStoreById.delete(user.id);
}

// -------------------------------------------------------------------
// 1. Authoritative User Account Store
// -------------------------------------------------------------------
export async function persistUserRecord(user: StoredUser): Promise<void> {
  return await withTenantLock(user.organizationId, async () => {
    if (process.env.SIMULATE_DB_WRITE_FAILURE === "true") {
      throw new Error("Simulated database write failure: connection timeout");
    }

    // 1. Save to managed database if Firestore Admin is configured
    const fsAdmin = getFirestoreAdmin();
    if (fsAdmin) {
      try {
        await fsAdmin
          .collection("organizations")
          .doc(user.organizationId)
          .collection("users")
          .doc(user.id)
          .set({
            ...user,
            updatedAt: new Date().toISOString()
          });

        await fsAdmin
          .collection("organizations")
          .doc(user.organizationId)
          .collection("members")
          .doc(user.id)
          .set({
            uid: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            joinedAt: new Date().toISOString()
          });
      } catch (err: any) {
        console.warn(`[MANAGED STORE] Cloud Firestore write skipped (${err.message}). Using local partition.`);
      }
    }

    // 2. Persist to tenant-scoped partitioned atomic store
    const tenantDir = getTenantDir(user.organizationId);
    const usersFile = path.join(tenantDir, "users.json");
    const tenantUsers: StoredUser[] = [];
    for (const u of userStoreByEmail.values()) {
      if (u.organizationId === user.organizationId && u.id !== user.id) {
        tenantUsers.push(u);
      }
    }
    tenantUsers.push({ ...user });
    atomicWriteSnapshot(usersFile, tenantUsers);

    // Only update cache after durable write succeeds
    userStoreByEmail.set(user.email.toLowerCase(), { ...user });
    userStoreById.set(user.id, { ...user });
  });
}

export async function findStoredUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const cached = userStoreByEmail.get(normalized);
  if (cached) return { ...cached };

  // Try loading from managed Firestore if available
  const fsAdmin = getFirestoreAdmin();
  if (fsAdmin) {
    try {
      const snap = await fsAdmin.collectionGroup("users").where("email", "==", normalized).limit(1).get();
      if (!snap.empty) {
        const docUser = snap.docs[0].data() as StoredUser;
        userStoreByEmail.set(normalized, docUser);
        userStoreById.set(docUser.id, docUser);
        return { ...docUser };
      }
    } catch {}
  }

  return null;
}

export async function findStoredUserById(id: string): Promise<StoredUser | null> {
  const cached = userStoreById.get(id);
  if (cached) return { ...cached };

  const fsAdmin = getFirestoreAdmin();
  if (fsAdmin) {
    try {
      const snap = await fsAdmin.collectionGroup("users").where("id", "==", id).limit(1).get();
      if (!snap.empty) {
        const docUser = snap.docs[0].data() as StoredUser;
        userStoreByEmail.set(docUser.email.toLowerCase(), docUser);
        userStoreById.set(docUser.id, docUser);
        return { ...docUser };
      }
    } catch {}
  }

  return null;
}

// -------------------------------------------------------------------
// 2. Authoritative Consequential Approval Gates Store
// -------------------------------------------------------------------
export async function persistApprovalGateRecord(gate: ApprovalGate): Promise<void> {
  return await withTenantLock(gate.tenantId, async () => {
    let tenantMap = approvalGatesByTenant.get(gate.tenantId);
    if (!tenantMap) {
      tenantMap = new Map();
      approvalGatesByTenant.set(gate.tenantId, tenantMap);
    }
    tenantMap.set(gate.id, { ...gate });

    // Save to managed Firestore if available
    const fsAdmin = getFirestoreAdmin();
    if (fsAdmin) {
      try {
        await fsAdmin
          .collection("organizations")
          .doc(gate.tenantId)
          .collection("approval_gates")
          .doc(gate.id)
          .set({ ...gate, lastUpdated: new Date().toISOString() });
      } catch (err: any) {
        console.warn(`[MANAGED STORE] Cloud Firestore write skipped (${err.message}). Using local partition.`);
      }
    }

    // Persist to tenant-scoped partitioned atomic store
    const tenantDir = getTenantDir(gate.tenantId);
    const gatesFile = path.join(tenantDir, "approval_gates.json");
    atomicWriteSnapshot(gatesFile, Array.from(tenantMap.values()));
  });
}

export async function getApprovalGateById(gateId: string, tenantId: string): Promise<ApprovalGate | null> {
  const tenantMap = approvalGatesByTenant.get(tenantId);
  if (tenantMap && tenantMap.has(gateId)) {
    return { ...tenantMap.get(gateId)! };
  }

  const fsAdmin = getFirestoreAdmin();
  if (fsAdmin) {
    try {
      const doc = await fsAdmin
        .collection("organizations")
        .doc(tenantId)
        .collection("approval_gates")
        .doc(gateId)
        .get();
      if (doc.exists) {
        return doc.data() as ApprovalGate;
      }
    } catch {}
  }

  return null;
}

export async function listApprovalGatesForTenant(tenantId: string): Promise<ApprovalGate[]> {
  const tenantMap = approvalGatesByTenant.get(tenantId);
  if (tenantMap) {
    return Array.from(tenantMap.values());
  }
  return [];
}

// -------------------------------------------------------------------
// 3. Authoritative Cryptographic Audit Ledger Store
// -------------------------------------------------------------------
export async function appendAuthoritativeAuditBlock(params: {
  actor: string;
  role: string;
  tenantId: string;
  department: string;
  action: string;
  details: string;
  payload?: any;
}): Promise<AuditBlock> {
  return await withTenantLock(params.tenantId, async () => {
    let chain = auditBlocksByTenant.get(params.tenantId);
    if (!chain || chain.length === 0) {
      // Initialize genesis block for tenant
      const genesisHash = crypto.createHash("sha256").update(`GENESIS_${params.tenantId}`).digest("hex");
      chain = [
        {
          blockIndex: 0,
          timestamp: new Date().toISOString(),
          actor: "SBB Security Genesis Engine",
          role: "System",
          tenantId: params.tenantId,
          department: "Executive",
          action: "GENESIS_BLOCK_INITIALIZED",
          details: `Genesis audit block established for tenant [${params.tenantId}]`,
          payloadHash: crypto.createHash("sha256").update("GENESIS").digest("hex"),
          prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
          hash: genesisHash
        }
      ];
      auditBlocksByTenant.set(params.tenantId, chain);
    }

    const prevBlock = chain[chain.length - 1];
    const payloadStr = JSON.stringify(params.payload || {});
    const payloadHash = crypto.createHash("sha256").update(payloadStr).digest("hex");
    const timestamp = new Date().toISOString();
    const rawData = `${prevBlock.hash}|${timestamp}|${params.actor}|${params.role}|${params.tenantId}|${params.department}|${params.action}|${params.details}|${payloadHash}`;
    const hash = crypto.createHash("sha256").update(rawData).digest("hex");

    const newBlock: AuditBlock = {
      blockIndex: chain.length,
      timestamp,
      actor: params.actor,
      role: params.role,
      tenantId: params.tenantId,
      department: params.department,
      action: params.action,
      details: params.details,
      payloadHash,
      prevHash: prevBlock.hash,
      hash
    };

    chain.push(newBlock);

    // Save to Firestore if available
    const fsAdmin = getFirestoreAdmin();
    if (fsAdmin) {
      try {
        await fsAdmin
          .collection("organizations")
          .doc(params.tenantId)
          .collection("audit_logs")
          .doc(`block_${newBlock.blockIndex}`)
          .set({ ...newBlock });
      } catch (err: any) {
        console.warn(`[MANAGED STORE] Cloud Firestore write skipped (${err.message}). Using local partition.`);
      }
    }

    // Persist to tenant-scoped partitioned atomic store
    const tenantDir = getTenantDir(params.tenantId);
    const auditFile = path.join(tenantDir, "audit_chain.json");
    atomicWriteSnapshot(auditFile, chain);

    return newBlock;
  });
}

export function listAuditBlocksForTenant(tenantId: string): AuditBlock[] {
  return auditBlocksByTenant.get(tenantId) || [];
}

export function verifyTenantAuditChainIntegrity(tenantId: string): boolean {
  const chain = auditBlocksByTenant.get(tenantId) || [];
  if (chain.length <= 1) return true;
  for (let i = 1; i < chain.length; i++) {
    if (chain[i].prevHash !== chain[i - 1].hash) {
      return false;
    }
  }
  return true;
}

// -------------------------------------------------------------------
// 4. Tenant Backup, Concurrency & Disaster Recovery
// -------------------------------------------------------------------
export async function createTenantBackup(tenantId: string): Promise<TenantBackup> {
  return await withTenantLock(tenantId, async () => {
    const users: StoredUser[] = [];
    for (const u of userStoreByEmail.values()) {
      if (u.organizationId === tenantId) users.push({ ...u });
    }

    const tenantGates = approvalGatesByTenant.get(tenantId);
    const approvalGates: ApprovalGate[] = tenantGates ? Array.from(tenantGates.values()) : [];
    const auditBlocks: AuditBlock[] = (auditBlocksByTenant.get(tenantId) || []).map(b => ({ ...b }));

    const rawData = JSON.stringify({ tenantId, users, approvalGates, auditBlocks });
    const checksum = crypto.createHash("sha256").update(rawData).digest("hex");
    const timestamp = new Date().toISOString();

    const backup: TenantBackup = {
      tenantId,
      timestamp,
      checksum,
      users,
      approvalGates,
      auditBlocks
    };

    const tenantDir = getTenantDir(tenantId);
    const backupFile = path.join(tenantDir, `backup_${Date.now()}.json`);
    atomicWriteSnapshot(backupFile, backup);

    return backup;
  });
}

export async function restoreTenantBackup(backup: TenantBackup): Promise<{ success: boolean; error?: string }> {
  if (!backup || !backup.tenantId) {
    return { success: false, error: "Invalid backup format: missing tenantId" };
  }

  return await withTenantLock(backup.tenantId, async () => {
    // Checksum verification for recovery integrity
    const rawData = JSON.stringify({
      tenantId: backup.tenantId,
      users: backup.users,
      approvalGates: backup.approvalGates,
      auditBlocks: backup.auditBlocks
    });
    const expectedChecksum = crypto.createHash("sha256").update(rawData).digest("hex");
    if (expectedChecksum !== backup.checksum) {
      return { success: false, error: "Backup integrity checksum mismatch. Recovery aborted." };
    }

    // Restore users
    for (const u of backup.users) {
      userStoreByEmail.set(u.email.toLowerCase(), { ...u });
      userStoreById.set(u.id, { ...u });
    }

    // Restore approval gates
    const gatesMap = new Map<string, ApprovalGate>();
    for (const g of backup.approvalGates) {
      gatesMap.set(g.id, { ...g });
    }
    approvalGatesByTenant.set(backup.tenantId, gatesMap);

    // Restore audit blocks
    auditBlocksByTenant.set(backup.tenantId, [...backup.auditBlocks]);

    // Persist restored state
    const tenantDir = getTenantDir(backup.tenantId);
    atomicWriteSnapshot(path.join(tenantDir, "users.json"), backup.users);
    atomicWriteSnapshot(path.join(tenantDir, "approval_gates.json"), backup.approvalGates);
    atomicWriteSnapshot(path.join(tenantDir, "audit_chain.json"), backup.auditBlocks);

    return { success: true };
  });
}
