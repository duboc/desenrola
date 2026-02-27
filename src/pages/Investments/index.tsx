import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/shared/EmptyState'

export default function InvestmentsPage() {
  return (
    <div>
      <Header title="Investimentos" showMonthNav={false} />

      <div className="p-6">
        <EmptyState
          icon="📈"
          title="Em breve!"
          description="O módulo de investimentos está em desenvolvimento. Em breve você poderá acompanhar Tesouro Direto, CDB, ações e mais."
        />

        {/* Selic/CDI placeholder */}
        <div className="card mt-6">
          <h2 className="text-base font-bold text-stone-800 dark:text-white mb-3">
            Taxas de referência
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
              <p className="overline">Selic</p>
              <p className="text-xl font-bold font-mono text-stone-800 dark:text-white mt-1">
                13,25%
              </p>
              <p className="text-xs text-stone-400">a.a.</p>
            </div>
            <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
              <p className="overline">CDI</p>
              <p className="text-xl font-bold font-mono text-stone-800 dark:text-white mt-1">
                13,15%
              </p>
              <p className="text-xs text-stone-400">a.a.</p>
            </div>
            <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
              <p className="overline">IPCA</p>
              <p className="text-xl font-bold font-mono text-stone-800 dark:text-white mt-1">
                4,50%
              </p>
              <p className="text-xs text-stone-400">12 meses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
