import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useFilterStore } from '@/stores/filterStore'
import { formatMonthYear } from '@/lib/formatters'

interface HeaderProps {
  title: string
  subtitle?: string
  showMonthNav?: boolean
}

export function Header({ title, subtitle, showMonthNav = true }: HeaderProps) {
  const { openQuickAdd } = useAppStore()
  const { currentMonth, nextMonth, prevMonth } = useFilterStore()

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-800 dark:text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-stone-500 dark:text-stone-400">{subtitle}</p>
          )}
        </div>

        {showMonthNav && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft size={18} className="text-stone-500" />
            </button>
            <span className="text-sm font-semibold text-stone-700 dark:text-stone-300 min-w-[140px] text-center capitalize">
              {formatMonthYear(currentMonth)}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Próximo mês"
            >
              <ChevronRight size={18} className="text-stone-500" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Buscar (Ctrl+F)"
        >
          <Search size={18} className="text-stone-500" />
        </button>

        <button
          onClick={openQuickAdd}
          className="btn-primary flex items-center gap-2"
          title="Nova transação (Ctrl+N)"
        >
          <Plus size={16} />
          <span>Adicionar</span>
        </button>
      </div>
    </header>
  )
}
