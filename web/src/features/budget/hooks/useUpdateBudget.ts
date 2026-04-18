import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { UpdateBudgetPayload, Budget } from '../types/budget.types'

export const useUpdateBudget = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateBudgetPayload) =>
      api.patch<{ data: Budget }>(`/api/v1/budgets/${id}`, payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
