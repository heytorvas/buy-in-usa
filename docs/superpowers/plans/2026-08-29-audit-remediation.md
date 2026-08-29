# Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate the main-branch audit (items 1–6) while keeping today’s calculator UI: one scenario model, validated catalogs, shareable query string, a11y/SEO/agentic fixes, no dead shell.

**Architecture:** `src/lib` owns catalogs, PTAX, `calculate`, `buildScenarios`, and URL state. The page holds a selection plus a last-submitted snapshot. UI never parses JSON. `main.tsx` mounts the calculator or a one-line load error. Vite emits `/data/*.json` and sitemap `lastmod` from `src/data`.

**Tech Stack:** Vite 8, React 18, TypeScript 5.9, Tailwind 3, Vitest, React Testing Library, jsdom. No React Router. No React Query. No toast libraries.

**Spec:** `docs/superpowers/specs/2026-08-29-audit-remediation-design.md`

## Global Constraints

- Visual UI stays: compare toggle, single tabs+selects, compare checklists, Calcular, ResultCard vs ranked list.
- Portuguese copy only. Error line: `Não foi possível carregar os dados da calculadora.`
- Query keys: `p`, `st`, `cmp`, `m`, `acc`, `bk`, `ms`, `accs`, `bks`. Invalid field → that field’s empty-URL default. No error banner.
- Empty URL defaults: `stateCode=FL`, `method=cash`, first catalog account, first catalog bank, `compareMode=false`, empty compare lists, `priceStr=""`.
- Results only when current selection equals last submitted snapshot. URL never submits.
- `history.replaceState` on every form change. No `popstate`. Back leaves the site.
- `calculate({ priceUSD, stateTax, avgLocalTax, ptax, spread, iofRate })` only. Combined tax = `stateTax + avgLocalTax`.
- PTAX `rate` finite and `> 0`. Tax / IOF / spread finite and `>= 0`. Missing postal code is a throw.
- OG copy: title `EUA x Brasil`; tagline `Compare o custo real de compras nos EUA em reais`.
- No scraper workflow changes. No `public/404.html`. No IOF/spread/tax number edits. No visual redesign.
- Closed loop: a task is not done until `npx vitest run` and `npx eslint .` both exit 0. Then one conventional commit. Do not skip hooks (`--no-verify`).
- After Task 11, also `npx tsc -p tsconfig.app.json --noEmit` must exit 0.
- After Task 12, also `npx vite build` must exit 0.
- Conventional commits: `chore` tooling, `refactor` structure, `feat` user-visible, `test` tests-only, `docs` docs, `perf` fonts/payload. Imperative, why-focused, 1–2 sentences.

## File map

| Path | Responsibility |
|------|----------------|
| `src/lib/calculator.ts` | Pure math + formatters |
| `src/lib/catalog.ts` | Institutions, states, `PaymentMethod`, `METHOD_LABEL` |
| `src/lib/ptax.ts` | Validated PTAX singleton |
| `src/lib/scenarios.ts` | Selection → ranked `ScenarioRow[]` |
| `src/lib/url-state.ts` | Query parse/serialize |
| `src/lib/selection.ts` | `CalculatorSelection`, snapshot equality, price parse |
| `src/vite-plugin-calculator-assets.ts` | Dev `/data/*` + build emit + sitemap `lastmod` |
| `src/pages/Index.tsx` | Page orchestration |
| `src/components/calculator/*` | Presentational controls |
| `src/main.tsx` | Mount or load-error |
| `src/test/setup.ts` | RTL + jest-dom |
| `src/lib/*.test.ts` | Unit tests |
| `src/pages/Index.test.tsx` | Form / URL / result attributes |

Delete by Task 2: `src/App.tsx`, `src/App.css`, `src/pages/NotFound.tsx`, `src/hooks/use-toast.ts`, `src/components/ui/**`, `src/lib/utils.ts`.

Delete by Task 12: `components.json`, `public/placeholder.svg`.

---

### Task 1: Test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/lib/calculator.test.ts`
- Modify: `package.json` (devDependencies + `test` / `test:watch`)
- Modify: `tsconfig.app.json` (`types` include `vitest/globals` only if used; prefer explicit imports)
- Modify: `eslint.config.js` (ignore `dist`, keep linting `src`)

**Interfaces:**
- Consumes: existing `formatBRL` in `src/lib/calculator.ts`
- Produces: `npm test` → `npx vitest run`; `npm run test:watch` → `npx vitest`

- [ ] **Step 1: Add the first test (current `formatBRL`)**

```ts
import { describe, expect, it } from "vitest";
import { formatBRL } from "./calculator";

describe("formatBRL", () => {
  it("formats a finite number in pt-BR", () => {
    expect(formatBRL(10)).toMatch(/R\$\s*10,00/);
  });

  it("treats non-finite as zero", () => {
    expect(formatBRL(Number.NaN)).toMatch(/R\$\s*0,00/);
  });
});
```

- [ ] **Step 2: Run the test and confirm it cannot run (vitest missing)**

Run: `npx vitest run src/lib/calculator.test.ts`  
Expected: fail with missing `vitest` (or config).

- [ ] **Step 3: Install and configure**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

`vitest.config.ts`:

```ts
import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: false,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

`src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Do not add unused `globals: true` helpers. Do not add coverage tooling.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS (2 tests).  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json bun.lockb vitest.config.ts src/test/setup.ts src/lib/calculator.test.ts
git commit -m "$(cat <<'EOF'
chore: add Vitest and Testing Library

Give each later task a closed test loop without waiting for an end-of-project test dump.
EOF
)"
```

Stage only the lockfile that exists (`package-lock.json` or `bun.lockb`, not both if one is unused).

---

### Task 2: Delete the dead shell

**Files:**
- Delete: `src/App.tsx`, `src/App.css`, `src/pages/NotFound.tsx`, `src/hooks/use-toast.ts`, `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`, `src/components/ui/sonner.tsx`, `src/components/ui/tooltip.tsx`, `src/lib/utils.ts`
- Modify: `src/main.tsx`
- Modify: `package.json` (remove unused runtime deps; move `cheerio` to `devDependencies`)
- Create: `src/pages/Index.test.tsx`

**Interfaces:**
- Consumes: `src/pages/Index.tsx` default export
- Produces: `main.tsx` renders `<Index />` inside a try/catch that, on throw, renders the Portuguese load-error line. Try/catch around `createRoot` is not enough for module-init throws — those happen on `import`. For this task, mount Index directly. Load-error for catalog/ptax is Task 4/5.

```tsx
import { createRoot } from "react-dom/client";
import Index from "./pages/Index.tsx";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");
createRoot(root).render(<Index />);
```

- [ ] **Step 1: Write the failing page smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Index from "./Index";

describe("Index", () => {
  it("renders the calculator heading without router or query providers", () => {
    render(<Index />);
    expect(
      screen.getByRole("heading", { level: 1, name: /EUA x Brasil/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run src/pages/Index.test.tsx`  
