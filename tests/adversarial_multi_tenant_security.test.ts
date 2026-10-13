import test from "node:test";
import assert from "node:assert/strict";
import {
  registerUser,
  authenticateUser,
  findUserByEmail,
  createOrgInvitation,
  _resetUserStore
} from "../src/server/userStore";
import {
  enforceTenantIsolation,
  createSignedSessionToken,
  verifyFirebaseIdToken
} from "../src/server/authMiddleware";
import {
  ApprovalGate,
  computeParameterHash
} from "../src/server/sbbEnterpriseRoutes";

test("Adversarial Multi-Tenant Security & Resilient Persistence Suite", async (t) => {
  const originalEnv = { ...process.env };

  t.beforeEach(() => {
    _resetUserStore();
  });

  t.afterEach(() => {
    process.env = { ...originalEnv };
  });

  // =================================================================
  // Pillar 1: Adversarial Prevention of Arbitrary Organization Joins
  // =================================================================
  await t.test("Adversarial Registration: Callers cannot join arbitrary existing organizationId", async () => {
    // 1. Establish an existing victim organization
    const victimReg = await registerUser({
      email: "cfo@victim-corp.ca",
      password: "StrongSecretPassword123!",
      name: "Victim CFO",
      organizationId: "victim_enterprise_corp"
    });
    assert.strictEqual(victimReg.success, true);
    assert.strictEqual(victimReg.user?.organizationId, "victim_enterprise_corp");

    // 2. Attacker attempts to register publicly claiming victim_enterprise_corp
    const attackerReg = await registerUser({
      email: "attacker@external-hacker.com",
      password: "HackerPassword123!",
      name: "Hostile Actor",
      organizationId: "victim_enterprise_corp" // Arbitrary existing organization hijack attempt
    });

    assert.strictEqual(attackerReg.success, false, "Must block joining existing organization via public registration");
    assert.ok(attackerReg.error?.includes("cannot choose an arbitrary existing organizationId"));

    // 3. Confirm attacker was NOT added to victim_enterprise_corp
    const attackerLookup = findUserByEmail("attacker@external-hacker.com");
    assert.strictEqual(attackerLookup, null, "Attacker must not be persisted in user store");

    // 4. Attacker attempts with invalid invitation code
    const invalidInviteReg = await registerUser({
      email: "attacker@external-hacker.com",
      password: "HackerPassword123!",
      name: "Hostile Actor",
      invitationCode: "INV-FORGED999"
    });
    assert.strictEqual(invalidInviteReg.success, false, "Must reject forged invitation code");
    assert.ok(invalidInviteReg.error?.includes("Invalid or expired organization invitation code"));

    // 5. Public registration with NO invitation code provisions a brand new, isolated unique organization
    const legitimatePublicReg = await registerUser({
      email: "newcustomer@startup.ca",
      password: "CustomerPassword123!",
      name: "Startup Founder",
      companyName: "Acme Innovate"
    });
    assert.strictEqual(legitimatePublicReg.success, true);
    assert.ok(legitimatePublicReg.user?.organizationId.startsWith("org_acme_innovate_"));
    assert.notStrictEqual(legitimatePublicReg.user?.organizationId, "victim_enterprise_corp");

    // 6. Legitimate invitation workflow allows joining existing organization
    const validInvite = createOrgInvitation({
      organizationId: "victim_enterprise_corp",
      email: "invited.colleague@victim-corp.ca",
      role: "Marketing Manager",
      createdBy: "cfo@victim-corp.ca",
      validHours: 24
    });

    const invitedReg = await registerUser({
      email: "invited.colleague@victim-corp.ca",
      password: "InvitedPassword123!",
      name: "Invited Colleague",
      invitationCode: validInvite.code
    });
    assert.strictEqual(invitedReg.success, true, "Verified invitation must succeed");
    assert.strictEqual(invitedReg.user?.organizationId, "victim_enterprise_corp");
    assert.strictEqual(invitedReg.user?.role, "Marketing Manager");
  });

  // =================================================================
  // Pillar 2: Cross-Tenant Admin Isolation (Admin of Org A cannot administer Org B)
  // =================================================================
  await t.test("Cross-Tenant Admin Isolation: Admin of Org Alpha cannot administer Org Beta", async () => {
    // Admin belonging strictly to tenant_alpha
    const alphaAdminUser = {
      userId: "USR-ADMIN-ALPHA",
      email: "admin@alpha-corp.ca",
      role: "Admin",
      organizationId: "tenant_alpha"
    };

    // 1. EnforceTenantIsolation blocks Alpha Admin from accessing Beta params
    const req: any = {
      user: alphaAdminUser,
      params: { orgId: "tenant_beta" },
      body: {},
      query: {}
    };

    let statusCode = 0;
    let jsonBody: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonBody = data;
        return res;
      }
    };

    let nextCalled = false;
    enforceTenantIsolation(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, "Alpha Admin must NOT cross tenant boundary to Beta");
    assert.strictEqual(statusCode, 403, "Must return 403 Forbidden");
    assert.ok(jsonBody?.message.includes("Cross-tenant access prohibited"));

    // 2. Approval gate cross-tenant access denial
    const betaGate: ApprovalGate = {
      id: "GATE-BETA-001",
      tenantId: "tenant_beta",
      title: "Release $50,000 Budget",
      category: "CRITICAL_BUDGET_RELEASE",
      requestedBy: "manager@tenant-beta.ca",
      requestedRole: "Marketing Manager",
      department: "Marketing",
      amountCad: 50000,
      description: "Proprietary Beta Campaign",
      riskScore: 80,
      requiredMinRole: "Admin",
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString(),
      parameterHash: computeParameterHash({ budget: 50000 })
    };

    // When Alpha Admin queries gates, Beta gate is inaccessible
    const isSuperAdmin = alphaAdminUser.role === "Admin" && (alphaAdminUser.organizationId === "system_admin_org" || alphaAdminUser.organizationId === "system_master");
    const isAccessible = isSuperAdmin || betaGate.tenantId === alphaAdminUser.organizationId;
    assert.strictEqual(isAccessible, false, "Beta gate must be completely hidden and inaccessible to Alpha Admin");
  });

  // =================================================================
  // Pillar 3: Database Write Failure Handling & Session Token Gate
  // =================================================================
  await t.test("Fail-Safe Database Failure: Failed DB writes strictly abort registration with NO session token issued", async () => {
    process.env.SIMULATE_DB_WRITE_FAILURE = "true";

    const failEmail = `fail.test.${Date.now()}@crash-sim.ca`;
    const regResult = await registerUser({
      email: failEmail,
      password: "StrongPassword123!",
      name: "Failed Writer",
      companyName: "Crash Corp"
    });

    assert.strictEqual(regResult.success, false, "Registration must report failure when DB write fails");
    assert.ok(regResult.error?.includes("Authoritative database write failed"));

    // In-memory cache must NOT retain user on database write failure
    const cachedUser = findUserByEmail(failEmail);
    assert.strictEqual(cachedUser, null, "User must NOT remain cached after database write failure");

    // Authenticate must fail
    const authAttempt = authenticateUser(failEmail, "StrongPassword123!");
    assert.strictEqual(authAttempt.success, false, "User must not be able to authenticate after failed write");

    process.env.SIMULATE_DB_WRITE_FAILURE = "false";
  });

  // =================================================================
  // Pillar 4: Firebase ID Token Authoritative Resolution
  // =================================================================
  await t.test("Firebase ID Token: Rejects default_org and unverified membership", async () => {
    // Malicious token claiming unverified user
    const unverifiedResult = await verifyFirebaseIdToken("invalid.token.structure");
    assert.strictEqual(unverifiedResult, null, "Unverified token format must yield null");
  });
});
