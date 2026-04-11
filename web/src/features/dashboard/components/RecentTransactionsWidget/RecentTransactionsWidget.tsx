import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { ICONS } from '../../../../components/IconPicker'
import type { DashboardTransaction } from '../../types/dashboard.types'

const fmt = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Math.abs(cents) / 100)

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface RecentTransactionsWidgetProps {
  transactions: DashboardTransaction[]
}

const RecentTransactionsWidget = ({ transactions }: RecentTransactionsWidgetProps) => {
  const navigate = useNavigate()

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-sm font-semibold">Derniers mouvements</p>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
        >
          Voir tout <ChevronRight size={13} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center divide-y divide-border">
        {transactions.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            Aucune transaction
          </p>
        ) : (
          transactions.map(tx => {
            const Icon    = tx.category?.icon ? ICONS[tx.category.icon] : null
            const catColor = tx.category?.color ?? '#94a3b8'
            const isIncome = tx.type === 'income'

            return (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: catColor + '28' }}
                >
                  {Icon
                    ? <Icon size={13} style={{ color: catColor }} />
                    : <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: catColor }} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category?.name ?? tx.wallet?.name ?? '—'} · {formatDate(tx.date)}
                  </p>
                </div>

                <span className={`text-sm font-semibold tabular-nums shrink-0 ${
                  isIncome
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : tx.type === 'transfer'
                      ? 'text-muted-foreground'
                      : 'text-foreground'
                }`}>
                  {isIncome ? '+' : tx.type === 'expense' ? '−' : ''}{fmt(tx.amount)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export { RecentTransactionsWidget }
