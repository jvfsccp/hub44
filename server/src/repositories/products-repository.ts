import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import categories from '@/db/schema/categories'
import productImages from '@/db/schema/product-images'
import products from '@/db/schema/products'
import stores from '@/db/schema/stores'

export type Product = typeof products.$inferSelect
export type ProductImage = typeof productImages.$inferSelect
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

  async listImagesByProductId(productId: string) {
    return db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(asc(productImages.position), asc(productImages.createdAt))
  }

  async listImagesByProductIds(productIds: string[]) {
    if (productIds.length === 0) {
      return []
    }

    return db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(
        asc(productImages.productId),
        asc(productImages.position),
        asc(productImages.createdAt),
      )
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

  async createImage(input: {
    id: string
    productId: string
    path: string
    imageUrl: string
  }) {
    const [nextPosition] = await db
      .select({
        value: sql<number>`coalesce(max(${productImages.position}), 0) + 1`,
      })
      .from(productImages)
      .where(eq(productImages.productId, input.productId))

    const [image] = await db
      .insert(productImages)
      .values({
        id: input.id,
        productId: input.productId,
        path: input.path,
        imageUrl: input.imageUrl,
        position: nextPosition?.value ?? 1,
      })
      .returning()

    return image
  }
}
