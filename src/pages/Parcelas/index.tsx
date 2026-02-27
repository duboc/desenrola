import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { formatBRL, formatInstallment, formatDate } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import type { InstallmentPlan } from '@/types/models'
import { Plus, Calculator, CreditCard } from 'lucide-react'

export default function ParcelasPage() {
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [commitment, setCommitment] = useState<{
    totalMonthly: number
    activeCount: number
    monthlyBreakdown: Record<string, number>
  } | null>(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [simTotal, setSimTotal] = useState('')
  const [simInstallments, setSimInstallments] = useState('12')
  const [simResult, setSimResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      window.api.installments.getAll(),
      window.api.installments.getMonthlyCommitment(),
    ]).then(([plansData, commitmentData]) => {
      setPlans(plansData as InstallmentPlan[])
      setCommitment(commitmentData as any)
      setLoading(false)
    })
  }, [])

  const activePlans = plans.filter(p => p.status === 'active')

  const handleSimulate = async () => {
    const total = parseFloat(simTotal.replace(',', '.'))
    if (!total || !simInstallments) return

    const result = await window.api.installments.simulate(total, parseInt(simInstallments), 0)
    setSimResult(result)
  }

  return (
    <div>
      <Header title={messages.parcelas.title} />

      <div className="p-6 space-y-6">
        {/* Commitment overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <ProgressRing
              percentage={commitment ? Math.min((commitment.totalMonthly / 5000) * 100, 100) : 0}
              size={80}
              strokeWidth={6}
            />
            <div>
              <p className="overline">Comprometimento Mensal</p>
              <p className="text-xl font-bold font-mono text-stone-800 dark:text-white">
                {formatBRL(commitment?.totalMonthly || 0)}
              </p>
              <p className="text-xs text-stone-400">
                {commitment?.activeCount || 0} parcelas ativas
              </p>
            </div>
          </div>

          <div className="card col-span-2">
            <p className="overline mb-3">Projeção 12 meses</p>
            {commitment?.monthlyBreakdown && (
              <div className="flex items-end gap-1 h-16">
                {Object.entries(commitment.monthlyBreakdown).map(([month, amount]) => {
                  const maxAmount = Math.max(...Object.values(commitment.monthlyBreakdown), 1)
                  const height = (amount / maxAmount) * 100

                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-emerald-400 rounded-t"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${month}: ${formatBRL(amount)}`}
                      />
                      <span className="text-[8px] text-stone-400">
                        {month.split('-')[1]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Simulator */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-stone-800 dark:text-white flex items-center gap-2">
              <Calculator size={18} />
              {messages.parcelas.simulatorTitle}
            </h2>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-stone-500 mb-1 block">Valor total</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={simTotal}
                  onChange={(e) => setSimTotal(e.target.value)}
                  className="currency-input pl-10"
                />
              </div>
            </div>
            <div className="w-32">
              <label className="text-xs font-medium text-stone-500 mb-1 block">Parcelas</label>
              <select
                value={simInstallments}
                onChange={(e) => setSimInstallments(e.target.value)}
                className="input"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 36, 48].map(n => (
                  <option key={n} value={n}>{n}x</option>
                ))}
              </select>
            </div>
            <button onClick={handleSimulate} className="btn-primary">
              Simular
            </button>
          </div>

          {simResult && (
            <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-xl">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-stone-400">Parcela mensal</p>
                  <p className="text-lg font-bold font-mono text-emerald-600">
                    {formatBRL(simResult.installmentAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Total</p>
                  <p className="text-lg font-bold font-mono text-stone-800 dark:text-white">
                    {formatBRL(simResult.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-stone-400">Juros total</p>
                  <p className="text-lg font-bold font-mono text-stone-800 dark:text-white">
                    {formatBRL(simResult.totalInterest)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active plans */}
        {activePlans.length === 0 ? (
          <EmptyState
            icon="🔄"
            title="Nenhuma parcela ativa"
            description={messages.parcelas.empty}
          />
        ) : (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-stone-800 dark:text-white">
              Parcelas ativas
            </h2>
            {activePlans.map((plan) => {
              const progress = (plan.paidInstallments / plan.totalInstallments) * 100
              const remaining = plan.totalInstallments - plan.paidInstallments

              return (
                <div key={plan.id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-stone-800 dark:text-white">
                        {plan.description}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {plan.store && `${plan.store} · `}
                        {formatInstallment(plan.paidInstallments, plan.totalInstallments)}
                        {' · '}Faltam {remaining} parcelas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-stone-800 dark:text-white">
                        {formatBRL(plan.installmentAmount)}/mês
                      </p>
                      <p className="text-xs text-stone-400">
                        Total: {formatBRL(plan.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill bg-emerald-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
