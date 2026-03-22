import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Plus, Search } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useT } from '../../../../components/T'
import { useCategories } from '../../hooks/useCategories'
import { useCreateCategory } from '../../hooks/useCreateCategory'
import type { Category, CategoryType, CreateCategoryPayload } from '../../types/category.types'

const PRESET_COLORS = [
  '#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#22C55E', '#14B8A6', '#64748B', '#F59E0B', '#06B6D4',
]

interface CategorySelectorProps {
  value: string | null
  onChange: (id: string | null) => void
  type?: CategoryType
  clearable?: boolean
}

const CategorySelector = ({ value, onChange, type, clearable = false }: CategorySelectorProps) => {
  const t = useT(import.meta.url)
  const { data: categories = [] } = useCategories()
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'create'>('list')
  const [createName, setCreateName] = useState('')
  const [createType, setCreateType] = useState<CategoryType>(type ?? 'expense')
  const [createColor, setCreateColor] = useState(PRESET_COLORS[0])

  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setView('list')
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && view === 'list') searchRef.current?.focus()
  }, [open, view])

  const filtered = categories.filter(c =>
    (!type || c.type === type) &&
    c.name.toLowerCase().includes(search.toLowerCase()),
  )

  const exactMatch = filtered.some(c => c.name.toLowerCase() === search.toLowerCase())
  const selected = categories.find(c => c.id === value) ?? null

  const handleSelect = (id: string | null) => {
    onChange(id)
    setOpen(false)
    setView('list')
    setSearch('')
  }

  const openCreate = () => {
    setCreateName(search)
    setCreateType(type ?? 'expense')
    setCreateColor(PRESET_COLORS[0])
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
        onChange(created.id)
        setOpen(false)
        setView('list')
        setSearch('')
      },
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors hover:bg-accent',
          !selected && 'text-muted-foreground',
        )}
      >
        {selected ? (
          <>
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: selected.color ?? '#94A3B8' }}
            />
            <span className="flex-1 truncate text-left text-foreground">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left">{t('placeholder')}</span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-64 rounded-md border border-border bg-popover shadow-md">
          {view === 'list' ? (
            <>
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="max-h-52 overflow-y-auto py-1">
                {clearable && value && (
                  <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className="flex w-full items-center px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                  >
                    {t('clear')}
                  </button>
                )}

                {filtered.length === 0 && !search && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">{t('empty')}</p>
                )}

                {filtered.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelect(category.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color ?? '#94A3B8' }}
                    />
                    <span className="flex-1 text-left">{category.name}</span>
                    {category.id === value && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}

                {search && !exactMatch && (
                  <button
                    type="button"
                    onClick={openCreate}
                    className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-primary hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {t('create_label')} &quot;{search}&quot;
                    </span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-3 space-y-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
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

              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCreateColor(color)}
                    className={cn(
                      'h-6 w-6 rounded-full transition-transform',
                      createColor === color && 'scale-110 ring-2 ring-ring ring-offset-2',
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
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

export default CategorySelector
