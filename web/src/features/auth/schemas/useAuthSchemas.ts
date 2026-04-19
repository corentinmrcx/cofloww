import { useMemo } from 'react'
import { useT } from '../../../components/T'
import { loginSchema, registerSchema, forgotPasswordSchema } from './auth.schemas'
import trad from './trad.json'

export const useAuthSchemas = () => {
  const t = useT(trad)

  return useMemo(() => ({
    loginSchema:          loginSchema(t),
    registerSchema:       registerSchema(t),
    forgotPasswordSchema: forgotPasswordSchema(t),
  }), [t])
}
