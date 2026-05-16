import type { FastifyReply } from 'fastify'

export function sendInternalServerError(
  error: unknown,
  reply: FastifyReply,
  context: string,
) {
  reply.log.error(
    {
      ...toErrorLogPayload(error),
      context,
      method: reply.request.method,
      url: reply.request.url,
      statusCode: 500,
    },
    `${reply.request.method} ${reply.request.url} internal server error`,
  )

  return reply.status(500).send({ message: 'Internal server error' })
}

export function toErrorLogPayload(error: unknown) {
  if (error instanceof Error) {
    return { err: error }
  }

  return { error }
}
