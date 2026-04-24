import { ChevronDown } from "lucide-react";
import banksRaw from "@/data/banks_spread.json";
import { type PaymentMethod } from "@/lib/calculator";

export interface Institution {
  code: string;
  name: string;
  spread: number;
  iof: number;
}

interface BanksFile {
  source: string;
  last_update: string;
  cash: Institution & { note?: string };
  accounts: Institution[];
  banks: Institution[];
}

const data = banksRaw as BanksFile;
const accounts = data.accounts;
const banks = data.banks;
const cashConfig = data.cash;
const banksMeta = { source: data.source, last_update: data.last_update };

interface PaymentSectionProps {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  accountCode: string;
  onAccountChange: (code: string) => void;
  bankCode: string;
  onBankChange: (code: string) => void;
}

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Dinheiro" },
  { value: "global", label: "Conta Internacional" },
  { value: "credit", label: "Cartão de Crédito" },
];

export function PaymentSection({
  method,
  onMethodChange,
  accountCode,
  onAccountChange,
  bankCode,
  onBankChange,
}: PaymentSectionProps) {
  const isCredit = method === "credit";
  const isGlobal = method === "global";

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-warm space-y-6">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Método de Pagamento
        </label>
        <div className="flex bg-input-bg rounded-xl p-1 gap-1" role="tablist" aria-label="Método de pagamento">
          {METHOD_OPTIONS.map((opt) => {
            const selected = method === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onMethodChange(opt.value)}
                className={`flex-1 py-3 px-2 text-center rounded-lg text-xs leading-tight transition-all ${
                  selected
                    ? "bg-card shadow-sm font-bold text-primary"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {isGlobal && (
        <div>
          <label
            htmlFor="account-select"
            className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider"
          >
            Sua Conta Internacional
          </label>
          <div className="relative">
            <select
              id="account-select"
              value={accountCode}
              onChange={(e) => onAccountChange(e.target.value)}
              className="w-full bg-input-bg border-none rounded-xl p-4 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary appearance-none font-medium cursor-pointer"
            >
              {accounts.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-hidden />
          </div>
        </div>
      )}

      {isCredit && (
        <div>
          <label
            htmlFor="bank-select"
            className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider"
          >
            Seu Banco Brasileiro
          </label>
          <div className="relative">
            <select
              id="bank-select"
              value={bankCode}
              onChange={(e) => onBankChange(e.target.value)}
              className="w-full bg-input-bg border-none rounded-xl p-4 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary appearance-none font-medium cursor-pointer"
            >
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-hidden />
          </div>
        </div>
      )}
    </div>
  );
}

export { accounts, banks, banksMeta, cashConfig };
