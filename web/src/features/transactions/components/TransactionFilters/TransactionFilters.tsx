import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useT } from '../../../../components/T/T'
import { useWallets } from '../../../wallet/hooks/useWallets'
import { useCategories } from '../../../category/hooks/useCategories'
import { useTags } from '../../../tag/hooks/useTags'
import type { TransactionFilters as Filters } from '../../types/transaction.types'

const SELECT_CLASS =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring'

const DATE_CLASS =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring'

interface TransactionFiltersProps {
  filters: Filters
  onChange: (key: keyof Filters, value: string | undefined) => void
  onReset: () => void
  hasActive: boolean
  activeCount: number
}

const TransactionFilters = ({ filters, onChange, onReset, hasActive, activeCount }: TransactionFiltersProps) => {
  const t = useT(import.meta.url)
  const { data: wallets = [] } = useWallets()
  const { data: categories = [] } = useCategories()
  const { data: tags = [] } = useTags()

  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-md border text-sm transition-colors',
          open || hasActive
            ? 'border-primary text-primary bg-primary/5'
            : 'border-input text-muted-foreground hover:text-foreground hover:bg-accent',
        )}
      >
        <SlidersHorizontal size={15} />
        {t('filters')}
        {hasActive && (
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop — semi-opaque sur mobile, transparent sur desktop */}
          <div
            className="fixed inset-0 z-30 bg-black/30 md:bg-transparent"
            onClick={() => setOpen(false)}
          />

          {/* Panel — bottom sheet sur mobile, dropdown sur desktop */}
          <div className={cn(
            'fixed inset-x-0 bottom-0 z-40 bg-popover p-4 flex flex-col gap-3',
            'rounded-t-2xl border-t border-border shadow-xl',
            'max-h-[85vh] overflow-y-auto',
            'md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:mt-2',
            'md:w-72 md:max-h-none md:overflow-visible',
            'md:rounded-xl md:border md:shadow-lg',
          )}>
            {/* Drag handle — mobile uniquement */}
            <div className="flex justify-center mb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('wallet')}</label>
              <select
                className={SELECT_CLASS}
                value={filters.wallet_id ?? ''}
                onChange={e => onChange('wallet_id', e.target.value || undefined)}
              >
                <option value="">{t('all_wallets')}</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('type')}</label>
              <select
                className={SELECT_CLASS}
                value={filters.type ?? ''}
                onChange={e => onChange('type', e.target.value || undefined)}
              >
                <option value="">{t('all_types')}</option>
                <option value="income">{t('type_income')}</option>
                <option value="expense">{t('type_expense')}</option>
                <option value="transfer">{t('type_transfer')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('category')}</label>
              <select
                className={SELECT_CLASS}
                value={filters.category_id ?? ''}
                onChange={e => onChange('category_id', e.target.value || undefined)}
              >
                <option value="">{t('all_categories')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('tag')}</label>
              <select
                className={SELECT_CLASS}
                value={filters.tag_id ?? ''}
                onChange={e => onChange('tag_id', e.target.value || undefined)}
              >
                <option value="">{t('all_tags')}</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('date_from')}</label>
                <input
                  type="date"
                  className={DATE_CLASS}
                  value={filters.date_from ?? ''}
                  onChange={e => onChange('date_from', e.target.value || undefined)}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('date_to')}</label>
                <input
                  type="date"
                  className={DATE_CLASS}
                  value={filters.date_to ?? ''}
                  onChange={e => onChange('date_to', e.target.value || undefined)}
                />
              </div>
            </div>

            {hasActive && (
              <button
                type="button"
                onClick={() => { onReset(); setOpen(false) }}
                className="flex items-center justify-center gap-1.5 h-8 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X size={13} />
                {t('reset')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export { TransactionFilters }
