/**
 * Static PTAX accessor — reads src/data/ptax.json (refreshed daily by
 * `.github/workflows/scrape-ptax.yml`). Avoids hitting BCB Olinda on
 * every page visit.
 */

import ptaxRaw from "@/data/ptax.json";

export interface PtaxResult {
  rate: number;
  date: string;
  fetchedAt: string;
}

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null;
}

export function parsePtaxFile(raw: unknown): PtaxResult {
  if (!isRecord(raw)) {
    throw new Error("ptax file: expected an object");
  }

  const rateCandidate =
    typeof raw.rate === "number"
      ? raw.rate
      : typeof raw.sell === "number"
        ? raw.sell
        : undefined;

  if (
    typeof rateCandidate !== "number" ||
    !Number.isFinite(rateCandidate) ||
    rateCandidate <= 0
  ) {
    throw new Error("ptax file: rate must be a finite number > 0");
  }

  if (typeof raw.date !== "string" || raw.date.length === 0) {
    throw new Error("ptax file: invalid date");
  }

  if (typeof raw.updated_at !== "string" || raw.updated_at.length === 0) {
    throw new Error("ptax file: invalid updated_at");
  }

  return {
    rate: rateCandidate,
    date: raw.date,
    fetchedAt: raw.updated_at,
  };
}

export const ptax: PtaxResult = parsePtaxFile(ptaxRaw);
