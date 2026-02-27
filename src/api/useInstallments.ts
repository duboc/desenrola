import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { InstallmentPlan } from '@/types/models'

export function useInstallments() {
  return useQuery<InstallmentPlan[]>({
    queryKey: ['installments'],
    queryFn: () => window.api.installments.getAll(),
  })
}

export function useMonthlyCommitment() {
  return useQuery({
    queryKey: ['installments', 'commitment'],
    queryFn: () => window.api.installments.getMonthlyCommitment(),
  })
}

export function useCreateInstallment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<InstallmentPlan>) => window.api.installments.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['installments'] }),
  })
}

export function useSimulateInstallment() {
  return useMutation({
    mutationFn: ({ total, installments, interestRate }: {
      total: number
      installments: number
      interestRate: number
    }) => window.api.installments.simulate(total, installments, interestRate),
  })
}
