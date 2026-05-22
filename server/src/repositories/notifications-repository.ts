import { and, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import notifications from '@/db/schema/notifications'

export type Notification = typeof notifications.$inferSelect
export type NotificationType = Notification['type']

export class NotificationsRepository {
  async create(input: {
    userId: string
    orderId?: string | null
    type: NotificationType
    title: string
    message: string
  }) {
    const [notification] = await db
      .insert(notifications)
      .values(input)
      .returning()

    return notification
  }

  async listByUserId(userId: string) {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
  }

  async markAsRead(userId: string, notificationId: string) {
    const [notification] = await db
      .update(notifications)
      .set({
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.id, notificationId),
        ),
      )
      .returning()

    return notification ?? null
  }

  async markAllAsRead(userId: string) {
    return db
      .update(notifications)
      .set({
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(notifications.userId, userId))
      .returning()
  }
}
