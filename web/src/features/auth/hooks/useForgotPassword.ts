import { useMutation } from '@tanstack/react-query'
import api from '../../../services/api'

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.get('/sanctum/csrf-cookie')
      return api.post('/forgot-password', { email })
    },
  })
}
