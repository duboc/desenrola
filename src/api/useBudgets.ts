import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Budget, BudgetWithStatus } from '@/types/models'

export function useBudgets(month: string) {
  return useQuery<Budget[]>({
    queryKey: ['budgets', month],
    queryFn: () => window.api.budgets.getAll(month),
  })
}

export function useBudgetOverview(month: string) {
  return useQuery<BudgetWithStatus[]>({
    queryKey: ['budgets', 'overview', month],
    queryFn: () => window.api.budgets.getOverview(month),
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Budget>) => window.api.budgets.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.budgets.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
