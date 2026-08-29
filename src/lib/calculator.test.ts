import { describe, expect, it } from "vitest";
import { formatBRL } from "./calculator";

describe("formatBRL", () => {
  it("formats a finite number in pt-BR", () => {
    expect(formatBRL(10)).toMatch(/R\$\s*10,00/);
  });

  it("treats non-finite as zero", () => {
    expect(formatBRL(Number.NaN)).toMatch(/R\$\s*0,00/);
  });
});
