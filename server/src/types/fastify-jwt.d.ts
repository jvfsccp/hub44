import type { AuthTokenPayload } from '@/types/auth'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthTokenPayload
    user: AuthTokenPayload
  }
}
