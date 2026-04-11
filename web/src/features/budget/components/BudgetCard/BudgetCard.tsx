import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useT } from '../../../../components/T'
import { ActionMenu } from '../../../../components/ActionMenu'
import type { Budget } from '../../types/budget.types'

const formatAmount = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const barColor = (pct: number) => {
  if (pct >= 90) return 'bg-destructive'
  if (pct >= 70) return 'bg-orange-400'
  return 'bg-emerald-500'
}

const pctTextColor = (pct: number) => {
  if (pct >= 90) return 'text-destructive'
  if (pct >= 70) return 'text-orange-500'
  return 'text-emerald-600 dark:text-emerald-400'
}

interface BudgetCardProps {
  budget: Budget
  onEdit: () => void
  onDelete: () => void
}

const BudgetCard = ({ budget, onEdit, onDelete }: BudgetCardProps) => {
  const t = useT(import.meta.url)
  const pct = Math.min(budget.pct_used, 100)

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {budget.categories.map(c => (
            <span key={c.id} className="flex items-center gap-1 text-sm font-medium">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: c.color ?? '#94A3B8' }}
              />
              {c.name}
            </span>
          ))}
          {budget.alert && (
            <span className="flex items-center gap-1 text-xs text-orange-500 font-medium ml-1">
              <AlertTriangle size={12} />
              {t('alert_label')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className={`text-sm font-semibold tabular-nums ${pctTextColor(budget.pct_used)}`}>
            {budget.pct_used}%
          </span>
          <ActionMenu
            items={[
              { label: t('edit'),   icon: Pencil, onClick: onEdit },
              { label: t('delete'), icon: Trash2, onClick: onDelete, destructive: true },
            ]}
          />
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor(budget.pct_used)}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Montants */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{formatAmount(budget.spent)} €</span>
          {' '}{t('spent')} {t('of')} {formatAmount(budget.amount)} €
        </span>
        <span>
          <span className="font-medium text-foreground">{formatAmount(budget.remaining)} €</span>
          {' '}{t('remaining')}
        </span>
      </div>
    </div>
  )
}

export { BudgetCard }
