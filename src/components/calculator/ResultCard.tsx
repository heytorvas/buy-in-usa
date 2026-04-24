import { CalculationResult, formatBRL, formatUSD, formatPercent, type PaymentMethod } from "@/lib/calculator";
import type { PtaxResult } from "@/lib/ptax";
import type { StateTaxMeta } from "./StateSelect";
import { DonutChart } from "./DonutChart";
import { Info } from "lucide-react";

interface BanksMeta {
  source: string;
  last_update: string;
}

interface ResultCardProps {
  result: CalculationResult;
  priceUSD: number;
  stateTaxRate: number;
  spreadRate: number;
  institutionLabel: string;
  method: PaymentMethod;
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

const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Dinheiro / espécie",
  global: "Conta internacional",
  credit: "Cartão de crédito",
};

export function ResultCard({
  result,
  priceUSD,
  stateTaxRate,
  spreadRate,
  institutionLabel,
  method,
  ptax,
  stateTaxMeta,
  banksMeta,
}: ResultCardProps) {
  const { finalBRL, audit } = result;
  const taxesBRL = audit.stateTaxBRL + audit.spreadBRL + audit.iofBRL;
  const totalForChart = audit.basePriceBRL + taxesBRL;
  const productPct = totalForChart > 0 ? audit.basePriceBRL / totalForChart : 0;
  const taxesPct = 1 - productPct;
  const hasSpread = spreadRate > 0;

  return (
    <div className="bg-card rounded-3xl p-8 border border-border shadow-warm flex flex-col items-center animate-fade-in">
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
        {METHOD_LABEL[method]} · {institutionLabel}
      </span>

      <div className="w-full border-t border-border pt-8 space-y-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Detalhamento</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between items-center pb-2 border-b border-input-bg">
              <span className="text-muted-foreground">Preço Base</span>
              <span className="font-bold tabular-nums">{formatBRL(audit.basePriceBRL)}</span>
            </li>
            <li className="flex justify-between items-center pb-2 border-b border-input-bg">
              <span className="text-muted-foreground flex items-center gap-2">
                Taxa de Venda EUA <Pill>{formatPercent(stateTaxRate, 2)}</Pill>
              </span>
              <span className="font-bold tabular-nums">{formatBRL(audit.stateTaxBRL)}</span>
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
                Spread <Pill>{formatPercent(spreadRate, 2)}</Pill>
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
              <dd>Imposto estadual aplicado no momento da compra nos Estados Unidos.</dd>
              {stateTaxMeta && (
                <dd className="text-[11px] mt-1">
                  Tabela oficial: <span className="capitalize">{stateTaxMeta.last_update}</span>
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
              <dt className="font-semibold text-foreground">Câmbio Efetivo</dt>
              <dd className="tabular-nums">
                R$ {audit.effectiveExchangeRate.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} por US$ 1,00
              </dd>
            </div>
            {ptax && (
              <div>
                <dt className="font-semibold text-foreground">Cotação PTAX</dt>
                <dd className="tabular-nums">
                  R$ {ptax.rate.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} — {new Date(ptax.date + "T00:00:00").toLocaleDateString("pt-BR")}
                  {ptax.fallback && " (cotação de referência)"}
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
