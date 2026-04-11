import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { UpdateRecurringRulePayload, RecurringRule } from '../types/recurring.types'

export const useUpdateRecurringRule = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateRecurringRulePayload) =>
      api.patch<{ data: RecurringRule }>(`/api/v1/recurring-rules/${id}`, payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
  })
}
