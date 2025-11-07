# MindTrade Design Guidelines

## Design Approach

**Selected Approach**: Design System - Linear + Ant Design Hybrid

**Justification**: MindTrade is a utility-focused, information-dense professional application where efficiency, data clarity, and workflow optimization are paramount. We'll combine Linear's modern, refined aesthetics with Ant Design's enterprise-grade data handling patterns.

**Core Principles**:
- Data clarity over decoration
- Efficient multi-step workflows
- Professional credibility through restraint
- Scannable information hierarchy
- Zero cognitive friction

---

## Typography

**Font Stack**:
- **Primary**: 'Inter' (Google Fonts) - for all UI elements, tables, forms
- **Monospace**: 'JetBrains Mono' (Google Fonts) - for numeric data, odds, financial results

**Scale**:
- **Display**: 32px / font-bold - Dashboard headers, section titles
- **Heading 1**: 24px / font-semibold - Page titles, modal headers
- **Heading 2**: 20px / font-semibold - Card headers, section dividers
- **Heading 3**: 16px / font-semibold - Form section labels, table headers
- **Body**: 14px / font-normal - Primary content, form inputs
- **Small**: 12px / font-normal - Helper text, timestamps, metadata
- **Tiny**: 11px / font-medium - Labels, badges, status indicators

**Numeric Data**: Use JetBrains Mono at 14px/font-medium for all odds, stakes, ROI percentages, and financial results to ensure precision readability

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 3, 4, 6, 8, 12, 16** (e.g., p-4, gap-6, my-8, py-12)

**Container Strategy**:
- **Dashboard/Main Content**: max-w-7xl mx-auto px-6
- **Forms**: max-w-3xl mx-auto px-6
- **Tables**: Full-width with px-6 on parent container
- **Modals**: max-w-2xl (standard forms), max-w-4xl (operation items editor)

**Grid Patterns**:
- **Dashboard Cards**: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Form Layouts**: grid grid-cols-1 md:grid-cols-2 gap-4 (two-column for related fields)
- **Statistics**: grid grid-cols-2 md:grid-cols-4 gap-4 (compact metric cards)

---

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header, h-16, border-b
- Logo/brand on left, main menu items center, user profile/settings right
- Menu items: Pré-Análise | Operações | Relatórios | Cadastros | Configurações
- Active state: border-b-2 indicator below menu text

### Forms
**Input Fields** (respecting character limits):
- Standard text: h-10, px-3, rounded-lg border
- Short inputs (30 chars max): w-64 for equipes, competições, mercados
- Compact inputs (50 chars): w-80 for justificativa_nao_operacao
- Textareas: min-h-24 with character counter in bottom-right (e.g., "250/300")
- Number inputs (odds, stakes): w-32, JetBrains Mono font
- Date/Time: w-48 for dates, w-32 for times

**Field Groups**:
- Label: text-sm font-medium mb-2
- Input: as above
- Helper text: text-xs mt-1
- Error state: border-red-500, text-red-600 error message

**Select Dropdowns**:
- Same height as inputs (h-10)
- Dropdown menu: max-h-64 overflow-y-auto for long lists (equipes, competições)
- Search within dropdown for cadastros with many entries

### Data Display

**Tables**:
- Compact row height: py-3 px-4
- Zebra striping for long tables (odd row background distinction)
- Sticky headers when scrolling
- Action column (right-aligned): Edit/Delete icons with hover states
- Empty state: centered message with icon, "Nenhum registro encontrado"
- Sort indicators: chevron icons in headers

**Cards**:
- Standard card: rounded-xl border p-6
- Metric cards: p-4 with value (text-2xl font-bold JetBrains Mono) and label (text-sm)
- Match cards: p-4 with team names, competition badge, odds display, status indicator

**Status Badges**:
- Pill shape: px-3 py-1 rounded-full text-xs font-medium
- PRE_ANALISE: neutral treatment
- OPERACAO_PENDENTE: yellow/amber treatment  
- OPERACAO_CONCLUIDA: green treatment
- NAO_OPERADA: gray treatment

