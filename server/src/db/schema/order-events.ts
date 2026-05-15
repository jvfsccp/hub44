import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import orders, { orderStatuses } from './orders'

const orderEvents = pgTable(
  'order_events',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: orderStatuses('status').notNull(),
    message: text('message').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('order_events_order_id_idx').on(table.orderId)],
)

export default orderEvents
