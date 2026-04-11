import { useNavigate } from 'react-router'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ChevronRight } from 'lucide-react'
import type { InvestableSummary } from '../../types/dashboard.types'

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

interface InvestWidgetProps {
  data: InvestableSummary
}

const InvestWidget = ({ data }: InvestWidgetProps) => {
  const navigate = useNavigate()

  const hasAllocations = data.allocations.length > 0
  const donutData      = hasAllocations
    ? data.allocations
    : [{ wallet: { color: '#e2e8f0' }, pct: 100, amount: 0 }]

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-sm font-semibold">Investissements</p>
        <button
          onClick={() => navigate('/investments')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
        >
          Configurer <ChevronRight size={13} />
        </button>
      </div>

      <div className="px-4 pb-4 flex items-center gap-4">
        {/* Mini donut */}
        <div className="shrink-0">
          <ResponsiveContainer width={72} height={72}>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="pct"
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={34}
                paddingAngle={hasAllocations ? 2 : 0}
                startAngle={90}
                endAngle={-270}
              >
                {donutData.map((a, i) => (
                  <Cell key={i} fill={a.wallet.color ?? '#94a3b8'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">À investir ce mois</p>
          <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {fmt(data.amount)}
          </p>
          {data.source_wallet && (
            <p className="text-xs text-muted-foreground mt-0.5">
              depuis {data.source_wallet.name}
            </p>
          )}
        </div>
      </div>

      {hasAllocations && (
        <div className="border-t border-border px-4 py-2 flex flex-col gap-1.5">
          {data.allocations.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: a.wallet.color }}
              />
              <span className="flex-1 text-xs text-muted-foreground truncate">{a.wallet.name}</span>
              <span className="text-xs font-medium tabular-nums">{fmt(a.amount)}</span>
              <span className="text-xs text-muted-foreground w-8 text-right">{a.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { InvestWidget }
