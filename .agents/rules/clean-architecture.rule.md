---
trigger: model_decision
description: Clean Architecture - Aplique esta regra sempre que a tarefa envolver arquitetura de software, estruturação de camadas (Domain, Application, Infrastructure, Presentation), criação de Use Cases, Entidades de Domínio ou interfaces de Repositório.
---

# CLEAN ARCHITECTURE RULE

Você está trabalhando em uma tarefa que envolve a arquitetura estrutural do projeto.

### Ação Obrigatória:

Antes de escrever qualquer código estrutural, use a ferramenta `view_file` para carregar a skill de Clean Architecture em:
`/home/luisguilherme/Documentos/projetos/desafio_dsin/.agents/skills/CLEAN-ARCHITECTURE.md`

### Diretrizes Chave:

1. Respeite rigidamente a direção das dependências (apontando sempre para dentro, em direção ao Domínio).
2. Use Cases representam ações únicas de negócio e dependem de abstrações (interfaces), nunca de implementações.
3. Entidades de Domínio são ricas e encapsulam a validação e as regras de negócio essenciais.
