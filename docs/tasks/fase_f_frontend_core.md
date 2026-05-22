# Fase F — Frontend: Core, Layout & Design System

> **Objetivo:** Estabelecer a estrutura base do frontend Angular, integrando os tokens de design do Tailwind CSS, estruturando a navegação reativa com Signals e criando interceptores de requisição robustos.

---

## Checklist de Tarefas

- [ ] **F-1:** Definir **design system** e variáveis CSS globais no Angular
- [ ] **F-2:** Criar **layout principal** com Sidebar/Navbar responsivo
- [ ] **F-3:** Configurar **roteamento** com lazy loading e guards placeholders
- [ ] **F-4:** Criar **serviço HTTP base** (`ApiService`) com interceptor
- [ ] **F-5:** Criar **AuthStore** com Angular Signals
- [ ] **F-6:** Implementar **AuthGuard** e **RoleGuard** reativos

---

## Detalhamento das Tarefas

### F-1: Definir **design system** e variáveis CSS globais
* **Tipo:** FE | **Dependência:** A-5
* **Entregável:** Configuração de cores, fontes do Google (Playfair Display, Outfit) e espaçamentos no `tailwind.config.ts` do workspace, juntamente com o arquivo `index.css` configurado.
* **Critério de Aceite:** O build de estilização do monorepo roda com sucesso e as classes personalizadas (ex: `bg-stone-950`, `text-amber-600`) são aplicadas aos componentes de forma harmoniosa.

### F-2: Criar **layout principal** com Sidebar/Navbar
* **Tipo:** FE | **Dependência:** F-1
* **Entregável:** Componente `LayoutComponent` em `shared/components/` contendo cabeçalho fixo com efeito glassmorphic, menu de navegação colapsável para mobile e painel lateral na visualização desktop.
* **Critério de Aceite:** O layout se adapta perfeitamente a resoluções móveis (exibindo hambúrguer menu com sidebar lateral temporária) e desktop (sidebar fixa no canto esquerdo).

### F-3: Configurar **roteamento** com lazy loading
* **Tipo:** FE | **Dependência:** F-2
* **Entregável:** Arquivo `app.routes.ts` configurado utilizando a estratégia de carregamento tardio (lazy loading) para as principais features do sistema.
* **Critério de Aceite:** Transição de rotas ocorre sem carregamento de página inteiro, isolando os módulos em arquivos javascript menores carregados sob demanda.

### F-4: Criar **serviço HTTP base** (`ApiService`) com interceptor
* **Tipo:** FE | **Dependência:** A-8
* **Entregável:** Classe `ApiService` injetável para requisições padronizadas e o `AuthInterceptor` mapeado nas provisões da aplicação.
* **Critério de Aceite:**
  1. Requisições incluem automaticamente o cabeçalho `Authorization: Bearer <token>` caso o usuário esteja logado.
  2. Resposta `401` interrompe os fluxos e invoca o refresh token; falha persistente limpa o estado e redireciona para `/login`.

### F-5: Criar **AuthStore** com Angular Signals
* **Tipo:** FE | **Dependência:** F-4
* **Entregável:** Arquivo `apps/web/src/app/store/auth.store.ts` utilizando signals para gerenciar o estado global de autenticação do usuário logado.
* **Critério de Aceite:** O estado de login persiste no ciclo de vida da aplicação de forma reativa. Modificações no signal de usuário refletem instantaneamente nos menus visuais.

### F-6: Implementar **AuthGuard** e **RoleGuard** reativos
* **Tipo:** FE | **Dependência:** F-5
* **Entregável:** Guards baseados em rotas funcionais mapeando a segurança com base nos seletores computados do `AuthStore`.
* **Critério de Aceite:** Tentar acessar `/admin/*` sem privilégio de ADMIN redireciona para `/403` ou página de catálogo; tentar acessar `/agendar` sem estar autenticado força o redirecionamento para `/login`.
