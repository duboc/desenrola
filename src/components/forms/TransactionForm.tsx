import { useState, useEffect } from 'react'
import { X, Plus, Minus, ArrowLeftRight } from 'lucide-react'
import { useCreateTransaction } from '@/api/useTransactions'
import { useAccounts } from '@/api/useAccounts'
import { PAYMENT_METHOD_LABELS } from '@/types/enums'
import type { Transaction, TransactionType, PaymentMethod } from '@/types/models'

interface TransactionFormProps {
  transaction?: Transaction | null
  open: boolean
  onClose: () => void
}

const TYPE_CONFIG = {
  expense: { label: 'Despesa', icon: Minus, colors: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800' },
  income: { label: 'Receita', icon: Plus, colors: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' },
  transfer: { label: 'Transferência', icon: ArrowLeftRight, colors: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
} as const

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = Object.entries(PAYMENT_METHOD_LABELS).map(
  ([value, label]) => ({ value: value as PaymentMethod, label })
)

export function TransactionForm({ transaction, open, onClose }: TransactionFormProps) {
  const createTransaction = useCreateTransaction()
  const { data: accounts = [] } = useAccounts()
  const [categories, setCategories] = useState<Array<{ id: number; name: string; type: string; icon: string | null }>>([])

  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [accountId, setAccountId] = useState<number | ''>('')
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    window.api.system.getCategories().then((cats: any[]) => setCategories(cats))
  }, [])

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setDescription(transaction.description || '')
      setAmount(Math.abs(transaction.amount).toString())
      setDate(transaction.date)
      setAccountId(transaction.accountId)
      setCategoryId(transaction.categoryId || '')
      setPaymentMethod(transaction.paymentMethod || 'pix')
      setNotes(transaction.notes || '')
    } else {
      setType('expense')
      setDescription('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setAccountId(accounts[0]?.id || '')
      setCategoryId('')
      setPaymentMethod('pix')
      setNotes('')
    }
  }, [transaction, open, accounts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !accountId) return

    const numAmount = parseFloat(amount.replace(',', '.'))
    const finalAmount = type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount)

    await createTransaction.mutateAsync({
      accountId: accountId as number,
      categoryId: categoryId || null,
      amount: finalAmount,
      description: description.trim() || null,
      date,
      type,
      paymentMethod,
      notes: notes.trim() || null,
    })

    onClose()
  }

  const filteredCategories = categories.filter((c) =>
    type === 'transfer' ? true : c.type === type || c.type === 'expense'
  )

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800 dark:text-white">
              {transaction ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
              <X size={18} className="text-stone-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              {(Object.entries(TYPE_CONFIG) as [TransactionType, typeof TYPE_CONFIG[keyof typeof TYPE_CONFIG]][]).map(
                ([key, config]) => {
                  const Icon = config.icon
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setType(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${
                        type === key ? config.colors : 'bg-stone-100 text-stone-500 border-transparent dark:bg-stone-800 dark:text-stone-400'
                      }`}
                    >
                      <Icon size={14} /> {config.label}
                    </button>
                  )
                }
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Descrição</label>
              <input
                type="text"
                placeholder="Ex: iFood, Uber, Salário..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                autoFocus
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="currency-input pl-10"
                />
              </div>
            </div>

            {/* Account */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Conta</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value ? parseInt(e.target.value) : '')}
                className="input"
              >
                <option value="">Selecione uma conta</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
              {accounts.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">Nenhuma conta cadastrada. Crie uma primeiro!</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
                className="input"
              >
                <option value="">Sem categoria</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date + Payment method */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-stone-500 mb-1 block">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-stone-500 mb-1 block">Meio de pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="input"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Observações</label>
              <textarea
                placeholder="Anotações opcionais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[60px] resize-none"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={createTransaction.isPending || !amount || !accountId}
              >
                {createTransaction.isPending ? 'Salvando...' : (transaction ? 'Salvar' : 'Adicionar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
