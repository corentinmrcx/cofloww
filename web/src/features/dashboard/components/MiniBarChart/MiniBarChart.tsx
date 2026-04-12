import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useT } from '../../../../components/T'
import { useFormatters } from '../../../../lib/format'
import { useTheme } from '../../../../hooks/useTheme'
import type { TrendPoint } from '../../types/dashboard.types'

interface MiniBarChartProps {
  data: TrendPoint[]
}

const MiniBarChart = ({ data }: MiniBarChartProps) => {
  const t = useT(import.meta.url)
  const { formatAmountShort: fmt, numLocale } = useFormatters()
  const { theme } = useTheme()
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b'

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null
    const income   = payload.find(p => p.dataKey === 'income')?.value  ?? 0
    const expenses = payload.find(p => p.dataKey === 'expenses')?.value ?? 0
    return (
      <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-md">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-emerald-600 dark:text-emerald-400">↑ {fmt(income)}</p>
        <p className="text-red-500">↓ {fmt(expenses)}</p>
      </div>
    )
  }

  const chartData = data.map(d => ({
    name: new Date(d.year, d.month - 1, 1)
      .toLocaleDateString(numLocale, { month: 'short' })
      .replace(/\.$/, '')
      .replace(/^\w/, c => c.toUpperCase()),
    income:   d.income,
    expenses: d.expenses,
  }))

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
                tick={{ fontSize: 10, fill: tickColor }}
                axisLine={false}
                tickLine={false}
                height={20}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 2 }} />
              <Bar dataKey="income"   fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="flex gap-3 justify-center">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> {t('income')}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> {t('expenses')}
          </span>
        </div>
      </div>
    </div>
  )
}

export { MiniBarChart }
