import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Category } from '../types/category.types'

export const useCategories = () =>
  useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () =>
      api.get<{ data: Category[] }>('/api/v1/categories').then(r => r.data.data),
  })
