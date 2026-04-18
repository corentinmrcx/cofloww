import { NavLink } from 'react-router'
import { cn } from '../../lib/utils'
import { navItems } from './navItems'
import { useT } from '../T'
import { NotificationBell } from '../../features/notifications/components/NotificationBell'

const BottomNav = () => {
  const t = useT(import.meta.url)
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 md:hidden border-t border-border bg-background">
      <div className="grid grid-cols-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <div key={to} className="relative flex items-center justify-center">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors w-full',
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground',
                )
              }
            >
              <Icon size={20} />
              {t(label.toLowerCase())}
            </NavLink>
            {to === '/settings' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <NotificationBell placement="top-right" />
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}

export { BottomNav }
