import { ChevronDown } from "lucide-react";
import { accounts, banks, METHOD_LABEL, type PaymentMethod } from "@/lib/catalog";
import { InstitutionChecklist } from "./InstitutionChecklist";

interface PaymentSectionProps {
  // single mode
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  accountCode: string;
  onAccountChange: (code: string) => void;
  bankCode: string;
  onBankChange: (code: string) => void;
  // compare mode
  compareMode: boolean;
  onCompareModeChange: (v: boolean) => void;
  selectedMethods: PaymentMethod[];
  onSelectedMethodsChange: (m: PaymentMethod[]) => void;
  selectedAccounts: string[];
  onSelectedAccountsChange: (codes: string[]) => void;
  selectedBanks: string[];
  onSelectedBanksChange: (codes: string[]) => void;
}

const METHOD_OPTIONS = (Object.keys(METHOD_LABEL) as PaymentMethod[]).map((value) => ({
  value,
  label: METHOD_LABEL[value],
}));

const sortByName = <T extends { name: string }>(arr: T[]) =>
  arr.slice().sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

const sortedAccounts = sortByName(accounts);
const sortedBanks = sortByName(banks);

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function PaymentSection({
  method,
  onMethodChange,
  accountCode,
  onAccountChange,
  bankCode,
  onBankChange,
  compareMode,
  onCompareModeChange,
  selectedMethods,
  onSelectedMethodsChange,
  selectedAccounts,
  onSelectedAccountsChange,
  selectedBanks,
  onSelectedBanksChange,
}: PaymentSectionProps) {
  const isCredit = method === "credit";
  const isGlobal = method === "global";

  const compareGlobal = selectedMethods.includes("global");
  const compareCredit = selectedMethods.includes("credit");

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-warm space-y-6">
      {/* Compare mode toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Modo Comparar
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-[15rem]">
            Compare vários métodos e cartões de uma vez.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={compareMode}
          onClick={() => onCompareModeChange(!compareMode)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            compareMode ? "bg-primary" : "bg-input-bg"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-card rounded-full shadow transition-transform ${
              compareMode ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {!compareMode && (
        <>
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
                  {sortedAccounts.map((a) => (
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
                  {sortedBanks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-hidden />
              </div>
            </div>
          )}
        </>
      )}

      {compareMode && (
        <>
          <fieldset>
            <legend className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Métodos para comparar
            </legend>
            <div className="grid grid-cols-1 gap-2">
              {METHOD_OPTIONS.map((opt) => {
                const checked = selectedMethods.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                      checked
                        ? "bg-secondary-light/40 border-secondary"
                        : "bg-input-bg border-transparent hover:border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        onSelectedMethodsChange(toggleInArray(selectedMethods, opt.value))
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {compareGlobal && (
            <InstitutionChecklist
              legend="Contas Internacionais"
              selectedCount={selectedAccounts.length}
              items={sortedAccounts}
              selected={selectedAccounts}
              onChange={onSelectedAccountsChange}
            />
          )}

          {compareCredit && (
            <InstitutionChecklist
              legend="Cartões de Crédito"
              selectedCount={selectedBanks.length}
              items={sortedBanks}
              selected={selectedBanks}
              onChange={onSelectedBanksChange}
            />
          )}
        </>
      )}
    </div>
  );
}
