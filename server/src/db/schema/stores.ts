import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import users from './users'

export const storeStatuses = pgEnum('store_status', [
  'pending',
  'approved',
  'rejected',
  'inactive',
])

const stores = pgTable(
  'stores',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    cnpj: text('cnpj').notNull().unique(),
    phone: text('phone').notNull(),
    status: storeStatuses('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('stores_owner_id_idx').on(table.ownerId)],
)

export default stores
