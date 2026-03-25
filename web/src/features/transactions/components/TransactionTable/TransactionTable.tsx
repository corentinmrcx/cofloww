import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useT } from '../../../../components/T/T'
import { Button } from '../../../../components/Button/Button'
import { ActionMenu } from '../../../../components/ActionMenu'
import { List } from '../../../../components/List'
import { TransactionModal } from '../TransactionModal'
import { useDeleteTransaction } from '../../hooks/useDeleteTransaction'
import type { Transaction, PaginatedTransactions } from '../../types/transaction.types'

const MODULE_URL = import.meta.url

const formatAmount = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100)

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(iso))

interface TransactionTableProps {
  result: PaginatedTransactions | undefined
  isPending: boolean
  page: number
  onPageChange: (page: number) => void
}

interface TransactionItemProps {
  tx: Transaction
  t: (k: string) => string
  onEdit: () => void
  onDelete: () => void
}

const TransactionItem = ({ tx, t, onEdit, onDelete }: TransactionItemProps) => {
  const isIncome = tx.type === 'income'
  const isPending = tx.status === 'pending'

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
      {/* Accent bar */}
      <div className={cn(
        'w-1 self-stretch rounded-full shrink-0',
        isIncome ? 'bg-green-500' : tx.type === 'transfer' ? 'bg-blue-400' : 'bg-red-400',
      )} />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{tx.label}</p>
          {isPending && (
            <span className="shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
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
          isIncome ? 'text-green-600 dark:text-green-400' : 'text-foreground',
        )}>
          {isIncome ? '+' : '−'}{formatAmount(Math.abs(tx.amount))}
        </span>
        {tx.category && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: (tx.category.color ?? '#888') + '22',
              color: tx.category.color ?? '#888',
            }}
          >
            {tx.category.name}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0">
        <ActionMenu
          items={[
            { label: t('edit'),   icon: Pencil, onClick: onEdit },
            { label: t('delete'), icon: Trash2, onClick: onDelete, destructive: true },
          ]}
        />
      </div>
    </div>
  )
}

const TransactionTable = ({ result, isPending, page, onPageChange }: TransactionTableProps) => {
  const t = useT(MODULE_URL)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const { mutate: deleteTransaction } = useDeleteTransaction()

  const rows = result?.data ?? []
  const meta = result?.meta

  const handleDelete = (tx: Transaction) => {
    if (!window.confirm(`Supprimer "${tx.label}" ?`)) return
    deleteTransaction(tx.id)
  }

  return (
    <div className="flex flex-col gap-3">
      <List>
        {isPending && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {t('loading')}
          </div>
        )}
        {!isPending && rows.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {t('empty')}
          </div>
        )}
        {!isPending && rows.map(tx => (
          <TransactionItem
            key={tx.id}
            tx={tx}
            t={t}
            onEdit={() => setEditingTx(tx)}
            onDelete={() => handleDelete(tx)}
          />
        ))}
      </List>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
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

      {editingTx && (
        <TransactionModal
          transaction={editingTx}
          onClose={() => setEditingTx(null)}
        />
      )}
    </div>
  )
}

export { TransactionTable }
