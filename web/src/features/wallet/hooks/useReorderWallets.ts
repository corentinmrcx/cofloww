import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { ReorderPayload } from '../types/wallet.types'

export const useReorderWallets = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (wallets: ReorderPayload[]) =>
      api.post('/api/v1/wallets/reorder', { wallets }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wallets'] }),
  })
}
