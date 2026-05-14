import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { StoresController } from '@/controllers/stores-controller'

const messageSchema = z.object({ message: z.string() })
const storeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  logoUrl: z.url(),
  bannerUrl: z.url(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const productSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  name: z.string(),
  description: z.string(),
  priceInCents: z.number().int(),
  imageUrl: z.url(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const storesRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new StoresController()

  app.post(
    '/stores',
    {
      schema: {
        summary: 'Create a store with logo and banner images',
        description:
          'Send as multipart/form-data with text fields name and description, plus image files logo and banner.',
        tags: ['Stores'],
        response: {
          201: z.object({ store: storeSchema }),
          400: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.create,
  )

  app.post(
    '/stores/:storeId/products',
    {
      schema: {
        summary: 'Create a product for a store with image upload',
        description:
          'Send as multipart/form-data with text fields name, description and price, plus image file image.',
        tags: ['Stores'],
        params: z.object({
          storeId: z.string().min(1),
        }),
        response: {
          201: z.object({ product: productSchema }),
          400: messageSchema,
          404: messageSchema,
          413: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.createProduct,
  )
}
