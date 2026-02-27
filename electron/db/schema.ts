import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ─── Accounts ───────────────────────────────────────────────────
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', {
    enum: [
      'checking', 'savings', 'credit_card', 'vale_refeicao',
      'vale_alimentacao', 'vale_transporte', 'cash', 'investment'
    ]
  }).notNull(),
  institution: text('institution'),
  balance: real('balance').default(0),
  creditLimit: real('credit_limit'),
  billingDay: integer('billing_day'),
  dueDay: integer('due_day'),
  color: text('color'),
  icon: text('icon'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Categories ─────────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['expense', 'income'] }).notNull(),
  icon: text('icon'),
  color: text('color'),
  parentId: integer('parent_id').references(() => categories.id),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
  isDeductibleIrpf: integer('is_deductible_irpf', { mode: 'boolean' }).default(false),
  budgetDefault: real('budget_default'),
  sortOrder: integer('sort_order').default(0),
})

// ─── Transactions ───────────────────────────────────────────────
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').notNull().references(() => accounts.id),
  categoryId: integer('category_id').references(() => categories.id),
  amount: real('amount').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  paymentMethod: text('payment_method', {
    enum: [
      'pix', 'boleto', 'credit_card', 'debit_card',
      'cash', 'vale_refeicao', 'vale_alimentacao', 'transfer'
    ]
  }),
  isRecurring: integer('is_recurring', { mode: 'boolean' }).default(false),
  recurringBillId: integer('recurring_bill_id').references(() => recurringBills.id),
  installmentId: integer('installment_id').references(() => installmentPlans.id),
  installmentNumber: integer('installment_number'),
  transferToAccountId: integer('transfer_to_account_id').references(() => accounts.id),
  tags: text('tags'), // JSON array
  notes: text('notes'),
  receiptPath: text('receipt_path'),
  aiCategorized: integer('ai_categorized', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Recurring Bills ────────────────────────────────────────────
export const recurringBills = sqliteTable('recurring_bills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  accountId: integer('account_id').references(() => accounts.id),
  amount: real('amount'),
  amountMin: real('amount_min'),
  amountMax: real('amount_max'),
  dueDay: integer('due_day').notNull(),
  frequency: text('frequency', {
    enum: ['monthly', 'yearly', 'bimonthly', 'custom']
  }).default('monthly'),
  provider: text('provider'),
  paymentMethod: text('payment_method', {
    enum: ['boleto', 'debito_automatico', 'pix', 'credit_card']
  }),
  autoPay: integer('auto_pay', { mode: 'boolean' }).default(false),
  lateFeePercent: real('late_fee_percent'),
  lateInterestDaily: real('late_interest_daily'),
  barcodePattern: text('barcode_pattern'),
  reminderDaysBefore: integer('reminder_days_before').default(3),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  startDate: text('start_date'),
  endDate: text('end_date'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Installment Plans ──────────────────────────────────────────
export const installmentPlans = sqliteTable('installment_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  description: text('description').notNull(),
  totalAmount: real('total_amount').notNull(),
  installmentAmount: real('installment_amount').notNull(),
  totalInstallments: integer('total_installments').notNull(),
  paidInstallments: integer('paid_installments').default(0),
  startDate: text('start_date').notNull(),
  creditCardId: integer('credit_card_id').references(() => accounts.id),
  interestRate: real('interest_rate').default(0),
  categoryId: integer('category_id').references(() => categories.id),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).default('active'),
  store: text('store'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Salary Config ──────────────────────────────────────────────
export const salaryConfig = sqliteTable('salary_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').default('Principal'),
  employmentType: text('employment_type', {
    enum: ['clt', 'pj', 'autonomo', 'misto']
  }).notNull(),
  grossSalary: real('gross_salary'),
  inssDeduction: real('inss_deduction'),
  irrfDeduction: real('irrf_deduction'),
  valeRefeicao: real('vale_refeicao'),
  valeAlimentacao: real('vale_alimentacao'),
  valeTransporte: real('vale_transporte'),
  vtDeductionPercent: real('vt_deduction_percent').default(6),
  healthPlanDeduction: real('health_plan_deduction'),
  dentalPlanDeduction: real('dental_plan_deduction'),
  otherDeductions: real('other_deductions'),
  otherDeductionsDesc: text('other_deductions_desc'),
  netSalary: real('net_salary'),
  paymentDay: integer('payment_day'),
  has13Salario: integer('has_13_salario', { mode: 'boolean' }).default(true),
  hasPlr: integer('has_plr', { mode: 'boolean' }).default(false),
  plrEstimated: real('plr_estimated'),
  pjMonthlyRevenue: real('pj_monthly_revenue'),
  pjTaxRegime: text('pj_tax_regime', { enum: ['simples', 'lucro_presumido', 'mei'] }),
  pjDasRate: real('pj_das_rate'),
  pjProlabore: real('pj_prolabore'),
  fgtsMonthly: real('fgts_monthly'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Budgets ────────────────────────────────────────────────────
export const budgets = sqliteTable('budgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  amount: real('amount').notNull(),
  month: text('month').notNull(), // YYYY-MM
  spent: real('spent').default(0),
  alertThreshold: real('alert_threshold').default(0.8),
  rollover: integer('rollover', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  categoryMonthIdx: uniqueIndex('idx_budget_category_month').on(table.categoryId, table.month),
}))

// ─── Goals ──────────────────────────────────────────────────────
export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').default(0),
  targetDate: text('target_date'),
  type: text('type', {
    enum: [
      'emergency_fund', 'travel', 'apartment', 'car',
      'education', 'wedding', 'retirement', 'custom'
    ]
  }),
  linkedAccountId: integer('linked_account_id').references(() => accounts.id),
  monthlyContribution: real('monthly_contribution'),
  icon: text('icon'),
  color: text('color'),
  priority: integer('priority').default(1),
  status: text('status', { enum: ['active', 'completed', 'paused'] }).default('active'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Tax Tracking ───────────────────────────────────────────────
export const taxTracking = sqliteTable('tax_tracking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  category: text('category', {
    enum: ['saude', 'educacao', 'previdencia_privada', 'pensao_alimenticia', 'dependente']
  }).notNull(),
  description: text('description'),
  amount: real('amount').notNull(),
  cpfCnpjProvider: text('cpf_cnpj_provider'),
  providerName: text('provider_name'),
  transactionId: integer('transaction_id').references(() => transactions.id),
  documentPath: text('document_path'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Boletos ────────────────────────────────────────────────────
export const boletos = sqliteTable('boletos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  barcode: text('barcode'),
  amount: real('amount').notNull(),
  dueDate: text('due_date').notNull(),
  issuer: text('issuer'),
  description: text('description'),
  status: text('status', {
    enum: ['pending', 'paid', 'overdue', 'cancelled']
  }).default('pending'),
  paidDate: text('paid_date'),
  paidAmount: real('paid_amount'),
  recurringBillId: integer('recurring_bill_id').references(() => recurringBills.id),
  transactionId: integer('transaction_id').references(() => transactions.id),
  scanSource: text('scan_source', { enum: ['camera', 'email', 'pdf', 'manual'] }),
  pdfPath: text('pdf_path'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── AI Conversations ───────────────────────────────────────────
export const aiConversations = sqliteTable('ai_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── AI Messages ────────────────────────────────────────────────
export const aiMessages = sqliteTable('ai_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => aiConversations.id),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  contextSnapshot: text('context_snapshot'), // JSON
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// ─── Settings ───────────────────────────────────────────────────
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value'), // JSON-encoded
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})
