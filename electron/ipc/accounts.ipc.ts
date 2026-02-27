import type { IpcMain } from 'electron'
import { getDb } from '../db/connection'
import { accounts } from '../db/schema'
import { eq } from 'drizzle-orm'

export function registerAccountHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('accounts:getAll', async () => {
    const db = getDb()
    return db.select().from(accounts).where(eq(accounts.isActive, true)).all()
  })

  ipcMain.handle('accounts:getById', async (_event, id: number) => {
    const db = getDb()
    return db.select().from(accounts).where(eq(accounts.id, id)).get()
  })

  ipcMain.handle('accounts:create', async (_event, data: any) => {
    const db = getDb()
    return db.insert(accounts).values(data).returning().get()
  })

  ipcMain.handle('accounts:update', async (_event, id: number, data: any) => {
    const db = getDb()
    return db.update(accounts)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(accounts.id, id))
      .returning()
      .get()
  })

  ipcMain.handle('accounts:delete', async (_event, id: number) => {
    const db = getDb()
    // Soft delete
    return db.update(accounts)
      .set({ isActive: false, updatedAt: new Date().toISOString() })
      .where(eq(accounts.id, id))
      .returning()
      .get()
  })
}
