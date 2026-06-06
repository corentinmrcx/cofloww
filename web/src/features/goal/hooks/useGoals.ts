import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Goal } from '../types/goal.types'

export const useGoals = () =>
  useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: () => api.get<{ data: Goal[] }>('/api/v1/goals').then(r => r.data.data),
  })
