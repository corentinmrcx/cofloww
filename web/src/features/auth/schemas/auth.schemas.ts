import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string().min(1, 'La confirmation est requise'),
}).refine(
  data => data.password === data.password_confirmation,
  { message: 'Les mots de passe ne correspondent pas', path: ['password_confirmation'] },
)

export const forgotPasswordSchema = z.object({
  email: z.email('Email invalide'),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
