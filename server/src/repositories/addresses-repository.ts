import { db } from '@/db'
import addresses from '@/db/schema/addresses'

export type Address = typeof addresses.$inferSelect

export class AddressesRepository {
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
