import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useIncomeVsExpenses } from '../../hooks/useIncomeVsExpenses'
import { useFormatters } from '../../../../lib/format'
import type { StatPeriod } from '../../types/stats.types'

const MONTH_SHORT = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const PERIODS: { value: StatPeriod; label: string }[] = [
  { value: '3m',  label: '3 mois' },
  { value: '6m',  label: '6 mois' },
  { value: '12m', label: '1 an'   },
  { value: '24m', label: '2 ans'  },
]

const IncomeExpensesChart = () => {
  const [period, setPeriod] = useState<StatPeriod>('6m')
  const { data = [], isLoading } = useIncomeVsExpenses(period)
  const { formatAmountShort: fmt, numLocale } = useFormatters()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const income   = payload.find((p: any) => p.dataKey === 'income')?.value  ?? 0
    const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value ?? 0
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-md min-w-36">
        <p className="font-semibold mb-1.5 text-foreground">{label}</p>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Revenus</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{fmt(income)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Dépenses</span>
            <span className="font-medium text-red-500">{fmt(expenses)}</span>
          </div>
          <div className="h-px bg-border my-0.5" />
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Net</span>
            <span className={`font-semibold ${income - expenses >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {fmt(income - expenses)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const chartData = data.map(d => ({
    name:     `${MONTH_SHORT[d.month]} ${d.year}`,
    income:   d.income,
    expenses: d.expenses,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Revenus vs Dépenses</p>
          <p className="text-xs text-muted-foreground">Comparaison mensuelle</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                period === p.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          Chargement…
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="30%" barGap={2}>
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
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 4 }} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">
                  {value === 'income' ? 'Revenus' : 'Dépenses'}
                </span>
              )}
            />
            <Bar dataKey="income"   fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export { IncomeExpensesChart }
