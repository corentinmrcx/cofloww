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
import { Plus } from 'lucide-react'
import { useT } from '../../../../components/T'
import { WalletCard } from '../WalletCard'
import { useReorderWallets } from '../../hooks/useReorderWallets'
import type { Wallet } from '../../types/wallet.types'

const SortableWalletCard = ({ wallet }: { wallet: Wallet }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: wallet.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <WalletCard
        wallet={wallet}
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  )
}

interface WalletListProps {
  wallets: Wallet[]
  onAddClick: () => void
}

const WalletList = ({ wallets, onAddClick }: WalletListProps) => {
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

  return (
    <div className="flex flex-col gap-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(w => w.id)} strategy={verticalListSortingStrategy}>
          {items.map(wallet => (
            <SortableWalletCard key={wallet.id} wallet={wallet} />
          ))}
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">{t('empty')}</p>
      )}

      <button
        onClick={onAddClick}
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors mt-1"
      >
        <Plus size={15} />
        {t('add')}
      </button>
    </div>
  )
}

export { WalletList }
