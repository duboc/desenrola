# Desenrola — Agent Context

## What is this?

Desenrola is a **local-first Electron desktop app** for personal finance management, built for Brazilian adults in São Paulo. All data stays on the user's machine (SQLite). No cloud, no accounts.

## Tech Stack

- **Electron 33** + **electron-vite 5** (requires explicit entry points in config)
- **React 19** + **TypeScript 5.7** + **Tailwind CSS 3.4**
- **Zustand 5** (UI state) + **TanStack React Query 5** (server state)
- **Drizzle ORM 0.38** + **better-sqlite3** (database)
- **React Hook Form** + **Zod** (forms/validation)
- **Recharts** (charts — installed but not yet used)
- **date-fns** with pt-BR locale

## Commands

```bash
npm run dev          # Start Electron in dev mode
npm run build        # Production build (electron-vite build)
npm run typecheck    # TypeScript check (tsc --noEmit)
npm run test         # Run tests (vitest)
npm run lint         # ESLint
```

For TypeScript with project references: `npx tsc --build --force`

## Project Layout

```
electron/           → Main process (Node.js)
  main.ts           → App entry, window creation, IPC registration
  preload.ts        → contextBridge typed API (window.api)
  db/schema.ts      → Drizzle schema (13 tables)
  db/connection.ts  → SQLite connection + raw SQL init
  db/seed.ts        → Seed data (50+ categories, SP utilities)
  ipc/*.ipc.ts      → IPC handlers (accounts, transactions, bills, installments, salary, budgets, goals, tax, system)
  utils/            → INSS/IRRF calculators, currency helpers

src/                → Renderer (React)
  App.tsx           → Router (11 routes)
  pages/            → Dashboard, Transactions, Bills, Parcelas, Salary, Budget, Goals, Investments, Tax, AI, Settings, Onboarding
  components/       → Layout (Sidebar, Header, QuickAdd, MainLayout) + Shared (CategoryPicker, CurrencyInput, EmptyState, ProgressRing, TrendArrow)
  api/              → React Query hooks (one per domain)
  stores/           → appStore (sidebar/theme/modal), filterStore (date/account filters)
  types/            → models.ts (interfaces), enums.ts (PT-BR labels), ipc.ts (API types)
  lib/              → formatters, validators (Zod), constants, colors, messages (brand voice)
  styles/           → globals.css (Tailwind layers + custom components)
```

## Architecture

- **IPC pattern**: Renderer calls `window.api.domain.method()` → preload bridges to `ipcRenderer.invoke('domain:method')` → main process handles via `ipcMain.handle()`
- **Each domain** (accounts, transactions, etc.) has: IPC handler (`electron/ipc/`), React Query hook (`src/api/`), Zod schema (`src/lib/validators.ts`), TypeScript model (`src/types/models.ts`)
- **Database**: 13 SQLite tables via Drizzle ORM. Connection in `electron/db/connection.ts` uses raw SQL for table creation, Drizzle for queries.

## Key Conventions

- **Language**: All UI text is in casual Brazilian Portuguese. Copy lives in `src/lib/messages.ts`.
- **Currency**: Always BRL. Use `formatBRL()` from `src/lib/formatters.ts`.
- **Dates**: Use `date-fns` with `ptBR` locale. Format: `dd/MM/yyyy`.
- **Enums**: Human-readable labels in `src/types/enums.ts` (e.g., `ACCOUNT_TYPE_LABELS`).
- **Styling**: Tailwind with custom component classes (`.card`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.badge-*`, `.input`, `.nav-item`). Emerald = primary, Stone = neutral.
- **Dark mode**: CSS class `dark` on `<html>`, toggled via `appStore.setTheme()`.

## Current State (What's Done)

- App boots, all 11 pages render, build passes, zero type errors
- Full IPC bridge with 9 handler modules
- Salary calculator works (INSS/IRRF/FGTS with 2025 tax tables, 13º salário)
- QuickAdd modal (Cmd+N) creates transactions
- Dashboard aggregates data from all domains
- Onboarding wizard (5 steps, creates accounts + saves salary)
- Parcelas simulator (Price table formula with interest)
- Bill mark-as-paid creates transaction automatically
- Backup/restore and CSV export work
- 50+ seeded Brazilian categories, SP utility presets

## What Needs Work

- **Forms**: Most pages show data but lack create/edit forms (transactions, bills, budgets, goals, tax)
- **Charts**: Recharts is installed but no charts are rendered yet
- **AI**: Chat page has hardcoded placeholder responses, needs real API integration
- **Investments**: Empty placeholder page only
- **Import**: No CSV/OFX import yet
- **Tests**: Vitest configured but no tests written
- **Packaging**: electron-builder.yml exists but not tested
- **Notifications**: No system tray or native notifications yet

## Things to Watch Out For

- `electron.vite.config.ts` requires explicit entry points (`build.lib.entry` for main/preload, `rollupOptions.input` for renderer) — this is an electron-vite v5 requirement
- `categories` table has a self-referential `parentId` column but NO `.references()` constraint (removed to avoid circular type inference in Drizzle)
- `tsconfig.json` uses project references (`tsconfig.node.json` for electron, `tsconfig.web.json` for renderer). Sub-configs override `noEmit: false` because `composite: true` requires emit.
- `@import` in CSS must come before `@tailwind` directives
- The `recurringBills` payment method enum in the DB schema was updated to match the `transactions` table enum — both now use `debit_card` (not `debito_automatico`)
