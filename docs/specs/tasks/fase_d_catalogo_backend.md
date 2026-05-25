# Fase D — Módulo Catálogo (Backend)

> **Objetivo:** CRUD completo de serviços, horários de funcionamento e bloqueios de agenda. Cálculo dinâmico de disponibilidade de slots livres.

---

## Checklist de Tarefas

- [x] **D-1:** Criar entidades de domínio (`Servico`, `HorarioFuncionamento`, `BloqueioAgenda`)
- [x] **D-2:** Criar repositórios (interfaces + implementações SQL com `pg`)
- [x] **D-3:** Implementar **CRUD de Serviços** (Admin protegida)
- [x] **D-4:** Implementar **CRUD de Horários de Funcionamento** (Admin protegida)
- [x] **D-5:** Implementar **CRUD de Bloqueios de Agenda** (Admin protegida)
- [x] **D-6:** Implementar endpoint público **Listar Horários Disponíveis**

---

## Detalhamento das Tarefas

### D-1: Criar entidades de domínio

- **Tipo:** BE | **Dependência:** B-3
- **Entregável:** Classes de domínio em `domain/entities/` contendo validações específicas para criação de serviços, horários úteis e bloqueios (ex: hora de término deve ser posterior à hora de início).
- **Critério de Aceite:** Testes unitários validam as restrições e regras de validação das classes puras.

### D-2: Criar repositórios (Portas e Adaptadores)

- **Tipo:** BE | **Dependência:** D-1, B-3
- **Entregável:** Interfaces abstratas na camada de domínio e suas implementações concretas sob a infraestrutura usando queries SQL com pool `pg` (`PgServicoRepository`, `PgHorarioFuncionamentoRepository`, etc.).
- **Critério de Aceite:** Métodos CRUD executam queries SQL corretas e retornam dados tipados sem vazamento de escopo de infraestrutura.

### D-3: Implementar **CRUD de Serviços**

- **Tipo:** BE | **Dependência:** D-2, C-8
- **Entregável:** Rotas `GET`, `POST`, `PUT`, `DELETE` (ou `PATCH /ativo` para exclusão lógica) no `servicosRouter`. Validação de payloads com **Zod**.
- **Critério de Aceite:** Clientes comuns só podem consultar serviços ativos; apenas administradores (`ADMIN`) podem criar, alterar ou inativar serviços do catálogo.

### D-4: Implementar **CRUD de Horários de Funcionamento**

- **Tipo:** BE | **Dependência:** D-2, C-8
- **Entregável:** Router e use cases que permitem configurar a grade de trabalho por dia da semana (0 a 6). Validação com **Zod**.
- **Critério de Aceite:** Restrições aplicadas impedem o cadastro de horários sobrepostos no mesmo dia e salvam no formato string `HH:MM`. Acesso exclusivo ao perfil `ADMIN`.

### D-5: Implementar **CRUD de Bloqueios de Agenda**

- **Tipo:** BE | **Dependência:** D-2, C-8
- **Entregável:** Endpoints de gestão de bloqueios pontuais (ex: feriados ou manutenção) contendo data de início, data de fim e descrição. Validação com **Zod**.
- **Critério de Aceite:** O sistema persiste os bloqueios com sucesso no banco de dados. Acesso restrito a `ADMIN`.

### D-6: Implementar endpoint público **Listar Horários Disponíveis**

- **Tipo:** BE | **Dependência:** D-2, D-3, D-4, D-5, B-4
- **Entregável:** Endpoint `GET /disponibilidade?data=YYYY-MM-DD&servico_id=xxx`.
- **Critério de Aceite:** Retorna uma grade de slots disponíveis considerando a duração do serviço selecionado. Slots que coincidam com horários de fechamento do salão, bloqueios de agenda ativos ou outros agendamentos existentes no mesmo intervalo devem ser retornados com flag `disponivel: false`.
- **Guia de Implementação:**
  - O algoritmo de disponibilidade deve carregar o horário operacional do dia da semana correspondente.
  - Gerar slots de hora em hora ou fragmentados de acordo com um grid básico (ex: a cada 30 ou 45 minutos).
  - Filtrar os slots cruzando com os registros na tabela `agendamentos` e `bloqueios_agenda` cuja interseção temporal invalide a prestação do serviço selecionado.
