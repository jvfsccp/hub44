import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CartController } from '@/controllers/cart-controller'
import { authenticate } from '@/middlewares/authenticate'
import { authorizeRoles } from '@/middlewares/authorize-roles'

const messageSchema = z.object({ message: z.string() })
const cartItemStatusSchema = z.enum(['active', 'saved_for_later'])
const cartItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  storeId: z.string(),
  storeName: z.string(),
  storeSlug: z.string(),
  categoryId: z.string(),
  categoryName: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  quantity: z.number().int(),
  status: cartItemStatusSchema,
  unitPriceInCents: z.number().int(),
  subtotalInCents: z.number().int(),
  stock: z.number().int(),
  available: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const cartSchema = z.object({
  items: z.array(cartItemSchema),
  savedItems: z.array(cartItemSchema),
  summary: z.object({
    itemsCount: z.number().int(),
    subtotalInCents: z.number().int(),
    shippingInCents: z.number().int(),
    discountInCents: z.number().int(),
    totalInCents: z.number().int(),
    couponCode: z.string().nullable(),
  }),
})

export const cartRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new CartController()

  app.get(
    '/cart',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Get authenticated customer cart',
        tags: ['Cart'],
        querystring: z.object({
          couponCode: z.string().trim().optional(),
        }),
        response: {
          200: cartSchema,
          401: messageSchema,
          403: messageSchema,
        },
      },
    },
    controller.getCart,
  )

  app.post(
    '/cart/items',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Add an item to the authenticated customer cart',
        tags: ['Cart'],
        body: z.object({
          productId: z.string().min(1),
          quantity: z.number().int().positive().optional(),
        }),
        response: {
          201: cartSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.addItem,
  )

  app.patch(
    '/cart/items/:cartItemId',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Update a cart item quantity',
        tags: ['Cart'],
        params: z.object({
          cartItemId: z.string().min(1),
        }),
        body: z.object({
          quantity: z.number().int().positive(),
        }),
        response: {
          200: cartSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.updateItem,
  )

  app.delete(
    '/cart/items/:cartItemId',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Remove a cart item',
        tags: ['Cart'],
        params: z.object({
          cartItemId: z.string().min(1),
        }),
        response: {
          200: cartSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.removeItem,
  )

  app.patch(
    '/cart/items/:cartItemId/save-for-later',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Move a cart item to saved items',
        tags: ['Cart'],
        params: z.object({
          cartItemId: z.string().min(1),
        }),
        response: {
          200: cartSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.saveForLater,
  )

  app.patch(
    '/cart/items/:cartItemId/move-to-cart',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Move a saved cart item back to the active cart',
        tags: ['Cart'],
        params: z.object({
          cartItemId: z.string().min(1),
        }),
        response: {
          200: cartSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.moveToCart,
  )

  app.delete(
    '/cart',
    {
      preHandler: [authenticate, authorizeRoles('customer', 'admin')],
      schema: {
        summary: 'Clear active cart items',
        tags: ['Cart'],
        response: {
          200: cartSchema,
          401: messageSchema,
          403: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.clearCart,
  )
}
