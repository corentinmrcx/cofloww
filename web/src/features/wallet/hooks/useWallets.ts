import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { Wallet } from '../types/wallet.types'

export const useWallets = () =>
  useQuery<Wallet[]>({
    queryKey: ['wallets'],
    queryFn: () => api.get<{ data: Wallet[] }>('/api/v1/wallets').then(r => r.data.data),
  })
