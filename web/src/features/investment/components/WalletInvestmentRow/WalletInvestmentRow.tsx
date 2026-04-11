import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../../../../hooks/useDebounce'
import { useSetInvestmentPct } from '../../hooks/useSetInvestmentPct'
import { cn } from '../../../../lib/utils'
import { ICONS } from '../../../../components/IconPicker'
import type { Wallet } from '../../../wallet/types/wallet.types'

const fmtEuros = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'

interface WalletInvestmentRowProps {
  wallet: Wallet
  allocation?: number   // montant calculé par le serveur (source de vérité)
  investable?: number   // montant investissable total, pour preview immédiat côté client
  pasArrondi?: number
}

const WalletInvestmentRow = ({ wallet, allocation, investable, pasArrondi = 100 }: WalletInvestmentRowProps) => {
  const [pctInput, setPctInput] = useState(
    wallet.investment_target_pct != null && wallet.investment_target_pct > 0
      ? String(wallet.investment_target_pct)
      : '',
  )

  const debouncedPct   = useDebounce(pctInput, 400)
  const { mutate: setPct } = useSetInvestmentPct(wallet.id)
  const prevDebounced  = useRef<string | null>(null)

  useEffect(() => {
    if (prevDebounced.current === null) {
      prevDebounced.current = debouncedPct
      return
    }
    if (debouncedPct === prevDebounced.current) return
    prevDebounced.current = debouncedPct

    const num = parseFloat(debouncedPct.replace(',', '.'))
    if (debouncedPct === '' || debouncedPct === '0' || isNaN(num)) {
      setPct(null)
    } else if (num > 0 && num <= 100) {
      setPct(num)
    }
  }, [debouncedPct]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync depuis le serveur sans écraser une saisie en cours
  useEffect(() => {
    const serverVal = wallet.investment_target_pct != null && wallet.investment_target_pct > 0
      ? String(wallet.investment_target_pct)
      : ''
    if (pctInput === debouncedPct) {
      setPctInput(serverVal)
      prevDebounced.current = serverVal
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.investment_target_pct])

  const parsedPct = parseFloat(pctInput.replace(',', '.'))
  const hasTarget = (!isNaN(parsedPct) && parsedPct > 0)
    || (wallet.investment_target_pct != null && wallet.investment_target_pct > 0)

  // Montant à afficher : serveur en priorité, sinon calcul client immédiat
  const localAmount = (investable != null && !isNaN(parsedPct) && parsedPct > 0)
    ? Math.floor(investable * parsedPct / 100 / pasArrondi) * pasArrondi
    : undefined
  const displayAmount = allocation ?? localAmount

  const Icon = wallet.icon ? ICONS[wallet.icon] : null

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 transition-all',
      !hasTarget && 'opacity-40',
    )}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: wallet.color + '28' }}
      >
        {Icon
          ? <Icon size={15} style={{ color: wallet.color }} />
          : <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: wallet.color }} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{wallet.name}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          Solde : {fmtEuros(wallet.balance)}
        </p>
      </div>

      {/* Montant à verser — dès que l'utilisateur tape un %, calcul immédiat */}
      {hasTarget && displayAmount !== undefined && (
        <div className="text-right shrink-0 mr-1">
          <p className="text-xs text-muted-foreground">à verser</p>
          <p className={cn(
            'text-sm font-bold tabular-nums',
            displayAmount > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground',
          )}>
            {fmtEuros(displayAmount)}
          </p>
        </div>
      )}

      <div className="relative shrink-0 w-20">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          max="100"
          step="0.5"
          value={pctInput}
          onChange={e => setPctInput(e.target.value)}
          placeholder="—"
          className="h-8 w-full rounded-md border border-input bg-background text-foreground px-2 pr-6 text-sm text-right tabular-nums placeholder:text-center placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          %
        </span>
      </div>
    </div>
  )
}

export { WalletInvestmentRow }
