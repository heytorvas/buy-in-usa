# EUA x Brasil — Calculadora de Compras Internacionais

Calculadora client-side em [https://dolar.heytor.dev/](https://dolar.heytor.dev/) que estima o custo em reais de uma compra nos EUA: sales tax estadual + média local, PTAX do Banco Central, IOF e spread por meio de pagamento.

## Desenvolvimento

```bash
npm install
npm run dev
```

O servidor de desenvolvimento sobe em `http://127.0.0.1:8080` e também serve os JSON em `/data/*.json`.

## Testes e lint

```bash
npm test
npm run lint
```

`npm test` executa a suíte Vitest uma vez (`vitest run`). `npm run lint` roda ESLint em todo o projeto.

## Dados públicos

Os três arquivos em `src/data/` são a fonte única. Em dev e no build eles ficam disponíveis nestas URLs:

- https://dolar.heytor.dev/data/ptax.json
- https://dolar.heytor.dev/data/usa_state_tax.json
- https://dolar.heytor.dev/data/banks_spread.json

- `src/data/ptax.json` — atualizado em dias úteis por `.github/workflows/scrape-ptax.yml`
- `src/data/usa_state_tax.json` — atualizado mensalmente por `.github/workflows/scrape-state-tax.yml`
- `src/data/banks_spread.json` — spread e IOF por instituição (edição manual)

O `sitemap.xml` é emitido no build (não versionado em `public/`). O `<lastmod>` vem da data PTAX em `src/data/ptax.json`.
