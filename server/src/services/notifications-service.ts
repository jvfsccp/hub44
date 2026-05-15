import { NotificationsRepository } from '@/repositories/notifications-repository'

export class NotificationsService {
  constructor(
    private readonly notificationsRepository = new NotificationsRepository(),
  ) {}

  async listByUserId(userId: string) {
    const notifications =
      await this.notificationsRepository.listByUserId(userId)

    return notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      orderId: notification.orderId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    }))
  }
}
