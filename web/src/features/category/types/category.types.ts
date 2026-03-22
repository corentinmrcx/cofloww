export type CategoryType = 'income' | 'expense' | 'transfer'

export interface Category {
  id: string
  name: string
  slug: string
  type: CategoryType
  color: string | null
  icon: string | null
  parent_id: string | null
  is_system: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateCategoryPayload {
  name: string
  type: CategoryType
  color?: string
  icon?: string
  parent_id?: string
}
