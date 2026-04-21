/**
 * PTAX service — fetches the official USD/BRL rate from the BCB Olinda API.
 * Recursively walks back day-by-day if the requested date returns no quote
 * (weekends/holidays).
 */

export interface PtaxResult {
  rate: number;            // BRL per USD (sell-side)
  buyRate: number;
  date: string;            // ISO date string yyyy-mm-dd of the quote
  fetchedAt: string;       // ISO datetime of fetch
  fallback: boolean;       // true if a non-API fallback was used
}

const FALLBACK_RATE = 5.05;
const MAX_LOOKBACK_DAYS = 10;

function formatBcbDate(d: Date): string {
  // BCB API expects MM-DD-YYYY (with quotes in URL)
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchForDate(d: Date): Promise<PtaxResult | null> {
  const dataParam = formatBcbDate(d);
  const url =
    `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/` +
    `CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${dataParam}'&$format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const value = Array.isArray(json?.value) ? json.value[0] : null;
    if (!value || typeof value.cotacaoVenda !== "number") return null;
    return {
      rate: value.cotacaoVenda,
      buyRate: value.cotacaoCompra ?? value.cotacaoVenda,
      date: toIsoDate(d),
      fetchedAt: new Date().toISOString(),
      fallback: false,
    };
  } catch {
    return null;
  }
}

/**
 * Recursively walks backward up to MAX_LOOKBACK_DAYS to find the most
 * recent valid PTAX quote. Falls back to a sane static rate if the API
 * is unreachable.
 */
export async function fetchLatestPtax(): Promise<PtaxResult> {
  const today = new Date();
  for (let offset = 0; offset <= MAX_LOOKBACK_DAYS; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const result = await fetchForDate(d);
    if (result) return result;
  }
  // Fallback — keeps the calculator usable even if BCB is offline
  return {
    rate: FALLBACK_RATE,
    buyRate: FALLBACK_RATE,
    date: toIsoDate(today),
    fetchedAt: new Date().toISOString(),
    fallback: true,
  };
}
