import { X, Pencil, Trash2, ArrowRight, Tag } from 'lucide-react'
import { useT } from '../../../../components/T/T'
import { useFormatters } from '../../../../lib/format'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import type { Transaction } from '../../types/transaction.types'

interface TransactionDetailProps {
  transaction: Transaction
  onClose: () => void
  onEdit: () => void
}

const TransactionDetail = ({ transaction: tx, onClose, onEdit }: TransactionDetailProps) => {
  const t = useT(import.meta.url)
  const { formatAmount, formatDateFull } = useFormatters()
  const { mutate: deleteTransaction } = useDeleteTransaction()

  const isIncome   = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'

  const handleDelete = () => {
    if (!window.confirm(t('delete_confirm').replace('{label}', tx.label))) return
    deleteTransaction(tx.id, { onSuccess: onClose })
  }

  const amountColor = isIncome
    ? 'text-emerald-600 dark:text-emerald-400'
    : isTransfer
      ? 'text-blue-500'
      : 'text-foreground'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md m-4 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold">{t('title')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Montant + libellé */}
        <div className="flex flex-col items-center gap-1 py-6 px-5">
          <p className={`text-3xl font-bold tabular-nums ${amountColor}`}>
            {isIncome ? '+' : isTransfer ? '' : '−'}{formatAmount(Math.abs(tx.amount))}
          </p>
          <p className="text-base font-medium text-foreground mt-1">{tx.label}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
              isIncome
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                : isTransfer
                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
                  : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'
            }`}>
              {t(`type_${tx.type}`)}
            </span>
          </div>
        </div>

        {/* Détails */}
        <div className="flex flex-col divide-y divide-border border-t border-border">

          <Row label={t('date')} value={formatDateFull(tx.date)} />

          {/* Wallet(s) */}
          {isTransfer && tx.to_wallet ? (
            <div className="flex items-center justify-between px-5 py-3 gap-3">
              <span className="text-sm text-muted-foreground shrink-0">{t('wallets')}</span>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{tx.wallet?.name ?? '—'}</span>
                <ArrowRight size={14} className="text-muted-foreground shrink-0" />
                <span>{tx.to_wallet.name}</span>
              </div>
            </div>
          ) : (
            <Row label={t('wallet')} value={tx.wallet?.name ?? '—'} />
          )}

          {/* Catégorie */}
          {tx.category && (
            <div className="flex items-center justify-between px-5 py-3 gap-3">
              <span className="text-sm text-muted-foreground shrink-0">{t('category')}</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tx.category.color ?? '#94a3b8' }}
                />
                <span className="text-sm font-medium">{tx.category.name}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          {tx.tags.length > 0 && (
            <div className="flex items-start justify-between px-5 py-3 gap-3">
              <span className="text-sm text-muted-foreground shrink-0">{t('tags')}</span>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {tx.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border border-border"
                  >
                    <Tag size={10} />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {tx.notes && (
            <div className="flex flex-col gap-1.5 px-5 py-3">
              <span className="text-sm text-muted-foreground">{t('notes')}</span>
              <p className="text-sm text-foreground whitespace-pre-wrap">{tx.notes}</p>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="flex gap-2 px-5 py-4 border-t border-border">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={14} />
            {t('delete')}
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Pencil size={14} />
            {t('edit')}
          </button>
        </div>
      </div>
    </div>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between px-5 py-3 gap-3">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm font-medium text-right">{value}</span>
  </div>
)

export { TransactionDetail }
