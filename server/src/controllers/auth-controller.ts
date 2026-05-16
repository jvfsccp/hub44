import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  AuthService,
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  toPublicUser,
  UserNotFoundError,
} from '@/services/auth-service'
import type { AuthTokenPayload } from '@/types/auth'
import { sendInternalServerError } from '@/utils/internal-server-error'

const accessTokenMaxAge = '15m'
const refreshTokenMaxAge = '7d'
const refreshCookieName = 'refreshToken'

type RegisterRequest = FastifyRequest<{
  Body: { name: string; email: string; phone: string; password: string }
}>

type LoginRequest = FastifyRequest<{
  Body: { email: string; password: string }
}>

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  register = async (request: RegisterRequest, reply: FastifyReply) => {
    try {
      const user = await this.authService.register(request.body)

      return reply.status(201).send({ user: toPublicUser(user) })
    } catch (error) {
      if (error instanceof EmailAlreadyInUseError) {
        return reply.status(409).send({ message: error.message })
      }

      return sendInternalServerError(error, reply, 'auth.register')
    }
  }

  login = async (request: LoginRequest, reply: FastifyReply) => {
    try {
      const user = await this.authService.login(request.body)
      const payload = this.createTokenPayload(user)
      const accessToken = await reply.jwtSign(payload, {
        expiresIn: accessTokenMaxAge,
      })
      const refreshToken = await reply.jwtSign(payload, {
        expiresIn: refreshTokenMaxAge,
      })

      this.setRefreshCookie(reply, refreshToken)

      return reply.status(200).send({
        accessToken,
        user: toPublicUser(user),
      })
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        return reply.status(401).send({ message: error.message })
      }

      return sendInternalServerError(error, reply, 'auth.login')
    }
  }

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({ user: request.user })
  }

  refresh = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = await request.jwtVerify<AuthTokenPayload>({
        onlyCookie: true,
      })
      const user = await this.authService.getUserById(payload.sub)
      const updatedPayload = this.createTokenPayload(user)
      const accessToken = await reply.jwtSign(updatedPayload, {
        expiresIn: accessTokenMaxAge,
      })
      const refreshToken = await reply.jwtSign(updatedPayload, {
        expiresIn: refreshTokenMaxAge,
      })

      this.setRefreshCookie(reply, refreshToken)

      return reply.status(200).send({
        accessToken,
        user: updatedPayload,
      })
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      return reply.status(401).send({ message: 'Unauthorized' })
    }
  }

  logout = async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply
      .clearCookie(refreshCookieName, { path: '/' })
      .status(200)
      .send({ message: 'Logged out' })
  }

  private createTokenPayload(user: {
    id: string
    name: string
    email: string
    phone: string | null
    role: AuthTokenPayload['role']
  }): AuthTokenPayload {
    return {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    }
  }

  private setRefreshCookie(reply: FastifyReply, refreshToken: string) {
    reply.setCookie(refreshCookieName, refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
  }
}
