import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface ActionMenuItem {
  label: string
  icon: LucideIcon
  onClick: () => void
  destructive?: boolean
}

interface ActionMenuProps {
  items: ActionMenuItem[]
}

const ActionMenu = ({ items }: ActionMenuProps) => {
  const [open, setOpen]     = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => {
          e.stopPropagation()
          if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect()
            setDropUp(window.innerHeight - rect.bottom < 130)
          }
          setOpen(v => !v)
        }}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal size={15} />
      </button>

      {open && (
        <div className={`absolute right-0 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} z-50 min-w-36 bg-popover border border-border rounded-lg shadow-md py-1 overflow-hidden`}>
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); item.onClick(); setOpen(false) }}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                  item.destructive
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <Icon size={14} />
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { ActionMenu }
