import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { CreateWalletPayload, Wallet } from '../types/wallet.types'

export const useCreateWallet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWalletPayload) =>
      api.post<{ data: Wallet }>('/api/v1/wallets', payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
