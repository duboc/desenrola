import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { budgets, transactions, categories } from '../db/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'

export function registerBudgetHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('budgets:getAll', async (_event, month: string) => {
    const db = getDb()
    return db.select().from(budgets).where(eq(budgets.month, month)).all()
  })

  ipcMain.handle('budgets:create', async (_event, data: any) => {
    const db = getDb()
    return db.insert(budgets).values(data).returning().get()
  })

  ipcMain.handle('budgets:update', async (_event, id: number, data: any) => {
    const db = getDb()
    return db.update(budgets).set(data).where(eq(budgets.id, id)).returning().get()
  })

  ipcMain.handle('budgets:delete', async (_event, id: number) => {
    const db = getDb()
    return db.delete(budgets).where(eq(budgets.id, id)).returning().get()
  })

  ipcMain.handle('budgets:getOverview', async (_event, month: string) => {
    const db = getDb()
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    // Get all budgets for the month
    const monthBudgets = db.select().from(budgets)
      .where(eq(budgets.month, month))
      .all()

    // Get actual spending per category for the month
    const spending = db.select({
      categoryId: transactions.categoryId,
      total: sql<number>`SUM(ABS(amount))`,
    }).from(transactions)
      .where(and(
        eq(transactions.type, 'expense'),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate),
      ))
      .groupBy(transactions.categoryId)
      .all()

    const spendingMap = new Map(spending.map(s => [s.categoryId, s.total]))

    return monthBudgets.map(budget => {
      const spent = spendingMap.get(budget.categoryId) || 0
      const remaining = budget.amount - spent
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      const status = percentage >= 100 ? 'exceeded' :
        percentage >= (budget.alertThreshold || 0.8) * 100 ? 'warning' : 'ok'

      return {
        ...budget,
        spent,
        remaining,
        percentage: Math.round(percentage),
        status,
      }
    })
  })
}
