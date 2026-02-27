import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import { initializeDatabase } from './db/connection'
import { seedDatabase } from './db/seed'
import { registerAccountHandlers } from './ipc/accounts.ipc'
import { registerTransactionHandlers } from './ipc/transactions.ipc'
import { registerBillHandlers } from './ipc/bills.ipc'
import { registerInstallmentHandlers } from './ipc/installments.ipc'
import { registerSalaryHandlers } from './ipc/salary.ipc'
import { registerBudgetHandlers } from './ipc/budgets.ipc'
import { registerGoalHandlers } from './ipc/goals.ipc'
import { registerTaxHandlers } from './ipc/tax.ipc'
import { registerSystemHandlers } from './ipc/system.ipc'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'Desenrola',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Initialize database and seed data
function initDB(): void {
  const db = initializeDatabase()
  // Access the underlying better-sqlite3 instance for seeding
  const sqlite = (db as any).session?.client
  if (sqlite) {
    seedDatabase(sqlite)
  }
}

// Register all IPC handlers
function registerIPC(): void {
  registerAccountHandlers(ipcMain)
  registerTransactionHandlers(ipcMain)
  registerBillHandlers(ipcMain)
  registerInstallmentHandlers(ipcMain)
  registerSalaryHandlers(ipcMain)
  registerBudgetHandlers(ipcMain)
  registerGoalHandlers(ipcMain)
  registerTaxHandlers(ipcMain)
  registerSystemHandlers(ipcMain)
}

app.whenReady().then(() => {
  initDB()
  registerIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
