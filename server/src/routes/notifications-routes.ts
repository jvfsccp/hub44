import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { NotificationsController } from '@/controllers/notifications-controller'
import { authenticate } from '@/middlewares/authenticate'

const messageSchema = z.object({ message: z.string() })
const notificationTypeSchema = z.enum([
  'order_created',
  'order_status_updated',
  'payment_updated',
  'system',
])
const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  orderId: z.string().nullable(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const notificationsRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new NotificationsController()

  app.get(
    '/notifications',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'List authenticated user notifications',
        tags: ['Notifications'],
        response: {
          200: z.object({ notifications: z.array(notificationSchema) }),
          401: messageSchema,
        },
      },
    },
    controller.list,
  )

  app.patch(
    '/notifications/:notificationId/read',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Mark a notification as read',
        tags: ['Notifications'],
        params: z.object({
          notificationId: z.string().min(1),
        }),
        response: {
          200: z.object({ notification: notificationSchema }),
          401: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.markAsRead,
  )

  app.patch(
    '/notifications/read',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Mark all authenticated user notifications as read',
        tags: ['Notifications'],
        response: {
          200: z.object({
            updatedCount: z.number().int(),
            notifications: z.array(notificationSchema),
          }),
          401: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.markAllAsRead,
  )
}
