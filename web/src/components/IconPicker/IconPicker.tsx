import { useState } from 'react'
import { Search } from 'lucide-react'
import { useT } from '../T'
import { cn } from '../../lib/utils'
import { ICONS, ICON_NAMES } from './icons'

interface IconPickerProps {
  value?: string
  onChange: (name: string | undefined) => void
  className?: string
}

const IconPicker = ({ value, onChange, className }: IconPickerProps) => {
  const t = useT(import.meta.url)
  const [search, setSearch] = useState('')

  const filtered = search
    ? ICON_NAMES.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : ICON_NAMES

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('search')}
          className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-9 gap-1 max-h-40 overflow-y-auto rounded-md border border-border p-1.5">
        {filtered.map(name => {
          const Icon = ICONS[name]
          const selected = value === name
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => onChange(selected ? undefined : name)}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-md border transition-colors',
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon size={15} />
            </button>
          )
        })}

        {filtered.length === 0 && (
          <p className="col-span-9 py-4 text-center text-xs text-muted-foreground">
            {t('no_result')}
          </p>
        )}
      </div>
    </div>
  )
}

export { IconPicker }
