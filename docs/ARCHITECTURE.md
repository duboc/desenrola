# Desenrola — Architecture

> Seu parceiro financeiro que fala sua língua

## Overview

Desenrola is a **local-first** personal finance app for Brazilian adults in São Paulo. It runs as an Electron desktop app with no cloud dependency — all data stays on the user's machine in a SQLite database.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Desktop shell | Electron | 33.x |
| Build system | electron-vite | 5.x |
| Frontend | React | 19.x |
| Language | TypeScript | 5.7+ |
| Styling | Tailwind CSS | 3.4 |
| Icons | Lucide React | 0.468+ |
| State management | Zustand | 5.x |
| Server state | TanStack React Query | 5.62+ |
| Forms | React Hook Form + Zod | 7.54 / 3.24 |
| Router | React Router | 7.1 |
| Charts | Recharts | 2.15 |
| Database | better-sqlite3 | 11.7 |
| ORM | Drizzle ORM | 0.38 |
| Date handling | date-fns | 4.1 |
| Testing | Vitest + Testing Library | 2.1 / 16.1 |
| Packaging | electron-builder | 25.x |

## Project Structure

```
desenrola/
├── electron/                    # Main process (Node.js)
│   ├── main.ts                  # App entry: window creation, IPC registration, DB init
│   ├── preload.ts               # contextBridge API — typed IPC bridge
│   ├── db/
│   │   ├── schema.ts            # Drizzle ORM schema (13 tables)
│   │   ├── connection.ts        # SQLite connection + raw SQL table creation
│   │   └── seed.ts              # Seed data (50+ categories, SP utilities)
│   ├── ipc/                     # IPC handler modules (one per domain)
│   │   ├── accounts.ipc.ts      # CRUD for bank accounts
│   │   ├── transactions.ipc.ts  # Transaction CRUD + date range + summary
│   │   ├── bills.ipc.ts         # Recurring bills + upcoming + mark paid
│   │   ├── installments.ipc.ts  # Parcelas CRUD + simulator + monthly commitment
│   │   ├── salary.ipc.ts        # Salary config + net calculator + 13º
│   │   ├── budgets.ipc.ts       # Budget CRUD + monthly overview
│   │   ├── goals.ipc.ts         # Goals CRUD + contribution
│   │   ├── tax.ipc.ts           # Tax deductibles + annual summary
│   │   └── system.ipc.ts        # Settings, categories, dashboard, export, backup
│   └── utils/
│       ├── inss.ts              # INSS progressive calculation (2025 brackets)
│       ├── irrf.ts              # IRRF calculation with dependents deduction
│       └── currency.ts          # BRL formatting, late fees, installment math
│
├── src/                         # Renderer process (React)
│   ├── App.tsx                  # Router with 11 routes
│   ├── main.tsx                 # React entry point
│   ├── index.html               # HTML template (pt-BR, CSP headers)
│   ├── pages/
│   │   ├── Dashboard/index.tsx  # Monthly summary, cash flow, upcoming bills
│   │   ├── Transactions/index.tsx # Transaction list with filters
│   │   ├── Bills/index.tsx      # Recurring bills management
│   │   ├── Parcelas/index.tsx   # Installment tracker + simulator
│   │   ├── Salary/index.tsx     # CLT salary calculator (INSS/IRRF/FGTS)
│   │   ├── Budget/index.tsx     # Category budget with progress bars
│   │   ├── Goals/index.tsx      # Financial goals tracker
│   │   ├── Investments/index.tsx # Investments placeholder
│   │   ├── Tax/index.tsx        # IRPF deductible expenses tracker
│   │   ├── AI/index.tsx         # AI financial assistant chat
│   │   ├── Settings/index.tsx   # App settings (theme, backup, data)
│   │   └── Onboarding/index.tsx # 5-step first-run wizard
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx   # Sidebar + content container
│   │   │   ├── Sidebar.tsx      # Collapsible nav with 10 items
│   │   │   ├── Header.tsx       # Page header with month navigation
│   │   │   └── QuickAdd.tsx     # Cmd+N quick transaction modal
│   │   └── shared/
│   │       ├── CategoryPicker.tsx # Category selector dropdown
│   │       ├── CurrencyInput.tsx  # BRL-formatted input (JetBrains Mono)
│   │       ├── EmptyState.tsx     # Empty state placeholder
│   │       ├── ProgressRing.tsx   # SVG circular progress indicator
│   │       └── TrendArrow.tsx     # Up/down trend indicator
│   ├── api/                     # React Query hooks (one per domain)
│   │   ├── useAccounts.ts       # Account queries + mutations
│   │   ├── useTransactions.ts   # Transaction queries + mutations
│   │   ├── useBills.ts          # Bill queries + mutations
│   │   ├── useInstallments.ts   # Installment queries + mutations
│   │   ├── useSalary.ts         # Salary config + calculator
│   │   ├── useBudgets.ts        # Budget queries + mutations
│   │   ├── useGoals.ts          # Goal queries + mutations
│   │   ├── useTax.ts            # Tax deductible queries
│   │   └── useAI.ts             # AI chat state management
│   ├── stores/
│   │   ├── appStore.ts          # Global state (sidebar, theme, quickAdd, onboarding)
│   │   └── filterStore.ts       # Transaction/date filter state
│   ├── types/
│   │   ├── models.ts            # All TypeScript interfaces (Account, Transaction, etc.)
│   │   ├── enums.ts             # PT-BR label maps for all enums
│   │   └── ipc.ts               # DesenrolaAPI type declaration + Window augmentation
│   ├── lib/
│   │   ├── formatters.ts        # BRL currency, dates (pt-BR locale), percentages
│   │   ├── validators.ts        # Zod schemas for all forms
│   │   ├── constants.ts         # Nav items, SP utilities, institutions, shortcuts
│   │   ├── colors.ts            # Category color palette + helpers
│   │   └── messages.ts          # All UI copy in casual Brazilian Portuguese
│   └── styles/
│       └── globals.css          # Tailwind layers + custom components (card, btn, badge, input)
│
├── electron.vite.config.ts      # Build config (main + preload + renderer entry points)
├── electron-builder.yml         # Packaging config (macOS, Windows, Linux)
├── tailwind.config.ts           # DM Sans + JetBrains Mono, emerald/stone palette
├── drizzle.config.ts            # Drizzle Kit config
├── tsconfig.json                # Root TS config with project references
├── tsconfig.node.json           # Electron (main/preload) TS config
├── tsconfig.web.json            # Renderer TS config
└── postcss.config.js            # PostCSS with Tailwind + Autoprefixer
```

