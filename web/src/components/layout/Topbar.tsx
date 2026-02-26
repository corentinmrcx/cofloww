import { useLocation } from 'react-router'
import { ThemeToggle } from '../ThemeToggle'

const pathTitles: Record<string, string> = {
  '/':         'Dashboard',
  '/settings': 'Settings',
}

export function Topbar() {
  const { pathname } = useLocation()
  const title = pathTitles[pathname] ?? 'CoFloww'

  return (
    <header className="h-14 shrink-0 sticky top-0 z-10 flex items-center gap-4 px-4 border-b border-border bg-background/80 backdrop-blur">
      <h1 className="text-base font-semibold flex-1">{title}</h1>
      <div className="md:hidden">
        <ThemeToggle />
      </div>
    </header>
  )
}
