import { apiRequest } from '@/lib/api'

export type NotificationType =
  | 'order_created'
  | 'order_status_updated'
  | 'payment_updated'
  | 'system'

export type Notification = {
  id: string
  userId: string
  orderId: string | null
  type: NotificationType
  title: string
  message: string
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export const notificationQueryKeys = {
  all: ['notifications'] as const,
}

export async function listNotifications() {
  return apiRequest<{ notifications: Notification[] }>('/notifications')
}

export async function markNotificationRead(notificationId: string) {
  return apiRequest<{ notification: Notification }>(
    `/notifications/${notificationId}/read`,
    { method: 'PATCH' },
  )
}

export async function markAllNotificationsRead() {
  return apiRequest<{ updatedCount: number; notifications: Notification[] }>(
    '/notifications/read',
    { method: 'PATCH' },
  )
}
