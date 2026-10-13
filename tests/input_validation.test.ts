import test from "node:test";
import assert from "node:assert/strict";
import {
  validateAiPromptInput,
  validateLeadCaptureInput,
  validateCampaignInput,
  sanitizeInputString
} from "../src/server/validatorMiddleware";

test("API Schema Input Validation & Sanitization", async (t) => {
  await t.test("sanitizeInputString strips null bytes and trims strings", () => {
    assert.strictEqual(sanitizeInputString("hello\0world"), "helloworld");
    assert.strictEqual(sanitizeInputString("   sample text   "), "sample text");
    assert.strictEqual(sanitizeInputString(12345 as any), "");
  });

  await t.test("validateAiPromptInput rejects missing, non-string, or empty prompt with 400", () => {
    const testCases = [
      { body: {} },
      { body: { prompt: null } },
      { body: { prompt: 12345 } },
      { body: { prompt: "   " } }
    ];

    for (const tc of testCases) {
      let statusCode = 0;
      let responseBody: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { responseBody = data; return res; }
      };

      let nextCalled = false;
      validateAiPromptInput(tc as any, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, false, `Should reject invalid body: ${JSON.stringify(tc.body)}`);
      assert.strictEqual(statusCode, 400);
      assert.strictEqual(responseBody?.error, "Validation Error");
      assert.ok(responseBody?.details?.length > 0);
    }
  });

  await t.test("validateAiPromptInput rejects oversized prompt payload (> 30,000 chars) with 400", () => {
    const hugePrompt = "a".repeat(35000);
    const req: any = { body: { prompt: hugePrompt } };
    let statusCode = 0;
    const res: any = {
      status: (code: number) => { statusCode = code; return res; },
      json: () => res
    };

    let nextCalled = false;
    validateAiPromptInput(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(statusCode, 400);
  });

  await t.test("validateAiPromptInput allows valid prompt", () => {
    const req: any = { body: { prompt: "Analyze customer acquisition cost for B2B SaaS" } };
    const res: any = {};
    let nextCalled = false;

    validateAiPromptInput(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
  });

  await t.test("validateLeadCaptureInput validates name and email format strictly", () => {
    const invalidLeads = [
      { name: "", email: "valid@corp.ca" },
      { name: "John Doe", email: "not-an-email" },
      { name: "Jane Doe", email: "missing-domain@" },
      { name: "Bob Smith", email: "@missing-user.com" }
    ];

    for (const lead of invalidLeads) {
      const req: any = { body: lead };
      let statusCode = 0;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: () => res
      };

      let nextCalled = false;
      validateLeadCaptureInput(req, res, () => { nextCalled = true; });

      assert.strictEqual(nextCalled, false, `Must reject malformed lead: ${JSON.stringify(lead)}`);
      assert.strictEqual(statusCode, 400);
    }
  });

  await t.test("validateLeadCaptureInput normalizes email to lowercase and sanitizes orgId", () => {
    const req: any = {
      body: {
        name: "Dr. Eleanor Wright",
        email: "Eleanor.Wright@WrightMed.CA",
        source: "Inbound Hook",
        territory: "BC",
        organizationId: "Wright Health Systems!"
      }
    };
    const res: any = {};
    let nextCalled = false;

    validateLeadCaptureInput(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.body.email, "eleanor.wright@wrightmed.ca");
    assert.strictEqual(req.body.organizationId, "wright_health_systems_");
  });

  await t.test("validateCampaignInput validates title, positive budget, and channel array", () => {
    // Missing title
    const req1: any = { body: { title: "", budget: 5000 } };
    let code1 = 0;
    const res1: any = { status: (c: number) => { code1 = c; return res1; }, json: () => res1 };
    validateCampaignInput(req1, res1, () => {});
    assert.strictEqual(code1, 400);

    // Negative budget
    const req2: any = { body: { title: "Growth Campaign", budget: -500 } };
    let code2 = 0;
    const res2: any = { status: (c: number) => { code2 = c; return res2; }, json: () => res2 };
    validateCampaignInput(req2, res2, () => {});
    assert.strictEqual(code2, 400);

    // Non-array channels
    const req3: any = { body: { title: "Growth Campaign", budget: 5000, channels: "not-an-array" } };
    let code3 = 0;
    const res3: any = { status: (c: number) => { code3 = c; return res3; }, json: () => res3 };
    validateCampaignInput(req3, res3, () => {});
    assert.strictEqual(code3, 400);

    // Valid campaign
    const req4: any = { body: { title: "Q3 Omnichannel Blitz", budget: 15000, channels: ["Google", "Meta"] } };
    let next4 = false;
    validateCampaignInput(req4, {} as any, () => { next4 = true; });
    assert.strictEqual(next4, true);
  });
});
