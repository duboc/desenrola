import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaxEntry } from '@/types/models'

export function useTaxDeductibles(year: number) {
  return useQuery<TaxEntry[]>({
    queryKey: ['tax', 'deductibles', year],
    queryFn: () => window.api.tax.getDeductibles(year),
  })
}

export function useTaxSummary(year: number) {
  return useQuery({
    queryKey: ['tax', 'summary', year],
    queryFn: () => window.api.tax.getSummary(year),
  })
}

export function useAddDeductible() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TaxEntry>) => window.api.tax.addDeductible(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax'] }),
  })
}
