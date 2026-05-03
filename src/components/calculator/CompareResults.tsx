import { Trophy } from "lucide-react";
import { calculate, formatBRL, formatPercent, type PaymentMethod } from "@/lib/calculator";
import type { PtaxResult } from "@/lib/ptax";
import type { UsState } from "./StateSelect";
import { accounts, banks, cashConfig } from "./PaymentSection";

export interface CompareInput {
  priceUSD: number;
  stateInfo: UsState;
  ptax: PtaxResult;
  selectedMethods: PaymentMethod[];
  selectedAccounts: string[];
  selectedBanks: string[];
}

interface ScenarioRow {
  key: string;
  method: PaymentMethod;
  methodLabel: string;
  institutionLabel: string;
  spread: number;
  iofRate: number;
  finalBRL: number;
  effectiveRate: number;
}

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  global: "Conta Internacional",
  credit: "Cartão de Crédito",
};

function buildScenarios(input: CompareInput): ScenarioRow[] {
  const { priceUSD, stateInfo, ptax, selectedMethods, selectedAccounts, selectedBanks } = input;
  const rows: ScenarioRow[] = [];

  const run = (
    key: string,
    method: PaymentMethod,
    institutionLabel: string,
    spread: number,
    iofRate: number,
  ) => {
    const r = calculate({
      priceUSD,
      stateTax: stateInfo.combinedTax,
      ptax: ptax.rate,
      paymentMethod: method,
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
      finalBRL: r.finalBRL,
      effectiveRate: r.audit.effectiveExchangeRate,
    });
  };

  if (selectedMethods.includes("cash")) {
    run("cash", "cash", cashConfig.name, cashConfig.spread, cashConfig.iof);
  }
  if (selectedMethods.includes("global")) {
    accounts
      .filter((a) => selectedAccounts.includes(a.code))
      .forEach((a) => run(`global-${a.code}`, "global", a.name, a.spread, a.iof));
  }
  if (selectedMethods.includes("credit")) {
    banks
      .filter((b) => selectedBanks.includes(b.code))
      .forEach((b) => run(`credit-${b.code}`, "credit", b.name, b.spread, b.iof));
  }

  return rows.sort((a, b) => a.finalBRL - b.finalBRL);
}

export function CompareResults(props: CompareInput) {
  const rows = buildScenarios(props);

  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border text-center text-sm text-muted-foreground">
        Selecione ao menos um método (e suas contas/cartões) para comparar.
      </div>
    );
  }

  const best = rows[0];
  const worst = rows[rows.length - 1];
  const savings = worst.finalBRL - best.finalBRL;

  return (
    <div className="space-y-3 animate-fade-in">
      {rows.length > 1 && savings > 0 && (
        <div className="bg-secondary-light/40 border border-secondary rounded-2xl p-4 text-sm">
          <div className="font-bold text-secondary">
            Economia de até {formatBRL(savings)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Comparando a melhor opção ({best.institutionLabel}) com a mais cara ({worst.institutionLabel}).
          </div>
        </div>
      )}

      <ol className="space-y-3">
        {rows.map((row, idx) => {
          const isBest = idx === 0;
          const diff = row.finalBRL - best.finalBRL;
          return (
            <li
              key={row.key}
              className={`bg-card rounded-2xl p-5 border-2 shadow-warm transition-colors ${
                isBest ? "border-secondary" : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm shrink-0 ${
                      isBest
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-input-bg text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {row.methodLabel}
                      </span>
                      {isBest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                          <Trophy className="h-3 w-3" /> Melhor
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-foreground truncate">
                      {row.institutionLabel}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black tabular-nums">
                    {formatBRL(row.finalBRL)}
                  </div>
                  {!isBest && (
                    <div className="text-[11px] text-muted-foreground tabular-nums">
                      +{formatBRL(diff)}
                    </div>
                  )}
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <div>
                  <dt className="uppercase tracking-wider">Spread</dt>
                  <dd className="font-bold text-foreground tabular-nums">
                    {formatPercent(row.spread, 2)}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">IOF</dt>
                  <dd className="font-bold text-foreground tabular-nums">
                    {formatPercent(row.iofRate, 2)}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">R$/US$</dt>
                  <dd className="font-bold text-foreground tabular-nums">
                    {row.effectiveRate.toLocaleString("pt-BR", {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    })}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
