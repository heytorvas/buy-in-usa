import { describe, expect, it } from "vitest";
import { banks, type PaymentMethod } from "./catalog";
import { defaultSelection } from "./selection";
import { parseSelection, serializeSelection } from "./url-state";

describe("url-state", () => {
  it("round-trips a compare selection", () => {
    const selection = {
      ...defaultSelection(),
      priceStr: "99.9",
      stateCode: "NY",
      compareMode: true,
      selectedMethods: ["cash", "credit"] as PaymentMethod[],
      selectedBanks: [banks[0].code],
    };
    const parsed = parseSelection(`?${serializeSelection(selection)}`);
    expect(parsed.priceStr).toBe("99.9");
    expect(parsed.stateCode).toBe("NY");
    expect(parsed.compareMode).toBe(true);
    expect(parsed.selectedMethods).toEqual(["cash", "credit"]);
    expect(parsed.selectedBanks).toEqual([banks[0].code]);
  });

  it("drops an unknown state and keeps the default", () => {
    expect(parseSelection("?st=XX").stateCode).toBe("FL");
  });

  it("drops an unknown bank and keeps a valid one", () => {
    const code = banks[0].code;
    const parsed = parseSelection(`?bks=${code},NOT_A_BANK`);
    expect(parsed.selectedBanks).toEqual([code]);
  });

  it("ignores a bad price key and leaves price empty", () => {
    expect(parseSelection("?p=nope").priceStr).toBe("");
  });
});
