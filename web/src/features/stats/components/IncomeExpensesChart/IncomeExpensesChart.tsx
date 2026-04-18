import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useIncomeVsExpenses } from '../../hooks/useIncomeVsExpenses'
import { useFormatters } from '../../../../lib/format'
import { useT } from '../../../../components/T'
import { cn } from '../../../../lib/utils'
import type { StatPeriod } from '../../types/stats.types'

interface TooltipPayloadItem {
  dataKey: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
  fmt: (n: number) => string
  t: (key: string) => string
}

const PERIODS: { value: StatPeriod; key: string }[] = [
  { value: '3m',  key: 'period_3m'  },
  { value: '6m',  key: 'period_6m'  },
  { value: '12m', key: 'period_12m' },
  { value: '24m', key: 'period_24m' },
]

const CustomTooltip = ({ active, payload, label, fmt, t }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const income   = payload.find(p => p.dataKey === 'income')?.value   ?? 0
  const expenses = payload.find(p => p.dataKey === 'expenses')?.value ?? 0
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-md min-w-36">
      <p className="font-semibold mb-1.5 text-foreground">{label}</p>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{t('income')}</span>
          <span className="font-medium text-income">{fmt(income)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{t('expenses')}</span>
          <span className="font-medium text-expense">{fmt(expenses)}</span>
        </div>
        <div className="h-px bg-border my-0.5" />
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{t('net')}</span>
          <span className={cn('font-semibold', income - expenses >= 0 ? 'text-income' : 'text-expense')}>
            {fmt(income - expenses)}
          </span>
        </div>
      </div>
    </div>
  )
}

const IncomeExpensesChart = () => {
  const [period, setPeriod] = useState<StatPeriod>('6m')
  const { data = [], isLoading } = useIncomeVsExpenses(period)
  const { formatAmountShort: fmt, numLocale } = useFormatters()
  const t = useT(import.meta.url)

  const chartData = data.map(d => ({
    name:     new Date(d.year, d.month - 1).toLocaleDateString(numLocale, { month: 'short', year: '2-digit' }),
    income:   d.income,
    expenses: d.expenses,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{t('title')}</p>
          <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                period === p.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t(p.key)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          {t('loading')}
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
            <Tooltip content={<CustomTooltip fmt={fmt} t={t} />} cursor={{ fill: 'var(--muted)', radius: 4 }} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">
                  {value === 'income' ? t('income') : t('expenses')}
                </span>
              )}
            />
            <Bar dataKey="income"   fill="var(--income)"  radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--expense)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export { IncomeExpensesChart }
