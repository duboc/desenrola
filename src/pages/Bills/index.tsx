import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatBRL, formatDaysUntil } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import { FREQUENCY_LABELS } from '@/types/enums'
import type { RecurringBill } from '@/types/models'
import { Plus, Check, AlertTriangle, Clock } from 'lucide-react'

export default function BillsPage() {
  const [bills, setBills] = useState<RecurringBill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    window.api.bills.getAll().then((data: RecurringBill[]) => {
      setBills(data)
      setLoading(false)
    })
  }, [])

  const handleMarkPaid = async (bill: RecurringBill) => {
    const amount = bill.amount || bill.amountMin || 0
    const today = new Date().toISOString().split('T')[0]

    await window.api.bills.markPaid(bill.id, amount, today)
    // Could show a toast here
  }

  const today = new Date().getDate()

  const sortedBills = [...bills].sort((a, b) => {
    const aDaysUntil = a.dueDay >= today ? a.dueDay - today : (30 - today) + a.dueDay
    const bDaysUntil = b.dueDay >= today ? b.dueDay - today : (30 - today) + b.dueDay
    return aDaysUntil - bDaysUntil
  })

  const getUrgencyIcon = (dueDay: number) => {
    const daysUntil = dueDay >= today ? dueDay - today : (30 - today) + dueDay
    if (daysUntil <= 1) return <AlertTriangle size={16} className="text-red-500" />
    if (daysUntil <= 3) return <Clock size={16} className="text-amber-500" />
    return <Clock size={16} className="text-emerald-500" />
  }

  return (
    <div>
      <Header title={messages.bills.title} />

      <div className="p-6">
        {bills.length === 0 ? (
          <EmptyState
            icon="📅"
            title="Nenhuma conta cadastrada"
            description={messages.bills.noBills}
            action={{ label: 'Adicionar conta', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="space-y-4">
            {/* Calendar-style bill list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedBills.map((bill) => {
                const daysUntil = bill.dueDay >= today
                  ? bill.dueDay - today
                  : (30 - today) + bill.dueDay

                return (
                  <div key={bill.id} className="card flex items-start gap-4">
                    {/* Day indicator */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white shrink-0 ${
                      daysUntil <= 1 ? 'bg-red-500' :
                      daysUntil <= 3 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}>
                      <span className="text-lg font-bold leading-none">{bill.dueDay}</span>
                      <span className="text-[9px] font-medium uppercase">dia</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-stone-800 dark:text-white truncate">
                          {bill.name}
                        </h3>
                        {bill.autoPay && (
                          <span className="badge badge-info text-[10px]">Auto</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold font-mono text-stone-700 dark:text-stone-300">
                          {bill.amount
                            ? formatBRL(bill.amount)
                            : `${formatBRL(bill.amountMin || 0)} ~ ${formatBRL(bill.amountMax || 0)}`
                          }
                        </span>
                        <span className="text-xs text-stone-400">
                          · {FREQUENCY_LABELS[bill.frequency] || bill.frequency}
                        </span>
                      </div>

                      <p className="text-xs text-stone-400 mt-1">
                        {formatDaysUntil(bill.dueDay)}
                        {bill.provider && ` · ${bill.provider}`}
                      </p>
                    </div>

                    <button
                      onClick={() => handleMarkPaid(bill)}
                      className="btn-ghost text-xs py-1.5 px-3 shrink-0"
                    >
                      <Check size={14} className="mr-1 inline" />
                      Pagar
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
