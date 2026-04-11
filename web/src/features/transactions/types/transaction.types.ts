export type TransactionType = 'income' | 'expense' | 'transfer'
export type TransactionStatus = 'pending' | 'cleared' | 'reconciled'

export interface TransactionWallet {
  id: string
  name: string
  color: string
}

export interface TransactionCategory {
  id: string
  name: string
  color: string | null
  icon: string | null
}

export interface TransactionTag {
  id: string
  name: string
  color: string | null
}

export interface Transaction {
  id: string
  label: string
  notes: string | null
  amount: number
  type: TransactionType
  status: TransactionStatus
  date: string
  value_date: string | null
  is_recurring: boolean
  wallet_id: string
  category_id: string | null
  to_wallet_id: string | null
  wallet: TransactionWallet | null
  category: TransactionCategory | null
  to_wallet: TransactionWallet | null
  tags: TransactionTag[]
  created_at: string
  updated_at: string
}

export interface TransactionFilters {
  wallet_id?: string
  category_id?: string
  tag_id?: string
  type?: TransactionType
  status?: TransactionStatus
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
}

export interface PaginatedTransactions {
  data: Transaction[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
