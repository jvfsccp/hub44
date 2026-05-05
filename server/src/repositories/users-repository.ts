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
  }) {
    const [user] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        phone: input.phone,
        role: 'customer',
      })
      .returning()

    return user
  }
}
