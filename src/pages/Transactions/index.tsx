import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { useFilterStore } from '@/stores/filterStore'
import { useTransactionsByDateRange, useDeleteTransaction } from '@/api/useTransactions'
import { useAccounts } from '@/api/useAccounts'
import { formatBRL, formatDate, formatRelativeDate } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import { PAYMENT_METHOD_LABELS, TRANSACTION_TYPE_LABELS } from '@/types/enums'
import type { Transaction } from '@/types/models'
import { Search, Plus, Trash2, Edit3 } from 'lucide-react'

export default function TransactionsPage() {
  const { startDate, endDate } = useFilterStore()
  const { data: transactions = [], isLoading } = useTransactionsByDateRange(startDate, endDate)
  const { data: accounts = [] } = useAccounts()
  const deleteTransaction = useDeleteTransaction()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [accountFilter, setAccountFilter] = useState<string>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null)

  const filtered = transactions.filter((txn) => {
    if (typeFilter !== 'all' && txn.type !== typeFilter) return false
    if (accountFilter !== 'all' && txn.accountId !== parseInt(accountFilter)) return false
    if (search && !txn.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDelete = async (id: number) => {
    await deleteTransaction.mutateAsync(id)
  }

  const handleEdit = (txn: Transaction) => {
    setEditingTxn(txn)
    setFormOpen(true)
  }

  const handleNewTransaction = () => {
    setEditingTxn(null)
    setFormOpen(true)
  }

  // Group by date
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, txn) => {
    if (!acc[txn.date]) acc[txn.date] = []
    acc[txn.date].push(txn)
    return acc
  }, {})

  // Summary
  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const accountMap = new Map(accounts.map((a) => [a.id, a.name]))

  return (
    <div>
      <Header title={messages.transactions.title} />

      <div className="p-6">
        {/* Summary bar */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-6 mb-6 p-4 bg-stone-50 dark:bg-stone-800 rounded-xl">
            <div>
              <p className="text-xs text-stone-400">Receitas</p>
              <p className="text-sm font-bold font-mono text-emerald-600">{formatBRL(income)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Despesas</p>
              <p className="text-sm font-bold font-mono text-red-500">{formatBRL(expenses)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400">Saldo</p>
              <p className={`text-sm font-bold font-mono ${income + expenses >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatBRL(income + expenses)}
              </p>
            </div>
            <div className="ml-auto">
              <p className="text-xs text-stone-400">{filtered.length} transações</p>
            </div>
          </div>
        )}

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
            <option value="all">Todos os tipos</option>
            <option value="expense">Despesas</option>
            <option value="income">Receitas</option>
            <option value="transfer">Transferências</option>
          </select>
          {accounts.length > 1 && (
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">Todas as contas</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          )}
          <button onClick={handleNewTransaction} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova
          </button>
        </div>

        {/* Transaction list */}
        {isLoading ? (
          <div className="text-center py-12 text-stone-400">{messages.common.loading}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="💸"
            title="Nenhuma transação"
            description={search ? messages.common.noResults : messages.transactions.empty}
            action={!search ? { label: messages.transactions.quickAdd, onClick: handleNewTransaction } : undefined}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, txns]) => (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      {formatRelativeDate(date)} · {formatDate(date)}
                    </p>
                    <p className="text-xs text-stone-400 font-mono">
                      {formatBRL(txns.reduce((s, t) => s + t.amount, 0))}
                    </p>
                  </div>
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
                            {accountMap.get(txn.accountId) && (
                              <span className="text-xs text-stone-400">
                                · {accountMap.get(txn.accountId)}
                              </span>
                            )}
                            {txn.installmentNumber && (
                              <span className="text-xs text-stone-400">
                                · Parcela {txn.installmentNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold font-mono ${
                            txn.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            {txn.amount >= 0 ? '+' : ''}{formatBRL(txn.amount)}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(txn)}
                              className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700"
                              title={messages.common.edit}
                            >
                              <Edit3 size={14} className="text-stone-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(txn.id)}
                              className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                              title={messages.common.delete}
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <TransactionForm
        transaction={editingTxn}
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTxn(null)
        }}
      />
    </div>
  )
}
