import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { MonthlyDataPoint, StatPeriod } from '../types/stats.types'

export const useIncomeVsExpenses = (period: StatPeriod) =>
  useQuery<MonthlyDataPoint[]>({
    queryKey: ['stats-income-vs-expenses', period],
    queryFn: () =>
      api
        .get<{ data: MonthlyDataPoint[] }>('/api/v1/stats/income-vs-expenses', { params: { period } })
        .then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
