# Arquitetura do Sistema — Cabeleleila Leila

> Especificação da estrutura de diretórios, monorepo e camadas lógicas baseadas em Clean Architecture e boas práticas de engenharia de software.

---

## 1. Estrutura do Monorepo (Turborepo)

O projeto é estruturado como um monorepo gerenciado pelo **Turborepo** para facilitar o compartilhamento de código (interfaces, tipos, utilitários, configurações de lint/formatação e biblioteca de componentes UI) entre o frontend (Angular) e o backend (Node.js + Express).

```
desafio_dsin/
├── apps/
│   ├── api/                 # Backend Node.js + Express (Clean Architecture)
│   └── web/                 # Frontend Angular 21 (Tailwind + UI Components)
├── packages/
│   ├── ui/                  # Biblioteca de componentes visuais Angular/Tailwind
│   └── eslint-config/       # Configurações de Lint e Prettier compartilhadas
├── docs/
│   ├── specs/               # Especificações de requisitos e plano de execução (PRD, Spec)
│   └── design/              # Arquivos de design de software (Arquitetura, Banco de Dados, APIs, UI/UX)
├── docker-compose.yml       # Orquestração local (PostgreSQL, Redis, API, Web)
├── package.json             # Raiz do workspace npm
└── turbo.json               # Configurações de pipeline do Turborepo
```

---

## 2. Backend Architecture (Node.js + Express + Clean Architecture)

O backend é implementado na pasta `apps/api/` usando os princípios de **Clean Architecture**, isolando as regras de negócio de detalhes de infraestrutura (como banco de dados, drivers SQL, frameworks web e bibliotecas externas).

### Camadas Lógicas

```mermaid
graph TD
    Presentation[Presentation Layer / Express Routers] --> Application[Application Layer / Use Cases]
    Application --> Domain[Domain Layer / Entities & Repositories Ports]
    Infrastructure[Infrastructure Layer / pg, Redis, Middlewares] --> Domain
    Infrastructure --> Application
```

#### A. Domain (Núcleo Puro)

- **Objetivo:** Contém as regras de negócio mais essenciais e as entidades fundamentais do sistema. É 100% puro TypeScript, livre de dependências de Express, `pg` ou qualquer biblioteca externa de framework.
- **Conteúdo:**
  - `domain/entities/`: Entidades de domínio ricas (validação de dados internos, máquina de estados).
  - `domain/repositories/`: Interfaces (portas de saída) que descrevem as operações necessárias no banco de dados (ex: `IUsuarioRepository`).
  - `domain/exceptions/`: Exceções de domínio específicas do negócio (ex: `ConflitoAgendamentoException`).

#### B. Application (Casos de Uso)

- **Objetivo:** Orquestra o fluxo de dados de e para a camada de domínio, aplicando regras de negócio específicas para cada caso de uso da aplicação.
- **Conteúdo:**
  - `application/use-cases/`: Implementações de casos de uso específicos (ex: `RegistrarUsuarioUseCase`, `CriarAgendamentoUseCase`).
  - `application/dtos/`: DTOs de entrada e saída do caso de uso, validados com **Zod**.

#### C. Infrastructure (Detalhes de Implementação)

- **Objetivo:** Contém as ferramentas concretas para persistência, mensageria, segurança e outras integrações externas.
- **Conteúdo:**
  - `infrastructure/repositories/`: Implementações concretas de repositórios usando queries SQL escritas à mão com pool `pg` (ex: `PgUsuarioRepository`).
  - `infrastructure/database/`: Pool de conexão PostgreSQL (`pg`), runner de migrations e scripts SQL.
  - `infrastructure/security/`: Funções de JWT (sign/verify com `jsonwebtoken`), hashing de senhas com Argon2, middlewares de autenticação e autorização.
  - `infrastructure/cache/`: Módulo de conexão com o Redis (`ioredis`).

#### D. Presentation (Interface Externa)

