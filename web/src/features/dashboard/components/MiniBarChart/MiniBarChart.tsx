import { useMemo } from 'react'
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useT } from '../../../../components/T'
import { useFormatters } from '../../../../lib/format'
import type { TrendPoint } from '../../types/dashboard.types'
import trad from './trad.json'

interface MiniBarChartProps {
  data: TrendPoint[]
}

const CustomTooltip = ({ active, payload, label, fmt }: {
  active?: boolean
  payload?: { dataKey: string; value: number }[]
  label?: string
  fmt: (n: number) => string
}) => {
  if (!active || !payload?.length) return null
  const income   = payload.find(p => p.dataKey === 'income')?.value  ?? 0
  const expenses = payload.find(p => p.dataKey === 'expenses')?.value ?? 0
  return (
    <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-income">↑ {fmt(income)}</p>
      <p className="text-expense">↓ {fmt(expenses)}</p>
    </div>
  )
}

const MiniBarChart = ({ data }: MiniBarChartProps) => {
  const t = useT(trad)
  const { formatAmountShort: fmt, numLocale } = useFormatters()

  const chartData = useMemo(() => data.map(d => ({
    name: new Date(d.year, d.month - 1, 1)
      .toLocaleDateString(numLocale, { month: 'short' })
      .replace(/\.$/, '')
      .replace(/^\w/, c => c.toUpperCase()),
    income:   d.income,
    expenses: d.expenses,
  })), [data, numLocale])

  const isEmpty = data.every(d => d.income === 0 && d.expenses === 0)

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 h-full">
      <p className="text-sm font-semibold shrink-0">{t('title')}</p>

      <div className="flex-1 flex flex-col justify-center gap-2">
        {isEmpty ? (
          <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={96}>
            <BarChart data={chartData} barCategoryGap="20%" barGap={1} margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                height={20}
              />
              <Tooltip content={<CustomTooltip fmt={fmt} />} cursor={{ fill: 'var(--muted)', radius: 2 }} />
              <Bar dataKey="income"   fill="var(--income)"  radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--expense)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="flex gap-3 justify-center">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-2 rounded-sm bg-income inline-block" /> {t('income')}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-2 rounded-sm bg-expense inline-block" /> {t('expenses')}
          </span>
        </div>
      </div>
    </div>
  )
}

export { MiniBarChart }
