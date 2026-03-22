import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { Tag } from '../types/tag.types'

export const useTags = () =>
  useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: () =>
      api.get<{ data: Tag[] }>('/api/v1/tags').then(r => r.data.data),
  })
