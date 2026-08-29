import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const DATA_FILES = ["ptax.json", "usa_state_tax.json", "banks_spread.json"] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function buildSitemapXml(lastmod: string): string {
  if (!ISO_DATE.test(lastmod)) {
    throw new Error(`lastmod must be YYYY-MM-DD, got ${lastmod}`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dolar.heytor.dev/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

function dataDir(): string {
  return path.resolve("src/data");
}

function readPtaxDate(dir: string): string {
  const raw: unknown = JSON.parse(fs.readFileSync(path.join(dir, "ptax.json"), "utf8"));
  if (
    typeof raw !== "object" ||
    raw === null ||
    !("date" in raw) ||
    typeof raw.date !== "string"
  ) {
    throw new Error("ptax.json date must be a YYYY-MM-DD lastmod string");
  }
  return raw.date;
}

export function calculatorAssetsPlugin(): Plugin {
  const dir = dataDir();
  return {
    name: "calculator-assets",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        const file = DATA_FILES.find((name) => pathname === `/data/${name}`);
        if (!file) {
          next();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(fs.readFileSync(path.join(dir, file)));
      });
    },
    generateBundle() {
      for (const file of DATA_FILES) {
        this.emitFile({
          type: "asset",
          fileName: `data/${file}`,
          source: fs.readFileSync(path.join(dir, file)),
        });
      }
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: buildSitemapXml(readPtaxDate(dir)),
      });
    },
  };
}
