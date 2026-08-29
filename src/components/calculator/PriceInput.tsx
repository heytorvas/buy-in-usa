import { DollarSign } from "lucide-react";

interface PriceInputProps {
  value: string;
  onChange: (v: string) => void;
}

export function PriceInput({ value, onChange }: PriceInputProps) {
  return (
    <div className="bg-input-bg rounded-2xl p-6 border border-border shadow-warm">
      <label
        htmlFor="price-usd"
        className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider"
      >
        Preço do Produto (USD)
      </label>
      <div className="relative flex items-center">
        <DollarSign className="text-muted-foreground absolute left-0 h-6 w-6" aria-hidden />
        <input
          id="price-usd"
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          pattern="[0-9]+([.,][0-9]+)?"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none p-0 text-right text-4xl font-semibold text-foreground focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
          aria-label="Preço do produto em dólares americanos"
        />
      </div>
    </div>
  );
}
