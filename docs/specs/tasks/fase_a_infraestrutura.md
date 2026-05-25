# Fase A — Infraestrutura & Monorepo

> **Objetivo:** Ter o esqueleto do projeto rodando com Docker, Turbo Repo e as apps vazias conectadas.

---

## Checklist de Tarefas

- [x] **A-1:** Inicializar repositório Git + `.gitignore` + `README.md`
- [x] **A-2:** Criar estrutura Turbo Repo
- [x] **A-3:** Scaffold do app Node.js + Express em `apps/api/`
- [x] **A-4:** Scaffold do app Angular 21 em `apps/web/`
- [x] **A-5:** Instalar e configurar componentes UI no Angular + criar `packages/ui/`
- [ ] **A-6:** Criar `docker-compose.yml` (postgres, redis, api, web) — estrutura pronta; falta validar `docker compose up` fim a fim
- [x] **A-7:** Configurar ESLint + Prettier no monorepo
- [x] **A-8:** Configurar variáveis de ambiente (`.env`)

### Status auditado em 22/05/2026

- **A-1:** Concluida e validada com `git log` e `.gitignore` cobrindo artefatos de build e dependencias.
- **A-2:** Concluida e validada com build do monorepo via Turbo.
- **A-3:** Concluida e validada com resposta `200` em `GET /api/health`.
- **A-4:** Concluida e validada com build Angular sem erro.
- **A-5:** Concluida e validada com consumo do pacote `ui` no app web.
- **A-6:** Estrutura implementada e `docker compose config` valido, mas sem execucao completa de `docker compose up` durante a auditoria.
- **A-7:** Concluida e validada com `npm run lint` passando no monorepo.
- **A-8:** Concluida e validada com carga tipada de ambiente no backend, incluindo `DATABASE_URL` e `REDIS_URL`, antes da inicializacao do app.

---

## Detalhamento das Tarefas

### A-1: Inicializar repositório Git + `.gitignore` + `README.md`

- **Tipo:** INFRA | **Dependência:** 🟢 Independente
- **Entregável:** Git repositório inicializado localmente, com `.gitignore` completo cobrindo Node, Angular, IDEs (.vscode, .idea) e arquivos locais Docker.
- **Critério de Aceite:** `git log` mostra o primeiro commit e `git status` não exibe arquivos temporários de node ou build no rastreamento.
- **Guia de Implementação:**
  - Executar `git init` na pasta do projeto.
  - Criar um arquivo `.gitignore` robusto mesclando templates padrão de Node e Angular.
  - Criar `README.md` introdutório descrevendo o sistema Cabeleleila Leila.

### A-2: Criar estrutura Turbo Repo

- **Tipo:** INFRA | **Dependência:** A-1
- **Entregável:** Arquivos `turbo.json` e `package.json` raiz configurados com os workspaces `apps/*` e `packages/*`.
- **Critério de Aceite:** O comando `npx turbo run build` executa sem erro em todas as aplicações (mesmo vazias).
- **Guia de Implementação:**
  - Criar `package.json` raiz definindo workspaces:
    ```json
    {
      "name": "cabeleleila-leila-monorepo",
      "private": true,
      "workspaces": ["apps/*", "packages/*"]
    }
    ```
  - Criar `turbo.json` configurando os pipelines `build`, `dev`, `lint`, `test` com cache inteligente.

### A-3: Scaffold do app Node.js + Express em `apps/api/`

- **Tipo:** BE | **Dependência:** A-2
- **Entregável:** Um scaffold limpo do Node.js com Express na pasta `apps/api/` configurado com estrutura de Clean Architecture (`domain/`, `application/`, `infrastructure/`, `presentation/`). Validação de payloads com **Zod**.
- **Critério de Aceite:** Acesso a `GET http://localhost:3000/api/health` retorna `{ "status": "ok" }`.
- **Guia de Implementação:**
  - Criar projeto TypeScript na pasta `apps/api/` com `express`, `zod`, `cors`, `helmet` e `dotenv`.
  - Ajustar a pasta `src/` estruturando as camadas de Clean Architecture.
  - Criar um `healthRouter` na camada de Presentation para o endpoint `/health`.

### A-4: Scaffold do app Angular 21 em `apps/web/`

- **Tipo:** FE | **Dependência:** A-2
- **Entregável:** Scaffold Angular 21 gerado em `apps/web/` com Tailwind CSS devidamente configurado no build do Angular.
- **Critério de Aceite:** `npm run dev` abre no navegador exibindo a tela inicial sem erros de compilação ou carregamento do Tailwind.
- **Guia de Implementação:**
  - Criar app Angular na pasta `apps/web/`.
  - Instalar `@tailwindcss/postcss` e `tailwindcss` no app web de acordo com as instruções do Tailwind v4 para Angular.

### A-5: Instalar e configurar componentes UI

- **Tipo:** FE | **Dependência:** A-4
- **Entregável:** Pacote local `packages/ui` contendo botões, inputs e dialogs de exemplo. O app web importa o pacote com sucesso.
- **Critério de Aceite:** Um componente de botão reutilizável renderiza corretamente na tela e aceita os estilos de cor dourada do Tailwind.
- **Guia de Implementação:**
  - Criar pasta `packages/ui/`.
  - Configurar a biblioteca de componentes Angular reutilizáveis.

### A-6: Criar `docker-compose.yml`

- **Tipo:** INFRA | **Dependência:** A-3, A-4
- **Entregável:** Arquivo `docker-compose.yml` contendo os quatro serviços: `postgres`, `redis`, `api` (API backend Express) e `web` (App frontend Angular) orquestrados com volumes de persistência.
- **Critério de Aceite:** Executar `docker compose up` inicia todos os serviços e permite comunicação interna entre eles.
- **Guia de Implementação:**
  - Configurar imagens do PostgreSQL 16 e Redis Alpine.
  - Mapear portas: 5432 para PostgreSQL, 6379 para Redis, 3000 para API, 4200 para Web.

### A-7: Configurar ESLint + Prettier no monorepo

- **Tipo:** INFRA | **Dependência:** A-2
- **Entregável:** Pacote utilitário `packages/eslint-config` contendo as regras de linting para TypeScript/Express e Angular, integrado às execuções do Turborepo.
- **Critério de Aceite:** O comando `npx turbo run lint` analisa e aponta inconsistências de formatação em todas as apps do workspace de uma só vez.

### A-8: Configurar variáveis de ambiente (`.env`)

- **Tipo:** INFRA | **Dependência:** A-3, A-4
- **Entregável:** Arquivos `.env.example` e `.env` local contendo chaves como `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, e variáveis públicas para o app Angular (`environment.ts`).
- **Critério de Aceite:** A inicialização do Express ocorre com sucesso carregando os dados do banco e cache via `dotenv`.
