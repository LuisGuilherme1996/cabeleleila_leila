# Fase B — Banco de Dados & ORM

> **Objetivo:** Ter todas as tabelas criadas, migrations versionadas e dados de seed configurados para o desenvolvimento ágil do MVP.

---

## Checklist de Tarefas

- [ ] **B-1:** Instalar e configurar Prisma ORM no `apps/api/` conectando ao PostgreSQL
- [ ] **B-2:** Modelar tabelas do **Módulo IAM**
- [ ] **B-3:** Modelar tabelas do **Módulo Catálogo**
- [ ] **B-4:** Modelar tabela do **Módulo Agendamentos**
- [ ] **B-5:** Criar seed script padrão

---

## Detalhamento das Tarefas

### B-1: Instalar e configurar Prisma ORM no `apps/api/`
* **Tipo:** DB/BE | **Dependência:** A-3, A-6
* **Entregável:** Pasta `apps/api/prisma/` com `schema.prisma` inicial configurado com datasource Postgres e client generator.
* **Critério de Aceite:** O comando `npx prisma db push` conecta com sucesso ao container Postgres local (configurado em A-6) e valida a conexão sem erros.
* **Guia de Implementação:**
  * Instalar `@prisma/client` e `prisma` como dependência de desenvolvimento no `apps/api/`.
  * Executar `npx prisma init` e ajustar a variável `DATABASE_URL` no `.env` apontando para o Docker Postgres.

### B-2: Modelar tabelas do **Módulo IAM**
* **Tipo:** DB | **Dependência:** B-1
* **Entregável:** Adição dos modelos `Usuario`, `Perfil`, `UsuarioPerfil`, `ConexaoOauth`, `SessaoRefreshToken` e `TokenAcao` ao `schema.prisma`.
* **Critério de Aceite:** Executar `npx prisma migrate dev --name init_iam` cria com sucesso o histórico SQL e aplica as restrições e relacionamentos no banco.
* **Guia de Implementação:**
  * Utilizar os modelos especificados no documento de design de banco de dados (`docs/design/database.md`).
  * Assegurar que as senhas em `Usuario` e tokens no `SessaoRefreshToken` possuem tamanho adequado para armazenar hashes e dados assinados (VarChar 255 e VarChar 500).

### B-3: Modelar tabelas do **Módulo Catálogo**
* **Tipo:** DB | **Dependência:** B-1
* **Entregável:** Adição dos modelos `Servico`, `HorarioFuncionamento` e `BloqueioAgenda` no `schema.prisma`.
* **Critério de Aceite:** Execução da migração cria as tabelas no PostgreSQL com restrição de chave única em `dia_semana` do horário de funcionamento e índices em `ativo` dos serviços.
* **Guia de Implementação:**
  * Configurar o tipo `Decimal(10,2)` para o preço do serviço para evitar erros de ponto flutuante em JavaScript.
  * O campo `dia_semana` deve ser do tipo `Int` com restrição `@unique` para evitar grades duplicadas para o mesmo dia.

### B-4: Modelar tabela do **Módulo Agendamentos**
* **Tipo:** DB | **Dependência:** B-2, B-3
* **Entregável:** Adição do modelo `Agendamento` com relacionamentos para `Usuario` (como cliente) e `Servico` (como serviço prestado).
* **Critério de Aceite:** A migração aplica sem erros no banco de dados e as restrições de Foreign Key (FK) são validadas (Cascade no cliente e Restrict no serviço para impedir deleção acidental de serviços associados a agendamentos).
* **Guia de Implementação:**
  * Adicionar enum `StatusAgendamento` com os valores: `PENDENTE`, `CONFIRMADO`, `CONCLUIDO`, `CANCELADO`.
  * Adicionar índices sobre `(data_hora, status)` para otimizar a rota pública de checagem de horários disponíveis.

### B-5: Criar seed script padrão
* **Tipo:** DB | **Dependência:** B-4
* **Entregável:** Script `prisma/seed.ts` configurado para povoar o banco local.
* **Critério de Aceite:** Executar `npx prisma db seed` insere com sucesso:
  1. Perfis `ADMIN` e `CLIENTE`.
  2. Um usuário administrador inicial (`leila@cabeleleila.com` com senha hasheada).
  3. Quatro serviços padrão com durações de 30 a 90 minutos.
  4. Grade padrão de funcionamento (Segunda a Sábado, das 08:00 às 18:00).
* **Guia de Implementação:**
  * Escrever o script usando TypeScript.
  * Utilizar `ts-node` configurado no `package.json` sob a chave `"prisma": { "seed": "ts-node prisma/seed.ts" }`.
  * Utilizar a biblioteca `argon2` no seed para encriptar a senha do administrador inicial.
