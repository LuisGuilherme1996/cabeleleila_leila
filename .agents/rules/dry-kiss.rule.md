---
trigger: model_decision
description: DRY & KISS Principles - Aplique esta regra sempre que a tarefa envolver simplificação de código, refatoração de lógica repetida, remoção de duplicações, criação de utilitários reutilizáveis ou simplificação de algoritmos.
---

# DRY & KISS RULE

Você está executando uma tarefa focada na simplificação de código, legibilidade ou refatoração.

### Ação Obrigatória:

Antes de fazer alterações, use a ferramenta `view_file` para carregar a skill DRY & KISS em:
`/home/luisguilherme/Documentos/projetos/desafio_dsin/.agents/skills/DRY-KISS.md`

### Diretrizes Chave:

1. Elimine constantes mágicas e centralize representações únicas de conhecimento (DRY).
2. Escreva funções pequenas, focadas em fazer apenas uma coisa (Single Responsibility/KISS).
3. Prefira early returns (guard clauses) para evitar aninhamento profundo de blocos if/else.
4. Escreva nomes de variáveis e funções tão expressivos que dispensem comentários explicativos.
