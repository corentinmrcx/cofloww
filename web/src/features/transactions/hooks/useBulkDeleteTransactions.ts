import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'

export const useBulkDeleteTransactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) =>
      api.post('/api/v1/transactions/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
