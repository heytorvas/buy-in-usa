import { useEffect, useMemo, useState } from "react";
import { PriceInput } from "@/components/calculator/PriceInput";
import { StateSelect, states, stateTaxMeta } from "@/components/calculator/StateSelect";
import {
  PaymentSection,
  accounts,
  banks,
  banksMeta,
  cashConfig,
} from "@/components/calculator/PaymentSection";
import { ResultCard } from "@/components/calculator/ResultCard";
import { CompareResults } from "@/components/calculator/CompareResults";
import { StepHeader } from "@/components/calculator/StepHeader";
import { calculate, type PaymentMethod } from "@/lib/calculator";
import { ptax } from "@/lib/ptax";

const Index = () => {
  const [priceStr, setPriceStr] = useState("");
  const [stateCode, setStateCode] = useState("FL");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [accountCode, setAccountCode] = useState(accounts[0].code);
  const [bankCode, setBankCode] = useState(banks[0].code);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([
    "cash",
    "global",
    "credit",
  ]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    accounts.map((a) => a.code),
  );
  const [selectedBanks, setSelectedBanks] = useState<string[]>(
    banks.map((b) => b.code),
  );

  // Reset calculated result whenever any input changes — user must
  // re-trigger the calculation explicitly via the button.
  useEffect(() => {
    setHasCalculated(false);
  }, [
    priceStr,
    stateCode,
    method,
    bankCode,
    accountCode,
    compareMode,
    selectedMethods,
    selectedAccounts,
    selectedBanks,
  ]);

  const stateInfo = useMemo(
    () => states.find((s) => s.code === stateCode) ?? states[0],
    [stateCode],
  );
  const accountInfo = useMemo(
    () => accounts.find((a) => a.code === accountCode) ?? accounts[0],
    [accountCode],
  );
  const bankInfo = useMemo(
    () => banks.find((b) => b.code === bankCode) ?? banks[0],
    [bankCode],
  );

  const priceUSD = parseFloat(priceStr.replace(",", ".")) || 0;

  // Resolve spread + IOF based on selected payment method
  const { spread, iofRate, institutionLabel } = useMemo(() => {
    if (method === "credit") {
      return { spread: bankInfo.spread, iofRate: bankInfo.iof, institutionLabel: bankInfo.name };
    }
    if (method === "global") {
      return { spread: accountInfo.spread, iofRate: accountInfo.iof, institutionLabel: accountInfo.name };
    }
    // cash — apply tourism dollar spread on top of PTAX, with reduced IOF.
    return { spread: cashConfig.spread, iofRate: cashConfig.iof, institutionLabel: cashConfig.name };
  }, [method, bankInfo, accountInfo]);

  const result = useMemo(() => {
    return calculate({
      priceUSD,
      stateTax: stateInfo.combinedTax, // state + average local
      ptax: ptax.rate,
      paymentMethod: method,
      spread,
      iofRate,
    });
  }, [priceUSD, stateInfo, method, spread, iofRate]);

  const showResult = hasCalculated && result && priceUSD > 0;

  const handleCalculate = () => {
    setHasCalculated(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .getElementById("resultado")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
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

        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <StepHeader number={1} title="Preço do Produto" />
            <PriceInput value={priceStr} onChange={setPriceStr} />
          </section>

          <section className="flex flex-col gap-4">
            <StepHeader number={2} title="Localização" />
            <StateSelect value={stateCode} onChange={setStateCode} />
          </section>

          <section className="flex flex-col gap-4">
            <StepHeader number={3} title="Pagamento" />
            <PaymentSection
              method={method}
              onMethodChange={setMethod}
              accountCode={accountCode}
              onAccountChange={setAccountCode}
              bankCode={bankCode}
              onBankChange={setBankCode}
              compareMode={compareMode}
              onCompareModeChange={setCompareMode}
              selectedMethods={selectedMethods}
              onSelectedMethodsChange={setSelectedMethods}
              selectedAccounts={selectedAccounts}
              onSelectedAccountsChange={setSelectedAccounts}
              selectedBanks={selectedBanks}
              onSelectedBanksChange={setSelectedBanks}
            />
          </section>

          <button
            type="button"
            onClick={handleCalculate}
            disabled={priceUSD <= 0}
            className="w-full bg-primary hover:bg-primary-deep text-primary-foreground font-bold text-lg py-5 rounded-2xl shadow-warm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Calcular Total
          </button>

          {showResult && result && (
            <section id="resultado" className="flex flex-col gap-4 mt-4 scroll-mt-6">
              <StepHeader
                number={4}
                title={compareMode ? "Comparativo" : "Resultado Final"}
                variant="sage"
              />
              {compareMode ? (
                <CompareResults
                  priceUSD={priceUSD}
                  stateInfo={stateInfo}
                  ptax={ptax}
                  selectedMethods={selectedMethods}
                  selectedAccounts={selectedAccounts}
                  selectedBanks={selectedBanks}
                />
              ) : (
                <ResultCard
                  result={result}
                  priceUSD={priceUSD}
                  stateInfo={stateInfo}
                  spreadRate={spread}
                  institutionLabel={institutionLabel}
                  method={method}
                  ptax={ptax}
                  stateTaxMeta={stateTaxMeta}
                  banksMeta={banksMeta}
                />
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
