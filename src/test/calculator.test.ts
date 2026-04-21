import { describe, it, expect } from "vitest";
import { calculate, IOF_CASH, IOF_CREDIT } from "@/lib/calculator";

describe("calculator engine", () => {
  it("computes cash payment with state tax and IOF 1.1%", () => {
    const r = calculate({
      priceUSD: 100,
      stateTax: 0.06,
      ptax: 5,
      paymentMethod: "cash",
      bankSpread: 0,
    });
    // subtotalUSD = 106 ; subtotalBRL = 530 ; iof = 5.83 ; final = 535.83
    expect(r.audit.subtotalUSD).toBeCloseTo(106, 5);
    expect(r.audit.iofRate).toBe(IOF_CASH);
    expect(r.finalBRL).toBeCloseTo(535.83, 2);
  });

  it("computes credit card with spread and IOF 3.5%", () => {
    const r = calculate({
      priceUSD: 100,
      stateTax: 0.06,
      ptax: 5,
      paymentMethod: "credit",
      bankSpread: 0.05,
    });
    // conversionRate = 5.25 ; subtotalBRL = 106 * 5.25 = 556.5
    // iof = 19.4775 ; final = 575.9775
    expect(r.audit.iofRate).toBe(IOF_CREDIT);
    expect(r.finalBRL).toBeCloseTo(575.9775, 3);
  });

  it("returns zero on invalid price", () => {
    const r = calculate({
      priceUSD: 0,
      stateTax: 0.06,
      ptax: 5,
      paymentMethod: "cash",
      bankSpread: 0,
    });
    expect(r.finalBRL).toBe(0);
  });
});
