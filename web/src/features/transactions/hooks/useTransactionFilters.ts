import { useSearchParams } from 'react-router'
import type { TransactionFilters, TransactionType, TransactionStatus } from '../types/transaction.types'

export const useTransactionFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: TransactionFilters = {
    wallet_id:   searchParams.get('wallet_id')   ?? undefined,
    category_id: searchParams.get('category_id') ?? undefined,
    tag_id:      searchParams.get('tag_id')      ?? undefined,
    type:        (searchParams.get('type') as TransactionType)     ?? undefined,
    status:      (searchParams.get('status') as TransactionStatus) ?? undefined,
    date_from:   searchParams.get('date_from')   ?? undefined,
    date_to:     searchParams.get('date_to')     ?? undefined,
  }

  const setFilter = (key: keyof TransactionFilters, value: string | undefined) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.delete('page')
      return next
    })
  }

  const resetFilters = () => setSearchParams(new URLSearchParams())

  const activeCount = Object.values(filters).filter(Boolean).length
  const hasActiveFilters = activeCount > 0

  return { filters, setFilter, resetFilters, hasActiveFilters, activeCount }
}
