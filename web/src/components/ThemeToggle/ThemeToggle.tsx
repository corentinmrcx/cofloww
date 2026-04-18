import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { IconButton } from '../Button'
import { cn } from '../../lib/utils'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <IconButton
      label="Toggle theme"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      <Sun size={16} className="text-muted-foreground" />
      <div className={cn('relative h-6 w-11 rounded-full transition-colors', isDark ? 'bg-primary' : 'bg-input')}>
        <span className={cn('absolute top-1 size-4 rounded-full bg-background shadow transition-all duration-200', isDark ? 'left-6' : 'left-1')} />
      </div>
      <Moon size={16} className="text-muted-foreground" />
    </IconButton>
  )
}

export { ThemeToggle }
