import banksRaw from "@/data/banks_spread.json";
import statesRaw from "@/data/usa_state_tax.json";

export type PaymentMethod = "cash" | "global" | "credit";

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  global: "Conta Internacional",
  credit: "Cartão de Crédito",
};

export interface Institution {
  code: string;
  name: string;
  spread: number;
  iof: number;
}

export interface UsState {
  code: string;
  name: string;
  stateTax: number;
  avgLocalTax: number;
  combinedTax: number;
}

export interface StateTaxMeta {
  last_update: string;
  updated_at: string;
}

export interface BanksMeta {
  source: string;
  last_update: string;
}

export const POSTAL_CODES: Readonly<Record<string, string>> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === "object" && raw !== null;
}

function parseRate(raw: unknown, label: string): number {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) {
    throw new Error(`${label} must be a finite number >= 0`);
  }
  return raw;
}

export function parseInstitution(raw: unknown, label: string): Institution {
  if (!isRecord(raw)) {
    throw new Error(`${label}: expected an object`);
  }
  if (typeof raw.code !== "string" || raw.code.length === 0) {
    throw new Error(`${label}: invalid code`);
  }
  if (typeof raw.name !== "string" || raw.name.length === 0) {
    throw new Error(`${label}: invalid name`);
  }
  return {
    code: raw.code,
    name: raw.name,
    spread: parseRate(raw.spread, `${label} spread`),
    iof: parseRate(raw.iof, `${label} iof`),
  };
}

export function parseBanksFile(raw: unknown): {
  cash: Institution;
  accounts: Institution[];
  banks: Institution[];
  meta: BanksMeta;
} {
  if (!isRecord(raw)) {
    throw new Error("banks file: expected an object");
  }
  if (typeof raw.source !== "string" || raw.source.length === 0) {
    throw new Error("banks file: invalid source");
  }
  if (typeof raw.last_update !== "string" || raw.last_update.length === 0) {
    throw new Error("banks file: invalid last_update");
  }
  if (!Array.isArray(raw.accounts)) {
    throw new Error("banks file: accounts must be an array");
  }
  if (!Array.isArray(raw.banks)) {
    throw new Error("banks file: banks must be an array");
  }
  return {
    cash: parseInstitution(raw.cash, "cash"),
    accounts: raw.accounts.map((item, i) => parseInstitution(item, `accounts[${i}]`)),
    banks: raw.banks.map((item, i) => parseInstitution(item, `banks[${i}]`)),
    meta: { source: raw.source, last_update: raw.last_update },
  };
}

function parsePercent(raw: unknown, label: string): number {
  if (typeof raw !== "string") {
    throw new Error(`${label}: expected a percent string`);
  }
  const n = parseFloat(raw);
  // Finite only: Tax Foundation reports New Jersey avg_local as a small negative offset.
  if (!Number.isFinite(n)) {
    throw new Error(`${label}: tax rate must be finite`);
  }
  return n / 100;
}

export function parseStateTaxFile(raw: unknown): {
  states: UsState[];
  meta: StateTaxMeta;
} {
  if (!isRecord(raw)) {
    throw new Error("state tax file: expected an object");
  }
  if (typeof raw.last_update !== "string" || raw.last_update.length === 0) {
    throw new Error("state tax file: invalid last_update");
  }
  if (typeof raw.updated_at !== "string" || raw.updated_at.length === 0) {
    throw new Error("state tax file: invalid updated_at");
  }
  if (!isRecord(raw.states)) {
    throw new Error("state tax file: invalid states");
  }

  const states = Object.entries(raw.states)
    .map(([name, record]) => {
      const code = POSTAL_CODES[name];
      if (!code) {
        throw new Error(`Unknown state name: ${name}`);
      }
      if (!isRecord(record)) {
        throw new Error(`${name}: expected a tax record`);
      }
      return {
        code,
        name,
        stateTax: parsePercent(record.state, `${name} state tax`),
        avgLocalTax: parsePercent(record.avg_local, `${name} avg local tax`),
        combinedTax: parsePercent(record.combined, `${name} combined tax`),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    states,
    meta: { last_update: raw.last_update, updated_at: raw.updated_at },
  };
}

const banksFile = parseBanksFile(banksRaw);
export const accounts = banksFile.accounts;
export const banks = banksFile.banks;
export const cashConfig = banksFile.cash;
export const banksMeta = banksFile.meta;

const taxFile = parseStateTaxFile(statesRaw);
export const states = taxFile.states;
export const stateTaxMeta = taxFile.meta;
