import { eq } from 'drizzle-orm'

import { db } from '@/db'
import users from '@/db/schema/users'

export type User = typeof users.$inferSelect
export type UserRole = User['role']

export class UsersRepository {
  async findByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    return user ?? null
  }

  async findById(id: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    return user ?? null
  }

  async create(input: {
    name: string
    email: string
    passwordHash: string
    phone?: string
    role?: UserRole
  }) {
    const [user] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        phone: input.phone,
        role: input.role ?? 'customer',
      })
      .returning()

    return user
  }

  async updateRole(id: string, role: UserRole) {
    const [user] = await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    return user ?? null
  }

  async updateProfile(
    id: string,
    input: Partial<{
      name: string
      email: string
      phone: string | null
      cpf: string | null
      emailNotifications: boolean
      newsletter: boolean
      promotions: boolean
    }>,
  ) {
    const [user] = await db
      .update(users)
      .set({
        ...input,
        ...(input.email ? { email: input.email.toLowerCase() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    return user ?? null
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    const [user] = await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning()

    return user ?? null
  }
}
