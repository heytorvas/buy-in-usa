import { MapPin, ChevronDown } from "lucide-react";
import { states } from "@/lib/catalog";

interface StateSelectProps {
  value: string;
  onChange: (code: string) => void;
}

export function StateSelect({ value, onChange }: StateSelectProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-warm">
      <label
        htmlFor="state-select"
        className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider"
      >
        Estado nos EUA
      </label>
      <div className="relative">
        <select
          id="state-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-input-bg border-none rounded-xl py-4 pl-12 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-secondary appearance-none font-medium cursor-pointer"
        >
          {states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" aria-hidden />
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" aria-hidden />
      </div>
    </div>
  );
}
