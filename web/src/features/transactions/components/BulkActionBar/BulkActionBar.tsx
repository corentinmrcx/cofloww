import { useState } from 'react'
import { Trash2, Tag, FolderOpen, X } from 'lucide-react'
import { useT } from '../../../../components/T/T'
import { useCategories } from '../../../category/hooks/useCategories'
import { useTags } from '../../../tag/hooks/useTags'
import { useBulkDeleteTransactions } from '../../hooks/useBulkDeleteTransactions'
import { useBulkSetCategory, useBulkAddTag } from '../../hooks/useBulkUpdateTransactions'
import type { Transaction } from '../../types/transaction.types'

interface BulkActionBarProps {
  selectedIds: string[]
  transactions: Transaction[]
  onClearSelection: () => void
  onSelectAll: () => void
  allSelected: boolean
}

type ActivePanel = 'category' | 'tag' | null

const BulkActionBar = ({ selectedIds, transactions, onClearSelection, onSelectAll, allSelected }: BulkActionBarProps) => {
  const t = useT(import.meta.url)
  const { data: categories = [] } = useCategories()
  const { data: tags = [] } = useTags()

  const { mutate: bulkDelete, isPending: isDeleting } = useBulkDeleteTransactions()
  const { mutate: bulkSetCategory, isPending: isSettingCategory } = useBulkSetCategory()
  const { mutate: bulkAddTag, isPending: isAddingTag } = useBulkAddTag()

  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const isPending = isDeleting || isSettingCategory || isAddingTag

  const handleDelete = () => {
    const confirmed = window.confirm(
      t('delete_confirm').replace('{n}', String(selectedIds.length))
    )
    if (!confirmed) return
    bulkDelete(selectedIds, { onSuccess: onClearSelection })
  }

  const handleCategorySelect = (categoryId: string | null) => {
    bulkSetCategory(
      { ids: selectedIds, category_id: categoryId },
      { onSuccess: () => { setActivePanel(null); onClearSelection() } }
    )
  }

  const handleTagAdd = (tagId: string) => {
    const updates = selectedIds.map(id => {
      const tx = transactions.find(t => t.id === id)
      const existing = tx?.tags.map(tag => tag.id) ?? []
      const tag_ids = existing.includes(tagId) ? existing : [...existing, tagId]
      return { id, tag_ids }
    })
    bulkAddTag({ updates }, { onSuccess: () => { setActivePanel(null); onClearSelection() } })
  }

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(prev => prev === panel ? null : panel)
  }

  const actionBtnClass =
    'flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-50 shrink-0'

  return (
    <>
      {/* Backdrop pour fermer les sous-panels */}
      {activePanel && (
        <div className="fixed inset-0 z-40" onClick={() => setActivePanel(null)} />
      )}

      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 h-12 rounded-xl bg-foreground text-background shadow-xl border border-white/10">

        {/* Compteur + sélection totale */}
        <span className="px-2 text-sm font-medium shrink-0">
          {t('selected').replace('{n}', String(selectedIds.length))}
        </span>
        <button type="button" className={actionBtnClass} onClick={onSelectAll} disabled={isPending}>
          {t('select_all')}
        </button>

        <div className="w-px h-5 bg-white/20 mx-1" />

        {/* Supprimer */}
        <button type="button" className={actionBtnClass} onClick={handleDelete} disabled={isPending}>
          <Trash2 size={14} />
          <span className="hidden sm:inline">{t('delete')}</span>
        </button>

        {/* Catégorie */}
        <div className="relative">
          <button
            type="button"
            className={actionBtnClass}
            onClick={() => togglePanel('category')}
            disabled={isPending}
          >
            <FolderOpen size={14} />
            <span className="hidden sm:inline">{t('category')}</span>
          </button>
          {activePanel === 'category' && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-52 rounded-xl border border-border bg-popover shadow-lg py-1 text-foreground">
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
              >
                {t('no_category')}
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategorySelect(c.id)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-accent"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color ?? '#888' }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tag */}
        <div className="relative">
          <button
            type="button"
            className={actionBtnClass}
            onClick={() => togglePanel('tag')}
            disabled={isPending}
          >
            <Tag size={14} />
            <span className="hidden sm:inline">{t('tag')}</span>
          </button>
          {activePanel === 'tag' && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-48 rounded-xl border border-border bg-popover shadow-lg py-1 text-foreground">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagAdd(tag.id)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm hover:bg-accent"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color ?? '#888' }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-white/20 mx-1" />

        {/* Désélectionner */}
        <button type="button" className={actionBtnClass} onClick={onClearSelection} disabled={isPending}>
          <X size={14} />
        </button>
      </div>
    </>
  )
}

export { BulkActionBar }
