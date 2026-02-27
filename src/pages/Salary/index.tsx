import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { formatBRL, formatPercent } from '@/lib/formatters'
import { messages } from '@/lib/messages'
import { EMPLOYMENT_TYPE_LABELS } from '@/types/enums'
import { Briefcase, Calculator } from 'lucide-react'

interface SalaryBreakdown {
  grossSalary: number
  inss: { value: number; effectiveRate: number; isAboveCeiling: boolean }
  irrf: { value: number; effectiveRate: number; nominalRate: number; baseCalculo: number; isExempt: boolean }
  fgts: { value: number; note: string }
  netSalary: number
  dependents: number
}

export default function SalaryPage() {
  const [gross, setGross] = useState('')
  const [dependents, setDependents] = useState(0)
  const [breakdown, setBreakdown] = useState<SalaryBreakdown | null>(null)
  const [decimoTerceiro, setDecimoTerceiro] = useState<any[]>([])

  const handleCalculate = async () => {
    const value = parseFloat(gross.replace(',', '.'))
    if (!value) return

    const result = await window.api.salary.calculateNet(value, dependents)
    setBreakdown(result as SalaryBreakdown)
  }

  useEffect(() => {
    window.api.salary.calculate13().then((data) => setDecimoTerceiro(data as any[]))
  }, [])

  return (
    <div>
      <Header title={messages.salary.title} showMonthNav={false} />

      <div className="p-6 space-y-6">
        {/* Calculator */}
        <div className="card">
          <h2 className="text-base font-bold text-stone-800 dark:text-white flex items-center gap-2 mb-4">
            <Calculator size={18} />
            Calculadora de Salário Líquido (CLT)
          </h2>

          <div className="flex items-end gap-3 mb-6">
            <div className="flex-1">
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                Salário Bruto
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="5.000,00"
                  value={gross}
                  onChange={(e) => setGross(e.target.value)}
                  className="currency-input pl-10"
                />
              </div>
            </div>
            <div className="w-32">
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                Dependentes
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={dependents}
                onChange={(e) => setDependents(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <button onClick={handleCalculate} className="btn-primary">
              Calcular
            </button>
          </div>

          {breakdown && (
            <div className="space-y-4">
              {/* Breakdown table */}
              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-stone-600 dark:text-stone-300">Salário Bruto</span>
                  <span className="text-sm font-semibold font-mono text-stone-800 dark:text-white">
                    {formatBRL(breakdown.grossSalary)}
                  </span>
                </div>

                <div className="border-t border-stone-200 dark:border-stone-700" />

                <div className="flex justify-between items-center py-1.5">
                  <div>
                    <span className="text-sm text-red-500">(-) INSS</span>
                    <span className="text-xs text-stone-400 ml-2">
                      ({formatPercent(breakdown.inss.effectiveRate)} efetiva)
                    </span>
                  </div>
                  <span className="text-sm font-semibold font-mono text-red-500">
                    - {formatBRL(breakdown.inss.value)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5">
                  <div>
                    <span className="text-sm text-red-500">(-) IRRF</span>
                    <span className="text-xs text-stone-400 ml-2">
                      {breakdown.irrf.isExempt
                        ? '(Isento)'
                        : `(${breakdown.irrf.nominalRate}% nominal)`}
                    </span>
                  </div>
                  <span className="text-sm font-semibold font-mono text-red-500">
                    {breakdown.irrf.isExempt ? 'Isento' : `- ${formatBRL(breakdown.irrf.value)}`}
                  </span>
                </div>

                <div className="border-t-2 border-emerald-200 dark:border-emerald-800" />

                <div className="flex justify-between items-center py-1.5">
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                    Salário Líquido
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {formatBRL(breakdown.netSalary)}
                  </span>
                </div>

                <div className="border-t border-stone-200 dark:border-stone-700" />

                <div className="flex justify-between items-center py-1.5">
                  <div>
                    <span className="text-sm text-stone-400">FGTS (pago pelo empregador)</span>
                  </div>
                  <span className="text-sm font-mono text-stone-400">
                    {formatBRL(breakdown.fgts.value)}
                  </span>
                </div>
              </div>

              {/* Base de cálculo IRRF */}
              <div className="text-xs text-stone-400 text-center">
                Base de cálculo IRRF: {formatBRL(breakdown.irrf.baseCalculo)}
                {breakdown.dependents > 0 && (
                  <> · {breakdown.dependents} dependente(s)</>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 13º Salário */}
        {decimoTerceiro.length > 0 && (
          <div className="card">
            <h2 className="text-base font-bold text-stone-800 dark:text-white mb-4">
              {messages.salary.decimoTerceiro}
            </h2>
            {decimoTerceiro.map((calc: any, i: number) => (
              <div key={i} className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-stone-400">1ª Parcela (Novembro)</p>
                    <p className="text-lg font-bold font-mono text-stone-800 dark:text-white">
                      {formatBRL(calc.firstInstallment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">2ª Parcela (Dezembro)</p>
                    <p className="text-lg font-bold font-mono text-stone-800 dark:text-white">
                      {formatBRL(calc.secondInstallment)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                  <div className="flex justify-between">
                    <span className="text-sm text-stone-500">Total líquido 13º</span>
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      {formatBRL(calc.totalNet)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
