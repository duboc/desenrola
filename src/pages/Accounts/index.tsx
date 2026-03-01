import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { AccountForm } from '@/components/forms/AccountForm'
import { useAccounts, useDeleteAccount } from '@/api/useAccounts'
import { formatBRL } from '@/lib/formatters'
import { ACCOUNT_TYPE_LABELS } from '@/types/enums'
import type { Account } from '@/types/models'
import { Plus, Edit3, Trash2, Wallet, CreditCard, PiggyBank, Banknote } from 'lucide-react'

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  checking: Wallet,
  savings: PiggyBank,
  credit_card: CreditCard,
  cash: Banknote,
}

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts()
  const deleteAccount = useDeleteAccount()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const handleNew = () => {
    setEditingAccount(null)
    setFormOpen(true)
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormOpen(true)
  }

  const handleDelete = async (id: number) => {
    await deleteAccount.mutateAsync(id)
  }

  const totalBalance = accounts
    .filter((a) => a.type !== 'credit_card')
    .reduce((sum, a) => sum + (a.balance || 0), 0)

  const totalDebt = accounts
    .filter((a) => a.type === 'credit_card')
    .reduce((sum, a) => sum + Math.abs(a.balance || 0), 0)

  return (
    <div>
      <Header title="Contas" showMonthNav={false} />

      <div className="p-6 space-y-6">
        {/* Net worth summary */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="card">
              <p className="text-xs text-stone-400 mb-1">Saldo total</p>
              <p className="text-xl font-bold font-mono text-emerald-600">{formatBRL(totalBalance)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-stone-400 mb-1">Faturas abertas</p>
              <p className="text-xl font-bold font-mono text-red-500">{formatBRL(totalDebt)}</p>
            </div>
            <div className="card">
              <p className="text-xs text-stone-400 mb-1">Patrimônio líquido</p>
              <p className={`text-xl font-bold font-mono ${totalBalance - totalDebt >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatBRL(totalBalance - totalDebt)}
              </p>
            </div>
          </div>
        )}

        {/* Accounts list */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-800 dark:text-white">
            Suas contas ({accounts.length})
          </h2>
          <button onClick={handleNew} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nova conta
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-stone-400">Carregando...</div>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="Nenhuma conta cadastrada"
            description="Adicione suas contas bancárias, cartões e vales para começar."
            action={{ label: 'Criar primeira conta', onClick: handleNew }}
          />
        ) : (
          <div className="grid gap-3">
            {accounts.map((account) => {
              const Icon = ACCOUNT_ICONS[account.type] || Wallet
              return (
                <div
                  key={account.id}
                  className="card flex items-center gap-4 group"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${account.color || '#10B981'}20` }}
                  >
                    <Icon size={20} style={{ color: account.color || '#10B981' }} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 truncate">
                        {account.name}
                      </p>
                      {account.institution && (
                        <span className="text-xs text-stone-400 truncate">{account.institution}</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">
                      {ACCOUNT_TYPE_LABELS[account.type]}
                      {account.type === 'credit_card' && account.creditLimit && (
                        <> · Limite: {formatBRL(account.creditLimit)}</>
                      )}
                      {account.type === 'credit_card' && account.dueDay && (
                        <> · Vence dia {account.dueDay}</>
                      )}
                    </p>
                  </div>

                  {/* Balance */}
                  <div className="text-right">
                    <p className={`text-sm font-bold font-mono ${
                      account.type === 'credit_card'
                        ? 'text-red-500'
                        : (account.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {account.type === 'credit_card' ? '-' : ''}{formatBRL(Math.abs(account.balance || 0))}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-700"
                      title="Editar"
                    >
                      <Edit3 size={14} className="text-stone-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Excluir"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AccountForm
        account={editingAccount}
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingAccount(null)
        }}
      />
    </div>
  )
}
