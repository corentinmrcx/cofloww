import type { TransactionType } from '../../transactions/types/transaction.types'

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringRuleWallet {
  id: string
  name: string
  color: string
}

export interface RecurringRuleCategory {
  id: string
  name: string
  color: string | null
  icon: string | null
}

export interface RecurringRule {
  id: string
  label: string
  amount: number
  type: TransactionType
  frequency: RecurringFrequency
  day_of_month: number | null
  day_of_week: number | null
  starts_at: string
  ends_at: string | null
  last_generated_at: string | null
  is_active: boolean
  next_occurrence: string | null
  wallet_id: string
  category_id: string | null
  wallet: RecurringRuleWallet | null
  category: RecurringRuleCategory | null
  created_at: string
  updated_at: string
}

export interface CreateRecurringRulePayload {
  wallet_id: string
  category_id?: string | null
  label: string
  amount: number
  type: TransactionType
  frequency: RecurringFrequency
  day_of_month?: number | null
  day_of_week?: number | null
  starts_at: string
  ends_at?: string | null
  is_active?: boolean
}

export type UpdateRecurringRulePayload = Partial<CreateRecurringRulePayload>
