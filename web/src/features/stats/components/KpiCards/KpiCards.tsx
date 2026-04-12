import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useOverview } from '../../hooks/useOverview'
import { useIncomeVsExpenses } from '../../hooks/useIncomeVsExpenses'
import { useFormatters } from '../../../../lib/format'
import type { MonthlyDataPoint } from '../../types/stats.types'

const MONTH_FR = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const fmtPct = (n: number) =>
  `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`

interface TrendProps {
  value: number
  suffix?: string
}

const Trend = ({ value, suffix = '' }: TrendProps) => {
  if (Math.abs(value) < 0.1) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus size={12} /> stable
      </span>
    )
  }
  const positive = value > 0
  const Icon     = positive ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
      <Icon size={12} />
      {fmtPct(value)}{suffix} vs 6 mois préc.
    </span>
  )
}

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: number
  trendSuffix?: string
  trendInvert?: boolean  // true = hausse = mauvais (ex: dépenses)
}

const KpiCard = ({ label, value, sub, trend, trendSuffix, trendInvert = false }: KpiCardProps) => (
  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold tabular-nums">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    {trend !== undefined && (
      <Trend value={trendInvert ? -trend : trend} suffix={trendSuffix} />
    )}
  </div>
)

// Calcule le taux d'épargne sur une liste de mois
const savingsRateFrom = (rows: MonthlyDataPoint[]) => {
  const income   = rows.reduce((s, r) => s + r.income,   0)
  const expenses = rows.reduce((s, r) => s + r.expenses, 0)
  return income > 0 ? ((income - expenses) / income) * 100 : 0
}

const KpiCards = () => {
  const { data: overview }       = useOverview()
  const { data: monthly12 = [] } = useIncomeVsExpenses('12m')
  const { formatAmountShort: fmt } = useFormatters()

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
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  const bestMonth  = overview.best_month
  const worstLabel = worstMonth
    ? `${MONTH_FR[worstMonth.month]} ${worstMonth.year}`
    : '—'

  return (
    <div className="grid grid-cols-2 gap-3">
      <KpiCard
        label="Taux d'épargne"
        value={`${overview.savings_rate.toFixed(1)}%`}
        sub="Moyenne sur 12 mois"
        trend={savingsRateTrend}
        trendSuffix=" pts"
      />

      <KpiCard
        label="Dépenses moyennes"
        value={fmt(overview.avg_monthly_expenses)}
        sub="Par mois sur 12 mois"
        trend={expensesTrend}
        trendInvert
      />

      <KpiCard
        label="Meilleur mois"
        value={bestMonth ? fmt(bestMonth.net) : '—'}
        sub={bestMonth ? `${MONTH_FR[bestMonth.month]} ${bestMonth.year}` : 'Aucune donnée'}
      />

      <KpiCard
        label="Mois le plus dépensier"
        value={worstMonth ? fmt(worstMonth.expenses) : '—'}
        sub={worstLabel}
      />
    </div>
  )
}

export { KpiCards }
