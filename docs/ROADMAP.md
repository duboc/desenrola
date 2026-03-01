# Desenrola — Development Roadmap

## Current Status: MVP Scaffold Complete

The foundational architecture is in place — Electron app boots, all 11 pages render, IPC bridge is wired, database schema is defined, and the build passes cleanly. Everything below tracks what needs to happen to turn the scaffold into a usable product.

---

## Phase 1: Core Financial Engine (Weeks 1–4)

### 1.1 Account Management (CRUD polish)
- [ ] Account creation form with institution picker (Nubank, Inter, Itaú, etc.)
- [ ] Account editing and soft-delete
- [ ] Account balance display on Dashboard
- [ ] Credit card billing cycle management (billing day → due day)
- [ ] Account type icons and color coding
- [ ] Total net worth calculation across all accounts

**Files**: `src/pages/Dashboard/`, `electron/ipc/accounts.ipc.ts`, `src/api/useAccounts.ts`

### 1.2 Transaction CRUD
- [ ] Full transaction creation form (amount, category, account, date, payment method)
- [ ] Transaction editing and deletion with confirmation
- [ ] Category picker with search and icons
- [ ] Payment method selector (PIX, boleto, cartão, etc.)
- [ ] Transaction list with date grouping (Hoje, Ontem, earlier)
- [ ] Filter by: date range, category, account, type (income/expense/transfer)
- [ ] Search by description
- [ ] Auto-balance update on transaction create/edit/delete

**Files**: `src/pages/Transactions/`, `src/components/layout/QuickAdd.tsx`, `electron/ipc/transactions.ipc.ts`

### 1.3 Recurring Bills
- [ ] Bill creation form with SP utility presets (Enel, Sabesp, Comgás)
- [ ] Bill editing and deactivation
- [ ] "Mark as Paid" flow → creates transaction automatically
- [ ] Overdue bill highlighting with late fee calculation
- [ ] Calendar view of upcoming bills
- [ ] Bill payment reminders (tray notifications)
- [ ] Dashboard integration: next 7 days upcoming bills

**Files**: `src/pages/Bills/`, `electron/ipc/bills.ipc.ts`, `electron/utils/currency.ts`

