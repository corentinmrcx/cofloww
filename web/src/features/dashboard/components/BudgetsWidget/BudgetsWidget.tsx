import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { ICONS } from '../../../../components/IconPicker'
import type { BudgetSummary } from '../../types/dashboard.types'

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

interface BudgetRowProps {
  budget: BudgetSummary
}

const BudgetRow = ({ budget }: BudgetRowProps) => {
  const Icon          = budget.icon ? ICONS[budget.icon] : null
  const displayPct    = Math.min(budget.pct, 100)
  const isOver        = budget.over_budget
  const isWarning     = !isOver && budget.pct >= 80

  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: budget.color + '28' }}
        >
          {Icon
            ? <Icon size={12} style={{ color: budget.color }} />
            : <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: budget.color }} />
          }
        </div>

        <span className="flex-1 text-sm truncate">
          {budget.label}
          {budget.category_count > 1 && (
            <span className="text-xs text-muted-foreground ml-1">+{budget.category_count - 1}</span>
          )}
        </span>

        <span className={`text-xs font-medium tabular-nums ${isOver ? 'text-red-500' : 'text-muted-foreground'}`}>
          {fmt(budget.spent)} / {fmt(budget.budget_amount)}
        </span>
      </div>

      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${displayPct}%`,
            backgroundColor: isOver ? '#ef4444' : isWarning ? '#f59e0b' : budget.color,
          }}
        />
      </div>

      <p className={`text-xs text-right tabular-nums ${isOver ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
        {isOver ? `Dépassé de ${fmt(budget.spent - budget.budget_amount)}` : `${budget.pct.toFixed(0)}%`}
      </p>
    </div>
  )
}

interface BudgetsWidgetProps {
  budgets: BudgetSummary[]
}

const BudgetsWidget = ({ budgets }: BudgetsWidgetProps) => {
  const navigate = useNavigate()

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <p className="text-sm font-semibold">Budgets du mois</p>
        <button
          onClick={() => navigate('/budget')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
        >
          Voir tout <ChevronRight size={13} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 divide-y divide-border">
        {budgets.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground text-center">
            Aucun budget ce mois
          </p>
        ) : (
          budgets.map(b => <BudgetRow key={b.id} budget={b} />)
        )}
      </div>
    </div>
  )
}

export { BudgetsWidget }
