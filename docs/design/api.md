# Especificação das APIs (Contrato REST) — Cabeleleila Leila

> Especificação detalhada dos endpoints, payloads, cabeçalhos, cookies e status HTTP da API REST exposta pelo backend NestJS.

---

## 1. Convenções de Segurança e Cabeçalhos

* **Base URL:** `http://localhost:3000/api`
* **Autenticação:** Todas as rotas privadas exigem o cabeçalho `Authorization: Bearer <Access_Token>`.
* **Refresh Token:** Armazenado e enviado via cookie `HttpOnly` sob o nome `__Host-refresh-token`.
* **Rate Limiting:** Rotas de autenticação (`/auth/*`) toleram no máximo 10 requisições por minuto por IP/usuário via Redis. Resposta com status `429 Too Many Requests`.

---

## 2. Módulo IAM (Gestão de Identidade)

### A. Registrar Usuário
* **Rota:** `POST /auth/register`
* **Permissão:** Pública (🟢)
* **Payload (JSON):**
```json
{
  "nome": "Luís Guilherme",
  "email": "luis@dsin.com.br",
  "telefone": "14999998888",
  "senha": "SenhaForte123!"
}
```
* **Respostas:**
  * **201 Created:**
    ```json
    {
      "message": "Usuário registrado com sucesso. Verifique seu e-mail para confirmação.",
      "usuario": {
        "id": "e6a2b370-349c-48c0-848e-f14d9b23b8f1",
        "nome": "Luís Guilherme",
        "email": "luis@dsin.com.br",
        "telefone": "14999998888"
      }
    }
    ```
  * **400 Bad Request:** Dados de entrada inválidos (telefone fora de padrão ou senha fraca).
  * **409 Conflict:** E-mail já cadastrado no sistema.