### 1.4 Parcelas (Installments)
- [ ] Installment plan creation (store, total, # parcelas, start date)
- [ ] Link to credit card account
- [ ] Track paid vs. remaining installments
- [ ] Monthly commitment calculation (% of income)
- [ ] Parcelas simulator: input total + installments + interest rate → see breakdown
- [ ] Auto-generate monthly transactions for each parcela
- [ ] Warning when installment commitment exceeds 30% of income

**Files**: `src/pages/Parcelas/`, `electron/ipc/installments.ipc.ts`

---

## Phase 2: Salary & Budget Intelligence (Weeks 5–6)

### 2.1 Salary Configuration
- [ ] Persist salary config to database (currently calculator-only)
- [ ] CLT mode: gross → net with INSS/IRRF/FGTS breakdown
- [ ] PJ mode: revenue, DAS rate, pro-labore
- [ ] Mixed mode (CLT + PJ side income)
- [ ] Benefits tracking: VR, VA, VT with employer vs. employee splits
- [ ] 13º salário projection (1st and 2nd installment)
- [ ] PLR estimated tracking
- [ ] Monthly "paycheck day" notification

**Files**: `src/pages/Salary/`, `electron/ipc/salary.ipc.ts`, `electron/utils/inss.ts`, `electron/utils/irrf.ts`

### 2.2 Budget Management
- [ ] Budget creation form (pick category → set monthly limit)
- [ ] Auto-populate budgets from previous month
- [ ] Real-time spending vs. budget progress bars
- [ ] Alert when spending reaches 80% of budget (configurable threshold)
- [ ] Budget exceeded notifications
- [ ] Budget rollover (unused budget carries to next month)
- [ ] Monthly budget overview on Dashboard
- [ ] Category-level spending insights

**Files**: `src/pages/Budget/`, `electron/ipc/budgets.ipc.ts`

---

## Phase 3: Charts & Visualization (Week 7)

### 3.1 Dashboard Charts (Recharts)
- [ ] Monthly income vs. expenses bar chart
- [ ] Spending by category donut/pie chart
- [ ] Cash flow line chart (6-month trend)
- [ ] Account balance evolution over time
- [ ] Budget utilization horizontal bar chart

### 3.2 Detailed Analytics
- [ ] Category spending trends (month-over-month)
- [ ] Top 5 expense categories
- [ ] Income sources breakdown
- [ ] Spending heatmap (day of week / day of month)

**Files**: `src/pages/Dashboard/`, new `src/components/charts/` directory

---

## Phase 4: Goals & Tax (Week 8)

### 4.1 Financial Goals
- [ ] Goal creation with type selector (emergency fund, travel, apartment, etc.)
- [ ] Goal progress tracking with contributions
- [ ] Monthly auto-contribution from salary
- [ ] Goal linked to savings account
- [ ] Goal completion celebration UI
- [ ] Goal priority ordering
- [ ] "Time to goal" projections based on current contribution rate

**Files**: `src/pages/Goals/`, `electron/ipc/goals.ipc.ts`

### 4.2 IRPF Tax Tracking
- [ ] Add deductible expense form (saúde, educação, previdência privada, etc.)
- [ ] Auto-flag deductible transactions based on category
- [ ] Annual deductibles summary with category breakdown
- [ ] Warnings for missing receipts / approaching limits
- [ ] Export deductibles report for tax filing
- [ ] CPF/CNPJ validation for healthcare providers

**Files**: `src/pages/Tax/`, `electron/ipc/tax.ipc.ts`

---

## Phase 5: AI Assistant (Weeks 9–10)

### 5.1 AI Chat Integration
- [ ] Connect to Gemini or Claude API (configurable in Settings)
- [ ] Financial context injection: pass account balances, recent transactions, budgets to AI
- [ ] Conversation persistence in `ai_conversations` / `ai_messages` tables
- [ ] Quick prompts: "Como estão meus gastos este mês?", "Devo parcelar isso?"
- [ ] AI-suggested categories for uncategorized transactions
- [ ] Spending pattern analysis: "Você gastou 30% mais em delivery este mês"

### 5.2 Smart Features
- [ ] AI auto-categorization of imported transactions
- [ ] Bill amount prediction based on history
- [ ] Savings recommendations based on spending patterns
- [ ] Natural language transaction input: "Gastei 45 reais no Uber ontem"

**Files**: `src/pages/AI/`, `src/api/useAI.ts`, `electron/ipc/` (new AI handler)

---

## Phase 6: Import & Export (Week 11)

### 6.1 Data Import
- [ ] CSV import wizard (map columns to fields)
- [ ] OFX/QFX bank statement import
- [ ] Boleto barcode scanner (camera / paste)
- [ ] Duplicate detection on import

### 6.2 Data Export & Backup
- [ ] Export to CSV/JSON
- [ ] SQLite database backup to file
- [ ] Restore from backup
- [ ] Automatic daily backup (configurable)

**Files**: `electron/ipc/system.ipc.ts`, new `src/pages/Import/`

---

## Phase 7: Polish & Packaging (Week 12)

### 7.1 UX Polish
- [ ] Keyboard shortcuts (Ctrl+N, Ctrl+F, Ctrl+1–9)
- [ ] Onboarding wizard completion (5 steps fully functional)
- [ ] Empty states for all pages
- [ ] Loading skeletons
- [ ] Toast notifications for actions (saved, deleted, etc.)
- [ ] Confirmation dialogs for destructive actions
- [ ] Responsive layout adjustments

### 7.2 Electron Features
- [ ] System tray icon with upcoming bill count
- [ ] Native notifications for bill reminders
- [ ] Auto-update (electron-updater)
- [ ] macOS menu bar integration
- [ ] Window state persistence (size, position)

### 7.3 Packaging & Distribution
- [ ] macOS build (DMG)
- [ ] Windows build (NSIS installer)
- [ ] Linux build (AppImage)
- [ ] Code signing
- [ ] Auto-update server setup

**Files**: `electron-builder.yml`, `electron/main.ts`

---

## Phase 8: Investments & Advanced (Future)

### 8.1 Investment Tracking
- [ ] Investment account types (CDB, Tesouro Direto, ações, FII, crypto)
- [ ] Position tracking with current value
- [ ] Yield calculation (CDI %, IPCA+, etc.)
- [ ] Investment portfolio pie chart
- [ ] Rebalancing suggestions

### 8.2 Advanced Features
- [ ] Multi-currency support (USD, EUR)
- [ ] Shared expenses (couples / roommates)
- [ ] Recurring income tracking
- [ ] Financial health score
- [ ] PDF report generation

---

## Implementation Status Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Electron app shell | ✅ Done | Window, menu, tray |
| Build system (electron-vite 5) | ✅ Done | All entry points configured |
| SQLite database (13 tables) | ✅ Done | Schema + connection + seed |
| IPC bridge (typed) | ✅ Done | 9 handler modules |
| React Router (11 routes) | ✅ Done | All pages render |
| Sidebar navigation | ✅ Done | 10 items, collapsible |
| Header with month nav | ✅ Done | Previous/next month |
| Quick Add modal (Cmd+N) | ✅ Done | UI shell, needs form wiring |
| Dashboard page | ✅ Shell | Needs charts + real data |
| Transactions page | ✅ Shell | Needs CRUD forms + filters |
| Bills page | ✅ Shell | Needs create/edit forms |
| Parcelas page | ✅ Shell | Simulator UI built |
| Salary calculator | ✅ Working | INSS/IRRF/FGTS/13º functional |
| Budget page | ✅ Shell | Needs create form + live data |
| Goals page | ✅ Shell | Needs create form + contributions |
| Investments page | ⬜ Placeholder | "Em breve" message |
| Tax/IRPF page | ✅ Shell | Needs add deductible form |
| AI chat page | ✅ Shell | Needs API integration |
| Settings page | ✅ Shell | Theme toggle works |
| Onboarding wizard | ✅ Shell | 5 steps UI, needs data persistence |
| Dark mode | ✅ Done | Class-based toggle via Zustand |
| Tailwind design system | ✅ Done | card, btn, badge, input components |
| Formatters (BRL, dates) | ✅ Done | pt-BR locale |
| Zod validators | ✅ Done | 7 schemas |
| Type definitions | ✅ Done | Full TypeScript coverage |
| Brand voice (messages.ts) | ✅ Done | Casual BR Portuguese |
| Seed data | ✅ Done | 50+ categories, SP utilities |
| Charts | ⬜ Not started | Recharts installed but unused |
| CSV/OFX import | ⬜ Not started | — |
| AI API integration | ⬜ Not started | — |
| Electron packaging | ⬜ Not started | electron-builder.yml ready |
| Tests | ⬜ Not started | Vitest configured |
