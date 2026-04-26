import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Tag, UpdateTagPayload } from '../types/tag.types'

export const useUpdateTag = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagPayload }) =>
      api.patch<{ data: Tag }>(`/api/v1/tags/${id}`, payload).then(r => r.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  })
}
