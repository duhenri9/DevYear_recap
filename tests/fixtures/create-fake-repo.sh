#!/bin/bash

# Script para criar repositório Git fake para testes

set -e

REPO_DIR="${1:-./fake-test-repo}"

echo "Criando repositório fake em: $REPO_DIR"

# Criar diretório e inicializar git
rm -rf "$REPO_DIR"
mkdir -p "$REPO_DIR"
cd "$REPO_DIR"

git init
git config user.name "Test Developer"
git config user.email "test@example.com"

# Criar commits de teste ao longo de 2024
dates=(
  "2024-01-15"
  "2024-02-10"
  "2024-03-05"
  "2024-04-20"
  "2024-05-12"
  "2024-06-08"
  "2024-07-15"
  "2024-08-22"
  "2024-09-10"
  "2024-10-05"
  "2024-11-18"
  "2024-12-01"
)

messages=(
  "feat: implement cache layer for user endpoint"
  "refactor: optimize database queries"
  "fix: resolve memory leak in payment processor"
  "perf: add indexes to critical tables"
  "feat: add OAuth 2.0 authentication support"
  "docs: update API documentation"
  "test: add integration tests for checkout flow"
  "refactor: extract payment validation logic"
  "fix: handle edge case in refund process"
  "feat: implement webhook retry mechanism"
  "perf: optimize image loading in dashboard"
  "refactor: migrate to new logging framework"
)

# Criar arquivo inicial
echo "# Test Project" > README.md
git add README.md
git commit -m "chore: initial commit" --date="2024-01-01T10:00:00"

# Criar commits com datas variadas
for i in "${!dates[@]}"; do
  echo "Feature $i" >> "feature-$i.txt"
  git add "feature-$i.txt"
  git commit -m "${messages[$i]}" --date="${dates[$i]}T10:00:00"
done

echo ""
echo "Repositório fake criado com sucesso!"
echo "Commits totais: $(git log --oneline | wc -l)"
echo "Para testar, use: npm run scan -- --repo $REPO_DIR"
