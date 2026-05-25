# 💇‍♀️ Guia de Execução da Cabeleleila Leila em Qualquer Ambiente

Este guia fornece instruções extremamente detalhadas para configurar, executar e testar a aplicação **Cabeleleila Leila** em diferentes ambientes de desenvolvimento, testes e produção.

A aplicação é estruturada como um **Monorepo** orquestrado pelo **Turborepo** e estruturado com as seguintes tecnologias:
- **Backend (`apps/api`):** Node.js v22+ com Express estruturado em **Clean Architecture** (TypeScript, PostgreSQL nativo com `pg`, Redis para cache e rate-limiting).
- **Frontend (`apps/web`):** Angular v21+ com gerenciamento de estado baseado em **Signals** e estilização via **Tailwind CSS v4**.
- **Shared (`packages/*`):** `packages/ui` para componentes de interface compartilhados e `packages/eslint-config` para padronização de linting.

---

## 📋 Pré-requisitos Gerais

Antes de iniciar o setup da aplicação, garanta que sua máquina de desenvolvimento possui as seguintes ferramentas instaladas:

1. **Node.js**: Versão `>= 22.0.0` (Recomendado v22 LTS).
2. **npm**: Versão `>= 10.9.3` (Gerenciador de pacotes nativo configurado via `packageManager` no monorepo).
3. **Docker & Docker Compose**: Necessários para subir os serviços locais (PostgreSQL e Redis) ou rodar a aplicação em containers.
4. **Git**: Para controle de versão.

---

## ⚙️ Variáveis de Ambiente (`.env`)

A aplicação utiliza um arquivo `.env` na raiz do monorepo para centralizar as configurações de todos os serviços. Crie uma cópia do arquivo de exemplo `.env.example` e renomeie-a para `.env`:

```bash
cp .env.example .env
```

### Detalhamento dos Parâmetros do `.env`

| Categoria | Variável | Valor Padrão / Sugerido | Descrição |
| :--- | :--- | :--- | :--- |
| **Server** | `PORT` | `3000` | Porta em que a API do backend será exposta. |
| **Server** | `NODE_ENV` | `development` | Ambiente de execução (`development`, `test`, `production`). |
| **Database** | `DB_USER` | `leila` | Nome do usuário do PostgreSQL. |
| **Database** | `DB_PASSWORD` | `leila_password` | Senha de acesso ao banco PostgreSQL. |
| **Database** | `DB_NAME` | `salao` (ou `cabeleleila_leila`) | Nome do banco de dados a ser criado/usado. |
| **Database** | `DATABASE_URL` | `postgresql://leila:leila_password@localhost:5432/salao?schema=entidades` | String de conexão JDBC completa para o PostgreSQL. |
| **Cache** | `REDIS_URL` | `redis://localhost:6379` | String de conexão para o Redis cache e rate limiter. |
| **Segurança**| `JWT_SECRET` | *String aleatória de min 32 caracteres* | Chave privada para assinar e validar Access Tokens JWT. |
| **Segurança**| `JWT_REFRESH_SECRET`| *String aleatória de min 32 caracteres* | Chave privada para assinar e validar Refresh Tokens JWT. |
| **Segurança**| `ALLOWED_ORIGINS` | `http://localhost:4200,http://127.0.0.1:4200` | Origens CORS permitidas (separadas por vírgula). |
| **OAuth** | `GOOGLE_CLIENT_ID`| *(Opcional)* | ID de cliente obtido no Google Cloud Console para Login OAuth2. |
| **OAuth** | `GOOGLE_CLIENT_SECRET`| *(Opcional)* | Segredo do cliente Google para autenticação OAuth2. |
| **OAuth** | `GOOGLE_REDIRECT_URI`| `http://localhost:3000/api/auth/google/callback` | Rota da API que receberá o callback de login do Google. |
| **E-mail** | `RESEND_ID` | *(Opcional)* | Chave de API do serviço **Resend** para envio de e-mails de recuperação. |
| **E-mail** | `FROM_EMAIL` | *(Opcional)* | E-mail remetente verificado no Resend (ex: `send@zorde.com.br`). |

> [!CAUTION]
> Em produção, altere obrigatoriamente as chaves `JWT_SECRET` e `JWT_REFRESH_SECRET` para valores complexos e seguros. Nunca publique o arquivo `.env` preenchido em repositórios públicos de código.

---

## 🐳 Ambiente 1: Orquestração Completa via Docker (100% Containerizado)

Este ambiente é ideal para testar a aplicação de forma rápida e limpa, garantindo compatibilidade multiplataforma sem necessidade de instalar dependências locais na máquina do desenvolvedor (exceto o próprio Docker).

### Fluxo de Execução

1. **Subir os containers da aplicação:**
   Este comando executa a compilação local (build) das imagens e inicia o PostgreSQL, Redis, a API e o aplicativo Web.
   ```bash
   docker compose up --build -d
   ```

