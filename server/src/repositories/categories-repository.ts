import { eq } from 'drizzle-orm'

import { db } from '@/db'
import categories from '@/db/schema/categories'

export type Category = typeof categories.$inferSelect

export class CategoriesRepository {
  async list() {
    return db.select().from(categories).orderBy(categories.name)
  }

  async findById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    return category ?? null
  }

  async findBySlug(slug: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1)

    return category ?? null
  }

  async create(input: {
    name: string
    slug: string
    description?: string | null
  }) {
    const [category] = await db.insert(categories).values(input).returning()

    return category
  }
}
