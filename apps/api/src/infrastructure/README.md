# Infrastructure Layer

Esta camada contém as implementações concretas dos detalhes tecnológicos de persistência, cache, segurança e comunicação externa.

## Estrutura

- `repositories/`: Implementações concretas dos repositórios usando SQL puro (módulo `pg`).
- `config/`: Arquivos de configuração de banco de dados, Redis, CORS, etc.
- `providers/`: Adaptadores para serviços de terceiros (email, sms, auth externo).
