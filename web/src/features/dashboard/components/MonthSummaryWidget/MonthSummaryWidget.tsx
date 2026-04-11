import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { MonthSummary } from '../../types/dashboard.types'

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

interface MetricProps {
  label: string
  value: string
  prevValue?: number
  currentValue?: number
  positiveIsGood?: boolean
  isRate?: boolean
}

const Trend = ({ prev, current, positiveIsGood = true }: { prev: number; current: number; positiveIsGood?: boolean }) => {
  if (prev === 0) return null
  const delta = current - prev
  const pct   = Math.round((delta / Math.abs(prev)) * 100)
  if (Math.abs(pct) < 1) return <Minus size={12} className="text-muted-foreground" />
  const good  = positiveIsGood ? delta > 0 : delta < 0
  const Icon  = delta > 0 ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${good ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
      <Icon size={11} />
      {Math.abs(pct)}%
    </span>
  )
}

const Metric = ({ label, value, prevValue, currentValue, positiveIsGood = true }: MetricProps) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-base font-bold tabular-nums">{value}</p>
    {prevValue !== undefined && currentValue !== undefined && (
      <Trend prev={prevValue} current={currentValue} positiveIsGood={positiveIsGood} />
    )}
  </div>
)

interface MonthSummaryWidgetProps {
  current: MonthSummary
  prev: MonthSummary
}

const MonthSummaryWidget = ({ current, prev }: MonthSummaryWidgetProps) => {
  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 h-full">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
        {monthLabel}
      </p>

      <div className="flex-1 flex items-center">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full">
        <Metric
          label="Revenus"
          value={fmt(current.income)}
          prevValue={prev.income}
          currentValue={current.income}
          positiveIsGood
        />
        <Metric
          label="Dépenses"
          value={fmt(current.expenses)}
          prevValue={prev.expenses}
          currentValue={current.expenses}
          positiveIsGood={false}
        />
        <Metric
          label="Épargne"
          value={fmt(current.net)}
          prevValue={prev.net}
          currentValue={current.net}
          positiveIsGood
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Taux d'épargne</p>
          <p className={`text-base font-bold tabular-nums ${
            current.savings_rate >= 20
              ? 'text-emerald-600 dark:text-emerald-400'
              : current.savings_rate >= 0
                ? 'text-foreground'
                : 'text-red-500'
          }`}>
            {current.savings_rate.toFixed(1)}%
          </p>
          <Trend prev={prev.savings_rate} current={current.savings_rate} positiveIsGood />
        </div>
      </div>
      </div>
    </div>
  )
}

export { MonthSummaryWidget }
