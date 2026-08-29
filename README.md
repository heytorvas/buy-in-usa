# EUA x Brasil — Calculadora de Compras Internacionais

Calculadora client-side em [https://dolar.heytor.dev/](https://dolar.heytor.dev/) que estima o custo em reais de uma compra nos EUA: sales tax estadual + média local, PTAX do Banco Central, IOF e spread por meio de pagamento.

## Desenvolvimento

```bash
bun install
bun run dev
```

## Dados

- `src/data/ptax.json` — atualizado em dias úteis por `.github/workflows/scrape-ptax.yml`
- `src/data/usa_state_tax.json` — atualizado mensalmente por `.github/workflows/scrape-state-tax.yml`
- `src/data/banks_spread.json` — spread e IOF por instituição (edição manual)
