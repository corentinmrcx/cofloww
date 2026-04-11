import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts'
import { useT } from '../../../../components/T'
import type { TrendPoint } from '../../types/dashboard.types'

const MONTH_SHORT = ['', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const income   = payload.find((p: any) => p.dataKey === 'income')?.value  ?? 0
  const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value ?? 0
  return (
    <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium mb-1">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400">↑ {fmt(income)}</p>
      <p className="text-red-500">↓ {fmt(expenses)}</p>
    </div>
  )
}

interface MiniBarChartProps {
  data: TrendPoint[]
}

const MiniBarChart = ({ data }: MiniBarChartProps) => {
  const t = useT(import.meta.url)
  const chartData = data.map(d => ({
    name:     `${MONTH_SHORT[d.month]} ${d.year}`,
    income:   d.income,
    expenses: d.expenses,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 h-full">
      <p className="text-sm font-semibold shrink-0">{t('title')}</p>

      <div className="flex-1 flex flex-col justify-center gap-2">
        <ResponsiveContainer width="100%" height={72}>
          <BarChart data={chartData} barCategoryGap="20%" barGap={1} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 2 }} />
            <Bar dataKey="income"   fill="#10b981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex gap-3 justify-end">
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
