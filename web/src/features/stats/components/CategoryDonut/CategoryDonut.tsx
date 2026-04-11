import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useExpensesByCategory } from '../../hooks/useExpensesByCategory'

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

const MONTH_OPTIONS = (() => {
  const opts: { label: string; from: string; to: string }[] = []
  for (let i = 0; i < 6; i++) {
    const d    = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const from = d.toISOString().slice(0, 7) + '-01'
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const to   = last.toISOString().slice(0, 10)
    opts.push({
      label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      from,
      to,
    })
  }
  return opts
})()

const CustomTooltip = ({ active, payload }: any) => {
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
  const selected = MONTH_OPTIONS[monthIdx]

  const { data = [], isLoading } = useExpensesByCategory(selected.from, selected.to)

  const total = useMemo(() => data.reduce((s, c) => s + c.amount, 0), [data])

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Dépenses par catégorie</p>
          <p className="text-xs text-muted-foreground">Répartition mensuelle</p>
        </div>
        <select
          value={monthIdx}
          onChange={e => setMonthIdx(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-background text-foreground px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {MONTH_OPTIONS.map((o, i) => (
            <option key={i} value={i}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          Chargement…
        </div>
      ) : data.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
          Aucune dépense ce mois
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
                  {data.map((cat, i) => (
                    <Cell key={cat.category_id ?? i} fill={cat.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tableau détaillé */}
          <div className="flex flex-col divide-y divide-border">
            {data.map((cat, i) => {
              const pct = total > 0 ? (cat.amount / total * 100) : 0
              return (
                <div key={cat.category_id ?? i} className="flex items-center gap-3 py-2.5">
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
              <span className="flex-1 text-sm font-semibold">Total</span>
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
