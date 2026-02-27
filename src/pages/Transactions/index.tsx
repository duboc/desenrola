import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { useFilterStore } from '@/stores/filterStore'
import { useAppStore } from '@/stores/appStore'
import { formatBRL, formatDate } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import { PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from '@/types/enums'
import type { Transaction } from '@/types/models'
import { Search, Filter, Trash2, Edit3 } from 'lucide-react'

export default function TransactionsPage() {
  const { currentMonth, startDate, endDate } = useFilterStore()
  const { openQuickAdd } = useAppStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    window.api.transactions.getByDateRange(startDate, endDate)
      .then((txns: Transaction[]) => {
        setTransactions(txns)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [startDate, endDate])

  const filtered = transactions.filter((txn) => {
    if (typeFilter !== 'all' && txn.type !== typeFilter) return false
    if (search && !txn.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDelete = async (id: number) => {
    await window.api.transactions.delete(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  // Group by date
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, txn) => {
    if (!acc[txn.date]) acc[txn.date] = []
    acc[txn.date].push(txn)
    return acc
  }, {})

  return (
    <div>
      <Header title={messages.transactions.title} />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={messages.common.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">Todos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
            <option value="transfer">Transferências</option>
          </select>
        </div>

        {/* Transaction list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="💸"
            title="Nenhuma transação"
            description={search ? messages.common.noResults : messages.transactions.empty}
            action={!search ? { label: messages.transactions.quickAdd, onClick: openQuickAdd } : undefined}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, txns]) => (
                <div key={date}>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    {formatDate(date)}
                  </p>
                  <div className="card divide-y divide-stone-100 dark:divide-stone-700 p-0">
                    {txns.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between px-5 py-3 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
                            {txn.description || 'Sem descrição'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`badge ${
                              txn.type === 'income' ? 'badge-success' :
                              txn.type === 'expense' ? 'badge-danger' : 'badge-info'
                            }`}>
                              {TRANSACTION_TYPE_LABELS[txn.type]}
                            </span>
                            {txn.paymentMethod && (
                              <span className="text-xs text-stone-400">
                                {PAYMENT_METHOD_LABELS[txn.paymentMethod]}
                              </span>
                            )}
                            {txn.installmentNumber && (
                              <span className="text-xs text-stone-400">
                                Parcela {txn.installmentNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold font-mono ${
                            txn.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {txn.amount >= 0 ? '+' : ''}{formatBRL(txn.amount)}
                          </span>

                          <button
                            onClick={() => handleDelete(txn.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 transition-all"
                            title={messages.common.delete}
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
