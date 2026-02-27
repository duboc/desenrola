import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { transactions, categories, accounts } from '../db/schema'
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'

export function registerTransactionHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('transactions:getAll', async (_event, filters?: {
    accountId?: number
    categoryId?: number
    type?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => {
    const db = getDb()
    let query = db.select().from(transactions).orderBy(desc(transactions.date))

    // Note: In a full implementation, we'd build dynamic where clauses
    // For MVP, we return all and let the renderer filter
    const results = await query.all()
    return results
  })

  ipcMain.handle('transactions:getById', async (_event, id: number) => {
    const db = getDb()
    return db.select().from(transactions).where(eq(transactions.id, id)).get()
  })

  ipcMain.handle('transactions:create', async (_event, data: any) => {
    const db = getDb()
    const result = db.insert(transactions).values({
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
    }).returning().get()

    // Update account balance
    if (data.accountId && data.amount) {
      const account = db.select().from(accounts).where(eq(accounts.id, data.accountId)).get()
      if (account) {
        const newBalance = (account.balance || 0) + data.amount
        db.update(accounts)
          .set({ balance: newBalance, updatedAt: new Date().toISOString() })
          .where(eq(accounts.id, data.accountId))
          .run()
      }
    }

    return result
  })

  ipcMain.handle('transactions:update', async (_event, id: number, data: any) => {
    const db = getDb()
    return db.update(transactions).set(data).where(eq(transactions.id, id)).returning().get()
  })

  ipcMain.handle('transactions:delete', async (_event, id: number) => {
    const db = getDb()
    // Get transaction before deleting to reverse balance
    const txn = db.select().from(transactions).where(eq(transactions.id, id)).get()
    if (txn) {
      const account = db.select().from(accounts).where(eq(accounts.id, txn.accountId)).get()
      if (account) {
        const newBalance = (account.balance || 0) - txn.amount
        db.update(accounts)
          .set({ balance: newBalance, updatedAt: new Date().toISOString() })
          .where(eq(accounts.id, txn.accountId))
          .run()
      }
    }
    return db.delete(transactions).where(eq(transactions.id, id)).returning().get()
  })

  ipcMain.handle('transactions:getByDateRange', async (_event, start: string, end: string) => {
    const db = getDb()
    return db.select().from(transactions)
      .where(and(gte(transactions.date, start), lte(transactions.date, end)))
      .orderBy(desc(transactions.date))
      .all()
  })

  ipcMain.handle('transactions:getSummary', async (_event, month: string) => {
    const db = getDb()
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    const results = db.select({
      type: transactions.type,
      total: sql<number>`SUM(amount)`,
      count: sql<number>`COUNT(*)`,
    }).from(transactions)
      .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
      .groupBy(transactions.type)
      .all()

    const income = results.find(r => r.type === 'income')?.total || 0
    const expenses = Math.abs(results.find(r => r.type === 'expense')?.total || 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: results.reduce((sum, r) => sum + (r.count || 0), 0),
    }
  })
}
