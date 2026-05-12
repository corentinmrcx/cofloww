import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'

interface AdjustWalletPayload {
  target_balance: number
}

const useAdjustWallet = (walletId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AdjustWalletPayload) =>
      api.post(`/api/v1/wallets/${walletId}/adjust`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export { useAdjustWallet }
