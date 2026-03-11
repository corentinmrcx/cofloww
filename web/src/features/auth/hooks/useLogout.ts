import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import api from '../../../services/api'

export const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => api.post('/logout'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      navigate('/login')
    },
  })
}
