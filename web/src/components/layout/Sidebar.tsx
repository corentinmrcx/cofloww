import { NavLink } from 'react-router'
import { cn } from '../../lib/utils'
import { navItems } from './navItems'
import { ThemeToggle } from '../ThemeToggle'

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 border-r border-border bg-sidebar">
      <div className="h-14 flex items-center px-6 border-b border-border shrink-0">
        <span className="text-sidebar-foreground font-semibold text-lg">CoFloww</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <ThemeToggle />
      </div>
    </aside>
  )
}
