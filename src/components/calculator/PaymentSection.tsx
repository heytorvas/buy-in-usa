import { ChevronDown } from "lucide-react";
import banksRaw from "@/data/banks_spread.json";
import { formatPercent, type PaymentMethod } from "@/lib/calculator";

export interface Bank {
  code: string;
  name: string;
  spread: number;
}

const banks = banksRaw as Bank[];

interface PaymentSectionProps {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  bankCode: string;
  onBankChange: (code: string) => void;
}

export function PaymentSection({ method, onMethodChange, bankCode, onBankChange }: PaymentSectionProps) {
  const isCredit = method === "credit";
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-warm space-y-6">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Método de Pagamento
        </label>
        <div className="flex bg-input-bg rounded-xl p-1" role="tablist" aria-label="Método de pagamento">
          <button
            type="button"
            role="tab"
            aria-selected={!isCredit}
            onClick={() => onMethodChange("cash")}
            className={`flex-1 py-3 text-center rounded-lg text-sm transition-all ${
              !isCredit
                ? "bg-card shadow-sm font-bold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground"
            }`}
          >
            Dinheiro / Wise
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isCredit}
            onClick={() => onMethodChange("credit")}
            className={`flex-1 py-3 text-center rounded-lg text-sm transition-all ${
              isCredit
                ? "bg-card shadow-sm font-bold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground"
            }`}
          >
            Cartão de Crédito
          </button>
        </div>
      </div>

      <div className={isCredit ? "" : "opacity-40 pointer-events-none"}>
        <label
          htmlFor="bank-select"
          className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider"
        >
          Seu Banco Brasileiro (Spread)
        </label>
        <div className="relative">
          <select
            id="bank-select"
            value={bankCode}
            onChange={(e) => onBankChange(e.target.value)}
            disabled={!isCredit}
            className="w-full bg-input-bg border-none rounded-xl p-4 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary appearance-none font-medium cursor-pointer disabled:cursor-not-allowed"
          >
            {banks.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name} ({formatPercent(b.spread, 1)})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export { banks };
