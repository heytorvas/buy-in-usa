/**
 * Pure calculation engine for the USA→Brazil purchase calculator.
 * UI-agnostic and unit-testable.
 *
 * Flow:
 *   A) US Subtotal: priceUSD * (1 + stateTax)
 *   B) Convert to BRL using PTAX * (1 + spread)   (spread = 0 for cash)
 *   C) Apply IOF (rate depends on payment method / institution)
 */

export type PaymentMethod = "cash" | "global" | "credit";

export interface CalculatorInput {
  priceUSD: number;
  stateTax: number;        // e.g. 0.06
  ptax: number;            // BRL per USD (official)
  paymentMethod: PaymentMethod;
  spread: number;          // institution-specific spread (0 for cash)
  iofRate: number;         // institution-specific IOF (0..0.035)
}

export interface AuditTrail {
  basePriceBRL: number;        // price converted at PTAX (no fees, no state tax)
  stateTaxBRL: number;         // BRL amount of US state tax
  spreadBRL: number;           // BRL amount of spread
  iofBRL: number;              // BRL amount of IOF
  iofRate: number;             // applied IOF rate
  effectiveExchangeRate: number; // BRL per USD effectively paid
  subtotalUSD: number;         // priceUSD * (1 + stateTax)
}

export interface CalculationResult {
  finalBRL: number;
  audit: AuditTrail;
}

// Default IOF rates by payment method when no institution is selected.
// Source: melhoresdestinos.com.br (Dec 2025) — IOF padronizado em 3,5%
// para cartão de crédito, contas globais e câmbio em espécie.
export const DEFAULT_IOF: Record<PaymentMethod, number> = {
  cash: 0.035,
  global: 0.035,
  credit: 0.035,
};

export function calculate(input: CalculatorInput): CalculationResult {
  const { priceUSD, stateTax, ptax, spread, iofRate } = input;

  const safePrice = Number.isFinite(priceUSD) && priceUSD > 0 ? priceUSD : 0;

  // Step A — US subtotal in USD
  const subtotalUSD = safePrice * (1 + stateTax);

  // Step B — Conversion rate including spread
  const conversionRate = ptax * (1 + spread);

  // Step C — Convert and apply IOF
  const subtotalBRL = subtotalUSD * conversionRate;
  const iofBRL = subtotalBRL * iofRate;
  const finalBRL = subtotalBRL + iofBRL;

  // Audit breakdown — split BRL components
  const basePriceBRL = safePrice * ptax;
  const stateTaxBRL = safePrice * stateTax * ptax;
  const spreadBRL = subtotalUSD * ptax * spread;
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
