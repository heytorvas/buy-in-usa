#!/usr/bin/env node
/**
 * Scrapes US state sales tax rates from taxfoundation.org and writes
 * src/data/usa_state_tax.json.
 *
 * Captures three values per state from the first table:
 *   - state         (state-level rate, e.g. "6.00")
 *   - avg_local     (average local rate, e.g. "1.02")
 *   - combined      (state + avg local, e.g. "7.02")
 *
 * All values are stored as strings (percentage points without the % sign)
 * to mirror the original data format and let the UI control rounding.
 *
 * Output shape:
 * {
 *   "states": {
 *     "Florida": { "state": "6.00", "avg_local": "1.02", "combined": "7.02" },
 *     ...
 *   },
 *   "last_update": "2026-01-01",         // ISO date of the source table
 *   "updated_at":  "2026-04-21 18:53:10" // when the scraper ran (UTC)
 * }
 */

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const URL = "https://taxfoundation.org/data/all/state/sales-tax-rates/";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = resolve(__dirname, "..", "src", "data", "usa_state_tax.json");

const MONTHS = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
};

function cleanStateName(name) {
  // Strip footnote markers like "California (a)"
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

function cleanRate(rate) {
  return rate.replace("%", "").trim();
}

/**
 * Parses the "as of <Month DD, YYYY>" string from the page and returns
 * an ISO date string (YYYY-MM-DD). Falls back to today if missing.
 */
function parseLastUpdate($) {
  let raw = "";
  $("h1, h2, h3, p").each((_, el) => {
    if (raw) return;
    const text = $(el).text().trim();
    const m = text.match(/as of\s+([a-zA-Z]+)\s+(\d{1,2}),\s+(\d{4})/i);
    if (m) raw = `${m[1]} ${m[2]} ${m[3]}`;
  });

  if (!raw) {
    return new Date().toISOString().slice(0, 10);
  }

  const [monthName, dayStr, yearStr] = raw.split(/\s+/);
  const mm = MONTHS[monthName.toLowerCase()];
  if (!mm) return new Date().toISOString().slice(0, 10);
  const dd = String(parseInt(dayStr, 10)).padStart(2, "0");
  return `${yearStr}-${mm}-${dd}`;
}

function findColumnIndex(headers, ...keywords) {
  return headers.findIndex((h) => keywords.every((k) => h.toLowerCase().includes(k)));
}

function parseTable($) {
  const table = $("table").first();
  if (!table.length) throw new Error("Table not found in HTML.");

  const rows = table.find("tr").toArray();
  const headerCells = $(rows[0])
    .find("th, td")
    .toArray()
    .map((c) => $(c).text().trim());

  const stateIdx = findColumnIndex(headerCells, "state") >= 0 ? 0 : 0;
  const stateRateIdx = findColumnIndex(headerCells, "state", "rate");
  const avgLocalIdx = findColumnIndex(headerCells, "avg", "local");
  const combinedIdx = findColumnIndex(headerCells, "combined") >= 0
    ? headerCells.findIndex((h) => /combined/i.test(h) && /rate/i.test(h))
    : -1;

  if (stateRateIdx === -1 || avgLocalIdx === -1 || combinedIdx === -1) {
    throw new Error(
      `Expected columns not found. Headers: ${JSON.stringify(headerCells)}`,
    );
  }

  const result = {};
  for (const row of rows.slice(1)) {
    const cols = $(row).find("td, th").toArray();
    if (cols.length <= Math.max(stateRateIdx, avgLocalIdx, combinedIdx)) continue;
    const state = cleanStateName($(cols[stateIdx]).text().trim());
    const stateRate = cleanRate($(cols[stateRateIdx]).text().trim());
    const avgLocal = cleanRate($(cols[avgLocalIdx]).text().trim());
    const combined = cleanRate($(cols[combinedIdx]).text().trim());
    if (state && stateRate && state.toLowerCase() !== "state") {
      result[state] = {
        state: stateRate,
        avg_local: avgLocal,
        combined: combined,
      };
    }
  }
  return result;
}

function nowUtcStamp() {
  // YYYY-MM-DD HH:MM:SS in UTC
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

async function main() {
  console.log(`Fetching ${URL}`);
  const res = await fetch(URL, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const states = parseTable($);
  const lastUpdate = parseLastUpdate($);
  const updatedAt = nowUtcStamp();

  if (Object.keys(states).length < 40) {
    throw new Error(`Suspiciously few states parsed: ${Object.keys(states).length}`);
  }

  const payload = { states, last_update: lastUpdate, updated_at: updatedAt };
  await mkdir(dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${Object.keys(states).length} states → ${OUTPUT_FILE}`);
  console.log(`last_update=${lastUpdate} updated_at=${updatedAt}`);
}

main().catch((err) => {
  console.error("Scraper failed:", err);
  process.exit(1);
});
