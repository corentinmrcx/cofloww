import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { ICONS } from '../../../../components/IconPicker'
import { useT } from '../../../../components/T'
import { useFormatters } from '../../../../lib/format'
import { cn } from '../../../../lib/utils'
import type { BudgetSummary } from '../../types/dashboard.types'

interface BudgetRowProps {
  budget: BudgetSummary
  t: (key: string) => string
}

const BudgetRow = ({ budget, t }: BudgetRowProps) => {
  const { formatAmountShort: fmt } = useFormatters()
  const Icon          = budget.icon ? ICONS[budget.icon] : null
  const displayPct    = Math.min(budget.pct, 100)
  const isOver        = budget.over_budget
  const BUDGET_WARNING_THRESHOLD = 80
  const isWarning = !isOver && budget.pct >= BUDGET_WARNING_THRESHOLD

  return (
    <div className="flex flex-col gap-1.5 py-3">
      <div className="flex items-center gap-2">
        <div
          className="size-6 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: budget.color + '28' }}
        >
          {Icon
            ? <Icon size={12} style={{ color: budget.color }} />
            : <span className="size-2 rounded-full block" style={{ backgroundColor: budget.color }} />
          }
        </div>

        <span className="flex-1 text-sm truncate">
          {budget.label}
          {budget.category_count > 1 && (
            <span className="text-xs text-muted-foreground ml-1">+{budget.category_count - 1}</span>
          )}
        </span>

        <span className={cn('text-xs font-medium tabular-nums', isOver ? 'text-expense' : 'text-muted-foreground')}>
          {fmt(budget.spent)} / {fmt(budget.budget_amount)}
        </span>
      </div>

      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          role="progressbar"
          aria-valuenow={displayPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={budget.label}
          className="h-full rounded-full transition-all"
          style={{
            width: `${displayPct}%`,
            backgroundColor: isOver ? 'var(--expense)' : isWarning ? 'var(--warning)' : budget.color,
          }}
        />
      </div>

      <p className={cn('text-xs text-right tabular-nums', isOver ? 'text-expense font-medium' : 'text-muted-foreground')}>
        {isOver ? `${t('over')}${fmt(budget.spent - budget.budget_amount)}` : `${budget.pct.toFixed(0)}%`}
      </p>
    </div>
  )
}

interface BudgetsWidgetProps {
  budgets: BudgetSummary[]
}

const BudgetsWidget = ({ budgets }: BudgetsWidgetProps) => {
  const navigate = useNavigate()
  const t = useT(import.meta.url)

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <p className="text-sm font-semibold">{t('title')}</p>
        <button
          onClick={() => navigate('/budget')}
          aria-label={t('see_all_label')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          {t('see_all')} <ChevronRight size={13} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 divide-y divide-border">
        {budgets.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground text-center">
            {t('empty')}
          </p>
        ) : (
          budgets.map(b => <BudgetRow key={b.id} budget={b} t={t} />)
        )}
      </div>
    </div>
  )
}

export { BudgetsWidget }