### B. Login Local
* **Rota:** `POST /auth/login`
* **Permissão:** Pública (🟢)
* **Payload (JSON):**
```json
{
  "email": "luis@dsin.com.br",
  "senha": "SenhaForte123!"
}
```
* **Respostas:**
  * **200 OK:** Seta o cookie `__Host-refresh-token` (HttpOnly, Secure, SameSite=Strict).
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "usuario": {
        "id": "e6a2b370-349c-48c0-848e-f14d9b23b8f1",
        "nome": "Luís Guilherme",
        "email": "luis@dsin.com.br",
        "perfis": ["CLIENTE"]
      }
    }
    ```
  * **401 Unauthorized:** E-mail ou senha incorretos.

### C. Rotação de Refresh Token
* **Rota:** `POST /auth/refresh`
* **Permissão:** Pública (🔗 Exige cookie `__Host-refresh-token`)
* **Respostas:**
  * **200 OK:** Seta novo cookie `__Host-refresh-token`.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  * **401 Unauthorized:** Refresh Token inválido, expirado ou revogado.

### D. Logout
* **Rota:** `POST /auth/logout`
* **Permissão:** Privada (🔗 Usuário Autenticado)
* **Respostas:**
  * **200 OK:** Limpa o cookie `__Host-refresh-token` e revoga o token correspondente no banco.
    ```json
    {
      "message": "Logout efetuado com sucesso."
    }
    ```

### E. Perfil do Usuário
* **Rota:** `GET /users/me`
* **Permissão:** Privada (🔗 Usuário Autenticado)
* **Respostas:**
  * **200 OK:**
    ```json
    {
      "id": "e6a2b370-349c-48c0-848e-f14d9b23b8f1",
      "nome": "Luís Guilherme",
      "email": "luis@dsin.com.br",
      "telefone": "14999998888",
      "emailConfirmado": true,
      "perfis": ["CLIENTE"]
    }
    ```

* **Rota:** `PATCH /users/me`
* **Payload (JSON):**
```json
{
  "nome": "Luís G. Silva",
  "telefone": "14988887777"
}
```

---

## 3. Módulo Catálogo & Disponibilidade

### A. CRUD de Serviços
* **Listar Ativos (Público):** `GET /servicos`
  * **Resposta (200 OK):**
    ```json
    [
      {
        "id": "84a7e930-b5bc-4da8-963e-db62901db8a5",
        "nome": "Corte de Cabelo Premium",
        "descricao": "Corte masculino/feminino com lavagem e finalização de alta linha.",
        "preco": "75.00",
        "duracaoMinutos": 45
      }
    ]
    ```

* **Criar Serviço (Admin):** `POST /servicos`
  * **Payload (JSON):**
    ```json
    {
      "nome": "Coloração Platinada",
      "descricao": "Descoloração e tintura profissional.",
      "preco": 180.00,
      "duracaoMinutos": 120
    }
    ```
  * **Permissão:** Exige perfil `ADMIN`.

* **Editar Serviço (Admin):** `PUT /servicos/:id`
* **Deletar / Inativar Serviço (Admin):** `DELETE /servicos/:id` ou `PATCH /servicos/:id/ativo`

### B. Listar Horários Disponíveis
* Cruzamento de horários operacionais, folgas, feriados e agendamentos existentes.
* **Rota:** `GET /disponibilidade?data=YYYY-MM-DD&servico_id=uuid`
* **Permissão:** Pública (🟢)
* **Resposta (200 OK):**
  ```json
  {
    "data": "2026-05-25",
    "servicoId": "84a7e930-b5bc-4da8-963e-db62901db8a5",
    "slots": [
      { "hora": "08:00", "disponivel": true },
      { "hora": "08:45", "disponivel": true },
      { "hora": "09:30", "disponivel": false, "motivo": "Conflito de agenda" },
      { "hora": "10:15", "disponivel": true },
      { "hora": "11:00", "disponivel": false, "motivo": "Bloqueio do salão (Almoço)" }
    ]
  }
  ```

---

## 4. Módulo Agendamentos

### A. Criar Agendamento
* **Rota:** `POST /agendamentos`
* **Permissão:** Privada (🔗 Cliente ou Admin)
* **Payload (JSON):**
```json
{
  "servicoId": "84a7e930-b5bc-4da8-963e-db62901db8a5",
  "dataHora": "2026-05-25T08:45:00.000Z",
  "observacoes": "Preciso finalizar antes das 10h."
}
```
* **Respostas:**
  * **211 Created:**
    ```json
    {
      "id": "c1f7b889-4977-4581-9c60-e8838bbabf12",
      "dataHora": "2026-05-25T08:45:00.000Z",
      "status": "PENDENTE",
      "observacoes": "Preciso finalizar antes das 10h.",
      "precoCobrado": "75.00",
      "cliente": {
        "id": "e6a2b370-349c-48c0-848e-f14d9b23b8f1",
        "nome": "Luís Guilherme"
      },
      "servico": {
        "id": "84a7e930-b5bc-4da8-963e-db62901db8a5",
        "nome": "Corte de Cabelo Premium"
      }
    }
    ```
  * **409 Conflict:** Horário selecionado não está mais disponível ou conflita com bloqueios.

### B. Listar Agendamentos (Com Filtros)
* **Rota:** `GET /agendamentos?status=PENDENTE&dataInicio=2026-05-01&dataFim=2026-05-31`
* **Permissão:** Privada (🔗). Se usuário logado for `CLIENTE`, retorna apenas seus registros. Se for `ADMIN`, retorna todos do salão.

### C. Cancelar Agendamento
* **Rota:** `PATCH /agendamentos/:id/cancelar`
* **Permissão:** Privada (🔗). Clientes só podem cancelar se antecedência >= 2 horas. Admins a qualquer momento.
* **Resposta (200 OK):**
  ```json
  {
    "id": "c1f7b889-4977-4581-9c60-e8838bbabf12",
    "status": "CANCELADO"
  }
  ```

### D. Confirmar / Concluir Atendimento (Admin)
* **Rotas:** `PATCH /agendamentos/:id/confirmar` ou `PATCH /agendamentos/:id/concluir`
* **Permissão:** Exclusiva `ADMIN`.

---

## 5. Dashboard Admin

### Dashboard Consolidado
* **Rota:** `GET /admin/dashboard`
* **Permissão:** Exclusiva `ADMIN`.
* **Resposta (200 OK):**
```json
{
  "resumoDoDia": {
    "totalAgendamentos": 18,
    "pendentes": 3,
    "confirmados": 12,
    "concluidos": 2,
    "cancelados": 1,
    "faturamentoEstimado": 1350.00,
    "faturamentoRealizado": 150.00
  },
  "proximosAtendimentos": [
    {
      "id": "c1f7b889-4977-4581-9c60-e8838bbabf12",
      "clienteNome": "Luís Guilherme",
      "servicoNome": "Corte de Cabelo Premium",
      "hora": "08:45",
      "status": "CONFIRMADO"
    }
  ]
}
```
