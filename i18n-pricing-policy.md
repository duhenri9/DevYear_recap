# DevYear Recap — Política de Internacionalização e Precificação

Objetivo: garantir experiência consistente em PT-BR, EN e ES com preços fixos e exibição correta de moeda.

## Idiomas suportados
- pt-BR (default)
- en
- es

Regras:
- Detectar pelo locale do sistema ou preferências do usuário; sempre permitir troca manual.
- Fallback: se não detectar/propagar locale, usar pt-BR.
- Strings de UI devem estar externalizadas em arquivos de mensagem (ex.: `locales/pt.json`, `locales/en.json`, `locales/es.json`).
- Evitar concatenar texto + variáveis sem placeholders nomeados para não quebrar gramática.

## Precificação fixa por moeda
- BRL: R$ 25,00 (fixo)
- EUR: € 5,00 (fixo)
- GBP: £ 5,00 (fixo)

Regras de exibição:
- Não converter valores; são tabelados.
- Mostrar símbolo e código: ex. `R$ 25,00`, `€5`, `£5`.
- Ao mencionar preço em texto de marketing ou paywall, usar a mesma forma do botão de compra.
- Em recibos ou confirmações, incluir: valor, moeda, data, e e-mail do comprador.

## Seleção de moeda
- Regra simples: se locale começa com `pt`, usar BRL; se `en` ou `es` e país = UK, usar GBP; se `en` ou `es` e país na UE, usar EUR; senão default BRL.
- Sempre mostrar opção manual para trocar moeda (dropdown ou flags minimalistas).
- Persistir escolha do usuário (ex.: arquivo local ou config CLI).

## Mensagens recomendadas (exemplos)
- PT-BR: "Acesse o relatório completo por R$ 25,00."
- EN: "Unlock the full report for €5." (ou "for £5" se moeda selecionada for GBP)
- ES: "Desbloquea el informe completo por €5." (ou "£5" se GBP)

## Implementação (UI/CLI)
- UI: manter chaves de texto por contexto (`cta.paywall`, `copy.price_tag`, `receipt.title`) nos três arquivos de locale.
- CLI: usar mensagens curtas e coerentes com a tabela de preços fixa.
- Payment button: exibir moeda selecionada no label.

## Testes recomendados
- Verificar locale pt-BR → BRL mostrado; en-US → fallback BRL; en-GB → GBP; en-IE/es-ES → EUR.
- Troca manual de idioma não altera o valor (apenas tradução).
- Troca manual de moeda mantém textos e moeda selecionada.
- Recibos mostram moeda e valor corretos e não convertem.

## Observações
- Não realizar conversão automática por câmbio.
- Qualquer desconto ou cupom deve ser aplicado sobre o valor tabelado da moeda escolhida.
