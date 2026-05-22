import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  NotificationNotFoundError,
  NotificationsService,
} from '@/services/notifications-service'

type MarkNotificationReadRequest = FastifyRequest<{
  Params: { notificationId: string }
}>

export class NotificationsController {
  constructor(
    private readonly notificationsService = new NotificationsService(),
  ) {}

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const notifications = await this.notificationsService.listByUserId(
      request.user.sub,
    )

    return reply.status(200).send({ notifications })
  }

  markAsRead = async (
    request: MarkNotificationReadRequest,
    reply: FastifyReply,
  ) => {
    try {
      const notification = await this.notificationsService.markAsRead(
        request.user.sub,
        request.params.notificationId,
      )

      return reply.status(200).send({ notification })
    } catch (error) {
      if (error instanceof NotificationNotFoundError) {
        return reply.status(404).send({ message: error.message })
      }

      throw error
    }
  }

  markAllAsRead = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await this.notificationsService.markAllAsRead(
      request.user.sub,
    )

    return reply.status(200).send(result)
  }
}
