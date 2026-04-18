import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { ComputeInvestmentParams, ComputeInvestmentResult } from '../types/investment.types'

export const useComputeInvestment = (params: ComputeInvestmentParams) =>
  useQuery<ComputeInvestmentResult>({
    queryKey: ['investment-compute', params],
    queryFn: () =>
      api
        .get<{ data: ComputeInvestmentResult }>('/api/v1/investments/compute', { params })
        .then(r => r.data.data),
    enabled: !!params.wallet_id,
    staleTime: 0,
  })
