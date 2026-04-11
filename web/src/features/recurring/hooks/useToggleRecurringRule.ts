import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { RecurringRule } from '../types/recurring.types'

export const useToggleRecurringRule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch<{ data: RecurringRule }>(`/api/v1/recurring-rules/${id}`, { is_active }).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
  })
}
