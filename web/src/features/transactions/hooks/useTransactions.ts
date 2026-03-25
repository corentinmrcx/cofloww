import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { PaginatedTransactions, TransactionFilters } from '../types/transaction.types'

export const useTransactions = (filters: TransactionFilters = {}) =>
  useQuery<PaginatedTransactions>({
    queryKey: ['transactions', filters],
    queryFn: () =>
      api.get<PaginatedTransactions>('/api/v1/transactions', { params: filters }).then(r => r.data),
  })
