import { useSearchParams } from 'react-router'
import type { TransactionFilters, TransactionType, TransactionStatus } from '../types/transaction.types'

const VALID_TYPES: TransactionType[]     = ['income', 'expense', 'transfer']
const VALID_STATUSES: TransactionStatus[] = ['pending', 'cleared', 'reconciled']

export const useTransactionFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const rawType   = searchParams.get('type')
  const rawStatus = searchParams.get('status')

  const filters: TransactionFilters = {
    wallet_id:   searchParams.get('wallet_id')   ?? undefined,
    category_id: searchParams.get('category_id') ?? undefined,
    tag_id:      searchParams.get('tag_id')      ?? undefined,
    type:        (rawType   && VALID_TYPES.includes(rawType as TransactionType))     ? rawType as TransactionType     : undefined,
    status:      (rawStatus && VALID_STATUSES.includes(rawStatus as TransactionStatus)) ? rawStatus as TransactionStatus : undefined,
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
