import { LayoutDashboard, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/settings', label: 'Settings',  icon: Settings        },
]
