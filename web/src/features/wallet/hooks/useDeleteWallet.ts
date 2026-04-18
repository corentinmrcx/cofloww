import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'

export const useDeleteWallet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/wallets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
