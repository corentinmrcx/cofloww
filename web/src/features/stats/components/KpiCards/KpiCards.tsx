import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useOverview } from '../../hooks/useOverview'
import { useIncomeVsExpenses } from '../../hooks/useIncomeVsExpenses'
import { useFormatters } from '../../../../lib/format'
import { Skeleton } from '../../../../components/ui/skeleton'
import { useT } from '../../../../components/T'
import { cn } from '../../../../lib/utils'
import type { MonthlyDataPoint } from '../../types/stats.types'
import trad from './trad.json'

const fmtPct = (n: number) =>
  `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`

interface TrendProps {
  value: number
  suffix?: string
  t: (key: string) => string
}

const Trend = ({ value, suffix = '', t }: TrendProps) => {
  if (Math.abs(value) < 0.1) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus size={12} /> {t('stable')}
      </span>
    )
  }
  const positive = value > 0
  const Icon     = positive ? TrendingUp : TrendingDown
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', positive ? 'text-income' : 'text-expense')}>
      <Icon size={12} />
      {fmtPct(value)}{suffix} {t('vs_prev')}
    </span>
  )
}

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: number
  trendSuffix?: string
  trendInvert?: boolean
  t: (key: string) => string
}

const KpiCard = ({ label, value, sub, trend, trendSuffix, trendInvert = false, t }: KpiCardProps) => (
  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold tabular-nums">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    {trend !== undefined && (
      <Trend value={trendInvert ? -trend : trend} suffix={trendSuffix} t={t} />
    )}
  </div>
)

const savingsRateFrom = (rows: MonthlyDataPoint[]) => {
  const income   = rows.reduce((s, r) => s + r.income,   0)
  const expenses = rows.reduce((s, r) => s + r.expenses, 0)
  return income > 0 ? ((income - expenses) / income) * 100 : 0
}

const monthLabel = (month: number, year: number, locale: string) =>
  new Date(year, month - 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

const KpiCards = () => {
  const { data: overview }       = useOverview()
  const { data: monthly12 = [] } = useIncomeVsExpenses('12m')
  const { formatAmountShort: fmt, numLocale } = useFormatters()
  const t = useT(trad)

  const { savingsRateTrend, expensesTrend, worstMonth } = useMemo(() => {
    if (monthly12.length < 12) return { savingsRateTrend: 0, expensesTrend: 0, worstMonth: null }

    const last6 = monthly12.slice(-6)
    const prev6 = monthly12.slice(0, 6)

    const srLast = savingsRateFrom(last6)
    const srPrev = savingsRateFrom(prev6)

    const expLast = last6.reduce((s, r) => s + r.expenses, 0) / 6
    const expPrev = prev6.reduce((s, r) => s + r.expenses, 0) / 6

    const worst = [...monthly12].sort((a, b) => b.expenses - a.expenses)[0] ?? null

    return {
      savingsRateTrend: srLast - srPrev,
      expensesTrend:    expPrev > 0 ? ((expLast - expPrev) / expPrev) * 100 : 0,
      worstMonth:       worst as MonthlyDataPoint | null,
    }
  }, [monthly12])

  if (!overview) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} className="rounded-xl p-4 h-24" />
        ))}
      </div>
    )
  }

  const bestMonth  = overview.best_month
  const worstLabel = worstMonth ? monthLabel(worstMonth.month, worstMonth.year, numLocale) : t('no_data')
  const bestLabel  = bestMonth  ? monthLabel(bestMonth.month,  bestMonth.year,  numLocale) : t('no_data')

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <KpiCard
        label={t('savings_rate')}
        value={`${overview.savings_rate.toFixed(1)}%`}
        sub={t('savings_avg_sub')}
        trend={savingsRateTrend}
        trendSuffix=" pts"
        t={t}
      />

      <KpiCard
        label={t('avg_expenses')}
        value={fmt(overview.avg_monthly_expenses)}
        sub={t('avg_expenses_sub')}
        trend={expensesTrend}
        trendInvert
        t={t}
      />

      <KpiCard
        label={t('best_month')}
        value={bestMonth ? fmt(bestMonth.net) : '—'}
        sub={bestLabel}
        t={t}
      />

      <KpiCard
        label={t('worst_month')}
        value={worstMonth ? fmt(worstMonth.expenses) : '—'}
        sub={worstLabel}
        t={t}
      />
    </div>
  )
}

export { KpiCards }
