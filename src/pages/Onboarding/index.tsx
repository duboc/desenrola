import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import { messages } from '@/lib/messages'
import { EMPLOYMENT_TYPE_LABELS } from '@/types/enums'
import { SP_UTILITIES, INSTITUTIONS } from '@/lib/constants'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const STEPS = [
  { id: 'welcome', title: messages.onboarding.welcome },
  { id: 'salary', title: messages.onboarding.stepSalary },
  { id: 'accounts', title: messages.onboarding.stepAccounts },
  { id: 'bills', title: messages.onboarding.stepBills },
  { id: 'done', title: messages.onboarding.done },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [employmentType, setEmploymentType] = useState('')
  const [grossSalary, setGrossSalary] = useState('')
  const [selectedBanks, setSelectedBanks] = useState<string[]>([])
  const [selectedUtilities, setSelectedUtilities] = useState<string[]>([])
  const { setOnboardingCompleted } = useAppStore()
  const navigate = useNavigate()

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  const handleFinish = async () => {
    // Save onboarding data
    if (employmentType && grossSalary) {
      await window.api.salary.saveConfig({
        employmentType,
        grossSalary: parseFloat(grossSalary.replace(',', '.')),
      })
    }

    // Create accounts for selected banks
    for (const bank of selectedBanks) {
      const inst = INSTITUTIONS.find(i => i.name === bank)
      await window.api.accounts.create({
        name: `${bank} Conta`,
        type: 'checking',
        institution: bank,
        balance: 0,
        color: inst?.color,
        icon: inst?.icon,
      })
    }

    await window.api.system.setSetting('onboarding_completed', true)
    setOnboardingCompleted(true)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === step ? 'bg-emerald-500 w-6' :
                i < step ? 'bg-emerald-300' : 'bg-stone-300 dark:bg-stone-600'
              }`}
            />
          ))}
        </div>

        <div className="card shadow-lg">
          {/* Welcome */}
          {step === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">&#127744;</div>
              <h1 className="text-2xl font-extrabold text-stone-800 dark:text-white mb-2">
                {messages.onboarding.welcome}
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mb-8">
                {messages.onboarding.subtitle}
              </p>
              <button onClick={nextStep} className="btn-primary text-base px-8 py-3">
                Bora! <ChevronRight size={18} className="inline ml-1" />
              </button>
            </div>
          )}

          {/* Salary */}
          {step === 1 && (
            <div className="py-4">
              <h2 className="text-lg font-bold text-stone-800 dark:text-white mb-1">
                {messages.onboarding.stepSalary}
              </h2>
              <p className="text-sm text-stone-500 mb-6">
                Não precisa ser exato — pode ajustar depois.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-2 block">
                    Regime de trabalho
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setEmploymentType(value)}
                        className={`p-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                          employmentType === value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-stone-200 text-stone-500 hover:border-stone-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">
                    Salário bruto mensal
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="5.000,00"
                      value={grossSalary}
                      onChange={(e) => setGrossSalary(e.target.value)}
                      className="currency-input pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Accounts */}
          {step === 2 && (
            <div className="py-4">
              <h2 className="text-lg font-bold text-stone-800 dark:text-white mb-1">
                {messages.onboarding.stepAccounts}
              </h2>
              <p className="text-sm text-stone-500 mb-6">
                Selecione os bancos que você usa.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {INSTITUTIONS.slice(0, 12).map((bank) => {
                  const selected = selectedBanks.includes(bank.name)
                  return (
                    <button
                      key={bank.name}
                      onClick={() => {
                        setSelectedBanks(prev =>
                          selected ? prev.filter(b => b !== bank.name) : [...prev, bank.name]
                        )
                      }}
                      className={`p-3 rounded-xl text-center border-2 transition-all ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-xl">{bank.icon}</span>
                      <p className="text-xs font-medium text-stone-700 mt-1 truncate">
                        {bank.name}
                      </p>
                      {selected && (
                        <Check size={14} className="text-emerald-500 mx-auto mt-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bills */}
          {step === 3 && (
            <div className="py-4">
              <h2 className="text-lg font-bold text-stone-800 dark:text-white mb-1">
                {messages.onboarding.stepBills}
              </h2>
              <p className="text-sm text-stone-500 mb-6">
                Serviços de SP já vêm pré-cadastrados.
              </p>

              <div className="space-y-2">
                {SP_UTILITIES.map((util) => {
                  const selected = selectedUtilities.includes(util.name)
                  return (
                    <button
                      key={util.name}
                      onClick={() => {
                        setSelectedUtilities(prev =>
                          selected ? prev.filter(u => u !== util.name) : [...prev, util.name]
                        )
                      }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-2xl">{util.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-stone-700">{util.name}</p>
                        <p className="text-xs text-stone-400">{util.type}</p>
                      </div>
                      {selected && <Check size={18} className="text-emerald-500" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Done */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h1 className="text-2xl font-extrabold text-stone-800 dark:text-white mb-2">
                {messages.onboarding.done}
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mb-8">
                Tudo configurado. Agora é só usar!
              </p>
              <button onClick={handleFinish} className="btn-primary text-base px-8 py-3">
                Começar
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          {step > 0 && step < 4 && (
            <div className="flex justify-between mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
              <button onClick={prevStep} className="btn-secondary flex items-center gap-1">
                <ChevronLeft size={16} /> Voltar
              </button>
              <button onClick={nextStep} className="btn-primary flex items-center gap-1">
                Próximo <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
