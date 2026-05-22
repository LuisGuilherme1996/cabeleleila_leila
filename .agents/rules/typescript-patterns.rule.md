---
trigger: model_decision
description: Advanced TypeScript - Aplique esta regra sempre que a tarefa envolver tipagem avançada, checagem estrita de tipos, tipos utilitários (Utility Types), type guards, interfaces ou manipulação estrita de tipos em TypeScript.
---

# ADVANCED TYPESCRIPT PATTERNS RULE

A tarefa atual exige a manipulação ou criação de tipos ou interfaces estritas em TypeScript.

### Ação Obrigatória:
Antes de escrever código TypeScript avançado, use a ferramenta `view_file` para carregar a skill de TypeScript em:
`/home/luisguilherme/Documentos/projetos/desafio_dsin/.agents/skills/TYPESCRIPT.md`

### Diretrizes Chave:
1. Nunca use `any`. Use `unknown` com Type Guards apropriados ou schemas de validação.
2. Defina explicitamente o tipo de retorno de todas as funções públicas e Use Cases.
3. Use tipos utilitários (`Omit`, `Pick`, `Partial`) para derivar DTOs e tipos de forma limpa a partir de interfaces base ou inferências de schema Zod.
