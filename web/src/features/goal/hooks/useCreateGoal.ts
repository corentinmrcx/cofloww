import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { CreateGoalPayload, Goal } from '../types/goal.types'

export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateGoalPayload) =>
      api.post<{ data: Goal }>('/api/v1/goals', payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
