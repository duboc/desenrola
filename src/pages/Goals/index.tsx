import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { formatBRL, formatDate } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import { GOAL_TYPE_LABELS } from '@/types/enums'
import type { Goal } from '@/types/models'
import { Plus, Target } from 'lucide-react'

const GOAL_ICONS: Record<string, string> = {
  emergency_fund: '🛡️',
  travel: '✈️',
  apartment: '🏠',
  car: '🚗',
  education: '🎓',
  wedding: '💍',
  retirement: '🏖️',
  custom: '🎯',
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.goals.getAll().then((data: Goal[]) => {
      setGoals(data)
      setLoading(false)
    })
  }, [])

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div>
      <Header title={messages.goals.title} showMonthNav={false} />

      <div className="p-6 space-y-6">
        {goals.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="Nenhuma meta definida"
            description={messages.goals.empty}
          />
        ) : (
          <>
            {/* Active goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => {
                const percentage = goal.targetAmount > 0
                  ? (goal.currentAmount / goal.targetAmount) * 100
                  : 0

                return (
                  <div key={goal.id} className="card">
                    <div className="flex items-start gap-4">
                      <ProgressRing
                        percentage={percentage}
                        size={80}
                        strokeWidth={6}
                        color={goal.color || undefined}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {goal.icon || GOAL_ICONS[goal.type || 'custom'] || '🎯'}
                          </span>
                          <h3 className="text-sm font-bold text-stone-800 dark:text-white">
                            {goal.name}
                          </h3>
                        </div>
                        {goal.type && (
                          <span className="badge badge-info text-[10px] mt-1">
                            {GOAL_TYPE_LABELS[goal.type]}
                          </span>
                        )}
                        <div className="mt-2">
                          <p className="text-sm font-mono">
                            <span className="font-bold text-emerald-600">
                              {formatBRL(goal.currentAmount)}
                            </span>
                            <span className="text-stone-400"> de {formatBRL(goal.targetAmount)}</span>
                          </p>
                          {goal.monthlyContribution && (
                            <p className="text-xs text-stone-400 mt-0.5">
                              Aporte mensal: {formatBRL(goal.monthlyContribution)}
                            </p>
                          )}
                          {goal.targetDate && (
                            <p className="text-xs text-stone-400">
                              Meta: {formatDate(goal.targetDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Completed goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-stone-800 dark:text-white mb-3">
                  Metas alcançadas 🎉
                </h2>
                <div className="space-y-2">
                  {completedGoals.map((goal) => (
                    <div key={goal.id} className="card flex items-center justify-between opacity-75">
                      <div className="flex items-center gap-2">
                        <span>{goal.icon || GOAL_ICONS[goal.type || 'custom']}</span>
                        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                          {goal.name}
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold text-emerald-600">
                        {formatBRL(goal.targetAmount)} ✓
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
