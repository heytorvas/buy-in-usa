import { CalculationResult, formatBRL, formatUSD, formatPercent } from "@/lib/calculator";
import { DonutChart } from "./DonutChart";
import { Info } from "lucide-react";

interface ResultCardProps {
  result: CalculationResult;
  priceUSD: number;
  stateTaxRate: number;
  spreadRate: number;
  isCredit: boolean;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] bg-secondary-light/60 text-secondary px-2 py-0.5 rounded-full font-bold">
      {children}
    </span>
  );
}

export function ResultCard({ result, priceUSD, stateTaxRate, spreadRate, isCredit }: ResultCardProps) {
  const { finalBRL, audit } = result;
  const taxesBRL = audit.stateTaxBRL + audit.spreadBRL + audit.iofBRL;
  const totalForChart = audit.basePriceBRL + taxesBRL;
  const productPct = totalForChart > 0 ? audit.basePriceBRL / totalForChart : 0;
  const taxesPct = 1 - productPct;

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
      <span className="text-sm text-muted-foreground mb-8">
        ≈ {formatUSD(priceUSD)} USD (Custo Efetivo Total)
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
                IOF <Pill>{formatPercent(audit.iofRate, 1)}</Pill>
              </span>
              <span className="font-bold tabular-nums">{formatBRL(audit.iofBRL)}</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                Spread Bancário <Pill>{formatPercent(isCredit ? spreadRate : 0, 1)}</Pill>
              </span>
              {isCredit && audit.spreadBRL > 0 ? (
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
            </div>
            <div>
              <dt className="font-semibold text-foreground">IOF</dt>
              <dd>Imposto federal sobre operações internacionais — 1,1% para dinheiro/conta global, 3,5% para cartão de crédito.</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Spread Bancário</dt>
              <dd>Margem cobrada pelo banco brasileiro sobre o câmbio oficial (PTAX). Aplicado apenas em compras no cartão.</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Câmbio Efetivo</dt>
              <dd className="tabular-nums">
                R$ {audit.effectiveExchangeRate.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} por US$ 1,00
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
