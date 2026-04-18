import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { OverviewData } from '../types/stats.types'

export const useOverview = () =>
  useQuery<OverviewData>({
    queryKey: ['stats-overview'],
    queryFn: () =>
      api
        .get<{ data: OverviewData }>('/api/v1/stats/overview')
        .then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
