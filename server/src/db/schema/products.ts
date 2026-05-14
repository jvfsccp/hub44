import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import stores from './stores'

const products = pgTable(
  'products',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description').notNull(),
    priceInCents: integer('price_in_cents').notNull(),
    imageUrl: text('image_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('products_store_id_idx').on(table.storeId)],
)

export default products
