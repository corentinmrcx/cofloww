export type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  email_verified_at: string | null
  currency: string
  timezone: string
  created_at: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  lastname: string
  firstname: string
  email: string
  password: string
  password_confirmation: string
}
