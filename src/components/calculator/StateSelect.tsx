import { MapPin, ChevronDown } from "lucide-react";
import statesRaw from "@/data/usa_state_tax.json";

export interface UsState {
  code: string;
  name: string;
  tax: number;
}

export interface StateTaxMeta {
  last_update: string;
  updated_at: string;
}

interface StateTaxFile {
  states: Record<string, string>;
  last_update: string;
  updated_at: string;
}

const file = statesRaw as StateTaxFile;

// Build a stable list of states with codes derived from name initials.
// Uses well-known 2-letter postal codes for ordering/keying.
const POSTAL_CODES: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR",
  California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID",
  Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS",
  Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT",
  Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV",
  Wisconsin: "WI", Wyoming: "WY", "District of Columbia": "DC",
};

const states: UsState[] = Object.entries(file.states)
  .map(([name, pct]) => ({
    code: POSTAL_CODES[name] ?? name.slice(0, 2).toUpperCase(),
    name,
    tax: parseFloat(pct) / 100,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const stateTaxMeta: StateTaxMeta = {
  last_update: file.last_update,
  updated_at: file.updated_at,
};

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

export { states, stateTaxMeta };
