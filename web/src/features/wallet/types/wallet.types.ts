export type WalletType = 'checking' | 'savings' | 'cash' | 'investment' | 'crypto'

export interface Wallet {
  id: string
  name: string
  slug: string
  type: WalletType
  color: string
  icon: string
  institution: string | null
  is_default: boolean
  is_archived: boolean
  sort_order: number
  initial_balance: number
  balance: number
  created_at: string
  updated_at: string
}

export interface CreateWalletPayload {
  name: string
  type: WalletType
  color: string
  icon?: string
  institution?: string
  initial_balance?: number
}

export type UpdateWalletPayload = Partial<CreateWalletPayload>

export interface ReorderPayload {
  id: string
  sort_order: number
}
