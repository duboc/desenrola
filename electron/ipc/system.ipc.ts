import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { settings, categories, transactions, recurringBills, installmentPlans, accounts } from '../db/schema'
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm'
import { app } from 'electron'
import { join } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

export function registerSystemHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('system:getSetting', async (_event, key: string) => {
    const db = getDb()
    const result = db.select().from(settings).where(eq(settings.key, key)).get()
    return result ? JSON.parse(result.value || 'null') : null
  })

  ipcMain.handle('system:setSetting', async (_event, key: string, value: any) => {
    const db = getDb()
    return db.insert(settings)
      .values({ key, value: JSON.stringify(value), updatedAt: new Date().toISOString() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: JSON.stringify(value), updatedAt: new Date().toISOString() },
      })
      .returning()
      .get()
  })

  ipcMain.handle('system:getCategories', async () => {
    const db = getDb()
    return db.select().from(categories).orderBy(categories.sortOrder).all()
  })

  ipcMain.handle('system:backup', async () => {
    const dbPath = join(app.getPath('userData'), 'desenrola.db')
    const backupDir = join(app.getPath('userData'), 'backups')

    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = join(backupDir, `desenrola-backup-${timestamp}.db`)

    copyFileSync(dbPath, backupPath)
    return { path: backupPath, timestamp }
  })

  ipcMain.handle('system:restore', async (_event, backupPath: string) => {
    const dbPath = join(app.getPath('userData'), 'desenrola.db')
    if (!existsSync(backupPath)) throw new Error('Backup file not found')
    copyFileSync(backupPath, dbPath)
    return { success: true }
  })

  ipcMain.handle('system:exportData', async (_event, _format: string) => {
    // Simplified CSV export
    const db = getDb()
    const txns = db.select().from(transactions).orderBy(desc(transactions.date)).all()

    const header = 'Data,Tipo,Descrição,Valor,Método\n'
    const rows = txns.map(t =>
      `${t.date},${t.type},${(t.description || '').replace(/,/g, ';')},${t.amount},${t.paymentMethod || ''}`
    ).join('\n')

    return header + rows
  })

  ipcMain.handle('system:getDashboardData', async (_event, month: string) => {
    const db = getDb()
    const startDate = `${month}-01`
    const endDate = `${month}-31`

    // Monthly summary
    const summary = db.select({
      type: transactions.type,
      total: sql<number>`SUM(amount)`,
      count: sql<number>`COUNT(*)`,
    }).from(transactions)
      .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
      .groupBy(transactions.type)
      .all()

    // Spending by category
    const byCategory = db.select({
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

    // Upcoming bills
    const bills = db.select().from(recurringBills)
      .where(eq(recurringBills.isActive, true))
      .all()

    // Active installments
    const activeInstallments = db.select({
      totalMonthly: sql<number>`SUM(installment_amount)`,
      count: sql<number>`COUNT(*)`,
    }).from(installmentPlans)
      .where(eq(installmentPlans.status, 'active'))
      .get()

    // Recent transactions
    const recentTxns = db.select().from(transactions)
      .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
      .orderBy(desc(transactions.date))
      .limit(10)
      .all()

    // Account balances
    const accountBalances = db.select().from(accounts)
      .where(eq(accounts.isActive, true))
      .all()

    const income = summary.find(s => s.type === 'income')?.total || 0
    const expenses = Math.abs(summary.find(s => s.type === 'expense')?.total || 0)

    return {
      month,
      income,
      expenses,
      balance: income - expenses,
      byCategory,
      upcomingBills: bills,
      installments: {
        monthlyTotal: activeInstallments?.totalMonthly || 0,
        count: activeInstallments?.count || 0,
      },
      recentTransactions: recentTxns,
      accounts: accountBalances,
    }
  })
}
