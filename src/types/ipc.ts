/**
 * Typed API bridge — mirrors the shape exposed by electron/preload.ts
 * Kept in the renderer project to avoid cross-project reference issues.
 */

interface CrudApi<T = any> {
  getAll: (...args: any[]) => Promise<T[]>
  getById: (id: number) => Promise<T | undefined>
  create: (data: any) => Promise<T>
  update: (id: number, data: any) => Promise<T>
  delete: (id: number) => Promise<T>
}

export interface DesenrolaAPI {
  accounts: CrudApi & {
    getAll: () => Promise<any[]>
  }
  transactions: CrudApi & {
    getByDateRange: (start: string, end: string) => Promise<any[]>
    getSummary: (month: string) => Promise<any>
  }
  bills: CrudApi & {
    getUpcoming: (days: number) => Promise<any[]>
    markPaid: (id: number, amount: number, date: string) => Promise<any>
  }
  installments: CrudApi & {
    getMonthlyCommitment: () => Promise<any>
    simulate: (total: number, installments: number, interestRate: number) => Promise<any>
  }
  salary: {
    getConfig: () => Promise<any>
    saveConfig: (data: any) => Promise<any>
    calculateNet: (gross: number, dependents?: number) => Promise<any>
    calculate13: () => Promise<any>
  }
  budgets: {
    getAll: (month: string) => Promise<any[]>
    create: (data: any) => Promise<any>
    update: (id: number, data: any) => Promise<any>
    delete: (id: number) => Promise<any>
    getOverview: (month: string) => Promise<any>
  }
  goals: CrudApi & {
    addContribution: (id: number, amount: number) => Promise<any>
  }
  tax: {
    getDeductibles: (year: number) => Promise<any[]>
    addDeductible: (data: any) => Promise<any>
    getSummary: (year: number) => Promise<any>
  }
  system: {
    getSetting: (key: string) => Promise<any>
    setSetting: (key: string, value: any) => Promise<void>
    getCategories: () => Promise<any[]>
    exportData: (format: string) => Promise<any>
    backup: () => Promise<any>
    restore: (path: string) => Promise<any>
    getDashboardData: (month: string) => Promise<any>
  }
}

declare global {
  interface Window {
    api: DesenrolaAPI
  }
}
