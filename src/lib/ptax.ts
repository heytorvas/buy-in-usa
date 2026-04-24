/**
 * Static PTAX accessor — reads src/data/ptax.json (refreshed daily by
 * `.github/workflows/scrape-ptax.yml`). Avoids hitting BCB Olinda on
 * every page visit.
 */

import ptaxRaw from "@/data/ptax.json";

export interface PtaxResult {
  rate: number;        // BRL per USD (sell-side, used as PTAX)
  buyRate: number;     // BRL per USD (buy-side)
  date: string;        // ISO date of the quote
  fetchedAt: string;   // ISO datetime when the scraper last ran
  fallback: boolean;   // kept for API compatibility — always false now
}

interface PtaxFile {
  rate: number;
  sell?: number;
  buy: number;
  date: string;
  updated_at: string;
}

const file = ptaxRaw as PtaxFile;

export const ptax: PtaxResult = {
  rate: file.rate ?? file.sell ?? 0,
  buyRate: file.buy,
  date: file.date,
  fetchedAt: file.updated_at,
  fallback: false,
};
