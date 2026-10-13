import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

test("Live Firebase Emulator Suite: Direct evaluation of deployed firestore.rules", async (t) => {
  let testEnv: RulesTestEnvironment | null = null;

  try {
    const rulesContent = fs.readFileSync("firestore.rules", "utf-8");
    const hostEnv = process.env.FIRESTORE_EMULATOR_HOST;
    const [envHost, envPort] = hostEnv ? hostEnv.split(":") : ["127.0.0.1", "8085"];
    testEnv = await initializeTestEnvironment({
      projectId: "gen-lang-client-0577810698",
      firestore: {
        rules: rulesContent,
        host: envHost || "127.0.0.1",
        port: Number(envPort) || 8085
      }
    });
  } catch (err: any) {
    console.error("Failed to connect to Firebase Emulator Suite:", err.message);
    throw err;
  }

  t.after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  t.beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  // -------------------------------------------------------------
  // Test 1: Unauthenticated callers denied everywhere
  // -------------------------------------------------------------
  await t.test("Unauthenticated callers: Denied access to tenant collections", async () => {
    const unauthDb = testEnv!.unauthenticatedContext().firestore();
    const docRef = doc(unauthDb, "organizations/tenant_alpha/campaigns/camp_01");

    await assertFails(getDoc(docRef));
    await assertFails(setDoc(docRef, { title: "Hack Campaign", organizationId: "tenant_alpha" }));
  });

  // -------------------------------------------------------------
  // Test 2: Cross-tenant isolation (Tenant Alpha cannot read/write Tenant Beta)
  // -------------------------------------------------------------
  await t.test("Cross-tenant isolation: Tenant Alpha member cannot read or write Tenant Beta data", async () => {
    // Setup Tenant Beta document via admin context
    await testEnv!.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, "organizations/tenant_beta/campaigns/secret_camp"), {
        title: "Confidential Competitor Campaign",
        organizationId: "tenant_beta",
        status: "DRAFT"
      });
    });

    // Authenticated user belonging only to tenant_alpha
    const alphaUserDb = testEnv!.authenticatedContext("usr_alpha", {
      organizationId: "tenant_alpha",
      role: "Executive"
    }).firestore();

    const competitorDoc = doc(alphaUserDb, "organizations/tenant_beta/campaigns/secret_camp");
    await assertFails(getDoc(competitorDoc));
    await assertFails(setDoc(competitorDoc, { title: "Tampered by Alpha", organizationId: "tenant_beta" }));
  });

  // -------------------------------------------------------------
  // Test 2b: Cross-tenant Admin isolation (No global Admin shortcut)
  // -------------------------------------------------------------
  await t.test("Cross-tenant Admin isolation: Admin of Tenant Alpha cannot administer or delete Tenant Beta resources", async () => {
    await testEnv!.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, "organizations/tenant_beta/campaigns/proprietary_camp"), {
        title: "Beta Proprietary Campaign",
        organizationId: "tenant_beta",
        status: "DRAFT"
      });
      await setDoc(doc(adminDb, "organizations/tenant_beta/company_profile/profile"), {
        companyName: "Beta Corp",
        organizationId: "tenant_beta"
      });
    });

    const alphaAdminDb = testEnv!.authenticatedContext("admin_alpha", {
      organizationId: "tenant_alpha",
      role: "Admin"
    }).firestore();

    const betaCampDoc = doc(alphaAdminDb, "organizations/tenant_beta/campaigns/proprietary_camp");
    await assertFails(getDoc(betaCampDoc));
    await assertFails(updateDoc(betaCampDoc, { title: "Tampered by Alpha Admin" }));
    await assertFails(deleteDoc(betaCampDoc));

    const betaProfileDoc = doc(alphaAdminDb, "organizations/tenant_beta/company_profile/profile");
    await assertFails(getDoc(betaProfileDoc));
    await assertFails(updateDoc(betaProfileDoc, { companyName: "Tampered Company Name" }));
    await assertFails(deleteDoc(betaProfileDoc));
  });

  // -------------------------------------------------------------
  // Test 3: Approval Gates direct tampering strictly blocked
  // -------------------------------------------------------------
  await t.test("Approval Gates: Direct client updates and deletions are strictly blocked", async () => {
    const orgId = "tenant_alpha";
    const gateId = "GATE-SEC-01";

    // Setup an initial pending gate in the database
    await testEnv!.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, `organizations/${orgId}/approval_gates/${gateId}`), {
        id: gateId,
        organizationId: orgId,
        title: "Release Ad Budget $50,000",
        category: "CRITICAL_BUDGET_RELEASE",
        status: "PENDING_APPROVAL",
        requestedBy: "usr_member"
      });
    });

    const memberDb = testEnv!.authenticatedContext("usr_member", {
      organizationId: orgId,
      role: "Executive"
    }).firestore();

    const gateRef = doc(memberDb, `organizations/${orgId}/approval_gates/${gateId}`);

    // Attack 1: Client tries to directly approve the gate in Firestore
    await assertFails(updateDoc(gateRef, {
      status: "APPROVED",
      decidedBy: "usr_member"
    }));

    // Attack 2: Client tries to delete the gate in Firestore
    await assertFails(deleteDoc(gateRef));

    // Attack 3: Even an Admin client cannot update approval gate directly in Firestore (must use backend endpoint)
    const adminClientDb = testEnv!.authenticatedContext("usr_admin", {
      organizationId: orgId,
      role: "Admin"
    }).firestore();
    const adminGateRef = doc(adminClientDb, `organizations/${orgId}/approval_gates/${gateId}`);
    await assertFails(updateDoc(adminGateRef, { status: "APPROVED" }));
  });

  // -------------------------------------------------------------
  // Test 4: Approval Gates creation boundaries
  // -------------------------------------------------------------
  await t.test("Approval Gates: Creation restricted strictly to PENDING_APPROVAL by caller UID", async () => {
    const orgId = "tenant_alpha";
    const memberDb = testEnv!.authenticatedContext("usr_legit", {
      organizationId: orgId,
      role: "Executive"
    }).firestore();

    // Attack: Client tries to create a gate with pre-approved status
    const maliciousRef = doc(memberDb, `organizations/${orgId}/approval_gates/GATE-ATTACK-01`);
    await assertFails(setDoc(maliciousRef, {
      id: "GATE-ATTACK-01",
      organizationId: orgId,
      title: "Self-Approved Millions",
      category: "CRITICAL_BUDGET_RELEASE",
      status: "APPROVED",
      requestedBy: "usr_legit"
    }));

    // Attack: Client tries to set requestedBy to another user
    await assertFails(setDoc(maliciousRef, {
      id: "GATE-ATTACK-01",
      organizationId: orgId,
      title: "Impersonated Request",
      category: "CRITICAL_BUDGET_RELEASE",
      status: "PENDING_APPROVAL",
      requestedBy: "other_victim_uid"
    }));

    // Legitimate creation: status == PENDING_APPROVAL and requestedBy == auth.uid
    const legitRef = doc(memberDb, `organizations/${orgId}/approval_gates/GATE-LEGIT-01`);
    await assertSucceeds(setDoc(legitRef, {
      id: "GATE-LEGIT-01",
      organizationId: orgId,
      title: "Legitimate Marketing Campaign Request",
      category: "CRITICAL_BUDGET_RELEASE",
      status: "PENDING_APPROVAL",
      requestedBy: "usr_legit"
    }));
  });

  // -------------------------------------------------------------
  // Test 5: Direct Client Audit Log creation is blocked
  // -------------------------------------------------------------
  await t.test("Audit Logs: Client cannot directly forge audit log entries", async () => {
    const orgId = "tenant_alpha";
    const memberDb = testEnv!.authenticatedContext("usr_hacker", {
      organizationId: orgId,
      role: "Executive"
    }).firestore();

    const auditRef = doc(memberDb, `organizations/${orgId}/audit_logs/LOG-FORGED`);
    await assertFails(setDoc(auditRef, {
      actor: "usr_hacker",
      action: "FORGED_COMPLIANCE_PASS",
      details: "Client forged log"
    }));

    const topLevelAuditRef = doc(memberDb, "audit_logs/LOG-FORGED-TOP");
    await assertFails(setDoc(topLevelAuditRef, {
      actor: "usr_hacker",
      action: "FORGED_RECORD"
    }));
  });

  // -------------------------------------------------------------
  // Test 6: Campaign ownership and approval bypass prevention
  // -------------------------------------------------------------
  await t.test("Campaigns: Client cannot mutate organizationId or self-approve in database", async () => {
    const orgId = "tenant_alpha";
    const campId = "CAMP-SEC-01";

    await testEnv!.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();
      await setDoc(doc(adminDb, `organizations/${orgId}/campaigns/${campId}`), {
        title: "Initial Campaign",
        organizationId: orgId,
        approved: false,
        status: "DRAFT"
      });
    });

    const memberDb = testEnv!.authenticatedContext("usr_member", {
      organizationId: orgId,
      role: "Executive"
    }).firestore();

    const campRef = doc(memberDb, `organizations/${orgId}/campaigns/${campId}`);

    // Attack 1: Attempt to mutate organizationId to competitor
    await assertFails(updateDoc(campRef, { organizationId: "tenant_beta" }));

    // Attack 2: Attempt to flip approved flag directly
    await assertFails(updateDoc(campRef, { approved: true }));

    // Legitimate update: updating non-consequential title within own tenant
    await assertSucceeds(updateDoc(campRef, { title: "Updated Campaign Title" }));
  });
});
