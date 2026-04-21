import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/calculator/AppHeader";
import { BottomNav } from "@/components/calculator/BottomNav";
import { PriceInput } from "@/components/calculator/PriceInput";
import { StateSelect, states } from "@/components/calculator/StateSelect";
import { PaymentSection, banks } from "@/components/calculator/PaymentSection";
import { ResultCard } from "@/components/calculator/ResultCard";
import { StepHeader } from "@/components/calculator/StepHeader";
import { calculate, type PaymentMethod } from "@/lib/calculator";
import { fetchLatestPtax, type PtaxResult } from "@/lib/ptax";

const Index = () => {
  const [priceStr, setPriceStr] = useState("");
  const [stateCode, setStateCode] = useState("FL");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [bankCode, setBankCode] = useState("ITAU");
  const [ptax, setPtax] = useState<PtaxResult | undefined>();
  const [loading, setLoading] = useState(true);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchLatestPtax()
      .then((r) => alive && setPtax(r))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const stateInfo = useMemo(
    () => states.find((s) => s.code === stateCode) ?? states[0],
    [stateCode],
  );
  const bankInfo = useMemo(
    () => banks.find((b) => b.code === bankCode) ?? banks[0],
    [bankCode],
  );

  const priceUSD = parseFloat(priceStr.replace(",", ".")) || 0;

  const result = useMemo(() => {
    if (!ptax) return null;
    return calculate({
      priceUSD,
      stateTax: stateInfo.tax,
      ptax: ptax.rate,
      paymentMethod: method,
      bankSpread: bankInfo.spread,
    });
  }, [priceUSD, stateInfo, ptax, method, bankInfo]);

  const showResult = hasCalculated && result && priceUSD > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AppHeader ptax={ptax} loading={loading} />

      <main className="flex-grow w-full max-w-2xl mx-auto px-6 py-8 pb-32">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
            EUA x Brasil:<br className="md:hidden" /> Calculadora de Compras
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Compare o custo real entre pagamento em dinheiro/Wise e cartão de crédito internacional.
          </p>
        </div>

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
              bankCode={bankCode}
              onBankChange={setBankCode}
            />
          </section>

          <button
            type="button"
            onClick={() => setHasCalculated(true)}
            disabled={priceUSD <= 0 || !ptax}
            className="w-full bg-primary hover:bg-primary-deep text-primary-foreground font-bold text-lg py-5 rounded-2xl shadow-warm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Calcular Total
          </button>

          {showResult && result && (
            <section className="flex flex-col gap-4 mt-4">
              <StepHeader number={4} title="Resultado Final" variant="sage" />
              <ResultCard
                result={result}
                priceUSD={priceUSD}
                stateTaxRate={stateInfo.tax}
                spreadRate={bankInfo.spread}
                isCredit={method === "credit"}
              />
            </section>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
