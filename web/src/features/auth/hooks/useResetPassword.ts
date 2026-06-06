import { useMutation } from '@tanstack/react-query'
import { api } from '../../../services/api'

type ResetPasswordPayload = {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordPayload) => {
      await api.get('/sanctum/csrf-cookie')
      return api.post('/reset-password', data)
    },
  })
}
