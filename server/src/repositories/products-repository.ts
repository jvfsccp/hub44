import { db } from '@/db'
import products from '@/db/schema/products'

export type Product = typeof products.$inferSelect

export class ProductsRepository {
  async create(input: {
    id: string
    storeId: string
    name: string
    description: string
    priceInCents: number
    imageUrl: string
  }) {
    const [product] = await db.insert(products).values(input).returning()

    return product
  }
}
