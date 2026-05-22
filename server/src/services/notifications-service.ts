import {
  type Notification,
  NotificationsRepository,
} from '@/repositories/notifications-repository'

export class NotificationsService {
  constructor(
    private readonly notificationsRepository = new NotificationsRepository(),
  ) {}

  async listByUserId(userId: string) {
    const notifications =
      await this.notificationsRepository.listByUserId(userId)

    return notifications.map(toNotificationResponse)
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationsRepository.markAsRead(
      userId,
      notificationId,
    )

    if (!notification) {
      throw new NotificationNotFoundError()
    }

    return toNotificationResponse(notification)
  }

  async markAllAsRead(userId: string) {
    const notifications =
      await this.notificationsRepository.markAllAsRead(userId)

    return {
      updatedCount: notifications.length,
      notifications: notifications.map(toNotificationResponse),
    }
  }
}

export class NotificationNotFoundError extends Error {
  constructor() {
    super('Notification not found')
  }
}

function toNotificationResponse(notification: Notification) {
  return {
    id: notification.id,
    userId: notification.userId,
    orderId: notification.orderId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
    updatedAt: notification.updatedAt.toISOString(),
  }
}
