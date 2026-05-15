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
}
