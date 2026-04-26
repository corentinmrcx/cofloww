import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useT } from '../../../../components/T'
import { useCategories } from '../../../category/hooks/useCategories'
import { useCreateCategory } from '../../../category/hooks/useCreateCategory'
import { useUpdateCategory } from '../../../category/hooks/useUpdateCategory'
import { useDeleteCategory } from '../../../category/hooks/useDeleteCategory'
import { useTags } from '../../../tag/hooks/useTags'
import { useCreateTag } from '../../../tag/hooks/useCreateTag'
import { useUpdateTag } from '../../../tag/hooks/useUpdateTag'
import { useDeleteTag } from '../../../tag/hooks/useDeleteTag'
import type { Category, CategoryType } from '../../../category/types/category.types'
import type { Tag } from '../../../tag/types/tag.types'
import trad from './trad.json'

const randomColor = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')

const INPUT = 'h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring'

const TYPE_BADGE: Record<CategoryType, string> = {
  expense:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  income:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  transfer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const CategoriesPanel = () => {
  const t = useT(trad)

  const { data: categories = [] } = useCategories()
  const { mutate: createCat,  isPending: isCreatingCat  } = useCreateCategory()
  const { mutate: updateCat,  isPending: isUpdatingCat  } = useUpdateCategory()
  const { mutate: deleteCat                             } = useDeleteCategory()

  const [editingCatId,      setEditingCatId]      = useState<string | null>(null)
  const [editCatName,       setEditCatName]        = useState('')
  const [editCatColor,      setEditCatColor]       = useState('')
  const [editCatType,       setEditCatType]        = useState<CategoryType>('expense')
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null)
  const [creatingCat,       setCreatingCat]        = useState(false)
  const [newCatName,        setNewCatName]         = useState('')
  const [newCatColor,       setNewCatColor]        = useState(randomColor)
  const [newCatType,        setNewCatType]         = useState<CategoryType>('expense')

  const { data: tags = [] } = useTags()
  const { mutate: createTag,  isPending: isCreatingTag  } = useCreateTag()
  const { mutate: updateTag,  isPending: isUpdatingTag  } = useUpdateTag()
  const { mutate: deleteTag                             } = useDeleteTag()

  const [editingTagId,      setEditingTagId]      = useState<string | null>(null)
  const [editTagName,       setEditTagName]        = useState('')
  const [editTagColor,      setEditTagColor]       = useState('')
  const [confirmDeleteTagId, setConfirmDeleteTagId] = useState<string | null>(null)
  const [creatingTag,       setCreatingTag]        = useState(false)
  const [newTagName,        setNewTagName]         = useState('')
  const [newTagColor,       setNewTagColor]        = useState(randomColor)

  const startEditCat = (cat: Category) => {
    setEditingCatId(cat.id)
    setEditCatName(cat.name)
    setEditCatColor(cat.color ?? '#6366f1')
    setEditCatType(cat.type)
    setConfirmDeleteCatId(null)
  }

  const saveEditCat = () => {
    if (!editingCatId || !editCatName.trim()) return
    updateCat(
      { id: editingCatId, payload: { name: editCatName.trim(), color: editCatColor, type: editCatType } },
      { onSuccess: () => setEditingCatId(null) },
    )
  }

  const submitCreateCat = () => {
    if (!newCatName.trim()) return
    createCat(
      { name: newCatName.trim(), color: newCatColor, type: newCatType },
      {
        onSuccess: () => {
          setCreatingCat(false)
          setNewCatName('')
          setNewCatColor(randomColor())
          setNewCatType('expense')
        },
      },
    )
  }

  const startEditTag = (tag: Tag) => {
    setEditingTagId(tag.id)
    setEditTagName(tag.name)
    setEditTagColor(tag.color ?? '#6366f1')
    setConfirmDeleteTagId(null)
  }

  const saveEditTag = () => {
    if (!editingTagId || !editTagName.trim()) return
    updateTag(
      { id: editingTagId, payload: { name: editTagName.trim(), color: editTagColor } },
      { onSuccess: () => setEditingTagId(null) },
    )
  }

  const submitCreateTag = () => {
    if (!newTagName.trim()) return
    createTag(
      { name: newTagName.trim(), color: newTagColor },
      {
        onSuccess: () => {
          setCreatingTag(false)
          setNewTagName('')
          setNewTagColor(randomColor())
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* ── CATÉGORIES ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t('categories_title')}</h3>
          {!creatingCat && (
            <button
              type="button"
              onClick={() => { setCreatingCat(true); setNewCatColor(randomColor()) }}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus size={13} />
              {t('add_category')}
            </button>
          )}
        </div>

        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {categories.length === 0 && !creatingCat && (
            <p className="px-3 py-3 text-sm text-muted-foreground">{t('empty_categories')}</p>
          )}

          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 px-3 py-2 min-h-10">
              {editingCatId === cat.id ? (
                <>
                  <input
                    type="color"
                    value={editCatColor}
                    onChange={e => setEditCatColor(e.target.value)}
                    className="h-7 w-8 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                  />
                  <input
                    autoFocus
                    value={editCatName}
                    onChange={e => setEditCatName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEditCat(); if (e.key === 'Escape') setEditingCatId(null) }}
                    className={`${INPUT} flex-1`}
                  />
                  <select
                    value={editCatType}
                    onChange={e => setEditCatType(e.target.value as CategoryType)}
                    className={`${INPUT} w-28 shrink-0`}
                  >
                    <option value="expense">{t('type_expense')}</option>
                    <option value="income">{t('type_income')}</option>
                    <option value="transfer">{t('type_transfer')}</option>
                  </select>
                  <button type="button" onClick={saveEditCat} disabled={isUpdatingCat} className="text-primary hover:text-primary/80 disabled:opacity-50">
                    <Check size={15} />
                  </button>
                  <button type="button" onClick={() => setEditingCatId(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={15} />
                  </button>
                </>
              ) : confirmDeleteCatId === cat.id ? (
                <>
                  <span className="flex-1 text-sm text-destructive">{t('delete_confirm')}</span>
                  <button
                    type="button"
                    onClick={() => deleteCat(cat.id, { onSuccess: () => setConfirmDeleteCatId(null) })}
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    {t('confirm')}
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteCatId(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color ?? 'var(--muted-foreground)' }}
                  />
                  <span className="flex-1 text-sm">{cat.name}</span>
                  {cat.is_system ? (
                    <span className="text-xs text-muted-foreground">{t('system_badge')}</span>
                  ) : (
                    <>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[cat.type]}`}>
                        {t(`type_${cat.type}`)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditCat(cat)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setConfirmDeleteCatId(cat.id); setEditingCatId(null) }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}

          {creatingCat && (
            <div className="flex items-center gap-2 px-3 py-2 min-h-10">
              <input
                type="color"
                value={newCatColor}
                onChange={e => setNewCatColor(e.target.value)}
                className="h-7 w-8 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
              />
              <input
                autoFocus
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitCreateCat(); if (e.key === 'Escape') setCreatingCat(false) }}
                placeholder={t('name_placeholder')}
                className={`${INPUT} flex-1`}
              />
              <select
                value={newCatType}
                onChange={e => setNewCatType(e.target.value as CategoryType)}
                className={`${INPUT} w-28 shrink-0`}
              >
                <option value="expense">{t('type_expense')}</option>
                <option value="income">{t('type_income')}</option>
                <option value="transfer">{t('type_transfer')}</option>
              </select>
              <button
                type="button"
                onClick={submitCreateCat}
                disabled={!newCatName.trim() || isCreatingCat}
                className="text-primary hover:text-primary/80 disabled:opacity-50"
              >
                <Check size={15} />
              </button>
              <button type="button" onClick={() => setCreatingCat(false)} className="text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── TAGS ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t('tags_title')}</h3>
          {!creatingTag && (
            <button
              type="button"
              onClick={() => { setCreatingTag(true); setNewTagColor(randomColor()) }}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus size={13} />
              {t('add_tag')}
            </button>
          )}
        </div>

        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {tags.length === 0 && !creatingTag && (
            <p className="px-3 py-3 text-sm text-muted-foreground">{t('empty_tags')}</p>
          )}

          {tags.map(tag => (
            <div key={tag.id} className="flex items-center gap-2 px-3 py-2 min-h-10">
              {editingTagId === tag.id ? (
                <>
                  <input
                    type="color"
                    value={editTagColor}
                    onChange={e => setEditTagColor(e.target.value)}
                    className="h-7 w-8 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                  />
                  <input
                    autoFocus
                    value={editTagName}
                    onChange={e => setEditTagName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEditTag(); if (e.key === 'Escape') setEditingTagId(null) }}
                    className={`${INPUT} flex-1`}
                  />
                  <button type="button" onClick={saveEditTag} disabled={isUpdatingTag} className="text-primary hover:text-primary/80 disabled:opacity-50">
                    <Check size={15} />
                  </button>
                  <button type="button" onClick={() => setEditingTagId(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={15} />
                  </button>
                </>
              ) : confirmDeleteTagId === tag.id ? (
                <>
                  <span className="flex-1 text-sm text-destructive">{t('delete_confirm')}</span>
                  <button
                    type="button"
                    onClick={() => deleteTag(tag.id, { onSuccess: () => setConfirmDeleteTagId(null) })}
                    className="text-xs font-medium text-destructive hover:underline"
                  >
                    {t('confirm')}
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteTagId(null)} className="text-muted-foreground hover:text-foreground">
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color ?? 'var(--muted-foreground)' }}
                  />
                  <span className="flex-1 text-sm">{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => startEditTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmDeleteTagId(tag.id); setEditingTagId(null) }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}

          {creatingTag && (
            <div className="flex items-center gap-2 px-3 py-2 min-h-10">
              <input
                type="color"
                value={newTagColor}
                onChange={e => setNewTagColor(e.target.value)}
                className="h-7 w-8 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
              />
              <input
                autoFocus
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitCreateTag(); if (e.key === 'Escape') setCreatingTag(false) }}
                placeholder={t('name_placeholder')}
                className={`${INPUT} flex-1`}
              />
              <button
                type="button"
                onClick={submitCreateTag}
                disabled={!newTagName.trim() || isCreatingTag}
                className="text-primary hover:text-primary/80 disabled:opacity-50"
              >
                <Check size={15} />
              </button>
              <button type="button" onClick={() => setCreatingTag(false)} className="text-muted-foreground hover:text-foreground">
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}

export { CategoriesPanel }
