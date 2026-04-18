import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { useT } from '../../../../components/T'
import { ActionMenu } from '../../../../components/ActionMenu'
import { cn } from '../../../../lib/utils'
import { useFormatters } from '../../../../lib/format'
import { ICONS } from '../../../../components/IconPicker'
import { TYPE_DEFAULT_ICONS } from '../../lib/wallet-icons'
import type { Wallet } from '../../types/wallet.types'

interface WalletCardProps {
  wallet: Wallet
  dragListeners?: DraggableSyntheticListeners
  dragAttributes?: DraggableAttributes
  isDragging?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
}

const WalletCard = ({
  wallet,
  dragListeners,
  dragAttributes,
  isDragging = false,
  onEdit,
  onDelete,
  onClick,
}: WalletCardProps) => {
  const t = useT(import.meta.url)
  const { formatAmount: formatBalance } = useFormatters()
  const Icon = (wallet.icon && ICONS[wallet.icon]) || TYPE_DEFAULT_ICONS[wallet.type]

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/30',
        isDragging && 'shadow-lg opacity-75 bg-card',
      )}
    >
      <button
        onClick={e => e.stopPropagation()}
        className="text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
        {...dragListeners}
        {...dragAttributes}
        tabIndex={0}
        aria-label="Réordonner"
      >
        <GripVertical size={16} />
      </button>

      <div
        className="size-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: wallet.color + '28' }}
      >
        <Icon size={16} style={{ color: wallet.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{wallet.name}</p>
        {wallet.institution && (
          <p className="text-xs text-muted-foreground truncate">{wallet.institution}</p>
        )}
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums">{formatBalance(wallet.balance)}</p>
        <p className="text-xs text-muted-foreground">{t(wallet.type)}</p>
      </div>

      <div className="shrink-0">
        <ActionMenu
          items={[
            { label: t('edit'),   icon: Pencil, onClick: onEdit   ?? (() => {}) },
            { label: t('delete'), icon: Trash2, onClick: onDelete ?? (() => {}), destructive: true },
          ]}
        />
      </div>
    </div>
  )
}

export { WalletCard }
