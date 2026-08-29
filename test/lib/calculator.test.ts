import { describe, expect, it } from "vitest";
import { calculate, formatBRL, formatPercent, formatUSD } from "@/lib/calculator";

describe("formatBRL", () => {
  it("formats a finite number in pt-BR", () => {
    expect(formatBRL(10)).toMatch(/R\$\s*10,00/);
  });

  it("treats non-finite as zero", () => {
    expect(formatBRL(Number.NaN)).toMatch(/R\$\s*0,00/);
  });
});

describe("calculate", () => {
  const base = {
    priceUSD: 100,
    stateTax: 0.06,
    avgLocalTax: 0.01,
    ptax: 5,
    spread: 0.035,
    iofRate: 0.035,
  };

  it("uses combined state + local tax on the USD subtotal", () => {
    const { audit } = calculate(base);
    expect(audit.subtotalUSD).toBeCloseTo(107, 8);
  });

  it("splits US tax BRL into state and local by rate share", () => {
    const { audit } = calculate(base);
    expect(audit.stateTaxBRL).toBeCloseTo(100 * 0.07 * 5, 8);
    expect(audit.stateOnlyBRL).toBeCloseTo(100 * 0.06 * 5, 8);
    expect(audit.localTaxBRL).toBeCloseTo(100 * 0.01 * 5, 8);
  });

  it("computes VET as PTAX × (1 + spread) × (1 + IOF)", () => {
    const { audit } = calculate(base);
    expect(audit.vetPerUSD).toBeCloseTo(5 * 1.035 * 1.035, 8);
  });

  it("treats non-positive price as a zero result", () => {
    const { finalBRL } = calculate({ ...base, priceUSD: 0 });
    expect(finalBRL).toBe(0);
  });
});

describe("formatUSD", () => {
  it("formats USD", () => {
    expect(formatUSD(10)).toBe("$10.00");
  });
});

describe("formatPercent", () => {
  it("uses a comma decimal", () => {
    expect(formatPercent(0.035)).toBe("3,50%");
  });
});
