import { describe, it, expect } from "vitest";
import { calculate, DEFAULT_IOF } from "@/lib/calculator";

describe("calculator engine", () => {
  it("computes cash payment with state tax and IOF 3.5%", () => {
    const r = calculate({
      priceUSD: 100,
      stateTax: 0.06,
      ptax: 5,
      paymentMethod: "cash",
      spread: 0,
      iofRate: DEFAULT_IOF.cash,
    });
    // subtotalUSD = 106 ; subtotalBRL = 530 ; iof = 18.55 ; final = 548.55
    expect(r.audit.subtotalUSD).toBeCloseTo(106, 5);
    expect(r.audit.iofRate).toBe(0.035);
    expect(r.finalBRL).toBeCloseTo(548.55, 2);
  });

  it("computes credit card with spread and IOF from institution", () => {
    const r = calculate({
      priceUSD: 100,
      stateTax: 0.06,
      ptax: 5,
      paymentMethod: "credit",
      spread: 0.05,
      iofRate: 0.035,
    });
    // conversionRate = 5.25 ; subtotalBRL = 106 * 5.25 = 556.5
    // iof = 19.4775 ; final = 575.9775
    expect(r.finalBRL).toBeCloseTo(575.9775, 3);
  });

  it("supports zero IOF (e.g. AstroPay subsidized)", () => {
    const r = calculate({
      priceUSD: 100,
      stateTax: 0,
      ptax: 5,
      paymentMethod: "global",
      spread: 0.015,
      iofRate: 0,
    });
    // subtotalBRL = 100 * 5 * 1.015 = 507.5 ; iof = 0
    expect(r.finalBRL).toBeCloseTo(507.5, 2);
    expect(r.audit.iofBRL).toBe(0);
  });

  it("returns zero on invalid price", () => {
    const r = calculate({
      priceUSD: 0,
      stateTax: 0.06,
      ptax: 5,
      paymentMethod: "cash",
      spread: 0,
      iofRate: 0.035,
    });
    expect(r.finalBRL).toBe(0);
  });
});
