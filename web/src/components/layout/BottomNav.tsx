import { NavLink } from 'react-router'
import { cn } from '../../lib/utils'
import { navItems } from './navItems'
import { useT } from '../T'
import { NotificationBell } from '../../features/notifications/components/NotificationBell'
import trad from './trad.json'

const BottomNav = () => {
  const t = useT(trad)
  const [first, ...rest] = navItems
  return (
    <nav aria-label="Navigation principale" className="fixed bottom-0 left-0 right-0 z-10 md:hidden border-t border-border bg-background">
      <div className="grid grid-cols-3">
        <NavLink
          to={first.to}
          end={first.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors',
              isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
            )
          }
        >
          <first.icon size={20} />
          {t(first.label.toLowerCase())}
        </NavLink>

        <div className="flex items-center justify-center py-3">
          <NotificationBell placement="fixed-center" />
        </div>

        {rest.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors',
                isActive ? 'text-foreground font-medium' : 'text-muted-foreground',
              )
            }
          >
            <Icon size={20} />
            {t(label.toLowerCase())}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export { BottomNav }
