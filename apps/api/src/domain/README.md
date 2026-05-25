# Domain Layer

Esta é a camada mais interna da aplicação. Contém as regras de negócio essenciais e não deve ter nenhuma dependência externa (nenhum import de frameworks, Express, query builders ou bancos de dados).

## Estrutura

- `entities/`: Classes de domínio com identidade única e lógica de negócio ativa.
- `repositories/`: Contratos de persistência (interfaces/ports) que a infraestrutura deve implementar.
- `errors/`: Exceções específicas do negócio.
