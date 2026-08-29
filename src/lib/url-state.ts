import type { PaymentMethod } from "./catalog";
import { accounts, banks, states } from "./catalog";
import {
  defaultSelection,
  parsePriceUsd,
  type CalculatorSelection,
} from "./selection";

const PAYMENT_METHODS: readonly PaymentMethod[] = [
  "cash",
  "global",
  "credit",
];

function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.includes(value as PaymentMethod);
}

const accountCodes = new Set(accounts.map((account) => account.code));
const bankCodes = new Set(banks.map((bank) => bank.code));
const stateCodes = new Set(states.map((state) => state.code));

export function serializeSelection(selection: CalculatorSelection): string {
  const params = new URLSearchParams();

  if (selection.priceStr) {
    params.set("p", selection.priceStr);
  }

  params.set("st", selection.stateCode);

  if (selection.compareMode) {
    params.set("cmp", "1");
  }

  params.set("m", selection.method);
  params.set("acc", selection.accountCode);
  params.set("bk", selection.bankCode);

  if (selection.selectedMethods.length > 0) {
    params.set("ms", selection.selectedMethods.join(","));
  }

  if (selection.selectedAccounts.length > 0) {
    params.set("accs", selection.selectedAccounts.join(","));
  }

  if (selection.selectedBanks.length > 0) {
    params.set("bks", selection.selectedBanks.join(","));
  }

  return params.toString();
}

export function parseSelection(search: string): CalculatorSelection {
  const selection = defaultSelection();
  const query = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(query);

  if (params.has("p")) {
    const raw = params.get("p") ?? "";
    if (parsePriceUsd(raw) > 0) {
      selection.priceStr = raw;
    }
  }

  if (params.has("st")) {
    const code = params.get("st") ?? "";
    if (stateCodes.has(code)) {
      selection.stateCode = code;
    }
  }

  if (params.has("cmp")) {
    selection.compareMode = params.get("cmp") === "1";
  }

  if (params.has("m")) {
    const method = params.get("m") ?? "";
    if (isPaymentMethod(method)) {
      selection.method = method;
    }
  }

  if (params.has("acc")) {
    const code = params.get("acc") ?? "";
    if (accountCodes.has(code)) {
      selection.accountCode = code;
    }
  }

  if (params.has("bk")) {
    const code = params.get("bk") ?? "";
    if (bankCodes.has(code)) {
      selection.bankCode = code;
    }
  }

  if (params.has("ms")) {
    selection.selectedMethods = (params.get("ms") ?? "")
      .split(",")
      .filter(isPaymentMethod);
  }

  if (params.has("accs")) {
    selection.selectedAccounts = (params.get("accs") ?? "")
      .split(",")
      .filter((code) => code.length > 0 && accountCodes.has(code));
  }

  if (params.has("bks")) {
    selection.selectedBanks = (params.get("bks") ?? "")
      .split(",")
      .filter((code) => code.length > 0 && bankCodes.has(code));
  }

  return selection;
}
