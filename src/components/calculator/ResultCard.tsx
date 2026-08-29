import { formatBRL, formatUSD, formatPercent } from "@/lib/calculator";
import { type BanksMeta, type StateTaxMeta, type UsState } from "@/lib/catalog";
import type { PtaxResult } from "@/lib/ptax";
import type { ScenarioRow } from "@/lib/scenarios";
import { DonutChart } from "./DonutChart";
import { Info } from "lucide-react";

interface ResultCardProps {
  row: ScenarioRow;
  priceUSD: number;
  stateInfo: UsState;
  ptax?: PtaxResult;
  stateTaxMeta?: StateTaxMeta;
  banksMeta?: BanksMeta;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] bg-secondary-light/60 text-secondary px-2 py-0.5 rounded-full font-bold">
      {children}
    </span>
  );
}

export function ResultCard({
  row,
  priceUSD,
  stateInfo,
  ptax,
  stateTaxMeta,
  banksMeta,
}: ResultCardProps) {
  const { finalBRL, audit } = row.result;
  const taxesBRL = audit.stateTaxBRL + audit.spreadBRL + audit.iofBRL;
  const totalForChart = audit.basePriceBRL + taxesBRL;
  const productPct = totalForChart > 0 ? audit.basePriceBRL / totalForChart : 0;
  const taxesPct = 1 - productPct;
  const hasSpread = row.spread > 0;

  const combinedTax = stateInfo.combinedTax;
  const vetPerUSD = audit.vetPerUSD;
  const stateOnlyBRL = audit.stateOnlyBRL;
  const localBRL = audit.localTaxBRL;

  return (
    <div
      className="bg-card rounded-3xl p-8 border border-border shadow-warm flex flex-col items-center animate-fade-in"
      data-method={row.method}
      data-institution={row.institutionLabel}
      data-final-brl={row.finalBRL}
      data-spread={row.spread}
      data-iof={row.iofRate}
      data-vet={row.vetPerUSD}
    >
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
        Total Final Estimado
      </span>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-secondary">R$</span>
        <span className="text-6xl font-black text-foreground tabular-nums">
          {finalBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <span className="text-sm text-muted-foreground mb-1">
        ≈ {formatUSD(priceUSD)} USD (Custo Efetivo Total)
      </span>
      <span className="text-xs text-muted-foreground mb-8">
        {row.methodLabel} · {row.institutionLabel}
      </span>

      <div className="w-full border-t border-border pt-8 space-y-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Detalhamento</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between items-center pb-2 border-b border-input-bg">
              <span className="text-muted-foreground">Preço Base</span>
              <span className="font-bold tabular-nums">{formatBRL(audit.basePriceBRL)}</span>
            </li>
            <li className="pb-2 border-b border-input-bg">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  Taxa de Venda EUA <Pill>{formatPercent(combinedTax, 2)}</Pill>
                </span>
                <span className="font-bold tabular-nums">{formatBRL(audit.stateTaxBRL)}</span>
              </div>
              {stateInfo.avgLocalTax > 0 && (
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-input-bg space-y-0.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Estadual <span className="opacity-70">({formatPercent(stateInfo.stateTax, 2)})</span></span>
                    <span className="tabular-nums">{formatBRL(stateOnlyBRL)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Média Municipal <span className="opacity-70">({formatPercent(stateInfo.avgLocalTax, 2)})</span></span>
                    <span className="tabular-nums">{formatBRL(localBRL)}</span>
                  </div>
                </div>
              )}
            </li>
            <li className="flex justify-between items-center pb-2 border-b border-input-bg">
              <span className="text-muted-foreground flex items-center gap-2">
                IOF <Pill>{formatPercent(audit.iofRate, 2)}</Pill>
              </span>
              {audit.iofBRL > 0 ? (
                <span className="font-bold tabular-nums">{formatBRL(audit.iofBRL)}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                Spread <Pill>{formatPercent(row.spread, 2)}</Pill>
              </span>
              {hasSpread ? (
                <span className="font-bold tabular-nums">{formatBRL(audit.spreadBRL)}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center bg-background rounded-2xl p-6">
          <DonutChart productPct={productPct} />
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Produto ({(productPct * 100).toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary-light" />
              <span>Taxas ({(taxesPct * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-2xl p-5 border border-border space-y-3">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Info className="h-3.5 w-3.5" /> Transparência das Taxas
          </h3>
          <dl className="text-xs text-muted-foreground space-y-2 leading-relaxed">
            <div>
              <dt className="font-semibold text-foreground">Taxa de Venda (EUA)</dt>
              <dd>
                Soma da alíquota estadual com a média municipal/condado
                (Avg. Local Sales Tax). Em estados como Alasca, Delaware, Montana,
                New Hampshire e Oregon não há imposto estadual, mas pode haver
                taxa local.
              </dd>
              {stateTaxMeta && (
                <dd className="text-[11px] mt-1">
                  Tabela oficial:{" "}
                  {new Date(stateTaxMeta.last_update + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}atualizado em {stateTaxMeta.updated_at}
                </dd>
              )}
            </div>
            <div>
              <dt className="font-semibold text-foreground">IOF</dt>
              <dd>
                Imposto federal sobre operações internacionais. Desde 2025, padronizado em
                3,5% para cartão de crédito, contas globais e câmbio em espécie. Algumas
                instituições oferecem IOF reduzido ou subsidiado (ex.: Nubank Ultravioleta,
                AstroPay, BTG).
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Spread</dt>
              <dd>
                Margem cobrada pela instituição sobre o câmbio oficial (PTAX). Varia conforme
                conta global ou cartão escolhido.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">VET — Câmbio da moeda</dt>
              <dd className="tabular-nums">
                R$ {vetPerUSD.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} por US$ 1,00
              </dd>
              <dd className="text-[11px] mt-1">
                Valor Efetivo de Turismo: PTAX + spread + IOF. É o custo real
                por dólar de moeda, comparável ao VET exibido por casas de
                câmbio e cartões.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Custo efetivo por dólar de produto</dt>
              <dd className="tabular-nums">
                R$ {audit.effectiveExchangeRate.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} por US$ 1,00
              </dd>
              <dd className="text-[11px] mt-1">
                Inclui também a taxa de venda do estado americano diluída no
                preço. Útil para comparar o custo total da compra, não só do câmbio.
              </dd>
            </div>
            {ptax && (
              <div>
                <dt className="font-semibold text-foreground">Cotação PTAX</dt>
                <dd className="tabular-nums">
                  R$ {ptax.rate.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} — {new Date(ptax.date + "T00:00:00").toLocaleDateString("pt-BR")}
                </dd>
                <dd className="text-[11px] mt-1">
                  Fonte: BCB Olinda · sincronizado em {ptax.fetchedAt}
                </dd>
              </div>
            )}
            {row.method === "cash" && (
              <div>
                <dt className="font-semibold text-foreground">Dólar turismo</dt>
                <dd>
                  Compra em espécie usa o dólar turismo, estimado como PTAX +
                  spread médio de casas de câmbio ({formatPercent(row.spread, 2)}).
                  O valor exato varia por casa de câmbio e cidade.
                </dd>
              </div>
            )}
            {banksMeta && (
              <div>
                <dt className="font-semibold text-foreground">Spread &amp; IOF por instituição</dt>
                <dd className="text-[11px]">
                  Fonte: melhoresdestinos.com.br · atualizado em {banksMeta.last_update}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
