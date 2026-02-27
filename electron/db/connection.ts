import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import * as schema from './schema'

let db: ReturnType<typeof createDatabase> | null = null

function createDatabase() {
  const dbPath = join(app.getPath('userData'), 'desenrola.db')
  const sqlite = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  return drizzle(sqlite, { schema })
}

export function getDb() {
  if (!db) {
    db = createDatabase()
  }
  return db
}

export function initializeDatabase() {
  const database = getDb()

  // Create tables using raw SQL for initial setup
  // Drizzle migrations handle schema evolution
  const sqlite = (database as any).session?.client as Database.Database
  if (!sqlite) return database

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('checking','savings','credit_card','vale_refeicao','vale_alimentacao','vale_transporte','cash','investment')),
      institution TEXT,
      balance REAL DEFAULT 0,
      credit_limit REAL,
      billing_day INTEGER,
      due_day INTEGER,
      color TEXT,
      icon TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense','income')),
      icon TEXT,
      color TEXT,
      parent_id INTEGER REFERENCES categories(id),
      is_system INTEGER DEFAULT 0,
      is_deductible_irpf INTEGER DEFAULT 0,
      budget_default REAL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recurring_bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      account_id INTEGER REFERENCES accounts(id),
      amount REAL,
      amount_min REAL,
      amount_max REAL,
      due_day INTEGER NOT NULL,
      frequency TEXT DEFAULT 'monthly' CHECK(frequency IN ('monthly','yearly','bimonthly','custom')),
      provider TEXT,
      payment_method TEXT CHECK(payment_method IN ('boleto','debito_automatico','pix','credit_card')),
      auto_pay INTEGER DEFAULT 0,
      late_fee_percent REAL,
      late_interest_daily REAL,
      barcode_pattern TEXT,
      reminder_days_before INTEGER DEFAULT 3,
      is_active INTEGER DEFAULT 1,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS installment_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      total_amount REAL NOT NULL,
      installment_amount REAL NOT NULL,
      total_installments INTEGER NOT NULL,
      paid_installments INTEGER DEFAULT 0,
      start_date TEXT NOT NULL,
      credit_card_id INTEGER REFERENCES accounts(id),
      interest_rate REAL DEFAULT 0,
      category_id INTEGER REFERENCES categories(id),
      status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','cancelled')),
      store TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      category_id INTEGER REFERENCES categories(id),
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income','expense','transfer')),
      payment_method TEXT CHECK(payment_method IN ('pix','boleto','credit_card','debit_card','cash','vale_refeicao','vale_alimentacao','transfer')),
      is_recurring INTEGER DEFAULT 0,
      recurring_bill_id INTEGER REFERENCES recurring_bills(id),
      installment_id INTEGER REFERENCES installment_plans(id),
      installment_number INTEGER,
      transfer_to_account_id INTEGER REFERENCES accounts(id),
      tags TEXT,
      notes TEXT,
      receipt_path TEXT,
      ai_categorized INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);

    CREATE TABLE IF NOT EXISTS salary_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT 'Principal',
      employment_type TEXT NOT NULL CHECK(employment_type IN ('clt','pj','autonomo','misto')),
      gross_salary REAL,
      inss_deduction REAL,
      irrf_deduction REAL,
      vale_refeicao REAL,
      vale_alimentacao REAL,
      vale_transporte REAL,
      vt_deduction_percent REAL DEFAULT 6,
      health_plan_deduction REAL,
      dental_plan_deduction REAL,
      other_deductions REAL,
      other_deductions_desc TEXT,
      net_salary REAL,
      payment_day INTEGER,
      has_13_salario INTEGER DEFAULT 1,
      has_plr INTEGER DEFAULT 0,
      plr_estimated REAL,
      pj_monthly_revenue REAL,
      pj_tax_regime TEXT CHECK(pj_tax_regime IN ('simples','lucro_presumido','mei')),
      pj_das_rate REAL,
      pj_prolabore REAL,
      fgts_monthly REAL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      amount REAL NOT NULL,
      month TEXT NOT NULL,
      spent REAL DEFAULT 0,
      alert_threshold REAL DEFAULT 0.8,
      rollover INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category_id, month)
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      target_date TEXT,
      type TEXT CHECK(type IN ('emergency_fund','travel','apartment','car','education','wedding','retirement','custom')),
      linked_account_id INTEGER REFERENCES accounts(id),
      monthly_contribution REAL,
      icon TEXT,
      color TEXT,
      priority INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active' CHECK(status IN ('active','completed','paused')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tax_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('saude','educacao','previdencia_privada','pensao_alimenticia','dependente')),
      description TEXT,
      amount REAL NOT NULL,
      cpf_cnpj_provider TEXT,
      provider_name TEXT,
      transaction_id INTEGER REFERENCES transactions(id),
      document_path TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS boletos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      issuer TEXT,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','overdue','cancelled')),
      paid_date TEXT,
      paid_amount REAL,
      recurring_bill_id INTEGER REFERENCES recurring_bills(id),
      transaction_id INTEGER REFERENCES transactions(id),
      scan_source TEXT CHECK(scan_source IN ('camera','email','pdf','manual')),
      pdf_path TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES ai_conversations(id),
      role TEXT NOT NULL CHECK(role IN ('user','assistant')),
      content TEXT NOT NULL,
      context_snapshot TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  return database
}

export type AppDatabase = ReturnType<typeof getDb>
