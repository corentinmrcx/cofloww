import { NavLink } from 'react-router'
import { cn } from '../../lib/utils'
import { navItems } from './navItems'

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 md:hidden border-t border-border bg-background">
      <div className="grid grid-cols-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
                isActive
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground',
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
