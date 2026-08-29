export interface CalculatorInput {
  priceUSD: number;
  stateTax: number;
  avgLocalTax: number;
  ptax: number;
  spread: number;
  iofRate: number;
}

export interface AuditTrail {
  basePriceBRL: number;
  stateTaxBRL: number;
  stateOnlyBRL: number;
  localTaxBRL: number;
  spreadBRL: number;
  iofBRL: number;
  iofRate: number;
  vetPerUSD: number;
  effectiveExchangeRate: number;
  subtotalUSD: number;
}

export interface CalculationResult {
  finalBRL: number;
  audit: AuditTrail;
}

export function calculate(input: CalculatorInput): CalculationResult {
  const { priceUSD, stateTax, avgLocalTax, ptax, spread, iofRate } = input;
  const combinedTax = stateTax + avgLocalTax;
  const safePrice = Number.isFinite(priceUSD) && priceUSD > 0 ? priceUSD : 0;

  const subtotalUSD = safePrice * (1 + combinedTax);
  const conversionRate = ptax * (1 + spread);
  const subtotalBRL = subtotalUSD * conversionRate;
  const iofBRL = subtotalBRL * iofRate;
  const finalBRL = subtotalBRL + iofBRL;

  const basePriceBRL = safePrice * ptax;
  const stateOnlyBRL = safePrice * stateTax * ptax;
  const localTaxBRL = safePrice * avgLocalTax * ptax;
  const stateTaxBRL = stateOnlyBRL + localTaxBRL;
  const spreadBRL = subtotalUSD * ptax * spread;
  const vetPerUSD = ptax * (1 + spread) * (1 + iofRate);
  const effectiveExchangeRate = safePrice > 0 ? finalBRL / safePrice : 0;

  return {
    finalBRL,
    audit: {
      basePriceBRL,
      stateTaxBRL,
      stateOnlyBRL,
      localTaxBRL,
      spreadBRL,
      iofBRL,
      iofRate,
      vetPerUSD,
      effectiveExchangeRate,
      subtotalUSD,
    },
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return `${(value * 100).toFixed(fractionDigits).replace(".", ",")}%`;
}
