import { Landmark, PiggyBank, Banknote, TrendingUp, Bitcoin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { WalletType } from '../types/wallet.types'

export const TYPE_DEFAULT_ICONS: Record<WalletType, LucideIcon> = {
  checking:   Landmark,
  savings:    PiggyBank,
  cash:       Banknote,
  investment: TrendingUp,
  crypto:     Bitcoin,
}
