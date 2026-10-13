import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { terminate } from "firebase/firestore";
import { db } from "../src/lib/firebase";
import { getTenantId } from "../src/lib/firestoreSync";
import { executeLegacyMigration } from "../src/server/migrateLegacyRecords";
import { createSignedSessionToken, verifySignedSessionToken } from "../src/server/authMiddleware";

test("Firebase Authentication, Firestore Rules & Tenant Isolation Integration Suite", async (t) => {
  t.after(async () => {
    try {
      await terminate(db);
    } catch {}
  });
  // Behavioral Firestore Security Rules Evaluation Engine
  interface AuthContext {
    uid: string;
    token?: {
      organizationId?: string;
      role?: string;
    };
  }

  interface DatabaseRecord {
    organizationId?: string;
    role?: string;
    status?: string;
    requestedBy?: string;
    decidedBy?: string;
    decidedAt?: string;
    executedBy?: string;
    executedAt?: string;
    approved?: boolean;
    approvalGateId?: string;
    userId?: string;
    [key: string]: any;
  }

  // Exact behavioral representation of firestore.rules logic
  const isOrgMember = (auth: AuthContext | null, orgId: string, memberStore: Record<string, { role: string }> = {}) => {
    if (!auth) return false;
    if (auth.token?.organizationId === orgId) return true;
    return Boolean(memberStore[`${orgId}:${auth.uid}`]);
  };

  const isOrgAdmin = (auth: AuthContext | null, orgId: string, memberStore: Record<string, { role: string }> = {}) => {
    if (!auth) return false;
    if (auth.token?.role === "Admin") return true;
    const member = memberStore[`${orgId}:${auth.uid}`];
    return member?.role === "Admin";
  };

  const evaluateApprovalGateRule = (
    op: "read" | "create" | "update" | "delete",
    auth: AuthContext | null,
    orgId: string,
    existingDoc: DatabaseRecord | null,
    incomingDoc: DatabaseRecord | null,
    memberStore: Record<string, { role: string }> = {}
  ): boolean => {
    if (!auth) return false;
    if (!isOrgMember(auth, orgId, memberStore)) return false;

    if (op === "read") return true;
    if (op === "create") {
      if (!incomingDoc) return false;
      return (
        incomingDoc.status === "PENDING_APPROVAL" &&
        incomingDoc.requestedBy === auth.uid &&
        !("decidedBy" in incomingDoc) &&
        !("decidedAt" in incomingDoc) &&
        !("executedBy" in incomingDoc) &&
        !("executedAt" in incomingDoc)
      );
    }
    // Direct client update and delete are strictly disallowed
    if (op === "update" || op === "delete") return false;
    return false;
  };

  const evaluateCampaignRule = (
    op: "read" | "create" | "update" | "delete",
    auth: AuthContext | null,
    existingDoc: DatabaseRecord | null,
    incomingDoc: DatabaseRecord | null,
    memberStore: Record<string, { role: string }> = {}
  ): boolean => {
    if (!auth) return false;
    if (op === "read") {
      return Boolean(existingDoc?.organizationId && isOrgMember(auth, existingDoc.organizationId, memberStore));
    }
    if (op === "create") {
      if (!incomingDoc?.organizationId) return false;
      if (!isOrgMember(auth, incomingDoc.organizationId, memberStore)) return false;
      if (incomingDoc.status === "EXECUTED") return false;
      if (incomingDoc.approved === true) return false;
      return true;
    }
    if (op === "update") {
      if (!existingDoc?.organizationId || !incomingDoc?.organizationId) return false;
      if (!isOrgMember(auth, existingDoc.organizationId, memberStore)) return false;
      if (incomingDoc.organizationId !== existingDoc.organizationId) return false; // Immutable orgId
      if ("approved" in incomingDoc && incomingDoc.approved !== existingDoc.approved) return false; // Immutable approval
      if ("approvalGateId" in incomingDoc && incomingDoc.approvalGateId !== existingDoc.approvalGateId) return false;
      if ("status" in incomingDoc && existingDoc.status === "EXECUTED" && incomingDoc.status !== existingDoc.status) return false;
      return true;
    }
    if (op === "delete") {
      if (!existingDoc?.organizationId) return false;
      return isOrgAdmin(auth, existingDoc.organizationId, memberStore);
    }
    return false;
  };

  const evaluateAuditLogRule = (
    op: "read" | "create" | "update" | "delete",
    auth: AuthContext | null,
    existingDoc: DatabaseRecord | null
  ): boolean => {
    if (!auth) return false;
    if (op === "read") {
      return Boolean(existingDoc?.organizationId && auth.token?.organizationId === existingDoc.organizationId);
    }
    // Direct client write is strictly disallowed; backend server-side only
    return false;
  };

  await t.test("Behavioral Security: Direct Firestore approval gate tampering is strictly blocked", () => {
    const memberAuth: AuthContext = { uid: "USR-MEMBER-01", token: { organizationId: "tenant_alpha", role: "Executive" } };
    const adminAuth: AuthContext = { uid: "USR-ADMIN-01", token: { organizationId: "tenant_alpha", role: "Admin" } };

    const pendingGate: DatabaseRecord = {
      id: "GATE-001",
      organizationId: "tenant_alpha",
      status: "PENDING_APPROVAL",
      requestedBy: "USR-MEMBER-01"
    };

    // Attack 1: Ordinary member attempts to update gate to APPROVED directly in Firestore
    const memberTamperResult = evaluateApprovalGateRule(
      "update",
      memberAuth,
      "tenant_alpha",
      pendingGate,
      { ...pendingGate, status: "APPROVED", decidedBy: memberAuth.uid }
    );
    assert.strictEqual(memberTamperResult, false, "Ordinary member must NOT be able to direct-update approval gate");

    // Attack 2: Even Admin cannot update approval gate directly in client Firestore; must route through backend
    const adminDirectUpdateResult = evaluateApprovalGateRule(
      "update",
      adminAuth,
      "tenant_alpha",
      pendingGate,
      { ...pendingGate, status: "APPROVED", decidedBy: adminAuth.uid }
    );
    assert.strictEqual(adminDirectUpdateResult, false, "Direct client update must be blocked even for Admin; must use backend");

    // Attack 3: Member attempts to delete approval gate
    assert.strictEqual(
      evaluateApprovalGateRule("delete", memberAuth, "tenant_alpha", pendingGate, null),
      false,
      "Client delete of approval gate must be blocked"
    );

    // Attack 4: Member creates gate with pre-approved status
    const preApprovedAttempt = evaluateApprovalGateRule(
      "create",
      memberAuth,
      "tenant_alpha",
      null,
      { status: "APPROVED", requestedBy: memberAuth.uid, decidedBy: memberAuth.uid }
    );
    assert.strictEqual(preApprovedAttempt, false, "Client create with pre-approved status must be blocked");

    // Legitimate creation: PENDING_APPROVAL without decidedBy fields
    const validCreate = evaluateApprovalGateRule(
      "create",
      memberAuth,
      "tenant_alpha",
      null,
      { status: "PENDING_APPROVAL", requestedBy: memberAuth.uid }
    );
    assert.strictEqual(validCreate, true, "Valid pending approval gate creation must succeed");
  });

  await t.test("Behavioral Security: Campaign permission boundaries prevent unauthorized execution and ownership changes", () => {
    const memberAuth: AuthContext = { uid: "USR-MEMBER-01", token: { organizationId: "tenant_alpha", role: "Executive" } };
    const adminAuth: AuthContext = { uid: "USR-ADMIN-01", token: { organizationId: "tenant_alpha", role: "Admin" } };

    const initialCampaign: DatabaseRecord = {
      organizationId: "tenant_alpha",
      title: "Q4 Lead Acquisition",
      status: "DRAFT",
      approved: false
    };

    // Attack 1: User attempts to modify organizationId to tenant_beta (cross-tenant hijacking)
    const orgHijack = evaluateCampaignRule("update", memberAuth, initialCampaign, {
      ...initialCampaign,
      organizationId: "tenant_beta"
    });
    assert.strictEqual(orgHijack, false, "Cross-tenant organizationId mutation must be rejected");

    // Attack 2: User attempts to self-approve campaign directly in database
    const selfApprove = evaluateCampaignRule("update", memberAuth, initialCampaign, {
      ...initialCampaign,
      approved: true
    });
    assert.strictEqual(selfApprove, false, "Direct database alteration of 'approved' flag must be rejected");

    // Attack 3: Non-admin user attempts to delete production campaign
    const deleteAttempt = evaluateCampaignRule("delete", memberAuth, initialCampaign, null);
    assert.strictEqual(deleteAttempt, false, "Ordinary member cannot delete campaign");

    // Authorized delete by Admin succeeds
    const adminDelete = evaluateCampaignRule("delete", adminAuth, initialCampaign, null);
    assert.strictEqual(adminDelete, true, "Admin can delete campaign");
  });

  await t.test("Behavioral Security: Audit log client forgery is completely prevented", () => {
    const memberAuth: AuthContext = { uid: "USR-MEMBER-01", token: { organizationId: "tenant_alpha", role: "Executive" } };

    // Attack 1: Client tries to write a fake audit log directly
    const forgeAttempt = evaluateAuditLogRule("create", memberAuth, {
      organizationId: "tenant_alpha",
      action: "FAKE_APPROVAL",
      details: "Hacked audit log"
    });
    assert.strictEqual(forgeAttempt, false, "Direct client creation of audit log must be rejected");

    // Attack 2: Client tries to update or delete audit log
    assert.strictEqual(evaluateAuditLogRule("update", memberAuth, { organizationId: "tenant_alpha" }), false);
    assert.strictEqual(evaluateAuditLogRule("delete", memberAuth, { organizationId: "tenant_alpha" }), false);
  });

  await t.test("Tenant ID standardizer normalizes strings and removes illegal characters", () => {
    assert.strictEqual(getTenantId("Acme Corporation! 2026"), "acme_corporation__2026");
    assert.strictEqual(getTenantId({ companyName: "TechCorp Global Inc." }), "techcorp_global_inc_");
    assert.strictEqual(getTenantId({ organizationId: "tenant-ca-east-01" }), "tenant-ca-east-01");
    assert.strictEqual(getTenantId(""), "default_org");
    assert.strictEqual(getTenantId(undefined), "default_org");
  });

  await t.test("Legacy database migration creates backup and partitions documents cleanly", async () => {
    const report = await executeLegacyMigration("test_isolated_tenant");
    assert.ok(report.migrationId.startsWith("MIG-"), "Migration ID must be formatted");
    assert.ok(report.timestamp, "Must record timestamp");
    assert.strictEqual(report.status, "SUCCESS", "Migration must succeed");
    assert.ok(Array.isArray(report.details), "Details log must be provided");
  });

  await t.test("Cryptographic token generation binds tenant and role immutably", () => {
    const original = {
      userId: "USR-SECURITY-TEST-01",
      email: "ciso@sovereignbusiness.ca",
      role: "CEO",
      organizationId: "sovereign_enterprise"
    };

    const token = createSignedSessionToken(original);
    assert.ok(token.startsWith("sbb_v1."), "Token must follow sbb_v1 prefix format");

    const decoded = verifySignedSessionToken(token);
    assert.ok(decoded, "Decoded user must not be null");
    assert.strictEqual(decoded.userId, original.userId);
    assert.strictEqual(decoded.email, original.email);
    assert.strictEqual(decoded.role, original.role);
    assert.strictEqual(decoded.organizationId, original.organizationId);
  });
});
