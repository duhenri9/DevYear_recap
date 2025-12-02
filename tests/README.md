# DevYear Recap - Testes

## Estrutura de Testes

```
tests/
├── fixtures/               # Dados de teste
│   ├── mock-ai-response.json    # Mock de resposta OpenAI
│   ├── create-fake-repo.sh      # Script para criar repo Git fake
│   └── fake-test-repo/          # Repo fake (criado pelo script)
├── run-tests.ts           # Testes unitários básicos
└── README.md              # Este arquivo

apps/web/e2e/              # Testes E2E Playwright (web)
├── landing.spec.ts        # Testes da landing page
└── checkout.spec.ts       # Testes do fluxo de checkout
```

## Testes Unitários (CLI)

Testes simples de lógica de negócio:

```bash
npm test
```

## Testes E2E (Web)

### Pré-requisitos

1. Instalar dependências do web app:
```bash
cd apps/web
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp apps/web/.env.local.example apps/web/.env.local
# Editar .env.local com valores de teste
```

### Executar testes

```bash
# Rodar todos os testes E2E
cd apps/web
npx playwright test

# Rodar com interface visual
npx playwright test --headed

# Rodar teste específico
npx playwright test landing.spec.ts

# Ver relatório
npx playwright show-report
```

## Criar Repositório Fake para Testes do CLI

```bash
# Criar repo fake com 12 commits de exemplo
./tests/fixtures/create-fake-repo.sh

# Testar CLI com o repo fake
npm run scan -- --repo ./tests/fixtures/fake-test-repo --out test-report.md

# Testar com IA mockada (requer implementação adicional)
# npm run scan -- --repo ./tests/fixtures/fake-test-repo --use-ai --mock
```

## Testar Fluxo Completo (Manual)

### 1. Setup Ambiente de Teste

```bash
# Copiar variáveis de ambiente
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local

# Configurar chaves de teste
# - STRIPE_SECRET_KEY=sk_test_xxx
# - DATABASE_URL=postgres://... (usar banco de teste)
# - RESEND_API_KEY=re_xxx
# - OPENAI_API_KEY=sk-xxx
```

### 2. Testar Web App

```bash
cd apps/web
npm run dev
```

Acessar http://localhost:3000 e:
1. Preencher email
2. Clicar em "Comprar agora"
3. Usar cartão de teste Stripe: `4242 4242 4242 4242`
4. Verificar página de sucesso com license key
5. Verificar email recebido

### 3. Testar CLI

```bash
# Criar repo fake
./tests/fixtures/create-fake-repo.sh

# Ativar licença
npm run scan -- --license SUA_CHAVE_DE_TESTE

# Gerar relatório
npm run scan -- --repo ./tests/fixtures/fake-test-repo --use-ai --out test-report.md

# Verificar arquivo
cat test-report.md
```

## Cartões de Teste Stripe

- Sucesso: `4242 4242 4242 4242`
- Falha: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

Data de validade: qualquer data futura
CVC: qualquer 3 dígitos
CEP: qualquer

## Troubleshooting

### Testes E2E falhando

1. Verificar se servidor Next.js está rodando
2. Verificar se DATABASE_URL está configurado
3. Limpar cache: `rm -rf apps/web/.next`

### CLI não encontra licença

1. Limpar cache: `npm run scan -- --clear-cache`
2. Limpar licença local: `npm run scan -- --clear-license`
3. Reativar com `--license`

### IA retornando erro

1. Verificar OPENAI_API_KEY
2. Verificar se tem créditos na conta OpenAI
3. Testar com modelo mais barato: `--model gpt-4o-mini`
