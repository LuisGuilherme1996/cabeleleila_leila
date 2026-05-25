# Fase C — Módulo IAM (Backend)

> **Objetivo:** Autenticação robusta com JWT, refresh token rotativo, OAuth2 Google e RBAC no backend Node.js + Express seguindo a Clean Architecture, padrão de richards nível 2.

---

## Checklist de Tarefas
    
- [x] **C-1:** Criar entidades de domínio (`Usuario`, `Perfil`, `RefreshToken`, `TokenAcao`)
- [x] **C-2:** Criar repositórios abstratos (interfaces/ports) em `domain/repositories/`
- [x] **C-3:** Implementar repositórios concretos com SQL puro (`pg`) em `infrastructure/repositories/`
- [x] **C-4:** Implementar use case **Registrar Usuário**
- [x] **C-5:** Implementar use case **Login** (credenciais + emissão JWT/RT)
- [x] **C-6:** Implementar use case **Refresh Token** (rotação RTR)
- [x] **C-7:** Implementar use case **Logout** (invalidação de refresh token)
- [x] **C-8:** Implementar **Middleware de Autenticação** (JWT) e **Autorização** (RBAC)
- [x] **C-9:** Implementar **Rate Limiting** com Redis nas rotas de Auth
- [x] **C-10:** Implementar use case **Recuperar Senha** (geração de token + simulação e-mail)
- [x] **C-11:** Implementar use case **Confirmar E-mail**
- [x] **C-12:** Implementar fluxo **OAuth2 Google**
- [x] **C-13:** Implementar endpoints **Perfil do Usuário** (`GET` / `PATCH` `/users/me`)

---

## Detalhamento das Tarefas

### C-1: Criar entidades de domínio

- **Tipo:** BE | **Dependência:** B-2
- **Entregável:** Classes escritas em `domain/entities/` contendo propriedades e métodos de validação para `Usuario`, `Perfil`, `RefreshToken` e `TokenAcao`.
- **Critério de Aceite:** Testes unitários validam se as entidades aplicam suas regras internas de criação corretamente (ex: e-mail inválido impede a instanciação de um `Usuario`).

### C-2: Criar repositórios abstratos (interfaces)

- **Tipo:** BE | **Dependência:** C-1
- **Entregável:** Interfaces abstratas (ports) em `domain/repositories/` definindo métodos de busca, inserção e deleção.
- **Critério de Aceite:** O código compila sem importar qualquer dependência do driver `pg` ou do Express.

### C-3: Implementar repositórios concretos com SQL puro

- **Tipo:** BE | **Dependência:** C-2, B-2
- **Entregável:** Classes concretas que implementam as interfaces em `infrastructure/repositories/` utilizando o pool `pg` com queries SQL escritas à mão.
- **Critério de Aceite:** Integração com o banco de dados é efetuada com sucesso nas rotas de teste.

### C-4: Implementar use case **Registrar Usuário**

- **Tipo:** BE | **Dependência:** C-3
- **Entregável:** Caso de uso em `application/use-cases/` realizando: hash de senha via `argon2`, associação do perfil `CLIENTE` e criação do token de ativação. Validação de input com **Zod**.
- **Critério de Aceite:** Chamada à rota REST `POST /auth/register` persiste o usuário com senha criptografada e retorna status `201 Created`.

### C-5: Implementar use case **Login**

- **Tipo:** BE | **Dependência:** C-4
- **Entregável:** Caso de uso de login local emitindo Access Token JWT (via `jsonwebtoken`) e Refresh Token gravado em cookie HttpOnly.
- **Critério de Aceite:** `POST /auth/login` retorna o Access Token no JSON e o cookie `__Host-refresh-token` no cabeçalho `Set-Cookie`.

### C-6: Implementar use case **Refresh Token**

- **Tipo:** BE | **Dependência:** C-5
- **Entregável:** Caso de uso aplicando Rotação de Token (RTR) na rota `/auth/refresh`.
- **Critério de Aceite:** Chamar a rota com o cookie válido gera um novo par Access + Refresh Token; chamar com token já revogado gera invalidação massiva da sessão do usuário.

### C-7: Implementar use case **Logout**

- **Tipo:** BE | **Dependência:** C-5
- **Entregável:** Caso de uso que invalida o Refresh Token no banco de dados.
- **Critério de Aceite:** `POST /auth/logout` atualiza `revogado = true` no token e remove o cookie do navegador (Set-Cookie com data passada).

### C-8: Implementar **Middleware de Autenticação** e **Middleware de Autorização**

- **Tipo:** BE | **Dependência:** C-5
- **Entregável:** Middleware `authMiddleware` que valida o JWT e injeta `req.user`, e `roleMiddleware('ADMIN')` que verifica o perfil do usuário.
- **Critério de Aceite:** Rotas protegidas com `authMiddleware` e `roleMiddleware('ADMIN')` retornam `401 Unauthorized` se sem token, e `403 Forbidden` se o perfil do usuário logado não for ADMIN.

### C-9: Implementar **Rate Limiting** com Redis

- **Tipo:** BE | **Dependência:** C-5, A-6
- **Entregável:** Configuração do `express-rate-limit` com `rate-limit-redis` protegendo as rotas sob `/auth/*`.
- **Critério de Aceite:** Disparar mais de 10 requisições consecutivas por segundo na rota de login gera o erro `429 Too Many Requests`.

### C-10: Implementar use case **Recuperar Senha**

- **Tipo:** BE | **Dependência:** C-3
- **Entregável:** Endpoints `/auth/forgot-password` e `/auth/reset-password` gerindo tokens temporários de ação. Validação de input com **Zod**.
- **Critério de Aceite:** Fluxo completo permite a alteração segura da senha contanto que o token fornecido seja válido e dentro do prazo de expiração (ex: 1 hora).

### C-11: Implementar use case **Confirmar E-mail**

- **Tipo:** BE | **Dependência:** C-3
- **Entregável:** Endpoint `GET /auth/confirm-email?token=xxx` validando o token gerado em C-4.
- **Critério de Aceite:** Acesso à rota atualiza a flag `email_confirmado` para `true` na tabela `usuarios`.

### C-12: Implementar fluxo **OAuth2 Google**

- **Tipo:** BE | **Dependência:** C-5
- **Entregável:** Rota `/auth/google` (redirecionamento) e `/auth/google/callback` utilizando Google OAuth2 (implementação direta com HTTP requests ou biblioteca `google-auth-library`).
- **Critério de Aceite:** Autenticar via Google cria um registro de usuário correspondente caso não exista (perfil CLIENTE) e emite a sessão JWT completa.

### C-13: Implementar endpoint **Perfil do Usuário**

- **Tipo:** BE | **Dependência:** C-8
- **Entregável:** Rotas `GET /users/me` e `PATCH /users/me` com validação **Zod**.
- **Critério de Aceite:** Retorna as informações cadastrais do próprio usuário logado e permite edição de dados cadastrais (como nome e telefone) sem risco de alteração do ID ou perfil.
