import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { taxTracking } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

export function registerTaxHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('tax:getDeductibles', async (_event, year: number) => {
    const db = getDb()
    return db.select().from(taxTracking).where(eq(taxTracking.year, year)).all()
  })

  ipcMain.handle('tax:addDeductible', async (_event, data: any) => {
    const db = getDb()
    return db.insert(taxTracking).values(data).returning().get()
  })

  ipcMain.handle('tax:getSummary', async (_event, year: number) => {
    const db = getDb()

    const byCategory = db.select({
      category: taxTracking.category,
      total: sql<number>`SUM(amount)`,
      count: sql<number>`COUNT(*)`,
    }).from(taxTracking)
      .where(eq(taxTracking.year, year))
      .groupBy(taxTracking.category)
      .all()

    const total = byCategory.reduce((sum, c) => sum + (c.total || 0), 0)

    // Education has a deduction limit per dependent
    const educationLimit = 3561.50 // 2025 value
    const educationTotal = byCategory.find(c => c.category === 'educacao')?.total || 0

    return {
      year,
      byCategory,
      total,
      warnings: [
        ...(educationTotal > educationLimit ? [{
          category: 'educacao',
          message: `Gastos com educação (R$ ${educationTotal.toFixed(2)}) excedem o limite dedutível (R$ ${educationLimit.toFixed(2)})`,
        }] : []),
      ],
    }
  })
}
