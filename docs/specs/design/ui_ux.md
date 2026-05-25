# Design System & UI/UX — Cabeleleila Leila

> Definição da identidade visual, paletas de cores, tipografia, efeitos estéticos premium e guia de interface para o aplicativo web.

---

## 1. Identidade Visual & Conceito Estético

O salão **Cabeleleila Leila** é sinônimo de elegância, beleza e bem-estar. Para refletir essa essência no ambiente digital, a interface adota uma estética **Luxury Modernism** combinada com **Glassmorphism**, promovendo um visual extremamente sofisticado, limpo e atraente.

### Pilares de Design

1. **Sofisticação:** Uso de contrastes marcantes entre tons profundos de cinza/veludo e detalhes dourados.
2. **Fluidez:** Transições suaves de estado (micro-animações), efeitos de desfoque de fundo (backdrop-blur) e transição de páginas em slide.
3. **Clareza Operacional:** Fluxo de agendamento em etapas estruturadas para reduzir a carga cognitiva do cliente.

---

## 2. Tokens de Design (Tailwind & CSS Variables)

Estes valores devem ser configurados no arquivo `tailwind.config.ts` do frontend.

### A. Paleta de Cores Premium

```css
:root {
  /* Cores de Fundo e Superfície */
  --bg-primary: #0c0a09; /* Charcoal Profundo / Stone 950 */
  --bg-secondary: #1c1917; /* Charcoal Médio / Stone 900 */
  --surface: #292524; /* Stone 800 (Cards e Modais) */
  --surface-glass: rgba(41, 37, 36, 0.6); /* Transparência para Glassmorphism */

  /* Cores de Destaque (Acentuação) */
  --gold-primary: #d97706; /* Amber 600 - Ouro Quente */
  --gold-hover: #f59e0b; /* Amber 500 - Ouro Brilhante */
  --gold-light: #fef3c7; /* Amber 100 - Ouro Suave para Textos Secundários */

  /* Cores de Suporte e Status */
  --success: #10b981; /* Esmeralda - Confirmado / Concluído */
  --warning: #f59e0b; /* Âmbar - Pendente */
  --danger: #ef4444; /* Vermelho - Cancelado / Erro */
  --info: #3b82f6; /* Azul - Informativo */

  /* Cores de Texto */
  --text-primary: #fafaf9; /* Off-white / Stone 50 */
  --text-secondary: #d6d3d1; /* Cinza Claro / Stone 300 */
  --text-muted: #78716c; /* Cinza Escuro / Stone 500 */
}
```

### B. Tipografia

- **Títulos (Headings):** **Playfair Display** (Google Fonts) — Uma fonte serifada de altíssima elegância para cabeçalhos e seções promocionais, evocando a sofisticação editorial de revistas de moda.
- **Corpo do Texto (Body):** **Outfit** ou **Inter** (Google Fonts) — Uma fonte sans-serif moderna, geométrica e limpa que assegura máxima legibilidade em dispositivos móveis e grades de dados.

### C. Bordas e Corner Roundness

- Componentes de input, cards e botões devem possuir cantos suaves para transmitir conforto visual.
  - Botões e Inputs: `rounded-lg` (8px) ou `rounded-full` para ações principais.
  - Cards e Modais: `rounded-2xl` (16px).

---

## 3. Micro-Animações & Efeitos de Interface

Para garantir um aplicativo dinâmico e "vivo", as seguintes diretrizes devem ser aplicadas:

1. **Efeito Hover nos Cards de Serviços:** Elevação suave com transição de escala (`hover:scale-[1.02] duration-300`) e sombra dourada translúcida (`hover:shadow-[0_0_20px_rgba(217,119,6,0.15)]`).
2. **Feedback nos Botões (Ripple Effect):** Uso do primitive para botões (`<hlm-button>`) gerando micro-ondas cinzas no clique.
3. **Efeito Glassmorphism:**
   - Aplicação em cabeçalhos fixos e caixas de login:
     `bg-stone-900/60 backdrop-blur-md border border-stone-800`
4. **Transição do Wizard de Agendamento:** Efeito de desvanecimento suave (`transition-all opacity-0 duration-300`) ao mudar de etapa (passo 1 para passo 2).

---

## 4. Estrutura de Telas & Componentes

### A. Fluxo de Agendamento do Cliente (Wizard)

O agendamento é estruturado em uma única página usando Signals para gerenciar os passos de forma ágil e fluida.

```
+-------------------------------------------------------+
|  Passo 1: Serviços > Passo 2: Data > Passo 3: Horário |
+-------------------------------------------------------+
|                                                       |
|   [Card: Corte de Cabelo]    [Card: Manicure]         |
|   Duração: 45 min            Duração: 30 min          |
|   Valor: R$ 75,00            Valor: R$ 45,00          |
|   [Selecionar]               [Selecionar]             |
|                                                       |
+-------------------------------------------------------+
```

- **Etapa 2 (Calendário):** Exibição de um calendário visual customizado. Dias passados e dias marcados como bloqueados (`BloqueioAgenda`) ou fora da grade útil (`HorarioFuncionamento`) aparecem esmaecidos e bloqueados para clique.
- **Etapa 3 (Grade de Slots):** Exibição dos horários como botões do tipo "Pill". O cliente clica no horário desejado e é habilitado o botão de confirmação.

### B. Dashboard Administrativo (Layout Premium)

O painel administrativo possui uma barra de navegação lateral (Sidebar) colapsável com ícones elegantes da biblioteca Lucide.

1. **KPI Cards:** Exibição dos dados do dia com bordas finas douradas e fundos em glassmorphism.
2. **Fila de Atendimento:** Lista vertical organizada cronologicamente. Cada card exibe a foto/iniciais do cliente, o serviço, a hora e um **badge de status** colorido:
   - `PENDENTE` 🟡 (Badge Amarelo Translúcido)
   - `CONFIRMADO` 🟢 (Badge Verde Translúcido)
   - `CONCLUIDO` 🔵 (Badge Azul Translúcido)
   - `CANCELADO` 🔴 (Badge Vermelho Translúcido)
3. **Ações Rápidas integradas:** Botões de clique rápido (Confirmar ✔️, Concluir 🏆, Cancelar ❌) disponíveis diretamente na linha do atendimento para agilizar a operação de Leila no dia a dia.
