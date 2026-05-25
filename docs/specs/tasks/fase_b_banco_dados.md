# Fase B — Banco de Dados & Migrations

> **Objetivo:** Ter todas as tabelas criadas, migrations SQL versionadas e dados de seed configurados para o desenvolvimento ágil do MVP.

---

## Checklist de Tarefas

- [x] **B-1:** Configurar pool de conexão PostgreSQL com `pg` no `apps/api/`
- [x] **B-2:** Criar migrations SQL do **Módulo IAM**
- [x] **B-3:** Criar migrations SQL do **Módulo Catálogo**
- [x] **B-4:** Criar migration SQL do **Módulo Agendamentos**
- [x] **B-5:** Criar seed script padrão

---

## Detalhamento das Tarefas

### B-1: Configurar pool de conexão PostgreSQL com `pg`

- **Tipo:** DB/BE | **Dependência:** A-3, A-6
- **Entregável:** Módulo `infrastructure/database/pool.ts` com pool de conexão `pg` configurado, helper de query tipado e um runner de migrations.
- **Critério de Aceite:** Pool conecta com sucesso ao container PostgreSQL local (configurado em A-6) e executa uma query `SELECT NOW()` sem erros.
- **Guia de Implementação:**
  - Instalar `pg` e `@types/pg` no `apps/api/`.
  - Criar pool usando `DATABASE_URL` do `.env`.
  - Criar helper genérico de query com tipagem TypeScript: `query<T>(sql: string, params?: any[]): Promise<T[]>`.
  - Criar runner de migrations que executa arquivos `.sql` em ordem sequencial.

### B-2: Criar migrations SQL do **Módulo IAM**

- **Tipo:** DB | **Dependência:** B-1
- **Entregável:** Arquivos `.sql` em `apps/api/migrations/` com DDL para criação das tabelas `usuarios`, `perfis`, `usuario_perfis`, `conexoes_oauth`, `sessoes_refresh_token` e `tokens_acao`, incluindo types/enums, constraints e índices.
- **Critério de Aceite:** Executar o runner de migrations cria com sucesso as tabelas e aplica as restrições e relacionamentos no banco.
- **Guia de Implementação:**
  - Usar `CREATE TYPE` para enums (`tipo_token_acao`).
  - Usar `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` para geração de UUIDs.
  - Assegurar que as senhas em `usuarios` e tokens no `sessoes_refresh_token` possuem tamanho adequado para armazenar hashes e dados assinados (VARCHAR(255) e VARCHAR(500)).

### B-3: Criar migrations SQL do **Módulo Catálogo**

- **Tipo:** DB | **Dependência:** B-1
- **Entregável:** Arquivos `.sql` com DDL para criação das tabelas `servicos`, `horarios_funcionamento` e `bloqueios_agenda`.
- **Critério de Aceite:** Execução da migration cria as tabelas no PostgreSQL com restrição de chave única em `dia_semana` do horário de funcionamento e índices em `ativo` dos serviços.
- **Guia de Implementação:**
  - Configurar o tipo `NUMERIC(10,2)` para o preço do serviço para evitar erros de ponto flutuante em JavaScript.
  - O campo `dia_semana` deve ser do tipo `INTEGER` com restrição `UNIQUE` para evitar grades duplicadas para o mesmo dia.

### B-4: Criar migration SQL do **Módulo Agendamentos**

- **Tipo:** DB | **Dependência:** B-2, B-3
- **Entregável:** Arquivo `.sql` com DDL para a tabela `agendamentos` com relacionamentos para `usuarios` (como cliente) e `servicos` (como serviço prestado).
- **Critério de Aceite:** A migration aplica sem erros no banco de dados e as restrições de Foreign Key (FK) são validadas (CASCADE no cliente e RESTRICT no serviço para impedir deleção acidental de serviços associados a agendamentos).
- **Guia de Implementação:**
  - Criar `CREATE TYPE status_agendamento AS ENUM ('PENDENTE', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO')`.
  - Adicionar índices sobre `(data_hora, status)` para otimizar a rota pública de checagem de horários disponíveis.

### B-5: Criar seed script padrão

- **Tipo:** DB | **Dependência:** B-4
- **Entregável:** Script `scripts/seed.ts` configurado para povoar o banco local usando queries SQL diretas via pool `pg`.
- **Critério de Aceite:** Executar `npx tsx scripts/seed.ts` insere com sucesso:
  1. Perfis `ADMIN` e `CLIENTE`.
  2. Um usuário administrador inicial (`leila@cabeleleila.com` com senha hasheada).
  3. Quatro serviços padrão com durações de 30 a 90 minutos.
  4. Grade padrão de funcionamento (Segunda a Sábado, das 08:00 às 18:00).
- **Guia de Implementação:**
  - Escrever o script usando TypeScript com `tsx` como executor.
  - Utilizar a biblioteca `argon2` no seed para encriptar a senha do administrador inicial.
  - Usar `INSERT ... ON CONFLICT DO NOTHING` para tornar o seed idempotente.
