import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

interface BulkCategoryPayload {
  ids: string[]
  category_id: string | null
}

interface BulkTagPayload {
  updates: { id: string; tag_ids: string[] }[]
}

export const useBulkSetCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, category_id }: BulkCategoryPayload) =>
      Promise.all(ids.map(id => api.put(`/api/v1/transactions/${id}`, { category_id }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export const useBulkAddTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ updates }: BulkTagPayload) =>
      Promise.all(updates.map(({ id, tag_ids }) => api.put(`/api/v1/transactions/${id}`, { tag_ids }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
