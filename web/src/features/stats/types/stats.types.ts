export interface MonthlyDataPoint {
  year: number
  month: number
  income: number
  expenses: number
  net: number
}

export interface CategoryBreakdown {
  category_id: string | null
  name: string
  color: string
  icon: string | null
  amount: number
}

export interface OverviewData {
  savings_rate: number
  avg_monthly_expenses: number
  best_month: MonthlyDataPoint | null
  net_worth: number
  total_income_12m: number
  total_expenses_12m: number
}

export type StatPeriod = '3m' | '6m' | '12m' | '24m'
