# Fase E — Módulo Agendamentos (Backend)

> **Objetivo:** Regras transacionais para criação e gestão de agendamentos. Controle de concorrência estrito e dashboard gerencial consolidado.

---

## Checklist de Tarefas

- [x] **E-1:** Criar entidade de domínio `Agendamento` com máquina de estados de status
- [x] **E-2:** Criar repositório `Agendamento` (interface + SQL com `pg`)
- [x] **E-3:** Implementar use case **Criar Agendamento** (validação de concorrência)
- [x] **E-4:** Implementar use case **Listar Agendamentos do Usuário** (com filtros)
- [x] **E-5:** Implementar use case **Cancelar Agendamento** (antecedência mínima)
- [x] **E-6:** Implementar use cases admin: **Confirmar** e **Concluir** agendamento
- [x] **E-7:** Implementar endpoint **Dashboard Admin** (agregador)

---

## Detalhamento das Tarefas

### E-1: Criar entidade de domínio `Agendamento`

- **Tipo:** BE | **Dependência:** B-4
- **Entregável:** Classe `Agendamento` em `domain/entities/` estruturada como entidade rica. Possui uma máquina de estados de status permitindo transições válidas:
  - `PENDENTE -> CONFIRMADO -> CONCLUIDO`
  - `PENDENTE / CONFIRMADO -> CANCELADO`
- **Critério de Aceite:** Testes unitários cobrem e impedem transições inválidas (ex: tentar mover de `CANCELADO` diretamente para `CONCLUIDO` lança exceção).

### E-2: Criar repositório `Agendamento`

- **Tipo:** BE | **Dependência:** E-1
- **Entregável:** Interface `IAgendamentoRepository` na camada de domínio e a classe concreta `PgAgendamentoRepository` na camada de infraestrutura usando queries SQL com pool `pg`.
- **Critério de Aceite:** Métodos executam com sucesso contra o PostgreSQL, retornando listas de agendamentos filtrados por período, cliente e status.

### E-3: Implementar use case **Criar Agendamento**

- **Tipo:** BE | **Dependência:** E-2, D-6
- **Entregável:** Caso de uso que valida a disponibilidade do slot selecionado e persiste o agendamento no banco de dados com status `PENDENTE`. Validação de input com **Zod**.
- **Critério de Aceite:**
  1. Agendamento é criado com sucesso caso o horário esteja livre.
  2. Retorna `409 Conflict` se houver colisão de horário (concorrência).
  3. Impede agendamentos com menos de 1 hora de antecedência em relação à hora atual.
- **Guia de Implementação:**
  - Para evitar problemas de concorrência (duas pessoas clicando no mesmo slot de forma simultânea), usar transação PostgreSQL com `SELECT ... FOR UPDATE` ou advisory locks, ou usar o Redis com lock distribuído (`redlock`) antes da persistência no banco.

### E-4: Implementar use case **Listar Agendamentos do Usuário**

- **Tipo:** BE | **Dependência:** E-2, C-8
- **Entregável:** Endpoint `GET /agendamentos` com suporte a filtros de paginação, período e status.
- **Critério de Aceite:** Se o usuário logado for `CLIENTE`, o retorno é filtrado para exibir exclusivamente os agendamentos dele. Se for `ADMIN`, lista todos os agendamentos do salão.

### E-5: Implementar use case **Cancelar Agendamento**

- **Tipo:** BE | **Dependência:** E-2, C-8
- **Entregável:** Endpoint `PATCH /agendamentos/:id/cancelar`.
- **Critério de Aceite:**
  1. Altera o status para `CANCELADO` e libera o horário correspondente.
  2. Clientes só podem cancelar agendamentos futuros se a antecedência for maior ou igual a 2 horas (caso contrário, lança erro de domínio `400 Bad Request`).
  3. Administradores podem cancelar qualquer agendamento a qualquer momento.

### E-6: Implementar use cases admin: **Confirmar** e **Concluir**

- **Tipo:** BE | **Dependência:** E-2, C-8
- **Entregável:** Endpoints `PATCH /agendamentos/:id/confirmar` e `PATCH /agendamentos/:id/concluir`.
- **Critério de Aceite:** Atualiza os estados seguindo a máquina de estados definida em E-1. Rota de acesso exclusivo a `ADMIN`.

### E-7: Implementar endpoint **Dashboard Admin**

- **Tipo:** BE | **Dependência:** E-2, C-8
- **Entregável:** Rota `GET /admin/dashboard`.
- **Critério de Aceite:** Retorna contadores agregados por status da data corrente, volume de faturamento estimado (soma dos preços de agendamentos confirmados/concluídos) e uma lista com os próximos 5 agendamentos ordenados por horário.
- **Guia de Implementação:**
  - Escrever queries SQL eficientes com `GROUP BY`, `COUNT`, `SUM` e `ORDER BY` para evitar gargalos de memória no servidor.
