import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { ICONS } from '../../../../components/IconPicker'
import { useT } from '../../../../components/T'
import { useFormatters } from '../../../../lib/format'
import { cn } from '../../../../lib/utils'
import type { DashboardTransaction } from '../../types/dashboard.types'
import trad from './trad.json'

interface RecentTransactionsWidgetProps {
  transactions: DashboardTransaction[]
}

const RecentTransactionsWidget = ({ transactions }: RecentTransactionsWidgetProps) => {
  const navigate = useNavigate()
  const t = useT(trad)
  const { formatAmount: fmt, formatDate } = useFormatters()

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-sm font-semibold">{t('title')}</p>
        <button
          onClick={() => navigate('/transactions')}
          aria-label={t('see_all_label')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          {t('see_all')} <ChevronRight size={13} />
        </button>
      </div>

      <ul className="flex-1 flex flex-col justify-center divide-y divide-border">
        {transactions.length === 0 ? (
          <li className="px-4 py-6 text-sm text-muted-foreground text-center">
            {t('empty')}
          </li>
        ) : (
          transactions.map(tx => {
            const Icon    = tx.category?.icon ? ICONS[tx.category.icon] : null
            const catColor = tx.category?.color ?? 'var(--muted-foreground)'
            const isIncome = tx.type === 'income'

            return (
              <li key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
                <div
                  className="size-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: catColor + '28' }}
                >
                  {Icon
                    ? <Icon size={13} style={{ color: catColor }} />
                    : <span className="size-2 rounded-full block" style={{ backgroundColor: catColor }} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{tx.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.category?.name ?? tx.wallet?.name ?? '—'} · {formatDate(tx.date)}
                  </p>
                </div>

                <span className={cn(
                  'text-sm font-semibold tabular-nums shrink-0',
                  isIncome ? 'text-income' : tx.type === 'transfer' ? 'text-muted-foreground' : 'text-foreground',
                )}>
                  {isIncome ? '+' : tx.type === 'expense' ? '−' : ''}{fmt(Math.abs(tx.amount))}
                </span>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

export { RecentTransactionsWidget }
