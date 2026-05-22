# Fase H — Frontend: Área do Cliente

> **Objetivo:** Catálogo de serviços interativo, fluxo de agendamento guiado em etapas (Wizard) com verificação de horários em tempo real e listagem de agendamentos pessoais.

---

## Checklist de Tarefas

- [ ] **H-1:** Criar página pública **Catálogo de Serviços**
- [ ] **H-2:** Criar **Fluxo de Agendamento — Passo 1:** Selecionar Serviço
- [ ] **H-3:** Criar **Fluxo de Agendamento — Passo 2:** Selecionar Data
- [ ] **H-4:** Criar **Fluxo de Agendamento — Passo 3:** Selecionar Horário
- [ ] **H-5:** Criar **Fluxo de Agendamento — Passo 4:** Resumo & Confirmação
- [ ] **H-6:** Criar página **Meus Agendamentos** com histórico e cancelamento

---

## Detalhamento das Tarefas

### H-1: Criar página pública **Catálogo de Serviços**
* **Tipo:** FE | **Dependência:** F-1, D-3
* **Entregável:** Rota `/servicos` contendo uma lista em grade (grid) exibindo os serviços cadastrados no backend (nome, descrição, preço formatado em Real e duração). Cada card possui um botão destacado para "Agendar Agora".
* **Critério de Aceite:**
  1. A página é 100% responsiva (cards fluem de 1 coluna em celular para 3 colunas em telas grandes).
  2. Clicar em "Agendar Agora" redireciona para a rota privada `/agendar`, injetando automaticamente o serviço selecionado no estado do fluxo.

### H-2: Criar **Fluxo de Agendamento — Passo 1:** Selecionar Serviço
* **Tipo:** FE | **Dependência:** H-1, F-6
* **Entregável:** Interface inicial do Wizard em `/agendar`. Se o cliente veio direto para essa rota sem selecionar um serviço, exibe um combobox ou grade menor para ele selecionar o serviço desejado.
* **Critério de Aceite:** Escolher o serviço o salva temporariamente em um Signal do fluxo e avança automaticamente para o Passo 2 com efeito de transição.

### H-3: Criar **Fluxo de Agendamento — Passo 2:** Selecionar Data
* **Tipo:** FE | **Dependência:** H-2, D-6
* **Entregável:** Componente de calendário interativo no Passo 2.
* **Critério de Aceite:**
  1. O calendário carrega dinamicamente a indisponibilidade de datas chamando a API do backend.
  2. Finais de semana fechados, feriados e datas bloqueadas ficam desabilitados para clique (cinza fosco).
  3. Selecionar uma data válida habilita o avanço para a grade de horários.

### H-4: Criar **Fluxo de Agendamento — Passo 3:** Selecionar Horário
* **Tipo:** FE | **Dependência:** H-3
* **Entregável:** Grade de botões do tipo "Pill" exibindo os slots livres calculados pelo backend para a data e serviço escolhidos.
* **Critério de Aceite:** Slots indisponíveis aparecem desabilitados e com riscado visual; slots livres mudam para a cor dourada ao serem selecionados, armazenando o valor da hora e habilitando a etapa final.

### H-5: Criar **Fluxo de Agendamento — Passo 4:** Resumo & Confirmação
* **Tipo:** FE | **Dependência:** H-4, E-3
* **Entregável:** Tela de revisão consolidada contendo serviço, valor, duração, data, hora selecionada e um campo de texto livre para "Observações do Atendimento".
* **Critério de Aceite:**
  1. O botão "Confirmar Agendamento" dispara a requisição transacional para a API.
  2. Sucesso exibe animação de confete ou card de parabéns elegante e redireciona em 3 segundos para `/meus-agendamentos`.
  3. Erro (ex: concorrência de slot) exibe notificação Toast vermelha explicativa e permite voltar à tela anterior para escolher outro horário.

### H-6: Criar página **Meus Agendamentos**
* **Tipo:** FE | **Dependência:** F-6, E-4, E-5
* **Entregável:** Rota `/meus-agendamentos` exibindo o histórico de atendimentos pessoais divididos em abas ("Próximos" e "Histórico Passado").
* **Critério de Aceite:**
  1. Cada agendamento exibe badge colorido com seu respectivo status.
  2. Agendamentos futuros com mais de 2 horas de antecedência exibem o botão "Cancelar Agendamento", abrindo um modal de confirmação . A confirmação atualiza a listagem na tela de forma ágil sem recarregar o navegador.
