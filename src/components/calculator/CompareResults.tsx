import { Trophy } from "lucide-react";
import { formatBRL, formatPercent } from "@/lib/calculator";
import type { ScenarioRow } from "@/lib/scenarios";

export function CompareResults({ rows }: { rows: ScenarioRow[] }): JSX.Element {
  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border text-center text-sm text-muted-foreground">
        Selecione ao menos um método (e suas contas/cartões) para comparar.
      </div>
    );
  }

  const best = rows[0];

  return (
    <div className="space-y-3 animate-fade-in">
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
