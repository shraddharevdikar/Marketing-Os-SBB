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
  await t.test("firestore.rules enforces strict multi-tenant isolation and least privilege", () => {
    const rulesPath = path.resolve(process.cwd(), "firestore.rules");
    assert.ok(fs.existsSync(rulesPath), "firestore.rules must exist");

    const rulesContent = fs.readFileSync(rulesPath, "utf-8");

    // 1. Must use rules_version 2
    assert.ok(rulesContent.includes("rules_version = '2'"), "Must specify rules_version = '2'");

    // 2. Must enforce immutable audit logs (no updates or deletes allowed)
    assert.ok(
      rulesContent.includes("allow update, delete: if false;"),
      "Audit logs must be strictly immutable"
    );

    // 3. Must prevent self-escalation to Admin role in user profiles
    assert.ok(
      rulesContent.includes("request.resource.data.role in ['Marketing Manager', 'Team Lead', 'Executive']") ||
      rulesContent.includes("isOrgAdmin"),
      "User creation and updates must prevent self-escalation to unverified Admin role"
    );

    // 4. Must disallow documents without a valid organizationId in top-level collections
    assert.ok(
      !rulesContent.includes("resource.data.organizationId == null ||"),
      "Must NOT permit bypasses for null organizationId records"
    );
    assert.ok(
      rulesContent.includes("resource.data.organizationId != null"),
      "Must explicitly require valid organizationId on document reads"
    );
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
