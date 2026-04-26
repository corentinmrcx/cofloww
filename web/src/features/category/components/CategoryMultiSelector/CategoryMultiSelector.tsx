import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Plus, Search, X } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useT } from '../../../../components/T'
import { useCategories } from '../../hooks/useCategories'
import { useCreateCategory } from '../../hooks/useCreateCategory'
import type { Category, CategoryType, CreateCategoryPayload } from '../../types/category.types'
import trad from './trad.json'

const randomCategoryColor = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')

interface CategoryMultiSelectorProps {
  value: string[]
  onChange: (ids: string[]) => void
  type?: CategoryType
}

const CategoryMultiSelector = ({ value, onChange, type }: CategoryMultiSelectorProps) => {
  const t = useT(trad)
  const { data: categories = [] } = useCategories()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'list' | 'create'>('list')
  const [search, setSearch] = useState('')
  const [createName, setCreateName] = useState('')
  const [createType, setCreateType] = useState<CategoryType>(type ?? 'expense')
  const [createColor, setCreateColor] = useState(randomCategoryColor)

  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setView('list')
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && view === 'list') searchRef.current?.focus()
  }, [open, view])

  const filtered = useMemo(() => categories
    .filter(c => (!type || c.type === type) && c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
  [categories, type, search])

  const exactMatch = filtered.some(c => c.name.toLowerCase() === search.toLowerCase())

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])
  }

  const remove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== id))
  }

  const openCreate = () => {
    setCreateName(search)
    setCreateType(type ?? 'expense')
    setCreateColor(randomCategoryColor())
    setView('create')
  }

  const handleSubmitCreate = () => {
    const payload: CreateCategoryPayload = {
      name: createName.trim(),
      type: createType,
      color: createColor,
    }
    createCategory(payload, {
      onSuccess: (created: Category) => {
        onChange([...value, created.id])
        setView('list')
        setSearch('')
      },
    })
  }

  const selectedCategories = categories.filter(c => value.includes(c.id))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          value.length === 0 && 'text-muted-foreground',
        )}
      >
        {selectedCategories.length === 0 ? (
          <span className="flex-1 text-left">{t('placeholder')}</span>
        ) : (
          <>
            {selectedCategories.map(c => (
              <span
                key={c.id}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color ?? 'var(--muted-foreground)' }}
                />
                {c.name}
                <button
                  type="button"
                  onClick={e => remove(c.id, e)}
                  className="text-muted-foreground hover:text-foreground ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </>
        )}
        <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {view === 'list' ? (
            <>
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('search_placeholder')}
                  aria-label={t('search_placeholder')}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 && !search && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">{t('empty')}</p>
                )}
                {filtered.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggle(category.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                  >
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color ?? 'var(--muted-foreground)' }}
                    />
                    <span className="flex-1 text-left">{category.name}</span>
                    {value.includes(category.id) && <Check className="size-4 text-primary" />}
                  </button>
                ))}
                {search && !exactMatch && (
                  <button
                    type="button"
                    onClick={openCreate}
                    className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-primary hover:bg-accent"
                  >
                    <Plus className="size-4" />
                    {t('create_label')} &quot;{search}&quot;
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-3 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                {t('create_title')}
              </button>

              <input
                autoFocus
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder={t('name_placeholder')}
                className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
              />

              {!type && (
                <select
                  value={createType}
                  onChange={e => setCreateType(e.target.value as CategoryType)}
                  className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="expense">{t('type_expense')}</option>
                  <option value="income">{t('type_income')}</option>
                  <option value="transfer">{t('type_transfer')}</option>
                </select>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('color_label')}</span>
                <input
                  type="color"
                  value={createColor}
                  onChange={e => setCreateColor(e.target.value)}
                  className="h-8 w-16 rounded-md border border-input cursor-pointer bg-transparent px-1 py-1"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="h-8 flex-1 rounded-md border border-border text-sm hover:bg-accent"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCreate}
                  disabled={!createName.trim() || isCreating}
                  className="h-8 flex-1 rounded-md bg-primary text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCreating ? t('creating') : t('create')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { CategoryMultiSelector }
