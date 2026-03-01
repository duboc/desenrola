import { useState, useEffect } from 'react'
import { X, Building2 } from 'lucide-react'
import { useCreateAccount, useUpdateAccount } from '@/api/useAccounts'
import { ACCOUNT_TYPE_LABELS } from '@/types/enums'
import type { Account, AccountType } from '@/types/models'
import { INSTITUTIONS, ACCOUNT_COLORS } from '@/lib/constants'

interface AccountFormProps {
  account?: Account | null
  open: boolean
  onClose: () => void
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = Object.entries(ACCOUNT_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as AccountType, label })
)

export function AccountForm({ account, open, onClose }: AccountFormProps) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()

  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [institution, setInstitution] = useState('')
  const [balance, setBalance] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [billingDay, setBillingDay] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])

  useEffect(() => {
    if (account) {
      setName(account.name)
      setType(account.type)
      setInstitution(account.institution || '')
      setBalance(account.balance?.toString() || '0')
      setCreditLimit(account.creditLimit?.toString() || '')
      setBillingDay(account.billingDay?.toString() || '')
      setDueDay(account.dueDay?.toString() || '')
      setColor(account.color || ACCOUNT_COLORS[0])
    } else {
      setName('')
      setType('checking')
      setInstitution('')
      setBalance('')
      setCreditLimit('')
      setBillingDay('')
      setDueDay('')
      setColor(ACCOUNT_COLORS[0])
    }
  }, [account, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const data = {
      name: name.trim(),
      type,
      institution: institution || null,
      balance: parseFloat(balance) || 0,
      creditLimit: type === 'credit_card' ? (parseFloat(creditLimit) || null) : null,
      billingDay: type === 'credit_card' ? (parseInt(billingDay) || null) : null,
      dueDay: type === 'credit_card' ? (parseInt(dueDay) || null) : null,
      color,
    }

    if (account) {
      await updateAccount.mutateAsync({ id: account.id, data })
    } else {
      await createAccount.mutateAsync(data)
    }

    onClose()
  }

  const isCreditCard = type === 'credit_card'
  const isPending = createAccount.isPending || updateAccount.isPending

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="card w-full max-w-md shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-800 dark:text-white">
              {account ? 'Editar Conta' : 'Nova Conta'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">
              <X size={18} className="text-stone-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Nome da conta</label>
              <input
                type="text"
                placeholder="Ex: Nubank, Itaú Corrente..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                autoFocus
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="input"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Institution picker */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Instituição</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {INSTITUTIONS.slice(0, 8).map((inst) => (
                  <button
                    key={inst.name}
                    type="button"
                    onClick={() => {
                      setInstitution(inst.name)
                      if (!name) setName(inst.name)
                      setColor(inst.color)
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      institution === inst.name
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{inst.icon}</span> {inst.name}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Ou digite outra..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="input"
              />
            </div>

            {/* Balance */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">
                {isCreditCard ? 'Fatura atual' : 'Saldo atual'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="currency-input pl-10"
                />
              </div>
            </div>

            {/* Credit card fields */}
            {isCreditCard && (
              <div className="space-y-4 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Limite</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">R$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="5.000,00"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="currency-input pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Dia fechamento</label>
                    <input
                      type="number"
                      min={1} max={31}
                      placeholder="15"
                      value={billingDay}
                      onChange={(e) => setBillingDay(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Dia vencimento</label>
                    <input
                      type="number"
                      min={1} max={31}
                      placeholder="25"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Color */}
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {ACCOUNT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={isPending || !name.trim()}>
                {isPending ? 'Salvando...' : (account ? 'Salvar' : 'Criar conta')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
