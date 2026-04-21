import { useNavigate } from 'react-router'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { ChevronRight } from 'lucide-react'
import { ICONS } from '../../../../components/IconPicker'
import { useT } from '../../../../components/T'
import type { DashboardWallet } from '../../types/dashboard.types'

import { useFormatters } from '../../../../lib/format'
import trad from './trad.json'

interface SparklineProps {
  data: number[]
  color: string
}

const Sparkline = ({ data, color }: SparklineProps) => {
  const points = data.map(v => ({ v }))
  return (
    <ResponsiveContainer width={56} height={28}>
      <LineChart data={points}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface WalletsWidgetProps {
  wallets: DashboardWallet[]
}

const WalletsWidget = ({ wallets }: WalletsWidgetProps) => {
  const navigate = useNavigate()
  const t = useT(trad)
  const { formatAmountShort: fmt } = useFormatters()

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-sm font-semibold">{t('title')}</p>
        <button
          onClick={() => navigate('/wallets')}
          aria-label={t('see_all_label')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
        >
          {t('see_all')} <ChevronRight size={13} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center divide-y divide-border">
        {wallets.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">{t('empty')}</p>
        ) : (
          wallets.slice(0, 3).map(wallet => {
            const Icon = wallet.icon ? ICONS[wallet.icon] : null
            return (
              <button
                key={wallet.id}
                onClick={() => navigate(`/wallets/${wallet.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
              >
                <div
                  className="size-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (wallet.color ?? 'var(--muted-foreground)') + '28' }}
                >
                  {Icon
                    ? <Icon size={15} style={{ color: wallet.color ?? 'var(--muted-foreground)' }} />
                    : <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: wallet.color ?? 'var(--muted-foreground)' }} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{wallet.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {fmt(wallet.balance)}
                  </p>
                </div>

                {wallet.sparkline.length > 1 && (
                  <Sparkline
                    data={wallet.sparkline}
                    color={wallet.color ?? 'var(--income)'}
                  />
                )}
              </button>
            )
          })
        )}
        {wallets.length > 3 && (
          <button
            onClick={() => navigate('/wallets')}
            className="w-full px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-b-xl"
          >
            {t('and_more').replace('{n}', String(wallets.length - 3))}
          </button>
        )}
      </div>
    </div>
  )
}

export { WalletsWidget }
