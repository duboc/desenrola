import { create } from 'zustand'
import { format, startOfMonth, endOfMonth } from 'date-fns'

interface FilterState {
  // Date range
  currentMonth: string // YYYY-MM
  startDate: string
  endDate: string

  // Account filter
  selectedAccountId: number | null

  // Actions
  setMonth: (month: string) => void
  nextMonth: () => void
  prevMonth: () => void
  setAccountFilter: (accountId: number | null) => void
}

const now = new Date()
const currentMonth = format(now, 'yyyy-MM')

export const useFilterStore = create<FilterState>((set) => ({
  currentMonth,
  startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
  endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
  selectedAccountId: null,

  setMonth: (month) => {
    const [year, m] = month.split('-').map(Number)
    const date = new Date(year, m - 1, 1)
    set({
      currentMonth: month,
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
    })
  },

  nextMonth: () => set((state) => {
    const [year, month] = state.currentMonth.split('-').map(Number)
    const date = new Date(year, month, 1) // month is already 0-indexed after +1
    const newMonth = format(date, 'yyyy-MM')
    return {
      currentMonth: newMonth,
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
    }
  }),

  prevMonth: () => set((state) => {
    const [year, month] = state.currentMonth.split('-').map(Number)
    const date = new Date(year, month - 2, 1)
    const newMonth = format(date, 'yyyy-MM')
    return {
      currentMonth: newMonth,
      startDate: format(startOfMonth(date), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(date), 'yyyy-MM-dd'),
    }
  }),

  setAccountFilter: (accountId) => set({ selectedAccountId: accountId }),
}))
