import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { useFilterStore } from '@/stores/filterStore'
import { formatBRL } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import type { BudgetWithStatus } from '@/types/models'

export default function BudgetPage() {
  const { currentMonth } = useFilterStore()
  const [budgets, setBudgets] = useState<BudgetWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    window.api.budgets.getOverview(currentMonth)
      .then((data: BudgetWithStatus[]) => {
        setBudgets(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [currentMonth])

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div>
      <Header title={messages.budget.title} />

      <div className="p-6 space-y-6">
        {/* Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="overline">Total do mês</p>
              <p className="text-2xl font-bold font-mono text-stone-800 dark:text-white">
                {formatBRL(totalSpent)} <span className="text-sm text-stone-400 font-normal">de {formatBRL(totalBudget)}</span>
              </p>
            </div>
            <div className={`text-lg font-bold font-mono ${
              totalPercentage >= 100 ? 'text-red-500' :
              totalPercentage >= 80 ? 'text-amber-500' :
              'text-emerald-600'
            }`}>
              {Math.round(totalPercentage)}%
            </div>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${
                totalPercentage >= 100 ? 'bg-red-500' :
                totalPercentage >= 80 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(totalPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Category budgets */}
        {budgets.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nenhum orçamento definido"
            description="Defina limites de gastos por categoria para controlar seu orçamento."
          />
        ) : (
          <div className="space-y-3">
            {budgets.map((budget) => (
              <div key={budget.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-stone-800 dark:text-white">
                    {/* Category name would come from a join — showing ID for now */}
                    Categoria #{budget.categoryId}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      budget.status === 'exceeded' ? 'badge-danger' :
                      budget.status === 'warning' ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {budget.status === 'exceeded' ? 'Estourou' :
                       budget.status === 'warning' ? 'Atenção' : 'OK'}
                    </span>
                    <span className="text-sm font-mono text-stone-500">
                      {formatBRL(budget.spent)} / {formatBRL(budget.amount)}
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${
                      budget.status === 'exceeded' ? 'bg-red-500' :
                      budget.status === 'warning' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-stone-400">
                    {budget.percentage}% usado
                  </span>
                  <span className="text-xs text-stone-400">
                    Restam {formatBRL(Math.max(budget.remaining, 0))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
