import test from "node:test";
import assert from "node:assert/strict";
import { getTenantId } from "../src/lib/tenantUtils";
import { enforceTenantIsolation, AuthenticatedRequest } from "../src/server/authMiddleware";

test("Multi-Tenant Isolation & Partitioning", async (t) => {
  await t.test("getTenantId standardizes company names and organization identifiers cleanly", () => {
    assert.strictEqual(getTenantId("Acme Corp"), "acme_corp");
    assert.strictEqual(getTenantId("BioHealth Systems Ltd."), "biohealth_systems_ltd_");
    assert.strictEqual(getTenantId({ companyName: "Apex Retail Solutions" }), "apex_retail_solutions");
    assert.strictEqual(getTenantId({ organizationId: "org-alpha-99" }), "org-alpha-99");
    assert.strictEqual(getTenantId(""), "default_org");
  });

  await t.test("enforceTenantIsolation permits user within their authenticated tenant", (t) => {
    const req: any = {
      user: {
        userId: "USR-001",
        email: "alice@acmecorp.ca",
        role: "Marketing Manager",
        organizationId: "acme_corp"
      },
      params: { orgId: "acme_corp" },
      body: { organizationId: "acme_corp" },
      query: {}
    };

    let nextCalled = false;
    const res: any = {
      status: () => res,
      json: () => res
    };

    enforceTenantIsolation(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
  });

  await t.test("enforceTenantIsolation strictly BLOCKS cross-tenant parameter access with 403 Forbidden", () => {
    // User Alice belongs to 'acme_corp' but attempts to access or mutate 'competitor_corp'
    const req: any = {
      user: {
        userId: "USR-001",
        email: "alice@acmecorp.ca",
        role: "Marketing Manager",
        organizationId: "acme_corp"
      },
      params: { orgId: "competitor_corp" },
      body: { organizationId: "competitor_corp" },
      query: {}
    };

    let statusCode = 0;
    let responseBody: any = null;

    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        responseBody = data;
        return res;
      }
    };

    let nextCalled = false;
    enforceTenantIsolation(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, "Cross-tenant request must NOT reach downstream handlers");
    assert.strictEqual(statusCode, 403, "Cross-tenant request must return 403 Forbidden");
    assert.strictEqual(responseBody?.error, "Forbidden");
    assert.match(responseBody?.message, /Cross-tenant access prohibited/i);
  });

  await t.test("Superuser Admin role can manage cross-tenant operations when necessary", (t) => {
    const req: any = {
      user: {
        userId: "ADMIN-001",
        email: "shraddha.revdikar@gmail.com",
        role: "Admin",
        organizationId: "system_admin_org"
      },
      params: { orgId: "acme_corp" },
      body: {},
      query: {}
    };

    let nextCalled = false;
    const res: any = {
      status: () => res,
      json: () => res
    };

    enforceTenantIsolation(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
  });
});
