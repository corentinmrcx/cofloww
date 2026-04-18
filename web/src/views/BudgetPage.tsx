import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, PiggyBank } from 'lucide-react'
import { BudgetCard } from '../features/budget/components/BudgetCard'
import { BudgetModal } from '../features/budget/components/BudgetModal'
import { useBudgets } from '../features/budget/hooks/useBudgets'
import { Skeleton } from '../components/ui/skeleton'
import { useDeleteBudget } from '../features/budget/hooks/useDeleteBudget'
import { useT } from '../components/T'
import { useLangStore } from '../stores/langStore'
import { useFormatters } from '../lib/format'
import type { Budget } from '../features/budget/types/budget.types'

const BudgetPage = () => {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const t = useT(import.meta.url)
  const { lang } = useLangStore()
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const [modalBudget, setModalBudget] = useState<Budget | 'new' | null>(null)
  const { formatAmountShort: formatAmount } = useFormatters()

  const { data: budgets = [], isPending } = useBudgets(month, year)
  const { mutate: deleteBudget } = useDeleteBudget()

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalAllocated = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent     = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('budget_title')}</h1>
        <button
          onClick={() => setModalBudget('new')}
          className="flex items-center justify-center size-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          aria-label={t('budget_new')}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-semibold">
            {new Date(year, month - 1).toLocaleDateString(locale, { month: 'long' }).replace(/^\w/, c => c.toUpperCase())} {year}
          </p>
          {budgets.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatAmount(totalSpent)} / {formatAmount(totalAllocated)} {t('budget_allocated')}
            </p>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Contenu */}
      {isPending ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-2.5 rounded-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="ml-auto h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border py-16 text-muted-foreground">
          <PiggyBank size={28} className="opacity-30" />
          <p className="text-sm">{t('budget_empty')}</p>
          <p className="text-xs opacity-60">{t('budget_empty_cta')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => setModalBudget(budget)}
              onDelete={() => deleteBudget(budget.id)}
            />
          ))}
        </div>
      )}

      {modalBudget !== null && (
        <BudgetModal
          budget={modalBudget === 'new' ? undefined : modalBudget}
          month={month}
          year={year}
          onClose={() => setModalBudget(null)}
        />
      )}
    </div>
  )
}

export { BudgetPage }
