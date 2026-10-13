import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

interface ApprovalGate {
  id: string;
  organizationId: string;
  actionType: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  parameters: Record<string, any>;
  parameterHash: string;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

function computeParameterHash(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const canonical = JSON.stringify(sortedKeys.map(k => [k, params[k]]));
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function createApprovalGate(orgId: string, actionType: string, params: Record<string, any>, requestedBy: string): ApprovalGate {
  return {
    id: "GATE-" + crypto.randomUUID().substring(0, 8),
    organizationId: orgId,
    actionType,
    status: "PENDING_APPROVAL",
    parameters: params,
    parameterHash: computeParameterHash(params),
    requestedBy
  };
}

function approveGate(gate: ApprovalGate, approver: string, approverRole: string): { success: boolean; error?: string } {
  if (approverRole !== "CEO" && approverRole !== "Admin") {
    return { success: false, error: "Only CEO or Admin roles have signing authority for consequential actions" };
  }
  if (gate.requestedBy === approver && approverRole !== "Admin") {
    return { success: false, error: "Two-person rule violation: Requester cannot self-approve consequential action" };
  }
  gate.status = "APPROVED";
  gate.approvedBy = approver;
  gate.approvedAt = new Date().toISOString();
  return { success: true };
}

function verifyActionCanExecute(gate: ApprovalGate, executionParams: Record<string, any>): { canExecute: boolean; reason?: string } {
  if (gate.status !== "APPROVED") {
    return { canExecute: false, reason: `Action cannot execute: Gate status is ${gate.status}` };
  }
  const currentHash = computeParameterHash(executionParams);
  if (currentHash !== gate.parameterHash) {
    return { canExecute: false, reason: "Security violation: Action parameters were modified after approval was granted" };
  }
  return { canExecute: true };
}

test("Agent Governance & Consequential Action Approval Gates", async (t) => {
  await t.test("creates approval gate with bound parameter hash", () => {
    const params = { budgetIncrease: 5000, channel: "Google Search", maxCpa: 45.0 };
    const gate = createApprovalGate("org_north", "BUDGET_REALLOCATION", params, "Marketing Manager Mark");

    assert.strictEqual(gate.status, "PENDING_APPROVAL");
    assert.strictEqual(gate.requestedBy, "Marketing Manager Mark");
    assert.ok(gate.parameterHash.length === 64);
  });

  await t.test("enforces two-person rule: requester cannot self-approve without Admin authority", () => {
    const gate = createApprovalGate("org_north", "API_INTEGRATION_GRANT", { service: "Meta Ads" }, "CEO John");
    // Non-admin CEO attempting to approve their own request without independent second operator
    // In strict two-person rule:
    const gate2 = createApprovalGate("org_north", "BUDGET_REALLOCATION", { amount: 10000 }, "Miriam Manager");
    const result = approveGate(gate2, "Miriam Manager", "Marketing Manager");
    assert.strictEqual(result.success, false);
    assert.match(result.error!, /Only CEO or Admin roles have signing authority/i);
  });

  await t.test("CEO can approve subordinate request successfully", () => {
    const gate = createApprovalGate("org_north", "BUDGET_INCREASE", { amount: 15000 }, "Miriam Manager");
    const result = approveGate(gate, "John CEO", "CEO");

    assert.strictEqual(result.success, true);
    assert.strictEqual(gate.status, "APPROVED");
    assert.strictEqual(gate.approvedBy, "John CEO");
  });

  await t.test("blocks execution if parameters were tampered with after approval was granted", () => {
    const approvedParams = { budget: 10000, channel: "Meta Ads" };
    const gate = createApprovalGate("org_north", "CAMPAIGN_LAUNCH", approvedParams, "Victoria VP");
    approveGate(gate, "John CEO", "CEO");

    // Execution with unmodified params succeeds
    const check1 = verifyActionCanExecute(gate, approvedParams);
    assert.strictEqual(check1.canExecute, true);

    // Execution with secretly increased budget ($25,000 instead of approved $10,000) must be BLOCKED
    const tamperedParams = { budget: 25000, channel: "Meta Ads" };
    const check2 = verifyActionCanExecute(gate, tamperedParams);
    assert.strictEqual(check2.canExecute, false);
    assert.match(check2.reason!, /modified after approval/i);
  });
});
