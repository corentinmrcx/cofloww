import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router'
import { useT } from '../../../../components/T'
import { List } from '../../../../components/List'
import { WalletCard } from '../WalletCard'
import { useReorderWallets } from '../../hooks/useReorderWallets'
import type { Wallet } from '../../types/wallet.types'

const SortableWalletCard = ({ wallet, onEdit, onDelete }: { wallet: Wallet; onEdit: () => void; onDelete: () => void }) => {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: wallet.id,
  })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <WalletCard
        wallet={wallet}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
        onEdit={onEdit}
        onDelete={onDelete}
        onClick={() => navigate(`/wallets/${wallet.id}`)}
      />
    </div>
  )
}

interface WalletListProps {
  wallets: Wallet[]
  onEditClick: (wallet: Wallet) => void
  onDeleteClick: (wallet: Wallet) => void
}

const WalletList = ({ wallets, onEditClick, onDeleteClick }: WalletListProps) => {
  const t = useT(import.meta.url)
  const [items, setItems] = useState(wallets)
  const { mutate: reorder } = useReorderWallets()

  useEffect(() => { setItems(wallets) }, [wallets])

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(w => w.id === active.id)
    const newIndex = items.findIndex(w => w.id === over.id)
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    reorder(next.map((w, i) => ({ id: w.id, sort_order: i })))
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border py-16 text-center text-sm text-muted-foreground">
        {t('empty')}
      </div>
    )
  }

  return (
    <List>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(w => w.id)} strategy={verticalListSortingStrategy}>
          {items.map(wallet => (
            <SortableWalletCard
              key={wallet.id}
              wallet={wallet}
              onEdit={() => onEditClick(wallet)}
              onDelete={() => onDeleteClick(wallet)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </List>
  )
}

export { WalletList }
