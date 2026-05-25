# Fase I — Frontend: Painel Administrativo

> **Objetivo:** Painel exclusivo para Cabeleleila Leila gerenciar a operação em tempo real, editar serviços, ajustar horários de funcionamento, cadastrar bloqueios de agenda e monitorar clientes.

---

## Checklist de Tarefas

- [x] **I-1:** Criar **Dashboard Admin** (Métricas + Fila do Dia)
- [x] **I-2:** Criar página **Gestão de Agendamentos** (DataTable com Filtros)
- [x] **I-3:** Criar página **Gestão de Serviços** (Tabela + Form Modal)
- [x] **I-4:** Criar página **Configurar Horários de Funcionamento** (Grade 7 Dias)
- [x] **I-5:** Criar página **Gerenciar Bloqueios** (Calendário + Formulário)
- [x] **I-6:** Criar página **Listagem de Usuários** (Pesquisa de Clientes)

---

## Detalhamento das Tarefas

### I-1: Criar **Dashboard Admin**

- **Tipo:** FE | **Dependência:** F-6, E-7
- **Entregável:** Componente de rota `/admin/dashboard` exibindo os cards numéricos KPI do dia (agendamentos totais, pendentes, confirmados, cancelados, faturamento estimado e realizado) estruturados em glassmorphism e uma tabela compacta cronológica com os atendimentos subsequentes.
- **Critério de Aceite:**
  1. Acesso restrito a usuários autenticados com perfil `ADMIN`.
  2. Os dados de faturamento e volumes carregam dinamicamente a partir de consultas reativas ao servidor.

### I-2: Criar página **Gestão de Agendamentos**

- **Tipo:** FE | **Dependência:** F-6, E-4, E-6
- **Entregável:** DataTable interativa em `/admin/agendamentos` com suporte a paginação, ordenação e filtros rápidos de data e status.
- **Critério de Aceite:**
  1. Cada linha da tabela possui botões de ação rápida baseados no status corrente:
     - Se PENDENTE: Botão Confirmar (verde) e Cancelar (vermelho).
     - Se CONFIRMADO: Botão Concluir (azul) e Cancelar (vermelho).
  2. Executar uma ação recarrega a linha da tabela instantaneamente exibindo o novo status com notificação Toast informativa de sucesso.

### I-3: Criar página **Gestão de Serviços**

- **Tipo:** FE | **Dependência:** F-6, D-3
- **Entregável:** Rota `/admin/servicos` exibindo a tabela completa de serviços do salão (ativos e inativos). Possui um botão "Adicionar Novo Serviço" que abre um formulário em caixa de diálogo (Modal) do .
- **Critério de Aceite:**
  1. O modal serve tanto para criação de novos serviços quanto para edição de serviços existentes.
  2. Possui um botão alternador (Switch) para ativar ou desativar rapidamente o serviço do catálogo sem deletá-lo fisicamente.

### I-4: Criar página **Configurar Horários de Funcionamento**

- **Tipo:** FE | **Dependência:** F-6, D-4
- **Entregável:** Rota `/admin/horarios` exibindo uma grade vertical com os 7 dias da semana. Cada dia exibe inputs de hora de início e hora de término (ex: "08:00" às "18:00") e um interruptor (Switch) para marcar o dia como "Fechado" (ex: Domingos).
- **Critério de Aceite:** Alterar os campos e clicar em "Salvar Configurações" atualiza com sucesso no banco de dados e exibe alerta de sucesso.

### I-5: Criar página **Gerenciar Bloqueios**

- **Tipo:** FE | **Dependência:** F-6, D-5
- **Entregável:** Rota `/admin/bloqueios` combinando um formulário para cadastrar novos bloqueios pontuais (Data Início, Data Fim, Motivo) e uma lista em cartões contendo os bloqueios futuros agendados.
- **Critério de Aceite:** Admin consegue criar bloqueios e deletar bloqueios passados/futuros diretamente na tela. O sistema valida se a data de início é anterior à data de término.

### I-6: Criar página **Listagem de Usuários**

- **Tipo:** FE | **Dependência:** F-6, C-13
- **Entregável:** Rota `/admin/usuarios` contendo uma tabela exibindo nome, e-mail, telefone e perfil de todos os usuários cadastrados, com campo de busca por nome ou e-mail no topo.
- **Critério de Aceite:** Digitar no campo de busca filtra dinamicamente as linhas exibidas (debounce de 300ms para evitar sobrecarga de requisições).
- **Guia de Implementação:**
  - O input de busca deve ser gerenciado por um Signal ou RxJS `debounceTime(300)` na facade do componente de listagem de usuários.
