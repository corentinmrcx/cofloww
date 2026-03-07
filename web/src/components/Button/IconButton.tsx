import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

const IconButton = ({ label, className, children, ...props }: IconButtonProps) => {
  return (
    <button
      aria-label={label}
      className={cn(
        'flex items-center justify-center rounded-md transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { IconButton }
