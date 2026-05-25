# Fase G — Frontend: Módulo IAM

> **Objetivo:** Telas elegantes de login, registro, recuperação de senha e gestão do perfil do usuário utilizando componentes com alta interatividade.

---

## Checklist de Tarefas

- [x] **G-1:** Criar página de **Login**
- [x] **G-2:** Criar página de **Registro**
- [x] **G-3:** Criar páginas de **Recuperar** e **Redefinir Senha**
- [x] **G-4:** Criar página de **Perfil do Usuário**
- [x] **G-5:** Implementar **Callback OAuth Google**

---

## Detalhamento das Tarefas

### G-1: Criar página de **Login**

- **Tipo:** FE | **Dependência:** F-5, C-5
- **Entregável:** Componente de formulário sob a rota `/login`. Contém campos para e-mail, senha com visualizador (olho mágico para exibir senha), link de "Esqueci a senha" e um botão destacado para login social via Google.
- **Critério de Aceite:**
  1. Validações client-side acusam e-mail inválido ou campos vazios antes do submit.
  2. Submissão envia requisição para `/auth/login`, popula o `AuthStore` com o Access Token retornado e redireciona o usuário para sua página correspondente (Dashboard para Admin, Catálogo para Cliente).
  3. Estilo baseado em card flutuante com blur de fundo (Glassmorphism).

### G-2: Criar página de **Registro**

- **Tipo:** FE | **Dependência:** F-5, C-4
- **Entregável:** Componente sob a rota `/register` com formulário para nome completo, e-mail, telefone com máscara visual e senha com barra de força de senha.
- **Critério de Aceite:**
  1. Confirmação de senha incorreta impede a submissão e exibe feedback visual.
  2. Registro bem-sucedido exibe banner elegante indicando que um e-mail de confirmação foi disparado, redirecionando o usuário para `/login` em 5 segundos.

### G-3: Criar páginas de **Recuperar** e **Redefinir Senha**

- **Tipo:** FE | **Dependência:** F-5, C-10
- **Entregável:** Rotas `/forgot-password` (solicitar link) e `/reset-password` (digitar nova senha fornecendo token da URL).
- **Critério de Aceite:** O fluxo valida o token e permite a atualização da senha de forma segura com mensagens visuais de sucesso ou erro (caso o token expire).

### G-4: Criar página de **Perfil do Usuário**

- **Tipo:** FE | **Dependência:** F-5, C-13
- **Entregável:** Componente de perfil privado sob a rota `/perfil`.
- **Critério de Aceite:**
  1. Permite visualizar os dados cadastrados e editar os campos Nome e Telefone.
  2. Exibe badge indicando se o e-mail está confirmado ou pendente.
  3. Salvamento atualiza os dados locais no `AuthStore` e envia as modificações para o servidor backend de forma reativa.

### G-5: Implementar **Callback OAuth Google**

- **Tipo:** FE | **Dependência:** F-5, C-12
- **Entregável:** Rota `/auth/google/callback` responsável por interceptar o parâmetro de token gerado pela autenticação externa do Google.
- **Critério de Aceite:** Captura o Access Token e o usuário da URL ou resposta de redirecionamento, atualiza o `AuthStore` e executa o login com sucesso sem expor credenciais em texto claro na barra de endereços.
