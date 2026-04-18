import { useEffect, useRef, useState } from 'react'
import { X, Pencil, Trash2, ArrowRight, Tag } from 'lucide-react'
import { useT } from '../../../../components/T/T'
import { Separator } from '../../../../components/ui/separator'
import { cn } from '../../../../lib/utils'
import { useFormatters } from '../../../../lib/format'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog'
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
  const closeRef = useRef<HTMLButtonElement>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isIncome   = tx.type === 'income'
  const isTransfer = tx.type === 'transfer'

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const amountColor = isIncome
    ? 'text-income'
    : isTransfer
      ? 'text-transfer'
      : 'text-foreground'

  const typeBadgeClass = isIncome
    ? 'bg-income/10 text-income border-income/20'
    : isTransfer
      ? 'bg-transfer/10 text-transfer border-transfer/20'
      : 'bg-expense/10 text-expense border-expense/20'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tx-detail-title"
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md m-4 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id="tx-detail-title" className="text-base font-semibold">{t('title')}</h2>
          <button
            ref={closeRef}
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* Montant + libellé */}
        <div className="flex flex-col items-center gap-1 py-6 px-5">
          <p className={cn('text-3xl font-bold tabular-nums', amountColor)}>
            {isIncome ? '+' : isTransfer ? '' : '−'}{formatAmount(Math.abs(tx.amount))}
          </p>
          <p className="text-base font-medium text-foreground mt-1">{tx.label}</p>
          <div className="mt-2">
            <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border', typeBadgeClass)}>
              {t(`type_${tx.type}`)}
            </span>
          </div>
        </div>

        {/* Détails */}
        <div className="flex flex-col divide-y divide-border border-t border-border">

          <Row label={t('date')} value={formatDateFull(tx.date)} />

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

          {tx.category && (
            <div className="flex items-center justify-between px-5 py-3 gap-3">
              <span className="text-sm text-muted-foreground shrink-0">{t('category')}</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tx.category.color ?? 'var(--muted-foreground)' }}
                />
                <span className="text-sm font-medium">{tx.category.name}</span>
              </div>
            </div>
          )}

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

          {tx.notes && (
            <div className="flex flex-col gap-1.5 px-5 py-3">
              <span className="text-sm text-muted-foreground">{t('notes')}</span>
              <p className="text-sm text-foreground whitespace-pre-wrap">{tx.notes}</p>
            </div>
          )}

        </div>

        <Separator />
        {/* Footer actions */}
        <div className="flex gap-2 px-5 py-4">
          <button
            onClick={() => setShowDeleteDialog(true)}
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
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('delete_confirm').replace('{label}', tx.label)}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteTransaction(tx.id, { onSuccess: onClose })}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