Expected: PASS already if Index still works (this test does not depend on App). If it fails, fix Index imports only — do not keep providers to make the test pass.

- [ ] **Step 3: Delete the shell**

`package.json` `dependencies` must contain only what `src/` still imports after this task:

- `lucide-react`, `react`, `react-dom`, `tailwindcss-animate` (still used by `tailwind.config.ts` until Task 12)
- `cheerio` must move to `devDependencies`

Remove: `@radix-ui/react-toast`, `@radix-ui/react-tooltip`, `@tanstack/react-query`, `class-variance-authority`, `clsx`, `next-themes`, `react-router-dom`, `sonner`, `tailwind-merge`.

Grep `src/` for each removed package; count must be 0.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.  
Confirm `src/App.tsx` and `src/components/ui/` are gone.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: remove unused SPA providers and packages

The calculator does not query, toast, or route. Drop the leftover client graph so later work is not typed and bundled against dead code.
EOF
)"
```

Do not commit secrets. Do not add leftover unused files back.

---

### Task 3: Honest `calculate()`

**Files:**
- Modify: `src/lib/calculator.ts`
- Modify: `src/lib/calculator.test.ts`
- Modify: `src/pages/Index.tsx` and `src/components/calculator/CompareResults.tsx` only as needed to keep the app compiling (pass `avgLocalTax`, stop passing `paymentMethod`). Do not invent new UI.

**Interfaces:**
- Consumes: none
- Produces:

```ts
export interface CalculatorInput {
  priceUSD: number;
  stateTax: number;
  avgLocalTax: number;
  ptax: number;
  spread: number;
  iofRate: number;
}

export interface AuditTrail {
  basePriceBRL: number;
  stateTaxBRL: number;
  stateOnlyBRL: number;
  localTaxBRL: number;
  spreadBRL: number;
  iofBRL: number;
  iofRate: number;
  vetPerUSD: number;
  effectiveExchangeRate: number;
  subtotalUSD: number;
}

export function calculate(input: CalculatorInput): CalculationResult
export function formatBRL(value: number): string
export function formatUSD(value: number): string
export function formatPercent(value: number, fractionDigits?: number): string
```

`PaymentMethod` moves out of this file in Task 4. For this task, keep exporting `PaymentMethod` from `calculator.ts` so Index still compiles, or re-export from a one-line `export type { PaymentMethod }` if you already extracted it. Do not leave `DEFAULT_IOF`.

- [ ] **Step 1: Write failing tests for VET and the split**

Append to `src/lib/calculator.test.ts`:

```ts
import { calculate, formatPercent, formatUSD } from "./calculator";

describe("calculate", () => {
  const base = {
    priceUSD: 100,
    stateTax: 0.06,
    avgLocalTax: 0.01,
    ptax: 5,
    spread: 0.035,
    iofRate: 0.035,
  };

  it("uses combined state + local tax on the USD subtotal", () => {
    const { audit } = calculate(base);
    expect(audit.subtotalUSD).toBeCloseTo(107, 8);
  });

  it("splits US tax BRL into state and local by rate share", () => {
    const { audit } = calculate(base);
    expect(audit.stateTaxBRL).toBeCloseTo(100 * 0.07 * 5, 8);
    expect(audit.stateOnlyBRL).toBeCloseTo(100 * 0.06 * 5, 8);
    expect(audit.localTaxBRL).toBeCloseTo(100 * 0.01 * 5, 8);
  });

  it("computes VET as PTAX × (1 + spread) × (1 + IOF)", () => {
    const { audit } = calculate(base);
    expect(audit.vetPerUSD).toBeCloseTo(5 * 1.035 * 1.035, 8);
  });

  it("treats non-positive price as a zero result", () => {
    const { finalBRL } = calculate({ ...base, priceUSD: 0 });
    expect(finalBRL).toBe(0);
  });
});

describe("formatUSD", () => {
  it("formats USD", () => {
    expect(formatUSD(10)).toBe("$10.00");
  });
});

