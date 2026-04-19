import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useExpensesByCategory } from '../../hooks/useExpensesByCategory'
import { useFormatters } from '../../../../lib/format'
import { useT } from '../../../../components/T'
import trad from './trad.json'

interface TooltipPayloadItem {
  name: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  fmt: (n: number) => string
}

const buildMonthOptions = (numLocale: string) => {
  const opts: { label: string; from: string; to: string }[] = []
  for (let i = 0; i < 6; i++) {
    const d    = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const from = d.toISOString().slice(0, 7) + '-01'
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const to   = last.toISOString().slice(0, 10)
    opts.push({
      label: d.toLocaleDateString(numLocale, { month: 'long', year: 'numeric' }),
      from,
      to,
    })
  }
  return opts
}

const CustomTooltip = ({ active, payload, fmt }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{name}</p>
      <p className="text-muted-foreground">{fmt(value)}</p>
    </div>
  )
}

const CategoryDonut = () => {
  const [monthIdx, setMonthIdx] = useState(0)
  const t = useT(trad)
  const { formatAmountShort: fmt, numLocale } = useFormatters()
  const MONTH_OPTIONS = useMemo(() => buildMonthOptions(numLocale), [numLocale])
  const selected = MONTH_OPTIONS[monthIdx]

  const { data = [], isLoading } = useExpensesByCategory(selected.from, selected.to)

  const total = useMemo(() => data.reduce((s, c) => s + c.amount, 0), [data])

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{t('title')}</p>
          <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
        </div>
        <label htmlFor="donut-month-select" className="sr-only">{t('month_label')}</label>
        <select
          id="donut-month-select"
          value={monthIdx}
          onChange={e => setMonthIdx(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-background text-foreground px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {MONTH_OPTIONS.map((o, i) => (
            <option key={o.from} value={i}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          {t('loading')}
        </div>
      ) : data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          {t('empty')}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {data.map((cat) => (
                    <Cell key={cat.category_id ?? cat.name} fill={cat.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip fmt={fmt} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col divide-y divide-border">
            {data.map((cat) => {
              const pct = total > 0 ? (cat.amount / total * 100) : 0
              return (
                <div key={cat.category_id ?? cat.name} className="flex items-center gap-3 py-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-sm truncate">{cat.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                    {pct.toFixed(1)}%
                  </span>
                  <span className="text-sm font-medium tabular-nums w-24 text-right">
                    {fmt(cat.amount)}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center gap-3 py-2.5">
              <span className="w-2.5 h-2.5 shrink-0" />
              <span className="flex-1 text-sm font-semibold">{t('total')}</span>
              <span className="text-xs text-muted-foreground w-10" />
              <span className="text-sm font-bold tabular-nums w-24 text-right">{fmt(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export { CategoryDonut }
