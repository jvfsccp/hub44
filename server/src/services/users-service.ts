import { compare, hash } from 'bcryptjs'

import type { User } from '@/repositories/users-repository'
import { UsersRepository } from '@/repositories/users-repository'
import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '@/services/auth-service'

type UpdateProfileInput = Partial<{
  name: string
  email: string
  phone: string | null
  cpf: string | null
  emailNotifications: boolean
  newsletter: boolean
  promotions: boolean
}>

export class UsersService {
  constructor(private readonly usersRepository = new UsersRepository()) {}

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    if (input.email) {
      const existingUser = await this.usersRepository.findByEmail(input.email)

      if (existingUser && existingUser.id !== userId) {
        throw new EmailAlreadyInUseError()
      }
    }

    const user = await this.usersRepository.updateProfile(userId, input)

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  }

  async updatePassword(input: {
    userId: string
    currentPassword: string
    newPassword: string
  }) {
    const user = await this.usersRepository.findById(input.userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    const passwordMatches = await compare(
      input.currentPassword,
      user.passwordHash,
    )

    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    const passwordHash = await hash(input.newPassword, 8)
    const updatedUser = await this.usersRepository.updatePasswordHash(
      input.userId,
      passwordHash,
    )

    if (!updatedUser) {
      throw new UserNotFoundError()
    }

    return updatedUser
  }
}

export function toUserProfileResponse(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    cpf: user.cpf,
    role: user.role,
    emailNotifications: user.emailNotifications,
    newsletter: user.newsletter,
    promotions: user.promotions,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
