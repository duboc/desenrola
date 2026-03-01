import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { recurringBills, transactions } from '../db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

export function registerBillHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('bills:getAll', async () => {
    const db = getDb()
    return db.select().from(recurringBills).where(eq(recurringBills.isActive, true)).all()
  })

  ipcMain.handle('bills:getById', async (_event, id: number) => {
    const db = getDb()
    return db.select().from(recurringBills).where(eq(recurringBills.id, id)).get()
  })

  ipcMain.handle('bills:create', async (_event, data: any) => {
    const db = getDb()
    return db.insert(recurringBills).values(data).returning().get()
  })

  ipcMain.handle('bills:update', async (_event, id: number, data: any) => {
    const db = getDb()
    return db.update(recurringBills).set(data).where(eq(recurringBills.id, id)).returning().get()
  })

  ipcMain.handle('bills:delete', async (_event, id: number) => {
    const db = getDb()
    return db.update(recurringBills)
      .set({ isActive: false })
      .where(eq(recurringBills.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('bills:getUpcoming', async (_event, days: number) => {
    const db = getDb()
    const today = new Date()
    const currentDay = today.getDate()
    const targetDay = currentDay + days

    // Get all active bills where due_day falls within the range
    const bills = db.select().from(recurringBills)
      .where(eq(recurringBills.isActive, true))
      .all()

    return bills.filter(bill => {
      if (bill.dueDay >= currentDay && bill.dueDay <= targetDay) return true
      // Handle month rollover
      if (targetDay > 31) {
        return bill.dueDay <= (targetDay - 31)
      }
      return false
    }).sort((a, b) => a.dueDay - b.dueDay)
  })

  ipcMain.handle('bills:markPaid', async (_event, billId: number, amount: number, date: string) => {
    const db = getDb()
    const bill = db.select().from(recurringBills).where(eq(recurringBills.id, billId)).get()
    if (!bill) throw new Error('Bill not found')

    // Map bill payment method to transaction payment method
    const billToTxnPaymentMethod: Record<string, string> = {
      boleto: 'boleto',
      debito_automatico: 'debit_card',
      pix: 'pix',
      credit_card: 'credit_card',
    }
    const paymentMethod = billToTxnPaymentMethod[bill.paymentMethod || 'boleto'] || 'boleto'

    // Create a transaction for this payment
    const txn = db.insert(transactions).values({
      accountId: bill.accountId || 1,
      categoryId: bill.categoryId,
      amount: -Math.abs(amount),
      description: `Pagamento: ${bill.name}`,
      date,
      type: 'expense' as const,
      paymentMethod: paymentMethod as 'boleto' | 'pix' | 'credit_card' | 'debit_card',
      isRecurring: true,
      recurringBillId: billId,
    }).returning().get()

    return { transaction: txn, bill }
  })
}
