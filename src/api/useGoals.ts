import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Goal } from '@/types/models'

export function useGoals() {
  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: () => window.api.goals.getAll(),
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Goal>) => window.api.goals.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useAddContribution() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      window.api.goals.addContribution(id, amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  })
}
