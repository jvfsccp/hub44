import type { FastifyReply, FastifyRequest } from 'fastify'

import { NotificationsService } from '@/services/notifications-service'

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
}
