# Plano de Testes — API Features

> Cobertura de testes E2E / integração dividida por domínio de rota.  
> Cada task representa um conjunto coeso de cenários para um recurso da API.

---

## Convenções

| Símbolo | Significado |
|---------|-------------|
| ✅ Happy path | Requisição válida, resposta esperada |
| ❌ Erro esperado | Validação, autenticação, autorização ou regra de negócio |
| 🔒 Autenticado | Requer `Authorization: Bearer <token>` |
| 👑 Admin | Requer role `ADMIN` |

---

## Task 1 — Health Check

**Rota base:** `/health`, `/api/health`

| # | Cenário | Método | Endpoint | Resultado Esperado |
|---|---------|--------|----------|--------------------|
| 1.1 | ✅ Verificar saúde da API | GET | `/health` | `200 { status: "ok" }` |
| 1.2 | ✅ Verificar saúde da API (prefixo /api) | GET | `/api/health` | `200 { status: "ok" }` |

---

## Task 2 — Auth: Registro e Login

**Rota base:** `/api/auth`

### 2.1 Registro (`POST /api/auth/register`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.1.1 | ✅ Registrar usuário com dados válidos (nome, email, senha forte) | `201` — usuário criado, e-mail de confirmação disparado |
| 2.1.2 | ❌ Email já cadastrado | `409 Conflict` |
| 2.1.3 | ❌ Email inválido | `422 Unprocessable Entity` |
| 2.1.4 | ❌ Senha fraca (< mínimo exigido) | `422 Unprocessable Entity` |
| 2.1.5 | ❌ Campos obrigatórios ausentes (nome, email ou senha) | `422 Unprocessable Entity` |
| 2.1.6 | ❌ Muitas tentativas seguidas (rate limit) | `429 Too Many Requests` |

### 2.2 Login (`POST /api/auth/login`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.2.1 | ✅ Login com credenciais válidas | `200` — `accessToken` + cookie `refreshToken` |
| 2.2.2 | ❌ Email não cadastrado | `401 Unauthorized` |
| 2.2.3 | ❌ Senha incorreta | `401 Unauthorized` |
| 2.2.4 | ❌ Email não confirmado (se regra aplicável) | `403 Forbidden` |
| 2.2.5 | ❌ Payload inválido (email ausente) | `422 Unprocessable Entity` |
| 2.2.6 | ❌ Rate limit excedido | `429 Too Many Requests` |

### 2.3 Refresh Token (`POST /api/auth/refresh`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.3.1 | ✅ Cookie `refreshToken` válido e não expirado | `200` — novo `accessToken` |
| 2.3.2 | ❌ Cookie ausente | `401 Unauthorized` |
| 2.3.3 | ❌ Token revogado (após logout) | `401 Unauthorized` |
| 2.3.4 | ❌ Token expirado | `401 Unauthorized` |

### 2.4 Logout (`POST /api/auth/logout`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.4.1 | ✅ Logout com refreshToken válido | `204 No Content` — token revogado |
| 2.4.2 | ✅ Logout sem cookie (idempotente) | `204 No Content` |

### 2.5 Esqueci a Senha (`POST /api/auth/forgot-password`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.5.1 | ✅ Email cadastrado | `200` — e-mail de redefinição disparado |
| 2.5.2 | ✅ Email não cadastrado (sem enumeration) | `200` — resposta idêntica para não expor dados |
| 2.5.3 | ❌ Email inválido | `422 Unprocessable Entity` |
| 2.5.4 | ❌ Rate limit excedido | `429 Too Many Requests` |

### 2.6 Redefinir Senha (`POST /api/auth/reset-password`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.6.1 | ✅ Token válido + nova senha forte | `200` — senha alterada |
| 2.6.2 | ❌ Token inválido ou adulterado | `400 Bad Request` |
| 2.6.3 | ❌ Token expirado | `400 Bad Request` |
| 2.6.4 | ❌ Nova senha fraca | `422 Unprocessable Entity` |
| 2.6.5 | ❌ Rate limit excedido | `429 Too Many Requests` |

