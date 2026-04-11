export type BudgetPeriod = 'monthly' | 'yearly'

export interface BudgetCategory {
  id: string
  name: string
  color: string | null
  icon: string | null
}

export interface Budget {
  id: string
  amount: number
  period: BudgetPeriod
  month: number | null
  year: number
  alert_threshold_pct: number
  is_active: boolean
  spent: number
  remaining: number
  pct_used: number
  alert: boolean
  categories: BudgetCategory[]
  created_at: string
  updated_at: string
}

export interface CreateBudgetPayload {
  category_ids: string[]
  amount: number
  period: BudgetPeriod
  month?: number | null
  year: number
  alert_threshold_pct?: number
  is_active?: boolean
}

export type UpdateBudgetPayload = Partial<CreateBudgetPayload>
