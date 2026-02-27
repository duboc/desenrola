/**
 * Brazilian Real (BRL) formatting utilities
 */

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const BRL_COMPACT_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

/**
 * Format number as BRL currency: R$ 1.234,56
 */
export function formatBRL(value: number): string {
  return BRL_FORMATTER.format(value)
}

/**
 * Format as compact BRL: R$ 1,2 mil, R$ 15 mil
 */
export function formatBRLCompact(value: number): string {
  return BRL_COMPACT_FORMATTER.format(value)
}

/**
 * Format number without currency symbol: 1.234,56
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format percentage: 12,5%
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Parse BRL string back to number: "R$ 1.234,56" → 1234.56
 */
export function parseBRL(value: string): number {
  const cleaned = value
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return parseFloat(cleaned) || 0
}

/**
 * Calculate late fee for overdue boletos
 * Standard: 2% multa + 0.033%/day juros mora
 */
export function calculateLateFee(
  amount: number,
  daysLate: number,
  feePercent: number = 2,
  dailyInterest: number = 0.033
): {
  multa: number
  jurosMora: number
  total: number
  totalWithFees: number
} {
  if (daysLate <= 0) {
    return { multa: 0, jurosMora: 0, total: 0, totalWithFees: amount }
  }

  const multa = amount * (feePercent / 100)
  const jurosMora = amount * (dailyInterest / 100) * daysLate
  const total = multa + jurosMora

  return {
    multa: Math.round(multa * 100) / 100,
    jurosMora: Math.round(jurosMora * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalWithFees: Math.round((amount + total) * 100) / 100,
  }
}
