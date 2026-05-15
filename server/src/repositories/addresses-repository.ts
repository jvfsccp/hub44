import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import addresses from '@/db/schema/addresses'

export type Address = typeof addresses.$inferSelect

export class AddressesRepository {
  async findByStoreId(storeId: string) {
    return db.select().from(addresses).where(eq(addresses.storeId, storeId))
  }

  async findByUserId(userId: string) {
    return db.select().from(addresses).where(eq(addresses.userId, userId))
  }

  async findByUserIdAndId(userId: string, id: string) {
    const [address] = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.id, id)))
      .limit(1)

    return address ?? null
  }

  async create(input: {
    userId?: string | null
    storeId?: string | null
    recipient?: string | null
    street: string
    number: string
    complement?: string | null
    district: string
    city: string
    state: string
    zipCode: string
    isPrimary?: boolean
  }) {
    const [address] = await db.insert(addresses).values(input).returning()

    return address
  }

  async update(
    id: string,
    input: Partial<{
      recipient: string | null
      street: string
      number: string
      complement: string | null
      district: string
      city: string
      state: string
      zipCode: string
      isPrimary: boolean
    }>,
  ) {
    const [address] = await db
      .update(addresses)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(addresses.id, id))
      .returning()

    return address ?? null
  }

  async unsetPrimaryForUser(userId: string) {
    await db
      .update(addresses)
      .set({
        isPrimary: false,
        updatedAt: new Date(),
      })
      .where(eq(addresses.userId, userId))
  }

  async delete(id: string) {
    const [address] = await db
      .delete(addresses)
      .where(eq(addresses.id, id))
      .returning()

    return address ?? null
  }
}
