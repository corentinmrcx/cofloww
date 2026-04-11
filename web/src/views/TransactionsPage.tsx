import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Plus } from 'lucide-react'
import { useTransactions } from '../features/transactions/hooks/useTransactions'
import { useTransactionFilters } from '../features/transactions/hooks/useTransactionFilters'
import { TransactionTable } from '../features/transactions/components/TransactionTable'
import { TransactionFilters } from '../features/transactions/components/TransactionFilters'
import { TransactionModal } from '../features/transactions/components/TransactionModal'
import { useT } from '../components/T'

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

  const { filters, setFilter, resetFilters, hasActiveFilters, activeCount } = useTransactionFilters()
  const { data, isPending } = useTransactions({ ...filters, page })
  const t = useT(import.meta.url)

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('tx_title')}</h1>
        <div className="flex items-center gap-2">
          <TransactionFilters
            filters={filters}
            onChange={setFilter}
            onReset={resetFilters}
            hasActive={hasActiveFilters}
            activeCount={activeCount}
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
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
