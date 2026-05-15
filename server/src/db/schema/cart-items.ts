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

import products from './products'
import users from './users'

export const cartItemStatuses = pgEnum('cart_item_status', [
  'active',
  'saved_for_later',
])

const cartItems = pgTable(
  'cart_items',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    status: cartItemStatuses('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('cart_items_user_id_idx').on(table.userId),
    index('cart_items_product_id_idx').on(table.productId),
    index('cart_items_status_idx').on(table.status),
    uniqueIndex('cart_items_user_product_status_unique').on(
      table.userId,
      table.productId,
      table.status,
    ),
  ],
)

export default cartItems
