import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import stores from './stores'
import users from './users'

const addresses = pgTable(
  'addresses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    storeId: text('store_id').references(() => stores.id, {
      onDelete: 'cascade',
    }),
    street: text('street').notNull(),
    number: text('number').notNull(),
    complement: text('complement'),
    district: text('district').notNull(),
    city: text('city').notNull(),
    state: text('state').notNull(),
    zipCode: text('zip_code').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('addresses_user_id_idx').on(table.userId),
    index('addresses_store_id_idx').on(table.storeId),
  ],
)

export default addresses
