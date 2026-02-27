// ─── Account ────────────────────────────────────────────────────
export type AccountType =
  | 'checking' | 'savings' | 'credit_card' | 'vale_refeicao'
  | 'vale_alimentacao' | 'vale_transporte' | 'cash' | 'investment'

export interface Account {
  id: number
  name: string
  type: AccountType
  institution: string | null
  balance: number
  creditLimit: number | null
  billingDay: number | null
  dueDay: number | null
  color: string | null
  icon: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Category ───────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  type: 'expense' | 'income'
  icon: string | null
  color: string | null
  parentId: number | null
  isSystem: boolean
  isDeductibleIrpf: boolean
  budgetDefault: number | null
  sortOrder: number
}

// ─── Transaction ────────────────────────────────────────────────
export type PaymentMethod =
  | 'pix' | 'boleto' | 'credit_card' | 'debit_card'
  | 'cash' | 'vale_refeicao' | 'vale_alimentacao' | 'transfer'

export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Transaction {
  id: number
  accountId: number
  categoryId: number | null
  amount: number
  description: string | null
  date: string
  type: TransactionType
  paymentMethod: PaymentMethod | null
  isRecurring: boolean
  recurringBillId: number | null
  installmentId: number | null
  installmentNumber: number | null
  transferToAccountId: number | null
  tags: string | null
  notes: string | null
  receiptPath: string | null
  aiCategorized: boolean
  createdAt: string
}

// ─── Recurring Bill ─────────────────────────────────────────────
export interface RecurringBill {
  id: number
  name: string
  categoryId: number | null
  accountId: number | null
  amount: number | null
  amountMin: number | null
  amountMax: number | null
  dueDay: number
  frequency: 'monthly' | 'yearly' | 'bimonthly' | 'custom'
  provider: string | null
  paymentMethod: string | null
  autoPay: boolean
  lateFeePercent: number | null
  lateInterestDaily: number | null
  barcodePattern: string | null
  reminderDaysBefore: number
  isActive: boolean
  startDate: string | null
  endDate: string | null
  notes: string | null
  createdAt: string
}

// ─── Installment Plan ───────────────────────────────────────────
export interface InstallmentPlan {
  id: number
  description: string
  totalAmount: number
  installmentAmount: number
  totalInstallments: number
  paidInstallments: number
  startDate: string
  creditCardId: number | null
  interestRate: number
  categoryId: number | null
  status: 'active' | 'completed' | 'cancelled'
  store: string | null
  notes: string | null
  createdAt: string
}

// ─── Salary Config ──────────────────────────────────────────────
export type EmploymentType = 'clt' | 'pj' | 'autonomo' | 'misto'

export interface SalaryConfig {
  id: number
  name: string
  employmentType: EmploymentType
  grossSalary: number | null
  inssDeduction: number | null
  irrfDeduction: number | null
  valeRefeicao: number | null
  valeAlimentacao: number | null
  valeTransporte: number | null
  vtDeductionPercent: number
  healthPlanDeduction: number | null
  dentalPlanDeduction: number | null
  otherDeductions: number | null
  otherDeductionsDesc: string | null
  netSalary: number | null
  paymentDay: number | null
  has13Salario: boolean
  hasPlr: boolean
  plrEstimated: number | null
  pjMonthlyRevenue: number | null
  pjTaxRegime: 'simples' | 'lucro_presumido' | 'mei' | null
  pjDasRate: number | null
  pjProlabore: number | null
  fgtsMonthly: number | null
  isActive: boolean
  createdAt: string
}

// ─── Budget ─────────────────────────────────────────────────────
export interface Budget {
  id: number
  categoryId: number
  amount: number
  month: string
  spent: number
  alertThreshold: number
  rollover: boolean
  createdAt: string
}

export interface BudgetWithStatus extends Budget {
  remaining: number
  percentage: number
  status: 'ok' | 'warning' | 'exceeded'
}

// ─── Goal ───────────────────────────────────────────────────────
export type GoalType =
  | 'emergency_fund' | 'travel' | 'apartment' | 'car'
  | 'education' | 'wedding' | 'retirement' | 'custom'

export interface Goal {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string | null
  type: GoalType | null
  linkedAccountId: number | null
  monthlyContribution: number | null
  icon: string | null
  color: string | null
  priority: number
  status: 'active' | 'completed' | 'paused'
  createdAt: string
}

// ─── Tax Tracking ───────────────────────────────────────────────
export type TaxCategory =
  | 'saude' | 'educacao' | 'previdencia_privada'
  | 'pensao_alimenticia' | 'dependente'

export interface TaxEntry {
  id: number
  year: number
  category: TaxCategory
  description: string | null
  amount: number
  cpfCnpjProvider: string | null
  providerName: string | null
  transactionId: number | null
  documentPath: string | null
  notes: string | null
  createdAt: string
}

// ─── Dashboard ──────────────────────────────────────────────────
export interface DashboardData {
  month: string
  income: number
  expenses: number
  balance: number
  byCategory: Array<{ categoryId: number | null; total: number }>
  upcomingBills: RecurringBill[]
  installments: { monthlyTotal: number; count: number }
  recentTransactions: Transaction[]
  accounts: Account[]
}
