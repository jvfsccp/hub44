import { and, desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import cartItems from '@/db/schema/cart-items'
import categories from '@/db/schema/categories'
import products from '@/db/schema/products'
import stores from '@/db/schema/stores'

export type CartItem = typeof cartItems.$inferSelect
export type CartItemStatus = CartItem['status']

type CreateCartItemInput = {
  userId: string
  productId: string
  quantity: number
  status?: CartItemStatus
}

type CartProductRow = {
  id: string
  storeId: string
  storeName: string
  storeSlug: string
  categoryId: string
  categoryName: string
  name: string
  slug: string
  description: string | null
  priceInCents: number
  stock: number
  imageUrl: string | null
  status: string
  storeStatus: string
}

export type CartItemWithProduct = {
  item: CartItem
  product: CartProductRow
}

export class CartRepository {
  async listByUserId(userId: string) {
    return db
      .select({
        item: cartItems,
        product: {
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
          storeStatus: stores.status,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(stores, eq(products.storeId, stores.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt))
  }

  async findByUserProductStatus(input: {
    userId: string
    productId: string
    status: CartItemStatus
  }) {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, input.userId),
          eq(cartItems.productId, input.productId),
          eq(cartItems.status, input.status),
        ),
      )
      .limit(1)

    return item ?? null
  }

  async findByUserIdAndId(input: { userId: string; id: string }) {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(
        and(eq(cartItems.userId, input.userId), eq(cartItems.id, input.id)),
      )
      .limit(1)

    return item ?? null
  }

  async create(input: CreateCartItemInput) {
    const [item] = await db.insert(cartItems).values(input).returning()

    return item
  }

  async updateQuantity(id: string, quantity: number) {
    const [item] = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, id))
      .returning()

    return item ?? null
  }

  async updateStatus(id: string, status: CartItemStatus) {
    const [item] = await db
      .update(cartItems)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, id))
      .returning()

    return item ?? null
  }

  async delete(id: string) {
    const [item] = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id))
      .returning()

    return item ?? null
  }

  async clearByUserIdAndStatus(userId: string, status: CartItemStatus) {
    return db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.status, status)))
      .returning()
  }
}
