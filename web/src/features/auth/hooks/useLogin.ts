import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '../../../services/api'
import type { LoginPayload } from '../types/auth.types'

export const useLogin = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      await api.get('/sanctum/csrf-cookie')
      return api.post('/login', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      navigate('/')
    },
  })
}
