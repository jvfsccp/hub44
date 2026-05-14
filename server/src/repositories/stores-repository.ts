import { eq } from 'drizzle-orm'

import { db } from '@/db'
import stores from '@/db/schema/stores'

export type Store = typeof stores.$inferSelect

export class StoresRepository {
  async findById(id: string) {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1)

    return store ?? null
  }

  async create(input: {
    id: string
    name: string
    description: string
    logoUrl: string
    bannerUrl: string
  }) {
    const [store] = await db.insert(stores).values(input).returning()

    return store
  }
}
