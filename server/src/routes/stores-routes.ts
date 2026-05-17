import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { StoresController } from '@/controllers/stores-controller'
import { authenticate } from '@/middlewares/authenticate'

const messageSchema = z.object({ message: z.string() })
const storeStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'inactive',
])
const productStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'inactive',
  'out_of_stock',
])
const storeSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  cnpj: z.string(),
  phone: z.string(),
  logoUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  status: storeStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
const productSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  priceInCents: z.number().int(),
  stock: z.number().int(),
  imageUrl: z.string().nullable(),
  status: productStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const storesRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new StoresController()

  app.post(
    '/stores',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Create a store',
        description:
          'Send store data as application/json. The ownerId is read from the authenticated user.',
        tags: ['Stores'],
        body: z.object({
          name: z.string().trim().min(1),
          slug: z.string().trim().min(1).optional(),
          description: z.string().trim().min(1),
          cnpj: z.string().trim().min(14),
          phone: z.string().trim().min(10),
        }),
        response: {
          201: z.object({ store: storeSchema }),
          400: messageSchema,
          401: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.create,
  )

  app.post(
    '/stores/:storeId/logo',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Upload a store logo',
        description:
          'Send as multipart/form-data with a single image file field named image.',
        tags: ['Stores'],
        params: z.object({
          storeId: z.string().min(1),
        }),
        response: {
          200: z.object({ store: storeSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.uploadLogo,
  )

  app.post(
    '/stores/:storeId/banner',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Upload a store banner',
        description:
          'Send as multipart/form-data with a single image file field named image.',
        tags: ['Stores'],
        params: z.object({
          storeId: z.string().min(1),
        }),
        response: {
          200: z.object({ store: storeSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.uploadBanner,
  )

  app.post(
    '/stores/:storeId/products',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Create a product for a store',
        description:
          'Send product data as application/json. Upload the image later using the product image endpoint.',
        tags: ['Stores'],
        params: z.object({
          storeId: z.string().min(1),
        }),
        body: z.object({
          categoryId: z.string().min(1),
          name: z.string().trim().min(1),
          slug: z.string().trim().min(1).optional(),
          description: z.string().trim().min(1).nullable().optional(),
          priceInCents: z.number().int().positive(),
          stock: z.number().int().nonnegative().optional(),
          status: productStatusSchema.optional(),
        }),
        response: {
          201: z.object({ product: productSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.createProduct,
  )

  app.post(
    '/stores/:storeId/products/:productId/image',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Upload a product image',
        description:
          'Send as multipart/form-data with a single image file field named image.',
        tags: ['Stores'],
        params: z.object({
          storeId: z.string().min(1),
          productId: z.string().min(1),
        }),
        response: {
          200: z.object({ product: productSchema }),
          400: messageSchema,
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.uploadProductImage,
  )
}
