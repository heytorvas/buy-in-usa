import { describe, expect, it } from "vitest";
import { accounts, banks } from "./catalog";
import { defaultSelection } from "./selection";
import { buildScenarios, toResultPayload } from "./scenarios";

describe("buildScenarios", () => {
  it("returns one cash row in single mode", () => {
    const rows = buildScenarios(defaultSelection(), 5);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.method).toBe("cash");
    expect(rows[0]?.result.audit.vetPerUSD).toBeDefined();
  });

  it("returns no rows when compare lists are empty", () => {
    const rows = buildScenarios(
      { ...defaultSelection(), compareMode: true },
      5,
    );
    expect(rows).toEqual([]);
  });

  it("sorts compare rows by final BRL", () => {
    const rows = buildScenarios(
      {
        ...defaultSelection(),
        priceStr: "100",
        compareMode: true,
        selectedMethods: ["credit"],
        selectedBanks: [banks[0].code, banks[1].code],
      },
      5,
    );
    expect(rows.length).toBe(2);
    expect(rows[0]!.finalBRL).toBeLessThanOrEqual(rows[1]!.finalBRL);
  });

  it("includes a selected global account", () => {
    const rows = buildScenarios(
      {
        ...defaultSelection(),
        priceStr: "50",
        compareMode: true,
        selectedMethods: ["global"],
        selectedAccounts: [accounts[0].code],
      },
      5,
    );
    expect(rows[0]?.institutionLabel).toBe(accounts[0].name);
  });
});

describe("toResultPayload", () => {
  it("toResultPayload copies numeric fields", () => {
    const selection = { ...defaultSelection(), priceStr: "10", stateCode: "FL" };
    const rows = buildScenarios(selection, 5);
    const payload = toResultPayload(selection, rows);
    expect(payload.priceUsd).toBe(10);
    expect(payload.state).toBe("FL");
    expect(payload.count).toBe(1);
    expect(payload.rows[0]?.finalBrl).toEqual(rows[0]?.finalBRL);
  });
});
