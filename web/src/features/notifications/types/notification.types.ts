export type NotificationType = 'budget_alert' | 'import_success' | 'import_error'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown> | null
  read: boolean
  read_at: string | null
  created_at: string
}

export interface NotificationsResponse {
  data: AppNotification[]
  unread_count: number
}
