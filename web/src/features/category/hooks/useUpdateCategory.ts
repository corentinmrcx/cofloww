import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Category, UpdateCategoryPayload } from '../types/category.types'

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      api.patch<{ data: Category }>(`/api/v1/categories/${id}`, payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}
