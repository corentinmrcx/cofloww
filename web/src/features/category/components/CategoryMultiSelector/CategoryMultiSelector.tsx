import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '../../../../lib/utils'
import { useT } from '../../../../components/T'
import { useCategories } from '../../hooks/useCategories'
import type { CategoryType } from '../../types/category.types'

interface CategoryMultiSelectorProps {
  value: string[]
  onChange: (ids: string[]) => void
  type?: CategoryType
}

const CategoryMultiSelector = ({ value, onChange, type }: CategoryMultiSelectorProps) => {
  const t = useT(import.meta.url)
  const { data: categories = [] } = useCategories()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  const filtered = categories.filter(c =>
    (!type || c.type === type) &&
    c.name.toLowerCase().includes(search.toLowerCase()),
  )

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])
  }

  const remove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== id))
  }

  const selectedCategories = categories.filter(c => value.includes(c.id))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors hover:bg-accent',
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
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('search_placeholder')}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
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
          </div>
        </div>
      )}
    </div>
  )
}

export { CategoryMultiSelector }
