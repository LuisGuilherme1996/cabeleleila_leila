# Application Layer

Esta camada orquestra o fluxo de dados de e para as entidades de domínio.

## Estrutura

- `use-cases/`: Representações de ações únicas do sistema (comandos de negócio).
- `dtos/`: Data Transfer Objects para transporte estruturado de entrada e saída.
- `mappers/`: Conversões entre entidades de domínio, DTOs e formatos de persistência.
