import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CategoriesController } from '@/controllers/categories-controller'
import { authenticate } from '@/middlewares/authenticate'

const messageSchema = z.object({ message: z.string() })
const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const categoriesRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new CategoriesController()

  app.post(
    '/categories',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Create a product category',
        tags: ['Categories'],
        body: z.object({
          name: z.string().trim().min(1),
          slug: z.string().trim().min(1).optional(),
          description: z.string().trim().min(1).nullable().optional(),
        }),
        response: {
          201: z.object({ category: categorySchema }),
          400: messageSchema,
          401: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.create,
  )
}
