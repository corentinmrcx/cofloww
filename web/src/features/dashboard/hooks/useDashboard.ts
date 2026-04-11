import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { DashboardData } from '../types/dashboard.types'

export const useDashboard = () =>
  useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () =>
      api
        .get<{ data: DashboardData }>('/api/v1/dashboard')
        .then(r => r.data.data),
    staleTime: 60 * 1000,
  })
