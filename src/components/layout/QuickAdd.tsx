import { useState, useEffect, useRef } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useAccounts } from '@/api/useAccounts'
import { useCreateTransaction } from '@/api/useTransactions'
import type { TransactionType, PaymentMethod } from '@/types/models'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'debit_card', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'vale_refeicao', label: 'Vale Refeição' },
  { value: 'vale_alimentacao', label: 'Vale Alimentação' },
]

export function QuickAdd() {
  const { quickAddOpen, closeQuickAdd } = useAppStore()
  const { data: accounts = [] } = useAccounts()
  const createTransaction = useCreateTransaction()

  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const inputRef = useRef<HTMLInputElement>(null)

  // Set default account when accounts load
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id)
    }
  }, [accounts, accountId])

  // Keyboard shortcut: Ctrl+N
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        useAppStore.getState().openQuickAdd()
      }
      if (e.key === 'Escape' && quickAddOpen) {
        closeQuickAdd()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [quickAddOpen, closeQuickAdd])

  // Auto-focus on open
  useEffect(() => {
    if (quickAddOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [quickAddOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !accountId) return

    const numAmount = parseFloat(amount.replace(',', '.'))
    const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount)

    try {
      await createTransaction.mutateAsync({
        accountId: accountId as number,
        amount: finalAmount,
        description,
        date,
        type,
        paymentMethod,
      })

      // Reset form
      setDescription('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      closeQuickAdd()
    } catch (err) {
      console.error('Failed to create transaction:', err)
    }
  }

  if (!quickAddOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={closeQuickAdd}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 animate-slide-up">
        <div className="card w-full max-w-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800 dark:text-white">
              Nova Transação
            </h2>
            <button
              onClick={closeQuickAdd}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X size={18} className="text-stone-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  type === 'expense'
                    ? 'bg-red-50 text-red-600 border-2 border-red-200'
                    : 'bg-stone-100 text-stone-500 border-2 border-transparent'
                }`}
              >
                <Minus size={16} /> Despesa
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  type === 'income'
                    ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200'
                    : 'bg-stone-100 text-stone-500 border-2 border-transparent'
                }`}
              >
                <Plus size={16} /> Receita
              </button>
            </div>

            {/* Description */}
            <input
              ref={inputRef}
              type="text"
              placeholder="O que foi? Ex: iFood, Uber, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
            />

            {/* Amount */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="currency-input pl-10"
              />
            </div>

            {/* Account selector */}
            {accounts.length > 0 && (
              <select
                value={accountId}
                onChange={(e) => setAccountId(parseInt(e.target.value))}
                className="input"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            )}

            {/* Date + Payment method row */}
            <div className="flex gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input flex-1"
              />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="input flex-1"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>{pm.label}</option>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={createTransaction.isPending || !amount || !description || !accountId}
            >
              {createTransaction.isPending ? 'Salvando...' : 'Adicionar'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
