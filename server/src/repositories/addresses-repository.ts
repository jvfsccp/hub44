import { eq } from 'drizzle-orm'

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

  async create(input: {
    userId?: string | null
    storeId?: string | null
    street: string
    number: string
    complement?: string | null
    district: string
    city: string
    state: string
    zipCode: string
  }) {
    const [address] = await db.insert(addresses).values(input).returning()

    return address
  }
}
