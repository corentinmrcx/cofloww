import { useNavigate } from 'react-router'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { ChevronRight } from 'lucide-react'
import { ICONS } from '../../../../components/IconPicker'
import type { DashboardWallet } from '../../types/dashboard.types'

const fmt = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

interface SparklineProps {
  data: number[]
  color: string
}

const Sparkline = ({ data, color }: SparklineProps) => {
  const points = data.map((v, i) => ({ v }))
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

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-sm font-semibold">Comptes</p>
        <button
          onClick={() => navigate('/wallets')}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
        >
          Voir tout <ChevronRight size={13} />
        </button>
      </div>

      <div className="divide-y divide-border">
        {wallets.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">Aucun compte</p>
        ) : (
          wallets.map(wallet => {
            const Icon = wallet.icon ? ICONS[wallet.icon] : null
            return (
              <button
                key={wallet.id}
                onClick={() => navigate(`/wallets/${wallet.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (wallet.color ?? '#94a3b8') + '28' }}
                >
                  {Icon
                    ? <Icon size={15} style={{ color: wallet.color ?? '#94a3b8' }} />
                    : <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: wallet.color ?? '#94a3b8' }} />
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
                    color={wallet.color ?? '#10b981'}
                  />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export { WalletsWidget }
