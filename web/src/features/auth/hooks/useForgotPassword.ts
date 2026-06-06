import { useMutation } from '@tanstack/react-query'
import { api } from '../../../services/api'
import { useLangStore } from '../../../stores/langStore'

export const useForgotPassword = () => {
  const lang = useLangStore(s => s.lang)

  return useMutation({
    mutationFn: async (email: string) => {
      await api.get('/sanctum/csrf-cookie')
      return api.post('/forgot-password', { email, lang })
    },
  })
}
