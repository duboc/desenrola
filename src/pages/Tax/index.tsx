import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatBRL } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import { TAX_CATEGORY_LABELS } from '@/types/enums'
import { Landmark, AlertTriangle } from 'lucide-react'

interface TaxSummary {
  year: number
  byCategory: Array<{ category: string; total: number; count: number }>
  total: number
  warnings: Array<{ category: string; message: string }>
}

export default function TaxPage() {
  const [year] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState<TaxSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.tax.getSummary(year)
      .then((data: TaxSummary) => {
        setSummary(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [year])

  const TAX_CATEGORY_ICONS: Record<string, string> = {
    saude: '❤️',
    educacao: '📚',
    previdencia_privada: '🏦',
    pensao_alimenticia: '👨‍👧',
    dependente: '👶',
  }

  return (
    <div>
      <Header title={messages.tax.title} showMonthNav={false} />

      <div className="p-6 space-y-6">
        {/* Year summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Landmark size={18} className="text-emerald-600" />
              <h2 className="text-base font-bold text-stone-800 dark:text-white">
                IRPF {year} — Despesas Dedutíveis
              </h2>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-600">
              {formatBRL(summary?.total || 0)}
            </span>
          </div>

          {/* Warnings */}
          {summary?.warnings && summary.warnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {summary.warnings.map((warning, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">{warning.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Category breakdown */}
          {summary?.byCategory && summary.byCategory.length > 0 ? (
            <div className="space-y-3">
              {summary.byCategory.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {TAX_CATEGORY_ICONS[cat.category] || '📄'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                        {TAX_CATEGORY_LABELS[cat.category] || cat.category}
                      </p>
                      <p className="text-xs text-stone-400">
                        {cat.count} {cat.count === 1 ? 'registro' : 'registros'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold font-mono text-stone-800 dark:text-white">
                    {formatBRL(cat.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🏛️"
              title="Nenhum registro"
              description="Adicione suas despesas dedutíveis (saúde, educação) para acompanhar o IRPF."
            />
          )}
        </div>

        {/* Reminder */}
        <div className="card bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            💡 {messages.tax.reminder}
          </p>
        </div>
      </div>
    </div>
  )
}
