import { memo, useState } from 'react'
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useFormatters } from '../../../../lib/format'
import { useT } from '../../../../components/T/T'
import trad from './trad.json'
import { Button } from '../../../../components/Button/Button'
import { ActionMenu } from '../../../../components/ActionMenu'
import { List } from '../../../../components/List'
import { TransactionModal } from '../TransactionModal'
import { TransactionDetail } from '../TransactionDetail'
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
import type { Transaction, PaginatedTransactions } from '../../types/transaction.types'


interface TransactionTableProps {
  result: PaginatedTransactions | undefined
  isPending: boolean
  page: number
  onPageChange: (page: number) => void
}

interface TransactionItemProps {
  tx: Transaction
  t: (k: string) => string
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

const TransactionItem = memo(({ tx, t, onOpen, onEdit, onDelete }: TransactionItemProps) => {
  const { formatAmount, formatDate } = useFormatters()
  const isIncome = tx.type === 'income'
  const isPending = tx.status === 'pending'

  return (
    <div
      role="button"
      tabIndex={0}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg"
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
    >
      {/* Accent bar */}
      <div className={cn(
        'w-1 self-stretch rounded-full shrink-0',
        isIncome ? 'bg-income' : tx.type === 'transfer' ? 'bg-transfer' : 'bg-expense',
      )} />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{tx.label}</p>
          {isPending && (
            <span className="shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-warning/10 text-warning">
              {t('status_pending')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {tx.wallet && (
            <span className="text-xs text-muted-foreground truncate">{tx.wallet.name}</span>
          )}
          <span className="text-xs text-muted-foreground shrink-0">· {formatDate(tx.date)}</span>
        </div>
      </div>

      {/* Amount + category */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={cn(
          'text-sm font-semibold tabular-nums',
          isIncome ? 'text-income' : 'text-foreground',
        )}>
          {isIncome ? '+' : '−'}{formatAmount(Math.abs(tx.amount))}
        </span>
        {tx.category && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: (tx.category.color ?? 'var(--muted-foreground)') + '22',
              color: tx.category.color ?? 'var(--muted-foreground)',
            }}
          >
            {tx.category.name}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0" onClick={e => e.stopPropagation()}>
        <ActionMenu
          items={[
            { label: t('edit'),   icon: Pencil, onClick: onEdit },
            { label: t('delete'), icon: Trash2, onClick: onDelete, destructive: true },
          ]}
        />
      </div>
    </div>
  )
})

const TransactionTable = ({ result, isPending, page, onPageChange }: TransactionTableProps) => {
  const t = useT(trad)
  const [detailTx, setDetailTx] = useState<Transaction | null>(null)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null)
  const { mutate: deleteTransaction } = useDeleteTransaction()

  const rows = result?.data ?? []
  const meta = result?.meta

  return (
    <div className="flex flex-col gap-3 pb-4">
      <List>
        {isPending && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {t('loading')}
          </div>
        )}
        {!isPending && rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <ArrowUpDown size={28} className="opacity-30" />
            <p className="text-sm">{t('empty')}</p>
            <p className="text-xs opacity-60">{t('empty_cta')}</p>
          </div>
        )}
        {!isPending && rows.map(tx => (
          <TransactionItem
            key={tx.id}
            tx={tx}
            t={t}
            onOpen={() => setDetailTx(tx)}
            onEdit={() => setEditingTx(tx)}
            onDelete={() => setDeletingTx(tx)}
          />
        ))}
      </List>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-4">
          <span>
            {t('page_info')
              .replace('{current}', String(meta.current_page))
              .replace('{total}', String(meta.last_page))}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              {t('prev')}
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= meta.last_page} onClick={() => onPageChange(page + 1)}>
              {t('next')}
            </Button>
          </div>
        </div>
      )}

      {detailTx && (
        <TransactionDetail
          transaction={detailTx}
          onClose={() => setDetailTx(null)}
          onEdit={() => { setEditingTx(detailTx); setDetailTx(null) }}
        />
      )}

      {editingTx && (
        <TransactionModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}

      <AlertDialog open={!!deletingTx} onOpenChange={o => { if (!o) setDeletingTx(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('delete_confirm').replace('{label}', deletingTx?.label ?? '')}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteTransaction(deletingTx!.id); setDeletingTx(null) }}
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

export { TransactionTable }
