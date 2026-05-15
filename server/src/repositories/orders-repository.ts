import { and, desc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import orderEvents from '@/db/schema/order-events'
import orderItems from '@/db/schema/order-items'
import orders from '@/db/schema/orders'

export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type OrderEvent = typeof orderEvents.$inferSelect
export type OrderStatus = Order['status']
export type PaymentMethod = Order['paymentMethod']
export type PaymentStatus = Order['paymentStatus']

type CreateOrderInput = {
  customerId: string
  storeId: string
  addressId?: string | null
  paymentMethod: PaymentMethod
  paymentStatus?: PaymentStatus
  status?: OrderStatus
  deliveryMethod?: string
  subtotalInCents: number
  shippingInCents: number
  discountInCents: number
  totalInCents: number
}

type CreateOrderItemInput = {
  orderId: string
  productId?: string | null
  productName: string
  productImageUrl?: string | null
  quantity: number
  unitPriceInCents: number
  subtotalInCents: number
}

export class OrdersRepository {
  async create(input: CreateOrderInput) {
    const [order] = await db.insert(orders).values(input).returning()

    return order
  }

  async createItems(input: CreateOrderItemInput[]) {
    if (input.length === 0) {
      return []
    }

    return db.insert(orderItems).values(input).returning()
  }

  async createEvent(input: {
    orderId: string
    status: OrderStatus
    message: string
    metadata?: Record<string, unknown>
  }) {
    const [event] = await db.insert(orderEvents).values(input).returning()

    return event
  }

  async listByCustomerId(customerId: string) {
    return db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt))
  }

  async listByStoreId(storeId: string) {
    return db
      .select()
      .from(orders)
      .where(eq(orders.storeId, storeId))
      .orderBy(desc(orders.createdAt))
  }

  async findByCustomerIdAndId(customerId: string, orderId: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.customerId, customerId), eq(orders.id, orderId)))
      .limit(1)

    return order ?? null
  }

  async findByStoreIdAndId(storeId: string, orderId: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.storeId, storeId), eq(orders.id, orderId)))
      .limit(1)

    return order ?? null
  }

  async listItems(orderIds: string[]) {
    if (orderIds.length === 0) {
      return []
    }

    return db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds))
  }

  async listItemsByOrderId(orderId: string) {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId))
  }

  async listEventsByOrderId(orderId: string) {
    return db
      .select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, orderId))
      .orderBy(orderEvents.createdAt)
  }

  async updateStatus(input: {
    orderId: string
    status: OrderStatus
    trackingCode?: string | null
  }) {
    const [order] = await db
      .update(orders)
      .set({
        status: input.status,
        trackingCode: input.trackingCode,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, input.orderId))
      .returning()

    return order ?? null
  }
}
