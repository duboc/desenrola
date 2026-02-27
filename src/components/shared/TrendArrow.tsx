import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendArrowProps {
  value: number
  suffix?: string
  invertColors?: boolean // For expenses, going down is good
}

export function TrendArrow({ value, suffix = '%', invertColors = false }: TrendArrowProps) {
  const isPositive = value > 0
  const isZero = value === 0

  const colorClass = isZero
    ? 'text-stone-400'
    : (isPositive !== invertColors)
      ? 'text-emerald-600'
      : 'text-red-500'

  const Icon = isZero ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${colorClass}`}>
      <Icon size={14} />
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  )
}
