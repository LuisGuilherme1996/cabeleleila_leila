---
trigger: model_decision
description: Anti-patterns and Code Smells - Aplique esta regra sempre que a tarefa envolver auditoria de código, revisão de pull requests (PR), refatoração de códigos de terceiros ou identificação de falhas de performance/segurança/design.
---

# ANTI-PATTERNS RULE

Você está auditando ou refatorando código complexo e precisa garantir que nenhum anti-padrão prejudicial seja introduzido ou mantido.

### Ação Obrigatória:
Antes de propor melhorias, use a ferramenta `view_file` para carregar a skill de Anti-padrões em:
`/home/luisguilherme/Documentos/projetos/desafio_dsin/.agents/skills/ANTIPATTERNS.md`

### Diretrizes Chave:
1. Identifique e previna modelos de domínio anêmicos movendo a lógica de validação/negócio para dentro das entidades.
2. Não permita vazamento de modelos do banco de dados (ORM) nas rotas externas (use DTOs e Mappers).
3. Nunca silencie erros (error swallowing) e evite lançar exceções genéricas sem tipagem adequada.
4. Previna problemas de performance como consultas N+1 fazendo eager loading (joins) no banco de dados.
