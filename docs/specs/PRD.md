# Documento de Requisitos do Produto (PRD) - MVP: Cabeleleila Leila

> **Sistema de Agendamentos Online e Gestão de Salão de Beleza**

---

## 1. Visão e Problema

* **O Problema:** Salões de beleza de médio e pequeno porte, como o renomado "Cabeleleila Leila", sofrem com a ineficiência operacional decorrente de agendamentos realizados de forma descentralizada (mensagens de texto, chamadas telefônicas, anotações em papel). Isso acarreta conflitos de horários, perda de produtividade dos profissionais, falta de visibilidade do faturamento diário/mensal e dificuldade para gerenciar cancelamentos e a fidelidade dos clientes.
* **A Solução:** Desenvolver um sistema integrado de agendamentos online e gestão de salão de beleza. O cliente terá autonomia para listar os serviços disponíveis, verificar a disponibilidade em tempo real e agendar seu próprio horário. O administrador (Cabeleleila Leila) terá um painel exclusivo (Dashboard) para gerenciar o catálogo de serviços, definir horários de funcionamento, bloquear a agenda (em feriados ou folgas), controlar o status dos agendamentos e visualizar relatórios gerenciais e de usuários.

---

## 2. Público-Alvo e Personas

* **Cabeleleila Leila (Administradora / Gestora):** Usuária principal da área de gestão. Precisa visualizar a ocupação diária, confirmar ou concluir agendamentos, cadastrar e editar serviços, configurar horários de funcionamento e bloquear datas específicas.
* **Clientes do Salão:** Usuários finais. Buscam facilidade para acessar o site do salão via celular ou computador, escolher o serviço desejado, selecionar uma data e horário livres, efetuar o agendamento de forma transparente e acompanhar suas reservas futuras e passadas.

---

## 3. Jornada do Usuário

### A. Jornada do Cliente
1. **Descoberta & Catálogo:** O cliente acessa a página inicial pública e visualiza os serviços disponíveis (nome, descrição, preço e duração).
2. **Cadastro / Login:** Para agendar, o cliente faz login (ou cria uma conta com e-mail/senha ou utilizando sua conta Google via OAuth2).
3. **Fluxo de Agendamento (Passo a Passo):**
   * **Serviço:** O cliente escolhe o serviço desejado.
   * **Data:** O cliente seleciona um dia no calendário interativo (dias sem disponibilidade ou com bloqueios aparecem desabilitados).
   * **Horário:** O cliente escolhe um horário livre na grade de horários daquele dia.
   * **Confirmação:** O cliente revisa os dados (serviço, data, hora, profissional e valor), insere observações e confirma o agendamento.
4. **Gestão de Agendamentos:** O cliente acessa a área "Meus Agendamentos" para visualizar seu histórico e, se necessário, cancelar um agendamento futuro (respeitando a antecedência mínima).

### B. Jornada da Administradora (Leila)
1. **Painel de Controle:** Leila faz login e é direcionada ao Dashboard Administrativo, visualizando os agendamentos do dia, estatísticas básicas (agendamentos pendentes, confirmados, concluídos) e os próximos atendimentos da fila.
2. **Gestão da Agenda:** Leila monitora e gerencia a grade de agendamentos. Ela pode confirmar novas solicitações, marcar atendimentos como concluídos ou cancelar horários se houver imprevistos.
3. **Gestão de Serviços (Catálogo):** Leila cadastra novos serviços, define preços, durações e ativa ou desativa opções do catálogo.
4. **Configurações Operacionais:** Leila altera os horários de funcionamento padrão da semana e insere bloqueios de agenda (ex: feriados, férias coletivas, manutenção do salão).

---

## 4. Requisitos Funcionais e Não Funcionais

### Requisitos Funcionais (RF)

#### Módulo 1: Gestão de Identidade e Acesso (IAM)
* **RF-01 (Registro de Usuário):** Registro com e-mail, senha criptografada (Argon2), nome e telefone. Perfil padrão: `CLIENTE`. Geração de token para confirmação de e-mail.
* **RF-02 (Login Local & JWT):** Autenticação por e-mail/senha gerando um Access Token (JWT curto) e um Refresh Token (JWT longo e persistido, retornado em cookie HttpOnly para maior segurança).
* **RF-03 (Google OAuth2):** Login facilitado via Google com redirect, callback e vinculo de conta automática.
* **RF-04 (Autenticação e RBAC):** Controle de acessos robusto. Rotas `/admin/*` restritas ao perfil `ADMIN`. Rotas de clientes restritas ao perfil logado e autenticado.
* **RF-05 (Recuperação de Senha & Confirmação de E-mail):** Fluxo seguro de esquecimento de senha com tokens temporários e envio simulado de e-mail. Confirmação de e-mail ativa o campo correspondente na tabela de usuários.

