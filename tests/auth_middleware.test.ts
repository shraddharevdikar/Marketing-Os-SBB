import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyAuthAndTenant,
  requireRole,
  rateLimiter,
  applySecurityHeaders
} from "../src/server/authMiddleware";

test("Backend Authentication & Authorization Middleware", async (t) => {
  await t.test("rejects missing Authorization header with 401 Unauthorized", () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.ALLOW_DEV_AUTH = "false";

    const req: any = {
      path: "/api/strategist/query",
      headers: {}
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
    verifyAuthAndTenant(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(jsonBody?.error, "Unauthorized");

    process.env.NODE_ENV = prevEnv;
  });

  await t.test("allows public /api/health endpoint without authentication", (t) => {
    const req: any = {
      path: "/api/health",
      headers: {}
    };
    const res: any = {};
    let nextCalled = false;

    verifyAuthAndTenant(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true);
  });

  await t.test("authenticates valid structured session token and extracts user and tenant", (t) => {
    const req: any = {
      path: "/api/campaigns",
      headers: {
        authorization: "Bearer USR-A1B2C3:acme_holdings:Marketing Manager:m.mercer@acme.ca"
      }
    };
    const res: any = {};
    let nextCalled = false;

    verifyAuthAndTenant(req, res, () => {
      nextCalled = true;
      assert.ok(req.user);
      assert.strictEqual(req.user.userId, "USR-A1B2C3");
      assert.strictEqual(req.user.organizationId, "acme_holdings");
      assert.strictEqual(req.user.role, "Marketing Manager");
      assert.strictEqual(req.user.email, "m.mercer@acme.ca");
    });
    assert.strictEqual(nextCalled, true);
  });

  await t.test("requireRole allows permitted role and blocks unauthorized role with 403 Forbidden", () => {
    const allowedReq: any = {
      user: { role: "CEO", userId: "U1", organizationId: "org1", email: "ceo@corp.ca" }
    };
    const deniedReq: any = {
      user: { role: "Team Lead", userId: "U2", organizationId: "org1", email: "lead@corp.ca" }
    };

    let allowedNext = false;
    const middleware = requireRole(["Admin", "CEO"]);

    middleware(allowedReq, {} as any, () => { allowedNext = true; });
    assert.strictEqual(allowedNext, true, "CEO should be permitted for CEO operation");

    let deniedCode = 0;
    let deniedBody: any = null;
    const res: any = {
      status: (c: number) => { deniedCode = c; return res; },
      json: (d: any) => { deniedBody = d; return res; }
    };

    middleware(deniedReq, res, () => {});
    assert.strictEqual(deniedCode, 403, "Team Lead should be rejected with 403 Forbidden");
    assert.strictEqual(deniedBody?.error, "Forbidden");
  });

  await t.test("rateLimiter enforces request thresholds with 429 Too Many Requests", () => {
    const limiter = rateLimiter(3, 10000); // 3 requests per 10s
    const req: any = { ip: "192.168.1.100", user: { userId: "user-rate-test" } };
    const headersSet: Record<string, any> = {};
    let lastStatus = 0;
    const res: any = {
      setHeader: (k: string, v: any) => { headersSet[k] = v; },
      status: (c: number) => { lastStatus = c; return res; },
      json: () => res
    };

    // 1st request
    limiter(req, res, () => {});
    assert.strictEqual(lastStatus, 0);

    // 2nd request
    limiter(req, res, () => {});
    assert.strictEqual(lastStatus, 0);

    // 3rd request
    limiter(req, res, () => {});
    assert.strictEqual(lastStatus, 0);

    // 4th request (should be throttled)
    limiter(req, res, () => {});
    assert.strictEqual(lastStatus, 429, "4th request should exceed 3 req limit and return 429");
    assert.ok(headersSet["Retry-After"] > 0, "Retry-After header must be set");
  });

  await t.test("applySecurityHeaders sets standard security headers", () => {
    const headers: Record<string, string> = {};
    const req: any = {};
    const res: any = {
      setHeader: (k: string, v: string) => { headers[k] = v; }
    };

    applySecurityHeaders(req, res, () => {});
    assert.strictEqual(headers["X-Content-Type-Options"], "nosniff");
    assert.strictEqual(headers["X-Frame-Options"], "SAMEORIGIN");
    assert.strictEqual(headers["X-XSS-Protection"], "1; mode=block");
    assert.strictEqual(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  });
});
