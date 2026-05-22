# 💇‍♀️ Cabeleleila Leila — Sistema de Agendamento & Gestão

> Sistema de Agendamentos Online e Gestão de Salão de Beleza de Alta Performance e Design Ultra Premium.
> 
> Projeto estruturado em monorepo utilizando **NestJS (Clean Architecture)** no backend, **Angular 21 (Signals & )** no frontend, persistência com **PostgreSQL + Prisma ORM** e cache/rate-limiting com **Redis**.

---

## 📂 Estrutura de Documentação do Projeto

A engenharia e o design de software deste projeto foram minuciosamente documentados para garantir a máxima qualidade de código, facilidade de manutenção e alinhamento de escopo. Acesse os documentos nos links abaixo:

### 📌 Requisitos & Planejamento
* **[Documento de Requisitos (PRD)](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/specs/PRD.md):** Visão de negócio, público-alvo, jornadas detalhadas, regras de negócio iniciais e critérios de aceitação gerais.
* **[Plano de Execução Geral (.spec)](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/specs/cabeleleila_leila.spec.md):** O cronograma oficial com todas as 62 tarefas mapeadas através de suas dependências e caminhos críticos.

### 📐 Engenharia & Design de Software
* **[Arquitetura de Sistemas](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/design/architecture.md):** Estrutura do Monorepo (Turborepo), fluxo de camadas da Clean Architecture, gestão de estado reativo (Signals AuthStore) e segurança com rotação de tokens JWT.
* **[Modelagem de Banco de Dados](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/design/database.md):** Diagrama Entidade-Relacionamento, índices otimizados, tabelas e o arquivo `schema.prisma` completo pronto para execução.
* **[Especificações de APIs (REST Contract)](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/design/api.md):** Contrato técnico com payloads JSON de entrada/saída, rotas privadas, cookies seguros e tratamento de status HTTP.
* **[Design System & UI/UX](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/design/ui_ux.md):** Tokens visuais de cores (Luxury Modernism), tipografia sofisticada (Playfair Display / Outfit), micro-animações dinâmicas e guia visual das principais telas.

---

## ⚡ Guia de Tarefas por Fases

O desenvolvimento foi subdividido em 9 fases incrementais de trabalho. Cada fase possui seu próprio checklist e guias de implementação técnica acionáveis:

1. **[Fase A — Infraestrutura & Monorepo](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_a_infraestrutura.md):** Scaffold dos apps NestJS/Angular, Docker e Lint compartilhado (8 tarefas).
2. **[Fase B — Banco de Dados & ORM](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_b_banco_dados.md):** Prisma, migrations e seeds (5 tarefas).
3. **[Fase C — Módulo IAM (Backend)](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_c_iam_backend.md):** Autenticação JWT, Cookies HttpOnly, OAuth Google e RBAC (13 tarefas).
4. **[Fase D — Módulo Catálogo (Backend)](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_d_catalogo_backend.md):** CRUD de serviços, horários e cálculo dinâmico de disponibilidade de slots (6 tarefas).
5. **[Fase E — Módulo Agendamentos (Backend)](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_e_agendamentos_backend.md):** Validação transacional de concorrência, máquina de estados de status e dashboard (7 tarefas).
6. **[Fase F — Frontend: Core, Layout & Design System](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_f_frontend_core.md):** Tailwind tokens, , rotas lazy-loaded e Signals AuthStore (6 tarefas).
7. **[Fase G — Frontend: Módulo IAM](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_g_frontend_iam.md):** Telas de Login, Registro, Recuperação de senha e Callbacks (5 tarefas).
8. **[Fase H — Frontend: Área do Cliente](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_h_frontend_cliente.md):** Catálogo público e Wizard interativo de agendamento em passos (6 tarefas).
9. **[Fase I — Frontend: Painel Administrativo](file:///home/luisguilherme/Documentos/projetos/desafio_dsin/docs/tasks/fase_i_frontend_admin.md):** Dashboard de Leila, DataTable de agendamentos e telas de configuração (6 tarefas).

---

## 🛠️ Tecnologias Utilizadas

* **Monorepo:** Turborepo v2
* **Backend:** NestJS v11 (com TypeScript + Zod + Passport)
* **Frontend:** Angular v21 (com Tailwind CSS v4 )
* **Banco de Dados:** PostgreSQL 16 (orquestrado via Docker)
* **Cache & Rate-limiting:** Redis v7
* **Segurança:** Argon2 (hashing de senha) + JWT (Access Token & Refresh Token)
* **Estilização:** CSS Variables + Tailwind + Playfair Display (Serif) + Outfit (Sans-Serif)
