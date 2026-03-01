import { z } from 'zod'

// ─── Account ────────────────────────────────────────────────────
export const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum([
    'checking', 'savings', 'credit_card', 'vale_refeicao',
    'vale_alimentacao', 'vale_transporte', 'cash', 'investment',
  ]),
  institution: z.string().optional(),
  balance: z.number().default(0),
  creditLimit: z.number().optional(),
  billingDay: z.number().min(1).max(31).optional(),
  dueDay: z.number().min(1).max(31).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
})

// ─── Transaction ────────────────────────────────────────────────
export const transactionSchema = z.object({
  accountId: z.number({ required_error: 'Selecione uma conta' }),
  categoryId: z.number().optional(),
  amount: z.number({ required_error: 'Valor é obrigatório' }).refine(v => v !== 0, 'Valor não pode ser zero'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  type: z.enum(['income', 'expense', 'transfer']),
  paymentMethod: z.enum([
    'pix', 'boleto', 'credit_card', 'debit_card',
    'cash', 'vale_refeicao', 'vale_alimentacao', 'transfer',
  ]).optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

// ─── Recurring Bill ─────────────────────────────────────────────
export const recurringBillSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  categoryId: z.number().optional(),
  accountId: z.number().optional(),
  amount: z.number().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  dueDay: z.number().min(1).max(31),
  frequency: z.enum(['monthly', 'yearly', 'bimonthly', 'custom']).default('monthly'),
  provider: z.string().optional(),
  paymentMethod: z.enum(['boleto', 'debit_card', 'pix', 'credit_card', 'transfer', 'cash', 'vale_refeicao', 'vale_alimentacao']).optional(),
  autoPay: z.boolean().default(false),
  reminderDaysBefore: z.number().default(3),
})

// ─── Installment Plan ───────────────────────────────────────────
export const installmentPlanSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  totalAmount: z.number().positive('Valor deve ser positivo'),
  installmentAmount: z.number().positive(),
  totalInstallments: z.number().int().min(2, 'Mínimo 2 parcelas').max(72, 'Máximo 72 parcelas'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  creditCardId: z.number().optional(),
  interestRate: z.number().min(0).default(0),
  categoryId: z.number().optional(),
  store: z.string().optional(),
})

// ─── Salary Config ──────────────────────────────────────────────
export const salaryConfigSchema = z.object({
  name: z.string().default('Principal'),
  employmentType: z.enum(['clt', 'pj', 'autonomo', 'misto']),
  grossSalary: z.number().positive('Salário bruto deve ser positivo').optional(),
  paymentDay: z.number().min(1).max(31).optional(),
  valeRefeicao: z.number().min(0).optional(),
  valeAlimentacao: z.number().min(0).optional(),
  valeTransporte: z.number().min(0).optional(),
  healthPlanDeduction: z.number().min(0).optional(),
  dentalPlanDeduction: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
  otherDeductionsDesc: z.string().optional(),
})

// ─── Budget ─────────────────────────────────────────────────────
export const budgetSchema = z.object({
  categoryId: z.number({ required_error: 'Selecione uma categoria' }),
  amount: z.number().positive('Valor deve ser positivo'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato: YYYY-MM'),
  alertThreshold: z.number().min(0).max(1).default(0.8),
})

// ─── Goal ───────────────────────────────────────────────────────
export const goalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  targetAmount: z.number().positive('Meta deve ser positiva'),
  targetDate: z.string().optional(),
  type: z.enum([
    'emergency_fund', 'travel', 'apartment', 'car',
    'education', 'wedding', 'retirement', 'custom',
  ]).optional(),
  monthlyContribution: z.number().min(0).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type AccountInput = z.infer<typeof accountSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type RecurringBillInput = z.infer<typeof recurringBillSchema>
export type InstallmentPlanInput = z.infer<typeof installmentPlanSchema>
export type SalaryConfigInput = z.infer<typeof salaryConfigSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type GoalInput = z.infer<typeof goalSchema>
