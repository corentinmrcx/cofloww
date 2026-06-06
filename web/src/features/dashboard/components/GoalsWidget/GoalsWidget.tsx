import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useGoals } from '../../../goal/hooks/useGoals'
import { useFormatters } from '../../../../lib/format'
import { useT } from '../../../../components/T'
import trad from './trad.json'


const GoalsWidget = () => {
  const navigate = useNavigate()
  const { data: goals = [] } = useGoals()
  const { formatAmountShort: fmt } = useFormatters()
  const t = useT(trad)

  const visible = goals.filter(g => g.is_active_this_month).slice(0, 3)

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <p className="text-sm font-semibold">{t('title')}</p>
        <button
          onClick={() => navigate('/goals')}
          aria-label={t('see_all_label')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          {t('see_all')} <ChevronRight size={13} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 divide-y divide-border">
        {visible.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground text-center">{t('empty')}</p>
        ) : (
          visible.map(goal => {
            const pct     = goal.pct_monthly ?? goal.pct_total ?? 0
            const spent   = goal.monthly_target !== null ? goal.transferred_this_month : goal.transferred_total
            const target  = goal.monthly_target ?? goal.total_target ?? 0

            return (
              <div key={goal.id} className="flex flex-col gap-1.5 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm truncate">{goal.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {fmt(spent)} / {fmt(target)}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={goal.name}
                    className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-income' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-right text-muted-foreground tabular-nums">
                  {pct.toFixed(0)}%
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export { GoalsWidget }
