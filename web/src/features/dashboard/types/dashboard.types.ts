export interface DashboardWallet {
  id: string
  name: string
  type: string
  color: string
  icon: string | null
  balance: number
  sparkline: number[]
}

export interface MonthSummary {
  income: number
  expenses: number
  net: number
  savings_rate: number
}

export interface BudgetSummary {
  id: string
  label: string
  color: string
  icon: string | null
  budget_amount: number
  spent: number
  pct: number
  over_budget: boolean
  category_count: number
}

export interface InvestAllocation {
  wallet: { id: string; name: string; color: string }
  pct: number
  amount: number
}

export interface InvestableSummary {
  amount: number
  source_wallet: { id: string; name: string } | null
  allocations: InvestAllocation[]
}

export interface DashboardTransaction {
  id: string
  label: string
  amount: number
  type: 'income' | 'expense' | 'transfer'
  date: string
  wallet: { id: string; name: string; color: string } | null
  category: { id: string; name: string; color: string; icon: string | null } | null
}

export interface TrendPoint {
  year: number
  month: number
  income: number
  expenses: number
}

export interface DashboardData {
  wallets: DashboardWallet[]
  current_month: MonthSummary
  prev_month: MonthSummary
  top_budgets: BudgetSummary[]
  investable: InvestableSummary
  recent_transactions: DashboardTransaction[]
  monthly_trend: TrendPoint[]
}
