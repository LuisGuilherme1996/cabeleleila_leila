---
trigger: model_decision
description: SOLID Principles - Aplique esta regra sempre que a tarefa envolver design orientado a objetos, princípios SOLID, inversão de dependência, herança vs composição, criação de novas classes ou segregação de interfaces.
---

# SOLID PRINCIPLES RULE

Você está trabalhando em uma tarefa que envolve princípios de design orientado a objetos ou refatoração estrutural de classes.

### Ação Obrigatória:
Antes de prosseguir, use a ferramenta `view_file` para carregar a skill de SOLID em:
`/home/luisguilherme/Documentos/projetos/desafio_dsin/.agents/skills/SOLID..md`

### Diretrizes Chave:
1. `SRP`: Garanta que cada classe/função possua um único motivo para mudar.
2. `OCP`: Use polimorfismo ou gateways para permitir novas extensões sem modificar o código existente.
3. `LSP`: As implementações devem respeitar rigorosamente os contratos das suas interfaces correspondentes.
4. `ISP`: Segregue interfaces gordas em interfaces pequenas e focadas nos clientes.
5. `DIP`: Dependa sempre de abstrações (interfaces), injetando as dependências via construtor.
