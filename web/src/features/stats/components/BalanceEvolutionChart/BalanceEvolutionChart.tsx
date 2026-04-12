import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useIncomeVsExpenses } from '../../hooks/useIncomeVsExpenses'
import { useOverview } from '../../hooks/useOverview'
import { useFormatters } from '../../../../lib/format'

const MONTH_SHORT = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const BalanceEvolutionChart = () => {
  const { data: monthly = [], isLoading: loadingMonthly } = useIncomeVsExpenses('12m')
  const { data: overview, isLoading: loadingOverview }   = useOverview()
  const { formatAmountShort: fmt, numLocale } = useFormatters()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const value = payload[0]?.value ?? 0
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-md">
        <p className="font-semibold mb-1 text-foreground">{label}</p>
        <p className={`font-medium tabular-nums ${value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
          {fmt(value)}
        </p>
      </div>
    )
  }

  // Reconstitue le solde de fin de chaque mois en partant du net_worth actuel
  // et en remontant dans le temps via les nets mensuels
  const chartData = useMemo(() => {
    if (!overview || monthly.length === 0) return []

    const currentNetWorth = overview.net_worth
    const reversed        = [...monthly].reverse() // du plus récent au plus ancien

    const balances: number[] = new Array(monthly.length)
    balances[0] = currentNetWorth // mois courant = solde actuel

    for (let i = 1; i < reversed.length; i++) {
      balances[i] = balances[i - 1] - reversed[i - 1].net
    }

    return monthly.map((d, i) => ({
      name:    `${MONTH_SHORT[d.month]} ${d.year}`,
      balance: balances[monthly.length - 1 - i],
    }))
  }, [monthly, overview])

  const isLoading = loadingMonthly || loadingOverview
  const currentBalance = overview?.net_worth ?? 0

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Évolution du patrimoine</p>
          <p className="text-xs text-muted-foreground">Solde net total — 12 derniers mois</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          <p className={`text-lg font-bold tabular-nums ${
            currentBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
          }`}>
            {fmt(currentBalance)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          Chargement…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'currentColor', className: 'text-muted-foreground' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `${(v / 100).toLocaleString(numLocale, { maximumFractionDigits: 0 })}`}
              tick={{ fontSize: 11, fill: 'currentColor', className: 'text-muted-foreground' }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="4 2" />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export { BalanceEvolutionChart }
