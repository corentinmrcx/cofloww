import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
