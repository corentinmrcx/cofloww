import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { RecurringRule } from '../types/recurring.types'

export const useRecurringRules = () =>
  useQuery<RecurringRule[]>({
    queryKey: ['recurring-rules'],
    queryFn: () =>
      api.get<{ data: RecurringRule[] }>('/api/v1/recurring-rules').then(r => r.data.data),
  })