#### Módulo 2: Catálogo & Disponibilidade
* **RF-06 (CRUD de Serviços):** Admin gerencia os serviços (nome, descrição, preço, duração em minutos e flag ativo). Clientes visualizam apenas serviços ativos.
* **RF-07 (Horários de Funcionamento):** Admin configura os horários de início e término permitidos para cada dia da semana.
* **RF-08 (Bloqueios de Agenda):** Admin cria bloqueios temporários ou periódicos na agenda (feriados, férias, manutenção) com motivo detalhado.
* **RF-09 (Cálculo de Disponibilidade):** O sistema deve cruzar dinamicamente o horário de funcionamento do dia, os bloqueios da agenda, a duração do serviço selecionado e os agendamentos já existentes para exibir apenas slots 100% livres para o cliente.

#### Módulo 3: Agendamentos
* **RF-10 (Criação de Agendamento):** O cliente seleciona um slot livre e cria o agendamento com status inicial `PENDENTE` (ou `CONFIRMADO` caso configurado). Validação estrita de concorrência para impedir agendamentos duplicados.
* **RF-11 (Máquina de Estados de Agendamento):** Transição controlada de estados: `PENDENTE -> CONFIRMADO -> CONCLUIDO` ou `PENDENTE/CONFIRMADO -> CANCELADO`.
* **RF-12 (Cancelamento):** O cliente pode cancelar seu agendamento futuro contanto que respeite a antecedência mínima parametrizada (ex: 2 horas de antecedência). O admin pode cancelar a qualquer momento.
* **RF-13 (Dashboard Admin):** Visualização consolidada em tempo real dos atendimentos do dia, contadores numéricos e lista cronológica dos próximos clientes.

### Requisitos Não Funcionais (RNF)

* **RNF-01 (Monorepo & Build):** Monorepo gerenciado com **Turborepo** (`turbo.json`) para orquestrar as aplicações e pacotes compartilhados.
* **RNF-02 (Backend Framework):** NestJS estruturado em **Clean Architecture** (camadas claras: `domain/`, `application/`, `infrastructure/`, `presentation/`), TypeScript, Node.js 22+.
* **RNF-03 (Frontend Framework):** Angular 21+, com gerência de estado reativa (Signals/NgRx component store) e **Tailwind CSS**.
* **RNF-04 (Design System):** Integração com **** (Angular UI primitives) no pacote `packages/ui` para garantir componentes acessíveis e elegantes de acordo com as diretrizes do Shadcn UI.
* **RNF-05 (Banco de Dados & ORM):** Banco de dados relacional **PostgreSQL** com **Prisma ORM** para migrações e modelagem ágil.
* **RNF-06 (Cache e Throttler):** **Redis** atuando como store para o rate limiting e cache de dados de alta leitura.
* **RNF-07 (Segurança & Cookies):** Armazenamento seguro de Refresh Token via cookies `HttpOnly` com flags `Secure` e `SameSite=Strict`. Proteção contra ataques XSS e CSRF.
* **RNF-08 (Containers & DevOps):** Orquestração local do ambiente via `docker-compose.yml` contendo os serviços `postgres`, `redis`, `api` (NestJS) e `web` (Angular).

---

## 5. Regras de Negócio Iniciais

1. **Horário Livre Real:** Um slot de agendamento de um serviço $S$ que dura $D$ minutos é considerado válido apenas se não conflitar com nenhum outro agendamento ativo (`PENDENTE` ou `CONFIRMADO`) e estiver integralmente dentro do horário de funcionamento e fora de qualquer período de bloqueio ativo.
2. **Antecedência Mínima de Agendamento/Cancelamento:** O cliente não pode agendar um horário com menos de 1 hora de antecedência em relação ao horário atual, e só pode efetuar cancelamentos com antecedência mínima de 2 horas.
3. **Privacidade de Dados:** A senha dos usuários deve ser obrigatoriamente hasheada usando o algoritmo **Argon2** no backend. O hash de senha nunca deve trafegar nas requisições de listagem de usuários e consultas de perfil.
4. **Política de Rotação de Refresh Token (RTR):** A cada requisição de refresh token, o token anterior é revogado e um novo par de tokens (Access + Refresh) é emitido. Se um refresh token já revogado for usado, o sistema assume uma possível brecha de segurança, invalida todas as sessões ativas daquele usuário e exige novo login.

---

## 6. Critérios de Aceite (Definition of Done - DoD)

- [ ] Todas as rotas de API possuem validações de payload de entrada (DTOs com `Zod`).
- [ ] O controle de permissões por perfil (RBAC) está ativado em todas as rotas protegidas no backend e frontend.
- [ ] Os fluxos do frontend (Angular) utilizam interceptores HTTP para injeção de tokens JWT e tratamento reativo de expiração de sessão (código 401).
- [ ] A aplicação realiza o build de produção completo executando `npx turbo run build` sem erros de compilação ou lints.
- [ ] O banco de dados PostgreSQL está versionado por migrations do Prisma e possui um script de seed completo.
- [ ] O ambiente completo sobe localmente através de um único comando `docker compose up`.
