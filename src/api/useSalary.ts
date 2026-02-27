import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SalaryConfig } from '@/types/models'

export function useSalaryConfig() {
  return useQuery<SalaryConfig[]>({
    queryKey: ['salary', 'config'],
    queryFn: () => window.api.salary.getConfig(),
  })
}

export function useSaveSalaryConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<SalaryConfig>) => window.api.salary.saveConfig(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['salary'] }),
  })
}

export function useCalculateNet() {
  return useMutation({
    mutationFn: ({ gross, dependents }: { gross: number; dependents?: number }) =>
      window.api.salary.calculateNet(gross, dependents),
  })
}

export function useCalculate13() {
  return useQuery({
    queryKey: ['salary', '13'],
    queryFn: () => window.api.salary.calculate13(),
  })
}
