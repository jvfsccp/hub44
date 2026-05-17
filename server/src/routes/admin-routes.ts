import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { AdminController } from '@/controllers/admin-controller'
import { authenticate } from '@/middlewares/authenticate'
import { authorizeRoles } from '@/middlewares/authorize-roles'

const messageSchema = z.object({ message: z.string() })
const storeStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'inactive',
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

export const adminRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new AdminController()

  app.patch(
    '/admin/stores/:storeId/status',
    {
      preHandler: [authenticate, authorizeRoles('admin')],
      schema: {
        summary: 'Update store approval status',
        tags: ['Admin'],
        params: z.object({
          storeId: z.string().min(1),
        }),
        body: z.object({
          status: storeStatusSchema,
        }),
        response: {
          200: z.object({ store: storeSchema }),
          401: messageSchema,
          403: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.updateStoreStatus,
  )
}
