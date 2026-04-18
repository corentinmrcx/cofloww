import { useLocation } from 'react-router'
import { ThemeToggle } from '../ThemeToggle'
import { NotificationBell } from '../../features/notifications/components/NotificationBell'
import { useT } from '../T'

const Topbar = () => {
  const { pathname } = useLocation()
  const t = useT(import.meta.url)

  const pathTitles: Record<string, string> = {
    '/':             t('dashboard'),
    '/settings':     t('settings'),
    '/wallets':      t('wallets'),
    '/transactions': t('transactions'),
    '/budget':       t('budget'),
    '/investments':  t('investments'),
    '/stats':        t('stats'),
  }

  const title = pathTitles[pathname] ?? 'CoFloww'

  return (
    <header className="h-14 shrink-0 sticky top-0 z-10 flex items-center gap-2 px-4 border-b border-border bg-background/80 backdrop-blur">
      <h1 className="text-base font-semibold flex-1">{title}</h1>
      <NotificationBell />
      <div className="md:hidden flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  )
}

export { Topbar }
