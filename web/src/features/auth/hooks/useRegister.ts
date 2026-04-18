import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { api } from '../../../services/api'
import type { RegisterPayload } from '../types/auth.types'

export const useRegister = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      await api.get('/sanctum/csrf-cookie')
      return api.post('/register', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
      navigate('/')
    },
  })
}
