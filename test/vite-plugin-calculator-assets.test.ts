import { describe, expect, it } from "vitest";
import { buildSitemapXml } from "@/vite-plugin-calculator-assets";

describe("buildSitemapXml", () => {
  it("injects lastmod", () => {
    const xml = buildSitemapXml("2026-08-28");
    expect(xml).toContain("<lastmod>2026-08-28</lastmod>");
    expect(xml).toContain("https://dolar.heytor.dev/");
  });

  it("rejects a non-ISO date", () => {
    expect(() => buildSitemapXml("28/08/2026")).toThrow(/lastmod/i);
  });
});
