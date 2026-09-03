export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface AppNotification {
  id: string
  title: string
  body: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  link?: string
}