describe("formatPercent", () => {
  it("uses a comma decimal", () => {
    expect(formatPercent(0.035)).toBe("3,50%");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/calculator.test.ts`  
Expected: FAIL — `avgLocalTax` / `vetPerUSD` / `stateOnlyBRL` missing.

- [ ] **Step 3: Implement**

Replace `src/lib/calculator.ts` with:

```ts
export type PaymentMethod = "cash" | "global" | "credit";

export interface CalculatorInput {
  priceUSD: number;
  stateTax: number;
  avgLocalTax: number;
  ptax: number;
  spread: number;
  iofRate: number;
}

export interface AuditTrail {
  basePriceBRL: number;
  stateTaxBRL: number;
  stateOnlyBRL: number;
  localTaxBRL: number;
  spreadBRL: number;
  iofBRL: number;
  iofRate: number;
  vetPerUSD: number;
  effectiveExchangeRate: number;
  subtotalUSD: number;
}

export interface CalculationResult {
  finalBRL: number;
  audit: AuditTrail;
}

export function calculate(input: CalculatorInput): CalculationResult {
  const { priceUSD, stateTax, avgLocalTax, ptax, spread, iofRate } = input;
  const combinedTax = stateTax + avgLocalTax;
  const safePrice = Number.isFinite(priceUSD) && priceUSD > 0 ? priceUSD : 0;

  const subtotalUSD = safePrice * (1 + combinedTax);
  const conversionRate = ptax * (1 + spread);
  const subtotalBRL = subtotalUSD * conversionRate;
  const iofBRL = subtotalBRL * iofRate;
  const finalBRL = subtotalBRL + iofBRL;

  const basePriceBRL = safePrice * ptax;
  const stateOnlyBRL = safePrice * stateTax * ptax;
  const localTaxBRL = safePrice * avgLocalTax * ptax;
  const stateTaxBRL = stateOnlyBRL + localTaxBRL;
  const spreadBRL = subtotalUSD * ptax * spread;
  const vetPerUSD = ptax * (1 + spread) * (1 + iofRate);
  const effectiveExchangeRate = safePrice > 0 ? finalBRL / safePrice : 0;

  return {
    finalBRL,
    audit: {
      basePriceBRL,
      stateTaxBRL,
      stateOnlyBRL,
      localTaxBRL,
      spreadBRL,
      iofBRL,
      iofRate,
      vetPerUSD,
      effectiveExchangeRate,
      subtotalUSD,
    },
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return `${(value * 100).toFixed(fractionDigits).replace(".", ",")}%`;
}
```

Call sites: pass `avgLocalTax` from `stateInfo`. Stop passing `paymentMethod`. `ResultCard` must read `audit.vetPerUSD`, `audit.stateOnlyBRL`, `audit.localTaxBRL` instead of recomputing. Delete `DEFAULT_IOF`. Header comment must not say cash spread is 0.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculator.ts src/lib/calculator.test.ts src/pages/Index.tsx src/components/calculator/CompareResults.tsx src/components/calculator/ResultCard.tsx
git commit -m "$(cat <<'EOF'
refactor: make calculate the only source of VET and tax split

Stop requiring an unused paymentMethod and stop recomputing engine math in the result card.
EOF
)"
```

---

### Task 4: Catalog module

**Files:**
- Create: `src/lib/catalog.ts`
- Create: `src/lib/catalog.test.ts`
- Create: `src/lib/catalog.fixture.ts` (test-only invalid payloads as objects, not files in `src/data`)
- Modify: `src/components/calculator/StateSelect.tsx` (import lists; do not export `states` / `stateTaxMeta`)
- Modify: `src/components/calculator/PaymentSection.tsx` (import lists; do not export `accounts` / `banks` / `cashConfig` / `banksMeta`)
- Modify: `src/pages/Index.tsx`, `src/components/calculator/CompareResults.tsx`, `src/components/calculator/ResultCard.tsx` (import from `@/lib/catalog` and `@/lib/calculator` only)
- Modify: `src/lib/calculator.ts` (delete `PaymentMethod`; import type from catalog if a re-export is needed — prefer Index importing `PaymentMethod` from catalog)

**Interfaces:**
- Consumes: `src/data/banks_spread.json`, `src/data/usa_state_tax.json`
- Produces:

```ts
export type PaymentMethod = "cash" | "global" | "credit";

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  global: "Conta Internacional",
  credit: "Cartão de Crédito",
};

export interface Institution {
  code: string;
  name: string;
  spread: number;
  iof: number;
}

export interface UsState {
  code: string;
  name: string;
  stateTax: number;
  avgLocalTax: number;
  combinedTax: number;
}

export interface StateTaxMeta {
  last_update: string;
  updated_at: string;
}

export interface BanksMeta {
  source: string;
  last_update: string;
}

export const POSTAL_CODES: Readonly<Record<string, string>>; // all 50 states + DC
export const accounts: Institution[];
export const banks: Institution[];
export const cashConfig: Institution;
export const banksMeta: BanksMeta;
export const states: UsState[];
export const stateTaxMeta: StateTaxMeta;

export function parseInstitution(raw: unknown, label: string): Institution
export function parseBanksFile(raw: unknown): {
  cash: Institution;
  accounts: Institution[];
  banks: Institution[];
  meta: BanksMeta;
}
export function parseStateTaxFile(raw: unknown): {
  states: UsState[];
  meta: StateTaxMeta;
}
```

Validation: each `spread` / `iof` finite and `>= 0`. Each tax rate finite and `>= 0` (percent strings `/ 100`). Every state name must exist in `POSTAL_CODES` — throw `Error` including the name. No `slice(0, 2)`.

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import {
  parseBanksFile,
  parseStateTaxFile,
  POSTAL_CODES,
} from "./catalog";

describe("parseBanksFile", () => {
  const ok = {
    source: "https://example.com",
    last_update: "10/12/2025",
    cash: { code: "CASH", name: "Cash", spread: 0.035, iof: 0.035 },
    accounts: [{ code: "WISE", name: "Wise", spread: 0.008, iof: 0.035 }],
    banks: [{ code: "ITAU", name: "Itaú", spread: 0.055, iof: 0 }],
  };

  it("parses a valid file", () => {
    const parsed = parseBanksFile(ok);
    expect(parsed.accounts[0]?.code).toBe("WISE");
    expect(parsed.banks[0]?.iof).toBe(0);
  });

  it("rejects negative spread", () => {
    expect(() =>
      parseBanksFile({
        ...ok,
        cash: { ...ok.cash, spread: -0.01 },
      }),
    ).toThrow(/spread/i);
  });

  it("rejects non-finite IOF", () => {
    expect(() =>
      parseBanksFile({
        ...ok,
        accounts: [{ code: "X", name: "X", spread: 0, iof: Number.NaN }],
      }),
    ).toThrow(/iof/i);
  });
});

describe("parseStateTaxFile", () => {
  it("maps Florida to FL", () => {
    const parsed = parseStateTaxFile({
      last_update: "2026-01-01",
      updated_at: "2026-01-02 00:00:00",
      states: {
        Florida: { state: "6.00", avg_local: "1.00", combined: "7.00" },
      },
    });
    expect(parsed.states[0]).toMatchObject({
      code: "FL",
      stateTax: 0.06,
      avgLocalTax: 0.01,
      combinedTax: 0.07,
    });
  });

  it("throws when a state name has no postal code", () => {
    expect(() =>
      parseStateTaxFile({
        last_update: "2026-01-01",
        updated_at: "2026-01-02 00:00:00",
        states: {
          "Not A State": { state: "1.00", avg_local: "0.00", combined: "1.00" },
        },
      }),
    ).toThrow(/Not A State/);
  });

  it("allows zero tax", () => {
    const parsed = parseStateTaxFile({
      last_update: "2026-01-01",
      updated_at: "2026-01-02 00:00:00",
      states: {
        Oregon: { state: "0.00", avg_local: "0.00", combined: "0.00" },
      },
    });
    expect(parsed.states[0]?.stateTax).toBe(0);
  });
});

describe("POSTAL_CODES", () => {
  it("includes DC", () => {
    expect(POSTAL_CODES["District of Columbia"]).toBe("DC");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/catalog.test.ts`  
Expected: FAIL — module missing.

- [ ] **Step 3: Implement `catalog.ts` and switch imports**

Implement parsers as named functions. Module init:

```ts
const banksFile = parseBanksFile(banksRaw);
export const accounts = banksFile.accounts;
export const banks = banksFile.banks;
export const cashConfig = banksFile.cash;
export const banksMeta = banksFile.meta;

const taxFile = parseStateTaxFile(statesRaw);
export const states = taxFile.states;
export const stateTaxMeta = taxFile.meta;
```

`StateSelect` / `PaymentSection` become presentational. Types `UsState` / `StateTaxMeta` / `Institution` are imported from `@/lib/catalog`. Delete `POSTAL_CODES` from `StateSelect`. One `METHOD_LABEL` in catalog; delete the copies in `ResultCard` and `CompareResults`.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.  
Grep: `export { states` and `export { accounts` in `src/components` must be 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/catalog.ts src/lib/catalog.test.ts src/lib/calculator.ts src/components src/pages
git commit -m "$(cat <<'EOF'
refactor: move institution and state catalogs into src/lib

UI stop owning JSON so the engine can be validated without mounting components.
EOF
)"
```

---

### Task 5: Validated PTAX

**Files:**
- Modify: `src/lib/ptax.ts`
- Create: `src/lib/ptax.test.ts`
- Modify: `src/main.tsx` (lazy import of page after catalogs; catch init errors)

**Interfaces:**
- Consumes: `src/data/ptax.json`
- Produces:

```ts
export interface PtaxResult {
  rate: number;
  date: string;
  fetchedAt: string;
}

export function parsePtaxFile(raw: unknown): PtaxResult
export const ptax: PtaxResult
```

Delete `buyRate` and `fallback`. `rate` finite and `> 0`. `date` and `updated_at` non-empty strings.

`main.tsx` load error (module init throws on bad JSON in production data — tests call `parsePtaxFile` with fixtures so they do not depend on throwing at import):

```tsx
import { createRoot } from "react-dom/client";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");

const loadError = "Não foi possível carregar os dados da calculadora.";

void import("./pages/Index.tsx")
  .then(({ default: Index }) => {
    createRoot(root).render(<Index />);
  })
  .catch(() => {
    createRoot(root).render(<p>{loadError}</p>);
  });
```

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { parsePtaxFile } from "./ptax";

describe("parsePtaxFile", () => {
  it("reads rate and dates", () => {
    expect(
      parsePtaxFile({
        rate: 5.2,
        buy: 5.1,
        date: "2026-08-28",
        updated_at: "2026-08-29 00:00:00",
      }),
    ).toEqual({
      rate: 5.2,
      date: "2026-08-28",
      fetchedAt: "2026-08-29 00:00:00",
    });
  });

  it("rejects rate 0", () => {
    expect(() =>
      parsePtaxFile({
        rate: 0,
        date: "2026-08-28",
        updated_at: "2026-08-29 00:00:00",
      }),
    ).toThrow(/rate/i);
  });

  it("rejects missing date", () => {
    expect(() =>
      parsePtaxFile({ rate: 5, date: "", updated_at: "x" }),
    ).toThrow(/date/i);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/ptax.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement `parsePtaxFile` and slim `PtaxResult`**

Grep `buyRate` and `fallback` in `src/` — must be 0 after this task.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ptax.ts src/lib/ptax.test.ts src/main.tsx src/components src/pages
git commit -m "$(cat <<'EOF'
fix: validate PTAX at the catalog boundary

A zero or missing official rate must not render a confident total.
EOF
)"
```

---

### Task 6: URL state (pure)

**Files:**
- Create: `src/lib/selection.ts`
- Create: `src/lib/selection.test.ts`
- Create: `src/lib/url-state.ts`
- Create: `src/lib/url-state.test.ts`

**Interfaces:**
- Consumes: `PaymentMethod`, `accounts`, `banks`, `states` from catalog
- Produces:

```ts
export interface CalculatorSelection {
  priceStr: string;
  stateCode: string;
  compareMode: boolean;
  method: PaymentMethod;
  accountCode: string;
  bankCode: string;
  selectedMethods: PaymentMethod[];
  selectedAccounts: string[];
  selectedBanks: string[];
}

export function defaultSelection(): CalculatorSelection
export function parsePriceUsd(priceStr: string): number
export function selectionsEqual(a: CalculatorSelection, b: CalculatorSelection): boolean

export function serializeSelection(selection: CalculatorSelection): string
export function parseSelection(search: string): CalculatorSelection
```

`parsePriceUsd`: `parseFloat(priceStr.replace(",", "."))`; non-finite or `<= 0` → `0`.

`serializeSelection`: `URLSearchParams`. Omit empty price. `cmp=1` only when compare is on. Comma-join lists. Do not write keys that equal defaults except `p` when non-empty, and always write user-changed enums if you prefer determinism — **required rule:** serialize the full current selection (all keys that have a value). Empty compare lists omit `ms`/`accs`/`bks`. Empty `p` omitted.

`parseSelection`: start from `defaultSelection()`. Apply each present key if valid. Unknown `st` / `acc` / `bk` / `m` / method in `ms` → ignore that key. Codes in `accs`/`bks` that are not in the catalog are dropped; other codes kept.

`defaultSelection()`:

```ts
return {
  priceStr: "",
  stateCode: "FL",
  compareMode: false,
  method: "cash",
  accountCode: accounts[0].code,
  bankCode: banks[0].code,
  selectedMethods: [],
  selectedAccounts: [],
  selectedBanks: [],
};
```

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { accounts, banks } from "./catalog";
import { defaultSelection, parsePriceUsd, selectionsEqual } from "./selection";
import { parseSelection, serializeSelection } from "./url-state";

describe("parsePriceUsd", () => {
  it("accepts a comma decimal", () => {
    expect(parsePriceUsd("10,5")).toBe(10.5);
  });

  it("returns 0 for empty or invalid", () => {
    expect(parsePriceUsd("")).toBe(0);
    expect(parsePriceUsd("abc")).toBe(0);
  });
});

describe("url-state", () => {
  it("round-trips a compare selection", () => {
    const selection = {
      ...defaultSelection(),
      priceStr: "99.9",
      stateCode: "NY",
      compareMode: true,
      selectedMethods: ["cash", "credit"] as const,
      selectedBanks: [banks[0].code],
    };
    const parsed = parseSelection(`?${serializeSelection(selection)}`);
    expect(parsed.priceStr).toBe("99.9");
    expect(parsed.stateCode).toBe("NY");
    expect(parsed.compareMode).toBe(true);
    expect(parsed.selectedMethods).toEqual(["cash", "credit"]);
    expect(parsed.selectedBanks).toEqual([banks[0].code]);
  });

  it("drops an unknown state and keeps the default", () => {
    expect(parseSelection("?st=XX").stateCode).toBe("FL");
  });

  it("drops an unknown bank and keeps a valid one", () => {
    const code = banks[0].code;
    const parsed = parseSelection(`?bks=${code},NOT_A_BANK`);
    expect(parsed.selectedBanks).toEqual([code]);
  });

  it("ignores a bad price key and leaves price empty", () => {
    expect(parseSelection("?p=nope").priceStr).toBe("");
  });
});

describe("selectionsEqual", () => {
  it("treats array order as significant", () => {
    const a = defaultSelection();
    const b = { ...a, selectedAccounts: [accounts[0].code] };
    expect(selectionsEqual(a, b)).toBe(false);
  });
});
```

If `NY` is missing from the live JSON (it is not), use a code that exists. If Florida missing, the catalog parse would already have thrown.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/url-state.test.ts src/lib/selection.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement `selection.ts` and `url-state.ts`**

Keep both files free of `window` / `document`. No React.

`selectionsEqual`: compare primitives with `===`; compare arrays with length + every index.

For `p`: if present and `parsePriceUsd` is `0` and the raw string is not a valid positive number, ignore (leave default `""`). A valid `"0"` is ignored the same way (price stays `""`) because price `<= 0` is not a usable value.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/selection.ts src/lib/selection.test.ts src/lib/url-state.ts src/lib/url-state.test.ts
git commit -m "$(cat <<'EOF'
feat: parse and serialize calculator selection

Shareable query strings need a pure boundary before the page touches history.
EOF
)"
```

---

### Task 7: `buildScenarios`

**Files:**
- Create: `src/lib/scenarios.ts`
- Create: `src/lib/scenarios.test.ts`

**Interfaces:**
- Consumes: `calculate`, catalog, `CalculatorSelection`, `parsePriceUsd`, `ptax`
- Produces:

```ts
export interface ScenarioRow {
  key: string;
  method: PaymentMethod;
  methodLabel: string;
  institutionLabel: string;
  spread: number;
  iofRate: number;
  finalBRL: number;
  effectiveRate: number;
  vetPerUSD: number;
}

export function buildScenarios(
  selection: CalculatorSelection,
  ptaxRate: number,
): ScenarioRow[]
```

Rules (same as today’s UI):

- `compareMode === false`: one row from `method` + `cashConfig` / selected account / selected bank.
- `compareMode === true`: cash row if `selectedMethods` includes `cash`; one row per selected account if `global`; one row per selected bank if `credit`. Empty → `[]`.
- Sort by `finalBRL` ascending.
- `stateTax` / `avgLocalTax` from `states.find(s => s.code === selection.stateCode)` or throw if missing (selection parser already defaults to FL).

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { accounts, banks } from "./catalog";
import { defaultSelection } from "./selection";
import { buildScenarios } from "./scenarios";

describe("buildScenarios", () => {
  it("returns one cash row in single mode", () => {
    const rows = buildScenarios(defaultSelection(), 5);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.method).toBe("cash");
  });

  it("returns no rows when compare lists are empty", () => {
    const rows = buildScenarios(
      { ...defaultSelection(), compareMode: true },
      5,
    );
    expect(rows).toEqual([]);
  });

  it("sorts compare rows by final BRL", () => {
    const rows = buildScenarios(
      {
        ...defaultSelection(),
        priceStr: "100",
        compareMode: true,
        selectedMethods: ["credit"],
        selectedBanks: [banks[0].code, banks[1].code],
      },
      5,
    );
    expect(rows.length).toBe(2);
    expect(rows[0]!.finalBRL).toBeLessThanOrEqual(rows[1]!.finalBRL);
  });

  it("includes a selected global account", () => {
    const rows = buildScenarios(
      {
        ...defaultSelection(),
        priceStr: "50",
        compareMode: true,
        selectedMethods: ["global"],
        selectedAccounts: [accounts[0].code],
      },
      5,
    );
    expect(rows[0]?.institutionLabel).toBe(accounts[0].name);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/scenarios.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement `buildScenarios`**

Do not import from `@/components`. Delete `buildScenarios` inside `CompareResults.tsx` in Task 8 (this task only adds `src/lib/scenarios.ts`).

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scenarios.ts src/lib/scenarios.test.ts
git commit -m "$(cat <<'EOF'
feat: build ranked payment scenarios from one selection

Single mode is a list of one row so Index no longer owns a second fee resolver.
EOF
)"
```

---

### Task 8: Page model, snapshot, and presentational wiring

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/pages/Index.test.tsx`
- Modify: `src/components/calculator/PaymentSection.tsx`
- Create: `src/components/calculator/InstitutionChecklist.tsx`
- Modify: `src/components/calculator/CompareResults.tsx` (props become `rows: ScenarioRow[]`; delete local `buildScenarios`)
- Modify: `src/components/calculator/ResultCard.tsx` (use catalog labels + audit fields only)
- Modify: `src/components/calculator/StepHeader.tsx` (delete unused `children`)

**Interfaces:**
- Consumes: `defaultSelection`, `selectionsEqual`, `parsePriceUsd`, `buildScenarios`, `ptax`
- Produces: Index state is `CalculatorSelection` plus `submitted: CalculatorSelection | null`. Submit sets `submitted` to a shallow copy of the current selection. Any selection change that fails `selectionsEqual(selection, submitted)` hides results (`submitted` stays until the next successful submit, or set `submitted` to `null` on change — **required:** set `submitted` to `null` when `!selectionsEqual(next, submitted)` so a later identical edit does not revive an old result without a click).

`CompareResults` props:

```ts
export function CompareResults({ rows }: { rows: ScenarioRow[] }): JSX.Element
```

Empty `rows` → existing Portuguese empty copy.

`ResultCard` receives one `ScenarioRow` plus `priceUSD`, `stateInfo`, `ptax`, metas — or receives `CalculationResult` from a single `calculate` call using that row’s spread/IOF. **Required:** Index calls `buildScenarios`; if `!compareMode` and `rows[0]`, render `ResultCard` from that row + `calculate` once using row fees (do not re-resolve institution in Index). Prefer passing `rows[0]` and the `CalculationResult` already computed inside `buildScenarios` — extend `ScenarioRow` with `result: CalculationResult` in this task if that removes a second `calculate` call. If you extend it, update Task 7 types in `scenarios.ts` and tests to assert `result.audit.vetPerUSD` is present. Do not call `calculate` in the page.

- [ ] **Step 1: Extend page tests (fail until wiring exists)**

Replace `src/pages/Index.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Index from "./Index";

describe("Index", () => {
  it("renders the heading", () => {
    render(<Index />);
    expect(
      screen.getByRole("heading", { level: 1, name: /EUA x Brasil/i }),
    ).toBeInTheDocument();
  });

  it("does not show a result until submit", () => {
    render(<Index />);
    expect(screen.queryByText(/Total Final Estimado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Selecione ao menos um método/i)).not.toBeInTheDocument();
  });

  it("shows a result after a valid submit", async () => {
    const user = userEvent.setup();
    render(<Index />);
    await user.type(screen.getByLabelText(/Preço do produto/i), "100");
    await user.click(screen.getByRole("button", { name: /Calcular Total/i }));
    expect(screen.getByText(/Total Final Estimado/i)).toBeInTheDocument();
  });

  it("hides the result after the price changes", async () => {
    const user = userEvent.setup();
    render(<Index />);
    await user.type(screen.getByLabelText(/Preço do produto/i), "100");
    await user.click(screen.getByRole("button", { name: /Calcular Total/i }));
    await user.type(screen.getByLabelText(/Preço do produto/i), "1");
    expect(screen.queryByText(/Total Final Estimado/i)).not.toBeInTheDocument();
  });
});
```

Price input `aria-label` today is `Preço do produto em dólares americanos`. Use that exact accessible name in tests (`getByLabelText(/dólares americanos/i)`). Do not change the label in this task unless the test cannot see it.

- [ ] **Step 2: Run tests to verify new cases fail or the old form still uses `type=number`**

Run: `npx vitest run src/pages/Index.test.tsx`  
Expected: FAIL or flake on `type=number` — if `user.type` fails, use `await user.clear` + paste, or set the value via the label. Do not skip the test.

- [ ] **Step 3: Implement snapshot Index + `InstitutionChecklist`**

`InstitutionChecklist` props:

```ts
interface InstitutionChecklistProps {
  legend: string;
  selectedCount: number;
  items: { code: string; name: string }[];
  selected: string[];
  onChange: (codes: string[]) => void;
}
```

Todos / Limpar buttons live here once. `PaymentSection` uses it twice.

Index:

```ts
const [selection, setSelection] = useState<CalculatorSelection>(defaultSelection);
const [submitted, setSubmitted] = useState<CalculatorSelection | null>(null);

const update = (patch: Partial<CalculatorSelection>) => {
  setSelection((prev) => {
    const next = { ...prev, ...patch };
    setSubmitted((current) =>
      current && selectionsEqual(next, current) ? current : null,
    );
    return next;
  });
};
```

Do not put `setSubmitted` inside `setSelection` if React 18 batching makes it awkward — compute `next` first, then two sets. Do not use the 10-dependency `useEffect`.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/pages src/components/calculator src/lib/scenarios.ts src/lib/scenarios.test.ts
git commit -m "$(cat <<'EOF'
refactor: drive results from a submitted selection snapshot

Hide stale totals when the form changes without a second calculator code path.
EOF
)"
```

---

### Task 9: Form, a11y, and price field

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/components/calculator/PriceInput.tsx`
- Modify: `src/components/calculator/PaymentSection.tsx`
- Modify: `src/pages/Index.test.tsx`
- Modify: `index.html` (skip link as first child of `<body>`)

**Interfaces:**
- Consumes: existing selection updater
- Produces: `<form onSubmit>` that `preventDefault`, rejects `parsePriceUsd <= 0`, otherwise `setSubmitted({ ...selection })` and focuses `#resultado`.

Price input:

```tsx
<input
  id="price-usd"
  type="text"
  inputMode="decimal"
  enterKeyHint="done"
  pattern="[0-9]+([.,][0-9]+)?"
  placeholder="0.00"
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="..."
  aria-label="Preço do produto em dólares americanos"
/>
```

Compare switch: `aria-labelledby="compare-mode-label"` and `id="compare-mode-label"` on the “Modo Comparar” heading.

Payment methods in single mode:

```tsx
<div role="radiogroup" aria-label="Método de pagamento">
  {METHOD_OPTIONS.map((opt) => (
    <button
      key={opt.value}
      type="button"
      role="radio"
      aria-checked={method === opt.value}
      onClick={() => onMethodChange(opt.value)}
    >
      {opt.label}
    </button>
  ))}
</div>
```

`#resultado`: `tabIndex={-1}`, `aria-live="polite"`. After submit, `resultadoEl.focus()` then `scrollIntoView({ block: "start" })`. No double `requestAnimationFrame`.

Skip link in `index.html`:

```html
<body>
  <a class="skip-link" href="#conteudo-principal">Ir para o conteúdo</a>
  <div id="root"></div>
```

CSS in `src/index.css`:

```css
.skip-link {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  z-index: 100;
  padding: 0.5rem 0.75rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  transform: translateY(-200%);
}
.skip-link:focus {
  transform: none;
}
```

- [ ] **Step 1: Add tests**

```tsx
it("submits on Enter from the price field", async () => {
  const user = userEvent.setup();
  render(<Index />);
  const price = screen.getByLabelText(/dólares americanos/i);
  await user.type(price, "80{Enter}");
  expect(screen.getByText(/Total Final Estimado/i)).toBeInTheDocument();
});

it("names the compare switch", async () => {
  render(<Index />);
  expect(screen.getByRole("switch", { name: /Modo Comparar/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages/Index.test.tsx`  
Expected: FAIL (button is not submit / switch unnamed / `type=number`).

- [ ] **Step 3: Implement form, radiogroup, skip link, price `pattern`**

Calcular remains `type="submit"`. Disabled when `parsePriceUsd(selection.priceStr) <= 0`.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx src/pages/Index.test.tsx src/components/calculator/PriceInput.tsx src/components/calculator/PaymentSection.tsx src/index.css index.html
git commit -m "$(cat <<'EOF'
feat: submit the calculator as a real form

Enter, a named compare switch, and a skip link make the page usable without a pointer.
EOF
)"
```

---

### Task 10: Wire URL + result JSON

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/pages/Index.test.tsx`
- Modify: `src/components/calculator/CompareResults.tsx`
- Modify: `src/components/calculator/ResultCard.tsx`

**Interfaces:**
- Consumes: `parseSelection`, `serializeSelection`
- Produces: on mount, `useState(() => parseSelection(window.location.search))`. On every `selection` change, `history.replaceState(null, "", next)` where `next` is `pathname + (query ? "?" + query : "")` + `hash`. Do not write a lone `?`.

Result payload type (put in `src/lib/scenarios.ts`):

```ts
export interface ResultPayload {
  priceUsd: number;
  state: string;
  compare: boolean;
  count: number;
  rows: Array<{
    method: PaymentMethod;
    institution: string;
    finalBrl: number;
    spread: number;
    iof: number;
    vet: number;
  }>;
}

export function toResultPayload(
  selection: CalculatorSelection,
  rows: ScenarioRow[],
): ResultPayload
```

`#resultado` attributes: `data-price-usd`, `data-state`, `data-compare` (`"true"`/`"false"`), `data-count`. Each `li` / card root: the row attributes. Child:

```tsx
<script type="application/json" id="resultado-json">
  {JSON.stringify(payload)}
</script>
```

Numbers in JSON are numbers, not formatted strings.

- [ ] **Step 1: Tests**

```ts
// src/lib/scenarios.test.ts — add
it("toResultPayload copies numeric fields", () => {
  const selection = { ...defaultSelection(), priceStr: "10", stateCode: "FL" };
  const rows = buildScenarios(selection, 5);
  const payload = toResultPayload(selection, rows);
  expect(payload.priceUsd).toBe(10);
  expect(payload.state).toBe("FL");
  expect(payload.count).toBe(1);
  expect(payload.rows[0]?.finalBrl).toEqual(rows[0]?.finalBRL);
});
```

```tsx
// Index.test.tsx — add
it("restores price from the query string without showing a result", () => {
  window.history.replaceState(null, "", "/?p=42&st=NY");
  render(<Index />);
  expect(screen.getByLabelText(/dólares americanos/i)).toHaveValue("42");
  expect(screen.queryByText(/Total Final Estimado/i)).not.toBeInTheDocument();
});

it("writes the query string when the price changes", async () => {
  window.history.replaceState(null, "", "/");
  const user = userEvent.setup();
  render(<Index />);
  await user.type(screen.getByLabelText(/dólares americanos/i), "15");
  expect(window.location.search).toMatch(/p=15/);
});

it("exposes resultado-json after submit", async () => {
  const user = userEvent.setup();
  render(<Index />);
  await user.type(screen.getByLabelText(/dólares americanos/i), "20");
  await user.click(screen.getByRole("button", { name: /Calcular Total/i }));
  const node = document.getElementById("resultado-json");
  expect(node).toBeTruthy();
  const body = JSON.parse(node!.textContent ?? "{}");
  expect(body.priceUsd).toBe(20);
  expect(body.count).toBeGreaterThan(0);
});
```

Reset `window.history` in `afterEach` to `"/"`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/pages/Index.test.tsx src/lib/scenarios.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement history sync and attributes**

Use `useEffect` that depends on `selection` and calls `replaceState`. Do not include `submitted` in the URL.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx src/pages/Index.test.tsx src/lib/scenarios.ts src/lib/scenarios.test.ts src/components/calculator/ResultCard.tsx src/components/calculator/CompareResults.tsx
git commit -m "$(cat <<'EOF'
feat: sync the form to the URL and emit result JSON

Agents and humans can restore a selection and read a numeric breakdown after Calcular.
EOF
)"
```

---

### Task 11: TypeScript strict and ESLint unused-vars

**Files:**
- Modify: `tsconfig.app.json`
- Modify: `tsconfig.json`
- Modify: `eslint.config.js`
- Modify: any `src/**/*.ts(x)` that fails

**Interfaces:**
- Consumes: current source
- Produces: compiler options:

```json
"strict": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitAny": true,
"noFallthroughCasesInSwitch": true
```

Root `tsconfig.json`: same flags (`strictNullChecks` true; delete the `false` overrides).

ESLint:

```js
"@typescript-eslint/no-unused-vars": [
  "error",
  { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" },
]
```

No `as` casts on JSON at call sites — parsing functions already return typed values. `JSON.parse` of `resultado-json` in tests may use a type guard or `unknown` + expect.

- [ ] **Step 1: Turn the flags on (this is the failing test)**

Edit the three config files. Do not add `// @ts-nocheck`.

- [ ] **Step 2: Run typecheck and lint to list failures**

Run: `npx tsc -p tsconfig.app.json --noEmit`  
Expected: FAIL with a finite list.  
Run: `npx eslint .`  
Expected: FAIL if unused symbols remain.

- [ ] **Step 3: Fix every error**

Typical: `React.ReactNode` without import → `import type { ReactNode } from "react"`. Unused props. `document.getElementById("root")!` → already guarded. Test files included by `tsconfig.app.json` must typecheck — if `include` is `"src"`, tests are checked; fix them.

- [ ] **Step 4: Closed loop**

Run: `npx tsc -p tsconfig.app.json --noEmit`  
Expected: exit 0.  
Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json tsconfig.app.json eslint.config.js src
git commit -m "$(cat <<'EOF'
chore: enable TypeScript strict and unused-var lint

Dead symbols and silent any must fail the same closed loop as unit tests.
EOF
)"
```

---

### Task 12: SEO, CSP, fonts, assets, Tailwind leftovers

**Files:**
- Modify: `index.html`
- Modify: `public/robots.txt`
- Modify: `public/llms.txt`
- Create: `public/og.png` (1200×630, generated)
- Create: `src/vite-plugin-calculator-assets.ts`
- Modify: `vite.config.ts`
- Modify: `tailwind.config.ts`
- Modify: `src/index.css`
- Delete: `components.json`, `public/placeholder.svg`
- Modify: `README.md`
- Create: `src/vite-plugin-calculator-assets.test.ts` for sitemap XML helper (extract `buildSitemapXml(isoDate: string): string` as a named export)

**Interfaces:**
- Consumes: `src/data/ptax.json` `date`
- Produces:

```ts
export function buildSitemapXml(lastmod: string): string
```

Exact sitemap body:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dolar.heytor.dev/</loc>
    <lastmod>DATE</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

`DATE` is `ptax.date` (`YYYY-MM-DD`). Throw if the date is not that shape.

Plugin:

- `configureServer`: serve `src/data/ptax.json` at `/data/ptax.json`, same for the other two files, `Content-Type: application/json`.
- `generateBundle`: `this.emitFile` those three JSON files under `data/` and emit `sitemap.xml` from `buildSitemapXml`.

Dev and preview must be able to `GET /data/ptax.json`.

`index.html` CSP (single meta):

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; connect-src 'self'; base-uri 'self'"
/>
<meta name="referrer" content="strict-origin-when-cross-origin" />
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />
```

Fonts link:

```
https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&display=swap
```

OG/Twitter image: `https://dolar.heytor.dev/og.png`. `og:image:width` `1200`, `og:image:height` `630`. `og:image:alt` and `twitter:image:alt`: `EUA x Brasil — Compare o custo real de compras nos EUA em reais`.

Delete keywords meta.

JSON-LD `featureList`: add `"Comparação lado a lado de vários métodos e instituições"` and `"Formulário compartilhável pela query string"`. Do not add FAQ questions.

`robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://dolar.heytor.dev/sitemap.xml
```

`llms.txt` must contain the three `https://dolar.heytor.dev/data/...` URLs and mention compare mode.

Tailwind `content`: `["./index.html", "./src/**/*.{ts,tsx}"]`. Remove `darkMode`, `prefix`, `sidebar` color map, accordion keyframes/animations. Keep `fade-in` if `animate-fade-in` is still used; otherwise delete it. If `tailwindcss-animate` is unused after that, remove the plugin and the npm package.

`src/index.css`: delete `--sidebar-*` and the ShopCompare comment (replace with `EUA x Brasil` if a file comment remains).

OG image: generate `public/og.png` at 1200×630 using the Cursor image tool. Prompt: cream background, terracotta and sage accents, large Portuguese title `EUA x Brasil`, subtitle `Compare o custo real de compras nos EUA em reais`, no logo mark required, no English, no extra slogans. Commit the binary.

README: document `npm test`, `npm run lint`, `npm run dev`, the `/data/*.json` URLs, and that sitemap `lastmod` is produced at build from PTAX.

- [ ] **Step 1: Sitemap unit test (failing)**

```ts
import { describe, expect, it } from "vitest";
import { buildSitemapXml } from "./vite-plugin-calculator-assets";

describe("buildSitemapXml", () => {
  it("injects lastmod", () => {
    const xml = buildSitemapXml("2026-08-28");
    expect(xml).toContain("<lastmod>2026-08-28</lastmod>");
    expect(xml).toContain("https://dolar.heytor.dev/");
  });

  it("rejects a non-ISO date", () => {
    expect(() => buildSitemapXml("28/08/2026")).toThrow(/lastmod/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/vite-plugin-calculator-assets.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement plugin, HTML, robots, llms, OG, Tailwind, README**

Keep `public/sitemap.xml` in git only if you want a fallback; the build emit is the source of truth. If a committed `public/sitemap.xml` would override emit, delete the public copy or emit a different name. **Required:** do not ship two sitemaps. Delete `public/sitemap.xml` and emit from the plugin only.

- [ ] **Step 4: Closed loop**

Run: `npx vitest run`  
Expected: PASS.  
Run: `npx eslint .`  
Expected: exit 0.  
Run: `npx tsc -p tsconfig.app.json --noEmit`  
Expected: exit 0.  
Run: `npx vite build`  
Expected: exit 0. Confirm `dist/data/ptax.json`, `dist/data/usa_state_tax.json`, `dist/data/banks_spread.json`, `dist/sitemap.xml` exist and `dist/index.html` has the CSP meta and Inter `400..800` (or `400..800` variable axis). Confirm `components.json` and `public/placeholder.svg` are gone. Grep `src` and `index.html` for `keywords` and `lovable` — 0 matches. Grep `package.json` for removed packages — 0 matches.

- [ ] **Step 5: Commit**

```bash
git add index.html public src/vite-plugin-calculator-assets.ts src/vite-plugin-calculator-assets.test.ts vite.config.ts tailwind.config.ts src/index.css README.md package.json
git add -u components.json public/placeholder.svg public/sitemap.xml
git commit -m "$(cat <<'EOF'
feat: add OG image, CSP, public data URLs, and build sitemap

Close the remaining SEO, agent, and document-security gaps without touching scraper workflows.
EOF
)"
```

---

## Plan self-review

**Spec coverage**

| Spec item | Task |
|-----------|------|
| Dead shell / packages / App.tsx | 2 |
| `calculate` contract, VET, split | 3 |
| Catalog + postal throw | 4 |
| PTAX `> 0`, load-error line | 5 |
| URL parse/serialize, defaults, per-field drop | 6 |
| `buildScenarios` | 7 |
| Snapshot results, InstitutionChecklist | 8 |
| Form, switch name, radiogroup, skip link, price pattern | 9 |
| replaceState, result `data-*` + JSON | 10 |
| Strict + unused-vars | 11 |
| Fonts, OG, CSP, keywords, robots, llms, public JSON, sitemap lastmod, Tailwind leftovers, README | 12 |
| Scraper CI | omitted (out of scope) |

**Type names used throughout:** `CalculatorSelection`, `ScenarioRow`, `ResultPayload`, `PtaxResult`, `Institution`, `UsState`, `PaymentMethod`, `METHOD_LABEL`.

**Placeholders:** none. If `user.type` on the price field is awkward before Task 9, Task 8 says to use the existing accessible name and not skip the test.

---

## Execution

Plan saved to `docs/superpowers/plans/2026-08-29-audit-remediation.md`. Spec saved to `docs/superpowers/specs/2026-08-29-audit-remediation-design.md`.

**1. Subagent-Driven (recommended)** — one fresh subagent per task, review between tasks  
**2. Inline Execution** — this session, `executing-plans`, checkpoints after each commit

Which approach?
