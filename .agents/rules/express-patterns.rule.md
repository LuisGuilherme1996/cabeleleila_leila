---
trigger: model_decision
description: Web Framework Patterns - Aplique esta regra sempre que a tarefa envolver criação ou modificação de rotas HTTP, Controllers NestJS ou Express, Middlewares de validação/segurança, tratamento global de erros ou autenticação/autorização.
---

# WEB FRAMEWORK PATTERNS RULE

Você está lidando com a camada de Apresentação (Presentation/Web) da aplicação.

### Ação Obrigatória:
Antes de codificar rotas, controllers ou middlewares, use a ferramenta `view_file` para carregar a skill correspondente em:
`/home/luisguilherme/Documentos/projetos/desafio_dsin/.agents/skills/EXPRESS.md`

### Diretrizes Chave:
1. Controllers devem ser extremamente enxutos (thin controllers), sem lógica de negócio ou queries SQL/ORM.
2. Todas as entradas HTTP (body, params, query) devem ser validadas na borda imediatamente (ex: schemas Zod).
3. Erros devem ser capturados e encaminhados para tratamento centralizado no Middleware/Filter global de Exceções.
