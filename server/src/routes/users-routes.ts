import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UsersController } from '@/controllers/users-controller'
import { authenticate } from '@/middlewares/authenticate'

const messageSchema = z.object({ message: z.string() })
const roleSchema = z.enum(['customer', 'seller', 'admin'])
const userProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  phone: z.string().nullable(),
  cpf: z.string().nullable(),
  role: roleSchema,
  emailNotifications: z.boolean(),
  newsletter: z.boolean(),
  promotions: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
const updateProfileBodySchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.email().optional(),
    phone: z.string().trim().min(10).nullable().optional(),
    cpf: z.string().trim().min(11).nullable().optional(),
    emailNotifications: z.boolean().optional(),
    newsletter: z.boolean().optional(),
    promotions: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field must be provided',
  })

export const usersRoutes: FastifyPluginAsyncZod = async (app) => {
  const controller = new UsersController()

  app.get(
    '/users/me',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Get authenticated user profile',
        tags: ['Users'],
        response: {
          200: z.object({ user: userProfileSchema }),
          401: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.getProfile,
  )

  app.patch(
    '/users/me',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Update authenticated user profile',
        tags: ['Users'],
        body: updateProfileBodySchema,
        response: {
          200: z.object({ user: userProfileSchema }),
          400: messageSchema,
          401: messageSchema,
          404: messageSchema,
          409: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.updateProfile,
  )

  app.patch(
    '/users/me/password',
    {
      preHandler: [authenticate],
      schema: {
        summary: 'Update authenticated user password',
        tags: ['Users'],
        body: z.object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(8),
        }),
        response: {
          200: messageSchema,
          401: messageSchema,
          404: messageSchema,
          500: messageSchema,
        },
      },
    },
    controller.updatePassword,
  )
}
