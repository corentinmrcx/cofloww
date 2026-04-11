import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../services/api'

export const useUpdateProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { firstname: string; lastname: string; email: string }) =>
      api.patch('/api/v1/profile', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'user'] }),
  })
}

export const useUpdatePassword = () =>
  useMutation({
    mutationFn: (data: { current_password: string; password: string; password_confirmation: string }) =>
      api.patch('/api/v1/profile/password', data),
  })

export const useUploadAvatar = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('avatar', file)
      return api.post('/api/v1/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data.data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'user'] }),
  })
}

export const useUpdatePreferences = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, string>) =>
      api.patch('/api/v1/profile/preferences', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'user'] }),
  })
}

export const useExportData = () =>
  useMutation({
    mutationFn: async () => {
      const res = await api.get('/api/v1/account/export', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/json' }))
      const a   = document.createElement('a')
      a.href    = url
      a.download = `cofloww-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
  })

export const useLogoutAll = () =>
  useMutation({
    mutationFn: () => api.post('/api/v1/account/logout-all'),
  })

export const useDeleteAccount = () =>
  useMutation({
    mutationFn: (password: string) =>
      api.delete('/api/v1/account', { data: { password } }),
  })
