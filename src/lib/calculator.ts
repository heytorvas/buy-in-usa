/**
 * Pure calculation engine for the USA→Brazil purchase calculator.
 * UI-agnostic and unit-testable.
 *
 * Flow:
 *   A) US Subtotal: priceUSD * (1 + stateTax)
 *   B) Convert to BRL using PTAX (or PTAX * (1 + spread) for credit cards)
 *   C) Apply IOF (1.1% cash/global account, 3.5% credit card)
 */

export type PaymentMethod = "cash" | "global" | "credit";

export interface CalculatorInput {
  priceUSD: number;
  stateTax: number;        // e.g. 0.06
  ptax: number;            // BRL per USD (official)
  paymentMethod: PaymentMethod;
  bankSpread: number;      // e.g. 0.05 — only applied on credit card
}

export interface AuditTrail {
  basePriceBRL: number;        // price converted at PTAX (no fees, no state tax)
  stateTaxBRL: number;         // BRL amount of US state tax
  spreadBRL: number;           // BRL amount of bank spread (credit only)
  iofBRL: number;              // BRL amount of IOF
  iofRate: number;             // e.g. 0.011 or 0.035
  effectiveExchangeRate: number; // BRL per USD effectively paid
  subtotalUSD: number;         // priceUSD * (1 + stateTax)
}

export interface CalculationResult {
  finalBRL: number;
  audit: AuditTrail;
}

export const IOF_CASH = 0.011;
export const IOF_CREDIT = 0.035;

export function calculate(input: CalculatorInput): CalculationResult {
  const { priceUSD, stateTax, ptax, paymentMethod, bankSpread } = input;

  const safePrice = Number.isFinite(priceUSD) && priceUSD > 0 ? priceUSD : 0;

  // Step A — US subtotal in USD
  const subtotalUSD = safePrice * (1 + stateTax);

  // Step B — Choose conversion rate
  const isCredit = paymentMethod === "credit";
  const spread = isCredit ? bankSpread : 0;
  const conversionRate = ptax * (1 + spread);

  // Step C — Apply IOF
  const iofRate = isCredit ? IOF_CREDIT : IOF_CASH;

  // Convert and apply IOF on the converted BRL value
  const subtotalBRL = subtotalUSD * conversionRate;
  const iofBRL = subtotalBRL * iofRate;
  const finalBRL = subtotalBRL + iofBRL;

  // Audit breakdown — split BRL components
  const basePriceBRL = safePrice * ptax;
  const stateTaxBRL = safePrice * stateTax * ptax;
  const spreadBRL = subtotalUSD * ptax * spread; // BRL contribution of spread
  const effectiveExchangeRate = safePrice > 0 ? finalBRL / safePrice : 0;

  return {
    finalBRL,
    audit: {
      basePriceBRL,
      stateTaxBRL,
      spreadBRL,
      iofBRL,
      iofRate,
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
