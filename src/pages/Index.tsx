import { useMemo, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { PriceInput } from "@/components/calculator/PriceInput";
import { StateSelect } from "@/components/calculator/StateSelect";
import { PaymentSection } from "@/components/calculator/PaymentSection";
import { ResultCard } from "@/components/calculator/ResultCard";
import { CompareResults } from "@/components/calculator/CompareResults";
import { StepHeader } from "@/components/calculator/StepHeader";
import { banksMeta, states, stateTaxMeta } from "@/lib/catalog";
import { ptax } from "@/lib/ptax";
import { buildScenarios } from "@/lib/scenarios";
import {
  defaultSelection,
  parsePriceUsd,
  selectionsEqual,
  type CalculatorSelection,
} from "@/lib/selection";

const Index = () => {
  const [selection, setSelection] = useState<CalculatorSelection>(defaultSelection);
  const [submitted, setSubmitted] = useState<CalculatorSelection | null>(null);

  const update = (patch: Partial<CalculatorSelection>) => {
    const next = { ...selection, ...patch };
    setSelection(next);
    setSubmitted((current) =>
      current && selectionsEqual(next, current) ? current : null,
    );
  };

  const priceUSD = parsePriceUsd(selection.priceStr);
  const showResult = submitted !== null && selectionsEqual(selection, submitted);

  const rows = useMemo(
    () => (showResult && submitted ? buildScenarios(submitted, ptax.rate) : []),
    [showResult, submitted],
  );

  const submittedState = useMemo(() => {
    if (!submitted) return null;
    const stateInfo = states.find((s) => s.code === submitted.stateCode);
    if (!stateInfo) {
      throw new Error(`Unknown state code: ${submitted.stateCode}`);
    }
    return stateInfo;
  }, [submitted]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (parsePriceUsd(selection.priceStr) <= 0) return;
    flushSync(() => {
      setSubmitted({ ...selection });
    });
    const resultadoEl = document.getElementById("resultado");
    resultadoEl?.focus();
    resultadoEl?.scrollIntoView?.({ block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main
        id="conteudo-principal"
        className="flex-grow w-full max-w-2xl mx-auto px-6 py-8 pb-12"
        aria-labelledby="titulo-calculadora"
      >
        <header className="mb-10 text-center">
          <h1
            id="titulo-calculadora"
            className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight"
          >
            EUA x Brasil:<br className="md:hidden" /> Calculadora de Compras
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Compare o custo real entre pagamento em dinheiro, conta internacional e cartão de crédito internacional.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <StepHeader number={1} title="Preço do Produto" />
            <PriceInput
              value={selection.priceStr}
              onChange={(priceStr) => update({ priceStr })}
            />
          </section>

          <section className="flex flex-col gap-4">
            <StepHeader number={2} title="Localização" />
            <StateSelect
              value={selection.stateCode}
              onChange={(stateCode) => update({ stateCode })}
            />
          </section>

          <section className="flex flex-col gap-4">
            <StepHeader number={3} title="Pagamento" />
            <PaymentSection
              method={selection.method}
              onMethodChange={(method) => update({ method })}
              accountCode={selection.accountCode}
              onAccountChange={(accountCode) => update({ accountCode })}
              bankCode={selection.bankCode}
              onBankChange={(bankCode) => update({ bankCode })}
              compareMode={selection.compareMode}
              onCompareModeChange={(compareMode) => update({ compareMode })}
              selectedMethods={selection.selectedMethods}
              onSelectedMethodsChange={(selectedMethods) => update({ selectedMethods })}
              selectedAccounts={selection.selectedAccounts}
              onSelectedAccountsChange={(selectedAccounts) => update({ selectedAccounts })}
              selectedBanks={selection.selectedBanks}
              onSelectedBanksChange={(selectedBanks) => update({ selectedBanks })}
            />
          </section>

          <button
            type="submit"
            disabled={priceUSD <= 0}
            className="w-full bg-primary hover:bg-primary-deep text-primary-foreground font-bold text-lg py-5 rounded-2xl shadow-warm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Calcular Total
          </button>
        </form>

        {showResult && submitted && (
          <section
            id="resultado"
            tabIndex={-1}
            aria-live="polite"
            className="flex flex-col gap-4 mt-4 scroll-mt-6"
          >
              <StepHeader
                number={4}
                title={submitted.compareMode ? "Comparativo" : "Resultado Final"}
                variant="sage"
              />
              {submitted.compareMode ? (
                <CompareResults rows={rows} />
              ) : (
                rows[0] && submittedState && (
                  <ResultCard
                    row={rows[0]}
                    priceUSD={parsePriceUsd(submitted.priceStr)}
                    stateInfo={submittedState}
                    ptax={ptax}
                    stateTaxMeta={stateTaxMeta}
                    banksMeta={banksMeta}
                  />
                )
              )}
            </section>
        )}
      </main>
    </div>
  );
};

export default Index;
