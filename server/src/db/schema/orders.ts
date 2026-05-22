import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

import addresses from './addresses'
import stores from './stores'
import users from './users'

export const orderStatuses = pgEnum('order_status', [
  'pending',
  'confirmed',
  'preparing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'canceled',
])

export const paymentStatuses = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
])

export const paymentMethods = pgEnum('payment_method', ['card', 'pix'])

const orders = pgTable(
  'orders',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    customerId: text('customer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    storeId: text('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'restrict' }),
    addressId: text('address_id').references(() => addresses.id, {
      onDelete: 'set null',
    }),
    status: orderStatuses('status').notNull().default('confirmed'),
    paymentStatus: paymentStatuses('payment_status').notNull().default('paid'),
    paymentMethod: paymentMethods('payment_method').notNull(),
    deliveryMethod: text('delivery_method').notNull().default('standard'),
    trackingCode: text('tracking_code'),
    subtotalInCents: integer('subtotal_in_cents').notNull(),
    shippingInCents: integer('shipping_in_cents').notNull().default(0),
    discountInCents: integer('discount_in_cents').notNull().default(0),
    totalInCents: integer('total_in_cents').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('orders_customer_id_idx').on(table.customerId),
    index('orders_store_id_idx').on(table.storeId),
    index('orders_address_id_idx').on(table.addressId),
  ],
)

export default orders