### 2.7 Confirmação de Email (`GET /api/auth/confirm-email`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.7.1 | ✅ Token válido na query string | `200` — email confirmado |
| 2.7.2 | ❌ Token ausente | `400 Bad Request` |
| 2.7.3 | ❌ Token inválido | `400 Bad Request` |
| 2.7.4 | ❌ Token já utilizado | `400 Bad Request` |

### 2.8 Google OAuth (`GET /api/auth/google` + callback)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 2.8.1 | ✅ Redirect para Google | `302` — redirect para URL do Google |
| 2.8.2 | ✅ Callback com code válido | `200` — `accessToken` + cookie `refreshToken` |
| 2.8.3 | ❌ Callback com `error` na query (usuário negou permissão) | `400 Bad Request` |
| 2.8.4 | ❌ Callback com `code` inválido | `401 Unauthorized` |

---

## Task 3 — Users: Perfil do Usuário Autenticado

**Rota base:** `/api/users`

### 3.1 Obter Perfil (`GET /api/users/me`) 🔒

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 3.1.1 | ✅ Token válido | `200` — dados do perfil (nome, email, avatar, role, etc.) |
| 3.1.2 | ❌ Token ausente | `401 Unauthorized` |
| 3.1.3 | ❌ Token expirado ou inválido | `401 Unauthorized` |

### 3.2 Atualizar Perfil (`PATCH /api/users/me`) 🔒

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 3.2.1 | ✅ Atualizar nome com dados válidos | `200` — perfil atualizado |
| 3.2.2 | ✅ Atualizar avatar (campo opcional) | `200` — perfil atualizado |
| 3.2.3 | ❌ Token ausente | `401 Unauthorized` |
| 3.2.4 | ❌ Campo inválido (nome vazio, string muito longa) | `422 Unprocessable Entity` |
| 3.2.5 | ❌ Payload completamente vazio | `422 Unprocessable Entity` |

---

## Task 4 — Catalog: Serviços

**Rota base:** `/api/catalog/servicos`

### 4.1 Listar Serviços (`GET /api/catalog/servicos`) 🔒

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 4.1.1 | ✅ Listagem com token válido | `200` — array de serviços ativos |
| 4.1.2 | ❌ Token ausente | `401 Unauthorized` |
| 4.1.3 | ✅ Lista vazia (sem serviços cadastrados) | `200 []` |

### 4.2 Obter Serviço por ID (`GET /api/catalog/servicos/:id`)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 4.2.1 | ✅ ID válido (UUID) de serviço existente | `200` — dados do serviço |
| 4.2.2 | ❌ ID não encontrado | `404 Not Found` |
| 4.2.3 | ❌ ID não é um UUID válido | `422 Unprocessable Entity` |

### 4.3 Criar Serviço (`POST /api/catalog/servicos`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 4.3.1 | ✅ ADMIN cria serviço com dados válidos (nome, duração, preço) | `201` — serviço criado |
| 4.3.2 | ❌ CLIENTE tenta criar serviço | `403 Forbidden` |
| 4.3.3 | ❌ Token ausente | `401 Unauthorized` |
| 4.3.4 | ❌ Campos obrigatórios ausentes | `422 Unprocessable Entity` |
| 4.3.5 | ❌ Preço negativo ou duração zero | `422 Unprocessable Entity` |

### 4.4 Atualizar Serviço (`PUT /api/catalog/servicos/:id`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 4.4.1 | ✅ ADMIN atualiza serviço existente | `200` — serviço atualizado |
| 4.4.2 | ❌ ID não encontrado | `404 Not Found` |
| 4.4.3 | ❌ CLIENTE tenta atualizar | `403 Forbidden` |
| 4.4.4 | ❌ Token ausente | `401 Unauthorized` |
| 4.4.5 | ❌ Payload inválido | `422 Unprocessable Entity` |

### 4.5 Inativar Serviço (`PATCH /api/catalog/servicos/:id/inativar`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 4.5.1 | ✅ ADMIN inativa serviço ativo | `200` — serviço marcado como inativo |
| 4.5.2 | ❌ Serviço já inativo (idempotência) | `200` ou `409` conforme regra |
| 4.5.3 | ❌ ID não encontrado | `404 Not Found` |
| 4.5.4 | ❌ CLIENTE tenta inativar | `403 Forbidden` |

---

## Task 5 — Catalog: Horários de Funcionamento

