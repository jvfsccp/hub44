import { compare, hash } from 'bcryptjs'

import type { User, UserRole } from '@/repositories/users-repository'
import { UsersRepository } from '@/repositories/users-repository'

export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('Email already in use')
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials')
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('User not found')
  }
}

export class AuthService {
  constructor(private readonly usersRepository = new UsersRepository()) {}

  async register(input: {
    name: string
    email: string
    phone: string
    password: string
    role?: Extract<UserRole, 'customer' | 'seller'>
  }) {
    const existingUser = await this.usersRepository.findByEmail(input.email)

    if (existingUser) {
      throw new EmailAlreadyInUseError()
    }

    const passwordHash = await hash(input.password, 8)

    return this.usersRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role ?? 'customer',
    })
  }

  async login(input: { email: string; password: string }) {
    const user = await this.usersRepository.findByEmail(input.email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await compare(input.password, user.passwordHash)

    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    return user
  }

  async getUserById(id: string) {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  }
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }
}
