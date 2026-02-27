import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Transaction } from '@/types/models'

export function useTransactions(filters?: any) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', filters],
    queryFn: () => window.api.transactions.getAll(filters),
  })
}

export function useTransactionsByDateRange(startDate: string, endDate: string) {
  return useQuery<Transaction[]>({
    queryKey: ['transactions', 'range', startDate, endDate],
    queryFn: () => window.api.transactions.getByDateRange(startDate, endDate),
  })
}

export function useTransactionSummary(month: string) {
  return useQuery({
    queryKey: ['transactions', 'summary', month],
    queryFn: () => window.api.transactions.getSummary(month),
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => window.api.transactions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.transactions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
