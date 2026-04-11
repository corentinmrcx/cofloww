import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { Budget } from '../types/budget.types'

export const useBudgets = (month: number, year: number) =>
  useQuery<Budget[]>({
    queryKey: ['budgets', month, year],
    queryFn: () =>
      api
        .get<{ data: Budget[] }>('/api/v1/budgets', { params: { month, year } })
        .then(r => r.data.data),
  })
