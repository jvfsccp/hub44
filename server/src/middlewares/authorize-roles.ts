import type { FastifyReply, FastifyRequest } from 'fastify'

import type { AuthTokenPayload } from '@/types/auth'

export function authorizeRoles(...roles: AuthTokenPayload['role'][]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({ message: 'Forbidden' })
    }
  }
}
