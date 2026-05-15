import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { OrdersController } from '@/controllers/orders-controller'
import { authenticate } from '@/middlewares/authenticate'
import { authorizeRoles } from '@/middlewares/authorize-roles'

const messageSchema = z.object({ message: z.string() })
const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'ready_to_ship',
  'shipped',
  'delivered',
  'canceled',
])
const paymentStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded'])
const paymentMethodSchema = z.enum(['card', 'pix', 'boleto'])
const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string().nullable(),
  productName: z.string(),
  productImageUrl: z.string().nullable(),
  quantity: z.number().int(),
  unitPriceInCents: z.number().int(),
  subtotalInCents: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const orderEventSchema = z.object({
  id: z.string(),
  status: orderStatusSchema,
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(),
})
const orderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  storeId: z.string(),
  addressId: z.string().nullable(),
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  paymentMethod: paymentMethodSchema,
  deliveryMethod: z.string(),
  trackingCode: z.string().nullable(),
  subtotalInCents: z.number().int(),
  shippingInCents: z.number().int(),
  discountInCents: z.number().int(),
  totalInCents: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(orderItemSchema),
  events: z.array(orderEventSchema),
})

export const ordersRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new OrdersController()

  app.post(
    '/orders',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Create orders from checkout items',
        description:
          'Creates one order per store and publishes order/notification Kafka events.',
        tags: ['Orders'],
        body: z.object({
          addressId: z.string().nullable().optional(),
          paymentMethod: paymentMethodSchema,
          deliveryMethod: z.string().trim().min(1).optional(),
          couponCode: z.string().trim().nullable().optional(),
          items: z
            .array(
              z.object({
                productId: z.string().min(1),
                quantity: z.number().int().positive(),
              }),
            )
            .min(1),
        }),
        response: {
          201: z.object({ orders: z.array(orderSchema) }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          503: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.create,
  )

  app.get(
    '/orders',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'List authenticated customer orders',
        tags: ['Orders'],
        response: {
          200: z.object({ orders: z.array(orderSchema) }),
          401: messageSchema,
          403: messageSchema,
        },
      },
    },
    controller.listCustomerOrders,
  )

  app.get(
    '/orders/:orderId',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Get authenticated customer order detail',
        tags: ['Orders'],
        params: z.object({
          orderId: z.string().min(1),
        }),
        response: {
          200: z.object({ order: orderSchema }),
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.getCustomerOrder,
  )

  app.get(
    '/seller/orders',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'List authenticated seller orders',
        tags: ['Seller Orders'],
        response: {
          200: z.object({ orders: z.array(orderSchema) }),
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.listSellerOrders,
  )

  app.patch(
    '/seller/orders/:orderId/status',
    {
      preHandler: [authenticate, authorizeRoles('seller', 'admin')],
      schema: {
        summary: 'Update authenticated seller order status',
        description: 'Publishes order status and notification Kafka events.',
        tags: ['Seller Orders'],
        params: z.object({
          orderId: z.string().min(1),
        }),
        body: z.object({
          status: orderStatusSchema,
          trackingCode: z.string().trim().nullable().optional(),
        }),
        response: {
          200: z.object({ order: orderSchema }),
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          503: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.updateSellerOrderStatus,
  )
}
