import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Plus } from 'lucide-react'
import { useTransactions } from '../features/transactions/hooks/useTransactions'
import { useTransactionFilters } from '../features/transactions/hooks/useTransactionFilters'
import { TransactionTable } from '../features/transactions/components/TransactionTable'
import { TransactionSearch } from '../features/transactions/components/TransactionSearch'
import { TransactionFilters } from '../features/transactions/components/TransactionFilters'
import { TransactionModal } from '../features/transactions/components/TransactionModal'
import { useT } from '../components/T'
import trad from './trad.json'

const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showModal, setShowModal] = useState(false)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const setPage = (p: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  const { filters, setFilter, setCategoryIds, resetFilters, hasActiveFilters, activeCount } = useTransactionFilters()
  const { data, isPending } = useTransactions({ ...filters, page })
  const t = useT(trad)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'n' || e.key === 'N') setShowModal(true)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold shrink-0">{t('tx_title')}</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <TransactionSearch
            value={filters.search ?? ''}
            onChange={v => setFilter('search', v)}
          />
          <TransactionFilters
            filters={filters}
            onChange={setFilter}
            onCategoryChange={setCategoryIds}
            onReset={resetFilters}
            hasActive={hasActiveFilters}
            activeCount={activeCount}
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center size-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            aria-label={t('tx_new')}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <TransactionTable
        result={data}
        isPending={isPending}
        page={page}
        onPageChange={setPage}
      />

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

export { TransactionsPage }
