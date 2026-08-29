import { describe, expect, it } from "vitest";
import {
  parseBanksFile,
  parseStateTaxFile,
  POSTAL_CODES,
} from "./catalog";
import {
  banksFileNegativeSpread,
  banksFileNonFiniteIof,
  newJerseyOffsetTaxFile,
  nonFiniteTaxFile,
  unknownStateTaxFile,
} from "./catalog.fixture";

describe("parseBanksFile", () => {
  const ok = {
    source: "https://example.com",
    last_update: "10/12/2025",
    cash: { code: "CASH", name: "Cash", spread: 0.035, iof: 0.035 },
    accounts: [{ code: "WISE", name: "Wise", spread: 0.008, iof: 0.035 }],
    banks: [{ code: "ITAU", name: "Itaú", spread: 0.055, iof: 0 }],
  };

  it("parses a valid file", () => {
    const parsed = parseBanksFile(ok);
    expect(parsed.accounts[0]?.code).toBe("WISE");
    expect(parsed.banks[0]?.iof).toBe(0);
  });

  it("rejects negative spread", () => {
    expect(() => parseBanksFile(banksFileNegativeSpread)).toThrow(/spread/i);
  });

  it("rejects non-finite IOF", () => {
    expect(() => parseBanksFile(banksFileNonFiniteIof)).toThrow(/iof/i);
  });
});

describe("parseStateTaxFile", () => {
  it("maps Florida to FL", () => {
    const parsed = parseStateTaxFile({
      last_update: "2026-01-01",
      updated_at: "2026-01-02 00:00:00",
      states: {
        Florida: { state: "6.00", avg_local: "1.00", combined: "7.00" },
      },
    });
    expect(parsed.states[0]).toMatchObject({
      code: "FL",
      stateTax: 0.06,
      avgLocalTax: 0.01,
      combinedTax: 0.07,
    });
  });

  it("throws when a state name has no postal code", () => {
    expect(() => parseStateTaxFile(unknownStateTaxFile)).toThrow(/Not A State/);
  });

  it("allows zero tax", () => {
    const parsed = parseStateTaxFile({
      last_update: "2026-01-01",
      updated_at: "2026-01-02 00:00:00",
      states: {
        Oregon: { state: "0.00", avg_local: "0.00", combined: "0.00" },
      },
    });
    expect(parsed.states[0]?.stateTax).toBe(0);
  });

  it("rejects non-finite tax", () => {
    expect(() => parseStateTaxFile(nonFiniteTaxFile)).toThrow(/tax/i);
  });

  it("allows New Jersey negative avg local offset", () => {
    const parsed = parseStateTaxFile(newJerseyOffsetTaxFile);
    expect(parsed.states[0]?.avgLocalTax).toBeCloseTo(-0.0002, 8);
  });
});

describe("POSTAL_CODES", () => {
  it("includes DC", () => {
    expect(POSTAL_CODES["District of Columbia"]).toBe("DC");
  });
});