**Rota base:** `/api/catalog/horarios`

### 5.1 Listar Horários (`GET /api/catalog/horarios`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 5.1.1 | ✅ ADMIN lista horários configurados | `200` — array com dias e faixas horárias |
| 5.1.2 | ❌ CLIENTE tenta listar | `403 Forbidden` |
| 5.1.3 | ❌ Token ausente | `401 Unauthorized` |

### 5.2 Salvar Horários (`PUT /api/catalog/horarios`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 5.2.1 | ✅ ADMIN salva horários válidos (upsert completo por dia da semana) | `200` — horários persistidos |
| 5.2.2 | ❌ Horário inválido (fim antes do início) | `422 Unprocessable Entity` |
| 5.2.3 | ❌ Dia da semana inválido | `422 Unprocessable Entity` |
| 5.2.4 | ❌ CLIENTE tenta salvar | `403 Forbidden` |

---

## Task 6 — Catalog: Bloqueios de Agenda

**Rota base:** `/api/catalog/bloqueios`

### 6.1 Listar Bloqueios (`GET /api/catalog/bloqueios`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 6.1.1 | ✅ ADMIN lista bloqueios futuros | `200` — array de bloqueios |
| 6.1.2 | ❌ CLIENTE tenta listar | `403 Forbidden` |

### 6.2 Criar Bloqueio (`POST /api/catalog/bloqueios`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 6.2.1 | ✅ ADMIN cria bloqueio com data/hora válida | `201` — bloqueio criado |
| 6.2.2 | ❌ Data no passado | `422 Unprocessable Entity` |
| 6.2.3 | ❌ Fim anterior ao início | `422 Unprocessable Entity` |
| 6.2.4 | ❌ Conflito com bloqueio existente | `409 Conflict` |
| 6.2.5 | ❌ CLIENTE tenta criar | `403 Forbidden` |

### 6.3 Remover Bloqueio (`DELETE /api/catalog/bloqueios/:id`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 6.3.1 | ✅ ADMIN remove bloqueio existente | `204 No Content` |
| 6.3.2 | ❌ ID não encontrado | `404 Not Found` |
| 6.3.3 | ❌ ID não é UUID | `422 Unprocessable Entity` |
| 6.3.4 | ❌ CLIENTE tenta remover | `403 Forbidden` |

---

## Task 7 — Catalog: Disponibilidade

**Rota base:** `/api/catalog/disponibilidade` (público)

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 7.1 | ✅ Query com `data` válida (YYYY-MM-DD) | `200` — slots disponíveis para o dia |
| 7.2 | ✅ Dia com horário de funcionamento fechado | `200 []` — lista vazia |
| 7.3 | ✅ Dia com bloqueio parcial | `200` — slots excluindo período bloqueado |
| 7.4 | ✅ Dia com todos os slots ocupados | `200 []` — lista vazia |
| 7.5 | ❌ `data` ausente na query | `422 Unprocessable Entity` |
| 7.6 | ❌ `data` em formato inválido | `422 Unprocessable Entity` |

---

## Task 8 — Agendamentos: Operações do Cliente

**Rota base:** `/api/agendamentos`

### 8.1 Criar Agendamento (`POST /api/agendamentos`) 🔒

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 8.1.1 | ✅ CLIENTE cria agendamento em slot disponível | `201` — agendamento criado com status `PENDENTE` |
| 8.1.2 | ❌ Slot indisponível (já ocupado) | `409 Conflict` |
| 8.1.3 | ❌ Serviço inativo ou inexistente | `404 Not Found` |
| 8.1.4 | ❌ Data/hora no passado | `422 Unprocessable Entity` |
| 8.1.5 | ❌ Horário fora do funcionamento | `422 Unprocessable Entity` |
| 8.1.6 | ❌ Horário dentro de bloqueio de agenda | `422 Unprocessable Entity` |
| 8.1.7 | ❌ Token ausente | `401 Unauthorized` |
| 8.1.8 | ❌ Campos obrigatórios ausentes | `422 Unprocessable Entity` |

