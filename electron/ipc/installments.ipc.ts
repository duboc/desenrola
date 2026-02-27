import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { installmentPlans } from '../db/schema'
import { eq, sql } from 'drizzle-orm'

export function registerInstallmentHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('installments:getAll', async () => {
    const db = getDb()
    return db.select().from(installmentPlans).all()
  })

  ipcMain.handle('installments:getById', async (_event, id: number) => {
    const db = getDb()
    return db.select().from(installmentPlans).where(eq(installmentPlans.id, id)).get()
  })

  ipcMain.handle('installments:create', async (_event, data: any) => {
    const db = getDb()
    return db.insert(installmentPlans).values(data).returning().get()
  })

  ipcMain.handle('installments:update', async (_event, id: number, data: any) => {
    const db = getDb()
    return db.update(installmentPlans).set(data).where(eq(installmentPlans.id, id)).returning().get()
  })

  ipcMain.handle('installments:delete', async (_event, id: number) => {
    const db = getDb()
    return db.update(installmentPlans)
      .set({ status: 'cancelled' })
      .where(eq(installmentPlans.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('installments:getMonthlyCommitment', async () => {
    const db = getDb()
    const active = db.select({
      totalMonthly: sql<number>`SUM(installment_amount)`,
      count: sql<number>`COUNT(*)`,
    }).from(installmentPlans)
      .where(eq(installmentPlans.status, 'active'))
      .get()

    // Also get breakdown by month for the next 12 months
    const plans = db.select().from(installmentPlans)
      .where(eq(installmentPlans.status, 'active'))
      .all()

    const monthlyBreakdown: Record<string, number> = {}
    const today = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyBreakdown[key] = 0

      for (const plan of plans) {
        const startDate = new Date(plan.startDate)
        const monthsSinceStart = (date.getFullYear() - startDate.getFullYear()) * 12 +
          (date.getMonth() - startDate.getMonth())

        if (monthsSinceStart >= 0 && monthsSinceStart < plan.totalInstallments) {
          monthlyBreakdown[key] += plan.installmentAmount
        }
      }
    }

    return {
      totalMonthly: active?.totalMonthly || 0,
      activeCount: active?.count || 0,
      monthlyBreakdown,
    }
  })

  ipcMain.handle('installments:simulate', async (
    _event,
    totalAmount: number,
    numInstallments: number,
    interestRate: number
  ) => {
    let installmentAmount: number
    let totalWithInterest: number

    if (interestRate === 0) {
      // Sem juros
      installmentAmount = totalAmount / numInstallments
      totalWithInterest = totalAmount
    } else {
      // With interest (Price table / Tabela Price)
      const monthlyRate = interestRate / 100
      installmentAmount = totalAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, numInstallments)) /
        (Math.pow(1 + monthlyRate, numInstallments) - 1)
      totalWithInterest = installmentAmount * numInstallments
    }

    return {
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      totalAmount: Math.round(totalWithInterest * 100) / 100,
      totalInterest: Math.round((totalWithInterest - totalAmount) * 100) / 100,
      numInstallments,
      interestRate,
    }
  })
}
