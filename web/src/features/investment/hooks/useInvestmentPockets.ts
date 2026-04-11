import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { InvestmentPocket } from '../types/investment-pocket.types'

export const useInvestmentPockets = () =>
  useQuery<InvestmentPocket[]>({
    queryKey: ['investment-pockets'],
    queryFn: () =>
      api
        .get<{ data: InvestmentPocket[] }>('/api/v1/investment-pockets')
        .then(r => r.data.data),
  })
