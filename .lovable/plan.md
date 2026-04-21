

## Calculator UI Refinements

Apply 8 focused changes to the calculator page. No new dependencies, no logic changes beyond adding a third payment method that reuses the cash calculation path.

### 1. Remove `AppHeader`
- In `src/pages/Index.tsx`: remove `<AppHeader …/>` and its import.
- The page now starts directly with `<main>`.

### 2. Remove `BottomNav`
- In `src/pages/Index.tsx`: remove `<BottomNav />` and its import.
- Drop the `pb-32` bottom padding on `<main>` (replace with `pb-12`) since there's no fixed footer anymore.

### 3. Move PTAX info into the result detail section
- Pass `ptax` (the `PtaxResult`) as a new prop to `ResultCard` from `Index.tsx`.
- In `src/components/calculator/ResultCard.tsx`, inside the "Transparência das Taxas" card, add a new `<dt>/<dd>` block:
  - **Cotação PTAX**: shows `R$ {rate}` formatted with 4 decimals + the quote date (pt-BR) + `(cotação de referência)` suffix when `ptax.fallback` is true.
- This replaces the header badge as the single source of truth for PTAX info.

### 4. Clean up state dropdown labels
- In `src/components/calculator/StateSelect.tsx`, change the `<option>` text to just `{s.name}` (drop the ` (xx,xx%)` suffix and the `formatPercent` import if unused).

### 5. Rename "Dinheiro / Wise" → "Dinheiro"
- In `src/components/calculator/PaymentSection.tsx`, update the cash tab label to `Dinheiro`.

### 6. Add new "Conta Internacional" payment option
- Extend `PaymentMethod` type in `src/lib/calculator.ts` from `"cash" | "credit"` to `"cash" | "global" | "credit"`.
- In `calculator.ts`, treat `global` exactly like `cash` (no spread, IOF 1.1%). Concretely: `isCredit = method === "credit"`; everything else falls through to the cash path. No other math changes.
- In `PaymentSection.tsx`, replace the 2-button toggle with a 3-button toggle: `Dinheiro` | `Conta Internacional` | `Cartão de Crédito`. Keep the same pill styling; on small viewports (current 384px) buttons stack their text in 2 lines naturally — use `text-xs` and `px-2` to keep them on one row.
- The "Banco brasileiro" selector stays disabled/dimmed for both `cash` and `global`, only active for `credit` (existing `isCredit` flag already handles this).
- In `Index.tsx`, default state stays `"cash"`.

### 7. Remove "(Spread)" from bank section label
- In `PaymentSection.tsx`, change the label `Seu Banco Brasileiro (Spread)` → `Seu Banco Brasileiro`.

### 8. Smooth-scroll to result after clicking "Calcular Total"
- In `src/pages/Index.tsx`:
  - Add `id="resultado"` to the result `<section>`.
  - Wrap the calculate button's onClick: `setHasCalculated(true)` + on next tick `document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth", block: "start" })`. Use `requestAnimationFrame` (double RAF) so the section is mounted before scrolling.

### Files touched
```text
src/pages/Index.tsx                          (remove header/footer, scroll, pass ptax)
src/components/calculator/ResultCard.tsx     (add PTAX line in transparency block)
src/components/calculator/StateSelect.tsx    (clean option labels)
src/components/calculator/PaymentSection.tsx (rename, add 3rd option, drop "Spread")
src/lib/calculator.ts                        (extend PaymentMethod with "global")
```

### Files deleted (orphaned, optional cleanup)
`AppHeader.tsx` and `BottomNav.tsx` become unused. Leave them in place unless you want them removed — say the word and they go too.

### Out of scope
No changes to PTAX fetching, calculation math (beyond routing `global` → cash branch), tests, or styling tokens.

