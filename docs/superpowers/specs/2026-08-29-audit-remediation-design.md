# Audit remediation design

Date: 2026-08-29  
Product: EUA x Brasil calculator (`https://dolar.heytor.dev/`)

## Problem

The app is one screen wearing a leftover SPA shell. Single mode and compare mode are two calculators. Domain catalogs are owned by UI components. TypeScript strictness is off. Unused providers sit in the client bundle. Selection is not shareable. Several accessibility, SEO, and agentic gaps remain.

## Goal

Keep today’s visual behavior (compare toggle, tabs/selects vs checklists, Calcular, detail card vs ranked list). Unify the internals. Delete unused code and packages. Make selection URL-addressable. Close the audit items in scope.

## Out of scope

- Scraper GitHub Actions (still commit to `main`)
- Scraper user-agent / table heuristics
- `public/404.html`
- Changing IOF, spread, or tax numbers
- Visual redesign

Already done outside this spec: Lovable tagger/README/package name; Vite `host` `127.0.0.1`; HMR overlay re-enabled.

## Architecture

Model first. Catalogs and math live in `src/lib`. The page holds a selection. `buildScenarios` is the only path from selection to ranked rows. Single mode is a list of length 1.

```
src/lib/catalog.ts      institutions, states, METHOD_LABEL, PaymentMethod
src/lib/ptax.ts         validated PTAX
src/lib/calculator.ts   calculate + formatters + VET + state/local split
src/lib/scenarios.ts    buildScenarios
src/lib/url-state.ts    parse/serialize query string
src/main.tsx            mount calculator page or load-error line
```

UI does not parse JSON and does not re-export catalogs.

## Selection model

Fields (UX unchanged):

- `priceStr`, `stateCode`
- `compareMode`
- single: `method`, `accountCode`, `bankCode`
- compare: `selectedMethods`, `selectedAccounts`, `selectedBanks`

Results show only while the current selection equals the **last submitted snapshot**. No 10-dependency `useEffect` that sets a boolean. Opening a URL never submits.

Empty URL defaults: `stateCode=FL`, `method=cash`, `accountCode` = first catalog account, `bankCode` = first catalog bank, `compareMode=false`, empty compare lists, `priceStr=""`.

## Query string

`history.replaceState` on every form change. Back does not undo fields; it leaves the site. No `popstate` handler. No React Router.

| Key | Meaning |
|-----|---------|
| `p` | price string |
| `st` | state code |
| `cmp` | `1` if compare on |
| `m` | `cash` \| `global` \| `credit` |
| `acc` | single account code |
| `bk` | single bank code |
| `ms` | compare methods, comma-separated |
| `accs` | compare account codes, comma-separated |
| `bks` | compare bank codes, comma-separated |

Invalid values: drop that field only; use the empty-URL default. No error banner. `hasCalculated` / snapshot is not in the URL.

## Calculator

```
calculate({ priceUSD, stateTax, avgLocalTax, ptax, spread, iofRate })
```

No `paymentMethod`. No `DEFAULT_IOF`. Combined tax = `stateTax + avgLocalTax`.

Audit includes: existing breakdown, `vetPerUSD = ptax * (1 + spread) * (1 + iofRate)`, `stateOnlyBRL`, `localTaxBRL`.

PTAX `rate` must be finite and `> 0`. Tax, IOF, spread must be finite and `>= 0`. Missing postal code for a scraped state name is a hard error (no `name.slice(0, 2)`).

## UI and a11y

- Same layout. `PaymentSection` imports from `catalog`. Shared `InstitutionChecklist` for the two compare lists.
- `<form onSubmit>` around steps 1–3 and Calcular (`type="submit"`). Disabled when `priceUSD <= 0`.
- Price: `type="text"`, `inputMode="decimal"`, `enterKeyHint="done"`, `pattern` for digits and one comma or dot. Parse with `replace(",", ".")`.
- Compare switch: `aria-labelledby` on “Modo Comparar”.
- Payment choices: not a fake `tablist`. Use `role="radiogroup"` + `role="radio"` / `aria-checked`.
- On submit: snapshot, focus `#resultado` (`tabIndex={-1}`), `aria-live="polite"`. `scrollIntoView` allowed after focus.
- Skip link first in `<body>`: “Ir para o conteúdo” → `#conteudo-principal`.
- Portuguese only. No 404 page. Delete `App.tsx` and `NotFound.tsx`. `main.tsx` mounts the calculator.

Load-error UI if catalog or PTAX validation throws: one line, **Não foi possível carregar os dados da calculadora.**

## Result machine-readable output

On `#resultado` after submit:

- `data-price-usd`, `data-state`, `data-compare`, `data-count`
- each row: `data-method`, `data-institution`, `data-final-brl`, `data-spread`, `data-iof`, `data-vet`
- `<script type="application/json" id="resultado-json">` with the same payload

## SEO, fonts, security headers

- Inter variable `400..800`, `display=swap`, keep preconnects.
- Generate `public/og.png` 1200×630. Title **EUA x Brasil**. Tagline **Compare o custo real de compras nos EUA em reais**. Cream / terracotta / sage. Point `og:image` and `twitter:image` at `https://dolar.heytor.dev/og.png`. Width/height 1200/630. Alt = title + tagline.
- Delete `meta name="keywords"`.
- Sitemap `lastmod` = `ptax.json` `date`, written at **build** (no workflow change).
- `robots.txt`: `User-agent: *`, `Allow: /`, Sitemap line only.
- `llms.txt`: compare mode; HTTPS URLs `/data/ptax.json`, `/data/usa_state_tax.json`, `/data/banks_spread.json`.
- Build emits those three files from `src/data` (single source). Dev server serves the same paths.
- JSON-LD: keep WebApplication + FAQ; add compare to `featureList`; one sentence that the form is shareable via query string. No new FAQ answers.
- CSP meta: `default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`; `font-src https://fonts.gstatic.com`; `img-src 'self'`; `connect-src 'self'`; `base-uri 'self'`.
- `referrer-policy: strict-origin-when-cross-origin`.
- `permissions-policy`: disable `camera`, `microphone`, `geolocation`.

## Dead code

Delete unused packages: `@tanstack/react-query`, `next-themes`, `sonner`, `@radix-ui/react-toast`, `@radix-ui/react-tooltip`, `class-variance-authority`, `clsx`, `tailwind-merge`, `react-router-dom`. Move `cheerio` to `devDependencies`. Delete toast/tooltip/`use-toast`/`utils.ts`/`App.css`/`App.tsx`/`NotFound.tsx`/`components.json`/`public/placeholder.svg`. Drop sidebar CSS tokens and accordion keyframes. Tailwind `content` only `./index.html` and `./src/**/*.{ts,tsx}`. Remove unused `darkMode` and empty `prefix`.

## TypeScript, lint, tests

- `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny` on (app and root tsconfig).
- ESLint unused-vars on; ignore `_` prefix.
- Vitest + React Testing Library + jsdom. Scripts `test` and `test:watch`.
- Tests: calculate/formatters/VET/split; catalog parse; URL parse/serialize; form submit; compare toggle; URL restore without showing result; result JSON attributes.

## Quality bar (every task)

Tests green. Lint green. No unused imports or packages. No duplicate fragments. No new performance or security gaps.
