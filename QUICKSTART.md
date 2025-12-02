# DevYear Recap - Guia Rápido de Instalação

## 1. Instalar Dependências

```bash
# Raiz
npm install

# Web app
cd apps/web
npm install
cd ../..
```

## 2. Configurar Variáveis de Ambiente

### CLI (raiz do projeto)

```bash
cp .env.example .env
```

Editar `.env` e adicionar:
```bash
OPENAI_API_KEY=sk-proj-... # Obtenha em platform.openai.com
```

### Web App

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Editar `apps/web/.env.local` e adicionar:
```bash
# Neon (console.neon.tech)
DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/devyear

# Stripe (dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (resend.com)
RESEND_API_KEY=re_...
FROM_EMAIL=DevYear <noreply@seudominio.com>

# JWT (gere com: openssl rand -base64 32)
LICENSE_JWT_SECRET=xxxxx
```

## 3. Setup Banco de Dados

```bash
cd apps/web
npm run db:push
cd ../..
```

## 4. Testar Localmente

### Testar Web App

```bash
cd apps/web
npm run dev
```

Abrir: http://localhost:3000

### Testar CLI

```bash
# Criar repo fake
./tests/fixtures/create-fake-repo.sh

# Testar sem IA (rápido)
npm run scan -- --repo ./tests/fixtures/fake-test-repo --out test-report.md

# Testar com IA (requer OPENAI_API_KEY)
npm run scan -- --repo ./tests/fixtures/fake-test-repo --use-ai --out test-report.md

# Ver relatório
cat test-report.md
```

## 5. Testar Fluxo de Compra (Modo Teste)

1. Acessar http://localhost:3000
2. Preencher email: `test@example.com`
3. Clicar "Comprar agora"
4. Usar cartão teste Stripe: `4242 4242 4242 4242`
   - Data: qualquer futura
   - CVC: `123`
5. Verificar página de sucesso com license key
6. Copiar chave
7. Ativar no CLI:
   ```bash
   npm run scan -- --license <SUA_CHAVE>
   ```

## 6. Deploy (Opcional)

### Vercel

```bash
cd apps/web
vercel
```

Configurar env vars no dashboard Vercel.

## Troubleshooting

### "OPENAI_API_KEY não configurada"
Solução: Adicionar chave no `.env`

### "DATABASE_URL não configurada"
Solução: Criar banco no Neon e adicionar URL em `apps/web/.env.local`

### Testes falhando
Solução: Verificar se todas as env vars estão configuradas

### Cache problemas
Solução:
```bash
npm run scan -- --clear-cache
```

## Próximos Passos

Ver documentação completa em: `IMPLEMENTATION_SUMMARY.md`
