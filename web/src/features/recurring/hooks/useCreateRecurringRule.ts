import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { CreateRecurringRulePayload, RecurringRule } from '../types/recurring.types'

export const useCreateRecurringRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRecurringRulePayload) =>
      api.post<{ data: RecurringRule }>('/api/v1/recurring-rules', payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
  })
}
