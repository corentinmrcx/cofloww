export interface Tag {
  id: string
  name: string
  color: string | null
  created_at: string
  updated_at: string
}

export interface CreateTagPayload {
  name: string
  color?: string
}