### Operation Items Editor
**Multi-Item Interface**:
- Each item as expandable card: border rounded-lg p-4 mb-3
- Header shows: Mercado name + Estratégia name + Edit/Delete icons
- Expanded view: grid of fields (stake, odds, resultado_financeiro, etc.)
- "+ Adicionar Item" button at bottom: outlined button style
- Inline validation: show errors immediately per item

### Modals & Dialogs
**Confirmation Dialogs**:
- max-w-md centered
- Header (24px bold) + message (14px) + actions (right-aligned)
- "Finalizar operação?" dialog: clear Yes/No buttons, explain validation requirements if items incomplete

**Form Modals**:
- Sliding panel from right (Pré-Análise conversion, quick add cadastro)
- Full-height with close X in top-right
- Scrollable content area
- Sticky footer with action buttons

### Buttons
**Hierarchy**:
- **Primary**: solid background, rounded-lg px-4 py-2, font-medium
- **Secondary**: outlined border, same sizing
- **Tertiary**: text-only with hover background, px-3 py-1.5
- **Icon buttons**: p-2 rounded-lg hover background (table actions)

**Sizes**:
- Large: h-11 px-6 (main CTAs)
- Medium: h-10 px-4 (standard forms)
- Small: h-8 px-3 (inline actions)

### Reports & Analytics
**Dashboard Layout**:
- Top summary row: 4 metric cards (Lucro Total, ROI, Taxa de Acerto, Média por Operação)
- Filter bar: horizontal row with date range, dropdowns for competição/equipe/mercado/estratégia
- Chart section: full-width chart card (ROI over time, profit by market)
- Data tables below: detailed breakdown with export button

**Chart Cards**:
- p-6 rounded-xl border
- Title + period selector in header
- Chart occupies min-h-64
- Legend below or beside chart

---

## Interactions & Micro-animations

**Use Sparingly**:
- Subtle hover states on interactive elements (cards, buttons, table rows): translate-y-[-1px] transition-transform
- Dropdown animations: fade-in with slide-down (duration-200)
- Modal entrance: fade-in with scale-95 to scale-100 (duration-300)
- Loading states: simple spinner or skeleton screens for tables

**No Animation**:
- Data updates in tables or forms
- Page transitions
- Status badge changes

---

## Accessibility & Internationalization

- All forms use proper label associations and ARIA attributes
- Focus states: ring-2 ring-offset-2 on all interactive elements
- Keyboard navigation: full support for tab order, Enter to submit, Escape to close modals
- Portuguese language throughout: placeholder text, button labels, error messages
- Date format: DD/MM/YYYY (Brazilian standard)
- Number format: use comma for decimals (e.g., "1,75" for odds, "R$ 1.234,56" for currency)

---

## Images

**No Hero Images**: This is a data-focused professional tool with no marketing landing page. All screens are functional dashboards, forms, reports, and data tables. No decorative imagery needed.

**Icon Usage**:
- Icon library: **Heroicons** (outline for navigation/actions, solid for status/filled states)
- Icon sizing: 20px (w-5 h-5) standard, 16px (w-4 h-4) for inline/small contexts
- Team/competition logos: 32px circular avatars where applicable (optional enhancement)

---

## Key Screens Structure

**Pré-Análise Screen**:
- Filter bar at top (período, competição, equipes)
- Match cards in grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card: teams, competition, date/time, odds, "Converter para Operação" button
- Click card: expand to show full pre-analysis fields

**Operações Screen**:
- Two-panel layout: left = operation list with filters, right = selected operation detail
- Operation detail: match info + operation items accordion + completion status
- "+ Nova Operação" prominent button top-right

**Relatórios Screen**:
- Top: filter controls (sticky)
- Below: tabbed interface (Geral, Por Mercado, Por Estratégia, Comportamental, etc.)
- Each tab: summary metrics + visualization + data table

**Cadastros Screen**:
- Simple CRUD table per entity type (tabs for Equipes, Competições, Mercados, Estratégias)
- Search bar above table
- "+ Adicionar" button, inline edit/delete icons
- Estratégias table shows related Mercado in column