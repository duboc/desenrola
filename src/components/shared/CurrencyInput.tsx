import { useState, useCallback } from 'react'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  disabled = false,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(
    value ? value.toFixed(2).replace('.', ',') : ''
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d,]/g, '')
    setDisplay(raw)

    const numericValue = parseFloat(raw.replace(',', '.'))
    if (!isNaN(numericValue)) {
      onChange(numericValue)
    }
  }, [onChange])

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-sm">
        R$
      </span>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        disabled={disabled}
        className={`currency-input pl-10 ${className}`}
      />
    </div>
  )
}
