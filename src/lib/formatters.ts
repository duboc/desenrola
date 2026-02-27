import { format, formatDistanceToNow, parseISO, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Currency ───────────────────────────────────────────────────

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const brlCompactFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatBRL(value: number): string {
  return brlFormatter.format(value)
}

export function formatBRLCompact(value: number): string {
  return brlCompactFormatter.format(value)
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`
}

// ─── Dates ──────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM", { locale: ptBR })
}

export function formatDateLong(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatMonthYear(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1)
  return format(date, "MMMM 'de' yyyy", { locale: ptBR })
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) return 'Hoje'
  if (isYesterday(d)) return 'Ontem'

  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function formatDayOfWeek(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'EEEE', { locale: ptBR })
}

// ─── Misc ───────────────────────────────────────────────────────

export function formatInstallment(current: number, total: number): string {
  return `${current}/${total}x`
}

export function formatDaysUntil(dueDay: number): string {
  const today = new Date().getDate()
  const daysUntil = dueDay >= today ? dueDay - today : (30 - today) + dueDay

  if (daysUntil === 0) return 'Vence hoje!'
  if (daysUntil === 1) return 'Vence amanhã'
  if (daysUntil <= 3) return `Vence em ${daysUntil} dias`
  return `Dia ${dueDay}`
}
