import { eq } from 'drizzle-orm'

import { db } from '@/db'
import stores from '@/db/schema/stores'

export type Store = typeof stores.$inferSelect
export type StoreStatus = Store['status']

export class StoresRepository {
  async listPublic() {
    return db
      .select()
      .from(stores)
      .where(eq(stores.status, 'approved'))
      .orderBy(stores.name)
  }

  async findById(id: string) {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1)

    return store ?? null
  }

  async findBySlug(slug: string) {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.slug, slug))
      .limit(1)

    return store ?? null
  }

  async findByCnpj(cnpj: string) {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.cnpj, cnpj))
      .limit(1)

    return store ?? null
  }

  async findByOwnerId(ownerId: string) {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.ownerId, ownerId))
      .limit(1)

    return store ?? null
  }

  async create(input: {
    ownerId: string
    name: string
    slug: string
    description: string
    cnpj: string
    phone: string
  }) {
    const [store] = await db.insert(stores).values(input).returning()

    return store
  }

  async update(
    id: string,
    input: Partial<{
      name: string
      slug: string
      description: string
      cnpj: string
      phone: string
    }>,
  ) {
    const [store] = await db
      .update(stores)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, id))
      .returning()

    return store ?? null
  }

  async updateStatus(id: string, status: StoreStatus) {
    const [store] = await db
      .update(stores)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, id))
      .returning()

    return store ?? null
  }
}
