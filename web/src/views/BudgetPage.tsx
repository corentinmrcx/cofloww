import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { BudgetCard } from '../features/budget/components/BudgetCard'
import { BudgetModal } from '../features/budget/components/BudgetModal'
import { useBudgets } from '../features/budget/hooks/useBudgets'
import { useDeleteBudget } from '../features/budget/hooks/useDeleteBudget'
import type { Budget } from '../features/budget/types/budget.types'

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const BudgetPage = () => {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const [modalBudget, setModalBudget] = useState<Budget | 'new' | null>(null)

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
  const formatAmount   = (cents: number) =>
    (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Budget</h1>
        <button
          onClick={() => setModalBudget('new')}
          className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          aria-label="Nouveau budget"
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
          <p className="font-semibold">{MONTH_NAMES[month - 1]} {year}</p>
          {budgets.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatAmount(totalSpent)} € / {formatAmount(totalAllocated)} € alloués
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
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Chargement…
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Aucun budget pour ce mois
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

export default BudgetPage
