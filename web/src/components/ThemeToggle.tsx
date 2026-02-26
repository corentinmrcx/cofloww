import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/useTheme'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      className="flex items-center gap-2"
    >
      <Sun size={16} className="text-muted-foreground" />
      <div className={`relative h-6 w-11 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-input'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-background shadow transition-all duration-200 ${isDark ? 'left-6' : 'left-1'}`} />
      </div>
      <Moon size={16} className="text-muted-foreground" />
    </button>
  )
}

export default ThemeToggle
