import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/services/auth-service'
import { toUserProfileResponse, UsersService } from '@/services/users-service'
import { sendInternalServerError } from '@/utils/internal-server-error'

type UpdateProfileRequest = FastifyRequest<{
  Body: Partial<{
    name: string
    email: string
    phone: string | null
    cpf: string | null
    emailNotifications: boolean
    newsletter: boolean
    promotions: boolean
  }>
}>

type UpdatePasswordRequest = FastifyRequest<{
  Body: {
    currentPassword: string
    newPassword: string
  }
}>

export class UsersController {
  constructor(private readonly usersService = new UsersService()) {}

  getProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await this.usersService.getProfile(request.user.sub)

      return reply.status(200).send({ user: toUserProfileResponse(user) })
    } catch (error) {
      return handleUsersError(error, reply)
    }
  }

  updateProfile = async (
    request: UpdateProfileRequest,
    reply: FastifyReply,
  ) => {
    try {
      const user = await this.usersService.updateProfile(
        request.user.sub,
        request.body,
      )

      return reply.status(200).send({ user: toUserProfileResponse(user) })
    } catch (error) {
      return handleUsersError(error, reply)
    }
  }

  updatePassword = async (
    request: UpdatePasswordRequest,
    reply: FastifyReply,
  ) => {
    try {
      await this.usersService.updatePassword({
        userId: request.user.sub,
        currentPassword: request.body.currentPassword,
        newPassword: request.body.newPassword,
      })

      return reply.status(200).send({ message: 'Password updated' })
    } catch (error) {
      return handleUsersError(error, reply)
    }
  }
}

function handleUsersError(error: unknown, reply: FastifyReply) {
  if (error instanceof UserNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof EmailAlreadyInUseError) {
    return reply.status(409).send({ message: error.message })
  }

  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({ message: error.message })
  }

  return sendInternalServerError(error, reply, 'users')
}
