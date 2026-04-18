import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Wallet } from '../../wallet/types/wallet.types'

export const useSetInvestmentPct = (walletId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pct: number | null) =>
      api
        .patch<{ data: Wallet }>(`/api/v1/wallets/${walletId}`, { investment_target_pct: pct })
        .then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['investment-compute'] })
    },
  })
}
