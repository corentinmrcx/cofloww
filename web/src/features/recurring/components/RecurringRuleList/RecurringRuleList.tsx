import { Pencil, Trash2, PauseCircle, PlayCircle } from 'lucide-react'
import { useT } from '../../../../components/T'
import { List } from '../../../../components/List'
import { ActionMenu } from '../../../../components/ActionMenu'
import { useFormatters } from '../../../../lib/format'
import type { RecurringRule } from '../../types/recurring.types'

const FREQUENCY_KEYS = {
  daily:   'frequency_daily',
  weekly:  'frequency_weekly',
  monthly: 'frequency_monthly',
  yearly:  'frequency_yearly',
} as const

interface RecurringRuleRowProps {
  rule: RecurringRule
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}

const RecurringRuleRow = ({ rule, onEdit, onToggle, onDelete }: RecurringRuleRowProps) => {
  const t = useT(import.meta.url)
  const { formatAmountShort } = useFormatters()

  const amountDisplay = formatAmountShort(rule.amount)

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{rule.label}</span>
          <span
            className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${
              rule.is_active
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {t(rule.is_active ? 'active' : 'inactive')}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
          {rule.category && (
            <>
              <span>{rule.category.name}</span>
              <span>·</span>
            </>
          )}
          <span>{t(FREQUENCY_KEYS[rule.frequency])}</span>
          <span>·</span>
          <span>
            {t('next_occurrence')}
            {rule.next_occurrence ?? t('no_next')}
          </span>
        </div>
      </div>

      <span
        className={`text-sm font-semibold tabular-nums shrink-0 ${
          rule.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
        }`}
      >
        {rule.type === 'income' ? '+' : '-'}{amountDisplay}
      </span>

      <ActionMenu
        items={[
          { label: t('edit'),   icon: Pencil,      onClick: onEdit },
          {
            label:   t(rule.is_active ? 'toggle_disable' : 'toggle_enable'),
            icon:    rule.is_active ? PauseCircle : PlayCircle,
            onClick: onToggle,
          },
          { label: t('delete'), icon: Trash2, onClick: onDelete, destructive: true },
        ]}
      />
    </div>
  )
}

interface RecurringRuleListProps {
  rules: RecurringRule[]
  onEditClick:   (rule: RecurringRule) => void
  onToggleClick: (rule: RecurringRule) => void
  onDeleteClick: (rule: RecurringRule) => void
}

const RecurringRuleList = ({ rules, onEditClick, onToggleClick, onDeleteClick }: RecurringRuleListProps) => {
  const t = useT(import.meta.url)

  if (rules.length === 0) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        {t('empty')}
      </div>
    )
  }

  return (
    <List>
      {rules.map(rule => (
        <RecurringRuleRow
          key={rule.id}
          rule={rule}
          onEdit={() => onEditClick(rule)}
          onToggle={() => onToggleClick(rule)}
          onDelete={() => onDeleteClick(rule)}
        />
      ))}
    </List>
  )
}

export { RecurringRuleList }
