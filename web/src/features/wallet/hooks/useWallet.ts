import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { Wallet } from '../types/wallet.types'

export const useWallet = (id: string) =>
  useQuery<Wallet>({
    queryKey: ['wallets', id],
    queryFn: () => api.get<{ data: Wallet }>(`/api/v1/wallets/${id}`).then(r => r.data.data),
    enabled: !!id,
  })
