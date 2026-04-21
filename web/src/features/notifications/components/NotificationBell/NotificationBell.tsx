import { useRef, useState } from 'react'
import { Bell, Check, CheckCheck, AlertTriangle, Upload, Trash2, X } from 'lucide-react'
import { useNotifications, useMarkRead, useMarkAllRead, useDeleteNotification, useDeleteAllNotifications } from '../../hooks/useNotifications'
import { useOnClickOutside } from '../../../../hooks/useOnClickOutside'
import { useT } from '../../../../components/T'
import { cn } from '../../../../lib/utils'
import type { AppNotification } from '../../types/notification.types'
import trad from './trad.json'

const NotifIcon = ({ type }: { type: string }) => {
  if (type === 'budget_alert')   return <AlertTriangle size={14} className="text-warning" />
  if (type === 'import_success') return <Upload size={14} className="text-income" />
  return <Bell size={14} className="text-muted-foreground" />
}

interface NotifRowProps {
  notif: AppNotification
  onRead: (id: string) => void
  onDelete: (id: string) => void
  formatRelative: (iso: string) => string
}

const NotifRow = ({ notif, onRead, onDelete, formatRelative }: NotifRowProps) => (
  <div className={cn('group flex gap-3 px-4 py-3 hover:bg-muted/40 transition-colors', notif.read && 'opacity-60')}>
    <button
      onClick={() => !notif.read && onRead(notif.id)}
      className="flex-1 min-w-0 flex gap-3 text-left"
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
    <button
      onClick={() => onDelete(notif.id)}
      className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive focus-visible:opacity-100"
      aria-label="Supprimer"
    >
      <X size={14} />
    </button>
  </div>
)

const PLACEMENT: Record<string, string> = {
  'bottom-right': 'absolute top-11 right-0 w-80',
  'top-left':     'absolute bottom-11 left-0 w-80',
  'top-right':    'absolute bottom-11 right-0 w-80',
  'fixed-center': 'fixed bottom-20 left-1/2 -translate-x-1/2 w-[min(20rem,calc(100vw-2rem))]',
}

interface NotificationBellProps {
  placement?: 'bottom-right' | 'top-left' | 'top-right' | 'fixed-center'
}

const NotificationBell = ({ placement = 'bottom-right' }: NotificationBellProps) => {
  const [open, setOpen]       = useState(false)
  const ref                   = useRef<HTMLDivElement>(null)
  const t                     = useT(trad)
  const { data }                = useNotifications()
  const { mutate: markRead }    = useMarkRead()
  const { mutate: markAll }     = useMarkAllRead()
  const { mutate: deleteOne }   = useDeleteNotification()
  const { mutate: deleteAll }   = useDeleteAllNotifications()

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
        aria-label={unread > 0 ? `${t('title')} (${unread})` : t('title')}
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
        <div className={cn('max-h-[420px] overflow-y-auto rounded-xl border border-border bg-popover shadow-lg z-50 flex flex-col', PLACEMENT[placement ?? 'bottom-right'])}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <p className="text-sm font-semibold">{t('title')}</p>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  onClick={() => markAll()}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <CheckCheck size={13} /> {t('mark_all')}
                </button>
              )}
              {notifs.length > 0 && (
                <button
                  onClick={() => deleteAll()}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={13} /> {t('delete_all')}
                </button>
              )}
            </div>
          </div>

          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Check size={20} />
              <span>{t('empty')}</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifs.map(n => (
                <NotifRow key={n.id} notif={n} onRead={markRead} onDelete={deleteOne} formatRelative={formatRelative} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { NotificationBell }
