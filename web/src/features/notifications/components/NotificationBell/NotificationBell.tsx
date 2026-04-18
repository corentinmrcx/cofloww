import { useRef, useState } from 'react'
import { Bell, Check, CheckCheck, AlertTriangle, Upload } from 'lucide-react'
import { useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications'
import { useOnClickOutside } from '../../../../hooks/useOnClickOutside'
import { useT } from '../../../../components/T'
import { cn } from '../../../../lib/utils'
import type { AppNotification } from '../../types/notification.types'

const NotifIcon = ({ type }: { type: string }) => {
  if (type === 'budget_alert')   return <AlertTriangle size={14} className="text-warning" />
  if (type === 'import_success') return <Upload size={14} className="text-income" />
  return <Bell size={14} className="text-muted-foreground" />
}

interface NotifRowProps {
  notif: AppNotification
  onRead: (id: string) => void
  formatRelative: (iso: string) => string
}

const NotifRow = ({ notif, onRead, formatRelative }: NotifRowProps) => (
  <button
    onClick={() => !notif.read && onRead(notif.id)}
    className={cn('w-full text-left flex gap-3 px-4 py-3 hover:bg-muted/40 transition-colors', notif.read && 'opacity-60')}
  >
    <div className="mt-0.5 shrink-0">
      <NotifIcon type={notif.type} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium leading-snug">{notif.title}</p>
      {notif.body && (
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{notif.body}</p>
      )}
      <p className="text-xs text-muted-foreground mt-1">{formatRelative(notif.created_at)}</p>
    </div>
    {!notif.read && (
      <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
    )}
  </button>
)

const PLACEMENT: Record<string, string> = {
  'bottom-right': 'top-11 right-0',
  'top-left':     'bottom-11 left-0',
  'top-right':    'bottom-11 right-0',
}

interface NotificationBellProps {
  placement?: 'bottom-right' | 'top-left' | 'top-right'
}

const NotificationBell = ({ placement = 'bottom-right' }: NotificationBellProps) => {
  const [open, setOpen]       = useState(false)
  const ref                   = useRef<HTMLDivElement>(null)
  const t                     = useT(import.meta.url)
  const { data }              = useNotifications()
  const { mutate: markRead }  = useMarkRead()
  const { mutate: markAll }   = useMarkAllRead()

  useOnClickOutside(ref, () => setOpen(false))

  const unread = data?.unread_count ?? 0
  const notifs = data?.data ?? []

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)  return t('just_now')
    if (m < 60) return t('minutes_ago').replace('{m}', String(m))
    const h = Math.floor(m / 60)
    if (h < 24) return t('hours_ago').replace('{h}', String(h))
    return t('days_ago').replace('{d}', String(Math.floor(h / 24)))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative size-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
        aria-label={t('title')}
        aria-expanded={open}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className={cn('absolute w-80 max-h-[420px] overflow-y-auto rounded-xl border border-border bg-popover shadow-lg z-50 flex flex-col', PLACEMENT[placement])}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <p className="text-sm font-semibold">{t('title')}</p>
            {unread > 0 && (
              <button
                onClick={() => markAll()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck size={13} /> {t('mark_all')}
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Check size={20} />
              <span>{t('empty')}</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifs.map(n => (
                <NotifRow key={n.id} notif={n} onRead={markRead} formatRelative={formatRelative} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { NotificationBell }
