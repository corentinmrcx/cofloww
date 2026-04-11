import { useState } from 'react'
import { Plus } from 'lucide-react'
import { RecurringRuleList } from '../features/recurring/components/RecurringRuleList'
import { RecurringRuleModal } from '../features/recurring/components/RecurringRuleModal'
import { useRecurringRules } from '../features/recurring/hooks/useRecurringRules'
import { useToggleRecurringRule } from '../features/recurring/hooks/useToggleRecurringRule'
import { useDeleteRecurringRule } from '../features/recurring/hooks/useDeleteRecurringRule'
import type { RecurringRule } from '../features/recurring/types/recurring.types'

const MONTHLY_MULTIPLIERS: Record<string, number> = {
  daily:   30,
  weekly:  4.33,
  monthly: 1,
  yearly:  1 / 12,
}

const formatAmount = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const RecurringRulesPage = () => {
  const { data: rules = [], isPending } = useRecurringRules()
  const { mutate: toggleRule } = useToggleRecurringRule()
  const { mutate: deleteRule } = useDeleteRecurringRule()
  const [modalRule, setModalRule] = useState<RecurringRule | 'new' | null>(null)

  const activeRules = rules.filter(r => r.is_active)

  const monthlyForecast = activeRules.reduce((sum, r) => {
    const multiplier = MONTHLY_MULTIPLIERS[r.frequency] ?? 1
    const normalized = r.amount * multiplier
    return r.type === 'income' ? sum + normalized : sum - normalized
  }, 0)

  const forecastColor = monthlyForecast >= 0
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-destructive'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Récurrences</h1>
        <button
          onClick={() => setModalRule('new')}
          className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          aria-label="Nouvelle règle"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="rounded-xl border border-border p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Total mensuel prévisionnel
          </p>
          <p className={`text-2xl font-bold tabular-nums mt-0.5 ${forecastColor}`}>
            {monthlyForecast >= 0 ? '+' : ''}{formatAmount(monthlyForecast)} €
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {activeRules.length} règle{activeRules.length !== 1 ? 's' : ''} active{activeRules.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isPending ? (
        <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
          Chargement…
        </div>
      ) : (
        <RecurringRuleList
          rules={rules}
          onEditClick={setModalRule}
          onToggleClick={rule => toggleRule({ id: rule.id, is_active: !rule.is_active })}
          onDeleteClick={rule => deleteRule(rule.id)}
        />
      )}

      {modalRule !== null && (
        <RecurringRuleModal
          rule={modalRule === 'new' ? undefined : modalRule}
          onClose={() => setModalRule(null)}
        />
      )}
    </div>
  )
}

export default RecurringRulesPage
