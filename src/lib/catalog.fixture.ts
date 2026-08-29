/** Test-only invalid catalog payloads. Do not add these as files under `src/data`. */

export const banksFileNegativeSpread = {
  source: "https://example.com",
  last_update: "10/12/2025",
  cash: { code: "CASH", name: "Cash", spread: -0.01, iof: 0.035 },
  accounts: [{ code: "WISE", name: "Wise", spread: 0.008, iof: 0.035 }],
  banks: [{ code: "ITAU", name: "Itaú", spread: 0.055, iof: 0 }],
};

export const banksFileNonFiniteIof = {
  source: "https://example.com",
  last_update: "10/12/2025",
  cash: { code: "CASH", name: "Cash", spread: 0.035, iof: 0.035 },
  accounts: [{ code: "X", name: "X", spread: 0, iof: Number.NaN }],
  banks: [{ code: "ITAU", name: "Itaú", spread: 0.055, iof: 0 }],
};

export const unknownStateTaxFile = {
  last_update: "2026-01-01",
  updated_at: "2026-01-02 00:00:00",
  states: {
    "Not A State": { state: "1.00", avg_local: "0.00", combined: "1.00" },
  },
};

export const nonFiniteTaxFile = {
  last_update: "2026-01-01",
  updated_at: "2026-01-02 00:00:00",
  states: {
    Florida: { state: "NaN", avg_local: "0.00", combined: "0.00" },
  },
};

/** Mirrors Tax Foundation NJ row: avg_local is a small negative offset. */
export const newJerseyOffsetTaxFile = {
  last_update: "2026-01-01",
  updated_at: "2026-01-02 00:00:00",
  states: {
    "New Jersey": { state: "6.625", avg_local: "-0.02", combined: "6.60" },
  },
};