### 8.2 Listar Agendamentos (`GET /api/agendamentos`) 🔒

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 8.2.1 | ✅ CLIENTE lista seus próprios agendamentos | `200` — somente os do próprio usuário |
| 8.2.2 | ✅ ADMIN lista todos os agendamentos | `200` — todos os agendamentos |
| 8.2.3 | ✅ Filtro por status (query param) | `200` — apenas agendamentos com status filtrado |
| 8.2.4 | ✅ Filtro por data | `200` — agendamentos do período |
| 8.2.5 | ❌ Token ausente | `401 Unauthorized` |
| 8.2.6 | ❌ Parâmetro de query inválido | `422 Unprocessable Entity` |

### 8.3 Cancelar Agendamento (`PATCH /api/agendamentos/:id/cancelar`) 🔒

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 8.3.1 | ✅ CLIENTE cancela seu próprio agendamento `PENDENTE` | `200` — status `CANCELADO` |
| 8.3.2 | ✅ ADMIN cancela qualquer agendamento | `200` — status `CANCELADO` |
| 8.3.3 | ❌ CLIENTE tenta cancelar agendamento de outro usuário | `403 Forbidden` |
| 8.3.4 | ❌ Agendamento já cancelado | `409 Conflict` ou `422` |
| 8.3.5 | ❌ Agendamento já concluído | `409 Conflict` ou `422` |
| 8.3.6 | ❌ ID não encontrado | `404 Not Found` |
| 8.3.7 | ❌ Token ausente | `401 Unauthorized` |

---

## Task 9 — Agendamentos: Operações do Admin

**Rota base:** `/api/agendamentos`

### 9.1 Confirmar Agendamento (`PATCH /api/agendamentos/:id/confirmar`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 9.1.1 | ✅ ADMIN confirma agendamento `PENDENTE` | `200` — status `CONFIRMADO` |
| 9.1.2 | ❌ Agendamento já confirmado | `409 Conflict` ou `422` |
| 9.1.3 | ❌ Agendamento cancelado | `409 Conflict` ou `422` |
| 9.1.4 | ❌ ID não encontrado | `404 Not Found` |
| 9.1.5 | ❌ CLIENTE tenta confirmar | `403 Forbidden` |

### 9.2 Concluir Agendamento (`PATCH /api/agendamentos/:id/concluir`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 9.2.1 | ✅ ADMIN conclui agendamento `CONFIRMADO` | `200` — status `CONCLUIDO` |
| 9.2.2 | ❌ Agendamento ainda `PENDENTE` (não confirmado) | `409 Conflict` ou `422` |
| 9.2.3 | ❌ Agendamento cancelado | `409 Conflict` ou `422` |
| 9.2.4 | ❌ ID não encontrado | `404 Not Found` |
| 9.2.5 | ❌ CLIENTE tenta concluir | `403 Forbidden` |

---

## Task 10 — Admin: Dashboard e Gestão de Usuários

**Rota base:** `/api/admin`

### 10.1 Dashboard (`GET /api/admin/dashboard`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 10.1.1 | ✅ ADMIN acessa dashboard | `200` — métricas (totais por status, receita, etc.) |
| 10.1.2 | ❌ CLIENTE tenta acessar | `403 Forbidden` |
| 10.1.3 | ❌ Token ausente | `401 Unauthorized` |

### 10.2 Listar Usuários (`GET /api/admin/usuarios`) 🔒 👑

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 10.2.1 | ✅ ADMIN lista todos os usuários | `200` — array de usuários com perfil |
| 10.2.2 | ❌ CLIENTE tenta listar | `403 Forbidden` |
| 10.2.3 | ❌ Token ausente | `401 Unauthorized` |

---

## Sumário das Tasks

| Task | Domínio | Qtd. Cenários |
|------|---------|---------------|
| 1 | Health Check | 2 |
| 2 | Auth (registro, login, tokens, OAuth) | 34 |
| 3 | Users (perfil) | 5 |
| 4 | Catalog — Serviços | 18 |
| 5 | Catalog — Horários de Funcionamento | 7 |
| 6 | Catalog — Bloqueios de Agenda | 10 |
| 7 | Catalog — Disponibilidade | 6 |
| 8 | Agendamentos — Cliente | 14 |
| 9 | Agendamentos — Admin (confirmar/concluir) | 10 |
| 10 | Admin — Dashboard e Usuários | 6 |
| **Total** | | **112** |
