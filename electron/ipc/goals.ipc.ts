import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { goals } from '../db/schema'
import { eq } from 'drizzle-orm'

export function registerGoalHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('goals:getAll', async () => {
    const db = getDb()
    return db.select().from(goals).all()
  })

  ipcMain.handle('goals:getById', async (_event, id: number) => {
    const db = getDb()
    return db.select().from(goals).where(eq(goals.id, id)).get()
  })

  ipcMain.handle('goals:create', async (_event, data: any) => {
    const db = getDb()
    return db.insert(goals).values(data).returning().get()
  })

  ipcMain.handle('goals:update', async (_event, id: number, data: any) => {
    const db = getDb()
    return db.update(goals).set(data).where(eq(goals.id, id)).returning().get()
  })

  ipcMain.handle('goals:delete', async (_event, id: number) => {
    const db = getDb()
    return db.delete(goals).where(eq(goals.id, id)).returning().get()
  })

  ipcMain.handle('goals:addContribution', async (_event, id: number, amount: number) => {
    const db = getDb()
    const goal = db.select().from(goals).where(eq(goals.id, id)).get()
    if (!goal) throw new Error('Goal not found')

    const newAmount = (goal.currentAmount || 0) + amount
    const status = newAmount >= goal.targetAmount ? 'completed' : 'active'

    return db.update(goals)
      .set({ currentAmount: newAmount, status })
      .where(eq(goals.id, id))
      .returning()
      .get()
  })
}