## Architecture Patterns

### IPC Communication

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  React Page │ ──────> │   preload.ts  │ ──────> │  IPC Handler│
│  (renderer) │ invoke  │ (contextBridge│ ipcMain │  (main proc)│
│             │ <────── │  window.api)  │ <────── │             │
│             │ result  │              │ return  │  → Database  │
└─────────────┘         └──────────────┘         └─────────────┘
```

- **Renderer** calls `window.api.domain.method()` (typed via `DesenrolaAPI`)
- **Preload** maps to `ipcRenderer.invoke('domain:method', ...args)`
- **Main** process handles via `ipcMain.handle('domain:method', handler)`
- Each domain has its own IPC file in `electron/ipc/`

### State Management

| Concern | Solution |
|---------|----------|
| Server/DB state | React Query (`useQuery` / `useMutation`) |
| UI state (sidebar, theme, modals) | Zustand (`appStore.ts`) |
| Filter/search state | Zustand (`filterStore.ts`) |
| Form state | React Hook Form + Zod validation |

### Database

SQLite via better-sqlite3 with Drizzle ORM for type-safe queries. 13 tables:

| Table | Purpose |
|-------|---------|
| `accounts` | Bank accounts, cards, vales (8 types) |
| `categories` | Expense/income categories (50+ seeded) |
| `transactions` | All financial transactions |
| `recurring_bills` | Monthly bills (utilities, subscriptions) |
| `installment_plans` | Parcelas (credit card installments) |
| `salary_config` | Salary/employment details (CLT/PJ) |
| `budgets` | Monthly category budgets |
| `goals` | Financial goals (emergency fund, travel, etc.) |
| `tax_tracking` | IRPF deductible expenses |
| `boletos` | Boleto payment tracking |
| `ai_conversations` | AI chat sessions |
| `ai_messages` | Individual chat messages |
| `settings` | Key-value app settings |

### Design System

- **Fonts**: DM Sans (UI), JetBrains Mono (numbers/currency)
- **Palette**: Emerald (primary), Stone (neutral), with category-specific colors
- **Components**: Custom Tailwind component classes in `globals.css` (`.card`, `.btn-*`, `.badge-*`, `.input`, `.nav-item`)
- **Dark mode**: CSS class-based (`dark` class on root), toggled via `appStore`
- **Language**: All UI copy in `messages.ts`, casual Brazilian Portuguese ("E aí!", "Bora!", "Sussa!")

## Key Design Decisions

1. **Local-first**: No accounts, no cloud sync. SQLite file on disk. Privacy by design.
2. **Brazil-specific**: INSS/IRRF calculators, boleto support, PIX as payment method, vale refeição/alimentação as account types, 13º salário, SP utility presets.
3. **Typed IPC bridge**: `contextBridge` with a fully typed API avoids raw `ipcRenderer` usage.
4. **Domain-driven IPC**: Each business domain (accounts, transactions, etc.) has its own IPC handler file.
5. **Seed data**: Categories pre-loaded with Brazilian financial categories (Moradia, Transporte, Alimentação, Saúde, etc.) and São Paulo utility bill templates.
