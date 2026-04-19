import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useT } from '../../../../components/T'
import { useLangStore } from '../../../../stores/langStore'
import { useFormatters } from '../../../../lib/format'
import { cn } from '../../../../lib/utils'
import type { MonthSummary } from '../../types/dashboard.types'
import trad from './trad.json'

const Trend = ({ prev, current, positiveIsGood = true }: { prev: number; current: number; positiveIsGood?: boolean }) => {
  if (prev === 0) return null
  const delta = current - prev
  const pct   = Math.round((delta / Math.abs(prev)) * 100)
  if (Math.abs(pct) < 1) return <Minus size={12} className="text-muted-foreground" />
  const good  = positiveIsGood ? delta > 0 : delta < 0
  const Icon  = delta > 0 ? TrendingUp : TrendingDown
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', good ? 'text-income' : 'text-expense')}>
      <Icon size={11} />
      {Math.abs(pct)}%
    </span>
  )
}

interface MonthSummaryWidgetProps {
  current: MonthSummary
  prev: MonthSummary
}

const MonthSummaryWidget = ({ current, prev }: MonthSummaryWidgetProps) => {
  const t = useT(trad)
  const { lang } = useLangStore()
  const { formatAmountShort: fmt } = useFormatters()
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const monthLabel = new Date().toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 h-full">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
        {monthLabel}
      </p>

      <div className="flex-1 flex items-center">
        <div className="grid grid-cols-2 divide-x divide-border w-full">

          {/* Revenus */}
          <div className="flex flex-col items-center gap-2 px-4">
            <p className="text-sm font-medium text-muted-foreground">{t('income')}</p>
            <p className="text-2xl font-bold tabular-nums text-income">
              {fmt(current.income)}
            </p>
            <Trend prev={prev.income} current={current.income} positiveIsGood />
          </div>

          {/* Dépenses */}
          <div className="flex flex-col items-center gap-2 px-4">
            <p className="text-sm font-medium text-muted-foreground">{t('expenses')}</p>
            <p className="text-2xl font-bold tabular-nums text-expense">
              {fmt(current.expenses)}
            </p>
            <Trend prev={prev.expenses} current={current.expenses} positiveIsGood={false} />
          </div>

        </div>
      </div>
    </div>
  )
}

export { MonthSummaryWidget }
