import { z } from 'zod'

type T = (key: string) => string

export const loginSchema = (t: T) => z.object({
  email:    z.email(t('email_invalid')),
  password: z.string().min(1, t('password_required')),
})

export const registerSchema = (t: T) => z.object({
  lastname:              z.string().min(1, t('lastname_required')),
  firstname:             z.string().min(1, t('firstname_required')),
  email:                 z.email(t('email_invalid')),
  password:              z.string().min(8, t('password_min')),
  password_confirmation: z.string().min(1, t('password_confirmation_required')),
}).refine(
  data => data.password === data.password_confirmation,
  { message: t('password_mismatch'), path: ['password_confirmation'] },
)

export const forgotPasswordSchema = (t: T) => z.object({
  email: z.email(t('email_invalid')),
})

export type LoginSchema          = z.infer<ReturnType<typeof loginSchema>>
export type RegisterSchema       = z.infer<ReturnType<typeof registerSchema>>
export type ForgotPasswordSchema = z.infer<ReturnType<typeof forgotPasswordSchema>>
