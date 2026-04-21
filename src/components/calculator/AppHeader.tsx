import { Calculator, Settings, RefreshCw } from "lucide-react";
import type { PtaxResult } from "@/lib/ptax";

interface AppHeaderProps {
  ptax?: PtaxResult;
  loading?: boolean;
}

export function AppHeader({ ptax, loading }: AppHeaderProps) {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <Calculator className="text-primary h-6 w-6" />
          <span className="text-primary font-black text-xl tracking-tight">
            ShopCompare USA/BR
          </span>
        </div>
        <button
          type="button"
          className="text-muted-foreground p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Configurações"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 pb-2 max-w-2xl mx-auto">
        <PtaxBadge ptax={ptax} loading={loading} />
      </div>
    </header>
  );
}

function PtaxBadge({ ptax, loading }: AppHeaderProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
        <RefreshCw className="h-3 w-3 animate-spin" />
        <span>Buscando cotação PTAX…</span>
      </div>
    );
  }
  if (!ptax) return null;

  const formatted = `R$ ${ptax.rate.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  const dateLabel = new Date(ptax.date + "T00:00:00").toLocaleDateString("pt-BR");
  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
      <RefreshCw className="h-3 w-3" />
      <span>
        PTAX {dateLabel} — USD: {formatted}
        {ptax.fallback && " (cotação de referência)"}
      </span>
    </div>
  );
}
