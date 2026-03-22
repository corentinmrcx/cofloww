import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { Category, CreateCategoryPayload } from '../types/category.types'

export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      api.post<{ data: Category }>('/api/v1/categories', payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}
