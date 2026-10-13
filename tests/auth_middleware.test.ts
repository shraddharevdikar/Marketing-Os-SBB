import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyAuthAndTenant,
  requireRole,
  rateLimiter,
  applySecurityHeaders,
  createSignedSessionToken,
  verifySignedSessionToken
} from "../src/server/authMiddleware";
import { registerUser, findUserByEmail } from "../src/server/userStore";

test("Backend Authentication & Cryptographic Verification Middleware", async (t) => {
  await t.test("rejects missing Authorization header with 401 Unauthorized in production", async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    process.env.ALLOW_DEV_AUTH = "false";

    const req: any = {
      path: "/api/campaigns",
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
    await verifyAuthAndTenant(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(jsonBody?.error, "Unauthorized");

    process.env.NODE_ENV = prevEnv;
  });

  await t.test("strictly REJECTS fabricated raw string tokens (USR-XXX:tenant:role:email)", async () => {
    const req: any = {
      path: "/api/campaigns",
      headers: {
        authorization: "Bearer USR-A1B2C3:acme_holdings:Marketing Manager:m.mercer@acme.ca"
      }
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
    await verifyAuthAndTenant(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, "Fabricated raw token must NOT be accepted");
    assert.strictEqual(statusCode, 401, "Must return 401 Unauthorized");
    assert.strictEqual(jsonBody?.error, "Unauthorized");
    assert.ok(jsonBody?.message.includes("Cryptographic token verification failed"));
  });

  await t.test("strictly REJECTS forged or tampered session tokens (invalid HMAC signature)", async () => {
    // Generate valid token, then forge the payload to escalate role to CEO
    const validUser = {
      userId: "USR-LEGIT",
      email: "intern@acme.ca",
      role: "Executive",
      organizationId: "acme_corp"
    };
    const validToken = createSignedSessionToken(validUser);
    const parts = validToken.split(".");

    // Attacker modifies the payload chunk to claim "CEO" and competitor org
    const forgedPayload = {
      userId: "USR-LEGIT",
      email: "intern@acme.ca",
      role: "CEO",
      organizationId: "competitor_corp",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const forgedPayloadB64 = Buffer.from(JSON.stringify(forgedPayload)).toString("base64url");
    const tamperedToken = `${parts[0]}.${forgedPayloadB64}.${parts[2]}`; // Old signature with forged payload

    const req: any = {
      path: "/api/sbb/decision-engine",
      headers: { authorization: `Bearer ${tamperedToken}` }
    };

    let statusCode = 0;
    const res: any = {
      status: (code: number) => { statusCode = code; return res; },
      json: () => res
    };

    let nextCalled = false;
    await verifyAuthAndTenant(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, "Tampered cryptographic token must be rejected");
    assert.strictEqual(statusCode, 401, "Must fail closed with 401 Unauthorized");
  });

  await t.test("strictly REJECTS expired session tokens", async () => {
    // Token that expired 100 seconds ago
    const expiredToken = createSignedSessionToken({
      userId: "USR-EXPIRED",
      email: "old@corp.ca",
      role: "CEO",
      organizationId: "corp"
    }, -100);

    const verified = verifySignedSessionToken(expiredToken);
    assert.strictEqual(verified, null, "Expired token must resolve to null");

    const req: any = {
      path: "/api/campaigns",
      headers: { authorization: `Bearer ${expiredToken}` }
    };
    let statusCode = 0;
    const res: any = {
      status: (code: number) => { statusCode = code; return res; },
      json: () => res
    };
    let nextCalled = false;
    await verifyAuthAndTenant(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 401);
  });

  await t.test("authenticates valid cryptographically signed session token and extracts user and tenant", async () => {
    const regResult = registerUser({
      email: "m.mercer@acme.ca",
      password: "SecurePassword123!",
      name: "M Mercer",
      organizationId: "acme_holdings"
    });
    const stored = findUserByEmail("m.mercer@acme.ca");
    if (stored) {
      stored.role = "Marketing Manager";
    }

    const validToken = createSignedSessionToken({
      userId: stored?.id || "USR-A1B2C3",
      email: "m.mercer@acme.ca",
      role: "Marketing Manager",
      organizationId: "acme_holdings"
    });

    const req: any = {
      path: "/api/campaigns",
      headers: {
        authorization: `Bearer ${validToken}`
      }
    };
    let statusCode = 0;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: () => res
    };
    let nextCalled = false;

    await verifyAuthAndTenant(req, res, () => {
      nextCalled = true;
      assert.ok(req.user);
      assert.strictEqual(req.user.organizationId, "acme_holdings");
      assert.strictEqual(req.user.role, "Marketing Manager");
      assert.strictEqual(req.user.email, "m.mercer@acme.ca");
    });
    assert.strictEqual(nextCalled, true);
  });

  await t.test("strictly REJECTS custom session token when authoritative user does not exist", async () => {
    const phantomToken = createSignedSessionToken({
      userId: "USR-PHANTOM",
      email: "phantom@nonexistent-corp.ca",
      role: "Executive",
      organizationId: "nonexistent_corp"
    });

    const req: any = {
      path: "/api/campaigns",
      headers: {
        authorization: `Bearer ${phantomToken}`
      }
    };
    let statusCode = 0;
    let jsonResponse: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        jsonResponse = data;
        return res;
      }
    };
    let nextCalled = false;

    await verifyAuthAndTenant(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, false, "Must reject token without authoritative user record");
    assert.strictEqual(statusCode, 401, "Must return 401 Unauthorized");
    assert.ok(jsonResponse?.message?.includes("Authoritative user or organization membership record cannot be verified"));
  });

  await t.test("allows public /api/health endpoint without authentication", async () => {
    const req: any = {
      path: "/api/health",
      headers: {}
    };
    const res: any = {};
    let nextCalled = false;

    await verifyAuthAndTenant(req, res, () => {
      nextCalled = true;
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
