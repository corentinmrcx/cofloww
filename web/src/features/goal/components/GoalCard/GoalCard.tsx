import { Pencil, Trash2, Repeat } from 'lucide-react'
import { useT } from '../../../../components/T'
import { ActionMenu } from '../../../../components/ActionMenu'
import { useFormatters, walletLabel } from '../../../../lib/format'
import { cn } from '../../../../lib/utils'
import type { Goal } from '../../types/goal.types'
import trad from './trad.json'

interface GoalCardProps {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
}

const ProgressBar = ({ pct }: { pct: number }) => (
  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-income' : 'bg-blue-500')}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>
)

const GoalCard = ({ goal, onEdit, onDelete }: GoalCardProps) => {
  const t = useT(trad)
  const { formatAmountShort } = useFormatters()

  const isRecurring = goal.end_date === null

  const hasTotal   = goal.total_target !== null
  const hasMonthly = goal.monthly_target !== null

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">{goal.name}</span>
          {isRecurring && (
            <Repeat size={12} className="shrink-0 text-muted-foreground" />
          )}
        </div>
        <ActionMenu
          items={[
            { label: t('edit'),   icon: Pencil, onClick: onEdit },
            { label: t('delete'), icon: Trash2, onClick: onDelete, destructive: true },
          ]}
        />
      </div>

      {/* Wallet */}
      <p className="text-xs text-muted-foreground -mt-1">{walletLabel(goal.wallet)}</p>

      {/* Progression mensuelle */}
      {hasMonthly && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('this_month')}</span>
            <span className={cn('font-medium', goal.pct_monthly! >= 100 ? 'text-income' : 'text-foreground')}>
              {goal.pct_monthly}%
            </span>
          </div>
          <ProgressBar pct={goal.pct_monthly!} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{formatAmountShort(goal.transferred_this_month)}</span>
              {' '}{t('of')}{' '}{formatAmountShort(goal.monthly_target!)}
            </span>
            <span className="font-medium text-foreground">
              {formatAmountShort(Math.max(0, goal.monthly_target! - goal.transferred_this_month))} {t('remaining')}
            </span>
          </div>
        </div>
      )}

      {/* Progression totale */}
      {hasTotal && (
        <div className={cn('flex flex-col gap-1.5', hasMonthly && 'border-t border-border pt-3')}>
          {hasMonthly && (
            <p className="text-xs text-muted-foreground">{t('total_progress')}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {!hasMonthly && <span>{t('total_progress')}</span>}
            <span className={cn('font-medium ml-auto', goal.pct_total! >= 100 ? 'text-income' : 'text-foreground')}>
              {goal.pct_total}%
            </span>
          </div>
          <ProgressBar pct={goal.pct_total!} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{formatAmountShort(goal.transferred_total)}</span>
              {' '}{t('of')}{' '}{formatAmountShort(goal.total_target!)}
            </span>
            {goal.end_date && (
              <span>{t('until')} {new Date(goal.end_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { GoalCard }
