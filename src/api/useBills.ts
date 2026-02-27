import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { RecurringBill } from '@/types/models'

export function useBills() {
  return useQuery<RecurringBill[]>({
    queryKey: ['bills'],
    queryFn: () => window.api.bills.getAll(),
  })
}

export function useUpcomingBills(days: number = 7) {
  return useQuery<RecurringBill[]>({
    queryKey: ['bills', 'upcoming', days],
    queryFn: () => window.api.bills.getUpcoming(days),
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<RecurringBill>) => window.api.bills.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bills'] }),
  })
}

export function useMarkBillPaid() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount, date }: { id: number; amount: number; date: string }) =>
      window.api.bills.markPaid(id, amount, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
