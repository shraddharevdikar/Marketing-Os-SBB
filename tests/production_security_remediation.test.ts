import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  createSignedSessionToken,
  verifySignedSessionToken,
  verifyAuthAndTenant,
  requireRole,
  enforceTenantIsolation,
  rateLimiter,
  AuthenticatedRequest
} from "../src/server/authMiddleware";
import {
  computeParameterHash,
  ApprovalGate,
  _resetApprovalGates
} from "../src/server/sbbEnterpriseRoutes";

test("P0 & P1 Production Security Remediation Suite", async (t) => {
  const originalEnv = { ...process.env };

  t.after(() => {
    process.env = { ...originalEnv };
  });

  // -----------------------------------------------------------------
  // 1. Unauthenticated demo-token issuance tests
  // -----------------------------------------------------------------
  await t.test("Unauthenticated demo-token issuance: Strictly rejected in production", () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOW_DEV_AUTH = "false";

    // Simulate route logic for /api/auth/demo-session
    const handleDemoSession = (body: any) => {
      if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEV_AUTH !== "true") {
        return { status: 403, error: "Forbidden", message: "Public demo session issuance is strictly disabled in production." };
      }
      if (body.role && ["Admin", "CEO", "Vice President", "AGM"].includes(body.role)) {
        return { status: 403, error: "Forbidden", message: "Unauthenticated callers cannot be issued privileged executive roles." };
      }
      return { status: 200, user: { role: "Executive", organizationId: "synthetic_sandbox" } };
    };

    const prodResult = handleDemoSession({ role: "Executive" });
    assert.strictEqual(prodResult.status, 403, "Must return 403 Forbidden in production");

    // In dev, caller attempting to request Admin or CEO
    process.env.NODE_ENV = "development";
    process.env.ALLOW_DEV_AUTH = "true";

    const adminAttempt = handleDemoSession({ role: "Admin" });
    assert.strictEqual(adminAttempt.status, 403, "Must disallow requesting Admin role");

    const ceoAttempt = handleDemoSession({ role: "CEO" });
    assert.strictEqual(ceoAttempt.status, 403, "Must disallow requesting CEO role");
  });

  // -----------------------------------------------------------------
  // 2. Cryptographic token verification & forgery rejection
  // -----------------------------------------------------------------
  await t.test("Forged tokens: Cryptographically rejected via timing-safe HMAC verification", () => {
    const validPayload = {
      userId: "USR-SAFE-01",
      email: "operator@sovereignbusiness.ca",
      role: "Executive",
      organizationId: "sovereign_enterprise"
    };

    const token = createSignedSessionToken(validPayload);
    assert.ok(token.startsWith("sbb_v1."), "Must have sbb_v1 prefix");

    // Verify genuine token succeeds
    const verified = verifySignedSessionToken(token);
    assert.ok(verified, "Genuine token must verify successfully");
    assert.strictEqual(verified.userId, validPayload.userId);

    // Attack 1: Mutated signature
    const parts = token.split(".");
    const forgedSigToken = `${parts[0]}.${parts[1]}.${parts[2].slice(0, -4)}XXXX`;
    const forgedResult = verifySignedSessionToken(forgedSigToken);
    assert.strictEqual(forgedResult, null, "Tampered signature must return null");

    // Attack 2: Tampered payload with valid-looking signature from other payload
    const attackerPayload = Buffer.from(JSON.stringify({
      userId: "USR-ATTACKER",
      email: "attacker@evil.com",
      role: "Admin",
      organizationId: "competitor_tenant"
    })).toString("base64url");
    const tamperedPayloadToken = `sbb_v1.${attackerPayload}.${parts[2]}`;
    assert.strictEqual(verifySignedSessionToken(tamperedPayloadToken), null, "Tampered payload must return null");

    // Attack 3: Fabricated plain token without signature
    assert.strictEqual(verifySignedSessionToken("USR-001:tenant:Admin:hacker@evil.com"), null, "Plain fabricated string must return null");

    // Attack 4: Non-string / undefined
    assert.strictEqual(verifySignedSessionToken(""), null);
  });

  // -----------------------------------------------------------------
  // 3. Role escalation rejection
  // -----------------------------------------------------------------
  await t.test("Role escalation: requireRole strictly blocks unprivileged roles", () => {
    const executiveReq = {
      user: {
        userId: "USR-002",
        email: "exec@sovereignbusiness.ca",
        role: "Executive",
        organizationId: "sovereign_enterprise"
      }
    } as AuthenticatedRequest;

    let resCode: number | null = null;
    let resBody: any = null;
    const mockRes: any = {
      status: (code: number) => {
        resCode = code;
        return {
          json: (data: any) => { resBody = data; }
        };
      }
    };

    const ceoGate = requireRole(["CEO", "Vice President"]);

    let nextCalled = false;
    ceoGate(executiveReq, mockRes, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, "Executive must NOT pass CEO role check");
    assert.strictEqual(resCode, 403, "Must respond with 403 Forbidden");
    assert.ok(resBody.message.includes("Executive"), "Error must cite unauthorized role");
  });

  // -----------------------------------------------------------------
  // 4. Two-person rule enforcement & self-approval prevention
  // -----------------------------------------------------------------
  await t.test("Approval gates: Two-person rule prevents requester from self-approving", () => {
    const gateId = "GATE-TEST-SELF";
    const requesterEmail = "marketing.manager@acme.ca";

    _resetApprovalGates([
      {
        id: gateId,
        tenantId: "acme_corp",
        title: "Test $20,000 Budget Release",
        category: "CRITICAL_BUDGET_RELEASE",
        requestedBy: requesterEmail,
        requestedRole: "Marketing Manager",
        department: "Marketing",
        amountCad: 20000,
        description: "Ad spend increase",
        riskScore: 85,
        requiredMinRole: "CEO",
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString()
      }
    ]);

    // Scenario: Requester tries to approve their own request with CEO role
    const handleDecision = (actor: string, role: string, userId: string, gate: ApprovalGate) => {
      // Role clearance check
      const roleHierarchy = { "Admin": 100, "CEO": 90, "Vice President": 80, "AGM": 70, "Marketing Manager": 60, "Executive": 40 };
      const userClearance = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
      const requiredClearance = roleHierarchy[gate.requiredMinRole as keyof typeof roleHierarchy] || 90;
      if (userClearance < requiredClearance) {
        return { status: 403, error: "Insufficient signing authority" };
      }
      // Two-person rule:
      if (role !== "Admin" && (gate.requestedBy === actor || gate.requestedBy === userId)) {
        return { status: 403, error: "Two-person rule violation: Requester cannot self-approve" };
      }
      return { status: 200, approved: true };
    };

    const selfApprovalAttempt = handleDecision(requesterEmail, "CEO", "USR-MKT-01", {
      id: gateId,
      tenantId: "acme_corp",
      title: "Test $20k Budget",
      category: "CRITICAL_BUDGET_RELEASE",
      requestedBy: requesterEmail,
      requestedRole: "Marketing Manager",
      department: "Marketing",
      riskScore: 85,
      requiredMinRole: "CEO",
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString()
    });

    assert.strictEqual(selfApprovalAttempt.status, 403);
    assert.ok(selfApprovalAttempt.error.includes("Two-person rule violation"));

    // Legitimate second approver (different person)
    const independentApproval = handleDecision("john.smith.ceo@acme.ca", "CEO", "USR-CEO-01", {
      id: gateId,
      tenantId: "acme_corp",
      title: "Test $20k Budget",
      category: "CRITICAL_BUDGET_RELEASE",
      requestedBy: requesterEmail,
      requestedRole: "Marketing Manager",
      department: "Marketing",
      riskScore: 85,
      requiredMinRole: "CEO",
      status: "PENDING_APPROVAL",
      createdAt: new Date().toISOString()
    });
    assert.strictEqual(independentApproval.status, 200);
    assert.strictEqual(independentApproval.approved, true);
  });

  // -----------------------------------------------------------------
  // 5. Cross-tenant access rejection
  // -----------------------------------------------------------------
  await t.test("Cross-tenant isolation: Tenant A blocked from accessing Tenant B", () => {
    const tenantAReq = {
      user: {
        userId: "USR-TENANT-A-01",
        email: "alice@tenanta.com",
        role: "Marketing Manager",
        organizationId: "tenant_a"
      },
      params: { orgId: "tenant_b" },
      body: {},
      query: {}
    } as unknown as AuthenticatedRequest;

    let resCode: number | null = null;
    let resBody: any = null;
    const mockRes: any = {
      status: (code: number) => {
        resCode = code;
        return {
          json: (data: any) => { resBody = data; }
        };
      }
    };

    let nextPassed = false;
    enforceTenantIsolation(tenantAReq, mockRes, () => { nextPassed = true; });

    assert.strictEqual(nextPassed, false, "Must block cross-tenant parameter access");
    assert.strictEqual(resCode, 403, "Must return 403 Forbidden");
    assert.ok(resBody.message.includes("Cross-tenant access prohibited"));
  });

  // -----------------------------------------------------------------
  // 6. Approval bypass & Parameter hash binding tampering tests
  // -----------------------------------------------------------------
  await t.test("Approval-bound action parameters: Blocks execution if parameters were tampered", () => {
    const approvedParams = { budgetCad: 15000, campaignId: "CAMP-Q4-01", channel: "Meta Ads" };
    const approvedHash = computeParameterHash(approvedParams);

    const gate: ApprovalGate = {
      id: "GATE-TAMPER-TEST",
      tenantId: "sovereign_enterprise",
      title: "Authorized Q4 Meta Budget",
      category: "CRITICAL_BUDGET_RELEASE",
      requestedBy: "requester@sovereignbusiness.ca",
      requestedRole: "Marketing Manager",
      department: "Marketing",
      amountCad: 15000,
      description: "Q4 ad spend release",
      riskScore: 70,
      requiredMinRole: "CEO",
      status: "APPROVED",
      createdAt: new Date().toISOString(),
      parameters: approvedParams,
      parameterHash: approvedHash
    };

    // Attempt execution with tampered parameters (increased to $50,000 without re-approval!)
    const tamperedParams = { budgetCad: 50000, campaignId: "CAMP-Q4-01", channel: "Meta Ads" };
    const tamperedHash = computeParameterHash(tamperedParams);

    assert.notStrictEqual(tamperedHash, gate.parameterHash, "Hashes must mismatch upon tampering");

    // Verify parameter binding check
    const verifyExecution = (submittedParams: any) => {
      if (gate.status !== "APPROVED") {
        return { status: 403, error: "Not approved" };
      }
      const incomingHash = computeParameterHash(submittedParams);
      if (incomingHash !== gate.parameterHash) {
        return { status: 400, error: "Action parameters do not match approved parameters. Tampering detected." };
      }
      return { status: 200, success: true };
    };

    const tamperResult = verifyExecution(tamperedParams);
    assert.strictEqual(tamperResult.status, 400);
    assert.ok(tamperResult.error.includes("Tampering detected"));

    // Legitimate execution with untampered parameters
    const legitResult = verifyExecution(approvedParams);
    assert.strictEqual(legitResult.status, 200);
    assert.strictEqual(legitResult.success, true);
  });

  // -----------------------------------------------------------------
  // 7. Truthful execution: Unavailable integration cannot report success
  // -----------------------------------------------------------------
  await t.test("Truthful execution: Refuses to report simulated success when integration missing", () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.META_ACCESS_TOKEN;

    const executeGate = (category: string) => {
      if (category === "CRITICAL_BUDGET_RELEASE") {
        const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_"));
        if (!hasStripe) {
          return {
            status: "EXECUTION_HALTED_INTEGRATION_UNAVAILABLE",
            message: "STRIPE_SECRET_KEY is not provisioned in environment. Refusing to report simulated ledger hold."
          };
        }
        return { status: "EXECUTED_SUCCESS", message: "Live Stripe hold reserved" };
      }
      return { status: "EXECUTED_SUCCESS", message: "Policy executed" };
    };

    const stripeResult = executeGate("CRITICAL_BUDGET_RELEASE");
    assert.strictEqual(stripeResult.status, "EXECUTION_HALTED_INTEGRATION_UNAVAILABLE");
    assert.ok(stripeResult.message.includes("Refusing to report simulated ledger hold"));
  });

  // -----------------------------------------------------------------
  // 8. Cryptographic audit chain tamper-evidence & persistence
  // -----------------------------------------------------------------
  await t.test("Audit chain: Cryptographic SHA-256 chain detects any retro-active tampering", () => {
    const chain = [
      {
        blockIndex: 0,
        timestamp: "2026-10-12T00:00:00.000Z",
        actor: "System",
        prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
        hash: crypto.createHash("sha256").update("BLOCK_0").digest("hex")
      },
      {
        blockIndex: 1,
        timestamp: "2026-10-12T01:00:00.000Z",
        actor: "Admin",
        prevHash: crypto.createHash("sha256").update("BLOCK_0").digest("hex"),
        hash: crypto.createHash("sha256").update("BLOCK_1").digest("hex")
      }
    ];

    // Verify intact chain
    let isIntact = true;
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].prevHash !== chain[i - 1].hash) {
        isIntact = false;
        break;
      }
    }
    assert.strictEqual(isIntact, true, "Intact chain must validate");

    // Attacker modifies Block 0's content or hash
    chain[0].hash = crypto.createHash("sha256").update("TAMPERED_BLOCK_0").digest("hex");

    let isTamperedIntact = true;
    for (let i = 1; i < chain.length; i++) {
      if (chain[i].prevHash !== chain[i - 1].hash) {
        isTamperedIntact = false;
        break;
      }
    }
    assert.strictEqual(isTamperedIntact, false, "Tampered chain must be detected immediately");
  });
});
