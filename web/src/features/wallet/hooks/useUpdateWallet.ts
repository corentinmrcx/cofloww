import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { UpdateWalletPayload, Wallet } from '../types/wallet.types'

export const useUpdateWallet = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateWalletPayload) =>
      api.patch<{ data: Wallet }>(`/api/v1/wallets/${id}`, payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
