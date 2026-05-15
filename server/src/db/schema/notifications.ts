import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import orders from './orders'
import users from './users'

export const notificationTypes = pgEnum('notification_type', [
  'order_created',
  'order_status_updated',
  'payment_updated',
  'system',
])

const notifications = pgTable(
  'notifications',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orderId: text('order_id').references(() => orders.id, {
      onDelete: 'cascade',
    }),
    type: notificationTypes('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_order_id_idx').on(table.orderId),
  ],
)

export default notifications
