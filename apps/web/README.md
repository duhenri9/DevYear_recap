# DevYear Recap Web

Serviço web para licenciamento Stripe e landing page.

## Scripts
- `npm run dev` — Next.js dev server
- `npm run build` — build
- `npm run start` — produção

## Variáveis de ambiente
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DATABASE_URL`
- `LICENSE_ENCRYPTION_KEY` (opcional para criptografar chave em repouso)

## Endpoints
- `POST /api/stripe/checkout` — cria sessão de checkout (payload: { email, currency: BRL|EUR|GBP, successUrl, cancelUrl })
- `POST /api/stripe/webhook` — recebe eventos do Stripe, cria licença na tabela `licenses`, gera key.
- `POST /api/license/activate` — payload { licenseKey, machineId } → valida e associa máquina se houver slots.

## DB
- Drizzle schema em `src/db/schema.ts` (tabela licenses).
- Config em `DATABASE_URL` (Neon/Postgres).

## TODO
- Enviar email com license key no webhook.
- Conectar CTA da landing a um formulário que chama `/api/stripe/checkout`.
- Adicionar página de sucesso exibindo a key retornada no webhook.
