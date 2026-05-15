import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import products from '@/db/schema/products'

export type Product = typeof products.$inferSelect

export class ProductsRepository {
  async findById(id: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    return product ?? null
  }

  async findByStoreIdAndId(storeId: string, id: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.id, id)))
      .limit(1)

    return product ?? null
  }

  async findByStoreIdAndSlug(storeId: string, slug: string) {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.slug, slug)))
      .limit(1)

    return product ?? null
  }

  async create(input: {
    storeId: string
    categoryId: string
    name: string
    slug: string
    description?: string | null
    priceInCents: number
    stock?: number
  }) {
    const [product] = await db.insert(products).values(input).returning()

    return product
  }

  async updateImageUrl(id: string, imageUrl: string) {
    const [product] = await db
      .update(products)
      .set({
        imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    return product
  }
}
