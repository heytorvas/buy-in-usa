import { describe, expect, it } from "vitest";
import { parsePtaxFile } from "./ptax";

describe("parsePtaxFile", () => {
  it("reads rate and dates", () => {
    expect(
      parsePtaxFile({
        rate: 5.2,
        buy: 5.1,
        date: "2026-08-28",
        updated_at: "2026-08-29 00:00:00",
      }),
    ).toEqual({
      rate: 5.2,
      date: "2026-08-28",
      fetchedAt: "2026-08-29 00:00:00",
    });
  });

  it("rejects rate 0", () => {
    expect(() =>
      parsePtaxFile({
        rate: 0,
        date: "2026-08-28",
        updated_at: "2026-08-29 00:00:00",
      }),
    ).toThrow(/rate/i);
  });

  it("rejects missing date", () => {
    expect(() =>
      parsePtaxFile({ rate: 5, date: "", updated_at: "x" }),
    ).toThrow(/date/i);
  });
});
