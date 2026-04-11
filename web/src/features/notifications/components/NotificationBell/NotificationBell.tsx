import { useRef, useState } from 'react'
import { Bell, Check, CheckCheck, AlertTriangle, Upload } from 'lucide-react'
import { useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useNotifications'
import { useOnClickOutside } from '../../../../hooks/useOnClickOutside'
import type { AppNotification } from '../../types/notification.types'

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

const NotifIcon = ({ type }: { type: string }) => {
  if (type === 'budget_alert') return <AlertTriangle size={14} className="text-amber-500" />
  if (type === 'import_success') return <Upload size={14} className="text-emerald-600 dark:text-emerald-400" />
  return <Bell size={14} className="text-muted-foreground" />
}

interface NotifRowProps {
  notif: AppNotification
  onRead: (id: string) => void
}

const NotifRow = ({ notif, onRead }: NotifRowProps) => (
  <button
    onClick={() => !notif.read && onRead(notif.id)}
    className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${
      notif.read ? 'opacity-60' : ''
    }`}
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
      <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
    )}
  </button>
)

const NotificationBell = () => {
  const [open, setOpen]       = useState(false)
  const ref                   = useRef<HTMLDivElement>(null)
  const { data }              = useNotifications()
  const { mutate: markRead }  = useMarkRead()
  const { mutate: markAll }   = useMarkAllRead()

  useOnClickOutside(ref, () => setOpen(false))

  const unread      = data?.unread_count ?? 0
  const notifs      = data?.data ?? []

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 max-h-[420px] overflow-y-auto rounded-xl border border-border bg-popover shadow-lg z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <p className="text-sm font-semibold">Notifications</p>
            {unread > 0 && (
              <button
                onClick={() => markAll()}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckCheck size={13} /> Tout lire
              </button>
            )}
          </div>

          {/* Liste */}
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Check size={20} />
              <span>Aucune notification</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifs.map(n => (
                <NotifRow key={n.id} notif={n} onRead={markRead} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { NotificationBell }
