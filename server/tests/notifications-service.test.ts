import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { NotificationsRepository } from '../src/repositories/notifications-repository'
import {
  NotificationNotFoundError,
  NotificationsService,
} from '../src/services/notifications-service'

const createdAt = new Date('2026-05-22T12:00:00Z')

test('lists notifications serialized for API responses', async () => {
  const service = new NotificationsService({
    listByUserId: async () => [
      makeNotification({ id: 'notification-1', readAt: null }),
      makeNotification({
        id: 'notification-2',
        readAt: new Date('2026-05-22T13:00:00Z'),
      }),
    ],
  } as unknown as NotificationsRepository)

  const notifications = await service.listByUserId('user-1')

  assert.equal(notifications.length, 2)
  assert.equal(notifications[0].readAt, null)
  assert.equal(notifications[1].readAt, '2026-05-22T13:00:00.000Z')
})

test('marks a notification as read', async () => {
  const service = new NotificationsService({
    markAsRead: async () =>
      makeNotification({
        id: 'notification-1',
        readAt: new Date('2026-05-22T13:00:00Z'),
      }),
  } as unknown as NotificationsRepository)

  const notification = await service.markAsRead('user-1', 'notification-1')

  assert.equal(notification.readAt, '2026-05-22T13:00:00.000Z')
})

test('throws when notification does not belong to the user', async () => {
  const service = new NotificationsService({
    markAsRead: async () => null,
  } as unknown as NotificationsRepository)

  await assert.rejects(
    () => service.markAsRead('user-1', 'missing'),
    NotificationNotFoundError,
  )
})

function makeNotification(input: { id: string; readAt: Date | null }) {
  return {
    id: input.id,
    userId: 'user-1',
    orderId: 'order-1',
    type: 'order_created',
    title: 'Pedido confirmado',
    message: 'Seu pedido foi confirmado.',
    readAt: input.readAt,
    createdAt,
    updatedAt: createdAt,
  } as const
}
