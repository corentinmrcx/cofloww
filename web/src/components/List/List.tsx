import { cn } from '../../lib/utils'

interface ListProps {
  children: React.ReactNode
  className?: string
}

const List = ({ children, className }: ListProps) => (
  <div className={cn('rounded-xl border border-border divide-y divide-border', className)}>
    {children}
  </div>
)

export { List }
