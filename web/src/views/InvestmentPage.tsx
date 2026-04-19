import { useState, useEffect, useMemo } from 'react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { useDebounce } from '../hooks/useDebounce'
import { useWallets } from '../features/wallet/hooks/useWallets'
import { useComputeInvestment } from '../features/investment/hooks/useComputeInvestment'
import { WalletInvestmentRow } from '../features/investment/components/WalletInvestmentRow'
import { List } from '../components/List'
import { useT } from '../components/T'
import { useLangStore } from '../stores/langStore'
import { useFormatters } from '../lib/format'
import { usePreferencesStore } from '../stores/preferencesStore'
import { cn } from '../lib/utils'

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€', USD: '$', GBP: '£', CHF: 'Fr', CAD: 'CA$',
}

const buildMonthOptions = (locale: string) => {
  const options: { label: string; month: number; year: number }[] = []
  const base = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1)
    const label = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase())
    options.push({ label, month: d.getMonth() + 1, year: d.getFullYear() })
  }
  return options
}

const INPUT_CLASS = 'h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

interface FormValues {
  seuil: number
  pas_arrondi: number
}

const buildPasOptions = (symbol: string) => [
  { value: 100,  label: `1 ${symbol}`  },
  { value: 500,  label: `5 ${symbol}`  },
  { value: 1000, label: `10 ${symbol}` },
  { value: 5000, label: `50 ${symbol}` },
]

const InvestmentPage = () => {
  const { data: wallets = [] } = useWallets()
  const t = useT(import.meta.url)
  const { lang } = useLangStore()
  const { formatAmountShort: fmt } = useFormatters()
  const { currency } = usePreferencesStore()
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency
  const PAS_OPTIONS = useMemo(() => buildPasOptions(currencySymbol), [currencySymbol])
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const monthOptions = useMemo(() => buildMonthOptions(locale), [locale])

  // Compte source — défaut : compte is_default ou premier de la liste
  const [sourceWalletId, setSourceWalletId] = useState<string>('')

  useEffect(() => {
    if (!sourceWalletId && wallets.length > 0) {
      const def = wallets.find(w => w.is_default) ?? wallets[0]
      setSourceWalletId(def.id)
    }
  }, [wallets, sourceWalletId])

  // Mois cible — défaut : mois en cours
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(0)

  const { control } = useForm<FormValues>({
    defaultValues: { seuil: 0, pas_arrondi: 500 },
  })
  const formValues = useWatch({ control })

  const selectedMonth = monthOptions[selectedMonthIdx]

  const debouncedParams = useDebounce(
    {
      wallet_id:   sourceWalletId,
      seuil:       formValues.seuil       ?? 0,
      pas_arrondi: formValues.pas_arrondi ?? 1000,
      month:       selectedMonth?.month ?? 0,
      year:        selectedMonth?.year  ?? 0,
    },
    300,
  )

  const { data: compute } = useComputeInvestment(debouncedParams)

  const sourceWallet  = wallets.find(w => w.id === sourceWalletId)
  const allocationMap = useMemo(
    () => new Map(compute?.allocations.map(a => [a.wallet.id, a.amount]) ?? []),
    [compute?.allocations],
  )

  const SAVINGS_TYPES = ['savings', 'investment', 'crypto'] as const
  const { savingsWallets, walletsWithPct, walletsWithout } = useMemo(() => {
    const savings = wallets.filter(w => SAVINGS_TYPES.includes(w.type as typeof SAVINGS_TYPES[number]))
    return {
      savingsWallets: savings,
      walletsWithPct: savings.filter(w => w.investment_target_pct != null && w.investment_target_pct > 0),
      walletsWithout: savings.filter(w => !w.investment_target_pct),
    }
  }, [wallets])

  const totalPct = walletsWithPct.reduce((s, w) => s + (w.investment_target_pct ?? 0), 0)
  const pctOver  = totalPct > 100

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{t('invest_title')}</h1>

      {/* Paramètres */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">

        {/* Ligne 1 : compte source + mois */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('invest_source')}</label>
            <select
              value={sourceWalletId}
              onChange={e => setSourceWalletId(e.target.value)}
              className={INPUT_CLASS}
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} — {fmt(w.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('invest_month')}</label>
            <select
              value={selectedMonthIdx}
              onChange={e => setSelectedMonthIdx(Number(e.target.value))}
              className={INPUT_CLASS}
            >
              {monthOptions.map((o, i) => (
                <option key={`${o.year}-${o.month}`} value={i}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ligne 2 : seuil + arrondi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('invest_safety')}</label>
            <Controller
              name="seuil"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={field.value === 0 ? '' : field.value / 100}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      field.onChange(isNaN(v) ? 0 : Math.round(v * 100))
                    }}
                    placeholder="0"
                    className={cn(INPUT_CLASS, 'pr-8')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencySymbol}</span>
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t('invest_rounding')}</label>
            <Controller
              name="pas_arrondi"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                  className={INPUT_CLASS}
                >
                  {PAS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>
      </div>

      {/* Résumé du calcul */}
      {compute && sourceWallet && (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {selectedMonth?.label}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('invest_balance')} — {sourceWallet.name}</span>
            <span className="text-sm tabular-nums font-medium">{fmt(sourceWallet.balance)}</span>
          </div>

          {compute.depenses > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('invest_expenses')}</span>
              <span className="text-sm tabular-nums text-destructive">− {fmt(compute.depenses)}</span>
            </div>
          )}

          {compute.seuil > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Épargne de sécurité</span>
              <span className="text-sm tabular-nums text-destructive">− {fmt(compute.seuil)}</span>
            </div>
          )}

          <div className="h-px bg-border my-1" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{t('invest_to_invest')}</p>
              <p className="text-xs text-muted-foreground">{t('invest_distribute')}</p>
            </div>
            <span className="text-2xl font-bold tabular-nums text-income">
              {fmt(compute.investable)}
            </span>
          </div>

          {compute.reste > 0 && (
            <p className="text-xs text-muted-foreground text-right">
              {fmt(compute.reste)} {t('invest_remainder')}
            </p>
          )}
        </div>
      )}

      {/* Répartition par compte */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{t('invest_allocation')}</p>
            <p className="text-xs text-muted-foreground">{t('invest_pct_hint')}</p>
          </div>
          {totalPct > 0 && (
            <span className={cn('text-sm font-semibold tabular-nums', pctOver ? 'text-destructive' : 'text-muted-foreground')}>
              {totalPct % 1 === 0 ? totalPct : totalPct.toFixed(1)}%
              {pctOver && ' ⚠'}
            </span>
          )}
        </div>

        {savingsWallets.length === 0 ? (
          <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
            {t('invest_no_savings')}
          </div>
        ) : (
          <List>
            {[...walletsWithPct, ...walletsWithout].map(wallet => (
              <WalletInvestmentRow
                key={wallet.id}
                wallet={wallet}
                allocation={allocationMap.get(wallet.id)}
                investable={compute?.investable}
                pasArrondi={debouncedParams.pas_arrondi}
              />
            ))}
          </List>
        )}
      </div>
    </div>
  )
}

export { InvestmentPage }
