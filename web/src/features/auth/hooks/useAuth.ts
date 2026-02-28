import { useQuery } from '@tanstack/react-query'
import api from '../../../services/api'
import type { User } from '../types/auth.types'

export const useAuth = () => {
  const { data: user, isPending } = useQuery<User>({
    queryKey: ['auth', 'user'],
    queryFn: () => api.get<User>('/api/user').then(r => r.data),
    retry: false,
  })

  return {
    user,
    isPending,
    isAuthenticated: !!user,
  }
}
