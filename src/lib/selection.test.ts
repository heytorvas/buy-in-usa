import { describe, expect, it } from "vitest";
import { accounts } from "./catalog";
import { defaultSelection, parsePriceUsd, selectionsEqual } from "./selection";

describe("parsePriceUsd", () => {
  it("accepts a comma decimal", () => {
    expect(parsePriceUsd("10,5")).toBe(10.5);
  });

  it("returns 0 for empty or invalid", () => {
    expect(parsePriceUsd("")).toBe(0);
    expect(parsePriceUsd("abc")).toBe(0);
  });
});

describe("selectionsEqual", () => {
  it("treats array order as significant", () => {
    const a = defaultSelection();
    const b = { ...a, selectedAccounts: [accounts[0].code] };
    expect(selectionsEqual(a, b)).toBe(false);
  });
});
