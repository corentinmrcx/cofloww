import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { Transaction } from '../types/transaction.types'

export interface CreateTransactionPayload {
  wallet_id: string
  to_wallet_id?: string | null
  category_id?: string | null
  tag_ids?: string[]
  label: string
  notes?: string | null
  amount: number
  type: string
  date: string
  value_date?: string | null
  status?: string
}

export const useCreateTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      api.post<{ data: Transaction }>('/api/v1/transactions', payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    },
  })
}
