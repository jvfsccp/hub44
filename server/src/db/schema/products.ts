import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import categories from './categories'
import stores from './stores'

export const productStatuses = pgEnum('product_status', [
  'draft',
  'active',
  'paused',
  'inactive',
  'out_of_stock',
])

const products = pgTable(
  'products',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    priceInCents: integer('price_in_cents').notNull(),
    stock: integer('stock').notNull().default(0),
    imageUrl: text('image_url'),
    status: productStatuses('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('products_store_id_idx').on(table.storeId),
    index('products_category_id_idx').on(table.categoryId),
    uniqueIndex('products_store_slug_unique').on(table.storeId, table.slug),
  ],
)

export default products
