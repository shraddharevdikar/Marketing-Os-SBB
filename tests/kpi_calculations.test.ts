import test from "node:test";
import assert from "node:assert/strict";

/**
 * Standard SBB MarketingOS Business Metric Formulas
 */
export function calculateRoas(revenue: number, adSpend: number): number {
  if (adSpend <= 0 || !Number.isFinite(adSpend)) return 0;
  if (!Number.isFinite(revenue) || revenue < 0) return 0;
  return Number((revenue / adSpend).toFixed(2));
}

export function calculateCpa(adSpend: number, conversions: number): number {
  if (conversions <= 0 || !Number.isFinite(conversions)) return 0;
  if (!Number.isFinite(adSpend) || adSpend < 0) return 0;
  return Number((adSpend / conversions).toFixed(2));
}

export function calculateConversionRate(conversions: number, clicks: number): number {
  if (clicks <= 0 || !Number.isFinite(clicks)) return 0;
  if (!Number.isFinite(conversions) || conversions < 0) return 0;
  return Number(((conversions / clicks) * 100).toFixed(2));
}

export function calculateCustomerAcquisitionCost(totalSalesMarketingCost: number, newCustomersAcquired: number): number {
  if (newCustomersAcquired <= 0 || !Number.isFinite(newCustomersAcquired)) return 0;
  if (!Number.isFinite(totalSalesMarketingCost) || totalSalesMarketingCost < 0) return 0;
  return Number((totalSalesMarketingCost / newCustomersAcquired).toFixed(2));
}

test("ROAS (Return on Ad Spend) Calculation", async (t) => {
  await t.test("calculates accurate ROAS with standard positive values", () => {
    assert.strictEqual(calculateRoas(50000, 10000), 5.0);
    assert.strictEqual(calculateRoas(12500, 3125), 4.0);
    assert.strictEqual(calculateRoas(15320, 4800), 3.19);
  });

  await t.test("safely handles zero or negative advertising spend without division by zero", () => {
    assert.strictEqual(calculateRoas(5000, 0), 0);
    assert.strictEqual(calculateRoas(5000, -500), 0);
    assert.strictEqual(calculateRoas(5000, NaN), 0);
    assert.strictEqual(calculateRoas(5000, Infinity), 0);
  });

  await t.test("handles zero attributed revenue", () => {
    assert.strictEqual(calculateRoas(0, 5000), 0);
  });
});

test("CPA (Cost Per Acquisition) Calculation", async (t) => {
  await t.test("calculates accurate CPA for conversions", () => {
    assert.strictEqual(calculateCpa(10000, 200), 50.0);
    assert.strictEqual(calculateCpa(4500, 150), 30.0);
  });

  await t.test("safely handles zero conversions without division by zero", () => {
    assert.strictEqual(calculateCpa(5000, 0), 0);
    assert.strictEqual(calculateCpa(5000, -10), 0);
    assert.strictEqual(calculateCpa(5000, NaN), 0);
  });
});

test("Conversion Rate Calculation", async (t) => {
  await t.test("calculates percentage conversion rate accurately", () => {
    assert.strictEqual(calculateConversionRate(250, 10000), 2.5);
    assert.strictEqual(calculateConversionRate(15, 300), 5.0);
  });

  await t.test("safely handles zero clicks without division by zero", () => {
    assert.strictEqual(calculateConversionRate(50, 0), 0);
    assert.strictEqual(calculateConversionRate(0, 0), 0);
  });
});