2. **Verificar se os containers estão saudáveis:**
   ```bash
   docker compose ps
   ```
   *Você deve ver os containers `leila_postgres`, `leila_redis`, `leila_api` e `leila_web` em estado `healthy` ou `running`.*

3. **Aplicar Migrations do Banco de Dados no Container:**
   Como as migrations criam as tabelas e índices necessários no banco de dados isolado, é obrigatório rodar o script de migração.
   ```bash
   docker compose exec api npm run migrate
   ```

4. **Popular dados de teste (Seed) no Container:**
   O seed insere registros indispensáveis como perfis `ADMIN` e `CLIENTE`, o administrador inicial (`leila@cabeleleila.com` com senha `Admin@123`) e serviços padrão do salão de forma idempotente.
   ```bash
   docker compose exec api npm run seed
   ```

### 🔗 Acesso ao Sistema
- **Aplicativo Frontend (Web):** [http://localhost:4200](http://localhost:4200)
- **API Backend:** [http://localhost:3000](http://localhost:3000)
- **Health Check da API:** [http://localhost:3000/health](http://localhost:3000/health)

### 🧹 Desligamento do Ambiente
Para remover completamente os containers criados, mantendo ou limpando os volumes de dados:
```bash
# Para desligar mantendo os dados salvos:
docker compose down

# Para desligar apagando todo o banco e cache (reset completo):
docker compose down -v
```

---

## 🛠️ Ambiente 2: Desenvolvimento Híbrido (Semi-Dockerizado - Recomendado)

Este é o ambiente recomendado para o **desenvolvimento ativo**. Subimos o banco PostgreSQL e o cache Redis via Docker, e rodamos a API Backend e o Frontend Angular **nativamente** na máquina física. Isso otimiza o tempo de recompilação (Hot Reloading), facilita o debug com breakpoints no VS Code/WebStorm e melhora a velocidade do Vitest.

### Fluxo de Execução

1. **Instalar dependências do Monorepo:**
   Na raiz do projeto, instale os pacotes necessários de todas as aplicações e workspaces integrados:
   ```bash
   npm install
   ```

2. **Subir apenas os serviços de Infraestrutura (Postgres & Redis) no Docker:**
   ```bash
   docker compose up -d postgres redis
   ```
   *Aguarde cerca de 5 segundos até os containers estarem totalmente disponíveis.*

3. **Executar as Migrations locais contra o banco Dockerizado:**
   ```bash
   npm run migrate --workspace=apps/api
   ```

4. **Popular a base de dados (Seed):**
   ```bash
   npm run seed --workspace=apps/api
   ```

5. **Iniciar a aplicação em modo de desenvolvimento:**
   O Turborepo orquestra as dependências e roda concorrentemente a API Express e o Angular Web Server em modo watch:
   ```bash
   npm run dev
   ```

   *Se preferir rodar os serviços em abas/terminais separados para isolar os logs:*
   ```bash
   # Terminal 1: Iniciar API Backend
   npm run dev --workspace=apps/api

   # Terminal 2: Iniciar Web App Frontend
   npm run dev --workspace=apps/web
   ```

### 🔗 Acesso ao Sistema
- **Aplicativo Frontend (Web):** [http://localhost:4200](http://localhost:4200) (Hot-reload ativo para mudanças de arquivos)
- **API Backend:** [http://localhost:3000](http://localhost:3000) (Hot-reload ativo com `tsx watch`)

---

## 💻 Ambiente 3: Execução 100% Nativa (Sem Docker)

Caso não queira ou não possa utilizar o Docker de forma alguma, você pode rodar todos os serviços de infraestrutura instalados nativamente no seu sistema operacional.

### Pré-requisitos Nativos
- PostgreSQL 16 instalado e rodando localmente (porta `5432`).
- Redis v7+ instalado e rodando localmente (porta `6379`).

### Fluxo de Execução

1. **Configuração do PostgreSQL local:**
   Abra seu terminal SQL ou cliente visual (como DBeaver) e garanta que o banco de dados configurado no seu `.env` exista e o usuário local possua permissões de leitura/escrita.
   ```sql
   CREATE DATABASE salao;
   ```

2. **Instalar Dependências:**
   ```bash
   npm install
   ```

3. **Migrar e Popular o Banco:**
   ```bash
   npm run migrate --workspace=apps/api
   ```
   ```bash
   npm run seed --workspace=apps/api
   ```

4. **Executar o Monorepo:**
   ```bash
   npm run dev
   ```

---

## 🧪 Ambiente de Testes (Vitest)

O backend possui uma suite robusta de testes automatizados unitários e de integração utilizando o **Vitest**. Os testes rodam contra um banco de dados dedicado e isolado (`salao_test`) para evitar contaminação do ambiente de desenvolvimento.

### Fluxo de Setup e Execução de Testes

1. **Subir os containers de banco de dados e Redis de apoio (se já não estiverem rodando):**
   ```bash
   docker compose up -d postgres redis
   ```

2. **Criar o banco de dados de testes:**
   Seu banco PostgreSQL local deve ter a base `salao_test` criada. Conecte ao postgres e execute:
   ```sql
   CREATE DATABASE salao_test;
   ```

3. **Migrar o Banco de Testes:**
   Como a suite roda em um banco isolado, as migrations precisam ser aplicadas nele. Aponte explicitamente a url de teste para migrar:
   ```bash
   NODE_ENV=test DATABASE_URL=postgresql://leila:leila_password@localhost:5432/salao_test npm run migrate --workspace=apps/api
   ```

4. **Rodar os Testes:**
   O arquivo de configuração do Vitest (`vitest.config.ts`) já está pré-configurado para injetar automaticamente as credenciais corretas de teste e limpar os dados de todas as tabelas sequencialmente entre os arquivos (`test/setup.ts`).
   ```bash
   # Executar todos os testes uma única vez
   npm run test --workspace=apps/api

   # Executar em modo watch (ótimo para TDD)
   npm run test:watch --workspace=apps/api

   # Obter relatório de cobertura de testes (Coverage)
   npm run test:coverage --workspace=apps/api
   ```

---

## 🚀 Ambiente de Produção (Build & Deploy)

Para preparar a aplicação para produção, é necessário compilar o TypeScript do backend e gerar o bundle otimizado de produção do Angular.

### 1. Compilação de Artefatos
Na raiz do monorepo, execute o pipeline de build otimizado do Turborepo:
```bash
npm run build
```
- **Backend:** Compila os arquivos TypeScript em Javascript puro no diretório `apps/api/dist/`.
- **Frontend:** Compila o código Angular, executa otimizações estáticas e minificação salvando o bundle otimizado em `apps/web/dist/web/browser/`.

### 2. Execução da API em Produção
Configure o `.env` para `NODE_ENV=production` e rode o script de inicialização do servidor compilado:
```bash
# Dentro de apps/api
npm run start
```

### 3. Considerações Críticas para Produção
- **CORS e Allowed Origins:** Restrinja a variável `ALLOWED_ORIGINS` estritamente ao domínio oficial onde o frontend estará hospedado (ex: `https://cabeleleila.com.br`).
- **Segurança de Cookies:** No ambiente de produção (`NODE_ENV=production`), os cookies que armazenam o `Refresh Token` serão emitidos com as flags `Secure` (exige HTTPS), `HttpOnly` (inacessível para scripts JS) e `SameSite=Strict` para mitigar ataques XSS e CSRF. Portanto, o deploy da API deve utilizar **SSL (HTTPS)**.
- **Conexão SSL no PostgreSQL:** Se você estiver utilizando um serviço gerenciado de nuvem (AWS RDS, Supabase, Neon), configure a string de conexão para exigir SSL (geralmente adicionando `?sslmode=require` à string de conexão).
- **Provedores de Servidor:**
  - O backend (Node.js/Express) pode ser hospedado em instâncias VPS (Docker/PM2), serviços Serverless (como Render, Fly.io, Railway) ou clusters Kubernetes.
  - O frontend (Angular compilado em HTML/JS estáticos) pode ser servido de forma ultrarrápida a partir de CDNs como Netlify, Vercel, Firebase Hosting ou buckets AWS S3 emparelhados com CloudFront.

---

## ❓ Resolução de Problemas (Troubleshooting)

### 1. Erro ao rodar Migrations (`Connection refused`)
- **Causa:** O PostgreSQL não subiu a tempo no Docker ou a porta `5432` já está ocupada por outra instância nativa.
- **Solução:** Rode `docker compose ps` para verificar se `leila_postgres` está em execução. Se houver outra instância nativa rodando no seu computador, pare o serviço nativo com `sudo systemctl stop postgresql` e tente reiniciar os containers Docker.

### 2. Erro de autenticação Google OAuth (`redirect_uri_mismatch`)
- **Causa:** A URI de retorno de chamada configurada no console do Google Developer não coincide com a especificada em `GOOGLE_REDIRECT_URI` no arquivo `.env`.
- **Solução:** Garanta que ambas as URIs sejam exatamente idênticas, por exemplo: `http://localhost:3000/api/auth/google/callback`.

### 3. Erro de Cookies nos Navegadores (`401 Unauthorized` persistente)
- **Causa:** Alguns navegadores bloqueiam cookies em conexões de origens cruzadas locais (`localhost` vs `127.0.0.1`).
- **Solução:** Garanta que você esteja acessando o frontend através de `http://localhost:4200` e não pelo IP cru `http://127.0.0.1:4200`, para alinhar o escopo dos cookies do backend `localhost:3000`.

### 4. Limpeza Geral de Cache e Módulos do Turborepo
Se o Turborepo travar em algum build ou o node_modules estiver quebrado:
```bash
# Limpar pastas dist e caches do turbo
npm run clean

# Reinstalar tudo do zero
rm -rf node_modules apps/api/node_modules apps/web/node_modules
npm install
```
