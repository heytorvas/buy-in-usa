import { calculate } from "./calculator";
import {
  accounts,
  banks,
  cashConfig,
  METHOD_LABEL,
  states,
  type PaymentMethod,
} from "./catalog";
import { parsePriceUsd, type CalculatorSelection } from "./selection";

export interface ScenarioRow {
  key: string;
  method: PaymentMethod;
  methodLabel: string;
  institutionLabel: string;
  spread: number;
  iofRate: number;
  finalBRL: number;
  effectiveRate: number;
  vetPerUSD: number;
}

function resolveState(stateCode: string) {
  const stateInfo = states.find((s) => s.code === stateCode);
  if (!stateInfo) {
    throw new Error(`Unknown state code: ${stateCode}`);
  }
  return stateInfo;
}

export function buildScenarios(
  selection: CalculatorSelection,
  ptaxRate: number,
): ScenarioRow[] {
  const stateInfo = resolveState(selection.stateCode);
  const priceUSD = parsePriceUsd(selection.priceStr);
  const rows: ScenarioRow[] = [];

  const run = (
    key: string,
    method: PaymentMethod,
    institutionLabel: string,
    spread: number,
    iofRate: number,
  ) => {
    const result = calculate({
      priceUSD,
      stateTax: stateInfo.stateTax,
      avgLocalTax: stateInfo.avgLocalTax,
      ptax: ptaxRate,
      spread,
      iofRate,
    });
    rows.push({
      key,
      method,
      methodLabel: METHOD_LABEL[method],
      institutionLabel,
      spread,
      iofRate,
      finalBRL: result.finalBRL,
      effectiveRate: result.audit.effectiveExchangeRate,
      vetPerUSD: result.audit.vetPerUSD,
    });
  };

  if (!selection.compareMode) {
    if (selection.method === "cash") {
      run("cash", "cash", cashConfig.name, cashConfig.spread, cashConfig.iof);
    } else if (selection.method === "global") {
      const account = accounts.find((a) => a.code === selection.accountCode);
      if (!account) {
        throw new Error(`Unknown account code: ${selection.accountCode}`);
      }
      run(
        `global-${account.code}`,
        "global",
        account.name,
        account.spread,
        account.iof,
      );
    } else {
      const bank = banks.find((b) => b.code === selection.bankCode);
      if (!bank) {
        throw new Error(`Unknown bank code: ${selection.bankCode}`);
      }
      run(`credit-${bank.code}`, "credit", bank.name, bank.spread, bank.iof);
    }
    return rows;
  }

  if (selection.selectedMethods.includes("cash")) {
    run("cash", "cash", cashConfig.name, cashConfig.spread, cashConfig.iof);
  }
  if (selection.selectedMethods.includes("global")) {
    accounts
      .filter((a) => selection.selectedAccounts.includes(a.code))
      .forEach((a) =>
        run(`global-${a.code}`, "global", a.name, a.spread, a.iof),
      );
  }
  if (selection.selectedMethods.includes("credit")) {
    banks
      .filter((b) => selection.selectedBanks.includes(b.code))
      .forEach((b) =>
        run(`credit-${b.code}`, "credit", b.name, b.spread, b.iof),
      );
  }

  return rows.sort((a, b) => a.finalBRL - b.finalBRL);
}
