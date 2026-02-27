import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Account } from '@/types/models'

export function useAccounts() {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => window.api.accounts.getAll(),
  })
}

export function useAccount(id: number) {
  return useQuery<Account>({
    queryKey: ['accounts', id],
    queryFn: () => window.api.accounts.getById(id),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Account>) => window.api.accounts.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Account> }) =>
      window.api.accounts.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => window.api.accounts.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounts'] }),
  })
}
