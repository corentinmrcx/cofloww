import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Transaction } from '../types/transaction.types'
import type { CreateTransactionPayload } from './useCreateTransaction'

export const useUpdateTransaction = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<CreateTransactionPayload>) =>
      api.put<{ data: Transaction }>(`/api/v1/transactions/${id}`, payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}
