import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { CategoryBreakdown } from '../types/stats.types'

export const useExpensesByCategory = (from: string, to: string) =>
  useQuery<CategoryBreakdown[]>({
    queryKey: ['stats-expenses-by-category', from, to],
    queryFn: () =>
      api
        .get<{ data: CategoryBreakdown[] }>('/api/v1/stats/expenses-by-category', { params: { from, to } })
        .then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })
