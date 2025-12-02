# DevYear Recap – Design System Starter

This repository now ships a CSS token file that mirrors the provided palette, gradients, radii, shadows, and component recipes.

## Files
- `design-tokens.css`: CSS custom properties plus ready-to-use styles for cards, CTA button, inputs, badges, blurred navbar, feature grid, blobs, and animations.
- `i18n-pricing-policy.md`: Fixed-price (R$25, €5, £5) and locale rules (pt-BR default, en, es).
- `src/config/pricing.ts`: Currency detection and fixed table lookup (no conversion).
- `src/config/store.ts`: Load/save/clear user locale/currency selection to `.devyear-config.json`.
- `src/i18n/locales.ts`: Locale messages and interpolation helper.
- `src/paywall.ts`: Builds paywall/receipt strings from locale + currency inputs.
- `src/index.ts`: CLI preview of paywall strings using locale/currency rules.
- `tests/run-tests.ts`: Minimal assertions for currency mapping and config persistence.
- `public/index.html` + `public/app.js`: Browser preview with locale/currency selectors calling the API.
- `src/server.ts`: Static server with routes (`/app`, `/paywall`, `/report`) and API endpoints.
- `src/aggregation/summary.ts`: Agrupa commits por repo/tema para o prompt da IA.
- `src/llm/openai.ts`: Cliente OpenAI para gerar relatório com prompt runtime.
- `src/export/pdf.ts`: Gera PDF simples a partir do Markdown.
- `src/cli.ts`: Agora suporta `--use-ai`, `--model`, `--pdf`, `--year`, `--until`.
- `apps/web`: esqueleto do serviço web (Next.js) com endpoints Stripe/License e Drizzle schema.

## Quick usage (UI tokens)
1) Import the stylesheet in your page or bundle:
```html
<link rel="stylesheet" href="./design-tokens.css" />
```
2) Apply the helper classes:
```html
<div class="container">
  <nav class="nav-blur">
    <span class="badge">DevYear Recap</span>
  </nav>

  <section class="card animate-fade-in">
    <h1 class="text-gradient">Seu relatorio em 30s</h1>
    <p>Conecte repos locais e gere o texto final com provas (PRs, tickets).</p>

    <div style="display:flex; gap:var(--space-4); align-items:center; margin-top:var(--space-6);">
      <input class="input" placeholder="seu-email@exemplo.com" />
      <button class="btn-primary">Gerar relatorio</button>
    </div>
  </section>

<div class="grid-features" style="margin-top:var(--space-8);">
  <div class="card animate-fade-in-up delay-100">Feature 1</div>
  <div class="card animate-fade-in-up delay-200">Feature 2</div>
  <div class="card animate-fade-in-up delay-300">Feature 3</div>
</div>
</div>

<!-- Background glows -->
<div class="background-blob blue" style="top:-160px; left:-120px;"></div>
<div class="background-blob emerald" style="bottom:-180px; right:-140px;"></div>
<div class="background-blob cyan" style="top:30%; left:30%;"></div>
```

## Notes
- Colors, gradients, shadows, radii, and opacity levels match the provided system (blue/emerald/cyan on dark surfaces).
- Animations include `animate-fade-in`, `animate-fade-in-up`, and the `spinner` utility; use delay classes (`delay-100`, `delay-200`, etc.) for staggered reveals.
- Typography uses the system sans stack; headline sizing maps to the hero/section/card specs.
- Max widths mirror Tailwind defaults (`max-w-4xl`, `max-w-7xl`, etc.) for consistent layout scales.

## Quick usage (i18n + pricing)
1) Install deps (once): `npm install`
2) Run the preview CLI with locale/currency overrides:
```bash
npx ts-node src/index.ts --locale en-GB --currency GBP
```
Output will always respect the fixed prices (R$25, €5, £5) and translate strings for pt-BR/en/es. Locale detection defaults to pt-BR; en-GB forces GBP; en-IE/es-ES force EUR; others fall back to BRL. Manual `--currency` overrides the detection without converting values.

### Persisting preferences
- Save choices: `npx ts-node src/index.ts --locale es-ES --currency EUR --save`
- Clear saved config: `npx ts-node src/index.ts --clear-config`
- Optional: point to custom config path (useful for tests) with `--config-path /tmp/devyear.json`

### Tests
Run `npm test` to cover locale→currency mapping and config persistence.

## Preview server (port 3004)
1) Install deps: `npm install`
2) Start preview: `npm run preview` (defaults to http://localhost:3004)
3) Open the page to see the paywall copy with locale/currency selectors. Prices remain fixed: R$25, €5, £5. Use the dropdowns to override detection (stored in `localStorage`).

## CLI — gerar relatório com idioma
- Usar repo atual: `npm run scan` (salva `report.md`)
- Customizar: `npx ts-node src/cli.ts --repo /caminho/projeto --since 2024-01-01 --lang en --year 2024 --out report.md`
- Idiomas suportados no relatório: `--lang pt|en|es` (padrão pt). Títulos e mensagens de impacto seguem o idioma escolhido; mensagens de commit permanecem como no repo.
- Usar IA (OpenAI): adicionar `--use-ai --model gpt-4o-mini` (ou defina `OPENAI_MODEL`); exige `OPENAI_API_KEY` setada.
- Exportar PDF: `--pdf report.pdf` (usa `pdfkit` simples).

## Routes e APIs
- Rotas web: `/` (redirect para `/app`), `/app`, `/paywall`, `/report` (servidas pelo mesmo HTML).
- API: `GET /api/paywall?locale=xx&currency=BRL|EUR|GBP` → retorna o texto do paywall com base na detecção/regras fixas.
- API: `GET /api/config` → config persistida; `POST /api/config` com `{ locale, currency }`; `DELETE /api/config` limpa arquivo.
- Healthcheck: `GET /health` → `{ status: "ok" }`.

## Ambiente
- IA: set `OPENAI_API_KEY` (opcional `OPENAI_MODEL`).
- Stripe/DB/licença: ainda em stub; adicionar `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL` quando integrar o serviço web.
- Exemplo: `.env.example` incluso.

## TODO principais (seguindo o plano)
- Completar integração Stripe (webhook + checkout) e ligar landing ao endpoint `/api/stripe/checkout`.
- Stripe refund automation disponível via `/api/stripe/refund` (requer STRIPE_SECRET_KEY) — enviar `paymentIntentId` ou `chargeId`.
- Conectar Jira/PR ingest ao pipeline de geração (CLI/rotas).
- Adicionar testes E2E com Playwright MCP (landing → Stripe teste → licença → ativação → geração .md com IA mock).
- Empacotar Tauri/React reutilizando `design-tokens.css` e endpoints atuais.
