import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { CreateBudgetPayload, Budget } from '../types/budget.types'

export const useCreateBudget = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) =>
      api.post<{ data: Budget }>('/api/v1/budgets', payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
