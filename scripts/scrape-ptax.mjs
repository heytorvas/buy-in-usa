#!/usr/bin/env node
/**
 * Fetches the latest USD/BRL PTAX from BCB Olinda and writes
 * src/data/ptax.json. Walks back day-by-day if the most recent date has
 * no quote (weekends/holidays).
 *
 * The app reads the static JSON instead of calling BCB at runtime, which
 * avoids hitting the public API on every page visit.
 *
 * Output shape:
 * {
 *   "buy":  4.9533,    // cotacaoCompra (BRL/USD, official buy)
 *   "sell": 4.9539,    // cotacaoVenda  (BRL/USD, official sell)
 *   "rate": 4.9539,    // alias for sell — used as PTAX in the calculator
 *   "date": "2026-04-23",
 *   "updated_at": "2026-04-24 12:00:00"
 * }
 *
 * Note: BCB Olinda exposes PTAX (commercial) only. The "dólar turismo"
 * rate used for cash purchases is approximated by applying a configurable
 * spread (see src/data/banks_spread.json → cash entry) on top of PTAX.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = resolve(__dirname, "..", "src", "data", "ptax.json");

const MAX_LOOKBACK_DAYS = 10;

function formatBcbDate(d) {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function nowUtcStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

async function fetchForDate(d) {
  const dataParam = formatBcbDate(d);
  const url =
    `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/` +
    `CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${dataParam}'&$format=json`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const value = Array.isArray(json?.value) ? json.value[0] : null;
  if (!value || typeof value.cotacaoVenda !== "number") return null;
  return {
    buy: value.cotacaoCompra ?? value.cotacaoVenda,
    sell: value.cotacaoVenda,
    rate: value.cotacaoVenda,
    date: isoDate(d),
  };
}

async function main() {
  const today = new Date();
  for (let offset = 0; offset <= MAX_LOOKBACK_DAYS; offset++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - offset);
    const result = await fetchForDate(d);
    if (result) {
      const payload = { ...result, updated_at: nowUtcStamp() };
      await mkdir(dirname(OUTPUT_FILE), { recursive: true });
      await writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf-8");
      console.log(`Wrote PTAX ${payload.rate} (${payload.date}) → ${OUTPUT_FILE}`);
      return;
    }
  }
  throw new Error(`No PTAX quote found in the last ${MAX_LOOKBACK_DAYS} days.`);
}

main().catch((err) => {
  console.error("PTAX scraper failed:", err);
  process.exit(1);
});
