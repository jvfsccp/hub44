import { and, desc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import categories from '@/db/schema/categories'
import products from '@/db/schema/products'
import stores from '@/db/schema/stores'

export type Product = typeof products.$inferSelect
export type ProductStatus = Product['status']

export class ProductsRepository {
  async listPublic(input: { categoryId?: string; storeId?: string } = {}) {
    const conditions = [
      eq(products.status, 'active'),
      eq(stores.status, 'approved'),
    ]

    if (input.categoryId) {
      conditions.push(eq(products.categoryId, input.categoryId))
    }

    if (input.storeId) {
      conditions.push(eq(products.storeId, input.storeId))
    }

    return db
      .select({
        id: products.id,
        storeId: products.storeId,
        storeName: stores.name,
        storeSlug: stores.slug,
        categoryId: products.categoryId,
        categoryName: categories.name,
        name: products.name,
        slug: products.slug,
        description: products.description,
        priceInCents: products.priceInCents,
        stock: products.stock,
        imageUrl: products.imageUrl,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
  }

  async findPublicByIds(ids: string[]) {
    if (ids.length === 0) {
      return []
    }

    return db
      .select({
        id: products.id,
        storeId: products.storeId,
        storeName: stores.name,
        storeOwnerId: stores.ownerId,
        name: products.name,
        description: products.description,
        priceInCents: products.priceInCents,
        stock: products.stock,
        imageUrl: products.imageUrl,
        status: products.status,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .where(
        and(
          inArray(products.id, ids),
          eq(products.status, 'active'),
          eq(stores.status, 'approved'),
        ),
      )
  }

  async listByStoreId(storeId: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.storeId, storeId))
      .orderBy(desc(products.createdAt))
  }

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
    status?: ProductStatus
  }) {
    const [product] = await db.insert(products).values(input).returning()

    return product
  }

  async update(
    id: string,
    input: Partial<{
      categoryId: string
      name: string
      slug: string
      description: string | null
      priceInCents: number
      stock: number
      status: ProductStatus
    }>,
  ) {
    const [product] = await db
      .update(products)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    return product ?? null
  }

  async updateStatus(id: string, status: ProductStatus) {
    const [product] = await db
      .update(products)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    return product ?? null
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