- **Objetivo:** Expõe os pontos de entrada do sistema para o mundo exterior (HTTP REST).
- **Conteúdo:**
  - `presentation/routers/`: Express Routers responsáveis por mapear rotas HTTP, validar inputs com `Zod` e classificar status HTTP (ex: `authRouter`, `agendamentosRouter`).
  - `presentation/middlewares/`: Middlewares de tratamento global de erros, formatação de respostas e loggers.

---

## 3. Frontend Architecture (Angular 21 + RxJS + Signals + Tailwind)

O frontend é construído sob uma abordagem modular e orientada a responsabilidades, baseada em estado reativo com **RxJS (BehaviorSubject)** e componentes utilitários estilizados com **Tailwind CSS**.

### Estrutura de Diretórios (`apps/web/`)

```
apps/web/src/app/
├── core/
│   ├── guards/              # Proteção de rotas (AuthGuard, RoleGuard)
│   ├── interceptors/        # Injeção de JWT nas requisições, tratamento de erros 401/403
│   └── services/            # Serviços de comunicação base com API (ApiService)
├── store/
│   └── auth.store.ts        # Gerenciamento global de autenticação com Angular Signals
├── features/
│   ├── home/                # Página inicial (hero section)
│   ├── catalog/             # Catálogo de serviços público
│   ├── auth/
│   │   ├── login/           # Página de login
│   │   └── register/        # Página de cadastro
│   ├── agendamentos/
│   │   ├── agendar/         # Fluxo de criação de agendamento
│   │   └── meus-agendamentos/ # Histórico de agendamentos do cliente
│   ├── admin/
│   │   └── dashboard/       # Painel administrativo
│   └── errors/
│       ├── forbidden/       # Página 403
│       └── not-found/       # Página 404
└── shared/
    ├── components/          # Componentes reaproveitáveis (Layout, Header, etc.)
    └── pipes/               # Formatação de preços, durações e datas em português
```

### State Management (`AuthStore`)

O estado de autenticação é centralizado no `AuthStore` usando os primitivos de reatividade nativos do Angular (**Signals**). Isso simplifica a reatividade na interface e garante que mudanças de estado (como logout ou atualização do token) reflitam instantaneamente em toda a aplicação.

```typescript
// Estrutura conceitual do AuthStore
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({
    user: null as Usuario | null,
    accessToken: null as string | null,
    loading: false,
    error: null as string | null,
  }),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
    isAdmin: computed(() => user()?.role === 'ADMIN'),
  })),
  withMethods((store, apiService = inject(ApiService)) => ({
    // login, logout, refresh, updateProfile...
  })),
);
```

---

## 4. Estratégia de Comunicação & Segurança

### Autenticação JWT com Cookie Rotativo

1. **Access Token (JWT curto - 15 min):** Enviado no corpo da resposta na rota de login e armazenado em memória (no `AuthStore`) do Angular. Deve ser incluído no cabeçalho `Authorization: Bearer <token>` em todas as requisições HTTP do cliente.
2. **Refresh Token (JWT longo - 7 dias):** Armazenado no banco de dados e retornado pelo backend como um cookie seguro `HttpOnly` (`__Host-refresh-token`). O frontend nunca tem acesso a este token via Javascript, mitigando ataques do tipo XSS (Cross-Site Scripting).
3. **Fluxo de Refresh Automático:** O interceptor HTTP do Angular monitora respostas com status `401 Unauthorized`. Caso detectado, ele pausa temporariamente as requisições pendentes, chama a rota `/auth/refresh` (que valida o cookie `HttpOnly`), recebe o novo par de tokens e repete as requisições originais de forma transparente ao usuário.

### Proteção de Rotas (RBAC)

- **Backend:** Uso combinado de `authMiddleware` e `roleMiddleware('ADMIN')` como middlewares Express nas rotas protegidas.
- **Frontend:** Guards de rotas (`AuthGuard` e `RoleGuard`) vinculados aos seletores computados do `AuthStore` (`isAuthenticated` e `isAdmin`) para bloquear transições de rotas antes do carregamento do template Angular.
