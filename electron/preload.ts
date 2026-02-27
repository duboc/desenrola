import { contextBridge, ipcRenderer } from 'electron'

/**
 * Typed IPC bridge for Desenrola
 * Exposes a clean, type-safe API to the renderer process
 */
const api = {
  // ─── Accounts ─────────────────────────────────────────────
  accounts: {
    getAll: () => ipcRenderer.invoke('accounts:getAll'),
    getById: (id: number) => ipcRenderer.invoke('accounts:getById', id),
    create: (data: any) => ipcRenderer.invoke('accounts:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('accounts:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('accounts:delete', id),
  },

  // ─── Transactions ─────────────────────────────────────────
  transactions: {
    getAll: (filters?: any) => ipcRenderer.invoke('transactions:getAll', filters),
    getById: (id: number) => ipcRenderer.invoke('transactions:getById', id),
    create: (data: any) => ipcRenderer.invoke('transactions:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('transactions:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('transactions:delete', id),
    getByDateRange: (start: string, end: string) =>
      ipcRenderer.invoke('transactions:getByDateRange', start, end),
    getSummary: (month: string) => ipcRenderer.invoke('transactions:getSummary', month),
  },

  // ─── Bills ────────────────────────────────────────────────
  bills: {
    getAll: () => ipcRenderer.invoke('bills:getAll'),
    getById: (id: number) => ipcRenderer.invoke('bills:getById', id),
    create: (data: any) => ipcRenderer.invoke('bills:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('bills:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('bills:delete', id),
    getUpcoming: (days: number) => ipcRenderer.invoke('bills:getUpcoming', days),
    markPaid: (id: number, amount: number, date: string) =>
      ipcRenderer.invoke('bills:markPaid', id, amount, date),
  },

  // ─── Installments ─────────────────────────────────────────
  installments: {
    getAll: () => ipcRenderer.invoke('installments:getAll'),
    getById: (id: number) => ipcRenderer.invoke('installments:getById', id),
    create: (data: any) => ipcRenderer.invoke('installments:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('installments:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('installments:delete', id),
    getMonthlyCommitment: () => ipcRenderer.invoke('installments:getMonthlyCommitment'),
    simulate: (total: number, installments: number, interestRate: number) =>
      ipcRenderer.invoke('installments:simulate', total, installments, interestRate),
  },

  // ─── Salary ───────────────────────────────────────────────
  salary: {
    getConfig: () => ipcRenderer.invoke('salary:getConfig'),
    saveConfig: (data: any) => ipcRenderer.invoke('salary:saveConfig', data),
    calculateNet: (gross: number, dependents?: number) =>
      ipcRenderer.invoke('salary:calculateNet', gross, dependents),
    calculate13: () => ipcRenderer.invoke('salary:calculate13'),
  },

  // ─── Budgets ──────────────────────────────────────────────
  budgets: {
    getAll: (month: string) => ipcRenderer.invoke('budgets:getAll', month),
    create: (data: any) => ipcRenderer.invoke('budgets:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('budgets:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('budgets:delete', id),
    getOverview: (month: string) => ipcRenderer.invoke('budgets:getOverview', month),
  },

  // ─── Goals ────────────────────────────────────────────────
  goals: {
    getAll: () => ipcRenderer.invoke('goals:getAll'),
    getById: (id: number) => ipcRenderer.invoke('goals:getById', id),
    create: (data: any) => ipcRenderer.invoke('goals:create', data),
    update: (id: number, data: any) => ipcRenderer.invoke('goals:update', id, data),
    delete: (id: number) => ipcRenderer.invoke('goals:delete', id),
    addContribution: (id: number, amount: number) =>
      ipcRenderer.invoke('goals:addContribution', id, amount),
  },

  // ─── Tax ──────────────────────────────────────────────────
  tax: {
    getDeductibles: (year: number) => ipcRenderer.invoke('tax:getDeductibles', year),
    addDeductible: (data: any) => ipcRenderer.invoke('tax:addDeductible', data),
    getSummary: (year: number) => ipcRenderer.invoke('tax:getSummary', year),
  },

  // ─── System ───────────────────────────────────────────────
  system: {
    getSetting: (key: string) => ipcRenderer.invoke('system:getSetting', key),
    setSetting: (key: string, value: any) =>
      ipcRenderer.invoke('system:setSetting', key, value),
    getCategories: () => ipcRenderer.invoke('system:getCategories'),
    exportData: (format: string) => ipcRenderer.invoke('system:exportData', format),
    backup: () => ipcRenderer.invoke('system:backup'),
    restore: (path: string) => ipcRenderer.invoke('system:restore', path),
    getDashboardData: (month: string) => ipcRenderer.invoke('system:getDashboardData', month),
  },
}

contextBridge.exposeInMainWorld('api', api)

export type DesenrolaAPI = typeof api
