import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { TrendArrow } from '@/components/shared/TrendArrow'
import { ProgressRing } from '@/components/shared/ProgressRing'
import { useFilterStore } from '@/stores/filterStore'
import { formatBRL, formatDateShort, formatDaysUntil } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import type { DashboardData, RecurringBill } from '@/types/models'
import { PAYMENT_METHOD_LABELS } from '@/types/enums'

function StatCard({ title, value, trend, trendUp, invertColors }: {
  title: string
  value: string
  trend?: number
  trendUp?: boolean
  invertColors?: boolean
}) {
  return (
    <div className="card">
      <p className="overline">{title}</p>
      <p className="text-2xl font-bold text-stone-800 dark:text-white mt-1 font-mono">
        {value}
      </p>
      {trend !== undefined && (
        <div className="mt-1">
          <TrendArrow value={trend} invertColors={invertColors} />
          <span className="text-xs text-stone-400 ml-1.5">vs mês passado</span>
        </div>
      )}
    </div>
  )
}

function BillItem({ bill }: { bill: RecurringBill }) {
  const today = new Date().getDate()
  const daysUntil = bill.dueDay >= today
    ? bill.dueDay - today
    : (30 - today) + bill.dueDay
  const urgency = daysUntil <= 1 ? 'bg-red-500' : daysUntil <= 3 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-stone-100 dark:border-stone-700 last:border-0">
      <div className={`w-2 h-2 rounded-full ${urgency}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
          {bill.name}
        </p>
        <p className="text-xs text-stone-400">
          {formatDaysUntil(bill.dueDay)}
        </p>
      </div>
      <span className="text-sm font-semibold font-mono text-stone-700 dark:text-stone-300">
        {bill.amount ? formatBRL(bill.amount) : '~' + formatBRL(bill.amountMin || 0)}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { currentMonth } = useFilterStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    window.api.system.getDashboardData(currentMonth).then((result: DashboardData) => {
      setData(result)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [currentMonth])

  return (
    <div>
      <Header title={messages.dashboard.greeting()} subtitle={messages.dashboard.monthSummary} />

      <div className="p-6 space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title={messages.dashboard.income}
            value={formatBRL(data?.income || 0)}
            trend={12}
            trendUp={true}
          />
          <StatCard
            title={messages.dashboard.expenses}
            value={formatBRL(data?.expenses || 0)}
            trend={-8}
            invertColors={true}
          />
          <StatCard
            title={messages.dashboard.balance}
            value={formatBRL(data?.balance || 0)}
            trend={data?.balance && data.balance > 0 ? 5 : -5}
            trendUp={data?.balance ? data.balance > 0 : false}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming bills */}
          <div className="card lg:col-span-2">
            <h2 className="text-base font-bold text-stone-800 dark:text-white mb-3">
              {messages.dashboard.upcomingBills}
            </h2>
            {data?.upcomingBills && data.upcomingBills.length > 0 ? (
              <div>
                {data.upcomingBills
                  .sort((a, b) => a.dueDay - b.dueDay)
                  .slice(0, 6)
                  .map((bill) => (
                    <BillItem key={bill.id} bill={bill} />
                  ))}
              </div>
            ) : (
              <p className="text-sm text-stone-400 py-4 text-center">
                {messages.dashboard.noBills}
              </p>
            )}
          </div>

          {/* Parcelas gauge */}
          <div className="card flex flex-col items-center justify-center">
            <h2 className="text-base font-bold text-stone-800 dark:text-white mb-4">
              {messages.dashboard.parcelas}
            </h2>
            <ProgressRing
              percentage={data?.installments ? Math.min((data.installments.monthlyTotal / (data.income || 1)) * 100, 100) : 0}
              label={formatBRL(data?.installments?.monthlyTotal || 0)}
              sublabel={`${data?.installments?.count || 0} parcelas ativas`}
            />
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card">
          <h2 className="text-base font-bold text-stone-800 dark:text-white mb-3">
            Transações recentes
          </h2>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="divide-y divide-stone-100 dark:divide-stone-700">
              {data.recentTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {txn.description || 'Sem descrição'}
                    </p>
                    <p className="text-xs text-stone-400">
                      {formatDateShort(txn.date)}
                      {txn.paymentMethod && ` · ${PAYMENT_METHOD_LABELS[txn.paymentMethod] || txn.paymentMethod}`}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold font-mono ${
                    txn.amount >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {txn.amount >= 0 ? '+' : ''}{formatBRL(txn.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400 py-4 text-center">
              {messages.transactions.empty}
            </p>
          )}
        </div>

        {/* Accounts overview */}
        {data?.accounts && data.accounts.length > 0 && (
          <div className="card">
            <h2 className="text-base font-bold text-stone-800 dark:text-white mb-3">
              Contas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-3 rounded-xl border border-stone-100 dark:border-stone-700"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color || '#22C55E' }}
                    />
                    <p className="text-xs font-medium text-stone-500 dark:text-stone-400 truncate">
                      {account.name}
                    </p>
                  </div>
                  <p className="text-sm font-bold font-mono text-stone-800 dark:text-white">
                    {formatBRL(account.balance || 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
