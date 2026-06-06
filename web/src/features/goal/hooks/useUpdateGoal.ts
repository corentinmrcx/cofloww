import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { UpdateGoalPayload, Goal } from '../types/goal.types'

export const useUpdateGoal = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateGoalPayload) =>
      api.patch<{ data: Goal }>(`/api/v1/goals/${id}`, payload).then(r => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
