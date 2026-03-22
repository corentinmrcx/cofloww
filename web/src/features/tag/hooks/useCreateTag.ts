import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'
import type { Tag, CreateTagPayload } from '../types/tag.types'

export const useCreateTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTagPayload) =>
      api.post<{ data: Tag }>('/api/v1/tags', payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  })
}
