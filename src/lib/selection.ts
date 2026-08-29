import type { PaymentMethod } from "./catalog";
import { accounts, banks } from "./catalog";

export interface CalculatorSelection {
  priceStr: string;
  stateCode: string;
  compareMode: boolean;
  method: PaymentMethod;
  accountCode: string;
  bankCode: string;
  selectedMethods: PaymentMethod[];
  selectedAccounts: string[];
  selectedBanks: string[];
}

export function defaultSelection(): CalculatorSelection {
  return {
    priceStr: "",
    stateCode: "FL",
    compareMode: false,
    method: "cash",
    accountCode: accounts[0].code,
    bankCode: banks[0].code,
    selectedMethods: [],
    selectedAccounts: [],
    selectedBanks: [],
  };
}

export function parsePriceUsd(priceStr: string): number {
  const n = parseFloat(priceStr.replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) {
    return 0;
  }
  return n;
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function selectionsEqual(
  a: CalculatorSelection,
  b: CalculatorSelection,
): boolean {
  return (
    a.priceStr === b.priceStr &&
    a.stateCode === b.stateCode &&
    a.compareMode === b.compareMode &&
    a.method === b.method &&
    a.accountCode === b.accountCode &&
    a.bankCode === b.bankCode &&
    arraysEqual(a.selectedMethods, b.selectedMethods) &&
    arraysEqual(a.selectedAccounts, b.selectedAccounts) &&
    arraysEqual(a.selectedBanks, b.selectedBanks)
  );
}
