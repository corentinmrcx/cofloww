export interface GoalWallet {
  id: string
  name: string
  institution: string | null
  color: string
}

export interface Goal {
  id: string
  name: string
  color: string | null
  start_date: string
  end_date: string | null
  is_active: boolean
  total_target: number | null
  monthly_target: number | null
  transferred_total: number
  transferred_this_month: number
  pct_total: number | null
  pct_monthly: number | null
  is_active_this_month: boolean
  wallet: GoalWallet
  created_at: string
  updated_at: string
}

export interface CreateGoalPayload {
  wallet_id: string
  name: string
  color?: string | null
  start_date: string
  end_date?: string | null
  total_target?: number | null
  monthly_target?: number | null
  is_active?: boolean
}

export type UpdateGoalPayload = Partial<CreateGoalPayload>
