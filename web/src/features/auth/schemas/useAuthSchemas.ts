import { useMemo } from 'react'
import { useT } from '../../../components/T'
import { loginSchema, registerSchema, forgotPasswordSchema } from './auth.schemas'

export const useAuthSchemas = () => {
  const t = useT(import.meta.url)

  return useMemo(() => ({
    loginSchema:          loginSchema(t),
    registerSchema:       registerSchema(t),
    forgotPasswordSchema: forgotPasswordSchema(t),
  }), [t])
}
